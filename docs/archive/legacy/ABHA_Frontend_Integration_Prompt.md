# FRONTEND INTEGRATION PROMPT — ABDM ABHA Counter-Assisted Creation
Target: kifayti-webapp1 (Patient-facing / Front-desk OPD Registration Module)

## ROLE
You are a senior React/Next.js frontend engineer working on the KifaytiHealth `kifayti-webapp1` OPD registration screen. Implement a self-contained "Create ABHA" widget that the front-desk receptionist uses during patient check-in, calling ONLY backend-proxied endpoints (never the ABDM Gateway directly from the browser).

## HARD CONSTRAINTS
- No `navigator.geolocation` calls anywhere in this module.
- No `localStorage`, `sessionStorage`, `IndexedDB`, or filesystem writes for Aadhaar, OTP, tokens, or photos. All state lives in React component state (in-memory) only, cleared on unmount/submit.
- All ABDM calls MUST go through our own backend (`/api/abha/*` proxy routes) — the browser must never hold clientSecret, RSA private logic, or raw Aadhaar longer than the input field.
- Aadhaar input must be masked after 4th digit typed: display as `XXXX-XXXX-1234`.

## COMPONENT STRUCTURE
Build a multi-step wizard component `<AbhaCreationWizard />` with these steps, backed by our backend proxy endpoints listed against each:

1. **PatientLookupStep** — search by mobile/name → `GET /api/patients/search?mobile=`. If existing ABHA found via backend's silent `POST /api/abha/search`, show "Existing ABHA Found" banner and skip to Step 5.
2. **ConsentStep** — render mandatory consent checkbox + text (from Section 3.2 of the spec doc); disable "Next" until checked.
3. **IdentityCaptureStep** — radio group: Aadhaar OTP (default) / Driving License / Mobile OTP. Aadhaar field with live RegEx `^[2-9]\d{11}$` + Verhoeff checksum validation (implement checksum client-side for instant UX feedback, but re-validate server-side too). On submit → `POST /api/abha/request-otp`.
4. **OtpVerifyStep** — 6-digit OTP input (`^\d{6}$`), 45s countdown, "Resend" (max 3), plus mobile number field if different from Aadhaar-linked number. Submit → `POST /api/abha/enrol`. On success, receive `{ abhaNumber, name, dob, gender, photoBase64, kycVerified }` from backend (backend has already stripped raw tokens).
5. **AddressSuggestionStep** — fetch suggestions via `GET /api/abha/suggestions`, render 3 chip options + custom input (RegEx `^[a-zA-Z0-9._]{4,18}$`), submit → `POST /api/abha/create-address`.
6. **ReviewAndConfirmStep** — show auto-filled demographic card (render `photoBase64` directly as `<img src={`data:image/jpeg;base64,${photo}`} />` — never blob-download it), editable fields for anything ABDM didn't return, "Confirm & Register" button.
7. **CompletionStep** — show OPD ticket number + ABHA number + ABHA address, "Print ABHA Card" button → `GET /api/abha/card` (triggers server-side PDF stream, opens in new tab via `window.open(blobUrl)` generated from response, revoke URL immediately after print dialog).

## STATE MANAGEMENT
- Use a single `useReducer` (or Zustand slice scoped to this wizard) holding: `step`, `txnId`, `patientDraft`, `otpTimer`, `error`, `loading`. Do NOT put Aadhaar/OTP raw values into any global store — keep them local to the relevant step component and clear immediately after the API call resolves.

## ERROR / FALLBACK UX
- Wrap every ABDM proxy call with an 8-second client-side timeout. On timeout/5xx, show a non-blocking banner: "ABDM network slow. Proceeding with temporary local OPD registration." and call `POST /api/patients/register-local` to issue a local MRN; queue a retry flag (`abhaSyncPending: true`) that the backend background worker will resolve later — the frontend just needs to render a "ABHA Pending Sync" badge on the patient card.
- OTP failure after 3 resends → show inline links to switch to "Try Mobile OTP" or "Use Driving License" steps.

## ACCESSIBILITY & UX DETAILS
- All OTP/Aadhaar inputs: `inputMode="numeric"`, `autoComplete="off"`, `maxLength` enforced.
- Timer as a circular countdown component, ARIA live region announcing "OTP expires in N seconds".
- Consent text must be fully visible (no truncation/scroll-to-accept dark patterns) with checkbox default UNCHECKED.

## DELIVERABLES
1. `<AbhaCreationWizard />` component tree (7 sub-components as above) under `src/components/abha/`.
2. `useAbhaWizard()` hook encapsulating the reducer + API calls.
3. Zod/Yup schema file `abhaValidation.ts` with all RegEx rules from Section 5 of the spec doc.
4. Storybook stories for each step in isolation (mock API responses).
5. Unit tests covering: Aadhaar checksum validation, OTP countdown/resend cap, fallback banner trigger on simulated timeout.

## OUT OF SCOPE (Backend responsibility — do not implement in frontend)
- RSA encryption of Aadhaar/mobile/OTP (backend-only, using live-fetched NHA public key).
- Session token (`accessToken`/`X-token`) storage and refresh.
- Audit log writing.
- Raw Aadhaar storage of any kind (frontend must never receive it back from backend after submission).
