import React, { useState, useEffect } from "react";
import { getPatients, getPatientById } from "../../ApiCalls/patientAPis";
import CSVReader from "../../components/csvlab/CSVLab";
import PdfDataExtractor from "../../components/pdfExtractor/PdfDataExtractor";
import { Link, useParams } from "react-router-dom";
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
  FormControl,
  FormLabel,
} from "../../component-library";
import { Flex, VStack, HStack, SimpleGrid, Box, Divider } from "../../component-library/layout/Layout";
import { Heading, Text } from "../../component-library/primitives/Typography";


function KfreSingleList() {
  const [patients, setPatients] = useState([]);
  const [viewPrescription, setViewPrescription] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
  const [patientData, setPatientData] = useState([
    {
      selectedPatient: null,
      eGFR: "",
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
  const [lab_id,setLab_id]=useState();
  const id = useParams();
  const { isMobile } = useIsMobile();

  useEffect(() => {
    console.log("ID:", id.id);
    const fetchData = async () => {
      try {
        try {
      const response = await axiosInstance.get(
        `${server_url}/labreport/getLabReports/${id.id}`
      );
      setLabReportData(response.data.data);
      console.log("Lab Report Data:", response.data.data);
    } catch (error) {
      console.error("Error fetching lab report data:", error);
    }
        const patientResult = await getPatientById(id.id);
        if (patientResult.success) {
            console.log("Patient Data:", patientResult.data.data);
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

  const uploadData = async (result,data) => {
    try {
      const response = axiosInstance.post(server_url+"/patientdata/kfredetails", {
        patient_id: id.id,  // Assuming selectedPatient has 'value' property for patient ID
        eGFR: data.eGFR,
        Phosphorous: data.phosphorous,
        Bicarbonate: data.bicarbonate,
        Albumin: data.albumin,
        Calcium: data.calcium,
        Albumin_to_Creatinine_Ratio: data.acr,
        lab_id: lab_id>0?lab_id:null,  // Assuming lab_id exists in the data
        kfre: result,
      });

      if (response) {
        console.log("KFRE details successfully updated");
      } else {
        console.error("Error updating KFRE details", response.data.error);
      }
    } catch (error) {
      console.error("Error while submitting KFRE details to backend:", error);
    }
  
  }

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

  const calculate = async () => {
    for (const data of patientData) { // Use for...of instead of forEach
      if (
        
        data.eGFR &&
        data.acr &&
        data.calcium &&
        data.phosphorous &&
        data.bicarbonate &&
        data.albumin
      ) {
        const eGFR = parseFloat(data.eGFR);
        const acr = parseFloat(data.acr);
        const calcium = parseFloat(data.calcium);
        const phosphorous = parseFloat(data.phosphorous);
        const bicarbonate = parseFloat(data.bicarbonate);
        const albumin = parseFloat(data.albumin);
        const age = calculateAge(patients[0].dob);
        const male = patients[0].gender === "Male" ? 1 : 0;
        const result =
          1 -
          Math.pow(
            0.929,
            Math.exp(
              -0.4936 * (eGFR/ 5 - 7.22) +
                0.16117 * (male - 0.56) +
                0.35066 * (Math.log(acr) - 5.2775) -
                0.19883 * (age / 10 - 7.04) -
                0.33867 * (albumin - 3.99) +
                0.24197 * (phosphorous - 3.93) -
                0.07429 * (bicarbonate - 25.54) -
                0.22129 * (calcium - 9.35)
            )
          );
        setKfre(result); // Update KFRE state
  
        // Await uploadData as it's an async function
        await uploadData(result,data);
        
        // Optional logging
        // console.log(`Patient ID: ${data.selectedPatient.label}, KFRE Result: ${result}`);
      } else {
        console.error("All fields are required for calculation.");
      }
    }
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
        selectedPatient: { value: id.id , label: patientName },
        eGFR: item.eGFR,
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
    <Box className={`flex-1 block w-full ${isMobile ? "pb-20" : ""}`}>
      <Card variant="elevated" className={`${isMobile ? "rounded-none mx-0" : "mx-4 mt-4"}`}>
        {/* Mobile Header with branding */}
        {isMobile && (
          <CardHeader className="border-b-4 border-primary pb-3 bg-gradient-to-r from-white to-gray-50">
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
              <Box className="w-6" /> {/* Spacer */}
            </Flex>
          </CardHeader>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <CardHeader className="border-b-4 border-primary pb-4">
            <Flex justify="start" align="center" gap={4}>
              <Link
                to={`/patients/${id.id}`}
                className="text-primary border-b-2 border-primary text-sm hover:text-primary/80"
              >
                ← Go back
              </Link>
            </Flex>
            <Heading size="lg" weight="bold" className="text-primary mt-2">
              KFRE Calculation
            </Heading>
          </CardHeader>
        )}

        <CardBody className={`${isMobile ? "p-3 pb-20" : "p-6"}`}>
          <VStack gap={isMobile ? 4 : 6} align="stretch">
            {/* PDF Extractor Section - Desktop only */}
            {!isMobile && (
              <Box>
                <PdfDataExtractor setExtractedPdfData={setExtractedPdfData} />
              </Box>
            )}

            {/* CSV Reader Section */}
            <Box>
              <CSVReader
                patientId={id.id}
                setData={setCsvData}
                setSuccess={setSuccess}
                success={success}
              />
            </Box>

            {/* Manual Entry Divider */}
            {isMobile ? (
              <Flex direction="row" justify="center" align="center">
                <Text size="sm" className="text-gray-600 font-medium">
                  or Select Manually
                </Text>
              </Flex>
            ) : (
              <Flex direction="row" justify="center" align="center" gap={3}>
                <Divider className="flex-1" />
                <Text size="sm" className="text-gray-600">Or</Text>
                <Divider className="flex-1" />
              </Flex>
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
              {/* Patient Name Display */}
              <FormControl>
                <FormLabel>Patient Name</FormLabel>
                <Box className={`p-3 bg-gray-50 rounded-lg border ${isMobile ? "border-primary border-2" : "border-gray-300"}`}>
                  <Text size="sm" weight="medium">
                    {patients?.[0]?.name || "Loading..."}
                  </Text>
                </Box>
              </FormControl>


              {/* Lab Reports Selection */}
              {labReportData.length > 0 && (
                <FormControl>
                  <FormLabel isRequired>Select lab report</FormLabel>
                  <Box className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className={`text-xs text-gray-700 ${isMobile ? "border-b border-primary" : "border-b border-gray-300"} bg-gray-50`}>
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
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <img
                                src={report.Lab_Report}
                                alt="Lab report"
                                className="inline h-8 w-8 md:h-12 md:w-12 mx-2 rounded cursor-pointer hover:opacity-75"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Text size="xs">
                                {new Date(report.Date).toLocaleDateString()}
                              </Text>
                            </td>
                            <td className="px-3 py-2 cursor-pointer">
                              <input
                                type="radio"
                                name="prescription"
                                onChange={() => {
                                  setViewPrescription(true);
                                  setLab_id(report.id);
                                  setReportimage(report.Lab_Report);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </FormControl>
              )}

              {/* Desktop: Form Fields in Grid */}
              {!isMobile && (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <FormControl>
                    <FormLabel isRequired>GFR</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter GFR"
                      value={patientData[0].eGFR}
                      onChange={handlePatientChange(0, "eGFR")}
                      variant="outline"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel isRequired>Phosphorous</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Phosphorous"
                      value={patientData[0].phosphorous}
                      onChange={handlePatientChange(0, "phosphorous")}
                      variant="outline"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel isRequired>Bicarbonate</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Bicarbonate"
                      value={patientData[0].bicarbonate}
                      onChange={handlePatientChange(0, "bicarbonate")}
                      variant="outline"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel isRequired>Albumin</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Albumin"
                      value={patientData[0].albumin}
                      onChange={handlePatientChange(0, "albumin")}
                      variant="outline"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel isRequired>Calcium</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Calcium"
                      value={patientData[0].calcium}
                      onChange={handlePatientChange(0, "calcium")}
                      variant="outline"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel isRequired>Albumin to Creatinine Ratio</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter ACR"
                      value={patientData[0].acr}
                      onChange={handlePatientChange(0, "acr")}
                      variant="outline"
                    />
                  </FormControl>
                </SimpleGrid>
              )}

              {/* Mobile: Form Fields Stacked */}
              {isMobile && (
                <VStack gap={3} align="stretch">
                  <FormControl>
                    <FormLabel>Phosphorous</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Phosphorous"
                      value={patientData[0].phosphorous}
                      onChange={handlePatientChange(0, "phosphorous")}
                      variant="outline"
                      className="border-primary border-2"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Bicarbonate</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Bicarbonate"
                      value={patientData[0].bicarbonate}
                      onChange={handlePatientChange(0, "bicarbonate")}
                      variant="outline"
                      className="border-primary border-2"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Enter GFR</FormLabel>
                    <Input
                      type="number"
                      placeholder="GFR"
                      value={patientData[0].eGFR}
                      onChange={handlePatientChange(0, "eGFR")}
                      variant="outline"
                      className="border-primary border-2"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phosphorous</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Phosphorous"
                      value={patientData[0].phosphorous}
                      onChange={handlePatientChange(0, "phosphorous")}
                      variant="outline"
                      className="border-primary border-2"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Bicarbonate</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Bicarbonate"
                      value={patientData[0].bicarbonate}
                      onChange={handlePatientChange(0, "bicarbonate")}
                      variant="outline"
                      className="border-primary border-2"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Albumin</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Albumin"
                      value={patientData[0].albumin}
                      onChange={handlePatientChange(0, "albumin")}
                      variant="outline"
                      className="border-primary border-2"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Calcium</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter Calcium"
                      value={patientData[0].calcium}
                      onChange={handlePatientChange(0, "calcium")}
                      variant="outline"
                      className="border-primary border-2"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Albumin to Creatinine Ratio</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter ACR"
                      value={patientData[0].acr}
                      onChange={handlePatientChange(0, "acr")}
                      variant="outline"
                      className="border-primary border-2"
                    />
                  </FormControl>
                </VStack>
              )}
            </VStack>

            {/* Desktop: Image Preview and Calculate */}
            {!isMobile && viewPrescription && reportimage && (
              <Box className="p-4 bg-white border-t-4 border-primary rounded shadow-md">
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
      </Card>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <Box className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg">
          <Flex
            direction="row"
            justify="around"
            align="center"
            gap={2}
            className="p-2"
          >
            <Flex direction="column" align="center" gap={1} className="flex-1 cursor-pointer">
              <Box className="text-2xl">🏠</Box>
              <Text size="xs" className="text-gray-600">Dashboard</Text>
            </Flex>
            <Flex direction="column" align="center" gap={1} className="flex-1 cursor-pointer">
              <Box className="text-2xl">👥</Box>
              <Text size="xs" className="text-gray-600">Patients</Text>
            </Flex>
            <Flex direction="column" align="center" gap={1} className="flex-1 cursor-pointer border-b-4 border-primary">
              <Box className="text-2xl text-primary">🏥</Box>
              <Text size="xs" className="text-primary font-semibold">KFRE</Text>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Mobile Calculate Button - Fixed */}
      {isMobile && (
        <Box className="fixed bottom-20 left-0 right-0 p-3 bg-white border-t border-gray-200">
          <Button
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
          className={`${
            isMobile ? "fixed bottom-40 left-3 right-3" : "mt-6 w-full md:w-96"
          } p-4 bg-blue-50 border-l-4 border-primary rounded`}
        >
          <Text size="sm" weight="bold" className="text-gray-700">
            Calculated KFRE:
          </Text>
          <Text size="lg" weight="bold" className="text-primary mt-1">
            {(kfre * 100).toFixed(2)}%
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default KfreSingleList;

