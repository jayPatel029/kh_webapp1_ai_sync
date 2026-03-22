import React, { useState, useEffect } from "react";
import { getLanguages } from "../../../ApiCalls/languageApis";
import {
  getAilments,
  addAilment,
  updateAilment,
  deleteAilment,
} from "../../../ApiCalls/ailmentApis";
import { uploadFile } from "../../../ApiCalls/dataUpload";
import FileUploadWithCamera from "../../../components/FileUploadWithCamera";
import { FormModal } from "../../../component-library/modals/FormModal";
import { UnifiedListTable, SearchBar } from "../../../components";
import { Input, FormControl, FormLabel, Button } from "../../../component-library";
import { useIsMobile } from "../../../components/mobile/useIsMobile";
import { useAdminToast } from "../../../components/AdminToast";
import { usePageCache, PAGE_CACHE } from "../../../cache";
import { useSelector } from "react-redux";

export default function AilmentMasterComponent() {
  // State to hold the selected ailment data

  const [translations, setTranslations] = useState({});
  const [name, setName] = useState("");
  const [ailments, setAilments] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [Ailment_Img, setAilment_Img] = useState(null);
  const [errmsg, setErrmsg] = useState("");
  const [successmsg, setSuccessmsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [id, setId] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.AILMENT_MASTER);
  const role = useSelector((state) => state.permission);

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchWithCache('ailments', () => getAilments()).then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            setAilments(resultAilment.data.listOfAilments);
          } else {
            console.error("Failed to fetch Ailments:", resultAilment);
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
  }, [successmsg, refreshKey]);

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
    setFieldErrors({});
  };

  const submitAilment = async () => {
    // Validate required fields
    const nextFieldErrors = {};
    if (!name || name.trim() === "") nextFieldErrors.name = true;
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      // showToast("Please fill all the required fields", "error");
      return;
    }
    setFieldErrors({});

    const Ailment_Img_Url = await getFileRes(Ailment_Img);
    const ailmentData = {
      id: id,
      name: name,
      translations: translations,
      Ailment_Img: Ailment_Img_Url?.data?.objectUrl,
    };
    try {
      if (!editMode) {
        mutate(() => addAilment(ailmentData)).then((result) => {
          if (result.success) {
            clearFields();
            setSuccessmsg("Ailment added successfully");
            showToast("Ailment added successfully!", "success");
            setIsFormModalOpen(false);
          } else {
            const msg = typeof result.data === 'string' ? result.data : result.data?.message || "Failed to add Ailment";
            setErrmsg(msg);
          }
        });
      } else {
        mutate(() => updateAilment(id, ailmentData)).then((result) => {
          if (result.success) {
            clearFields();
            setSuccessmsg("Ailment updated successfully");
            showToast("Ailment updated successfully!", "success");
            setIsFormModalOpen(false);
          } else {
            const msg = typeof result.data === 'string' ? result.data : result.data?.message || "Failed to update Ailment";
            setErrmsg(msg);
          }
        });
      }
    } catch (error) {
      console.error("Error adding Ailment:", error);
      const msg = error?.message || "An unexpected error occurred. Please try again.";
      setErrmsg(msg);
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

  const handleEdit = (ailment) => {
    setSuccessmsg("");
    setName(ailment.name);
    setId(ailment.id);
    if (ailment.ailmentTranslations) {
      let translationDict = {};
      ailment.ailmentTranslations.forEach((element) => {
        translationDict[element.languageId] = element.name;
      });
      setTranslations(translationDict);
    }
    setEditMode(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (ailment) => {
    if (window.confirm(`Delete ailment "${ailment.name}"?`)) {
      mutate(() => deleteAilment(ailment.id))
        .then(() => {
          setSuccessmsg("Ailment deleted successfully!");
          showToast("Ailment deleted successfully!", "success");
          getAilments().then((resultAilment) => {
            if (resultAilment.success && resultAilment.data.listOfAilments) {
              setAilments(resultAilment.data.listOfAilments);
            }
          });
        })
        .catch((error) => {
          console.error("Error deleting Ailment:", error);
          setErrmsg("Error deleting ailment");
        });
    }
  };

  return (
    <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className={`admin-toolbar ${isMobile ? 'flex-col gap-2' : ''}`}>
            <div className="admin-toolbar__left" style={isMobile ? { width: '100%' } : {}}>
              <SearchBar
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={isMobile ? { width: '100%' } : { width: "250px" }}
              />
            </div>
            <div className={`admin-toolbar__right ${isMobile ? 'w-full justify-between' : ''}`}>
              <span className={`admin-toolbar__count ${isMobile ? 'text-xs' : ''}`}>
                {ailments.filter(ailment =>
                  ailment.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length} Records Found
              </span>
              {
                role.canEditAilmentMaster &&
                <Button
                  varient="primary"
                  className="admin-btn admin-btn--primary"
                  onClick={() => setIsFormModalOpen(true)}
                >
                  Add Ailment
                </Button>
              }
            </div>
          </div>
        </div>

        {/* <div className="admin-card__body"> */}
        {/* <div style={{ marginBottom: '1rem' }}>
            {errmsg && <div className="admin-message admin-message--error">{errmsg}</div>}
            {successmsg && <div className="admin-message admin-message--success">{successmsg}</div>}
          </div> */}

        <UnifiedListTable
          columns={[
            { key: 'name', label: 'Name', type: 'text', width: '200px' },
            { key: 'Ailment_Img', label: 'Icon', type: 'image', width: '100px' },
            { key: 'actions', label: 'Actions', type: 'actions', width: '100px' }
          ]}
          cardTitleKey="name"
          cardImageKey="Ailment_Img"
          data={ailments.filter(ailment =>
            ailment.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((ailment) => ({
            ...ailment,
            actions: ailment
          }))}
          enableSearch={true}
          renderSearchUI={false}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchKeys={['name']}
          onEdit={role.canEditAilmentMaster ? handleEdit : null}
          onDelete={role.canDeleteAilmentMaster ? handleDelete : null}
        />
      </div>
      {/* </div> */}

      <FormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSubmit={submitAilment}
        title={editMode ? "Edit Ailment" : "Add Ailment"}
        submitText={editMode ? "Update" : "Submit"}
        size="lg"
        errorMessage={errmsg}
        fieldErrors={fieldErrors}
        onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      >
        {({ getFieldProps, clearFieldError }) => (
          <>
            <FormControl isInvalid={getFieldProps("name").isInvalid}>
              <FormLabel>English<span className="text-red-500">*</span></FormLabel>
              <Input
                type="text"
                placeholder="Enter ailment in English"
                value={name}
                isInvalid={getFieldProps("name").isInvalid}
                onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
              />
            </FormControl>

            {languages.map((language) => {
              if (language.id === 1) return null;
              return (
                <FormControl key={language.id}>
                  <FormLabel>{language.language_name}</FormLabel>
                  <Input
                    type="text"
                    placeholder={`Enter ailment in ${language.language_name}`}
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

                size="xs"
                images={Ailment_Img ? [Ailment_Img] : []}
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
          </>
        )}
      </FormModal>
      <ToastContainer />
    </div>


  );
}
