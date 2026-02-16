import React, { useState, useEffect } from "react";

import CSVReader from "../../components/Dailycsv/CSVLab";
import { Link } from "react-router-dom";

import { addDialysisReading } from "../../ApiCalls/readingsApis";
import { getLanguages } from "../../ApiCalls/languageApis";
import { FormModal } from "../../component-library/modals/FormModal";

function DailyquestionCsv() {
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [kfre, setKfre] = useState();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
        console.log("tran", transaltiondict);
        setTranslations(transaltiondict);
      } else {
        console.error("Failed to fetch Languages:", resultLanguage);
      }
    });
  }, []);

  const calculate = async () => {
    for (const data of patientData) {
      if (data.title && data.type && data.assign_range && data.ailments) {
        console.log("typeof", typeof (data.ailments))
        console.log("ygwdu", data)

        const response = await addDialysisReading(data);
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
        title: row.title,
        type: row.type,
        assign_range: row.assign_range,
        ailments: row.ailments ? row.ailments.split(",") : [], // Convert ailments text to an array
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

  return (
    <div className="admin-page-content">
      <div className="admin-card">
        <div className="admin-card__body">
          <div className="admin-toolbar">
            <div className="admin-toolbar__left">
              <h3 style={{ margin: 0, fontWeight: 600, color: '#111827' }}>Bulk Upload Dialysis Readings</h3>
            </div>
            <div className="admin-toolbar__right" style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn--primary" onClick={() => setIsUploadModalOpen(true)}>
                Open Bulk Upload
              </button>
              <Link
                to="/dialysisReadings"
                className="admin-btn admin-btn--secondary"
                style={{ textDecoration: 'none' }}
              >
                Back
              </Link>
            </div>
          </div>

          {kfre && (
            <div className="admin-message admin-message--info" style={{ marginTop: '1rem' }}>
              <label className="font-bold block mb-1">
                Calculated KFRE:
              </label>
              {kfre}
            </div>
          )}
        </div>
      </div>

      <FormModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={calculate}
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
    </div>
  );
}

export default DailyquestionCsv;
