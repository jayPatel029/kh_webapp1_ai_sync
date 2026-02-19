import React from "react";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import DialysisReadingsList from "./DialysisComponents/DialysisReadingsList";

// Component Library
import { Box, Container } from "../../component-library";

function DialysisReadings() {
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
          <Container className="py-4 px-4 md:px-6 mx-0">
            <PageHeader
              title="Dialysis Readings"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Dialysis Readings", active: true }
              ]}
            />
          </Container>
        </Box>

         
          <DialysisReadingsList />

      </Box>
    </ThemeProvider>
  );
}

export default DialysisReadings;
