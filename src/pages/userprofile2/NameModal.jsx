import React, { useState, useEffect } from "react";
import { updatePatient } from "../../ApiCalls/patientAPis";
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

import getPatients from "../../ApiCalls/patientAPis";


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
}) => {
  // Prefer explicit props (initialName/etc). If not provided, fall back to initialData from parent.
  const [name, setName] = useState(initialName ?? initialData?.name ?? "");
  const [number, setNumber] = useState(initialNumber ?? initialData?.number ?? "");
  const [dob, setDob] = useState(initialDob ?? initialData?.dob ?? "");
  const [address, setAddress] = useState(initialAddress ?? initialData?.address ?? "");
  const [patientState, setPatientState] = useState(initialState ?? initialData?.state ?? "");
  const [pincode, setPincode] = useState(initialPincode ?? initialData?.pincode ?? "");


  // useEffect(() => {


  const handleUpdate = async () => {
    const updatedUserData = {
      id: user_id,
      name: name,
      number: number,
      dob: dob,
      address: address,
      state: patientState,
      pincode: pincode,
    };
    try {
      await updatePatient(updatedUserData);
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      closeEditModal();
    }
  };

  // Sync local state with incoming initial props when switching users
  useEffect(() => {
    setName(initialName ?? initialData?.name ?? "");
    setNumber(initialNumber ?? initialData?.number ?? "");
    setDob(initialDob ?? initialData?.dob ?? "");
    setAddress(initialAddress ?? initialData?.address ?? "");
    setPatientState(initialState ?? initialData?.state ?? "");
    setPincode(initialPincode ?? initialData?.pincode ?? "");
  }, [initialData?.id]);

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
