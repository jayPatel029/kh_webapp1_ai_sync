/**
 * Page Header Component
 * Breadcrumb and page title
 * 
 * @file src/components/PageHeader.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Text, Heading } from '../component-library/primitives/Typography';
import { Flex, Box } from '../component-library/layout/Layout';
import { colors } from '../design-system/tokens';
import * as assets from '../assets';

export const PageHeader = ({
  breadcrumbs = ['My patients'],
  title = 'Patient Name',
  onBackClick,
}) => {
  // Normalize breadcrumbs: accept array of strings or objects { label, path, active, icon }
  const crumbs = Array.isArray(breadcrumbs)
    ? breadcrumbs.map((b) => (typeof b === 'string' ? { label: b } : b))
    : [{ label: String(breadcrumbs) }];

  return (
    <Box
      className="w-full px-0 py-2 noscrollbar" 
    >
      <Flex direction="column" gap={2}>
        <Flex gap={2} align="center">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="text-2xl mr-2"
              style={{ cursor: 'pointer' }}
            >
              ←
            </button>
          )}

          <Text size="sm" weight="normal" style={{ color: '#989898' }}>
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-2">/</span>}
                {c.icon && assets[c.icon] ? (
                  <img src={assets[c.icon]} alt="icon" className="inline-block mr-2" style={{ width: 14, height: 14 }} />
                ) : null}
                {c.path && !c.active ? (
                  <Link to={c.path} style={{ color: '#989898', textDecoration: 'none' }}>{c.label}</Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </Text>
        </Flex>

        <Heading size="xl" weight="bold" style={{ color: '#3f6b85' }}>
          {title}
        </Heading>
      </Flex>
    </Box >
  );
};

export default PageHeader;