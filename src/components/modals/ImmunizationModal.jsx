import React, { useEffect, useState } from 'react';
import {
  BaseModal,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Box,
  Flex,
  Text,
} from '../../component-library';
import { getPatientById } from '../../ApiCalls/patientAPis';

const ImmunizationModal = ({
  isOpen,
  onClose,
  mode = 'edit', // 'edit' | 'add'
  initialItem = null,
  patientId,
  onSave,
  onDelete,
  role,
}) => {
  const [vaccine, setVaccine] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');
  const [verifiedDoctor, setVerifiedDoctor] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState(false);
  const [verifiedDT, setVerifiedDT] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [identityImmunizationRaw, setIdentityImmunizationRaw] = useState('');
  const [identityLoading, setIdentityLoading] = useState(false);

  const currentUserName =
    localStorage.getItem('name') || localStorage.getItem('email') || role?.role_name || 'User';

  useEffect(() => {
    if (!initialItem) {
      setVaccine('');
      setDate('');
      setNotes('');
      setAdministeredBy('');
      setVerifiedDoctor(false);
      setVerifiedPatient(false);
      setVerifiedDT(false);
      setError('');
      return;
    }

    setVaccine(initialItem.vaccine || '');
    // ensure date input is yyyy-mm-dd
    try {
      setDate(initialItem.date ? new Date(initialItem.date).toISOString().split('T')[0] : '');
    } catch (e) {
      setDate(initialItem.date || '');
    }
    setNotes(initialItem.notes || '');
    setAdministeredBy(initialItem.administeredBy || '');
    setVerifiedDoctor(Boolean(initialItem?.verifiedBy?.doctor?.value));
    setVerifiedPatient(Boolean(initialItem?.verifiedBy?.patient?.value));
    setVerifiedDT(Boolean(initialItem?.verifiedBy?.dt?.value));
    setError('');
  }, [initialItem, isOpen]);

  useEffect(() => {
    if (!isOpen || !patientId) {
      setIdentityImmunizationRaw('');
      return;
    }

    let isMounted = true;
    const fetchIdentityField = async () => {
      setIdentityLoading(true);
      try {
        const res = await getPatientById(patientId);
        const patientData = res?.data?.data || res?.data || {};
        const identityValue =
          patientData.identityImmunization ||
          patientData.identity_immunization ||
          patientData.immunizationIdentity ||
          patientData.identity ||
          '';

        const rawValue = typeof identityValue === 'string'
          ? identityValue
          : JSON.stringify(identityValue, null, 2);

        if (isMounted) {
          setIdentityImmunizationRaw(rawValue);
        }
      } catch (e) {
        console.error('Error loading identity immunization field:', e);
        if (isMounted) {
          setIdentityImmunizationRaw('');
        }
      } finally {
        if (isMounted) {
          setIdentityLoading(false);
        }
      }
    };

    fetchIdentityField();

    return () => {
      isMounted = false;
    };
  }, [isOpen, patientId]);

  const buildVerifiedObj = () => ({
    doctor: {
      value: Boolean(verifiedDoctor),
      by: verifiedDoctor ? currentUserName : (initialItem?.verifiedBy?.doctor?.by || null),
      at: verifiedDoctor ? new Date().toISOString() : (initialItem?.verifiedBy?.doctor?.at || null),
    },
    patient: {
      value: Boolean(verifiedPatient),
      by: verifiedPatient ? currentUserName : (initialItem?.verifiedBy?.patient?.by || null),
      at: verifiedPatient ? new Date().toISOString() : (initialItem?.verifiedBy?.patient?.at || null),
    },
    dt: {
      value: Boolean(verifiedDT),
      by: verifiedDT ? currentUserName : (initialItem?.verifiedBy?.dt?.by || null),
      at: verifiedDT ? new Date().toISOString() : (initialItem?.verifiedBy?.dt?.at || null),
    },
  });

  const handleSave = async () => {
    if (!vaccine || vaccine.trim() === '') {
      setError('Vaccine name is required');
      return;
    }
    setIsSaving(true);
    setError('');

    let identityValue = identityImmunizationRaw;
    const trimmedIdentity = identityImmunizationRaw?.trim();
    if (trimmedIdentity?.startsWith('{') || trimmedIdentity?.startsWith('[')) {
      try {
        identityValue = JSON.parse(trimmedIdentity);
      } catch {
        identityValue = identityImmunizationRaw;
      }
    }

    const out = {
      id: initialItem?.id || `local-${Date.now()}`,
      vaccine: vaccine.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      notes: notes || '',
      administeredBy: administeredBy || currentUserName,
      verifiedBy: buildVerifiedObj(),
    };

    try {
      await onSave(out, mode, { identityImmunization: identityValue });
      onClose();
    } catch (e) {
      console.error('Error saving immunization:', e);
      setError(e?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialItem?.id) return;
    if (!window.confirm('Delete this immunization entry?')) return;
    try {
      await onDelete(initialItem.id);
      onClose();
    } catch (e) {
      console.error('Delete failed:', e);
      setError('Failed to delete');
    }
  };

  return (
    <BaseModal
      isOpen={Boolean(isOpen)}
      onClose={onClose}
      title={mode === 'add' ? 'Add Immunization' : 'Edit Immunization'}
      size="md"
      footer={(
        <Flex justify="end" gap={2}>
          {mode === 'edit' && (role?.role_name === 'Doctor') && (
            <Button variant="outline" onClick={handleDelete} isDisabled={isSaving}>
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} isDisabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} isLoading={isSaving}>Save</Button>
        </Flex>
      )}
    >
      <Box className="space-y-3">
        {error && <Text color="danger">{error}</Text>}

        {identityLoading ? (
          <Text color="muted">Loading patient immunization identity…</Text>
        ) : (
          <FormControl>
            <FormLabel>Immunization Identity</FormLabel>
            <Textarea
              value={identityImmunizationRaw}
              onChange={(e) => setIdentityImmunizationRaw(e.target.value)}
              placeholder="e.g. {{'Influenza', '2026-04-21'}, {'Hepatitis B', '2025-11-15'}}"
              rows={4}
            />
          </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel>Vaccine</FormLabel>
          <Input value={vaccine} onChange={(e) => setVaccine(e.target.value)} placeholder="e.g., Influenza" />
        </FormControl>

        <FormControl>
          <FormLabel>Date</FormLabel>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>Entered by</FormLabel>
          <Input value={administeredBy} onChange={(e) => setAdministeredBy(e.target.value)} placeholder="Doctor / Clinic" />
        </FormControl>

        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
        </FormControl>

        <Box className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            onClick={() => setVerifiedDoctor((v) => !v)}
            className={verifiedDoctor ? 'bg-green-100 text-green-700' : ''}
          >
            Dr: {verifiedDoctor ? 'Verified' : 'Verify'}
          </Button>
          <Button
            onClick={() => setVerifiedPatient((v) => !v)}
            className={verifiedPatient ? 'bg-green-100 text-green-700' : ''}
          >
            You: {verifiedPatient ? 'Verified' : 'Verify'}
          </Button>
          <Button
            onClick={() => setVerifiedDT((v) => !v)}
            className={verifiedDT ? 'bg-green-100 text-green-700' : ''}
          >
            DT: {verifiedDT ? 'Verified' : 'Verify'}
          </Button>
        </Box>
      </Box>
    </BaseModal>
  );
};

export default ImmunizationModal;
