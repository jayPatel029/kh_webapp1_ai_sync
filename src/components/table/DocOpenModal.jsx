import React from "react";
import MyPDFViewer from "../pdf/MyPDFViewer";
import { BaseModal } from "../../component-library/modals/BaseModal";
import { Box } from "../../component-library/layout/Layout";

function DocOpenModal({ closeModal, file }) {
  const isPdf = /.*\.pdf$/.test(file);
  
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
