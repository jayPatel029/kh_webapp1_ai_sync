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
    try {
        console.log("adding pres commmetn with data:", data);  
        const response = await axiosInstance.post(`${server_url}/comments/addComment`, data);
        return response.data;
    } catch (error) {
        console.error("Error adding comment:", error);
    }
};


