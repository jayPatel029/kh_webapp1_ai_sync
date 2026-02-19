import React from "react";
import DialysisReadingCsvList from "./DialysisReadingCsvList";
import {
  Box,
  Container
} from "../../component-library";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";

function DialysisReadingCsv() {
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <Container className="py-4 px-4 md:px-6 mx-0">
            <PageHeader
              title="Bulk Upload Dialysis Readings"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Dialysis Readings", path: "/readings/dialysis" },
                { label: "Bulk Upload", active: true }
              ]}
            />
          </Container>
        </Box>


        <DialysisReadingCsvList />

      </Box>
    </ThemeProvider>
  );
}

export default DialysisReadingCsv;

