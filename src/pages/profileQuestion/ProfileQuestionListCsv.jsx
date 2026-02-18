import React, { useState, useEffect } from "react";

import CSVReader from "../../components/csvProfile/CSVProfile";
import { Link } from "react-router-dom";

import { createQuestion } from "../../ApiCalls/questionApis";

import { getLanguages } from "../../ApiCalls/languageApis";
import { FormModal } from "../../component-library/modals/FormModal";

function ProfileQuestionListCsv() {
  const [patientData, setPatientData] = useState([]);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [kfre, setKfre] = useState();
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const calculate = async () => {
    for (const data of patientData) {
      console.log("trying to submit: ", data);
      if (data.type && data.name && data.ailment) {
        console.log("ygwdu", data)
        const response = await createQuestion(data);
        console.log("response", response)
      } else {
        console.error("All fields are required for calculation.");
      }
    }
    alert("Data Added Successfully")
  };

  useEffect(() => {
    if (csvData) {
      const formattedData = csvData.map((row) => ({
        ailment: row.ailments ? row.ailments.split(",") : [], // 
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

  return (
    <div className="admin-page-content">
      <div className="admin-card">
        <div className="admin-card__body">
          <div className="admin-toolbar">
            <div className="admin-toolbar__left">
              <h3 style={{ margin: 0, fontWeight: 600, color: '#111827' }}>Bulk Upload Profile Questions</h3>
            </div>
            <div className="admin-toolbar__right" style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn--primary" onClick={() => setIsUploadModalOpen(true)}>
                Open Bulk Upload
              </button>
              <Link
                to="/profile-questions"
                className="admin-btn admin-btn--secondary"
                style={{ textDecoration: 'none' }}
              >
                Back
              </Link>
            </div>
          </div>

          {kfre && (
            <div className="admin-message admin-message--warning" style={{ marginTop: '1rem' }}>
              <strong>Calculated KFRE: </strong> {kfre}
            </div>
          )}
        </div>
      </div>

      <FormModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={calculate}
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
    </div>
  );
}

export default ProfileQuestionListCsv;

