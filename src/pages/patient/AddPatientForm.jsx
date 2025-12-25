import React, { useState } from "react";
import { AddPatient } from "../../ApiCalls/patientAPis";

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    aliments: "",
    number: "",
    dob: "",
    profile_photo: null, // Handle file upload
    registered_date: "",
    program_assigned_to: "",
    medical_team: "",
    program: "",
    pushNotificationId: "",
    address: "",
    pincode: "",
    state: "",
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
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    const response = await AddPatient(formDataToSend)
    const data = await response.json();
    if (data.success) {
      alert("Patient Registered Successfully!");
    } else {
      alert("Error: " + data.data);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Patient</h2>

        {/* Patient ID (Auto-generated for example) */}
        <div className="mb-4">
          <label className="block text-gray-700">ID</label>
          <input
            type="text"
            name="patientId"
            value="PAT18576" // This is auto-generated or provided by backend
            className="w-full px-3 py-2 border rounded-lg shadow-sm bg-gray-100"
            readOnly
          />
        </div>

        {/* Photo Upload */}
        <div className="mb-4">
          <label className="block text-gray-700">Photo</label>
          <input
            type="file"
            name="profile_photo"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
          />
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
            required
          />
        </div>

        {/* Date of Birth */}
        <div className="mb-4">
          <label className="block text-gray-700">DOB *</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
            required
          />
        </div>

        {/* Age */}
        <div className="mb-4">
          <label className="block text-gray-700">Age *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label className="block text-gray-700">Phone *</label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
            required
          />
        </div>

        {/* Aliments */}
        <div className="mb-4">
          <label className="block text-gray-700">Aliments *</label>
          <textarea
            name="aliments"
            value={formData.aliments}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
            required
          ></textarea>
        </div>

        {/* Registered Date */}
        <div className="mb-4">
          <label className="block text-gray-700">Registered Date *</label>
          <input
            type="date"
            name="registered_date"
            value={formData.registered_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
            required
          />
        </div>

        {/* Program Assigned To */}
        <div className="mb-4">
          <label className="block text-gray-700">Program Assigned To</label>
          <input
            type="text"
            name="program_assigned_to"
            value={formData.program_assigned_to}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
          />
        </div>

        {/* Medical Team */}
        <div className="mb-4">
          <label className="block text-gray-700">Medical Team</label>
          <input
            type="text"
            name="medical_team"
            value={formData.medical_team}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
          />
        </div>

        {/* Program */}
        <div className="mb-4">
          <label className="block text-gray-700">Program</label>
          <input
            type="text"
            name="program"
            value={formData.program}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
          />
        </div>

        {/* Push Notification ID */}
        <div className="mb-4">
          <label className="block text-gray-700">Push Notification ID</label>
          <input
            type="text"
            name="pushNotificationId"
            value={formData.pushNotificationId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
        >
          Register Patient
        </button>
      </form>
    </div>
  );
};

export default PatientRegistration;
