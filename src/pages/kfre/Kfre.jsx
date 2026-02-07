import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import KfreList from "./KfreList";

function Kfre() {
  return (
    <div className="md:flex block">
      {/* Sidebar */}
      <div className="md:flex-1hiddenmd:flexstickytop-0h-screenoverflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>

       <KfreList/>
      </div>
    </div>
  );
}

export default Kfre;
