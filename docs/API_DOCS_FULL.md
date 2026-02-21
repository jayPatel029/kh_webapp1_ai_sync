# Kifayti API — Complete API Documentation

Total endpoints documented: **276**

## Modules

- adminPatient (3 endpoints)
- ailment (6 endpoints)
- ailmentPatient (1 endpoints)
- alarmsRouter (8 endpoints)
- alerts (25 endpoints)
- app_apis (44 endpoints)
- auth (4 endpoints)
- chatRouter (7 endpoints)
- comments (5 endpoints)
- contactus (4 endpoints)
- dailyAlerts (3 endpoints)
- dataUpload (2 endpoints)
- dietdetails (4 endpoints)
- doctorAnalytics (5 endpoints)
- doctorPatient (3 endpoints)
- doctors (9 endpoints)
- graphReadingDialysis (5 endpoints)
- graphReadings (10 endpoints)
- index (1 endpoints)
- labreport (16 endpoints)
- Languages (4 endpoints)
- mail (2 endpoints)
- manageparameters (1 endpoints)
- moduleRoutes (5 endpoints)
- notifs (1 endpoints)
- patient (18 endpoints)
- patientdatarouter (7 endpoints)
- prescription (4 endpoints)
- questions (8 endpoints)
- readings_table (12 endpoints)
- requisition (5 endpoints)
- roles (7 endpoints)
- SortAlerts (4 endpoints)
- teleconsultation (2 endpoints)
- tempRoutes (7 endpoints)
- userRange (6 endpoints)
- userRangeDialysis (2 endpoints)
- userResponses (2 endpoints)
- users (14 endpoints)

## Endpoint Details

### adminPatient

#### POST /api/adminPatient/addAdmin/{id}

- **Name:** POST /api/adminPatient/addAdmin/:id
- **Auth:** bearer
- **Handler:** addAdminToPatient
- **Route File:** adminPatient.js
- **Description:** Handler: addAdminToPatient Route File: adminPatient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/adminPatient/addAdmin/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/adminPatient/deleteAdmin/{id}

- **Name:** DELETE /api/adminPatient/deleteAdmin/:id
- **Auth:** bearer
- **Handler:** deleteAssignedAdmin
- **Route File:** adminPatient.js
- **Description:** Handler: deleteAssignedAdmin Route File: adminPatient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/adminPatient/deleteAdmin/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/adminPatient/getAdmin/{id}

- **Name:** GET /api/adminPatient/getAdmin/:id
- **Auth:** bearer
- **Handler:** getAdminData
- **Route File:** adminPatient.js
- **Description:** Handler: getAdminData Route File: adminPatient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/adminPatient/getAdmin/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### ailment

#### GET /api/ailment

- **Name:** GET /api/ailment/
- **Auth:** bearer
- **Handler:** getAilments
- **Route File:** ailment.js
- **Description:** Handler: getAilments Route File: ailment.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/ailment'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/ailment/{lang}

- **Name:** GET /api/ailment/:lang
- **Auth:** bearer
- **Handler:** getAilmentsByLanguage
- **Route File:** ailment.js
- **Description:** Handler: getAilmentsByLanguage Route File: ailment.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - lang: `<<lang>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/ailment/{lang}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/ailment/addAilment

- **Name:** POST /api/ailment/addAilment
- **Auth:** bearer
- **Handler:** addAilment
- **Route File:** ailment.js
- **Description:** Handler: addAilment Route File: ailment.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/ailment/addAilment'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/ailment/deleteAilment/{id}

- **Name:** DELETE /api/ailment/deleteAilment/:id
- **Auth:** bearer
- **Handler:** deleteAilment
- **Route File:** ailment.js
- **Description:** Handler: deleteAilment Route File: ailment.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/ailment/deleteAilment/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/ailment/getAilmentByName/{name}

- **Name:** GET /api/ailment/getAilmentByName/:name
- **Auth:** bearer
- **Handler:** getAilmentbyName
- **Route File:** ailment.js
- **Description:** Handler: getAilmentbyName Route File: ailment.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - name: `<<name>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/ailment/getAilmentByName/{name}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/ailment/updateAilment/{id}

- **Name:** PUT /api/ailment/updateAilment/:id
- **Auth:** bearer
- **Handler:** updateAilment
- **Route File:** ailment.js
- **Description:** Handler: updateAilment Route File: ailment.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/ailment/updateAilment/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### ailmentPatient

#### GET /api/ailmentPatient/{id}

- **Name:** GET /api/ailmentPatient/:id
- **Auth:** bearer
- **Handler:** fetchAilmentId
- **Route File:** ailmentPatient.js
- **Description:** Handler: fetchAilmentId Route File: ailmentPatient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/ailmentPatient/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### alarmsRouter

#### GET /api/alarmsRouter

- **Name:** GET /api/alarmsRouter/
- **Auth:** bearer
- **Handler:** getAllAlarms
- **Route File:** alarmsRouter.js
- **Description:** Handler: getAllAlarms Route File: alarmsRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/alarmsRouter'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alarmsRouter

- **Name:** POST /api/alarmsRouter/
- **Auth:** bearer
- **Handler:** insertAlarm
- **Route File:** alarmsRouter.js
- **Description:** Handler: insertAlarm Route File: alarmsRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alarmsRouter'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/alarmsRouter/{id}

- **Name:** DELETE /api/alarmsRouter/:id
- **Auth:** bearer
- **Handler:** deleteAlarm
- **Route File:** alarmsRouter.js
- **Description:** Handler: deleteAlarm Route File: alarmsRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/alarmsRouter/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alarmsRouter/{id}

- **Name:** PUT /api/alarmsRouter/:id
- **Auth:** bearer
- **Handler:** updateAlarm
- **Route File:** alarmsRouter.js
- **Description:** Handler: updateAlarm Route File: alarmsRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alarmsRouter/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alarmsRouter/answerAlarm

- **Name:** POST /api/alarmsRouter/answerAlarm
- **Auth:** bearer
- **Handler:** answerAlarm
- **Route File:** alarmsRouter.js
- **Description:** Handler: answerAlarm Route File: alarmsRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alarmsRouter/answerAlarm'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/alarmsRouter/byId/{id}

- **Name:** GET /api/alarmsRouter/byId/:id
- **Auth:** bearer
- **Handler:** getAlarmbyId
- **Route File:** alarmsRouter.js
- **Description:** Handler: getAlarmbyId Route File: alarmsRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/alarmsRouter/byId/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/alarmsRouter/byPatientId/{id}

- **Name:** GET /api/alarmsRouter/byPatientId/:id
- **Auth:** bearer
- **Handler:** getAlarmbyPatientId
- **Route File:** alarmsRouter.js
- **Description:** Handler: getAlarmbyPatientId Route File: alarmsRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/alarmsRouter/byPatientId/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alarmsRouter/updateReason/{id}

- **Name:** PUT /api/alarmsRouter/updateReason/:id
- **Auth:** bearer
- **Handler:** updateReason
- **Route File:** alarmsRouter.js
- **Description:** Handler: updateReason Route File: alarmsRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alarmsRouter/updateReason/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### alerts

#### GET /api/alerts

- **Name:** GET /api/alerts/
- **Auth:** bearer
- **Handler:** getAlerts
- **Route File:** alerts.js
- **Description:** Handler: getAlerts Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/alerts'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alerts/approveAlert

- **Name:** PUT /api/alerts/approveAlert
- **Auth:** bearer
- **Handler:** apporoveAlert
- **Route File:** alerts.js
- **Description:** Handler: apporoveAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alerts/approveAlert'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alerts/approveAllAlerts

- **Name:** PUT /api/alerts/approveAllAlerts
- **Auth:** bearer
- **Handler:** approveAllAlerts
- **Route File:** alerts.js
- **Description:** Handler: approveAllAlerts Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alerts/approveAllAlerts'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alerts/approveOrDisapprovePrescription

- **Name:** PUT /api/alerts/approveOrDisapprovePrescription
- **Auth:** bearer
- **Handler:** approveOrDisapprovePrescription
- **Route File:** alerts.js
- **Description:** Handler: approveOrDisapprovePrescription Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alerts/approveOrDisapprovePrescription'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/alerts/byCategory

- **Name:** GET /api/alerts/byCategory
- **Auth:** bearer
- **Handler:** getAlertbyCategory
- **Route File:** alerts.js
- **Description:** Handler: getAlertbyCategory Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/alerts/byCategory'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/alerts/byId/{id}

- **Name:** GET /api/alerts/byId/:id
- **Auth:** bearer
- **Handler:** getAlertbyId
- **Route File:** alerts.js
- **Description:** Handler: getAlertbyId Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/alerts/byId/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/alerts/byType/{type}

- **Name:** GET /api/alerts/byType/:type
- **Auth:** bearer
- **Handler:** getAlertbyType
- **Route File:** alerts.js
- **Description:** Handler: getAlertbyType Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - type: `<<type>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/alerts/byType/{type}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/changeInProgram

- **Name:** POST /api/alerts/changeInProgram
- **Auth:** bearer
- **Handler:** createChangeInProgramAlert
- **Route File:** alerts.js
- **Description:** Handler: createChangeInProgramAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/changeInProgram'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/contactUs

- **Name:** POST /api/alerts/contactUs
- **Auth:** bearer
- **Handler:** createContactUsAlert
- **Route File:** alerts.js
- **Description:** Handler: createContactUsAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/contactUs'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/alerts/dailyAlerts

- **Name:** GET /api/alerts/dailyAlerts
- **Auth:** bearer
- **Handler:** canRecieveUpdates
- **Route File:** alerts.js
- **Description:** Handler: canRecieveUpdates Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/alerts/dailyAlerts'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/alerts/delete/{id}

- **Name:** DELETE /api/alerts/delete/:id
- **Auth:** bearer
- **Handler:** deleAlertbyID
- **Route File:** alerts.js
- **Description:** Handler: deleAlertbyID Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/alerts/delete/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/deleteAccount

- **Name:** POST /api/alerts/deleteAccount
- **Auth:** bearer
- **Handler:** createDeleteAccountAlert
- **Route File:** alerts.js
- **Description:** Handler: createDeleteAccountAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/deleteAccount'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alerts/deletePatientAlert/{id}

- **Name:** PUT /api/alerts/deletePatientAlert/:id
- **Auth:** bearer
- **Handler:** deletePatientAlert
- **Route File:** alerts.js
- **Description:** Handler: deletePatientAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alerts/deletePatientAlert/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alerts/disapproveAlert

- **Name:** PUT /api/alerts/disapproveAlert
- **Auth:** bearer
- **Handler:** dissapproveAlert
- **Route File:** alerts.js
- **Description:** Handler: dissapproveAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alerts/disapproveAlert'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alerts/disapproveAllAlerts

- **Name:** PUT /api/alerts/disapproveAllAlerts
- **Auth:** bearer
- **Handler:** dissapproveAllAlerts
- **Route File:** alerts.js
- **Description:** Handler: dissapproveAllAlerts Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alerts/disapproveAllAlerts'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/doctorMessageToAdmin

- **Name:** POST /api/alerts/doctorMessageToAdmin
- **Auth:** bearer
- **Handler:** createDoctorMessageToAdminAlert
- **Route File:** alerts.js
- **Description:** Handler: createDoctorMessageToAdminAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/doctorMessageToAdmin'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/newEnrollment

- **Name:** POST /api/alerts/newEnrollment
- **Auth:** bearer
- **Handler:** createNewEnrollmentAlert
- **Route File:** alerts.js
- **Description:** Handler: createNewEnrollmentAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/newEnrollment'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/newLabReport

- **Name:** POST /api/alerts/newLabReport
- **Auth:** bearer
- **Handler:** createNewLabReportAlert
- **Route File:** alerts.js
- **Description:** Handler: createNewLabReportAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/newLabReport'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/newPrescription

- **Name:** POST /api/alerts/newPrescription
- **Auth:** bearer
- **Handler:** createNewPrescriptionAlert
- **Route File:** alerts.js
- **Description:** Handler: createNewPrescriptionAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/newPrescription'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/newPrescriptionAlarm

- **Name:** POST /api/alerts/newPrescriptionAlarm
- **Auth:** bearer
- **Handler:** createNewPrescriptionAlarmAlert
- **Route File:** alerts.js
- **Description:** Handler: createNewPrescriptionAlarmAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/newPrescriptionAlarm'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/newProgramEnrollment

- **Name:** POST /api/alerts/newProgramEnrollment
- **Auth:** bearer
- **Handler:** createNewProgramEnrollmentAlert
- **Route File:** alerts.js
- **Description:** Handler: createNewProgramEnrollmentAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/newProgramEnrollment'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/newRequisition

- **Name:** POST /api/alerts/newRequisition
- **Auth:** bearer
- **Handler:** createNewRequisitionAlert
- **Route File:** alerts.js
- **Description:** Handler: createNewRequisitionAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/newRequisition'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/prescriptionDisapprovedAlarm

- **Name:** POST /api/alerts/prescriptionDisapprovedAlarm
- **Auth:** bearer
- **Handler:** createPrescriptionDisapprovedAlarmAlert
- **Route File:** alerts.js
- **Description:** Handler: createPrescriptionDisapprovedAlarmAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/prescriptionDisapprovedAlarm'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/alerts/prescriptionNotViewed

- **Name:** POST /api/alerts/prescriptionNotViewed
- **Auth:** bearer
- **Handler:** createPrescriptionNotViewedAlert
- **Route File:** alerts.js
- **Description:** Handler: createPrescriptionNotViewedAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/alerts/prescriptionNotViewed'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/alerts/updateIsRead

- **Name:** PUT /api/alerts/updateIsRead
- **Auth:** bearer
- **Handler:** updateIsReadAlert
- **Route File:** alerts.js
- **Description:** Handler: updateIsReadAlert Route File: alerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/alerts/updateIsRead'
  -H 'Authorization: Bearer {{token}}'
```

### app_apis

#### POST /api/app_apis/alarms/deleteAlarm

- **Name:** POST /api/app_apis/alarms/deleteAlarm
- **Auth:** none
- **Handler:** deleteAlarm
- **Route File:** app_apis.js
- **Description:** Handler: deleteAlarm Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/alarms/deleteAlarm'
```

#### POST /api/app_apis/alarms/fetchAlarms

- **Name:** POST /api/app_apis/alarms/fetchAlarms
- **Auth:** none
- **Handler:** getAlarmOfPatient
- **Route File:** app_apis.js
- **Description:** Handler: getAlarmOfPatient Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/alarms/fetchAlarms'
```

#### POST /api/app_apis/alarms/insertAlarm

- **Name:** POST /api/app_apis/alarms/insertAlarm
- **Auth:** none
- **Handler:** insertAlarm
- **Route File:** app_apis.js
- **Description:** Handler: insertAlarm Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/alarms/insertAlarm'
```

#### POST /api/app_apis/appAlerts/insertAlert

- **Name:** POST /api/app_apis/appAlerts/insertAlert
- **Auth:** none
- **Handler:** insertAlert
- **Route File:** app_apis.js
- **Description:** Handler: insertAlert Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/appAlerts/insertAlert'
```

#### POST /api/app_apis/dailyHealth/fetchDailyParametersById

- **Name:** POST /api/app_apis/dailyHealth/fetchDailyParametersById
- **Auth:** none
- **Handler:** fetchDailyParametersById
- **Route File:** app_apis.js
- **Description:** Handler: fetchDailyParametersById Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dailyHealth/fetchDailyParametersById'
```

#### POST /api/app_apis/dailyHealth/getDailyHealthParams

- **Name:** POST /api/app_apis/dailyHealth/getDailyHealthParams
- **Auth:** none
- **Handler:** fetchDailyParameters
- **Route File:** app_apis.js
- **Description:** Handler: fetchDailyParameters Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dailyHealth/getDailyHealthParams'
```

#### POST /api/app_apis/dailyHealth/submitDailyHealthParams

- **Name:** POST /api/app_apis/dailyHealth/submitDailyHealthParams
- **Auth:** none
- **Handler:** upload.single(image
- **Route File:** app_apis.js
- **Description:** Handler: upload.single(image Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dailyHealth/submitDailyHealthParams'
```

#### POST /api/app_apis/deleteAccountDeletionRequest

- **Name:** POST /api/app_apis/deleteAccountDeletionRequest
- **Auth:** none
- **Handler:** cancelAccountDeletionRequest
- **Route File:** app_apis.js
- **Description:** Handler: cancelAccountDeletionRequest Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/deleteAccountDeletionRequest'
```

#### POST /api/app_apis/deleteUserRequest

- **Name:** POST /api/app_apis/deleteUserRequest
- **Auth:** none
- **Handler:** accountDeletionRequest
- **Route File:** app_apis.js
- **Description:** Handler: accountDeletionRequest Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/deleteUserRequest'
```

#### POST /api/app_apis/dialysisHealth/fetchDialysisParametersById

- **Name:** POST /api/app_apis/dialysisHealth/fetchDialysisParametersById
- **Auth:** none
- **Handler:** fetchDialysisParametersById
- **Route File:** app_apis.js
- **Description:** Handler: fetchDialysisParametersById Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dialysisHealth/fetchDialysisParametersById'
```

#### POST /api/app_apis/dialysisHealth/getDialysisHealthParams

- **Name:** POST /api/app_apis/dialysisHealth/getDialysisHealthParams
- **Auth:** none
- **Handler:** fetchDialysisParameters
- **Route File:** app_apis.js
- **Description:** Handler: fetchDialysisParameters Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dialysisHealth/getDialysisHealthParams'
```

#### POST /api/app_apis/dialysisHealth/submitDialysisHealthParams

- **Name:** POST /api/app_apis/dialysisHealth/submitDialysisHealthParams
- **Auth:** none
- **Handler:** upload.single(image
- **Route File:** app_apis.js
- **Description:** Handler: upload.single(image Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dialysisHealth/submitDialysisHealthParams'
```

#### POST /api/app_apis/dietdetails/addDietComment

- **Name:** POST /api/app_apis/dietdetails/addDietComment
- **Auth:** none
- **Handler:** addDietComment
- **Route File:** app_apis.js
- **Description:** Handler: addDietComment Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dietdetails/addDietComment'
```

#### POST /api/app_apis/dietdetails/fetchDietComments

- **Name:** POST /api/app_apis/dietdetails/fetchDietComments
- **Auth:** none
- **Handler:** fetchDietComments
- **Route File:** app_apis.js
- **Description:** Handler: fetchDietComments Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dietdetails/fetchDietComments'
```

#### POST /api/app_apis/dietdetails/getPatientDiet

- **Name:** POST /api/app_apis/dietdetails/getPatientDiet
- **Auth:** none
- **Handler:** getPatientDietDetails
- **Route File:** app_apis.js
- **Description:** Handler: getPatientDietDetails Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/dietdetails/getPatientDiet'
```

#### POST /api/app_apis/getAilmentList

- **Name:** POST /api/app_apis/getAilmentList
- **Auth:** none
- **Handler:** getAilmentList
- **Route File:** app_apis.js
- **Description:** Handler: getAilmentList Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/getAilmentList'
```

#### POST /api/app_apis/getAilmentsList

- **Name:** POST /api/app_apis/getAilmentsList
- **Auth:** none
- **Handler:** getAilmentsList
- **Route File:** app_apis.js
- **Description:** Handler: getAilmentsList Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/getAilmentsList'
```

#### POST /api/app_apis/getDoctorMessages

- **Name:** POST /api/app_apis/getDoctorMessages
- **Auth:** none
- **Handler:** getDoctorMessages
- **Route File:** app_apis.js
- **Description:** Handler: getDoctorMessages Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/getDoctorMessages'
```

#### POST /api/app_apis/getProfileDetails

- **Name:** POST /api/app_apis/getProfileDetails
- **Auth:** none
- **Handler:** getProfileDetails
- **Route File:** app_apis.js
- **Description:** Handler: getProfileDetails Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/getProfileDetails'
```

#### GET /api/app_apis/getUnreadDoctorCmts

- **Name:** GET /api/app_apis/getUnreadDoctorCmts
- **Auth:** none
- **Handler:** getUnreadDoctorComments
- **Route File:** app_apis.js
- **Description:** Handler: getUnreadDoctorComments Route File: app_apis.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/app_apis/getUnreadDoctorCmts'
```

#### POST /api/app_apis/isAccountDeletionRequest

- **Name:** POST /api/app_apis/isAccountDeletionRequest
- **Auth:** none
- **Handler:** isAccountDeletionRequest
- **Route File:** app_apis.js
- **Description:** Handler: isAccountDeletionRequest Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/isAccountDeletionRequest'
```

#### POST /api/app_apis/login

- **Name:** POST /api/app_apis/login
- **Auth:** none
- **Handler:** login
- **Route File:** app_apis.js
- **Description:** Handler: login Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/login'
```

#### POST /api/app_apis/loginv2

- **Name:** POST /api/app_apis/loginv2
- **Auth:** none
- **Handler:** loginv2
- **Route File:** app_apis.js
- **Description:** Handler: loginv2 Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/loginv2'
```

#### POST /api/app_apis/markCommentsAsRead

- **Name:** POST /api/app_apis/markCommentsAsRead
- **Auth:** none
- **Handler:** markCommentAsRead
- **Route File:** app_apis.js
- **Description:** Handler: markCommentAsRead Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/markCommentsAsRead'
```

#### POST /api/app_apis/prescription/addPrescription

- **Name:** POST /api/app_apis/prescription/addPrescription
- **Auth:** none
- **Handler:** upload.single(image
- **Route File:** app_apis.js
- **Description:** Handler: upload.single(image Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/prescription/addPrescription'
```

#### POST /api/app_apis/prescription/addPrescriptionComments

- **Name:** POST /api/app_apis/prescription/addPrescriptionComments
- **Auth:** none
- **Handler:** addPrescriptionComment
- **Route File:** app_apis.js
- **Description:** Handler: addPrescriptionComment Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/prescription/addPrescriptionComments'
```

#### POST /api/app_apis/prescription/deletePrescription

- **Name:** POST /api/app_apis/prescription/deletePrescription
- **Auth:** none
- **Handler:** deletePrescription
- **Route File:** app_apis.js
- **Description:** Handler: deletePrescription Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/prescription/deletePrescription'
```

#### POST /api/app_apis/prescription/fetchPrescription

- **Name:** POST /api/app_apis/prescription/fetchPrescription
- **Auth:** none
- **Handler:** getPrescriptionsByIdFromApp
- **Route File:** app_apis.js
- **Description:** Handler: getPrescriptionsByIdFromApp Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/prescription/fetchPrescription'
```

#### POST /api/app_apis/prescription/fetchPrescriptionComments

- **Name:** POST /api/app_apis/prescription/fetchPrescriptionComments
- **Auth:** none
- **Handler:** fetchPrescriptionComments
- **Route File:** app_apis.js
- **Description:** Handler: fetchPrescriptionComments Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/prescription/fetchPrescriptionComments'
```

#### POST /api/app_apis/pushTokenUpdate

- **Name:** POST /api/app_apis/pushTokenUpdate
- **Auth:** none
- **Handler:** updateToken
- **Route File:** app_apis.js
- **Description:** Handler: updateToken Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/pushTokenUpdate'
```

#### POST /api/app_apis/questions/answerQuestions

- **Name:** POST /api/app_apis/questions/answerQuestions
- **Auth:** none
- **Handler:** answerQuestion
- **Route File:** app_apis.js
- **Description:** Handler: answerQuestion Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/questions/answerQuestions'
```

#### POST /api/app_apis/questions/getQuestions

- **Name:** POST /api/app_apis/questions/getQuestions
- **Auth:** none
- **Handler:** fetchQuestions
- **Route File:** app_apis.js
- **Description:** Handler: fetchQuestions Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/questions/getQuestions'
```

#### POST /api/app_apis/register/getDoctorCode

- **Name:** POST /api/app_apis/register/getDoctorCode
- **Auth:** none
- **Handler:** getDoctorCode
- **Route File:** app_apis.js
- **Description:** Handler: getDoctorCode Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/register/getDoctorCode'
```

#### POST /api/app_apis/report/addLabReport

- **Name:** POST /api/app_apis/report/addLabReport
- **Auth:** none
- **Handler:** upload.single(image
- **Route File:** app_apis.js
- **Description:** Handler: upload.single(image Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/report/addLabReport'
```

#### POST /api/app_apis/report/addReportComments

- **Name:** POST /api/app_apis/report/addReportComments
- **Auth:** none
- **Handler:** addReportComments
- **Route File:** app_apis.js
- **Description:** Handler: addReportComments Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/report/addReportComments'
```

#### POST /api/app_apis/report/deleteReport

- **Name:** POST /api/app_apis/report/deleteReport
- **Auth:** none
- **Handler:** deleteLabReport
- **Route File:** app_apis.js
- **Description:** Handler: deleteLabReport Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/report/deleteReport'
```

#### POST /api/app_apis/report/fetchReportComments

- **Name:** POST /api/app_apis/report/fetchReportComments
- **Auth:** none
- **Handler:** fetchReportComments
- **Route File:** app_apis.js
- **Description:** Handler: fetchReportComments Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/report/fetchReportComments'
```

#### POST /api/app_apis/reports/userLabReports

- **Name:** POST /api/app_apis/reports/userLabReports
- **Auth:** none
- **Handler:** fetchUserLabReports
- **Route File:** app_apis.js
- **Description:** Handler: fetchUserLabReports Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/reports/userLabReports'
```

#### POST /api/app_apis/requisition/addRequisitionComments

- **Name:** POST /api/app_apis/requisition/addRequisitionComments
- **Auth:** none
- **Handler:** addRequisitionComment
- **Route File:** app_apis.js
- **Description:** Handler: addRequisitionComment Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/requisition/addRequisitionComments'
```

#### POST /api/app_apis/requisition/fetchRequisition

- **Name:** POST /api/app_apis/requisition/fetchRequisition
- **Auth:** none
- **Handler:** getRequisitionInApp
- **Route File:** app_apis.js
- **Description:** Handler: getRequisitionInApp Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/requisition/fetchRequisition'
```

#### POST /api/app_apis/requisition/fetchRequisitionComments

- **Name:** POST /api/app_apis/requisition/fetchRequisitionComments
- **Auth:** none
- **Handler:** fetchRequisitionComments
- **Route File:** app_apis.js
- **Description:** Handler: fetchRequisitionComments Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/requisition/fetchRequisitionComments'
```

#### POST /api/app_apis/sendPushNotification

- **Name:** POST /api/app_apis/sendPushNotification
- **Auth:** none
- **Handler:** sendPushNotification
- **Route File:** app_apis.js
- **Description:** Handler: sendPushNotification Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/sendPushNotification'
```

#### POST /api/app_apis/updateUserAilments

- **Name:** POST /api/app_apis/updateUserAilments
- **Auth:** none
- **Handler:** updateUserAilment
- **Route File:** app_apis.js
- **Description:** Handler: updateUserAilment Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/updateUserAilments'
```

#### POST /api/app_apis/userFeedback

- **Name:** POST /api/app_apis/userFeedback
- **Auth:** none
- **Handler:** submitUserFeedback
- **Route File:** app_apis.js
- **Description:** Handler: submitUserFeedback Route File: app_apis.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/app_apis/userFeedback'
```

### auth

#### POST /api/auth/changePassword

- **Name:** POST /api/auth/changePassword
- **Auth:** none
- **Handler:** changePassword
- **Route File:** auth.js
- **Description:** Handler: changePassword Route File: auth.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/auth/changePassword'
```

#### POST /{m1_url}/api/auth/login

- **Name:** POST /api/auth/login
- **Auth:** none
- **Handler:** login
- **Route File:** auth.js
- **Description:** Handler: login Route File: auth.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Request Body:**
```json
{
  "email": "superadmin@kifaytihealth.com",
  "password": "Test098"
}
```
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/{m1_url}/api/auth/login'
  -H 'Content-Type: application/json'
  -d '{ ... }'
```

#### GET /api/auth/private

- **Name:** GET /api/auth/private
- **Auth:** none
- **Handler:** getPrivateData
- **Route File:** auth.js
- **Description:** Handler: getPrivateData Route File: auth.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/auth/private'
```

#### POST /api/auth/register

- **Name:** POST /api/auth/register
- **Auth:** none
- **Handler:** register
- **Route File:** auth.js
- **Description:** Handler: register Route File: auth.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/auth/register'
```

### chatRouter

#### GET /api/chatRouter/{pid}

- **Name:** GET /api/chatRouter/:pid
- **Auth:** bearer
- **Handler:** getAllChats
- **Route File:** chatRouter.js
- **Description:** Handler: getAllChats Route File: chatRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - pid: `<<pid>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/chatRouter/{pid}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/chatRouter/admin/{pid}

- **Name:** GET /api/chatRouter/admin/:pid
- **Auth:** bearer
- **Handler:** getAllByEMailChats
- **Route File:** chatRouter.js
- **Description:** Handler: getAllByEMailChats Route File: chatRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - pid: `<<pid>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/chatRouter/admin/{pid}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/chatRouter/adminSW/{pid}

- **Name:** POST /api/chatRouter/adminSW/:pid
- **Auth:** bearer
- **Handler:** getSWChats
- **Route File:** chatRouter.js
- **Description:** Handler: getSWChats Route File: chatRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - pid: `<<pid>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/chatRouter/adminSW/{pid}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/chatRouter/getId

- **Name:** POST /api/chatRouter/getId
- **Auth:** bearer
- **Handler:** getChatId
- **Route File:** chatRouter.js
- **Description:** Handler: getChatId Route File: chatRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/chatRouter/getId'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/chatRouter/message

- **Name:** POST /api/chatRouter/message/
- **Auth:** bearer
- **Handler:** sendMessage
- **Route File:** chatRouter.js
- **Description:** Handler: sendMessage Route File: chatRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/chatRouter/message'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/chatRouter/message/{chatId}

- **Name:** GET /api/chatRouter/message/:chatId
- **Auth:** bearer
- **Handler:** getMessages
- **Route File:** chatRouter.js
- **Description:** Handler: getMessages Route File: chatRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - chatId: `<<chatId>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/chatRouter/message/{chatId}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/chatRouter/messageSW/{chatId}

- **Name:** GET /api/chatRouter/messageSW/:chatId
- **Auth:** bearer
- **Handler:** getSWMessages
- **Route File:** chatRouter.js
- **Description:** Handler: getSWMessages Route File: chatRouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - chatId: `<<chatId>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/chatRouter/messageSW/{chatId}'
  -H 'Authorization: Bearer {{token}}'
```

### comments

#### POST /api/comments/addComment

- **Name:** POST /api/comments/addComment
- **Auth:** bearer
- **Handler:** addComment
- **Route File:** comments.js
- **Description:** Handler: addComment Route File: comments.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/comments/addComment'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/comments/getComments

- **Name:** POST /api/comments/getComments
- **Auth:** bearer
- **Handler:** getComments
- **Route File:** comments.js
- **Description:** Handler: getComments Route File: comments.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/comments/getComments'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/comments/getDoctorComments

- **Name:** POST /api/comments/getDoctorComments
- **Auth:** bearer
- **Handler:** getDoctorComments
- **Route File:** comments.js
- **Description:** Handler: getDoctorComments Route File: comments.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/comments/getDoctorComments'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/comments/getPatientComments

- **Name:** POST /api/comments/getPatientComments
- **Auth:** bearer
- **Handler:** getPatientComments
- **Route File:** comments.js
- **Description:** Handler: getPatientComments Route File: comments.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/comments/getPatientComments'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/comments/updateReadTable

- **Name:** POST /api/comments/updateReadTable
- **Auth:** bearer
- **Handler:** updateReadTable
- **Route File:** comments.js
- **Description:** Handler: updateReadTable Route File: comments.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/comments/updateReadTable'
  -H 'Authorization: Bearer {{token}}'
```

### contactus

#### GET /api/contactus

- **Name:** GET /api/contactus/
- **Auth:** bearer
- **Handler:** getAllContactUs
- **Route File:** contactus.js
- **Description:** Handler: getAllContactUs Route File: contactus.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/contactus'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/contactus

- **Name:** POST /api/contactus/
- **Auth:** bearer
- **Handler:** insertContactUs
- **Route File:** contactus.js
- **Description:** Handler: insertContactUs Route File: contactus.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/contactus'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/contactus/{id}

- **Name:** DELETE /api/contactus/:id
- **Auth:** bearer
- **Handler:** deleteContactUs
- **Route File:** contactus.js
- **Description:** Handler: deleteContactUs Route File: contactus.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/contactus/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/contactus/{id}

- **Name:** GET /api/contactus/:id
- **Auth:** bearer
- **Handler:** getContactUsById
- **Route File:** contactus.js
- **Description:** Handler: getContactUsById Route File: contactus.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/contactus/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### dailyAlerts

#### POST /api/dailyAlerts/AddDailyReadingsAlerts

- **Name:** POST /api/dailyAlerts/AddDailyReadingsAlerts
- **Auth:** bearer
- **Handler:** AddDailyReadingsAlertsAPI
- **Route File:** dailyAlerts.js
- **Description:** Handler: AddDailyReadingsAlertsAPI Route File: dailyAlerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/dailyAlerts/AddDailyReadingsAlerts'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/dailyAlerts/AddDialysisReadingsAlerts

- **Name:** POST /api/dailyAlerts/AddDialysisReadingsAlerts
- **Auth:** bearer
- **Handler:** AddDialysisReadingsAlertsAPI
- **Route File:** dailyAlerts.js
- **Description:** Handler: AddDialysisReadingsAlertsAPI Route File: dailyAlerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/dailyAlerts/AddDialysisReadingsAlerts'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/dailyAlerts/updateIsRead

- **Name:** POST /api/dailyAlerts/updateIsRead
- **Auth:** bearer
- **Handler:** updateIsRead
- **Route File:** dailyAlerts.js
- **Description:** Handler: updateIsRead Route File: dailyAlerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/dailyAlerts/updateIsRead'
  -H 'Authorization: Bearer {{token}}'
```

### dataUpload

#### POST /api/dataUpload

- **Name:** POST /api/dataUpload/
- **Auth:** none
- **Handler:** upload.single(file
- **Route File:** dataUpload.js
- **Description:** Handler: upload.single(file Route File: dataUpload.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/dataUpload'
```

#### POST /api/dataUpload/files

- **Name:** POST /api/dataUpload/files
- **Auth:** none
- **Handler:** upload.array(files
- **Route File:** dataUpload.js
- **Description:** Handler: upload.array(files Route File: dataUpload.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/dataUpload/files'
```

### dietdetails

#### DELETE /api/dietdetails/deleteDietDetails/{id}

- **Name:** DELETE /api/dietdetails/deleteDietDetails/:id
- **Auth:** bearer
- **Handler:** deleteDietDetails
- **Route File:** dietdetails.js
- **Description:** Handler: deleteDietDetails Route File: dietdetails.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/dietdetails/deleteDietDetails/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/dietdetails/getPatientDietDetailsAdmin/{id}

- **Name:** GET /api/dietdetails/getPatientDietDetailsAdmin/:id
- **Auth:** bearer
- **Handler:** getPatientDietDetailsAdmin
- **Route File:** dietdetails.js
- **Description:** Handler: getPatientDietDetailsAdmin Route File: dietdetails.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/dietdetails/getPatientDietDetailsAdmin/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/dietdetails/insertDietDetails

- **Name:** POST /api/dietdetails/insertDietDetails
- **Auth:** none
- **Handler:** upload.single(image
- **Route File:** dietdetails.js
- **Description:** Handler: upload.single(image Route File: dietdetails.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/dietdetails/insertDietDetails'
```

#### POST /api/dietdetails/insertDietDetailsAdmin

- **Name:** POST /api/dietdetails/insertDietDetailsAdmin
- **Auth:** bearer
- **Handler:** insertDietDetailsAdmin
- **Route File:** dietdetails.js
- **Description:** Handler: insertDietDetailsAdmin Route File: dietdetails.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/dietdetails/insertDietDetailsAdmin'
  -H 'Authorization: Bearer {{token}}'
```

### doctorAnalytics

#### GET /api/doctorAnalytics/getAdherenceMedicine

- **Name:** GET /api/doctorAnalytics/getAdherenceMedicine
- **Auth:** bearer
- **Handler:** getAdherenceMedicine
- **Route File:** doctorAnalytics.js
- **Description:** Handler: getAdherenceMedicine Route File: doctorAnalytics.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctorAnalytics/getAdherenceMedicine'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctorAnalytics/getPatientsByAge

- **Name:** GET /api/doctorAnalytics/getPatientsByAge
- **Auth:** bearer
- **Handler:** getPatientByAge
- **Route File:** doctorAnalytics.js
- **Description:** Handler: getPatientByAge Route File: doctorAnalytics.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctorAnalytics/getPatientsByAge'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctorAnalytics/getPatientsByDoctorId

- **Name:** GET /api/doctorAnalytics/getPatientsByDoctorId
- **Auth:** bearer
- **Handler:** getAppointmentsByDate
- **Route File:** doctorAnalytics.js
- **Description:** Handler: getAppointmentsByDate Route File: doctorAnalytics.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctorAnalytics/getPatientsByDoctorId'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctorAnalytics/getPatientsByGender

- **Name:** GET /api/doctorAnalytics/getPatientsByGender
- **Auth:** bearer
- **Handler:** getPatientByGender
- **Route File:** doctorAnalytics.js
- **Description:** Handler: getPatientByGender Route File: doctorAnalytics.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctorAnalytics/getPatientsByGender'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctorAnalytics/getPercentageReturn

- **Name:** GET /api/doctorAnalytics/getPercentageReturn
- **Auth:** bearer
- **Handler:** getPercentageReturn
- **Route File:** doctorAnalytics.js
- **Description:** Handler: getPercentageReturn Route File: doctorAnalytics.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctorAnalytics/getPercentageReturn'
  -H 'Authorization: Bearer {{token}}'
```

### doctorPatient

#### POST /api/doctorPatient/addDoctor/{id}

- **Name:** POST /api/doctorPatient/addDoctor/:id
- **Auth:** bearer
- **Handler:** addDoctorToPatient
- **Route File:** doctorPatient.js
- **Description:** Handler: addDoctorToPatient Route File: doctorPatient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/doctorPatient/addDoctor/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/doctorPatient/deleteDoctor/{id}

- **Name:** DELETE /api/doctorPatient/deleteDoctor/:id
- **Auth:** bearer
- **Handler:** deleteAssignedDoctor
- **Route File:** doctorPatient.js
- **Description:** Handler: deleteAssignedDoctor Route File: doctorPatient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/doctorPatient/deleteDoctor/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctorPatient/getDoctor/{id}

- **Name:** GET /api/doctorPatient/getDoctor/:id
- **Auth:** bearer
- **Handler:** getDoctorData
- **Route File:** doctorPatient.js
- **Description:** Handler: getDoctorData Route File: doctorPatient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctorPatient/getDoctor/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### doctors

#### POST /api/doctors

- **Name:** POST /api/doctors/
- **Auth:** bearer
- **Handler:** createDoctor
- **Route File:** doctors.js
- **Description:** Handler: createDoctor Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/doctors'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/doctors/{id}

- **Name:** DELETE /api/doctors/:id
- **Auth:** bearer
- **Handler:** deleteDoctor
- **Route File:** doctors.js
- **Description:** Handler: deleteDoctor Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/doctors/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/doctors/{id}

- **Name:** PUT /api/doctors/:id
- **Auth:** bearer
- **Handler:** updateDoctor
- **Route File:** doctors.js
- **Description:** Handler: updateDoctor Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/doctors/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/doctors/byEmail/id

- **Name:** POST /api/doctors/byEmail/id
- **Auth:** bearer
- **Handler:** getDoctorIdbyEmail
- **Route File:** doctors.js
- **Description:** Handler: getDoctorIdbyEmail Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/doctors/byEmail/id'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctors/doctorLogs

- **Name:** GET /api/doctors/doctorLogs
- **Auth:** bearer
- **Handler:** DocdownloadLog
- **Route File:** doctors.js
- **Description:** Handler: DocdownloadLog Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctors/doctorLogs'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctors/getDoctors

- **Name:** GET /api/doctors/getDoctors
- **Auth:** bearer
- **Handler:** getDoctors
- **Route File:** doctors.js
- **Description:** Handler: getDoctors Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctors/getDoctors'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctors/getDoctorsChat/{pid}

- **Name:** GET /api/doctors/getDoctorsChat/:pid
- **Auth:** bearer
- **Handler:** getDoctorsForChat
- **Route File:** doctors.js
- **Description:** Handler: getDoctorsForChat Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - pid: `<<pid>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctors/getDoctorsChat/{pid}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctors/name/{id}

- **Name:** GET /api/doctors/name/:id
- **Auth:** bearer
- **Handler:** getDoctorNamebyId
- **Route File:** doctors.js
- **Description:** Handler: getDoctorNamebyId Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctors/name/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/doctors/ReportLogs

- **Name:** GET /api/doctors/ReportLogs
- **Auth:** bearer
- **Handler:** DownReportlog
- **Route File:** doctors.js
- **Description:** Handler: DownReportlog Route File: doctors.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/doctors/ReportLogs'
  -H 'Authorization: Bearer {{token}}'
```

### graphReadingDialysis

#### POST /api/graphReadingDialysis/add

- **Name:** POST /api/graphReadingDialysis/add
- **Auth:** bearer
- **Handler:** AddGraphReading
- **Route File:** graphReadingDialysis.js
- **Description:** Handler: AddGraphReading Route File: graphReadingDialysis.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/graphReadingDialysis/add'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/graphReadingDialysis/delete

- **Name:** POST /api/graphReadingDialysis/delete
- **Auth:** bearer
- **Handler:** DeleteGraphReading
- **Route File:** graphReadingDialysis.js
- **Description:** Handler: DeleteGraphReading Route File: graphReadingDialysis.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/graphReadingDialysis/delete'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/graphReadingDialysis/get

- **Name:** GET /api/graphReadingDialysis/get
- **Auth:** bearer
- **Handler:** getReadingsByPatientAndQuestion
- **Route File:** graphReadingDialysis.js
- **Description:** Handler: getReadingsByPatientAndQuestion Route File: graphReadingDialysis.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/graphReadingDialysis/get'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/graphReadingDialysis/getGraph

- **Name:** GET /api/graphReadingDialysis/getGraph
- **Auth:** bearer
- **Handler:** getReadingsByPatientAndQuestionGraph
- **Route File:** graphReadingDialysis.js
- **Description:** Handler: getReadingsByPatientAndQuestionGraph Route File: graphReadingDialysis.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/graphReadingDialysis/getGraph'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/graphReadingDialysis/update

- **Name:** POST /api/graphReadingDialysis/update
- **Auth:** bearer
- **Handler:** updateGraphReading
- **Route File:** graphReadingDialysis.js
- **Description:** Handler: updateGraphReading Route File: graphReadingDialysis.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/graphReadingDialysis/update'
  -H 'Authorization: Bearer {{token}}'
```

### graphReadings

#### POST /api/graphReadings/add

- **Name:** POST /api/graphReadings/add
- **Auth:** bearer
- **Handler:** AddGraphReading
- **Route File:** graphReadings.js
- **Description:** Handler: AddGraphReading Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/graphReadings/add'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/graphReadings/add/dia/sys

- **Name:** POST /api/graphReadings/add/dia/sys
- **Auth:** bearer
- **Handler:** AddGraphReadingSysDia
- **Route File:** graphReadings.js
- **Description:** Handler: AddGraphReadingSysDia Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/graphReadings/add/dia/sys'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/graphReadings/add/sys

- **Name:** POST /api/graphReadings/add/sys
- **Auth:** bearer
- **Handler:** AddGraphReadingSys
- **Route File:** graphReadings.js
- **Description:** Handler: AddGraphReadingSys Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/graphReadings/add/sys'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/graphReadings/delete

- **Name:** POST /api/graphReadings/delete
- **Auth:** bearer
- **Handler:** deleteGraph
- **Route File:** graphReadings.js
- **Description:** Handler: deleteGraph Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/graphReadings/delete'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/graphReadings/get

- **Name:** GET /api/graphReadings/get
- **Auth:** bearer
- **Handler:** getReadingsByPatientAndQuestion
- **Route File:** graphReadings.js
- **Description:** Handler: getReadingsByPatientAndQuestion Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/graphReadings/get'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/graphReadings/get/dia/sys

- **Name:** GET /api/graphReadings/get/dia/sys
- **Auth:** bearer
- **Handler:** getReadingsByPatientAndQuestionSysAndDysDialysis
- **Route File:** graphReadings.js
- **Description:** Handler: getReadingsByPatientAndQuestionSysAndDysDialysis Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/graphReadings/get/dia/sys'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/graphReadings/get/dia/sysid/{diastolicTitle}

- **Name:** GET /api/graphReadings/get/dia/sysid/:diastolicTitle
- **Auth:** bearer
- **Handler:** getSystolicIdDia
- **Route File:** graphReadings.js
- **Description:** Handler: getSystolicIdDia Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - diastolicTitle: `<<diastolicTitle>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/graphReadings/get/dia/sysid/{diastolicTitle}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/graphReadings/get/sys

- **Name:** GET /api/graphReadings/get/sys
- **Auth:** bearer
- **Handler:** getReadingsByPatientAndQuestionSysAndDys
- **Route File:** graphReadings.js
- **Description:** Handler: getReadingsByPatientAndQuestionSysAndDys Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/graphReadings/get/sys'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/graphReadings/get/sysid/{diastolicTitle}

- **Name:** GET /api/graphReadings/get/sysid/:diastolicTitle
- **Auth:** bearer
- **Handler:** getSystolicId
- **Route File:** graphReadings.js
- **Description:** Handler: getSystolicId Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - diastolicTitle: `<<diastolicTitle>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/graphReadings/get/sysid/{diastolicTitle}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/graphReadings/update

- **Name:** POST /api/graphReadings/update
- **Auth:** bearer
- **Handler:** updateGraph
- **Route File:** graphReadings.js
- **Description:** Handler: updateGraph Route File: graphReadings.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/graphReadings/update'
  -H 'Authorization: Bearer {{token}}'
```

### index

#### GET /health

- **Name:** GET /health
- **Auth:** none
- **Handler:** inline
- **Route File:** index.js
- **Description:** Handler: inline Route File: index.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/health'
```

### labreport

#### DELETE /api/labreport/{id}

- **Name:** DELETE /api/labreport/:id
- **Auth:** bearer
- **Handler:** deleteLabReport
- **Route File:** labreport.js
- **Description:** Handler: deleteLabReport Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/labreport/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/labreport/{patient}

- **Name:** GET /api/labreport/:patient
- **Auth:** bearer
- **Handler:** getLabReportByPatient
- **Route File:** labreport.js
- **Description:** Handler: getLabReportByPatient Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - patient: `<<patient>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/labreport/{patient}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/labreport/addBulkIndividual

- **Name:** POST /api/labreport/addBulkIndividual
- **Auth:** bearer
- **Handler:** uploadBulkLabReportIndividual
- **Route File:** labreport.js
- **Description:** Handler: uploadBulkLabReportIndividual Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/labreport/addBulkIndividual'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/labreport/addLabReading

- **Name:** POST /api/labreport/addLabReading
- **Auth:** bearer
- **Handler:** addLabReadings
- **Route File:** labreport.js
- **Description:** Handler: addLabReadings Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/labreport/addLabReading'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/labreport/confirm

- **Name:** POST /api/labreport/confirm
- **Auth:** none
- **Handler:** saveConfirmedData
- **Route File:** labreport.js
- **Description:** Handler: saveConfirmedData Route File: labreport.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/labreport/confirm'
```

#### DELETE /api/labreport/deleteLabReading/{id}

- **Name:** DELETE /api/labreport/deleteLabReading/:id
- **Auth:** bearer
- **Handler:** deleteLabReading
- **Route File:** labreport.js
- **Description:** Handler: deleteLabReading Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/labreport/deleteLabReading/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/labreport/deleteLabReport/{id}

- **Name:** DELETE /api/labreport/deleteLabReport/:id
- **Auth:** bearer
- **Handler:** deleteLabReport
- **Route File:** labreport.js
- **Description:** Handler: deleteLabReport Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/labreport/deleteLabReport/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/labreport/extract

- **Name:** POST /api/labreport/extract
- **Auth:** none
- **Handler:** addLabReport
- **Route File:** labreport.js
- **Description:** Handler: addLabReport Route File: labreport.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/labreport/extract'
```

#### GET /api/labreport/getColumnNames

- **Name:** GET /api/labreport/getColumnNames
- **Auth:** bearer
- **Handler:** getColoumnName
- **Route File:** labreport.js
- **Description:** Handler: getColoumnName Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/labreport/getColumnNames'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/labreport/getLabReport/{id}

- **Name:** GET /api/labreport/getLabReport/:id
- **Auth:** bearer
- **Handler:** getLabReportById
- **Route File:** labreport.js
- **Description:** Handler: getLabReportById Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/labreport/getLabReport/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/labreport/getLabReports/{id}

- **Name:** GET /api/labreport/getLabReports/:id
- **Auth:** bearer
- **Handler:** getLabReports
- **Route File:** labreport.js
- **Description:** Handler: getLabReports Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/labreport/getLabReports/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/labreport/LabReadings

- **Name:** GET /api/labreport/LabReadings
- **Auth:** bearer
- **Handler:** fetchLabReadings
- **Route File:** labreport.js
- **Description:** Handler: fetchLabReadings Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/labreport/LabReadings'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/labreport/LabReadings

- **Name:** GET /api/labreport/LabReadings
- **Auth:** bearer
- **Handler:** fetchLabReadings
- **Route File:** labreport.js
- **Description:** Handler: fetchLabReadings Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/labreport/LabReadings'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/labreport/range

- **Name:** GET /api/labreport/range
- **Auth:** bearer
- **Handler:** getRange
- **Route File:** labreport.js
- **Description:** Handler: getRange Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/labreport/range'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/labreport/responses

- **Name:** GET /api/labreport/responses
- **Auth:** bearer
- **Handler:** fetchLabReadingsResponse
- **Route File:** labreport.js
- **Description:** Handler: fetchLabReadingsResponse Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/labreport/responses'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/labreport/updateLabReadingTitle/{readingId}

- **Name:** PUT /api/labreport/updateLabReadingTitle/:readingId
- **Auth:** bearer
- **Handler:** updateLabReadingTitle
- **Route File:** labreport.js
- **Description:** Handler: updateLabReadingTitle Route File: labreport.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - readingId: `<<readingId>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/labreport/updateLabReadingTitle/{readingId}'
  -H 'Authorization: Bearer {{token}}'
```

### Languages

#### GET /api/Languages

- **Name:** GET /api/Languages/
- **Auth:** bearer
- **Handler:** getAllLanguages
- **Route File:** Languages.js
- **Description:** Handler: getAllLanguages Route File: Languages.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/Languages'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/Languages

- **Name:** POST /api/Languages/
- **Auth:** bearer
- **Handler:** insertLanguage
- **Route File:** Languages.js
- **Description:** Handler: insertLanguage Route File: Languages.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/Languages'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/Languages/{id}

- **Name:** DELETE /api/Languages/:id
- **Auth:** bearer
- **Handler:** deleteLanguage
- **Route File:** Languages.js
- **Description:** Handler: deleteLanguage Route File: Languages.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/Languages/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/Languages/{id}

- **Name:** PUT /api/Languages/:id
- **Auth:** bearer
- **Handler:** updateLanguage
- **Route File:** Languages.js
- **Description:** Handler: updateLanguage Route File: Languages.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/Languages/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### mail

#### POST /api/mail/sentotp

- **Name:** POST /api/mail/sentotp
- **Auth:** none
- **Handler:** sendMail
- **Route File:** mail.js
- **Description:** Handler: sendMail Route File: mail.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/mail/sentotp'
```

#### POST /api/mail/verifyOtp

- **Name:** POST /api/mail/verifyOtp
- **Auth:** none
- **Handler:** VerifyOtp
- **Route File:** mail.js
- **Description:** Handler: VerifyOtp Route File: mail.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/mail/verifyOtp'
```

### manageparameters

#### POST /api/manageparameters/addReading

- **Name:** POST /api/manageparameters/addReading
- **Auth:** bearer
- **Handler:** addReading
- **Route File:** manageparameters.js
- **Description:** Handler: addReading Route File: manageparameters.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/manageparameters/addReading'
  -H 'Authorization: Bearer {{token}}'
```

### moduleRoutes

#### POST /api/moduleRoutes/connectDoctor

- **Name:** POST /api/moduleRoutes/connectDoctor
- **Auth:** none
- **Handler:** moduleController.connectDoctor
- **Route File:** moduleRoutes.js
- **Description:** Handler: moduleController.connectDoctor Route File: moduleRoutes.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/moduleRoutes/connectDoctor'
```

#### POST /api/moduleRoutes/connectPatient

- **Name:** POST /api/moduleRoutes/connectPatient
- **Auth:** none
- **Handler:** moduleController.connectPatient
- **Route File:** moduleRoutes.js
- **Description:** Handler: moduleController.connectPatient Route File: moduleRoutes.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/moduleRoutes/connectPatient'
```

#### GET /api/moduleRoutes/getLabR

- **Name:** GET /api/moduleRoutes/getLabR
- **Auth:** none
- **Handler:** moduleController.getPatientLabReports
- **Route File:** moduleRoutes.js
- **Description:** Handler: moduleController.getPatientLabReports Route File: moduleRoutes.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/moduleRoutes/getLabR'
```

#### GET /api/moduleRoutes/getPresc

- **Name:** GET /api/moduleRoutes/getPresc
- **Auth:** none
- **Handler:** moduleController.getPatientPrescriptions
- **Route File:** moduleRoutes.js
- **Description:** Handler: moduleController.getPatientPrescriptions Route File: moduleRoutes.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/moduleRoutes/getPresc'
```

#### GET /api/moduleRoutes/getVitals

- **Name:** GET /api/moduleRoutes/getVitals
- **Auth:** none
- **Handler:** moduleController.getPatientVitals
- **Route File:** moduleRoutes.js
- **Description:** Handler: moduleController.getPatientVitals Route File: moduleRoutes.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/moduleRoutes/getVitals'
```

### notifs

#### POST /api/notifs/pushNotifs

- **Name:** POST /api/notifs/pushNotifs
- **Auth:** none
- **Handler:** pushNotifs
- **Route File:** notifs.js
- **Description:** Handler: pushNotifs Route File: notifs.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/notifs/pushNotifs'
```

### patient

#### POST /api/patient/AddPatient

- **Name:** POST /api/patient/AddPatient
- **Auth:** none
- **Handler:** AddPatient
- **Route File:** patient.js
- **Description:** Handler: AddPatient Route File: patient.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/patient/AddPatient'
```

#### DELETE /api/patient/deletePatient/{id}

- **Name:** DELETE /api/patient/deletePatient/:id
- **Auth:** none
- **Handler:** deletePatient
- **Route File:** patient.js
- **Description:** Handler: deletePatient Route File: patient.js
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/patient/deletePatient/{id}'
```

#### GET /api/patient/getAdminTeam/{id}

- **Name:** GET /api/patient/getAdminTeam/:id
- **Auth:** none
- **Handler:** getPatientAdminTeam
- **Route File:** patient.js
- **Description:** Handler: getPatientAdminTeam Route File: patient.js
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patient/getAdminTeam/{id}'
```

#### GET /api/patient/getAilments/{id}

- **Name:** GET /api/patient/getAilments/:id
- **Auth:** none
- **Handler:** getPatientAilments
- **Route File:** patient.js
- **Description:** Handler: getPatientAilments Route File: patient.js
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patient/getAilments/{id}'
```

#### GET /api/patient/getDeletdPatients

- **Name:** GET /api/patient/getDeletdPatients
- **Auth:** bearer
- **Handler:** getDeletdPatients
- **Route File:** patient.js
- **Description:** Handler: getDeletdPatients Route File: patient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patient/getDeletdPatients'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/patient/getMedicalTeam/{id}

- **Name:** GET /api/patient/getMedicalTeam/:id
- **Auth:** none
- **Handler:** getPatientMedicalTeam
- **Route File:** patient.js
- **Description:** Handler: getPatientMedicalTeam Route File: patient.js
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patient/getMedicalTeam/{id}'
```

#### GET /api/patient/getName/{id}

- **Name:** GET /api/patient/getName/:id
- **Auth:** none
- **Handler:** getNamebyId
- **Route File:** patient.js
- **Description:** Handler: getNamebyId Route File: patient.js
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patient/getName/{id}'
```

#### GET /api/patient/getPatient/{id}

- **Name:** GET /api/patient/getPatient/:id
- **Auth:** none
- **Handler:** getPatientById
- **Route File:** patient.js
- **Description:** Handler: getPatientById Route File: patient.js
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patient/getPatient/{id}'
```

#### GET /api/patient/getPatients

- **Name:** GET /api/patient/getPatients
- **Auth:** bearer
- **Handler:** getPatients
- **Route File:** patient.js
- **Description:** Handler: getPatients Route File: patient.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patient/getPatients'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/patient/patientLog

- **Name:** GET /api/patient/patientLog
- **Auth:** none
- **Handler:** downloadLog
- **Route File:** patient.js
- **Description:** Handler: downloadLog Route File: patient.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patient/patientLog'
```

#### DELETE /api/patient/removeAdmin/{id}

- **Name:** DELETE /api/patient/removeAdmin/:id
- **Auth:** none
- **Handler:** removeAdminFromPatient
- **Route File:** patient.js
- **Description:** Handler: removeAdminFromPatient Route File: patient.js
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/patient/removeAdmin/{id}'
```

#### PUT /api/patient/updateAdmin/{id}

- **Name:** PUT /api/patient/updateAdmin/:id
- **Auth:** none
- **Handler:** updateAdminTeam
- **Route File:** patient.js
- **Description:** Handler: updateAdminTeam Route File: patient.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/patient/updateAdmin/{id}'
```

#### PUT /api/patient/updateAilments

- **Name:** PUT /api/patient/updateAilments
- **Auth:** none
- **Handler:** updatePatientAilment
- **Route File:** patient.js
- **Description:** Handler: updatePatientAilment Route File: patient.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/patient/updateAilments'
```

#### PUT /api/patient/updateDryWeight

- **Name:** PUT /api/patient/updateDryWeight
- **Auth:** none
- **Handler:** updateDryWeight
- **Route File:** patient.js
- **Description:** Handler: updateDryWeight Route File: patient.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/patient/updateDryWeight'
```

#### PUT /api/patient/updateGFR

- **Name:** PUT /api/patient/updateGFR
- **Auth:** none
- **Handler:** updatePatientGFR
- **Route File:** patient.js
- **Description:** Handler: updatePatientGFR Route File: patient.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/patient/updateGFR'
```

#### PUT /api/patient/updateMedical/{id}

- **Name:** PUT /api/patient/updateMedical/:id
- **Auth:** none
- **Handler:** updateMedicalTeam
- **Route File:** patient.js
- **Description:** Handler: updateMedicalTeam Route File: patient.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/patient/updateMedical/{id}'
```

#### PUT /api/patient/updatePatient

- **Name:** PUT /api/patient/updatePatient
- **Auth:** none
- **Handler:** updatePatientProfile
- **Route File:** patient.js
- **Description:** Handler: updatePatientProfile Route File: patient.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/patient/updatePatient'
```

#### PUT /api/patient/updateProgram

- **Name:** PUT /api/patient/updateProgram
- **Auth:** none
- **Handler:** updatePatientProgram
- **Route File:** patient.js
- **Description:** Handler: updatePatientProgram Route File: patient.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/patient/updateProgram'
```

### patientdatarouter

#### GET /api/patientdatarouter/canexport

- **Name:** GET /api/patientdatarouter/canexport
- **Auth:** bearer
- **Handler:** canDoctorExport
- **Route File:** patientdatarouter.js
- **Description:** Handler: canDoctorExport Route File: patientdatarouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patientdatarouter/canexport'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/patientdatarouter/canReceive

- **Name:** GET /api/patientdatarouter/canReceive
- **Auth:** bearer
- **Handler:** canRecieveUpdates
- **Route File:** patientdatarouter.js
- **Description:** Handler: canRecieveUpdates Route File: patientdatarouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patientdatarouter/canReceive'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/patientdatarouter/export

- **Name:** GET /api/patientdatarouter/export
- **Auth:** bearer
- **Handler:** getPatientAllData
- **Route File:** patientdatarouter.js
- **Description:** Handler: getPatientAllData Route File: patientdatarouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patientdatarouter/export'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/patientdatarouter/export/{id}

- **Name:** GET /api/patientdatarouter/export/:id
- **Auth:** bearer
- **Handler:** getPatientData
- **Route File:** patientdatarouter.js
- **Description:** Handler: getPatientData Route File: patientdatarouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/patientdatarouter/export/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/patientdatarouter/extractTextFromCsv

- **Name:** POST /api/patientdatarouter/extractTextFromCsv
- **Auth:** bearer
- **Handler:** addLabTestCSV
- **Route File:** patientdatarouter.js
- **Description:** Handler: addLabTestCSV Route File: patientdatarouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/patientdatarouter/extractTextFromCsv'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/patientdatarouter/extractTextFromPdf

- **Name:** POST /api/patientdatarouter/extractTextFromPdf
- **Auth:** bearer
- **Handler:** PdfText
- **Route File:** patientdatarouter.js
- **Description:** Handler: PdfText Route File: patientdatarouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Request Body:**
```json
{
  "pdfUrl": ""
}
```
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/patientdatarouter/extractTextFromPdf'
  -H 'Authorization: Bearer {{token}}'
  -H 'Content-Type: application/json'
  -d '{ ... }'
```

#### POST /api/patientdatarouter/kfredetails

- **Name:** POST /api/patientdatarouter/kfredetails
- **Auth:** bearer
- **Handler:** addKfreDetails
- **Route File:** patientdatarouter.js
- **Description:** Handler: addKfreDetails Route File: patientdatarouter.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/patientdatarouter/kfredetails'
  -H 'Authorization: Bearer {{token}}'
```

### prescription

#### POST /api/prescription/addComment/{id}

- **Name:** POST /api/prescription/addComment/:id
- **Auth:** bearer
- **Handler:** addComment
- **Route File:** prescription.js
- **Description:** Handler: addComment Route File: prescription.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/prescription/addComment/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/prescription/addPrescription

- **Name:** POST /api/prescription/addPrescription
- **Auth:** bearer
- **Handler:** addPrescriptionById
- **Route File:** prescription.js
- **Description:** Handler: addPrescriptionById Route File: prescription.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Request Body:**
```json
{
  "Prescription": "",
  "date": "",
  "patient_id": "",
  "email": "",
  "prescriptionGivenBy": ""
}
```
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/prescription/addPrescription'
  -H 'Authorization: Bearer {{token}}'
  -H 'Content-Type: application/json'
  -d '{ ... }'
```

#### DELETE /api/prescription/deletePrescription/{id}

- **Name:** DELETE /api/prescription/deletePrescription/:id
- **Auth:** bearer
- **Handler:** deletePrescription
- **Route File:** prescription.js
- **Description:** Handler: deletePrescription Route File: prescription.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/prescription/deletePrescription/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/prescription/getPrescription/{id}

- **Name:** GET /api/prescription/getPrescription/:id
- **Auth:** bearer
- **Handler:** getPrescriptionsById
- **Route File:** prescription.js
- **Description:** Handler: getPrescriptionsById Route File: prescription.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/prescription/getPrescription/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### questions

#### GET /api/questions

- **Name:** GET /api/questions/
- **Auth:** bearer
- **Handler:** fetchQuestions
- **Route File:** questions.js
- **Description:** Handler: fetchQuestions Route File: questions.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/questions'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/questions

- **Name:** POST /api/questions/
- **Auth:** bearer
- **Handler:** addQuestion
- **Route File:** questions.js
- **Description:** Handler: addQuestion Route File: questions.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/questions'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/questions/{id}

- **Name:** DELETE /api/questions/:id
- **Auth:** bearer
- **Handler:** removeQuestion
- **Route File:** questions.js
- **Description:** Handler: removeQuestion Route File: questions.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/questions/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/questions/{id}

- **Name:** PUT /api/questions/:id
- **Auth:** bearer
- **Handler:** updateQuestion
- **Route File:** questions.js
- **Description:** Handler: updateQuestion Route File: questions.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/questions/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/questions/{type}

- **Name:** GET /api/questions/:type
- **Auth:** bearer
- **Handler:** fetchQuestionsByType
- **Route File:** questions.js
- **Description:** Handler: fetchQuestionsByType Route File: questions.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - type: `<<type>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/questions/{type}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/questions/dialysisParameter/{type}

- **Name:** GET /api/questions/dialysisParameter/:type
- **Auth:** bearer
- **Handler:** dialysisParametersByType
- **Route File:** questions.js
- **Description:** Handler: dialysisParametersByType Route File: questions.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - type: `<<type>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/questions/dialysisParameter/{type}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/questions/generalParameter/fetchQuestions

- **Name:** GET /api/questions/generalParameter/fetchQuestions
- **Auth:** bearer
- **Handler:** generalParametersByType
- **Route File:** questions.js
- **Description:** Handler: generalParametersByType Route File: questions.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/questions/generalParameter/fetchQuestions'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/questions/generalParameter/fetchResponse

- **Name:** GET /api/questions/generalParameter/fetchResponse
- **Auth:** bearer
- **Handler:** generalParametersByTypeWithResponse
- **Route File:** questions.js
- **Description:** Handler: generalParametersByTypeWithResponse Route File: questions.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/questions/generalParameter/fetchResponse'
  -H 'Authorization: Bearer {{token}}'
```

### readings_table

#### POST /api/readings_table/addDailyReadings

- **Name:** POST /api/readings_table/addDailyReadings
- **Auth:** bearer
- **Handler:** addDailyReading
- **Route File:** readings_table.js
- **Description:** Handler: addDailyReading Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/readings_table/addDailyReadings'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/readings_table/addDialysisReadings

- **Name:** POST /api/readings_table/addDialysisReadings
- **Auth:** bearer
- **Handler:** addDialysisReading
- **Route File:** readings_table.js
- **Description:** Handler: addDialysisReading Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/readings_table/addDialysisReadings'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/readings_table/deleteDailyReading/{id}

- **Name:** DELETE /api/readings_table/deleteDailyReading/:id
- **Auth:** bearer
- **Handler:** deleteDailyReading
- **Route File:** readings_table.js
- **Description:** Handler: deleteDailyReading Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/readings_table/deleteDailyReading/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/readings_table/deleteDialysisReading/{id}

- **Name:** DELETE /api/readings_table/deleteDialysisReading/:id
- **Auth:** bearer
- **Handler:** deleteDialysisReading
- **Route File:** readings_table.js
- **Description:** Handler: deleteDialysisReading Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/readings_table/deleteDialysisReading/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/readings_table/getAllUserReadingsByPid/{pid}

- **Name:** GET /api/readings_table/getAllUserReadingsByPid/:pid
- **Auth:** bearer
- **Handler:** getAllUserReadingsByPid
- **Route File:** readings_table.js
- **Description:** Handler: getAllUserReadingsByPid Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - pid: `<<pid>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/readings_table/getAllUserReadingsByPid/{pid}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/readings_table/getDailyReadings

- **Name:** GET /api/readings_table/getDailyReadings
- **Auth:** bearer
- **Handler:** getDailyReadings
- **Route File:** readings_table.js
- **Description:** Handler: getDailyReadings Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/readings_table/getDailyReadings'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/readings_table/getDialysisReadings

- **Name:** GET /api/readings_table/getDialysisReadings
- **Auth:** bearer
- **Handler:** getDialysisReadings
- **Route File:** readings_table.js
- **Description:** Handler: getDialysisReadings Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/readings_table/getDialysisReadings'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/readings_table/modifyDailyReadingsRange

- **Name:** POST /api/readings_table/modifyDailyReadingsRange
- **Auth:** bearer
- **Handler:** modifyDailyReadingRange
- **Route File:** readings_table.js
- **Description:** Handler: modifyDailyReadingRange Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/readings_table/modifyDailyReadingsRange'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/readings_table/modifyDialysisReadingsRange

- **Name:** POST /api/readings_table/modifyDialysisReadingsRange
- **Auth:** bearer
- **Handler:** modifyDialysisReadingRange
- **Route File:** readings_table.js
- **Description:** Handler: modifyDialysisReadingRange Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/readings_table/modifyDialysisReadingsRange'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/readings_table/postBulkDailyReadings

- **Name:** POST /api/readings_table/postBulkDailyReadings
- **Auth:** bearer
- **Handler:** postBulkDailyReadings
- **Route File:** readings_table.js
- **Description:** Handler: postBulkDailyReadings Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/readings_table/postBulkDailyReadings'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/readings_table/updateDailyReading

- **Name:** PUT /api/readings_table/updateDailyReading
- **Auth:** bearer
- **Handler:** updateDailyReading
- **Route File:** readings_table.js
- **Description:** Handler: updateDailyReading Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/readings_table/updateDailyReading'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/readings_table/updateDialysisReading

- **Name:** PUT /api/readings_table/updateDialysisReading
- **Auth:** bearer
- **Handler:** updateDialysisReading
- **Route File:** readings_table.js
- **Description:** Handler: updateDialysisReading Route File: readings_table.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/readings_table/updateDialysisReading'
  -H 'Authorization: Bearer {{token}}'
```

### requisition

#### DELETE /api/requisition/{id}

- **Name:** DELETE /api/requisition/:id
- **Auth:** bearer
- **Handler:** deleteRequisition
- **Route File:** requisition.js
- **Description:** Handler: deleteRequisition Route File: requisition.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/requisition/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/requisition/{id}

- **Name:** PUT /api/requisition/:id
- **Auth:** bearer
- **Handler:** updateRequisition
- **Route File:** requisition.js
- **Description:** Handler: updateRequisition Route File: requisition.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/requisition/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/requisition/add

- **Name:** POST /api/requisition/add
- **Auth:** bearer
- **Handler:** addRequisition
- **Route File:** requisition.js
- **Description:** Handler: addRequisition Route File: requisition.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/requisition/add'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/requisition/byId/{id}

- **Name:** GET /api/requisition/byId/:id
- **Auth:** bearer
- **Handler:** getRequisitionById
- **Route File:** requisition.js
- **Description:** Handler: getRequisitionById Route File: requisition.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/requisition/byId/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/requisition/getRequisition/{id}

- **Name:** GET /api/requisition/getRequisition/:id
- **Auth:** bearer
- **Handler:** getRequisition
- **Route File:** requisition.js
- **Description:** Handler: getRequisition Route File: requisition.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/requisition/getRequisition/{id}'
  -H 'Authorization: Bearer {{token}}'
```

### roles

#### GET /api/roles

- **Name:** GET /api/roles/
- **Auth:** bearer
- **Handler:** getRoles
- **Route File:** roles.js
- **Description:** Handler: getRoles Route File: roles.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/roles'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/roles

- **Name:** POST /api/roles/
- **Auth:** bearer
- **Handler:** addRole
- **Route File:** roles.js
- **Description:** Handler: addRole Route File: roles.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/roles'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/roles/byName/{role_name}

- **Name:** DELETE /api/roles/byName/:role_name
- **Auth:** bearer
- **Handler:** deleteRole
- **Route File:** roles.js
- **Description:** Handler: deleteRole Route File: roles.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - role_name: `<<role_name>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/roles/byName/{role_name}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/roles/byName/{role_name}

- **Name:** GET /api/roles/byName/:role_name
- **Auth:** bearer
- **Handler:** getRoleByName
- **Route File:** roles.js
- **Description:** Handler: getRoleByName Route File: roles.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - role_name: `<<role_name>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/roles/byName/{role_name}'
  -H 'Authorization: Bearer {{token}}'
```

#### PUT /api/roles/byName/{role_name}

- **Name:** PUT /api/roles/byName/:role_name
- **Auth:** bearer
- **Handler:** updateRole
- **Route File:** roles.js
- **Description:** Handler: updateRole Route File: roles.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - role_name: `<<role_name>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/roles/byName/{role_name}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/roles/identifyrole

- **Name:** GET /api/roles/identifyrole/
- **Auth:** bearer
- **Handler:** getUserRole
- **Route File:** roles.js
- **Description:** Handler: getUserRole Route File: roles.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/roles/identifyrole'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/roles/isDoctor

- **Name:** GET /api/roles/isDoctor/
- **Auth:** bearer
- **Handler:** isDoctor
- **Route File:** roles.js
- **Description:** Handler: isDoctor Route File: roles.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/roles/isDoctor'
  -H 'Authorization: Bearer {{token}}'
```

### SortAlerts

#### GET /api/SortAlerts/{admin_id}

- **Name:** GET /api/SortAlerts/:admin_id
- **Auth:** bearer
- **Handler:** getAdminAlerts
- **Route File:** SortAlerts.js
- **Description:** Handler: getAdminAlerts Route File: SortAlerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - admin_id: `<<admin_id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/SortAlerts/{admin_id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/SortAlerts/doctor/{doctor_id}

- **Name:** GET /api/SortAlerts/doctor/:doctor_id
- **Auth:** bearer
- **Handler:** getDoctorAlerts
- **Route File:** SortAlerts.js
- **Description:** Handler: getDoctorAlerts Route File: SortAlerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - doctor_id: `<<doctor_id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/SortAlerts/doctor/{doctor_id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/SortAlerts/emails/sendEmails

- **Name:** GET /api/SortAlerts/emails/sendEmails
- **Auth:** bearer
- **Handler:** sendEmails
- **Route File:** SortAlerts.js
- **Description:** Handler: sendEmails Route File: SortAlerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/SortAlerts/emails/sendEmails'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/SortAlerts/superAdminAlerts/{admin_id}

- **Name:** GET /api/SortAlerts/superAdminAlerts/:admin_id
- **Auth:** bearer
- **Handler:** getSuperAdminExtraAlerts
- **Route File:** SortAlerts.js
- **Description:** Handler: getSuperAdminExtraAlerts Route File: SortAlerts.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - admin_id: `<<admin_id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/SortAlerts/superAdminAlerts/{admin_id}'
  -H 'Authorization: Bearer {{token}}'
```

### teleconsultation

#### POST /api/teleconsultation/bookAppointment

- **Name:** POST /api/teleconsultation/bookAppointment
- **Auth:** bearer
- **Handler:** bookAppointment
- **Route File:** teleconsultation.js
- **Description:** Handler: bookAppointment Route File: teleconsultation.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/teleconsultation/bookAppointment'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/teleconsultation/getAllAppointmentsById

- **Name:** GET /api/teleconsultation/getAllAppointmentsById
- **Auth:** bearer
- **Handler:** getAllAppointments
- **Route File:** teleconsultation.js
- **Description:** Handler: getAllAppointments Route File: teleconsultation.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/teleconsultation/getAllAppointmentsById'
  -H 'Authorization: Bearer {{token}}'
```

### tempRoutes

#### GET /api/tempRoutes/bp

- **Name:** GET /api/tempRoutes/bp
- **Auth:** none
- **Handler:** res
- **Route File:** tempRoutes.js
- **Description:** Handler: res Route File: tempRoutes.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/tempRoutes/bp'
```

#### POST /api/tempRoutes/bp

- **Name:** POST /api/tempRoutes/bp
- **Auth:** none
- **Handler:** res
- **Route File:** tempRoutes.js
- **Description:** Handler: res Route File: tempRoutes.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/tempRoutes/bp'
```

#### DELETE /api/tempRoutes/bp/{id}

- **Name:** DELETE /api/tempRoutes/bp/:id
- **Auth:** none
- **Handler:** res
- **Route File:** tempRoutes.js
- **Description:** Handler: res Route File: tempRoutes.js
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/tempRoutes/bp/{id}'
```

#### PUT /api/tempRoutes/bp/{id}

- **Name:** PUT /api/tempRoutes/bp/:id
- **Auth:** none
- **Handler:** res
- **Route File:** tempRoutes.js
- **Description:** Handler: res Route File: tempRoutes.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/tempRoutes/bp/{id}'
```

#### GET /api/tempRoutes/bp/limits

- **Name:** GET /api/tempRoutes/bp/limits
- **Auth:** none
- **Handler:** res
- **Route File:** tempRoutes.js
- **Description:** Handler: res Route File: tempRoutes.js
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/tempRoutes/bp/limits'
```

#### POST /api/tempRoutes/bp/limits

- **Name:** POST /api/tempRoutes/bp/limits
- **Auth:** none
- **Handler:** res
- **Route File:** tempRoutes.js
- **Description:** Handler: res Route File: tempRoutes.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/tempRoutes/bp/limits'
```

#### PUT /api/tempRoutes/bp/limits

- **Name:** PUT /api/tempRoutes/bp/limits
- **Auth:** none
- **Handler:** res
- **Route File:** tempRoutes.js
- **Description:** Handler: res Route File: tempRoutes.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/tempRoutes/bp/limits'
```

### userRange

#### GET /api/userRange/getRange

- **Name:** GET /api/userRange/getRange
- **Auth:** bearer
- **Handler:** getRange
- **Route File:** userRange.js
- **Description:** Handler: getRange Route File: userRange.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/userRange/getRange'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/userRange/getRange/dia/sys

- **Name:** GET /api/userRange/getRange/dia/sys
- **Auth:** bearer
- **Handler:** getRangeSysDia
- **Route File:** userRange.js
- **Description:** Handler: getRangeSysDia Route File: userRange.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/userRange/getRange/dia/sys'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/userRange/getRange/sys

- **Name:** GET /api/userRange/getRange/sys
- **Auth:** bearer
- **Handler:** getRangeSys
- **Route File:** userRange.js
- **Description:** Handler: getRangeSys Route File: userRange.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/userRange/getRange/sys'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/userRange/setRange

- **Name:** POST /api/userRange/setRange
- **Auth:** bearer
- **Handler:** setRange
- **Route File:** userRange.js
- **Description:** Handler: setRange Route File: userRange.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/userRange/setRange'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/userRange/setRange/dia/sys

- **Name:** POST /api/userRange/setRange/dia/sys
- **Auth:** bearer
- **Handler:** setRangeSysDia
- **Route File:** userRange.js
- **Description:** Handler: setRangeSysDia Route File: userRange.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/userRange/setRange/dia/sys'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/userRange/setRange/sys

- **Name:** POST /api/userRange/setRange/sys
- **Auth:** bearer
- **Handler:** setRangeSys
- **Route File:** userRange.js
- **Description:** Handler: setRangeSys Route File: userRange.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/userRange/setRange/sys'
  -H 'Authorization: Bearer {{token}}'
```

### userRangeDialysis

#### GET /api/userRangeDialysis/getRange

- **Name:** GET /api/userRangeDialysis/getRange
- **Auth:** bearer
- **Handler:** getRange
- **Route File:** userRangeDialysis.js
- **Description:** Handler: getRange Route File: userRangeDialysis.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/userRangeDialysis/getRange'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/userRangeDialysis/setRange

- **Name:** POST /api/userRangeDialysis/setRange
- **Auth:** bearer
- **Handler:** setRange
- **Route File:** userRangeDialysis.js
- **Description:** Handler: setRange Route File: userRangeDialysis.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/userRangeDialysis/setRange'
  -H 'Authorization: Bearer {{token}}'
```

### userResponses

#### GET /api/userResponses/getResponses

- **Name:** GET /api/userResponses/getResponses
- **Auth:** bearer
- **Handler:** fetchUserResponse
- **Route File:** userResponses.js
- **Description:** Handler: fetchUserResponse Route File: userResponses.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Query Params:**
  - user_id: `<<user_id>>` - Query parameter: user_id
  - question_id: `<<question_id>>` - Query parameter: question_id
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/userResponses/getResponses'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/userResponses/save

- **Name:** POST /api/userResponses/save
- **Auth:** bearer
- **Handler:** saveResponses
- **Route File:** userResponses.js
- **Description:** Handler: saveResponses Route File: userResponses.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Request Body:**
```json
{
  "user_id": "",
  "response": "",
  "question_id": ""
}
```
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/userResponses/save'
  -H 'Authorization: Bearer {{token}}'
  -H 'Content-Type: application/json'
  -d '{ ... }'
```

### users

#### GET /api/users

- **Name:** GET /api/users/
- **Auth:** bearer
- **Handler:** getUsers
- **Route File:** users.js
- **Description:** Handler: getUsers Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users'
  -H 'Authorization: Bearer {{token}}'
```

#### DELETE /api/users/{email}

- **Name:** DELETE /api/users/:email
- **Auth:** none
- **Handler:** deleteUser
- **Route File:** users.js
- **Description:** Handler: deleteUser Route File: users.js
- **Path Variables:**
  - email: `<<email>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X DELETE '{{base_url}}/api/users/{email}'
```

#### PUT /api/users/{email}

- **Name:** PUT /api/users/:email
- **Auth:** none
- **Handler:** updateUser
- **Route File:** users.js
- **Description:** Handler: updateUser Route File: users.js
- **Headers:**
  - Content-Type: `application/json` (required)
- **Path Variables:**
  - email: `<<email>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X PUT '{{base_url}}/api/users/{email}'
```

#### GET /api/users/admins

- **Name:** GET /api/users/admins
- **Auth:** bearer
- **Handler:** getUsersAdmins
- **Route File:** users.js
- **Description:** Handler: getUsersAdmins Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/admins'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/users/assignedToPatient/{id}

- **Name:** GET /api/users/assignedToPatient/:id
- **Auth:** bearer
- **Handler:** getUsersAssignedToPatient
- **Route File:** users.js
- **Description:** Handler: getUsersAssignedToPatient Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/assignedToPatient/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### POST /api/users/byEmail/id

- **Name:** POST /api/users/byEmail/id
- **Auth:** bearer
- **Handler:** getidbyEmail
- **Route File:** users.js
- **Description:** Handler: getidbyEmail Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
  - Content-Type: `application/json` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X POST '{{base_url}}/api/users/byEmail/id'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/users/byRole/{role}

- **Name:** GET /api/users/byRole/:role
- **Auth:** bearer
- **Handler:** getUsersbyRole
- **Route File:** users.js
- **Description:** Handler: getUsersbyRole Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - role: `<<role>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/byRole/{role}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/users/docAssignedToPatient/{id}

- **Name:** GET /api/users/docAssignedToPatient/:id
- **Auth:** bearer
- **Handler:** getDoctorsAssignedToPatient
- **Route File:** users.js
- **Description:** Handler: getDoctorsAssignedToPatient Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Path Variables:**
  - id: `<<id>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/docAssignedToPatient/{id}'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/users/email/{email}

- **Name:** GET /api/users/email/:email
- **Auth:** none
- **Handler:** getUserbyEmail
- **Route File:** users.js
- **Description:** Handler: getUserbyEmail Route File: users.js
- **Path Variables:**
  - email: `<<email>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/email/{email}'
```

#### GET /api/users/email/doctor/{email}

- **Name:** GET /api/users/email/doctor/:email
- **Auth:** none
- **Handler:** getUserbyEmailDoctor
- **Route File:** users.js
- **Description:** Handler: getUserbyEmailDoctor Route File: users.js
- **Path Variables:**
  - email: `<<email>>`
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/email/doctor/{email}'
```

#### GET /api/users/isDoctor

- **Name:** GET /api/users/isDoctor
- **Auth:** bearer
- **Handler:** isDoctor
- **Route File:** users.js
- **Description:** Handler: isDoctor Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/isDoctor'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/users/total

- **Name:** GET /api/users/total
- **Auth:** bearer
- **Handler:** getTotalUsers
- **Route File:** users.js
- **Description:** Handler: getTotalUsers Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/total'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/users/totalThisWeek

- **Name:** GET /api/users/totalThisWeek
- **Auth:** bearer
- **Handler:** getTotalUsersThisWeek
- **Route File:** users.js
- **Description:** Handler: getTotalUsersThisWeek Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/totalThisWeek'
  -H 'Authorization: Bearer {{token}}'
```

#### GET /api/users/totalThisWeekSub

- **Name:** GET /api/users/totalThisWeekSub
- **Auth:** bearer
- **Handler:** getTotalUsersThisWeekPSadmin
- **Route File:** users.js
- **Description:** Handler: getTotalUsersThisWeekPSadmin Route File: users.js
- **Headers:**
  - Authorization: `Bearer <<token>>` (required)
- **Implementation Notes:**
  1. Register route and method in the module router.
  2. Validate path/query/body input before controller logic.
  3. Enforce auth/role checks where `Auth` is `bearer`.
  4. Return consistent JSON response and proper HTTP status codes.
- **Example cURL:**
```bash
curl -X GET '{{base_url}}/api/users/totalThisWeekSub'
  -H 'Authorization: Bearer {{token}}'
```

