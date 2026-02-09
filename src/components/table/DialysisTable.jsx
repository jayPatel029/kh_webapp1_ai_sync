/**
 * Dialysis Table Component
 * Wrapper for ReadingsTable with dialysis readings modals
 * 
 * @file src/components/table/DialysisTable.jsx
 */

import React from "react";
import ReadingsTable from "./ReadingsTable";
import DialysisTableModal from "./DialyisisTableModal";
import DialysisTableModalUpdate from "./DialysisTableModalUpdate";
import DialysisTableModalDelete from "./DialysisTableModalDelete";

const DialysisTable = ({
  questionId,
  user_id,
  title,
  question,
  isPatientProfile = 1
}) => {
  return (
    <ReadingsTable
      type="dialysis"
      questionId={questionId}
      user_id={user_id}
      title={title}
      question={question}
      isPatientProfile={isPatientProfile}
      AddModal={DialysisTableModal}
      UpdateModal={DialysisTableModalUpdate}
      DeleteModal={DialysisTableModalDelete}
    />
  );
};

export default DialysisTable;
