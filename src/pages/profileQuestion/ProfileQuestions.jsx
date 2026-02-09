import React from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";

import { questionTypes } from "./consts";
import { useState, useReducer, useEffect } from "react";
import { newQuestionReducer } from "./reducers";
import {
  createQuestion,
  getQuestions,
  deleteQuestion,
  updateQuestion,
} from "../../ApiCalls/questionApis";
import { getAilments } from "../../ApiCalls/ailmentApis";
import { getLanguages } from "../../ApiCalls/languageApis";
import TranslationModal from "../../components/modals/TranslationModel";
import OptTranslationModal from "../../components/modals/OptionTranslationModal";
import Select from "react-select";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { te } from "date-fns/locale";

// Component Library
import { Box, Container, Flex } from "../../component-library";

function ProfileQuestions() {
  const [editMode, setEditMode] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [questionsList, setQuestionsList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [ailments, setAilments] = useState([]);

  const [languages, setLanguages] = useState([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [modelOpenOpt, setModelOpenOpt] = useState(false);
  const [translations, setTranslations] = useState({});
  const [optTranslations, setOptTranslations] = useState({});
  const role = useSelector((state) => state.permission);

  const closeModal = () => {
    setModelOpen(false);
  };

  const closeModalOpt = () => {
    console.log("object", optTranslations );
    setModelOpenOpt(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getQuestions();
        if (result.success) {
          console.log(result.data);
          setQuestionsList(result.data);
          setQuestions(result.data);
        } else {
          console.error("Failed to fetch questions:", result.data);
        }
        getAilments().then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            setAilments(resultAilment.data.listOfAilments);
            setAilments((prevAilments) => [
              { name: "Generic Profile" },
              ...prevAilments,
            ]);
            newQuestionDispatch({
              type: "all",
              payload: {},
            });
          } else {
            console.error("Failed to fetch Ailments:", resultAilment.data);
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
  }, [successful]);

  function searchQuestion(keyword) {
    setQuestions(
      questionsList.filter((q) => {
        if (q["title"].toLowerCase().includes(keyword.toLowerCase())) {
          return q;
        }
      })
    );
  }
  async function removeQuestion(id) {
    setSuccessful("");
    setQuestions(questions.filter((q) => q.id !== id));
    setQuestionsList(questionsList.filter((q) => q.id !== id));
    const response = await deleteQuestion(id);
    if (response.success) {
      setErrMsg("");
      setSuccessful("Question Deleted Successful!");
    } else {
      setErrMsg("Error Deleting Question:" + response.data);
      setSuccessful("");
    }
  }

  const [newQuestion, newQuestionDispatch] = useReducer(newQuestionReducer, {
    ailment: [],
    type: questionTypes[0].value,
    name: "",
    options: null,
  });

  function validateForm() {
    if (newQuestion.type.trim() === "" || newQuestion.name.trim() === "") {
      return false;
    }

    if (
      (newQuestion.type === "MultipleChoice" ||
        newQuestion.type === "SelectAnyOne") &&
      (newQuestion.options === null || newQuestion.options.trim() === "")
    ) {
      return false;
    }

    if (
      (newQuestion.type === "MultipleChoice" ||
        newQuestion.type === "SelectAnyOne") &&
      !newQuestion.options.includes(",")
    ) {
      return false;
    }

    return true;
  }
  async function handleSubmit() {
    if (validateForm()) {
      if (!editMode) {

        console.log("translations are: ", translations);
        // format translation beofre submitting
        const formattedTranslations = Object.fromEntries(
          Object.entries(translations).map(([langId, value]) => [
            langId,
            typeof value === "string" ? { text: value, options: "" } : value,
          ])
        );

        console.log("after format: ", formattedTranslations);
        const payload = {
          ailment: newQuestion.ailment?.map((x) => x.value),
          type: newQuestion.type,
          name: newQuestion.name,
          options: newQuestion.options,
          translations: formattedTranslations,
        };
        const response = await createQuestion(payload);
        if (response.success) {
          setErrMsg("");
          setSuccessful("Question Created Successful!");
          newQuestionDispatch({
            type: "all",
            payload: {},
          });
        } else {
          setErrMsg("Error Creating Question:" + response.data);
          setSuccessful("");
        }
      } else {

        const payload = {
          id: newQuestion.id,
          ailment: newQuestion.ailment,
          type: newQuestion.type,
          name: newQuestion.name,
          options: newQuestion.options,
          translations: translations,
        };
        console.log("updating with: ", payload);
        console.log("translations here: ",translations);
        console.log("options: ",newQuestion.options);
        console.log(newQuestion.id);
        const response = await updateQuestion(newQuestion.id, payload);
        if (response.success) {
          setErrMsg("");
          setEditMode(false);
          setSuccessful("Question Updated Successful!");
          newQuestionDispatch({
            type: "all",
            payload: {},
          });
        } else {
          setErrMsg("Error Updating Question:" + response.data);
          setSuccessful("");
        }
      }
    } else {
      setErrMsg("Please fill all the fields!");
      setSuccessful("");
    }
  }

  const questionTypeOptions = questionTypes.map((q, index) => {
    return (
      <option key={index} value={q.value}>
        {q.label}
      </option>
    );
  });

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 max-w-[1440px] mx-auto">
            <PageHeader
              title="Profile Questions"
              breadcrumbs={[
                { label: "Dashboard", path: "/admin" },
                { label: "Profile Questions", active: true }
              ]}
            />
          </Container>
        </Box>

        <div className="admin-page">
          {/* Form Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__header-title">Question Master</h2>
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

              {modelOpenOpt && (
                <OptTranslationModal
                  closeModal={closeModalOpt}
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
                  value={newQuestion.ailment}
                  onChange={(ailment) => {
                    newQuestionDispatch({
                      type: "ailment",
                      payload: ailment,
                    });
                  }}
                  options={ailments.map((ailment) => ({
                    value: ailment.id,
                    label: ailment.name,
                  }))}
                  isMulti
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '10px',
                      borderColor: '#E5E7EB',
                      '&:hover': { borderColor: '#1A9A9A' }
                    })
                  }}
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">
                  Question Type
                </label>
                <select
                  value={newQuestion.type}
                  onChange={(event) => {
                    newQuestionDispatch({
                      type: "type",
                      payload: event.target.value,
                    });
                  }}
                  className="admin-form__select"
                >
                  {questionTypeOptions}
                </select>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Name</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Question Name"
                    value={newQuestion.name}
                    onChange={(event) => {
                      newQuestionDispatch({
                        type: "name",
                        payload: event.target.value,
                      });
                    }}
                    className="admin-form__input"
                    style={{ flex: 1, minWidth: '200px' }}
                  />
                  <button
                    onClick={() => setModelOpen(true)}
                    className="admin-btn admin-btn--teal"
                  >
                    Set Translations
                  </button>
                  <button
                    onClick={() => setModelOpenOpt(true)}
                    className="admin-btn admin-btn--outline"
                  >
                    Set Options Translations
                  </button>
                </div>
              </div>

              {(newQuestion.type === "MultipleChoice" || newQuestion.type === "SelectAnyOne") && (
                <div className="admin-form__group">
                  <label className="admin-form__label">Options (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="eg: Option1, Option2, Option3"
                    value={newQuestion.options}
                    onChange={(event) => {
                      newQuestionDispatch({
                        type: "options",
                        payload: event.target.value,
                      });
                    }}
                    className="admin-form__input"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                {editMode ? (
                  <>
                    <button onClick={handleSubmit} className="admin-btn admin-btn--teal">
                      UPDATE
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        newQuestionDispatch({
                          type: "all",
                          payload: {},
                        });
                      }}
                      className="admin-btn admin-btn--outline-danger"
                    >
                      CANCEL
                    </button>
                  </>
                ) : (
                    <>
                      <button onClick={handleSubmit} className="admin-btn admin-btn--primary">
                        SUBMIT
                      </button>
                      <Link to="/ProfileQuestionCsv" className="admin-btn admin-btn--coral">
                        Bulk Upload Questions
                      </Link>
                    </>
                )}
              </div>

              {errMsg && <div className="admin-message admin-message--error" style={{ marginTop: '1rem' }}>{errMsg}</div>}
              {successful && <div className="admin-message admin-message--success" style={{ marginTop: '1rem' }}>{successful}</div>}
            </div>
          </div>

          {/* Questions List Card */}
          <div className="admin-card">
            <div className="admin-card__body">
              <div className="admin-toolbar">
                <div className="admin-toolbar__left">
                  <div className="admin-search">
                    <svg className="admin-search__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      className="admin-search__input"
                      onChange={(event) => searchQuestion(event.target.value)}
                    />
                  </div>
                </div>
                <div className="admin-toolbar__right">
                  <span className="admin-toolbar__count">
                    {questions.length} Records Found
                  </span>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Ailment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, index) => {
                      const displayAilment = q.ailments.map((x) => x.name).join(", ");
                      return (
                        <tr key={index}>
                          <td>{q.name}</td>
                          <td>{q.type}</td>
                          <td>{displayAilment}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {role.canEditProfileQuestions && (
                                <button
                                  className="admin-action-btn admin-action-btn--edit"
                                  onClick={() => {
                                    setSuccessful("");
                                    newQuestionDispatch({
                                      type: "all",
                                      payload: {
                                        id: q.id,
                                        ailment: q.ailments.map((x) => ({
                                          value: x.id,
                                          label: x.name,
                                        })),
                                        type: q.type,
                                        name: q.name,
                                        options: q.options,
                                      },
                                    });
                                    if (q.question_translations) {
                                      let translationDict = {};
                                      q.question_translations.forEach((element) => {
                                          translationDict[element.language_id] = {
                                            text: element.name,
                                            options: element.options,
                                          };
                                        });
                                      setTranslations(translationDict);
                                    }
                                    setEditMode(true);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                >
                                  <BsPencilSquare size={18} />
                                </button>
                              )}
                              {role.canDeleteProfileQuestions && (
                                <button
                                  className="admin-action-btn admin-action-btn--delete"
                                  onClick={() => removeQuestion(q.id)}
                                >
                                  <BsTrash size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default ProfileQuestions;

