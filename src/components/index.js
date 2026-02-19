/**
 * Components Index
 * Main barrel export for all components
 * 
 * @file src/components/index.js
 * 
 * @example
 * import { Button, Input, Container, Card } from './components';
 */

// ==================== RE-EXPORT FROM COMPONENT LIBRARY ====================
// Primitives
export {
  // Button
  Button,
  IconButton,
  ButtonGroup,
  
  // Form Inputs
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  InputLeftAddon,
  InputRightAddon,
  Select,
  Textarea,
  
  // Form Controls
  Checkbox,
  CheckboxGroup,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  RequiredIndicator,
  useFormControlContext,
  
  // Data Display
  Badge,
  StatusBadge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chart,
  
  // Typography
  Text,
  Heading,
  Link,
  Code,
  Label,
  
  // Overlay (Modal)
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useModalContext,
} from '../component-library/primitives';

// Layout
export {
  Box,
  Flex,
  Stack,
  VStack,
  HStack,
  Container,
  Center,
  Divider,
  Spacer,
  SimpleGrid,
  Grid,
  GridItem,
} from '../component-library/layout';

// Modal Wrappers
export {
  BaseModal,
  ConfirmModal,
  FormModal,
} from '../component-library/modals';

// Feedback
export {
  Alert,
  Toast,
  Spinner,
  Skeleton,
} from '../component-library/feedback';

// Navigation
export {
  Navbar,
  Sidebar,
  NavLink,
} from '../component-library/navigation';

// ==================== LOCAL COMPONENTS ====================
// Page-level components
export { PageHeader } from './PageHeader';
export { PatientNavTabs } from './PatientNavTabs';
export { PatientProfileCard } from './PatientProfileCard';
export { ParameterSection } from './ParameterSection';

// Form Components
export { SearchBar } from './SearchBar';

// Theme
export { ThemeProvider, useTheme, useThemeColors, useThemeTypography, ThemeContext } from './ThemeProvider';

// Modals
export * from './modals';

// Tables & List Components (Unified)
export {
  UnifiedListTable,
  PatientListTable,
  ParametersListTable,
  ReadingsListTable,
  ReadingsTable,
  DialysisTable,
  Table,
} from './table';

// Questions
export { default as QuestionsContainer } from './questions/QuestionsContainer';

// Bulk Upload (Unified CSV Component)
export { BulkUploadProof } from './BulkUploadProof';
