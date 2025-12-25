import React, { useState } from "react";
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);
const GREY_DIM = "#686868";

const styles = {
  zone: {
    alignItems: "center",
    border: `2px dashed ${GREY}`,
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    padding: 20,
  },
  file: {
    background: "linear-gradient(to bottom, #EEE, #DDD)",
    borderRadius: 20,
    display: "flex",
    height: 120,
    width: 120,
    position: "relative",
    zIndex: 10,
    flexDirection: "column",
    justifyContent: "center",
  },
  info: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    paddingLeft: 10,
    paddingRight: 10,
  },
  size: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    marginBottom: "0.5em",
    justifyContent: "center",
    display: "flex",
  },
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    fontSize: 12,
    marginBottom: "0.5em",
  },
  progressBar: {
    bottom: 14,
    position: "absolute",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
  },
  zoneHover: {
    borderColor: GREY_DIM,
  },
  default: {
    borderColor: GREY,
  },
  remove: {
    height: 23,
    position: "absolute",
    right: 6,
    top: 6,
    width: 23,
  },
};

export default function CSVReader({ setData, setSuccess, success, patientId }) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );
  const [headData, setHeadData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({
    eGFR: "",
    calcium: "",
    acr: "",
    phosphorous: "",
    bicarbonate: "",
    albumin: "",
  });

  const [csvData, setCsvData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);

  const handleSubmit = () => {
    const mappedData = csvData
      .map((row) => ({
        patientId: patientId,  // Directly using the provided patientId
        eGFR: columnMappings.eGFR
          ? row[columnOptions.indexOf(columnMappings.eGFR)]
          : undefined,
        calcium: columnMappings.calcium
          ? row[columnOptions.indexOf(columnMappings.calcium)]
          : undefined,
        acr: columnMappings.acr
          ? row[columnOptions.indexOf(columnMappings.acr)]
          : undefined,
        phosphorous: columnMappings.phosphorous
          ? row[columnOptions.indexOf(columnMappings.phosphorous)]
          : undefined,
        bicarbonate: columnMappings.bicarbonate
          ? row[columnOptions.indexOf(columnMappings.bicarbonate)]
          : undefined,
        albumin: columnMappings.albumin
          ? row[columnOptions.indexOf(columnMappings.albumin)]
          : undefined,
      }))
      .filter((item) => Object.values(item).some((value) => value !== undefined));

    const trimmedMappedData = mappedData.slice(1);
    setData(trimmedMappedData);
    setSuccess(!success);

   
  };

  return (
    <CSVReader
      onUploadAccepted={(results) => {
        setZoneHover(false);
        if (results.data.length > 0) {
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
        <div className="flex flex-col">
          <div
            {...getRootProps()}
            style={Object.assign({}, styles.zone, zoneHover && styles.zoneHover)}
          >
            {acceptedFile ? (
              <div style={styles.file}>
                <div style={styles.info}>
                  <span style={styles.size}>{formatFileSize(acceptedFile.size)}</span>
                  <span style={styles.name}>{acceptedFile.name}</span>
                </div>
                <div style={styles.progressBar}>
                  <ProgressBar />
                </div>
                <div
                  {...getRemoveFileProps()}
                  style={styles.remove}
                  onMouseOver={(event) => {
                    event.preventDefault();
                    setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                  }}
                  onMouseOut={(event) => {
                    event.preventDefault();
                    setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                  }}
                  onClick={() => {
                    setCsvData([]);
                    setHeadData([]);
                    setColumnOptions([]);
                    setColumnMappings({
                      eGFR: "",
                      calcium: "",
                      acr: "",
                      phosphorous: "",
                      bicarbonate: "",
                      albumin: "",
                    });
                  }}
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
              <h2 className="text-xl font-bold mb-4">First Five Entries</h2>
              <table className="table-auto">
                <thead>
                  <tr>
                    {headData[0].map((item, index) => (
                      <th key={index} className="border px-4 py-2">
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {headData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border px-4 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {headData.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mt-8 mb-4">Match the Columns</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(columnMappings).map(([key, value]) => (
                  <li key={key}>
                    <label htmlFor={key} className="block font-semibold">
                      {key}
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
                      className="border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
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
                  onClick={handleSubmit}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit edited
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </CSVReader>
  );
}
