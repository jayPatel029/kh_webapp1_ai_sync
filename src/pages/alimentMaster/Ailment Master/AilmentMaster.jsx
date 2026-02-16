import React, { useState, useEffect } from "react";
import AilmentList from "./AilmentList";
import { getLanguages } from "../../../ApiCalls/languageApis";
import {
  getAilments,
  addAilment,
  updateAilment,
} from "../../../ApiCalls/ailmentApis";
import { uploadFile } from "../../../ApiCalls/dataUpload";
import FileUploadWithCamera from "../../../components/FileUploadWithCamera";
import { FormModal } from "../../../component-library/modals/FormModal";
// Design system primitives
import {
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
} from "../../../component-library";

export default function AilmentMasterComponent() {
  // State to hold the selected ailment data

  const [translations, setTranslations] = useState({});
  const [name, setName] = useState("");
  const [ailments, setAilments] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [Ailment_Img, setAilment_Img] = useState(null);
  const [errmsg, setErrmsg] = useState("");
  const [successmsg, setSuccessmsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [id, setId] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

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
            setTranslations(transaltiondict);
          } else {
            console.error("Failed to fetch Languages:", resultLanguage);
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [successmsg]);

  const getFileRes = async (file) => {
    try {
      if (file) {
        let formData = new FormData();
        formData.append("file", file, file?.name);
        const fileRes = await uploadFile(formData);
        return fileRes;
      } else {
        return { data: { objectUrl: "" } };
      }
    } catch (error) {
      setErrmsg("Error uploading file:");
      console.error(error);
    }
  };

  const clearFields = () => {
    setName("");
    setAilment_Img(null);
    let transaltiondict = {};
    languages.forEach((lang) => {
      if (lang.id !== 1) {
        transaltiondict[lang.id] = "";
      }
    });
    setEditMode(false);
    setTranslations(transaltiondict);
    setSuccessmsg("");
    setErrmsg("");
  };

  const submitAilment = async () => {
    const Ailment_Img_Url = await getFileRes(Ailment_Img);
    const ailmentData = {
      id: id,
      name: name,
      translations: translations,
      Ailment_Img: Ailment_Img_Url?.data?.objectUrl,
    };
    try {
      if (!editMode) {
        addAilment(ailmentData).then((result) => {
          if (result.success) {
            clearFields();
            setSuccessmsg("Ailment added successfully");
            setIsFormModalOpen(false);
          } else {
            setErrmsg("Failed to add Ailment");
          }
        });
      } else {
        updateAilment(id, ailmentData).then((result) => {
          if (result.success) {
            clearFields();
            setSuccessmsg("Ailment updated successfully");
            setIsFormModalOpen(false);
          } else {
            setErrmsg("Failed to update Ailment");
          }
        });
      }
    } catch (error) {
      console.error("Error adding Ailment:", error);
    }
  };

  // Focus form when edit mode enabled
  useEffect(() => {
    if (editMode) {
      setIsFormModalOpen(true);
    }
  }, [editMode]);

  const openAddModal = () => {
    clearFields();
    setEditMode(false);
    setId(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    clearFields();
  };

  return (
     
      <div className="admin-page-content">
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="flex justify-between items-center w-full flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  ({ailments.filter(ailment => 
                    ailment.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    placeholder="Search ailments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search__input"
                  />
                </div>
                <button
                  className="admin-btn admin-btn--primary"
                  onClick={() => setIsFormModalOpen(true)}
                >
                  Add Ailment
                </button>
              </div>
            </div>
          </div>

          <div className="admin-card__body">
            <div style={{ marginBottom: '1rem' }}>
              {errmsg && <div className="admin-message admin-message--error">{errmsg}</div>}
              {successmsg && <div className="admin-message admin-message--success">{successmsg}</div>}
            </div>

            <AilmentList
              setName={setName}
              setTranslations={setTranslations}
              ailments={ailments.filter(ailment => 
                ailment.name.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              setEditMode={setEditMode}
              setId={setId}
              setSuccessful={setSuccessmsg}
              onOpenEditModal={() => setIsFormModalOpen(true)}
            />
          </div>
        </div>

        <FormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={submitAilment}
          title={editMode ? "Edit Ailment" : "Add Ailment"}
          submitText={editMode ? "Update" : "Submit"}
          size="lg"
          errorMessage={errmsg}
        >
          <FormControl>
            <FormLabel>English Name</FormLabel>
            <Input
              type="text"
              placeholder="Enter ailment name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          {languages.map((language) => {
            if (language.id === 1) return null;
            return (
              <FormControl key={language.id}>
                <FormLabel>{language.language_name}</FormLabel>
                <Input
                  type="text"
                  placeholder={`Enter name in ${language.language_name}`}
                  value={translations[language.id] || ""}
                  onChange={(e) => {
                    setTranslations({
                      ...translations,
                      [language.id]: e.target.value,
                    });
                  }}
                />
              </FormControl>
            );
          })}

          <FormControl>
            <FormLabel>Icon</FormLabel>
            <FileUploadWithCamera
              onFileChange={(file) => setAilment_Img(file)}
              accept="image/*"
              attachLabel="Upload Icon"
              captureLabel="Capture Icon"
              previewWidth={100}
              previewHeight={100}
              showCountInfo={false}
              showCamera={false}
              multiple={false}
            />
          </FormControl>

        </FormModal>
      </div>


  );
}
