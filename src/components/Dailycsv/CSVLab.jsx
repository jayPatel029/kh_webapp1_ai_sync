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
  title: "",
  type: "",
  assign_range: "",
  ailments: "",
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
};

const FIELD_ALIASES = {
  title: ["title", "question title", "reading title", "parameter title"],
  type: ["type", "reading type", "parameter type"],
  assign_range: ["assign range", "assign_range", "range", "has range"],
  ailments: ["ailments", "ailment", "condition", "disease"],
  low_range: ["low range", "low_range", "minimum", "min", "lower"],
  high_range: ["high range", "high_range", "maximum", "max", "upper"],
  isGraph: ["is graph", "isGraph", "graph", "show graph"],
  unit: ["unit", "units"],
  sendAlert: ["send alert", "sendAlert", "alert"],
  alertTextDoc: ["alert text doc", "alertTextDoc", "alert text", "doctor alert text"],
  condition: ["condition", "operator", "rule"],
};

const LANGUAGE_KEYS = [
  "Hindi",
  "Gujarati",
  "Kannada",
  "Assamese",
  "Marathi",
  "Tamil",
  "Punjabi",
  "Telugu",
  "Malayalam",
  "Bangali",
];

const LANGUAGE_NAME_TO_KEY = {
  hindi: "Hindi",
  gujarati: "Gujarati",
  kannada: "Kannada",
  assamese: "Assamese",
  asamese: "Assamese",
  marathi: "Marathi",
  tamil: "Tamil",
  punjabi: "Punjabi",
  telugu: "Telugu",
  malayalam: "Malayalam",
  bangali: "Bangali",
  bengali: "Bangali",
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
    const candidates = [languageKey, ...getLanguageCandidates(languageKey)];
    applyMapping(languageKey, candidates);
  });

  (languages || []).forEach((language) => {
    const mappedKey = LANGUAGE_NAME_TO_KEY[normalizeValue(language?.language_name)];
    if (!mappedKey) return;

    const candidates = [
      language.language_name,
      mappedKey,
      ...getLanguageCandidates(mappedKey),
      `${language.language_name} translation`,
    ];

    applyMapping(mappedKey, candidates);
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
        // Indexes for Hindi and Assamese columns
        const hindiColumnIndex = sourceColumnOptions.indexOf(sourceMappings.Hindi);
        const asameseColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Assamese
        );
        const gujaratiColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Gujarati
        );
        const kannadaColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Kannada
        );
        const marathiColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Marathi
        );
        const tamilColumnIndex = sourceColumnOptions.indexOf(sourceMappings.Tamil);
        const punjabiColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Punjabi
        );
        const teluguColumnIndex = sourceColumnOptions.indexOf(sourceMappings.Telugu);
        const malayalamColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Malayalam
        );
        const bangaliColumnIndex = sourceColumnOptions.indexOf(
          sourceMappings.Bangali
        );

        let filterLanguages = (sourceLanguages || []).filter(
          (language) => language.id !== 1
        );
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
        console.log("these are the langs again:", sourceLanguages);
        return {
          title: sourceMappings.title
            ? row[sourceColumnOptions.indexOf(sourceMappings.title)]
            : undefined,
          type: sourceMappings.type
            ? row[sourceColumnOptions.indexOf(sourceMappings.type)]
            : undefined,
          assign_range: sourceMappings.assign_range
            ? row[sourceColumnOptions.indexOf(sourceMappings.assign_range)]
            : undefined,
          ailments: sourceMappings.ailments
            ? row[sourceColumnOptions.indexOf(sourceMappings.ailments)]
            : undefined,
          low_range: sourceMappings.low_range
            ? row[sourceColumnOptions.indexOf(sourceMappings.low_range)]
            : undefined,
          high_range: sourceMappings.high_range
            ? row[sourceColumnOptions.indexOf(sourceMappings.high_range)]
            : undefined,
          isGraph: sourceMappings.isGraph
            ? row[sourceColumnOptions.indexOf(sourceMappings.isGraph)]
            : undefined,
          unit: sourceMappings.unit
            ? row[sourceColumnOptions.indexOf(sourceMappings.unit)]
            : undefined,
          sendAlert: sourceMappings.sendAlert
            ? row[sourceColumnOptions.indexOf(sourceMappings.sendAlert)]
            : undefined,
          alertTextDoc: sourceMappings.alertTextDoc
            ? row[sourceColumnOptions.indexOf(sourceMappings.alertTextDoc)]
            : undefined,
          condition: sourceMappings.condition
            ? row[sourceColumnOptions.indexOf(sourceMappings.condition)]
            : undefined,
          hindi: sourceMappings.Hindi
            ? row[sourceColumnOptions.indexOf(sourceMappings.Hindi)]
            : undefined,
          asameese: sourceMappings.Assamese
            ? row[sourceColumnOptions.indexOf(sourceMappings.Assamese)]
            : undefined,
          gujarati: sourceMappings.Gujarati
            ? row[sourceColumnOptions.indexOf(sourceMappings.Gujarati)]
            : undefined,
          kannada: sourceMappings.Kannada
            ? row[sourceColumnOptions.indexOf(sourceMappings.Kannada)]
            : undefined,
          marathi: sourceMappings.Marathi
            ? row[sourceColumnOptions.indexOf(sourceMappings.Marathi)]
            : undefined,
          tamil: sourceMappings.Tamil
            ? row[sourceColumnOptions.indexOf(sourceMappings.Tamil)]
            : undefined,
          punjabi: sourceMappings.Punjabi
            ? row[sourceColumnOptions.indexOf(sourceMappings.Punjabi)]
            : undefined,
          telugu: sourceMappings.Telugu
            ? row[sourceColumnOptions.indexOf(sourceMappings.Telugu)]
            : undefined,
          malayalam: sourceMappings.Malayalam
            ? row[sourceColumnOptions.indexOf(sourceMappings.Malayalam)]
            : undefined,
          bangali: sourceMappings.Bangali
            ? row[sourceColumnOptions.indexOf(sourceMappings.Bangali)]
            : undefined,
          languageTranslation: languageTranslations, // Map language translations
        };
      })
      .filter((item) =>
        Object.values(item).some((value) => value !== undefined)
      );

    return mappedData.slice(1); // Remove header row
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
    console.log("Mapped this Data:", data);
    console.log(
      "Language Translations:",
      data.data.map((item) => item.languageTranslation)
    );
  };

  useEffect(() => {
    if (!csvData.length || !columnOptions.length) return;
    pushMappedData();
  }, [csvData, columnOptions, columnMappings, languages]);

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
            className={`flex justify-center items-center p-6 border-2 ${zoneHover ? "border-gray-500" : "border-gray-300"
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
