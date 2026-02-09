import React from "react";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import DailyReadingsList from "./Daily Readings Components/DailyReadingsList";

// Component Library
import { Box, Container } from "../../component-library";

function DailyReadings() {
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 max-w-[1440px] mx-auto">
            <PageHeader
              title="Daily Readings"
              breadcrumbs={[
                { label: "Dashboard", path: "/admin" },
                { label: "Daily Readings", active: true }
              ]}
            />
          </Container>
        </Box>

        <div className="admin-page">
          <DailyReadingsList />
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default DailyReadings;
