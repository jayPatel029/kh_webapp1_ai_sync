import React from "react";
import UnifiedUpdateRangeModal from "../Linechart/UnifiedUpdateRangeModal";

const UpdateRangeModel = (props) => {
  return <UnifiedUpdateRangeModal {...props} submitPath="/range/setRange/sys" includeDiastolic={true} size="lg" />;
};

export default UpdateRangeModel;
