import React, { useEffect, useState } from "react";
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);
const GREY_DIM = "#686868";

const INITIAL_COLUMN_MAPPINGS = {
  type: "",
  name: "",
  ailments: "",
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
};

const FIELD_ALIASES = {
  type: ["type", "question type"],
  name: ["name", "question", "question name", "title"],
  ailments: ["ailments", "ailment", "condition", "disease"],
  options: ["options", "option", "english options", "option list"],
};

const LANGUAGE_KEYS = [
  "Hindi",
  "Marathi",
  "Assamese",
  "Kannada",
  "Tamil",
  "Malayalam",
  "Bangali",
  "Punjabi",
  "Telugu",
  "Gujarati",
];

const LANGUAGE_NAME_TO_KEY = {
  hindi: "Hindi",
  marathi: "Marathi",
  assamese: "Assamese",
  asamese: "Assamese",
  kannada: "Kannada",
  tamil: "Tamil",
  malayalam: "Malayalam",
  bangali: "Bangali",
  bengali: "Bangali",
  punjabi: "Punjabi",
  telugu: "Telugu",
  gujarati: "Gujarati",
};

const normalizeValue = (value = "") =>
  String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

const getLanguageCandidates = (languageKey) => {
  const normalized = normalizeValue(languageKey);
  if (normalized === "bangali" || normalized === "bengali") {
    return ["bangali", "bengali"];
  }
  if (normalized === "assamese" || normalized === "asamese") {
    return ["assamese", "asamese"];
  }
  return [normalized];
};

const findBestColumnMatch = (headers, candidates = []) => {
  if (!Array.isArray(headers) || headers.length === 0) return "";

  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeValue(header),
  }));

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeValue(candidate);
    if (!normalizedCandidate) continue;
    const exactMatch = normalizedHeaders.find(
      (header) => header.normalized === normalizedCandidate
    );
    if (exactMatch) return exactMatch.original;
  }

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeValue(candidate);
    if (!normalizedCandidate) continue;
    const relaxedMatch = normalizedHeaders.find(
      (header) =>
        header.normalized.includes(normalizedCandidate) ||
        normalizedCandidate.includes(header.normalized)
    );
    if (relaxedMatch) return relaxedMatch.original;
  }

  return "";
};

const buildAutoMappings = (headers, languages = [], previousMappings = {}) => {
  const mappings = { ...INITIAL_COLUMN_MAPPINGS };

  const applyMapping = (key, candidates) => {
    const previousValue = previousMappings?.[key];
    if (previousValue && headers.includes(previousValue)) {
      mappings[key] = previousValue;
      return;
    }

    const match = findBestColumnMatch(headers, candidates);
    mappings[key] = match || "";
  };

  Object.entries(FIELD_ALIASES).forEach(([key, aliases]) => {
    applyMapping(key, [key, ...aliases]);
  });

  LANGUAGE_KEYS.forEach((languageKey) => {
    const languageCandidates = [
      languageKey,
      ...getLanguageCandidates(languageKey),
      `${languageKey} text`,
      `${languageKey} translation`,
    ];

    const optionCandidates = [
      `${languageKey} opt`,
      `${languageKey} option`,
      `${languageKey} options`,
      ...getLanguageCandidates(languageKey).flatMap((candidate) => [
        `${candidate}opt`,
        `${candidate}option`,
        `${candidate}options`,
      ]),
    ];

    applyMapping(languageKey, languageCandidates);
    applyMapping(`${languageKey}Opt`, optionCandidates);
  });

  (languages || []).forEach((language) => {
    const mappedKey = LANGUAGE_NAME_TO_KEY[normalizeValue(language?.language_name)];
    if (!mappedKey) return;

    applyMapping(mappedKey, [
      language.language_name,
      `${language.language_name} text`,
      `${language.language_name} translation`,
      mappedKey,
      ...getLanguageCandidates(mappedKey),
    ]);

    applyMapping(`${mappedKey}Opt`, [
      `${language.language_name} opt`,
      `${language.language_name} option`,
      `${language.language_name} options`,
      `${mappedKey} opt`,
      `${mappedKey} option`,
      `${mappedKey} options`,
    ]);
  });

  return mappings;
};

export default function CSVReader({ setData, setSuccess, languages }) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );
  const [headData, setHeadData] = useState([]);
  const [columnMappings, setColumnMappings] = useState(INITIAL_COLUMN_MAPPINGS);

  const [csvData, setCsvData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);

  useEffect(() => {
    if (!columnOptions.length) return;
    setColumnMappings((previousMappings) =>
      buildAutoMappings(columnOptions, languages, previousMappings)
    );
  }, [columnOptions, languages]);

  const buildMappedData = (
    sourceCsvData = csvData,
    sourceColumnOptions = columnOptions,
    sourceMappings = columnMappings,
    sourceLanguages = languages
  ) => {
    const mappedData = sourceCsvData
      .map((row) => {
        const hindiColumnIndex = sourceColumnOptions.indexOf(sourceMappings.Hindi);
        const hindiOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.HindiOpt
        );

        const marathiColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Marathi
        );
        const marathiOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.MarathiOpt
        );

        const assameseColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Assamese
        );
        const assameseOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.AssameseOpt
        );

        const gujaratiColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Gujarati
        );
        const gujaratiOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.GujaratiOpt
        );

        const kannadaColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Kannada
        );
        const kannadaOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.KannadaOpt
        );

        const tamilColumnIndex = sourceColumnOptions.indexOf(sourceMappings.Tamil);
        const tamilOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.TamilOpt
        );

        const punjabiColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Punjabi
        );
        const punjabiOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.PunjabiOpt
        );

        const malayalamColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Malayalam
        );
        const malayalamOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.MalayalamOpt
        );

        const teluguColumnIndex = sourceColumnOptions.indexOf(sourceMappings.Telugu);
        const teluguOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.TeluguOpt
        );

        const bangaliColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Bangali
        );
        const bangaliOptColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.BangaliOpt
        );

        const filteredLanguages = (sourceLanguages || []).filter(
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
          type: sourceMappings.type
            ? row[sourceColumnOptions.indexOf(sourceMappings.type)]
            : undefined,
          ailments: sourceMappings.ailments
            ? row[sourceColumnOptions.indexOf(sourceMappings.ailments)]
            : undefined,
          name: sourceMappings.name
            ? row[sourceColumnOptions.indexOf(sourceMappings.name)]
            : undefined,
          options: sourceMappings.options
            ? row[sourceColumnOptions.indexOf(sourceMappings.options)]
            : undefined,
          Hindi: sourceMappings.Hindi
            ? row[sourceColumnOptions.indexOf(sourceMappings.Hindi)]
            : undefined,
          HindiOpt: sourceMappings.HindiOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.HindiOpt)]
            : undefined,
          Marathi: sourceMappings.Marathi
            ? row[sourceColumnOptions.indexOf(sourceMappings.Marathi)]
            : undefined,
          MarathiOpt: sourceMappings.MarathiOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.MarathiOpt)]
            : undefined,

          Assamese: sourceMappings.Assamese
            ? row[sourceColumnOptions.indexOf(sourceMappings.Assamese)]
            : undefined,
          AssameseOpt: sourceMappings.AssameseOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.AssameseOpt)]
            : undefined,

          Gujarati: sourceMappings.Gujarati
            ? row[sourceColumnOptions.indexOf(sourceMappings.Gujarati)]
            : undefined,
          GujaratiOpt: sourceMappings.GujaratiOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.GujaratiOpt)]
            : undefined,

          Kannada: sourceMappings.Kannada
            ? row[sourceColumnOptions.indexOf(sourceMappings.Kannada)]
            : undefined,
          KannadaOpt: sourceMappings.KannadaOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.KannadaOpt)]
            : undefined,

          Tamil: sourceMappings.Tamil
            ? row[sourceColumnOptions.indexOf(sourceMappings.Tamil)]
            : undefined,
          TamilOpt: sourceMappings.TamilOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.TamilOpt)]
            : undefined,

          Punjabi: sourceMappings.Punjabi
            ? row[sourceColumnOptions.indexOf(sourceMappings.Punjabi)]
            : undefined,
          PunjabiOpt: sourceMappings.PunjabiOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.PunjabiOpt)]
            : undefined,

          Telugu: sourceMappings.Telugu
            ? row[sourceColumnOptions.indexOf(sourceMappings.Telugu)]
            : undefined,
          TeluguOpt: sourceMappings.TeluguOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.TeluguOpt)]
            : undefined,
          Malayalam: sourceMappings.Malayalam
            ? row[sourceColumnOptions.indexOf(sourceMappings.Malayalam)]
            : undefined,
          MalayalamOpt: sourceMappings.MalayalamOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.MalayalamOpt)]
            : undefined,
          Bangali: sourceMappings.Bangali
            ? row[sourceColumnOptions.indexOf(sourceMappings.Bangali)]
            : undefined,
          BangaliOpt: sourceMappings.BangaliOpt
            ? row[sourceColumnOptions.indexOf(sourceMappings.BangaliOpt)]
            : undefined,
          languageTranslation: languageTranslations,
        };
      })
      .filter((i) => Object.values(i).some((val) => val !== undefined));

    return mappedData.slice(1);
  };

  const pushMappedData = (
    sourceCsvData = csvData,
    sourceColumnOptions = columnOptions,
    sourceMappings = columnMappings,
    sourceLanguages = languages
  ) => {
    const trimmedMappedData = buildMappedData(
      sourceCsvData,
      sourceColumnOptions,
      sourceMappings,
      sourceLanguages
    );

    setData(trimmedMappedData);
    if (typeof setSuccess === "function") {
      setSuccess((previousValue) => !previousValue);
    }

    let data = { data: trimmedMappedData };
    console.log("Data:", data);
    console.log(
      "Language Translations:",
      trimmedMappedData.map((item) => item.languageTranslation)
    );
  };

  useEffect(() => {
    if (!csvData.length || !columnOptions.length) return;
    pushMappedData();
  }, [csvData, columnOptions, columnMappings, languages]);

  console.log("these are the langs again:", languages);

  return (
    <CSVReader
      onUploadAccepted={(results) => {
        setZoneHover(false);
        if (results.data.length > 0) {
          const headers = results.data[0] || [];
          const autoMappings = buildAutoMappings(headers, languages);
          setCsvData(results.data);
          setHeadData(results.data.slice(0, 5)); // Get the first five entries
          setColumnOptions(headers);
          setColumnMappings(autoMappings);
          pushMappedData(results.data, headers, autoMappings, languages);
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
                        setColumnMappings((previousMappings) => ({
                          ...previousMappings,
                          [key]: e.target.value,
                        }))
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
              <hr className="my-6" />
              <p className="text-sm text-gray-600">
                Columns are mapped automatically and updated instantly when you change selections.
                {/* {Object.values(columnMappings).filter(Boolean).length} columns mapped. */}

              </p>
              <hr className="my-4" />
              <p className="text-black font-bold">
                Make Sure to Map the Columns Correctly to Ensure Accurate Data Processing
              </p>

            </div>
          )}
        </div>
      )}
    </CSVReader>
  );
}
