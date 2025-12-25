import axiosInstance from "../../helpers/axios/axiosInstance";
import React, { useState } from "react";
import { server_url } from "../../constants/constants";

const UpdateRangeModel = ({ closeModal, title,question_id,user_id,onSuccess,hr1,hr2,lr1,lr2}) => {
  const [highRange1, setHighRange1] = useState(hr1);
  const [highRange2, setHighRange2] = useState(hr2);
  const [lowRange1, setLowRange1] = useState(lr1);
  const [lowRange2, setLowRange2] = useState(lr2);

  const handleSubmit = () => {
    // console.log(highRange1,highRange2,lowRange1,lowRange2,question_id,user_id)

    const data = {
      question_id: question_id,
      user_id: user_id,
      high_range_1: highRange1,
      high_range_2: highRange2,
      low_range_1: lowRange1,
      low_range_2: lowRange2,
    };

    axiosInstance
      .post(`${server_url}/range/setRange`, data)
      .then((response) => {
        // console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    onSuccess();
    closeModal();
  };

  const handleClose = () => {
    onSuccess();
    closeModal();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Define Custom Range</h2>
          </div>
          <div className="p-4">
            <div>
              <label className="block text-orange-400 text-sm font-semibold mb-2">
                High Range 1 *:
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                required
                value={highRange1}
                onChange={(e) => setHighRange1(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-orange-400 text-sm font-semibold mb-2">
                Low Range 1 *:
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                required
                value={lowRange1}
                onChange={(e) => setLowRange1(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-red-600 text-sm font-semibold mb-2">
                High Range 2 *:
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                required
                value={highRange2}
                onChange={(e) => setHighRange2(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-red-600 text-sm font-semibold mb-2">
                Low Range 2 *:
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                required
                value={lowRange2}
                onChange={(e) => setLowRange2(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
            <button
              onClick={handleClose}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateRangeModel;
