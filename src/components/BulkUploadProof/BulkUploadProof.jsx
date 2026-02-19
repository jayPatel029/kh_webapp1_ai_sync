import React, { useState, useEffect } from "react";
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import { Button } from "../../component-library/primitives/Button";
import { Select } from "../../component-library/primitives/Select";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Box } from "../../component-library/layout/Layout";
import { Heading, Text } from "../../component-library/primitives/Typography";
import { Alert } from "../../component-library/feedback/Alert";

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
  remove: {
    height: 23,
    position: "absolute",
    right: 6,
    top: 6,
    width: 23,
  },
};

/**
 * BulkUploadProof - Unified CSV Upload Component
 * 
 * Configuration object structure:
 * {
 *   uploadType: 'lab' | 'profile' | 'daily' | 'labReports' (for preset configs)
 *   columnDefinitions: {
 *     [fieldName]: {
 *       type: 'string' | 'number' | 'array' | 'language-pair',
 *       isRequired: boolean,
 *       label: string,
 *       description?: string
 *     }
 *   },
 *   languages?: array of language objects,
 *   serverEndpoint?: string,
 *   uploadFileEndpoint?: string,
 *   fetchColumnsEndpoint?: string,
 *   additionalContext?: object (e.g., patientId, reportType),
 *   onSuccess?: callback function,
 *   allowDynamicFields?: boolean,
 *   requiredFields?: string[],
 *   previewRows?: number
 * }
 */

const PRESET_CONFIGS = {
  lab: {
    columnDefinitions: {
      eGFR: { type: "string", isRequired: false, label: "eGFR" },
      calcium: { type: "string", isRequired: false, label: "Calcium" },
      acr: { type: "string", isRequired: false, label: "ACR" },
      phosphorous: { type: "string", isRequired: false, label: "Phosphorous" },
      bicarbonate: { type: "string", isRequired: false, label: "Bicarbonate" },
      albumin: { type: "string", isRequired: false, label: "Albumin" },
    },
  },
  labReports: {
    columnDefinitions: {
      Date: { type: "string", isRequired: true, label: "Date" },
      labreportType: { type: "string", isRequired: false, label: "Lab Report Type" },
      readings: { type: "string", isRequired: false, label: "Readings" },
    },
    requiredFields: ["Date"],
    allowDynamicFields: true,
    fetchColumnsEndpoint: "/labreport/getColumnNames",
  },
  daily: {
    columnDefinitions: {
      title: { type: "string", isRequired: false, label: "Title" },
      type: { type: "string", isRequired: false, label: "Type" },
      assign_range: { type: "string", isRequired: false, label: "Assign Range" },
      ailments: { type: "array", isRequired: false, label: "Ailments" },
      low_range: { type: "string", isRequired: false, label: "Low Range" },
      high_range: { type: "string", isRequired: false, label: "High Range" },
      isGraph: { type: "string", isRequired: false, label: "Is Graph" },
      unit: { type: "string", isRequired: false, label: "Unit" },
      sendAlert: { type: "string", isRequired: false, label: "Send Alert" },
      alertTextDoc: { type: "string", isRequired: false, label: "Alert Text Doc" },
      condition: { type: "string", isRequired: false, label: "Condition" },
    },
    requiresLanguageTranslation: true,
  },
  profile: {
    columnDefinitions: {
      type: { type: "string", isRequired: false, label: "Type" },
      name: { type: "string", isRequired: false, label: "Name" },
      ailments: { type: "array", isRequired: false, label: "Ailments" },
      options: { type: "string", isRequired: false, label: "Options" },
    },
    requiresLanguageTranslation: true,
  },
};

export default function BulkUploadProof({
  config = {},
  setData,
  setSuccess,
  success,
}) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );
  const [headData, setHeadData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({});
  const [csvData, setCsvData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Merge provided config with presets
  const mergedConfig = {
    ...PRESET_CONFIGS[config.uploadType] || {},
    ...config,
  };

  const {
    columnDefinitions = {},
    languages = [],
    serverEndpoint = "",
    uploadFileEndpoint = "",
    fetchColumnsEndpoint = "",
    additionalContext = {},
    onSuccess,
    allowDynamicFields = false,
    requiredFields = [],
    previewRows = 5,
    requiresLanguageTranslation = false,
  } = mergedConfig;

  // Initialize column mappings from definitions
  useEffect(() => {
    const initialMappings = Object.keys(columnDefinitions).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    setColumnMappings(initialMappings);
  }, [columnDefinitions]);

  // Fetch column names from server if endpoint provided
  useEffect(() => {
    if (fetchColumnsEndpoint && Object.keys(columnDefinitions).length === 0) {
      fetchColumnsFromServer();
    }
  }, [fetchColumnsEndpoint]);

  const fetchColumnsFromServer = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${server_url}${fetchColumnsEndpoint}`
      );
      const fetchedColumns = response.data?.data || [];
      const newDefinitions = fetchedColumns.reduce((acc, column) => {
        acc[column.title] = {
          type: "string",
          isRequired: false,
          label: column.title,
        };
        return acc;
      }, {});
      const newMappings = Object.keys(newDefinitions).reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, { Date: "" });
      setColumnMappings(newMappings);
      setError("");
    } catch (err) {
      setError("Failed to fetch column definitions. Please try again later.");
      console.error("Error fetching columns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewField = () => {
    if (!allowDynamicFields) {
      setError("Dynamic field addition is not allowed for this upload type.");
      return;
    }
    const fieldName = prompt("Enter a name for the new field:");
    if (fieldName && fieldName.trim()) {
      setColumnMappings({
        ...columnMappings,
        [fieldName]: "",
      });
      setError("");
    }
  };

  /**
   * Build language translations for a row based on languages configuration
   */
  const buildLanguageTranslations = (row, prefix = "") => {
    const filteredLanguages = (languages || []).filter(
      (lang) => lang.id !== 1
    );

    let languageTranslations = {};

    filteredLanguages.forEach((language) => {
      const languageName = language.language_name;
      const textKey = prefix ? `${languageName}` : languageName;
      const optionsKey = prefix ? `${languageName}Opt` : `${languageName}Opt`;

      const textMapping = columnMappings[textKey];
      const optionsMapping = columnMappings[optionsKey];

      if (textMapping || optionsMapping) {
        const textIndex = columnOptions.indexOf(textMapping);
        const optionsIndex = columnOptions.indexOf(optionsMapping);

        // Check if this is a profile/question type (with options)
        if (optionsMapping) {
          languageTranslations[language.id] = {
            text: textIndex >= 0 ? row[textIndex] || "" : "",
            options: optionsIndex >= 0 ? row[optionsIndex] || "" : "",
          };
        } else {
          // Simple text translation (daily parameters)
          languageTranslations[language.id] = textIndex >= 0 ? row[textIndex] : "";
        }
      }
    });

    return languageTranslations;
  };

  /**
   * Map CSV row to data object based on column definitions and mappings
   */
  const mapRowToData = (row, includeLanguages = false) => {
    const mappedRow = {};

    Object.entries(columnDefinitions).forEach(([fieldName, fieldConfig]) => {
      const mapping = columnMappings[fieldName];
      if (mapping) {
        const columnIndex = columnOptions.indexOf(mapping);
        if (columnIndex >= 0) {
          mappedRow[fieldName] = row[columnIndex];
        }
      }
    });

    // Add additional context (e.g., patientId)
    Object.entries(additionalContext).forEach(([key, value]) => {
      if (typeof value !== "function") {
        mappedRow[key] = value;
      }
    });

    // Add language translations if required
    if (includeLanguages && requiresLanguageTranslation) {
      mappedRow.languageTranslation = buildLanguageTranslations(row);
    }

    return mappedRow;
  };

  /**
   * Validate that all required fields are mapped
   */
  const validateRequiredMappings = () => {
    const unmappedRequired = requiredFields.filter(
      (field) => !columnMappings[field]
    );

    if (unmappedRequired.length > 0) {
      setError(
        `Please map the following required fields: ${unmappedRequired.join(
          ", "
        )}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateRequiredMappings()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Map all data rows
      const mappedData = csvData
        .map((row) => mapRowToData(row, requiresLanguageTranslation))
        .filter((item) =>
          Object.values(item).some((value) => value !== undefined)
        );

      // Remove header row
      const trimmedMappedData = mappedData.slice(1);

      // Call parent callback if provided
      if (setData) {
        setData(trimmedMappedData);
      }

      if (setSuccess) {
        setSuccess(!success);
      }

      // Upload to server if endpoint provided
      if (serverEndpoint) {
        await uploadToServer(trimmedMappedData);
      }

      // Call custom success callback
      if (onSuccess) {
        onSuccess(trimmedMappedData);
      }

      // Reset form
      setCsvData([]);
      setHeadData([]);
      setColumnOptions([]);
      setSelectedFile(null);

      setError("");
    } catch (err) {
      setError(
        err.message || "An error occurred while processing your data."
      );
      console.error("Error in handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadToServer = async (data) => {
    try {
      const payload = { data };

      // Handle file upload if in fileUploadMode
      if (selectedFile && uploadFileEndpoint) {
        const fileRes = await getFileRes(selectedFile);
        if (!fileRes?.data?.objectUrl) {
          throw new Error("Failed to upload document. Please try again.");
        }
        payload.Lab_Report = fileRes.data.objectUrl;
      }

      // Merge additional context into payload
      Object.entries(additionalContext).forEach(([key, value]) => {
        if (typeof value !== "function") {
          payload[key] = value;
        }
      });

      const response = await axiosInstance.post(
        `${server_url}${serverEndpoint}`,
        payload
      );

      if (response.status !== 200) {
        throw new Error(
          response.data?.message || "Server returned an error"
        );
      }
    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        "Failed to upload data to server"
      );
    }
  };

  const handleResetUpload = () => {
    setCsvData([]);
    setHeadData([]);
    setColumnOptions([]);
    setSelectedFile(null);
    const initialMappings = Object.keys(columnDefinitions).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    setColumnMappings(initialMappings);
    setError("");
  };

  const renderColumnMappingGrid = () => {
    const columns = Object.entries(columnMappings);
    const gridColsClass = (() => {
      const count = columns.length;
      if (count <= 2) return "md:grid-cols-2";
      if (count <= 3) return "md:grid-cols-3";
      return "md:grid-cols-3 lg:grid-cols-4";
    })();

    return (
      <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
        {columns.map(([fieldName, value]) => {
          const fieldConfig = columnDefinitions[fieldName] || {};
          const isRequired = requiredFields.includes(fieldName);
          const isMapped = !!value;

          return (
            <FormControl key={fieldName}>
              <FormLabel htmlFor={fieldName}>
                {fieldConfig.label || fieldName}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <Select
                id={fieldName}
                value={value}
                onChange={(e) =>
                  setColumnMappings({
                    ...columnMappings,
                    [fieldName]: e.target.value,
                  })
                }
                className={isRequired && !isMapped ? "border-red-500" : ""}
              >
                <option value="">Select Column</option>
                {columnOptions.map((column, index) => (
                  <option key={index} value={column}>
                    {column}
                  </option>
                ))}
              </Select>
              {isRequired && !isMapped && (
                <Text className="text-red-500 text-xs mt-1">
                  This field is required
                </Text>
              )}
            </FormControl>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-6 w-full">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <CSVReader
        onUploadAccepted={(results, acceptedFile) => {
          setZoneHover(false);
          if (results.data && results.data.length > 0) {
            setSelectedFile(acceptedFile);
            setCsvData(results.data);
            setHeadData(results.data.slice(0, previewRows));
            setColumnOptions(results.data[0]);
            setError("");
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
          <>
            {/* File Upload Zone */}
            <div
              {...getRootProps()}
              style={Object.assign({}, styles.zone, zoneHover && styles.zoneHover)}
              className="cursor-pointer transition-all duration-200"
            >
              {acceptedFile ? (
                <div style={styles.file}>
                  <div style={styles.info}>
                    <span style={styles.size} className="text-xs font-semibold">
                      {formatFileSize(acceptedFile.size)}
                    </span>
                    <span style={styles.name} className="text-xs truncate">
                      {acceptedFile.name}
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <ProgressBar />
                  </div>
                  <div
                    {...getRemoveFileProps()}
                    style={styles.remove}
                    className="cursor-pointer"
                    onMouseOver={(event) => {
                      event.preventDefault();
                      setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                    }}
                    onMouseOut={(event) => {
                      event.preventDefault();
                      setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                    }}
                    onClick={() => handleResetUpload()}
                  >
                    <Remove color={removeHoverColor} />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Heading as="h3" size="md" className="mb-2">
                    Drop CSV file here or click to upload
                  </Heading>
                  <Text className="text-gray-500 text-sm">
                    Supported format: CSV
                  </Text>
                </div>
              )}
            </div>

            {/* Preview Table */}
            {headData.length > 0 && (
              <Box className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <Heading as="h3" size="sm" className="mb-4">
                  Preview - First {Math.min(previewRows - 1, headData.length - 1)} Entries
                </Heading>
                <div className="overflow-auto max-h-64">
                  <table className="w-full table-auto border-collapse">
                    <thead className="bg-gray-200 sticky top-0">
                      <tr>
                        {headData[0]?.map((item, index) => (
                          <th
                            key={index}
                            className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {headData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-100">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border border-gray-300 px-4 py-2 text-sm"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Box>
            )}

            {/* Column Mapping Section */}
            {headData.length > 0 && (
              <Box className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <Heading as="h3" size="sm">
                    Map CSV Columns to Fields
                  </Heading>
                  {allowDynamicFields && (
                    <Button
                      onClick={handleAddNewField}
                      variant="secondary"
                      size="sm"
                    >
                      + Add New Field
                    </Button>
                  )}
                </div>
                {renderColumnMappingGrid()}
              </Box>
            )}

            {/* Action Buttons */}
            {headData.length > 0 && (
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleResetUpload}
                  variant="secondary"
                  disabled={loading}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  disabled={loading || csvData.length === 0}
                >
                  {loading ? "Processing..." : "Submit"}
                </Button>
              </div>
            )}
          </>
        )}
      </CSVReader>
    </div>
  );
}
