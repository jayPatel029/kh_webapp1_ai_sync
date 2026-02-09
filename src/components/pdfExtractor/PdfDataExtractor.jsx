/**
 * PDF Data Extractor Component
 * Allows uploading a PDF and extracting text from it
 * 
 * @file src/components/pdfExtractor/PdfDataExtractor.jsx
 */

import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import {
  Box,
  Flex,
  VStack,
  Text,
  Heading,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
} from "../../component-library";
import '../../design-system/styles/index.css';

const PdfDataExtractor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `${server_url}/patientdata/extractTextFromPdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setText(response.data.text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" className="w-full max-w-2xl mx-auto card-elevated">
      <CardHeader className="border-b border-border">
        <Heading size="lg" weight="bold" className="text-dark">
          PDF Text Extractor
        </Heading>
      </CardHeader>
      <CardBody>
        <VStack gap={4} align="stretch">
          <Box>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
            />
          </Box>

          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!file}
          >
            Upload and Extract
          </Button>

          {text && (
            <Box className="mt-4">
              <Heading size="md" weight="semibold" className="text-dark mb-2">
                Extracted Text:
              </Heading>
              <Box className="p-4 bg-surface rounded-lg border border-border max-h-96 overflow-auto">
                <Text size="sm" className="text-dark whitespace-pre-wrap">
                  {text}
                </Text>
              </Box>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PdfDataExtractor;
