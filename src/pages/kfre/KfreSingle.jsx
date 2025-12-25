import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import KfreList from "./KfreList";
import KfreSingleList from "./KfreSingleList";
function KfreSingle() {
  return (
    <div className="md:flex block">
      {/* Sidebar */}
      <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        
      <div className="max-w-4xl">
      <KfreSingleList />
      </div>
      </div>
    </div>
  );
}

export default  KfreSingle;
