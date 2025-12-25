import React, { useState, useEffect } from "react";
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);

export default function CSVReader({ setData, setSuccess, success, patientId }) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );
  const [headData, setHeadData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({ Date: "" });
  const [csvData, setCsvData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch column names from the server
  useEffect(() => {
    const fetchColumnNames = async () => {
      try {
        const response = await axiosInstance.get(`${server_url}/labreport/getColumnNames`);
        const fetchedColumns = response.data; // Assume response.data is an array of column names
        const initialMappings = fetchedColumns.data.reduce((acc, column) => {
          acc[column.title] = "";
          return acc;
        }, { Date: "" }); // Ensure "Date" is always included
        setColumnMappings(initialMappings);
      } catch (error) {
        console.error("Error fetching column names:", error);
        alert("Failed to fetch column names. Please try again later.");
      }
    };

    fetchColumnNames();
  }, []);

  const handleAddNewField = () => {
    const newFieldKey = `New_Field_${Object.keys(columnMappings).length + 1}`;
    const fieldName = prompt("Enter a name for the new field:");
    if (fieldName) {
      setColumnMappings({
        ...columnMappings,
        [fieldName]: "",
      });
    }
  };

  const handleSubmit = () => {
    // Ensure "Date" field is mapped
    if (!columnMappings.Date) {
      alert("Please map the 'Date' field before submitting.");
      return;
    }

    const mappedData = csvData
      .map((row) => {
        const mappedRow = {};
        for (const [key, value] of Object.entries(columnMappings)) {
          if (value) {
            mappedRow[key] = row[columnOptions.indexOf(value)];
          }
        }
        return mappedRow;
      })
      .filter((item) => Object.values(item).some((value) => value !== undefined));

    const trimmedMappedData = mappedData.slice(1);
    setData(trimmedMappedData);
    setSuccess(!success);

    if (selectedFile) {
      getFileRes(selectedFile)
        .then(async (res) => {
          if (res.data.objectUrl === undefined) {
            alert("Failed to upload your document, please try again later.");
            return;
          }

          const data = {
            data: trimmedMappedData,
            patient_id: patientId,
            Report_Type: "Lab",
            Lab_Report: res.data.objectUrl,
          };

          try {
            const res= await axiosInstance.post(`${server_url}/labreport/addBulkIndividual`, data);
            setCsvData([]);
            setHeadData([]);
            if (res.status === 200) {
              alert("Data submitted successfully.");
            }
          } catch (error) {
            console.error("Error submitting data:", error);
          }
        })
        .catch((error) => console.error("Error uploading file:", error));
    }
  };

  return (
    <CSVReader
      onUploadAccepted={(results, acceptedFile) => {
        setZoneHover(false);
        if (results.data.length > 0) {
          setSelectedFile(acceptedFile);
          setCsvData(results.data);
          setHeadData(results.data.slice(0, 5)); // Get the first five entries
          setColumnOptions(results.data[0]);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setZoneHover(false);
      }}
    >
      {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }) => (
        <div className="flex flex-col space-y-6">
          <div
            {...getRootProps()}
            className={`flex justify-center items-center p-6 border-2 ${
              zoneHover ? "border-gray-500" : "border-gray-300"
            } rounded-lg`}
          >
            {acceptedFile ? (
              <div className="relative flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg">
                <div className="text-center">
                  <span className="block text-sm font-medium">{formatFileSize(acceptedFile.size)}</span>
                  <span className="block text-xs">{acceptedFile.name}</span>
                </div>
                <ProgressBar className="absolute bottom-0 w-full" />
                <div
                  {...getRemoveFileProps()}
                  className="absolute top-0 right-0 p-1 cursor-pointer"
                  onMouseOver={() => setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT)}
                  onMouseOut={() => setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR)}
                >
                  <Remove color={removeHoverColor} />
                </div>
              </div>
            ) : (
              "Drop CSV file here or click to upload"
            )}
          </div>

          {headData.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Match the Columns</h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(columnMappings).map(([key, value]) => (
                  <li key={key} className="flex flex-col space-y-2">
                    <label htmlFor={key} className="font-medium">
                      {key} {key === "Date" && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      id={key}
                      value={value}
                      onChange={(e) =>
                        setColumnMappings({
                          ...columnMappings,
                          [key]: e.target.value,
                        })
                      }
                      className={`border px-4 py-2 rounded focus:outline-none ${
                        key === "Date" && !value ? "border-red-500" : "focus:border-blue-500"
                      }`}
                    >
                      <option value="">Select Column</option>
                      {columnOptions.map((column, index) => (
                        <option key={index} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <button
                  onClick={handleAddNewField}
                  className="mt-4 bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Add New Field
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Submit Edited
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </CSVReader>
  );
}
