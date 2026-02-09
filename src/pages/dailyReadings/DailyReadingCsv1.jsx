import React from "react";
import "./dailyReadings.scss";

import DailyquestionCsv from "./DailyReadingCsv";
import { Link } from "react-router-dom";

function DialysisReadingCsvList() {
  return (
    <div className="dailyReadingsContainer flex-1">
      <div className="p-7 ml-4 max-w-5xl mr-4 mt-4 bg-white shadow-md border-t-4">
        <Link
          to={`/DailyReadings`}
          className="text-primary border-b-2 border-primary">
          go back
        </Link>
        <DailyquestionCsv />
      </div>
    </div>
  );
}

export default DialysisReadingCsvList;
