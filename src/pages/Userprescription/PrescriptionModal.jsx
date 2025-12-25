import React, { useEffect, useState } from "react";
import { addPrescriptionById } from "../../ApiCalls/prescriptionApis";
import Webcam from "react-webcam";
import { getFileRes } from "../../helpers/fileuploadHelper";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import getCurrentDate from "../../helpers/formatDate";
import jsPDF from "jspdf";

const PrescriptionModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [doctorNames, setDoctorNames] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(0);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [msg, setMsg] = useState("");


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 1) {
      setSelectedImage(files[0]);
    } else {
      const newImages = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newImages.push({
            data: reader.result,
            name: file.name,
          });
          setSelectedImages(newImages);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const handleCaptureOption = () => {
    setShowWebcam(true);
  };

  const capture = async (getScreenshot) => {
    const imageSrc = getScreenshot();
    setCapturedImages((prevImages) => [...prevImages, imageSrc]);
  };

  const b64toBlob = (base64) => fetch(base64).then((res) => res.blob());

  // if(selectedDoctorId==0){
  //   alert("Please Select Doctor")
  //   return;
  // }

  const handleSubmit = async () => {
    // if (selectedImage || capturedImage) {
    if (!selectedDate) {
      setMsg("Please Select Date");
      return;
    }
    if (selectedDoctorId == 0) {
      setMsg("Please Select Doctor");
      return;
    }
    if (!(selectedImage || capturedImage || selectedImages)) {
      setMsg("Please Select Prescription");
      return;
    }
    if (selectedImage) {
      // console.log("date", selectedDate);
      getFileRes(selectedImage)
        .then((res) => {
          console.log("res", res);
          if (res.data.objectUrl === undefined) {
            alert("failed to upload you document, please try again later");
            return;
          }
          let data = {
            email:localStorage.getItem("email"),
            patient_id: user_id,
            date: selectedDate,
            Prescription: res.data.objectUrl,
            prescriptionGivenBy: selectedDoctorId,
          };

          addPrescriptionById(data).then((res) => {
            const d = {
              prescriptionId: res.data.data,
              patientId: user_id,
            };
            onSuccess();
            closeModal();
          });
        })
        .catch((err) => {
          console.log("error in adding msg with image", err);
          return;
        });
    } else if (capturedImages.length > 0) {
      // b64toBlob(capturedImage).then((blob) => {
      //   getFileRes(blob)
      //     .then(async (res) => {
      //       let data = {
      //         patient_id: user_id,
      //         date: selectedDate,
      //         Prescription: res.data.objectUrl,
      //       };
      //       addPrescriptionById(data).then((res) => {
      //         const d = {
      //           prescriptionId: res.data.data,
      //           patientId: user_id,
      //         };
      //         axiosInstance
      //           .post(`${server_url}/alerts/newPrescription`, d)
      //           .then((res) => {
      //             onSuccess();
      //             closeModal();
      //           })
      //           .catch((err) => {
      //             console.log("error in adding Alert", err);
      //             return;
      //           });
      //       });
      //     })
      //     .catch((err) => {
      //       console.log("error in adding msg with image", err);
      //       return;
      //     });
      // });
      // }
      const doc = new jsPDF();
      for (let i = 0; i < capturedImages.length; i++) {
        if (i > 0) {
          doc.addPage();
        }
        doc.addImage(capturedImages[i], "JPEG", 10, 20, 200, 200);
      }
      doc.setProperties({
        title: "Prescription.pdf",
      });
      const file = doc.output("blob");
      getFileRes(file, "Prescription.pdf")
        .then((res) => {
          console.log("res", res);
          if (res.data.objectUrl=== undefined) {
            alert("failed to upload you document, please try again later");
            return;
          }
          let data = {
            email:localStorage.getItem("email"),
            patient_id: user_id,
            date: selectedDate,
            Prescription: res.data.objectUrl,
            prescriptionGivenBy: selectedDoctorId,
          };
          addPrescriptionById(data).then((res) => {
            const d = {
              prescriptionId: res.data.data,
              patientId: user_id,
            };
            onSuccess();
            closeModal();
          });
        })
        .catch((err) => {
          console.log("error in adding msg with image", err);
          return;
        });
    } else if (selectedImages.length > 1) {
      const doc = new jsPDF();
      for (let i = 0; i < selectedImages.length; i++) {
        if (i > 0) {
          doc.addPage();
        }
        const image = selectedImages[i];
        // doc.text(image.name, 10, 10);
        doc.addImage(image.data, "JPEG", 10, 10, 200, 200);
      }
      doc.setProperties({
        title: "Prescription.pdf",
      });
      console.log(doc.title);
      const file = doc.output("blob");
      getFileRes(file, "Prescription.pdf")
        .then((res) => {
          console.log("res", res);
          if (res.data.objectUrl === undefined) {
            alert("failed to upload you document, please try again later");
            return;
          }
          let data = {
            patient_id: user_id,
            date: selectedDate,
            Prescription: res.data.objectUrl,
            prescriptionGivenBy: selectedDoctorId,
          };
          addPrescriptionById(data).then((res) => {
            const d = {
              prescriptionId: res.data.data,
              patientId: user_id,
            };
            onSuccess();
            closeModal();
          });
        })
        .catch((err) => {
          console.log("error in adding msg with image", err);
          return;
        });
    }
  };

  const handleSelectChange = (e) => {
    setSelectedDoctorId(e.target.value);
  };
  const fetchMedicalTeam = async (user_id) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${server_url}/patient/getMedicalTeam/${user_id}`
      );
      // console.log(response.data)
      setDoctorOptions(response.data.data);
      setSelectedDoctorId(response.data.data[0].id);
    } catch (error) {
      console.error("Error fetching medical team:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      fetchMedicalTeam(user_id);
    } catch (error) {
      console.log(error);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Upload Prescription</h2>
          </div>
          <div className="p-4 overflow-y-auto max-h-[80vh]">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Prescription Date:
              </label>
              <input
                type="date"
                id="Date"
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                value={selectedDate}
                max={getCurrentDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Prescription Given by:
              </label>
              <select
                id="doctorId"
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                value={selectedDoctorId}
                onChange={handleSelectChange}>
                {Array.isArray(doctorOptions) &&
                  doctorOptions.map((doctor, index) => (
                    <option key={index} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                File:
              </label>
              <input
                multiple
                type="file"
                onChange={handleImageChange}
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                required
              />
            </div>
            <div className="mt-4">
              {showWebcam ? (
                <>
                  <Webcam
                    audio={false}
                    height={720}
                    screenshotFormat="image/jpeg"
                    width={720}
                    videoConstraints={videoConstraints}>
                    {({ getScreenshot }) => (
                      <div>
                        <div className="flex justify-center p-4">
                          <button
                            onClick={() => capture(getScreenshot)}
                            className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Capture photo
                          </button>
                        </div>
                        <div className="flex flex-row">
                          {capturedImages.map((image, index) => (
                            <div key={index} className="flex flex-row mt-4">
                              <div className="flex flex-row">
                                <img
                                  src={image}
                                  alt={`Captured ${index}`}
                                  className="w-32 h-32"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Webcam>
                </>
              ) : (
                <div className="flex justify-center p-4">
                  <button
                    onClick={handleCaptureOption}
                    className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Capture Image
                  </button>
                </div>
              )}
            </div>
            <div className="text-[#ff0000]">{msg}</div>
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Submit
            </button>
            <button
              onClick={closeModal.bind(null, false)}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionModal;
