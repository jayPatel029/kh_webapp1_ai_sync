import React from "react";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import AilmentMasterComponent from "./Ailment Master/AilmentMaster";

// Component Library
import { Box, Container } from "../../component-library";

function AlimentMaster() {
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 mx-0">
            <PageHeader
              title="Ailment Master"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Ailment Master", active: true }
              ]}
            />
          </Container>
        </Box>

        <AilmentMasterComponent />
      </Box>
    </ThemeProvider>
  );
}

export default AlimentMaster;
