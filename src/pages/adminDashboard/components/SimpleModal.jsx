import React, { useState, useEffect } from "react";
import MyPDFViewer from "../../../components/pdf/MyPDFViewer";
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";
import AlertViewerToolbar from "../../../components/dashboard/AlertViewerToolbar";

const SimpleModal = ({ closeModal, image, patientId }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (image && image !== "") {
      setLoading(false);
    }
  }, [image]);

  const isPdf = /\.pdf$/i.test(String(image || ""));

  return (
    <ThemedModalShell
      title={isPdf ? "Uploaded PDF" : "Uploaded image"}
      onClose={closeModal}
      width="min(900px, 96vw)"
      height="min(85vh, 720px)"
      zIndex={70}
      fillBody
      bodyScroll={false}
      bodyClassName="p-4"
      bodyStyle={{ background: "#f8fafc" }}
      toolbar={patientId ? <AlertViewerToolbar patientId={patientId} /> : null}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="h-full min-h-[200px] flex items-center justify-center">
            <p className="text-sm" style={{ color: THEMED_MODAL.slate }}>
              Loading…
            </p>
          </div>
        ) : isPdf ? (
          <div className="w-full h-full min-h-[280px]">
            <MyPDFViewer file={image} fitWidth />
          </div>
        ) : (
          <img
            src={image || ""}
            alt="Uploaded"
            className="rounded-lg shadow-sm block mx-auto"
            style={{
              maxWidth: "100%",
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        )}
      </div>
    </ThemedModalShell>
  );
};

export default SimpleModal;
