import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from '../constants/constants';



const getDoctorComments = async (email,name) => {
    try {
        const res = await axiosInstance.post(`${server_url}/comments/getDoctorComments`,{email:email});
        var comments = res.data.data;
        var count = res.data.count;
        comments = comments.filter(comment => comment.name === name);
        const data = {
            comments: comments,
            count: count
        }
        console.log(data);
        return data;
        
    } catch (error) {
        console.error("Error getting doctor comments:", error);
    }


}

export {
    getDoctorComments
}