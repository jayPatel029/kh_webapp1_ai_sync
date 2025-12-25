import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { Link } from "react-router-dom";

function Logs() {
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
    
            {/* Logs */}
        <div className="flex justify-evenly max-w-2xl bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
        <Link to="/PatientLogs" 
        className=" bg-teal-300 rounded-lg p-1  "
        >Patinet Logs </Link>
         <Link to="/DocLogs" 
        className=" bg-teal-300 rounded-lg p-1  "
        >Doctor Logs </Link>
        </div>
      </div>
    </div>
  );
}

export default Logs;
