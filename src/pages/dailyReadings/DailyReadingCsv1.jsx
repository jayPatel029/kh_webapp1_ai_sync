import React from "react";
import "./dailyReadings.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

import DailyquestionCsv from "./DailyReadingCsv";
import { Link } from "react-router-dom";

function DialysisReadingCsvList() {
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
            to={`/DailyReadings`}
            className="text-primary border-b-2 border-primary">
            go back
          </Link>
          <DailyquestionCsv />
        </div>
      </div>
    </div>
  );
}

export default DialysisReadingCsvList;
