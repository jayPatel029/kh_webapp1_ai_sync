/**
 * Page Header Component
 * Breadcrumb and page title — supports desktop and mobile variants
 * 
 * @file src/components/PageHeader.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Text, Heading, Box, Flex, IconButton, Button } from '../component-library';
import * as assets from '../assets';
import '../design-system/styles/index.css';
import onBackButton from '../assets/onBackButton.svg';
import { useIsMobile } from './mobile/useIsMobile';
import { Padding } from '@mui/icons-material';

export const PageHeader = ({
  breadcrumbs = [],
  title = 'Patient Name',
  onBack,
  variant = "onlyheader", // 'mobile' | undefined (auto-detects)
  rightAction, // optional right-side element for mobile header
}) => {
  
  const { isMobile: autoMobile } = useIsMobile();
  const isMobile = autoMobile;

  // Render the "only header" variant by default when no variant is provided
  const renderOnlyHeaderDefault =  variant === 'onlyheader';

  if (renderOnlyHeaderDefault) {
    return (
      <Box
        className={`border-b-2 -mt-8  border-info ${isMobile ? 'pb-2' : 'pb-4'}`}
        style={{
          // borderColor: 'var(--color-info)',
          height: isMobile ? 'auto' : '100px',
          paddingBottom: isMobile ? '0.5rem' : '2rem',
          position: 'relative'
        }}
      >
        <Heading
          as="h1"
          size={isMobile ? 'none' : '2xl'}
          style={{
            ...(isMobile ? {} : {
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
            }),
            color: 'var(--color-heading)',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 'bold',
            marginBottom: '35px',
          }}
        >
         {title}
        </Heading>
      </Box>
    );
  }

  // Normalize breadcrumbs: accept array of strings or objects { label, path, active, icon }
  const crumbs = Array.isArray(breadcrumbs)
    ? breadcrumbs.map((b) => (typeof b === 'string' ? { label: b } : b))
    : [{ label: String(breadcrumbs) }];

  // Mobile compact header
  if (isMobile) {
    return (
      <Box className="w-full px-0 ">
        <Flex align="center" justify="between" className="min-h-[44px]">
          <Flex align="center" gap={2}>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent cursor-pointer"
                aria-label="Go back"
                style={{ transition: 'var(--transition-fast)' }}
              >
                <img src={onBackButton} alt="back" className="w-5 h-5" />
              </button>
            )}
            <div
              className="text-accent font-bold font-['Sora'] truncate"
              style={{ fontSize: 'var(--font-size-lg)' }}
            >
              {title}
            </div>
          </Flex>
          {rightAction && (
            <Flex align="center" gap={2}>
              {rightAction}
            </Flex>
          )}
        </Flex>
        {/* Compact breadcrumbs on mobile - single line */}
        {crumbs.length > 1 && (
          <Text size="xs" weight="normal" className="text-muted mt-1 truncate">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">/</span>}
                {c.path && !c.active ? (
                  <Link to={c.path} className="text-muted hover:text-primary" style={{ textDecoration: 'none' }}>
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </Text>
        )}
      </Box>
    );
  }

  // Desktop header (original)
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
        </Flex>
      </Flex>
    </Box>
  );
};

export default PageHeader;