/**
 * OptionTranslationModal Component
 * Modal for setting option translations for different languages
 * 
 * @file src/components/modals/OptionTranslationModal.jsx
 */

import React, { useState, useEffect } from "react";
import {
  BaseModal,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Flex,
} from "../../component-library";

// Supports both APIs for backward compatibility and uses language ids
const OptionTranslationModal = ({
  isOpen,
  onClose,
  onSave,
  closeModal,
  translations: initialTranslations = {},
  setTranslations: setParentTranslations,
  languages = [],
  optionName = "",
  defaultText = "",
}) => {
  const [localTranslations, setLocalTranslations] = useState({});

  const getTranslationText = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value.text ?? value.title ?? "";
    return String(value);
  };

  const mergeTranslationValue = (prevValue, textValue) => {
    if (prevValue && typeof prevValue === "object" && !Array.isArray(prevValue)) {
      return { ...prevValue, text: textValue };
    }
    return textValue;
  };

  useEffect(() => {
    const normalized = Object.entries(initialTranslations || {}).reduce((acc, [langId, value]) => {
      acc[langId] = getTranslationText(value);
      return acc;
    }, {});

    if (defaultText && (!normalized["1"] || normalized["1"].trim() === "")) {
      normalized["1"] = defaultText;
    }

    setLocalTranslations(normalized);
  }, [initialTranslations, isOpen, defaultText]);

  const handleTranslationChange = (langId, value) => {
    setLocalTranslations((prev) => ({
      ...prev,
      [langId]: value,
    }));
  };

  const handleSubmit = () => {
    const updatedTranslations = Object.entries(localTranslations).reduce((acc, [langId, value]) => {
      acc[langId] = mergeTranslationValue(initialTranslations?.[langId], value);
      return acc;
    }, { ...(initialTranslations || {}) });

    if (defaultText && (!updatedTranslations["1"] || updatedTranslations["1"].trim?.() === "")) {
      updatedTranslations["1"] = mergeTranslationValue(initialTranslations?.["1"], defaultText);
    }

    if (typeof setParentTranslations === "function") {
      setParentTranslations((prev) => {
        const merged = { ...prev };
        Object.entries(localTranslations).forEach(([langId, value]) => {
          merged[langId] = mergeTranslationValue(prev?.[langId], value);
        });
        if (defaultText && (!merged["1"] || merged["1"].trim?.() === "")) {
          merged["1"] = mergeTranslationValue(prev?.["1"], defaultText);
        }
        return merged;
      });
    }

    if (typeof onSave === "function") {
      onSave(updatedTranslations);
    }

    if (typeof onClose === "function") onClose();
    if (typeof closeModal === "function") closeModal();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose || closeModal}
      title={`Options translations`}
      size="md"
      showCloseButton
    >
      <VStack gap={4} align="stretch">
        {languages.map((lang) => (
          <FormControl key={lang.id}>
            <FormLabel>{lang.language_name}</FormLabel>
            <Input
              placeholder={`Enter translation for ${lang.language_name}`}
              value={localTranslations[lang.id] || ""}
              onChange={(e) => handleTranslationChange(lang.id, e.target.value)}
            />
          </FormControl>
        ))}

      <Flex justify="end" gap={3} className="mt-4">
        <Button variant="ghost" onClick={onClose || closeModal}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Flex>
    </VStack>
    </BaseModal >
  );
};

export default OptionTranslationModal;
