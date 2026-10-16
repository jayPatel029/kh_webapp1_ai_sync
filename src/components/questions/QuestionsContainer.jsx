/**
 * Questions Container Component
 * Definition-list layout: question left, answer right
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
      <Text size="sm" className="text-slate-400 italic py-1">
        No answers yet
      </Text>
    );
  }

  const canEdit = Boolean(role?.canEditPatients);

  return (
    <Box className="questions-container">
      <Box className="divide-y divide-gray-100">
        {questions.map((question, index) => {
          const answer = String(question.response ?? "").trim();
          const hasAnswer = answer !== "" && answer !== "-";

          return (
            <div
              key={question.id ?? index}
              className={`d-flex items-start gap-3 py-3 first:pt-1 last:pb-1 ${
                canEdit ? "cursor-pointer group" : ""
              }`}
              style={{ flexDirection: "row" }}
              onClick={() => canEdit && openModal(question)}
            >
              <Text
                size="sm"
                className="text-slate-500 leading-snug"
                style={{ width: "42%", flexShrink: 0 }}
              >
                {question.name}
              </Text>

              <div
                className="d-flex items-start justify-between gap-2"
                style={{ flex: 1, minWidth: 0 }}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  className={
                    hasAnswer
                      ? "text-slate-900 leading-snug whitespace-pre-wrap break-words"
                      : "text-slate-400 italic leading-snug"
                  }
                >
                  {hasAnswer ? answer : "Not answered"}
                </Text>
                {canEdit && (
                  <BorderColorIcon
                    className="text-primary opacity-40 group-hover:opacity-100"
                    style={{ fontSize: 15, flexShrink: 0, marginTop: 2 }}
                  />
                )}
              </div>
            </div>
          );
        })}
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
