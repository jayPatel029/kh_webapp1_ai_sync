const fs = require('fs');
let code = fs.readFileSync('src/pages/dialysis/DialysisAppointments.jsx', 'utf8');

// 1. Remove html2canvas import and Add InvoicePreview import
code = code.replace("import html2canvas from 'html2canvas';", "");
if (!code.includes("import InvoicePreview")) {
    code = code.replace("import RefundModal from '../../components/RefundModal';", 
                        "import RefundModal from '../../components/RefundModal';\nimport InvoicePreview from '../../components/InvoicePreview';");
}

// 2. Remove InlineBillPreview definition
const startMarker = "// ─── Inline Invoice Preview (for step 3) ────────────────────";
const endMarker = "};\n\n// ═══════════════════════════════════════════════════════════";
const startIndex = code.indexOf(startMarker);
const endIndexMatch = code.indexOf(endMarker);

if (startIndex > -1 && endIndexMatch > -1) {
    const endIndex = endIndexMatch + 2; // Capture the closing brace and newline
    code = code.substring(0, startIndex) + code.substring(endIndexMatch + 3); 
}

// 3. Replace Step 3 modal - making search more resilient to whitespace/linebreaks
const step3Finder = /<BaseModal\s+isOpen=\{isCreateOpen\}\s+onClose=\{\(\)\s+=>\s+\{\s+setIsCreateOpen\(false\);\s+resetCreateModal\(\);\s+\}\}\s+title="Bill Preview & Download"\s+size="4xl"\s+footer=\{null\}\s+>\s+<InlineBillPreview\s+appointment=\{savedAppointment\}\s+clinic=\{clinics\?\.find\(c\s+=>\s+String\(c\.id\)\s+===\s+String\(savedAppointment\?\.clinic_id\)\)\}\s+onClose=\{\(\)\s+=>\s+\{\s+setIsCreateOpen\(false\);\s+resetCreateModal\(\);\s+\}\}\s+\/>\s+<\/BaseModal>/;

// Actually, string replace might fail if formatting differs. I'll search for the core part.
// Search for InlineBillPreview usage inside the step 3 block.

code = code.replace(/<BaseModal[^>]*title="Bill Preview & Download"[^>]*>[\s\S]*?<InlineBillPreview[\s\S]*?\/><\/\s*BaseModal\s*>/g, 
`<InvoicePreview
            isOpen={isCreateOpen}
            onClose={() => { setIsCreateOpen(false); resetCreateModal(); }}
            appointment={savedAppointment}
            clinic={clinics?.find(c => String(c.id) === String(savedAppointment?.clinic_id))}
          />`);

// 4. Replace Standalone modal
code = code.replace(/\{invoiceTarget\s+&&\s+\(\s+<BaseModal[^>]*title="Invoice Preview"[^>]*>[\s\S]*?<InlineBillPreview[\s\S]*?\/><\/\s*BaseModal\s*>\s*\)\}/g,
`<InvoicePreview
          isOpen={!!invoiceTarget}
          onClose={() => setInvoiceTarget(null)}
          appointment={invoiceTarget}
          clinic={clinics?.find(c => String(c.id) === String(invoiceTarget?.clinic_id))}
        />`);

fs.writeFileSync('src/pages/dialysis/DialysisAppointments.jsx', code);
console.log("Cleanup and extraction complete in DialysisAppointments.jsx");
