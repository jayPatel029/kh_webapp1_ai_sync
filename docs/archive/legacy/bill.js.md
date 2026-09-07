import React, {useEffect, useState} from "react";
import {Box, Flex, Text} from "components-lib";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {axiosInstance} from "config/api";

/**
 * Extracted Bill component and helpers
 *
 * Exports:
 *  - default Bill component
 *  - generateBillPdf(nodeId = 'bill-preview', download = false, fileName) -> Promise<Blob>
 *  - uploadFile(pdfBlobOrFile) -> Promise<string> (uploaded URL)
 */

// Payment states used for display
const PaymentStates = {
    UNPAID: "UNPAID",
    PAID: "PAID",
    PENDING: "PENDING",
    REFUND: "REFUND",
    REFUNDED: "REFUNDED",
};

const BILL_COLORS = Object.freeze({
    textSecondary: "#374151", // approx Tailwind gray-700
    textMuted: "#6b7280", // approx Tailwind gray-500
    divider: "#d1d5db", // approx Tailwind gray-300
    success: "#16a34a", // approx Tailwind green-600
    successDark: "#15803d", // approx Tailwind green-700
    warning: "#c2410c", // approx Tailwind orange-700
    danger: "#dc2626", // approx Tailwind red-600
    dangerDark: "#b91c1c", // approx Tailwind red-700
});

// DEFAULT SUMMARY - ensures fields exist and names normalized
const INITIAL_BILL_SUMMARY = {
    grossAmount: 0,
    subtotal: 0,
    discountAmount: 0,
    emergencyCharge: 0,
    outsideOPDEmergencyCharge: 0,
    taxAmount: 0,
    netAmount: 0,
    RecivedAmt: 0,
    pendingAmount: 0,
    refundAmount: 0,
};

export const Bill = ({
                         appointmentData,
                         selectedServices = [],
                         billSummary,
                         billPaymentNowSelection,
                         paymentState,
                         paidAmount = 0,
                         pendingAmount = 0,
                         refundAmount = 0,
                     }) => {
    const [DocotorData, setDoctorData] = useState({});
    const doctor_id = appointmentData?.doctorId;
    // (removed unused refs createdBillId, uploadInFlightRef, lastUploadedBillRef)

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!doctor_id) return;
            try {
                const response = await axiosInstance.get(
                    `/api/doctor/profile?doctor_id=${doctor_id}`,
                );
                setDoctorData(response.data || {});
            } catch (error) {
                console.log(error);
            }
        };
        fetchDoctor();
    }, [doctor_id]);

    const getDisplayDoctor = () => {
        const root = DocotorData || appointmentData.doctor_id || {};
        const doc = root.doctor || root;
        const clinic = root.clinic || root.clinic_details || root.clinicInfo || {};
        const fullName = (
            doc?.doctor ||
            doc?.name ||
            [doc?.firstname, doc?.lastname].filter(Boolean).join(" ") ||
            doc?.docter ||
            ""
        )
            .toString()
            .trim();

        const degrees =
            doc?.qualification ||
            doc?.qualifications ||
            doc?.degrees ||
            doc?.degree ||
            "";
        const registrationNo =
            doc?.medical_license ||
            doc?.registration_number ||
            doc?.registration_no ||
            doc?.regno ||
            doc?.license_no ||
            "";
        const phone =
            doc?.whatsapp_no ||
            doc?.phoneno ||
            doc?.phone ||
            doc?.mobile ||
            clinic?.whatsapp_no ||
            clinic?.phoneno ||
            clinic?.phone ||
            "";


        const Doc_qr_code = doc?.qr_code || doc?.qrCode || '';

        if (Doc_qr_code && Doc_qr_code.startsWith('http')) {
            console.log('Doctor QR Code URL:', Doc_qr_code);
        }

        const clinicName =
            clinic?.clinic_name || clinic?.name || doc?.clinic_name || "";
        const clinicAddress =
            clinic?.address || clinic?.clinic_address || doc?.clinic_address || "";
        const clinicPhone =
            clinic?.phoneno ||
            clinic?.whatsapp_no ||
            clinic?.phone ||
            doc?.clinic_phone ||
            doc?.clinic_whatsapp ||
            "";

        const clinic_icon = clinic?.clinic_icon || clinic?.logo || doc?.clinic_logo || '';


        if (clinic_icon && clinic_icon.startsWith('http')) {
            console.log('Clinic Icon URL:', clinic_icon);
        }


        // formatOpd preserved but simplified for brevity (same behaviour)
        const formatOpd = (opd) => {
            if (!opd) return "";
            let data = opd;
            if (typeof data === "string") {
                try {
                    data = JSON.parse(data);
                } catch {
                    return String(opd);
                }
            }
            if (!data || typeof data !== "object") return "";
            const dayOrder = [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ];
            const abbr = {
                monday: "Mon",
                tuesday: "Tue",
                wednesday: "Wed",
                thursday: "Thu",
                friday: "Fri",
                saturday: "Sat",
                sunday: "Sun",
            };
            const pad2 = (n) => String(n).padStart(2, "0");
            const normTime = (t) => {
                if (!t) return null;
                const s = String(t).trim().toUpperCase().replace(/\s+/g, "");
                const ampm = /AM|PM/.test(s) ? (s.endsWith("AM") ? "AM" : "PM") : null;
                const core = ampm ? s.replace(/AM|PM/, "") : s;
                let m = /^(\d{1,2}):?(\d{2})$/.exec(core);
                if (!m) return null;
                let h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
                let mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
                if (ampm) {
                    if (ampm === "AM") {
                        if (h === 12) h = 0;
                    } else {
                        if (h !== 12) h += 12;
                    }
                }
                return `${pad2(h)}:${pad2(mm)}`;
            };
            const to12 = (hhmm) => {
                const [hStr, mStr] = hhmm.split(":");
                let h = parseInt(hStr, 10);
                const ampm = h >= 12 ? "PM" : "AM";
                h = h % 12;
                if (h === 0) h = 12;
                return `${pad2(h)}:${mStr} ${ampm}`;
            };
            const groups = {};
            const closedDays = [];
            dayOrder.forEach((day) => {
                const v = data[day] ?? data[day.toUpperCase()] ?? data[abbr[day]];
                if (
                    v === null ||
                    v === undefined ||
                    (typeof v === "string" && v.trim() === "") ||
                    (typeof v === "string" && v.trim().toLowerCase() === "null")
                ) {
                    closedDays.push(day);
                    return;
                }
                const parts = String(v)
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                let added = false;
                parts.forEach((p) => {
                    const fromTo = p.split("-").map((s) => s?.trim());
                    const f = normTime(fromTo[0]);
                    const t = normTime(fromTo[1]);
                    const key = f && t ? `${f}-${t}` : null;
                    if (!key) return;
                    if (!groups[key]) groups[key] = new Set();
                    groups[key].add(day);
                    added = true;
                });
                if (!added) closedDays.push(day);
            });
            const entries = Object.entries(groups).sort(
                (a, b) =>
                    parseInt(a[0].split("-")[0].replace(":", "")) -
                    parseInt(b[0].split("-")[0].replace(":", "")),
            );
            const lines = [];
            entries.forEach(([range, daysSet]) => {
                const days = Array.from(daysSet).sort(
                    (d1, d2) => dayOrder.indexOf(d1) - dayOrder.indexOf(d2),
                );
                const dayStr = days.map((d) => abbr[d]).join(",");
                const [from24, to24] = range.split("-");
                lines.push(`${dayStr}:\n ${to12(from24)} - ${to12(to24)}`);
            });
            if (closedDays.length) {
                const closedStr = closedDays
                    .sort((d1, d2) => dayOrder.indexOf(d1) - dayOrder.indexOf(d2))
                    .map((d) => abbr[d])
                    .join(",");
                lines.push(`${closedStr}: Close`);
            }
            return lines.length ? (
                <span style={{whiteSpace: "pre-line"}}>{lines.join("\n")}</span>
            ) : (
                ""
            );
        };

        const clinicTimings =
            formatOpd(doc?.opd_timing) ||
            formatOpd(doc?.clinic_timings) ||
            formatOpd(clinic?.timings) ||
            "";

        return {
            name: fullName || "",
            degrees,
            registrationNo,
            phone,
            Doc_qr_code,
            clinic_icon,
            clinicName,
            clinicAddress,
            clinicPhone,
            clinicTimings,
        };
    };

    const dd = getDisplayDoctor();

    // Normalize summary and compute core numeric values used for logic
    const normalizedSummary = {...INITIAL_BILL_SUMMARY, ...(billSummary || {})};
    const net = parseFloat(normalizedSummary.netAmount || 0);
    // Some payloads use 'RecivedAmt' (typo) or other keys; try common variants
    const received =
        parseFloat(
            normalizedSummary.RecivedAmt || normalizedSummary.ReceivedAmt || 0,
        ) || 0;
    const pendingAmt =
        parseFloat(
            pendingAmount ??
            normalizedSummary.pendingAmount ??
            normalizedSummary.PendingAmt ??
            normalizedSummary.Pending ??
            billSummary.PendingAmount ??
            billSummary.PendingAmt ??
            billSummary.Pending,
        ) || 0;
    const refundAmt =
        parseFloat(
            normalizedSummary.refundAmount ??
            normalizedSummary.RefundAmt ??
            refundAmount ??
            normalizedSummary.Refund,
        ) || 0;

    // Compute a state that can override the incoming prop according to rules:
    // - If net === received -> PAID
    // - If received < net && pendingAmt > 0 -> PENDING
    // - If received > net && (refundAmt > 0 || pendingAmt < 0) -> REFUND
    // Otherwise use provided paymentState (keeps backwards compatibility)
    let computedPaymentState = paymentState;
    if (!isNaN(net) && !isNaN(received)) {
        // use an epsilon when comparing floats
        const EPS = 0.005;
        if (Math.abs(net - received) <= EPS) {
            computedPaymentState = PaymentStates.PAID;
        } else if (received < net && pendingAmt > 0) {
            computedPaymentState = PaymentStates.PENDING;
        } else if (received > net && (refundAmt > 0 || pendingAmt < 0)) {
            computedPaymentState = PaymentStates.REFUND;
        }
    }

    // Accept explicit refunded/refund-done tokens from backend (e.g. "REFUNDED", "REFUND-DONE", etc.)
    const explicitState = String(paymentState || "").toUpperCase();
    if (explicitState.includes("REFUND") && explicitState.includes("ED")) {
        computedPaymentState = PaymentStates.REFUNDED;
    } else if (explicitState === "REFUNDED") {
        computedPaymentState = PaymentStates.REFUNDED;
    }

    return (
        <Box id="bill-outer" bg="#f5f7fb" p={4} borderRadius="md">
            <Box
                id="bill-preview"
                bg="white"
                w="794px"
                minH="1123px"
                p={6}
                border="none"
                boxShadow="none"
                fontSize="13px"
                lineHeight="1.4"
                position="relative"
            >
                <Box id="bill-header" borderBottom="2px solid #000" pb={4} mb={4}>
                    <div className="flex items-start justify-between gap-6">
                        <>
                            <div className="flex-1 self-stretch">
                                <div className="text-xl font-semibold">{dd.name}</div>
                                {dd.degrees && (
                                    <div
                                        className="text-sm"
                                        style={{color: BILL_COLORS.textSecondary}}
                                    >
                                        {dd.degrees}
                                    </div>
                                )}
                                {dd.registrationNo && (
                                    <div
                                        className="text-sm"
                                        style={{color: BILL_COLORS.textSecondary}}
                                    >
                                        Regno: {dd.registrationNo}
                                    </div>
                                )}
                                {dd.phone && (
                                    <div
                                        className="text-sm"
                                        style={{color: BILL_COLORS.textSecondary}}
                                    >
                                        Ph no: {dd.phone}
                                    </div>
                                )}
                            </div>

                            {/* <div className="flex-none self-stretch flex items-center justify-center w-40">
                <img
                  alt="medical_logo"
                  src="/medical_logo.jpg"
                  className="h-auto max-h-full object-contain"
                />
              </div> */}

                            <div className="flex-none self-stretch flex items-center justify-center w-40">
                                <img
                                    alt={"Clinic Logo"}
                                    src={dd.clinic_icon}
                                    crossOrigin="anonymous"
                                    onLoad={() => console.log("Clinic logo loaded")}
                                    className="h-auto max-h-full object-contain"
                                />
                            </div>


                            <div className="flex-1 self-stretch text-right">
                                <div className="text-xl font-semibold">
                                    {dd.clinicName || "Clinic Name"}
                                </div>
                                {dd.clinicAddress && (
                                    <div
                                        className="text-sm max-w-xs ml-auto"
                                        style={{color: BILL_COLORS.textSecondary}}
                                    >
                                        {dd.clinicAddress}
                                    </div>
                                )}
                                {dd.clinicPhone && (
                                    <div
                                        className="text-sm"
                                        style={{color: BILL_COLORS.textSecondary}}
                                    >
                                        {" "}
                                        Emergency Ph no: {dd.clinicPhone}
                                    </div>
                                )}
                                {dd.clinicTimings && (
                                    <div
                                        className="text-sm"
                                        style={{color: BILL_COLORS.textSecondary}}
                                    >
                                        Timings: {dd.clinicTimings}
                                    </div>
                                )}
                            </div>
                        </>
                    </div>
                </Box>

                <Text fontSize="22px" fontWeight="bold" textAlign="center" mb={6}>
                    Bill / Invoice
                </Text>

                <Box className="bill-section" borderRadius="4px" p={4} mb={4}>
                    <Text fontWeight="semibold" mb={2} fontSize="18px">
                        Patient Info
                    </Text>
                    <Text fontSize="13px" mb={1}>
                        Name: {appointmentData?.patientName || ""}
                    </Text>
                    <Text fontSize="13px" mb={1}>
                        Gender: {appointmentData?.patientGender || ""}
                    </Text>
                    <Text fontSize="13px" mb={1}>
                        Age: {appointmentData?.patientAge || ""}
                    </Text>
                    <Text fontSize="13px" mb={1}>
                        Phone: {appointmentData?.phone_no || ""}
                    </Text>
                </Box>

                <Box className="bill-section" borderRadius="4px" p={4} mb={4}>
                    <Text fontWeight="semibold" mb={2} fontSize="18px">
                        Appointment Info
                    </Text>
                    <Text fontSize="13px" mb={1}>
                        Doctor: {dd.name || "-"}
                    </Text>
                    <Text fontSize="13px" mb={1}>
                        Date: {appointmentData?.appointmentDate || "-"}
                    </Text>
                    <Text fontSize="13px" mb={1}>
                        Time: {appointmentData?.appointmentTime || "-"}
                    </Text>
                    <Text fontSize="13px">
                        Type: {appointmentData?.appointmentType || "-"}
                    </Text>
                </Box>

                <Box className="bill-section" border="1px solid #ddd" p={4} mb={4}>
                    <Text fontWeight="semibold" mb={3} fontSize="18px">
                        Services and Bill Summary
                    </Text>
                    {selectedServices && selectedServices.length > 0 ? (
                        selectedServices.map((srv, idx) => (
                            <Flex
                                key={idx}
                                justifyContent="space-between"
                                fontSize="13px"
                                mb={2}
                            >
                                <Text>{srv.serviceName}</Text>
                                <Text>
                                    ₹{srv.unitPrice} (-{srv.discount}%)
                                </Text>
                            </Flex>
                        ))
                    ) : (
                        <Text fontSize="13px" color={BILL_COLORS.textMuted}>
                            No services selected
                        </Text>
                    )}
                    <Box height="1px" bg={BILL_COLORS.divider} my={3}/>
                    {parseFloat(billSummary?.emergencyCharge || 0) > 0 && (
                        <Flex
                            justifyContent="space-between"
                            fontSize="13px"
                            color={BILL_COLORS.danger}
                            mb={1}
                        >
                            <Text>Emergency Charge</Text>
                            <Text>₹{billSummary?.emergencyCharge}</Text>
                        </Flex>
                    )}
                    <Flex justifyContent="space-between" fontSize="13px" mb={1}>
                        <Text>Gross Amount</Text>
                        <Text>₹{billSummary?.grossAmount}</Text>
                    </Flex>
                    <Flex justifyContent="space-between" fontSize="13px" mb={1}>
                        <Text>Discount</Text>
                        <Text>-₹{billSummary?.discountAmount}</Text>
                    </Flex>
                    <Flex justifyContent="space-between" fontSize="13px" mb={1}>
                        <Text>
                            Tax ({billSummary?.taxPercentage ?? billSummary?.tax_percent ?? 10}%)
                        </Text>
                        <Text>₹{billSummary?.taxAmount}</Text>
                    </Flex>
                    <Flex
                        justifyContent="space-between"
                        fontWeight="bold"
                        mt={2}
                        fontSize="13px"
                    >
                        <Text>Net Amount</Text>
                        <Text>₹{billSummary?.netAmount}</Text>
                    </Flex>
                </Box>

                <Box className="bill-section" border="1px solid #ddd" p={4} mb={4}>
                    <Text fontWeight="semibold" mb={2} fontSize="18px">
                        Payment Status
                    </Text>

                    {/* Redesigned payment presentation using computedPaymentState */}
                    {(() => {
                        const netFixed = Number(net || 0).toFixed(2);
                        const receivedFixed = Number(received || 0).toFixed(2);
                        const pendingFixed = Number(pendingAmt || 0).toFixed(2);
                        const refundFixed = Number(refundAmt || 0).toFixed(2);
                        const positiveReceived = Math.abs(Number(receivedFixed));
                        switch (computedPaymentState) {
                            case PaymentStates.PAID:
                                return (
                                    <Box>
                                        <Text
                                            fontSize="13px"
                                            color={BILL_COLORS.success}
                                            fontWeight="bold"
                                        >
                                            Status: PAID
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Net Amount: ₹{netFixed}
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Amount Received: ₹{receivedFixed}
                                        </Text>
                                    </Box>
                                );

                            case PaymentStates.PENDING:
                                return (
                                    <Box>
                                        <Text
                                            fontSize="13px"
                                            color={BILL_COLORS.warning}
                                            fontWeight="bold"
                                        >
                                            Status: PENDING
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Paid: ₹{receivedFixed}
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Pending: ₹{pendingFixed}
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Net Amount: ₹{netFixed}
                                        </Text>
                                    </Box>
                                );

                            case PaymentStates.REFUND:
                                return (
                                    <Box>
                                        <Text
                                            fontSize="13px"
                                            color={BILL_COLORS.dangerDark}
                                            fontWeight="bold"
                                        >
                                            Status: REFUND PENDING
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Net Amount: ₹{netFixed}
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Amount Received: ₹{receivedFixed}
                                        </Text>
                                        <Text
                                            fontSize="13px"
                                            mt={1}
                                            color={BILL_COLORS.dangerDark}
                                            fontWeight="bold"
                                        >
                                            Refund Amount: ₹{refundFixed}
                                        </Text>
                                        {/* Preserve earlier reason rendering if present */}
                                        {normalizedSummary?.bill_description &&
                                            normalizedSummary.bill_description.includes(
                                                "CANCELLED",
                                            ) && (
                                                <Text
                                                    fontSize="13px"
                                                    color={BILL_COLORS.dangerDark}
                                                    mt={1}
                                                >
                                                    {normalizedSummary.bill_description
                                                            .split("Reason: ")[1]
                                                            ?.split(".")[0] &&
                                                        `Reason: ${normalizedSummary.bill_description
                                                            .split("Reason: ")[1]
                                                            .split(".")[0]
                                                        }`}
                                                </Text>
                                            )}
                                    </Box>
                                );

                            case PaymentStates.REFUNDED:
                                return (
                                    <Box>
                                        <Text
                                            fontSize="13px"
                                            color={BILL_COLORS.dangerDark}
                                            fontWeight="bold"
                                        >
                                            Status: REFUNDED
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Net Amount: ₹{netFixed}
                                        </Text>
                                        <Text fontSize="13px" mt={1}>
                                            Amount Received: ₹00.00
                                        </Text>
                                        <Text
                                            fontSize="13px"
                                            mt={1}
                                            color={BILL_COLORS.successDark}
                                            fontWeight="bold"
                                        >
                                            Pending Amount: ₹0.00
                                        </Text>
                                        <Text
                                            fontSize="13px"
                                            mt={1}
                                            color={BILL_COLORS.dangerDark}
                                            fontWeight="bold"
                                        >
                                            {Number(positiveReceived) > 0
                                                ? `Refunded Amount: ₹${positiveReceived}`
                                                : "Refunded Amount: ₹0.00"}
                                        </Text>
                                    </Box>
                                );

                            case PaymentStates.UNPAID:
                            default:
                                // Keep UNPAID fallback (existing behaviour) but show normalized numbers
                                return (
                                    <Box>
                                        <Text fontSize="13px" color={BILL_COLORS.dangerDark}>
                                            Status: UNPAID
                                        </Text>
                                        <Text fontSize="13px" color={BILL_COLORS.dangerDark}>
                                            Pending Amount: ₹{netFixed}
                                        </Text>
                                    </Box>
                                );
                        }
                    })()}
                </Box>
                By accepting this e-prescription & invoice printout and receiving care, you consent to the processing
                and secure storage of your health data by authorized third-party technology providers (including Kifayti
                Health), solely for medical and lawful purposes, in compliance with Indian data protection laws.

                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 16,
                        textAlign: "center",
                        fontSize: 12,
                        color: BILL_COLORS.textMuted,
                        padding: "0 12px",
                    }}
                >
                    This Bill is electronically Generated No Signature is Required
                </div>
            </Box>
        </Box>
    );
};

// generateBillPdf - creates PDF from DOM node id (defaults to 'bill-preview')
export const generateBillPdf = async (
    nodeId = "bill-preview",
    download = false,
    fileName = null,
    options = {},
) => {
    const {quality = 0.9, scale = 2, margin = 24} = options;
    const node = document.getElementById(nodeId);
    if (!node) throw new Error("Bill node not found");

    // Ensure html2canvas uses CORS where possible and a controlled scale to avoid oversized canvases
    const canvas = await html2canvas(node, {
        scale: scale,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: node.scrollWidth || node.offsetWidth,
        windowHeight: node.scrollHeight || node.offsetHeight,
    });

    // Prepare jsPDF and page dimensions (points)
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Image target width in PDF points and computed height to preserve aspect ratio
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Helper to convert canvas (or page canvas) to jpeg data url with chosen quality
    const canvasToJpeg = (c) => c.toDataURL("image/jpeg", Math.max(0.1, Math.min(0.95, quality)));

    // If image fits on one page, add directly
    if (imgHeight <= pageHeight - margin * 2) {
        const imgData = canvasToJpeg(canvas);
        pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    } else {
        // Slice the large canvas into multiple pages to avoid creating a huge single image
        // Calculate the height (in px) for each PDF page slice
        const pageSliceHeightPx = Math.floor((canvas.width * (pageHeight - margin * 2)) / imgWidth);

        let remainingHeight = canvas.height;
        let sliceY = 0;
        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pageSliceHeightPx, canvas.height);

        while (remainingHeight > 0) {
            // clear and draw slice
            pageCtx.fillStyle = "#fff";
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            pageCtx.drawImage(
                canvas,
                0,
                sliceY,
                pageCanvas.width,
                pageCanvas.height,
                0,
                0,
                pageCanvas.width,
                pageCanvas.height,
            );

            const imgData = canvasToJpeg(pageCanvas);
            const imgHeightForPage = (pageCanvas.height * imgWidth) / canvas.width;

            if (sliceY > 0) pdf.addPage();
            pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeightForPage);

            // advance
            remainingHeight -= pageCanvas.height;
            sliceY += pageCanvas.height;

            // adjust last slice height if necessary
            if (remainingHeight > 0) {
                pageCanvas.height = Math.min(pageSliceHeightPx, remainingHeight);
            }
        }
    }

    const name =
        fileName ||
        `bill_${(
            document?.querySelector("#bill-preview .bill-section")?.textContent || "patient"
        ).replace(/\s+/g, "_")}.pdf`;

    const blob = pdf.output("blob");
    if (download) pdf.save(name);
    return blob;
};

// uploadFile helper (accepts Blob or File) -> returns uploaded URL (using axiosInstance / /api/upload)
export const uploadFile = async (pdfBlobOrFile, options = {}) => {
    const {fileName, mimeType, appendText} = options;
    let file;
    if (pdfBlobOrFile instanceof File) {
        file =
            fileName || appendText  ?
                new File([pdfBlobOrFile], appendText + pdfBlobOrFile.name, {
                    type: mimeType || pdfBlobOrFile.type || "application/octet-stream",
                })
                : pdfBlobOrFile;
    } else if (pdfBlobOrFile instanceof Blob) {
        try {
            const finalName = appendText + fileName || `uploaded-file-${Date.now()}.pdf`;
            file = new File([pdfBlobOrFile], finalName, {
                type: mimeType || "application/pdf",
            });
        } catch (error) {
            throw new Error("Failed to process PDF blob.");
        }
    } else {
        throw new Error("Invalid input: Expected a File or Blob.");
    }
    const formData = new FormData();
    formData.append("file", file);
    const uploadResponse = await axiosInstance.post("/api/upload", formData, {
        headers: {"Content-Type": "multipart/form-data"},
        maxBodyLength: Infinity,
    });
    return uploadResponse?.data?.objectUrl || uploadResponse?.data?.url || null;
};

export default Bill;