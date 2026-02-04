# Design System Documentation

A scalable, token-driven design system with reusable primitives for consistent UI development.

## Table of Contents

- [Quick Start](#quick-start)
- [Design Tokens](#design-tokens)
- [CSS Variables](#css-variables)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## Quick Start

### 1. Import the Design System CSS

The design system CSS is already imported in `src/index.css`. No additional setup needed.

```css
/* src/index.css */
@import './design-system/styles/index.css';
```

### 2. Use Components

```jsx
import { Button, Input, Card, Container } from './components';

function MyComponent() {
  return (
    <Container size="lg">
      <Card variant="elevated">
        <Input placeholder="Enter text..." />
        <Button variant="primary">Submit</Button>
      </Card>
    </Container>
  );
}
```

### 3. Use Semantic CSS Classes

```jsx
<button className="btn btn--primary btn--md">
  Click Me
</button>

<input className="input input--md input--outline" placeholder="Type here..." />

<span className="badge badge--success badge--solid">
  Active
</span>
```

---

## Design Tokens

Design tokens are the single source of truth for all visual styles.

### Colors

| Token | CSS Variable | Value |
|-------|--------------|-------|
| Primary | `--color-primary` | `#4164df` |
| Primary Dark | `--color-primary-dark` | `#004c6d` |
| Accent | `--color-accent` | `#5886a5` |
| Success | `--color-success` | `#00c008` |
| Warning | `--color-warning` | `#ff9800` |
| Danger | `--color-danger` | `#de425b` |
| Error | `--color-error` | `#ff5252` |
| Info | `--color-info` | `#00cccc` |

### Typography

| Token | CSS Variable | Value |
|-------|--------------|-------|
| Font Primary | `--font-primary` | `"Sora", sans-serif` |
| Font Size XS | `--font-size-xs` | `0.75rem` (12px) |
| Font Size SM | `--font-size-sm` | `0.875rem` (14px) |
| Font Size MD | `--font-size-md` | `1rem` (16px) |
| Font Size LG | `--font-size-lg` | `1.125rem` (18px) |
| Font Size XL | `--font-size-xl` | `1.25rem` (20px) |
| Font Size 2XL | `--font-size-2xl` | `1.5rem` (24px) |

### Spacing

| Token | CSS Variable | Value |
|-------|--------------|-------|
| Space 1 | `--space-1` | `0.25rem` (4px) |
| Space 2 | `--space-2` | `0.5rem` (8px) |
| Space 3 | `--space-3` | `0.75rem` (12px) |
| Space 4 | `--space-4` | `1rem` (16px) |
| Space 6 | `--space-6` | `1.5rem` (24px) |
| Space 8 | `--space-8` | `2rem` (32px) |

### Border Radius

| Token | CSS Variable | Value |
|-------|--------------|-------|
| Radius SM | `--radius-sm` | `0.125rem` (2px) |
| Radius MD | `--radius-md` | `0.375rem` (6px) |
| Radius LG | `--radius-lg` | `0.5rem` (8px) |
| Radius XL | `--radius-xl` | `0.75rem` (12px) |
| Radius Full | `--radius-full` | `9999px` |

### Shadows

| Token | CSS Variable |
|-------|--------------|
| Shadow SM | `--shadow-sm` |
| Shadow Base | `--shadow-base` |
| Shadow MD | `--shadow-md` |
| Shadow LG | `--shadow-lg` |
| Shadow Card | `--shadow-card` |

---

## CSS Variables

All tokens are available as CSS custom properties in `:root`.

### Using in CSS

```css
.my-element {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
```

### Using with Tailwind

The Tailwind config is wired to use CSS variables:

```jsx
<div className="text-primary bg-surface p-4 rounded-lg shadow-card">
  Content
</div>
```

---

## Components

### Primitives

Located in `src/components/primitives/`

#### Button

```jsx
import { Button, IconButton, ButtonGroup } from './components/primitives';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button isLoading>Loading</Button>
<Button isDisabled>Disabled</Button>
<Button isFullWidth>Full Width</Button>

// With Icons
<Button leftIcon={<Icon />}>With Icon</Button>
```

#### Input

```jsx
import { Input, InputGroup, InputLeftElement } from './components/primitives';

// Variants
<Input variant="outline" placeholder="Outline" />
<Input variant="filled" placeholder="Filled" />
<Input variant="flushed" placeholder="Flushed" />

// Sizes
<Input size="sm" />
<Input size="md" />
<Input size="lg" />

// States
<Input isInvalid />
<Input isDisabled />
<Input isReadOnly />

// With Group
<InputGroup>
  <InputLeftElement>🔍</InputLeftElement>
  <Input placeholder="Search..." />
</InputGroup>
```

#### Badge

```jsx
import { Badge, StatusBadge } from './components/primitives';

// Variants
<Badge variant="subtle" colorScheme="success">Active</Badge>
<Badge variant="solid" colorScheme="danger">Error</Badge>
<Badge variant="outline" colorScheme="info">Info</Badge>

// Status Badge
<StatusBadge status="online">Online</StatusBadge>
<StatusBadge status="offline">Offline</StatusBadge>
```

#### Card

```jsx
import { Card, CardHeader, CardBody, CardFooter } from './components/primitives';

<Card variant="elevated">
  <CardHeader>Title</CardHeader>
  <CardBody>Content goes here</CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Modal

```jsx
import { 
  Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton 
} from './components/primitives';

const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      Modal Title
      <ModalCloseButton />
    </ModalHeader>
    <ModalBody>
      Modal content here
    </ModalBody>
    <ModalFooter>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

#### Form Controls

```jsx
import { 
  FormControl, FormLabel, FormErrorMessage, FormHelperText,
  Checkbox, Switch 
} from './components/primitives';

<FormControl isRequired isInvalid={hasError}>
  <FormLabel>Email</FormLabel>
  <Input type="email" />
  <FormHelperText>We'll never share your email.</FormHelperText>
  <FormErrorMessage>Email is required</FormErrorMessage>
</FormControl>

<Checkbox>Remember me</Checkbox>
<Switch>Enable notifications</Switch>
```

### Layout Components

Located in `src/components/layout/`

```jsx
import { 
  Container, Flex, Stack, VStack, HStack, 
  Grid, SimpleGrid, Box, Center, Divider, Spacer 
} from './components/layout';

// Container
<Container size="lg">
  <Content />
</Container>

// Flex
<Flex justify="between" align="center" gap={4}>
  <Box>Left</Box>
  <Spacer />
  <Box>Right</Box>
</Flex>

// Stack
<Stack spacing={4}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>

// VStack / HStack
<VStack spacing={2}>
  <Text>Vertical</Text>
  <Text>Stack</Text>
</VStack>

<HStack spacing={4}>
  <Text>Horizontal</Text>
  <Text>Stack</Text>
</HStack>

// Grid
<SimpleGrid columns={3} spacing="md">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</SimpleGrid>
```

---

## Usage Examples

### Form Example

```jsx
import { 
  Card, CardBody, 
  FormControl, FormLabel, FormErrorMessage,
  Input, Select, Textarea, Button, Stack 
} from './components';

function ContactForm() {
  const [error, setError] = useState(false);
  
  return (
    <Card>
      <CardBody>
        <Stack spacing={4}>
          <FormControl isRequired isInvalid={error}>
            <FormLabel>Name</FormLabel>
            <Input placeholder="Your name" />
            <FormErrorMessage>Name is required</FormErrorMessage>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="you@example.com" />
          </FormControl>
          
          <FormControl>
            <FormLabel>Subject</FormLabel>
            <Select placeholder="Select subject">
              <option value="general">General Inquiry</option>
              <option value="support">Support</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Message</FormLabel>
            <Textarea rows={4} placeholder="Your message..." />
          </FormControl>
          
          <Button variant="primary" type="submit">
            Send Message
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}
```

### Dashboard Card Example

```jsx
import { 
  Card, CardHeader, CardBody, 
  Flex, Text, Heading, Badge 
} from './components';

function StatsCard({ title, value, change, status }) {
  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Text color="muted">{title}</Text>
          <Badge colorScheme={status === 'up' ? 'success' : 'danger'}>
            {change}
          </Badge>
        </Flex>
      </CardHeader>
      <CardBody>
        <Heading as="h3" size="2xl">{value}</Heading>
      </CardBody>
    </Card>
  );
}
```

---

## Migration Guide

### From Hardcoded Colors

**Before:**
```jsx
<div style={{ color: '#4164df', backgroundColor: '#f5f5f5' }}>
```

**After:**
```jsx
<div style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-background-alt)' }}>
// Or with Tailwind
<div className="text-primary bg-background-alt">
```

### From Custom SCSS

**Before (SCSS):**
```scss
.button {
  background-color: #4164df;
  padding: 12px 24px;
  border-radius: 8px;
}
```

**After (CSS with tokens):**
```css
.button {
  background-color: var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
}
```

### From Scattered Tailwind

**Before:**
```jsx
<button className="bg-[#4164df] px-6 py-3 rounded-lg text-white font-medium">
```

**After:**
```jsx
<Button variant="primary" size="md">
// Or with semantic classes
<button className="btn btn--primary btn--md">
```

---

## Best Practices

### 1. Use Semantic Classes for Components

Prefer semantic classes over utility-first for component styling:

```jsx
// ✅ Good
<button className="btn btn--primary btn--md">

// ❌ Avoid for components
<button className="bg-primary px-4 py-2 rounded-2xl text-white font-medium">
```

### 2. Use Tailwind for Layout

Keep Tailwind for layout utilities:

```jsx
// ✅ Good - Tailwind for layout, semantic for identity
<div className="flex items-center gap-4">
  <Button variant="primary">Save</Button>
  <Button variant="ghost">Cancel</Button>
</div>
```

### 3. Use CSS Variables Directly When Needed

For custom styling, use CSS variables:

```css
.custom-element {
  border: 2px solid var(--color-border);
  transition: var(--transition-normal);
}
```

### 4. Don't Mix Systems

```jsx
// ❌ Avoid mixing hardcoded values with tokens
<div style={{ color: '#4164df', padding: 'var(--space-4)' }}>

// ✅ Use tokens consistently
<div style={{ color: 'var(--color-primary)', padding: 'var(--space-4)' }}>
```

### 5. Import Components from Barrel Exports

```jsx
// ✅ Good
import { Button, Input, Card } from './components';

// ❌ Avoid deep imports
import Button from './components/primitives/Button';
import Input from './components/primitives/Input';
```

---

## File Structure

```
src/
├── design-system/
│   ├── index.js                  # Main entry point
│   ├── styles/
│   │   ├── index.css             # Main CSS entry
│   │   ├── variables.css         # CSS custom properties
│   │   ├── button.css            # Button styles
│   │   ├── input.css             # Input styles
│   │   ├── typography.css        # Typography styles
│   │   ├── badge.css             # Badge styles
│   │   ├── card.css              # Card & layout styles
│   │   ├── modal.css             # Modal & overlay styles
│   │   └── form-controls.css     # Form control styles
│   └── tokens/
│       └── index.js              # JS token exports
│
├── components/
│   ├── index.js                  # Main component exports
│   ├── primitives/
│   │   ├── index.js              # Primitives barrel export
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Textarea.jsx
│   │   ├── Badge.jsx
│   │   ├── Checkbox.jsx
│   │   ├── Switch.jsx
│   │   ├── FormControl.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── Typography.jsx
│   └── layout/
│       ├── index.js              # Layout barrel export
│       └── Layout.jsx            # All layout components
│
├── index.css                     # App styles (imports design-system)
└── tailwind.config.js            # Tailwind wired to CSS variables
```

---

## Next Steps

1. **Add Storybook** - Document components with interactive examples
2. **Add Tests** - Unit tests with React Testing Library
3. **Add a11y Tests** - Accessibility audits with jest-axe
4. **TypeScript** - Add type definitions for components
5. **Migrate Existing Components** - Replace hardcoded styles with tokens
