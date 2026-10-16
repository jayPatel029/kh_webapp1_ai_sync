import React, { useEffect, useState, useReducer } from "react";
import { newQuestionReducer } from "./reducers";
import {
  addDialysisReading,
  updateDialysisReading,
} from "../../../ApiCalls/readingsApis";
import { getAilments } from "../../../ApiCalls/ailmentApis";
import DialysisTable from "./Dialysis_Table";
import { readingTypes } from "../../../constants/ReadingConstants";
import { getLanguages } from "../../../ApiCalls/languageApis";
import TranslationModal from "../../../components/modals/TranslationModel";
import { se } from "date-fns/locale";
import { Link } from "react-router-dom";
import { FormModal } from "../../../component-library/modals/FormModal";
import DialysisReadingsBulkUploadModal from "../DialysisReadingsBulkUploadModal";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  MultiSelect,
  Button
} from "../../../component-library";
import RefreshButton from "../../../components/RefreshButton/RefreshButton";
import { usePageCache, PAGE_CACHE } from "../../../cache";
import { useAdminToast } from "../../../components/AdminToast";

function DialysisReadingsList() {
  const [editMode, setEditMode] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [modelOpen, setModelOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [translations, setTranslations] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const { showToast, ToastContainer } = useAdminToast();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.DIALYSIS_READINGS);

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
    alertTextDoc: "",
    sendAlert: 0,
    condition: "",
  });

  const [ailments, setAilments] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchWithCache('ailments', () => getAilments()).then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            console.log("listofailments", resultAilment.data.listOfAilments);
            const filteredAilments = resultAilment.data.listOfAilments.filter((a) => a.name.includes("Dialysis"));
            console.log("filtered for dialysis", filteredAilments);
            setAilments(filteredAilments);


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
        console.error("Error fetching questions:", error);
      }
    };

    fetchData();
  }, [refreshKey]);

  const resolveAilmentIds = () =>
    (Array.isArray(newReading.ailment) ? newReading.ailment : [])
      .map((item) => (item && typeof item === "object" ? item.value ?? item.id : item))
      .map((id) => String(id))
      .filter(Boolean);

  // Backend add looks up ailments by name; update expects ailment IDs.
  const resolveAilmentsForApi = (forUpdate) => {
    const ids = resolveAilmentIds();
    if (forUpdate) {
      return ids.map(Number).filter((id) => Number.isInteger(id) && id > 0);
    }
    return ids
      .map((id) => ailments.find((a) => String(a.id) === String(id))?.name)
      .filter(Boolean);
  };

  function validateForm() {
    const errors = {};
    if (newReading.title.trim() === "") errors.title = true;
    if (resolveAilmentIds().length === 0) errors.ailment = true;
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
      if (!validateForm()) {
        setErrMsg("Please fill all the fields!");
        setSuccessful("");
        return;
      }

      const ailmentsPayload = resolveAilmentsForApi(editMode);
      if (ailmentsPayload.length === 0) {
        setFieldErrors((prev) => ({ ...prev, ailment: true }));
        setErrMsg("Please select at least one valid ailment");
        return;
      }

      const payload = {
        id: newReading.id,
        title: newReading.title,
        ailments: ailmentsPayload,
        type: newReading.type,
        assign_range: newReading.assign_range,
        low_range: newReading.lower_assign_range,
        high_range: newReading.upper_assign_range,
        isGraph: Number(newReading.isGraph),
        readingsTranslations: translations,
        alertTextDoc: newReading.alertTextDoc,
        unit: newReading.unit,
        sendAlert: newReading.sendAlert,
        condition: newReading.condition || "stable",
      };

      if (!editMode) {
        const response = await mutate(() => addDialysisReading(payload));
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
          showToast("Dialysis reading created successfully!", "success");
          setIsFormModalOpen(false);
          newReadingDsipatch({
            type: "all",
            payload: {},
          });
        } else {
          setErrMsg("Error Creating Reading: " + (response.error || response.data || "Unknown error"));
          setSuccessful("");
        }
      } else {
        const response = await mutate(() => updateDialysisReading(payload));
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
          showToast("Dialysis reading updated successfully!", "success");
          setIsFormModalOpen(false);
          newReadingDsipatch({
            type: "all",
            payload: {},
          });
        } else {
          setErrMsg("Error Updating Reading: " + (response.error || response.data || "Unknown error"));
          setSuccessful("");
        }
      }
    } catch (error) {
      console.error("Error in dialysis readings submit:", error);
      const msg = error?.response?.data || error?.message || "An unexpected error occurred. Please try again.";
      const text = typeof msg === "string" ? msg : msg?.message || "Request failed";
      setErrMsg(String(text).includes("Network") ? "Network error — please check your connection." : String(text));
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
      <div className="admin-card__body">
        <div style={{ marginBottom: '1rem' }}>
          {errMsg && <div className="admin-message admin-message--error">{errMsg}</div>}
          {successful && <div className="admin-message admin-message--success">{successful}</div>}
        </div>
      </div>

      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetFormState();
          closeModal();
        }}
        onSubmit={handleSubmit}
        title={editMode ? "Edit Dialysis Reading" : "Add Dialysis Reading"}
        submitText={editMode ? "Update" : "Submit"}
        size="xl"
        errorMessage={errMsg}
        fieldErrors={fieldErrors}
        onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
        bodyStyle={{ overflowY: "visible", overflowX: "visible" }}
      >
        {modelOpen && (
          <TranslationModal
            isOpen={modelOpen}
            closeModal={closeModal}
            translations={translations}
            setTranslations={setTranslations}
            setLanguages={setLanguages}
            languages={languages}
            defaultText={newReading.title}
          />
        )}

        <FormControl isRequired isInvalid={Boolean(fieldErrors.ailment)}>
          <FormLabel>Ailment *</FormLabel>
          <MultiSelect
            value={newReading.ailment}
            onChange={(ailmentIds) => {
              newReadingDsipatch({
                type: "ailment",
                payload: ailmentIds,
              });
              setFieldErrors((prev) => ({ ...prev, ailment: false }));
            }}
          >
            {ailments.map((ailment, index) => {
              return (
                // Ensure option values are strings so they match the MultiSelect value array
                <option key={index} value={String(ailment.id)}>
                  {ailment.name}
                </option>
              );
            })}
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
          newReading.assign_range === "yes" && (
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
          </>
        )}

        {["Int", "Decimal"].includes(newReading.type) && (
          <FormControl>
            <FormLabel>Is Graph</FormLabel>
            <Select
              value={String(newReading.isGraph ?? 0)}
              onChange={(event) => {
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
        )}

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

      <DialysisTable
        successful={successful}
        newReadingDsipatch={newReadingDsipatch}
        setTranslations={setTranslations}
        setEditMode={setEditMode}
        setSuccessful={setSuccessful}
        setIsFormModalOpen={setIsFormModalOpen}
        resetFormState={resetFormState}
        setIsBulkUploadModalOpen={setIsBulkUploadModalOpen}
      />
      <DialysisReadingsBulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => {
          setIsBulkUploadModalOpen(false);
          setSuccessful("Bulk upload completed successfully!");
        }}
      />
      <ToastContainer />
    </div>
  );
}

export default DialysisReadingsList;
