import React, { useRef, useState } from "react";
import { Box, Flex } from "../component-library";
import { Button } from "../component-library/primitives/Button";
import { Text } from "../component-library/primitives/Typography";
import { Input } from "../component-library/primitives/Input";
import attachIcon from "../assets/attachIcon.svg";

/**
 * FileUploadWithCamera
 *
 * Generalized attach + camera capture + preview component.
 * Props:
 * - images: array of { data, name, file? }
 * - onChange: function(newImagesArray)
 * - accept: file accept string (default: 'image/*')
 * - multiple: boolean (default: true)
 * - append: boolean (default: false) whether to append selected files or replace
 * - attachLabel, captureLabel: button labels
 * - previewWidth/previewHeight: numbers for preview box
 */
const FileUploadWithCamera = ({
    images = [],
    onChange = () => { },
    onFileChange,
    accept = "image/*",
    multiple = true,
    append = false,
    attachLabel = "Attach file",
    captureLabel = "Capture image",
    previewWidth = 120,
    previewHeight = 90,
    showCountInfo = true,
    showCamera = true,
}) => {
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

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
        const next = append ? [...images, { data: dataUrl, name, file }] : [{ data: dataUrl, name, file }];
        onChange(next);
        if (onFileChange) {
            onFileChange(multiple ? next.map((item) => item.file).filter(Boolean) : file);
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

        const newImages = [];
        let loaded = 0;
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                newImages.push({ data: reader.result, name: file.name, file });
                loaded += 1;
                if (loaded === files.length) {
                    const next = append ? [...images, ...newImages] : [...newImages];
                    onChange(next);
                    if (onFileChange) {
                        onFileChange(multiple ? files : files[0]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index) => {
        const next = images.filter((_, i) => i !== index);
        onChange(next);
        if (next.length === 0 && fileInputRef.current) fileInputRef.current.value = null;
    };

    return (
        <Box>
            <Box className="relative flex gap-2 items-center">
                <div className="w-full border-[0.1em] border-accent rounded-lg flex  min-h-[50px] pr-1 items-center justify-between">
                    <div />
                    <div className="flex gap-3">

                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            multiple={multiple}
                            onChange={handleImageChange}
                            attachLabel={attachLabel}
                            style={{ display: "none" }}
                        />
                        <Button
                            variant="outline"
                            onClick={() => {
                                closeCamera();
                                if (fileInputRef.current) fileInputRef.current.click();
                            }}
                            className="!border-none hover:!transform-none hover:!bg-accent hover:!text-white !font-normal !shadow-none"
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
                        className="!bg-accent p-6"
                    >
                        {captureLabel}
                    </Button>
                )}
            </Box>

            {showCamera && isCameraOpen && (
                <Box className="relative inset-0 z-50 p-4 flex items-center justify-center w-full">
                    <Box className="bg-white rounded-lg w-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <Text size="lg" weight="bold">Camera</Text>
                            <Button variant="danger" onClick={() => { closeCamera(); }}>X</Button>
                        </div>
                        <div className="flex-1 bg-black flex items-center justify-center rounded-lg overflow-hidden">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => captureFromCamera()}>Capture</Button>
                        </div>
                    </Box>
                </Box>
            )}

            {images && images.length > 0 && (
                <Box mt={4}>
                    <Text size="sm" className="font-medium">Previews:</Text>
                    <Flex wrap="wrap" gap={3} className="mt-2">
                        {images.map((img, index) => (
                            <div key={index} style={{ position: 'relative', width: previewWidth }}>
                                <div style={{ borderRadius: 8, overflow: 'hidden', width: previewWidth, height: previewHeight, background: '#f3f4f6' }}>
                                    {String(img?.data || "").startsWith("data:image") ? (
                                        <img src={img.data} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 px-2 text-center">
                                            {img?.name || "File"}
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
                                <Text size="xs" className="mt-2 text-gray-500" style={{ maxWidth: previewWidth, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {img.name}
                                </Text>
                            </div>
                        ))}
                    </Flex>
                    {showCountInfo && (
                        <Text size="xs" className="mt-2 text-gray-500">
                            Selected: {images.length} {images.length === 1 ? 'image' : 'images'} {images.length > 1 ? '(will be combined into PDF)' : ''}
                        </Text>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default FileUploadWithCamera;
