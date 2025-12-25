import React, { useState, useEffect } from "react";
import TableModal from "./TableModal";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import DocOpenModal from "./DocOpenModal";
import TableModalDelete from "./TableModalDelete"; // Import delete modal
import TableModalUpdate from "./TableModalUpdate"; 
import { FaFilePdf } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { isValidHttpUrl } from "../../helpers/utils";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { BsTrash } from "react-icons/bs";

const Table = ({
  questionId,
  user_id,
  title,
  question,
  isPatientProfile = 0,
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [showModalUpdate, setShowModalUpdate] = React.useState(false);
  const [showModalDelete, setShowModalDelete] = React.useState(false);
  const [patientData, setPatientData] = React.useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const role = useSelector((state) => state.permission);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openModalUpdate = (data) => {
    setModalData(data);
    setShowModalUpdate(true);
  };
  const closeModalUpdate = () => {
    setModalData(null);
    setShowModalUpdate(false);
  };

  const openModalDelete = (data) => {
    setDeleteData(data);
    setShowModalDelete(true);
  };
  const closeModalDelete = () => {
    setDeleteData(null);
    setShowModalDelete(false);
  };

  const openFileModal = (file) => setUploadedFile({ closeFileModal, file });
  const closeFileModal = () => setUploadedFile(null);

  const fetchData = async () => {
    const params = { question_id: questionId, user_id: user_id };
    axiosInstance
      .get(`${server_url}/readings/get`, { params })
      .then((response) => {
        const formattedData = response.data.data.map((item, key) => {
          const date = new Date(item.date);
          return {
            id: item.id,
            date: date.toISOString().split("T")[0],
            readings: item.readings,
            number: key,
          };
        });
        const sortedData = formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        setPatientData(sortedData);
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {role && (
        <div className="mb-4">
          <label htmlFor="">Enter Reading/ Data</label>
          <button
            className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
            onClick={openModal}
          >
            Enter Reading
          </button>
          {showModal && (
            <TableModal
              closeModal={closeModal}
              title={title}
              question_id={questionId}
              user_id={user_id}
              onSuccess={fetchData}
              question={question}
            />
          )}
        </div>
      )}
      {uploadedFile && <DocOpenModal closeModal={closeFileModal} file={uploadedFile.file} />}
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
                  {data.readings && data.readings.endsWith(".pdf") ? (
                    <FaFilePdf
                      className="w-20 h-16 cursor-pointer py-3 text-red-500"
                      onClick={() => openFileModal(data.readings)}
                    />
                  ) : isValidHttpUrl(data.readings) ? (
                    <img
                      src={data.readings}
                      alt="readings"
                      style={{ width: "50px", height: "50px" }}
                      className="cursor-pointer"
                      onClick={() => openFileModal(data.readings)}
                    />
                  ) : (
                    <div>{data.readings}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div>
                    <button onClick={() => openModalUpdate(data)}>
                      <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                    </button>
                    <button
                      onClick={() => openModalDelete(data)}
                      className="text-[#ff0000] inline-block mx-3"
                    >
                      <BsTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="py-3 px-4" colSpan="3">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModalUpdate && (
        <TableModalUpdate
          id={modalData.id}
          date={modalData.date}
          closeModal={closeModalUpdate}
          onSuccess={() => {
            fetchData();
            closeModalUpdate();
          }}
        />
      )}
      {showModalDelete && (
        <TableModalDelete
          id={deleteData.id}
          closeModal={closeModalDelete}
          onSuccess={() => {
            fetchData();
            closeModalDelete();
          }}
        />
      )}
    </div>
  );
};

export default Table;
