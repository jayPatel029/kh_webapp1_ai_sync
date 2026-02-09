import React, { useState, useEffect } from "react";
import { getPatients, getPatientById } from "../../ApiCalls/patientAPis";
import Select from "react-select";
import CSVReader from "../../components/Dailycsv/CSVLab";
import PdfDataExtractor from "../../components/pdfExtractor/PdfDataExtractor";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { calculateAge } from "../../helpers/utils";
import { addDailyReading } from "../../ApiCalls/readingsApis";
import { getLanguages } from "../../ApiCalls/languageApis";
import {
  Box,
  Container
} from "../../component-library";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";

function DailyquestionCsv() {
  const [patients, setPatients] = useState([]);
  const [viewPrescription, setViewPrescription] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [patientData, setPatientData] = useState([
    {
      title: "",
      type: "",
      assign_range: "",
      ailments: [],
      low_range: "",
      high_range: "",
      isGraph: "",
      unit: "",
      sendAlert: "",
      alertTextDoc: "",
      condition: "",
    },
  ]);
  const [extractedPdfData, setExtractedPdfData] = useState("");
  const [countPatients, setCountPatients] = useState([1]);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [reportimage, setReportimage] = useState("");
  const [kfre, setKfre] = useState();
  const [lab_id, setLab_id] = useState();
  const id = useParams();
  const [translations, setTranslations] = useState({});

  const patientOptions = patients.map((patient) => ({
    label: patient.name,
    value: patient.id,
    age: calculateAge(patient.dob),
    gender: patient.gender,
  }));

  const calculate = async () => {
    for (const data of patientData) {
      if (data.title && data.type) {
        console.log("typeof", typeof data.ailments);
        console.log("adding this to daily param", data);

        const response = await addDailyReading(data);
        console.log("response", response);
        // Optional logging
        // console.log(`Patient ID: ${data.selectedPatient.label}, KFRE Result: ${result}`);
      } else {
        console.error("All fields are required for calculation.");
      }
    }
    alert("Data Added Successfully");
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
  }, [success]);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 max-w-[1440px] mx-auto">
            <PageHeader
              title="Bulk Upload Daily Readings"
              breadcrumbs={[
                { label: "Dashboard", path: "/admin" },
                { label: "Daily Readings", path: "/dailyReadings" },
                { label: "Bulk Upload", active: true },
              ]}
            />
          </Container>
        </Box>

        <div className="admin-page">
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__header-title">Upload Questions</h2>
            </div>
            <div className="admin-card__body">
              <CSVReader
                translations={translations}
                setTranslations={setTranslations}
                setData={setCsvData}
                setSuccess={setSuccess}
                success={success}
                languages={languages}
              />

              <div style={{ marginTop: "1.5rem" }}>
                <button
                  onClick={calculate}
                  className="admin-btn admin-btn--primary"
                >
                  Submit
                </button>
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
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default DailyquestionCsv;
