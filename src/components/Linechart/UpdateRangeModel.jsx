import React from "react";
import UnifiedUpdateRangeModal from "./UnifiedUpdateRangeModal";

const UpdateRangeModel = (props) => {
  return <UnifiedUpdateRangeModal {...props} submitPath="/range/setRange" includeDiastolic={false} size="md" />;
};

export default UpdateRangeModel;
