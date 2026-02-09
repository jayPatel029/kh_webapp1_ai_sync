import { React, useEffect, useState, useReducer } from "react";
import { newQuestionReducer } from "./reducers";
import {
  addDailyReading,
  updateDailyReading,
} from "../../../ApiCalls/readingsApis";
import { getAilments } from "../../../ApiCalls/ailmentApis";
import DailyTable from "./Daily_Table";
import { readingTypes } from "../../../constants/ReadingConstants";
import { getLanguages } from "../../../ApiCalls/languageApis";
import TranslationModal from "../../../components/modals/TranslationModel";
import Select from "react-select";
import { Link } from "react-router-dom";

function DailyForm() {
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
    sendAlert: 0,
    alertTextDoc: "",
    condition: "",
  });

  const [ailments, setAilments] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getAilments().then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            setAilments(resultAilment.data.listOfAilments);
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
            console.log("translation dict: ", transaltiondict);
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
      unit: newReading.unit,
      readingsTranslations: translations,
      alertTextDoc: newReading.alertTextDoc,
      sendAlert: newReading.sendAlert,
      condition: newReading.condition || 'stable',
    };

    // console.log(payload)
    if (validateForm()) {
      if (!editMode) {
        console.log("Payload:", payload);
        const response = await addDailyReading(payload);
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
        console.log("Payload:", payload);
        const response = await updateDailyReading(payload);
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
    <div className="admin-page-content">
      <div className="admin-card">
        <div className="admin-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="admin-card__header-title">Readings Master</h2>
          <Link
            to="/dailyReadingsCsv"
            className="admin-btn admin-btn--primary"
            style={{ textDecoration: 'none' }}
          >
            Bulk Upload Question
          </Link>
        </div>
        <div className="admin-card__body">
          {modelOpen && (
            <TranslationModal
              closeModal={closeModal}
              translations={translations}
              setTranslations={setTranslations}
              setLanguages={setLanguages}
              languages={languages}
            />
          )}

          <div className="admin-form__group">
            <label className="admin-form__label admin-form__label--required">
              Ailment
            </label>
            <Select
              value={newReading.ailment}
              onChange={(ailment) => {
                console.log(newReading.ailment);
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
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">
              Title
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
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
                className="admin-form__input"
                style={{ flex: 1 }}
              />

              <button
                onClick={() => {
                  setModelOpen(true);
                }}
                className="admin-btn admin-btn--primary"
              >
                Set Translations
              </button>
            </div>
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">
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
              className="admin-form__select"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          {newReading.sendAlert == 1 && (
            <div className="admin-form__group">
              <label className="admin-form__label">
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
                  className="admin-form__input"
                />
              </div>
            </div>
          )}

          <div className="admin-form__group">
            <label className="admin-form__label">
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
              className="admin-form__input"
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label admin-form__label--required">
              Type
            </label>
            <select
              value={newReading.type}
              onChange={(event) => {
                newReadingDsipatch({
                  type: "type",
                  payload: event.target.value,
                });
              }}
              className="admin-form__select"
            >
              {readingTypes.map((reading, index) => {
                return (
                  <option key={index} value={reading}>
                    {reading}
                  </option>
                );
              })}
            </select>
          </div>

          {["Int", "Decimal"].includes(newReading.type) && (
            <div className="admin-form__group">
              <label className="admin-form__label admin-form__label--required">
                Has Range
              </label>
              <select
                onChange={(event) => {
                  newReadingDsipatch({
                    type: "assign_range",
                    payload: event.target.value,
                  });
                }}
                className="admin-form__select"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          )}
          {["Int", "Decimal"].includes(newReading.type) &&
          newReading.assign_range === "yes" ? (
            <>
                <div className="admin-form__group">
                  <label className="admin-form__label">
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
                    className="admin-form__input"
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">
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
                    className="admin-form__input"
                  />
                </div>

                <div className="admin-form__group">
                  <label className="admin-form__label">
                    Is Graph
                  </label>
                  <select
                    onChange={(event) => {
                      newReadingDsipatch({
                        type: "isGraph",
                        payload: event.target.value,
                      });
                    }}
                    className="admin-form__select"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
            </>
          ) : null}

          <div className="admin-form__group">
            <label className="admin-form__label">
              Condition
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
              className="admin-form__select"
            >
              <option value="stable">Stable</option>
              <option value="unstable">Unstable</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSubmit}
                  className="admin-btn admin-btn--teal"
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
                  className="admin-btn admin-btn--outline-danger"
                >
                  CANCEL
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                className="admin-btn admin-btn--primary"
              >
                SUBMIT
              </button>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            {errMsg && <div className="admin-message admin-message--error">{errMsg}</div>}
            {successful && <div className="admin-message admin-message--success">{successful}</div>}
          </div>
        </div>
      </div>
      <DailyTable
        successful={successful}
        newReadingDsipatch={newReadingDsipatch}
        setTranslations={setTranslations}
        setEditMode={setEditMode}
        setSuccessful={setSuccessful}
      />
    </div>
  );
}

export default DailyForm;
