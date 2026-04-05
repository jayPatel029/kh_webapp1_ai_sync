import React, { useState, useEffect } from "react";
import CSVReader from "../../components/Dailycsv/CSVLab";
import { Link } from "react-router-dom";
import { addDailyReading, postBulkDailyReadings } from "../../ApiCalls/readingsApis";
import { getLanguages } from "../../ApiCalls/languageApis";
import { FormModal } from "../../component-library/modals/FormModal";

function DailyquestionCsv() {
  const [patientData, setPatientData] = useState([]);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [kfre, setKfre] = useState();
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculate = async () => {
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
        return;
      }

      // Fallback to per-row submission
      let successCount = 0;
      let failedCount = 0;
      for (const row of validRows) {
        const response = await addDailyReading(row);
        if (response?.success) {
          successCount += 1;
        } else {
          failedCount += 1;
          console.error("Failed to submit row", row, response?.error);
        }
      }

      if (failedCount === 0) {
        alert(`Data Added Successfully (${successCount} rows)`);
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
        console.log("tran", transaltiondict);
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
  }, [csvData]);

  return (
    <div className="admin-page-content">
      <div className="admin-card">
        <div className="admin-card__body">
          <div className="admin-toolbar">
            <div className="admin-toolbar__left">
              <h3 style={{ margin: 0, fontWeight: 600, color: '#111827' }}>Bulk Upload Daily Readings</h3>
            </div>
            <div className="admin-toolbar__right" style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn--primary" onClick={() => setIsUploadModalOpen(true)}>
                Open Bulk Upload
              </button>
              <Link
                to="/readings/daily"
                className="admin-btn admin-btn--secondary"
                style={{ textDecoration: 'none' }}
              >
                Back
              </Link>
            </div>
          </div>

          {kfre && (
            <div
              className="admin-message admin-message--info"
              style={{ marginTop: "1rem" }}
            >
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
    </div>
  );
}

export default DailyquestionCsv;

