import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";

const NameModal = ({
  closeEditModal,
  onSuccess,
  initialData,
  updateData,
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
  
  const changeBy = localStorage.getItem("email");
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
    console.log(updatedUserData);
    try {
      await axiosInstance.put(
        `${server_url}/patient/updatePatient`,
        updatedUserData
      );
      onSuccess();

      // await axiosInstance
      // .put(`${server_url}/patient/updatePatient`, updatedUserData)
      // .then(async (response) => {
      //   console.log("User data updated successfully:", response.data);
      //   await onSuccess()
      //   closeEditModal();
      // })
      // .catch((error) => {
      //   console.error("Error updating user data:", error);
      // });
    } catch (error) {
      console.log(error);
    } finally {
      closeEditModal();
    }
  };

  const handleCancel = () => {
    closeEditModal();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Update User Details</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label htmlFor="">Name: </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="">Number: </label>
              <input
                type="text"
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="">DOB: </label>
              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="">Address: </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="">State: </label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="">Pincode: </label>
              <input
                type="text"
                id="pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleUpdate}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              UPDATE
            </button>
            <button
              onClick={handleCancel}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NameModal;
