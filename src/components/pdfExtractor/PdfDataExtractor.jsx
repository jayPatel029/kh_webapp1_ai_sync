import axios from "axios";
import React, { useState } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
const PdfDataExtractor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axiosInstance.post(
          `${server_url}/patientdata/extractTextFromPdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setText(response.data.text);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>PDF Text Extractor</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Upload and Extract</button>
      <div>
        <h2>Extracted Text:</h2>
        <div className="text-container">{text}</div>
      </div>
    </div>
  );
};

export default PdfDataExtractor;
