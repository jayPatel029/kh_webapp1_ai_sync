import React, { useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance"; 
import DialysisTableModal from "./DialyisisTableModal";
import { server_url } from "../../constants/constants";
import { useSelector } from "react-redux";
import { FaFilePdf } from "react-icons/fa6";
import { checkURl, isValidHttpUrl } from "../../helpers/utils";
import DialysisTableModalUpdate from "./DialysisTableModalUpdate";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { set } from "date-fns";
import DialysisTableModalDelete from "./DialysisTableModalDelete";
import { BsTrash, BsCloudDownload } from "react-icons/bs";

const DialysisTable = ({ questionId, user_id, title, question,isPatientProfile=1}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [showModal2, setShowModal2] = React.useState(false);
  const [showModal3, setShowModal3] = React.useState(false);
  const [patientData, setPatientData] = React.useState({});
  const role = useSelector(state => state.permission);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const openFileModal = (file) => {
    setUploadedFile({ closeFileModal, file });
  };

  const closeFileModal = () => {
    setUploadedFile(null);
  };
  const openModal = () => {
    setShowModal(true);
  };
  const openModal2 = (data) => {
    setModalData(data); // Set modal data to the selected entry's data
    setShowModal2(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };
  const closeModal2 = () => {
    setModalData(null);
    setShowModal2(false);
  };
  const openModal3 = (data) => {  
    setDeleteData(data); // Set modal data to the selected entry's data
    setShowModal3(true);
  };
  const closeModal3 = () => {
    setDeleteData(null);
    setShowModal3(false);
  };
  const fetchData = async () => {
    const params = {
      question_id: questionId,
      user_id: user_id,
    };
    axiosInstance
      .get(`${server_url}/dialysisReading/get`, { params })
      .then((response) => {
         console.log("Response data dia:", response.data.data);

        const formattedData = response.data.data.map((item, key) => {
          const date = new Date(item.date);
          const formattedDate = date.toISOString().split("T")[0];
          return {
            date: formattedDate,
            readings: item.readings,
            number: key,
            id:item.id
          };
        });

        const sortedData = formattedData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });

         console.log("formatted data", sortedData);
        console.log(sortedData)
        setPatientData(sortedData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  function updateDia(id){
    console.log(id)
    
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>

      {
        role &&
        <div className="mb-4">
          <label htmlFor="">Enter Reading/ Data</label>
          <button
            className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
            onClick={() => openModal()}
          >
            Enter Reading
          </button>
          {showModal && (
            <DialysisTableModal
              closeModal={closeModal}
              title={title}
              question_id={questionId}
              user_id={user_id}
              onSuccess={fetchData}
              question={question}
            />
          )}
        </div>
      }
      <table className="w-full border-collapse">
        <thead className="bg-white text-gray-700">
          <tr className="border-b-2 border-black">
            <th className="py-3 px-4 text-left">Reading Type</th>
            <th className="py-3 px-4 text-left">Answer</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patientData.length > 0 ? (
            patientData.map((data, index) => (
              <tr key={index}>
                <td className="py-3 px-4">{data.date}</td>
                <td className="py-3 px-4">
                  
                {data.readings && (
                    <div>
                      {
                        isValidHttpUrl(data.readings) == true ? (
                          <img
                            src={data.readings}
                            alt="readings"
                            style={{
                              width: "50px",
                              height: "50px",
                            }}
                            className="cursor-pointer"
                            onClick={() => openFileModal(data.readings)}
                          />
                        ) : (
                          <div><span>{data.readings}</span>
                          
                          </div>
                        )
                      }
                      {showModal2 &&
                      <DialysisTableModalUpdate
                      id={modalData.id}
                      date={modalData.date}
                      closeModal={closeModal2}
                      onSuccess={() => {
                        fetchData();
                        closeModal2();
                      }}
                    />
                      }
                      {
                        showModal3 && 
                        <DialysisTableModalDelete
                        id={deleteData.id}
                        date={deleteData.date}
                        closeModal={closeModal3}
                        onSuccess={() => {
                          fetchData();
                          closeModal3();
                        }}/>
                      }
                    </div>

                  )}
                </td>
                <td className="py-3 px-4">
                <div>
                            <button onClick={() => openModal2(data)}>
                            <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                            </button>
                            <button onClick={()=>openModal3(data)} className="text-[#ff0000] inline-block mx-3">
                              <BsTrash />
                            </button>
                          </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="py-3 px-4" colSpan="2">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DialysisTable;
