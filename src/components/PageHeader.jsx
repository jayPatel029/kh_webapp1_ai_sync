/**
 * Page Header Component
 * Breadcrumb and page title
 * 
 * @file src/components/PageHeader.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Text, Heading, Box, Flex, IconButton } from '../component-library';
import * as assets from '../assets';
import '../design-system/styles/index.css';

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
    <Box className="page-header w-full px-0 py-2 noscrollbar">
      <Flex direction="column" gap={2}>
        <Flex gap={2} align="center">
          {onBackClick && (
            <IconButton
              onClick={onBackClick}
              variant="ghost"
              aria-label="Go back"
              className="mr-2"
            >
              ←
            </IconButton>
          )}

          <Text size="sm" weight="normal" className="text-muted">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-2">/</span>}
                {c.icon && assets[c.icon] ? (
                  <img
                    src={assets[c.icon]}
                    alt="icon"
                    className="inline-block mr-2"
                    style={{ width: 14, height: 14 }}
                  />
                ) : null}
                {c.path && !c.active ? (
                  <Link
                    to={c.path}
                    className="text-muted hover:text-primary transition-colors"
                    style={{ textDecoration: 'none' }}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </Text>
        </Flex>

        <Heading size="xl" weight="bold" className="text-primary-dark">
          {title}
        </Heading>
      </Flex>
    </Box>
  );
};

export default PageHeader;