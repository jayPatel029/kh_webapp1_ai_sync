import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
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

const NameModal = ({
  closeEditModal,
  onSuccess,
  initialData,
  name: initialName,
  number: initialNumber,
  dob: initialDob,
  address: initialAddress,
  state: initialState,
  pincode: initialPincode,
}) => {
  const [name, setName] = useState(initialName || "");
  const [number, setNumber] = useState(initialNumber || "");
  const [dob, setDob] = useState(initialDob || "");
  const [address, setAddress] = useState(initialAddress || "");
  const [state, setState] = useState(initialState || "");
  const [pincode, setPincode] = useState(initialPincode || "");
  
  const handleUpdate = async () => {
    const updatedUserData = {
      id: initialData.id,
      name: name,
      number: number,
      dob: dob,
      address: address,
      state: state,
      pincode: pincode,
    };
    try {
      await axiosInstance.put(
        `${server_url}/patient/updatePatient`,
        updatedUserData
      );
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      closeEditModal();
    }
  };

  return (
    <Modal isOpen={true} onClose={closeEditModal} size="lg">
      <ModalOverlay />
      <ModalContent className="border-t-4 border-primary">
        <ModalHeader className="border-b pb-2 mb-4">
          <h2 className="text-2xl font-bold">Update User Details</h2>
        <ModalCloseButton />
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
              value={state}
              onChange={(e) => setState(e.target.value)}
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
