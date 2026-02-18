import React, { useState, useEffect } from "react";
import CSVReader from "../../components/Dailycsv/CSVLab";
import { addDialysisReading } from "../../ApiCalls/readingsApis";
import { getLanguages } from "../../ApiCalls/languageApis";
import { FormModal } from "../../component-library/modals/FormModal";

function DialysisReadingsBulkUploadModal({ isOpen, onClose }) {
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async () => {
    for (const data of patientData) {
      if (data.title && data.type && data.assign_range && data.ailments) {
        const response = await addDialysisReading(data);
        console.log("response", response);
      } else {
        console.error("All fields are required for submission.");
      }
    }
    alert("Data Added Successfully");
    onClose();
  };

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
  }, [success]);

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
      title="Bulk Upload Dialysis Readings"
      submitText="Submit"
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

export default DialysisReadingsBulkUploadModal;
