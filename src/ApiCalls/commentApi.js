import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from "../constants/constants";

export const addComment = async (content, fileId, fileType, userId, iSDoctor) => {
    var uid = userId;
    var docId="";
    if (iSDoctor === 1){
        docId= localStorage.getItem("email");
    }
    const data = {
        content,
        fileId,
        fileType,
        userId: uid,
        iSDoctor,
        docId,
    };

    // { "content": "hey", "fileId": 26, "fileType": "Diet Details", "userId": 10, "iSDoctor": 0, "docId": "" }

    // { "content": "hey", "fileId": 27, "fileType": "10", "userId": 0, "docId": "" }

    try {
        console.log("adding pres commmetn with data:", data);  
        const response = await axiosInstance.post(`${server_url}/comments/addComment`, data);
        return response.data;
    } catch (error) {
        console.error("Error adding comment:", error);
    }
};

export const getComments = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/comments/getComments`, payload);
        return response.data;
    } catch (error) {
        console.error("Error getting comments:", error);
    }
};

export const getPatientComments = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/comments/getPatientComments`, payload);
        return response.data;
    } catch (error) {
        console.error("Error getting patient comments:", error);
    }
};

export const updateReadTable = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/comments/updateReadTable`, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating read table:", error);
    }
};


