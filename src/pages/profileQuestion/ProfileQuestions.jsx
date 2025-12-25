import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import Navbar from "../../components/navbar/Navbar";
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
    <div className="md:flex block w-screen">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      <div className=" md:flex-[5] block max-w-screen">
        <div className="sticky top-0 bg-white z-50 ">
          <Navbar />
        </div>
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="border-b-gray border-b-2 p-2 pt-4 md:pb-4 font-semibold text-primary tracking-wide text-xl">
              Question Master
              <Link
                to="/ProfileQuestionCsv"
                className="border md:ml-2 ml-0 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300  md:w-1/4 rounded-lg  p-1.5"
              >
                {" "}
                Bulkupload Question
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
              
              {modelOpenOpt && (
                <OptTranslationModal
                  closeModal={closeModalOpt}
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
                value={newQuestion.ailment}
                onChange={(ailment) => {
                  newQuestionDispatch({
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
                Question Type*
              </label>
              <select
                value={newQuestion.type}
                onChange={(event) => {
                  newQuestionDispatch({
                    type: "type",
                    payload: event.target.value,
                  });
                }}
                className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
              >
                {questionTypeOptions}
              </select>
              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                Name
              </label>
              <div className="flex">
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
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block p-2.5 focus:outline-primary w-3/4"
                />

                <button
                  onClick={() => {
                    setModelOpen(true);
                  }}
                  className="border md:ml-2 ml-0 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-full md:w-1/4 rounded-lg block p-1.5"
                >
                  Set Translations
                </button>

                <button
                  onClick={() => {
                    setModelOpenOpt(true);
                  }}
                  className="border md:ml-2 ml-0 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-full md:w-1/4 rounded-lg block p-1.5"
                >
                  Set Options Translations
                </button>
              </div>
              {newQuestion.type === "MultipleChoice" ||
              newQuestion.type === "SelectAnyOne" ? (
                <>
                  <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                    Options (Comma Separated)
                  </label>
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
                    className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                  />
                </>
              ) : null}
              {editMode ? (
                <>
                  <button
                    onClick={handleSubmit}
                    className=" flex-1 mr-2 mt-5 border md:inline-block text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-[40%] md:w-[12vw] rounded-lg p-1.5"
                  >
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
                    className="flex-1 border text-[#ff0000] md:inline-block bg-white font-semibold tracking-wide text-lg border-[#ff0000] w-[40%] md:w-[12vw] rounded-lg  p-1.5"
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

          <div className=" bg-white md:p-12 p-6 border rounded-md  border-t-4 shadow-md mt-4">
            <div>
              <input
                type="text"
                placeholder="Search Name"
                className=" border border-gray-300 text-gray-500 inline-block text-sm rounded-lg w-full md:w-[22vw] p-2.5 focus:outline-primary"
                onChange={(event) => {
                  searchQuestion(event.target.value);
                }}
              />
              {/* <button className="inline-block  mx-3 border-primary border-2 p-3 text-md rounded-md text-primary">
              <FaSearch />
            </button> */}
            </div>

            <div className="relative overflow-x-auto mt-6">
              <span className=" text-gray-900 tracking-wide text-xl ">
                Questions List
                <span className="text-gray-400 text-sm">
                  ({questions.length} Records Found )
                </span>
              </span>
              <div className="mt-4">
                <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                  <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Ailment
                      </th>
                      <th scope="col" className="px-6 py-3 min-w-40 ">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, index) => {
                      const displayAilment = q.ailments
                        .map((x) => x.name)
                        .join(", ");
                      return (
                        <tr key={index} className="bg-white border-b ">
                          <td scope="row" className="px-6 py-4">
                            {q.name}
                          </td>
                          <td scope="row" className="px-6 py-4">
                            {q.type}
                          </td>
                          <td className="px-6 py-4">{displayAilment}</td>
                          <td className="px-6 py-4 text-2xl">
                           
                          {role.canEditProfileQuestions ? (

                            <button
                              className="text-primary inline-block mx-2"
                              onClick={() => {
                                setSuccessful("");
                                newQuestionDispatch({
                                  type: "all",
                                  payload: {
                                    id: q.id,
                                    ailment: q.ailments.map((x) => {
                                      return { value: x.id, label: x.name };
                                    }),
                                    type: q.type,
                                    name: q.name,
                                    options: q.options,
                                  },
                                });
                                if (q.question_translations) {
                                  let translationDict = {};
                                  let translationOptDict = {};

                                  q.question_translations.forEach((element) => {
                                    translationDict[element.language_id] =
                                      // element.name;
                                      {
                                        text: element.name,
                                        options: element.options,
                                      };
                                  });

                                  // q.question_translations.forEach((element) => {
                                  //   translationOptDict[element.language_id] =
                                  //     element.options;
                                  // });
                                  setTranslations(translationDict);
                                  // setOptTranslations(translationOptDict);
                                  console.log("editing these: ", q);
                                  console.log("qtrnaslaton: ", q.question_translations);
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

                            {role.canDeleteProfileQuestions ?(

                            <button
                              className="text-[#ff0000] inline-block mx-2 "
                              onClick={() => {
                                removeQuestion(q.id);
                              }}
                            >
                              <BsTrash />
                            </button>
                                                ):null} 

                          
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
      </div>
    </div>
  );
}

export default ProfileQuestions;
