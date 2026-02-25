import React from "react";
import UnifiedChatApp from "../chat/UnifiedChatApp";

/**
 * DoctorChat Component
 * Wrapper around UnifiedChatApp for doctor/medical staff chat functionality
 */
const DoctorChat = () => {
  return <UnifiedChatApp chatType="doctor" />;
};

export default DoctorChat;
