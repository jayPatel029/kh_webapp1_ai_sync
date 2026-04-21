const fs = require('fs');
let code = fs.readFileSync('src/pages/dialysis/DialysisAppointments.jsx', 'utf8');

const startIndex = code.indexOf("// ─── Inline Invoice Preview (for step 3) ────────────────────");
const searchStr = "      </div>\n    </div>\n  );\n};\n";
const endIndexMatch = code.indexOf(searchStr, startIndex);

if (startIndex > -1 && endIndexMatch > -1) {
    const endIndex = endIndexMatch + searchStr.length;
    
    const newComponent = `// ─── Inline Invoice Preview (for step 3) ────────────────────
const InlineBillPreview = ({ appointment, clinic, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!appointment) return null;

  const totalDue = Number(appointment.totalAmount || appointment.total_amt || 0);
  const amountPaid = Number(appointment.amountPaid || appointment.received_amt || 0);
  const outstanding = getOutstandingBalance(totalDue, amountPaid);
  
  let payStatus = getPaymentStatus(totalDue, amountPaid);
  if (appointment.status === 'CANCELLED') payStatus = 'CANCELLED';

  const invoiceId = \`INV-\${appointment.id || Date.now()}\`;
  const patientName = appointment.name || appointment.patient_name || 'Patient';

  const orgName = clinic?.org_name || clinic?.organization_name || 'Kifayti Health';
  const orgAddress = clinic?.org_address || '';
  const clinicName = clinic?.name || appointment.clinic_name || 'Clinic';
  const clinicAddress = clinic?.address || '';
  const clinicPhone = clinic?.phone || appointment.phoneNumber || '';
  const clinicIcon = clinic?.logo || clinic?.icon || 'https://via.placeholder.com/100';

  const BILL_COLORS = {
    textSecondary: "#374151",
    textMuted: "#6b7280",
    divider: "#d1d5db",
    success: "#16a34a",
    dangerDark: "#b91c1c",
    warning: "#c2410c"
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const node = document.getElementById("bill-preview-node");
      if (!node) throw new Error("Bill node not found");

      const canvas = await html2canvas(node, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
      });

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 24;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
      pdf.save(\`\${invoiceId}.pdf\`);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    const node = document.getElementById("bill-preview-node");
    if (!node) return;
    const w = window.open('', '_blank', 'width=800,height=600');
    w.document.write(\`<html><head><title>\${invoiceId}</title><style>
       body { font-family: sans-serif; margin: 0; padding: 20px; }
    </style></head><body>\${node.innerHTML}</body></html>\`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); setPrinting(false); }, 500);
  };

  return (
    <div>
      <div id="bill-preview-node" style={{ 
          width: '100%', maxWidth: '800px', backgroundColor: '#fff', 
          padding: '24px', fontSize: '13px', lineHeight: '1.4', 
          color: '#111', fontFamily: 'sans-serif' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '16px' }}>
           <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orgName}</div>
              {orgAddress && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '12px' }}>{orgAddress}</div>}
           </div>
           
           <div style={{ flexShrink: 0, width: '100px', display: 'flex', justifyContent: 'center' }}>
              <img src={clinicIcon} alt="Clinic Logo" crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} />
           </div>

           <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{clinicName}</div>
              {clinicAddress && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '12px', wordBreak: 'break-word', marginLeft: 'auto', maxWidth: '200px' }}>{clinicAddress}</div>}
              {clinicPhone && <div style={{ color: BILL_COLORS.textSecondary, fontSize: '12px' }}>Ph: {clinicPhone}</div>}
           </div>
        </div>

        <div style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>Bill / Invoice</div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
           <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Patient Info</div>
           <div>Name: {patientName}</div>
           <div>Age: {appointment.age || '-'}</div>
           <div>Phone: {appointment.phoneNumber || appointment.phone || '-'}</div>
        </div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
           <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Appointment Info</div>
           <div>Invoice No: {invoiceId}</div>
           <div>Date: {appointment.appointment_date || '-'}</div>
           <div>Time: {appointment.booking_time || appointment.start_time || '-'}</div>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
           <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>Services and Bill Summary</div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{appointment.reason ? \`Dialysis Session — \${appointment.reason}\` : 'Dialysis Session'}</span>
              <span>₹{(totalDue || amountPaid).toLocaleString()}</span>
           </div>
           <div style={{ height: '1px', backgroundColor: BILL_COLORS.divider, margin: '12px 0' }} />
           
           <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '8px' }}>
              <span>Net Amount</span>
              <span>₹{(totalDue || amountPaid).toLocaleString()}</span>
           </div>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
           <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Payment Status</div>
           {(() => {
               const netFixed = (totalDue || amountPaid).toFixed(2);
               const rcvdFixed = amountPaid.toFixed(2);
               const pendFixed = outstanding.toFixed(2);

               if (payStatus === 'PAID') {
                   return (
                       <div>
                           <div style={{ color: BILL_COLORS.success, fontWeight: 'bold' }}>Status: PAID</div>
                           <div style={{ marginTop: '4px' }}>Net Amount: ₹{netFixed}</div>
                           <div style={{ marginTop: '4px' }}>Amount Received: ₹{rcvdFixed}</div>
                       </div>
                   );
               } else if (payStatus === 'PARTIAL') {
                   return (
                       <div>
                           <div style={{ color: BILL_COLORS.warning, fontWeight: 'bold' }}>Status: PARTIAL</div>
                           <div style={{ marginTop: '4px' }}>Paid: ₹{rcvdFixed}</div>
                           <div style={{ marginTop: '4px' }}>Pending: ₹{pendFixed}</div>
                           <div style={{ marginTop: '4px' }}>Net Amount: ₹{netFixed}</div>
                       </div>
                   );
               } else if (payStatus === 'CANCELLED') {
                   return (
                       <div>
                           <div style={{ color: BILL_COLORS.dangerDark, fontWeight: 'bold' }}>Status: CANCELLED / REFUND PENDING</div>
                           <div style={{ marginTop: '4px' }}>Paid: ₹{rcvdFixed}</div>
                           <div style={{ marginTop: '4px', color: BILL_COLORS.dangerDark }}>Refund Amount: ₹{rcvdFixed}</div>
                       </div>
                   );
               } else {
                   return (
                       <div>
                           <div style={{ color: BILL_COLORS.dangerDark, fontWeight: 'bold' }}>Status: UNPAID</div>
                           <div style={{ marginTop: '4px', color: BILL_COLORS.dangerDark }}>Pending Amount: ₹{netFixed}</div>
                       </div>
                   );
               }
           })()}
        </div>
        
        <div style={{ fontSize: '11px', color: BILL_COLORS.textMuted }}>
           By accepting this e-prescription & invoice printout and receiving care, you consent to the processing and secure storage of your health data by authorized third-party technology providers (including Kifayti Health), solely for medical and lawful purposes, in compliance with Indian data protection laws.
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: BILL_COLORS.textMuted, marginTop: '24px' }}>
            This Bill is electronically Generated No Signature is Required
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button onClick={handlePrint} disabled={printing} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, border: '1px solid #D1D5DB', borderRadius: '8px', background: '#F9FAFB', color: '#374151', cursor: 'pointer' }}>
          {printing ? 'Opening...' : 'Print'}
        </button>
        <button onClick={handleDownload} disabled={downloading} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', color: '#fff', cursor: 'pointer' }}>
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
        <button onClick={onClose} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', color: '#111', cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
};
`;
    
    const finalCode = code.substring(0, startIndex) + newComponent + code.substring(endIndex);
    fs.writeFileSync('src/pages/dialysis/DialysisAppointments.jsx', finalCode);
    console.log("Successfully replaced InlineBillPreview string.");
} else {
    console.log("Could not find start or end index.");
}
