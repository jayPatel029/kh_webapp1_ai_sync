import axiosInstance from "../../helpers/axios/axiosInstance";
import React, { useState } from "react";
import { server_url } from "../../constants/constants";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { VStack, HStack, Box } from "../../component-library/layout/Layout";
import { Heading } from "../../component-library/primitives/Typography";

const UnifiedUpdateRangeModal = ({
  closeModal,
  title = "Define Custom Range",
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
  submitPath = "/range/setRange",
  includeDiastolic = false,
  size = "md",
}) => {
  const [highRange1, setHighRange1] = useState(hr1 ?? "");
  const [highRange2, setHighRange2] = useState(hr2 ?? "");
  const [lowRange1, setLowRange1] = useState(lr1 ?? "");
  const [lowRange2, setLowRange2] = useState(lr2 ?? "");

  const [highRangeDia1, setHighRangeDia1] = useState(hrDia1 ?? "");
  const [highRangeDia2, setHighRangeDia2] = useState(hrDia2 ?? "");
  const [lowRangeDia1, setLowRangeDia1] = useState(lrDia1 ?? "");
  const [lowRangeDia2, setLowRangeDia2] = useState(lrDia2 ?? "");

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateAndCollect = () => {
    const errors = {};
    if (!highRange1 && highRange1 !== 0) errors.highRange1 = true;
    if (!lowRange1 && lowRange1 !== 0) errors.lowRange1 = true;
    if (!highRange2 && highRange2 !== 0) errors.highRange2 = true;
    if (!lowRange2 && lowRange2 !== 0) errors.lowRange2 = true;
    if (includeDiastolic) {
      if (!highRangeDia1 && highRangeDia1 !== 0) errors.highRangeDia1 = true;
      if (!lowRangeDia1 && lowRangeDia1 !== 0) errors.lowRangeDia1 = true;
      if (!highRangeDia2 && highRangeDia2 !== 0) errors.highRangeDia2 = true;
      if (!lowRangeDia2 && lowRangeDia2 !== 0) errors.lowRangeDia2 = true;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return null;

    const data = {
      question_id: question_id,
      user_id: user_id,
      high_range_1: highRange1,
      high_range_2: highRange2,
      low_range_1: lowRange1,
      low_range_2: lowRange2,
    };

    if (includeDiastolic) {
      data.high_range_dia_1 = highRangeDia1;
      data.high_range_dia_2 = highRangeDia2;
      data.low_range_dia_1 = lowRangeDia1;
      data.low_range_dia_2 = lowRangeDia2;
    }

    return data;
  };

  const handleSubmit = () => {
    const data = validateAndCollect();
    if (!data) return;
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}${submitPath}`, data)
      .then((response) => {
        onSuccess && onSuccess(response.data);
        closeModal && closeModal();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    onSuccess && onSuccess();
    closeModal && closeModal();
  };

  return (
    <FormModal
      isOpen={true}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={title}
      submitText="Submit"
      isLoading={isLoading}
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      size={size}
    >
      {includeDiastolic ? (
        <HStack gap={6} align="stretch">
          <Box flex={1}>
            <Heading as="h3" size="sm" className="mb-4 text-center text-gray-800">
              Systolic
            </Heading>
            <VStack gap={3} align="stretch">
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
                <FormLabel className="text-orange-400">Low Range 1 </FormLabel>
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
                <FormLabel className="text-red-600">Low Range 2 </FormLabel>
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
      ) : (
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
            <FormLabel className="text-orange-400">Low Range 1 </FormLabel>
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
            <FormLabel className="text-red-600">Low Range 2 </FormLabel>
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
      )}
    </FormModal>
  );
};

export default UnifiedUpdateRangeModal;
