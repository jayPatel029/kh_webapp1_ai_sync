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
    <Box className="questions-container flex flex-col gap-5">
      {questions.map((question, index) => (
        <Flex
          key={index}
          direction="column"
          gap={2}
          className="w-full"
        >
          {/* Question Label */}
          <Flex
            className="items-center gap-2"
            onClick={() => role?.canEditPatients && openModal(question)}
            style={{ cursor: role?.canEditPatients ? 'pointer' : 'default' }}
          >
            <Text
              size="sm"
              weight="bold"
              className="text-slate-400 uppercase"
            >
              {question.name}
            </Text>
            {role?.canEditPatients && (
              <BorderColorIcon className="text-primary" style={{ fontSize: 16 }} />
            )}
          </Flex>

          {/* Answer */}
          <Box className="pl-2">
            <Text
              size="sm"
              className="text-black whitespace-pre-wrap"
            >
              {question.response || '-'}
            </Text>
          </Box>
        </Flex>
      ))}

      {questions.length === 0 && (
        <Box className="py-4">
          <Text className="text-muted">No questions available.</Text>
        </Box>
      )}

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
