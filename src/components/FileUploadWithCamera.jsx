import React, { useRef, useState } from "react";
import { Box, Flex } from "../component-library";
import { Button } from "../component-library/primitives/Button";
import { Text } from "../component-library/primitives/Typography";
import { Input } from "../component-library/primitives/Input";
import CameraIcon from "../assets/Camera.svg";
import attachIcon from "../assets/attachIcon.svg";
import { Margin } from "@mui/icons-material";
import jsPDF from "jspdf";
// pdfjs will be dynamically imported when needed (no static import to keep bundle small)

const DEFAULT_MERGED_PDF_NAME = "CombinedUpload.pdf";

const getPdfJs = async () => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    return pdfjs;
};

const getDataUrlFromFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file as data URL"));
    reader.readAsDataURL(file);
});

const loadImageElement = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = src;
});

const fitIntoPage = (sourceWidth, sourceHeight, pageWidth, pageHeight, margin = 24) => {
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
    const width = sourceWidth * scale;
    const height = sourceHeight * scale;
    return {
        x: (pageWidth - width) / 2,
        y: (pageHeight - height) / 2,
        width,
        height,
    };
};

/**
 * FileUploadWithCamera
 *
 * Generalized attach + camera capture + preview component with PDF support.
 * Props:
 * - images: array of { data, name, file?, type: 'image'|'pdf' }
 * - onChange: function(newImagesArray)
 * - accept: file accept string (default: 'image/*,.pdf')
 * - multiple: boolean (default: true)
 * - attachLabel, captureLabel: button labels
 * - previewWidth/previewHeight: numbers for preview box
 * - onPdfGenerated: callback when PDF is generated
 * - pdfFileName: custom PDF filename (default: 'captures_${Date.now()}.pdf')
 *
 * PDF behavior:
 * - Accepts PDFs as well as images
 * - Automatically extracts first-page preview and appends the PDF to list
 * - Shows thumbnail (or placeholder) in preview grid without asking user to confirm
 */

/**
 * Extract first page of PDF as image preview
 */
const extractPdfFirstPage = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Dynamic import of pdfjs
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const firstPage = await pdf.getPage(1);
        
        const scale = 1.5;
        const viewport = firstPage.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await firstPage.render(renderContext).promise;
        const imageData = canvas.toDataURL('image/jpeg');
        return imageData;
    } catch (error) {
        console.error("Error extracting PDF first page:", error);
        // Return a generic PDF icon placeholder on error
        return null;
    }
};

/**
 * Generate PDF from combined images and PDF files
 */
export const buildMergedPdfFile = async (items, fileName = DEFAULT_MERGED_PDF_NAME) => {
    if (!items || items.length === 0) {
        throw new Error("No items to generate PDF");
    }

    const outputPdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
    });

    let hasAnyPage = false;
    const ensurePage = () => {
        if (hasAnyPage) {
            outputPdf.addPage();
        }
        hasAnyPage = true;
    };

    const addImagePage = (imageData, sourceWidth, sourceHeight) => {
        ensurePage();
        const pageWidth = outputPdf.internal.pageSize.getWidth();
        const pageHeight = outputPdf.internal.pageSize.getHeight();
        const fitted = fitIntoPage(sourceWidth, sourceHeight, pageWidth, pageHeight);
        outputPdf.addImage(imageData, "JPEG", fitted.x, fitted.y, fitted.width, fitted.height);
    };

    const pdfjs = await getPdfJs();

    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const isPdf = item?.type === "pdf" || item?.file?.type === "application/pdf" || item?.name?.toLowerCase?.().endsWith(".pdf");

        if (isPdf && item?.file) {
            const arrayBuffer = await item.file.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: context, viewport }).promise;
                const pageImage = canvas.toDataURL("image/jpeg", 0.92);
                addImagePage(pageImage, viewport.width, viewport.height);
            }
            continue;
        }

        let imageData = item?.data;
        if (!imageData && item?.file) {
            imageData = await getDataUrlFromFile(item.file);
        }
        if (!imageData) {
            continue;
        }
        const imageElement = await loadImageElement(imageData);
        addImagePage(imageData, imageElement.naturalWidth || imageElement.width, imageElement.naturalHeight || imageElement.height);
    }

    if (!hasAnyPage) {
        throw new Error("No valid files to generate PDF");
    }

    const pdfBlob = outputPdf.output("blob");
    return new File([pdfBlob], fileName || DEFAULT_MERGED_PDF_NAME, { type: "application/pdf" });
};
const FileUploadWithCamera = ({
    images = [],
    onChange = () => { },
    onFileChange,
    // legacy/alternate prop name used in some callers
    onFileSelect,
    accept = "image/*,.pdf",
    multiple = true,
    attachLabel = "Attach file",
    captureLabel,
    // size can be 'sm' | 'md' | 'lg'
    size = 'md',
    // previewWidth/previewHeight can override size presets
    previewWidth,
    previewHeight,
    showCountInfo = true,
    showCamera = true,
    onPdfGenerated = null,
    pdfFileName = null,
    showPdfButton = true,
}) => {
    const SIZE_PRESETS = {
        xs: { previewWidth: 120, previewHeight: 80, videoHeight: 180, buttonPadding: '2px 4px', fontSize: 12, inputHeight: 12 },
        sm: { previewWidth: 120, previewHeight: 80, videoHeight: 240, buttonPadding: '4px 6px', fontSize: 12, inputHeight: 32 },
        md: { previewWidth: 160, previewHeight: 120, videoHeight: 360, buttonPadding: '6px 8px', fontSize: 14, inputHeight: 40 },
        lg: { previewWidth: 200, previewHeight: 160, videoHeight: 600, buttonPadding: '8px 10px', fontSize: 16, inputHeight: 48 },
    };

    const finalPreviewWidth = previewWidth ?? (SIZE_PRESETS[size]?.previewWidth ?? 120);
    const finalPreviewHeight = previewHeight ?? (SIZE_PRESETS[size]?.previewHeight ?? 90);
    const finalVideoHeight = SIZE_PRESETS[size]?.videoHeight ?? 360;
    const finalButtonPadding = SIZE_PRESETS[size]?.buttonPadding ?? '8px 12px';
    const finalFontSize = SIZE_PRESETS[size]?.fontSize ?? 14;
    const finalInputHeight = SIZE_PRESETS[size]?.inputHeight ?? 40;
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    // no explicit preview state required; each pdf item stores its previewImage

    const openCamera = async () => {
        setIsCameraOpen(true);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Camera error", err);
            }
        }
    };

    const closeCamera = () => {
        setIsCameraOpen(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((t) => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    const captureFromCamera = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        const name = `capture_${Date.now()}.jpg`;
        const file = dataURLToFile(dataUrl, name);
        // Always append - never replace
        const next = [...images, { data: dataUrl, name, file }];
        onChange(next);
        if (onFileChange) {
            onFileChange(multiple ? next.map((item) => item.file).filter(Boolean) : file);
        }
        if (onFileSelect) {
            onFileSelect(multiple ? next.map((item) => item.file).filter(Boolean) : file);
        }
        closeCamera();
    };

    const dataURLToFile = (dataUrl, filename) => {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        const binary = atob(arr[1]);
        let n = binary.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = binary.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        Promise.all(files.map(async (file) => {
            const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
            if (isPdf) {
                const previewImage = await extractPdfFirstPage(file);
                return {
                    file,
                    name: file.name,
                    type: "pdf",
                    previewImage: previewImage || generatePdfPlaceholder(file.name),
                };
            }
            const data = await getDataUrlFromFile(file);
            return {
                data,
                name: file.name,
                file,
                type: "image",
            };
        })).then((newItems) => {
            const appendedItems = multiple ? newItems : newItems.slice(0, 1);
            const next = multiple ? [...images, ...appendedItems] : appendedItems;
            onChange(next);
            const selectedFiles = appendedItems.map((item) => item.file).filter(Boolean);
            if (onFileChange) {
                onFileChange(multiple ? selectedFiles : selectedFiles[0]);
            }
            if (onFileSelect) {
                onFileSelect(multiple ? selectedFiles : selectedFiles[0]);
            }
        }).catch((error) => {
            console.error("Error handling selected files:", error);
        });
    };

    const generatePdfPlaceholder = (fileName) => {
        // Create a simple SVG placeholder for PDFs
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" width="200" height="280">
                <rect width="200" height="280" fill="#f3f4f6"/>
                <rect x="20" y="20" width="160" height="240" fill="white" stroke="#d1d5db" stroke-width="2"/>
                <text x="100" y="100" font-size="16" font-weight="bold" text-anchor="middle" fill="#6b7280">📄</text>
                <text x="100" y="130" font-size="12" text-anchor="middle" fill="#6b7280">PDF File</text>
                <text x="100" y="150" font-size="10" text-anchor="middle" fill="#9ca3af" font-style="italic">${fileName.substring(0, 20)}</text>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    };



    const handleRemoveImage = (index) => {
        const next = images.filter((_, i) => i !== index);
        onChange(next);
        if (next.length === 0 && fileInputRef.current) fileInputRef.current.value = null;
    };

    const handleGeneratePdf = async () => {
        setIsGeneratingPdf(true);
        try {
            const pdfFile = await buildMergedPdfFile(images, pdfFileName || DEFAULT_MERGED_PDF_NAME);
            const downloadUrl = URL.createObjectURL(pdfFile);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = pdfFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            if (onPdfGenerated) {
                onPdfGenerated(pdfFile);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <Box>
            <Box className="relative flex gap-2 pt-5 items-center" style={{ maxHeight: finalInputHeight }}>
                <div className="w-full border-[0.1em] border-accent rounded-lg flex  items-center justify-between">
                    <div />
                    <div className="flex gap-3">
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            multiple={multiple}
                            onChange={handleImageChange}
                            attachLabel={attachLabel}
                            style={{ display: "none", height: finalInputHeight }}
                        />
                        <Button
                            variant="outline"
                            onClick={() => {
                                closeCamera();
                                if (fileInputRef.current) fileInputRef.current.click();
                            }}
                            className="!border-none !text-accent hover:!transform-none hover:!bg-accent hover:!text-white !font-normal !shadow-none"
                            style={{  fontSize: finalFontSize,margin: finalButtonPadding }}
                        >
                            {attachLabel}
                            <img src={attachIcon} alt="Attach" className="ml-2" />
                        </Button>
                    </div>
                </div>
                {showCamera && (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            openCamera();
                        }}
                        gap={2}

                        className="!bg-accent"
                        style={{ margin: finalButtonPadding, fontSize: finalFontSize, width: "full" }}
                    >
                        {captureLabel ? captureLabel : <img src={CameraIcon} alt="Camera" className="w-6 h-6" />}
                    </Button>
                )}
            </Box>

            {showCamera && isCameraOpen && (
                <Box className="relative inset-0 z-50 p-4 mt-4 flex items-center justify-center w-full">
                    <Box className="bg-white rounded-lg w-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <Text size="lg" weight="bold">Camera</Text>
                            <Button variant="danger" onClick={() => { closeCamera(); }}>X</Button>
                        </div>
                        <div className="flex-1 bg-black flex items-center justify-center rounded-lg overflow-hidden">
                            <video ref={videoRef} autoPlay playsInline className="w-full object-cover" style={{ height: finalVideoHeight }} />
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => captureFromCamera()}>Capture</Button>
                        </div>
                    </Box>
                </Box>
            )}

            {images && images.length > 0 && (
                <Box mt={8}>
                    {/* <Text size="sm" className="font-medium">Previews:</Text> */}
                    <Flex wrap="wrap" gap={3} className="mt-8">
                        {images.map((img, index) => {
                                const isString = typeof img === 'string' || img instanceof String;
                                const isPdf = img?.type === "pdf";
                                const src = !isPdf ? (isString ? img : (img?.data || (img?.file ? URL.createObjectURL(img.file) : null))) : img?.previewImage;
                                const label = img?.name || (isString && src ? src.split('/').pop() : 'File');
                                return (
                                    <div key={index} style={{ position: 'relative', width: finalPreviewWidth }}>
                                        <div style={{ borderRadius: 8, overflow: 'hidden', width: finalPreviewWidth, height: finalPreviewHeight, background: '#f3f4f6', position: 'relative' }}>
                                            {src ? (
                                                <img src={src} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 px-2 text-center">
                                                    {label}
                                                </div>
                                            )}
                                            {isPdf && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    left: 4,
                                                    background: 'rgba(0, 0, 0, 0.7)',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                    fontSize: '10px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    📄 PDF
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleRemoveImage(index)}
                                            style={{ position: 'absolute', top: 6, right: 6, padding: '2px 6px' }}
                                        >
                                            X
                                        </Button>
                                        <Text size="xs" className="mt-2 text-gray-500" style={{ maxWidth: finalPreviewWidth, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {label}
                                        </Text>
                                    </div>
                                );
                        })}
                    </Flex>
                    {/* {showCountInfo && (
                        <Box className="mt-4 flex items-center justify-between">
                            <Text size="xs" className="text-gray-500">
                                Selected: {images.length} {images.length === 1 ? 'item' : 'items'} {images.length > 1 ? '(will be combined into PDF)' : ''}
                            </Text>
                            {showPdfButton && images.length > 0 && (
                                <Button
                                    onClick={handleGeneratePdf}
                                    disabled={isGeneratingPdf}
                                    className="!bg-accent !text-white hover:!bg-accent/90"
                                    style={{ fontSize: '12px', padding: '4px 12px' }}
                                >
                                    {isGeneratingPdf ? 'Generating...' : '📥 Download PDF'}
                                </Button>
                            )}
                        </Box>
                    )} */}
                </Box>
            )}


        </Box>
    );
};

export default FileUploadWithCamera;








