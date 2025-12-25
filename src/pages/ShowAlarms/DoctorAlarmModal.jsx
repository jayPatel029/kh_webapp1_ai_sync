import React, { useState, useEffect } from "react";
import { getPatientMedicalTeam } from "../../ApiCalls/patientAPis";
import { getPrescriptionByPatient } from "../../ApiCalls/prescriptionApis";
import { alarmTypeOptions, timing } from "./consts";
import { updateAlarm } from "../../ApiCalls/alarmsApis";
import { updateReason } from "../../ApiCalls/alarmsApis";

const DoctorAlarmModal = ({ closeModal, alarmData }) => {
    const {
        doctorId,
        type,
        parameter,
        description,
        frequency,
        status,
        reason,
        patientid,
        prescriptionid,
        weekdays,
        timesaday,
        time,
        dateofmonth,
        messagefordoctor
      } = alarmData;
      const [selectedAlarmType] = useState(type);
      const [selectedHealthParameter] = useState(parameter);
      const [selectTimings] = useState(frequency);
      const [descriptionn] = useState(description);
      const [weekdayss] = useState(weekdays || []);
      const [timesadayy] = useState(timesaday || 1);
      const [timings] = useState(time || []);
      const [dateOfMonth] = useState(dateofmonth || []);
      const [prescription, setPrescription] = useState([]);
      const [selectedPrescription] = useState(prescriptionid || "");
      const [viewPrescription, setViewPrescription] = useState(null);
      const [approvalStatus, setApprovalStatus] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");


  const handleSubmit = async () => {
    try {
        await updateReason(alarmData.id,approvalStatus,rejectionReason,patientid);
        alert("Alarm updated successfully");
        
    } catch (error) {
        console.log(error);
        alert("Error updating alarm");
        
    }
    closeModal();
   
  };

  useEffect(() => {
    const fetchPatientData = async () => {
        const responsePres = await getPrescriptionByPatient(patientid);
        if (responsePres.success) {
          console.log(responsePres.data.data);
          setPrescription(responsePres.data.data);
        }
      };
      fetchPatientData();
  }, [patientid]);

  return (

<>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black overflow-y-auto">
        <div className="p-7 mt-4 bg-white shadow-md border-t-4 w-1/2 border-primary rounded z-50 overflow-y-auto h-3/4">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Edit Alarm</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Alarm Information</h3>
              <p>
                <span className="font-semibold">Alarm Type:</span> {type}
              </p>
              <p>
                <span className="font-semibold">Parameter:</span> {parameter}
              </p>
              <p>
                <span className="font-semibold">Description:</span> {description}
              </p>
              <p>
                <span className="font-semibold">Frequency:</span> {frequency}
              </p>
              {weekdays && weekdays.length > 0 && (
                <p>
                  <span className="font-semibold">Weekdays:</span>{" "}
                  {weekdays}
                </p>
              )}
              <p>
                <span className="font-semibold">Times a Day:</span> {timesaday}
              </p>
              {time && time.length > 0 && (
                <p>
                  <span className="font-semibold">Time(s):</span>{" "}
                  {time}
                </p>
              )}
              {dateofmonth && dateofmonth.length > 0 && (
                <p>
                  <span className="font-semibold">Date(s) of Month:</span>{" "}
                  {dateofmonth}
                </p>
              )}
            </div>

            {/* Prescription Image and Info */}
            {selectedAlarmType === "Prescription" && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Prescription Details</h3>
                <div className="flex items-center mb-2">
                  <img
                    src={prescription[prescriptionid - 1]?.Prescription}
                    alt="Prescription"
                    className="w-32 h-auto mr-4"
                    onClick={()=> window.open(prescription[prescriptionid - 1]?.Prescription, "_blank")}
                    style={{ cursor: "pointer" }}
                  />
                  {/* Prescription Info */}
                  <div>
                    <p>
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date().toDateString()}
                    </p>
                    {/* <p>
                      <span className="font-semibold">Message for Doctor: </span>{" "}
                      {messagefordoctor}
                    </p> */}
                    {/* Add more prescription details as needed */}
                  </div>
                </div>
              </div>
            )}

            {/* Approval Status */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Approval Status
              </label>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="approve"
                  name="approval"
                  value="approved"
                  checked={approvalStatus === "approved"}
                  onChange={() => setApprovalStatus("approved")}
                />
                <label htmlFor="approve" className="ml-2">
                  Approve
                </label>
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="radio"
                  id="reject"
                  name="approval"
                  value="rejected"
                  checked={approvalStatus === "rejected"}
                  onChange={() => setApprovalStatus("rejected")}
                />
                <label htmlFor="reject" className="ml-2">
                  Reject
                </label>
              </div>
            </div>

            {/* Reject Reason */}
            {approvalStatus === "rejected" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectionReason"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                  placeholder="Enter reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
              </div>
            )}
          </div>
          <div className="flex justify-end p-4">
          <button
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                onClick={handleSubmit}
            >
              SUBMIT
            </button>
            
            <button
              onClick={closeModal}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
    
  )
}

export default DoctorAlarmModal