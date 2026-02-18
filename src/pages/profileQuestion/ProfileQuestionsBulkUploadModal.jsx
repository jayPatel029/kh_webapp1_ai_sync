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

  const handleSubmit = async () => {
    for (const data of patientData) {
      console.log("trying to submit: ", data);
      if (data.type && data.name && data.ailment) {
        console.log("submitting data", data);
        const response = await createQuestion(data);
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
        ailment: row.ailments ? row.ailments.split(",") : [],
        type: row.type,
        name: row.name,
        options: row.options,
        translations: row.languageTranslation,
      }));

      setPatientData(formattedData);
      console.log("Formatted Data with Ailments Array:", formattedData);
    }
  }, [success]);

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
