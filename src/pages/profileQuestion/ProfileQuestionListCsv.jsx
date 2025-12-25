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
    <div className="bg-white md:p-6 border p-28 ml-4 mr-4 mt-4 rounded-md border-t-primary border-t-4 shadow-md">
      
      <div className="border-b-gray border-b-2 p-2 pt-4 md:pb-4 font-semibold text-primary tracking-wide text-xl">
        Upload Question
      </div>
      {/* <div className="flex gap-2 flex-row mb-3">
        <button className="text-black border mt-5 bg-gray-200 font-semibold tracking-wide text-lg border-gray-300 w-full md:w-[12vw] rounded-lg block p-1.5">
          Upload PDF
        </button>
      </div> */}
      <div>
        
      </div>
      <div>
        <CSVReader
          translations={translations}
          setTranslations={setTranslations}
          setData={setCsvData}
          setSuccess={setSuccess}
          success={success}
          languages={languages}
        />
      </div>
     
      <button
        onClick={calculate}
        className="border mt-5 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-full md:w-[12vw] rounded-lg block p-1.5">
        Submit
      </button>
      {kfre && (
        <div
          style={{
            backgroundColor: "lightblue",
            padding: "10px",
            borderRadius: "5px",
            margin: "10px 0",
          }}>
          <label
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
              display: "block",
            }}>
            Calculated KFRE:
          </label>
          {kfre}
        </div>
      )}
    </div>
  );
}

export default ProfileQuestionListCsv;
