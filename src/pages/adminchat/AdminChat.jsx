import React from "react";
import UnifiedChatApp from "../chat/UnifiedChatApp";

/**
 * AdminChat Component
 * Wrapper around UnifiedChatApp for admin/PSadmin chat functionality
 */
const AdminChat = () => {
  return <UnifiedChatApp chatType="admin" />;
};

export default AdminChat;

