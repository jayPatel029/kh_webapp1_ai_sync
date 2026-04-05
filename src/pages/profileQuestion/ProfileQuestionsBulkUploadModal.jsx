import React, { useState, useEffect } from "react";
import CSVReader from "../../components/csvProfile/CSVProfile";
import { createQuestion } from "../../ApiCalls/questionApis";
import { getLanguages } from "../../ApiCalls/languageApis";
import { FormModal } from "../../component-library/modals/FormModal";

function ProfileQuestionsBulkUploadModal({ isOpen, onClose }) {
  const [patientData, setPatientData] = useState([]);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!patientData || patientData.length === 0) {
      alert("No mapped data found. Please click 'Submit Edited' inside the CSV section first.");
      return;
    }

    const validRows = patientData.filter((row) => row.type && row.name && row.ailment);
    if (validRows.length === 0) {
      alert("No valid rows to submit. Please ensure required columns are mapped.");
      return;
    }

    setIsSubmitting(true);
    try {
      let successCount = 0;
      let failedCount = 0;

      for (const data of validRows) {
        const response = await createQuestion(data);
        if (response?.success) {
          successCount += 1;
        } else {
          failedCount += 1;
          console.error("Failed to submit question row:", data, response?.error);
        }
      }

      if (failedCount === 0) {
        alert(`Data Added Successfully (${successCount} rows)`);
        handleClose();
      } else {
        alert(`Submitted ${successCount} rows, failed ${failedCount} rows. Check console for details.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (csvData) {
      const formattedData = csvData.map((row) => ({
        ailment: row.ailments ? row.ailments.split(",") : [],
        type: row.type,
        name: row.name,
        options: row.options,
        translations: row.languageTranslation,
      }));

      setPatientData(formattedData);
      console.log("Formatted Data with Ailments Array:", formattedData);
    }
  }, [csvData]);

  useEffect(() => {
    getLanguages().then((resultLanguage) => {
      if (resultLanguage.success && resultLanguage.data) {
        setLanguages(resultLanguage.data);

        let translationDict = {};
        resultLanguage.data.forEach((lang) => {
          if (lang.id !== 1) {
            translationDict[lang.id] = "";
          }
        });

        console.log("Translation Dict:", translationDict);
        setTranslations(translationDict);
      } else {
        console.error("Failed to fetch Languages:", resultLanguage);
      }
    });
  }, []);

  const handleClose = () => {
    setCsvData(null);
    setSuccess(false);
    setPatientData([]);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Bulk Upload Profile Questions"
      submitText="Submit"
      isLoading={isSubmitting}
      size="xl"
    >
      <CSVReader
        translations={translations}
        setTranslations={setTranslations}
        setData={setCsvData}
        setSuccess={setSuccess}
        success={success}
        languages={languages}
      />
    </FormModal>
  );
}

export default ProfileQuestionsBulkUploadModal;
