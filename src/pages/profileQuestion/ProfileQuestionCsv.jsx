import React from "react";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import ProfileQuestionListCsv from "./ProfileQuestionListCsv";
import { Box, Container } from "../../component-library";

function ProfileQuestionCsv() {
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 mx-0">
            <PageHeader
              title="Bulk Upload Questions"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Profile Questions", path: "/profileQuestions" },
                { label: "Bulk Upload", active: true }
              ]}
            />
          </Container>
        </Box>


        <ProfileQuestionListCsv />

      </Box>
    </ThemeProvider>
  );
}

export default ProfileQuestionCsv;
