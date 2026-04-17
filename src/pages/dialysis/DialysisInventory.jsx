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
} from '../../ApiCalls/inventoryApis';

// ─── Tabs ──────────────────────────────────────────────────
const TABS = [
  { key: 'items', label: 'Items' },
  { key: 'stock', label: 'Stock' },
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
    item_id: '',
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

  useEffect(() => {
    if (activeTab === 'stock') fetchStock();
  }, [activeTab, fetchStock]);

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
    setStockForm({ item_id: '', location_id: '', quantity: '', batch_number: '', expiry_date: '', reason: '' });
    setStockFieldErrors({});
    setStockErrorMsg('');
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async () => {
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
      batch_number: stockForm.batch_number || undefined,
      expiry_date: stockForm.expiry_date || undefined,
      reason: stockForm.reason || undefined,
    };

    const result =
      stockModalMode === 'add'
        ? await addInventoryStock(payload)
        : await issueInventoryStock(payload);

    if (result.success) {
      showToast(
        stockModalMode === 'add' ? 'Stock added!' : 'Stock issued!',
        'success'
      );
      setIsStockModalOpen(false);
      fetchStock();
    } else {
      showToast(result.data?.message || 'Operation failed', 'error');
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
    {
      key: 'actions',
      label: '',
      type: 'custom',
      width: '120px',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <button
            onClick={() => handleDialyzerUse(row)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              background: '#DBEAFE',
              color: '#1E40AF',
              cursor: 'pointer',
            }}
          >
            Record Use
          </button>
        ) : (
          <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
            Blocked
          </span>
        ),
    },
  ];

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

              {stockModalMode === 'add' && (
                <>
                  <FormControl>
                    <FormLabel>Batch Number</FormLabel>
                    <Input
                      type="text"
                      placeholder="Optional"
                      value={stockForm.batch_number}
                      onChange={(e) =>
                        setStockForm((p) => ({
                          ...p,
                          batch_number: e.target.value,
                        }))
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Expiry Date</FormLabel>
                    <Input
                      type="date"
                      value={stockForm.expiry_date}
                      onChange={(e) =>
                        setStockForm((p) => ({
                          ...p,
                          expiry_date: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </>
              )}

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

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisInventory;
