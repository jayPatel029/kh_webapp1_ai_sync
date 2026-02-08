/**
 * AddPatientForm Component
 * Refactored to use the component library and design system
 * Following Figma design patterns
 * 
 * @file src/pages/patient/AddPatientForm.jsx
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddPatient } from "../../ApiCalls/patientAPis";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";

// Component Library
import {
  Box,
  Flex,
  Stack,
  VStack,
  HStack,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Heading,
  Text,
  Card,
  CardBody
} from "../../component-library";

// Import design system styles
import "../../design-system/styles/index.css";

const AddPatientForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    aliments: "",
    number: "",
    dob: "",
    profile_photo: null,
    registered_date: new Date().toISOString().split('T')[0],
    program_assigned_to: "",
    medical_team: "",
    program: "",
    pushNotificationId: "",
    address: "",
    pincode: "",
    state: "",
    age: ""
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      }

      const response = await AddPatient(formDataToSend);

      if (response.success) {
        alert("Patient Registered Successfully!");
        navigate("/patient");
      } else {
        alert("Error: " + response.data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to register patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <Flex className="w-full h-screen">
        {/* Sidebar */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto'
          }}
        >
          <Sidebar />
        </Box>

        {/* Main Content */}
        <Flex
          direction="column"
          className="flex-1"
          style={{
            minWidth: 0,
            overflowX: 'hidden',
            backgroundColor: '#fafafa'
          }}
        >
          {/* Navbar */}
          <Box
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}
          >
            <Navbar />
          </Box>

          {/* Form Content */}
          <Container
            style={{
              flex: 1,
              padding: '40px md:80px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}
          >
            <VStack spacing={8} align="stretch" className="w-full">
              {/* Header with Breadcrumbs */}
              <PageHeader
                title="Add New Patient"
                breadcrumbs={[
                  { label: "My Patients", path: "/patient" },
                  { label: "Add New Patient", active: true }
                ]}
                onBackClick={() => navigate("/patient")}
              />

              <Card variant="elevated" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <CardBody className="p-8">
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <VStack spacing={6} align="stretch">

                      <Heading as="h3" size="lg" style={{ color: '#3f6b85', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                        Basic Information
                      </Heading>

                      {/* Photo and ID Section */}
                      <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                        <FormControl style={{ flex: 1 }}>
                          <FormLabel>Profile Photo</FormLabel>
                          <Input
                            type="file"
                            name="profile_photo"
                            accept="image/*"
                            onChange={handleChange}
                            variant="filled"
                          />
                        </FormControl>
                        <FormControl style={{ flex: 1 }}>
                          <FormLabel>Patient ID</FormLabel>
                          <Input
                            value="PAT18576"
                            readOnly
                            variant="filled"
                            style={{ backgroundColor: '#f5f5f5', color: '#888' }}
                          />
                        </FormControl>
                      </Flex>

                      {/* Name and DOB Section */}
                      <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                        <FormControl isRequired style={{ flex: 1 }}>
                          <FormLabel>Name</FormLabel>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange} 
                            placeholder="Full name"
                            variant="outline"
                          />
                        </FormControl>
                        <FormControl isRequired style={{ flex: 1 }}>
                          <FormLabel>Date of Birth</FormLabel>
                          <Input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange} 
                            variant="outline"
                          />
                        </FormControl>
                      </Flex>

                      {/* Phone and Age Section */}
                      <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                        <FormControl isRequired style={{ flex: 1 }}>
                          <FormLabel>Phone Number</FormLabel>
                          <Input
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            placeholder="+91 XXXXX XXXXX"
                            variant="outline"
                          />
                        </FormControl>
                        <FormControl isRequired style={{ flex: 1 }}>
                          <FormLabel>Age</FormLabel>
                          <Input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange} 
                            placeholder="Age"
                            variant="outline"
                          />
                        </FormControl>
                      </Flex>

                      <Heading as="h3" size="lg" style={{ color: '#3f6b85', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: '20px' }}>
                        Medical & Program Details
                      </Heading>

                      <FormControl isRequired>
                        <FormLabel>Aliments</FormLabel>
                        <Textarea
                          name="aliments"
                          value={formData.aliments}
                          onChange={handleChange} 
                          placeholder="List aliments and conditions"
                          rows={3}
                          variant="outline"
                        />
                      </FormControl>

                      <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                        <FormControl isRequired style={{ flex: 1 }}>
                          <FormLabel>Registration Date</FormLabel>
                          <Input
                            type="date"
                            name="registered_date"
                            value={formData.registered_date}
                            onChange={handleChange}
                            variant="outline"
                          />
                        </FormControl>
                        <FormControl style={{ flex: 1 }}>
                          <FormLabel>Program</FormLabel>
                          <Input
                            name="program"
                            value={formData.program}
                            onChange={handleChange}
                            placeholder="e.g. Advanced, Basic"
                            variant="outline"
                          />
                        </FormControl>
                      </Flex>

                      <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                        <FormControl style={{ flex: 1 }}>
                          <FormLabel>Medical Team</FormLabel>
                          <Input
                            name="medical_team"
                            value={formData.medical_team}
                            onChange={handleChange}
                            placeholder="Assigned medical team ID"
                            variant="outline"
                          />
                        </FormControl>
                        <FormControl style={{ flex: 1 }}>
                          <FormLabel>Assigned Administrator</FormLabel>
                          <Input
                            name="program_assigned_to"
                            value={formData.program_assigned_to}
                            onChange={handleChange} 
                            placeholder="Admin ID"
                            variant="outline"
                          />
                        </FormControl>
                      </Flex>

                      <Heading as="h3" size="lg" style={{ color: '#3f6b85', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: '20px' }}>
                        Contact & Notifications
                      </Heading>

                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Input
                          name="address"
                          value={formData.address}
                          onChange={handleChange} 
                          placeholder="Residential address"
                          variant="outline"
                        />
                      </FormControl>

                      <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                        <FormControl style={{ flex: 1 }}>
                          <FormLabel>State</FormLabel>
                          <Input
                            name="state"
                            value={formData.state}
                            onChange={handleChange} 
                            placeholder="State"
                            variant="outline"
                          />
                        </FormControl>
                        <FormControl style={{ flex: 1 }}>
                          <FormLabel>Pincode</FormLabel>
                          <Input
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="6-digit pincode"
                            variant="outline"
                          />
                        </FormControl>
                      </Flex>

                      <FormControl>
                        <FormLabel>Push Notification ID</FormLabel>
                        <Input
                          name="pushNotificationId"
                          value={formData.pushNotificationId}
                          onChange={handleChange} 
                          placeholder="Optional: Push token"
                          variant="outline"
                        />
                      </FormControl>

                      <Flex justify="flex-end" gap={4} style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/patient")}
                          style={{ width: '150px' }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit" 
                          variant="solid"
                          size="lg"
                          isLoading={loading}
                          style={{
                            backgroundColor: '#4164df',
                            width: '200px',
                            fontWeight: '600'
                          }}
                        >
                          Register Patient
                        </Button>
                      </Flex>
                    </VStack>
                  </form>
                </CardBody>
              </Card>
            </VStack>
          </Container>
        </Flex>
      </Flex>
    </ThemeProvider>
  );
};

export default AddPatientForm;
