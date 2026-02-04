/**
 * Components Index
 * Main barrel export for all components
 * 
 * @file src/components/index.js
 * 
 * @example
 * import { Button, Input, Container, Card } from './components';
 */

// ==================== PRIMITIVES ====================
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
  
  // Typography
  Text,
  Heading,
  Link,
  Code,
  Label,
  
  // Overlay
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useModalContext,
} from './primitives';

// ==================== LAYOUT ====================
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
} from './layout';

// ==================== THEME ====================
export { ThemeProvider, useTheme, useThemeColors, useThemeTypography, ThemeContext } from './ThemeProvider';
