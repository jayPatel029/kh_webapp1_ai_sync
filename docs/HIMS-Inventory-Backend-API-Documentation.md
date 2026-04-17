# HIMS-Inventory Backend API Documentation

This documentation covers all the REST API endpoints available in the backend system, their request payloads, query parameters, expected responses, and authentication requirements. 

## Base URL
Assuming the server runs locally on port 3000, the base URL is: `http://localhost:3000/api` (as mounted by the top-level app router, generally, but adjust if your app mounts it at root `/`).

**Authentication Notes:**
Endpoints marked with **[Auth Required]** require a valid JWT token in the `Authorization` header:
`Authorization: Bearer <valid_jwt_token>`

---

## 1. Authentication Endpoints

### 1.1 User Login
- **Endpoint:** `POST /auth/login` (Also aliased as `POST /app/login`)
- **Description:** Authenticates a user with username and password and returns a JWT.
- **Request Body:**
  ```json
  {
    "username": "string (required)",
    "password": "string (required)"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "string (JWT token)",
      "user": {
        "id": "number",
        "username": "string"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing username or password
  - `401 Unauthorized`: Invalid credentials
  - `500 Internal Server Error`: Database error

---

## 2. Inventory Endpoints
*All `/inventory/*` endpoints are **[Auth Required]**.*

### 2.1 Items Management

#### 2.1.1 List Items
- **Endpoint:** `GET /inventory/items`
- **Query Parameters:**
  - `include_inactive` (boolean, optional): Include soft-deleted items (default `false`).
  - `category` (string, optional): Filter by category (e.g., `DISPOSABLE`, `DIALYSIS`, `LAB`).
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "string",
        "category": "DISPOSABLE",
        "variant": "string|null",
        "unit": "string",
        "reorder_level": 10,
        "created_at": "ISO8601",
        "updated_at": "ISO8601"
      }
    ]
  }
  ```

#### 2.1.2 Get Item Details
- **Endpoint:** `GET /inventory/items/:itemId`
- **Success Response (200 OK):** Item details object.

#### 2.1.3 Create Item
- **Endpoint:** `POST /inventory/items`
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "category": "string (optional, default: DISPOSABLE)",
    "variant": "string (optional)",
    "unit": "string (optional, default: unit)",
    "reorder_level": 0,
    "item_type": "string (optional, default: MEDICINE)",
    "risk_class": "string (optional, default: LOW)",
    "schedule_class": "string (optional, default: NONE)",
    "is_lasa": false,
    "high_alert": false,
    "lot_tracking_required": true,
    "clinic_id": 0,
    "code": "string (optional)"
  }
  ```

#### 2.1.4 Update Item
- **Endpoint:** `PUT /inventory/items/:itemId`
- **Request Body:** Any partial subset of the creation body.

#### 2.1.5 Delete Item
- **Endpoint:** `DELETE /inventory/items/:itemId`
- **Description:** Soft-deletes the item (sets status to deleted).

---

### 2.2 Stock Management

#### 2.2.1 List All Stock
- **Endpoint:** `GET /inventory/stock`
- **Success Response (200 OK):** Returns a list of all stock records in all locations.

#### 2.2.2 Get Stock by Item ID
- **Endpoint:** `GET /inventory/stock/:itemId`

#### 2.2.3 Get Stock by Location
- **Endpoint:** `GET /inventory/stock/location/:locationId`

#### 2.2.4 Add Stock
- **Endpoint:** `POST /inventory/stock/add`
- **Description:** Adds stock of a particular item to a location.
- **Request Body:**
  ```json
  {
    "item_id": "number (required)",
    "location_id": "number (required)",
    "quantity": "number (required, > 0)",
    "batch_number": "string (optional)",
    "expiry_date": "ISO8601 date (optional)",
    "manufacture_date": "ISO8601 date (optional)",
    "reason": "string (optional)"
  }
  ```

#### 2.2.5 Issue Stock
- **Endpoint:** `POST /inventory/stock/issue`
- **Request Body:**
  ```json
  {
    "item_id": "number (required)",
    "location_id": "number (required)",
    "quantity": "number (required, > 0)",
    "reason": "string (optional)"
  }
  ```
- **Description:** Depletes stock from a location (using FEFO/FIFO).

#### 2.2.6 Adjust Stock
- **Endpoint:** `POST /inventory/stock/adjust`
- **Request Body:**
  ```json
  {
    "item_id": "number (required)",
    "location_id": "number (required)",
    "quantity_delta": "number (required, positive or negative)",
    "batch_id": "number (optional)",
    "reason": "string (optional)"
  }
  ```

---

### 2.3 Transactions

#### 2.3.1 List Transactions
- **Endpoint:** `GET /inventory/transactions`
- **Query Parameters:** `limit` (100), `offset` (0).

#### 2.3.2 Get Transaction Details
- **Endpoint:** `GET /inventory/transactions/:transactionId`

#### 2.3.3 Create Universal Transaction
- **Endpoint:** `POST /inventory/transactions`
- **Description:** Wraps add/update/adjust actions. Needs `type` ("IN", "OUT", "ADJUST").

---

### 2.4 Locations Management

#### 2.4.1 List Locations
- **Endpoint:** `GET /inventory/locations`

#### 2.4.2 Create Location
- **Endpoint:** `POST /inventory/locations`
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "type": "string (optional, CLINIC|ROOM|STORAGE)",
    "location_path": "string (optional)",
    "clinic_id": 0
  }
  ```

#### 2.4.3 Get / Update Location
- **Endpoint:** `GET /inventory/locations/:locationId`
- **Endpoint:** `PUT /inventory/locations/:locationId`

---

### 2.5 Alerts (Low Stock / Expiring)

#### 2.5.1 List Alerts
- **Endpoint:** `GET /inventory/alerts`
- **Query Parameters:** `status` (ACTIVE/RESOLVED), `type` (LOW_STOCK/EXPIRY), `item_id`.

#### 2.5.2 Get Alert / Resolve Alert
- **Endpoint:** `GET /inventory/alerts/:alertId`
- **Endpoint:** `POST /inventory/alerts/:alertId/resolve`

---

### 2.6 Multi-use Dialyzers

#### 2.6.1 List Dialyzers
- **Endpoint:** `GET /inventory/dialyzers`
- **Query Parameters:** `status` (ACTIVE|BLOCKED)

#### 2.6.2 Register Dialyzer
- **Endpoint:** `POST /inventory/dialyzers`
- **Request Body:**
  ```json
  {
    "type": "string (required, SINGLE_USE|MULTI_USE)",
    "max_usage": "number (default 1)",
    "item_id": "number (optional)"
  }
  ```

#### 2.6.3 Record Dialyzer Usage
- **Endpoint:** `POST /inventory/dialyzers/:id/use`

#### 2.6.4 Dialyzer Details & Usage History
- **Endpoint:** `GET /inventory/dialyzers/:id`
- **Endpoint:** `GET /inventory/dialyzers/:id/usage`

---

### 2.7 Lab Items
- **List/Create:** `GET /inventory/lab-items`, `POST /inventory/lab-items`
- **Expiring List:** `GET /inventory/lab-items/expiring`

---

### 2.8 Legacy Inventory Aliases
*(These act similarly to the main stock/issue stock endpoints)*
- `POST /inventory/receive`
- `POST /inventory/move` (Expects `source_location_id`, `target_location_id`, `quantity`, `item_id`)
- `POST /inventory/adjust`
- `POST /inventory/dispense/patient` (Expects `patient_id`)
- `POST /inventory/dispense/department` (Expects `department_id`)
- `POST /inventory/cycle-count` (Expects `physical_count`, auto-detects variance)

---

## 3. Dialysis, Clinic & Bed Operations

### 3.1 Clinics
- **List Clinics:** `GET /clinics`
- **Get Clinic Details:** `GET /clinics/:clinicId`
- **Get Beds in Clinic:** `GET /clinics/:clinicId/beds`
- **Get Appointments in Clinic:** `GET /clinics/:clinicId/appointments`

### 3.2 Beds
- **List All Beds:** `GET /beds/all`
- **By Status:** `GET /beds/status/:status`
- **Get Bed:** `GET /beds/:bedId`
- **Assign Bed:** `POST /beds/assign`
  ```json
  { "bed_id": 1, "patient_id": 2 }
  ```
- **Unassign Bed:** `POST /beds/unassign`
  ```json
  { "bed_id": 1 }
  ```
- **Transfer Bed:** `POST /beds/transfer`
  ```json
  { "from_bed_id": 1, "to_bed_id": 2, "patient_id": 3, "requested_by": 4 }
  ```
- **Quarantine Bed:** `POST /beds/:bedId/quarantine`
  ```json
  { "quarantine_status": true, "reason": "Investigation", "estimated_duration": "ISO8601" }
  ```
- **Update Bed Status:** `PUT /beds/:bedId/status`
  ```json
  { "status": "MAINTENANCE", "notes": "" }
  ```

### 3.3 Appointments
- **List:** `GET /appointments`
- **Create:** `POST /appointments`
  ```json
  { 
    "clinic_id": 1, "patient_id": 2, "appointment_date": "YYYY-MM-DD", 
    "start_time": "HH:MM:SS", "end_time": "HH:MM:SS" 
  }
  ```
- **Get/Update/Cancel:** 
  - `GET /appointments/:appointmentId`
  - `PUT /appointments/:appointmentId` (Can update `status`, `reason`, `patient_ailments`)
  - `DELETE /appointments/:appointmentId`
- **Get Details (incl. relations):** `GET /appointments/:appointmentId/details`

### 3.4 Shifts & Staff
- **List Shifts:** `GET /shifts`
- **Create Shift:** `POST /shifts`
- **Get Shift:** `GET /shifts/:shiftId`
- **Assign Staff to Shift:** `POST /staff/:staffId/assign-shift`
  ```json
  { "shift_id": 1, "center_id": 2, "start_date": "ISO8601" }
  ```
- **Get Staff Schedule:** `GET /staff/:staffId/schedule`

### 3.5 Dialysis Sessions

#### 3.5.1 Start Session
- **Endpoint:** `POST /dialysis/sessions/start`
- **Request Body:**
  ```json
  {
    "patient_id": "number (required)",
    "bed_id": "number (required)",
    "appointment_id": "number (optional)"
  }
  ```

#### 3.5.2 Session Status & Pre-readings
- **Get Session:** `GET /dialysis/sessions/:sessionId`
- **Record Pre-Readings:** `POST /dialysis/sessions/:sessionId/pre-readings`
  ```json
  {
    "weight_kg": 65.5,
    "systolic_bp_mm_hg": 120,
    "diastolic_bp_mm_hg": 80,
    "notes": "string",
    "labs": {} 
  }
  ```

#### 3.5.3 Real-Time Session Operations (During Dialysis)
- **Ingest Readings (Telemetry):** `POST /dialysis/sessions/:sessionId/readings`
  - Supports single object or bulk readings payload.
  ```json
  {
    "readings": [
      { "timestamp": "ISO8601", "machine_temp": 37, "blood_flow": 200 }
    ]
  }
  ```
- **Fetch Readings:** `GET /dialysis/sessions/:sessionId/readings`
- **Patch Planned Parameters:** `PATCH /dialysis/sessions/:sessionId/parameters`
  ```json
  { "parameters": { "target_weight_loss": 2.5 } }
  ```
- **Control Session Status:** `POST /dialysis/sessions/:sessionId/actions`
  ```json
  { "action": "pause|resume|stop|abort", "reason": "Patient requested" }
  ```
  *Allowed actions map to `PAUSED`, `RUNNING`, `COMPLETED`, `ABORTED` respectively.*

---

## 4. Authoritative endpoint reference

This appendix expands every endpoint with what it represents, what the front-end must send, and what the backend sends back. When a route is a `GET`, the response is always JSON and normally includes `success` plus a `data` payload. When a route is a `POST`/`PUT`/`PATCH`/`DELETE`, the response usually includes `success`, a human-readable `message`, and sometimes a returned object such as an inserted ID.

### 4.1 Shared response contract

Most endpoints follow one of these shapes:

```json
{
  "success": true,
  "data": {},
  "error_code": null,
  "message": ""
}
```

or

```json
{
  "success": false,
  "data": null,
  "error_code": "ERR_CODE",
  "message": "Why the request failed"
}
```

What this means for the front-end:
- `success` is the first thing to check.
- `data` is the actual payload for successful GETs and some POSTs.
- `message` is suitable for toast notifications and inline messages.
- `error_code` is meant for programmatic handling like retry, login redirect, or conflict resolution.

---

### 4.2 Authentication APIs

#### `POST /auth/login`
Represents the normal login flow for backend users.

- **Required fields:** `username`, `password`
- **Optional fields:** none
- **What the backend does:**
  - Looks up user rows by `username`.
  - Compares the submitted password with stored bcrypt hashes.
  - Returns a JWT token if one match succeeds.
- **Success response:**
  - `success: true`
  - `data.token`: JWT string to send in later `Authorization: Bearer <token>` headers
  - `data.user.id`: authenticated user id
  - `data.user.username`: authenticated username
- **Failure responses:**
  - `400`: missing username or password
  - `401`: invalid credentials
  - `500`: unexpected server/database error

#### `POST /app/login`
Represents the same login behavior as `/auth/login`, exposed under the `/app` namespace.

- **Required fields:** `username`, `password`
- **Optional fields:** none
- **Success / failure responses:** same as `/auth/login`

What the front-end should expect:
- Both login routes return the same structure.
- The token is the key result; without it, all auth-protected routes will reject the request.

---

### 4.3 Inventory APIs

All inventory routes require authentication, and the write routes additionally require a role that is allowed to modify inventory data.

#### `GET /inventory/items`
Represents the active item master list.

- **Required query params:** none
- **Optional query params:**
  - `include_inactive` — `true` to include soft-deleted items
  - `category` — filter by `DISPOSABLE`, `DIALYSIS`, or `LAB`
- **What comes back:** an array of items, each with:
  - `id`
  - `name`
  - `category`
  - `variant`
  - `unit`
  - `reorder_level`
  - `created_at`
  - `updated_at`
- **What it represents:** the master item catalog used everywhere else in inventory.
- **Front-end expectations:** use this for selectors, item pickers, and item detail views.

#### `GET /inventory/items/:itemId`
Represents the detail view for one inventory item.

- **Required path param:** `itemId`
- **Optional fields:** none
- **What comes back:** one item object with the same fields as the list endpoint.
- **If not found:** `404 ERR_ITEM_NOT_FOUND`
- **What it represents:** the canonical definition of a medical or inventory item.

#### `POST /inventory/items`
Represents creation of a new item master record.

- **Required fields:** `name`
- **Optional fields:**
  - `category` — defaults to `DISPOSABLE`
  - `variant`
  - `unit` — defaults to `unit`
  - `reorder_level` — defaults to `0`
  - `reorder_quantity` — defaults to `0`
  - `item_type` — defaults to `MEDICINE`
  - `risk_class` — defaults to `LOW`
  - `schedule_class` — defaults to `NONE`
  - `is_lasa` — defaults to `false`
  - `high_alert` — defaults to `false`
  - `lot_tracking_required` — defaults to `true`
  - `clinic_id` — defaults to `0`
  - `code`
- **What comes back:**
  - `201 Created`
  - `data` contains the created item object
  - `message: "Item created successfully"`
- **What it represents:** creating a new catalog entry that can later be stocked and issued.
- **Front-end expectations:** validate `name` before sending; if you provide category, it must be one of the allowed categories.

#### `PUT /inventory/items/:itemId`
Represents updates to an existing item.

- **Required path param:** `itemId`
- **Required body fields:** none — this is a partial update
- **Optional body fields:**
  - `name`
  - `category`
  - `variant`
  - `unit`
  - `reorder_level`
  - `reorder_quantity`
  - `item_type`
  - `risk_class`
  - `schedule_class`
  - `is_lasa`
  - `high_alert`
  - `lot_tracking_required`
- **What comes back:** updated item object
- **If nothing valid is sent:** `400 No valid fields provided for update`
- **What it represents:** modifying the item metadata without creating a new item.

#### `DELETE /inventory/items/:itemId`
Represents soft deletion of an item.

- **Required path param:** `itemId`
- **What comes back:**
  - `success: true`
  - `data: { id, status: 'deleted' }`
  - `message: "Item deleted successfully"`
- **What it represents:** the item is deactivated, not physically removed.

#### `GET /inventory/stock`
Represents the complete stock ledger view across all items and locations.

- **Required query params:** none
- **Optional query params:** none
- **What comes back:** array of stock rows with:
  - `id`
  - `item_id`
  - `item_name`
  - `category`
  - `batch_id`
  - `batch_number`
  - `location_id`
  - `quantity`
  - `expiry_date`
  - `updated_at`
- **What it represents:** current stock positions, not transaction history.

#### `GET /inventory/stock/:itemId`
Represents stock rows for one item across all locations.

- **Required path param:** `itemId`
- **What comes back:** same stock shape as above, filtered by item
- **If item does not exist:** `404 ERR_ITEM_NOT_FOUND`
- **What it represents:** the on-hand quantity split by batch and location for a single item.

#### `GET /inventory/stock/location/:locationId`
Represents stock rows for one location.

- **Required path param:** `locationId`
- **What comes back:** same stock shape as above, filtered by location
- **What it represents:** what is physically available in a room, clinic, storage area, or ward.

#### `POST /inventory/stock/add`
Represents receiving or adding stock into inventory.

- **Required fields:** `item_id`, `location_id`, `quantity`
- **Optional fields:**
  - `batch_id`
  - `batch_number`
  - `expiry_date`
  - `manufacture_date`
  - `reason`
  - `reference_id`
- **What comes back:**
  - `201 Created`
  - `data.transaction_id`
  - `data.item_id`
  - `data.batch_id`
  - `data.location_id`
  - `data.quantity`
  - `message: "Stock added successfully"`
- **What it represents:** receiving stock from purchase, return, transfer-in, or similar sources.
- **Front-end expectations:** quantity must be greater than zero; item and location must already exist.

#### `POST /inventory/stock/issue`
Represents consuming stock from a location using FEFO.

- **Required fields:** `item_id`, `location_id`, `quantity`
- **Optional fields:** `reason`, `reference_id`
- **What comes back:**
  - `201 Created`
  - `data.item_id`
  - `data.location_id`
  - `data.quantity`
  - `data.consumed_batches[]` with batch-level deductions
  - `message: "Stock issued successfully"`
- **What it represents:** stock leaving inventory for use in wards, procedures, or services.
- **Front-end expectations:** show a warning if the requested quantity exceeds what is available.

#### `POST /inventory/stock/adjust`
Represents a manual inventory correction.

- **Required fields:** `item_id`, `location_id`, `quantity_delta`
- **Optional fields:**
  - `batch_id`
  - `batch_number`
  - `expiry_date`
  - `manufacture_date`
  - `reason`
  - `reference_id`
  - `adjustment_type`
- **What comes back:**
  - `201 Created`
  - `data.transaction_id`
  - `data.quantity_delta`
  - `message: "Stock adjusted successfully"`
- **What it represents:** manual corrections for shrinkage, gain, damage, audit correction, or physical count differences.

#### `GET /inventory/transactions`
Represents the inventory transaction history.

- **Required query params:** none
- **Optional query params:**
  - `limit` — defaults to `100`, max `500`
  - `offset` — defaults to `0`
- **What comes back:** array of transaction objects with:
  - `id`
  - `item_id`
  - `type`
  - `quantity`
  - `unit`
  - `from_location_id`
  - `to_location_id`
  - `location_id`
  - `reference`
  - `notes`
  - `performed_by`
  - `timestamp`
- **What it represents:** the audit trail of stock movements, not the current stock balance.

#### `GET /inventory/transactions/:transactionId`
Represents one transaction row in detail.

- **Required path param:** `transactionId`
- **What comes back:** one transaction object with the fields above
- **If not found:** `404 ERR_INVALID_TRANSACTION`
- **What it represents:** the exact record of a stock action.

#### `POST /inventory/transactions`
Represents a generic transaction builder.

- **Required field:** `type`
- **Allowed values for `type`:** `IN`, `OUT`, `ADJUST`
- **Required body fields by type:**
  - `IN`: `item_id`, `location_id`, `quantity`
  - `OUT`: `item_id`, `location_id`, `quantity`
  - `ADJUST`: `item_id`, `location_id`, `quantity_delta`
- **Optional fields:** same as the underlying stock operations (`batch_id`, `batch_number`, `reason`, `reference_id`, etc.)
- **What comes back:**
  - `201 Created`
  - `data` with the result of the matching core stock operation
  - `message: "Transaction created successfully"`
- **What it represents:** a single entry point for the main stock actions.

#### `GET /inventory/locations`
Represents the location master list.

- **Required query params:** none
- **Optional query params:** none
- **What comes back:** array of location objects with:
  - `id`
  - `name`
  - `type`
  - `location_path`
  - `created_at`
  - `updated_at`
- **What it represents:** clinics, rooms, and storage places used for stock placement.

#### `POST /inventory/locations`
Represents creating a new location record.

- **Required fields:** `name`
- **Optional fields:**
  - `type` — defaults to `STORAGE`
  - `location_path`
  - `organization_id` / `organizationId`
  - `clinic_id` / `clinicId`
- **What comes back:**
  - `201 Created`
  - `data` with the created location object
  - `message: "Location created successfully"`
- **What it represents:** a physical or logical place where stock can live.

#### `GET /inventory/locations/:locationId`
Represents a single location record.

- **Required path param:** `locationId`
- **What comes back:** one location object
- **If not found:** `404 ERR_INVALID_TRANSACTION`
- **What it represents:** the place itself, not the stock inside it.

#### `PUT /inventory/locations/:locationId`
Represents editing location metadata.

- **Required path param:** `locationId`
- **Required body fields:** none
- **Optional body fields:** `name`, `type`, `location_path`
- **What comes back:** updated location object
- **If nothing valid is sent:** `400 No valid fields provided for update`

#### `GET /inventory/alerts`
Represents the active and resolved alert list.

- **Required query params:** none
- **Optional query params:**
  - `status`
  - `type`
  - `item_id` / `itemId`
- **What comes back:** array of alerts with:
  - `id`
  - `item_id`
  - `type`
  - `message`
  - `status`
  - `severity`
  - `created_at`
  - `updated_at`
  - `resolved_at`
  - `resolved_by`
- **What it represents:** inventory warnings such as low stock and impending expiry.

#### `GET /inventory/alerts/:alertId`
Represents a single alert.

- **Required path param:** `alertId`
- **What comes back:** one alert object
- **If not found:** `404 ERR_INVALID_TRANSACTION`

#### `POST /inventory/alerts/:alertId/resolve`
Represents marking an alert as resolved.

- **Required path param:** `alertId`
- **Required body fields:** none
- **Optional body fields:** none
- **What comes back:**
  - `200 OK`
  - `data: { id, status: 'RESOLVED' }`
  - `message: "Alert resolved successfully"`
- **What it represents:** clearing an alert after the issue has been addressed.

#### `GET /inventory/dialyzers`
Represents the dialyzer catalog and usage state.

- **Required query params:** none
- **Optional query params:** `status`
- **What comes back:** array of dialyzer objects with:
  - `id`
  - `item_id`
  - `type`
  - `usage_count`
  - `max_usage`
  - `status`
  - `created_at`
  - `updated_at`
- **What it represents:** the reusable or single-use dialyzer asset register.

#### `POST /inventory/dialyzers`
Represents creation of a dialyzer record.

- **Required fields:** `type`
- **Allowed `type` values:** `SINGLE_USE`, `MULTI_USE`
- **Optional fields:**
  - `max_usage` — defaults to `1`
  - `item_id`
  - `notes`
- **What comes back:**
  - `201 Created`
  - `data` with the created dialyzer object
  - `message: "Dialyzer created successfully"`
- **What it represents:** a tracked dialyzer instance and its lifecycle limit.

#### `GET /inventory/dialyzers/:id`
Represents a single dialyzer record.

- **Required path param:** `id`
- **What comes back:** one dialyzer object
- **If not found:** `404 Dialyzer not found`

#### `POST /inventory/dialyzers/:id/use`
Represents recording one use of a dialyzer.

- **Required path param:** `id`
- **Required body fields:** none
- **Optional body fields:** `notes`
- **What comes back:**
  - `200 OK`
  - `data.id`
  - `data.usage_count`
  - `data.max_usage`
  - `data.status`
  - `message: "Dialyzer usage recorded successfully"`
- **What it represents:** incrementing usage and blocking the dialyzer when the limit is reached.
- **Failure behavior:** returns `400 ERR_DIALYZER_LIMIT_REACHED` when usage is exhausted.

#### `GET /inventory/dialyzers/:id/usage`
Represents the dialyzer usage log.

- **Required path param:** `id`
- **What comes back:** array of usage log rows with:
  - `id`
  - `dialyzer_id`
  - `used_by`
  - `usage_count_after`
  - `notes`
  - `used_at`
- **What it represents:** the audit trail of every time the dialyzer was used.

#### `GET /inventory/lab-items`
Represents the active lab item subset from the item master.

- **Required query params:** none
- **Optional query params:** none
- **What comes back:** array of item objects where `category = LAB`
- **What it represents:** lab consumables and other lab-specific stock items.

#### `POST /inventory/lab-items`
Represents creation of a lab item.

- **Required fields:** `name`
- **Optional fields:** same item creation fields as `/inventory/items`
- **What comes back:**
  - `201 Created`
  - `data` with the created item object
  - `message: "Lab item created successfully"`
- **What it represents:** a lab-specific item master entry automatically forced into the `LAB` category.

#### `GET /inventory/lab-items/expiring`
Represents the lab items that are expiring within 7 days and still have stock on hand.

- **Required query params:** none
- **Optional query params:** none
- **What comes back:** array of objects with:
  - `item_id`
  - `item_name`
  - `category`
  - `batch_id`
  - `batch_number`
  - `expiry_date`
  - `location_id`
  - `quantity`
  - `updated_at`
- **What it represents:** a short-term expiry watchlist for lab inventory.

#### `POST /inventory/receive`
Represents the legacy alias for adding stock.

- **Required fields:** same as `POST /inventory/stock/add`
- **Optional fields:** same as `POST /inventory/stock/add`
- **What comes back:** same response as `POST /inventory/stock/add`
- **What it represents:** backward-compatible stock receiving.

#### `POST /inventory/move`
Represents moving stock from one location to another.

- **Required fields:**
  - `item_id`
  - `source_location_id`
  - `target_location_id`
  - `quantity`
- **Optional fields:** `reason`
- **What comes back:**
  - `200 OK`
  - `data.item_id`
  - `data.source_location_id`
  - `data.target_location_id`
  - `data.quantity`
  - `data.moved_batches[]`
  - `message: "Stock moved successfully"`
- **What it represents:** transfer between storage or care locations without consuming the stock.

#### `POST /inventory/adjust`
Represents the legacy alias for the stock adjustment endpoint.

- **Required fields:** same as `POST /inventory/stock/adjust`
- **Optional fields:** same as `POST /inventory/stock/adjust`
- **What comes back:** same response as `POST /inventory/stock/adjust`

#### `POST /inventory/dispense/patient`
Represents dispensing stock to an individual patient.

- **Required fields:** `patient_id`, `item_id`, `location_id`, `quantity`
- **Optional fields:** `reason`
- **What comes back:**
  - `201 Created`
  - `data` with the same shape as an issue/consume operation
  - `message: "Stock dispensed to patient successfully"`
- **What it represents:** medication or supply leaving inventory for a patient-specific use case.

#### `POST /inventory/dispense/department`
Represents dispensing stock to a department.

- **Required fields:** `department_id`, `item_id`, `location_id`, `quantity`
- **Optional fields:** `reason`
- **What comes back:**
  - `201 Created`
  - `data` with the same shape as an issue/consume operation
  - `message: "Stock dispensed to department successfully"`
- **What it represents:** stock leaving inventory for a clinical department rather than a single patient.

#### `POST /inventory/cycle-count`
Represents a physical stock count and automatic variance correction.

- **Required fields:** `item_id`, `location_id`, `batch_id`, `physical_count`
- **Optional fields:** none
- **What comes back:**
  - `200 OK`
  - `data.system_count`
  - `data.physical_count`
  - `data.variance`
  - `data.adjustment`
  - `message: "Cycle count recorded successfully"`
- **What it represents:** a warehouse-style stock verification action.

---

### 4.4 Dialysis, clinic, bed, appointment, shift, and session APIs

The dialysis module returns raw database rows for many `GET` routes, so the front-end should treat these as full record objects and render the fields it knows from the database schema.

#### `GET /clinics`
Represents the clinic master list.

- **Required query params:** none
- **Optional query params:** none
- **What comes back:** array of raw `clinic` table rows
- **What it represents:** the parent clinic sites in the system.

#### `GET /clinics/:clinicId`
Represents one clinic record.

- **Required path param:** `clinicId`
- **What comes back:** one raw `clinic` row
- **If not found:** `404 NOT_FOUND` with `Clinic not found`

#### `GET /clinics/:clinicId/beds`
Represents all dialysis beds in a clinic.

- **Required path param:** `clinicId`
- **What comes back:** array of raw `dialysis_bed` rows
- **What it represents:** the bed inventory within one clinic.

#### `GET /clinics/:clinicId/appointments`
Represents all appointments belonging to one clinic.

- **Required path param:** `clinicId`
- **What comes back:** array of raw `appointment` rows

#### `GET /beds/all`
Represents every dialysis bed across the system.

- **Required query params:** none
- **What comes back:** array of raw `dialysis_bed` rows

#### `GET /beds/status/:status`
Represents a filtered bed list by status.

- **Required path param:** `status`
- **What comes back:** array of raw `dialysis_bed` rows filtered by status
- **What it represents:** occupancy, maintenance, or other operational groupings.

#### `GET /beds/:bedId`
Represents a single bed record.

- **Required path param:** `bedId`
- **What comes back:** one raw `dialysis_bed` row
- **If not found:** `404 NOT_FOUND` with `Bed not found`

#### `POST /beds/assign`
Represents assigning a patient to a bed.

- **Required fields:** `bed_id`, `patient_id`
- **Optional fields:** `actor_id`
- **What comes back:**
  - `success: true`
  - `message: "Bed assigned successfully"`
- **What it represents:** updating the bed to occupied by a patient.
- **Important validation rules:**
  - bed must exist
  - bed must be empty
  - patient must exist
  - infectious patients require quarantine beds
  - non-infectious patients cannot be placed into quarantine beds

#### `POST /beds/unassign`
Represents clearing a patient from a bed.

- **Required fields:** `bed_id`
- **Optional fields:** none
- **What comes back:** `message: "Bed unassigned successfully"`
- **What it represents:** making the bed empty again.

#### `POST /beds/:bedId/quarantine`
Represents turning quarantine rules on or off for one bed.

- **Required path param:** `bedId`
- **Required fields:** `quarantine_status`
- **Optional fields:** `reason`, `estimated_duration`
- **What comes back:** `message: "Bed quarantine status updated successfully"`
- **What it represents:** marking a bed as a quarantine bed for infectious control.

#### `PUT /beds/:bedId/status`
Represents a bed operational status update.

- **Required path param:** `bedId`
- **Required fields:** `status`
- **Optional fields:** `notes`
- **What comes back:** `message: "Bed status updated successfully"`
- **What it represents:** lifecycle state changes such as `EMPTY`, `OCCUPIED`, or `MAINTENANCE`.

#### `POST /beds/assignments/date-range`
Represents a placeholder or stub endpoint for date-range assignment retrieval.

- **Required fields:** `date_from`, `date_to`
- **Optional fields:** none
- **What comes back:** `{ "message": "getBedAssignments" }`
- **What it represents:** currently not implemented beyond a placeholder response.

#### `POST /beds/transfer`
Represents moving a patient from one bed to another.

- **Required fields:** `from_bed_id`, `to_bed_id`, `patient_id`, `requested_by`
- **Optional fields:** `reason`, `requested_at`, `approved_by`
- **What comes back:** `message: "Transfer completed successfully"`
- **What it represents:** an atomic transfer that updates both beds and writes a transfer record.
- **Important validation rules:**
  - source bed must contain the patient
  - destination bed must exist and be empty
  - infectious patients must move to quarantine beds
  - non-infectious patients cannot move into quarantine beds
  - cross-clinic transfers require `approved_by`

#### `GET /appointments`
Represents all appointments.

- **Required query params:** none
- **What comes back:** array of raw `appointment` rows
- **What it represents:** the scheduling queue for dialysis and clinic workflows.

#### `POST /appointments`
Represents appointment creation.

- **Required fields:**
  - `clinic_id`
  - `patient_id`
  - `appointment_date`
- **Optional fields:**
  - `organization_id` / `organizationId` / `organization`
  - `primary_doctor_id` / `primaryDoctorId`
  - `appointment_type` / `appointmentType`
  - `start_time` / `startTime`
  - `end_time` / `endTime`
  - `reason`
  - `patient_ailments` / `patientAilments`
  - `status` — defaults to `SCHEDULED`
  - `created_by` / `createdBy`
- **What comes back:**
  - `success: true`
  - `message: "Appointment created successfully"`
  - `data: { id }`
- **What it represents:** scheduling a patient into a clinic time slot.

#### `GET /appointments/:appointmentId`
Represents one appointment record.

- **Required path param:** `appointmentId`
- **What comes back:** one raw `appointment` row
- **If not found:** `404 NOT_FOUND` with `Appointment not found`

#### `PUT /appointments/:appointmentId`
Represents appointment updates.

- **Required path param:** `appointmentId`
- **Required body fields:** none
- **Optional fields:** `status`, `reason`, `patient_ailments`
- **What comes back:** `message: "Appointment updated successfully"`
- **What it represents:** changing appointment status or notes without re-creating the appointment.

#### `DELETE /appointments/:appointmentId`
Represents cancelling an appointment.

- **Required path param:** `appointmentId`
- **Required body fields:** none
- **Optional fields:** none
- **What comes back:** `message: "Appointment cancelled successfully"`
- **What it represents:** marking the appointment as cancelled.

#### `GET /appointments/:id/details`
Represents the appointment detail endpoint.

- **Required path param:** `id` or `appointmentId`
- **What comes back:** one raw `appointment` row
- **If not found:** `404 NOT_FOUND` with `Appointment not found`

#### `GET /shifts`
Represents all shifts in the system.

- **Required query params:** none
- **What comes back:** array of raw `shifts` rows

#### `POST /shifts`
Represents creating a shift definition.

- **Required fields:**
  - `clinic_id`
  - `shift_name` or `name`
  - `time_start` or `start_time` or `startTime`
  - `time_end` or `end_time` or `endTime`
- **Optional fields:** none beyond those aliases
- **What comes back:**
  - `success: true`
  - `shift_id`
  - `message: "Shift created successfully"`
- **What it represents:** a time window for staffing a clinic.

#### `GET /shifts/:shiftId`
Represents one shift record.

- **Required path param:** `shiftId`
- **What comes back:** one raw `shifts` row
- **If not found:** `404 NOT_FOUND` with `Shift not found`

#### `POST /staff/:staffId/assign-shift`
Represents assigning one staff member to a shift.

- **Required path param:** `staffId`
- **Required body fields:** `shift_id`
- **Optional fields:** `center_id`, `start_date`, `end_date`, `on_duty`
- **What comes back:**
  - `success: true`
  - `assignment_id`
  - `message: "Shift assigned successfully"`
- **What it represents:** staffing coverage for a specific shift window.

#### `GET /staff/:staffId/schedule`
Represents all assignments for a staff member.

- **Required path param:** `staffId`
- **What comes back:** array of raw `staff_assignments` rows

#### `POST /dialysis/sessions/start`
Represents the start of a dialysis session.

- **Required fields:** `patient_id`, `bed_id`
- **Optional fields:** `appointment_id`
- **What comes back:**
  - `success: true`
  - `session_id`
  - `message: "Session started successfully"`
- **What it represents:** a session record with `state = RUNNING` and `started_at` set to current time.

#### `GET /dialysis/sessions/:sessionId`
Represents a single dialysis session record.

- **Required path param:** `sessionId`
- **What comes back:** one raw `dialysis_sessions` row
- **If not found:** `404 NOT_FOUND` with `Session not found`

#### `POST /dialysis/sessions/:sessionId/pre-readings`
Represents pre-dialysis measurements before treatment begins.

- **Required path param:** `sessionId`
- **Required body fields:** none strictly enforced by controller, but the UI should send at least one useful measurement
- **Optional fields:**
  - `weight_kg`
  - `systolic_bp_mm_hg`
  - `diastolic_bp_mm_hg`
  - `labs`
  - `access_assessment`
  - `notes`
- **What comes back:** `message: "Pre-readings updated successfully"`
- **What it represents:** baseline clinical observations and pre-treatment data.

#### `POST /dialysis/sessions/:sessionId/readings`
Represents telemetry/reading ingestion during dialysis.

- **Required path param:** `sessionId`
- **Required body fields:** none strictly enforced
- **Optional body fields:**
  - `timestamp`
  - `reading` (single reading object)
  - `readings` (array of reading objects)
  - `reading_json`
- **What comes back when bulk sending:** `message: "Inserted N readings"`
- **What comes back when single sending:** `reading_id` and `message: "Readings ingested successfully"`
- **What it represents:** live machine or monitoring data attached to a session.
- **Front-end expectations:** send an array for batching when possible; send one reading object when posting a single measurement.

#### `GET /dialysis/sessions/:sessionId/readings`
Represents all readings captured for a session.

- **Required path param:** `sessionId`
- **What comes back:** array of raw `dialysis_readings` rows ordered by timestamp
- **What it represents:** the session telemetry timeline.

#### `PATCH /dialysis/sessions/:sessionId/parameters`
Represents updating the planned treatment parameters for a session.

- **Required path param:** `sessionId`
- **Required body fields:** none strictly enforced
- **Optional body fields:** `parameters` or `planned_parameters`
- **What comes back:** `message: "Parameters updated successfully"`
- **What it represents:** the target settings or treatment plan for the session.

#### `POST /dialysis/sessions/:sessionId/actions`
Represents changing the state of a running session.

- **Required path param:** `sessionId`
- **Required body fields:** `action` or `state`
- **Optional body fields:** `reason`
- **Allowed `action` values:** `pause`, `resume`, `stop`, `abort`Just like role role.
- **Mapped states:** `PAUSED`, `RUNNING`, `COMPLETED`, `ABORTED`
- **What comes back:**
  - `success: true`
  - `message: "Session status updated"`
  - `state`
- **What it represents:** pause/resume/complete/abort control for the dialysis session lifecycle.

---

## 5. Front-end implementation notes

- Treat `GET` endpoints as data loaders and expect complete record objects back.
- Treat `POST` endpoints as action endpoints and refresh dependent lists after success.
- For write actions, validate required fields in the UI before sending the request.
- For conflict-related routes such as bed assign/transfer, expect a `409` and show the user a meaningful resolution path.
- For session telemetry, batch `readings` whenever possible to reduce network chatter.
- For inventory, always handle `quantity`, `quantity_delta`, and `physical_count` carefully because those drive actual stock changes.
