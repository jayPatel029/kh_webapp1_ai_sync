import { pdfjs, Document, Page } from "react-pdf";
import { useCallback, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const resizeObserverOptions = {};

/**
 * @param {object} props
 * @param {string} props.file
 * @param {boolean} [props.fitWidth] — size pages to container width (no horizontal trim)
 * @param {number} [props.scale] — used when fitWidth is false (default 1.35)
 */
function MyPDFViewer({
  file,
  fitWidth = false,
  scale: scaleProp = 1.35,
  onLoadSuccess,
  onLoadError,
}) {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const [containerRef, setContainerRef] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);

  const onResize = useCallback((entries) => {
    const [entry] = entries;
    if (entry) {
      // Leave a little padding so canvas never clips the pane edge
      setContainerWidth(Math.max(0, entry.contentRect.width - 4));
    }
  }, []);

  useResizeObserver(
    fitWidth ? containerRef : null,
    resizeObserverOptions,
    onResize
  );

  const pageWidth =
    fitWidth && containerWidth ? Math.floor(containerWidth) : undefined;

  return (
    <div
      ref={fitWidth ? setContainerRef : undefined}
      className="h-full w-full overflow-y-auto overflow-x-hidden relative"
    >
      <Document
        file={file}
        onLoadSuccess={({ numPages: next }) => {
          setNumPages(next);
          setError(null);
          if (onLoadSuccess) onLoadSuccess({ numPages: next });
        }}
        onLoadError={(err) => {
          console.error("[MyPDFViewer] Failed to load PDF:", err);
          setError(err?.message || String(err));
          if (onLoadError) onLoadError(err);
        }}
        className="w-full flex flex-col items-center"
      >
        {error ? (
          <div className="text-red-500 p-4">Failed to load PDF: {error}</div>
        ) : (
          Array.from({ length: numPages || 0 }, (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              {...(pageWidth
                ? { width: pageWidth }
                : { scale: scaleProp })}
              className="mb-2 max-w-full"
            />
          ))
        )}
      </Document>
    </div>
  );
}

export default MyPDFViewer;
