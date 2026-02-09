/**
 * DialysisTableModal Component
 * Wrapper for ReadingModalAdd with dialysis readings type
 * 
 * @file src/components/table/DialyisisTableModal.jsx
 */

import React from "react";
import ReadingModalAdd from "./ReadingModalAdd";

export default function DialysisTableModal(props) {
  return <ReadingModalAdd {...props} type="dialysis" />;
}
