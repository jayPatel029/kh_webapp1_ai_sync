import React, { useState, useCallback } from 'react';
import {
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  Textarea,
} from '../../../component-library';
import { FormModal } from '../../../component-library/modals/FormModal';
import UnifiedListTable from '../../../components/table/UnifiedListTable';
import { useAdminToast } from '../../../components/AdminToast';

const initialSuppliers = [
  {
    id: 1,
    name: 'LifeCare Medical Systems',
    contact_person: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    whatsapp_no: '+919876543210',
    email: 'contact@lifecare.com',
    delivery_terms: 'Standard',
    payment_terms: '50%',
    address: '102, Industrial Area Phase II, Okhla, New Delhi - 110020',
    gst_number: '07AAAAA1111A1Z1',
    damaged_stock_policy: 'Replace within 7 days of delivery verification',
  },
  {
    id: 2,
    name: 'Apex Pharma Distributors',
    contact_person: 'Anita Desai',
    phone: '+91 91234 56789',
    whatsapp_no: '+919123456789',
    email: 'orders@apexpharma.com',
    delivery_terms: 'Expedited',
    payment_terms: '100%',
    address: 'Plot No. 45, Sector 4, Gandhinagar, Gujarat - 382010',
    gst_number: '24BBBBB2222B2Z2',
    damaged_stock_policy: 'Credit note issued within 14 working days',
  },
  {
    id: 3,
    name: 'Global Medtech Corporation',
    contact_person: 'Vikram Malhotra',
    phone: '+91 88888 77777',
    whatsapp_no: '+918888877777',
    email: 'info@globalmedtech.in',
    delivery_terms: 'Prepaid',
    payment_terms: '0%',
    address: 'Metro House, 3rd Floor, MG Road, Mumbai - 400001',
    gst_number: '27CCCCC3333C3Z3',
    damaged_stock_policy: 'Return & refund policy applies to all sealed products',
  }
];

export default function SuppliersTestPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    whatsapp_no: '',
    address: '',
    gst_number: '',
    delivery_terms: '',
    payment_terms: '0%',
    damaged_stock_policy: ''
  });
  const [supplierEditId, setSupplierEditId] = useState(null);
  
  const showToast = useAdminToast();

  const handleSupplierSubmit = () => {
    if (!supplierForm.name) {
      if (showToast) showToast('Name is required', 'error');
      else alert('Name is required');
      return;
    }

    if (supplierEditId) {
      setSuppliers(prev =>
        prev.map(s => (s.id === supplierEditId ? { ...s, ...supplierForm } : s))
      );
      if (showToast) showToast('Supplier updated successfully (Demo)', 'success');
    } else {
      const newSupplier = {
        ...supplierForm,
        id: Date.now()
      };
      setSuppliers(prev => [...prev, newSupplier]);
      if (showToast) showToast('Supplier created successfully (Demo)', 'success');
    }
    setIsSupplierModalOpen(false);
  };

  const openAddModal = () => {
    setSupplierForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      whatsapp_no: '',
      address: '',
      gst_number: '',
      delivery_terms: '',
      payment_terms: '0%',
      damaged_stock_policy: ''
    });
    setSupplierEditId(null);
    setIsSupplierModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setSupplierForm(supplier);
    setSupplierEditId(supplier.id);
    setIsSupplierModalOpen(true);
  };

  const supplierColumns = [
    { key: 'name', label: 'Name', type: 'text', width: '180px' },
    { key: 'contact_person', label: 'Contact', type: 'text', width: '140px' },
    { key: 'phone', label: 'Phone', type: 'text', width: '110px' },
    { key: 'whatsapp_no', label: 'WhatsApp', type: 'text', width: '110px' },
    { key: 'email', label: 'Email', type: 'text', width: '160px' },
    { key: 'delivery_terms', label: 'Delivery terms', type: 'text', width: '140px' },
    { key: 'payment_terms', label: 'Payment', type: 'text', width: '100px' },
    { key: 'damaged_stock_policy', label: 'Damaged stock', type: 'text', width: '200px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '100px' },
  ];

  return (
    <Box className="min-h-screen bg-slate-900 p-6 text-white">
      <Box className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
          <Box>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Suppliers UI Test Page
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Test environment for managing and previewing supplier registry cards, tables, and modal workflows.
            </p>
          </Box>
          <Button
            variant="primary"
            onClick={openAddModal}
            className="shadow-lg hover:shadow-blue-500/20 transition-all duration-300 bg-blue-600 hover:bg-blue-500 text-white"
          >
            + Add Supplier
          </Button>
        </Box>

        {/* Info card */}
        <Box className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-slate-300 font-medium">
            Total Suppliers Loaded: <strong className="text-blue-400 text-base ml-1">{suppliers.length}</strong>
          </span>
          <span className="text-xs bg-slate-700 text-slate-400 px-2.5 py-1 rounded-full border border-slate-650">
            Demo Sandbox Mode
          </span>
        </Box>

        {/* Suppliers List */}
        <Box className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
          <UnifiedListTable
            columns={supplierColumns}
            data={suppliers}
            onEdit={openEditModal}
            emptyMessage="No suppliers found"
            displayMode="table"
          />
        </Box>
      </Box>

      {/* Supplier Form Modal */}
      <FormModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSubmit={handleSupplierSubmit}
        title={supplierEditId ? 'Edit Supplier' : 'Add Supplier'}
        size="lg"
      >
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900">
          <FormControl isRequired>
            <FormLabel>Supplier Name</FormLabel>
            <Input
              value={supplierForm.name}
              onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Contact Person</FormLabel>
            <Input
              value={supplierForm.contact_person}
              onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              value={supplierForm.phone}
              onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={supplierForm.email}
              onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>WhatsApp Number</FormLabel>
            <Input
              value={supplierForm.whatsapp_no}
              onChange={(e) => setSupplierForm({ ...supplierForm, whatsapp_no: e.target.value })}
              placeholder="e.g. +919876543210"
            />
          </FormControl>
          <FormControl>
            <FormLabel>GST Number</FormLabel>
            <Input
              value={supplierForm.gst_number}
              onChange={(e) => setSupplierForm({ ...supplierForm, gst_number: e.target.value })}
              placeholder="e.g. 07AAAAA1111A1Z1"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Delivery Terms</FormLabel>
            <select
              value={supplierForm.delivery_terms}
              onChange={(e) => setSupplierForm({ ...supplierForm, delivery_terms: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                backgroundColor: 'white',
                color: 'black'
              }}
            >
              <option value="">-- Select --</option>
              <option value="Standard">Standard</option>
              <option value="Expedited">Expedited</option>
              <option value="Prepaid">Prepaid</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </FormControl>
          <FormControl>
            <FormLabel>Payment Terms</FormLabel>
            <select
              value={supplierForm.payment_terms}
              onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                backgroundColor: 'white',
                color: 'black'
              }}
            >
              <option value="0%">0%</option>
              <option value="50%">50%</option>
              <option value="100%">100%</option>
            </select>
          </FormControl>
          <FormControl className="md:col-span-2">
            <FormLabel>Address</FormLabel>
            <Textarea
              value={supplierForm.address}
              onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
            />
          </FormControl>
          <FormControl className="md:col-span-2">
            <FormLabel>Damaged stock policy</FormLabel>
            <Textarea
              value={supplierForm.damaged_stock_policy}
              onChange={(e) => setSupplierForm({ ...supplierForm, damaged_stock_policy: e.target.value })}
              placeholder="e.g. Return/Replace/Credit note"
            />
          </FormControl>
        </Box>
      </FormModal>
    </Box>
  );
}
