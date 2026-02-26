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
}) => {
  const [localTranslations, setLocalTranslations] = useState({});

  useEffect(() => {
    setLocalTranslations(initialTranslations || {});
  }, [initialTranslations, isOpen]);

  const handleTranslationChange = (langId, value) => {
    setLocalTranslations((prev) => ({
      ...prev,
      [langId]: value,
    }));
  };

  const handleSubmit = () => {
    if (typeof setParentTranslations === "function") {
      setParentTranslations((prev) => ({ ...prev, ...localTranslations }));
    }

    if (typeof onSave === "function") {
      onSave(localTranslations);
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
