import React, { useState, useEffect } from "react";
import { updatePatient, updateAilments, updateGFR, updateDryWeight, getPatientById } from "../../ApiCalls/patientAPis";
import { getAilments } from "../../ApiCalls/ailmentApis";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "../../component-library/primitives/Modal";
import { Button } from "../../component-library/primitives/Button";
import { Input } from "../../component-library/primitives/Input";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import MultiSelect from "../../component-library/primitives/MultiSelect";

const pickValue = (data, keys, fallback = "") => {
  if (!data) return fallback;
  for (const key of keys) {
    const value = data?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
};


const normalizeAilments = (data = {}) => {
  if (Array.isArray(data?.ailments)) return data.ailments;

  if (typeof data?.ailments === "string" && data.ailments.trim() !== "") {
    return data.ailments.split(",").map((a) => a.trim()).filter(Boolean);
  }

  if (typeof data?.aliments === "string" && data.aliments.trim() !== "") {
    return data.aliments.split(",").map((a) => a.trim()).filter(Boolean);
  }

  return [];
};

const NameModal = ({
  closeEditModal,
  onSuccess,
  initialData,
  user_id,
  name: initialName,
  number: initialNumber,
  dob: initialDob,
  address: initialAddress,
  state: initialState,
  pincode: initialPincode,
  updateData,
}) => {
  // Prefer explicit props (initialName/etc). If not provided, fall back to initialData from parent.
  const [name, setName] = useState(initialName ?? pickValue(initialData, ["name", "full_name", "patient_name"]));
  const [number, setNumber] = useState(initialNumber ?? pickValue(initialData, ["number", "phone", "mobile", "phone_number", "contact", "contact_number", "whatsapp"]));
  const [dob, setDob] = useState(initialDob ?? pickValue(initialData, ["dob", "date_of_birth", "birth_date" ]));
  const [address, setAddress] = useState(initialAddress ?? pickValue(initialData, ["address", "addr", "full_address", "residential_address"]));
  const [patientState, setPatientState] = useState(initialState ?? pickValue(initialData, ["state", "province", "region"]));
  const [pincode, setPincode] = useState(initialPincode ?? pickValue(initialData, ["pincode", "pin_code", "zip", "zipcode", "postal_code"]));
  const [egfr, setEGFR] = useState(pickValue(initialData, ["eGFR", "egfr"]));
  const [gfr, setGFR] = useState(pickValue(initialData, ["GFR", "gfr"]));
  const [dryWeight, setDryWeight] = useState(pickValue(initialData, ["dry_weight", "dryWeight", "dryweight"]));
  const [ailmentOptions, setAilmentOptions] = useState([]);
  const [selectedAilmentIds, setSelectedAilmentIds] = useState([]);
  const [errors, setErrors] = useState({});


  // useEffect(() => {


  const handleUpdate = async () => {
    const updatedUserData = {
      ...initialData,
      id: user_id,
      name: name,
      number: number,
      dob: dob,
      address: address,
      state: patientState,
      pincode: pincode,
    };

    // prepare selected ids and names
    const selectedIds = selectedAilmentIds.map((id) => (typeof id === "string" ? Number(id) : id));
    const selectedAilmentNames = (ailmentOptions || [])
      .filter((a) => selectedIds.includes(a.id))
      .map((a) => a.name || a.label || a);

    // validate
    const newErrors = {};
    if (!name || !String(name).trim()) newErrors.name = "Name is required";
    const phoneDigits = String(number || "").replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 7) newErrors.number = "Enter a valid phone number (7+ digits)";
    if (pincode && !/^\d{3,10}$/.test(String(pincode))) newErrors.pincode = "Enter a valid pincode";

    const hasCKD = selectedAilmentNames.some(n => String(n).toLowerCase() === 'ckd');
    const hasDialysis = selectedAilmentNames.some(n => {
      const s = String(n).toLowerCase();
      return s.includes('hemo') || s.includes('peritoneal') || s.includes('dialysis');
    });

    if (hasCKD && egfr !== "" && isNaN(Number(egfr))) newErrors.egfr = "eGFR must be numeric";
    if (hasCKD && gfr !== "" && isNaN(Number(gfr))) newErrors.gfr = "GFR must be numeric";
    if (hasDialysis && dryWeight !== "" && isNaN(Number(dryWeight))) newErrors.dryWeight = "Dry weight must be numeric";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updatePatient(updatedUserData);

      // send ailments ids (allow empty array)
      await updateAilments({
        changeBy: localStorage.getItem("email"),
        id: user_id,
        aliments: selectedIds,
      });

      if (egfr !== "" || gfr !== "") {
        await updateGFR({
          id: user_id,
          eGFR: egfr,
          GFR: gfr,
        });
      }

      if (dryWeight !== "") {
        await updateDryWeight({
          id: user_id,
          dry_weight: dryWeight,
        });
      }

      if (typeof updateData === "function") {
        // Prefer latest object from API so parent updates with canonical backend data
        let latestPatient = null;
        try {
          const latestResponse = await getPatientById(user_id);
          latestPatient = latestResponse?.data?.data || latestResponse?.data || null;
          if (latestPatient) {
            latestPatient = {
              ...latestPatient,
              ailments: normalizeAilments(latestPatient),
            };
          }
        } catch (latestErr) {
          console.error("Error fetching latest patient after update:", latestErr);
        }

        updateData(
          latestPatient || {
            ...updatedUserData,
            eGFR: egfr,
            GFR: gfr,
            dry_weight: dryWeight,
            ailments: selectedAilmentNames,
          }
        );

        if (typeof onSuccess === "function") {
          await onSuccess(latestPatient);
        }
      } else if (typeof onSuccess === "function") {
        await onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      closeEditModal();
    }
  };

  // Sync local state with incoming initial props when switching users
  useEffect(() => {
    setName(initialName ?? pickValue(initialData, ["name", "full_name", "patient_name"]));
    setNumber(initialNumber ?? pickValue(initialData, ["number", "phone", "mobile", "phone_number", "contact", "contact_number", "whatsapp"]));
    setDob(initialDob ?? pickValue(initialData, ["dob", "date_of_birth", "birth_date" ]));
    setAddress(initialAddress ?? pickValue(initialData, ["address", "addr", "full_address", "residential_address"]));
    setPatientState(initialState ?? pickValue(initialData, ["state", "province", "region"]));
    setPincode(initialPincode ?? pickValue(initialData, ["pincode", "pin_code", "zip", "zipcode", "postal_code"]));
    setEGFR(pickValue(initialData, ["eGFR", "egfr"]));
    setGFR(pickValue(initialData, ["GFR", "gfr"]));
    setDryWeight(pickValue(initialData, ["dry_weight", "dryWeight", "dryweight"]));
  }, [initialData]);

  useEffect(() => {
    const fetchAilments = async () => {
      try {
        const result = await getAilments();
          if (result?.success) {
              const fetchedAilments = result.data?.listOfAilments || [];
              setAilmentOptions(fetchedAilments);
              const existing = normalizeAilments(initialData).map(s => String(s).toLowerCase());
              const selected = fetchedAilments
                .filter(a => existing.includes(String(a.name).toLowerCase()))
                .map(a => String(a.id));
              setSelectedAilmentIds(selected);
            }
      } catch (error) {
        console.error("Error fetching ailments:", error);
      }
    };

    fetchAilments();
  }, [initialData]);

  // no-op: handled via MultiSelect value

  return (
    <Modal isOpen={true} onClose={closeEditModal} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className="pb-2 mb-4">
          <h2 className="text-2xl font-bold">Update User Details</h2>
           
        </ModalHeader>

        <ModalBody className="py-4 space-y-4">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Number</FormLabel>
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter phone number"
            />
          </FormControl>

          <FormControl>
            <FormLabel>DOB</FormLabel>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </FormControl>

          <FormControl>
            <FormLabel>State</FormLabel>
            <Input
              value={patientState}
              onChange={(e) => setPatientState(e.target.value)}
              placeholder="Enter state"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Pincode</FormLabel>
            <Input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter pincode"
            />
          </FormControl>

          {/* Show/hide fields based on selected ailments */}
          {(() => {
            const selectedNames = (ailmentOptions || []).filter(a => selectedAilmentIds.includes(String(a.id))).map(a => String(a.name).toLowerCase());
            const hasCKD = selectedNames.includes('ckd');
            const hasDialysis = selectedNames.some(n => n.includes('hemo') || n.includes('peritoneal') || n.includes('dialysis'));
            return (
              <>
                {hasCKD && (
                  <>
                    <FormControl>
                      <FormLabel>eGFR</FormLabel>
                      <Input
                        value={egfr}
                        onChange={(e) => setEGFR(e.target.value)}
                        placeholder="Enter eGFR"
                      />
                      {errors.egfr && <div className="text-red-500 text-sm mt-1">{errors.egfr}</div>}
                    </FormControl>

                    <FormControl>
                      <FormLabel>GFR</FormLabel>
                      <Input
                        value={gfr}
                        onChange={(e) => setGFR(e.target.value)}
                        placeholder="Enter GFR"
                      />
                      {errors.gfr && <div className="text-red-500 text-sm mt-1">{errors.gfr}</div>}
                    </FormControl>
                  </>
                )}

                {hasDialysis && (
                  <FormControl>
                    <FormLabel>Dry Weight</FormLabel>
                    <Input
                      value={dryWeight}
                      onChange={(e) => setDryWeight(e.target.value)}
                      placeholder="Enter dry weight"
                    />
                    {errors.dryWeight && <div className="text-red-500 text-sm mt-1">{errors.dryWeight}</div>}
                  </FormControl>
                )}
              </>
            );
          })()}

          <FormControl>
            <FormLabel>Ailments (multi-select)</FormLabel>
            <MultiSelect
              placeholder="Select ailments"
              value={selectedAilmentIds}
              onChange={(vals) => setSelectedAilmentIds(vals)}
            >
              {ailmentOptions.map((a) => (
                <option key={a.id} value={String(a.id)}>{a.name}</option>
              ))}
            </MultiSelect>
          </FormControl>

        </ModalBody>

        <ModalFooter className="flex justify-end gap-3 p-4">
          <Button variant="outline" onClick={closeEditModal}>
            CANCEL
          </Button>
          <Button variant="solid" onClick={handleUpdate}>
            UPDATE
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NameModal;
