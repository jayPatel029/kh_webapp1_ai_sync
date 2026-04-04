import axiosInstance from "../../../helpers/axios/axiosInstance";
import React, { useState } from "react";
import { server_url } from "../../../constants/constants";
import { FormModal } from "../../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../../component-library/primitives/FormControl";
import { Input } from "../../../component-library/primitives/Input";
import { VStack } from "../../../component-library/layout/Layout";

const UpdateRangeModelDialysis = ({
  closeModal,
  title,
  question_id,
  user_id,
  onSuccess,
  hr1,
  hr2,
  lr1,
  lr2,
}) => {
  const [highRange1, setHighRange1] = useState(hr1);
  const [highRange2, setHighRange2] = useState(hr2);
  const [lowRange1, setLowRange1] = useState(lr1);
  const [lowRange2, setLowRange2] = useState(lr2);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = () => {
    const errors = {};
    if (!highRange1 && highRange1 !== 0) errors.highRange1 = true;
    if (!lowRange1 && lowRange1 !== 0) errors.lowRange1 = true;
    if (!highRange2 && highRange2 !== 0) errors.highRange2 = true;
    if (!lowRange2 && lowRange2 !== 0) errors.lowRange2 = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const data = {
      question_id: question_id,
      user_id: user_id,
      high_range_1: highRange1,
      high_range_2: highRange2,
      low_range_1: lowRange1,
      low_range_2: lowRange2,
    };

    setIsLoading(true);
    axiosInstance
      .post(`${server_url}/rangeDialysis/setRange`, data)
      .then((response) => {
        console.log("Neel", response.data);
        onSuccess();
        closeModal();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    onSuccess();
    closeModal();
  };

  return (
    <FormModal
      isOpen={true}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Define Custom Range"
      submitText="Submit"
      isLoading={isLoading}
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      size="md"
    >
      <VStack gap={4} align="stretch">
        <FormControl isRequired isInvalid={Boolean(fieldErrors.highRange1)}>
          <FormLabel className="text-orange-400">High Range 1 </FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.highRange1)}
            type="text"
            required
            value={highRange1}
            onChange={(e) => {
              setHighRange1(e.target.value);
              setFieldErrors((prev) => ({ ...prev, highRange1: false }));
            }}
          />
        </FormControl>
        <FormControl isRequired isInvalid={Boolean(fieldErrors.lowRange1)}>
          <FormLabel className="text-red-600">Low Range 1 </FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.lowRange1)}
            type="text"
            required
            value={lowRange1}
            onChange={(e) => {
              setLowRange1(e.target.value);
              setFieldErrors((prev) => ({ ...prev, lowRange1: false }));
            }}
          />
        </FormControl>
        <FormControl isRequired isInvalid={Boolean(fieldErrors.highRange2)}>
          <FormLabel className="text-red-600">High Range 2 </FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.highRange2)}
            type="text"
            required
            value={highRange2}
            onChange={(e) => {
              setHighRange2(e.target.value);
              setFieldErrors((prev) => ({ ...prev, highRange2: false }));
            }}
          />
        </FormControl>
        <FormControl isRequired isInvalid={Boolean(fieldErrors.lowRange2)}>
          <FormLabel className="text-orange-400">Low Range 2 </FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.lowRange2)}
            type="text"
            required
            value={lowRange2}
            onChange={(e) => {
              setLowRange2(e.target.value);
              setFieldErrors((prev) => ({ ...prev, lowRange2: false }));
            }}
          />
        </FormControl>
      </VStack>
    </FormModal>
  );
};

export default UpdateRangeModelDialysis;
