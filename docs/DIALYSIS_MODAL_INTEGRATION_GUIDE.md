# Integration & Usage Examples

## How to Use the Dialysis Parameters Modal

### Basic Import
```jsx
// From component-library
import { 
  Accordion, 
  AccordionItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Card,
  CardHeader,
  CardBody,
  Checkbox,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Badge,
  Box,
  HStack,
  VStack,
} from '../../../component-library';

// Direct component import
import DialysisParametersModal from './DialysisParametersModal';
```

### Example 1: Basic Modal Setup in BedManagementDashboard

```jsx
export default function BedManagementDashboard() {
  const [isDialysisModalOpen, setIsDialysisModalOpen] = useState(false);
  const [dialysisPatientData, setDialysisPatientData] = useState({});
  const [dialysisBedData, setDialysisBedData] = useState({});

  const handleOpenDialysisModal = (patient, bed) => {
    setDialysisPatientData(patient);
    setDialysisBedData(bed);
    setIsDialysisModalOpen(true);
  };

  return (
    <>
      {/* Your existing UI */}
      
      <DialysisParametersModal
        isOpen={isDialysisModalOpen}
        onClose={() => {
          setIsDialysisModalOpen(false);
          setDialysisPatientData({});
          setDialysisBedData({});
        }}
        patient={dialysisPatientData}
        bed={dialysisBedData}
        onStageChange={(stage, data) => {
          // Handle stage changes:
          // 'before' -> Pre-dialysis completed
          // 'during' -> During dialysis started
          // 'after' -> During dialysis stopped
          // 'completed' -> Session finished
          console.log(`Moved to ${stage} with data:`, data);
        }}
      />
    </>
  );
}
```

### Example 2: Advanced Modal with Data Fetching

```jsx
const [patientParams, setPatientParams] = useState(null);
const [dialysisReadings, setDialysisReadings] = useState(null);

useEffect(() => {
  if (isDialysisModalOpen && dialysisPatientData?.patient_id) {
    fetchPatientData();
  }
}, [isDialysisModalOpen, dialysisPatientData?.patient_id]);

const fetchPatientData = async () => {
  try {
    const params = await getDialysisHealthParams({
      patient_id: dialysisPatientData.patient_id,
    });
    setPatientParams(params.data);

    const readings = await getDialysisReadings();
    const filtered = readings.data?.filter(
      (r) => r.patient_id === dialysisPatientData.patient_id
    );
    setDialysisReadings(filtered);
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }
};

// Pass to modal
<DialysisParametersModal
  patient={dialysisPatientData}
  bed={dialysisBedData}
  initialData={{
    params: patientParams,
    readings: dialysisReadings,
  }}
  onStageChange={handleStageChange}
/>
```

### Example 3: Using Accordion Independently

```jsx
import { Accordion, AccordionItem } from '../component-library';

function MyCustomComponent() {
  return (
    <Accordion 
      defaultIndex={0}  // First item open by default
      allowMultiple={false}  // Only one item open at a time
    >
      <AccordionItem 
        title="Medical History"
        badge="REQUIRED"
        badgeColor="danger"
      >
        <Box p={4}>
          {/* Your content */}
        </Box>
      </AccordionItem>

      <AccordionItem 
        title="Current Medications"
        badge="5 ITEMS"
        badgeColor="warning"
      >
        <Box p={4}>
          {/* Your content */}
        </Box>
      </AccordionItem>

      <AccordionItem 
        title="Recent Lab Results"
        badge="CURRENT"
        badgeColor="success"
      >
        <Box p={4}>
          {/* Your content */}
        </Box>
      </AccordionItem>
    </Accordion>
  );
}
```

## API Integration Patterns

### Pattern 1: Stage Submission Handler

```jsx
const handleStageChange = async (stage, data) => {
  const payload = {
    patient_id: dialysisPatientData.patient_id,
    bed_id: dialysisBedData.id,
    stage,
    ...data,
    timestamp: new Date().toISOString(),
  };

  try {
    const result = await submitDialysisHealthParams(payload);
    if (result.success) {
      showNotification('Success', `${stage} stage data saved`);
    }
  } catch (err) {
    showNotification('Error', err.message, 'error');
  }
};
```

### Pattern 2: Session Completion Handler

```jsx
const handleSessionComplete = async (finalData) => {
  try {
    // Save final session data
    const sessionData = {
      patient_id: dialysisPatientData.patient_id,
      bed_id: dialysisBedData.id,
      session_date: new Date().toISOString(),
      before_dialysis: beforeData,
      during_dialysis: duringData,
      after_dialysis: afterData,
    };

    const result = await submitDialysisHealthParams(sessionData);
    
    if (result.success) {
      // Mark session complete
      await markSessionComplete(sessionData);
      
      // Update bed status if needed
      await updateBedStatus(dialysisBedData.id, 'EMPTY');
      
      // Show success and close
      showNotification('Success', 'Session completed successfully');
      setIsDialysisModalOpen(false);
    }
  } catch (err) {
    showNotification('Error', 'Failed to complete session', 'error');
  }
};
```

## CSS Customization

### Override Default Colors

```css
/* In your custom CSS file */
:root {
  --color-info: #2196F3;
  --color-info-light: #E3F2FD;
  --color-warning: #FF9800;
  --color-warning-light: #FFF3E0;
  --color-success: #4CAF50;
  --color-success-light: #E8F5E9;
}

/* Custom accordion styling */
.accordion {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.accordion-item__header {
  background: linear-gradient(135deg, #f5f5f5, #fff);
}
```

## Event Handling Patterns

### Pattern 1: Modal Open/Close with Transitions

```jsx
const [isDialysisModalOpen, setIsDialysisModalOpen] = useState(false);
const [modalTransition, setModalTransition] = useState('entering');

const openModal = () => {
  setIsDialysisModalOpen(true);
  setModalTransition('entering');
  setTimeout(() => setModalTransition('entered'), 100);
};

const closeModal = () => {
  setModalTransition('exiting');
  setTimeout(() => {
    setIsDialysisModalOpen(false);
    setModalTransition('exited');
  }, 300);
};
```

### Pattern 2: Keyboard Event Handling

```jsx
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isDialysisModalOpen) {
      closeModal();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isDialysisModalOpen]);
```

## Performance Optimization

### Memoization Pattern

```jsx
const MemoizedDialysisModal = React.memo(DialysisParametersModal, (prev, next) => {
  return (
    prev.isOpen === next.isOpen &&
    prev.patient.patient_id === next.patient.patient_id &&
    prev.bed.id === next.bed.id
  );
});

// Use memoized version
<MemoizedDialysisModal {...props} />
```

### Lazy Loading Long Lists

```jsx
const LazyDuringReadings = lazy(() => 
  import('./LazyDuringDialysisReadings')
);

// In modal
{stage === 'during' && (
  <Suspense fallback={<Box>Loading...</Box>}>
    <LazyDuringReadings readings={duringReadings} />
  </Suspense>
)}
```

## Error Boundary Integration

```jsx
<ErrorBoundary 
  fallback={() => (
    <Card variant="outline">
      <CardBody>
        <Text>Failed to load dialysis parameters</Text>
        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </CardBody>
    </Card>
  )}
>
  <DialysisParametersModal {...props} />
</ErrorBoundary>
```

## Testing Examples

### Unit Test with React Testing Library

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import DialysisParametersModal from './DialysisParametersModal';

describe('DialysisParametersModal', () => {
  it('should render modal with patient info', () => {
    const mockPatient = {
      patient_id: 'p123',
      patient_name: 'John Doe',
    };
    
    render(
      <DialysisParametersModal
        isOpen={true}
        patient={mockPatient}
        bed={{ id: 'b1', bed_number: '101' }}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
  });

  it('should toggle accordion items', () => {
    render(
      <DialysisParametersModal
        isOpen={true}
        patient={mockPatient}
        bed={mockBed}
        onClose={jest.fn()}
      />
    );

    const accordionButton = screen.getByText(
      'Pre-Dialysis Assessment & Checklist'
    );
    fireEvent.click(accordionButton);
    
    expect(screen.getByText('Physical examination completed')).toBeVisible();
  });
});
```

---

**For more details**, refer to:
- `DIALYSIS_MODAL_IMPLEMENTATION.md` - Complete technical documentation
- `DIALYSIS_MODAL_QUICK_GUIDE.md` - Quick reference guide
