// Validation logic for P2-12 Start Dialysis Confirmation

export const DEFAULT_CORRECT_PIN = '1111';
export const MAX_ATTEMPTS = 3;

export const verifyPin = (inputPin, currentAttempts = 0) => {
  if (currentAttempts >= MAX_ATTEMPTS) {
    return {
      isValid: false,
      attempts: currentAttempts,
      isLocked: true,
      error: 'Too many failed attempts. Ask a nurse or nephrologist to unlock.'
    };
  }

  // PIN is verified on the server only. This helper is unused by P2-12.
  if (!inputPin) {
    return {
      isValid: false,
      attempts: currentAttempts,
      isLocked: false,
      error: 'Enter your start PIN.',
    };
  } else {
    const newAttempts = currentAttempts + 1;
    const isLockedNow = newAttempts >= MAX_ATTEMPTS;

    return {
      isValid: false,
      attempts: newAttempts,
      isLocked: isLockedNow,
      error: isLockedNow 
        ? 'Too many failed attempts. Ask a nurse or nephrologist to unlock.' 
        : 'Incorrect password. Try again.'
    };
  }
};
