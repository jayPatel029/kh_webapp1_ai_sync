/**
 * Clinic / Organization Management Page
 * Two-tab layout: Organizations | Clinics
 * Modeled after AddRole.jsx and AdminManagement.jsx patterns.
 *
 * API Integration (Clinics tab):
 *  - GET /clinics  → getClinics()
 *  - GET /clinics/:id → getClinicById()
 *
 * Organizations tab: local state only (no backend API).
 *
 * @file src/pages/clinicManagement/ClinicManagement.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
} from '../../component-library';
import { FormModal } from '../../component-library/modals/FormModal';
import { ClinicFormModal } from './components/ClinicFormModal';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useAdminToast } from '../../components/AdminToast';
import { useNavigate } from 'react-router-dom';
import {
  getClinics, getClinicById, createClinic, updateClinic, deleteClinic,
  getOrganizations, getOrganizationById, createOrganization, updateOrganization, deleteOrganization,
  uploadClinicFiles,
} from '../../ApiCalls/clinicApis';

/**
 * Normalize a clinic from the backend into the shape the UI expects.
 * The API may return snake_case or camelCase; we handle both.
 */
const normalizeClinicFromApi = (c) => ({
  id: c.id,
  clinicName: c.clinicName || c.clinic_name || c.name || '',
  clinicEmail: c.clinicEmail || c.clinic_email || c.email || '',
  phone: c.phone || c.phoneno || c.phone_number || '',
  whatsapp: c.whatsapp || c.whatsapp_no || '',
  address: c.address || '',
  upiDetails: c.upiDetails || c.upi_details || '',
  bankDetails: c.bankDetails || c.bank_details || '',
  clinicIconURL: c.clinicIconURL || c.clinic_icon || c.clinic_icon_url || '',
  organizationId: c.organizationId || c.organization_id || '',
  organizationName: c.organization?.name || '',
});

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
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [orgEditMode, setOrgEditMode] = useState(false);
  const [orgFormData, setOrgFormData] = useState({ 
    name: '', email: '', phone: '', address: '',
    hasGuidelines: false, guidelines: [],
    hasChecklists: false, checklists: [], 
    hasInventory: false, hasPurchaseOrder: false 
  });
  const [orgEditId, setOrgEditId] = useState(null);
  const [orgFieldErrors, setOrgFieldErrors] = useState({});
  const [orgErrorMessage, setOrgErrorMessage] = useState('');

  // ─── Fetch organizations from API ──────────────────────
  const fetchOrganizations = useCallback(async () => {
    setOrganizationsLoading(true);
    try {
      const result = await getOrganizations();
      if (result.success) {
        const rows = Array.isArray(result.data?.data) ? result.data.data : Array.isArray(result.data) ? result.data : [];
        setOrganizations(rows);
      } else {
        showToast(result.data?.message || 'Failed to load organizations', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'Network error loading organizations', 'error');
    } finally {
      setOrganizationsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'organizations' || activeTab === 'clinics') {
      fetchOrganizations();
    }
  }, [activeTab, fetchOrganizations]);

  // ─── Clinic state ──────────────────────────────────────
  const [clinics, setClinics] = useState([]);
  const [clinicsLoading, setClinicsLoading] = useState(false);

  // ─── Fetch clinics from API ──────────────────────────
  const fetchClinics = useCallback(async () => {
    setClinicsLoading(true);
    try {
      const result = await getClinics();
      if (result.success) {
        const rows = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data)
          ? result.data
          : [];
        setClinics(rows.map(normalizeClinicFromApi));
      } else {
        showToast(result.data?.message || 'Failed to load clinics', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'Network error loading clinics', 'error');
    } finally {
      setClinicsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'clinics') {
      fetchClinics();
    }
  }, [activeTab, fetchClinics]);
  const [clinicSearchTerm, setClinicSearchTerm] = useState('');
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [clinicEditMode, setClinicEditMode] = useState(false);
  const [clinicEditId, setClinicEditId] = useState(null);
  const [clinicFullData, setClinicFullData] = useState(null);

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
    setOrgFormData({ 
      name: '', email: '', phone: '', address: '',
      hasGuidelines: false, guidelines: [{ text: '', type: 'Pre-dialysis' }], 
      hasChecklists: false, checklists: [{ text: '', type: 'Pre-dialysis' }], 
      hasInventory: false, hasPurchaseOrder: false 
    });
    setOrgEditMode(false);
    setOrgEditId(null);
    setOrgFieldErrors({});
    setOrgErrorMessage('');
    setIsOrgModalOpen(true);
  };

  const openOrgEdit = async (org) => {
    try {
      const result = await getOrganizationById(org.id);
      if (result.success) {
        const fullOrg = result.data.data || result.data;
        setOrgFormData({
          name: fullOrg.name || '',
          email: fullOrg.email || fullOrg.contactEmail || '',
          phone: fullOrg.phone || fullOrg.contactPhone || '',
          address: fullOrg.address || '',
          hasGuidelines: fullOrg.hasGuidelines || false,
          guidelines: fullOrg.guidelines?.length > 0 ? fullOrg.guidelines : [],
          hasChecklists: fullOrg.hasChecklists || false,
          checklists: fullOrg.checklists?.length > 0 ? fullOrg.checklists : [],
          hasInventory: fullOrg.hasInventory || false,
          hasPurchaseOrder: fullOrg.hasPurchaseOrder || false,
        });
        setOrgEditMode(true);
        setOrgEditId(fullOrg.id);
        setOrgFieldErrors({});
        setOrgErrorMessage('');
        setIsOrgModalOpen(true);
      } else {
        showToast(result.data?.message || 'Failed to fetch full organization details', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'Network error fetching organization details', 'error');
    }
  };

  const handleOrgSubmit = async () => {
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

    try {
      if (orgEditMode) {
        const res = await updateOrganization(orgEditId, orgFormData);
        if (res.success) {
          showToast('Organization updated successfully!', 'success');
          fetchOrganizations();
          setIsOrgModalOpen(false);
        } else {
          setOrgErrorMessage(res.data?.message || 'Failed to update organization');
        }
      } else {
        const res = await createOrganization(orgFormData);
        if (res.success) {
          showToast('Organization added successfully!', 'success');
          fetchOrganizations();
          setIsOrgModalOpen(false);
        } else {
          setOrgErrorMessage(res.data?.message || 'Failed to create organization');
        }
      }
    } catch (err) {
      setOrgErrorMessage(err?.message || 'An error occurred during submission');
    }
  };

  const handleOrgDelete = async (org) => {
    if (window.confirm(`Delete organization "${org.name}"?`)) {
      try {
        const res = await deleteOrganization(org.id);
        if (res.success) {
          showToast('Organization deleted successfully!', 'success');
          fetchOrganizations();
        } else {
          showToast(res.data?.message || 'Failed to delete organization', 'error');
        }
      } catch (err) {
        showToast(err?.message || 'Network error deleting organization', 'error');
      }
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
    setClinicEditMode(false);
    setClinicEditId(null);
    setClinicFullData(null);
    setIsClinicModalOpen(true);
  };

  const openClinicEdit = async (clinic) => {
    try {
      const result = await getClinicById(clinic.id);
      if (result.success) {
        const fullClinic = result.data.data || result.data;
        setClinicFullData(fullClinic);
        setClinicEditMode(true);
        setClinicEditId(fullClinic.id);
        setIsClinicModalOpen(true);
      } else {
        showToast(result.data?.message || 'Failed to fetch full clinic details', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'Network error fetching clinic details', 'error');
    }
  };

  const buildBankDetailsString = (data) => {
    const parts = [];
    if (data.bankName) parts.push(data.bankName);
    if (data.accountHolder) parts.push(`Holder: ${data.accountHolder}`);
    if (data.accountNumber) parts.push(`Account No: ${data.accountNumber}`);
    if (data.ifscCode) parts.push(`IFSC: ${data.ifscCode}`);
    return parts.join(', ');
  };

  const handleClinicSubmit = async (clinicPayloadFromModal) => {
    const finalPayload = {
      clinicName: clinicPayloadFromModal.clinicName,
      organizationId: Number(clinicPayloadFromModal.organizationId) || null,
      address: typeof clinicPayloadFromModal.address === 'object' 
        ? clinicPayloadFromModal.address 
        : { line1: clinicPayloadFromModal.address || '', city: '', state: '', postal: '', country: 'India' },
      phone: clinicPayloadFromModal.contact?.phone || '',
      whatsapp: clinicPayloadFromModal.contact?.whatsapp || '',
      clinicEmail: clinicPayloadFromModal.contact?.email || '',
      
      timezone: clinicPayloadFromModal.timezone || 'Asia/Calcutta',
      status: clinicPayloadFromModal.status || 'active',
      capacity: Number(clinicPayloadFromModal.capacity) || 0,
      normalBeds: Number(clinicPayloadFromModal.normalBeds) || 0,
      isolatedBeds: Number(clinicPayloadFromModal.isolatedBeds) || 0,
      cleaningTimeMinutes: Number(clinicPayloadFromModal.cleaningTimeMinutes) || 30,
      
      upiDetails: clinicPayloadFromModal.upiId || '',
      bankDetails: buildBankDetailsString(clinicPayloadFromModal),
      clinicIconURL: clinicPayloadFromModal.clinicIconURL || '',

      services: (clinicPayloadFromModal.services || []).map(s => ({
        name: s.name || '',
        amount: Number(s.amount) || 0,
        discount: Number(s.discount) || 0,
        gst: Number(s.gst) || 0,
        netAmount: Number(s.netAmount) || 0
      })),

      slotTemplates: (clinicPayloadFromModal.slotTemplates || []).map(st => {
        const formatTime = (t) => t ? t.split(':').slice(0, 2).join(':') : '00:00';
        return {
          frequency: st.frequency || 'weekly',
          daysOfWeek: Array.isArray(st.daysOfWeek) ? st.daysOfWeek : [st.daysOfWeek].filter(Boolean),
          timings: [{
            startTime: formatTime(st.startTime),
            endTime: formatTime(st.endTime)
          }],
          maxPatientsPerSlot: Number(st.maxPatientsPerSlot) || 1,
          bufferMinutes: Number(st.bufferMinutes) || 30,
          price: Number(st.price) || 0,
          status: st.status || 'active'
        };
      })
    };

    try {
      if (clinicEditMode) {
        const res = await updateClinic(clinicEditId, finalPayload);
        if (res.success) {
          // If the modal provided an uploaded icon URL, associate it with the clinic via the uploadFiles endpoint
          if (clinicPayloadFromModal.clinicIconURL) {
            try {
              await uploadClinicFiles({ id: clinicEditId, clinic_icon: clinicPayloadFromModal.clinicIconURL });
            } catch (e) {
              // non-fatal - show a warning but continue
              console.warn('Failed to attach clinic icon after update', e);
              showToast('Clinic updated but failed to attach icon', 'warning');
            }
          }

          showToast('Clinic updated successfully!', 'success');
          fetchClinics();
          setIsClinicModalOpen(false);
        } else {
          showToast(res.data?.message || 'Failed to update clinic', 'error');
        }
      } else {
        const res = await createClinic(finalPayload);
        if (res.success) {
          // try to extract created clinic id from response
          const createdId = res?.data?.data?.id || res?.data?.id || res?.data?.clinicId || null;
          if (clinicPayloadFromModal.clinicIconURL && createdId) {
            try {
              await uploadClinicFiles({ id: createdId, clinic_icon: clinicPayloadFromModal.clinicIconURL });
            } catch (e) {
              console.warn('Failed to attach clinic icon after create', e);
              showToast('Clinic created but failed to attach icon', 'warning');
            }
          }

          showToast('Clinic added successfully!', 'success');
          fetchClinics();
          setIsClinicModalOpen(false);
        } else {
          showToast(res.data?.message || 'Failed to create clinic', 'error');
        }
      }
    } catch (err) {
      showToast(err?.message || 'Network error during submission', 'error');
    }
  };

  const handleClinicDelete = async (clinic) => {
    if (window.confirm(`Delete clinic "${clinic.clinicName}"?`)) {
      try {
        const res = await deleteClinic(clinic.id);
        if (res.success) {
          showToast('Clinic deleted successfully!', 'success');
          fetchClinics();
        } else {
          showToast(res.data?.message || 'Failed to delete clinic', 'error');
        }
      } catch (err) {
        showToast(err?.message || 'Network error deleting clinic', 'error');
      }
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
    { key: 'organizationName', label: 'Organization', type: 'text', width: '180px' },
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
            title="Clinic/Centers Management"
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

              {organizationsLoading ? (
                <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <p style={{ color: '#6B7280' }}>Loading organizations…</p>
                </div>
              ) : (
                  <UnifiedListTable
                    columns={orgColumns}
                    data={orgTableData}
                    onEdit={openOrgEdit}
                    onDelete={handleOrgDelete}
                    emptyMessage="No organizations found"
                    displayMode="table"
                    rowsPerPage={10}
                  />
              )}
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

              {clinicsLoading ? (
                <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <p style={{ color: '#6B7280' }}>Loading clinics…</p>
                </div>
              ) : (
                <UnifiedListTable
                  columns={clinicColumns}
                  data={clinicTableData}
                  onEdit={openClinicEdit}
                  onDelete={handleClinicDelete}
                  emptyMessage="No clinics found"
                  displayMode="table"
                  rowsPerPage={10}
                />
              )}
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
          size="6xl"
          errorMessage={orgErrorMessage}
          fieldErrors={orgFieldErrors}
          onFieldErrorClear={(field) =>
            setOrgFieldErrors((prev) => ({ ...prev, [field]: undefined }))
          }
        >
          {({ getFieldProps, clearFieldError }) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormControl className="mt-6" isRequired isInvalid={getFieldProps('name').isInvalid}>
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
                  <Input
                    type="text"
                    placeholder="Enter address"
                    value={orgFormData.address}
                    onChange={(e) => {
                      setOrgFormData((prev) => ({ ...prev, address: e.target.value }));
                      clearFieldError('address');
                    }}
                  />
                </FormControl>
              </div>

              {/* Operational Requirements Section */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-[#2c3e50]">Operational Requirements</h4>
                
                <div className="space-y-6">

                  {/* Inventory & Purchase Order Toggles */}
                  <div className="flex flex-col md:flex-row w-1/2 items-start gap-8 px-5 py-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <p className="mb-0 font-medium text-[#2c3e50] text-sm">Require Inventory Module?</p>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-[#1f2937]">
                          <input type="radio" checked={orgFormData.hasInventory === true} onChange={() => setOrgFormData(prev => ({ ...prev, hasInventory: true }))} className="w-3.5 h-3.5 text-[#004c6d] focus:ring-[#004c6d]" /> Yes
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-[#1f2937]">
                          <input type="radio" checked={orgFormData.hasInventory === false} onChange={() => setOrgFormData(prev => ({ ...prev, hasInventory: false }))} className="w-3.5 h-3.5 text-[#004c6d] focus:ring-[#004c6d]" /> No
                        </label>
                      </div>
                    </div>
                    {/* Divider for larger screens */}
                    {/* <div className="hidden md:block w-px h-6 bg-gray-300"></div> */}
                    <div className="flex items-center gap-4">
                      <p className="mb-0 font-medium text-[#2c3e50] text-sm">Require Purchase Order?</p>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-[#1f2937]">
                          <input type="radio" checked={orgFormData.hasPurchaseOrder === true} onChange={() => setOrgFormData(prev => ({ ...prev, hasPurchaseOrder: true }))} className="w-3.5 h-3.5 text-[#004c6d] focus:ring-[#004c6d]" /> Yes
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-[#1f2937]">
                          <input type="radio" checked={orgFormData.hasPurchaseOrder === false} onChange={() => setOrgFormData(prev => ({ ...prev, hasPurchaseOrder: false }))} className="w-3.5 h-3.5 text-[#004c6d] focus:ring-[#004c6d]" /> No
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Guidelines */}
                  <Box className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="mb-0 font-semibold text-[#2c3e50] text-base">Do you need Guidelines?</p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-[#1f2937]">
                          <input type="radio" checked={orgFormData.hasGuidelines === true} onChange={() => setOrgFormData(prev => ({ ...prev, hasGuidelines: true }))} className="w-4 h-4 text-[#004c6d] focus:ring-[#004c6d]" /> Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[#1f2937]">
                          <input type="radio" checked={orgFormData.hasGuidelines === false} onChange={() => setOrgFormData(prev => ({ ...prev, hasGuidelines: false }))} className="w-4 h-4 text-[#004c6d] focus:ring-[#004c6d]" /> No
                        </label>
                      </div>
                    </div>
                    {orgFormData.hasGuidelines && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                        <p className="font-medium text-sm text-gray-700 mb-2">Guidelines List</p>
                        {orgFormData.guidelines.map((gl, i) => (
                          <div key={i} className="flex items-start gap-3 w-full">
                            <div className="flex flex-col items-start gap-3 flex-1 w-full">
                              <select
                                value={gl.type}
                                onChange={(e) => {
                                  const newGL = [...orgFormData.guidelines];
                                  newGL[i] = { ...newGL[i], type: e.target.value };
                                  setOrgFormData(prev => ({ ...prev, guidelines: newGL }));
                                }}
                                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#004c6d] focus:border-transparent shrink-0 mt-1 text-gray-700"
                              >
                                <option value="Pre-dialysis">Pre-dialysis</option>
                                <option value="During dialysis">During dialysis</option>
                                <option value="Post-dialysis">Post-dialysis</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Preparation">Preparation</option>
                              </select>
                              <Textarea
                                value={gl.text}
                                onChange={(e) => {
                                  const newGL = [...orgFormData.guidelines];
                                  newGL[i] = { ...newGL[i], text: e.target.value };
                                  setOrgFormData(prev => ({ ...prev, guidelines: newGL }));
                                }} 
                                className="flex-1 min-h-[60px] resize-y w-full text-sm"
                                placeholder="e.g. Ensure patient has updated their consent forms..."
                              />
                            </div>
                            {orgFormData.guidelines.length > 1 && (
                              <button type="button" onClick={() => setOrgFormData(prev => ({ ...prev, guidelines: prev.guidelines.filter((_, idx) => idx !== i) }))} className="mt-1 text-red-500 font-bold w-8 h-8 flex items-center justify-center bg-red-50 rounded-full hover:bg-red-100 transition-colors shrink-0" title="Remove row">
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => setOrgFormData(prev => ({ ...prev, guidelines: [...prev.guidelines, { text: '', type: 'Pre-dialysis' }] }))} className="mt-2 text-[#004c6d] border-[#004c6d]">
                          + Add More Guideline
                        </Button>
                      </div>
                    )}
                  </Box>

                  {/* Checklists */}
                  <Box className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="mb-0 font-semibold text-[#2c3e50] text-base">Do you need Checklists?</p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-[#1f2937]">
                          <input type="radio" checked={orgFormData.hasChecklists === true} onChange={() => setOrgFormData(prev => ({ ...prev, hasChecklists: true }))} className="w-4 h-4 text-[#004c6d] focus:ring-[#004c6d]" /> Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[#1f2937]">
                          <input type="radio" checked={orgFormData.hasChecklists === false} onChange={() => setOrgFormData(prev => ({ ...prev, hasChecklists: false }))} className="w-4 h-4 text-[#004c6d] focus:ring-[#004c6d]" /> No
                        </label>
                      </div>
                    </div>
                    {orgFormData.hasChecklists && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                        <p className="font-medium text-sm text-gray-700 mb-2">Checklists List</p>
                        {orgFormData.checklists.map((chk, i) => (
                          <div key={i} className="flex items-start gap-3 w-full">
                            <div className="flex flex-col items-start gap-3 flex-1 w-full">
                              <select
                                value={chk.type}
                                onChange={(e) => {
                                  const newChk = [...orgFormData.checklists];
                                  newChk[i] = { ...newChk[i], type: e.target.value };
                                  setOrgFormData(prev => ({ ...prev, checklists: newChk }));
                                }}
                                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#004c6d] focus:border-transparent shrink-0 mt-1 text-gray-700"
                              >
                                <option value="Pre-dialysis">Pre-dialysis</option>
                                <option value="During dialysis">During dialysis</option>
                                <option value="Post-dialysis">Post-dialysis</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Preparation">Preparation</option>
                              </select>
                              <Textarea
                                value={chk.text}
                                onChange={(e) => {
                                  const newChk = [...orgFormData.checklists];
                                  newChk[i] = { ...newChk[i], text: e.target.value };
                                  setOrgFormData(prev => ({ ...prev, checklists: newChk }));
                                }} 
                                className="flex-1 min-h-[60px] resize-y w-full text-sm"
                                placeholder="e.g. Check vital signs..."
                              />
                            </div>
                            {orgFormData.checklists.length > 1 && (
                              <button type="button" onClick={() => setOrgFormData(prev => ({ ...prev, checklists: prev.checklists.filter((_, idx) => idx !== i) }))} className="mt-1 text-red-500 font-bold w-8 h-8 flex items-center justify-center bg-red-50 rounded-full hover:bg-red-100 transition-colors shrink-0" title="Remove row">
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => setOrgFormData(prev => ({ ...prev, checklists: [...prev.checklists, { text: '', type: 'Pre-dialysis' }] }))} className="mt-2 text-[#004c6d] border-[#004c6d]">
                          + Add More Checklist
                        </Button>
                      </div>
                    )}
                  </Box>
                </div>
              </div>
            </>
          )}
        </FormModal>

        {/* ─── CLINIC FORM MODAL ──────────────────────── */}
        <ClinicFormModal
          open={isClinicModalOpen}
          initial={clinicFullData}
          organizations={organizations}
          onClose={() => setIsClinicModalOpen(false)}
          onSave={handleClinicSubmit}
        />

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default ClinicManagement;
