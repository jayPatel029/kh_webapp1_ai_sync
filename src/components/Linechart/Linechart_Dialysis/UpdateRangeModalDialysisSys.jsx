import React from "react";
import UnifiedUpdateRangeModal from "../UnifiedUpdateRangeModal";

const UpdateRangeModalDialysisSys = (props) => {
  return <UnifiedUpdateRangeModal {...props} submitPath="/range/setRange/dia/sys" includeDiastolic={true} size="lg" />;
};

export default UpdateRangeModalDialysisSys;
