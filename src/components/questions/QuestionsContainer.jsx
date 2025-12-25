import React, { useEffect, useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";  
import { server_url } from "../../constants/constants";
import DynamicModal from "../modals/DynamicModal";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { useSelector } from "react-redux";


function QuestionsContainer({ aliment, user_id }) {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const role = useSelector(state => state.permission);
  const [loading,setLoading] = useState(true);
  // console.log("In Questions Container....")
  // console.log(aliment)

  useEffect(() => {
    fetchQuestions(aliment, user_id);
    setLoading(false)
  }, [aliment]);

  const fetchQuestions = async (aliment, user_id) => {
    
    await axiosInstance
      .get(
        `${server_url}/questions/generalParameter/fetchResponse/?ailment=${aliment}&user_id=${user_id}`
      )
      .then((response) => {
        // console.log(aliment,user_id)
        // console.log(response.data)
        setQuestions(response.data.data);
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      ;
  };

  const openModal = (question) => {
    setShowModal(true);
    setSelectedQuestion(question);
    // console.log(question.options);
  };

  const closeModal = () => {
    setShowModal(false);
    // setSelectedQuestion(null);
  };

  // console.log(user_id)
  // console.log(selectedQuestion.options);
  if(loading){
    return(
      <div>
        Loading.....
      </div>
    )
  }
  return (
    <div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="py-3 px-4">Question</th>
            <th className="py-3 px-4">Answer</th>
            { role?.canEditPatients &&
              <th className="py-3 px-4">Action</th>}
          </tr>
        </thead>
        <tbody>
          {questions.map((question, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-3 px-4 text-left">{question.name}</td>
              <td className="py-3 px-4  text-left">{question.response}</td>
              { role?.canEditPatients &&
                <td className="py-3 px-4  text-left">
                <button onClick={() => openModal(question)}>
                  <BorderColorIcon />
                </button>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && selectedQuestion && (
        <DynamicModal
          closeModal={closeModal}
          user_id={user_id}
          question_id={selectedQuestion.id}
          question={selectedQuestion.name}
          options={selectedQuestion.options}
          type={selectedQuestion.type}
          onSuccess={fetchQuestions(aliment, user_id)}
        />
      )}
    </div>
  );
}

export default QuestionsContainer;
