/**
 * Clinic / Organization Management Page
 * Two-tab layout: Organizations | Clinics
 * Modeled after AddRole.jsx and AdminManagement.jsx patterns.
 *
 * No API integration — uses dummy data.
 *
 * @file src/pages/clinicManagement/ClinicManagement.jsx
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
} from '../../component-library';
import { FormModal } from '../../component-library/modals/FormModal';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useAdminToast } from '../../components/AdminToast';
import { useNavigate } from 'react-router-dom';

// ─── Dummy Data ────────────────────────────────────────────

const DUMMY_ORGANIZATIONS = [
  { id: 1, name: 'Kifayti Health Pvt. Ltd.', email: 'admin@kifaytihealth.com', phone: '9876543210', address: 'Mumbai, Maharashtra, India' },
  { id: 2, name: 'Apollo Health Group', email: 'contact@apollohealth.com', phone: '9123456789', address: 'Delhi, India' },
  { id: 3, name: 'Fortis Healthcare', email: 'info@fortishealthcare.com', phone: '9234567890', address: 'Bangalore, Karnataka, India' },
];

const DUMMY_CLINICS = [
  {
    id: 1,
    clinicName: 'Kifayti Dialysis Center',
    clinicEmail: 'dialysis@kifaytihealth.com',
    phone: '9876543210',
    whatsapp: '9876543210',
    address: 'Plot 42, Andheri East, Mumbai',
    upiDetails: 'kifayti@upi',
    bankDetails: 'HDFC Bank, Holder: Kifayti Health, Account No: 1234567890, IFSC: HDFC0001234',
    clinicIconURL: '',
  },
  {
    id: 2,
    clinicName: 'Kifayti Nephro Clinic',
    clinicEmail: 'nephro@kifaytihealth.com',
    phone: '9123456780',
    whatsapp: '9123456780',
    address: 'Sector 15, Navi Mumbai',
    upiDetails: 'nephro@upi',
    bankDetails: 'SBI Bank, Holder: Nephro Clinic, Account No: 9876543210, IFSC: SBIN0005678',
    clinicIconURL: '',
  },
  {
    id: 3,
    clinicName: 'Apollo Dialysis Wing',
    clinicEmail: 'dialysis@apollo.com',
    phone: '9988776655',
    whatsapp: '',
    address: 'Sarita Vihar, Delhi',
    upiDetails: '',
    bankDetails: 'ICICI Bank, Holder: Apollo, Account No: 5432167890, IFSC: ICIC0009876',
    clinicIconURL: '',
  },
];

// ─── Tabs ──────────────────────────────────────────────────

const TABS = [
  { key: 'organizations', label: 'Organizations' },
  { key: 'clinics', label: 'Clinics' },
];

const ClinicManagement = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();

  const [activeTab, setActiveTab] = useState('organizations');

  // ─── Organization state ────────────────────────────────
  const [organizations, setOrganizations] = useState(DUMMY_ORGANIZATIONS);
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [orgEditMode, setOrgEditMode] = useState(false);
  const [orgFormData, setOrgFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [orgEditId, setOrgEditId] = useState(null);
  const [orgFieldErrors, setOrgFieldErrors] = useState({});
  const [orgErrorMessage, setOrgErrorMessage] = useState('');

  // ─── Clinic state ──────────────────────────────────────
  const [clinics, setClinics] = useState(DUMMY_CLINICS);
  const [clinicSearchTerm, setClinicSearchTerm] = useState('');
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [clinicEditMode, setClinicEditMode] = useState(false);
  const [clinicFormData, setClinicFormData] = useState({
    clinicName: '',
    clinicEmail: '',
    phone: '',
    whatsapp: '',
    address: '',
    upiId: '',
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
  });
  const [clinicEditId, setClinicEditId] = useState(null);
  const [clinicFieldErrors, setClinicFieldErrors] = useState({});
  const [clinicErrorMessage, setClinicErrorMessage] = useState('');

  // ═══════════════════════════════════════════════════════
  //  ORGANIZATION HANDLERS
  // ═══════════════════════════════════════════════════════

  const filteredOrgs = useMemo(() => {
    if (!orgSearchTerm.trim()) return organizations;
    const q = orgSearchTerm.toLowerCase();
    return organizations.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
    );
  }, [organizations, orgSearchTerm]);

  const openOrgAdd = () => {
    setOrgFormData({ name: '', email: '', phone: '', address: '' });
    setOrgEditMode(false);
    setOrgEditId(null);
    setOrgFieldErrors({});
    setOrgErrorMessage('');
    setIsOrgModalOpen(true);
  };

  const openOrgEdit = (org) => {
    setOrgFormData({
      name: org.name,
      email: org.email,
      phone: org.phone,
      address: org.address,
    });
    setOrgEditMode(true);
    setOrgEditId(org.id);
    setOrgFieldErrors({});
    setOrgErrorMessage('');
    setIsOrgModalOpen(true);
  };

  const handleOrgSubmit = () => {
    const errors = {};
    if (!orgFormData.name.trim()) errors.name = 'Name is required';
    if (!orgFormData.email.trim()) errors.email = 'Email is required';
    if (!orgFormData.phone.trim()) errors.phone = 'Phone is required';
    if (!orgFormData.address.trim()) errors.address = 'Address is required';

    if (Object.keys(errors).length > 0) {
      setOrgFieldErrors(errors);
      setOrgErrorMessage('Please fill all required fields');
      return;
    }

    if (orgEditMode) {
      setOrganizations((prev) =>
        prev.map((o) => (o.id === orgEditId ? { ...o, ...orgFormData } : o))
      );
      showToast('Organization updated successfully!', 'success');
    } else {
      const newOrg = { ...orgFormData, id: Date.now() };
      setOrganizations((prev) => [...prev, newOrg]);
      showToast('Organization added successfully!', 'success');
    }
    setIsOrgModalOpen(false);
  };

  const handleOrgDelete = (org) => {
    if (window.confirm(`Delete organization "${org.name}"?`)) {
      setOrganizations((prev) => prev.filter((o) => o.id !== org.id));
      showToast('Organization deleted successfully!', 'success');
    }
  };

  const orgColumns = [
    { key: 'name', label: 'Organization Name', type: 'text', width: '220px' },
    { key: 'email', label: 'Email', type: 'text', width: '220px' },
    { key: 'phone', label: 'Phone', type: 'text', width: '140px' },
    { key: 'address', label: 'Address', type: 'text', width: '260px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '150px' },
  ];

  const orgTableData = useMemo(
    () => filteredOrgs.map((o) => ({ ...o, actions: o })),
    [filteredOrgs]
  );

  // ═══════════════════════════════════════════════════════
  //  CLINIC HANDLERS
  // ═══════════════════════════════════════════════════════

  const filteredClinics = useMemo(() => {
    if (!clinicSearchTerm.trim()) return clinics;
    const q = clinicSearchTerm.toLowerCase();
    return clinics.filter(
      (c) =>
        c.clinicName.toLowerCase().includes(q) ||
        c.clinicEmail.toLowerCase().includes(q)
    );
  }, [clinics, clinicSearchTerm]);

  const openClinicAdd = () => {
    setClinicFormData({
      clinicName: '',
      clinicEmail: '',
      phone: '',
      whatsapp: '',
      address: '',
      upiId: '',
      accountHolder: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
    });
    setClinicEditMode(false);
    setClinicEditId(null);
    setClinicFieldErrors({});
    setClinicErrorMessage('');
    setIsClinicModalOpen(true);
  };

  const openClinicEdit = (clinic) => {
    // Parse bank details string back into fields
    const bankParts = (clinic.bankDetails || '').split(',').map((s) => s.trim());
    const parseBankField = (prefix) => {
      const part = bankParts.find((p) => p.startsWith(prefix));
      return part ? part.replace(prefix, '').trim() : '';
    };

    setClinicFormData({
      clinicName: clinic.clinicName,
      clinicEmail: clinic.clinicEmail,
      phone: clinic.phone,
      whatsapp: clinic.whatsapp || '',
      address: clinic.address,
      upiId: clinic.upiDetails || '',
      accountHolder: parseBankField('Holder:'),
      accountNumber: parseBankField('Account No:'),
      bankName: bankParts[0] ? bankParts[0].replace(/Bank$/i, '').trim() + ' Bank' : '',
      ifscCode: parseBankField('IFSC:'),
    });
    setClinicEditMode(true);
    setClinicEditId(clinic.id);
    setClinicFieldErrors({});
    setClinicErrorMessage('');
    setIsClinicModalOpen(true);
  };

  const buildBankDetailsString = (data) => {
    const parts = [];
    if (data.bankName) parts.push(data.bankName);
    if (data.accountHolder) parts.push(`Holder: ${data.accountHolder}`);
    if (data.accountNumber) parts.push(`Account No: ${data.accountNumber}`);
    if (data.ifscCode) parts.push(`IFSC: ${data.ifscCode}`);
    return parts.join(', ');
  };

  const handleClinicSubmit = () => {
    const errors = {};
    if (!clinicFormData.clinicName.trim()) errors.clinicName = 'Clinic Name is required';
    if (!clinicFormData.clinicEmail.trim()) errors.clinicEmail = 'Email is required';
    if (!clinicFormData.phone.trim()) errors.phone = 'Phone is required';
    if (!clinicFormData.address.trim()) errors.address = 'Address is required';

    if (Object.keys(errors).length > 0) {
      setClinicFieldErrors(errors);
      setClinicErrorMessage('Please fill all required fields');
      return;
    }

    const clinicPayload = {
      clinicName: clinicFormData.clinicName,
      clinicEmail: clinicFormData.clinicEmail,
      phone: clinicFormData.phone,
      whatsapp: clinicFormData.whatsapp,
      address: clinicFormData.address,
      upiDetails: clinicFormData.upiId,
      bankDetails: buildBankDetailsString(clinicFormData),
      clinicIconURL: '',
    };

    if (clinicEditMode) {
      setClinics((prev) =>
        prev.map((c) => (c.id === clinicEditId ? { ...c, ...clinicPayload } : c))
      );
      showToast('Clinic updated successfully!', 'success');
    } else {
      const newClinic = { ...clinicPayload, id: Date.now() };
      setClinics((prev) => [...prev, newClinic]);
      showToast('Clinic added successfully!', 'success');
    }
    setIsClinicModalOpen(false);
  };

  const handleClinicDelete = (clinic) => {
    if (window.confirm(`Delete clinic "${clinic.clinicName}"?`)) {
      setClinics((prev) => prev.filter((c) => c.id !== clinic.id));
      showToast('Clinic deleted successfully!', 'success');
    }
  };

  const clinicColumns = [
    {
      key: 'clinicIconURL',
      label: 'Logo',
      type: 'custom',
      width: '70px',
      render: (_row, value) =>
        value ? (
          <img
            src={value}
            alt="clinic"
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#6B7280',
              fontWeight: 600,
            }}
          >
            C
          </div>
        ),
    },
    { key: 'clinicName', label: 'Clinic', type: 'text', width: '180px' },
    { key: 'clinicEmail', label: 'Email', type: 'text', width: '200px' },
    { key: 'phone', label: 'Phone', type: 'text', width: '130px' },
    { key: 'whatsapp', label: 'WhatsApp', type: 'text', width: '130px' },
    { key: 'address', label: 'Address', type: 'text', width: '200px' },
    { key: 'upiDetails', label: 'UPI Details', type: 'text', width: '140px' },
    { key: 'bankDetails', label: 'Bank Details', type: 'text', width: '240px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '150px' },
  ];

  const clinicTableData = useMemo(
    () => filteredClinics.map((c) => ({ ...c, actions: c })),
    [filteredClinics]
  );

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Clinic Management"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Clinic Management', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              gap: '0px',
              marginBottom: '20px',
              borderBottom: '2px solid #E5E7EB',
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  borderBottom:
                    activeTab === tab.key
                      ? '3px solid #004c6d'
                      : '3px solid transparent',
                  color: activeTab === tab.key ? '#004c6d' : '#6B7280',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── ORGANIZATIONS TAB ─────────────────────── */}
          {activeTab === 'organizations' && (
            <div className="admin-card">
              <div
                className="admin-card__header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>
                    Total Organizations: <strong>{filteredOrgs.length}</strong>
                  </span>
                  <Input
                    type="text"
                    placeholder="Search organizations..."
                    value={orgSearchTerm}
                    onChange={(e) => setOrgSearchTerm(e.target.value)}
                    style={{ width: isMobile ? '100%' : '250px' }}
                  />
                </div>
                <Button variant="primary" onClick={openOrgAdd}>
                  Add Organization
                </Button>
              </div>

              <UnifiedListTable
                columns={orgColumns}
                data={orgTableData}
                onEdit={openOrgEdit}
                onDelete={handleOrgDelete}
                emptyMessage="No organizations found"
                displayMode="table"
                rowsPerPage={10}
              />
            </div>
          )}

          {/* ─── CLINICS TAB ──────────────────────────── */}
          {activeTab === 'clinics' && (
            <div className="admin-card">
              <div
                className="admin-card__header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>
                    Total Clinics: <strong>{filteredClinics.length}</strong>
                  </span>
                  <Input
                    type="text"
                    placeholder="Search clinics..."
                    value={clinicSearchTerm}
                    onChange={(e) => setClinicSearchTerm(e.target.value)}
                    style={{ width: isMobile ? '100%' : '250px' }}
                  />
                </div>
                <Button variant="primary" onClick={openClinicAdd}>
                  Add Clinic
                </Button>
              </div>

              <UnifiedListTable
                columns={clinicColumns}
                data={clinicTableData}
                onEdit={openClinicEdit}
                onDelete={handleClinicDelete}
                emptyMessage="No clinics found"
                displayMode="table"
                rowsPerPage={10}
              />
            </div>
          )}
        </div>

        {/* ─── ORGANIZATION FORM MODAL ────────────────── */}
        <FormModal
          isOpen={isOrgModalOpen}
          onClose={() => setIsOrgModalOpen(false)}
          onSubmit={handleOrgSubmit}
          title={orgEditMode ? 'Edit Organization' : 'Add Organization'}
          submitText={orgEditMode ? 'Update' : 'Submit'}
          size="lg"
          errorMessage={orgErrorMessage}
          fieldErrors={orgFieldErrors}
          onFieldErrorClear={(field) =>
            setOrgFieldErrors((prev) => ({ ...prev, [field]: undefined }))
          }
        >
          {({ getFieldProps, clearFieldError }) => (
            <>
              <FormControl isRequired isInvalid={getFieldProps('name').isInvalid}>
                <FormLabel>Organization Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter organization name"
                  value={orgFormData.name}
                  {...getFieldProps('name')}
                  onChange={(e) => {
                    setOrgFormData((prev) => ({ ...prev, name: e.target.value }));
                    clearFieldError('name');
                  }}
                />
              </FormControl>

              <FormControl isRequired isInvalid={getFieldProps('email').isInvalid}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={orgFormData.email}
                  {...getFieldProps('email')}
                  onChange={(e) => {
                    setOrgFormData((prev) => ({ ...prev, email: e.target.value }));
                    clearFieldError('email');
                  }}
                />
              </FormControl>

              <FormControl isRequired isInvalid={getFieldProps('phone').isInvalid}>
                <FormLabel>Phone</FormLabel>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={orgFormData.phone}
                  {...getFieldProps('phone')}
                  onChange={(e) => {
                    setOrgFormData((prev) => ({ ...prev, phone: e.target.value }));
                    clearFieldError('phone');
                  }}
                />
              </FormControl>

              <FormControl isRequired isInvalid={getFieldProps('address').isInvalid}>
                <FormLabel>Address</FormLabel>
                <Textarea
                  placeholder="Enter address"
                  value={orgFormData.address}
                  onChange={(e) => {
                    setOrgFormData((prev) => ({ ...prev, address: e.target.value }));
                    clearFieldError('address');
                  }}
                  rows={2}
                />
              </FormControl>
            </>
          )}
        </FormModal>

        {/* ─── CLINIC FORM MODAL ──────────────────────── */}
        <FormModal
          isOpen={isClinicModalOpen}
          onClose={() => setIsClinicModalOpen(false)}
          onSubmit={handleClinicSubmit}
          title={clinicEditMode ? 'Edit Clinic' : 'Add Clinic'}
          submitText={clinicEditMode ? 'Update' : 'Submit'}
          size="3xl"
          errorMessage={clinicErrorMessage}
          fieldErrors={clinicFieldErrors}
          onFieldErrorClear={(field) =>
            setClinicFieldErrors((prev) => ({ ...prev, [field]: undefined }))
          }
        >
          {({ getFieldProps, clearFieldError }) => (
            <>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormControl isRequired isInvalid={getFieldProps('clinicName').isInvalid}>
                  <FormLabel>Clinic Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter clinic name"
                    value={clinicFormData.clinicName}
                    {...getFieldProps('clinicName')}
                    onChange={(e) => {
                      setClinicFormData((prev) => ({ ...prev, clinicName: e.target.value }));
                      clearFieldError('clinicName');
                    }}
                  />
                </FormControl>

                <FormControl isRequired isInvalid={getFieldProps('clinicEmail').isInvalid}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter clinic email"
                    value={clinicFormData.clinicEmail}
                    {...getFieldProps('clinicEmail')}
                    onChange={(e) => {
                      setClinicFormData((prev) => ({ ...prev, clinicEmail: e.target.value }));
                      clearFieldError('clinicEmail');
                    }}
                  />
                </FormControl>

                <FormControl isRequired isInvalid={getFieldProps('phone').isInvalid}>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={clinicFormData.phone}
                    {...getFieldProps('phone')}
                    onChange={(e) => {
                      setClinicFormData((prev) => ({ ...prev, phone: e.target.value }));
                      clearFieldError('phone');
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>WhatsApp</FormLabel>
                  <Input
                    type="tel"
                    placeholder="WhatsApp number"
                    value={clinicFormData.whatsapp}
                    onChange={(e) =>
                      setClinicFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                  />
                </FormControl>
              </Box>

              <FormControl isRequired isInvalid={getFieldProps('address').isInvalid} className="mt-4">
                <FormLabel>Address</FormLabel>
                <Textarea
                  placeholder="Enter clinic address"
                  value={clinicFormData.address}
                  onChange={(e) => {
                    setClinicFormData((prev) => ({ ...prev, address: e.target.value }));
                    clearFieldError('address');
                  }}
                  rows={2}
                />
              </FormControl>

              {/* Payment Details Section */}
              <div className="mt-6 mb-2">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Payment Details</h4>
              </div>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormControl>
                  <FormLabel>UPI ID</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter UPI ID"
                    value={clinicFormData.upiId}
                    onChange={(e) =>
                      setClinicFormData((prev) => ({ ...prev, upiId: e.target.value }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Account Holder</FormLabel>
                  <Input
                    type="text"
                    placeholder="Account holder name"
                    value={clinicFormData.accountHolder}
                    onChange={(e) =>
                      setClinicFormData((prev) => ({ ...prev, accountHolder: e.target.value }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Account Number</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter account number"
                    value={clinicFormData.accountNumber}
                    onChange={(e) =>
                      setClinicFormData((prev) => ({ ...prev, accountNumber: e.target.value }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter bank name"
                    value={clinicFormData.bankName}
                    onChange={(e) =>
                      setClinicFormData((prev) => ({ ...prev, bankName: e.target.value }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>IFSC Code</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter IFSC code"
                    value={clinicFormData.ifscCode}
                    onChange={(e) =>
                      setClinicFormData((prev) => ({ ...prev, ifscCode: e.target.value }))
                    }
                  />
                </FormControl>
              </Box>
            </>
          )}
        </FormModal>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default ClinicManagement;
