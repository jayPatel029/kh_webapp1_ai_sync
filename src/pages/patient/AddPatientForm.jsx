/**
 * AddPatientForm Component
 * Refactored to use the component library and design system
 * Following Figma design patterns
 * 
 * @file src/pages/patient/AddPatientForm.jsx
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { AddPatient } from "../../ApiCalls/patientAPis";
import ThemeProvider from "../../components/ThemeProvider";

// Component Library
import {
  Flex,
  Grid, GridItem,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Heading
} from "../../component-library";
import { FormModal } from "../../component-library/modals/FormModal";

// Import design system styles
import "../../design-system/styles/index.css";
import FileUploadWithCamera from "../../components/FileUploadWithCamera";


const AddPatientForm = ({ isOpen = true, onSuccess, onCancel, onAddPatient }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
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
    setFieldErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e) => {
    // Validate required fields
    const nextFieldErrors = {};
    if (!formData.name || formData.name.trim() === "") nextFieldErrors.name = true;
    if (!formData.dob) nextFieldErrors.dob = true;
    if (!formData.number || formData.number.trim() === "") nextFieldErrors.number = true;
    if (!formData.age) nextFieldErrors.age = true;
    if (!formData.aliments || formData.aliments.trim() === "") nextFieldErrors.aliments = true;
    if (!formData.registered_date) nextFieldErrors.registered_date = true;
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      // alert("Please fill all the required fields");
      return;
    }
    setFieldErrors({});

    // e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      }

      const response = onAddPatient
        ? await onAddPatient(formDataToSend)
        : await AddPatient(formDataToSend);

      if (response.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/patients");
        }
      } else {
        const msg = typeof response.data === 'string' ? response.data : response.data?.message || "Failed to register patient";
        setErrorMsg(msg);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const msg = error?.message || "Failed to register patient. Please try again.";
      setErrorMsg(msg.includes("Network") ? "Network error — please check your connection." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <FormModal
        isOpen={isOpen}
        onClose={onCancel || (() => navigate(ROUTES.PATIENTS))}
        onSubmit={handleSubmit}
        title="Add New Patient"
        submitText="Register Patient"
        isLoading={loading}
        size="2xl"
        errorMessage={errorMsg}
        fieldErrors={fieldErrors}
        onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      >
        {/* form fields start */}
        <VStack spacing={6} align="stretch" className="w-full">
          <Heading as="h3" size="lg" style={{ color: '#3f6b85', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            Basic Information
          </Heading>

          {/* Photo and ID Section */}
          <Grid templateColumns="repeat(2, 1fr)" gap={8}>
            {/* <FormControl style={{ flex: 1 }} className="pt-6" >
              <FormLabel>Profile Photo</FormLabel>
              <FileUploadWithCamera
                onFileSelect={(file) => setFormData({ ...formData, profile_photo: file })}
              />
            </FormControl> */}
            <GridItem >
              <FormControl style={{ flex: 1 }} >
                <FormLabel>Icon</FormLabel>
                <FileUploadWithCamera
                  onFileSelect={(file) => setFormData({ ...formData, profile_photo: file })}
                  accept="image/*"
                  attachLabel="Upload Icon"
                  previewWidth={100}
                  previewHeight={100}
                  multiple={false}
                  size="xs"
                  images={formData.profile_photo ? [URL.createObjectURL(formData.profile_photo)] : []}
                />
              </FormControl>
            </GridItem>
            <FormControl style={{ flex: 1 }}>
              <FormLabel>Patient ID</FormLabel>
              <Input
                value="PAT18576"
                readOnly
                variant="filled"
                style={{ backgroundColor: '#f5f5f5', color: '#888' }}
              />
            </FormControl>

            <GridItem >
              {/* Name and DOB Section */}
              <FormControl isRequired style={{ flex: 1 }} isInvalid={Boolean(fieldErrors.name)}>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  variant="outline"
                  isInvalid={Boolean(fieldErrors.name)}
                />
              </FormControl>
            </GridItem>
            <GridItem >

              <FormControl isRequired style={{ flex: 1 }} isInvalid={Boolean(fieldErrors.dob)}>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  variant="outline"
                  isInvalid={Boolean(fieldErrors.dob)}
                />
              </FormControl>
            </GridItem>

            <GridItem >

              {/* Phone and Age Section */}
              <FormControl isRequired style={{ flex: 1 }} isInvalid={Boolean(fieldErrors.number)}>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="XXXXX XXXXX"
                  variant="outline"
                  isInvalid={Boolean(fieldErrors.number)}
                />
              </FormControl>
            </GridItem>
            <GridItem >

              <FormControl isRequired style={{ flex: 1 }} isInvalid={Boolean(fieldErrors.age)}>
                <FormLabel>Age</FormLabel>
                <Input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                  variant="outline"
                  isInvalid={Boolean(fieldErrors.age)}
                />
              </FormControl>
            </GridItem>

          </Grid>
          <Heading as="h3" size="lg" style={{ color: '#3f6b85', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: '20px' }}>
            Medical Details
          </Heading>


          <Grid templateColumns="repeat(2, 1fr)" gap={8}>
            <GridItem>
              <FormControl isRequired isInvalid={Boolean(fieldErrors.aliments)}>
                <FormLabel>Aliments</FormLabel>
                <Textarea
                  name="aliments"
                  value={formData.aliments}
                  onChange={handleChange}
                  placeholder="List aliments and conditions"
                  rows={3}
                  variant="outline"
                  isInvalid={Boolean(fieldErrors.aliments)}
                  className="!min-h-[40px] h-[40px]"
                />
              </FormControl>
            </GridItem>
            <GridItem >
              <FormControl isRequired style={{ flex: 1 }} isInvalid={Boolean(fieldErrors.registered_date)}>
                <FormLabel>Registration Date</FormLabel>
                <Input
                  type="date"
                  name="registered_date"
                  value={formData.registered_date}
                  onChange={handleChange}
                  variant="outline"
                  isInvalid={Boolean(fieldErrors.registered_date)}
                />
              </FormControl>

            </GridItem>

            {/* <GridItem>

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

            </GridItem> */}

            {/* 
            <GridItem>

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

            </GridItem> */}

            {/* <GridItem>

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

            </GridItem> */}

          </Grid>

          <Heading as="h3" size="lg" style={{ color: '#3f6b85', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: '20px' }}>
            Contact & Notifications
          </Heading>

          <Grid templateColumns="repeat(2, 1fr)" gap={8}>

            <GridItem>

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

            </GridItem>

            <GridItem>

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

            </GridItem>

            <GridItem >

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

            </GridItem >

            <GridItem >


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

            </GridItem >

          </Grid>
        </VStack>
        {/* form fields end */}
      </FormModal >
    </ThemeProvider >
  );
};

export default AddPatientForm;

