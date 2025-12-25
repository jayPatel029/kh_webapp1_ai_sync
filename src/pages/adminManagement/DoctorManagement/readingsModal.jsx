// Import React and useState
import React, { useState, useEffect } from "react";
import {
  getDailyReadings,
  getDialysisReadings,
} from "../../../ApiCalls/readingsApis";
import Select from "react-select";

// Define the AlarmModal component
const ReadingsModal = ({
  closeModal,
  newDoctor,
  newDoctorDispatch,
  modalType,
}) => {
  const [drOptions, setDrOptions] = useState([]);
  const [dirOptions, setDirOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDailyReadings();
        const DirResult = await getDialysisReadings();
        if (result.success && DirResult.success) {
          console.log(result.data)
          setDrOptions(
            result.data
              .filter((dr) => dr.showUser === 0)
              .filter(dr => !dr.title.toLowerCase().includes('diastolic'))
              .map((dr) => {
                let label = dr.title;
                const systolicIndex = label.toLowerCase().indexOf('systolic');
                // Adding "and Diastolic" where "systolic" is found
                if (systolicIndex !== -1) {
                  label = label.slice(0, systolicIndex) + 'Systolic and Diastolic' + label.slice(systolicIndex + 'systolic'.length);
                }
                return { value: dr.id, label:label};
              })
          );
          setDirOptions(
            DirResult.data
              .filter(dr => !dr.title.toLowerCase().includes('diastolic'))
              .map((dr) => {
                let label = dr.title;
                const systolicIndex = label.toLowerCase().indexOf('systolic');
                // Adding "and Diastolic" where "systolic" is found
                if (systolicIndex !== -1) {
                  label = label.slice(0, systolicIndex) + 'Systolic and Diastolic' + label.slice(systolicIndex + 'systolic'.length);
                }
                return { value: dr.id, label: label };
              })
          );
        } else {
          console.error("Failed to Readings:", result.data, DirResult.data);
        }
      } catch (error) {
        console.error("Error fetching Readings:", error);
      }
    };

    fetchData();
  }, []);

  // JSX structure of ReadingsModal component
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black overflow-y-auto">
        <div className="p-7 mt-4 bg-white shadow-md border-t-4 w-1/2 border-primary rounded z-50 overflow-y-auto h-3/4">
          {modalType == "dialysis" ? (
            <div>
              <div className="border-b-gray border-b-2 p-2 pt-4 md:pb-4 font-semibold text-primary tracking-wide text-xl">
                Set Required Dialysis Readings
              </div>
              <div className="grid grid-cols-2">
                {dirOptions.map((dir, index) => {
                  return (
                    <div key={index} className="flex items-center p-2">
                      <input
                        type="checkbox"
                        id={dir.value}
                        name={dir.value}
                        value={dir.value}
                        // checked={newDoctor.dialysisReadings.includes({value: dir.value, label: dir.label})}
                        className="h-5 w-5 accent-green-600  rounded cursor-pointer"
                        checked={newDoctor.dialysisReadings.some(
                          (dirreading) => dirreading.value === dir.value
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            newDoctorDispatch({
                              type: "dialysisReadings",
                              payload: [
                                ...newDoctor.dialysisReadings,
                                { value: dir.value, label: dir.label },
                              ],
                            });
                          } else {
                            newDoctorDispatch({
                              type: "dialysisReadings",
                              payload: newDoctor.dialysisReadings.filter(
                                (dirreading) => dirreading.value !== dir.value
                              ),
                            });
                          }
                        }}
                      />
                      <label className="ms-2 text-base font-medium text-gray-500">
                        {dir.label}
                      </label>
                    </div>
                  );
                })}
              </div>
              <button
                className=" flex-1 mt-6 border md:inline-block text-white bg-primary text-lg border-gray-300 w-1/3 rounded-lg p-1.5"
                onClick={closeModal}
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <div className="border-b-gray border-b-2 p-2 pt-4 md:pb-4 font-semibold text-primary tracking-wide text-xl">
                Set Required Daily Readings
              </div>
              <div className="grid grid-cols-2">
                {drOptions.map((dr, index) => {
                  return (
                    <div key={index} className="flex items-center p-2">
                      <input
                        type="checkbox"
                        id={dr.value}
                        name={dr.value}
                        value={dr.value}
                        className="h-5 w-5 accent-green-600  rounded cursor-pointer"
                        checked={newDoctor.dailyReadings.some(
                          (drreading) => drreading.value === dr.value
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            newDoctorDispatch({
                              type: "dailyReadings",
                              payload: [
                                ...newDoctor.dailyReadings,
                                { value: dr.value, label: dr.label },
                              ],
                            });
                          } else {
                            newDoctorDispatch({
                              type: "dailyReadings",
                              payload: newDoctor.dailyReadings.filter(
                                (drreading) => drreading.value !== dr.value
                              ),
                            });
                          }
                        }}
                      />
                      <label className="ms-2 text-base font-medium text-gray-500">
                        {dr.label}
                      </label>
                    </div>
                  );
                })}
              </div>
              <button
                className=" flex-1 mt-6 border md:inline-block text-white bg-primary text-lg border-gray-300 w-1/3 rounded-lg p-1.5"
                onClick={closeModal}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Export the ReadingsModal component
export default ReadingsModal;
