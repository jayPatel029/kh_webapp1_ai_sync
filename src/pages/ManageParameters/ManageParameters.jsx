import React, { useState, useEffect, useLayoutEffect } from "react";
import "./ManageParameters.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useParams,Link } from "react-router-dom";
import Select from "react-select";
import { getAilments } from "../../ApiCalls/ailmentApis";
import {
  addReading,
  getAllUserReadingsByPid,
} from "../../ApiCalls/manageparameters";
import { useLocation } from "react-router-dom";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import {
  addDailyReading,
  deleteDailyReading,
  deleteDialysisReading,
  updateDailyReading,
  updateDialysisReading,
} from "../../ApiCalls/readingsApis";

function ManageParameters() {
  const [parameterData, setParameterData] = useState(null);
  const [showRangeInputs, setShowRangeInputs] = useState(false);
  const [graphOption, setGraphOption] = useState(false);
  const [selectedAilments, setSelectedAilments] = useState();
  const [selectTitle, setSelectTitle] = useState("");
  const [isParamDisabled, setIsParamDisabled] = useState(false);
  const [selectParameterType, setSelectedParameterType] = useState("");
  const [selectReadingType, setSelectedReadingType] = useState("");
  const [highRange, setHighRange] = useState(null);
  const [lowRange, setLowRange] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const { pid } = useParams();
  const location = useLocation();
  const [errMsg, setErrMsg] = useState({});

  const parameterTypes = [
    { value: "General", label: "General" },
    { value: "Dialysis", label: "Dialysis" },
  ];

  const specialReadingTypes = [
    { value: "Numeric", label: "Numeric" },
    { value: "Text", label: "Text" },
    { value: "Date", label: "Date" },
    { value: "Yes/No", label: "Yes/No" },
  ];

  const [ailmentOptions, setAilmentOptions] = useState([]);

  useEffect(() => {
    if (selectReadingType === "Numeric") {
      setShowRangeInputs(true);
    } else {
      setShowRangeInputs(false);
    }
  }, [selectReadingType]);

  useLayoutEffect(() => {
    getAilments().then((resultAilment) => {
      if (resultAilment.success && resultAilment.data.listOfAilments) {
        setAilmentOptions(resultAilment.data.listOfAilments);
      } else {
        console.error("Failed to fetch Ailments:", resultAilment.data);
      }
    });
  }, []);

  async function getParameterData() {
    getAllUserReadingsByPid(pid).then((response) => {
      if (response.success) {
        // console.log("Paramerter data",response.data)
        setParameterData(response.data);
      } else {
        console.error("Failed to fetch parameter data:", response.data);
      }
    });
  }
  useEffect(() => {
    getParameterData();
  }, [errMsg]);

  function clearAllFields() {
    setSelectTitle("");
    setSelectedParameterType("");
    setSelectedReadingType("");
    setHighRange(null);
    setLowRange(null);
    setGraphOption(false);
    setSelectedAilments({});
    setIsParamDisabled(false);
  }

  const handleSubmit = async () => {
    try {
      console.log("selected ailments",selectedAilments.map((ailment) => ailment.value))
      var ailments = await selectedAilments.map((ailment) => ailment.value);
      const newData = {
        id: pid,
        title: selectTitle,
        parameterType: selectParameterType,
        type: selectReadingType,
        readingType: selectReadingType,
        isGraph: graphOption ? 1 : 0,
        ailments: ailments,
        ailmentID: selectedAilments.value,
        assign_range: selectReadingType === "Numeric" ? "Yes" : "No",
        low_range: lowRange,
        high_range: highRange,
      };
      // const newData = {
      //   id: pid,
      //   title: selectTitle,
      //   parameterType: selectParameterType,
      //   ailments: selectedAilments.map((ailment) => ailment.value),
      //   type: selectReadingType,
      //   assign_range: selectReadingType === "Numeric" ? "Yes" : "No",
      //   low_range: lowRange,
      //   high_range: highRange,
      //   isGraph: graphOption ? 1 : 0,
      // };
      if (editMode) {
        var ailments = await selectedAilments.map((ailment) => ailment.value);
        const updateData = {
          id: editId,
          title: selectTitle,
          parameterType: selectParameterType,
          ailments: ailments,
          type: selectReadingType,
          readingType: selectReadingType,
          isGraph: graphOption ? 1 : 0,
          ailmentID: selectedAilments.value,
          assign_range: selectReadingType === "Numeric" ? "Yes" : "No",
          low_range: lowRange,
          high_range: highRange,
        };
        if (selectParameterType === "General") {
          updateDailyReading(updateData).then((response) => {
            if (response.success) {
              console.log("Reading updated successfully:", response.data);
              getParameterData();
              clearAllFields();
              setErrMsg({
                type: "success",
                msg: "Updated Successfully",
              });
            } else {
              console.error("Failed to update reading:", response.data);
            }
          });
        } else {
          updateDialysisReading(updateData).then((response) => {
            if (response.success) {
              console.log("Reading updated successfully:", response.data);
              getParameterData();
              clearAllFields();
              setErrMsg({
                type: "success",
                msg: "Updated Successfully",
              });
            } else {
              console.error("Failed to update reading:", response.data);
            }
          });
        }
      } else {
        addReading(newData).then((response) => {
          if (response.success) {
            console.log("Reading added successfully:", response.data);
            clearAllFields();
            getParameterData();
          } else {
            console.error("Failed to add reading:", response.data);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [ailments, setAilments] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getAilments().then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            console.log("fetched ailments",resultAilment.data.listOfAilments)
            setAilments(resultAilment.data.listOfAilments);
          } else {
            console.error("Failed to fetch Ailments:", resultAilment);
          }
        });
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="ManageParameters md:flex block">
      <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <div className="bg-gray-100 p-4">
       <Link to={`/userProfile/${pid}`} className="text-primary border-b-2 border-primary">
                go back
                </Link>
       </div>
        <div className="container">
          <div className="bg-gray-100  md:py-5 md:px-40">
            <div className="manage-roles-container p-10 ml-4 mr-4 mt-2 bg-white shadow-md border-t-4 border-primary">
              <div className="mt-2 mb-4 flex items-center justify-end">
                <h1 className="text-xl">{location?.state?.name}</h1>
              </div>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-bold">
                  Manage Customer Parameters
                </h2>
              </div>
              <div>
                <table className="w-full border-collapse">
                  <div className="py-2">
                    <label htmlFor="">Parameter Name *</label>
                    <input
                      type="text"
                      value={selectTitle}
                      onChange={(e) => setSelectTitle(e.target.value)}
                      className="w-full border-2 py-2 px-3  rounded focus:outline-none focus:border-primary m-1"
                    />
                  </div>

                  <div className="py-3">
                    <label htmlFor="parameterType">Parameter Type</label>
                    <select
                      id="parameterType"
                      value={selectParameterType}
                      onChange={(e) => setSelectedParameterType(e.target.value)}
                      className="w-full border-2 py-2 px-3  rounded focus:outline-none focus:border-primary m-1 "
                      disabled={isParamDisabled}
                    >
                      <option className="text-gray-500">
                        Select Parameter Type
                      </option>
                      {parameterTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="py-3">
                    <label htmlFor="specialReadingType">
                      Special Reading Type
                    </label>
                    <select
                      id="specialReadingType"
                      value={selectReadingType}
                      className="w-full border-2 py-2 px-3  rounded focus:outline-none focus:border-primary m-1 "
                      onChange={(e) => setSelectedReadingType(e.target.value)}
                    >
                      <option className="text-gray-500">
                        Select Special Reading Type
                      </option>
                      {specialReadingTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {showRangeInputs && (
                    <>
                      <div className="py-3">
                        <label htmlFor="highRange">High Range</label>
                        <input
                          type="text"
                          id="highRange"
                          value={highRange}
                          onChange={(e) => setHighRange(e.target.value)}
                          className="w-full border-2 py-2 px-3  rounded focus:outline-none focus:border-primary m-1"
                        />
                      </div>
                      <div className="py-3">
                        <label htmlFor="lowRange">Low Range</label>
                        <input
                          type="text"
                          id="lowRange"
                          value={lowRange}
                          onChange={(e) => setLowRange(e.target.value)}
                          className="w-full border-2 py-2 px-3  rounded focus:outline-none focus:border-primary m-1"
                        />
                      </div>
                    </>
                  )}
                  <div className="py-3">
                    <label htmlFor="graph">Graph (Yes/No)</label>
                    <select
                      id="graph"
                      className="w-full border-2 py-2 px-3  rounded focus:outline-none focus:border-primary m-1 "
                      onChange={(e) => setGraphOption(e.target.value === "Yes")}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="py-3">
                    <label htmlFor="ailments">Ailments</label>
                    <Select
                      value={selectedAilments}
                      isMulti
                      options={ailments.map((ailment) => {
                        return {
                          value: ailment.id,
                          label: ailment.name,
                        };
                      })}
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          borderColor: state.isFocused
                            ? "#00c6be"
                            : "rgb(209 213 219)",
                          outlineColor: state.isFocused
                            ? "#00c6be"
                            : "rgb(209 213 219)",
                          borderRadius: "0.5rem",
                          padding: "0.14rem",
                          fontSize: "0.875rem",
                        }),
                      }}
                      onChange={(selectedOptions) => {
                        setSelectedAilments(selectedOptions);
                      }}
                    />
                  </div>
                  <div className="flex items-center pt-4">
                    <button
                      type="button"
                      className="bg-primary border-2 border-primary rounded text-white px-8 py-1 shadow-md"
                      onClick={handleSubmit}
                    >
                      SUBMIT
                    </button>
                  </div>
                </table>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 md:px-40  md:pb-10">
            <div className="manage-roles-container p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary">
              <div className=" overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-white text-gray-700">
                    <tr className="border-b-2 border-black">
                      <th className="py-3 px-4 text-left">Parameter Name</th>
                      <th className="py-3 px-4 text-left">Parameter Type</th>
                      <th className="py-3 px-4 text-left">Reading Type</th>
                      <th className="py-3 px-4 text-left">Graph</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {parameterData?.daily &&
                      parameterData.daily.map((data, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4">{data.title}</td>
                          <td className="py-3 px-4">General</td>
                          <td className="py-3 px-4">{data.type}</td>
                          <td className="py-3 px-4">{data.isGraph}</td>
                          <td className="py-3 px-4">
                            <button
                              className="text-primary"
                              onClick={() => {
                                console.log("data",data)
                                setEditMode(true);
                                setEditId(data.id);
                                setSelectedParameterType("General");
                                setSelectedAilments(
                                  data.daily_reading_ailments?.map((ailment) => ({
                                    value: ailment.ailmentID,
                                    label: ailmentOptions.find(
                                      (ailmentOption) => ailmentOption.id === ailment.ailmentID,
                                    )?.name,
                                  })) || []
                                );
                                setSelectTitle(data.title);
                                setSelectedReadingType(data.type);
                                setHighRange(data.high_range);
                                setLowRange(data.low_range);
                                setIsParamDisabled(true);
                                setErrMsg({
                                  type: "success",
                                  msg: "",
                                });
                              }}
                            >
                              <BsPencilSquare />
                            </button>
                            <button
                              className="text-red-500"
                              onClick={async () => {
                                try {
                                  await deleteDailyReading(data.id);
                                  setErrMsg({
                                    type: "success",
                                    msg: "Deleted Successfully",
                                  });
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                            >
                              <BsTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {parameterData?.dialysis &&
                      parameterData.dialysis.map((data, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4">{data.title}</td>
                          <td className="py-3 px-4">Dialysis</td>
                          <td className="py-3 px-4">{data.type}</td>
                          <td className="py-3 px-4">{data.isGraph}</td>
                          <td className="py-3 px-4">
                            <button
                              className="text-primary"
                              onClick={() => {
                                console.log("data",data);
                                setEditMode(true);
                                setEditId(data.id);
                                setSelectedParameterType("Dialysis");
                                setSelectedAilments(
                                  data.dialysis_reading_ailments?.map((ailment) => ({
                                    value: ailment.ailmentID,
                                    label: ailmentOptions.find(
                                      (ailmentOption) => ailmentOption.id === ailment.ailmentID,
                                    )?.name,
                                  })) || []
                                );
                                setSelectTitle(data.title);
                                setSelectedReadingType(data.type);
                                setHighRange(data.high_range);
                                setLowRange(data.low_range);
                                setIsParamDisabled(true);
                                setErrMsg({
                                  type: "success",
                                  msg: "",
                                });
                              }}
                            >
                              <BsPencilSquare />
                            </button>
                            <button
                              className="text-red-500"
                              onClick={async () => {
                                try {
                                  await deleteDialysisReading(data.id);
                                  setErrMsg({
                                    type: "success",
                                    msg: "Deleted Successfully",
                                  });
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                            >
                              <BsTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageParameters;
