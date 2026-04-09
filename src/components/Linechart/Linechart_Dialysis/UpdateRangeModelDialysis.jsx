import React from "react";
import UnifiedUpdateRangeModal from "../UnifiedUpdateRangeModal";

const UpdateRangeModelDialysis = (props) => {
  return <UnifiedUpdateRangeModal {...props} submitPath="/rangeDialysis/setRange" includeDiastolic={false} size="md" />;
};

export default UpdateRangeModelDialysis;
