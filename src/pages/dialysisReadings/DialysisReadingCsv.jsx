import React from "react";
import DialysisReadingCsvList from "./DialysisReadingCsvList";
import {
  Box,
  Container
} from "../../component-library";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";

function DialysisReadingCsv() {
  const navigate = useNavigate();
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
           
            <PageHeader
              title="Bulk Upload Dialysis Readings"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Dialysis Readings", path: "/readings/dialysis" },
                { label: "Bulk Upload", active: true }
              ]}
              onBack={() => navigate(ROUTES.READINGS_DIALYSIS)}
            />
           
        </Box>


        <DialysisReadingCsvList />

      </Box>
    </ThemeProvider>
  );
}

export default DialysisReadingCsv;

