import React, { useState, useEffect } from "react";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";

const SimpleModal = ({ closeModal, image }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // Set loading to true when file changes
    // Check if file is loaded
    if (image && image !== "") {
      setLoading(false);
    }
  }, [image]);

  console.log(image);

  const isPdf = /.*\.pdf$/.test(image);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className="p-7 ml-4 mr-4 mt-4 bg-white w-3/5 h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-y-auto">
        <div className="header flex justify-between items-center border-b pb-2 mb-4">
          <h1 className="text-2xl font-bold">Uploaded Image</h1>
          <button
            onClick={closeModal}
            className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Close
          </button>
        </div>

        <div className="h-full">
          {loading ? ( // Show loading indicator if isLoading is true
            <div className="flex justify-center items-center h-full">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="overflow-auto h-4/5">
              {isPdf ? (
                <div className="h-full">
                  <MyPDFViewer file={image} />
                </div>
              ) : (
                <img
                  src={image ? image : ""}
                  alt="prescription"
                  className="w-full h-auto object-contain"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
