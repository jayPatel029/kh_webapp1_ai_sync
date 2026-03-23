/**
 * Report options for doctors
 * Each report type has a key for storage and label for display
 */
export const REPORT_OPTIONS = [
  {
    key: "patient_profile_graphs",
    label: "Patient Profile Graphs",
    description: "Patient conditions, gender, age group, ailment, and user tenure",
  },
  {
    key: "treatment_adherence",
    label: "Treatment Adherence Reports",
    description: "Gender, age group, ailment, and alert tracking",
  },
//   {
//     key: "module_integration",
//     label: "Module Integration Reports",
//     description: "Module 2 into Module 1 integration",
//   },
  {
    key: "patient_enrolment",
    label: "Patient Enrolment Reports",
    description: "Weekly, monthly, 6-month, and yearly enrolment with filters",
  },
  {
    key: "ckd_stage",
    label: "CKD Stage Reports",
    description: "Based on eGFR and GFR ranges",
  },
  {
    key: "ailment_charts",
    label: "Ailment Charts",
    description: "Filter by months/years and gender",
  },
];
