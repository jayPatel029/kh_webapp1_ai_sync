import React, { useState, useEffect } from "react";
import { getPatients,getPatientById } from "../../ApiCalls/patientAPis";
import Select from "react-select";
import CSVReader from "../../components/Dailycsv/CSVLab";
import PdfDataExtractor from "../../components/pdfExtractor/PdfDataExtractor";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { calculateAge } from "../../helpers/utils";
import { addDailyReading } from "../../ApiCalls/readingsApis";
import { getLanguages } from "../../ApiCalls/languageApis";


function DailyquestionCsv() {
  const [patients, setPatients] = useState([]);
  const [viewPrescription, setViewPrescription] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
    const [languages, setLanguages] = useState([]);
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
 const [translations, setTranslations] = useState({});


  const patientOptions = patients.map((patient) => ({
    label: patient.name,
    value: patient.id,
    age: calculateAge(patient.dob),
    gender: patient.gender,
  }));


  const calculate = async () => {
    for (const data of patientData) { // Use for...of instead of forEach
      if (data.title && data.type
      ) {
        console.log("typeof",typeof(data.ailments))
       console.log("adding this to daily param",data)
        
         const response = await addDailyReading(data);
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

export default DailyquestionCsv;
