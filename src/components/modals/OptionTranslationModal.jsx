import React from "react";
import { BaseModal } from "../../component-library/modals/BaseModal";
import { Button } from "../../component-library/primitives/Button";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { VStack } from "../../component-library/layout/Layout";

const OptTranslationModal = ({
  closeModal,
  languages,
  setTranslations,
  translations,
}) => {
  console.log("got this translations", translations);

  return (
    <BaseModal
      isOpen={true}
      onClose={closeModal}
      title="Set Translations"
      size="lg"
      footer={
        <Button variant="primary" onClick={closeModal}>
          Save
        </Button>
      }
    >
      <VStack gap={4} align="stretch">
        {languages.map((language, index) => {
          if (language.id !== 1)
            return (
              <FormControl key={index}>
                <FormLabel>{language.language_name}</FormLabel>
                <Input
                  type="text"
                  value={
                    typeof translations[language.id] === "string"
                      ? translations[language.id]
                      : translations[language.id]?.options || ""
                  }
                  onChange={(e) => {
                    setTranslations({
                      ...translations,
                      [language.id]: {
                        text: translations[language.id]?.text || "",
                        options: e.target.value,
                      },
                    });
                  }}
                />
              </FormControl>
            );
          return null;
        })}
      </VStack>
    </BaseModal>
  );
};

export default OptTranslationModal;
