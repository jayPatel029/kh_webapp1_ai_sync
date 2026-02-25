/**
 * Parameter Section Component
 * Displays parameter readings with collapsible chart and data upload
 * 
 * @file src/components/ParameterSection.jsx
 */

import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Card,
  CardBody,
  Text,
  Heading,
  Button,
  Badge,
  Box,
  Flex,
} from '../component-library';
import '../design-system/styles/index.css';
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
    <Box className="w-full !shadow-[2px_2px_8px_0px_rgba(0,0,0,0.35)] !shadow-[-2px_-2px_8px_0px_rgba(0,0,0,0.10)] rounded-2xl bg-white">
      <Card
        variant="elevated"
        className="w-full card-elevated cursor-pointer select-none"
        
        // className="cursor-pointer select-none"
      >
        <CardBody>
          {/* Header */}
          <Flex justify="between" align="center" gap={4}
          
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Heading as="h5" size="md" weight="semibold" className="text-dark">
              {title}
            </Heading>
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-8 w-8 min-w-0"
            >
              <Box className={clsx("transition-transform duration-200", isExpanded ? 'rotate-90' : '')}>
                <img src={upIcon} alt='up' />
              </Box>
            </Button>
          </Flex>

          {isExpanded && (
            <Box className="space-y-6 mt-4">
              {/* Control Bar (Only if it has actions) */}
              {(onClearFilters || onUpdateRange || onEnterReading) && (
                <Flex justify="between" align="center" gap={4} className="flex-wrap">
                  <Flex gap={4} align="center">
                    <Box
                      className="p-1 rounded-full flex items-center justify-center text-sm bg-surface"
                      style={{ width: '28px', height: '28px' }}
                    >
                      📅
                    </Box>
                    <Flex gap={3} align="center">
                      <Flex align="center" gap={1.5}>
                        <Box
                          className="rounded-full bg-error"
                          style={{ width: '10px', height: '10px' }}
                        />
                        <Text size="xs" weight="semibold" className="text-muted">
                          Red
                        </Text>
                      </Flex>
                      <Flex align="center" gap={1.5}>
                        <Box
                          className="rounded-full bg-warning"
                          style={{ width: '10px', height: '10px' }}
                        />
                        <Text size="xs" weight="semibold" className="text-muted">
                          Orange
                        </Text>
                      </Flex>
                    </Flex>
                    {onClearFilters && (
                      <Button
                        variant="ghost"
                        onClick={onClearFilters}
                        className="text-error text-xs font-semibold hover:underline p-0"
                      >
                        Clear filters
                      </Button>
                    )}
                  </Flex>

                  <Flex gap={4} align="center">
                    {onUpdateRange && (
                      <Button
                        variant="ghost"
                        onClick={onUpdateRange}
                        className="text-primary text-xs font-semibold hover:underline p-0"
                      >
                        Update range
                      </Button>
                    )}
                    {onEnterReading && (
                      <Button
                        variant="outline"
                        className="!rounded-xs"
                        onClick={onEnterReading}
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
                              className="h-8 px-4 text-xs rounded-md btn-outline-primary"
                        >
                          Upload data
                        </Button>
                      </Flex>
                    )}

                    {/* Table styling matched to Figma but more compact */}
                        <Box className="w-full overflow-hidden rounded-md border border-border">
                      <Flex
                        justify="between"
                        align="center"
                            className="px-8 py-3 bg-surface"
                      >
                            <Text size="xs" weight="bold" className="text-muted uppercase">
                          Date
                        </Text>
                            <Text size="xs" weight="bold" className="text-muted uppercase">
                          Reading
                        </Text>
                      </Flex>

                      {readings.length > 0 ? (
                        readings.map((reading, idx) => (
                          <Flex
                            key={idx}
                            justify="between"
                            align="center"
                            className="bg-white px-8 py-3 border-t border-border"
                          >
                            <Text size="sm" className="text-muted-foreground">{reading.date}</Text>
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
                                className="text-error hover:text-error-dark p-1"
                              >
                                ✕
                              </Button>
                            </Flex>
                          </Flex>
                        ))
                      ) : (
                        <Box className="px-12 py-8 text-center bg-white">
                                <Text className="text-muted">
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
