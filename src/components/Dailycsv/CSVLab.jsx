import React, { useState } from "react";
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";
import axiosInstance from "../../helpers/axios/axiosInstance";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);
const GREY_DIM = "#686868";

export default function CSVReader({ setData, setSuccess, success, languages }) {
  const { CSVReader } = useCSVReader();

  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );
  const [headData, setHeadData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({
    title: "",
    type: "",
    assign_range: "",
    ailments: [],
    low_range: "",
    high_range: "",
    isGraph: "",
    unit: "",
    sendAlert: "",
    alertTextDoc: "",
    condition: "",
    Hindi: "",
    Gujarati: "",
    Kannada: "",
    Assamese: "",
    Marathi: "",
    Tamil: "",
    Punjabi: "",
    Telugu: "",
    Malayalam: "",
    Bangali: "",
  });

  const [csvData, setCsvData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);

  const handleSubmit = () => {
    console.log("these are the langs:", languages);
    const mappedData = csvData
      .map((row) => {
        // Indexes for Hindi and Assamese columns
        const hindiColumnIndex = columnOptions.indexOf(columnMappings.Hindi);
        const asameseColumnIndex = columnOptions.indexOf(
          columnMappings.Assamese
        );
        const gujaratiColumnIndex = columnOptions.indexOf(
          columnMappings.Gujarati
        );
        const kannadaColumnIndex = columnOptions.indexOf(
          columnMappings.Kannada
        );
        const marathiColumnIndex = columnOptions.indexOf(
          columnMappings.Marathi
        );
        const tamilColumnIndex = columnOptions.indexOf(columnMappings.Tamil);
        const punjabiColumnIndex = columnOptions.indexOf(
          columnMappings.Punjabi
        );
        const teluguColumnIndex = columnOptions.indexOf(columnMappings.Telugu);
        const malayalamColumnIndex = columnOptions.indexOf(
          columnMappings.Malayalam
        );
        const bangaliColumnIndex = columnOptions.indexOf(
          columnMappings.Bangali
        );

        let filterLanguages = languages.filter((language) => language.id !== 1);
        // Create the languageTranslations object
        let languageTranslations = {};
        filterLanguages.forEach((language) => {
          if (language.language_name === "Hindi") {
            languageTranslations[language.id] = row[hindiColumnIndex];
          } else if (language.language_name === "Assamese") {
            languageTranslations[language.id] = row[asameseColumnIndex];
          } else if (language.language_name === "Gujarati") {
            languageTranslations[language.id] = row[gujaratiColumnIndex];
          } else if (language.language_name === "Kannada") {
            languageTranslations[language.id] = row[kannadaColumnIndex];
          } else if (language.language_name === "Marathi") {
            languageTranslations[language.id] = row[marathiColumnIndex];
          } else if (language.language_name === "Tamil") {
            languageTranslations[language.id] = row[tamilColumnIndex];
          } else if (language.language_name === "Punjabi") {
            languageTranslations[language.id] = row[punjabiColumnIndex];
          } else if (language.language_name === "Telugu") {
            languageTranslations[language.id] = row[teluguColumnIndex];
          } else if (language.language_name === "Malayalam") {
            languageTranslations[language.id] = row[malayalamColumnIndex];
          } else if (language.language_name === "Bangali") {
            languageTranslations[language.id] = row[bangaliColumnIndex];
          }
        });
        console.log("these are the langs again:", languages);
        return {
          title: columnMappings.title
            ? row[columnOptions.indexOf(columnMappings.title)]
            : undefined,
          type: columnMappings.type
            ? row[columnOptions.indexOf(columnMappings.type)]
            : undefined,
          assign_range: columnMappings.assign_range
            ? row[columnOptions.indexOf(columnMappings.assign_range)]
            : undefined,
          ailments: columnMappings.ailments
            ? row[columnOptions.indexOf(columnMappings.ailments)]
            : undefined,
          low_range: columnMappings.low_range
            ? row[columnOptions.indexOf(columnMappings.low_range)]
            : undefined,
          high_range: columnMappings.high_range
            ? row[columnOptions.indexOf(columnMappings.high_range)]
            : undefined,
          isGraph: columnMappings.isGraph
            ? row[columnOptions.indexOf(columnMappings.isGraph)]
            : undefined,
          unit: columnMappings.unit
            ? row[columnOptions.indexOf(columnMappings.unit)]
            : undefined,
          sendAlert: columnMappings.sendAlert
            ? row[columnOptions.indexOf(columnMappings.sendAlert)]
            : undefined,
          alertTextDoc: columnMappings.alertTextDoc
            ? row[columnOptions.indexOf(columnMappings.alertTextDoc)]
            : undefined,
          condition: columnMappings.condition
            ? row[columnOptions.indexOf(columnMappings.condition)]
            : undefined,
          hindi: columnMappings.Hindi
            ? row[columnOptions.indexOf(columnMappings.Hindi)]
            : undefined,
          asameese: columnMappings.Assamese
            ? row[columnOptions.indexOf(columnMappings.Assamese)]
            : undefined,
          gujarati: columnMappings.Gujarati
            ? row[columnOptions.indexOf(columnMappings.Gujarati)]
            : undefined,
          kannada: columnMappings.Kannada
            ? row[columnOptions.indexOf(columnMappings.Kannada)]
            : undefined,
          marathi: columnMappings.Marathi
            ? row[columnOptions.indexOf(columnMappings.Marathi)]
            : undefined,
          tamil: columnMappings.Tamil
            ? row[columnOptions.indexOf(columnMappings.Tamil)]
            : undefined,
          punjabi: columnMappings.Punjabi
            ? row[columnOptions.indexOf(columnMappings.Punjabi)]
            : undefined,
          telugu: columnMappings.Telugu
            ? row[columnOptions.indexOf(columnMappings.Telugu)]
            : undefined,
          malayalam: columnMappings.Malayalam
            ? row[columnOptions.indexOf(columnMappings.Malayalam)]
            : undefined,
          bangali: columnMappings.Bangali
            ? row[columnOptions.indexOf(columnMappings.Bangali)]
            : undefined,
          languageTranslation: languageTranslations, // Map language translations
        };
      })
      .filter((item) =>
        Object.values(item).some((value) => value !== undefined)
      );

    const trimmedMappedData = mappedData.slice(1); // Remove header row
    setData(trimmedMappedData);
    setSuccess(!success);

    let data = { data: trimmedMappedData };
    console.log("Mapped this Data:", data);
    console.log(
      "Language Translations:",
      data.data.map((item) => item.languageTranslation)
    );
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
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
        Remove,
      }) => (
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
                  <span className="block text-sm font-medium">
                    {formatFileSize(acceptedFile.size)}
                  </span>
                  <span className="block text-xs">{acceptedFile.name}</span>
                </div>
                <ProgressBar className="absolute bottom-0 w-full" />
                <div
                  {...getRemoveFileProps()}
                  className="absolute top-0 right-0 p-1 cursor-pointer"
                  onMouseOver={() =>
                    setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT)
                  }
                  onMouseOut={() =>
                    setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR)
                  }
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
              <h2 className="text-xl font-semibold mb-4">First Five Entries</h2>
              <div className="overflow-auto max-h-80 w-full">
                <table className="table-auto border-collapse border border-gray-300 w-full">
                  <thead>
                    <tr className="bg-gray-200">
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
            </div>
          )}

          {headData.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Match the Columns</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(columnMappings).map(([key, value]) => (
                  <li key={key} className="flex flex-col space-y-2">
                    <label htmlFor={key} className="font-medium">
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
                      className="border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
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
