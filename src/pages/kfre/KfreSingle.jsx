import React, { useState } from "react";
import KfreList from "./KfreList";
import KfreSingleList from "./KfreSingleList";
function KfreSingle() {
  return (
    <div className="flex-1 block w-full">
      <div className="max-w-4xl">
        <KfreSingleList />
      </div>
    </div>
  );
}

export default  KfreSingle;
