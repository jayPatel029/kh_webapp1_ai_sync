import axiosInstance from "../../../helpers/axios/axiosInstance";
import React, { useState } from "react";
import { server_url } from "../../../constants/constants";
import { FormModal } from "../../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../../component-library/primitives/FormControl";
import { Input } from "../../../component-library/primitives/Input";
import { VStack, HStack, Box } from "../../../component-library/layout/Layout";
import { Heading } from "../../../component-library/primitives/Typography";

const UpdateRangeModalDialysisSys = ({
  closeModal,
  title,
  question_id,
  user_id,
  onSuccess,
  hr1,
  hr2,
  lr1,
  lr2,
  hrDia1,
  hrDia2,
  lrDia1,
  lrDia2,
}) => {
  const [highRangeSys1, sethighRangeSys1] = useState(hr1);
  const [highRangeSys2, sethighRangeSys2] = useState(hr2);
  const [lowRangeSys1, setlowRangeSys1] = useState(lr1);
  const [lowRangeSys2, setlowRangeSys2] = useState(lr2);

  const [highRangeDia1, setHighRangeDia1] = useState(hrDia1);
  const [highRangeDia2, setHighRangeDia2] = useState(hrDia2);
  const [lowRangeDia1, setLowRangeDia1] = useState(lrDia1);
  const [lowRangeDia2, setLowRangeDia2] = useState(lrDia2);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = () => {
    const errors = {};
    if (!highRangeSys1 && highRangeSys1 !== 0) errors.highRangeSys1 = true;
    if (!lowRangeSys1 && lowRangeSys1 !== 0) errors.lowRangeSys1 = true;
    if (!highRangeSys2 && highRangeSys2 !== 0) errors.highRangeSys2 = true;
    if (!lowRangeSys2 && lowRangeSys2 !== 0) errors.lowRangeSys2 = true;
    if (!highRangeDia1 && highRangeDia1 !== 0) errors.highRangeDia1 = true;
    if (!lowRangeDia1 && lowRangeDia1 !== 0) errors.lowRangeDia1 = true;
    if (!highRangeDia2 && highRangeDia2 !== 0) errors.highRangeDia2 = true;
    if (!lowRangeDia2 && lowRangeDia2 !== 0) errors.lowRangeDia2 = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const data = {
      question_id: question_id,
      user_id: user_id,
      high_range_1: highRangeSys1,
      high_range_2: highRangeSys2,
      low_range_1: lowRangeSys1,
      low_range_2: lowRangeSys2,
      high_range_dia_1: highRangeDia1,
      high_range_dia_2: highRangeDia2,
      low_range_dia_1: lowRangeDia1,
      low_range_dia_2: lowRangeDia2,
    };

    setIsLoading(true);
    axiosInstance
      .post(`${server_url}/range/setRange/dia/sys`, data)
      .then((response) => {
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
      size="lg"
    >
      <HStack gap={6} align="stretch">
        <Box flex={1}>
          <Heading as="h3" size="sm" className="mb-4 text-center text-gray-800">
            Systolic
          </Heading>
          <VStack gap={3} align="stretch">
            <FormControl isRequired isInvalid={Boolean(fieldErrors.highRangeSys1)}>
              <FormLabel className="text-orange-400">High Range 1 </FormLabel>
              <Input
                isInvalid={Boolean(fieldErrors.highRangeSys1)}
                type="text"
                required
                value={highRangeSys1}
                onChange={(e) => {
                  sethighRangeSys1(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, highRangeSys1: false }));
                }}
              />
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.lowRangeSys1)}>
              <FormLabel className="text-orange-400">Low Range 1 </FormLabel>
              <Input
                isInvalid={Boolean(fieldErrors.lowRangeSys1)}
                type="text"
                required
                value={lowRangeSys1}
                onChange={(e) => {
                  setlowRangeSys1(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, lowRangeSys1: false }));
                }}
              />
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.highRangeSys2)}>
              <FormLabel className="text-red-600">High Range 2 </FormLabel>
              <Input
                isInvalid={Boolean(fieldErrors.highRangeSys2)}
                type="text"
                required
                value={highRangeSys2}
                onChange={(e) => {
                  sethighRangeSys2(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, highRangeSys2: false }));
                }}
              />
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.lowRangeSys2)}>
              <FormLabel className="text-red-600">Low Range 2 </FormLabel>
              <Input
                isInvalid={Boolean(fieldErrors.lowRangeSys2)}
                type="text"
                required
                value={lowRangeSys2}
                onChange={(e) => {
                  setlowRangeSys2(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, lowRangeSys2: false }));
                }}
              />
            </FormControl>
          </VStack>
        </Box>

        <Box flex={1}>
          <Heading as="h3" size="sm" className="mb-4 text-center text-gray-800">
            Diastolic
          </Heading>
          <VStack gap={3} align="stretch">
            <FormControl isRequired isInvalid={Boolean(fieldErrors.highRangeDia1)}>
              <FormLabel className="text-orange-400">High Range 1 </FormLabel>
              <Input
                isInvalid={Boolean(fieldErrors.highRangeDia1)}
                type="text"
                required
                value={highRangeDia1}
                onChange={(e) => {
                  setHighRangeDia1(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, highRangeDia1: false }));
                }}
              />
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.lowRangeDia1)}>
              <FormLabel className="text-orange-400">Low Range 1 </FormLabel>
              <Input
                isInvalid={Boolean(fieldErrors.lowRangeDia1)}
                type="text"
                required
                value={lowRangeDia1}
                onChange={(e) => {
                  setLowRangeDia1(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, lowRangeDia1: false }));
                }}
              />
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.highRangeDia2)}>
              <FormLabel className="text-red-600">High Range 2 </FormLabel>
              <Input
                isInvalid={Boolean(fieldErrors.highRangeDia2)}
                type="text"
                required
                value={highRangeDia2}
                onChange={(e) => {
                  setHighRangeDia2(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, highRangeDia2: false }));
                }}
              />
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.lowRangeDia2)}>
              <FormLabel className="text-red-600">Low Range 2 </FormLabel>
              <Input
                isInvalid={Boolean(fieldErrors.lowRangeDia2)}
                type="text"
                required
                value={lowRangeDia2}
                onChange={(e) => {
                  setLowRangeDia2(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, lowRangeDia2: false }));
                }}
              />
            </FormControl>
          </VStack>
        </Box>
      </HStack>
    </FormModal>
  );
};

export default UpdateRangeModalDialysisSys;
