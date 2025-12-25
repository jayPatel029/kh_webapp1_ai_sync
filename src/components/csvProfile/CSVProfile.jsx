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
    type: "",
    name: "",
    ailments: [],
    options: "",
    Hindi: "",
    HindiOpt: "",
    Marathi: "",
    MarathiOpt: "",
    Assamese: "",
    AssameseOpt: "",
    Kannada: "",
    KannadaOpt: "",
    Tamil: "",
    TamilOpt: "",
    Malayalam: "",
    MalayalamOpt: "",
    Bangali: "",
    BangaliOpt: "",
    Punjabi: "",
    PunjabiOpt: "",
    Telugu: "",
    TeluguOpt: "",
    Gujarati: "",
    GujaratiOpt: "",
  });

  const [csvData, setCsvData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);

  const handleSubmit = () => {
    console.log("these are the langs again:", languages);

    const mappedData = csvData
      .map((row) => {
        const hindiColumnIndex = columnOptions.indexOf(columnMappings.Hindi);
        const hindiOptColumnIndex = columnOptions.indexOf(
          columnMappings.HindiOpt
        );

        const marathiColumnIndex = columnOptions.indexOf(
          columnMappings.Marathi
        );
        const marathiOptColumnIndex = columnOptions.indexOf(
          columnMappings.MarathiOpt
        );

        const assameseColumnIndex = columnOptions.indexOf(
          columnMappings.Assamese
        );
        const assameseOptColumnIndex = columnOptions.indexOf(
          columnMappings.AssameseOpt
        );

        const gujaratiColumnIndex = columnOptions.indexOf(
          columnMappings.Gujarati
        );
        const gujaratiOptColumnIndex = columnOptions.indexOf(
          columnMappings.GujaratiOpt
        );

        const kannadaColumnIndex = columnOptions.indexOf(
          columnMappings.Kannada
        );
        const kannadaOptColumnIndex = columnOptions.indexOf(
          columnMappings.KannadaOpt
        );

        const tamilColumnIndex = columnOptions.indexOf(columnMappings.Tamil);
        const tamilOptColumnIndex = columnOptions.indexOf(
          columnMappings.TamilOpt
        );

        const punjabiColumnIndex = columnOptions.indexOf(
          columnMappings.Punjabi
        );
        const punjabiOptColumnIndex = columnOptions.indexOf(
          columnMappings.PunjabiOpt
        );

        const malayalamColumnIndex = columnOptions.indexOf(
          columnMappings.Malayalam
        );
        const malayalamOptColumnIndex = columnOptions.indexOf(
          columnMappings.MalayalamOpt
        );

        const teluguColumnIndex = columnOptions.indexOf(columnMappings.Telugu);
        const teluguOptColumnIndex = columnOptions.indexOf(
          columnMappings.TeluguOpt
        );

        const bangaliColumnIndex = columnOptions.indexOf(
          columnMappings.Bangali
        );
        const bangaliOptColumnIndex = columnOptions.indexOf(
          columnMappings.BangaliOpt
        );

        const filteredLanguages = (languages || []).filter(
          (language) => language.id !== 1
        );

        let languageTranslations = {};

        filteredLanguages.forEach((language) => {
          if (language.language_name === "Hindi") {
            languageTranslations[language.id] = {
              text: row[hindiColumnIndex] || "",
              options: row[hindiOptColumnIndex] || "",
            };
          } else if (language.language_name === "Marathi") {
            languageTranslations[language.id] = {
              text: row[marathiColumnIndex] || "",
              options: row[marathiOptColumnIndex] || "",
            };
          } else if (language.language_name === "Assamese") {
            languageTranslations[language.id] = {
              text: row[assameseColumnIndex] || "",
              options: row[assameseOptColumnIndex] || "",
            };
          } else if (language.language_name === "Gujarati") {
            languageTranslations[language.id] = {
              text: row[gujaratiColumnIndex] || "",
              options: row[gujaratiOptColumnIndex] || "",
            };
          } else if (language.language_name === "Kannada") {
            languageTranslations[language.id] = {
              text: row[kannadaColumnIndex] || "",
              options: row[kannadaOptColumnIndex] || "",
            };
          } else if (language.language_name === "Tamil") {
            languageTranslations[language.id] = {
              text: row[tamilColumnIndex] || "",
              options: row[tamilOptColumnIndex] || "",
            };
          } else if (language.language_name === "Punjabi") {
            languageTranslations[language.id] = {
              text: row[punjabiColumnIndex] || "",
              options: row[punjabiOptColumnIndex] || "",
            };
          } else if (language.language_name === "Telugu") {
            languageTranslations[language.id] = {
              text: row[teluguColumnIndex] || "",
              options: row[teluguOptColumnIndex] || "",
            };
          } else if (language.language_name === "Malayalam") {
            languageTranslations[language.id] = {
              text: row[malayalamColumnIndex] || "",
              options: row[malayalamOptColumnIndex] || "",
            };
          } else if (language.language_name === "Bangali") {
            languageTranslations[language.id] = {
              text: row[bangaliColumnIndex] || "",
              options: row[bangaliOptColumnIndex] || "",
            };
          }
        });

        return {
          type: columnMappings.type
            ? row[columnOptions.indexOf(columnMappings.type)]
            : undefined,
          ailments: columnMappings.ailments
            ? row[columnOptions.indexOf(columnMappings.ailments)]
            : undefined,
          name: columnMappings.name
            ? row[columnOptions.indexOf(columnMappings.name)]
            : undefined,
          options: columnMappings.options
            ? row[columnOptions.indexOf(columnMappings.options)]
            : undefined,
          Hindi: columnMappings.Hindi
            ? row[columnOptions.indexOf(columnMappings.Hindi)]
            : undefined,
          HindiOpt: columnMappings.HindiOpt
            ? row[columnOptions.indexOf(columnMappings.HindiOpt)]
            : undefined,
          Marathi: columnMappings.Marathi
            ? row[columnOptions.indexOf(columnMappings.Marathi)]
            : undefined,
          MarathiOpt: columnMappings.MarathiOpt
            ? row[columnOptions.indexOf(columnMappings.MarathiOpt)]
            : undefined,

          Assamese: columnMappings.Assamese
            ? row[columnOptions.indexOf(columnMappings.Assamese)]
            : undefined,
          AssameseOpt: columnMappings.AssameseOpt
            ? row[columnOptions.indexOf(columnMappings.AssameseOpt)]
            : undefined,

          Gujarati: columnMappings.Gujarati
            ? row[columnOptions.indexOf(columnMappings.Gujarati)]
            : undefined,
          GujaratiOpt: columnMappings.GujaratiOpt
            ? row[columnOptions.indexOf(columnMappings.GujaratiOpt)]
            : undefined,

          Kannada: columnMappings.Kannada
            ? row[columnOptions.indexOf(columnMappings.Kannada)]
            : undefined,
          KannadaOpt: columnMappings.KannadaOpt
            ? row[columnOptions.indexOf(columnMappings.KannadaOpt)]
            : undefined,

          Tamil: columnMappings.Tamil
            ? row[columnOptions.indexOf(columnMappings.Tamil)]
            : undefined,
          TamilOpt: columnMappings.TamilOpt
            ? row[columnOptions.indexOf(columnMappings.TamilOpt)]
            : undefined,

          Punjabi: columnMappings.Punjabi
            ? row[columnOptions.indexOf(columnMappings.Punjabi)]
            : undefined,
          PunjabiOpt: columnMappings.PunjabiOpt
            ? row[columnOptions.indexOf(columnMappings.PunjabiOpt)]
            : undefined,

          Punjabi: columnMappings.Punjabi
            ? row[columnOptions.indexOf(columnMappings.Punjabi)]
            : undefined,
          PunjabiOpt: columnMappings.PunjabiOpt
            ? row[columnOptions.indexOf(columnMappings.PunjabiOpt)]
            : undefined,
          Telugu: columnMappings.Telugu
            ? row[columnOptions.indexOf(columnMappings.Telugu)]
            : undefined,
          TeluguOpt: columnMappings.TeluguOpt
            ? row[columnOptions.indexOf(columnMappings.TeluguOpt)]
            : undefined,
          Malayalam: columnMappings.Malayalam
            ? row[columnOptions.indexOf(columnMappings.Malayalam)]
            : undefined,
          MalayalamOpt: columnMappings.MalayalamOpt
            ? row[columnOptions.indexOf(columnMappings.MalayalamOpt)]
            : undefined,
          Bangali: columnMappings.Bangali
            ? row[columnOptions.indexOf(columnMappings.Bangali)]
            : undefined,
          BangaliOpt: columnMappings.BangaliOpt
            ? row[columnOptions.indexOf(columnMappings.BangaliOpt)]
            : undefined,
          languageTranslation: languageTranslations,
        };
      })
      .filter((i) => Object.values(i).some((val) => val !== undefined));
    // const mappedData = csvData
    //   .map((row) => ({
    //     // Directly using the provided patientId
    //     type: columnMappings.type
    //       ? row[columnOptions.indexOf(columnMappings.type)]
    //       : undefined,

    //     ailments: columnMappings.ailments
    //       ? row[columnOptions.indexOf(columnMappings.ailments)]
    //       : undefined,
    //     Name: columnMappings.name
    //       ? row[columnOptions.indexOf(columnMappings.name)]
    //       : undefined,
    //     Options: columnMappings.options
    //       ? row[columnOptions.indexOf(columnMappings.options)]
    //       : undefined,

    //     Hindi: columnMappings.Hindi
    //       ? row[columnOptions.indexOf(columnMappings.Hindi)]
    //       : undefined,
    //     HindiOpt: columnMappings.HindiOpt
    //       ? row[columnOptions.indexOf(columnMappings.HindiOpt)]
    //       : undefined,
    //   }))
    //   .filter((item) =>
    //     Object.values(item).some((value) => value !== undefined)
    //   );

    const trimmedMappedData = mappedData.slice(1);
    setData(trimmedMappedData);
    setSuccess(!success);

    let data = { data: trimmedMappedData };
    console.log("Data:", data);
    console.log(
      "Language Translations:",
      trimmedMappedData.map((item) => item.languageTranslation)
    );
  };
  console.log("these are the langs again:", languages);

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
