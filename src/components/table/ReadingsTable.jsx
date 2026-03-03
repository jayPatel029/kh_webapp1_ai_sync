/**
 * ReadingsTable Component (Unified)
 * Displays readings data with CRUD operations
 * Supports both regular readings and dialysis readings
 * 
 * @file src/components/table/ReadingsTable.jsx
 */

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaFilePdf } from "react-icons/fa6";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { BsTrash } from "react-icons/bs";

import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { isValidHttpUrl } from "../../helpers/utils";
import { hasEditPermission, hasDeletePermission } from '../../helpers/permissions';
import DocOpenModal from "./DocOpenModal";

import { Box, Flex, Text, Button } from "../../component-library";
import '../../design-system/styles/index.css';

/**
 * Unified table component for displaying readings
 * @param {Object} props
 * @param {string} props.type - Type of readings: 'regular' or 'dialysis'
 * @param {number} props.questionId - Question ID
 * @param {number} props.user_id - User ID
 * @param {string} props.title - Table title
 * @param {Object} props.question - Question object
 * @param {React.Component} props.AddModal - Modal component for adding readings
 * @param {React.Component} props.UpdateModal - Modal component for updating readings
 * @param {React.Component} props.DeleteModal - Modal component for deleting readings
 */
const ReadingsTable = ({
    type = 'regular', // 'regular' or 'dialysis'
    questionId,
    user_id,
    title,
    question,
    AddModal,
    UpdateModal,
    DeleteModal,
    isPatientProfile = 0,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [patientData, setPatientData] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [deleteData, setDeleteData] = useState(null);
    const role = useSelector((state) => state.permission);

    const hasActions = hasEditPermission(role, 'dailyReadings') || hasDeletePermission(role, 'dailyReadings') || hasEditPermission(role, 'dialysisReadings') || hasDeletePermission(role, 'dialysisReadings');

    // Determine API endpoint based on type
    const apiEndpoint = type === 'dialysis' ? 'dialysisReading' : 'readings';

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

    const fetchData = React.useCallback(async () => {
        const params = { question_id: questionId, user_id: user_id };
        axiosInstance
            .get(`${server_url}/${apiEndpoint}/get`, { params })
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
    }, [questionId, user_id, apiEndpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Box className={`${type}-table-container`}>
            {role && (
                <Flex justify="between" align="center" className="mb-4">
                    <Text size="sm" weight="semibold" className="text-muted">Enter Reading/ Data</Text>
                    <Button
                        variant="outline"
                        onClick={openModal}
                        className="btn-outline-primary"
                    >
                        Enter Reading
                    </Button>
                    {showModal && AddModal && (
                        <AddModal
                            closeModal={closeModal}
                            title={title}
                            question_id={questionId}
                            user_id={user_id}
                            onSuccess={fetchData}
                            question={question}
                        />
                    )}
                </Flex>
            )}

            {uploadedFile && <DocOpenModal closeModal={closeFileModal} file={uploadedFile.file} />}

            <Box className="w-full overflow-hidden rounded-md border border-border">
                {/* Table Header */}
                <Flex className="bg-surface px-4 py-3 border-b-2 border-dark">
                    <Box className="flex-1">
                        <Text size="xs" weight="bold" className="text-muted uppercase">Reading Type</Text>
                    </Box>
                    <Box className="flex-1">
                        <Text size="xs" weight="bold" className="text-muted uppercase">Answer</Text>
                    </Box>
                    {hasActions && (
                        <Box className="w-28">
                            <Text size="xs" weight="bold" className="text-muted uppercase">Actions</Text>
                        </Box>
                    )}
                </Flex>

                {/* Table Body */}
                {patientData.length > 0 ? (
                    patientData.map((data, index) => (
                        <Flex
                            key={index}
                            className="px-4 py-3 border-b border-border last:border-b-0 bg-white hover:bg-surface/50 transition-colors"
                            align="center"
                        >
                            <Box className="flex-1">
                                <Text size="sm" className="text-dark">{data.date}</Text>
                            </Box>
                            <Box className="flex-1">
                                {data.readings && data.readings.endsWith(".pdf") ? (
                                    <FaFilePdf
                                        className="w-8 h-8 cursor-pointer text-error hover:text-error-dark transition-colors"
                                        onClick={() => openFileModal(data.readings)}
                                    />
                                ) : isValidHttpUrl(data.readings) ? (
                                    <img
                                        src={data.readings}
                                        alt="readings"
                                        style={{ width: "50px", height: "50px" }}
                                        className="cursor-pointer rounded object-cover"
                                        onClick={() => openFileModal(data.readings)}
                                    />
                                ) : (
                                    <Text size="sm" className="text-muted-foreground">{data.readings}</Text>
                                )}
                            </Box>
                            {hasActions && (
                                <Box className="w-28">
                                    <Flex gap={2}>
                                        <Button
                                            variant="ghost"
                                            onClick={() => openModalUpdate(data)}
                                            className="p-1"
                                            aria-label="Edit reading"
                                        >
                                            <BorderColorIcon className="text-info" style={{ fontSize: 18 }} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => openModalDelete(data)}
                                            className="p-1"
                                            aria-label="Delete reading"
                                        >
                                            <BsTrash className="text-error" />
                                        </Button>
                                    </Flex>
                                </Box>
                            )}
                        </Flex>
                    ))
                ) : (
                    <Box className="px-4 py-8 text-center bg-white">
                        <Text className="text-muted">No Data Found</Text>
                    </Box>
                )}
            </Box>

            {showModalUpdate && UpdateModal && (
                <UpdateModal
                    id={modalData.id}
                    date={modalData.date}
                    closeModal={closeModalUpdate}
                    onSuccess={() => {
                        fetchData();
                        closeModalUpdate();
                    }}
                />
            )}
            {showModalDelete && DeleteModal && (
                <DeleteModal
                    id={deleteData.id}
                    date={deleteData.date}
                    closeModal={closeModalDelete}
                    onSuccess={() => {
                        fetchData();
                        closeModalDelete();
                    }}
                />
            )}
        </Box>
    );
};

export default ReadingsTable;
