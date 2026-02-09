import React, { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "../../../assets/search_icon.svg";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import {
  deleteDialysisReading,
  getDialysisReadings,
} from "../../../ApiCalls/readingsApis";
import { useSelector } from "react-redux";

export default function DailyTable({
  setEditMode,
  newReadingDsipatch,
  successful,
  setSuccessful,
  setTranslations,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [resetter, setResetter] = useState(false);

  useEffect(() => {
    getDialysisReadings()
      .then((data) => setTableData(data.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, [successful, resetter]);

  const filteredData = tableData.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const role = useSelector((state) => state.permission);

  return (
    <>
      <div className="admin-card" style={{ marginTop: '2.5rem' }}>
        <div className="admin-card__header">
          <div className="flex justify-between items-center w-full flex-wrap gap-4">
            <div>
              <h2 className="admin-card__header-title">Dialysis Readings List</h2>
              <p className="text-sm text-gray-500 mt-1">
                ({tableData.length} records found)
              </p>
            </div>

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
                            {role.canEditDialysisReadings ? (
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
                                      title: item.title,
                                      type: item.type,
                                      assign_range: item.assign_range,
                                      lower_assign_range: item.low_range,
                                      upper_assign_range: item.high_range,
                                      sendAlert: item.sendAlert ? 1 : 0,
                                      unit: item.unit,
                                      isGraph: item.isGraph ? 1 : 0,
                                      alertTextDoc: item.alertTextDoc,
                                      condition: item.condition
                                    },
                                  });

                                  if (item.dialysis_readings_translations) {
                                    let translationDict = {};

                                    item.dialysis_readings_translations.forEach(
                                      (element) => {
                                        translationDict[element.language_id] =
                                          element.title;
                                      }
                                    );
                                    setTranslations(translationDict);
                                  }
                                  setEditMode(true);
                                  window.scrollTo({
                                    top: 0,
                                    left: 0,
                                    behavior: "smooth",
                                  });
                                }}
                              >
                                <BsPencilSquare />
                              </button>
                            ) : null}

                            {role.canDeleteDialysisReadings ? (
                              <button
                                className="admin-action-btn admin-action-btn--delete"
                                onClick={() => {
                                  setSuccessful("");
                                  deleteDialysisReading(item.id).then(() => {
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
