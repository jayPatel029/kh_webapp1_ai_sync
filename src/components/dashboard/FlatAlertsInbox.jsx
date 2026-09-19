/**
 * FlatAlertsInbox — main-style two-column flat alert lists
 * (Doctor Alerts | Patient Alerts) with current new-layout theme.
 *
 * @file src/components/dashboard/FlatAlertsInbox.jsx
 */

import React from "react";
import PropTypes from "prop-types";
import { Box, Flex, Heading, Text } from "../../component-library";
import AlertRow from "./AlertRow";
import { useIsMobile } from "../mobile/useIsMobile";
import { getPatientId } from "../../helpers/alertGrouping";

const AlertColumn = ({ title, alerts, loading, onAlertClick, nameLookup }) => (
  <Box className="flex-1 min-w-0">
    <Heading
      as="h3"
      size="lg"
      className="mb-4 text-[#3F6B85] font-bold border-b border-[#e5eef3] pb-2"
    >
      {title}
    </Heading>

    {loading ? (
      <Flex justify="center" align="center" className="py-10 text-gray-500">
        <Text size="md">Loading alerts...</Text>
      </Flex>
    ) : alerts.length === 0 ? (
      <Flex justify="center" align="center" className="py-10 text-gray-500">
        <Text size="md">No alerts</Text>
      </Flex>
    ) : (
      <Flex direction="column" gap={3}>
        {alerts.map((alert, index) => {
          const patientId = getPatientId(alert);
          const override = patientId
            ? nameLookup?.[String(patientId)]
            : undefined;
          return (
            <AlertRow
              key={alert?.id ?? `${title}-${index}`}
              alert={alert}
              onClick={onAlertClick}
              patientNameOverride={override}
            />
          );
        })}
      </Flex>
    )}
  </Box>
);

AlertColumn.propTypes = {
  title: PropTypes.string.isRequired,
  alerts: PropTypes.array,
  loading: PropTypes.bool,
  onAlertClick: PropTypes.func,
  nameLookup: PropTypes.object,
};

const FlatAlertsInbox = ({
  doctorAlerts = [],
  patientAlerts = [],
  loading = false,
  onAlertClick,
  nameLookup = {},
  className = "",
}) => {
  const { isMobile } = useIsMobile();
  const total = (doctorAlerts?.length || 0) + (patientAlerts?.length || 0);

  return (
    <Box className={className}>
      <Flex justify="between" align="center" className="mb-4 flex-wrap gap-3">
        <Heading as="h2" size={isMobile ? "md" : "xl"} className="text-black font-bold">
          Important Alerts
        </Heading>
        <Text size="sm" className="text-gray-500">
          {total} alert{total === 1 ? "" : "s"}
        </Text>
      </Flex>

      <Flex
        direction={isMobile ? "column" : "row"}
        gap={isMobile ? 8 : 8}
        className={isMobile ? "" : "items-start"}
      >
        <AlertColumn
          title="Doctor Alerts"
          alerts={doctorAlerts}
          loading={loading}
          onAlertClick={onAlertClick}
          nameLookup={nameLookup}
        />

        {!isMobile && (
          <Box className="w-px self-stretch bg-[#e5eef3] mx-2" aria-hidden />
        )}

        <AlertColumn
          title="Patient Alerts"
          alerts={patientAlerts}
          loading={loading}
          onAlertClick={onAlertClick}
          nameLookup={nameLookup}
        />
      </Flex>
    </Box>
  );
};

FlatAlertsInbox.propTypes = {
  doctorAlerts: PropTypes.array,
  patientAlerts: PropTypes.array,
  loading: PropTypes.bool,
  onAlertClick: PropTypes.func,
  nameLookup: PropTypes.object,
  className: PropTypes.string,
};

export default FlatAlertsInbox;
