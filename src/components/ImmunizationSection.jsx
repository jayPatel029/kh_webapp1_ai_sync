import React, { useEffect, useState } from 'react';
import { Box, Flex } from '../component-library';
import { getImmunizations, saveImmunizations } from '../ApiCalls/immunizationApis';
import ImmunizationModal from './modals/ImmunizationModal';
import { isRole } from '../helpers/roleUtils';

const formatDate = (d) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch (e) {
    return d;
  }
};

function ImmunizationSection({ userData = {}, role = {}, onSuccess }) {
  const [items, setItems] = useState(userData.immunizations || []);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    setItems(userData.immunizations || []);
  }, [userData.immunizations]);

  const refresh = async () => {
    if (!userData?.id) return;
    setLoading(true);
    try {
      const res = await getImmunizations(userData.id);
      if (res.success) setItems(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const persist = async (nextItems, extra = {}) => {
    if (!userData?.id) return;
    setLoading(true);
    try {
      const res = await saveImmunizations(userData.id, nextItems, extra);
      if (res.success) {
        setItems(nextItems);
        if (typeof onSuccess === 'function') onSuccess();
      }
    } catch (e) {
      console.error('Error saving immunizations:', e);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setModalMode('add');
    setModalItem(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setModalItem(item);
    setShowModal(true);
  };

  const handleModalSave = async (updatedItem, mode, extra = {}) => {
    const copy = JSON.parse(JSON.stringify(items || []));
    let next;
    if (mode === 'add') {
      next = [updatedItem, ...copy];
    } else {
      next = copy.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    }
    await persist(next, extra);
  };

  const handleModalDelete = async (id) => {
    const copy = JSON.parse(JSON.stringify(items || []));
    const next = copy.filter((i) => i.id !== id);
    await persist(next);
  };

  

  const toggleVerify = async (index, verifierKey) => {
    const copy = JSON.parse(JSON.stringify(items));
    const entry = copy[index];
    if (!entry.verifiedBy) entry.verifiedBy = { doctor: { value: false }, patient: { value: false }, dt: { value: false } };
    const current = entry.verifiedBy[verifierKey]?.value || false;
    const currentUserName = localStorage.getItem('name') || localStorage.getItem('email') || role?.role_name || 'User';
    entry.verifiedBy[verifierKey] = {
      value: !current,
      by: !current ? currentUserName : null,
      at: !current ? new Date().toISOString() : null,
    };
    await persist(copy);
  };

  const handleRemove = async (index) => {
    if (!window.confirm('Remove this immunization entry?')) return;
    const copy = [...items];
    copy.splice(index, 1);
    await persist(copy);
  };

  return (
    <>
      <Box className="space-y-4">
      <Flex justify="start" align="center" className="items-center gap-4">
        <Box as="h2" className="text-xl font-bold">Immunizations</Box>
        {(isRole(role, 'Doctor')) && (
          <button
            onClick={openAddModal}
            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            + Add Immunization
          </button>
        )}
      </Flex>

      {loading && <Box className="text-sm text-muted">Saving...</Box>}

      {(!items || items.length === 0) && !loading && (
        <Box className="text-sm text-gray-400 italic">No immunizations recorded.</Box>
      )}

      <div className="space-y-3">
        {items.map((it, idx) => (
          <Box key={it.id || idx} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <Flex justify="between" align="center" className="gap-4">
              <Box className="flex-1 min-w-0">
                <Box className="text-sm font-medium text-gray-800 truncate">{it.vaccine}</Box>
                <Box className="text-xs text-gray-500">Date: {formatDate(it.date)} • Entered by: {it.administeredBy}</Box>
                {it.notes && <Box className="text-xs text-gray-500 mt-1">Notes: {it.notes}</Box>}
              </Box>

              <Flex className="gap-2 items-center">
                <div className="flex gap-2 items-center">
                  <button
                    title="Verify as Doctor"
                    onClick={() => isRole(role, 'Doctor') && toggleVerify(idx, 'doctor')}
                    className={`text-sm px-2 py-1 rounded ${it.verifiedBy?.doctor?.value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Dr: {it.verifiedBy?.doctor?.value ? 'Verified' : 'Verify'}
                  </button>

                  <button
                    title="Verify as Patient"
                    onClick={() => isRole(role, 'Patient') && toggleVerify(idx, 'patient')}
                    className={`text-sm px-2 py-1 rounded ${it.verifiedBy?.patient?.value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    You: {it.verifiedBy?.patient?.value ? 'Verified' : 'Verify'}
                  </button>

                  <button
                    title="Verify as DT"
                    onClick={() => isRole(role, 'dialysis') && toggleVerify(idx, 'dt')}
                    className={`text-sm px-2 py-1 rounded ${it.verifiedBy?.dt?.value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    DT: {it.verifiedBy?.dt?.value ? 'Verified' : 'Verify'}
                  </button>
                </div>

                <div>
                  {(isRole(role, 'Doctor')) && (
                    <>
                      <button onClick={() => openEditModal(it)} className="text-sm px-2">Edit</button>
                      <button onClick={() => handleRemove(idx)} className="text-red-500 px-2">Remove</button>
                    </>
                  )}
                </div>
              </Flex>
            </Flex>
          </Box>
        ))}
      </div>
      </Box>
      {showModal && (
        <ImmunizationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          initialItem={modalItem}
          patientId={userData?.id}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          role={role}
        />
      )}
    </>
  );
}

export default ImmunizationSection;
