import React from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { useState, useEffect } from "react";
import {
  createLanguage,
  getLanguages,
  deleteLanguage,
  updateLanguage,
} from "../../ApiCalls/languageApis";
import { FormModal } from "../../component-library/modals/FormModal";
import FileUploadWithCamera from "../../components/FileUploadWithCamera";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import {
  FormControl,
  FormLabel,
  Input,
  Box,
  Container
} from "../../component-library";

function LanguageMaster() {
  const [editMode, setEditMode] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [languages, setLanguages] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [jsonPreview, setJsonPreview] = useState([]);
  const [audioPreview, setAudioPreview] = useState([]);

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

  const resetForm = () => {
    setNewLanguage("");
    setLangJson(null);
    setLangAudio(null);
    setJsonPreview([]);
    setAudioPreview([]);
    setEditID("");
    setEditMode(false);
  };

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
          resetForm();
          setIsFormModalOpen(false);
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
          setSuccessful("Language Updated Successful!");
          resetForm();
          setIsFormModalOpen(false);
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
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 mx-0">
            <PageHeader
              title="Language Master"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Language Master", active: true }
              ]}
            />
          </Container>
        </Box>

         
          <div className="admin-page-content">
            <div className="admin-card">
              <div className="admin-card__header">
                <div className="flex justify-between items-center w-full flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      ({languages.filter(lang => 
                        lang.language_name.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length} records found)
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="admin-search">
                      <svg className="admin-search__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search languages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search__input"
                      />
                    </div>
                    <button
                      className="admin-btn admin-btn--primary"
                      onClick={() => {
                        resetForm();
                        setIsFormModalOpen(true);
                      }}
                    >
                      Add Language
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-card__body">
                <div style={{ marginBottom: '1rem' }}>
                  {errMsg && <div className="admin-message admin-message--error">{errMsg}</div>}
                  {successful && <div className="admin-message admin-message--success">{successful}</div>}
                </div>

            <div className="overflow-x-auto">
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
                    {languages.filter(lang => 
                      lang.language_name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((lang, index) => (
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
                              setIsFormModalOpen(true);
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
            <FormModal
              isOpen={isFormModalOpen}
              onClose={() => {
                setIsFormModalOpen(false);
                resetForm();
              }}
              onSubmit={handleSubmit}
              title={editMode ? "Edit Language" : "Add Language"}
              submitText={editMode ? "Update" : "Submit"}
              size="lg"
              errorMessage={errMsg}
            >
              <Box className="space-y-4">
                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Input
                    type="text"
                    placeholder="Language Name"
                    value={newLanguage}
                    onChange={(event) => {
                      setNewLanguage(event.target.value);
                    }}
                  />
                </FormControl>

                {!editMode && (
                  <>
                    <FormControl>
                      <FormLabel>JSON File</FormLabel>
                      <FileUploadWithCamera
                        images={jsonPreview}
                        onChange={setJsonPreview}
                        onFileChange={(file) => setLangJson(file)}
                        accept=".json,application/json"
                        multiple={false}
                        append={false}
                        attachLabel="Upload JSON"
                        captureLabel="Capture"
                        showCountInfo={false}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Audio Zip File</FormLabel>
                      <FileUploadWithCamera
                        images={audioPreview}
                        onChange={setAudioPreview}
                        onFileChange={(file) => setLangAudio(file)}
                        accept=".zip,application/zip,application/x-zip-compressed"
                        multiple={false}
                        append={false}
                        attachLabel="Upload Audio Zip"
                        captureLabel="Capture"
                        showCountInfo={false}
                      />
                    </FormControl>
                  </>
                )}
              </Box>
            </FormModal>
          </div>

      </Box>
    </ThemeProvider>
  );
}

export default LanguageMaster;

