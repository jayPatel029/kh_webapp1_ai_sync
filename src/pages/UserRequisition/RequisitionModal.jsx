import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";
import jsPDF from "jspdf";

const RequisitionModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const email = localStorage.getItem("email");
  const [msg, setMsg] = useState("");

  const handleImageChange = (e) => {
    // const file = e.target.files[0];
    // setSelectedImage(file);
    // console.log("Image Selected:", file);
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

  const handleSubmit = () => {
    console.log(user_id);
    console.log(selectedDate);
    console.log(selectedImage);

    if(!selectedDate) {
      setMsg("Please select a valid date");
      return;
    }
    if(!selectedImage) {
      setMsg("Please upload atleast one document or image");
      return;
    }
    if (selectedImage) {
      getFileRes(selectedImage)
        .then((res) => {
          console.log("res", res);
          if (res.data.objectUrl === undefined) {
            alert("failed to upload you document, please try again later");
            return;
          }
          let data = {
            email:email,
            Patient_id: user_id,
            Date: selectedDate,
            Requisition: res.data.objectUrl,
          };

          UploadRequisition(data).then(() => {
            onSuccess();
          });
        })
        .catch((err) => {
          console.log("error in adding msg with image", err);
          return;
        })
        .finally(() => {
          closeModal();
        });
    } else if (selectedImages.length > 1) {
      const doc = new jsPDF();
      for (let i = 0; i < selectedImages.length; i++) {
        if (i > 0) {
          doc.addPage();
        }
        const image = selectedImages[i];
        // doc.text(image.name, 10, 10);
        doc.addImage(image.data, "JPEG", 10, 20, 200, 200);
      }

      doc.setProperties({
        title: "Requisition.pdf",
      });
      console.log(doc.title);
      const file = doc.output("blob");
      // const imageData = await getFileRes(file);
      // const imageUrl = imageData.data.objectUrl;
      // console.log(typeof doc);
      // console.log(imageUrl);
      getFileRes(file, "Requisition.pdf")
        .then(async (res) => {
          console.log("res", res);
          if (res.data.objectUrl === undefined) {
            alert("failed to upload you document, please try again later");
            return;
          }
          let data = {
            email:email,
            Patient_id: user_id,
            Date: selectedDate,
            Requisition: res.data.objectUrl,
          };
          UploadRequisition(data).then(() => {
            onSuccess();
            closeModal();
          });
        })
        .catch((err) => {
          console.log("error in adding msg with image", err);
          return;
        });
    }
    // window.location.reload();
  };
  const UploadRequisition = async (data) => {
    axiosInstance
      .post(`${server_url}/requisition/add`, data)
      .then((response) => {
        createAlert(response.data.data);
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  const createAlert = async (id) => {
    const data = {
      requisitionId: id,
      patientId: user_id,
    };
    const response = await axiosInstance.post(
      `${server_url}/alerts/newRequisition`,
      data
    );
    console.log(response);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Upload Requisition</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Requisition Date:
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
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Image:
              </label>
              <input
                multiple
                type="file"
                onChange={handleImageChange}
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                required
              />
            </div>
            <div className="text-[#ff0000]">{msg}</div>
          </div>
          <div className="flex justify-end p-4">

            <button
              onClick={handleSubmit}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
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
  );
};

export default RequisitionModal;
