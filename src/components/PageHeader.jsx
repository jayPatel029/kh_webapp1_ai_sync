/**
 * Page Header Component
 * Breadcrumb and page title
 * 
 * @file src/components/PageHeader.jsx
 */

import React from 'react';
import { Text, Heading } from './primitives/Typography';
import { Flex, Box } from './layout/Layout';
import { colors } from '../design-system/tokens';

export const PageHeader = ({
  breadcrumbs = ['My patients'],
  title = 'Patient Name',
  onBackClick,
}) => {
  return (
    <Box
      className="w-full px-10 py-6 border-b"
      style={{
        borderBottom: `1px solid ${colors.border.DEFAULT}`,
      }}
    >
      <Flex
        gap={4}
        align="center"
        className="mb-4"
      >
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="text-2xl"
            style={{ cursor: 'pointer' }}
          >
            ←
          </button>
        )}
      </Flex>

      <Flex direction="column" gap={2}>
        <Text
          size="sm"
          weight="normal"
          color="text.muted"
        >
          {breadcrumbs.join(' / ')}
        </Text>
        <Heading
          size="xl"
          weight="bold"
          color="text.DEFAULT"
        >
          {title}
        </Heading>
      </Flex>
    </Box>
  );
};

export default PageHeader;
