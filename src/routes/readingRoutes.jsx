import React, { lazy } from "react";

const DailyReadings = lazy(() => import("../pages/dailyReadings/DailyReadings"));
const DialysisReadings = lazy(() => import("../pages/dialysisReadings/DialysisReadings"));

export const getReadingRoutes = ({ guard, ROUTE_NAMES }) => [
  {
    path: "readings",
    children: [
      { path: "daily", element: guard(<DailyReadings />, ROUTE_NAMES.DAILY_READINGS) },
      { path: "dialysis", element: guard(<DialysisReadings />, ROUTE_NAMES.DIALYSIS_READINGS) },
    ],
  },
];
