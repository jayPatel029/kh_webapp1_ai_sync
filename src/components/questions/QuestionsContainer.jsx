/**
 * Questions Container Component
 * Displays questions and responses with edit functionality
 * 
 * @file src/components/questions/QuestionsContainer.jsx
 */

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import DynamicModal from "../modals/DynamicModal";
import { Box, Flex, Text, Button, Spinner } from "../../component-library";
import '../../design-system/styles/index.css';

function QuestionsContainer({ aliment, user_id }) {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const role = useSelector(state => state.permission);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions(aliment, user_id);
  }, [aliment]);

  const fetchQuestions = async (aliment, user_id) => {
    setLoading(true);
    await axiosInstance
      .get(
        `${server_url}/questions/generalParameter/fetchResponse/?ailment=${aliment}&user_id=${user_id}`
      )
      .then((response) => {
        setQuestions(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const openModal = (question) => {
    setShowModal(true);
    setSelectedQuestion(question);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" className="py-8">
        <Spinner size="md" />
        <Text className="ml-3 text-muted">Loading...</Text>
      </Flex>
    );
  }

  return (
    <Box className="questions-container">
      <Box className="w-full overflow-hidden rounded-md border border-border">
        {/* Table Header */}
        <Flex className="bg-surface px-4 py-3 border-b border-border">
          <Box className="flex-1">
            <Text size="xs" weight="bold" className="text-muted uppercase">Question</Text>
          </Box>
          <Box className="flex-1">
            <Text size="xs" weight="bold" className="text-muted uppercase">Answer</Text>
          </Box>
          {role?.canEditPatients && (
            <Box className="w-24">
              <Text size="xs" weight="bold" className="text-muted uppercase">Action</Text>
            </Box>
          )}
        </Flex>

        {/* Table Body */}
        {questions.map((question, index) => (
          <Flex
            key={index}
            className="px-4 py-3 border-b border-border last:border-b-0 bg-white hover:bg-surface/50 transition-colors"
            align="center"
          >
            <Box className="flex-1">
              <Text size="sm" className="text-dark">{question.name}</Text>
            </Box>
            <Box className="flex-1">
              <Text size="sm" className="text-muted-foreground">{question.response || '-'}</Text>
            </Box>
            {role?.canEditPatients && (
              <Box className="w-24">
                <Button
                  variant="ghost"
                  onClick={() => openModal(question)}
                  className="p-1"
                  aria-label={`Edit ${question.name}`}
                >
                  <BorderColorIcon className="text-primary" style={{ fontSize: 18 }} />
                </Button>
              </Box>
            )}
          </Flex>
        ))}

        {questions.length === 0 && (
          <Box className="px-4 py-8 text-center bg-white">
            <Text className="text-muted">No questions available.</Text>
          </Box>
        )}
      </Box>

      {showModal && selectedQuestion && (
        <DynamicModal
          closeModal={closeModal}
          user_id={user_id}
          question_id={selectedQuestion.id}
          question={selectedQuestion.name}
          options={selectedQuestion.options}
          type={selectedQuestion.type}
          onSuccess={() => fetchQuestions(aliment, user_id)}
        />
      )}
    </Box>
  );
}

export default QuestionsContainer;
