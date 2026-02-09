/**
 * DialysisTableModalUpdate Component
 * Wrapper for ReadingModalUpdate with dialysis readings type
 * 
 * @file src/components/table/DialysisTableModalUpdate.jsx
 */

import React from "react";
import ReadingModalUpdate from "./ReadingModalUpdate";

export default function DialysisTableModalUpdate(props) {
  return <ReadingModalUpdate {...props} type="dialysis" />;
}
