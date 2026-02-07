import React from "react";
import "./ailmentmaster.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import AilmentMasterComponent from "./Ailment Master/AilmentMaster";

function AlimentMaster() {
  return (
    <div className="ailmentMaster md:flex block">
      <div className="md:flex-1hiddenmd:flexstickytop-0h-screenoverflow-y-auto">
        <Sidebar />
      </div>
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <div className="">
          <AilmentMasterComponent />
        </div>
      </div>
    </div>
  );
}

export default AlimentMaster;
