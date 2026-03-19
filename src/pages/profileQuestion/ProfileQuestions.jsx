import React from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";

import { questionTypes } from "./consts";
import { useState, useReducer, useEffect, useMemo } from "react";
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
import SelectS from "react-select";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormModal } from "../../component-library/modals/FormModal";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import ProfileQuestionsBulkUploadModal from "./ProfileQuestionsBulkUploadModal";
import { UnifiedListTable, SearchBar } from "../../components";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  MultiSelect,
  Box,
  Container
} from "../../component-library";
import { useAdminToast } from "../../components/AdminToast";
import { usePageCache, PAGE_CACHE } from "../../cache";

function ProfileQuestions() {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast, ToastContainer } = useAdminToast();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.PROFILE_QUESTION);

  const [questionsList, setQuestionsList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [ailments, setAilments] = useState([]);

  const [languages, setLanguages] = useState([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [modelOpenOpt, setModelOpenOpt] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [translations, setTranslations] = useState({});
  const [optTranslations, setOptTranslations] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const role = useSelector((state) => state.permission);

  const closeModal = () => {
    setModelOpen(false);
  };

  const closeModalOpt = () => {
    console.log("object", optTranslations);
    setModelOpenOpt(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchWithCache('questions', () => getQuestions());
        if (result.success) {
          console.log(result.data);
          setQuestionsList(result.data);
          setQuestions(result.data);
        } else {
          console.error("Failed to fetch questions:", result.data);
        }
        fetchWithCache('ailments', () => getAilments()).then((resultAilment) => {
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
        fetchWithCache('languages', () => getLanguages()).then((resultLanguage) => {
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
  }, [successful, refreshKey]);

  function searchQuestion(keyword) {
    if (keyword.trim() === '') {
      setQuestions(questionsList);
    } else {
      setQuestions(
        questionsList.filter((q) => {
          return q.name.toLowerCase().includes(keyword.toLowerCase());
        })
      );
    }
  }
  async function removeQuestion(id) {
    setSuccessful("");
    setQuestions(questions.filter((q) => q.id !== id));
    setQuestionsList(questionsList.filter((q) => q.id !== id));
    const response = await mutate(() => deleteQuestion(id));
    if (response.success) {
      setErrMsg("");
      setSuccessful("Question Deleted Successful!");
      showToast("Question deleted successfully!", "success");
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
    const nextFieldErrors = {};
    if (newQuestion.type.trim() === "") nextFieldErrors.type = true;
    if (newQuestion.name.trim() === "") nextFieldErrors.name = true;

    if (
      (newQuestion.type === "MultipleChoice" ||
        newQuestion.type === "SelectAnyOne") &&
      (newQuestion.options === null || newQuestion.options.trim() === "")
    ) {
      nextFieldErrors.options = true;
    }

    if (
      (newQuestion.type === "MultipleChoice" ||
        newQuestion.type === "SelectAnyOne") &&
      newQuestion.options && !newQuestion.options.includes(",")
    ) {
      nextFieldErrors.options = true;
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      // showToast("Please fill all the required fields correctly", "error");
      return false;
    }
    setFieldErrors({});
    return true;
  }
  async function handleSubmit() {
    if (validateForm()) {
      try {
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
          ailment: newQuestion.ailment,
          type: newQuestion.type,
          name: newQuestion.name,
          options: newQuestion.options,
          translations: formattedTranslations,
        };
        const response = await mutate(() => createQuestion(payload));
        if (response.success) {
          setErrMsg("");
          setSuccessful("Question Created Successful!");
          showToast("Question created successfully!", "success");
          setIsFormModalOpen(false);
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
        console.log("translations here: ", translations);
        console.log("options: ", newQuestion.options);
        console.log(newQuestion.id);
        const response = await mutate(() => updateQuestion(newQuestion.id, payload));
        if (response.success) {
          setErrMsg("");
          setEditMode(false);
          setSuccessful("Question Updated Successful!");
          showToast("Question updated successfully!", "success");
          setIsFormModalOpen(false);
          newQuestionDispatch({
            type: "all",
            payload: {},
          });
        } else {
          setErrMsg("Error Updating Question:" + response.data);
          setSuccessful("");
        }
      }
      } catch (error) {
        console.error("Error in question submit:", error);
        const msg = error?.message || "An unexpected error occurred. Please try again.";
        setErrMsg(msg.includes("Network") ? "Network error — please check your connection." : msg);
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



  const handleEdit = (q) => {
    setSuccessful("");
    newQuestionDispatch({
      type: "all",
      payload: {
        id: q.id,
        ailment: q.ailments || [],
        type: q.type,
        name: q.name,
        options: q.options,
      },
    });
    if (q.question_translations) {
      let translationDict = {};
      let optionDict = {};
      q.question_translations.forEach((element) => {
        translationDict[element.language_id] = {
          text: element.name,
          options: element.options,
        };
        optionDict[element.language_id] = element.options || "";
      });
      setTranslations(translationDict);
      setOptTranslations(optionDict);
    }
    setEditMode(true);
    setIsFormModalOpen(true);
  }




  const handleDelete = (question) => {
    if (window.confirm(`Delete question "${question.name}"?`)) {
      removeQuestion(question.id);
    }
  };


  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">

          <PageHeader
            title="Question Master"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Profile Questions", active: true }
            ]}
            onBack={() => navigate(ROUTES.HOME)}
          />

        </Box>


        <div className="admin-page-content">
          <div className="admin-card">
            <div className="admin-card__header">
              <div className="admin-toolbar">
                <div className="admin-toolbar__left">
                  <SearchBar
                    placeholder="Search by name..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "250px" }}
                  />
                </div>

                <div className="admin-toolbar__right">
                  <span className="admin-toolbar__count">
                    {questions.filter(q =>
                      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      q.type.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length} Records Found
                  </span>
                  <Button
                    variant="primary"
                    // className="admin-btn admin-btn--primary"
                    onClick={() => {
                      setEditMode(false);
                      setErrMsg("");
                      newQuestionDispatch({ type: "all", payload: {} });
                      setIsFormModalOpen(true);
                    }}
                  >
                    Add Question
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setIsBulkUploadModalOpen(true)}
                    className="admin-btn admin-btn--secondary"
                  >
                    Bulk Upload Questions
                  </Button>
                </div>
              </div>
            </div>

            <div className="admin-card__body">
              <div style={{ marginBottom: '1rem' }}>
                {errMsg && <div className="admin-message admin-message--error">{errMsg}</div>}
                {successful && <div className="admin-message admin-message--success">{successful}</div>}
              </div>

              <UnifiedListTable
                columns={[
                  { key: 'name', label: 'Title', type: 'text', width: '250px' },
                  { key: 'type', label: 'Type', type: 'text', width: '150px' },
                  { key: 'ailmentsDisplay', label: 'Ailment', type: 'text', width: '250px' },
                  { key: 'actions', label: 'Actions', type: 'actions', width: '100px' }
                ]}
                data={questions.filter(q =>
                  q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  q.type.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((q) => ({
                  ...q,
                  ailmentsDisplay: q.ailments?.map((x) => x.name).join(", ") || "Generic Profile",
                  actions: q.id
                }))}
                enableSearch={true}
                renderSearchUI={false}
                searchKeys={['name', 'type']}
                onEdit={role.canEditProfileQuestions ? handleEdit : null}
                onDelete={role.canDeleteProfileQuestions ? handleDelete : null}
                emptyMessage="No questions found"
                actionButtons={role.canEditProfileQuestions || role.canDeleteProfileQuestions}
              />
            </div>
          </div>
        </div>

        <FormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setModelOpen(false);
            setModelOpenOpt(false);
            setEditMode(false);
            setErrMsg("");
            setFieldErrors({});
            newQuestionDispatch({ type: "all", payload: {} });
          }}
          onSubmit={handleSubmit}
          title={editMode ? "Edit Question" : "Add Question"}
          submitText={editMode ? "Update" : "Submit"}
          size="xl"
          errorMessage={errMsg}
          fieldErrors={fieldErrors}
          onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
        >{/* ... existing modal fields ... */}
          <FormControl>
            <FormLabel>Ailment</FormLabel>
            <MultiSelect
              value={newQuestion.ailment}
              onChange={(ailments) => {
                newQuestionDispatch({
                  type: "ailment",
                  payload: ailments,
                });
              }}
            >
              {ailments.map((ailment) => (
                <option key={ailment.id} value={ailment}>
                  {ailment.name}
                </option>
              ))}
            </MultiSelect>
          </FormControl>

          {modelOpen && (
            <TranslationModal
              isOpen={modelOpen}
              onClose={closeModal}
              translations={translations}
              setTranslations={setTranslations}
              languages={languages}
            />
          )}

          {modelOpenOpt && (
            <OptTranslationModal
              isOpen={modelOpenOpt}
              onClose={closeModalOpt}
              translations={optTranslations}
              setTranslations={setOptTranslations}
              languages={languages}
            />
          )}

          <FormControl isInvalid={Boolean(fieldErrors.type)}>
            <FormLabel>Question Type<span className="text-red-500">*</span></FormLabel>
            <Select
              value={newQuestion.type}
              isInvalid={Boolean(fieldErrors.type)}
              onChange={(event) => {
                newQuestionDispatch({
                  type: "type",
                  payload: event.target.value,
                });
                setFieldErrors((prev) => ({ ...prev, type: false }));
              }}
            >
              {questionTypeOptions}
            </Select>
          </FormControl>

          <FormControl isInvalid={Boolean(fieldErrors.name)}>
            <FormLabel>Name<span className="text-red-500">*</span></FormLabel>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Input
                type="text"
                placeholder="Question Name"
                value={newQuestion.name}
                isInvalid={Boolean(fieldErrors.name)}
                onChange={(event) => {
                  newQuestionDispatch({
                    type: "name",
                    payload: event.target.value,
                  });
                  setFieldErrors((prev) => ({ ...prev, name: false }));
                }}
                style={{ flex: 1, minWidth: '200px' }}
              />
              <Button
                variant="secondary"
                onClick={(e) => { e.preventDefault(); setModelOpen(true); }}
                className="admin-btn admin-btn"
              >
                Translations
              </Button>
            </div>
          </FormControl>

          {(newQuestion.type === "MultipleChoice" || newQuestion.type === "SelectAnyOne") && (
            <FormControl isInvalid={Boolean(fieldErrors.options)}>
              <FormLabel>Options (Comma Separated)<span className="text-red-500">*</span></FormLabel>


              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Input
                  type="text"
                  placeholder="eg: Option1, Option2, Option3"
                  value={newQuestion.options}
                  isInvalid={Boolean(fieldErrors.options)}
                  onChange={(event) => {
                    newQuestionDispatch({
                      type: "options",
                      payload: event.target.value,
                    });
                    setFieldErrors((prev) => ({ ...prev, options: false }));
                  }}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    const optTrans = {};
                    Object.entries(translations).forEach(([langId, val]) => {
                      if (val && typeof val === "object" && val.options !== undefined) {
                        optTrans[langId] = val.options;
                      } else {
                        optTrans[langId] = "";
                      }
                    });
                    setOptTranslations(optTrans);
                    setModelOpenOpt(true);
                  }}
                >
                  Options Translations
                </Button>
              </div>
            </FormControl>
          )}
        </FormModal>
        {/* </div> */}

        <ProfileQuestionsBulkUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => {
            setIsBulkUploadModalOpen(false);
            setSuccessful("Bulk upload completed successfully!");
          }}
        />
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}

export default ProfileQuestions;


