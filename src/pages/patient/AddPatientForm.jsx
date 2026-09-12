/**
 * AddPatientForm Component
 * Refactored to use the component library and design system
 * Following Figma design patterns
 * 
 * @file src/pages/patient/AddPatientForm.jsx
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { AddPatient } from "../../ApiCalls/patientAPis";
import { getAilments } from "../../ApiCalls/ailmentApis";
import { getDoctors } from "../../ApiCalls/doctorApis";
import ThemeProvider from "../../components/ThemeProvider";
import { Select } from "../../component-library/primitives/Select";
import { MultiSelect } from "../../component-library/primitives/MultiSelect";
import { calculateAge } from "../../helpers/utils";

// Component Library
import {
  Flex,
  Grid, GridItem,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Checkbox
} from "../../component-library";
import { FormModal } from "../../component-library/modals/FormModal";

// Import design system styles
import "../../design-system/styles/index.css";
import FileUploadWithCamera from "../../components/FileUploadWithCamera";
import { ABDMStepper } from "../../components/ABDMStepper";

const normalizeInitialAliments = (value) => {
  if (Array.isArray(value)) return value.map(String);
  return [];
};

const isExclusiveDialysisAilment = (name = "") =>
  /hemo\s*dialysis|peritoneal\s*dialysis/i.test(String(name));

/** Keep at most one of Hemo Dialysis / Peritoneal Dialysis in the selection. */
const enforceExclusiveDialysisSelection = (selectedIds, previousIds, ailmentOptions) => {
  const dialysisIds = new Set(
    ailmentOptions
      .filter((a) => isExclusiveDialysisAilment(a.name))
      .map((a) => String(a.id))
  );
  if (dialysisIds.size < 2) return selectedIds.map(String);

  const next = selectedIds.map(String);
  const selectedDialysis = next.filter((id) => dialysisIds.has(id));
  if (selectedDialysis.length <= 1) return next;

  const prev = (previousIds || []).map(String);
  const newlyAdded = selectedDialysis.find((id) => !prev.includes(id));
  const keep = newlyAdded || selectedDialysis[selectedDialysis.length - 1];
  return next.filter((id) => !dialysisIds.has(id) || id === String(keep));
};

const AddPatientForm = ({ isOpen = true, onSuccess, onCancel, onAddPatient, initialData = {} }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [isAbdmStepperOpen, setIsAbdmStepperOpen] = useState(false);
  const [ailmentOptions, setAilmentOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "will_be_entered_later", label: "Will be entered later" },
  ];

  const paymentTypeOptions = [
    { value: "out_of_pocket", label: "Out of Pocket" },
    { value: "insurance", label: "Insurance" },
  ];

  const financialConditionOptions = [
    { value: "BPL", label: "BPL (Below Poverty Line)" },
    { value: "APL", label: "APL (Above Poverty Line)" },
  ];
  const defaultFormData = {
    name: "",
    aliments: [],
    number: "",
    dob: "",
    profile_photo: null,
    registered_date: new Date().toISOString().split('T')[0],
    program_assigned_to: "",
    medical_team: "",
    program: "Basic",
    pushNotificationId: "",
    address: "",
    pincode: "",
    state: "",
    age: "",
    blood_group: "",
    payment_type: "",
    financial_condition: "",
    bpl_card_verified: false,
    abha_id: "",
    abha_card: null
  };

  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...initialData,
    aliments: normalizeInitialAliments(initialData.aliments ?? defaultFormData.aliments),
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [ailmentResult, doctorResult] = await Promise.all([
        getAilments(),
        getDoctors(),
      ]);
      if (cancelled) return;

      if (ailmentResult.success && Array.isArray(ailmentResult.data?.listOfAilments)) {
        setAilmentOptions(ailmentResult.data.listOfAilments);
      } else {
        console.error("Failed to fetch ailments:", ailmentResult);
        setAilmentOptions([]);
      }

      if (doctorResult.success) {
        const list = doctorResult.data?.data || doctorResult.data || [];
        const doctorsOnly = (Array.isArray(list) ? list : []).filter(
          (d) => !d.role || String(d.role).toLowerCase() === "doctor"
        );
        setDoctorOptions(doctorsOnly);
      } else {
        console.error("Failed to fetch doctors:", doctorResult);
        setDoctorOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    } else {
      let updatedFormData = {
        ...formData,
        [name]: type === "file" ? files[0] : value,
      };

      if (name === "dob") {
        if (value) {
          const parsedDate = new Date(value);
          if (!isNaN(parsedDate.getTime())) {
            const calculatedAge = calculateAge(value);
            if (calculatedAge >= 0) {
              updatedFormData.age = calculatedAge.toString();
              setFieldErrors((prev) => ({ ...prev, age: false }));
            }
          }
        } else {
          updatedFormData.age = "";
        }
      }

      setFormData(updatedFormData);
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    // Validate required fields
    const nextFieldErrors = {};
    if (!formData.name || formData.name.trim() === "") nextFieldErrors.name = true;
    if (!formData.dob) nextFieldErrors.dob = true;
    if (!formData.number || formData.number.trim() === "") nextFieldErrors.number = true;
    if (!formData.age) nextFieldErrors.age = true;
    if (!Array.isArray(formData.aliments) || formData.aliments.length === 0) nextFieldErrors.aliments = true;
    if (!formData.medical_team) nextFieldErrors.medical_team = true;
    const selectedDialysis = ailmentOptions.filter(
      (a) =>
        isExclusiveDialysisAilment(a.name) &&
        formData.aliments.map(String).includes(String(a.id))
    );
    if (selectedDialysis.length > 1) {
      nextFieldErrors.aliments = true;
      setErrorMsg("Select only one of Hemo Dialysis or Peritoneal Dialysis.");
    }
    if (!formData.registered_date) nextFieldErrors.registered_date = true;
    if (!formData.blood_group || formData.blood_group.trim() === "") nextFieldErrors.blood_group = true;
    if (!formData.payment_type || formData.payment_type.trim() === "") nextFieldErrors.payment_type = true;
    if (!formData.financial_condition || formData.financial_condition.trim() === "") nextFieldErrors.financial_condition = true;
    if (formData.financial_condition === "BPL" && !formData.bpl_card_verified) nextFieldErrors.bpl_card_verified = true;
    if (!formData.abha_id || formData.abha_id.trim() === "") nextFieldErrors.abha_id = true;
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
        if (key === "aliments") {
          // Backend expects an array of ailment IDs
          formDataToSend.append(
            "aliments",
            JSON.stringify(formData.aliments.map((id) => Number(id)))
          );
          continue;
        }
        if (key === "program") {
          const raw = formData.program == null ? "" : String(formData.program).trim();
          const programValue = !raw || raw.toLowerCase() === "basic" ? "Basic" : raw;
          formDataToSend.append("program", programValue);
          continue;
        }
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

            <GridItem>
              <FormControl isRequired style={{ flex: 1 }} isInvalid={Boolean(fieldErrors.blood_group)}>
                <FormLabel>Blood Group</FormLabel>
                <Select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  placeholder="Select blood group"
                  isInvalid={Boolean(fieldErrors.blood_group)}
                  isRequired
                >
                  {bloodGroupOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>

          </Grid>
          <Heading as="h3" size="lg" style={{ color: '#3f6b85', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: '20px' }}>
            Medical Details
          </Heading>


          <Grid templateColumns="repeat(2, 1fr)" gap={8}>
            <GridItem>
              <FormControl isRequired isInvalid={Boolean(fieldErrors.aliments)}>
                <FormLabel>Ailments</FormLabel>
                <MultiSelect
                  placeholder="Select ailments"
                  value={formData.aliments}
                  isInvalid={Boolean(fieldErrors.aliments)}
                  isRequired
                  onChange={(selectedIds) => {
                    setFormData((prev) => ({
                      ...prev,
                      aliments: enforceExclusiveDialysisSelection(
                        selectedIds,
                        prev.aliments,
                        ailmentOptions
                      ),
                    }));
                    setFieldErrors((prev) => ({ ...prev, aliments: false }));
                    setErrorMsg("");
                  }}
                >
                  {ailmentOptions.map((ailment) => (
                    <option key={ailment.id} value={String(ailment.id)}>
                      {ailment.name}
                    </option>
                  ))}
                </MultiSelect>
                <p style={{ marginTop: "6px", fontSize: "12px", color: "#6b7280" }}>
                  Hemo Dialysis and Peritoneal Dialysis cannot be selected together.
                </p>
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

            <GridItem>
              <FormControl isRequired style={{ flex: 1 }} isInvalid={Boolean(fieldErrors.medical_team)}>
                <FormLabel>Doctor</FormLabel>
                <Select
                  name="medical_team"
                  value={formData.medical_team}
                  onChange={handleChange}
                  placeholder="Select doctor"
                  isInvalid={Boolean(fieldErrors.medical_team)}
                  isRequired
                >
                  {doctorOptions.map((doctor) => (
                    <option key={doctor.id} value={String(doctor.id)}>
                      {doctor.name}
                      {doctor.email ? ` (${doctor.email})` : ""}
                    </option>
                  ))}
                </Select>
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

            {/* Medical team text input replaced by Doctor Select above */}

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
            Financial & Documentation
          </Heading>

          <Grid templateColumns="repeat(2, 1fr)" gap={8}>
            <GridItem>
              <FormControl isRequired isInvalid={Boolean(fieldErrors.payment_type)}>
                <FormLabel>Type of Payment</FormLabel>
                <Select
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  placeholder="Select payment type"
                  isInvalid={Boolean(fieldErrors.payment_type)}
                  isRequired
                >
                  {paymentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired isInvalid={Boolean(fieldErrors.financial_condition)}>
                <FormLabel>Financial Condition</FormLabel>
                <Select
                  name="financial_condition"
                  value={formData.financial_condition}
                  onChange={handleChange}
                  placeholder="Select financial condition"
                  isInvalid={Boolean(fieldErrors.financial_condition)}
                  isRequired
                >
                  {financialConditionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>

            {formData.financial_condition === "BPL" && (
              <GridItem colSpan={2}>
                <FormControl isRequired isInvalid={Boolean(fieldErrors.bpl_card_verified)}>
                  <Checkbox
                    name="bpl_card_verified"
                    isChecked={formData.bpl_card_verified}
                    onChange={handleChange}
                  >
                    I have verified BPL Card and status of patient
                  </Checkbox>
                  {fieldErrors.bpl_card_verified && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                      BPL verification is required for BPL patients
                    </div>
                  )}
                </FormControl>
              </GridItem>
            )}

            <GridItem>
              <FormControl isRequired isInvalid={Boolean(fieldErrors.abha_id)}>
                <Flex justify="space-between" align="center" style={{ marginBottom: "0.5rem" }}>
                  <FormLabel style={{ margin: 0 }}>ABHA ID</FormLabel>
                  <Button size="sm" variant="outline" onClick={() => setIsAbdmStepperOpen(true)}>
                    Start ABDM Walkthrough
                  </Button>
                </Flex>
                <Input
                  name="abha_id"
                  value={formData.abha_id}
                  onChange={handleChange}
                  placeholder="e.g. XX-XXXX-XXXX-XXXX"
                  variant="outline"
                  isInvalid={Boolean(fieldErrors.abha_id)}
                />
              </FormControl>
              
              {isAbdmStepperOpen && (
                <ABDMStepper isOpen={isAbdmStepperOpen} onClose={() => setIsAbdmStepperOpen(false)} />
              )}
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>ABHA Card Copy</FormLabel>
                <FileUploadWithCamera
                  onFileSelect={(file) => setFormData({ ...formData, abha_card: file })}
                  accept="image/*,.pdf"
                  attachLabel="Upload ABHA Card"
                  previewWidth={100}
                  previewHeight={100}
                  multiple={false}
                  size="xs"
                  images={formData.abha_card ? [URL.createObjectURL(formData.abha_card)] : []}
                />
              </FormControl>
            </GridItem>
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

