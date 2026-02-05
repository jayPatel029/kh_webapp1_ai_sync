/**
 * Parameter Section Component
 * Displays parameter readings with collapsible chart and data upload
 * 
 * @file src/components/ParameterSection.jsx
 */

import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '../component-library/primitives/Card';
import clsx from 'clsx';
import { Text, Heading } from '../component-library/primitives/Typography';
import { Button } from '../component-library/primitives/Button';
import { Badge } from '../component-library/primitives/Badge';
import { Flex, Box, Divider } from '../component-library/layout/Layout';
import { Chart } from '../component-library/primitives/Chart';
import { colors, spacing } from '../design-system/tokens';
import upIcon from '../assets/up.png';

export const ParameterSection = ({
  title,
  isGraph = true,
  chartImageUrl,
  onUploadData,
  onUpdateRange,
  onClearFilters,
  onEnterReading,
  readings = [],
  onDeleteReading,
  noResponse = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box className="w-full">
      <Card
        variant="elevated"
        className="w-full"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <CardBody >
          {/* Header */}
          <Flex justify="between" align="center" gap={4} >
            <Heading as="h5" size="md" weight="semibold"  style={{ color: '#333' }}>
              {title}
            </Heading>
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-8 w-8 min-w-0"
            >
              <Box className={clsx("transition-transform duration-200", isExpanded ? 'rotate-90' : '')}>
                <img src={upIcon} alt='up'/>
              </Box>
            </Button>
          </Flex>

          {isExpanded && (
            <Box className="space-y-6">
              {/* Control Bar (Only if it has actions) */}
              {(onClearFilters || onUpdateRange || onEnterReading) && (
                <Flex justify="between" align="center" gap={4} className="flex-wrap">
                  <Flex gap={4} align="center">
                    <Box
                      className="p-1 rounded-full flex items-center justify-center text-sm"
                      style={{ background: '#f1f5f9', width: '28px', height: '28px' }}
                    >
                      📅
                    </Box>
                    <Flex gap={3} align="center">
                      <Flex align="center" gap={1.5}>
                        <Box
                          className="rounded-full"
                          style={{ width: '10px', height: '10px', background: '#ef4444' }}
                        />
                        <Text size="xs" weight="semibold" className="text-slate-500">
                          Red
                        </Text>
                      </Flex>
                      <Flex align="center" gap={1.5}>
                        <Box
                          className="rounded-full"
                          style={{ width: '10px', height: '10px', background: '#f59e0b' }}
                        />
                        <Text size="xs" weight="semibold" className="text-slate-500">
                          Orange
                        </Text>
                      </Flex>
                    </Flex>
                    {onClearFilters && (
                      <button
                        onClick={onClearFilters}
                        className="text-red-500 text-xs font-semibold hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </Flex>

                  <Flex gap={4} align="center">
                    {onUpdateRange && (
                      <button
                        onClick={onUpdateRange}
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        Update range
                      </button>
                    )}
                    {onEnterReading && (
                      <Button
                        variant="outline"
                        onClick={onEnterReading}
                        className="h-8 px-4 text-xs rounded-md"
                        style={{ borderColor: '#4164df', color: '#4164df' }}
                      >
                        Enter reading
                      </Button>
                    )}
                  </Flex>
                </Flex>
              )}

              {/* Content area: Graph, Table, or Children */}
              <Box className="w-full">
                {children ? (
                  children
                ) : isGraph && chartImageUrl ? (
                  <Box className="bg-white rounded-lg overflow-hidden flex justify-center">
                    <img
                      src={chartImageUrl}
                      alt="Chart"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Box>
                ) : (
                  <Box className="space-y-4">
                    {onUploadData && (
                      <Flex justify="end">
                        <Button
                          variant="outline"
                          onClick={onUploadData}
                          className="h-8 px-4 text-xs rounded-md"
                          style={{ borderColor: '#4164df', color: '#4164df' }}
                        >
                          Upload data
                        </Button>
                      </Flex>
                    )}

                    {/* Table styling matched to Figma but more compact */}
                    <Box className="w-full overflow-hidden rounded-md border border-slate-100">
                      <Flex
                        justify="between"
                        align="center"
                        className="px-8 py-3 bg-slate-50"
                      >
                        <Text size="xs" weight="bold" className="text-slate-500 uppercase">
                          Date
                        </Text>
                        <Text size="xs" weight="bold" className="text-slate-500 uppercase">
                          Reading
                        </Text>
                      </Flex>

                      {readings.length > 0 ? (
                        readings.map((reading, idx) => (
                          <Flex
                            key={idx}
                            justify="between"
                            align="center"
                            className="bg-white px-8 py-3 border-t border-slate-50"
                          >
                            <Text size="sm" className="text-slate-600">{reading.date}</Text>
                            <Flex align="center" gap={3}>
                              {reading.image && (
                                <Box
                                  as="img"
                                  src={reading.image}
                                  alt="reading"
                                  className="h-12 w-auto rounded object-contain"
                                />
                              )}
                              <Button
                                variant="ghost"
                                onClick={() => onDeleteReading?.(reading.id)}
                                className="text-red-400 hover:text-red-600 p-1"
                              >
                                ✕
                              </Button>
                            </Flex>
                          </Flex>
                        ))
                      ) : (
                        <Box className="px-12 py-8 text-center bg-white">
                          <Text style={{ color: '#989898' }}>
                            {noResponse ? 'No response' : 'No readings available.'}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default ParameterSection;
