import React, { useState, useEffect, useMemo } from "react";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import {
  deleteDailyReading,
  getDailyReadings,
} from "../../../ApiCalls/readingsApis";
import { UnifiedListTable, SearchBar } from "../../../components";
import { useSelector } from "react-redux";
import { Button } from "../../../component-library";
import { useAdminToast } from "../../../components/AdminToast";
import RefreshButton from "../../../components/RefreshButton/RefreshButton";
import { PAGE_CACHE } from "../../../cache";

export default function DailyTable({
  setEditMode,
  newReadingDsipatch,
  successful,
  setSuccessful,
  setTranslations,
  setIsFormModalOpen,
  resetFormState,
  isBulkUploadModalOpen,
  setIsBulkUploadModalOpen,
}) {
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const role = useSelector((state) => state.permission);
  const { showToast, ToastContainer } = useAdminToast();

  useEffect(() => {
    getDailyReadings()
      .then((data) => setTableData(data.data || []))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setTableData([]);
      });
  }, [successful]);

  const columns = useMemo(() => [
    { key: 'title', label: 'Title', type: 'text', width: '250px' },
    { key: 'alertTextDoc', label: 'Alert Text', type: 'text', width: '200px' },
    { key: 'ailmentsDisplay', label: 'Ailment', type: 'text', width: '200px' },
    { key: 'condition', label: 'Condition', type: 'text', width: '150px' },
    { key: 'actions', label: 'Action', type: 'actions', width: '100px' }
  ], []);

  const formattedData = useMemo(() => {
    return tableData
      .filter(item => item.showUser === 0)
      .map((item) => ({
        ...item,
        ailmentsDisplay: item.ailments?.map((x) => x.name).join(", ") || "-",
        actions: item
      }));
  }, [tableData]);

  const handleEdit = (item) => {
    setSuccessful("");
    newReadingDsipatch({
      type: "all",
      payload: {
        id: item.id,
        // MultiSelect expects an array of option values (strings), not objects.
        // Pass the ailment ids as strings to match the MultiSelect value shape.
        ailment: item.ailments?.map((x) => String(x.id)) || [],
        type: item.type,
        title: item.title,
        assign_range: item.assign_range,
        lower_assign_range: item.low_range,
        upper_assign_range: item.high_range,
        sendAlert: item.sendAlert ? 1 : 0,
        unit: item.unit,
        // support both backend field names: isGraph (camelCase) and is_graph (snake_case)
        isGraph: item.isGraph !== undefined ? Number(item.isGraph) : (item.is_graph !== undefined ? Number(item.is_graph) : 0),
        alertTextDoc: item.alertTextDoc,
        condition: item.condition,
      },
    });
    if (item.daily_readings_translations) {
      let translationDict = {};
      item.daily_readings_translations.forEach((element) => {
        translationDict[element.language_id] = element.title;
      });
      if (!translationDict[1]) {
        translationDict[1] = item.title;
      }
      // Merge into parent translations so blank language entries are preserved
      setTranslations((prev) => ({ ...prev, ...translationDict }));
    } else {
      setTranslations((prev) => ({ ...prev, 1: item.title }));
    }
    setEditMode(true);
    setIsFormModalOpen?.(true);
  };

  const handleDelete = (item) => {
    if (window.confirm(`Delete reading "${item.title}"?`)) {
      setSuccessful("");
      deleteDailyReading(item.id).then(() => {
        setSuccessful("Reading Deleted Successful!");
        showToast("Daily reading deleted successfully!", "success");
      });
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div className="admin-toolbar">
          <div className="admin-toolbar__left">
            <SearchBar
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // style={{ width: "250px" }}
            />
          </div>

          <div className="admin-toolbar__right">
            <span className="admin-toolbar__count">
              {formattedData.filter(item => 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.condition && item.condition.toLowerCase().includes(searchTerm.toLowerCase()))
              ).length} Records Found
            </span>
            <RefreshButton pageName={PAGE_CACHE.DAILY_READINGS.name} />
            {role.canEditDailyReadings && (
              <>
                <Button
                  variant="primary"
                  // className="admin-btn admin-btn--primary"
                  onClick={() => {
                    resetFormState();
                    setIsFormModalOpen(true);
                  }}
                >
                  Add Daily Reading
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsBulkUploadModalOpen(true)}
                  // className="admin-btn admin-btn--secondary"
                >
                  Bulk Upload Readings
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card__body">
        <UnifiedListTable
          columns={columns}
          data={formattedData.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.condition && item.condition.toLowerCase().includes(searchTerm.toLowerCase()))
          )}
          enableSearch={true}
          renderSearchUI={false}
          searchKeys={['title', 'condition']}
          onEdit={role.canEditDailyReadings ? handleEdit : null}
          onDelete={role.canDeleteDailyReadings ? handleDelete : null}
          emptyMessage="No daily readings found"
          actionButtons={role.canEditDailyReadings || role.canDeleteDailyReadings}
        />
      </div>
      <ToastContainer />
    </div>
  );
}

