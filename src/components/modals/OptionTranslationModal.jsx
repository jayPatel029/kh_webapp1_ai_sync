/**
 * OptionTranslationModal Component
 * Modal for setting option translations for different languages
 * 
 * @file src/components/modals/OptionTranslationModal.jsx
 */

import React, { useState } from "react";
import {
  BaseModal,
  Button,
  FormControl,
  Input,
  VStack,
  Flex,
} from "../../component-library";

const OptionTranslationModal = ({ isOpen, onClose, onSave, languages = [], optionName = "" }) => {
  const [translations, setTranslations] = useState({});

  const handleTranslationChange = (langCode, value) => {
    setTranslations((prev) => ({
      ...prev,
      [langCode]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(translations);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Translate: ${optionName}`}
      size="md"
      showCloseButton
    >
      <VStack gap={4} align="stretch">
        {languages.map((lang) => (
          <FormControl key={lang.code}>
            <Input
              placeholder={`Translation for ${lang.name}`}
              value={translations[lang.code] || ""}
              onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
            />
          </FormControl>
        ))}

        <Flex justify="end" gap={3} className="mt-4">
          <Button variant="ghost" onClick={onClose}>
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

export default OptionTranslationModal;
