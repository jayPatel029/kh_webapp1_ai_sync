/**
 * TableModal Component
 * Wrapper for ReadingModalAdd with regular readings type
 * 
 * @file src/components/table/TableModal.jsx
 */

import React from "react";
import ReadingModalAdd from "./ReadingModalAdd";

export default function TableModal(props) {
  return <ReadingModalAdd {...props} type="regular" />;
}
