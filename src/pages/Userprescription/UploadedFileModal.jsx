// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../helpers/axios/axiosInstance";
// import { server_url } from "../../constants/constants";
// import { addComment } from "../../ApiCalls/commentApi";
// import { useLocation } from "react-router-dom";
// import MyPDFViewer from "../../components/pdf/MyPDFViewer";
// import jsPDF from "jspdf";

// import { Document, Page, pdfjs } from "react-pdf";
// import { getPatientByIdad } from "../../ApiCalls/patientAPis";
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// // Ensure to set workerSrc
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// function UploadedFileModal({ closeModal, user_id, file , file_id }) {
//   const [newComment, setNewComment] = useState("");

//   const [prevComments, setPrevComments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();
//   const [successful, setSuccessful] = useState(true);
//   const [patientProgram, setProgram] = useState(false);
//   const role = localStorage.getItem("role");
//   const [userRole, setRole] = useState(false);

//   const getId = async () => {
//     console.log("fetching fir",user_id);
//     const res = await getPatientByIdad(user_id);
//     console.log("res for id322", res.data);
//     if (
//       res.data.data.program == "Advanced" ||
//       res.data.data.program == "Standard"
//     ) {
//       setProgram(true);
//       if ((role != "Dialysis Technician")) {
//         setRole(true);
//       }
//       console.log("role here", userRole);

//       console.log("the program", res.data.data.program);
//     }
//   };

//   useEffect(() => {
//     console.log("in useeffect", user_id);
//     const data = {
//       fileId: user_id,
//       fileType: "Prescription",
//     };
//     const handler = setTimeout(() => {
//       getId();

//     }, 500);

//     axiosInstance
//       .post(`${server_url}/comments/getComments`, data)
//       .then((res) => {
//         console.log("Comments", res.data.data);
//         setPrevComments(res.data.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });

//       return () => clearTimeout(handler);
//   }, [successful]);

//   useEffect(() => {
//     setLoading(true); // Set loading to true when file changes
//     // Check if file is loaded
//     if (file && file !== "") {
//       setLoading(false);
//     }
//   }, [file]);

//   const isPdf = /.*\.pdf$/.test(file);

//   const uploadComment = async () => {
//     try {
//       const id = user_id;
//       const fileId = user_id;
//       const fileType = "Prescription";
//       var iSDoctor = 0;
//       var isD = localStorage.getItem("isDoctor");
//       if (isD === "true") {
//         iSDoctor = 1;
//       }

//       const response = await addComment(
//         newComment,
//         fileId,
//         fileType,
//         id,
//         iSDoctor
//       );
//       if (response.success) {
//         console.log(response.message);
//       }
//       setNewComment("");
//       setSuccessful(!successful);
//       // window.location.reload();
//     } catch (error) {
//       console.error("Error uploading comment:", error);
//     }
//   };
//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const dateObject = new Date(dateString);

//     // Converting the date to Indian Standard Time (GMT+5:30)
//     const offsetInMinutes = 330; // IST is GMT+5:30, i.e., 330 minutes ahead of GMT
//     const istDateObject = new Date(
//       dateObject.getTime() + offsetInMinutes * 60000
//     );

//     // Extracting date
//     const day = istDateObject.getDate();
//     const month = istDateObject.toLocaleString("default", { month: "short" });
//     const year = istDateObject.getFullYear();

//     // Extracting and formatting time in 12-hour format
//     let hours = istDateObject.getHours();
//     const minutes = istDateObject.getMinutes().toString().padStart(2, "0");
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12; // Convert to 12-hour format, 0 -> 12
//     const formattedTime = `${hours}:${minutes} ${ampm}`;

//     return `${day} ${month} ${year}, ${formattedTime}`;
//   };
//   const downloadPDF = async () => {
//     const pdf = new jsPDF("p", "mm", "a4");
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();
//     console.log("file.Prescription", file);
//     // Load the PDF
//     if (file && file.endsWith(".pdf")) {
//       console.log("file.Prescription", file);
//       const loadingTask = pdfjs.getDocument(file);
//       loadingTask.promise.then(async (pdfDocument) => {
//         const numPages = pdfDocument.numPages;

//         // Render the PDF pages
//         for (let i = 1; i <= numPages; i++) {
//           const page = await pdfDocument.getPage(i);
//           const viewport = page.getViewport({ scale: 2 });
//           const canvas = document.createElement("canvas");
//           const context = canvas.getContext("2d");
//           canvas.width = viewport.width;
//           canvas.height = viewport.height;

//           // Render PDF page to canvas
//           await page.render({ canvasContext: context, viewport: viewport })
//             .promise;
//           const imgData = canvas.toDataURL("image/png");

//           // Add the image of the PDF page to the PDF document
//           const imgHeight = (canvas.height * pageWidth) / canvas.width;
//           pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);

//           // Add a new page if it's not the last page
//           if (i < numPages) {
//             pdf.addPage();
//           }
//         }

//         // Create a new page for comments
//         pdf.addPage();

//         // Set font for comments
//         pdf.setFontSize(12);
//         pdf.text("Comments:", 10, 20); // Title for comments section
//         let yPosition = 30; // Starting Y position for comments

//         // Add comments to PDF
//         prevComments.forEach((comment) => {
//           const commentText = `${comment.isDoctor ? "Doctor" : "Patient"}: ${
//             comment.content
//           }`;
//           const formattedDate = formatDate(comment.date);
//           const text = `${commentText} (${formattedDate})`;

//           pdf.text(text, 10, yPosition);
//           yPosition += 10; // Move down for the next line
//         });

//         // Save the final PDF
//         pdf.save("report_with_comments.pdf");
//       });
//     } else {
//       const corsProxyUrl = "https://cors-anywhere.herokuapp.com/";
//       const imageUrl = `${corsProxyUrl}${file}`;
//       pdf
//         .addImage(
//           imageUrl,
//           "JPEG",
//           0,
//           10,
//           pageWidth,
//           pageHeight * 0.5,
//           "",
//           "FAST"
//         )
//         .then(() => {
//           // Add comments section at the bottom
//           pdf.setFontSize(12);
//           let yPosition = pageHeight * 0.5 + 20;
//           pdf.text("Comments:", 10, yPosition);
//           yPosition += 10;

//           prevComments.forEach((comment) => {
//             const commentText = `${
//               comment.isDoctor ? `Doctor ${comment.doctorName}` : "Patient"
//             }: ${comment.content}`;
//             const formattedDate = formatDate(comment.date);
//             const text = `${commentText} (${formattedDate})`;
//             const lines = pdf.splitTextToSize(text, pageWidth - 20);

//             lines.forEach((line) => {
//               if (yPosition > pageHeight - 10) {
//                 pdf.addPage();
//                 yPosition = 10;
//               }
//               pdf.text(line, 10, yPosition);
//               yPosition += 10;
//             });
//           });

//           pdf.save("report_with_comments.pdf");
//         });
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
//       <div className=" ml-4 mr-4 mt-4 bg-white w-3/5 h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-auto">
//         <div className="header flex justify-between bg-white items-center border-b pb-2 mt-2 sticky top-0">
//           <h1 className="text-2xl font-bold">Uploaded File</h1>
//           <button
//             onClick={closeModal}
//             className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
//           >
//             Close
//           </button>
//           <button
//             onClick={downloadPDF}
//             className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
//           >
//             Download PDF
//           </button>
//         </div>

//         <div className="h-full">
//           {loading ? ( // Show loading indicator if isLoading is true
//             <div className="flex justify-center items-center h-full">
//               <p>Loading...</p>
//             </div>
//           ) : (
//             <div className="overflow-auto h-4/5">
//               {isPdf ? (
//                 <div className="h-full">
//                   <MyPDFViewer file={file} />
//                 </div>
//               ) : (
//                 <img
//                   src={file ? file : ""}
//                   alt="prescription"
//                   className="w-full h-auto object-contain"
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                   }}
//                 />
//               )}
//             </div>
//           )}

// { ( patientProgram && userRole ) && (
//             <div className="flex-1 mt-4">
//               <div className="mb-4 overflow-auto h-3/4">
//                 <h2 className="font-medium">Previous Comments</h2>
//                 <div className="bg-gray-100 p-4 rounded-lg overflow-y-auto max-h-[400px]">
//                   {prevComments.map((comment) => (
//                     <div
//                       key={comment.id}
//                       className={`flex items-start mb-4 ${
//                         comment.isDoctor ? "justify-start" : "justify-end"
//                       }`}
//                     >
//                       <div
//                         className={`rounded-full bg-teal-500 text-white w-8 h-8 flex items-center justify-center mr-2 ${
//                           comment.isDoctor ? "order-1" : "order-2"
//                         }`}
//                       >
//                         {comment.isDoctor ? "D" : "P"}
//                       </div>
//                       <div
//                         className={`bg-white text-black p-2 text-sm rounded-lg shadow-md max-w-3/4 ${
//                           comment.isDoctor
//                             ? "ml-2 bg-black"
//                             : "mr-2 bg-teal-500 text-black"
//                         }`}
//                       >
//                         <span className="font-medium text-xs text-gray-500 mr-2">
//                           {comment.isDoctor
//                             ? `Doctor ${comment.doctorName} : `
//                             : "Patient: "}
//                         </span>
//                         <span className="flex-grow text-sm text-black font-bold">
//                           {comment.content}
//                         </span>
//                         <p className="flex justify-end text-gray-600 italic text-xs">
//                           {formatDate(comment.date)}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h2 className="font-medium">Add a Comment</h2>
//                 <textarea
//                   id="text"
//                   className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
//                   rows="1"
//                   style={{ minHeight: "38px", height: "auto" }}
//                   value={newComment}
//                   onChange={(e) => {
//                     setNewComment(e.target.value);
//                     e.target.style.height = "auto";
//                     e.target.style.height = e.target.scrollHeight + "px";
//                   }}
//                 />
//                 <div className="flex justify-end mt-4">
//                   <button
//                     onClick={uploadComment}
//                     className="bg-teal-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                   >
//                     Submit
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UploadedFileModal;

import React, { useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { addComment } from "../../ApiCalls/commentApi";
import { useLocation } from "react-router-dom";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";
import jsPDF from "jspdf";

import { Document, Page, pdfjs } from "react-pdf";
import { useSelector } from "react-redux";
import { getPatientByIdad } from "../../ApiCalls/patientAPis";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Ensure to set workerSrc
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function UploadedFileModal({ closeModal, user_id, file, patient_id }) {
  const [newComment, setNewComment] = useState("");

  const [prevComments, setPrevComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [successful, setSuccessful] = useState(true);
  const role = useSelector((state) => state.permission);
  const [patientProgram, setProgram] = useState(false);
  const [userRole, setRole] = useState(false);

  const getId = async () => {
    const res = await getPatientByIdad(patient_id);
    console.log("res for id }", patient_id, res.data);
    if (
      res.data.data.program == "Advanced" ||
      res.data.data.program == "Standard"
    ) {
      setProgram(true);
      console.log("the role is: ", role);
      console.log("the program is baseic? ", patientProgram);
      if (role.role_name === "Dialysis Technician") {
        console.log("role is DT");
        setRole(true);
      }
      console.log("role here", userRole);
      console.log("the program", res.data.data.program);
    }
  };

  useEffect(() => {
    getId();
    console.log("in useeffect");
    const data = {
      fileId: user_id,
      fileType: "Prescription",
    };
    axiosInstance
      .post(`${server_url}/comments/getComments`, data)
      .then((res) => {
        console.log("Comments", res.data.data);
        setPrevComments(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [successful]);

  useEffect(() => {
    setLoading(true); // Set loading to true when file changes
    // Check if file is loaded
    if (file && file !== "") {
      setLoading(false);
    }
  }, [file]);

  const isPdf = /.*\.pdf$/.test(file);

  const uploadComment = async () => {
    try {
      const trimmedComment = newComment.trim();
      if (!trimmedComment) return;

      const id = location.state.id;
      const fileId = user_id;
      const fileType = "Prescription";
      var iSDoctor = 0;
      var isD = localStorage.getItem("isDoctor");
      if (isD === "true") {
        iSDoctor = 1;
      }

      const response = await addComment(
        trimmedComment,
        fileId,
        fileType,
        id,
        iSDoctor
      );
      if (response.success) {
        console.log(response.message);
      }
      setNewComment("");
      setSuccessful(!successful);
      // window.location.reload();
    } catch (error) {
      console.error("Error uploading comment:", error);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);

    // Converting the date to Indian Standard Time (GMT+5:30)
    const offsetInMinutes = 330; // IST is GMT+5:30, i.e., 330 minutes ahead of GMT
    const istDateObject = new Date(
      dateObject.getTime() + offsetInMinutes * 60000
    );

    // Extracting date
    const day = istDateObject.getDate();
    const month = istDateObject.toLocaleString("default", { month: "short" });
    const year = istDateObject.getFullYear();

    // Extracting and formatting time in 12-hour format
    let hours = istDateObject.getHours();
    const minutes = istDateObject.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format, 0 -> 12
    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return `${day} ${month} ${year}, ${formattedTime}`;
  };

  const downloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    console.log("file.Prescription", file);
    // Load the PDF
    if (file && file.endsWith(".pdf")) {
      console.log("file.Prescription", file);
      const loadingTask = pdfjs.getDocument(file);
      loadingTask.promise.then(async (pdfDocument) => {
        const numPages = pdfDocument.numPages;

        // Render the PDF pages
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Render PDF page to canvas
          await page.render({ canvasContext: context, viewport: viewport })
            .promise;
          const imgData = canvas.toDataURL("image/png");

          // Add the image of the PDF page to the PDF document
          const imgHeight = (canvas.height * pageWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);

          // Add a new page if it's not the last page
          if (i < numPages) {
            pdf.addPage();
          }
        }

        // Create a new page for comments
        pdf.addPage();

        // Set font for comments
        pdf.setFontSize(12);
        pdf.text("Comments:", 10, 20); // Title for comments section
        let yPosition = 30; // Starting Y position for comments

        // Add comments to PDF
        prevComments.forEach((comment) => {
          const commentText = `${comment.isDoctor ? "Doctor" : "Patient"}: ${
            comment.content
          }`;
          const formattedDate = formatDate(comment.date);
          const text = `${commentText} (${formattedDate})`;

          pdf.text(text, 10, yPosition);
          yPosition += 10; // Move down for the next line
        });

        // Save the final PDF
        pdf.save("report_with_comments.pdf");
      });
    } else {
      // const corsProxyUrl = "https://cors-anywhere.herokuapp.com/";
      // const imageUrl = `${corsProxyUrl}${file}`;
      const imageUrl = `${file}`;
      console.log("the img", imageUrl);
      pdf.addImage(
        imageUrl,
        "JPEG",
        0,
        10,
        pageWidth,
        pageHeight * 0.5,
        "",
        "FAST"
      );
      // .then(() => {
      // Add comments section at the bottom
      pdf.setFontSize(12);
      let yPosition = pageHeight * 0.5 + 20;
      pdf.text("Comments:", 10, yPosition);
      yPosition += 10;

      prevComments.forEach((comment) => {
        const commentText = `${
          comment.isDoctor ? `Doctor ${comment.doctorName}` : "Patient"
        }: ${comment.content}`;
        const formattedDate = formatDate(comment.date);
        const text = `${commentText} (${formattedDate})`;
        const lines = pdf.splitTextToSize(text, pageWidth - 20);

        lines.forEach((line) => {
          if (yPosition > pageHeight - 10) {
            pdf.addPage();
            yPosition = 10;
          }
          pdf.text(line, 10, yPosition);
          yPosition += 10;
        });
      });

      pdf.save("report_with_comments.pdf");
      // }
      // );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className=" ml-4 mr-4 mt-4 bg-white w-3/5 h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-auto">
        <div className="header flex justify-between bg-white items-center border-b pb-2 mt-2 sticky top-0">
          <h1 className="text-2xl font-bold">Uploaded File</h1>
          <button
            onClick={closeModal}
            className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Close
          </button>
          <button
            onClick={downloadPDF}
            className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Download PDF
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
                  <MyPDFViewer file={file} />
                </div>
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
          )}
          {patientProgram ? (
            <div className="flex-1 mt-4">
              <div className="mb-4 overflow-auto h-3/4">
                <h2 className="font-medium">Previous Comments</h2>
                <div className="bg-gray-100 p-4 rounded-lg overflow-y-auto max-h-[400px]">
                  {prevComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex items-start mb-4 ${
                        comment.isDoctor ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`rounded-full bg-teal-500 text-white w-8 h-8 flex items-center justify-center mr-2 ${
                          comment.isDoctor ? "order-1" : "order-2"
                        }`}
                      >
                        {comment.isDoctor ? "D" : "P"}
                      </div>
                      <div
                        className={`bg-white text-black p-2 text-sm rounded-lg shadow-md max-w-3/4 ${
                          comment.isDoctor
                            ? "ml-2 bg-black"
                            : "mr-2 bg-teal-500 text-black"
                        }`}
                      >
                        <span className="font-medium text-xs text-gray-500 mr-2">
                          {comment.isDoctor
                            ? `Doctor ${comment.doctorName} : `
                            : "Patient: "}
                        </span>
                        <span className="flex-grow text-sm text-black font-bold">
                          {comment.content}
                        </span>
                        <p className="flex justify-end text-gray-600 italic text-xs">
                          {formatDate(comment.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {!userRole && (
                <div>
                  <h2 className="font-medium">Add a Comment</h2>
                  <textarea
                    id="text"
                    className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                    rows="1"
                    style={{ minHeight: "38px", height: "auto" }}
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={uploadComment}
                      className="bg-teal-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-500 font-medium">
              Comments cannot be added as the patient is on the basic program.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadedFileModal;
