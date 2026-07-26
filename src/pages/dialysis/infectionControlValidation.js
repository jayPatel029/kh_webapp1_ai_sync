// Validation logic for P2-10 Infection Control

export const validateInfectionControl = (checklist) => {
  if (!checklist || checklist.length === 0) return false;
  
  // A checklist item passes if it's not marked as Failed/Non-compliant/No
  const compliantStatuses = [
    'OK', 'Completed', 'Used', 'Yes', 'Up to Date', 'Not Applicable', 
    'Followed', 'Safe', 'Compliant'
  ];

  return checklist.every(item => compliantStatuses.includes(item.status));
};
