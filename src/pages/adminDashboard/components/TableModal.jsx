import React from "react";
import Table from "../../../components/table/table";
import DialysisTable from "../../../components/table/DialysisTable";
import ThemedModalShell from "../../../components/modals/ThemedModalShell";
import AlertViewerToolbar from "../../../components/dashboard/AlertViewerToolbar";

const TableModal = ({
  closeModal,
  patientId,
  questionId,
  dailyordia,
  questionTitle,
}) => {
  const componentToRenderFunc = () => {
    if (dailyordia === "daily") {
      return (
        <Table
          questionId={questionId}
          user_id={patientId}
          title={questionTitle}
          isPatientProfile={null}
        />
      );
    }
    return (
      <DialysisTable
        questionId={questionId}
        user_id={patientId}
        title={questionTitle}
        isPatientProfile={null}
      />
    );
  };

  return (
    <ThemedModalShell
      title={questionTitle || "Table"}
      onClose={closeModal}
      width="min(1100px, 96vw)"
      maxHeight="90vh"
      zIndex={70}
      bodyClassName="px-4 sm:px-5 py-4"
      toolbar={patientId ? <AlertViewerToolbar patientId={patientId} /> : null}
    >
      <div className="w-full min-h-[280px]">{componentToRenderFunc()}</div>
    </ThemedModalShell>
  );
};

export default TableModal;
