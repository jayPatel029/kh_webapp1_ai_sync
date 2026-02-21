import React, { useState, useEffect } from "react";
import { getPatients } from "../../ApiCalls/patientAPis";
import CSVReader from "../../components/csvlab/CSVLab";
import PdfDataExtractor from "../../components/pdfExtractor/PdfDataExtractor";
import { useParams } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { calculateAge } from "../../helpers/utils";
import { useIsMobile } from "../../components/mobile/useIsMobile";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormHelperText,
} from "../../component-library";
import { Flex, VStack, HStack, SimpleGrid, Box, Divider } from "../../component-library/layout/Layout";
import { Heading, Text } from "../../component-library/primitives/Typography";

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

  // clicking the external button should just open the file selector inside CSVReader
  const handleUploadCsv = () => {
    const input = document.querySelector('input[type=file]'); // make click on another file input element to open the file selector of CSVReader

    if (input) input.click();
    else console.warn('CSV file input element not found');
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
    <Box className={`flex-1 block w-full ${isMobile ? "pb-20" : ""}`}>

      {/* <Card variant="elevated" className={`${isMobile ? "rounded-none mx-0" : "mx-4 mt-4"}`}> */}
      {/* Mobile Header with branding */}
      {/* {isMobile && (
          <CardHeader className="border-b-4 border-accent pb-3 bg-gradient-to-r from-white to-gray-50">
            <Flex justify="between" align="center">
              <Box>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="8" r="4" fill="#0EA5E9"/>
                  <circle cx="8" cy="22" r="4" fill="#0EA5E9"/>
                  <circle cx="24" cy="22" r="4" fill="#0EA5E9"/>
                  <line x1="16" y1="12" x2="8" y2="18" stroke="#0EA5E9" strokeWidth="2"/>
                  <line x1="16" y1="12" x2="24" y2="18" stroke="#0EA5E9" strokeWidth="2"/>
                </svg>
              </Box>
              <Heading size="md" weight="bold" className="text-primary">
                Kifayti Health
              </Heading>
              <Box className="w-6" /> 
            </Flex>
          </CardHeader>
        )} */}

      {/* Desktop Header */}
      {!isMobile && (
        <CardHeader className="border-b-4 pb-4">
          <Heading size="lg" weight="bold" className="text-accent">
            KFRE Calculation
          </Heading>
        </CardHeader>
      )}

      <CardBody className={`${isMobile ? "p-3 pb-20" : "p-6"}`}>
        <VStack gap={isMobile ? 4 : 6} align="stretch">
          {/* CSV Upload Section */}
          <Box className="flex gap-6">
            <CSVReader
              setData={setCsvData}
              setSuccess={setSuccess}
              success={success}
              title={isMobile ? "Select to Upload CSV" : "Drop CSV or click here to upload"}
            />
            {!success && (
              <Button onClick={handleUploadCsv}>
                Upload CSV
              </Button>
            )}
          </Box>

          {/* Manual Entry Divider */}
          {isMobile ? (
            <Flex direction="row" justify="center" align="center">
              <Text size="sm" className="text-gray-600 font-medium">
                or Select Manually
              </Text>
            </Flex>
          ) : (
              <Heading as="h4" align="start"  className="mt-5 mb-5  font-bold">Select Manually</Heading>
          )}

          {/* Image Preview Section - Mobile */}
          {isMobile && reportimage && viewPrescription && (
            <Box className="rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                className="w-full object-cover"
                src={reportimage}
                alt="Selected Lab Report"
                style={{ maxHeight: "300px" }}
              />
            </Box>
          )}

          {/* Form Section */}
          <VStack gap={isMobile ? 3 : 4} align="stretch">
            {/* Patient Select Dropdown (Mobile-friendly) */}
            <FormControl>
              <FormLabel isRequired>Patient name</FormLabel>
              <Select
                placeholder="Select"
                value={patientData[0].selectedPatient?.value || ""}
                onChange={(e) => {
                  const selected = patientOptions.find(
                    (p) => p.value == e.target.value
                  );
                  if (selected) handleSelectChange(0, selected);
                }}
                // className="border-accent"
              >
                {patientOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Lab Report Selection */}
            {labReportData.length > 0 && (
              <FormControl>
                <FormLabel isRequired>Select lab report</FormLabel>
                <Select
                  placeholder="Select"
                  onChange={(e) => {
                    const selected = labReportData[e.target.value];
                    if (selected) {
                      setViewPrescription(true);
                      setReportimage(selected.Lab_Report);
                    }
                  }}
                // className="border-accent"
                >
                  <option value="">Select</option>
                  {labReportData.map((report, index) => (
                    <option key={index} value={index}>
                      {new Date(report.Date).toLocaleDateString()}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Unified Form Fields - Responsive Grid */}
            <SimpleGrid columns={isMobile ? 1 : 2} gap={isMobile ? 3 : 4} >
              <FormControl isRequired className="mt-6" >
                <FormLabel >GFR</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter GFR"
                  value={patientData[0].Gfr}
                  onChange={handlePatientChange(0, "Gfr")}
                  ṇ variant="outline"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel >Phosphorous</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter Phosphorous"
                  value={patientData[0].phosphorous}
                  onChange={handlePatientChange(0, "phosphorous")}
                  variant="outline"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel >Bicarbonate</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter Bicarbonate"
                  value={patientData[0].bicarbonate}
                  onChange={handlePatientChange(0, "bicarbonate")}
                  variant="outline"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel >Albumin</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter Albumin"
                  value={patientData[0].albumin}
                  onChange={handlePatientChange(0, "albumin")}
                  variant="outline"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel >Calcium</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter Calcium"
                  value={patientData[0].calcium}
                  onChange={handlePatientChange(0, "calcium")}
                  variant="outline"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel >Albumin to Creatinine Ratio</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter ACR"
                  value={patientData[0].acr}
                  onChange={handlePatientChange(0, "acr")}
                  variant="outline"
                />
              </FormControl>
            </SimpleGrid>
          </VStack>

          {/* Desktop: Image Preview and Calculate */}
          {!isMobile && viewPrescription && reportimage && (
            <Box className="p-4 bg-white border-t-4 border-accent rounded shadow-md">
              <Heading size="sm" weight="semibold" className="mb-3">
                Lab Report Preview
              </Heading>
              <Box className="max-h-80 overflow-y-auto">
                <img
                  className="w-full object-contain"
                  src={reportimage}
                  alt="Selected Lab Report"
                />
              </Box>
            </Box>
          )}
        </VStack>
      </CardBody>
      {/* </Card> */}


      {/* Mobile Calculate Button - Fixed */}
      {isMobile && (
        <Box className="fixed bottom-20 left-0 right-0 p-3 z-50 bg-white border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={calculate}
            size="lg"
            isFullWidth
            className="bg-primary hover:bg-primary/90 text-white text-base font-semibold py-3"
          >
            Calculate
          </Button>
        </Box>
      )}

      {/* Desktop Calculate Button */}
      {!isMobile && (
        <Box className="mt-6">
          <Button
            variant="secondary"
            onClick={calculate}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white"
          >
            CALCULATE
          </Button>
        </Box>
      )}

      {/* Results Display */}
      {kfre && (
        <Box
          className={`${isMobile ? "fixed bottom-40 left-3 right-3" : "mt-6 w-full md:w-96"} p-4 bg-blue-50 border-l-4 border-accent rounded`}
        >
          <Text size="sm" weight="bold" className="text-gray-700">
            Calculated KFRE:
          </Text>
          <Text size="lg" weight="bold" className="text-primary mt-1">
            {(kfre * 100).toFixed(2)}%
          </Text>
        </Box>
      )}

      {/* PDF Extractor (Desktop only) */}
      {/* {!isMobile && (
        <Box className="mt-6">
          <PdfDataExtractor setExtractedPdfData={setExtractedPdfData} />
        </Box>
      )} */}

    </Box>
  );
}

export default KfreList;
