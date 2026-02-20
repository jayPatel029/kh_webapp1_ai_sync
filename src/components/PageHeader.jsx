/**
 * Page Header Component
 * Breadcrumb and page title
 * 
 * @file src/components/PageHeader.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Text, Heading, Box, Flex, IconButton, Button } from '../component-library';
import * as assets from '../assets';
import '../design-system/styles/index.css';
import onBackButton from '../assets/onBackButton.svg';
export const PageHeader = ({
  breadcrumbs = [],
  title = 'Patient Name',
  onBack,
}) => {
  // Normalize breadcrumbs: accept array of strings or objects { label, path, active, icon }
  const crumbs = Array.isArray(breadcrumbs)
    ? breadcrumbs.map((b) => (typeof b === 'string' ? { label: b } : b))
    : [{ label: String(breadcrumbs) }];

  return (
    <Box className="w-full mt-3 px-0 py-2 noscrollbar">
      <Flex direction="rows" align="center" gap={6}>
        {onBack && (
          <img src={onBackButton} alt="back" onClick={onBack} className="w-6 h-6" />
        )}
        <Flex gap={3} direction="column" align="flex-start">
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


          <div className="self-stretch justify-start text-accent text-2xl font-bold font-['Sora']">{title}</div>

          {/* <Heading size="xl" weight="bold" className="text-slate-600">
          {title}
          </Heading> */}
        </Flex>
      </Flex>
    </Box>
  );
};

export default PageHeader;