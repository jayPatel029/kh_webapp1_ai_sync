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
import { Box, Flex, Text, Spinner } from "../../component-library";
import "../../design-system/styles/index.css";

function QuestionsContainer({ aliment, user_id }) {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const role = useSelector((state) => state.permission);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions(aliment, user_id);
  }, [aliment, user_id]);

  const fetchQuestions = async (alimentName, patientId) => {
    setLoading(true);
    await axiosInstance
      .get(
        `${server_url}/questions/generalParameter/fetchResponse/?ailment=${alimentName}&user_id=${patientId}`
      )
      .then((response) => {
        setQuestions(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setQuestions([]);
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
      <Flex align="center" className="py-3">
        <Spinner size="sm" />
        <Text size="sm" className="ml-2 text-slate-500">
          Loading…
        </Text>
      </Flex>
    );
  }

  if (!questions.length) {
    return (
      <Text size="sm" className="text-slate-400 italic pl-0.5">
        No answers yet
      </Text>
    );
  }

  const canEdit = Boolean(role?.canEditPatients);

  return (
    <Box className="questions-container space-y-3">
      {questions.map((question, index) => {
        const answer = String(question.response ?? "").trim();
        const hasAnswer = answer !== "" && answer !== "-";

        return (
          <Flex
            key={question.id ?? index}
            align="start"
            justify="between"
            gap={3}
            className={`group ${canEdit ? "cursor-pointer" : ""}`}
            onClick={() => canEdit && openModal(question)}
          >
            <Box className="min-w-0 flex-1">
              <Text size="sm" className="text-slate-500">
                {question.name}
              </Text>
              <Text
                size="sm"
                weight="semibold"
                className={
                  hasAnswer
                    ? "text-slate-800 mt-0.5 whitespace-pre-wrap break-words"
                    : "text-slate-400 italic mt-0.5"
                }
              >
                {hasAnswer ? answer : "Not answered"}
              </Text>
            </Box>

            {canEdit && (
              <BorderColorIcon
                className="text-primary opacity-50 group-hover:opacity-100 flex-shrink-0 mt-0.5"
                style={{ fontSize: 15 }}
              />
            )}
          </Flex>
        );
      })}

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
