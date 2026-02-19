/**
 * BulkUploadProof - Usage Examples
 * 
 * This file demonstrates how to use the unified BulkUploadProof component
 * for all different upload scenarios previously handled by separate components.
 */

import React, { useState, useEffect } from "react";
import { BulkUploadProof } from "./BulkUploadProof";

// ============================================================================
// EXAMPLE 1: Lab Readings Upload (like old CSVLab.jsx)
// ============================================================================

export function LabReadingsExample({ patientId }) {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);

  const config = {
    uploadType: "lab", // Uses preset configuration
    additionalContext: {
      patientId, // Will be added to each row
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Lab Readings Upload</h2>
      <BulkUploadProof
        config={config}
        setData={setData}
        setSuccess={setSuccess}
        success={success}
      />
      
      {data.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">
            {data.length} rows uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Lab Reports with Server Upload (like old CSVLab2.jsx)
// ============================================================================

export function LabReportsWithServerUploadExample({ patientId }) {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const config = {
    uploadType: "labReports",
    additionalContext: {
      patient_id: patientId,
      Report_Type: "Lab",
    },
    serverEndpoint: "/labreport/addBulkIndividual",
    uploadFileEndpoint: "/upload", // For file attachment
    fetchColumnsEndpoint: "/labreport/getColumnNames", // Fetch columns from server
    allowDynamicFields: true, // Allow adding new fields at runtime
    onSuccess: (processedData) => {
      setUploadStatus(`Successfully uploaded ${processedData.length} records`);
      setTimeout(() => setUploadStatus(""), 3000);
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Lab Reports Upload</h2>
      
      {uploadStatus && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          {uploadStatus}
        </div>
      )}
      
      <BulkUploadProof
        config={config}
        setData={setData}
        setSuccess={setSuccess}
        success={success}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Profile/Questions with Language Support (like old CSVProfile.jsx)
// ============================================================================

export function ProfileWithLanguagesExample() {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    // In real app, fetch from server
    setLanguages([
      { id: 1, language_name: "English" },
      { id: 2, language_name: "Hindi" },
      { id: 3, language_name: "Marathi" },
      { id: 4, language_name: "Gujarati" },
      { id: 5, language_name: "Tamil" },
      { id: 6, language_name: "Telugu" },
      { id: 7, language_name: "Malayalam" },
      { id: 8, language_name: "Kannada" },
      { id: 9, language_name: "Punjabi" },
      { id: 10, language_name: "Assamese" },
      { id: 11, language_name: "Bangali" },
    ]);
  }, []);

  const config = {
    uploadType: "profile",
    languages,
    columnDefinitions: {
      type: { 
        type: "string", 
        isRequired: false, 
        label: "Type" 
      },
      name: { 
        type: "string", 
        isRequired: false, 
        label: "Name" 
      },
      ailments: { 
        type: "array", 
        isRequired: false, 
        label: "Ailments" 
      },
      options: { 
        type: "string", 
        isRequired: false, 
        label: "Options" 
      },
      Hindi: { 
        type: "string", 
        label: "Hindi" 
      },
      HindiOpt: { 
        type: "string", 
        label: "Hindi Options" 
      },
      Marathi: { 
        type: "string", 
        label: "Marathi" 
      },
      MarathiOpt: { 
        type: "string", 
        label: "Marathi Options" 
      },
      Gujarati: { 
        type: "string", 
        label: "Gujarati" 
      },
      GujaratiOpt: { 
        type: "string", 
        label: "Gujarati Options" 
      },
      Tamil: { 
        type: "string", 
        label: "Tamil" 
      },
      TamilOpt: { 
        type: "string", 
        label: "Tamil Options" 
      },
      Telugu: { 
        type: "string", 
        label: "Telugu" 
      },
      TeluguOpt: { 
        type: "string", 
        label: "Telugu Options" 
      },
      Malayalam: { 
        type: "string", 
        label: "Malayalam" 
      },
      MalayalamOpt: { 
        type: "string", 
        label: "Malayalam Options" 
      },
      Kannada: { 
        type: "string", 
        label: "Kannada" 
      },
      KannadaOpt: { 
        type: "string", 
        label: "Kannada Options" 
      },
      Punjabi: { 
        type: "string", 
        label: "Punjabi" 
      },
      PunjabiOpt: { 
        type: "string", 
        label: "Punjabi Options" 
      },
      Assamese: { 
        type: "string", 
        label: "Assamese" 
      },
      AssameseOpt: { 
        type: "string", 
        label: "Assamese Options" 
      },
      Bangali: { 
        type: "string", 
        label: "Bangali" 
      },
      BangaliOpt: { 
        type: "string", 
        label: "Bangali Options" 
      },
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">
        Profile/Questions Upload with Language Support
      </h2>
      <BulkUploadProof
        config={config}
        setData={setData}
        setSuccess={setSuccess}
        success={success}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Daily Parameters with Language Support (like old Dailycsv)
// ============================================================================

export function DailyParametersWithLanguagesExample() {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    // In real app, fetch from server
    setLanguages([
      { id: 1, language_name: "English" },
      { id: 2, language_name: "Hindi" },
      { id: 3, language_name: "Marathi" },
      // ... other languages
    ]);
  }, []);

  const config = {
    uploadType: "daily",
    languages,
    // Optional: override any aspect of the preset
    columnDefinitions: {
      // Keys from daily preset
      title: { type: "string", label: "Title" },
      type: { type: "string", label: "Type" },
      assign_range: { type: "string", label: "Assign Range" },
      ailments: { type: "array", label: "Ailments" },
      low_range: { type: "string", label: "Low Range" },
      high_range: { type: "string", label: "High Range" },
      isGraph: { type: "string", label: "Is Graph" },
      unit: { type: "string", label: "Unit" },
      sendAlert: { type: "string", label: "Send Alert" },
      alertTextDoc: { type: "string", label: "Alert Text Doc" },
      condition: { type: "string", label: "Condition" },
      Hindi: { type: "string", label: "Hindi" },
      Gujarati: { type: "string", label: "Gujarati" },
      Kannada: { type: "string", label: "Kannada" },
      Assamese: { type: "string", label: "Assamese" },
      Marathi: { type: "string", label: "Marathi" },
      Tamil: { type: "string", label: "Tamil" },
      Punjabi: { type: "string", label: "Punjabi" },
      Telugu: { type: "string", label: "Telugu" },
      Malayalam: { type: "string", label: "Malayalam" },
      Bangali: { type: "string", label: "Bangali" },
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Daily Parameters Upload</h2>
      <BulkUploadProof
        config={config}
        setData={setData}
        setSuccess={setSuccess}
        success={success}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Fully Custom Configuration
// ============================================================================

export function CustomUploadExample() {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const config = {
    // No preset - fully custom
    columnDefinitions: {
      patientName: {
        type: "string",
        isRequired: true,
        label: "Patient Name",
        description: "Full name of the patient",
      },
      contactNumber: {
        type: "string",
        isRequired: true,
        label: "Contact Number",
      },
      appointmentDate: {
        type: "string",
        isRequired: false,
        label: "Appointment Date",
      },
      appointmentTime: {
        type: "string",
        isRequired: false,
        label: "Appointment Time",
      },
      notes: {
        type: "string",
        isRequired: false,
        label: "Notes",
      },
    },
    requiredFields: ["patientName", "contactNumber"],
    serverEndpoint: "/appointments/bulk-create",
    additionalContext: {
      departmentId: 5,
      doctorId: 12,
    },
    allowDynamicFields: true,
    previewRows: 10,
    onSuccess: (processedData) => {
      setUploadResult({
        success: true,
        recordCount: processedData.length,
        timestamp: new Date().toLocaleString(),
      });
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Custom Appointments Upload</h2>

      <BulkUploadProof
        config={config}
        setData={setData}
        setSuccess={setSuccess}
        success={success}
      />

      {uploadResult && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-semibold text-green-800">Upload Successful!</p>
          <p className="text-sm text-green-700">
            {uploadResult.recordCount} records uploaded at{" "}
            {uploadResult.timestamp}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Usage in a Page Component
// ============================================================================

export function PatientDataManagementPage() {
  const [activeTab, setActiveTab] = useState("lab-readings");
  const [patientId] = useState("12345");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Patient Data Management</h1>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          {successMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b">
        {[
          { id: "lab-readings", label: "Lab Readings" },
          { id: "lab-reports", label: "Lab Reports" },
          { id: "profiles", label: "Profiles" },
          { id: "daily-params", label: "Daily Parameters" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-lg p-6">
        {activeTab === "lab-readings" && (
          <LabReadingsExample patientId={patientId} />
        )}
        {activeTab === "lab-reports" && (
          <LabReportsWithServerUploadExample patientId={patientId} />
        )}
        {activeTab === "profiles" && <ProfileWithLanguagesExample />}
        {activeTab === "daily-params" && (
          <DailyParametersWithLanguagesExample />
        )}
      </div>
    </div>
  );
}

export default PatientDataManagementPage;
