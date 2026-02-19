/**
 * Layout Components
 * Container, Box, Flex, Grid, Stack, Divider, Spacer
 * 
 * @file src/component-library/layout/Layout.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Box Component
 * The most basic building block
 * 
 * @example
 * <Box p={4} bg="surface" rounded="md">Content</Box>
 */
export const Box = forwardRef(({
  children,
  as: Component = 'div',
  className,
  ...props
}, ref) => {
  return (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  );
});

Box.displayName = 'Box';

Box.propTypes = {
  children: PropTypes.node,
  as: PropTypes.elementType,
  className: PropTypes.string,
};

/**
 * Flex Component
 * Flexbox container
 * 
 * @example
 * <Flex justify="between" align="center" gap={4}>
 *   <Box>Left</Box>
 *   <Box>Right</Box>
 * </Flex>
 */
export const Flex = forwardRef(({
  children,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap,
  className,
  ...props
}, ref) => {
  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const flexClasses = clsx(
    'd-flex',
    direction === 'column' ? 'flex-col' : 'flex-row',
    wrap === 'wrap' ? 'flex-wrap' : 'flex-nowrap',
    justifyMap[justify],
    alignMap[align],
    gap && `gap-${gap}`,
    className
  );

  return (
    <div ref={ref} className={flexClasses} {...props}>
      {children}
    </div>
  );
});

Flex.displayName = 'Flex';

Flex.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['row', 'column', 'row-reverse', 'column-reverse']),
  wrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrap-reverse']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  gap: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 8, 10, 12]),
  className: PropTypes.string,
};

/**
 * Stack Component
 * Vertical or horizontal stack with consistent spacing
 * 
 * @example
 * <Stack spacing={4}>
 *   <Box>Item 1</Box>
 *   <Box>Item 2</Box>
 * </Stack>
 */
export const Stack = forwardRef(({
  children,
  direction = 'column',
  spacing = 4,
  align,
  justify,
  divider,
  className,
  ...props
}, ref) => {
  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  const stackClasses = clsx(
    'd-flex',
    direction === 'column' ? 'flex-col' : 'flex-row',
    `gap-${spacing}`,
    align && alignMap[align],
    justify && justifyMap[justify],
    className
  );

  if (divider) {
    const childArray = React.Children.toArray(children);
    const dividedChildren = [];
    
    childArray.forEach((child, index) => {
      dividedChildren.push(child);
      if (index < childArray.length - 1) {
        dividedChildren.push(
          React.cloneElement(divider, { key: `divider-${index}` })
        );
      }
    });

    return (
      <div ref={ref} className={stackClasses} {...props}>
        {dividedChildren}
      </div>
    );
  }

  return (
    <div ref={ref} className={stackClasses} {...props}>
      {children}
    </div>
  );
});

Stack.displayName = 'Stack';

Stack.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['column', 'row']),
  spacing: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 8, 10, 12]),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between']),
  divider: PropTypes.element,
  className: PropTypes.string,
};

/**
 * VStack Component
 * Vertical stack shorthand
 */
export const VStack = forwardRef((props, ref) => (
  <Stack ref={ref} direction="column" align="center" {...props} />
));

VStack.displayName = 'VStack';

/**
 * HStack Component
 * Horizontal stack shorthand
 */
export const HStack = forwardRef((props, ref) => (
  <Stack ref={ref} direction="row" align="center" {...props} />
));

HStack.displayName = 'HStack';

/**
 * Container Component
 * Centered content container with max-width
 * 
 * @example
 * <Container size="lg">
 *   <Content />
 * </Container>
 */
export const Container = forwardRef(({
  children,
  size = 'lg',
  centerContent = false,
  className,
  ...props
}, ref) => {
  const containerClasses = clsx(
    'container',
    `container--${size}`,
    {
      'container--center': centerContent,
    },
    className
  );

  return (
    <div ref={ref} className={containerClasses} {...props}>
      {children}
    </div>
  );
});

Container.displayName = 'Container';

Container.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full', 'navmatch']),
  centerContent: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Center Component
 * Centers content horizontally and vertically
 */
export const Center = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('center', className)} {...props}>
      {children}
    </div>
  );
});

Center.displayName = 'Center';

Center.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * Divider Component
 * Visual separator
 * 
 * @example
 * <Divider orientation="horizontal" />
 */
export const Divider = forwardRef(({
  orientation = 'horizontal',
  className,
  ...props
}, ref) => {
  const dividerClasses = clsx(
    'divider',
    orientation === 'horizontal' ? 'divider--horizontal' : 'divider--vertical',
    className
  );

  return (
    <hr
      ref={ref}
      className={dividerClasses}
      aria-orientation={orientation}
      {...props}
    />
  );
});

Divider.displayName = 'Divider';

Divider.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string,
};

/**
 * Spacer Component
 * Flexible spacer for flexbox layouts
 */
export const Spacer = forwardRef(({
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('spacer', className)} aria-hidden="true" {...props} />
  );
});

Spacer.displayName = 'Spacer';

Spacer.propTypes = {
  className: PropTypes.string,
};

/**
 * SimpleGrid Component
 * Responsive grid layout
 * 
 * @example
 * <SimpleGrid columns={3} spacing="md">
 *   <Card>1</Card>
 *   <Card>2</Card>
 *   <Card>3</Card>
 * </SimpleGrid>
 */
export const SimpleGrid = forwardRef(({
  children,
  columns = 1,
  spacing = 'md',
  minChildWidth,
  className,
  ...props
}, ref) => {
  const spacingMap = {
    sm: 'simple-grid--gap-sm',
    md: 'simple-grid--gap-md',
    lg: 'simple-grid--gap-lg',
    xl: 'simple-grid--gap-xl',
  };

  const gridClasses = clsx(
    'simple-grid',
    minChildWidth ? 'simple-grid--auto' : `simple-grid--cols-${columns}`,
    spacingMap[spacing],
    className
  );

  const style = minChildWidth ? {
    gridTemplateColumns: `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`,
  } : undefined;

  return (
    <div ref={ref} className={gridClasses} style={style} {...props}>
      {children}
    </div>
  );
});

SimpleGrid.displayName = 'SimpleGrid';

SimpleGrid.propTypes = {
  children: PropTypes.node,
  columns: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  spacing: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  minChildWidth: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Grid Component
 * CSS Grid container
 */
export const Grid = forwardRef(({
  children,
  templateColumns,
  templateRows,
  gap,
  className,
  ...props
}, ref) => {
  const style = {
    display: 'grid',
    gridTemplateColumns: templateColumns,
    gridTemplateRows: templateRows,
    gap: gap ? `var(--space-${gap})` : undefined,
  };

  return (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';

Grid.propTypes = {
  children: PropTypes.node,
  templateColumns: PropTypes.string,
  templateRows: PropTypes.string,
  gap: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 8, 10, 12]),
  className: PropTypes.string,
};

/**
 * GridItem Component
 * Grid child with span controls
 */
export const GridItem = forwardRef(({
  children,
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  className,
  ...props
}, ref) => {
  const style = {
    gridColumn: colSpan ? `span ${colSpan}` : undefined,
    gridRow: rowSpan ? `span ${rowSpan}` : undefined,
    gridColumnStart: colStart,
    gridColumnEnd: colEnd,
    gridRowStart: rowStart,
    gridRowEnd: rowEnd,
  };

  return (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  );
});

GridItem.displayName = 'GridItem';

GridItem.propTypes = {
  children: PropTypes.node,
  colSpan: PropTypes.number,
  rowSpan: PropTypes.number,
  colStart: PropTypes.number,
  colEnd: PropTypes.number,
  rowStart: PropTypes.number,
  rowEnd: PropTypes.number,
  className: PropTypes.string,
};

export default {
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
};
