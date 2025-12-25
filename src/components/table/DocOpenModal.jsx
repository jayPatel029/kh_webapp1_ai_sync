import React from "react";
import MyPDFViewer from "../pdf/MyPDFViewer";

function DocOpenModal({ closeModal, file }) {
  const isPdf = /.*\.pdf$/.test(file);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className="p-7 ml-4 mr-4 mt-4 bg-white w-3/5 h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-auto">
        <div className="header flex justify-between items-center border-b pb-2 mb-4">
          <h1 className="text-2xl font-bold">Uploaded Readings</h1>
          <button
            onClick={closeModal}
            className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="overflow-auto">
            {isPdf ? (
              <MyPDFViewer file={file} />
            ) : (
              <img
                src={file ? file : ""}
                alt="prescription"
                className="w-full h-auto object-contain"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocOpenModal;
