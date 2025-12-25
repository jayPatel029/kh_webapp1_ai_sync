import React,{useState} from 'react'
 
import { server_url } from '../../constants/constants';
import { insertAlert } from '../../ApiCalls/appAlerts';

const SendMessage = ({closeModal,patientid}) => {
    const [message,setMessage] = useState("");
    const submitMessage = async () => {
        const doctorEmail = localStorage.getItem("email");
        const patientId = patientid;
        const category = "Send Message";
        const mess = message;
        try {
            const data = await insertAlert(doctorEmail,patientId,category,mess);
            alert("Your Message has been sent.")
            console.log(data);
            closeModal();
            
        } catch (error) {
            console.log(error);
            
        }


    }
  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-teal-500 rounded z-50 overflow-y-auto">
        <div className="header flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-2xl font-bold">Please Enter the message here: </h2>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Message
            </label>
            <textarea 
              type="text"
              id="text"
              className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                placeholder="Enter the message here"
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
            />
          </div>
         
        </div>
        <div className="flex justify-end p-4">
          <button
            className="bg-teal-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={submitMessage}
          >
            Submit
          </button>
          <button
            onClick={closeModal}
            className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </>
  )
}

export default SendMessage