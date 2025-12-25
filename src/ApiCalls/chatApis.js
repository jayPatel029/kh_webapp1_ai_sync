import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url, adminEmail } from "../constants/constants";

export async function getChatId(receiver, pid) {
    try {
        const payload = {
            receiver: receiver,
            pid: pid,
        };
        const token = localStorage.getItem("token"); // Fetch token from local storage
        const response = await axiosInstance.post(server_url + "/chat/getId", payload, {
            headers: {
                Authorization: `Bearer ${token}`, // Send token in headers
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error.response.data.message };
    }
}

export async function getAllChats(pid) {
    try {
        const token = localStorage.getItem("token"); // Fetch token from local storage
        const response = await axiosInstance.get(server_url + "/chat/"+pid, {
            headers: {
                Authorization: `Bearer ${token}`, // Send token in headers
            },
        });
        console.log("doc chat api hre", response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.log("Error fetching all chats:", error.response.data.message);
        return { success: false, data: error.response.data.message };
    }
}

export async function sendMessage(messageData) {
    try {
        const token = localStorage.getItem("token"); // Fetch token from local storage
        const response = await axiosInstance.post(server_url + "/chat/message", messageData, {
            headers: {
                Authorization: `Bearer ${token}`, // Send token in headers
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error.response.data.message };
    }
}

export async function getMessages(chatId) {
    try {
        const token = localStorage.getItem("token"); // Fetch token from local storage
        const response = await axiosInstance.get(server_url + "/chat/message/" + chatId, {
            headers: {
                Authorization: `Bearer ${token}`, // Send token in headers
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error.response.data.message };
    }
}



export async function getAllChatsAdmin(pid) {
    try {
        const token = localStorage.getItem("token"); // Fetch token from local storage
        const response = await axiosInstance.get(server_url + "/chat/admin/" + pid, {
            headers: {
                Authorization: `Bearer ${token}`, // Send token in headers
            },
        });
        console.log("response of getAllChatsAdmin ", response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.log("Error fetching all chats:", error.response.data.message);
        return { success: false, data: error.response.data.message };
    }
}

export async function getAllSWChats(pid, sender) {
    try {
        const payload = {
            sender: sender,
        }
        const token = localStorage.getItem("token"); // Fetch token from local storage
        const response = await axiosInstance.post(server_url + "/chat/adminSW/" + pid, payload, {
            headers: {
                Authorization: `Bearer ${token}`, // Send token in headers
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.log("Error fetching all chats:", error.response.data.message);
        return { success: false, data: error.response.data.message };
    }
}

  
export async function getSWMessages(chatId) {
    try {
        const token = localStorage.getItem("token"); // Fetch token from local storage
        const response = await axiosInstance.get(server_url + "/chat/messageSW/" + chatId, {
            headers: {
                Authorization: `Bearer ${token}`, // Send token in headers
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error.response.data.message };
    }
}

