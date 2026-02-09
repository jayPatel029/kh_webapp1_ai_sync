/**
 * DialysisTableModalDelete Component
 * Wrapper for ReadingModalDelete with dialysis readings type
 * 
 * @file src/components/table/DialysisTableModalDelete.jsx
 */

import React from "react";
import ReadingModalDelete from "./ReadingModalDelete";

export default function DialysisTableModalDelete(props) {
  return <ReadingModalDelete {...props} type="dialysis" />;
}
