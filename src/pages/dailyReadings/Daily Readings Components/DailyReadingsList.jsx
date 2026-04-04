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
import { Link } from "react-router-dom";
import { FormModal } from "../../../component-library/modals/FormModal";
import DailyReadingsBulkUploadModal from "../DailyReadingsBulkUploadModal";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  MultiSelect,
  Button
} from "../../../component-library";
import { BulkUploadProof } from '../../../components';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from "../../../component-library/primitives/Modal";
import { set } from "date-fns";
import { useAdminToast } from "../../../components/AdminToast";
import { usePageCache, PAGE_CACHE } from "../../../cache";
function DailyForm() {
  const [editMode, setEditMode] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [modelOpen, setModelOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [translations, setTranslations] = useState({});
  const [data, setData] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const { showToast, ToastContainer } = useAdminToast();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.DAILY_READINGS);


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
  }, [refreshKey]);

  useEffect(() => {
    if (!editMode && ailments.length > 0 && (!newReading.ailment || newReading.ailment.length === 0)) {
      newReadingDsipatch({
        type: "ailment",
        // ensure we set string ids to match MultiSelect value shape
        payload: [String(ailments[0].id)],
      });
    }
  }, [ailments, editMode, newReading.ailment]);

  function validateForm() {
    const errors = {};
    if (newReading.title.trim() === "") errors.title = true;
    if (
      newReading.assign_range.trim() === "yes" &&
      (isNaN(newReading.lower_assign_range) ||
        isNaN(newReading.upper_assign_range))
    ) {
      if (isNaN(newReading.lower_assign_range)) errors.lower_assign_range = true;
      if (isNaN(newReading.upper_assign_range)) errors.upper_assign_range = true;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    setSuccessful("");
    setErrMsg("");
    try {
    const payload = {
      id: newReading.id,
      title: newReading.title,
      ailments: newReading.ailment,
      type: newReading.type,
      assign_range: newReading.assign_range,
      low_range: newReading.lower_assign_range,
      high_range: newReading.upper_assign_range,
      isGraph: Number(newReading.isGraph),
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
        const response = await mutate(() => addDailyReading(payload));
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
          showToast("Daily reading created successfully!", "success");
          setIsFormModalOpen(false);
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
        const response = await mutate(() => updateDailyReading(payload));
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
          showToast("Daily reading updated successfully!", "success");
          setIsFormModalOpen(false);
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
    } catch (error) {
      console.error("Error in daily readings submit:", error);
      const msg = error?.message || "An unexpected error occurred. Please try again.";
      setErrMsg(msg.includes("Network") ? "Network error — please check your connection." : msg);
    }
  }

  const resetFormState = () => {
    setEditMode(false);
    newReadingDsipatch({ type: "all", payload: {} });
    let transaltiondict = {};
    languages.forEach((lang) => {
      if (lang.id !== 1) {
        transaltiondict[lang.id] = "";
      }
    });
    setTranslations(transaltiondict);
    setErrMsg("");
    setFieldErrors({});
  };

  return (
    <div className="admin-page-content">
      {/* <div className="admin-card">
        <div className="admin-card__body">
          <div style={{ marginBottom: '1rem' }}>
            {errMsg && <div className="admin-message admin-message--error">{errMsg}</div>}
            {successful && <div className="admin-message admin-message--success">{successful}</div>}
          </div>
        </div>
      </div> */}

      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetFormState();
          closeModal();
        }}
        onSubmit={handleSubmit}
        title={editMode ? "Edit Daily Reading" : "Add Daily Reading"}
        submitText={editMode ? "Update" : "Submit"}
        size="xl"
        errorMessage={errMsg}
        fieldErrors={fieldErrors}
        onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      >
        {modelOpen && (
          <TranslationModal
            closeModal={closeModal}
            translations={translations}
            setTranslations={setTranslations}
            setLanguages={setLanguages}
            languages={languages}
          />
        )}

        <FormControl>
          <FormLabel>Ailment</FormLabel>
          <MultiSelect
            value={newReading.ailment}
            onChange={(ailmentIds) => {
              newReadingDsipatch({
                type: "ailment",
                payload: ailmentIds,
              });
            }}
          >
            {ailments.map((ailment) => (
              // Ensure option values are strings so they match the MultiSelect value array
              <option key={ailment.id} value={String(ailment.id)}>
                {ailment.name}
              </option>
            ))}
          </MultiSelect>
        </FormControl>

        <FormControl isRequired isInvalid={Boolean(fieldErrors.title)}>
          <FormLabel>Title</FormLabel>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Input
              isInvalid={Boolean(fieldErrors.title)}
              type="text"
              placeholder="Reading Title"
              value={newReading.title}
              onChange={(event) => {
                newReadingDsipatch({
                  type: "title",
                  payload: event.target.value,
                });
                setFieldErrors((prev) => ({ ...prev, title: false }));
              }}
              style={{ flex: 1 }}
            />

            <Button
              onClick={() => {
                setModelOpen(true);
              }}
              variant="primary"
              type="button"
            >
              Set Translations
            </Button>
          </div>
        </FormControl>

        <FormControl>
          <FormLabel>Send Alerts</FormLabel>
          <Select
            value={newReading.sendAlert}
            onChange={(event) => {
              newReadingDsipatch({
                type: "sendAlert",
                payload: event.target.value,
              });
            }}
          >
            <option value="0">No</option>
            <option value="1">Yes</option>
          </Select>
        </FormControl>

        {newReading.sendAlert == 1 && (
          <FormControl>
            <FormLabel>Alert Text</FormLabel>
            <Input
              type="text"
              placeholder="Alert Text for doctors"
              value={newReading.alertTextDoc}
              onChange={(event) => {
                newReadingDsipatch({
                  type: "alertTextDoc",
                  payload: event.target.value,
                });
              }}
            />
          </FormControl>
        )}

        <FormControl>
          <FormLabel>Unit</FormLabel>
          <Input
            type="text"
            placeholder="Unit"
            value={newReading.unit}
            onChange={(event) => {
              newReadingDsipatch({
                type: "unit",
                payload: event.target.value,
              });
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Type</FormLabel>
          <Select
            value={newReading.type}
            onChange={(event) => {
              newReadingDsipatch({
                type: "type",
                payload: event.target.value,
              });
            }}
          >
            {readingTypes.map((reading, index) => {
              return (
                <option key={index} value={reading}>
                  {reading}
                </option>
              );
            })}
          </Select>
        </FormControl>

        {["Int", "Decimal"].includes(newReading.type) && (
            <FormControl>
              <FormLabel>Has Range</FormLabel>
              <Select
                value={newReading.assign_range}
                onChange={(event) => {
                  newReadingDsipatch({
                    type: "assign_range",
                    payload: event.target.value,
                  });
                }}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </FormControl>
        )}
        {["Int", "Decimal"].includes(newReading.type) &&
          newReading.assign_range === "yes" ? (
          <>
            <FormControl>
              <FormLabel>Lower Range</FormLabel>
              <Input
                type="number"
                placeholder="Lower Range"
                value={newReading.lower_assign_range}
                onChange={(event) => {
                  newReadingDsipatch({
                    type: "lower_assign_range",
                    payload: event.target.value,
                  });
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Upper Range</FormLabel>
              <Input
                type="number"
                placeholder="Upper Range"
                value={newReading.upper_assign_range}
                onChange={(event) => {
                  newReadingDsipatch({
                    type: "upper_assign_range",
                    payload: event.target.value,
                  });
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Is Graph</FormLabel>
              <Select
                value={newReading.isGraph}
                onChange={(event) => {
                  // store numeric 0/1 for isGraph
                  newReadingDsipatch({
                    type: "isGraph",
                    payload: Number(event.target.value),
                  });
                }}
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </Select>
            </FormControl>
          </>
        ) : null}

        <FormControl>
          <FormLabel>Condition</FormLabel>
          <Select
            value={newReading.condition || 'stable'}
            onChange={(event) => {
              newReadingDsipatch({
                type: "condition",
                payload: event.target.value,
              });
            }}
          >
            <option value="stable">Stable</option>
            <option value="unstable">Unstable</option>
            <option value="critical">Critical</option>
          </Select>
        </FormControl>
      </FormModal>

      <DailyTable
        successful={successful}
        newReadingDsipatch={newReadingDsipatch}
        setTranslations={setTranslations}
        setEditMode={setEditMode}
        setSuccessful={setSuccessful}
        setIsFormModalOpen={setIsFormModalOpen}
        isBulkUploadModalOpen={isBulkUploadModalOpen}
        setIsBulkUploadModalOpen={setIsBulkUploadModalOpen}
        resetFormState={resetFormState}
      />

      {/* <Modal isOpen={isBulkUploadModalOpen} onClose={() => setIsBulkUploadModalOpen(false)} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <BulkUploadProof
            config={{ uploadType: 'lab' }}
            setData={setData}
            setSuccess={setSuccessful}
            success={successful}
            isOpen={isBulkUploadModalOpen}
            onClose={() => setIsBulkUploadModalOpen(false)}
          />
        </ModalContent>
      </Modal> */}
      <DailyReadingsBulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        setSuccessful={setSuccessful}
        successful={successful}
        setTranslations={setTranslations}
        languages={languages}
      />

      <ToastContainer />
    </div>
  );
}

export default DailyForm;
