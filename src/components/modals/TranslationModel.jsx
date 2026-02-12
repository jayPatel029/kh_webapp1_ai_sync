/**
 * TranslationModal Component
 * Modal for setting translations for different languages
 * 
 * @file src/components/modals/TranslationModel.jsx
 */

import React, { useState, useEffect } from "react";
import {
  BaseModal,
  Button,
  FormControl,
  Input,
  VStack,
  Flex,
} from "../../component-library";

// Supports both APIs for backward compatibility:
// - (isOpen, onClose, onSave, languages)
// - (closeModal, translations, setTranslations, setLanguages, languages)
const TranslationModal = ({
  isOpen,
  onClose,
  onSave,
  closeModal,
  translations: initialTranslations = {},
  setTranslations: setParentTranslations,
  setLanguages,
  languages = [],
}) => {
  const [localTranslations, setLocalTranslations] = useState({});

  useEffect(() => {
    // initialize from parent translations prop when modal opens
    setLocalTranslations(initialTranslations || {});
  }, [initialTranslations, isOpen]);

  const handleTranslationChange = (langId, value) => {
    setLocalTranslations((prev) => ({
      ...prev,
      [langId]: value,
    }));
  };

  const handleSubmit = () => {
    // If parent provided a setter, update parent state directly
    if (typeof setParentTranslations === "function") {
      setParentTranslations((prev) => ({ ...prev, ...localTranslations }));
    }

    // Also support older callback-based API
    if (typeof onSave === "function") {
      onSave(localTranslations);
    }

    // Close modal via either prop name
    if (typeof onClose === "function") onClose();
    if (typeof closeModal === "function") closeModal();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose || closeModal}
      title="Set Translations"
      size="md"
      showCloseButton
    >
      <VStack gap={4} align="stretch">
        {languages.map((lang) => (
          <FormControl key={lang.id}>
            <Input
              placeholder={`Translation for ${lang.name}`}
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
    </BaseModal>
  );
};

export default TranslationModal;
