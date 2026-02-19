import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import AilmentMasterComponent from "./Ailment Master/AilmentMaster";

// Component Library
import { Box, Container } from "../../component-library";

function AlimentMaster() {
  const navigate = useNavigate();
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Ailment Master"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Ailment Master", active: true }
            ]}
            onBack={() => navigate(ROUTES.HOME)}
          />
        </Box>
        <AilmentMasterComponent />
      </Box>
    </ThemeProvider>
  );
}

export default AlimentMaster;
