import { createContext, useContext } from "react";

export const PatientProfileShellContext = createContext(null);

export const usePatientProfileShell = () => useContext(PatientProfileShellContext);
