import React, { useState } from "react";
import KfreSingleList from "./KfreSingleList";
import { Box } from "../../component-library/layout/Layout";

function KfreSingle() {
  return (
    <Box className="flex-1 block w-full">
      <Box className="max-w-4xl w-full">
        <KfreSingleList />
      </Box>
    </Box>
  );
}

export default KfreSingle;
