import React, { useState, useEffect } from "react";
import CSVReader from "../../components/Dailycsv/CSVLab";
import { addDailyReading, postBulkDailyReadings } from "../../ApiCalls/readingsApis";
import { getLanguages } from "../../ApiCalls/languageApis";
import { FormModal } from "../../component-library/modals/FormModal";

function DailyReadingsBulkUploadModal({ isOpen, onClose }) {
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

    const validRows = patientData.filter((row) => row.title && row.type);
    if (validRows.length === 0) {
      alert("No valid rows to submit. Please ensure title and type are mapped.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bulkResponse = await postBulkDailyReadings(validRows);
      if (bulkResponse?.success) {
        alert(`Data Added Successfully (${validRows.length} rows)`);
        handleClose();
        return;
      }

      // Fallback to per-row submit if bulk endpoint rejects payload
      let successCount = 0;
      let failedCount = 0;

      for (const data of validRows) {
        const response = await addDailyReading(data);
        if (response?.success) {
          successCount += 1;
        } else {
          failedCount += 1;
          console.error("Failed to submit daily reading row:", data, response?.error);
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
    getLanguages().then((resultLanguage) => {
      if (resultLanguage.success && resultLanguage.data) {
        setLanguages(resultLanguage.data);
        let transaltiondict = {};
        resultLanguage.data.forEach((lang) => {
          if (lang.id !== 1) {
            transaltiondict[lang.id] = lang.language_name;
          }
        });
        setTranslations(transaltiondict);
      } else {
        console.error("Failed to fetch Languages:", resultLanguage);
      }
    });
  }, []);

  useEffect(() => {
    if (csvData) {
      const formattedData = csvData.map((row) => ({
        title: row.title,
        type: row.type,
        assign_range: row.assign_range,
        ailments: row.ailments ? row.ailments.split(",") : [],
        low_range: row.low_range,
        high_range: row.high_range,
        isGraph: row.isGraph,
        unit: row.unit,
        sendAlert: row.sendAlert,
        alertTextDoc: row.alertTextDoc,
        readingsTranslations: row.languageTranslation,
        condition: row.condition,
      }));

      setPatientData(formattedData);
      console.log("Formatted Data with Ailments Array:", formattedData);
    }
  }, [csvData]);

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
      title="Bulk Upload Daily Readings"
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

export default DailyReadingsBulkUploadModal;
