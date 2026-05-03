import axiosInstance from '../helpers/axios/axiosInstance';
import { server_url } from '../constants/constants';

/**
 * @typedef {Object} InventoryItem
 * @property {number} id
 * @property {string} name
 * @property {string} category
 * @property {string|null} variant
 * @property {string} unit
 * @property {number} reorder_level
 * @property {string} created_at
 * @property {string} updated_at
 */

// --- Items ---

/**
 * Get all inventory items
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryItem[]}>}
 */
export async function getInventoryItems(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/items`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get details for a specific inventory item
 * @param {string|number} itemId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryItem}>}
 */
export async function getInventoryItemById(itemId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/items/${itemId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Create a new inventory item
 * @param {Object} payload 
 * @param {string} payload.name required
 * @param {string} [payload.category] default: DISPOSABLE
 * @param {string} [payload.variant]
 * @param {string} [payload.unit] default: unit
 * @param {number} [payload.reorder_level] default: 0
 * @param {number} [payload.reorder_quantity] default: 0
 * @param {string} [payload.item_type] default: MEDICINE
 * @param {string} [payload.risk_class] default: LOW
 * @param {string} [payload.schedule_class] default: NONE
 * @param {boolean} [payload.is_lasa] default: false
 * @param {boolean} [payload.high_alert] default: false
 * @param {boolean} [payload.lot_tracking_required] default: true
 * @param {number} [payload.clinic_id] default: 0
 * @param {string} [payload.code]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryItem}>}
 */
export async function createInventoryItem(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/items`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Update an inventory item
 * @param {string|number} itemId 
 * @param {Object} payload Any partial subset of creation body
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryItem}>}
 */
export async function updateInventoryItem(itemId, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/dt/items/${itemId}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Soft delete an inventory item
 * @param {string|number} itemId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {id: number, status: string}}>}
 */
export async function deleteInventoryItem(itemId, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/dt/items/${itemId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Stock ---

/**
 * @typedef {Object} InventoryStock
 * @property {number} id
 * @property {number} item_id
 * @property {string} item_name
 * @property {string} category
 * @property {number} batch_id
 * @property {string} batch_number
 * @property {number} location_id
 * @property {number} quantity
 * @property {string} expiry_date
 * @property {string} updated_at
 */

/**
 * Get all inventory stock across all locations
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryStock[]}>}
 */
export async function getInventoryStock(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/stock`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get stock by item ID across all locations
 * @param {string|number} itemId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryStock[]}>}
 */
export async function getStockByItemId(itemId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/stock/${itemId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get stock by location ID
 * @param {string|number} locationId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryStock[]}>}
 */
export async function getStockByLocationId(locationId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/stock/location/${locationId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Add / Receive stock
 * @param {Object} payload 
 * @param {number} payload.item_id required
 * @param {number} payload.location_id required
 * @param {number} payload.quantity required
 * @param {number} [payload.batch_id]
 * @param {string} [payload.batch_number]
 * @param {string} [payload.expiry_date]
 * @param {string} [payload.manufacture_date]
 * @param {string} [payload.reason]
 * @param {string} [payload.reference_id]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {transaction_id: number, item_id: number, batch_id: number, location_id: number, quantity: number}}>}
 */
export async function addInventoryStock(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/stock/add`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Consume / Issue stock
 * @param {Object} payload 
 * @param {number} payload.item_id required
 * @param {number} payload.location_id required
 * @param {number} payload.quantity required
 * @param {string} [payload.reason]
 * @param {string} [payload.reference_id]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {item_id: number, location_id: number, quantity: number, consumed_batches: any[]}}>}
 */
export async function issueInventoryStock(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/stock/issue`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Manually correct stock
 * @param {Object} payload 
 * @param {number} payload.item_id required
 * @param {number} payload.location_id required
 * @param {number} payload.quantity_delta required
 * @param {number} [payload.batch_id]
 * @param {string} [payload.batch_number]
 * @param {string} [payload.expiry_date]
 * @param {string} [payload.manufacture_date]
 * @param {string} [payload.reason]
 * @param {string} [payload.reference_id]
 * @param {string} [payload.adjustment_type]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {transaction_id: number, quantity_delta: number}}>}
 */
export async function adjustInventoryStock(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/stock/adjust`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Transactions ---

/**
 * @typedef {Object} InventoryTransaction
 * @property {number} id
 * @property {number} item_id
 * @property {string} type
 * @property {number} quantity
 * @property {string} unit
 * @property {number} from_location_id
 * @property {number} to_location_id
 * @property {number} location_id
 * @property {string} reference
 * @property {string} notes
 * @property {number} performed_by
 * @property {string} timestamp
 */

/**
 * Get inventory transactions
 * @param {Object} config Axios config, e.g. params: {limit: 100, offset: 0}
 * @returns {Promise<{success: boolean, data: InventoryTransaction[]}>}
 */
export async function getInventoryTransactions(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/transactions`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get single transaction by ID
 * @param {string|number} transactionId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryTransaction}>}
 */
export async function getInventoryTransactionById(transactionId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/transactions/${transactionId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Generic transaction builder
 * @param {Object} payload 
 * @param {string} payload.type IN | OUT | ADJUST
 * @param {number} payload.item_id
 * @param {number} payload.location_id
 * @param {number} [payload.quantity]
 * @param {number} [payload.quantity_delta]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function createInventoryTransaction(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/transactions`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Locations ---

/**
 * @typedef {Object} InventoryLocation
 * @property {number} id
 * @property {string} name
 * @property {string} type
 * @property {string} location_path
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * Get all inventory locations
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryLocation[]}>}
 */
export async function getInventoryLocations(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/locations`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Create new location
 * @param {Object} payload 
 * @param {string} payload.name required
 * @param {string} [payload.type] CLINIC | ROOM | STORAGE
 * @param {string} [payload.location_path]
 * @param {number} [payload.clinic_id]
 * @param {number} [payload.organization_id]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryLocation}>}
 */
export async function createInventoryLocation(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/locations`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get location by ID
 * @param {string|number} locationId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryLocation}>}
 */
export async function getInventoryLocationById(locationId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/locations/${locationId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Update location
 * @param {string|number} locationId 
 * @param {Object} payload 
 * @param {string} [payload.name]
 * @param {string} [payload.type]
 * @param {string} [payload.location_path]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryLocation}>}
 */
export async function updateInventoryLocation(locationId, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/dt/locations/${locationId}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Alerts ---

/**
 * @typedef {Object} InventoryAlert
 * @property {number} id
 * @property {number} item_id
 * @property {string} type LOW_STOCK | EXPIRY
 * @property {string} message
 * @property {string} status ACTIVE | RESOLVED
 * @property {string} severity
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} resolved_at
 * @property {number} resolved_by
 */

/**
 * Get active/resolved alerts
 * @param {Object} config Axios config, e.g. params: {status, type, item_id}
 * @returns {Promise<{success: boolean, data: InventoryAlert[]}>}
 */
export async function getInventoryAlerts(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/alerts`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get an alert by ID
 * @param {string|number} alertId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryAlert}>}
 */
export async function getInventoryAlertById(alertId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/alerts/${alertId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Mark alert as resolved
 * @param {string|number} alertId 
 * @param {Object} payload 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {id: number, status: string}}>}
 */
export async function resolveInventoryAlert(alertId, payload = {}, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/alerts/${alertId}/resolve`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Dialyzers ---

/**
 * @typedef {Object} Dialyzer
 * @property {number} id
 * @property {number} item_id
 * @property {string} type SINGLE_USE | MULTI_USE
 * @property {number} usage_count
 * @property {number} max_usage
 * @property {string} status ACTIVE | BLOCKED
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * Get dialyzers
 * @param {Object} config Axios config, e.g. params: {status}
 * @returns {Promise<{success: boolean, data: Dialyzer[]}>}
 */
export async function getInventoryDialyzers(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/dialyzers`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Register dialyzer
 * @param {Object} payload 
 * @param {string} payload.type SINGLE_USE | MULTI_USE required
 * @param {number} [payload.max_usage] default: 1
 * @param {number} [payload.item_id]
 * @param {string} [payload.notes]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Dialyzer}>}
 */
export async function createInventoryDialyzer(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/dialyzers`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Dialyzer details
 * @param {string|number} id 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Dialyzer}>}
 */
export async function getInventoryDialyzerById(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/dialyzers/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Record dialyzer usage
 * @param {string|number} id 
 * @param {Object} payload 
 * @param {string} [payload.notes]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {id: number, usage_count: number, max_usage: number, status: string}}>}
 */
export async function useInventoryDialyzer(id, payload = {}, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/dialyzers/${id}/use`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Dialyzer usage history
 * @param {string|number} id 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any[]}>}
 */
export async function getInventoryDialyzerUsage(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/dialyzers/${id}/usage`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Lab Items ---

/**
 * Get active lab items
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryItem[]}>}
 */
export async function getInventoryLabItems(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/lab-items`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Create lab item
 * @param {Object} payload Same fields as createInventoryItem
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: InventoryItem}>}
 */
export async function createInventoryLabItem(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/lab-items`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get lab items expiring within 7 days
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any[]}>}
 */
export async function getExpiringInventoryLabItems(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/lab-items/expiring`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Other Operations ---

/**
 * Add stock (legacy alias)
 * @param {Object} payload 
 * @param {number} payload.item_id required
 * @param {number} payload.location_id required
 * @param {number} payload.quantity required
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function receiveInventoryStock(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/receive`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Move stock
 * @param {Object} payload 
 * @param {number} payload.item_id required
 * @param {number} payload.source_location_id required
 * @param {number} payload.target_location_id required
 * @param {number} payload.quantity required
 * @param {string} [payload.reason]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {item_id: number, source_location_id: number, target_location_id: number, quantity: number, moved_batches: any[]}}>}
 */
export async function moveInventoryStock(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/move`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Adjust stock (legacy alias)
 * @param {Object} payload Same fields as adjustInventoryStock
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function legacyAdjustInventoryStock(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/adjust`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Dispense inventory to patient
 * @param {Object} payload 
 * @param {number} payload.patient_id required
 * @param {number} payload.item_id required
 * @param {number} payload.location_id required
 * @param {number} payload.quantity required
 * @param {string} [payload.reason]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function dispenseInventoryToPatient(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/dispense/patient`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Dispense inventory to department
 * @param {Object} payload 
 * @param {number} payload.department_id required
 * @param {number} payload.item_id required
 * @param {number} payload.location_id required
 * @param {number} payload.quantity required
 * @param {string} [payload.reason]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function dispenseInventoryToDepartment(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/dispense/department`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Physical stock count adjustment
 * @param {Object} payload 
 * @param {number} payload.item_id required
 * @param {number} payload.location_id required
 * @param {number} payload.batch_id required
 * @param {number} payload.physical_count required
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {system_count: number, physical_count: number, variance: number, adjustment: any}}>}
 */
export async function performInventoryCycleCount(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/cycle-count`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Suppliers ---

export async function getSuppliers(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/suppliers`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function createSupplier(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/suppliers`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateSupplier(id, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/dt/suppliers/${id}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Restock Requests ---

export async function getRestockRequests(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/restock`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function createRestockRequest(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/restock`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getRestockRequestById(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/restock/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Procurement Orders (PO) ---

export async function getProcurementOrders(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/po`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getProcurementOrderById(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/po/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function createProcurementOrder(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/po`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateProcurementOrder(id, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/dt/po/${id}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Deliveries ---

export async function getDeliveries(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/deliveries`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDeliveryById(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/deliveries/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function createDelivery(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/deliveries`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function validateDelivery(id, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/dt/deliveries/${id}/validate`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export default {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStock,
  getStockByItemId,
  getStockByLocationId,
  addInventoryStock,
  issueInventoryStock,
  adjustInventoryStock,
  getInventoryTransactions,
  getInventoryTransactionById,
  createInventoryTransaction,
  getInventoryLocations,
  createInventoryLocation,
  getInventoryLocationById,
  updateInventoryLocation,
  getInventoryAlerts,
  getInventoryAlertById,
  resolveInventoryAlert,
  getInventoryDialyzers,
  createInventoryDialyzer,
  getInventoryDialyzerById,
  useInventoryDialyzer,
  getInventoryDialyzerUsage,
  getInventoryLabItems,
  createInventoryLabItem,
  getExpiringInventoryLabItems,
  receiveInventoryStock,
  moveInventoryStock,
  legacyAdjustInventoryStock,
  dispenseInventoryToPatient,
  dispenseInventoryToDepartment,
  performInventoryCycleCount,
  getSuppliers,
  createSupplier,
  updateSupplier,
  getRestockRequests,
  createRestockRequest,
  getRestockRequestById,
  getProcurementOrders,
  getProcurementOrderById,
  createProcurementOrder,
  updateProcurementOrder,
  getDeliveries,
  getDeliveryById,
  createDelivery,
  validateDelivery,
};
