/**
 * Dialysis Inventory Page (Manager only)
 *
 * Four tabs: Items | Stock | Alerts | Dialyzers
 * Fully integrated with inventoryApis.js
 *
 * API Integration:
 *  - GET  /inventory/items              → getInventoryItems()
 *  - POST /inventory/items              → createInventoryItem()
 *  - PUT  /inventory/items/:id          → updateInventoryItem()
 *  - DEL  /inventory/items/:id          → deleteInventoryItem()
 *  - GET  /inventory/stock              → getInventoryStock()
 *  - POST /inventory/stock/add          → addInventoryStock()
 *  - POST /inventory/stock/issue        → issueInventoryStock()
 *  - GET  /inventory/alerts             → getInventoryAlerts()
 *  - POST /inventory/alerts/:id/resolve → resolveInventoryAlert()
 *  - GET  /inventory/dialyzers          → getInventoryDialyzers()
 *  - POST /inventory/dialyzers          → createInventoryDialyzer()
 *  - POST /inventory/dialyzers/:id/use  → useInventoryDialyzer()
 *
 * @file src/pages/dialysis/DialysisInventory.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  Textarea,
} from '../../component-library';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FormModal } from '../../component-library/modals/FormModal';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useAdminToast } from '../../components/AdminToast';
import {
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStock,
  addInventoryStock,
  issueInventoryStock,
  getInventoryAlerts,
  resolveInventoryAlert,
  getInventoryDialyzers,
  createInventoryDialyzer,
  useInventoryDialyzer as recordDialyzerUsage,
  getSuppliers,
  createSupplier,
  updateSupplier,
  getProcurementOrders,
  getProcurementOrderById,
  createProcurementOrder,
  updateProcurementOrder,
  getDeliveries,
  getDeliveryById,
  createDelivery,
  validateDelivery,
  getRestockRequests,
  createRestockRequest,
} from '../../ApiCalls/inventoryApis';

// ─── Tabs ──────────────────────────────────────────────────
const TABS = [
  { key: 'items', label: 'Items' },
  { key: 'stock', label: 'Stock' },
  { key: 'procurement', label: 'Procurement' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'dialyzers', label: 'Dialyzers' },
];

// ─── Badge Colors ──────────────────────────────────────────
const SEVERITY_COLORS = {
  HIGH: { bg: '#FEE2E2', text: '#991B1B' },
  MEDIUM: { bg: '#FEF9C3', text: '#854D0E' },
  LOW: { bg: '#DBEAFE', text: '#1E40AF' },
};
const ALERT_TYPE_COLORS = {
  LOW_STOCK: { bg: '#FED7AA', text: '#9A3412' },
  EXPIRY: { bg: '#FEE2E2', text: '#991B1B' },
};
const DIALYZER_STATUS_COLORS = {
  ACTIVE: { bg: '#DCFCE7', text: '#166534' },
  BLOCKED: { bg: '#FEE2E2', text: '#991B1B' },
};

// ─── Helpers ───────────────────────────────────────────────
function unwrapData(result) {
  if (!result.success) return [];
  if (Array.isArray(result.data?.data)) return result.data.data;
  if (Array.isArray(result.data)) return result.data;
  return [];
}

const DialysisInventory = () => {
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();
  const [activeTab, setActiveTab] = useState('items');
  const [procurementSubTab, setProcurementSubTab] = useState('orders'); // 'orders' | 'deliveries'

  // ═══════════════════════════════════════════════════════
  //  ITEMS TAB
  // ═══════════════════════════════════════════════════════
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  // Create / Edit modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemEditMode, setItemEditMode] = useState(false);
  const [itemEditId, setItemEditId] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'DISPOSABLE',
    variant: '',
    unit: 'unit',
    reorder_level: 0,
  });
  const [itemFieldErrors, setItemFieldErrors] = useState({});
  const [itemErrorMsg, setItemErrorMsg] = useState('');

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    const result = await getInventoryItems();
    setItems(unwrapData(result));
    if (!result.success)
      showToast(result.data?.message || 'Failed to fetch items', 'error');
    setItemsLoading(false);
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'items') fetchItems();
  }, [activeTab, fetchItems]);

  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return items;
    const q = itemSearch.toLowerCase();
    return items.filter(
      (i) =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q)
    );
  }, [items, itemSearch]);

  const openItemAdd = () => {
    setItemForm({ name: '', category: 'DISPOSABLE', variant: '', unit: 'unit', reorder_level: 0 });
    setItemEditMode(false);
    setItemEditId(null);
    setItemFieldErrors({});
    setItemErrorMsg('');
    setIsItemModalOpen(true);
  };

  const openItemEdit = (item) => {
    setItemForm({
      name: item.name || '',
      category: item.category || 'DISPOSABLE',
      variant: item.variant || '',
      unit: item.unit || 'unit',
      reorder_level: item.reorder_level ?? 0,
    });
    setItemEditMode(true);
    setItemEditId(item.id);
    setItemFieldErrors({});
    setItemErrorMsg('');
    setIsItemModalOpen(true);
  };

  const handleItemSubmit = async () => {
    const errors = {};
    if (!itemForm.name.trim()) errors.name = 'Name is required';
    if (Object.keys(errors).length > 0) {
      setItemFieldErrors(errors);
      setItemErrorMsg('Please fill required fields');
      return;
    }

    let result;
    if (itemEditMode) {
      result = await updateInventoryItem(itemEditId, itemForm);
    } else {
      result = await createInventoryItem(itemForm);
    }

    if (result.success) {
      showToast(
        itemEditMode ? 'Item updated!' : 'Item created!',
        'success'
      );
      setIsItemModalOpen(false);
      fetchItems();
    } else {
      showToast(result.data?.message || 'Operation failed', 'error');
    }
  };

  const handleItemDelete = async (item) => {
    if (!window.confirm(`Delete item "${item.name}"?`)) return;
    const result = await deleteInventoryItem(item.id);
    if (result.success) {
      showToast('Item deleted', 'success');
      fetchItems();
    } else {
      showToast(result.data?.message || 'Delete failed', 'error');
    }
  };

  const itemColumns = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Name', type: 'text', width: '200px' },
    { key: 'category', label: 'Category', type: 'custom', width: '130px',
      render: (_r, v) => (
        <span style={{ backgroundColor: '#EDE9FE', color: '#5B21B6', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
          {v || '—'}
        </span>
      ),
    },
    { key: 'variant', label: 'Variant', type: 'text', width: '120px' },
    { key: 'unit', label: 'Unit', type: 'text', width: '80px' },
    { key: 'reorder_level', label: 'Reorder Lvl', type: 'text', width: '100px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '150px' },
  ];

  const itemTableData = useMemo(
    () => filteredItems.map((i) => ({ ...i, actions: i })),
    [filteredItems]
  );

  // ═══════════════════════════════════════════════════════
  //  STOCK TAB
  // ═══════════════════════════════════════════════════════
  const [stock, setStock] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockSearch, setStockSearch] = useState('');

  // Add stock modal
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalMode, setStockModalMode] = useState('add'); // 'add' | 'issue'
  const [stockForm, setStockForm] = useState({
    mode: 'add',
    supplier_id: '',
    items: [{ item_id: '', quantity: 1 }],
    location_id: '',
    quantity: '',
    batch_number: '',
    expiry_date: '',
    reason: '',
  });
  const [stockFieldErrors, setStockFieldErrors] = useState({});
  const [stockErrorMsg, setStockErrorMsg] = useState('');

  const fetchStock = useCallback(async () => {
    setStockLoading(true);
    const result = await getInventoryStock();
    setStock(unwrapData(result));
    if (!result.success)
      showToast(result.data?.message || 'Failed to fetch stock', 'error');
    setStockLoading(false);
  }, [showToast]);



  const filteredStock = useMemo(() => {
    if (!stockSearch.trim()) return stock;
    const q = stockSearch.toLowerCase();
    return stock.filter(
      (s) =>
        (s.item_name || '').toLowerCase().includes(q) ||
        (s.batch_number || '').toLowerCase().includes(q)
    );
  }, [stock, stockSearch]);

  const openStockModal = (mode) => {
    setStockModalMode(mode);
    if (mode === 'add') {
      setStockForm({
        supplier_id: '',
        items: [{ item_id: '', quantity: 1 }]
      });
    } else {
      setStockForm({ item_id: '', location_id: '', quantity: '', batch_number: '', expiry_date: '', reason: '' });
    }
    setStockFieldErrors({});
    setStockErrorMsg('');
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async () => {
    if (stockModalMode === 'add') {
      const errors = {};
      if (!stockForm.supplier_id) errors.supplier_id = 'Supplier is required';
      if (!stockForm.items || stockForm.items.length === 0) errors.items = 'Add at least one item';
      
      const hasInvalidItem = stockForm.items.some(i => !i.item_id || i.quantity <= 0);
      if (hasInvalidItem) errors.items = 'Ensure all items have a selection and quantity > 0';

      if (Object.keys(errors).length > 0) {
        setStockFieldErrors(errors);
        setStockErrorMsg('Please fill required fields');
        return;
      }

      // Create a restock request which marks it as 'ORDER_PLACED' or similar
      const result = await createRestockRequest({
        items: stockForm.items,
        organization_id: 1,
        clinic_id: 1,
        status: 'ORDER_PLACED'
      });

      if (result.success) {
        // If a PO was created, update it with the selected supplier
        if (result.data?.po_id) {
          await updateProcurementOrder(result.data.po_id, {
            supplier_id: stockForm.supplier_id,
            status: 'PENDING'
          });
        }
        showToast('Stock order placed successfully!', 'success');
        setIsStockModalOpen(false);
        fetchRestock(); // Refresh restock requests
        fetchPO(); // Refresh POs
        fetchStock(); // Refresh stock view
      } else {
        showToast(result.data?.message || 'Failed to place order', 'error');
      }
    } else {
      // ISSUE STOCK LOGIC
      const errors = {};
      if (!stockForm.item_id) errors.item_id = 'Item ID required';
      if (!stockForm.location_id) errors.location_id = 'Location ID required';
      if (!stockForm.quantity || Number(stockForm.quantity) <= 0)
        errors.quantity = 'Quantity must be > 0';

      if (Object.keys(errors).length > 0) {
        setStockFieldErrors(errors);
        setStockErrorMsg('Please fill required fields');
        return;
      }

      const payload = {
        item_id: Number(stockForm.item_id),
        location_id: Number(stockForm.location_id),
        quantity: Number(stockForm.quantity),
        reason: stockForm.reason || undefined,
      };

      const result = await issueInventoryStock(payload);

      if (result.success) {
        showToast('Stock issued!', 'success');
        setIsStockModalOpen(false);
        fetchStock();
      } else {
        showToast(result.data?.message || 'Operation failed', 'error');
      }
    }
  };

  const stockColumns = [
    { key: 'item_name', label: 'Item', type: 'text', width: '180px' },
    { key: 'category', label: 'Category', type: 'text', width: '120px' },
    { key: 'batch_number', label: 'Batch', type: 'text', width: '120px' },
    { key: 'location_id', label: 'Location', type: 'text', width: '90px' },
    {
      key: 'quantity',
      label: 'Qty',
      type: 'custom',
      width: '80px',
      render: (_r, v) => (
        <span style={{ fontWeight: 700, color: v <= 0 ? '#DC2626' : '#166534' }}>
          {v}
        </span>
      ),
    },
    {
      key: 'expiry_date',
      label: 'Expiry',
      type: 'custom',
      width: '110px',
      render: (_r, v) => {
        if (!v) return <span style={{ color: '#9CA3AF' }}>—</span>;
        const d = new Date(v);
        const isExpired = d < new Date();
        return (
          <span style={{ color: isExpired ? '#DC2626' : '#6B7280', fontWeight: isExpired ? 600 : 400 }}>
            {d.toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  // ═══════════════════════════════════════════════════════
  //  ALERTS TAB
  // ═══════════════════════════════════════════════════════
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertFilter, setAlertFilter] = useState('ACTIVE');

  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    const result = await getInventoryAlerts({
      params: { status: alertFilter },
    });
    setAlerts(unwrapData(result));
    if (!result.success)
      showToast(result.data?.message || 'Failed to fetch alerts', 'error');
    setAlertsLoading(false);
  }, [alertFilter, showToast]);

  useEffect(() => {
    if (activeTab === 'alerts') fetchAlerts();
  }, [activeTab, fetchAlerts]);

  const handleResolveAlert = async (alert) => {
    if (!window.confirm(`Resolve alert #${alert.id}?`)) return;
    const result = await resolveInventoryAlert(alert.id);
    if (result.success) {
      showToast('Alert resolved!', 'success');
      fetchAlerts();
    } else {
      showToast(result.data?.message || 'Failed to resolve', 'error');
    }
  };

  const alertColumns = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'item_id', label: 'Item ID', type: 'text', width: '80px' },
    {
      key: 'type',
      label: 'Type',
      type: 'custom',
      width: '120px',
      render: (_r, v) => {
        const c = ALERT_TYPE_COLORS[v] || { bg: '#F3F4F6', text: '#374151' };
        return (
          <span style={{ background: c.bg, color: c.text, padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
            {(v || '').replace(/_/g, ' ')}
          </span>
        );
      },
    },
    { key: 'message', label: 'Message', type: 'text', width: '260px' },
    {
      key: 'severity',
      label: 'Severity',
      type: 'custom',
      width: '100px',
      render: (_r, v) => {
        const c = SEVERITY_COLORS[v] || { bg: '#F3F4F6', text: '#374151' };
        return (
          <span style={{ background: c.bg, color: c.text, padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
            {v || '—'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      type: 'custom',
      width: '100px',
      render: (_r, v) => (
        <span
          style={{
            background: v === 'ACTIVE' ? '#FEF9C3' : '#DCFCE7',
            color: v === 'ACTIVE' ? '#854D0E' : '#166534',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      type: 'custom',
      width: '110px',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <button
            onClick={() => handleResolveAlert(row)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              background: '#DCFCE7',
              color: '#166534',
              cursor: 'pointer',
            }}
          >
            Resolve
          </button>
        ) : (
          <span style={{ color: '#9CA3AF', fontSize: '12px' }}>Resolved</span>
        ),
    },
  ];

  // ═══════════════════════════════════════════════════════
  //  DIALYZERS TAB
  // ═══════════════════════════════════════════════════════
  const [dialyzers, setDialyzers] = useState([]);
  const [dialyzersLoading, setDialyzersLoading] = useState(false);

  // Register modal
  const [isDialyzerModalOpen, setIsDialyzerModalOpen] = useState(false);
  const [dialyzerForm, setDialyzerForm] = useState({
    type: 'MULTI_USE',
    max_usage: 5,
    item_id: '',
    notes: '',
  });
  const [dialyzerFieldErrors, setDialyzerFieldErrors] = useState({});
  const [dialyzerErrorMsg, setDialyzerErrorMsg] = useState('');

  const fetchDialyzers = useCallback(async () => {
    setDialyzersLoading(true);
    const result = await getInventoryDialyzers();
    setDialyzers(unwrapData(result));
    if (!result.success)
      showToast(result.data?.message || 'Failed to fetch dialyzers', 'error');
    setDialyzersLoading(false);
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'dialyzers') fetchDialyzers();
  }, [activeTab, fetchDialyzers]);

  const handleDialyzerRegister = async () => {
    const errors = {};
    if (!dialyzerForm.type) errors.type = 'Type is required';
    if (Object.keys(errors).length > 0) {
      setDialyzerFieldErrors(errors);
      setDialyzerErrorMsg('Please fill required fields');
      return;
    }

    const result = await createInventoryDialyzer({
      type: dialyzerForm.type,
      max_usage: Number(dialyzerForm.max_usage) || 1,
      item_id: dialyzerForm.item_id ? Number(dialyzerForm.item_id) : undefined,
      notes: dialyzerForm.notes || undefined,
    });

    if (result.success) {
      showToast('Dialyzer registered!', 'success');
      setIsDialyzerModalOpen(false);
      fetchDialyzers();
    } else {
      showToast(result.data?.message || 'Failed to register', 'error');
    }
  };

  const handleDialyzerUse = async (dialyzer) => {
    if (!window.confirm(`Record usage for dialyzer #${dialyzer.id}?`)) return;
    const result = await recordDialyzerUsage(dialyzer.id);
    if (result.success) {
      showToast(
        `Usage recorded! (${result.data?.data?.usage_count || '?'}/${result.data?.data?.max_usage || '?'})`,
        'success'
      );
      fetchDialyzers();
    } else {
      showToast(result.data?.message || 'Failed to record usage', 'error');
    }
  };

  const dialyzerColumns = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'item_id', label: 'Item ID', type: 'text', width: '80px' },
    {
      key: 'type',
      label: 'Type',
      type: 'custom',
      width: '120px',
      render: (_r, v) => (
        <span style={{ background: v === 'MULTI_USE' ? '#DBEAFE' : '#F3F4F6', color: v === 'MULTI_USE' ? '#1E40AF' : '#374151', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
          {(v || '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'usage_count',
      label: 'Usage',
      type: 'custom',
      width: '100px',
      render: (row) => {
        const pct = row.max_usage ? (row.usage_count / row.max_usage) * 100 : 0;
        const color = pct >= 80 ? '#DC2626' : pct >= 50 ? '#EA580C' : '#16A34A';
        return (
          <span style={{ fontWeight: 700, color }}>
            {row.usage_count}/{row.max_usage}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      type: 'custom',
      width: '100px',
      render: (_r, v) => {
        const c = DIALYZER_STATUS_COLORS[v] || { bg: '#F3F4F6', text: '#374151' };
        return (
          <span style={{ background: c.bg, color: c.text, padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
            {v || '—'}
          </span>
        );
      },
    },
    { key: 'actions', label: '', type: 'custom', width: '120px', render: (row) => row.status === 'ACTIVE' ? ( <button onClick={() => handleDialyzerUse(row)} style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '6px', background: '#DBEAFE', color: '#1E40AF', cursor: 'pointer', }} > Record Use </button> ) : ( <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: 600 }}> Blocked </span> ), },
  ];

  // ═══════════════════════════════════════════════════════
  //  SUPPLIERS TAB
  // ═══════════════════════════════════════════════════════
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', contact_person: '', email: '', phone: '', address: '', gst_number: '' });
  const [supplierEditId, setSupplierEditId] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    const result = await getSuppliers();
    setSuppliers(unwrapData(result));
    setSuppliersLoading(false);
  }, []);

  const handleSupplierSubmit = async () => {
    if (!supplierForm.name) return showToast('Name is required', 'error');
    const result = supplierEditId ? await updateSupplier(supplierEditId, supplierForm) : await createSupplier({ ...supplierForm, organization_id: 1 });
    if (result.success) {
      showToast(supplierEditId ? 'Supplier updated' : 'Supplier created', 'success');
      setIsSupplierModalOpen(false);
      fetchSuppliers();
    } else showToast(result.data?.message || 'Error', 'error');
  };

  const supplierColumns = [
    { key: 'name', label: 'Name', type: 'text', width: '200px' },
    { key: 'contact_person', label: 'Contact', type: 'text', width: '150px' },
    { key: 'phone', label: 'Phone', type: 'text', width: '120px' },
    { key: 'email', label: 'Email', type: 'text', width: '180px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '100px' },
  ];

  // ═══════════════════════════════════════════════════════
  //  PROCUREMENT (PO) TAB
  // ═══════════════════════════════════════════════════════
  const [procurementOrders, setProcurementOrders] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poForm, setPoForm] = useState({ supplier_id: '', items: [] });

  const fetchPO = useCallback(async () => {
    setPoLoading(true);
    const result = await getProcurementOrders();
    setProcurementOrders(unwrapData(result));
    setPoLoading(false);
  }, []);

  const handlePoSubmit = async () => {
    if (!poForm.supplier_id) return showToast('Select supplier', 'error');
    const result = await updateProcurementOrder(poForm.id, { 
      supplier_id: poForm.supplier_id,
      expected_delivery_date: poForm.expected_delivery_date,
      status: 'PENDING'
    });
    if (result.success) {
      showToast('PO finalized and sent to supplier', 'success');
      setIsPoModalOpen(false);
      fetchPO();
      fetchDeliveries();
    } else showToast(result.data?.message || 'Error', 'error');
  };

  const poColumns = [
    { key: 'id', label: 'PO #', type: 'text', width: '80px' },
    { key: 'supplier_name', label: 'Supplier', type: 'text', width: '180px' },
    { key: 'order_date', label: 'Order Date', type: 'date', width: '110px' },
    { key: 'expected_delivery_date', label: 'Exp. Delivery', type: 'date', width: '110px' },
    { key: 'total_amount', label: 'Amount', type: 'text', width: '100px' },
    { key: 'status', label: 'Status', type: 'custom', width: '110px',
      render: (_r, v) => (
        <span style={{ background: v === 'COMPLETED' ? '#DCFCE7' : v === 'PARTIAL' ? '#DBEAFE' : '#FEF9C3', color: v === 'COMPLETED' ? '#166534' : v === 'PARTIAL' ? '#1E40AF' : '#854D0E', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
    { key: 'actions', label: '', type: 'custom', width: '130px',
      render: (row) => (
        <Box className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openPoDetails(row)}>View</Button>
          <Button size="sm" variant="ghost" onClick={() => downloadPO(row)}>PDF</Button>
        </Box>
      )
    }
  ];

  const [selectedPo, setSelectedPo] = useState(null);
  const [isPoDetailsOpen, setIsPoDetailsOpen] = useState(false);

  const openPoDetails = async (po) => {
    const res = await getProcurementOrderById(po.id);
    if (res.success) {
      setSelectedPo(res.data);
      setIsPoDetailsOpen(true);
    }
  };

  // ═══════════════════════════════════════════════════════
  //  DELIVERIES TAB
  // ═══════════════════════════════════════════════════════
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [isValidatingDelivery, setIsValidatingDelivery] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryItems, setDeliveryItems] = useState([]);

  const fetchDeliveries = useCallback(async () => {
    setDeliveriesLoading(true);
    const result = await getDeliveries();
    setDeliveries(unwrapData(result));
    setDeliveriesLoading(false);
  }, []);

  const openValidateDelivery = async (delivery) => {
    const res = await getDeliveryById(delivery.id);
    if (res.success) {
      setSelectedDelivery(res.data);
      setDeliveryItems(res.data.items || []);
      setIsValidatingDelivery(true);
    }
  };

  const handleValidateDeliverySubmit = async () => {
    const payload = {
      items: deliveryItems,
      supplier_invoice_no: selectedDelivery.supplier_invoice_no,
      payment_method: selectedDelivery.payment_method,
      payment_receipt: selectedDelivery.payment_receipt,
      notes: selectedDelivery.notes
    };

    const result = await validateDelivery(selectedDelivery.id, payload);
    if (result.success) {
      showToast(result.data?.message || 'Delivery processed', 'success');
      setIsValidatingDelivery(false);
      fetchDeliveries();
      fetchStock();
      fetchPO();
    } else showToast(result.data?.message || 'Error', 'error');
  };

  const deliveryColumns = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'procurement_order_id', label: 'PO #', type: 'text', width: '80px' },
    { key: 'delivered_at', label: 'Delivered At', type: 'date', width: '150px' },
    { key: 'supplier_invoice_no', label: 'Invoice', type: 'text', width: '120px' },
    { key: 'status', label: 'Status', type: 'custom', width: '120px',
      render: (_r, v) => (
        <span style={{ background: v === 'DELIVERED' ? '#DCFCE7' : '#FEF9C3', color: v === 'DELIVERED' ? '#166534' : '#854D0E', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
    { key: 'actions', label: '', type: 'custom', width: '120px',
      render: (row) => row.status !== 'DELIVERED' && (
        <Button size="sm" onClick={() => openValidateDelivery(row)}>Validate</Button>
      )
    }
  ];

  useEffect(() => {
    if (activeTab === 'suppliers') fetchSuppliers();
    if (activeTab === 'procurement') {
      fetchPO();
      fetchDeliveries();
    }
  }, [activeTab, fetchSuppliers, fetchPO, fetchDeliveries]);

  // ═══════════════════════════════════════════════════════
  //  RESTOCK TAB
  // ═══════════════════════════════════════════════════════
  const [restockRequests, setRestockRequests] = useState([]);
  const [restockLoading, setRestockLoading] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockForm, setRestockForm] = useState({ items: [] });

  const fetchRestock = useCallback(async () => {
    setRestockLoading(true);
    const res = await getRestockRequests();
    setRestockRequests(unwrapData(res));
    setRestockLoading(false);
  }, []);

  const handleRestockSubmit = async () => {
    if (!restockForm.items.length) return showToast('Add items', 'error');
    const res = await createRestockRequest({ ...restockForm, organization_id: 1, clinic_id: 1 });
    if (res.success) {
      showToast('Restock request submitted. Please finalize the auto-generated PO.', 'success');
      setIsRestockModalOpen(false);
      fetchRestock();
      
      // Open PO Finalization modal
      if (res.data?.po_id) {
        setPoForm({
          id: res.data.po_id,
          supplier_id: '',
          expected_delivery_date: '',
          items: [] // Not needed for update
        });
        setIsPoModalOpen(true);
      }
    } else showToast(res.data?.message || 'Error', 'error');
  };

  const restockColumns = [
    { key: 'id', label: 'Req #', type: 'text', width: '80px' },
    { key: 'status', label: 'Status', type: 'custom', width: '130px',
      render: (_r, v) => (
        <span style={{ background: v === 'ORDER_PLACED' ? '#DBEAFE' : '#FEF9C3', color: v === 'ORDER_PLACED' ? '#1E40AF' : '#854D0E', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
    { key: 'requested_at', label: 'Requested At', type: 'date', width: '150px' },
    { key: 'actions', label: '', type: 'custom', width: '120px',
      render: (row) => row.status === 'ORDER_PLACED' && row.delivery_status !== 'DELIVERED' && (
        <Button size="sm" variant="outline" onClick={() => openValidateDelivery({ id: row.delivery_id })}>Arrived</Button>
      )
    }
  ];

  const downloadPO = async (po) => {
    const res = await getProcurementOrderById(po.id);
    if (!res.success) return showToast('Failed to fetch PO details', 'error');
    const fullPo = res.data;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('PURCHASE ORDER', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`PO Number: ${fullPo.id}`, 20, 40);
    doc.text(`Date: ${new Date(fullPo.order_date).toLocaleDateString()}`, 20, 45);
    doc.text(`Supplier: ${fullPo.supplier_real_name || fullPo.supplier_name}`, 20, 50);
    
    const tableRows = fullPo.items.map(item => [
      item.item_name,
      item.quantity,
      item.unit,
      item.unit_price,
      item.total_amount
    ]);

    doc.autoTable({
      startY: 60,
      head: [['Item', 'Qty', 'Unit', 'Price', 'Total']],
      body: tableRows,
    });

    doc.save(`PO_${fullPo.id}.pdf`);
  };

  useEffect(() => {
    if (activeTab === 'restock') fetchRestock();
  }, [activeTab, fetchRestock]);

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStock();
      fetchItems();
      fetchSuppliers();
    }
  }, [activeTab, fetchStock, fetchItems, fetchSuppliers]);

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════

  const renderLoading = () => (
    <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
      <p style={{ color: '#6B7280' }}>Loading…</p>
    </div>
  );

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Inventory"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Inventory', active: true },
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

          {/* ─── ITEMS TAB ──────────────────────────────── */}
          {activeTab === 'items' && (
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
                    Total Items: <strong>{filteredItems.length}</strong>
                  </span>
                  <Input
                    type="text"
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    style={{ width: isMobile ? '100%' : '250px' }}
                  />
                </div>
                <Button variant="primary" onClick={openItemAdd}>
                  + Add Item
                </Button>
              </div>

              {itemsLoading ? (
                renderLoading()
              ) : (
                <UnifiedListTable
                  columns={itemColumns}
                  data={itemTableData}
                  onEdit={openItemEdit}
                  onDelete={handleItemDelete}
                  emptyMessage="No inventory items found"
                  displayMode="table"
                  rowsPerPage={10}
                />
              )}
            </div>
          )}

          {/* ─── STOCK TAB ──────────────────────────────── */}
          {activeTab === 'stock' && (
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
                    Stock Records: <strong>{filteredStock.length}</strong>
                  </span>
                  <Input
                    type="text"
                    placeholder="Search stock..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    style={{ width: isMobile ? '100%' : '250px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="primary" onClick={() => openStockModal('add')}>
                    + Add Stock
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openStockModal('issue')}
                    style={{ borderColor: '#EA580C', color: '#EA580C' }}
                  >
                    Issue Stock
                  </Button>
                </div>
              </div>

              {stockLoading ? (
                renderLoading()
              ) : (
                <UnifiedListTable
                  columns={stockColumns}
                  data={filteredStock}
                  emptyMessage="No stock records found"
                  displayMode="table"
                  rowsPerPage={10}
                />
              )}
            </div>
          )}

          {/* ─── ALERTS TAB ─────────────────────────────── */}
          {activeTab === 'alerts' && (
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
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  Alerts: <strong>{alerts.length}</strong>
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['ACTIVE', 'RESOLVED'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setAlertFilter(f)}
                      style={{
                        padding: '6px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: alertFilter === f ? '#004c6d' : '#D1D5DB',
                        borderRadius: '8px',
                        background: alertFilter === f ? '#004c6d' : 'white',
                        color: alertFilter === f ? 'white' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {alertsLoading ? (
                renderLoading()
              ) : (
                <UnifiedListTable
                  columns={alertColumns}
                  data={alerts}
                  emptyMessage={`No ${alertFilter.toLowerCase()} alerts`}
                  displayMode="table"
                  rowsPerPage={10}
                />
              )}
            </div>
          )}

          {/* ─── DIALYZERS TAB ──────────────────────────── */}
          {activeTab === 'dialyzers' && (
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
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  Dialyzers: <strong>{dialyzers.length}</strong>
                </span>
                <Button
                  variant="primary"
                  onClick={() => {
                    setDialyzerForm({ type: 'MULTI_USE', max_usage: 5, item_id: '', notes: '' });
                    setDialyzerFieldErrors({});
                    setDialyzerErrorMsg('');
                    setIsDialyzerModalOpen(true);
                  }}
                >
                  + Register Dialyzer
                </Button>
              </div>

              {dialyzersLoading ? (
                renderLoading()
              ) : (
                <UnifiedListTable
                  columns={dialyzerColumns}
                  data={dialyzers}
                  emptyMessage="No dialyzers registered"
                  displayMode="table"
                  rowsPerPage={10}
                />
              )}
            </div>
          )}

          {/* ─── SUPPLIERS TAB ──────────────────────────── */}
          {activeTab === 'suppliers' && (
            <div className="admin-card">
              <div className="admin-card__header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Total Suppliers: {suppliers.length}</span>
                <Button variant="primary" onClick={() => { setSupplierForm({ name: '', contact_person: '', email: '', phone: '', address: '', gst_number: '' }); setSupplierEditId(null); setIsSupplierModalOpen(true); }}>+ Add Supplier</Button>
              </div>
              {suppliersLoading ? renderLoading() : (
                <UnifiedListTable columns={supplierColumns} data={suppliers} onEdit={(s) => { setSupplierForm(s); setSupplierEditId(s.id); setIsSupplierModalOpen(true); }} emptyMessage="No suppliers found" displayMode="table" />
              )}
            </div>
          )}

          {/* ─── PROCUREMENT TAB (Merged PO + Deliveries) ─────── */}
          {activeTab === 'procurement' && (
            <div className="admin-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  borderBottom: '1px solid #F3F4F6',
                  paddingBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant={procurementSubTab === 'orders' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setProcurementSubTab('orders')}
                    style={{ borderRadius: '20px' }}
                  >
                    Purchase Orders ({procurementOrders.length})
                  </Button>
                  <Button
                    variant={procurementSubTab === 'deliveries' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setProcurementSubTab('deliveries')}
                    style={{ borderRadius: '20px' }}
                  >
                    Deliveries ({deliveries.length})
                  </Button>
                </div>
                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                  {procurementSubTab === 'orders' 
                    ? 'Track and manage supplier orders' 
                    : 'Validate incoming stock shipments'}
                </span>
              </div>

              {procurementSubTab === 'orders' ? (
                <>
                  {poLoading ? (
                    renderLoading()
                  ) : (
                    <UnifiedListTable
                      columns={poColumns}
                      data={procurementOrders}
                      emptyMessage="No procurement orders found"
                      displayMode="table"
                      rowsPerPage={10}
                    />
                  )}
                </>
              ) : (
                <>
                  {deliveriesLoading ? (
                    renderLoading()
                  ) : (
                    <UnifiedListTable
                      columns={deliveryColumns}
                      data={deliveries}
                      emptyMessage="No deliveries found"
                      displayMode="table"
                      rowsPerPage={10}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ═══ ITEM FORM MODAL ══════════════════════════ */}
        <FormModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          onSubmit={handleItemSubmit}
          title={itemEditMode ? 'Edit Item' : 'Add Item'}
          submitText={itemEditMode ? 'Update' : 'Create'}
          size="lg"
          errorMessage={itemErrorMsg}
          fieldErrors={itemFieldErrors}
          onFieldErrorClear={(f) =>
            setItemFieldErrors((prev) => ({ ...prev, [f]: undefined }))
          }
        >
          {({ getFieldProps, clearFieldError }) => (
            <>
              <FormControl isRequired isInvalid={getFieldProps('name').isInvalid}>
                <FormLabel>Item Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter item name"
                  value={itemForm.name}
                  {...getFieldProps('name')}
                  onChange={(e) => {
                    setItemForm((p) => ({ ...p, name: e.target.value }));
                    clearFieldError('name');
                  }}
                />
              </FormControl>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <select
                    value={itemForm.category}
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, category: e.target.value }))
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                    }}
                  >
                    <option value="DISPOSABLE">Disposable</option>
                    <option value="DIALYSIS">Dialysis</option>
                    <option value="LAB">Lab</option>
                  </select>
                </FormControl>

                <FormControl>
                  <FormLabel>Variant</FormLabel>
                  <Input
                    type="text"
                    placeholder="e.g. 500ml"
                    value={itemForm.variant}
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, variant: e.target.value }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Unit</FormLabel>
                  <Input
                    type="text"
                    placeholder="e.g. unit, ml, box"
                    value={itemForm.unit}
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, unit: e.target.value }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Reorder Level</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={itemForm.reorder_level}
                    onChange={(e) =>
                      setItemForm((p) => ({
                        ...p,
                        reorder_level: Number(e.target.value),
                      }))
                    }
                  />
                </FormControl>
              </Box>
            </>
          )}
        </FormModal>

        {/* ═══ STOCK FORM MODAL ═════════════════════════ */}
        <FormModal
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onSubmit={handleStockSubmit}
          title={stockModalMode === 'add' ? 'Add Stock' : 'Issue Stock'}
          submitText={stockModalMode === 'add' ? 'Add' : 'Issue'}
          size="lg"
          errorMessage={stockErrorMsg}
          fieldErrors={stockFieldErrors}
          onFieldErrorClear={(f) =>
            setStockFieldErrors((prev) => ({ ...prev, [f]: undefined }))
          }
        >
          {({ getFieldProps, clearFieldError }) => (
            <Box className="flex flex-col gap-4">
              {stockModalMode === 'add' ? (
                <>
                  <FormControl isRequired isInvalid={stockFieldErrors.supplier_id}>
                    <FormLabel>Select Supplier</FormLabel>
                    <select
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                      value={stockForm.supplier_id}
                      onChange={(e) => {
                        setStockForm(p => ({ ...p, supplier_id: e.target.value }));
                        setStockFieldErrors(p => ({ ...p, supplier_id: undefined }));
                      }}
                    >
                      <option value="">-- Choose Supplier --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </FormControl>

                  <Box className="mt-2">
                    <FormLabel className="mb-2">Items to Order</FormLabel>
                    {stockForm.items.map((item, idx) => (
                      <Box key={idx} className="flex gap-3 mb-3 items-start">
                        <Box style={{ flex: 3 }}>
                          <select
                            style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                            value={item.item_id}
                            onChange={(e) => {
                              const newItems = [...stockForm.items];
                              newItems[idx].item_id = e.target.value;
                              setStockForm(p => ({ ...p, items: newItems }));
                            }}
                          >
                            <option value="">Select Item</option>
                            {items.map(i => (
                              <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                            ))}
                          </select>
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...stockForm.items];
                              newItems[idx].quantity = Number(e.target.value);
                              setStockForm(p => ({ ...p, items: newItems }));
                            }}
                          />
                        </Box>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newItems = stockForm.items.filter((_, i) => i !== idx);
                            setStockForm(p => ({ ...p, items: newItems }));
                          }}
                          style={{ color: '#EF4444', marginTop: '4px' }}
                        >
                          ✕
                        </Button>
                      </Box>
                    ))}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setStockForm(p => ({ ...p, items: [...p.items, { item_id: '', quantity: 1 }] }))}
                      style={{ marginTop: '4px' }}
                    >
                      + Add Another Item
                    </Button>
                  </Box>
                </>
              ) : (
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormControl isRequired isInvalid={getFieldProps('item_id').isInvalid}>
                    <FormLabel>Item ID</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter item ID"
                      value={stockForm.item_id}
                      {...getFieldProps('item_id')}
                      onChange={(e) => {
                        setStockForm((p) => ({ ...p, item_id: e.target.value }));
                        clearFieldError('item_id');
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired isInvalid={getFieldProps('location_id').isInvalid}>
                    <FormLabel>Location ID</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter location ID"
                      value={stockForm.location_id}
                      {...getFieldProps('location_id')}
                      onChange={(e) => {
                        setStockForm((p) => ({ ...p, location_id: e.target.value }));
                        clearFieldError('location_id');
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired isInvalid={getFieldProps('quantity').isInvalid}>
                    <FormLabel>Quantity</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={stockForm.quantity}
                      {...getFieldProps('quantity')}
                      onChange={(e) => {
                        setStockForm((p) => ({ ...p, quantity: e.target.value }));
                        clearFieldError('quantity');
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Reason</FormLabel>
                    <Input
                      type="text"
                      placeholder="Optional reason"
                      value={stockForm.reason}
                      onChange={(e) =>
                        setStockForm((p) => ({ ...p, reason: e.target.value }))
                      }
                    />
                  </FormControl>
                </Box>
              )}
            </Box>
          )}
        </FormModal>

        {/* ═══ DIALYZER REGISTER MODAL ══════════════════ */}
        <FormModal
          isOpen={isDialyzerModalOpen}
          onClose={() => setIsDialyzerModalOpen(false)}
          onSubmit={handleDialyzerRegister}
          title="Register Dialyzer"
          submitText="Register"
          size="lg"
          errorMessage={dialyzerErrorMsg}
          fieldErrors={dialyzerFieldErrors}
          onFieldErrorClear={(f) =>
            setDialyzerFieldErrors((prev) => ({ ...prev, [f]: undefined }))
          }
        >
          {({ getFieldProps, clearFieldError }) => (
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormControl isRequired isInvalid={getFieldProps('type').isInvalid}>
                <FormLabel>Type</FormLabel>
                <select
                  value={dialyzerForm.type}
                  onChange={(e) => {
                    setDialyzerForm((p) => ({ ...p, type: e.target.value }));
                    clearFieldError('type');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                  }}
                >
                  <option value="MULTI_USE">Multi Use</option>
                  <option value="SINGLE_USE">Single Use</option>
                </select>
              </FormControl>

              <FormControl>
                <FormLabel>Max Usage</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={dialyzerForm.max_usage}
                  onChange={(e) =>
                    setDialyzerForm((p) => ({
                      ...p,
                      max_usage: e.target.value,
                    }))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Item ID (optional)</FormLabel>
                <Input
                  type="number"
                  placeholder="Link to inventory item"
                  value={dialyzerForm.item_id}
                  onChange={(e) =>
                    setDialyzerForm((p) => ({
                      ...p,
                      item_id: e.target.value,
                    }))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input
                  type="text"
                  placeholder="Optional notes"
                  value={dialyzerForm.notes}
                  onChange={(e) =>
                    setDialyzerForm((p) => ({
                      ...p,
                      notes: e.target.value,
                    }))
                  }
                />
              </FormControl>
            </Box>
          )}
        </FormModal>

        {/* ═══ SUPPLIER FORM MODAL ══════════════════════ */}
        <FormModal
          isOpen={isSupplierModalOpen}
          onClose={() => setIsSupplierModalOpen(false)}
          onSubmit={handleSupplierSubmit}
          title={supplierEditId ? 'Edit Supplier' : 'Add Supplier'}
          size="lg"
        >
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl isRequired>
              <FormLabel>Supplier Name</FormLabel>
              <Input value={supplierForm.name} onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})} />
            </FormControl>
            <FormControl>
              <FormLabel>Contact Person</FormLabel>
              <Input value={supplierForm.contact_person} onChange={(e) => setSupplierForm({...supplierForm, contact_person: e.target.value})} />
            </FormControl>
            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input value={supplierForm.phone} onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})} />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input value={supplierForm.email} onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})} />
            </FormControl>
            <FormControl className="md:col-span-2">
              <FormLabel>Address</FormLabel>
              <Textarea value={supplierForm.address} onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})} />
            </FormControl>
          </Box>
        </FormModal>

        {/* ═══ PO FINALIZATION MODAL ════════════════════ */}
        <FormModal
          isOpen={isPoModalOpen}
          onClose={() => setIsPoModalOpen(false)}
          onSubmit={handlePoSubmit}
          title="Finalize Procurement Order"
          size="md"
        >
          <Box className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">PO #{poForm.id} was created. Select a supplier to finalize.</p>
            <FormControl isRequired>
              <FormLabel>Select Supplier</FormLabel>
              <select 
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                value={poForm.supplier_id} 
                onChange={(e) => setPoForm({...poForm, supplier_id: e.target.value})}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FormControl>
            <FormControl>
              <FormLabel>Expected Delivery Date</FormLabel>
              <Input 
                type="date"
                value={poForm.expected_delivery_date}
                onChange={(e) => setPoForm({...poForm, expected_delivery_date: e.target.value})}
              />
            </FormControl>
          </Box>
        </FormModal>

        {/* ═══ VALIDATE DELIVERY MODAL ══════════════════ */}
        <FormModal
          isOpen={isValidatingDelivery}
          onClose={() => setIsValidatingDelivery(false)}
          onSubmit={handleValidateDeliverySubmit}
          title="Validate Delivery"
          size="xl"
        >
          <Box className="flex flex-col gap-4">
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormControl>
                <FormLabel>Supplier Invoice #</FormLabel>
                <Input 
                  value={selectedDelivery?.supplier_invoice_no || ''} 
                  onChange={(e) => setSelectedDelivery({...selectedDelivery, supplier_invoice_no: e.target.value})} 
                />
              </FormControl>
              <FormControl>
                <FormLabel>Payment Method</FormLabel>
                <select 
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                  value={selectedDelivery?.payment_method || ''}
                  onChange={(e) => setSelectedDelivery({...selectedDelivery, payment_method: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </FormControl>
              <FormControl>
                <FormLabel>Payment Receipt Ref</FormLabel>
                <Input 
                  value={selectedDelivery?.payment_receipt || ''}
                  onChange={(e) => setSelectedDelivery({...selectedDelivery, payment_receipt: e.target.value})}
                />
              </FormControl>
            </Box>

            <Box className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold mb-3">Item Verification</p>
              {deliveryItems.map((item, idx) => (
                <Box key={idx} className="bg-white p-3 mb-3 border rounded">
                  <p className="font-semibold">{item.item_name} ({item.ordered_quantity} ordered)</p>
                  <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <FormControl>
                      <FormLabel>Received Qty</FormLabel>
                      <Input 
                        type="number" 
                        value={item.delivered_quantity}
                        onChange={(e) => {
                          const newItems = [...deliveryItems];
                          newItems[idx].delivered_quantity = Number(e.target.value);
                          setDeliveryItems(newItems);
                        }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Batch #</FormLabel>
                      <Input 
                        value={item.batch_number || ''}
                        onChange={(e) => {
                          const newItems = [...deliveryItems];
                          newItems[idx].batch_number = e.target.value;
                          setDeliveryItems(newItems);
                        }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Expiry</FormLabel>
                      <Input 
                        type="date"
                        value={item.expiry_date || ''}
                        onChange={(e) => {
                          const newItems = [...deliveryItems];
                          newItems[idx].expiry_date = e.target.value;
                          setDeliveryItems(newItems);
                        }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Item Notes</FormLabel>
                      <Input 
                        placeholder="Condition..."
                        value={item.notes || ''}
                        onChange={(e) => {
                          const newItems = [...deliveryItems];
                          newItems[idx].notes = e.target.value;
                          setDeliveryItems(newItems);
                        }}
                      />
                    </FormControl>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box className="p-3 bg-blue-50 border border-blue-200 rounded">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Auto-fill all delivered quantities to match ordered
                      const newItems = deliveryItems.map(it => ({ ...it, delivered_quantity: it.ordered_quantity }));
                      setDeliveryItems(newItems);
                    }
                  }} 
                />
                <span className="font-semibold text-blue-800">Confirm all items delivered correctly as ordered?</span>
              </label>
              <p className="text-xs text-blue-600 mt-1 ml-6">Checking this will mark the delivery as DELIVERED and update stock.</p>
            </Box>
          </Box>
        </FormModal>

        {/* ═══ RESTOCK FORM MODAL ═══════════════════════ */}
        <FormModal
          isOpen={isRestockModalOpen}
          onClose={() => setIsRestockModalOpen(false)}
          onSubmit={handleRestockSubmit}
          title="Submit Restock Request"
          size="lg"
        >
          <Box className="flex flex-col gap-4">
            <Box>
              <FormLabel>Items Needed</FormLabel>
              {restockForm.items.map((item, idx) => (
                <Box key={idx} className="flex gap-2 mb-2">
                  <select 
                    style={{ flex: 2, padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={item.item_id}
                    onChange={(e) => {
                      const newItems = [...restockForm.items];
                      newItems[idx].item_id = e.target.value;
                      setRestockForm({...restockForm, items: newItems});
                    }}
                  >
                    <option value="">Select Item</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <Input 
                    type="number" 
                    placeholder="Qty" 
                    style={{ flex: 1 }}
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...restockForm.items];
                      newItems[idx].quantity = e.target.value;
                      setRestockForm({...restockForm, items: newItems});
                    }}
                  />
                  <Button variant="ghost" onClick={() => {
                    const newItems = restockForm.items.filter((_, i) => i !== idx);
                    setRestockForm({...restockForm, items: newItems});
                  }}>×</Button>
                </Box>
              ))}
              <Button size="sm" variant="outline" onClick={() => setRestockForm({...restockForm, items: [...restockForm.items, { item_id: '', quantity: 1 }]})}>+ Add Item</Button>
            </Box>
          </Box>
        </FormModal>

        {/* ═══ PO DETAILS MODAL ═════════════════════════ */}
        <FormModal
          isOpen={isPoDetailsOpen}
          onClose={() => setIsPoDetailsOpen(false)}
          title={`PO #${selectedPo?.id} Details`}
          submitText="Close"
          onSubmit={() => setIsPoDetailsOpen(false)}
          size="lg"
        >
          <Box className="flex flex-col gap-4">
            <Box className="grid grid-cols-2 gap-4">
              <p><strong>Supplier:</strong> {selectedPo?.supplier_real_name || selectedPo?.supplier_name}</p>
              <p><strong>Status:</strong> {selectedPo?.status}</p>
              <p><strong>Order Date:</strong> {selectedPo?.order_date ? new Date(selectedPo.order_date).toLocaleDateString() : '-'}</p>
              <p><strong>Exp. Delivery:</strong> {selectedPo?.expected_delivery_date ? new Date(selectedPo.expected_delivery_date).toLocaleDateString() : '-'}</p>
            </Box>
            <Box className="mt-4">
              <p className="mb-2" style={{ fontWeight: 600 }}>Ordered Items</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Item</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Quantity</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPo?.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '8px' }}>{item.item_name}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{item.quantity}</td>
                      <td style={{ padding: '8px' }}>{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            {selectedPo?.notes && (
              <Box className="mt-2 p-3 bg-gray-50 rounded">
                <p><strong>Notes:</strong> {selectedPo.notes}</p>
              </Box>
            )}
          </Box>
        </FormModal>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisInventory;
