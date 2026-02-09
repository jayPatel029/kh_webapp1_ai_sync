import React, { useState, useEffect } from "react";

import CSVReader from "../../components/csvProfile/CSVProfile";
import { Link, useParams } from "react-router-dom";

import { calculateAge } from "../../helpers/utils";
import {  addDialysisReading } from "../../ApiCalls/readingsApis";
import { createQuestion } from "../../ApiCalls/questionApis";

import { getLanguages } from "../../ApiCalls/languageApis";

function ProfileQuestionListCsv() {
  const [patients, setPatients] = useState([]);
  const [viewPrescription, setViewPrescription] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
  const [patientData, setPatientData] = useState([
    {
      
      ailment:[],
      type:"",
      name:"",
      options:"",
        
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
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);



  const patientOptions = patients.map((patient) => ({
    label: patient.name,
    value: patient.id,
    age: calculateAge(patient.dob),
    gender: patient.gender,
  }));


  const calculate = async () => {
    for (const data of patientData) { // Use for...of instead of forEach
      console.log("trying to submit: ",data);
      if (data.type && data.name && data.ailment) {
       console.log("ygwdu",data)
        const response = await  createQuestion(data);
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
        ailment: row.ailments ? row.ailments.split(",") : [], // 
        type: row.type,
        name: row.name,
        options: row.options,
        translations: row.languageTranslation,
        // hindi: row.Hindi,
        // hindiOpt: row.HindiOpt
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
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__header-title">Upload Question</h2>
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
          <div className="admin-message admin-message--warning" style={{ marginTop: '1rem' }}>
            <strong>Calculated KFRE: </strong> {kfre}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileQuestionListCsv;
