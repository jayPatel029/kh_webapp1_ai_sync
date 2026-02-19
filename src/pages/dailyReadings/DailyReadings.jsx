import React from "react";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import DailyReadingsList from "./Daily Readings Components/DailyReadingsList";

// Component Library
import { Box, Container } from "../../component-library";

function DailyReadings() {
  const navigate = useNavigate();
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
           
            <PageHeader
              title="Daily Readings"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Daily Readings", active: true }
              ]}
              onBack={() => navigate(ROUTES.HOME)}
            />
           
        </Box>
          <DailyReadingsList />
      </Box>
    </ThemeProvider>
  );
}

export default DailyReadings;
