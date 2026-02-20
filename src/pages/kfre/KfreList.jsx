import React, { useState, useEffect } from "react";
import { getPatients } from "../../ApiCalls/patientAPis";
import Select from "react-select";
import CSVReader from "../../components/csvlab/CSVLab";
import PdfDataExtractor from "../../components/pdfExtractor/PdfDataExtractor";
import { useParams } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { calculateAge } from "../../helpers/utils";
import { useIsMobile } from "../../components/mobile/useIsMobile";

function KfreList() {
  const [patients, setPatients] = useState([]);
  const [viewPrescription, setViewPrescription] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
  const [patientData, setPatientData] = useState([
    {
      selectedPatient: null,
      Gfr: "",
      acr: "",
      calcium: "",
      phosphorous: "",
      bicarbonate: "",
      albumin: "",
      gender: "",
    },
  ]);
  const [extractedPdfData, setExtractedPdfData] = useState("");
  const [countPatients, setCountPatients] = useState([1]);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [reportimage, setReportimage] = useState("");
  const [kfre, setKfre] = useState();

  const id = useParams();
  const { isMobile } = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientResult = await getPatients();
        if (patientResult.success) {
          setPatients(patientResult.data.data);
        } else {
          console.error("Failed to fetch patients:", patientResult);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchData();
  }, []);

  const patientOptions = patients.map((patient) => ({
    label: patient.name,
    value: patient.id,
    age: calculateAge(patient.dob),
    gender: patient.gender,
  }));

  const handleAddPatient = () => {
    setPatientData([
      ...patientData,
      {
        selectedPatient: null,
        Gfr: "",
        acr: "",
        calcium: "",
        phosphorous: "",
        bicarbonate: "",
        albumin: "",
        gender: "",
      },
    ]);
    setCountPatients([...countPatients, countPatients.length + 1]);
  };

  const handleRemovePatient = () => {
    if (patientData.length > 1) {
      const updatedData = patientData.slice(0, -1);
      setPatientData(updatedData);
      setCountPatients(countPatients.slice(0, -1));
    }
  };

  const handlePatientChange = (index, field) => (event) => {
    const updatedData = [...patientData];
    updatedData[index][field] = event.target.value;
    console.log("updatedData", updatedData);
    setPatientData(updatedData);
  };

  const handleSelectChange = async (index, selectedOption) => {
    const updatedData = [...patientData];
    updatedData[index].selectedPatient = selectedOption;
    updatedData[index].gender = selectedOption.gender;
    console.log("updatedData", updatedData);
    setPatientData(updatedData);

    // Fetch lab report data for the selected patient
    try {
      const response = await axiosInstance.get(
        `${server_url}/labreport/getLabReports/${selectedOption.value}`
      );
      setLabReportData(response.data.data);
      console.log("Lab Report Data:", response.data.data);
    } catch (error) {
      console.error("Error fetching lab report data:", error);
    }
  };

  const calculate = () => {
    // const result = 1 - Math.pow(0.929, Math.exp(
    //   -0.49360 * ((30 / 5) - 7.22) +
    //   0.16117 * (1 - 0.56) +
    //   0.35066 * (Math.log(50) - 5.2775) -
    //   0.19883 * ((50 / 10) - 7.04) -
    //   0.33867 * (4 - 3.99) +
    //   0.24197 * (3.8 - 3.93) -
    //   0.07429 * (26 - 25.54) -
    //   0.22129 * (9.8 - 9.35)
    // ));

    // console.log("KFRE:",result)

    patientData.forEach((data) => {
      if (
        data.selectedPatient &&
        data.Gfr &&
        data.acr &&
        data.calcium &&
        data.phosphorous &&
        data.bicarbonate &&
        data.albumin
      ) {
        const Gfr = parseFloat(data.Gfr);
        const acr = parseFloat(data.acr);
        const calcium = parseFloat(data.calcium);
        const phosphorous = parseFloat(data.phosphorous);
        const bicarbonate = parseFloat(data.bicarbonate);
        const albumin = parseFloat(data.albumin);
        const age = data.selectedPatient.age;
        const male = data.gender === "Male" ? 1 : 0;
        const result =
          1 -
          Math.pow(
            0.929,
            Math.exp(
              -0.4936 * (Gfr / 5 - 7.22) +
                0.16117 * (male - 0.56) +
                0.35066 * (Math.log(acr) - 5.2775) -
                0.19883 * (age / 10 - 7.04) -
                0.33867 * (albumin - 3.99) +
                0.24197 * (phosphorous - 3.93) -
                0.07429 * (bicarbonate - 25.54) -
                0.22129 * (calcium - 9.35)
            )
          );
        setKfre(result);
        // console.log(`Patient ID: ${data.selectedPatient.label}, KFRE Result: ${result}`);
      } else {
        console.error("All fields are required for calculation.");
      }
    });
  };

  const formatCSVData = (csvData, patientOptions) => {
    // Filter out empty objects and remove patientId field

    const filteredData = csvData.filter(
      (item) => Object.keys(item).length > 1 && item.patientId !== null
    );

    // Map the filtered data to the required format
    const formattedData = filteredData.map((item) => {
      const patient = patientOptions.find(
        (patient) => patient.value == item.patientId
      );
      const patientName = patient ? patient.label : `Patient ${item.patientId}`;

      console.log(item.patientId, patientOptions[0].value);

      return {
        selectedPatient: { value: item.patientId, label: patientName },
        Gfr: item.gfr,
        calcium: item.calcium,
        acr: item.acr,
        phosphorous: item.phosphorous,
        bicarbonate: item.bicarbonate,
        albumin: item.albumin,
      };
    });

    return formattedData;
  };

  useEffect(() => {
    // console.log('================================');
    // console.log(patientOptions)
    // console.log(patientData)
    if (csvData) {
      const formattedData = formatCSVData(csvData, patientOptions);
      setPatientData(formattedData);
      console.log("Formatted Data from KFRE List:", formattedData);
    }
  }, [success]);

  useEffect(() => {
    if (extractedPdfData) {
      console.log("Extracted PDF Data:", extractedPdfData);

      // Example: Regular expressions to extract values from the text
      const gfrMatch = extractedPdfData.match(/GFR:\s*(\d+(\.\d+)?)/i);
      const acrMatch = extractedPdfData.match(/ACR:\s*(\d+(\.\d+)?)/i);
      const calciumMatch = extractedPdfData.match(/Calcium:\s*(\d+(\.\d+)?)/i);
      const phosphorousMatch = extractedPdfData.match(
        /Phosphorous:\s*(\d+(\.\d+)?)/i
      );
      const bicarbonateMatch = extractedPdfData.match(
        /Bicarbonate:\s*(\d+(\.\d+)?)/i
      );
      const albuminMatch = extractedPdfData.match(/Albumin:\s*(\d+(\.\d+)?)/i);

      // Assume we are updating the first patient in the list (index 0)
      const updatedData = [...patientData];

      if (gfrMatch) updatedData[0].Gfr = gfrMatch[1];
      if (acrMatch) updatedData[0].acr = acrMatch[1];
      if (calciumMatch) updatedData[0].calcium = calciumMatch[1];
      if (phosphorousMatch) updatedData[0].phosphorous = phosphorousMatch[1];
      if (bicarbonateMatch) updatedData[0].bicarbonate = bicarbonateMatch[1];
      if (albuminMatch) updatedData[0].albumin = albuminMatch[1];

      setPatientData(updatedData);
    }
  }, [extractedPdfData]);

  return (
    <div className={`bg-white border rounded-md border-t-primary border-t-4 shadow-md ${isMobile ? 'p-3' : 'md:p-6 p-2'}`}>
      <div className={`border-b-gray border-b-2 p-2 pt-4 font-semibold text-primary tracking-wide ${isMobile ? 'text-lg pb-2' : 'md:pb-4 text-xl'}`}>
        KFRE Calculation
      </div>
      {/* <div className="flex gap-2 flex-row mb-3">
        <button className="text-black border mt-5 bg-gray-200 font-semibold tracking-wide text-lg border-gray-300 w-full md:w-[12vw] rounded-lg block p-1.5">
          Upload PDF
        </button>
      </div> */}
      <div>
        <PdfDataExtractor setExtractedPdfData={setExtractedPdfData} />
      </div>
      <div>
        <CSVReader
          setData={setCsvData}
          setSuccess={setSuccess}
          success={success}
        />
      </div>
      <div className="text-center text-gray-600 text-sm mb-2">Or</div>
      <div className="text-center text-lg font-semibold mb-4">Add manually</div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-4/6 p-2">
          <div className="block mb-1 text-xs font-medium text-gray-500 pt-3">
            <label className="block mb-1 text-xs font-medium text-gray-500">
              Patient*
            </label>
            <Select
              placeholder="Name"
              options={patientOptions}
              onChange={(selectedOption) =>
                handleSelectChange(0, selectedOption)
              }
              className="text-gray-500 text-xs rounded-lg block focus:outline-primary"
            />
          </div>

          <div className="my-1">
            <label className="text-xs font-medium text-gray-500">
              Select Lab Report*
            </label>
            <table className="w-full text-xs text-left rtl:text-right text-gray-800">
              <thead className="text-xs text-gray-700 border-b border-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2">
                    Image
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Select
                  </th>
                </tr>
              </thead>
              <tbody>
                {labReportData.map((report, index) => (
                  <tr key={index} className="my-2">
                    <td className="px-3 py-2">
                      <img
                        src={report.Lab_Report}
                        alt="Lab report"
                        className="inline h-8 w-8 md:h-12 md:w-12 mx-2"
                      />
                    </td>
                    <td className="px-3 py-2">
                      {new Date(report.Date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="radio"
                        name="prescription"
                        onChange={() => {
                          setViewPrescription(true);
                          setReportimage(report.Lab_Report);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block md:flex flex-wrap p-2 space-x-3  mb-1 space-y-2  md:space-y-0 md:space-x-1">
            <div className="w-full md:w-1/3">
              <label className="block mb-1 text-xs font-medium text-gray-500">
                GFR
              </label>
              <input
                type="number"
                placeholder="GFR"
                className="border border-gray-300 text-gray-500 text-xs rounded-lg block w-full p-1.5 focus:outline-primary"
                value={patientData[0].Gfr}
                onChange={handlePatientChange(0, "Gfr")}
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block mb-1 text-xs font-medium text-gray-500">
                Phosphorous
              </label>
              <input
                type="number"
                placeholder="Phosphorous"
                className="border border-gray-300 text-gray-500 text-xs rounded-lg block w-full p-1.5 focus:outline-primary"
                value={patientData[0].phosphorous}
                onChange={handlePatientChange(0, "phosphorous")}
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block mb-1 text-xs font-medium text-gray-500">
                Bicarbonate
              </label>
              <input
                type="number"
                placeholder="Bicarbonate"
                className="border border-gray-300 text-gray-500 text-xs rounded-lg block w-full p-1.5 focus:outline-primary"
                value={patientData[0].bicarbonate}
                onChange={handlePatientChange(0, "bicarbonate")}
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block mb-1 text-xs font-medium text-gray-500">
                Albumin
              </label>
              <input
                type="number"
                placeholder="Albumin"
                className="border border-gray-300 text-gray-500 text-xs rounded-lg block w-full p-1.5 focus:outline-primary"
                value={patientData[0].albumin}
                onChange={handlePatientChange(0, "albumin")}
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block mb-1 text-xs font-medium text-gray-500">
                Calcium
              </label>
              <input
                type="number"
                placeholder="Calcium"
                className="border border-gray-300 text-gray-500 text-xs rounded-lg block w-full p-1.5 focus:outline-primary"
                value={patientData[0].calcium}
                onChange={handlePatientChange(0, "calcium")}
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block mb-1 text-xs font-medium text-gray-500">
                Albumin to Creatinine Ratio
              </label>
              <input
                type="number"
                placeholder="ACR"
                className="border border-gray-300 text-gray-500 text-xs rounded-lg block w-full p-1.5 focus:outline-primary"
                value={patientData[0].acr}
                onChange={handlePatientChange(0, "acr")}
              />
            </div>
          </div>
        </div>
        {viewPrescription && (
          <div className="p-3 mt-2 bg-white shadow-md border-t-4 md:w-1/2 rounded z-50 overflow-y-auto max-h-80 md:max-h-full">
            <img
              className="w-full object-contain"
              src={reportimage}
              alt="Selected Lab Report"
            />
          </div>
        )}
      </div>
      <button
        onClick={calculate}
        className={`border mt-5 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 rounded-lg block p-1.5 ${isMobile ? 'w-full' : 'w-full md:w-[12vw]'}`}>
        CALCULATE
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

export default KfreList;
