// Logic to validate the machine safety checklist

export const validateMachineSafety = (checklist) => {
  return checklist.every(item => item.status === 'OK');
};
