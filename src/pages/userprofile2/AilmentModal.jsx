import React, { useState, useEffect } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useNavigate } from "react-router-dom";
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
import { Checkbox } from "../../component-library/primitives/Checkbox";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";

const AilmentModal = ({
  initialAilments,
  user_id,
  closeEditalimentsModal,
  onSuccess
}) => {
  const [ailmentOptions, setAilmentOptions] = useState([]);
  const [egfr, setEGFR] = useState("");
  const [gfr, setGFR] = useState("");
  const [dryWeight, setDryWeight] = useState("");
  const [kfre, setKFRE] = useState("");
  const [showDryWeightInput, setShowDryWeightInput] = useState(false);
  const [showEGFRInput, setShowEGFRInput] = useState(false);
  const [showKEFRInput, setShowKEFRInput] = useState(false);

  useEffect(() => {
    const fetchAilments = async () => {
      try {
        const response = await axiosInstance.get(`${server_url}/ailment`);
        const fetchedAilments = response.data.listOfAilments;
        setAilmentOptions(
          fetchedAilments.map((ailment) => ({
            label: ailment.name,
            id: ailment.id,
            selected: initialAilments.includes(ailment.name),
          }))
        );
      } catch (error) {
        console.error("Error fetching ailments:", error);
      }
    };

    fetchAilments();
  }, [initialAilments]);

  const handleCheckboxChange = (index) => {
    setAilmentOptions((prevOptions) =>
      prevOptions.map((option, i) => {
        if (i === index) {
          return {
            ...option,
            selected: !option.selected,
          };
        } else if (
          (option.label === "Hemo Dialysis" || option.label === "Peritoneal Dialysis") &&
          (prevOptions[index].label === "Hemo Dialysis" || prevOptions[index].label === "Peritoneal Dialysis")
        ) {
          return {
            ...option,
            selected: false,
          };
        }
        return option;
      })
    );
  };

  const handleUpdate = async () => {
    const selectedAilments = ailmentOptions
      .filter((ailment) => ailment.selected)
      .map((ailment) => ailment.id);

    const updatedUserData = {
      changeBy: localStorage.getItem("email"),
      id: user_id,
      aliments: selectedAilments,
      eGFR: egfr,
      GFR: gfr,
      dry_weight: dryWeight,
    };

    try {
      await axiosInstance.put(`${server_url}/patient/updateAilments`, updatedUserData);
      if (egfr !== "") {
        await axiosInstance.put(`${server_url}/patient/updateGFR`, {
          id: user_id,
          eGFR: egfr,
          GFR: gfr,
          KFRE: kfre
        });
      }
      if (dryWeight !== "") {
        await axiosInstance.put(`${server_url}/patient/updateDryWeight`, {
          id: user_id,
          dry_weight: dryWeight,
        });
      }
      closeEditalimentsModal();
      onSuccess();
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  useEffect(() => {
    const hasCKD = ailmentOptions.some(
      (ailment) => ailment.label === "CKD" && ailment.selected
    );
    const hasHemoDialysis = ailmentOptions.some(
      (ailment) => ailment.label === "Hemo Dialysis" && ailment.selected
    );
    const hasPeritonealDialysis = ailmentOptions.some(
      (ailment) => ailment.label === "Peritoneal Dialysis" && ailment.selected
    );
    const hasDialysis = ailmentOptions.some(
      (ailment) =>
        (ailment.label === "Hemo Dialysis" ||
          ailment.label === "Peritoneal Dialysis") &&
        ailment.selected
    );

    setShowDryWeightInput(hasHemoDialysis);
    setShowEGFRInput(hasCKD || hasHemoDialysis || hasPeritonealDialysis);
    setShowKEFRInput(hasCKD && !hasDialysis);
  }, [ailmentOptions]);

  return (
    <Modal isOpen={true} onClose={closeEditalimentsModal} size="lg">
      <ModalOverlay />
      <ModalContent className="border-t-4 border-primary">
        <ModalHeader className="border-b pb-2 mb-4">
          <h2 className="text-2xl font-bold">Update Ailments</h2>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody className="py-4">
          <FormControl className="mb-6">
            <FormLabel className="text-gray-700 text-sm font-semibold mb-2">
              Ailments:
            </FormLabel>
            <div className="space-y-2 mt-2">
              {ailmentOptions.map((ailment, index) => (
                <div key={ailment.id}>
                  <Checkbox
                    id={`ailment-${ailment.id}`}
                    isChecked={ailment.selected}
                    onChange={() => handleCheckboxChange(index)}
                  >
                    {ailment.label}
                  </Checkbox>
                </div>
              ))}
            </div>
          </FormControl>

          {showDryWeightInput && (
            <FormControl className="mb-4">
              <FormLabel className="text-gray-700 text-sm font-semibold mb-2">
                Dry Weight:
              </FormLabel>
              <Input
                value={dryWeight}
                onChange={(e) => setDryWeight(e.target.value)}
                placeholder="Enter dry weight"
              />
            </FormControl>
          )}

          {showEGFRInput && (
            <div className="space-y-4">
              <FormControl>
                <FormLabel className="text-gray-700 text-sm font-semibold mb-2">
                  GFR:
                </FormLabel>
                <Input
                  value={gfr}
                  onChange={(e) => setGFR(e.target.value)}
                  placeholder="Enter GFR"
                />
              </FormControl>
              <FormControl>
                <FormLabel className="text-gray-700 text-sm font-semibold mb-2">
                  eGFR:
                </FormLabel>
                <Input
                  value={egfr}
                  onChange={(e) => setEGFR(e.target.value)}
                  placeholder="Enter eGFR"
                />
              </FormControl>
            </div>
          )}

          {showKEFRInput && (
            <FormControl className="mt-4">
              <FormLabel className="text-gray-700 text-sm font-semibold mb-2">
                KFRE:
              </FormLabel>
              <Input
                value={kfre}
                onChange={(e) => setKFRE(e.target.value)}
                placeholder="Enter KFRE"
              />
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3 p-4">
          <Button variant="outline" onClick={closeEditalimentsModal}>
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

export default AilmentModal;
