import React from "react";
import "./dialysisReadings.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DialysisReadingsList from "./DialysisComponents/DialysisReadingsList";

function DailyReadings() {
  return (
    <div className="dailyReadings">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="dailyReadingsContainer">
        <div className="sticky top-0 bg-white z-50 ">
          <Navbar />
        </div>
        <div className="bg-gray-100 min-h-screen md:py-5 md:px-16 w-full">
          <DialysisReadingsList />
        </div>
      </div>
    </div>
  );
}

export default DailyReadings;
