/**
 * Logs hub — user audit trail (BY) and record audit trail (TO).
 *
 * @file src/pages/AuditLogs/Logs.jsx
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { Box, Flex, Container } from "../../component-library";
import { Card, CardBody } from "../../component-library/primitives/Card";

import PageHeader from "../../components/PageHeader";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";

import "../../design-system/styles/index.css";
import "../../design-system/styles/admin-pages.css";

import {
  FaUserInjured,
  FaUserMd,
  FaUserNurse,
  FaUserShield,
  FaNotesMedical,
  FaIdCard,
} from "react-icons/fa";

const BY_CARDS = [
  {
    to: ROUTES.SETTINGS_LOGS_PATIENT,
    icon: FaUserInjured,
    title: "Patient users",
    description: "Actions made by patients in the app",
  },
  {
    to: ROUTES.SETTINGS_LOGS_DOCTOR,
    icon: FaUserMd,
    title: "Doctors",
    description: "Actions made by doctors and medical staff",
  },
  {
    to: ROUTES.SETTINGS_LOGS_DT,
    icon: FaUserNurse,
    title: "Dialysis technicians",
    description: "Actions made by dialysis technicians",
  },
  {
    to: ROUTES.SETTINGS_LOGS_ADMIN,
    icon: FaUserShield,
    title: "Admins",
    description: "Actions made by clinic admins",
  },
];

const TO_CARDS = [
  {
    to: ROUTES.SETTINGS_LOGS_PATIENT_RECORDS,
    icon: FaNotesMedical,
    title: "Patient records",
    description: "Changes made to patient profiles, labs, and prescriptions",
  },
  {
    to: ROUTES.SETTINGS_LOGS_DOCTOR_RECORDS,
    icon: FaIdCard,
    title: "Doctor records",
    description: "Changes made to doctor profiles",
  },
];

function LogCard({ card }) {
  const Icon = card.icon;
  return (
    <Link to={card.to} className="no-underline w-full sm:w-auto">
      <Card className="w-full sm:w-[280px] hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4164df]">
        <CardBody className="p-6 sm:p-8 text-center">
          <Box className="admin-card__icon w-[80px] h-[80px] mx-auto mb-4 rounded-full bg-[#e8f4f8] flex items-center justify-center">
            <Icon className="text-[#5886a5] text-4xl" />
          </Box>
          <h3 className="text-[18px] font-semibold text-[#393939] mb-2">{card.title}</h3>
          <p className="text-[14px] text-[#989898]">{card.description}</p>
        </CardBody>
      </Card>
    </Link>
  );
}

function Logs() {
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <Box className="  flex-1 flex flex-col min-w-0">
        <Box className="admin-page__header sticky top-[56px] z-20">
          <PageHeader
            title="Audit Logs"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Audit Logs", active: true },
            ]}
            onBack={() => navigate(ROUTES.HOME)}
          />
        </Box>
        <Box className="admin-card">
          <Box className="admin-page__content w-full flex-1">
            <hr className="" />

            <Container className="py-6">
              <h2 className="text-[16px] font-semibold text-[#393939] mb-2 text-center">
                Actions by user
              </h2>
              <p className="text-[13px] text-[#989898] mb-4 text-center">
                Accountability: what each role did while logged in
              </p>
              <Flex gap={6} wrap="wrap" justify="center" className="admin-card-grid">
                {BY_CARDS.map((card) => (
                  <LogCard key={card.to} card={card} />
                ))}
              </Flex>

              <h2 className="text-[16px] font-semibold text-[#393939] mt-10 mb-2 text-center">
                Changes to a record
              </h2>
              <p className="text-[13px] text-[#989898] mb-4 text-center">
                Patient privacy: who changed a profile or clinical document
              </p>
              <Flex gap={6} wrap="wrap" justify="center" className="admin-card-grid">
                {TO_CARDS.map((card) => (
                  <LogCard key={card.to} card={card} />
                ))}
              </Flex>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Logs;
