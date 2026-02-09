import React from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import { useState, useReducer, useEffect } from "react";
import {
  createLanguage,
  getLanguages,
  deleteLanguage,
  updateLanguage,
} from "../../ApiCalls/languageApis";

// Component Library
import { Box, Container } from "../../component-library";

function LanguageMaster() {
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
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        {/* <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 max-w-[1440px] mx-auto">
            <PageHeader
              title="Language Master"
              breadcrumbs={[
                { label: "Dashboard", path: "/admin" },
                { label: "Language Master", active: true }
              ]}
            />
          </Container>
        </Box> */}

        <div className="admin-page">
          {/* Form Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__header-title">Language Master</h2>
            </div>
            <div className="admin-card__body">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">
                  Language
                </label>
                <input
                  type="text"
                  placeholder="Language Name"
                  value={newLanguage}
                  onChange={(event) => {
                    setNewLanguage(event.target.value);
                  }}
                  className="admin-form__input"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">
                  JSON File

                </label>
                <input
                  type="file"
                  name="JSON"
                  id="file-input"
                  onChange={(event) => {
                    setLangJson(event.target.files[0]);
                  }}
                  className="admin-form__file"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">
                  Audio Zip File
                </label>
                <input
                  type="file"
                  name="Audio Zip File"
                  id="audio-file-input"
                  onChange={(event) => {
                    setLangAudio(event.target.files[0]);
                  }}
                  className="admin-form__file"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                {editMode ? (
                  <>
                    <button onClick={handleSubmit} className="admin-btn admin-btn--teal">
                      UPDATE
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setNewLanguage("");
                      }}
                      className="admin-btn admin-btn--outline-danger"
                    >
                      CANCEL
                    </button>
                  </>
                ) : (
                  <button onClick={handleSubmit} className="admin-btn admin-btn--primary">
                    SUBMIT
                  </button>
                )}
              </div>

              {errMsg && <div className="admin-message admin-message--error" style={{ marginTop: '1rem' }}>{errMsg}</div>}
              {successful && <div className="admin-message admin-message--success" style={{ marginTop: '1rem' }}>{successful}</div>}
            </div>
          </div>

          {/* Languages List Card */}
          <div className="admin-card">
            <div className="admin-card__body">
              <div className="admin-toolbar">
                <div className="admin-toolbar__left">
                  <h3 style={{ margin: 0, fontWeight: 600, color: '#111827' }}>Languages List</h3>
                </div>
                <div className="admin-toolbar__right">
                  <span className="admin-toolbar__count">
                    {languages.length} Records Found
                  </span>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Language</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {languages.map((lang, index) => (
                      <tr key={index}>
                        <td>{lang.id}</td>
                        <td>{lang.language_name}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="admin-action-btn admin-action-btn--edit"
                              onClick={() => {
                                setEditID(lang.id);
                                setNewLanguage(lang.language_name);
                                setEditMode(true);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              <BsPencilSquare size={18} />
                            </button>
                            <button
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={() => removeLang(lang.id)}
                            >
                              <BsTrash size={18} />
                            </button>
                          </div>
                          </td>
                        </tr>
                    ))}
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

export default LanguageMaster;

