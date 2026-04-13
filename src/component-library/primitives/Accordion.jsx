/**
 * Accordion Component
 * Collapsible accordion with support for multiple items
 * 
 * @file src/component-library/primitives/Accordion.jsx
 * 
 * @example
 * <Accordion defaultIndex={0}>
 *   <AccordionItem title="Section 1">
 *     Content 1
 *   </AccordionItem>
 *   <AccordionItem title="Section 2">
 *     Content 2
 *   </AccordionItem>
 * </Accordion>
 */

import React, { useState, createContext, useContext, Children, cloneElement } from 'react';
import { Box, HStack, VStack } from '../layout/Layout';
import { Heading, Text } from './Typography';
import './Accordion.css';

const AccordionContext = createContext();

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within Accordion');
  }
  return context;
};

/**
 * Accordion Component
 * @param {number} defaultIndex - Index of the initially expanded item (0-based)
 * @param {boolean} allowMultiple - Allow multiple items to be open at once
 * @param {React.ReactNode} children - AccordionItem components
 * @param {string} className - Additional CSS classes
 */
export const Accordion = ({
  defaultIndex = 0,
  allowMultiple = false,
  children,
  className = '',
}) => {
  const [expandedIndices, setExpandedIndices] = useState(
    defaultIndex !== null ? [defaultIndex] : []
  );

  const toggleItem = (index) => {
    if (allowMultiple) {
      setExpandedIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setExpandedIndices((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ expandedIndices, toggleItem }}>
      <VStack spacing={0} className={`accordion ${className}`} align="stretch">
        {Children.map(children, (child, index) =>
          child
            ? cloneElement(child, {
                'data-accordion-index': index,
              })
            : null
        )}
      </VStack>
    </AccordionContext.Provider>
  );
};

/**
 * AccordionItem Component
 * @param {string} title - Title of the accordion item
 * @param {React.ReactNode} children - Content to display when expanded
 * @param {string} badge - Optional badge text
 * @param {string} badgeColor - Color of the badge (success, warning, danger, info)
 * @param {boolean} disabled - Disable the item
 * @param {string} className - Additional CSS classes
 */
export const AccordionItem = React.forwardRef(({
  title,
  children,
  badge,
  badgeColor = 'info',
  disabled = false,
  className = '',
  'data-accordion-index': itemIndex,
}, ref) => {
  const { expandedIndices, toggleItem } = useAccordionContext();
  
  const isExpanded = itemIndex !== null && expandedIndices.includes(itemIndex);

  const handleClick = () => {
    if (!disabled) {
      toggleItem(itemIndex);
    }
  };

  return (
    <Box className={`accordion-item ${className}`} ref={ref}>
      <Box 
        className="accordion-item__header" 
        role="button" 
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <HStack spacing={3} width="100%" justify="space-between">
          <HStack spacing={2} flex={1}>
            <Box className={`accordion-item__toggle ${isExpanded ? 'accordion-item__toggle--expanded' : ''}`}>
              ▼
            </Box>
            <Box flex={1}>
              <Heading as="h4" size="sm" className="accordion-item__title">
                {title}
              </Heading>
            </Box>
          </HStack>
          {badge && (
            <Box
              className={`accordion-item__badge accordion-item__badge--${badgeColor}`}
            >
              {badge}
            </Box>
          )}
        </HStack>
      </Box>

      {isExpanded && (
        <Box className="accordion-item__content">
          {children}
        </Box>
      )}
    </Box>
  );
});

AccordionItem.displayName = 'AccordionItem';

export default Accordion;
