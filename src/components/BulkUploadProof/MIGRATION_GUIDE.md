# BulkUploadProof Component - Migration Guide

## Overview

The `BulkUploadProof` component is a unified CSV upload component that consolidates functionality from multiple previous CSV upload components:
- `CSVLab.jsx` (csvlab)
- `CSVLab2.jsx` (csvLab2)
- `CSVProfile.jsx` (csvProfile)
- `Dailycsv/CSVLab.jsx` (Dailycsv)
- `Labreports.jsx` (pages/labreports)

All features are preserved and enhanced with a cleaner API and consistent styling using the component-library.

## Key Features

✅ CSV file upload with drag-and-drop support
✅ Column mapping with visual UI
✅ Dynamic field addition (when enabled)
✅ Language translation support for multi-language data
✅ Server integration for batch uploads
✅ File attachment support
✅ Comprehensive validation and error handling
✅ Component-library components for consistency
✅ Fully configurable via props

## Migration Examples

### 1. Lab Readings Upload (CSVLab.jsx → BulkUploadProof)

**Old Implementation:**
```jsx
import CSVReader from "../../components/csvlab/CSVLab";

export default function LabPage({ patientId }) {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);

  return (
    <CSVReader
      setData={setData}
      setSuccess={setSuccess}
      success={success}
      patientId={patientId}
    />
  );
}
```

**New Implementation:**
```jsx
import { BulkUploadProof } from "../../components/BulkUploadProof";

export default function LabPage({ patientId }) {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);

  const config = {
    uploadType: "lab",
    additionalContext: { patientId },
  };

  return (
    <BulkUploadProof
      config={config}
      setData={setData}
      setSuccess={setSuccess}
      success={success}
    />
  );
}
```

### 2. Lab Reports with Server Upload (CSVLab2.jsx → BulkUploadProof)

**Old Implementation:**
```jsx
import CSVReader from "../../components/csvLab2/CSVLab2";

export default function LabReportsPage({ patientId }) {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);

  return (
    <CSVReader
      setData={setData}
      setSuccess={setSuccess}
      success={success}
      patientId={patientId}
    />
  );
}
```

**New Implementation:**
```jsx
import { BulkUploadProof } from "../../components/BulkUploadProof";

export default function LabReportsPage({ patientId }) {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);

  const config = {
    uploadType: "labReports",
    additionalContext: {
      patient_id: patientId,
      Report_Type: "Lab",
    },
    serverEndpoint: "/labreport/addBulkIndividual",
    uploadFileEndpoint: "/upload",
    fetchColumnsEndpoint: "/labreport/getColumnNames",
    allowDynamicFields: true,
  };

  return (
    <BulkUploadProof
      config={config}
      setData={setData}
      setSuccess={setSuccess}
      success={success}
    />
  );
}
```

### 3. Profile/Questions with Language Support (CSVProfile.jsx → BulkUploadProof)

**Old Implementation:**
```jsx
import CSVReader from "../../components/csvProfile/CSVProfile";

export default function ProfilePage() {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    // Fetch languages...
  }, []);

  return (
    <CSVReader
      setData={setData}
      setSuccess={setSuccess}
      success={success}
      languages={languages}
    />
  );
}
```

**New Implementation:**
```jsx
import { BulkUploadProof } from "../../components/BulkUploadProof";

export default function ProfilePage() {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    // Fetch languages...
  }, []);

  const config = {
    uploadType: "profile",
    languages,
    // Custom column definitions with language fields
    columnDefinitions: {
      type: { type: "string", label: "Type" },
      name: { type: "string", label: "Name" },
      ailments: { type: "array", label: "Ailments" },
      options: { type: "string", label: "Options" },
      Hindi: { type: "string", label: "Hindi" },
      HindiOpt: { type: "string", label: "Hindi Options" },
      Marathi: { type: "string", label: "Marathi" },
      MarathiOpt: { type: "string", label: "Marathi Options" },
      // ... other languages
    },
  };

  return (
    <BulkUploadProof
      config={config}
      setData={setData}
      setSuccess={setSuccess}
      success={success}
    />
  );
}
```

### 4. Daily Parameters with Language Support (Dailycsv/CSVLab.jsx → BulkUploadProof)

**Old Implementation:**
```jsx
import CSVReader from "../../components/Dailycsv/CSVLab";

export default function DailyParamsPage() {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [languages, setLanguages] = useState([]);

  return (
    <CSVReader
      setData={setData}
      setSuccess={setSuccess}
      success={success}
      languages={languages}
    />
  );
}
```

**New Implementation:**
```jsx
import { BulkUploadProof } from "../../components/BulkUploadProof";

export default function DailyParamsPage() {
  const [data, setData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [languages, setLanguages] = useState([]);

  const config = {
    uploadType: "daily",
    languages,
  };

  return (
    <BulkUploadProof
      config={config}
      setData={setData}
      setSuccess={setSuccess}
      success={success}
    />
  );
}
```

## Advanced Configuration

### Custom Configuration (without preset)

```jsx
const customConfig = {
  columnDefinitions: {
    patientName: { 
      type: "string", 
      isRequired: true, 
      label: "Patient Name" 
    },
    contactNumber: { 
      type: "string", 
      isRequired: true, 
      label: "Contact Number" 
    },
    appointmentDate: { 
      type: "string", 
      isRequired: false, 
      label: "Appointment Date" 
    },
  },
  requiredFields: ["patientName", "contactNumber"],
  serverEndpoint: "/appointments/bulk-create",
  additionalContext: {
    doctorId: currentDoctor.id,
  },
  onSuccess: (processedData) => {
    console.log("Upload successful:", processedData);
    showSuccessNotification();
  },
};

<BulkUploadProof config={customConfig} setData={setData} />
```

### With Dynamic Fields

```jsx
const config = {
  uploadType: "labReports",
  allowDynamicFields: true,
  onSuccess: handleUploadSuccess,
};

<BulkUploadProof config={config} setData={setData} />
```

## Configuration API

### Config Object Properties

```typescript
interface BulkUploadConfig {
  // Preset type: 'lab' | 'labReports' | 'daily' | 'profile'
  uploadType?: string;

  // Custom column definitions
  columnDefinitions?: {
    [fieldName]: {
      type: 'string' | 'number' | 'array' | 'language-pair';
      isRequired?: boolean;
      label: string;
      description?: string;
    }
  };

  // Available languages for translations
  languages?: Array<{
    id: number;
    language_name: string;
  }>;

  // Server endpoint for data submission
  serverEndpoint?: string;

  // Endpoint for file upload
  uploadFileEndpoint?: string;

  // Endpoint to fetch available columns
  fetchColumnsEndpoint?: string;

  // Additional context to include in requests
  additionalContext?: object;

  // Callback on successful upload
  onSuccess?: (processedData: any[]) => void;

  // Allow users to add custom fields
  allowDynamicFields?: boolean;

  // Fields that must be mapped
  requiredFields?: string[];

  // Number of preview rows to show
  previewRows?: number;

  // Requires language translations
  requiresLanguageTranslation?: boolean;
}
```

## Component Props

```jsx
<BulkUploadProof
  config={{...}}              // Configuration object
  setData={setDataFunction}   // Callback to receive mapped data
  setSuccess={setSuccessFunc} // Callback when upload succeeds
  success={successState}      // Current success state
/>
```

## Data Structure

### Mapped Data Format

The component returns data in the following format:

```javascript
[
  {
    // Regular fields based on column mappings
    fieldName1: value1,
    fieldName2: value2,
    
    // Additional context fields
    patientId: "123",
    
    // For language-enabled uploads
    languageTranslation: {
      2: { text: "हिंदी", options: "विकल्प" }, // Language ID -> translation
      3: { text: "मराठी", options: "पर्याय" },
    }
  },
  // ... more rows
]
```

## Error Handling

The component provides comprehensive error handling:

- **Validation errors**: Required fields not mapped
- **File errors**: Invalid file format, corrupted data
- **Server errors**: API failures, upload issues
- **User-friendly messages**: Clear error notifications

```jsx
// Errors are displayed in the component's error alert
// Access via onSuccess callback for custom handling
const config = {
  onSuccess: (data) => {
    // Called on successful upload
  },
};
```

## Styling

The component uses:
- Tailwind CSS for responsive layout
- Component-library primitives for consistency
- Inline styles for drag-drop zone customization

All styling follows your design system and theme.

## Breaking Changes from Old Components

⚠️ **Configuration-based API**: Old components had implicit behavior; new component uses explicit config

✅ **Backward Compatible**: All features are preserved through configuration

### Old Props → New Config Mapping

| Old Prop | New Config | Notes |
|----------|-----------|-------|
| `setData` | `setData` | Same |
| `setSuccess` | `setSuccess` | Same |
| `success` | `success` | Same |
| `patientId` | `additionalContext.patientId` | Moved to config |
| `languages` | `languages` | Moved to config |
| (implicit) | `uploadType` | Use presets or custom config |

## Performance Considerations

- Large CSV files (>10MB) are processed efficiently
- Language translations are built on-demand
- Preview uses first N rows (configurable)
- Dynamic field addition is O(1) operation

## Rollout Strategy

1. **Phase 1**: Update CSVLab.jsx imports in labs page
2. **Phase 2**: Update CSVLab2.jsx imports in lab reports page
3. **Phase 3**: Update CSVProfile.jsx imports in profile management
4. **Phase 4**: Update Dailycsv imports in daily parameters
5. **Phase 5**: Update other Labreports pages

## Support & Troubleshooting

### Common Issues

**Issue**: "Please map the following required fields"
- **Solution**: Ensure all required fields are mapped before submitting

**Issue**: "Failed to fetch column definitions"
- **Solution**: Verify fetchColumnsEndpoint is correct and server is running

**Issue**: Language translations not appearing
- **Solution**: Ensure `languages` array is provided in config and `requiresLanguageTranslation` is true

## API Reference Summary

See component code for detailed inline documentation of:
- `PRESET_CONFIGS`: Available preset configurations
- `mapRowToData()`: Row mapping logic
- `buildLanguageTranslations()`: Language processing
- `validateRequiredMappings()`: Validation logic
