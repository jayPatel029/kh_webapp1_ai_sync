// Import React and useState
import React, { useState, useEffect } from "react";
import {
  getDailyReadings,
  getDialysisReadings,
} from "../../../ApiCalls/readingsApis";
import { BaseModal } from "../../../component-library/modals";

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

  // Use BaseModal for overlay/modal behaviour
  const title = modalType === "dialysis" ? "Set Required Dialysis Readings" : "Set Required Daily Readings";

  const body = (
    <div className="w-full">
      <div className="grid grid-cols-2">
        {(modalType === "dialysis" ? dirOptions : drOptions).map((item, index) => {
          const isChecked = modalType === "dialysis"
            ? newDoctor.dialysisReadings.some((r) => r.value === item.value)
            : newDoctor.dailyReadings.some((r) => r.value === item.value);

          const onChange = (e) => {
            if (modalType === "dialysis") {
              if (e.target.checked) {
                newDoctorDispatch({
                  type: "dialysisReadings",
                  payload: [...newDoctor.dialysisReadings, { value: item.value, label: item.label }],
                });
              } else {
                newDoctorDispatch({
                  type: "dialysisReadings",
                  payload: newDoctor.dialysisReadings.filter((r) => r.value !== item.value),
                });
              }
            } else {
              if (e.target.checked) {
                newDoctorDispatch({
                  type: "dailyReadings",
                  payload: [...newDoctor.dailyReadings, { value: item.value, label: item.label }],
                });
              } else {
                newDoctorDispatch({
                  type: "dailyReadings",
                  payload: newDoctor.dailyReadings.filter((r) => r.value !== item.value),
                });
              }
            }
          };

          return (
            <div key={index} className="flex items-center p-2">
              <input
                type="checkbox"
                id={item.value}
                name={item.value}
                value={item.value}
                className="h-5 w-5 accent-green-600 rounded cursor-pointer"
                checked={isChecked}
                onChange={onChange}
              />
              <label className="ms-2 text-base font-medium text-gray-500">{item.label}</label>
            </div>
          );
        })}
      </div>
    </div>
  );

  const footer = (
    <div className="w-full">
      <button
        className="flex-1 mt-6 border md:inline-block text-white bg-primary text-lg border-gray-300 w-1/3 rounded-lg p-1.5"
        onClick={closeModal}
      >
        Save
      </button>
    </div>
  );

  return (
    <BaseModal isOpen={true} onClose={closeModal} title={title} footer={footer} size="lg">
      {body}
    </BaseModal>
  );
};

// Export the ReadingsModal component
export default ReadingsModal;
