import { React, useEffect, useState, useReducer } from "react";
import { newQuestionReducer } from "./reducers";
import {
  addDialysisReading,
  updateDialysisReading,
} from "../../../ApiCalls/readingsApis";
import { getAilments } from "../../../ApiCalls/ailmentApis";
import DialysisTable from "./Dialysis_Table";
import { readingTypes } from "../../../constants/ReadingConstants";
import { getLanguages } from "../../../ApiCalls/languageApis";
import TranslationModal from "../../../components/modals/TranslationModel";
import Select from "react-select";
import { se } from "date-fns/locale";
import { Link } from "react-router-dom";

function DialysisReadingsList() {
  const [editMode, setEditMode] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [modelOpen, setModelOpen] = useState(false);
  const [translations, setTranslations] = useState({});

  const closeModal = () => {
    setModelOpen(false);
  };

  const [newReading, newReadingDsipatch] = useReducer(newQuestionReducer, {
    title: "",
    ailment: [],
    assign_range: "no",
    type: readingTypes[0],
    lower_assign_range: null,
    upper_assign_range: null,
    isGraph: 0,
    unit: "",
    alertTextDoc: "",
    sendAlert: 0,
    condition: "",
  });

  const [ailments, setAilments] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getAilments().then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            console.log("listofailments", resultAilment.data.listOfAilments);
            const filteredAilments = resultAilment.data.listOfAilments.filter((a) => a.name.includes("Dialysis"));
            console.log("filtered for dialysis", filteredAilments);
            setAilments(filteredAilments);


          } else {
            console.error("Failed to fetch Ailments:", resultAilment);
          }
        });
        getLanguages().then((resultLanguage) => {
          if (resultLanguage.success && resultLanguage.data) {
            setLanguages(resultLanguage.data);
            let transaltiondict = {};
            resultLanguage.data.forEach((lang) => {
              if (lang.id !== 1) {
                transaltiondict[lang.id] = "";
              }
            });
            setTranslations(transaltiondict);
          } else {
            console.error("Failed to fetch Languages:", resultLanguage);
          }
        });
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchData();
  }, []);

  function validateForm() {
    if (
      newReading.title.trim() === "" ||
      (newReading.assign_range.trim() === "yes" &&
        (isNaN(newReading.lower_assign_range) ||
          isNaN(newReading.upper_assign_range)))
    ) {
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    setSuccessful("");
    setErrMsg("");
  
    const payload = {
      id: newReading.id,
      title: newReading.title,
      ailments: newReading.ailment.map((ailment) => ailment.value),
      type: newReading.type,
      assign_range: newReading.assign_range,
      low_range: newReading.lower_assign_range,
      high_range: newReading.upper_assign_range,
      isGraph: newReading.isGraph,
      readingsTranslations: translations,
      alertTextDoc: newReading.alertTextDoc,
      unit: newReading.unit,
      sendAlert: newReading.sendAlert,
      condition: newReading.condition || 'stable',
    };
    if (validateForm()) {
      console.log("submiting ailmetns", payload.ailments);
      if (!editMode) {
        const response = await addDialysisReading(payload);
        if (response.success) {
          let transaltiondict = {};
          languages.forEach((lang) => {
            if (lang.id !== 1) {
              transaltiondict[lang.id] = "";
            }
          });
          setTranslations(transaltiondict);
          setErrMsg("");
          setSuccessful("Reading Created Successful!");
          newReadingDsipatch({
            type: "all",
            payload: {},
          });
        } else {
          setErrMsg("Error Creating Reading:" + response.data);
          setSuccessful("");
        }
      } else {
        const response = await updateDialysisReading(payload);
        if (response.success) {
          let transaltiondict = {};
          languages.forEach((lang) => {
            if (lang.id !== 1) {
              transaltiondict[lang.id] = "";
            }
          });
          setTranslations(transaltiondict);
          setErrMsg("");
          setEditMode(false);
          setSuccessful("Reading Updated Successful!");
          newReadingDsipatch({
            type: "all",
            payload: {},
          });
        } else {
          setErrMsg("Error Updating Reading:" + response.data);
          setSuccessful("");
        }
      }
    } else {
      setErrMsg("Please fill all the fields!");
      setSuccessful("");
    }
  }

  return (
    <div>
      <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
        <div className="border-b-gray border-b-2 p-2  pt-4 md:pb-4 font-semibold text-primary tracking-wide text-xl">
          Readings Master
          <Link
            to="/dialysisReadingsCsv"
            className="border md:ml-2 ml-0 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300  md:w-1/4 rounded-lg  p-1.5"
          >
            {" "}
            BulkUpload Question
          </Link>
        </div>
        <div className="p-5">
          {modelOpen && (
            <TranslationModal
              closeModal={closeModal}
              translations={translations}
              setTranslations={setTranslations}
              setLanguages={setLanguages}
              languages={languages}
            />
          )}
          <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
            Ailment*
          </label>
          <Select
            value={newReading.ailment}
            onChange={(ailment) => {
              // console.log(newReading.ailment);
              newReadingDsipatch({
                type: "ailment",
                payload: ailment,
              });
            }}
            options={ailments.map((ailment) => {
              return {
                value: ailment.id,
                label: ailment.name,
              };
            })}
            isMulti
            className="text-gray-500 text-sm rounded-lg block w-full  focus:outline-primary"
          />

          <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
            Title
          </label>
          <div className="block md:flex w-full">
            <input
              type="text"
              placeholder="Reading Title"
              value={newReading.title}
              onChange={(event) => {
                newReadingDsipatch({
                  type: "title",
                  payload: event.target.value,
                });
              }}
              className=" border border-gray-300 text-gray-500 text-sm rounded-lg block md:w-3/4 w-full p-2.5 focus:outline-primary"
            />
            <button
              onClick={() => {
                setModelOpen(true);
              }}
              className="border md:ml-2 ml-0 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-full md:w-1/4 rounded-lg block p-1.5"
            >
              Set Translations
            </button>
          </div>

          <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
            Send Alerts
          </label>
          <select
            value={newReading.sendAlert}
            onChange={(event) => {
              console.log(event.target.value);
              newReadingDsipatch({
                type: "sendAlert",
                payload: event.target.value,
              });
            }}
            className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
          >
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>

          {newReading.sendAlert == 1 && (
            <>
              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                Alert Text
              </label>
              <div className="block md:flex w-full">
                <input
                  type="text"
                  placeholder="Alert Text for doctors"
                  value={newReading.alertTextDoc}
                  onChange={(event) => {
                    newReadingDsipatch({
                      type: "alertTextDoc",
                      payload: event.target.value,
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block md:w-3/4 w-full p-2.5 focus:outline-primary"
                />
              </div>
            </>
          )}

          <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
            Type*
          </label>
          <select
            value={newReading.type}
            onChange={(event) => {
              newReadingDsipatch({
                type: "type",
                payload: event.target.value,
              });
            }}
            className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
          >
            {readingTypes.map((reading, index) => {
              return (
                <option key={index} value={reading}>
                  {reading}
                </option>
              );
            })}
          </select>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
              Unit
            </label>
            <input
              type="text"
              placeholder="Unit"
              value={newReading.unit}
              onChange={(event) => {
                newReadingDsipatch({
                  type: "unit",
                  payload: event.target.value,
                });
              }}
              className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
            />
          </div>
          {["Int", "Decimal"].includes(newReading.type) && (
            <>
              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                Has Range*
              </label>
              <select
                onChange={(event) => {
                  newReadingDsipatch({
                    type: "assign_range",
                    payload: event.target.value,
                  });
                }}
                className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </>
          )}



          
          {["Int", "Decimal"].includes(newReading.type) &&
          newReading.assign_range === "yes" ? (
            <>
              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                Lower Range
              </label>
              <input
                type="number"
                placeholder="Lower Range"
                value={newReading.lower_assign_range}
                onChange={(event) => {
                  newReadingDsipatch({
                    type: "lower_assign_range",
                    payload: event.target.value,
                  });
                }}
                className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
              />
              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                Upper Range
              </label>
              <input
                type="number"
                placeholder="Upper Range"
                value={newReading.upper_assign_range}
                onChange={(event) => {
                  newReadingDsipatch({
                    type: "upper_assign_range",
                    payload: event.target.value,
                  });
                }}
                className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
              />

              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                Is Graph
              </label>
              <select
                onChange={(event) => {
                  console.log("changing graph property")
                  console.log(event.target.value)
                  console.log(newReading.isGraph);
                  console.log("--------------------------------")
                  newReadingDsipatch({
                    type: "isGraph",
                    payload: event.target.value,
                  });
                }}
                className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </>
          ) : null}

          <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
            Condition*
          </label>
          <select
            value={newReading.condition || 'stable'}
            onChange={(event) => {
              console.log(event.target.value);
              newReadingDsipatch({
                type: "condition",
                payload: event.target.value,
              });
            }}
            className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
          >
            <option value="stable">Stable</option>
            <option value="unstable">Unstable</option>
            <option value="critical">Critical</option>
          </select>

          {editMode ? (
            <>
              <button
                onClick={handleSubmit}
                className=" flex-1 mr-2 mt-5 border md:inline-block text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-[12vw] rounded-lg p-1.5"
              >
                UPDATE
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  newReadingDsipatch({ type: "all", payload: {} });
                  let transaltiondict = {};
                  languages.forEach((lang) => {
                    if (lang.id !== 1) {
                      transaltiondict[lang.id] = "";
                    }
                  });
                  setTranslations(transaltiondict);
                }}
                className="flex-1 border text-[#ff0000] md:inline-block bg-white font-semibold tracking-wide text-lg border-[#ff0000] w-[12vw] rounded-lg  p-1.5"
              >
                CANCEL
              </button>
            </>
          ) : (
            <button
              onClick={handleSubmit}
              className=" border mt-5 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-full md:w-[12vw] rounded-lg block p-1.5"
            >
              SUBMIT
            </button>
          )}
          <div className="text-[#ff0000] pt-6">
            {errMsg}
            <span className="text-primary">{successful}</span>
          </div>
        </div>
      </div>
      <DialysisTable
        successful={successful}
        newReadingDsipatch={newReadingDsipatch}
        setTranslations={setTranslations}
        setEditMode={setEditMode}
        setSuccessful={setSuccessful}
      />
    </div>
  );
}

export default DialysisReadingsList;
