import React, { useState,useEffect } from "react";
 
import { dissapproveAlert,dissapproveAllAlerts } from "../../ApiCalls/alertsApis";


const Modal = ({ closeModal,disAll,item,presId}) => {
  const [content,setContent] = useState("");
  
  useEffect(() => {
    console.log("Item",item)
  }, []);

  const submitComment = async () => {
    const alertId = item.id;
    const alarmId = item.alarmId;
    
    if(!disAll){
      const response = await dissapproveAlert(alertId,alarmId,content);
      window.location.reload();
    if (response.success) {
      console.log(response.message);
    } else {
      console.log(response.message);
    }
    }
    else{
        await dissapproveAllAlerts(presId,content);
        window.location.reload();

    }

  };

  return (
    <>
      <div className="fixed z-50 inset-0 flex items-center justify-center bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-teal-500 rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Please Enter a Reason for Disapproving: </h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Reason
              </label>
              <textarea 
                type="text"
                id="text"
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
           
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={submitComment}
              className="bg-teal-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
  );
};

export default Modal;
