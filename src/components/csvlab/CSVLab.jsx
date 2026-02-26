import React, { useState } from "react";
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { Button } from "../../component-library/primitives/Button";
import { Select } from "../../component-library/primitives/Select";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { VStack, Box, SimpleGrid } from "../../component-library/layout/Layout";
import { Heading } from "../../component-library/primitives/Typography";
import FormModal from "../../component-library/modals/FormModal";
import UnifiedListTable from "../table/UnifiedListTable"; // path relative to csvlab
import "../table/UnifiedListTable.css"; // ensure styles loaded

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
    width: "100%",
    alignItems: "center",
    border: `2px dashed var(--color-accent)`,
    // outline: `2px dashed var(--color-accent)`,
    // outlineOffset: 5, /* Moves outline inside */
    borderRadius: "10px",
    boxSizing: "border-box",
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

export default function CSVReader({ setData, setSuccess, success, patientId, title }) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );
  const [headData, setHeadData] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
    // mark as successful and close the modal
    setSuccess(true);
    setShowModal(false);


  };

  return (
    <CSVReader
      onUploadAccepted={(results) => {
        // open modal to review first five entries and map columns
        setZoneHover(false);
        if (results.data.length > 0) {
          setCsvData(results.data);
          setHeadData(results.data.slice(0, 5)); // Get the first five entries
          setColumnOptions(results.data[0]);
          setShowModal(true);
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
        <div className="flex flex-col text-start">
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
                {/* wrap remove props so we can intercept the click */}
                {(() => {
                  const removeProps = getRemoveFileProps();
                  return (
                    <div
                      {...removeProps}
                      style={styles.remove}
                      onMouseOver={(event) => {
                        event.preventDefault();
                        setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                      }}
                      onMouseOut={(event) => {
                        event.preventDefault();
                        setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                      }}
                      onClick={(event) => {
                        // call the library's remove handler first so internal acceptedFile is cleared
                        if (removeProps.onClick) removeProps.onClick(event);
                        // then prevent any further propagation and clear our local state
                        event.preventDefault?.();
                        event.stopPropagation?.();
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
                        setShowModal(false);
                        // ensure parent knows there's no successful upload
                        if (typeof setSuccess === 'function') setSuccess(false);
                      }}
                    >
                      <Remove color={removeHoverColor} />
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-[var(--color-accent)] font-bold  ">{title || "Drop CSV file here or click to upload"}</div>
            )}
          </div>

          {/* Use shared FormModal for preview & mapping */}
          <FormModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
            title="CSV Preview & Column Mapping"
            submitText="Submit"
            cancelText="Cancel"
            size="4xl"
          >
            <Box>
              <Heading as="h4" size="md" className="mt-0 mb-2">First Five Entries</Heading>
              {/* render preview using unified table style */}
              <div className="overflow-auto max-h-[50vh] mb-4">
                {headData.length > 1 && (
                  <UnifiedListTable
                    columns={headData[0].map((col) => ({ key: col, label: col, type: 'text' }))}
                    data={headData.slice(1).map((row) => {
                      const obj = {};
                      headData[0].forEach((col, i) => {
                        obj[col] = row[i];
                      });
                      return obj;
                    })}
                    enablePagination={false}
                    enableSearch={false}
                    actionButtons={false}
                    displayMode="table"
                  />
                )}
              </div>
            </Box>

            <Box className="max-h-[45vh] overflow-auto">
              <Heading as="h4" size="sm" className="mb-3">Match the Columns</Heading>
              <SimpleGrid columns={2} gap={4}>
                {Object.entries(columnMappings).map(([key, value]) => (
                  <FormControl key={key} className="mt-6">
                    <FormLabel htmlFor={key}>{key}</FormLabel>
                    <Select
                      id={key}
                      value={value}
                      onChange={(e) =>
                        setColumnMappings({
                          ...columnMappings,
                          [key]: e.target.value,
                        })
                      }

                    >
                      <option value="">Select Column</option>
                      {columnOptions.map((column, index) => (
                        <option key={index} value={column}>
                          {column}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </SimpleGrid>
            </Box>
          </FormModal>
        </div>
      )}
    </CSVReader>
  );
}
