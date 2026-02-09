/**
 * Table Component
 * Wrapper for ReadingsTable with regular readings modals
 * 
 * @file src/components/table/table.jsx
 */

import React from "react";
import ReadingsTable from "./ReadingsTable";
import TableModal from "./TableModal";
import TableModalDelete from "./TableModalDelete";
import TableModalUpdate from "./TableModalUpdate";

const Table = ({
  questionId,
  user_id,
  title,
  question,
  isPatientProfile = 0,
}) => {
  return (
    <ReadingsTable
      type="regular"
      questionId={questionId}
      user_id={user_id}
      title={title}
      question={question}
      isPatientProfile={isPatientProfile}
      AddModal={TableModal}
      UpdateModal={TableModalUpdate}
      DeleteModal={TableModalDelete}
    />
  );
};

export default Table;
