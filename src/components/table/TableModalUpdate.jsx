/**
 * TableModalUpdate Component
 * Wrapper for ReadingModalUpdate with regular readings type
 * 
 * @file src/components/table/TableModalUpdate.jsx
 */

import React from "react";
import ReadingModalUpdate from "./ReadingModalUpdate";

export default function TableModalUpdate(props) {
  return <ReadingModalUpdate {...props} type="regular" />;
}
