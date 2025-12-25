import React, { useState } from "react";
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";
import axiosInstance from "../../helpers/axios/axiosInstance";

import PdfComponent from "../../components/pdf/PdfComponent";
import UploadBulkProfile from "./uploadBulkProfileQuestions";
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

export default function CSVReader({ predefinedColumns }) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );
  const [headData, setHeadData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({
    date: "",
    labreportType: "",
    readings: "",
  });

  const [csvData, setCsvData] = useState([]);

  const [columnOptions, setColumnOptions] = useState([]);
  const [file, setFile] = React.useState();

  const getFile = (event) => {
    setFile(event.target.files);
  };
  const submit = async () => {
    var encodedPDF;
    for (var i = 0; i < file["length"]; i++) {
      encodedPDF = await encodeBase64(file[i]);
    }
    console.log(encodedPDF);
  };

  var fileBase64 = []
  async function encodeBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve) => {
      reader.onload = async () => {
        var base64 = reader.result;
        //getItems function to be called 
        fileBase64.push({
          name: file.name,
          encrypt: base64
          //Text to be added here later
        });
        resolve(fileBase64)
      };
    })}
    



    // const pdfExtract = new PDFExtract();
    // const options = {}; /* see below */
    // pdfExtract.extract('test.pdf', options, (err, data) => {
    //     if (err) return console.log(err);
    //     console.log(data);
    // });

    const handleSubmit = () => {
      console.log("in submit");
      console.log("formatting the csv file here !!");
      console.log(csvData);

      const mappedData = csvData
        .map((row) => ({
          date:
            columnMappings.date !== ""
              ? row[columnOptions.indexOf(columnMappings.date)]
              : undefined,
          labreportType:
            columnMappings.labreportType !== ""
              ? row[columnOptions.indexOf(columnMappings.labreportType)]
              : undefined,
          readings:
            columnMappings.readings !== ""
              ? row[columnOptions.indexOf(columnMappings.readings)]
              : undefined,
        }))
        .filter(
          (item) =>
            item.date !== undefined ||
            item.labreportType !== undefined ||
            item.readings !== undefined
        );

      const trimmedMappedData = mappedData.slice(1);
      console.log(trimmedMappedData);

      let data = {
        data: trimmedMappedData,
      };

      axiosInstance
        .post(`${server_url}/api/labreport/addBulkIndividual`, data)
        .then((response) => {
          // Handle the response data
          console.log("Response:", response.data);
          setCsvData([]);
          setHeadData([]);
        })
        .catch((error) => {
          // Handle any errors that occurred during the request
          console.error("Error:", error);
        });
    };

    return (
      <CSVReader
        onUploadAccepted={(results) => {
          // console.log('---------------------------');
          // console.log(results);
          // console.log('---------------------------');
          setZoneHover(false);
          if (results.data.length > 0) {
            setCsvData(results.data);
            setHeadData(results.data.slice(0, 5)); // Get the first five entries
            // console.log(results.data[0])
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
        {({
          getRootProps,
          acceptedFile,
          ProgressBar,
          getRemoveFileProps,
          Remove,
        }) => (
          <>
            <div
              {...getRootProps()}
              style={Object.assign(
                {},
                styles.zone,
                zoneHover && styles.zoneHover
              )}
            >
              {acceptedFile ? (
                <>
                  <div style={styles.file}>
                    <div style={styles.info}>
                      <span style={styles.size}>
                        {formatFileSize(acceptedFile.size)}
                      </span>
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
                    >
                      <Remove color={removeHoverColor} />
                    </div>
                  </div>
                </>
              ) : (
                "Drop CSV file here or click to upload"
              )}
            </div>

            <div>
              {headData.length > 0 && (
                <div>
                  <h2>First Five Entries</h2>
                  <table>
                    <thead>
                      <tr>
                        {headData[0].map((item, index) => (
                          <th key={index}>{item}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {headData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {headData.length > 0 && (
                <div>
                  <h2>Match the Columns</h2>
                  <ul>
                    <li>
                      <label htmlFor="date">Date:</label>
                      <select
                        id="date"
                        value={columnMappings.date}
                        onChange={(e) =>
                          setColumnMappings({
                            ...columnMappings,
                            date: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Column</option>
                        {columnOptions &&
                          columnOptions.map((column, index) => (
                            <option key={index} value={column}>
                              {column}
                            </option>
                          ))}
                      </select>
                    </li>
                    <li>
                      <label htmlFor="labreportType">Lab Report Type:</label>
                      <select
                        id="labreportType"
                        value={columnMappings.labreportType}
                        onChange={(e) =>
                          setColumnMappings({
                            ...columnMappings,
                            labreportType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Column</option>
                        {columnOptions &&
                          columnOptions.map((column, index) => (
                            <option key={index} value={column}>
                              {column}
                            </option>
                          ))}
                      </select>
                    </li>
                    <li>
                      <label htmlFor="readings">Readings:</label>
                      <select
                        id="readings"
                        value={columnMappings.readings}
                        onChange={(e) =>
                          setColumnMappings({
                            ...columnMappings,
                            readings: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Column</option>
                        {columnOptions &&
                          columnOptions.map((column, index) => (
                            <option key={index} value={column}>
                              {column}
                            </option>
                          ))}
                      </select>
                    </li>
                  </ul>
                  <div>
                    <button
                      onClick={handleSubmit}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              accept=".pdf"
              type="file"
              name="file"
              multiple
              id="file"
              className="inputfile"
              onChange={(e) => getFile(e)}
            />
            <button onClick={submit}>Upload</button>
          </>
        )}
      </CSVReader>
    );
  }

