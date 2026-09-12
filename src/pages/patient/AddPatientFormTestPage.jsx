import React, { useMemo, useState } from "react";
import AddPatientForm from "./AddPatientForm";

const AddPatientFormTestPage = () => {
  const [submitStatus, setSubmitStatus] = useState("");

  const demoInitialData = useMemo(
    () => ({
      name: "Demo Patient",
      aliments: [],
      number: "9876543210",
      dob: "1988-04-12",
      registered_date: "2026-06-21",
      age: "38",
      address: "123 Sample Street",
      pincode: "560001",
      state: "Karnataka",
      blood_group: "O+",
      payment_type: "insurance",
      financial_condition: "BPL",
      bpl_card_verified: true,
      abha_id: "12-3456-7890-1234",
    }),
    []
  );

  const handleDummyAddPatient = async (payload) => {
    setSubmitStatus(`Dummy submit received ${payload instanceof FormData ? "FormData" : "payload"}.`);
    // Keep the payload visible for debugging during local UI checks.
    console.log("[AddPatientFormTestPage] submit payload:", Object.fromEntries(payload.entries()));
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900 shadow-sm">
          <h1 className="text-2xl font-bold">Add Patient Form Test</h1>
          <p className="mt-1 text-sm">
            Route: <code>/test</code> — this page renders <code>AddPatientForm</code> with dummy data so the layout,
            fields, and validation can be checked without hitting the live API.
          </p>
          {submitStatus ? (
            <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium">{submitStatus}</p>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <AddPatientForm
              isOpen
              initialData={demoInitialData}
              onCancel={() => setSubmitStatus("Demo form close clicked.")}
              onSuccess={() => setSubmitStatus("Dummy patient submit completed successfully.")}
              onAddPatient={handleDummyAddPatient}
            />
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Dummy data snapshot</h2>
            <p className="mt-1 text-sm text-gray-600">
              These are the values preloaded into the form for rendering checks.
            </p>
            <pre className="mt-4 overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">
              {JSON.stringify(demoInitialData, null, 2)}
            </pre>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddPatientFormTestPage;
