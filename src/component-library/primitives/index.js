/**
 * Primitives Index
 * Barrel export for all primitive components
 * 
 * @file src/component-library/primitives/index.js
 * 
 * @example
 * import { Button, Input, Badge, Card } from './component-library/primitives';
 */

// ==================== BUTTON ====================
export { 
  Button, 
  IconButton, 
  ButtonGroup 
} from './Button';

// ==================== FORM INPUTS ====================
export { 
  Input, 
  InputGroup, 
  InputLeftElement, 
  InputRightElement, 
  InputLeftAddon, 
  InputRightAddon 
} from './Input';

export { Select } from './Select';
export { Textarea } from './Textarea';

// ==================== FORM CONTROLS ====================
export { 
  Checkbox, 
  CheckboxGroup 
} from './Checkbox';

export { Switch } from './Switch';

export { 
  FormControl, 
  FormLabel, 
  FormHelperText, 
  FormErrorMessage, 
  RequiredIndicator, 
  useFormControlContext 
} from './FormControl';

// ==================== DATA DISPLAY ====================
export { 
  Badge, 
  StatusBadge 
} from './Badge';

export { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter 
} from './Card';

export { Chart } from './Chart';

// ==================== TYPOGRAPHY ====================
export { 
  Text, 
  Heading, 
  Link, 
  Code, 
  Label 
} from './Typography';

// ==================== OVERLAY ====================
export { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton, 
  useModalContext 
} from './Modal';
