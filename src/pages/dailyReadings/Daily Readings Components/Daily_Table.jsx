import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as SearchIcon } from "../../../assets/search_icon.svg";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import {
  deleteDailyReading,
  getDailyReadings,
} from "../../../ApiCalls/readingsApis";
import { useSelector } from "react-redux";

export default function DailyTable({
  setEditMode,
  newReadingDsipatch,
  successful,
  setSuccessful,
  setTranslations,
  setIsFormModalOpen,
  resetFormState,
  setIsBulkUploadModalOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [resetter, setResetter] = useState(false);
  const role = useSelector((state) => state.permission);
  useEffect(() => {
    console.log("role here", role);
    getDailyReadings()
      .then((data) => setTableData(data.data))
      .catch((error) => console.error("Error fetching data:", error));
      console.log('data', tableData);
  }, [successful, resetter]);

  const filteredData = tableData.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // console.log('data',filteredData);

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="flex justify-between items-center w-full flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">
                ({tableData.length} records found)
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="admin-search">
                <SearchIcon className="admin-search__icon" />
                <input
                  type="text"
                  placeholder="Search Term"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search__input"
                />
              </div>
              <button
                className="admin-btn admin-btn--primary"
                onClick={() => {
                  resetFormState();
                  setIsFormModalOpen(true);
                }}
              >
                Add Daily Reading
              </button>
              <button
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="admin-btn admin-btn--secondary"
              >
                Bulk Upload Question
              </button>
            </div>
          </div>
        </div>

        <div className="admin-card__body">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col" className="w-1/3">Title</th>
                  <th scope="col">Alert Text</th>
                  <th scope="col">Ailment</th>
                  <th scope="col">Condition</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const displayAilment = item.ailments
                    .map((x) => x.name)
                    .join(", ");
                  if (item.showUser === 0) {
                    return (
                      <tr key={index}>
                        <td>{item.title}</td>
                        <td>{item.alertTextDoc}</td>
                        <td>{displayAilment}</td>
                        <td>{item.condition}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {role.canEditDailyReadings ? (
                              <button
                                className="admin-action-btn admin-action-btn--edit"
                                onClick={() => {
                                  setSuccessful("");
                                  newReadingDsipatch({
                                    type: "all",
                                    payload: {
                                      id: item.id,
                                      ailment: item.ailments.map((x) => {
                                        return { value: x.id, label: x.name };
                                      }),
                                      type: item.type,
                                      title: item.title,
                                      assign_range: item.assign_range,
                                      lower_assign_range: item.low_range,
                                      upper_assign_range: item.high_range,
                                      sendAlert: item.sendAlert ? 1 : 0,
                                      unit: item.unit,
                                      isGraph: item.is_graph ? 1 : 0,
                                      alertTextDoc: item.alertTextDoc,
                                      condition: item.condition,
                                    },
                                  });
                                  if (item.daily_readings_translations) {
                                    let translationDict = {};

                                    item.daily_readings_translations.forEach(
                                      (element) => {
                                        translationDict[element.language_id] =
                                          element.title;
                                      }
                                    );
                                    setTranslations(translationDict);
                                  }
                                  setEditMode(true);
                                  setIsFormModalOpen?.(true);
                                }}
                              >
                                <BsPencilSquare />
                              </button>
                            ) : null}

                            {role.canDeleteDailyReadings ? (
                              <button
                                className="admin-action-btn admin-action-btn--delete"
                                onClick={() => {
                                  setSuccessful("");
                                  deleteDailyReading(item.id).then(() => {
                                    setSuccessful("Reading Deleted Successful!");
                                    setResetter(!resetter);
                                  });
                                }}
                              >
                                <BsTrash />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

