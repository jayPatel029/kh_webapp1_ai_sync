import React from "react";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import ProfileQuestionListCsv from "./ProfileQuestionListCsv";
import { Box, Container } from "../../component-library";

function ProfileQuestionCsv() {
  const navigate = useNavigate();
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
           
            <PageHeader
              title="Bulk Upload Questions"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Profile Questions", path: "/profile-questions" },
                { label: "Bulk Upload", active: true }
              ]}
              onBack={() => navigate(ROUTES.PROFILE_QUESTIONS)}
            />
           
        </Box>


        <ProfileQuestionListCsv />

      </Box>
    </ThemeProvider>
  );
}

export default ProfileQuestionCsv;

