// Import React, useState, useEffect
import React, { useState, useEffect } from "react";
import { getPatientMedicalTeam } from "../../ApiCalls/patientAPis";
import { getPrescriptionByPatient } from "../../ApiCalls/prescriptionApis";
import { alarmTypeOptions, timing } from "./consts";
import { updateAlarm } from "../../ApiCalls/alarmsApis"; // Assuming you have an update API

// Define the EditAlarmModal component
const EditAlarmModal = ({ closeModal, alarmData }) => {
  // Destructure alarmData to get existing alarm details
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
  } = alarmData;

  console.log(alarmData)

  // State variables for editing
  const [selectedAlarmType, setSelectedAlarmType] = useState(type);
  const [selectedHealthParameter, setSelectedHealthParameter] = useState(parameter);
  const [selectTimings, setSelectTimings] = useState(frequency);
  const [descriptionn, setDescription] = useState(description);
  const [weekdayss, setWeekdays] = useState([]);
  const [timesadayy, setTimesaday] = useState(timesaday || 1);
  const [timings, setTimings] = useState([]);
  const [dateOfMonth, setDOM] = useState(dateofmonth || []);
  const [doctorid, setDoctorid] = useState(doctorId || "");
  const [consultDoctor, setConsultDoctor] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(prescriptionid || "");
  const [viewPrescription, setViewPrescription] = useState(null);
  const [mod, setMod] = useState("");

    const handleCheck = (event) => {
        var updatedList = [...weekdayss];
        if (event.target.checked) {
          updatedList = [...weekdayss, event.target.value];
        } else {
          updatedList.splice(weekdayss.indexOf(event.target.value), 1);
        }
        setWeekdays(updatedList);
};

  // Define handleSubmit function for editing alarm
  const handleSubmit = async () => {
    closeModal();
    const payload = {
      doctorId: doctorid,
      type: selectedAlarmType,
      parameter: selectedHealthParameter,
      description: descriptionn,
      frequency: selectTimings,
      status: status,
      reason: reason,
      patientid: patientid,
      alarmId: alarmData.id, // Assuming you have an ID for the alarm
    };
    if (selectedAlarmType === "Prescription") {
      payload.prescriptionid = selectedPrescription;
    }

    if (selectTimings === "Daily/Weekly") {
      payload.weekdays = weekdayss.toString();
      payload.timesaday = timesadayy;
      payload.time = timings.toString();
    } else if (selectTimings === "Monthly") {
      payload.dateofmonth = dateOfMonth.toString();
      payload.timesamonth = timesaday;
      payload.time = timings.toString();
    }
    const res = await updateAlarm(alarmData.id,payload); // Update the alarm using your update API
    if (res.success) {
      console.log("Alarm updated successfully");
      // Optionally, you can handle what happens after updating the alarm
    } else {
      console.log("Error updating alarm", res);
    }
  };

  useEffect(() => {
    // Fetch patient data from the server
    const fetchPatientData = async () => {
    console.log("pid",patientid);
      const response = await getPatientMedicalTeam(patientid);
      console.log("Patient Data",response)
      if (response.success) {
        console.log(response.data.data);
        setConsultDoctor(response.data.data);
        setDoctorid(response.data.data.id);
      }
      const responsePres = await getPrescriptionByPatient(patientid);
      if (responsePres.success) {
        console.log(responsePres.data.data);
        setPrescription(responsePres.data.data);
        setSelectedPrescription(responsePres.data.data[0].id);
      }
    };
    fetchPatientData();
  }, []);

  const renderComponent = () => {
    if (selectTimings === "Daily/Weekly") {
      return (
        <div>
          <div className="mb-4">
            <h1>Select Week Days*</h1>
            <input
              type="checkbox"
              id="Mon"
              className="mx-2"
              value="Mon"
              onChange={handleCheck}
            />
            <label htmlFor="Mon" className="mr-2">
              Mon
            </label>
            <input
              type="checkbox"
              id="Tues"
              className="mr-2"
              value="Tues"
              onChange={handleCheck}
            />
            <label htmlFor="Tues" className="mr-2">
              Tues
            </label>
            <input
              type="checkbox"
              id="Wed"
              className="mr-2"
              value="Wed"
              onChange={handleCheck}
            />
            <label htmlFor="Wed" className="mr-2">
              Wed
            </label>
            <input
              type="checkbox"
              id="Thurs"
              className="mr-2"
              value="Thurs"
              onChange={handleCheck}
            />
            <label htmlFor="Thurs" className="mr-2">
              Thurs
            </label>
            <input
              type="checkbox"
              id="Fri"
              className="mr-2"
              value="Fri"
              onChange={handleCheck}
            />
            <label htmlFor="Fri" className="mr-2">
              Fri
            </label>
            <input
              type="checkbox"
              id="Sat"
              className="mr-2"
              value="Sat"
              onChange={handleCheck}
            />
            <label htmlFor="Sat" className="mr-2">
              Sat
            </label>
            <input
              type="checkbox"
              id="Sun"
              className="mr-2"
              value="Sun"
              onChange={handleCheck}
            />
            <label htmlFor="Sun" className="mr-2">
              Sun
            </label>
          </div>

          <div>
            <label className="py-2 mb-4">How Many Times A Day*</label>
            <select
              value={timesaday}
              className="w-full border-2 mb-2 mt-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              onChange={(e) => {
                setTimings(Array(parseInt(e.target.value)));
                setTimesaday(e.target.value);
                setDOM(Array(parseInt(e.target.value)));
              }}
            >
              {timing.map((time, index) => (
                <option key={index} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label htmlFor="time" className="block mb-2">
              Time*
            </label>
            {Array.from(Array(parseInt(timesaday))).map((_, index) => {
              return (
                <input
                  type="time"
                  key={index}
                  value={timings[index]}
                  onChange={(e) => {
                    let temp = [...timings];
                    temp[index] = e.target.value;
                    setTimings(temp);
                  }}
                  className="block w-1/3 border-2 py-2 px-3 mb-2 rounded focus:outline-none focus:border-primary"
                />
              );
            })}
          </div>
          <div>
            <label className="mb-2">Select Doctor For Approval*</label>
            <select className="w-full border-2 mb-2 mt-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
            >
              {consultDoctor.map((doc, index) => (
                <option key={index} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    } else if (selectTimings === "Monthly") {
      return (
        <div>
          <div>
            <label className="py-2 mb-4">How Many Times A Month*</label>
            <select
              value={timesaday}
              className="w-full border-2 mb-2 mt-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              onChange={(e) => {
                setTimings(Array(parseInt(e.target.value)));
                setTimesaday(e.target.value);
                setDOM(Array(parseInt(e.target.value)));
              }}
            >
              {timing.map((time, index) => (
                <option key={index} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>

          {Array.from(Array(parseInt(timesaday))).map((_, index) => {
            return (
              <div key={index}>
                <label className="block">Date Of The Month*</label>
                <select
                  name="dateOfMonth"
                  id="dateOfMonth"
                  className="w-1/2 border-2 py-2 px-3 mr-2 mb-2 rounded focus:outline-none focus:border-primary"
                  value={dateOfMonth[index]}
                  onChange={(e) => {
                    let temp = [...dateOfMonth];
                    temp[index] = e.target.value;
                    setDOM(temp);
                  }}
                >
                  {/* Generate options for numbers 1 to 30 */}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(
                    (number, index) => (
                      <option key={index} value={number}>
                        {number}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="time"
                  value={timings[index]}
                  onChange={(e) => {
                    let temp = [...timings];
                    temp[index] = e.target.value;
                    setTimings(temp);
                  }}
                  className=" w-1/3 border-2 py-2 px-3 mb-2 rounded focus:outline-none focus:border-primary"
                />
              </div>
            );
          })}
          <div>
            <label className="mb-2">Select Doctor For Approval*</label>
            <select className="w-full border-2 mb-2 mt-2 py-2 px-3 rounded focus:outline-none focus:border-primary">
              {consultDoctor.map((doc, index) => (
                <option key={index} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    // Default case
    return null;
  };

  // JSX structure of EditAlarmModal component
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black overflow-y-auto">
        <div className="p-7 mt-4 bg-white shadow-md border-t-4 w-1/2 border-primary rounded z-50 overflow-y-auto h-3/4">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Edit Alarm</h2>
            {/* Write the reason here for the alarm in p tag */}
          {reason && alarmData.status ==="Rejected" && <p className="text-sm text-red-500">{reason}</p>}
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Alarm Type*
              </label>
              <select
                id="alarmType"
                onChange={(e) => {
                  setSelectedAlarmType(e.target.value);
                  setSelectedHealthParameter("");
                }}
                value={selectedAlarmType}
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-primary"
              >
                <option className="text-gray-400">Select Alarm Type</option>
                {alarmTypeOptions.map((type, index) => (
                  <option key={index} value={type.label}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {/* health parameter's section */}
            {selectedAlarmType !== "Diet Details" &&
              selectedAlarmType !== "Prescription" && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    {selectedAlarmType &&
                      alarmTypeOptions.find(
                        (type) => type.label === selectedAlarmType
                      )?.title}
                  </label>
                  <select
                    value={selectedHealthParameter}
                    onChange={(e) => setSelectedHealthParameter(e.target.value)}
                    disabled={!selectedAlarmType}
                    className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-primary"
                  >
                    <option className="text-gray-400">Select Parameter</option>
                    {selectedAlarmType &&
                      alarmTypeOptions
                        .find((type) => type.label === selectedAlarmType)
                        ?.healthParameters.map((param, index) => (
                          <option key={index} value={param}>
                            {param}
                          </option>
                        ))}
                  </select>
                </div>
              )}

            {/* description section */}
            {selectedAlarmType === "Prescription" && (
              <div className="my-2">
                <label>Select Prescription*</label>
                <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                  <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-3 ">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 ">
                        Select
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.map((pres, index) => {
                      return (
                        <tr key={index} className="my-4">
                          <td className="px-6 py-4 text-3xl">
                            <img
                              src={pres.Prescription}
                              alt="image"
                              className="inline h-12 w-12 mx-10"
                              onClick={() => {
                                if (viewPrescription === index + 1) {
                                  setViewPrescription(null);
                                } else {
                                  setViewPrescription(index + 1);
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 text-md">
                            {new Date(pres.Date).toDateString()}
                          </td>
                          <td className="px-6 py-4 text-3xl">
                            <input
                              type="radio"
                              name="prescription"
                              value={pres.id}
                              onChange={(e) =>{
                                setSelectedPrescription(e.target.value)}
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mb-4">
              <label>Short Description*</label>
              <input
                type="text"
                value={description}
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-primary "
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {/* <div className="mb-4">
              <label>Message to Doctor*</label>
              <input
                type="text"
                value={mod}
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-primary "
                onChange={(e) => setMod(e.target.value)}
              />
            </div> */}
            <div className="flex">
              <div className="mb-4 mr-4">
                <input
                  name="regularity"
                  type="radio"
                  id="dailyWeekly"
                  value="Daily/Weekly"
                  checked={selectTimings === "Daily/Weekly"}
                  onChange={(e) => setSelectTimings(e.target.value)}
                />
                <label htmlFor="dailyWeekly">Daily/Weekly</label>
              </div>
              <div className="mb-4">
                <input
                  name="regularity"
                  type="radio"
                  id="monthly"
                  value="Monthly"
                  checked={selectTimings === "Monthly"}
                  onChange={(e) => setSelectTimings(e.target.value)}
                />
                <label htmlFor="monthly">Monthly</label>
              </div>
            </div>
            <div className="mb-4 mr-4">{renderComponent()}</div>
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update
            </button>
            <button
              onClick={() => {
                closeModal();
              }}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Close
            </button>
          </div>
        </div>
        {viewPrescription && (
          <div className="p-7 mt-4 bg-white shadow-md border-t-4 w-1/4 border-primary rounded z-50 overflow-y-auto h-3/4">
            <img
              src={prescription[viewPrescription - 1].Prescription}
              className="w-full"
            />
          </div>
        )}
      </div>
    </>
  );
};

// Export the EditAlarmModal component
export default EditAlarmModal;
