import React from "react";
import "./dialysisReadings.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";


import DialysisReadingCsvList from "./DialysisReadingCsvList";
import { Link } from "react-router-dom";

function DialysisReadingCsv() {
  return (
    <div className="dailyReadings">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="dailyReadingsContainer">
        <div className="sticky top-0 bg-white z-50 ">
          <Navbar />
        </div>
        <div className="p-7 ml-4 max-w-5xl mr-4 mt-4 bg-white shadow-md border-t-4">
        <Link
            to={`/DialysisReadings`}
            className="text-primary border-b-2 border-primary">
            go back
          </Link>
          <DialysisReadingCsvList/>
        </div>
      </div>
    </div>
  );
}

export default DialysisReadingCsv;
