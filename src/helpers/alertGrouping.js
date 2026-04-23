const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const norm = (value) => String(value || "").trim().toLowerCase();

const hasText = (haystack, needle) => haystack.includes(needle.toLowerCase());

const isUnreadAlert = (alert) => (
  alert?.isOpened === 0 ||
  alert?.isOpened === "0" ||
  alert?.isOpened === false ||
  alert?.isRead === 0 ||
  alert?.isRead === "0" ||
  alert?.isRead === false
);

const getPatientId = (alert) => (
  alert?.patientId ||
  alert?.patient_id ||
  alert?.userId ||
  alert?.userid ||
  alert?.pid ||
  null
);

const getPatientName = (alert) => {
  if (alert?.name) return alert.name;

  const parts = [alert?.firstname, alert?.lastname].filter(Boolean);
  if (parts.length) return parts.join(" ");

  if (alert?.patientName) return alert.patientName;

  const patientId = getPatientId(alert);
  return patientId ? `Patient ${patientId}` : "Unknown Patient";
};

const getPatientAvatar = (alert) => (
  alert?.patientProfilePhoto ||
  alert?.profile_photo ||
  alert?.photo ||
  alert?.avatar ||
  ""
);

const getSearchBlob = (alert) => {
  const parts = [
    alert?.type,
    alert?.type0,
    alert?.category,
    alert?.message,
    alert?.redirect,
    alert?.senderName,
    alert?.name,
    alert?.mess,
    alert?.fileType,
  ];

  return norm(parts.filter(Boolean).join(" "));
};

const titleCase = (value = "") => value
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const getChatType = (alert) => {
  const type = norm(alert?.type);
  if (type === "doctor") return "doctor";
  if (type === "admin") return "admin";
  if (type === "patient") return "admin"; // Patient messages are handled by admins

  const blob = getSearchBlob(alert);

  if (
    hasText(blob, "/admin-chat") ||
    hasText(blob, "doctor message to admin") ||
    hasText(blob, "admin chat")
  ) {
    return "admin";
  }

  if (
    hasText(blob, "/doctor-chat") ||
    hasText(blob, "consult doctor") ||
    hasText(blob, "send message") ||
    hasText(blob, "doctor chat")
  ) {
    return "doctor";
  }

  return null;
};

const getStaffIdentityFromAlert = (alert) => {
  const senderName = String(alert?.senderName || "").trim();
  const doctorEmail = String(alert?.doctorEmail || alert?.userEmail || "").trim();
  const rawName = String(alert?.name || "").trim();
  const typeStr = String(alert?.type || "").trim();
  const message = String(alert?.message || alert?.mess || "").trim();
  const category = String(alert?.category || "").trim();

  // Try to extract "Name: Message" from type
  const quotedMessage = typeStr.match(/^([^:]+):\s*(.+)$/);
  const guessedName = quotedMessage?.[1]?.trim() || senderName || "";
  
  // If we have an email but no name, or name is a generic type
  let displayName = guessedName || rawName;
  if (!displayName || ["doctor", "admin", "patient"].includes(displayName.toLowerCase())) {
    displayName = doctorEmail || "Unknown Staff";
  }

  const email = doctorEmail || "";

  return {
    id: email || norm(displayName),
    name: titleCase(displayName),
    email,
    subtitle: titleCase(category || message || typeStr),
  };
};

const classifyAlert = (alert) => {
  const blob = getSearchBlob(alert);
  const chatType = getChatType(alert);

  if (chatType) {
    return {
      bucket: "chat",
      chatType,
      categoryKey: `${chatType}Chat`,
      categoryLabel: chatType === "admin" ? "Admin Chats" : "Doctor Chats",
    };
  }

  if (
    hasText(blob, "comment") ||
    (alert?.fileId && alert?.fileType) ||
    alert?.url
  ) {
    return {
      bucket: "comment",
      categoryKey: "comment",
      categoryLabel: "Comments",
    };
  }

  if (hasText(blob, "prescription")) {
    return {
      bucket: "prescription",
      categoryKey: "prescription",
      categoryLabel: "Prescription",
    };
  }

  if (
    hasText(blob, "dialysis") ||
    hasText(blob, "daily reading") ||
    hasText(blob, "reading alert") ||
    alert?.dailyordia
  ) {
    return {
      bucket: "dialysis",
      categoryKey: "dialysis",
      categoryLabel: "Dialysis",
    };
  }

  return {
    bucket: "alert",
    categoryKey: "alert",
    categoryLabel: "Alerts",
  };
};

const sortAlertsNewestFirst = (alerts) => [...alerts].sort((a, b) => {
  const first = new Date(a?.date || a?.created_at || a?.updated_at || 0).getTime();
  const second = new Date(b?.date || b?.created_at || b?.updated_at || 0).getTime();
  return second - first;
});

const groupAlertsByPatient = (alerts, options = {}) => {
  const { includeChats = false } = options;
  const patients = new Map();
  const chatSummary = {
    admin: 0,
    doctor: 0,
  };

  sortAlertsNewestFirst(toArray(alerts)).forEach((alert) => {
    const patientId = getPatientId(alert);
    if (!patientId) return;

    const classification = classifyAlert(alert);

    if (classification.bucket === "chat") {
      chatSummary[classification.chatType] += isUnreadAlert(alert) ? 1 : 0;
      if (!includeChats) return;
    }

    if (!patients.has(patientId)) {
      patients.set(patientId, {
        id: patientId,
        name: getPatientName(alert),
        avatar: getPatientAvatar(alert),
        prescriptionAlerts: [],
        commentAlerts: [],
        alertAlerts: [],
        dialysisAlerts: [],
        adminChatAlerts: [],
        doctorChatAlerts: [],
        prescriptionCount: 0,
        commentCount: 0,
        alertCount: 0,
        dialysisCount: 0,
        adminChatCount: 0,
        doctorChatCount: 0,
        categoryCounts: {},
        latestAlertAt: alert?.date || alert?.created_at || null,
      });
    }

    const patient = patients.get(patientId);
    const unread = isUnreadAlert(alert);
    const bump = unread ? 1 : 0;

    if (!patient.avatar) {
      patient.avatar = getPatientAvatar(alert);
    }

    if (!patient.latestAlertAt && (alert?.date || alert?.created_at)) {
      patient.latestAlertAt = alert?.date || alert?.created_at;
    }

    switch (classification.categoryKey) {
      case "prescription":
        patient.prescriptionAlerts.push(alert);
        patient.prescriptionCount += bump || 1;
        break;
      case "comment":
        patient.commentAlerts.push(alert);
        patient.commentCount += bump || 1;
        break;
      case "dialysis":
        patient.dialysisAlerts.push(alert);
        patient.dialysisCount += bump || 1;
        break;
      case "adminChat":
        patient.adminChatAlerts.push(alert);
        patient.adminChatCount += bump || 1;
        break;
      case "doctorChat":
        patient.doctorChatAlerts.push(alert);
        patient.doctorChatCount += bump || 1;
        break;
      default:
        patient.alertAlerts.push(alert);
        patient.alertCount += bump || 1;
        break;
    }

    if (!patient.categoryCounts[classification.categoryKey]) {
      patient.categoryCounts[classification.categoryKey] = {
        key: classification.categoryKey,
        label: classification.categoryLabel,
        count: 0,
      };
    }

    patient.categoryCounts[classification.categoryKey].count += bump || 1;
  });

  const groupedPatients = [...patients.values()]
    .map((patient) => ({
      ...patient,
      categoryCounts: Object.values(patient.categoryCounts).sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => {
      const first = new Date(a.latestAlertAt || 0).getTime();
      const second = new Date(b.latestAlertAt || 0).getTime();
      return second - first;
    });

  return {
    patients: groupedPatients,
    chatSummary,
  };
};

const groupChatAlertsByStaff = (alerts) => {
  const grouped = {
    admin: new Map(),
    doctor: new Map(),
  };

  sortAlertsNewestFirst(toArray(alerts)).forEach((alert) => {
    const chatType = getChatType(alert);
    const patientId = getPatientId(alert);
    if (!chatType || !patientId) return;

    const staff = getStaffIdentityFromAlert(alert);
    const target = grouped[chatType];

    if (!target.has(staff.id)) {
      target.set(staff.id, {
        ...staff,
        patients: new Map(),
        totalAlerts: 0,
        unreadAlerts: 0,
      });
    }

    const staffGroup = target.get(staff.id);
    const patientKey = String(patientId);
    const unread = isUnreadAlert(alert) ? 1 : 0;

    if (!staffGroup.patients.has(patientKey)) {
      staffGroup.patients.set(patientKey, {
        id: patientId,
        name: getPatientName(alert),
        avatar: getPatientAvatar(alert),
        alertCount: 0,
        unreadCount: 0,
        latestAlert: alert?.category || alert?.type || alert?.message || "Chat alert",
        latestAt: alert?.date || alert?.created_at || "",
      });
    }

    const patient = staffGroup.patients.get(patientKey);
    patient.alertCount += 1;
    patient.unreadCount += unread;
    if (!patient.latestAt || new Date(alert?.date || alert?.created_at || 0) > new Date(patient.latestAt || 0)) {
      patient.latestAt = alert?.date || alert?.created_at || "";
      patient.latestAlert = alert?.category || alert?.type || alert?.message || "Chat alert";
    }

    staffGroup.totalAlerts += 1;
    staffGroup.unreadAlerts += unread;
  });

  const flattenGroup = (map) => [...map.values()]
    .map((group) => ({
      ...group,
      patients: [...group.patients.values()].sort((a, b) => new Date(b.latestAt || 0) - new Date(a.latestAt || 0)),
    }))
    .sort((a, b) => b.unreadAlerts - a.unreadAlerts || b.totalAlerts - a.totalAlerts || a.name.localeCompare(b.name));

  return {
    admin: flattenGroup(grouped.admin),
    doctor: flattenGroup(grouped.doctor),
  };
};

/**
 * Groups raw alerts/byType/doctor alerts by patientId.
 * Each alert has: { id, date, isOpened, type, category, chatId, patientId, ... }
 * Category looks like: `Doctor Message to Admin -"<message text>"`
 * Returns an array of patient groups sorted newest-first then by unread count.
 */
const groupDoctorAlertsByPatient = (alerts) => {
  const patients = new Map();

  sortAlertsNewestFirst(toArray(alerts)).forEach((alert) => {
    const patientId = getPatientId(alert);
    if (!patientId) return;

    const patientKey = String(patientId);
    const unread = isUnreadAlert(alert) ? 1 : 0;

    // Extract quoted message from category: `Doctor Message to Admin -"<msg>"`
    const categoryStr = String(alert?.category || "");
    const quotedMatch = categoryStr.match(/"([^"]*)"/);  // grab first quoted segment
    const messageSnippet = quotedMatch ? quotedMatch[1] : categoryStr;

    if (!patients.has(patientKey)) {
      patients.set(patientKey, {
        id: patientId,
        name: getPatientName(alert),
        avatar: getPatientAvatar(alert),
        alertCount: 0,
        unreadCount: 0,
        // chatId of the most recent alert for this patient
        chatId: alert?.chatId || alert?.chat_id || null,
        lastMessage: messageSnippet,
        lastAt: alert?.date || alert?.created_at || "",
      });
    }

    const patient = patients.get(patientKey);
    patient.alertCount += 1;
    patient.unreadCount += unread;

    // Keep track of the most recent alert's chatId and message
    const alertTs = new Date(alert?.date || alert?.created_at || 0).getTime();
    const patientTs = new Date(patient.lastAt || 0).getTime();
    if (alertTs >= patientTs) {
      patient.lastAt = alert?.date || alert?.created_at || "";
      patient.lastMessage = messageSnippet;
      patient.chatId = alert?.chatId || alert?.chat_id || patient.chatId;
    }
  });

  return [...patients.values()]
    .sort((a, b) =>
      b.unreadCount - a.unreadCount ||
      new Date(b.lastAt || 0) - new Date(a.lastAt || 0)
    );
};

const extractChatSummary = (summaryResponse) => {
  const rows = toArray(summaryResponse);
  return rows.map((item) => ({
    ...item,
    chatId: item?.chatid || item?.chat_id || item?.chatId || item?.id || null,
    email: item?.email || item?.user_email || item?.sender || item?.receiver || "",
    lastMessage: item?.message || item?.last_message || "",
    lastAt: item?.sent_at || item?.created_at || "",
  }));
};

export {
  classifyAlert,
  extractChatSummary,
  getChatType,
  getPatientId,
  getPatientName,
  getStaffIdentityFromAlert,
  groupAlertsByPatient,
  groupChatAlertsByStaff,
  groupDoctorAlertsByPatient,
  isUnreadAlert,
  toArray,
};
