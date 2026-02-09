/**
 * DocOpenModal Component
 * Modal for viewing uploaded documents (PDF or image)
 * 
 * @file src/components/table/DocOpenModal.jsx
 */

import React from "react";
import MyPDFViewer from "../pdf/MyPDFViewer";
import { BaseModal, Box } from "../../component-library";

function DocOpenModal({ closeModal, file }) {
  const isPdf = /.*\.pdf$/i.test(file);
  
  return (
    <BaseModal
      isOpen={true}
      onClose={closeModal}
      title="Uploaded Readings"
      size="xl"
      showCloseButton={true}
    >
      <Box className="overflow-auto" style={{ maxHeight: "70vh" }}>
        {isPdf ? (
          <MyPDFViewer file={file} />
        ) : (
          <img
            src={file ? file : ""}
            alt="prescription"
            className="w-full h-auto object-contain"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </Box>
    </BaseModal>
  );
}

export default DocOpenModal;
