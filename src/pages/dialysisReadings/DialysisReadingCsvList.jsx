import React, { useState, useEffect } from "react";

import CSVReader from "../../components/Dailycsv/CSVLab";
import { Link, useParams } from "react-router-dom";

import { calculateAge } from "../../helpers/utils";
import {  addDialysisReading } from "../../ApiCalls/readingsApis";
import { getLanguages } from "../../ApiCalls/languageApis";

function DailyquestionCsv() {
  const [patients, setPatients] = useState([]); const [translations, setTranslations] = useState({});
  const [viewPrescription, setViewPrescription] = useState(false);
  const [labReportData, setLabReportData] = useState([]); const [languages, setLanguages] = useState([]);
  const [patientData, setPatientData] = useState([
    {
      
      title: "",
      type: "",
      assign_range:"",
      ailments:[],
      low_range: "",
      high_range: "",
      isGraph:"",
      unit:"",
      sendAlert:"",
      alertTextDoc:"",
      condition: "",
    },
  ]);
  const [extractedPdfData, setExtractedPdfData] = useState("");
  const [countPatients, setCountPatients] = useState([1]);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [reportimage, setReportimage] = useState("");
  const [kfre, setKfre] = useState();
  const [lab_id,setLab_id]=useState();
  const id = useParams();



  const patientOptions = patients.map((patient) => ({
    label: patient.name,
    value: patient.id,
    age: calculateAge(patient.dob),
    gender: patient.gender,
  }));

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
            console.log("tran",transaltiondict);
            setTranslations(transaltiondict);
          } else {
            console.error("Failed to fetch Languages:", resultLanguage);
          }
        });
}, []);

  const calculate = async () => {
    for (const data of patientData) { // Use for...of instead of forEach
      if (data.title && data.type && data.assign_range && data.ailments
      ) {
        console.log("typeof",typeof(data.ailments))
       console.log("ygwdu",data)
        
         const response = await addDialysisReading(data);
        console.log("response",response)
        // Optional logging
        // console.log(`Patient ID: ${data.selectedPatient.label}, KFRE Result: ${result}`);
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
        
        <div style={{ marginTop: '1.5rem' }}>
          <button
            onClick={calculate}
            className="admin-btn admin-btn--primary"
          >
            Submit
          </button>
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
  );
}

export default DailyquestionCsv;
