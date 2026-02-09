/**
 * TableModalDelete Component
 * Wrapper for ReadingModalDelete with regular readings type
 * 
 * @file src/components/table/TableModalDelete.jsx
 */

import React from "react";
import ReadingModalDelete from "./ReadingModalDelete";

export default function TableModalDelete(props) {
  return <ReadingModalDelete {...props} type="regular" />;
}
