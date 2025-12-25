import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import Navbar from "../../components/navbar/Navbar";
import { useState, useReducer, useEffect } from "react";
import {
  createLanguage,
  getLanguages,
  deleteLanguage,
  updateLanguage,
} from "../../ApiCalls/languageApis";

function ProfileQuestions() {
  const [editMode, setEditMode] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLanguages();
        if (result.success) {
          setLanguages(result.data);
        } else {
          console.error("Failed to fetch languages:", result.data);
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };

    fetchData();
  }, [successful]);

  async function removeLang(id) {
    
    const response = await deleteLanguage(id);
    if (response.success) {
      setErrMsg("");
      setSuccessful("Language Deleted Successful!");
    } else {
      setErrMsg("Error Deleting Language:" + response.data);
      setSuccessful("");
    }
  }

  const [newLanguage, setNewLanguage] = useState("");
  const [langJson, setLangJson] = useState(null);
  const [langAudio, setLangAudio] = useState(null);
  const [editID, setEditID] = useState("");

  function validateForm() {
    if (newLanguage.trim() === "") {
      return false;
    }
    return true;
  }
  async function handleSubmit() {
    if (validateForm()) {
      if (!editMode) {
        const payload = {
          language_name: newLanguage,
          language_json: langJson,
          language_audio: langAudio,
        };
        const response = await createLanguage(payload);
        if (response.success) {
          setErrMsg("");
          setSuccessful("Language Created Successful!");
          setNewLanguage("");
        } else {
          setErrMsg("Error Creating Language:" + response.data);
          setSuccessful("");
        }
      } else {
        const payload = {
          language_name: newLanguage,
        };
        const response = await updateLanguage(editID, payload);
        if (response.success) {
          setErrMsg("");
          setEditMode(false);
          setSuccessful("Language Updated Successful!");
          setNewLanguage("");
        } else {
          setErrMsg("Error Updating Language:" + response.data);
          setSuccessful("");
        }
      }
    } else {
      setErrMsg("Please fill all the fields!");
      setSuccessful("");
    }
  }

  return (
    <div className="md:flex block w-screen">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      <div className=" md:flex-[5] block max-w-screen">
        <div className="sticky top-0 bg-white z-50 ">
          <Navbar />
        </div>
        <div className="bg-gray-100 top-0 min-h-screen md:py-10 md:px-40">
          <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="border-b-gray border-b-2 p-2 pt-4 md:pb-4 font-semibold text-primary tracking-wide text-xl">
              Language Master
            </div>
            <div className="p-5">
              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                Language*
              </label>
              <input
                type="text"
                placeholder="Language Name"
                value={newLanguage}
                onChange={(event) => {
                  setNewLanguage(event.target.value);
                }}
                className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
              />
              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                JSON*
              </label>
              <input
                type="file"
                name="JSON"
                id="file-input"
                onChange={(event) => {
                  setLangJson(event.target.files[0]);
                }}
                className="block w-full border border-gray-300 text-gray-500 shadow-sm rounded-lg text-sm focus:z-10 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none 
                        file:border-0
                      file:bg-gray-300 file:me-4
                      file:text-gray-600
                        file:py-2.5 file:px-4"
              />
              <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                Audio Zip File
              </label>
              <input
                type="file"
                name="Audio Zip File"
                id="file-input"
                onChange={(event) => {
                  setLangAudio(event.target.files[0]);
                }}
                className="block w-full border border-gray-300 text-gray-500 shadow-sm rounded-lg text-sm focus:z-10 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none 
                        file:border-0
                      file:bg-gray-300 file:me-4
                      file:text-gray-600
                        file:py-2.5 file:px-4"
              />
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
                      setNewLanguage("");
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

          <div className=" bg-white md:p-12 p-6 border rounded-md  border-t-4 shadow-md mt-4">
            <div className="relative overflow-x-auto mt-6">
              <span className=" text-gray-900 tracking-wide text-xl ">
                languages List
                <span className="text-gray-400 text-sm">
                  ({languages.length} Records Found )
                </span>
              </span>
              <div className="mt-4">
                <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                  <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Id
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Language
                      </th>
                      <th scope="col" className="px-6 py-3 min-w-40 ">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {languages.map((lang, index) => {
                      return (
                        <tr key={index} className="bg-white border-b ">
                          <td scope="row" className="px-6 py-4">
                            {lang.id}
                          </td>
                          <td scope="row" className="px-6 py-4">
                            {lang.language_name}
                          </td>
                          <td className="px-6 py-4 text-2xl">
                            <button
                              className="text-primary inline-block mx-2"
                              onClick={() => {
                                setEditID(lang.id);
                                setNewLanguage(lang.language_name);
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
                            <button
                              className="text-[#ff0000] inline-block mx-2 "
                              onClick={() => {
                                removeLang(lang.id);
                              }}
                            >
                              <BsTrash />
                            </button>
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
