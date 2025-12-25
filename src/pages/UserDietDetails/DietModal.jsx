import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";  
import { server_url } from "../../constants/constants";
import { useParams } from "react-router-dom";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";
import jsPDF from "jspdf";

const DietModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("Select");
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const { id } = useParams();
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

  const handleSubmit = async () => {
    // if(!selectedDate || !selectedReportType || !description){
    //   setMsg("Please fill required fields");
    //   return;
    // }
    console.log(user_id);
    if (selectedImage) {
      getFileRes(selectedImage)
        .then(async (res) => {
          console.log("res", res);
          if (res.data.objectUrl === undefined) {
            alert("failed to upload you document, please try again later");
            return;
          }
          let data = {
            date: selectedDate,
            type: selectedReportType,
            img: res.data.objectUrl,
            desc: description,
            patientId: id,
          };
    console.log("uploading diet", data);
          // uploadDietDetails(data).then((res) => {
          //   onSuccess();
          //   closeModal();
          // window.location.reload();
          await uploadDietDetails(data);
          onSuccess();
          closeModal();
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
        doc.addImage(image.data, "JPEG", 10, 20, 200, 200);
      }

      doc.setProperties({
        title: "DietDetail.pdf",
      });
      console.log(doc.title);
      const file = doc.output("blob");
      // const imageData = await getFileRes(file);
      // const imageUrl = imageData.data.objectUrl;
      // console.log(typeof doc);
      // console.log(imageUrl);
      getFileRes(file, "DietDetail.pdf")
        .then(async (res) => {
          console.log("res", res);
          if (res.data.objectUrl === undefined) {
            alert("failed to upload you document, please try again later");
            return;
          }
          let data = {
            date: selectedDate,
            type: selectedReportType,
            img: res.data.objectUrl,
            desc: description,
            patientId: id,
          };
          // await uploadLabReports(data);
          await uploadDietDetails(data);
          onSuccess();
          closeModal();
        })
        .catch((err) => {
          console.log("error in adding msg with image", err);
          return;
        });
    }
    console.log("no image selected!!");
  };

  const uploadDietDetails = async (data) => {
    try {
      const result = await axiosInstance.post(
        `${server_url}/dietdetails/insertDietDetailsAdmin`,
        data
      );
      console.log("Response:", result.data);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 w-full bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Upload Diet Reports</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Diet Date:
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
                Diet Type:
              </label>
              <select
                name=""
                id=""
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
              >
                <option>Select</option>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Description:
              </label>
              <textarea
                id="description"
                cols="50"
                rows="5"
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Image:
              </label>
              <input
                multiple
                type="file"
                id="image"
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                onChange={handleImageChange}
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

export default DietModal;
