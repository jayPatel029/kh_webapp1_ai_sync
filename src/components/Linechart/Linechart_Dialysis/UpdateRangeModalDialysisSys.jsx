import axiosInstance from "../../../helpers/axios/axiosInstance";  
import React, { useState } from "react";
import { server_url } from "../../../constants/constants";


const UpdateRangeModalDialysisSys = ({ closeModal, title, question_id, user_id, onSuccess, hr1, hr2, lr1, lr2,hrDia1,hrDia2,lrDia1,lrDia2}) => {
  const [highRangeSys1, sethighRangeSys1] = useState(hr1);
  const [highRangeSys2, sethighRangeSys2] = useState(hr2);
  const [lowRangeSys1, setlowRangeSys1] = useState(lr1);
  const [lowRangeSys2, setlowRangeSys2] = useState(lr2);

  const [highRangeDia1, setHighRangeDia1] = useState(hrDia1);
  const [highRangeDia2, setHighRangeDia2] = useState(hrDia2);
  const [lowRangeDia1, setLowRangeDia1] = useState(lrDia1);
  const [lowRangeDia2, setLowRangeDia2] = useState(lrDia2);

  const handleSubmit = () => {
    // console.log(highRangeSys1,highRangeSys2,lowRangeSys1,lowRangeSys2,question_id,user_id)

    const data = {
      question_id: question_id,
      user_id: user_id,
      high_range_1: highRangeSys1,
      high_range_2: highRangeSys2,
      low_range_1: lowRangeSys1,
      low_range_2: lowRangeSys2,
      high_range_dia_1:highRangeDia1, 
      high_range_dia_2:highRangeDia2, 
      low_range_dia_1:lowRangeDia1, 
      low_range_dia_2:lowRangeDia2
    };

    axiosInstance
      .post(`${server_url}/range/setRange/dia/sys`, data)
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
          <div className="flex flex-row">
            <div className="p-2">
              <h2 className="fond-bold mb-1 text-gray-800 text-center">Systolic</h2>
              <div>
                <label className="block text-orange-400 text-sm font-semibold mb-2">
                  High Range 1 *:
                </label>
                <input
                  type="text"
                  className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                  required
                  value={highRangeSys1}
                  onChange={(e) => sethighRangeSys1(e.target.value)}
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
                  value={lowRangeSys1}
                  onChange={(e) => setlowRangeSys1(e.target.value)}
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
                  value={highRangeSys2}
                  onChange={(e) => sethighRangeSys2(e.target.value)}
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
                  value={lowRangeSys2}
                  onChange={(e) => setlowRangeSys2(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4">
              <div>
                <h2 className="fond-bold mb-1 text-gray-800 text-center">Diastolic</h2>
                <label className="block text-orange-400 text-sm font-semibold mb-2">
                  High Range 1 *:
                </label>
                <input
                  type="text"
                  className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                  required
                  value={highRangeDia1}
                  onChange={(e) => setHighRangeDia1(e.target.value)}
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
                  value={lowRangeDia1}
                  onChange={(e) => setLowRangeDia1(e.target.value)}
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
                  value={highRangeDia2}
                  onChange={(e) => setHighRangeDia2(e.target.value)}
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
                  value={lowRangeDia2}
                  onChange={(e) => setLowRangeDia2(e.target.value)}
                />
              </div>
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

export default UpdateRangeModalDialysisSys;
