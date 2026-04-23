import React, { useState, useEffect } from 'react';
import { FormModal } from '../../../component-library/modals/FormModal';
import { Box, FormControl, FormLabel, Input, Button } from '../../../component-library';
import { getFileRes } from '../../../helpers/fileuploadHelper';
import FileUploadWithCamera from '../../../components/FileUploadWithCamera';
import { ScheduleManager } from './ScheduleManager';
import { ServiceRow } from './ServiceRow';

export function ClinicFormModal({ open, onClose, onSave, initial = null, organizations = [] }) {
  const defaultForm = {
    clinicName: '',
    address: { line1: '', city: '', state: '', postal: '', country: '' },
    contact: { phone: '', whatsapp: '', email: '' },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    capacity: 1,
    normalBeds: 0,
    isolatedBeds: 0,
    cleaningTimeMinutes: 30,
    services: [],
    slotTemplates: [],
    status: 'active',
    clinicIconURL: '',
    upiId: '',
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    organizationId: '',
  };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  // Selected local file for the clinic icon. We defer upload until submit (same pattern as Ailment form)
  const [clinicIconFile, setClinicIconFile] = useState(null);
  const [iconUploadError, setIconUploadError] = useState('');

  useEffect(() => {
    if (initial) {
      const bankParts = (initial.bankDetails || '').split(',').map((s) => s.trim());
      const parseBankField = (prefix) => {
        const part = bankParts.find((p) => p.startsWith(prefix));
        return part ? part.replace(prefix, '').trim() : '';
      };

      setForm({
        ...defaultForm,
        ...initial,
        address: typeof initial.address === 'string'
          ? { line1: initial.address, city: '', state: '', postal: '', country: '' }
          : (initial.address || defaultForm.address),
        contact: {
          phone: initial.phone || initial.contact?.phone || '',
          whatsapp: initial.whatsapp || initial.contact?.whatsapp || '',
          email: initial.clinicEmail || initial.contact?.email || ''
        },
        services: initial.services || [],
        slotTemplates: (initial.slotTemplates || []).map(st => ({
          ...st,
          startTime: st.startTime || st.timings?.[0]?.startTime || '',
          endTime: st.endTime || st.timings?.[0]?.endTime || ''
        })),
        normalBeds: initial.normalBeds || 0,
        isolatedBeds: initial.isolatedBeds || 0,
        cleaningTimeMinutes: initial.cleaningTimeMinutes || 30,
        upiId: initial.upiDetails || initial.upiId || '',
        accountHolder: initial.accountHolder || parseBankField('Holder:'),
        accountNumber: initial.accountNumber || parseBankField('Account No:'),
        bankName: initial.bankName || (bankParts[0] && !bankParts[0].startsWith('Holder:') && !bankParts[0].startsWith('Account ') && !bankParts[0].startsWith('IFSC:') ? bankParts[0].replace(/Bank$/i, '').trim() + ' Bank' : ''),
        ifscCode: initial.ifscCode || parseBankField('IFSC:'),
        clinicIconURL: initial.clinicIconURL || initial.clinic_icon_url || initial.clinic_icon || '',
        organizationId: initial.organizationId || initial.organization_id || '',
      });
    } else {
      setForm(defaultForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  if (!open) return null;

  function updateField(path, value) {
    setForm(prev => {
      const next = { ...prev };
      if (path.includes('.')) {
        const [a, b] = path.split('.');
        next[a] = { ...next[a], [b]: value };
      } else {
        next[path] = value;
      }

      // Auto calc capacity
      if (path === 'normalBeds' || path === 'isolatedBeds') {
        const nBeds = path === 'normalBeds' ? Number(value) : Number(next.normalBeds || 0);
        const iBeds = path === 'isolatedBeds' ? Number(value) : Number(next.isolatedBeds || 0);
        next.capacity = nBeds + iBeds;
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [path]: undefined }));
  }

  // NOTE: Previous behavior uploaded the image immediately on selection.
  // We now follow the Ailment flow: store the selected File locally (clinicIconFile)
  // and upload only when the user submits the form. This avoids stray uploads
  // when the user cancels the modal and keeps behavior consistent across forms.

  // ---- Services ----
  function addService() {
    const id = `srv-${Date.now()}`;
    setForm(prev => ({
      ...prev,
      services: [...prev.services, { id, name: '', amount: 0, discount: 0 }]
    }));
  }
  function updateService(updated) {
    setForm(prev => ({ ...prev, services: prev.services.map(s => s.id === updated.id ? updated : s) }));
  }
  function removeService(id) {
    setForm(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
  }

  const handleSave = async () => {
    const validationErrors = {};
    if (!form.clinicName.trim()) validationErrors.clinicName = 'Required';
    if (!form.contact.phone.trim() && !form.contact.email.trim()) {
      validationErrors['contact.phone'] = 'Phone or Email is required';
      validationErrors['contact.email'] = 'Phone or Email is required';
    }
    if (!form.organizationId) {
      validationErrors.organizationId = 'Organization is required';
    }

    // Final integrity check for slot timings
    const invalidSlot = form.slotTemplates.find(st => st.startTime >= st.endTime);
    if (invalidSlot) {
      alert(`Invalid schedule found: ${invalidSlot.startTime} to ${invalidSlot.endTime}. Start time must be strictly before end time.`);
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // If a new icon file was selected, upload it now (deferred upload pattern used by Ailment form)
    let finalForm = { ...form };
    if (clinicIconFile) {
      try {
        setIconUploadError('');
        const fileRes = await getFileRes(clinicIconFile);
        const uploadedUrl = fileRes?.data?.objectUrl || fileRes?.data?.url || (typeof fileRes?.data === 'string' ? fileRes.data : '');
        if (uploadedUrl) {
          finalForm.clinicIconURL = uploadedUrl;
        } else {
          const msg = 'Upload failed: no URL returned';
          setErrors(prev => ({ ...prev, clinicIconURL: msg }));
          setIconUploadError(msg);
          return;
        }
      } catch (err) {
        const msg = err?.message || 'Failed to upload clinic icon.';
        setErrors(prev => ({ ...prev, clinicIconURL: msg }));
        setIconUploadError(msg);
        return;
      }
    }

    onSave({ ...finalForm, id: initial?.id });
  };

  return (
    <FormModal
      isOpen={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={initial ? 'Edit Clinic / Center' : 'Create Clinic / Center'}
      submitText="Save Clinic"
      size="3xl"
      fieldErrors={errors}
      onFieldErrorClear={(f) => setErrors(p => ({ ...p, [f]: undefined }))}
    >
      {({ getFieldProps, clearFieldError }) => (
        <div className="space-y-8 bg-white ">
          {/* General Information */}
          <div className="">
            <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-[#2c3e50]">General Information</h4>
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormControl isRequired isInvalid={getFieldProps('clinicName').isInvalid} className="col-span-1 mt-6 md:col-span-2 lg:col-span-2">
                <FormLabel>Clinic Name</FormLabel>
                <Input value={form.clinicName} onChange={e => { updateField('clinicName', e.target.value); clearFieldError('clinicName'); }} className="w-full" />
              </FormControl>
              <FormControl isRequired isInvalid={getFieldProps('organizationId').isInvalid} className="col-span-1 md:col-span-2 lg:col-span-2">
                <FormLabel>Linked Organization</FormLabel>
                <select
                  value={form.organizationId}
                  onChange={(e) => {
                    updateField('organizationId', e.target.value);
                    clearFieldError('organizationId');
                  }}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#004c6d] focus:border-transparent"
                >
                  <option value="">Select Organization</option>
                  {(organizations || []).map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormControl isInvalid={getFieldProps('clinicIconURL').isInvalid} className="col-span-1 md:col-span-2 lg:col-span-2 mt-6">
                <FormLabel>Clinic Icon</FormLabel>
                <FileUploadWithCamera
                  size="xs"
                  images={form.clinicIconURL ? [form.clinicIconURL] : (clinicIconFile ? [{ file: clinicIconFile }] : [])}
                  onFileChange={(file) => {
                    // file is a File when multiple=false; clear any previous remote URL while user selects local file
                    setClinicIconFile(file);
                    if (file) updateField('clinicIconURL', '');
                    clearFieldError('clinicIconURL');
                  }}
                  onChange={(items) => {
                    // items is the internal items array; clear state when user removes preview
                    if (!items || items.length === 0) {
                      setClinicIconFile(null);
                      updateField('clinicIconURL', '');
                    } else {
                      const first = items[0];
                      if (first?.file) {
                        setClinicIconFile(first.file);
                        updateField('clinicIconURL', '');
                      } else if (typeof first === 'string') {
                        // string indicates an existing remote URL preview
                        updateField('clinicIconURL', first);
                        setClinicIconFile(null);
                      }
                    }
                  }}
                  accept="*"
                  attachLabel="Upload Icon"
                  captureLabel="Capture Icon"
                  previewWidth={64}
                  previewHeight={64}
                  showCountInfo={false}
                  showCamera={false}
                  multiple={false}
                />
                {iconUploadError && <p className="mt-2 text-sm text-red-600">{iconUploadError}</p>}
              </FormControl>

              {/* <FormControl>
                <FormLabel>Status</FormLabel>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#004c6d] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormControl> */}
            </Box>
          </div>

          {/* Facility Details */}
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-[#2c3e50]">Facility Details</h4>
            <Box className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormControl className="mt-6">
                <FormLabel>Capacity</FormLabel>
                <Input type="number" value={form.capacity} readOnly className="w-full bg-gray-100" />
              </FormControl>
              <FormControl>
                <FormLabel>Normal Beds</FormLabel>
                <Input type="number" value={form.normalBeds} onChange={e => updateField('normalBeds', Number(e.target.value))} min={0} className="w-full" />
              </FormControl>
              <FormControl>
                <FormLabel>Isolated Beds</FormLabel>
                <Input type="number" value={form.isolatedBeds} onChange={e => updateField('isolatedBeds', Number(e.target.value))} min={0} className="w-full" />
              </FormControl>
              <FormControl>
                <FormLabel>Cleaning Time</FormLabel>
                <Input type="number" value={form.cleaningTimeMinutes} onChange={e => updateField('cleaningTimeMinutes', Number(e.target.value))} min={0} className="w-full" />
              </FormControl>
            </Box>
          </div>

          {/* Contact & Address */}
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-[#2c3e50]">Contact & Address</h4>
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormControl className="mt-6" isRequired isInvalid={getFieldProps('contact.phone').isInvalid}>
                <FormLabel>Phone</FormLabel>
                <Input value={form.contact.phone} onChange={e => { updateField('contact.phone', e.target.value); clearFieldError('contact.phone'); }} />
              </FormControl>
              <FormControl>
                <FormLabel>WhatsApp</FormLabel>
                <Input value={form.contact.whatsapp} onChange={e => updateField('contact.whatsapp', e.target.value)} />
              </FormControl>
              <FormControl isRequired isInvalid={getFieldProps('contact.email').isInvalid}>
                <FormLabel>Email</FormLabel>
                <Input value={form.contact.email} type="email" onChange={e => { updateField('contact.email', e.target.value); clearFieldError('contact.email'); }} />
              </FormControl>
            </Box>
            <Box className="mt-6 grid grid-cols-1 gap-6">
              <FormControl>
                <FormLabel>Address Line 1</FormLabel>
                <Input value={form.address.line1} onChange={e => updateField('address.line1', e.target.value)} className="w-full" />
              </FormControl>
            </Box>
            <Box className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormControl className="mt-6">
                <FormLabel>City</FormLabel>
                <Input value={form.address.city} onChange={e => updateField('address.city', e.target.value)} className="w-full" />
              </FormControl>
              <FormControl>
                <FormLabel>State</FormLabel>
                <Input value={form.address.state} onChange={e => updateField('address.state', e.target.value)} className="w-full" />
              </FormControl>
              <FormControl>
                <FormLabel>Postal Code</FormLabel>
                <Input value={form.address.postal} onChange={e => updateField('address.postal', e.target.value)} className="w-full" />
              </FormControl>
            </Box>
          </div>

          {/* Payment Details Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-[#2c3e50]">Payment Details</h4>
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormControl className="mt-6">
                <FormLabel>UPI ID</FormLabel>
                <Input value={form.upiId} onChange={(e) => updateField('upiId', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Account Holder</FormLabel>
                <Input value={form.accountHolder} onChange={(e) => updateField('accountHolder', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Account Number</FormLabel>
                <Input value={form.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Bank Name</FormLabel>
                <Input value={form.bankName} onChange={(e) => updateField('bankName', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>IFSC Code</FormLabel>
                <Input value={form.ifscCode} onChange={(e) => updateField('ifscCode', e.target.value)} />
              </FormControl>
            </Box>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-[#2c3e50]">Services</h4>
            <div className="space-y-4 mb-4">
              {form.services.map(service => (
                <ServiceRow key={service.id} service={service} onChange={updateService} onRemove={removeService} />
              ))}
            </div>
            <Button variant="outline" onClick={addService} className="border-[#004c6d] text-[#004c6d]">
              + Add Service
            </Button>
          </div>

          {/* Slot Templates Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-[#2c3e50]">Slot Templates</h4>
            <ScheduleManager 
              clinicId={initial?.id}
              slotTemplates={form.slotTemplates} 
              capacity={form.capacity}
              bufferMinutes={form.cleaningTimeMinutes}
              isManagementMode={true}
              onChange={(newTemplates) => updateField('slotTemplates', newTemplates)} 
            />
          </div>

        </div>
      )}
    </FormModal>
  );
}
