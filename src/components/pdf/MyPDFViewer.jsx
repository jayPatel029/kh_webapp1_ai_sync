// import { Worker, Viewer } from "@react-pdf-viewer/core";
// import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
// import { pdfjs } from "react-pdf";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// function MyPDFViewer({ file }) {
//   return (
//     <Worker
//       workerUrl={`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`}
//     >
//       <Viewer fileUrl={file} />
//     </Worker>
//   );
// }

// export default MyPDFViewer;


import { pdfjs, Document, Page } from "react-pdf";
import { useState } from "react";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


// pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs-worker/pdf.worker.min.js";

function MyPDFViewer({ file, onLoadSuccess, onLoadError }) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.35); //zoom lvl
  const [error, setError] = useState(null);

  // Log the file URL being loaded
  console.log("[MyPDFViewer] Loading PDF file:", file);

  return (
    <div className="h-full overflow-auto flex justify-center relative">
      {/* pdf here*/}
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setError(null);
          if (onLoadSuccess) onLoadSuccess({ numPages });
        }}
        onLoadError={err => {
          console.error("[MyPDFViewer] Failed to load PDF:", err);
          setError(err?.message || String(err));
          if (onLoadError) onLoadError(err);
        }}
        className="noscrollbar"
      >
        {error ? (
          <div className="text-red-500 p-4">Failed to load PDF: {error}</div>
        ) : (
          Array.from({ length: numPages || 0 }, (_, index) => (
            <Page
              key={index}
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={scale}
            />
          ))
        )}
      </Document>
    </div>
  );
}

export default MyPDFViewer;
