# Kifayti API — LLM Endpoint Spec

Total endpoints: **276**

Use each block as a direct machine-readable unit for code generation, tests, and API clients.

## ENDPOINT
```json
{
  "id": "cmlm1hrx12sqxk91knhthmapa",
  "name": "GET /api/Languages/",
  "module": "Languages",
  "method": "GET",
  "path": "/api/Languages",
  "auth": "bearer",
  "handler": "getAllLanguages",
  "routeFile": "Languages.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrx12sqzk91kmv3mnytp",
  "name": "POST /api/Languages/",
  "module": "Languages",
  "method": "POST",
  "path": "/api/Languages",
  "auth": "bearer",
  "handler": "insertLanguage",
  "routeFile": "Languages.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrx12sr1k91kqgnn157m",
  "name": "DELETE /api/Languages/:id",
  "module": "Languages",
  "method": "DELETE",
  "path": "/api/Languages/{id}",
  "auth": "bearer",
  "handler": "deleteLanguage",
  "routeFile": "Languages.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrx12sr3k91k8l48fb48",
  "name": "PUT /api/Languages/:id",
  "module": "Languages",
  "method": "PUT",
  "path": "/api/Languages/{id}",
  "auth": "bearer",
  "handler": "updateLanguage",
  "routeFile": "Languages.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvw2t3xk91k8zbgyzeu",
  "name": "POST /api/readings_table/addDailyReadings",
  "module": "readings_table",
  "method": "POST",
  "path": "/api/readings_table/addDailyReadings",
  "auth": "bearer",
  "handler": "addDailyReading",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvx2t3zk91k92bisrcb",
  "name": "POST /api/readings_table/addDialysisReadings",
  "module": "readings_table",
  "method": "POST",
  "path": "/api/readings_table/addDialysisReadings",
  "auth": "bearer",
  "handler": "addDialysisReading",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvx2t41k91ktt37b4qy",
  "name": "DELETE /api/readings_table/deleteDailyReading/:id",
  "module": "readings_table",
  "method": "DELETE",
  "path": "/api/readings_table/deleteDailyReading/{id}",
  "auth": "bearer",
  "handler": "deleteDailyReading",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvx2t43k91k8ara7qde",
  "name": "DELETE /api/readings_table/deleteDialysisReading/:id",
  "module": "readings_table",
  "method": "DELETE",
  "path": "/api/readings_table/deleteDialysisReading/{id}",
  "auth": "bearer",
  "handler": "deleteDialysisReading",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvx2t45k91kieb1dw1c",
  "name": "GET /api/readings_table/getAllUserReadingsByPid/:pid",
  "module": "readings_table",
  "method": "GET",
  "path": "/api/readings_table/getAllUserReadingsByPid/{pid}",
  "auth": "bearer",
  "handler": "getAllUserReadingsByPid",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "pid",
      "example": "<<pid>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvx2t47k91kwkuulg3t",
  "name": "GET /api/readings_table/getDailyReadings",
  "module": "readings_table",
  "method": "GET",
  "path": "/api/readings_table/getDailyReadings",
  "auth": "bearer",
  "handler": "getDailyReadings",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvx2t49k91ksn85nam9",
  "name": "GET /api/readings_table/getDialysisReadings",
  "module": "readings_table",
  "method": "GET",
  "path": "/api/readings_table/getDialysisReadings",
  "auth": "bearer",
  "handler": "getDialysisReadings",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvx2t4bk91ksot11l2v",
  "name": "POST /api/readings_table/modifyDailyReadingsRange",
  "module": "readings_table",
  "method": "POST",
  "path": "/api/readings_table/modifyDailyReadingsRange",
  "auth": "bearer",
  "handler": "modifyDailyReadingRange",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvy2t4dk91kpz6n4l62",
  "name": "POST /api/readings_table/modifyDialysisReadingsRange",
  "module": "readings_table",
  "method": "POST",
  "path": "/api/readings_table/modifyDialysisReadingsRange",
  "auth": "bearer",
  "handler": "modifyDialysisReadingRange",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvy2t4fk91krincguts",
  "name": "POST /api/readings_table/postBulkDailyReadings",
  "module": "readings_table",
  "method": "POST",
  "path": "/api/readings_table/postBulkDailyReadings",
  "auth": "bearer",
  "handler": "postBulkDailyReadings",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvy2t4hk91kx5w2uj4u",
  "name": "PUT /api/readings_table/updateDailyReading",
  "module": "readings_table",
  "method": "PUT",
  "path": "/api/readings_table/updateDailyReading",
  "auth": "bearer",
  "handler": "updateDailyReading",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsvy2t4jk91kw9vu16eh",
  "name": "PUT /api/readings_table/updateDialysisReading",
  "module": "readings_table",
  "method": "PUT",
  "path": "/api/readings_table/updateDialysisReading",
  "auth": "bearer",
  "handler": "updateDialysisReading",
  "routeFile": "readings_table.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsuo2t3gk91klk5q9ar2",
  "name": "GET /api/questions/",
  "module": "questions",
  "method": "GET",
  "path": "/api/questions",
  "auth": "bearer",
  "handler": "fetchQuestions",
  "routeFile": "questions.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsuo2t3ik91kb3su2cfj",
  "name": "POST /api/questions/",
  "module": "questions",
  "method": "POST",
  "path": "/api/questions",
  "auth": "bearer",
  "handler": "addQuestion",
  "routeFile": "questions.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsuo2t3kk91kqcnslyb0",
  "name": "DELETE /api/questions/:id",
  "module": "questions",
  "method": "DELETE",
  "path": "/api/questions/{id}",
  "auth": "bearer",
  "handler": "removeQuestion",
  "routeFile": "questions.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsuo2t3mk91keqc54gcf",
  "name": "PUT /api/questions/:id",
  "module": "questions",
  "method": "PUT",
  "path": "/api/questions/{id}",
  "auth": "bearer",
  "handler": "updateQuestion",
  "routeFile": "questions.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsup2t3ok91kfo2jrqp7",
  "name": "GET /api/questions/:type",
  "module": "questions",
  "method": "GET",
  "path": "/api/questions/{type}",
  "auth": "bearer",
  "handler": "fetchQuestionsByType",
  "routeFile": "questions.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "type",
      "example": "<<type>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsup2t3qk91k2p90xu62",
  "name": "GET /api/questions/dialysisParameter/:type",
  "module": "questions",
  "method": "GET",
  "path": "/api/questions/dialysisParameter/{type}",
  "auth": "bearer",
  "handler": "dialysisParametersByType",
  "routeFile": "questions.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "type",
      "example": "<<type>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsup2t3sk91kr6ju90ew",
  "name": "GET /api/questions/generalParameter/fetchQuestions",
  "module": "questions",
  "method": "GET",
  "path": "/api/questions/generalParameter/fetchQuestions",
  "auth": "bearer",
  "handler": "generalParametersByType",
  "routeFile": "questions.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsup2t3uk91kcnsnvvhl",
  "name": "GET /api/questions/generalParameter/fetchResponse",
  "module": "questions",
  "method": "GET",
  "path": "/api/questions/generalParameter/fetchResponse",
  "auth": "bearer",
  "handler": "generalParametersByTypeWithResponse",
  "routeFile": "questions.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsxk2t4mk91kws73u6ex",
  "name": "DELETE /api/requisition/:id",
  "module": "requisition",
  "method": "DELETE",
  "path": "/api/requisition/{id}",
  "auth": "bearer",
  "handler": "deleteRequisition",
  "routeFile": "requisition.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsxl2t4ok91k910e8igx",
  "name": "PUT /api/requisition/:id",
  "module": "requisition",
  "method": "PUT",
  "path": "/api/requisition/{id}",
  "auth": "bearer",
  "handler": "updateRequisition",
  "routeFile": "requisition.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsxl2t4qk91kk1639yts",
  "name": "POST /api/requisition/add",
  "module": "requisition",
  "method": "POST",
  "path": "/api/requisition/add",
  "auth": "bearer",
  "handler": "addRequisition",
  "routeFile": "requisition.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsxl2t4sk91kouvqh51d",
  "name": "GET /api/requisition/byId/:id",
  "module": "requisition",
  "method": "GET",
  "path": "/api/requisition/byId/{id}",
  "auth": "bearer",
  "handler": "getRequisitionById",
  "routeFile": "requisition.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsxl2t4uk91kb04pfn9m",
  "name": "GET /api/requisition/getRequisition/:id",
  "module": "requisition",
  "method": "GET",
  "path": "/api/requisition/getRequisition/{id}",
  "auth": "bearer",
  "handler": "getRequisition",
  "routeFile": "requisition.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsyh2t4xk91kvcc429la",
  "name": "GET /api/roles/",
  "module": "roles",
  "method": "GET",
  "path": "/api/roles",
  "auth": "bearer",
  "handler": "getRoles",
  "routeFile": "roles.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsyh2t4zk91kl4g4ix93",
  "name": "POST /api/roles/",
  "module": "roles",
  "method": "POST",
  "path": "/api/roles",
  "auth": "bearer",
  "handler": "addRole",
  "routeFile": "roles.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsyh2t51k91k8gi3ldrm",
  "name": "DELETE /api/roles/byName/:role_name",
  "module": "roles",
  "method": "DELETE",
  "path": "/api/roles/byName/{role_name}",
  "auth": "bearer",
  "handler": "deleteRole",
  "routeFile": "roles.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "role_name",
      "example": "<<role_name>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsyi2t53k91k5qwkdpe6",
  "name": "GET /api/roles/byName/:role_name",
  "module": "roles",
  "method": "GET",
  "path": "/api/roles/byName/{role_name}",
  "auth": "bearer",
  "handler": "getRoleByName",
  "routeFile": "roles.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "role_name",
      "example": "<<role_name>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsyi2t55k91k4fjkjchg",
  "name": "PUT /api/roles/byName/:role_name",
  "module": "roles",
  "method": "PUT",
  "path": "/api/roles/byName/{role_name}",
  "auth": "bearer",
  "handler": "updateRole",
  "routeFile": "roles.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "role_name",
      "example": "<<role_name>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsyi2t57k91kgtwolgqx",
  "name": "GET /api/roles/identifyrole/",
  "module": "roles",
  "method": "GET",
  "path": "/api/roles/identifyrole",
  "auth": "bearer",
  "handler": "getUserRole",
  "routeFile": "roles.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsyi2t59k91kmk55gnyj",
  "name": "GET /api/roles/isDoctor/",
  "module": "roles",
  "method": "GET",
  "path": "/api/roles/isDoctor",
  "auth": "bearer",
  "handler": "isDoctor",
  "routeFile": "roles.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hszm2t5ck91kah6vqx5m",
  "name": "POST /api/teleconsultation/bookAppointment",
  "module": "teleconsultation",
  "method": "POST",
  "path": "/api/teleconsultation/bookAppointment",
  "auth": "bearer",
  "handler": "bookAppointment",
  "routeFile": "teleconsultation.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hszm2t5ek91knxnram4j",
  "name": "GET /api/teleconsultation/getAllAppointmentsById",
  "module": "teleconsultation",
  "method": "GET",
  "path": "/api/teleconsultation/getAllAppointmentsById",
  "auth": "bearer",
  "handler": "getAllAppointments",
  "routeFile": "teleconsultation.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht072t5hk91km819twxk",
  "name": "GET /api/tempRoutes/bp",
  "module": "tempRoutes",
  "method": "GET",
  "path": "/api/tempRoutes/bp",
  "auth": "none",
  "handler": "res",
  "routeFile": "tempRoutes.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht082t5jk91kqcix7h2b",
  "name": "POST /api/tempRoutes/bp",
  "module": "tempRoutes",
  "method": "POST",
  "path": "/api/tempRoutes/bp",
  "auth": "none",
  "handler": "res",
  "routeFile": "tempRoutes.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht082t5lk91kll1xue84",
  "name": "DELETE /api/tempRoutes/bp/:id",
  "module": "tempRoutes",
  "method": "DELETE",
  "path": "/api/tempRoutes/bp/{id}",
  "auth": "none",
  "handler": "res",
  "routeFile": "tempRoutes.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht082t5nk91k33cawd9o",
  "name": "PUT /api/tempRoutes/bp/:id",
  "module": "tempRoutes",
  "method": "PUT",
  "path": "/api/tempRoutes/bp/{id}",
  "auth": "none",
  "handler": "res",
  "routeFile": "tempRoutes.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht082t5pk91kkcjknlci",
  "name": "GET /api/tempRoutes/bp/limits",
  "module": "tempRoutes",
  "method": "GET",
  "path": "/api/tempRoutes/bp/limits",
  "auth": "none",
  "handler": "res",
  "routeFile": "tempRoutes.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht082t5rk91kky2tz3xj",
  "name": "POST /api/tempRoutes/bp/limits",
  "module": "tempRoutes",
  "method": "POST",
  "path": "/api/tempRoutes/bp/limits",
  "auth": "none",
  "handler": "res",
  "routeFile": "tempRoutes.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht082t5tk91ka3tsoihr",
  "name": "PUT /api/tempRoutes/bp/limits",
  "module": "tempRoutes",
  "method": "PUT",
  "path": "/api/tempRoutes/bp/limits",
  "auth": "none",
  "handler": "res",
  "routeFile": "tempRoutes.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht1b2t5wk91k2rays5up",
  "name": "GET /api/userRange/getRange",
  "module": "userRange",
  "method": "GET",
  "path": "/api/userRange/getRange",
  "auth": "bearer",
  "handler": "getRange",
  "routeFile": "userRange.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht1b2t5yk91k1lthef87",
  "name": "GET /api/userRange/getRange/dia/sys",
  "module": "userRange",
  "method": "GET",
  "path": "/api/userRange/getRange/dia/sys",
  "auth": "bearer",
  "handler": "getRangeSysDia",
  "routeFile": "userRange.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht1b2t60k91ksm7xhv5a",
  "name": "GET /api/userRange/getRange/sys",
  "module": "userRange",
  "method": "GET",
  "path": "/api/userRange/getRange/sys",
  "auth": "bearer",
  "handler": "getRangeSys",
  "routeFile": "userRange.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht1b2t62k91ksq1ep8i3",
  "name": "POST /api/userRange/setRange",
  "module": "userRange",
  "method": "POST",
  "path": "/api/userRange/setRange",
  "auth": "bearer",
  "handler": "setRange",
  "routeFile": "userRange.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht1b2t64k91k0x8mqd1z",
  "name": "POST /api/userRange/setRange/dia/sys",
  "module": "userRange",
  "method": "POST",
  "path": "/api/userRange/setRange/dia/sys",
  "auth": "bearer",
  "handler": "setRangeSysDia",
  "routeFile": "userRange.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht1b2t66k91kt7y7fb1s",
  "name": "POST /api/userRange/setRange/sys",
  "module": "userRange",
  "method": "POST",
  "path": "/api/userRange/setRange/sys",
  "auth": "bearer",
  "handler": "setRangeSys",
  "routeFile": "userRange.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht2c2t69k91kf02p1vye",
  "name": "GET /api/userRangeDialysis/getRange",
  "module": "userRangeDialysis",
  "method": "GET",
  "path": "/api/userRangeDialysis/getRange",
  "auth": "bearer",
  "handler": "getRange",
  "routeFile": "userRangeDialysis.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht2c2t6bk91keysew9s0",
  "name": "POST /api/userRangeDialysis/setRange",
  "module": "userRangeDialysis",
  "method": "POST",
  "path": "/api/userRangeDialysis/setRange",
  "auth": "bearer",
  "handler": "setRange",
  "routeFile": "userRangeDialysis.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht2z2t6ek91ke6qrvhw1",
  "name": "GET /api/userResponses/getResponses",
  "module": "userResponses",
  "method": "GET",
  "path": "/api/userResponses/getResponses",
  "auth": "bearer",
  "handler": "fetchUserResponse",
  "routeFile": "userResponses.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [
    {
      "key": "user_id",
      "example": "<<user_id>>",
      "description": "Query parameter: user_id"
    },
    {
      "key": "question_id",
      "example": "<<question_id>>",
      "description": "Query parameter: question_id"
    }
  ],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht2z2t6gk91k8ndococf",
  "name": "POST /api/userResponses/save",
  "module": "userResponses",
  "method": "POST",
  "path": "/api/userResponses/save",
  "auth": "bearer",
  "handler": "saveResponses",
  "routeFile": "userResponses.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": {
    "user_id": "",
    "response": "",
    "question_id": ""
  },
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3m2t6jk91kt128e3kc",
  "name": "GET /api/users/",
  "module": "users",
  "method": "GET",
  "path": "/api/users",
  "auth": "bearer",
  "handler": "getUsers",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3m2t6lk91ksu8yhfll",
  "name": "DELETE /api/users/:email",
  "module": "users",
  "method": "DELETE",
  "path": "/api/users/{email}",
  "auth": "none",
  "handler": "deleteUser",
  "routeFile": "users.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "email",
      "example": "<<email>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3m2t6nk91kaexvt497",
  "name": "PUT /api/users/:email",
  "module": "users",
  "method": "PUT",
  "path": "/api/users/{email}",
  "auth": "none",
  "handler": "updateUser",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "email",
      "example": "<<email>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3n2t6pk91k4rmsb4dy",
  "name": "GET /api/users/admins",
  "module": "users",
  "method": "GET",
  "path": "/api/users/admins",
  "auth": "bearer",
  "handler": "getUsersAdmins",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3n2t6rk91kr0r967yg",
  "name": "GET /api/users/assignedToPatient/:id",
  "module": "users",
  "method": "GET",
  "path": "/api/users/assignedToPatient/{id}",
  "auth": "bearer",
  "handler": "getUsersAssignedToPatient",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3n2t6tk91khpp7kchf",
  "name": "POST /api/users/byEmail/id",
  "module": "users",
  "method": "POST",
  "path": "/api/users/byEmail/id",
  "auth": "bearer",
  "handler": "getidbyEmail",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3n2t6vk91kn6u1pyka",
  "name": "GET /api/users/byRole/:role",
  "module": "users",
  "method": "GET",
  "path": "/api/users/byRole/{role}",
  "auth": "bearer",
  "handler": "getUsersbyRole",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "role",
      "example": "<<role>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3n2t6xk91k18pagyyw",
  "name": "GET /api/users/docAssignedToPatient/:id",
  "module": "users",
  "method": "GET",
  "path": "/api/users/docAssignedToPatient/{id}",
  "auth": "bearer",
  "handler": "getDoctorsAssignedToPatient",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3n2t6zk91k21naes59",
  "name": "GET /api/users/email/:email",
  "module": "users",
  "method": "GET",
  "path": "/api/users/email/{email}",
  "auth": "none",
  "handler": "getUserbyEmail",
  "routeFile": "users.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "email",
      "example": "<<email>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3n2t71k91kx4qeqsh9",
  "name": "GET /api/users/email/doctor/:email",
  "module": "users",
  "method": "GET",
  "path": "/api/users/email/doctor/{email}",
  "auth": "none",
  "handler": "getUserbyEmailDoctor",
  "routeFile": "users.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "email",
      "example": "<<email>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3n2t73k91k5v22uqz8",
  "name": "GET /api/users/isDoctor",
  "module": "users",
  "method": "GET",
  "path": "/api/users/isDoctor",
  "auth": "bearer",
  "handler": "isDoctor",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3o2t75k91kvttoch74",
  "name": "GET /api/users/total",
  "module": "users",
  "method": "GET",
  "path": "/api/users/total",
  "auth": "bearer",
  "handler": "getTotalUsers",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3o2t77k91kbuxifdkm",
  "name": "GET /api/users/totalThisWeek",
  "module": "users",
  "method": "GET",
  "path": "/api/users/totalThisWeek",
  "auth": "bearer",
  "handler": "getTotalUsersThisWeek",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1ht3o2t79k91kx82mmlv4",
  "name": "GET /api/users/totalThisWeekSub",
  "module": "users",
  "method": "GET",
  "path": "/api/users/totalThisWeekSub",
  "auth": "bearer",
  "handler": "getTotalUsersThisWeekPSadmin",
  "routeFile": "users.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrxw2sr6k91kw8fmagso",
  "name": "GET /api/SortAlerts/:admin_id",
  "module": "SortAlerts",
  "method": "GET",
  "path": "/api/SortAlerts/{admin_id}",
  "auth": "bearer",
  "handler": "getAdminAlerts",
  "routeFile": "SortAlerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "admin_id",
      "example": "<<admin_id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrxw2sr8k91k5mswnm60",
  "name": "GET /api/SortAlerts/doctor/:doctor_id",
  "module": "SortAlerts",
  "method": "GET",
  "path": "/api/SortAlerts/doctor/{doctor_id}",
  "auth": "bearer",
  "handler": "getDoctorAlerts",
  "routeFile": "SortAlerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "doctor_id",
      "example": "<<doctor_id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrxw2srak91kjme7v6eb",
  "name": "GET /api/SortAlerts/emails/sendEmails",
  "module": "SortAlerts",
  "method": "GET",
  "path": "/api/SortAlerts/emails/sendEmails",
  "auth": "bearer",
  "handler": "sendEmails",
  "routeFile": "SortAlerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrxw2srck91kndts10s2",
  "name": "GET /api/SortAlerts/superAdminAlerts/:admin_id",
  "module": "SortAlerts",
  "method": "GET",
  "path": "/api/SortAlerts/superAdminAlerts/{admin_id}",
  "auth": "bearer",
  "handler": "getSuperAdminExtraAlerts",
  "routeFile": "SortAlerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "admin_id",
      "example": "<<admin_id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hryn2srfk91kljhvrwpt",
  "name": "POST /api/adminPatient/addAdmin/:id",
  "module": "adminPatient",
  "method": "POST",
  "path": "/api/adminPatient/addAdmin/{id}",
  "auth": "bearer",
  "handler": "addAdminToPatient",
  "routeFile": "adminPatient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hryn2srhk91ktu52a30n",
  "name": "DELETE /api/adminPatient/deleteAdmin/:id",
  "module": "adminPatient",
  "method": "DELETE",
  "path": "/api/adminPatient/deleteAdmin/{id}",
  "auth": "bearer",
  "handler": "deleteAssignedAdmin",
  "routeFile": "adminPatient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hryn2srjk91ksbuzo3q4",
  "name": "GET /api/adminPatient/getAdmin/:id",
  "module": "adminPatient",
  "method": "GET",
  "path": "/api/adminPatient/getAdmin/{id}",
  "auth": "bearer",
  "handler": "getAdminData",
  "routeFile": "adminPatient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrze2srmk91khx2r8ait",
  "name": "GET /api/ailment/",
  "module": "ailment",
  "method": "GET",
  "path": "/api/ailment",
  "auth": "bearer",
  "handler": "getAilments",
  "routeFile": "ailment.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrze2srok91kc1140qc2",
  "name": "GET /api/ailment/:lang",
  "module": "ailment",
  "method": "GET",
  "path": "/api/ailment/{lang}",
  "auth": "bearer",
  "handler": "getAilmentsByLanguage",
  "routeFile": "ailment.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "lang",
      "example": "<<lang>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrze2srqk91kgyj6su9y",
  "name": "POST /api/ailment/addAilment",
  "module": "ailment",
  "method": "POST",
  "path": "/api/ailment/addAilment",
  "auth": "bearer",
  "handler": "addAilment",
  "routeFile": "ailment.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrze2srsk91ktenf273h",
  "name": "DELETE /api/ailment/deleteAilment/:id",
  "module": "ailment",
  "method": "DELETE",
  "path": "/api/ailment/deleteAilment/{id}",
  "auth": "bearer",
  "handler": "deleteAilment",
  "routeFile": "ailment.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrze2sruk91kbd7jt1gd",
  "name": "GET /api/ailment/getAilmentByName/:name",
  "module": "ailment",
  "method": "GET",
  "path": "/api/ailment/getAilmentByName/{name}",
  "auth": "bearer",
  "handler": "getAilmentbyName",
  "routeFile": "ailment.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "name",
      "example": "<<name>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hrze2srwk91k9fydwz9p",
  "name": "PUT /api/ailment/updateAilment/:id",
  "module": "ailment",
  "method": "PUT",
  "path": "/api/ailment/updateAilment/{id}",
  "auth": "bearer",
  "handler": "updateAilment",
  "routeFile": "ailment.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0f2srzk91kzi1xkzyb",
  "name": "GET /api/ailmentPatient/:id",
  "module": "ailmentPatient",
  "method": "GET",
  "path": "/api/ailmentPatient/{id}",
  "auth": "bearer",
  "handler": "fetchAilmentId",
  "routeFile": "ailmentPatient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0x2ss2k91kr7m0c3nj",
  "name": "GET /api/alarmsRouter/",
  "module": "alarmsRouter",
  "method": "GET",
  "path": "/api/alarmsRouter",
  "auth": "bearer",
  "handler": "getAllAlarms",
  "routeFile": "alarmsRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0y2ss4k91khssazfc4",
  "name": "POST /api/alarmsRouter/",
  "module": "alarmsRouter",
  "method": "POST",
  "path": "/api/alarmsRouter",
  "auth": "bearer",
  "handler": "insertAlarm",
  "routeFile": "alarmsRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0y2ss6k91kmmlvfqkq",
  "name": "DELETE /api/alarmsRouter/:id",
  "module": "alarmsRouter",
  "method": "DELETE",
  "path": "/api/alarmsRouter/{id}",
  "auth": "bearer",
  "handler": "deleteAlarm",
  "routeFile": "alarmsRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0y2ss8k91kx821l44m",
  "name": "PUT /api/alarmsRouter/:id",
  "module": "alarmsRouter",
  "method": "PUT",
  "path": "/api/alarmsRouter/{id}",
  "auth": "bearer",
  "handler": "updateAlarm",
  "routeFile": "alarmsRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0y2ssak91k90iy7vzc",
  "name": "POST /api/alarmsRouter/answerAlarm",
  "module": "alarmsRouter",
  "method": "POST",
  "path": "/api/alarmsRouter/answerAlarm",
  "auth": "bearer",
  "handler": "answerAlarm",
  "routeFile": "alarmsRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0y2ssck91k3e2gk4yo",
  "name": "GET /api/alarmsRouter/byId/:id",
  "module": "alarmsRouter",
  "method": "GET",
  "path": "/api/alarmsRouter/byId/{id}",
  "auth": "bearer",
  "handler": "getAlarmbyId",
  "routeFile": "alarmsRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0y2ssek91kq5dkhkbo",
  "name": "GET /api/alarmsRouter/byPatientId/:id",
  "module": "alarmsRouter",
  "method": "GET",
  "path": "/api/alarmsRouter/byPatientId/{id}",
  "auth": "bearer",
  "handler": "getAlarmbyPatientId",
  "routeFile": "alarmsRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs0z2ssgk91ktruj46j1",
  "name": "PUT /api/alarmsRouter/updateReason/:id",
  "module": "alarmsRouter",
  "method": "PUT",
  "path": "/api/alarmsRouter/updateReason/{id}",
  "auth": "bearer",
  "handler": "updateReason",
  "routeFile": "alarmsRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs272ssjk91k2tyiezeb",
  "name": "GET /api/alerts/",
  "module": "alerts",
  "method": "GET",
  "path": "/api/alerts",
  "auth": "bearer",
  "handler": "getAlerts",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs272sslk91karbdjglk",
  "name": "PUT /api/alerts/approveAlert",
  "module": "alerts",
  "method": "PUT",
  "path": "/api/alerts/approveAlert",
  "auth": "bearer",
  "handler": "apporoveAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs272ssnk91kx264mdrx",
  "name": "PUT /api/alerts/approveAllAlerts",
  "module": "alerts",
  "method": "PUT",
  "path": "/api/alerts/approveAllAlerts",
  "auth": "bearer",
  "handler": "approveAllAlerts",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs272sspk91kf6qvmptd",
  "name": "PUT /api/alerts/approveOrDisapprovePrescription",
  "module": "alerts",
  "method": "PUT",
  "path": "/api/alerts/approveOrDisapprovePrescription",
  "auth": "bearer",
  "handler": "approveOrDisapprovePrescription",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs272ssrk91kpzugy47r",
  "name": "GET /api/alerts/byCategory",
  "module": "alerts",
  "method": "GET",
  "path": "/api/alerts/byCategory",
  "auth": "bearer",
  "handler": "getAlertbyCategory",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs272sstk91khlk0uqa4",
  "name": "GET /api/alerts/byId/:id",
  "module": "alerts",
  "method": "GET",
  "path": "/api/alerts/byId/{id}",
  "auth": "bearer",
  "handler": "getAlertbyId",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs272ssvk91kvxmdjx3a",
  "name": "GET /api/alerts/byType/:type",
  "module": "alerts",
  "method": "GET",
  "path": "/api/alerts/byType/{type}",
  "auth": "bearer",
  "handler": "getAlertbyType",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "type",
      "example": "<<type>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs282ssxk91kcsj7l7l8",
  "name": "POST /api/alerts/changeInProgram",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/changeInProgram",
  "auth": "bearer",
  "handler": "createChangeInProgramAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs282sszk91k5mfv0yfm",
  "name": "POST /api/alerts/contactUs",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/contactUs",
  "auth": "bearer",
  "handler": "createContactUsAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs282st1k91kxftvqp3m",
  "name": "GET /api/alerts/dailyAlerts",
  "module": "alerts",
  "method": "GET",
  "path": "/api/alerts/dailyAlerts",
  "auth": "bearer",
  "handler": "canRecieveUpdates",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs282st3k91kyohvicmx",
  "name": "DELETE /api/alerts/delete/:id",
  "module": "alerts",
  "method": "DELETE",
  "path": "/api/alerts/delete/{id}",
  "auth": "bearer",
  "handler": "deleAlertbyID",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs282st5k91k2mqus0o2",
  "name": "POST /api/alerts/deleteAccount",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/deleteAccount",
  "auth": "bearer",
  "handler": "createDeleteAccountAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs282st7k91kgvf096dt",
  "name": "PUT /api/alerts/deletePatientAlert/:id",
  "module": "alerts",
  "method": "PUT",
  "path": "/api/alerts/deletePatientAlert/{id}",
  "auth": "bearer",
  "handler": "deletePatientAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs282st9k91kwdmhsg6k",
  "name": "PUT /api/alerts/disapproveAlert",
  "module": "alerts",
  "method": "PUT",
  "path": "/api/alerts/disapproveAlert",
  "auth": "bearer",
  "handler": "dissapproveAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs292stbk91k15hwk5ym",
  "name": "PUT /api/alerts/disapproveAllAlerts",
  "module": "alerts",
  "method": "PUT",
  "path": "/api/alerts/disapproveAllAlerts",
  "auth": "bearer",
  "handler": "dissapproveAllAlerts",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs292stdk91kr2c52i97",
  "name": "POST /api/alerts/doctorMessageToAdmin",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/doctorMessageToAdmin",
  "auth": "bearer",
  "handler": "createDoctorMessageToAdminAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs292stfk91kxctdtd3a",
  "name": "POST /api/alerts/newEnrollment",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/newEnrollment",
  "auth": "bearer",
  "handler": "createNewEnrollmentAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs292sthk91kohy14hhp",
  "name": "POST /api/alerts/newLabReport",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/newLabReport",
  "auth": "bearer",
  "handler": "createNewLabReportAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs292stjk91k7zz10uvr",
  "name": "POST /api/alerts/newPrescription",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/newPrescription",
  "auth": "bearer",
  "handler": "createNewPrescriptionAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs292stlk91kwubicirc",
  "name": "POST /api/alerts/newPrescriptionAlarm",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/newPrescriptionAlarm",
  "auth": "bearer",
  "handler": "createNewPrescriptionAlarmAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs292stnk91kktydwc2n",
  "name": "POST /api/alerts/newProgramEnrollment",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/newProgramEnrollment",
  "auth": "bearer",
  "handler": "createNewProgramEnrollmentAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs292stpk91k1c0w99gs",
  "name": "POST /api/alerts/newRequisition",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/newRequisition",
  "auth": "bearer",
  "handler": "createNewRequisitionAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs2a2strk91kobl00f80",
  "name": "POST /api/alerts/prescriptionDisapprovedAlarm",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/prescriptionDisapprovedAlarm",
  "auth": "bearer",
  "handler": "createPrescriptionDisapprovedAlarmAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs2a2sttk91ke1dm71ug",
  "name": "POST /api/alerts/prescriptionNotViewed",
  "module": "alerts",
  "method": "POST",
  "path": "/api/alerts/prescriptionNotViewed",
  "auth": "bearer",
  "handler": "createPrescriptionNotViewedAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs2a2stvk91kxopv951h",
  "name": "PUT /api/alerts/updateIsRead",
  "module": "alerts",
  "method": "PUT",
  "path": "/api/alerts/updateIsRead",
  "auth": "bearer",
  "handler": "updateIsReadAlert",
  "routeFile": "alerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5b2styk91k7s5ja4k2",
  "name": "POST /api/app_apis/alarms/deleteAlarm",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/alarms/deleteAlarm",
  "auth": "none",
  "handler": "deleteAlarm",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5b2su0k91k9u4d7nwk",
  "name": "POST /api/app_apis/alarms/fetchAlarms",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/alarms/fetchAlarms",
  "auth": "none",
  "handler": "getAlarmOfPatient",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5b2su2k91kbizrtco7",
  "name": "POST /api/app_apis/alarms/insertAlarm",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/alarms/insertAlarm",
  "auth": "none",
  "handler": "insertAlarm",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5b2su4k91kpwulvegg",
  "name": "POST /api/app_apis/appAlerts/insertAlert",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/appAlerts/insertAlert",
  "auth": "none",
  "handler": "insertAlert",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5c2su6k91knke7btg6",
  "name": "POST /api/app_apis/dailyHealth/fetchDailyParametersById",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dailyHealth/fetchDailyParametersById",
  "auth": "none",
  "handler": "fetchDailyParametersById",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5c2su8k91k57mj58by",
  "name": "POST /api/app_apis/dailyHealth/getDailyHealthParams",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dailyHealth/getDailyHealthParams",
  "auth": "none",
  "handler": "fetchDailyParameters",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5c2suak91kh4a8wzbb",
  "name": "POST /api/app_apis/dailyHealth/submitDailyHealthParams",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dailyHealth/submitDailyHealthParams",
  "auth": "none",
  "handler": "upload.single(image",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5c2suck91k2bv3zhm8",
  "name": "POST /api/app_apis/deleteAccountDeletionRequest",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/deleteAccountDeletionRequest",
  "auth": "none",
  "handler": "cancelAccountDeletionRequest",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5c2suek91kum2xxvvt",
  "name": "POST /api/app_apis/deleteUserRequest",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/deleteUserRequest",
  "auth": "none",
  "handler": "accountDeletionRequest",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5c2sugk91k5ar75vb0",
  "name": "POST /api/app_apis/dialysisHealth/fetchDialysisParametersById",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dialysisHealth/fetchDialysisParametersById",
  "auth": "none",
  "handler": "fetchDialysisParametersById",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5c2suik91kiemuy0j3",
  "name": "POST /api/app_apis/dialysisHealth/getDialysisHealthParams",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dialysisHealth/getDialysisHealthParams",
  "auth": "none",
  "handler": "fetchDialysisParameters",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5c2sukk91kbg2hfesz",
  "name": "POST /api/app_apis/dialysisHealth/submitDialysisHealthParams",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dialysisHealth/submitDialysisHealthParams",
  "auth": "none",
  "handler": "upload.single(image",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5d2sumk91ke3vddscy",
  "name": "POST /api/app_apis/dietdetails/addDietComment",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dietdetails/addDietComment",
  "auth": "none",
  "handler": "addDietComment",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5d2suok91k5x1v06oh",
  "name": "POST /api/app_apis/dietdetails/fetchDietComments",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dietdetails/fetchDietComments",
  "auth": "none",
  "handler": "fetchDietComments",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5d2suqk91k4hvocepz",
  "name": "POST /api/app_apis/dietdetails/getPatientDiet",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/dietdetails/getPatientDiet",
  "auth": "none",
  "handler": "getPatientDietDetails",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5d2susk91kui8vt2pq",
  "name": "POST /api/app_apis/getAilmentList",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/getAilmentList",
  "auth": "none",
  "handler": "getAilmentList",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5d2suuk91khzecbpje",
  "name": "POST /api/app_apis/getAilmentsList",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/getAilmentsList",
  "auth": "none",
  "handler": "getAilmentsList",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5d2suwk91k8cvm3m8u",
  "name": "POST /api/app_apis/getDoctorMessages",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/getDoctorMessages",
  "auth": "none",
  "handler": "getDoctorMessages",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5d2suyk91koc6hlgu9",
  "name": "POST /api/app_apis/getProfileDetails",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/getProfileDetails",
  "auth": "none",
  "handler": "getProfileDetails",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5d2sv0k91kqt1ggwgq",
  "name": "GET /api/app_apis/getUnreadDoctorCmts",
  "module": "app_apis",
  "method": "GET",
  "path": "/api/app_apis/getUnreadDoctorCmts",
  "auth": "none",
  "handler": "getUnreadDoctorComments",
  "routeFile": "app_apis.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2sv2k91kqpf17nd9",
  "name": "POST /api/app_apis/isAccountDeletionRequest",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/isAccountDeletionRequest",
  "auth": "none",
  "handler": "isAccountDeletionRequest",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2sv4k91kri97jg59",
  "name": "POST /api/app_apis/login",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/login",
  "auth": "none",
  "handler": "login",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2sv6k91k15hpyvod",
  "name": "POST /api/app_apis/loginv2",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/loginv2",
  "auth": "none",
  "handler": "loginv2",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2sv8k91kqe4tcyre",
  "name": "POST /api/app_apis/markCommentsAsRead",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/markCommentsAsRead",
  "auth": "none",
  "handler": "markCommentAsRead",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2svak91ka0dw7gmy",
  "name": "POST /api/app_apis/prescription/addPrescription",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/prescription/addPrescription",
  "auth": "none",
  "handler": "upload.single(image",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2svck91k31stegos",
  "name": "POST /api/app_apis/prescription/addPrescriptionComments",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/prescription/addPrescriptionComments",
  "auth": "none",
  "handler": "addPrescriptionComment",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2svek91k3h7k7074",
  "name": "POST /api/app_apis/prescription/deletePrescription",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/prescription/deletePrescription",
  "auth": "none",
  "handler": "deletePrescription",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2svgk91kzbxb5tg6",
  "name": "POST /api/app_apis/prescription/fetchPrescription",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/prescription/fetchPrescription",
  "auth": "none",
  "handler": "getPrescriptionsByIdFromApp",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5e2svik91k2k6hb1r2",
  "name": "POST /api/app_apis/prescription/fetchPrescriptionComments",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/prescription/fetchPrescriptionComments",
  "auth": "none",
  "handler": "fetchPrescriptionComments",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5f2svkk91kuz96gi7d",
  "name": "POST /api/app_apis/pushTokenUpdate",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/pushTokenUpdate",
  "auth": "none",
  "handler": "updateToken",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5f2svmk91kjl2hj2vk",
  "name": "POST /api/app_apis/questions/answerQuestions",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/questions/answerQuestions",
  "auth": "none",
  "handler": "answerQuestion",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5f2svok91ke0rrausv",
  "name": "POST /api/app_apis/questions/getQuestions",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/questions/getQuestions",
  "auth": "none",
  "handler": "fetchQuestions",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5f2svqk91ktxz3dvvm",
  "name": "POST /api/app_apis/register/getDoctorCode",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/register/getDoctorCode",
  "auth": "none",
  "handler": "getDoctorCode",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5f2svsk91kkmbal4gj",
  "name": "POST /api/app_apis/report/addLabReport",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/report/addLabReport",
  "auth": "none",
  "handler": "upload.single(image",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5f2svuk91k8gh2r6tu",
  "name": "POST /api/app_apis/report/addReportComments",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/report/addReportComments",
  "auth": "none",
  "handler": "addReportComments",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5f2svwk91kaiuvi9tj",
  "name": "POST /api/app_apis/report/deleteReport",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/report/deleteReport",
  "auth": "none",
  "handler": "deleteLabReport",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5f2svyk91kw1awmbjn",
  "name": "POST /api/app_apis/report/fetchReportComments",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/report/fetchReportComments",
  "auth": "none",
  "handler": "fetchReportComments",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5g2sw0k91k4ug9g7by",
  "name": "POST /api/app_apis/reports/userLabReports",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/reports/userLabReports",
  "auth": "none",
  "handler": "fetchUserLabReports",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5g2sw2k91kpjuu8qv0",
  "name": "POST /api/app_apis/requisition/addRequisitionComments",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/requisition/addRequisitionComments",
  "auth": "none",
  "handler": "addRequisitionComment",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5g2sw4k91krs64sp5j",
  "name": "POST /api/app_apis/requisition/fetchRequisition",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/requisition/fetchRequisition",
  "auth": "none",
  "handler": "getRequisitionInApp",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5g2sw6k91kbjzhnalz",
  "name": "POST /api/app_apis/requisition/fetchRequisitionComments",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/requisition/fetchRequisitionComments",
  "auth": "none",
  "handler": "fetchRequisitionComments",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5g2sw8k91knmuxrot3",
  "name": "POST /api/app_apis/sendPushNotification",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/sendPushNotification",
  "auth": "none",
  "handler": "sendPushNotification",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5g2swak91kwchb8wey",
  "name": "POST /api/app_apis/updateUserAilments",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/updateUserAilments",
  "auth": "none",
  "handler": "updateUserAilment",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs5g2swck91kytqqrb1h",
  "name": "POST /api/app_apis/userFeedback",
  "module": "app_apis",
  "method": "POST",
  "path": "/api/app_apis/userFeedback",
  "auth": "none",
  "handler": "submitUserFeedback",
  "routeFile": "app_apis.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs9w2swfk91ko784712p",
  "name": "POST /api/auth/changePassword",
  "module": "auth",
  "method": "POST",
  "path": "/api/auth/changePassword",
  "auth": "none",
  "handler": "changePassword",
  "routeFile": "auth.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs9x2swhk91kyrz1osjj",
  "name": "POST /api/auth/login",
  "module": "auth",
  "method": "POST",
  "path": "/{m1_url}/api/auth/login",
  "auth": "none",
  "handler": "login",
  "routeFile": "auth.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": {
    "email": "superadmin@kifaytihealth.com",
    "password": "Test098"
  },
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs9x2swjk91kwralv256",
  "name": "GET /api/auth/private",
  "module": "auth",
  "method": "GET",
  "path": "/api/auth/private",
  "auth": "none",
  "handler": "getPrivateData",
  "routeFile": "auth.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hs9x2swlk91k4mgar2lu",
  "name": "POST /api/auth/register",
  "module": "auth",
  "method": "POST",
  "path": "/api/auth/register",
  "auth": "none",
  "handler": "register",
  "routeFile": "auth.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsaq2swok91k7va13455",
  "name": "GET /api/chatRouter/:pid",
  "module": "chatRouter",
  "method": "GET",
  "path": "/api/chatRouter/{pid}",
  "auth": "bearer",
  "handler": "getAllChats",
  "routeFile": "chatRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "pid",
      "example": "<<pid>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsaq2swqk91kgzjtqso8",
  "name": "GET /api/chatRouter/admin/:pid",
  "module": "chatRouter",
  "method": "GET",
  "path": "/api/chatRouter/admin/{pid}",
  "auth": "bearer",
  "handler": "getAllByEMailChats",
  "routeFile": "chatRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "pid",
      "example": "<<pid>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsaq2swsk91k4g5kvtig",
  "name": "POST /api/chatRouter/adminSW/:pid",
  "module": "chatRouter",
  "method": "POST",
  "path": "/api/chatRouter/adminSW/{pid}",
  "auth": "bearer",
  "handler": "getSWChats",
  "routeFile": "chatRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "pid",
      "example": "<<pid>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsaq2swuk91k76b5ikad",
  "name": "POST /api/chatRouter/getId",
  "module": "chatRouter",
  "method": "POST",
  "path": "/api/chatRouter/getId",
  "auth": "bearer",
  "handler": "getChatId",
  "routeFile": "chatRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsar2swwk91k7pwpltc7",
  "name": "POST /api/chatRouter/message/",
  "module": "chatRouter",
  "method": "POST",
  "path": "/api/chatRouter/message",
  "auth": "bearer",
  "handler": "sendMessage",
  "routeFile": "chatRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsar2swyk91kfsro4x2v",
  "name": "GET /api/chatRouter/message/:chatId",
  "module": "chatRouter",
  "method": "GET",
  "path": "/api/chatRouter/message/{chatId}",
  "auth": "bearer",
  "handler": "getMessages",
  "routeFile": "chatRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "chatId",
      "example": "<<chatId>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsar2sx0k91kpj5ti0dq",
  "name": "GET /api/chatRouter/messageSW/:chatId",
  "module": "chatRouter",
  "method": "GET",
  "path": "/api/chatRouter/messageSW/{chatId}",
  "auth": "bearer",
  "handler": "getSWMessages",
  "routeFile": "chatRouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "chatId",
      "example": "<<chatId>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsbv2sx3k91kofq51x2q",
  "name": "POST /api/comments/addComment",
  "module": "comments",
  "method": "POST",
  "path": "/api/comments/addComment",
  "auth": "bearer",
  "handler": "addComment",
  "routeFile": "comments.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsbv2sx5k91k21our99q",
  "name": "POST /api/comments/getComments",
  "module": "comments",
  "method": "POST",
  "path": "/api/comments/getComments",
  "auth": "bearer",
  "handler": "getComments",
  "routeFile": "comments.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsbv2sx7k91kjgwweuuw",
  "name": "POST /api/comments/getDoctorComments",
  "module": "comments",
  "method": "POST",
  "path": "/api/comments/getDoctorComments",
  "auth": "bearer",
  "handler": "getDoctorComments",
  "routeFile": "comments.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsbv2sx9k91kbpspn6ag",
  "name": "POST /api/comments/getPatientComments",
  "module": "comments",
  "method": "POST",
  "path": "/api/comments/getPatientComments",
  "auth": "bearer",
  "handler": "getPatientComments",
  "routeFile": "comments.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsbv2sxbk91kfwwy9jgv",
  "name": "POST /api/comments/updateReadTable",
  "module": "comments",
  "method": "POST",
  "path": "/api/comments/updateReadTable",
  "auth": "bearer",
  "handler": "updateReadTable",
  "routeFile": "comments.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hscr2sxek91kbwmw1efn",
  "name": "GET /api/contactus/",
  "module": "contactus",
  "method": "GET",
  "path": "/api/contactus",
  "auth": "bearer",
  "handler": "getAllContactUs",
  "routeFile": "contactus.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hscr2sxgk91kjc7nvg60",
  "name": "POST /api/contactus/",
  "module": "contactus",
  "method": "POST",
  "path": "/api/contactus",
  "auth": "bearer",
  "handler": "insertContactUs",
  "routeFile": "contactus.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hscr2sxik91kwcsreond",
  "name": "DELETE /api/contactus/:id",
  "module": "contactus",
  "method": "DELETE",
  "path": "/api/contactus/{id}",
  "auth": "bearer",
  "handler": "deleteContactUs",
  "routeFile": "contactus.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hscs2sxkk91kidqtckdl",
  "name": "GET /api/contactus/:id",
  "module": "contactus",
  "method": "GET",
  "path": "/api/contactus/{id}",
  "auth": "bearer",
  "handler": "getContactUsById",
  "routeFile": "contactus.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsdl2sxnk91kcebnhzeb",
  "name": "POST /api/dailyAlerts/AddDailyReadingsAlerts",
  "module": "dailyAlerts",
  "method": "POST",
  "path": "/api/dailyAlerts/AddDailyReadingsAlerts",
  "auth": "bearer",
  "handler": "AddDailyReadingsAlertsAPI",
  "routeFile": "dailyAlerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsdm2sxpk91k5wn9dggm",
  "name": "POST /api/dailyAlerts/AddDialysisReadingsAlerts",
  "module": "dailyAlerts",
  "method": "POST",
  "path": "/api/dailyAlerts/AddDialysisReadingsAlerts",
  "auth": "bearer",
  "handler": "AddDialysisReadingsAlertsAPI",
  "routeFile": "dailyAlerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsdm2sxrk91kzzvhl29c",
  "name": "POST /api/dailyAlerts/updateIsRead",
  "module": "dailyAlerts",
  "method": "POST",
  "path": "/api/dailyAlerts/updateIsRead",
  "auth": "bearer",
  "handler": "updateIsRead",
  "routeFile": "dailyAlerts.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hseb2sxuk91kghxtj4xs",
  "name": "POST /api/dataUpload/",
  "module": "dataUpload",
  "method": "POST",
  "path": "/api/dataUpload",
  "auth": "none",
  "handler": "upload.single(file",
  "routeFile": "dataUpload.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hseb2sxwk91kj910isga",
  "name": "POST /api/dataUpload/files",
  "module": "dataUpload",
  "method": "POST",
  "path": "/api/dataUpload/files",
  "auth": "none",
  "handler": "upload.array(files",
  "routeFile": "dataUpload.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsey2sxzk91k5tbqdffz",
  "name": "DELETE /api/dietdetails/deleteDietDetails/:id",
  "module": "dietdetails",
  "method": "DELETE",
  "path": "/api/dietdetails/deleteDietDetails/{id}",
  "auth": "bearer",
  "handler": "deleteDietDetails",
  "routeFile": "dietdetails.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsey2sy1k91ks1b9zct8",
  "name": "GET /api/dietdetails/getPatientDietDetailsAdmin/:id",
  "module": "dietdetails",
  "method": "GET",
  "path": "/api/dietdetails/getPatientDietDetailsAdmin/{id}",
  "auth": "bearer",
  "handler": "getPatientDietDetailsAdmin",
  "routeFile": "dietdetails.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsey2sy3k91kspd9r35c",
  "name": "POST /api/dietdetails/insertDietDetails",
  "module": "dietdetails",
  "method": "POST",
  "path": "/api/dietdetails/insertDietDetails",
  "auth": "none",
  "handler": "upload.single(image",
  "routeFile": "dietdetails.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsey2sy5k91kjeragba5",
  "name": "POST /api/dietdetails/insertDietDetailsAdmin",
  "module": "dietdetails",
  "method": "POST",
  "path": "/api/dietdetails/insertDietDetailsAdmin",
  "auth": "bearer",
  "handler": "insertDietDetailsAdmin",
  "routeFile": "dietdetails.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsfs2sy8k91kvceboc41",
  "name": "GET /api/doctorAnalytics/getAdherenceMedicine",
  "module": "doctorAnalytics",
  "method": "GET",
  "path": "/api/doctorAnalytics/getAdherenceMedicine",
  "auth": "bearer",
  "handler": "getAdherenceMedicine",
  "routeFile": "doctorAnalytics.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsfs2syak91kai1ljg8m",
  "name": "GET /api/doctorAnalytics/getPatientsByAge",
  "module": "doctorAnalytics",
  "method": "GET",
  "path": "/api/doctorAnalytics/getPatientsByAge",
  "auth": "bearer",
  "handler": "getPatientByAge",
  "routeFile": "doctorAnalytics.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsfs2syck91kucme9sci",
  "name": "GET /api/doctorAnalytics/getPatientsByDoctorId",
  "module": "doctorAnalytics",
  "method": "GET",
  "path": "/api/doctorAnalytics/getPatientsByDoctorId",
  "auth": "bearer",
  "handler": "getAppointmentsByDate",
  "routeFile": "doctorAnalytics.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsft2syek91k66h6d69p",
  "name": "GET /api/doctorAnalytics/getPatientsByGender",
  "module": "doctorAnalytics",
  "method": "GET",
  "path": "/api/doctorAnalytics/getPatientsByGender",
  "auth": "bearer",
  "handler": "getPatientByGender",
  "routeFile": "doctorAnalytics.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsft2sygk91khgt8ycns",
  "name": "GET /api/doctorAnalytics/getPercentageReturn",
  "module": "doctorAnalytics",
  "method": "GET",
  "path": "/api/doctorAnalytics/getPercentageReturn",
  "auth": "bearer",
  "handler": "getPercentageReturn",
  "routeFile": "doctorAnalytics.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsgp2syjk91kaonk2e4b",
  "name": "POST /api/doctorPatient/addDoctor/:id",
  "module": "doctorPatient",
  "method": "POST",
  "path": "/api/doctorPatient/addDoctor/{id}",
  "auth": "bearer",
  "handler": "addDoctorToPatient",
  "routeFile": "doctorPatient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsgp2sylk91k6v02xat2",
  "name": "DELETE /api/doctorPatient/deleteDoctor/:id",
  "module": "doctorPatient",
  "method": "DELETE",
  "path": "/api/doctorPatient/deleteDoctor/{id}",
  "auth": "bearer",
  "handler": "deleteAssignedDoctor",
  "routeFile": "doctorPatient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsgp2synk91kkgm9jrpi",
  "name": "GET /api/doctorPatient/getDoctor/:id",
  "module": "doctorPatient",
  "method": "GET",
  "path": "/api/doctorPatient/getDoctor/{id}",
  "auth": "bearer",
  "handler": "getDoctorData",
  "routeFile": "doctorPatient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshe2syqk91kzs9k14yt",
  "name": "POST /api/doctors/",
  "module": "doctors",
  "method": "POST",
  "path": "/api/doctors",
  "auth": "bearer",
  "handler": "createDoctor",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshe2sysk91ktj6ncdvq",
  "name": "DELETE /api/doctors/:id",
  "module": "doctors",
  "method": "DELETE",
  "path": "/api/doctors/{id}",
  "auth": "bearer",
  "handler": "deleteDoctor",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshe2syuk91k5e30wngi",
  "name": "PUT /api/doctors/:id",
  "module": "doctors",
  "method": "PUT",
  "path": "/api/doctors/{id}",
  "auth": "bearer",
  "handler": "updateDoctor",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshe2sywk91k8q86xsgi",
  "name": "POST /api/doctors/byEmail/id",
  "module": "doctors",
  "method": "POST",
  "path": "/api/doctors/byEmail/id",
  "auth": "bearer",
  "handler": "getDoctorIdbyEmail",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshe2syyk91kaf9i1psl",
  "name": "GET /api/doctors/doctorLogs",
  "module": "doctors",
  "method": "GET",
  "path": "/api/doctors/doctorLogs",
  "auth": "bearer",
  "handler": "DocdownloadLog",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshe2sz0k91kwo7fjhov",
  "name": "GET /api/doctors/getDoctors",
  "module": "doctors",
  "method": "GET",
  "path": "/api/doctors/getDoctors",
  "auth": "bearer",
  "handler": "getDoctors",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshf2sz2k91kbz4508yo",
  "name": "GET /api/doctors/getDoctorsChat/:pid",
  "module": "doctors",
  "method": "GET",
  "path": "/api/doctors/getDoctorsChat/{pid}",
  "auth": "bearer",
  "handler": "getDoctorsForChat",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "pid",
      "example": "<<pid>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshf2sz4k91kcnkxlupn",
  "name": "GET /api/doctors/name/:id",
  "module": "doctors",
  "method": "GET",
  "path": "/api/doctors/name/{id}",
  "auth": "bearer",
  "handler": "getDoctorNamebyId",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hshf2sz6k91kpomva1pf",
  "name": "GET /api/doctors/ReportLogs",
  "module": "doctors",
  "method": "GET",
  "path": "/api/doctors/ReportLogs",
  "auth": "bearer",
  "handler": "DownReportlog",
  "routeFile": "doctors.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsiq2sz9k91ktk9tatj6",
  "name": "POST /api/graphReadingDialysis/add",
  "module": "graphReadingDialysis",
  "method": "POST",
  "path": "/api/graphReadingDialysis/add",
  "auth": "bearer",
  "handler": "AddGraphReading",
  "routeFile": "graphReadingDialysis.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsiq2szbk91koz89a0ai",
  "name": "POST /api/graphReadingDialysis/delete",
  "module": "graphReadingDialysis",
  "method": "POST",
  "path": "/api/graphReadingDialysis/delete",
  "auth": "bearer",
  "handler": "DeleteGraphReading",
  "routeFile": "graphReadingDialysis.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsiq2szdk91ke3o6q5te",
  "name": "GET /api/graphReadingDialysis/get",
  "module": "graphReadingDialysis",
  "method": "GET",
  "path": "/api/graphReadingDialysis/get",
  "auth": "bearer",
  "handler": "getReadingsByPatientAndQuestion",
  "routeFile": "graphReadingDialysis.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsir2szfk91kcbxemu8p",
  "name": "GET /api/graphReadingDialysis/getGraph",
  "module": "graphReadingDialysis",
  "method": "GET",
  "path": "/api/graphReadingDialysis/getGraph",
  "auth": "bearer",
  "handler": "getReadingsByPatientAndQuestionGraph",
  "routeFile": "graphReadingDialysis.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsir2szhk91kjb0nstxm",
  "name": "POST /api/graphReadingDialysis/update",
  "module": "graphReadingDialysis",
  "method": "POST",
  "path": "/api/graphReadingDialysis/update",
  "auth": "bearer",
  "handler": "updateGraphReading",
  "routeFile": "graphReadingDialysis.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjp2szkk91kicb0py2j",
  "name": "POST /api/graphReadings/add",
  "module": "graphReadings",
  "method": "POST",
  "path": "/api/graphReadings/add",
  "auth": "bearer",
  "handler": "AddGraphReading",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjp2szmk91k970e6r1b",
  "name": "POST /api/graphReadings/add/dia/sys",
  "module": "graphReadings",
  "method": "POST",
  "path": "/api/graphReadings/add/dia/sys",
  "auth": "bearer",
  "handler": "AddGraphReadingSysDia",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjp2szok91klsz19clt",
  "name": "POST /api/graphReadings/add/sys",
  "module": "graphReadings",
  "method": "POST",
  "path": "/api/graphReadings/add/sys",
  "auth": "bearer",
  "handler": "AddGraphReadingSys",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjp2szqk91kj3rdwkx1",
  "name": "POST /api/graphReadings/delete",
  "module": "graphReadings",
  "method": "POST",
  "path": "/api/graphReadings/delete",
  "auth": "bearer",
  "handler": "deleteGraph",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjq2szsk91kcks9unif",
  "name": "GET /api/graphReadings/get",
  "module": "graphReadings",
  "method": "GET",
  "path": "/api/graphReadings/get",
  "auth": "bearer",
  "handler": "getReadingsByPatientAndQuestion",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjq2szuk91k72py4ssj",
  "name": "GET /api/graphReadings/get/dia/sys",
  "module": "graphReadings",
  "method": "GET",
  "path": "/api/graphReadings/get/dia/sys",
  "auth": "bearer",
  "handler": "getReadingsByPatientAndQuestionSysAndDysDialysis",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjq2szwk91ksuncgnoq",
  "name": "GET /api/graphReadings/get/dia/sysid/:diastolicTitle",
  "module": "graphReadings",
  "method": "GET",
  "path": "/api/graphReadings/get/dia/sysid/{diastolicTitle}",
  "auth": "bearer",
  "handler": "getSystolicIdDia",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "diastolicTitle",
      "example": "<<diastolicTitle>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjq2szyk91kjclbbv8m",
  "name": "GET /api/graphReadings/get/sys",
  "module": "graphReadings",
  "method": "GET",
  "path": "/api/graphReadings/get/sys",
  "auth": "bearer",
  "handler": "getReadingsByPatientAndQuestionSysAndDys",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjq2t00k91kceojiro9",
  "name": "GET /api/graphReadings/get/sysid/:diastolicTitle",
  "module": "graphReadings",
  "method": "GET",
  "path": "/api/graphReadings/get/sysid/{diastolicTitle}",
  "auth": "bearer",
  "handler": "getSystolicId",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "diastolicTitle",
      "example": "<<diastolicTitle>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsjq2t02k91k0k8iqezt",
  "name": "POST /api/graphReadings/update",
  "module": "graphReadings",
  "method": "POST",
  "path": "/api/graphReadings/update",
  "auth": "bearer",
  "handler": "updateGraph",
  "routeFile": "graphReadings.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsl62t05k91kjesiyjr1",
  "name": "GET /health",
  "module": "index",
  "method": "GET",
  "path": "/health",
  "auth": "none",
  "handler": "inline",
  "routeFile": "index.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslp2t08k91kq6suk28w",
  "name": "DELETE /api/labreport/:id",
  "module": "labreport",
  "method": "DELETE",
  "path": "/api/labreport/{id}",
  "auth": "bearer",
  "handler": "deleteLabReport",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslq2t0ak91kp6hsn59j",
  "name": "GET /api/labreport/:patient",
  "module": "labreport",
  "method": "GET",
  "path": "/api/labreport/{patient}",
  "auth": "bearer",
  "handler": "getLabReportByPatient",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "patient",
      "example": "<<patient>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslq2t0ck91knup9zvcz",
  "name": "POST /api/labreport/addBulkIndividual",
  "module": "labreport",
  "method": "POST",
  "path": "/api/labreport/addBulkIndividual",
  "auth": "bearer",
  "handler": "uploadBulkLabReportIndividual",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslq2t0ek91kfppxgdl1",
  "name": "POST /api/labreport/addLabReading",
  "module": "labreport",
  "method": "POST",
  "path": "/api/labreport/addLabReading",
  "auth": "bearer",
  "handler": "addLabReadings",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslq2t0gk91kytwk0bjs",
  "name": "POST /api/labreport/confirm",
  "module": "labreport",
  "method": "POST",
  "path": "/api/labreport/confirm",
  "auth": "none",
  "handler": "saveConfirmedData",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslq2t0ik91k08a3n7bw",
  "name": "DELETE /api/labreport/deleteLabReading/:id",
  "module": "labreport",
  "method": "DELETE",
  "path": "/api/labreport/deleteLabReading/{id}",
  "auth": "bearer",
  "handler": "deleteLabReading",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslr2t0kk91k7oxouiwt",
  "name": "DELETE /api/labreport/deleteLabReport/:id",
  "module": "labreport",
  "method": "DELETE",
  "path": "/api/labreport/deleteLabReport/{id}",
  "auth": "bearer",
  "handler": "deleteLabReport",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslr2t0mk91kt8wj4y15",
  "name": "POST /api/labreport/extract",
  "module": "labreport",
  "method": "POST",
  "path": "/api/labreport/extract",
  "auth": "none",
  "handler": "addLabReport",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslr2t0ok91klcuo7325",
  "name": "GET /api/labreport/getColumnNames",
  "module": "labreport",
  "method": "GET",
  "path": "/api/labreport/getColumnNames",
  "auth": "bearer",
  "handler": "getColoumnName",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslr2t0qk91kppyqy00u",
  "name": "GET /api/labreport/getLabReport/:id",
  "module": "labreport",
  "method": "GET",
  "path": "/api/labreport/getLabReport/{id}",
  "auth": "bearer",
  "handler": "getLabReportById",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslr2t0sk91k96t0zw6s",
  "name": "GET /api/labreport/getLabReports/:id",
  "module": "labreport",
  "method": "GET",
  "path": "/api/labreport/getLabReports/{id}",
  "auth": "bearer",
  "handler": "getLabReports",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslr2t0uk91kxb3j1g27",
  "name": "GET /api/labreport/LabReadings",
  "module": "labreport",
  "method": "GET",
  "path": "/api/labreport/LabReadings",
  "auth": "bearer",
  "handler": "fetchLabReadings",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslr2t0wk91kkttvscva",
  "name": "GET /api/labreport/LabReadings",
  "module": "labreport",
  "method": "GET",
  "path": "/api/labreport/LabReadings",
  "auth": "bearer",
  "handler": "fetchLabReadings",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hslr2t0yk91kmter8z8u",
  "name": "GET /api/labreport/range",
  "module": "labreport",
  "method": "GET",
  "path": "/api/labreport/range",
  "auth": "bearer",
  "handler": "getRange",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsls2t10k91k4aneoiqu",
  "name": "GET /api/labreport/responses",
  "module": "labreport",
  "method": "GET",
  "path": "/api/labreport/responses",
  "auth": "bearer",
  "handler": "fetchLabReadingsResponse",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsls2t12k91ksv2cvwmg",
  "name": "PUT /api/labreport/updateLabReadingTitle/:readingId",
  "module": "labreport",
  "method": "PUT",
  "path": "/api/labreport/updateLabReadingTitle/{readingId}",
  "auth": "bearer",
  "handler": "updateLabReadingTitle",
  "routeFile": "labreport.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "readingId",
      "example": "<<readingId>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsnu2t15k91kjgw3caa4",
  "name": "POST /api/mail/sentotp",
  "module": "mail",
  "method": "POST",
  "path": "/api/mail/sentotp",
  "auth": "none",
  "handler": "sendMail",
  "routeFile": "mail.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsnu2t17k91kzsopm6nn",
  "name": "POST /api/mail/verifyOtp",
  "module": "mail",
  "method": "POST",
  "path": "/api/mail/verifyOtp",
  "auth": "none",
  "handler": "VerifyOtp",
  "routeFile": "mail.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsog2t1ak91kdmddkr7r",
  "name": "POST /api/manageparameters/addReading",
  "module": "manageparameters",
  "method": "POST",
  "path": "/api/manageparameters/addReading",
  "auth": "bearer",
  "handler": "addReading",
  "routeFile": "manageparameters.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsoy2t1dk91k34yjvxih",
  "name": "POST /api/moduleRoutes/connectDoctor",
  "module": "moduleRoutes",
  "method": "POST",
  "path": "/api/moduleRoutes/connectDoctor",
  "auth": "none",
  "handler": "moduleController.connectDoctor",
  "routeFile": "moduleRoutes.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsoz2t1fk91kx31h6qxk",
  "name": "POST /api/moduleRoutes/connectPatient",
  "module": "moduleRoutes",
  "method": "POST",
  "path": "/api/moduleRoutes/connectPatient",
  "auth": "none",
  "handler": "moduleController.connectPatient",
  "routeFile": "moduleRoutes.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsoz2t1hk91kmu4cng11",
  "name": "GET /api/moduleRoutes/getLabR",
  "module": "moduleRoutes",
  "method": "GET",
  "path": "/api/moduleRoutes/getLabR",
  "auth": "none",
  "handler": "moduleController.getPatientLabReports",
  "routeFile": "moduleRoutes.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsoz2t1jk91k9lm0layc",
  "name": "GET /api/moduleRoutes/getPresc",
  "module": "moduleRoutes",
  "method": "GET",
  "path": "/api/moduleRoutes/getPresc",
  "auth": "none",
  "handler": "moduleController.getPatientPrescriptions",
  "routeFile": "moduleRoutes.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsoz2t1lk91kimbt0cph",
  "name": "GET /api/moduleRoutes/getVitals",
  "module": "moduleRoutes",
  "method": "GET",
  "path": "/api/moduleRoutes/getVitals",
  "auth": "none",
  "handler": "moduleController.getPatientVitals",
  "routeFile": "moduleRoutes.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hspu2t1ok91kjfvvgvkw",
  "name": "POST /api/notifs/pushNotifs",
  "module": "notifs",
  "method": "POST",
  "path": "/api/notifs/pushNotifs",
  "auth": "none",
  "handler": "pushNotifs",
  "routeFile": "notifs.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqe2t1rk91ks4pxgujg",
  "name": "POST /api/patient/AddPatient",
  "module": "patient",
  "method": "POST",
  "path": "/api/patient/AddPatient",
  "auth": "none",
  "handler": "AddPatient",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqe2t1tk91k9jl0dmyp",
  "name": "DELETE /api/patient/deletePatient/:id",
  "module": "patient",
  "method": "DELETE",
  "path": "/api/patient/deletePatient/{id}",
  "auth": "none",
  "handler": "deletePatient",
  "routeFile": "patient.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqe2t1vk91kndq78nu4",
  "name": "GET /api/patient/getAdminTeam/:id",
  "module": "patient",
  "method": "GET",
  "path": "/api/patient/getAdminTeam/{id}",
  "auth": "none",
  "handler": "getPatientAdminTeam",
  "routeFile": "patient.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqe2t1xk91k33t6ghjs",
  "name": "GET /api/patient/getAilments/:id",
  "module": "patient",
  "method": "GET",
  "path": "/api/patient/getAilments/{id}",
  "auth": "none",
  "handler": "getPatientAilments",
  "routeFile": "patient.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqf2t1zk91kh0xynxj7",
  "name": "GET /api/patient/getDeletdPatients",
  "module": "patient",
  "method": "GET",
  "path": "/api/patient/getDeletdPatients",
  "auth": "bearer",
  "handler": "getDeletdPatients",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqf2t21k91krlt7pj9x",
  "name": "GET /api/patient/getMedicalTeam/:id",
  "module": "patient",
  "method": "GET",
  "path": "/api/patient/getMedicalTeam/{id}",
  "auth": "none",
  "handler": "getPatientMedicalTeam",
  "routeFile": "patient.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqf2t23k91kjcoblh4e",
  "name": "GET /api/patient/getName/:id",
  "module": "patient",
  "method": "GET",
  "path": "/api/patient/getName/{id}",
  "auth": "none",
  "handler": "getNamebyId",
  "routeFile": "patient.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqf2t25k91knmbzyoy5",
  "name": "GET /api/patient/getPatient/:id",
  "module": "patient",
  "method": "GET",
  "path": "/api/patient/getPatient/{id}",
  "auth": "none",
  "handler": "getPatientById",
  "routeFile": "patient.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqf2t27k91kr3ykxrks",
  "name": "GET /api/patient/getPatients",
  "module": "patient",
  "method": "GET",
  "path": "/api/patient/getPatients",
  "auth": "bearer",
  "handler": "getPatients",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqf2t29k91kpjd2qlmq",
  "name": "GET /api/patient/patientLog",
  "module": "patient",
  "method": "GET",
  "path": "/api/patient/patientLog",
  "auth": "none",
  "handler": "downloadLog",
  "routeFile": "patient.js",
  "headers": [],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqf2t2bk91ktww05ag8",
  "name": "DELETE /api/patient/removeAdmin/:id",
  "module": "patient",
  "method": "DELETE",
  "path": "/api/patient/removeAdmin/{id}",
  "auth": "none",
  "handler": "removeAdminFromPatient",
  "routeFile": "patient.js",
  "headers": [],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqf2t2dk91kuf4nv1dv",
  "name": "PUT /api/patient/updateAdmin/:id",
  "module": "patient",
  "method": "PUT",
  "path": "/api/patient/updateAdmin/{id}",
  "auth": "none",
  "handler": "updateAdminTeam",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqg2t2fk91k7zj2g2ii",
  "name": "PUT /api/patient/updateAilments",
  "module": "patient",
  "method": "PUT",
  "path": "/api/patient/updateAilments",
  "auth": "none",
  "handler": "updatePatientAilment",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqg2t2hk91k5awtbv5w",
  "name": "PUT /api/patient/updateDryWeight",
  "module": "patient",
  "method": "PUT",
  "path": "/api/patient/updateDryWeight",
  "auth": "none",
  "handler": "updateDryWeight",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqg2t2jk91kmr5insl4",
  "name": "PUT /api/patient/updateGFR",
  "module": "patient",
  "method": "PUT",
  "path": "/api/patient/updateGFR",
  "auth": "none",
  "handler": "updatePatientGFR",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqg2t2lk91kmjcn2xk6",
  "name": "PUT /api/patient/updateMedical/:id",
  "module": "patient",
  "method": "PUT",
  "path": "/api/patient/updateMedical/{id}",
  "auth": "none",
  "handler": "updateMedicalTeam",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqg2t2nk91kcst9okk0",
  "name": "PUT /api/patient/updatePatient",
  "module": "patient",
  "method": "PUT",
  "path": "/api/patient/updatePatient",
  "auth": "none",
  "handler": "updatePatientProfile",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsqg2t2pk91k628yz3us",
  "name": "PUT /api/patient/updateProgram",
  "module": "patient",
  "method": "PUT",
  "path": "/api/patient/updateProgram",
  "auth": "none",
  "handler": "updatePatientProgram",
  "routeFile": "patient.js",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hssl2t2sk91knwm35lrz",
  "name": "GET /api/patientdatarouter/canexport",
  "module": "patientdatarouter",
  "method": "GET",
  "path": "/api/patientdatarouter/canexport",
  "auth": "bearer",
  "handler": "canDoctorExport",
  "routeFile": "patientdatarouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hssl2t2uk91klcifg4lb",
  "name": "GET /api/patientdatarouter/canReceive",
  "module": "patientdatarouter",
  "method": "GET",
  "path": "/api/patientdatarouter/canReceive",
  "auth": "bearer",
  "handler": "canRecieveUpdates",
  "routeFile": "patientdatarouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hssl2t2wk91k4icvv0ah",
  "name": "GET /api/patientdatarouter/export",
  "module": "patientdatarouter",
  "method": "GET",
  "path": "/api/patientdatarouter/export",
  "auth": "bearer",
  "handler": "getPatientAllData",
  "routeFile": "patientdatarouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hssm2t2yk91k1g93pi07",
  "name": "GET /api/patientdatarouter/export/:id",
  "module": "patientdatarouter",
  "method": "GET",
  "path": "/api/patientdatarouter/export/{id}",
  "auth": "bearer",
  "handler": "getPatientData",
  "routeFile": "patientdatarouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hssm2t30k91k91blfr14",
  "name": "POST /api/patientdatarouter/extractTextFromCsv",
  "module": "patientdatarouter",
  "method": "POST",
  "path": "/api/patientdatarouter/extractTextFromCsv",
  "auth": "bearer",
  "handler": "addLabTestCSV",
  "routeFile": "patientdatarouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hssm2t32k91knw624r2h",
  "name": "POST /api/patientdatarouter/extractTextFromPdf",
  "module": "patientdatarouter",
  "method": "POST",
  "path": "/api/patientdatarouter/extractTextFromPdf",
  "auth": "bearer",
  "handler": "PdfText",
  "routeFile": "patientdatarouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": {
    "pdfUrl": ""
  },
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hssm2t34k91kjxy4fza9",
  "name": "POST /api/patientdatarouter/kfredetails",
  "module": "patientdatarouter",
  "method": "POST",
  "path": "/api/patientdatarouter/kfredetails",
  "auth": "bearer",
  "handler": "addKfreDetails",
  "routeFile": "patientdatarouter.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hsts2t37k91kbhmeuw7v",
  "name": "POST /api/prescription/addComment/:id",
  "module": "prescription",
  "method": "POST",
  "path": "/api/prescription/addComment/{id}",
  "auth": "bearer",
  "handler": "addComment",
  "routeFile": "prescription.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hstt2t39k91k339o2wdm",
  "name": "POST /api/prescription/addPrescription",
  "module": "prescription",
  "method": "POST",
  "path": "/api/prescription/addPrescription",
  "auth": "bearer",
  "handler": "addPrescriptionById",
  "routeFile": "prescription.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    },
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "pathVariables": [],
  "queryParams": [],
  "requestBody": {
    "Prescription": "",
    "date": "",
    "patient_id": "",
    "email": "",
    "prescriptionGivenBy": ""
  },
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hstt2t3bk91kjx14cdtl",
  "name": "DELETE /api/prescription/deletePrescription/:id",
  "module": "prescription",
  "method": "DELETE",
  "path": "/api/prescription/deletePrescription/{id}",
  "auth": "bearer",
  "handler": "deletePrescription",
  "routeFile": "prescription.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

## ENDPOINT
```json
{
  "id": "cmlm1hstt2t3dk91k7sv20609",
  "name": "GET /api/prescription/getPrescription/:id",
  "module": "prescription",
  "method": "GET",
  "path": "/api/prescription/getPrescription/{id}",
  "auth": "bearer",
  "handler": "getPrescriptionsById",
  "routeFile": "prescription.js",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer <<token>>",
      "required": true
    }
  ],
  "pathVariables": [
    {
      "key": "id",
      "example": "<<id>>"
    }
  ],
  "queryParams": [],
  "requestBody": null,
  "implementationChecklist": [
    "Define route in router with exact method/path",
    "Add input schema validation and sanitization",
    "Add auth middleware if auth == bearer",
    "Implement controller and service/data layer",
    "Return documented status codes and error format"
  ]
}
```

