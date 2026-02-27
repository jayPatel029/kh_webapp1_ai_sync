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
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { UnifiedListTable, SearchBar } from "../../components";
import {
  FormControl,
  FormLabel,
  Input,
  Box,
  Container
} from "../../component-library";
import { Button } from "../../component-library";
import { useAdminToast } from "../../components/AdminToast";
import { usePageCache, PAGE_CACHE } from "../../cache";

function LanguageMaster() {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast, ToastContainer } = useAdminToast();
  const { fetchWithCache, mutate } = usePageCache(PAGE_CACHE.LANGUAGE);

  const [languages, setLanguages] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [jsonPreview, setJsonPreview] = useState([]);
  const [audioPreview, setAudioPreview] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchWithCache('languages', () => getLanguages());
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

    const response = await mutate(() => deleteLanguage(id));
    if (response.success) {
      setErrMsg("");
      setSuccessful("Language Deleted Successful!");
      showToast("Language deleted successfully!", "success");
    } else {
      setErrMsg("Error Deleting Language:" + response.data);
      showToast("Error deleting language", "error");
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
        const response = await mutate(() => createLanguage(payload));
        if (response.success) {
          setErrMsg("");
          // setSuccessful("Language Created Successful!");
          showToast("Language created successfully!", "success");
          resetForm();
          setIsFormModalOpen(false);
        } else {
          setErrMsg("Error Creating Language:" + response.data);
          showToast("Error creating language", "error");
          setSuccessful("");
        }
      } else {
        const payload = {
          language_name: newLanguage,
        };
        const response = await mutate(() => updateLanguage(editID, payload));
        if (response.success) {
          setErrMsg("");
          setSuccessful("Language Updated Successful!");
          showToast("Language updated successfully!", "success");
          resetForm();
          setIsFormModalOpen(false);
        } else {
          setErrMsg("Error Updating Language:" + response.data);
          showToast("Error updating language", "error");
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
        <Box className="sticky top-[56px] z-20 bg-white">

          <PageHeader
            title="Language Master"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Language Master", active: true }
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
                    placeholder="Search by language..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "250px" }}
                  />
                </div>

                <div className="admin-toolbar__right">
                  <span className="admin-toolbar__count">
                    {languages.filter(lang =>
                      lang.language_name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length} Records Found
                  </span>
                  <Button
                    variant="solid"
                    onClick={() => {
                      resetForm();
                      setIsFormModalOpen(true);
                    }}
                  >
                    Add Language
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
                  { key: 'id', label: 'ID', type: 'text', width: '80px' },
                  { key: 'language_name', label: 'Language', type: 'text', width: '300px' },
                  { key: 'actions', label: 'Actions', type: 'actions', width: '100px' }
                ]}
                data={languages.filter(lang =>
                  lang.language_name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((lang) => ({
                  ...lang,
                  actions: lang
                }))}
                enableSearch={true}
                renderSearchUI={false}
                searchKeys={['language_name']}
                onEdit={(lang) => {
                  setEditID(lang.id);
                  setNewLanguage(lang.language_name);
                  setEditMode(true);
                  setIsFormModalOpen(true);
                }}
                onDelete={(lang) => {
                  if (window.confirm(`Delete language "${lang.language_name}"?`)) {
                    removeLang(lang.id);
                  }
                }}
                emptyMessage="No languages found"
              />
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
            <Box className="space-y-6">
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
                <Box className="flex flex-col md:flex-row gap-6">
                  <FormControl>
                    <FormLabel>JSON File</FormLabel>
                    <FileUploadWithCamera
                      images={jsonPreview}
                      size="xs"
                      onChange={setJsonPreview}
                      onFileChange={(file) => setLangJson(file)}
                      accept=".json,application/json"
                      multiple={false}
                      attachLabel="Upload JSON"
                      captureLabel="Capture"
                      showCountInfo={false}
                      showCamera={false}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Audio Zip File</FormLabel>
                    <FileUploadWithCamera
                      size="xs"
                      images={audioPreview}
                      onChange={setAudioPreview}
                      onFileChange={(file) => setLangAudio(file)}
                      accept=".zip,application/zip,application/x-zip-compressed"
                      multiple={false}
                      attachLabel="Upload Audio Zip"
                      captureLabel="Capture"
                      showCountInfo={false}
                      showCamera={false}
                    />
                  </FormControl>
                </Box>
              )}
            </Box>
          </FormModal>
        </div>
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}

export default LanguageMaster;

