import React, { useState, useEffect } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useNavigate } from "react-router-dom";

const AilmentModal = ({
  initialAilments,
  user_id,
  closeEditalimentsModal,
  updateData,
  onSuccess
}) => {
  const [ailmentOptions, setAilmentOptions] = useState(initialAilments || []);
  const [selOptions, setSelOptions] = useState([]);
  const [egfr, setEGFR] = useState("");
  const [gfr, setGFR] = useState("");
  const [dryWeight, setDryWeight] = useState("");
  const [kfre, setKFRE] = useState("");
  const navigate = useNavigate();
  const [showDryWeightInput, setShowDryWeightInput] = useState(false);
  const [showEGFRInput, setShowEGFRInput] = useState(false);
  const [showKEFRInput, setShowKEFRInput] = useState(false);

  useEffect(() => {
    const fetchAilments = async () => {
      try {
        const response = await axiosInstance.get(`${server_url}/ailment`);
        const fetchedAilments = response.data.listOfAilments;
        setAilmentOptions(
          fetchedAilments.map((ailment) => ({
            label: ailment.name,
            id: ailment.id,
            selected: initialAilments.includes(ailment.name),
          }))
        );
      } catch (error) {
        console.error("Error fetching ailments:", error);
      }
    };

    fetchAilments();
  }, []);
  const handleCheckboxChange = (index) => {
    setAilmentOptions((prevOptions) =>
      prevOptions.map((option, i) => {
        
        if (i === index) {
          // if (option.label === "Hemo Dialysis" && !option.selected) {
          //   // If Hemo Dialysis is selected, unselect Peritoneal Dialysis
          //   return {
          //     ...option,
          //     selected: true,
          //   };
          // } else if (option.label === "Peritoneal Dialysis" && !option.selected) {
          //   // If Peritoneal Dialysis is selected, unselect Hemo Dialysis
          //   return {
          //     ...option,
          //     selected: true,
          //   };
          // } else {
            // Toggle the selected state of the current option
            return {
              ...option,
              selected: !option.selected,
            };
          // }
        } else if (
          (option.label === "Hemo Dialysis" || option.label === "Peritoneal Dialysis") &&
          (prevOptions[index].label === "Hemo Dialysis" || prevOptions[index].label === "Peritoneal Dialysis")
        ) {
          // Unselect other dialysis options if one of them is selected
          return {
            ...option,
            selected: false,
          };
        }
        return option;
      })
    );
  };
  

  const handleUpdate = async () => {
    const selectedAilments = ailmentOptions
      .filter((ailment) => ailment.selected)
      .map((ailment) => ailment.id);

    const updatedUserData = {
      changeBy:localStorage.getItem("email"),
      id: user_id,
      aliments: selectedAilments,
      eGFR: egfr,
      GFR: gfr,
      dry_weight: dryWeight,
    };

    try {
      await axiosInstance.put(`${server_url}/patient/updateAilments`, updatedUserData);
      if (egfr !== "") {
        await axiosInstance.put(`${server_url}/patient/updateGFR`, {
          id: user_id,
          eGFR: egfr,
          GFR: gfr,
          KFRE: kfre
        });
      }
      if (dryWeight !== "") {
        await axiosInstance.put(`${server_url}/patient/updateDryWeight`, {
          id: user_id,
          dry_weight: dryWeight,
        });
      }
      closeEditalimentsModal();
      onSuccess();
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleCancel = () => {
    closeEditalimentsModal();
  };

  useEffect(() => {
    // Check if any of the ailment labels match the conditions
    const hasCKD = ailmentOptions.some(
      (ailment) => ailment.label === "CKD" && ailment.selected
    );

    const hasHemoDialysis = ailmentOptions.some(
      (ailment) => ailment.label === "Hemo Dialysis" && ailment.selected
    );

    const hasPeritonealDialysis = ailmentOptions.some(
      (ailment) => ailment.label === "Peritoneal Dialysis" && ailment.selected
    );

    const hasDialysis = ailmentOptions.some(
      (ailment) =>
        (ailment.label === "Hemo Dialysis" ||
          ailment.label === "Peritoneal Dialysis") &&
        ailment.selected
    );

    // Set the state based on the result
    setShowDryWeightInput(hasHemoDialysis);
    setShowEGFRInput(hasCKD || hasHemoDialysis || hasPeritonealDialysis);
    setShowKEFRInput(hasCKD && !hasDialysis);
  }, [ailmentOptions]);
console.log(gfr)
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 w-2/5 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Update Ailments</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Ailments:
              </label>
              {ailmentOptions.map((ailment, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={ailment.id}
                    checked={ailment.selected}
                    onChange={() => handleCheckboxChange(index)}
                    className="mr-2"
                  />
                  <label htmlFor={ailment.label}>{ailment.label}</label>
                </div>
              ))}
            </div>
            {showDryWeightInput && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Dry Weight:
                  </label>
                  <input
                    type="text"
                    value={dryWeight}
                    onChange={(e) => setDryWeight(e.target.value)}
                    className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </>
            )}
            {showEGFRInput && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    GFR:
                  </label>
                  <input
                    type="text"
                    value={gfr}
                    onChange={(e) => setGFR(e.target.value)}
                    className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    eGFR:
                  </label>
                  <input
                    type="text"
                    value={egfr}
                    onChange={(e) => setEGFR(e.target.value)}
                    className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </>
            )}
            {showKEFRInput && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  KFRE:
                </label>
                <input
                  type="text"
                  value={kfre}
                  onChange={(e) => setKFRE(e.target.value)}
                  className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleUpdate}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              UPDATE
            </button>
            <button
              onClick={handleCancel}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AilmentModal;
