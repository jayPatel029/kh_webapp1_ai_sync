// Validation logic for P2-11 Safety Validation

export const validateSafetyValidation = (steps = []) => {
  if (!steps || steps.length === 0) {
    return { isValid: false, blockingIssues: ['No step data available.'] };
  }

  const blockingIssues = [];

  steps.forEach(step => {
    if (step.status !== 'Completed') {
      blockingIssues.push(`${step.name} is incomplete.`);
    }
  });

  return {
    isValid: blockingIssues.length === 0,
    blockingIssues
  };
};
