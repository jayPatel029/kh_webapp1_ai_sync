/**
 * Parameter Section Component
 * Displays parameter readings with collapsible chart and data upload
 * 
 * @file src/components/ParameterSection.jsx
 */

import React, { useState } from 'react';
import { Card, CardBody } from './primitives/Card';
import { Text, Heading } from './primitives/Typography';
import { Button } from './primitives/Button';
import { Badge } from './primitives/Badge';
import { Flex, Box, Divider } from './layout/Layout';
import { Chart } from './primitives/Chart';
import { colors, spacing } from '../design-system/tokens';

export const ParameterSection = ({
  title,
  sectionTitle,
  parameters = [],
  chartImageUrl,
  onUploadData,
  onUpdateRange,
  onClearFilters,
  onEnterReading,
  readings = [],
  onDeleteReading,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <Box className="w-full space-y-8">
      <Card variant="elevated" className="w-full">
        <CardBody className="p-12">
          {/* Header */}
          <Flex
            justify="between"
            align="center"
            gap={4}
            className="mb-8"
          >
            <Heading
              size="lg"
              weight="bold"
              color="text.DEFAULT"
            >
              {title || 'Sleep'}
            </Heading>
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ padding: '8px 12px' }}
            >
              {isExpanded ? '▼' : '▶'}
            </Button>
          </Flex>

          {isExpanded && (
            <>
              {/* Control Bar */}
              <Flex
                justify="between"
                align="center"
                gap={4}
                className="mb-8"
              >
                <Flex gap={3} align="center">
                  {/* Legend badges */}
                  <Badge
                    variant="subtle"
                    colorScheme="info"
                    isPill
                    className="cursor-pointer"
                    onClick={() => toggleFilter('real')}
                    style={{
                      opacity: selectedFilters.includes('real') ? 1 : 0.5,
                    }}
                  >
                    ● Real
                  </Badge>
                  <Badge
                    variant="subtle"
                    colorScheme="warning"
                    isPill
                    className="cursor-pointer"
                    onClick={() => toggleFilter('orange')}
                    style={{
                      opacity: selectedFilters.includes('orange') ? 1 : 0.5,
                    }}
                  >
                    ● Orange
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFilters([]);
                      onClearFilters?.();
                    }}
                    style={{ color: colors.danger.DEFAULT }}
                  >
                    Cancel
                  </Button>
                </Flex>

                <Flex gap={3} align="center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUpdateRange}
                    style={{
                      color: colors.primary.DEFAULT,
                      textDecoration: 'underline',
                    }}
                  >
                    Update range
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEnterReading}
                  >
                    Enter reading
                  </Button>
                </Flex>
              </Flex>

              {/* Chart area */}
              {chartImageUrl && (
                <Box className="mb-8 rounded-lg overflow-hidden">
                  <Chart height={300} width="100%">
                    <img
                      src={chartImageUrl}
                      alt="Chart"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Chart>
                </Box>
              )}

              {/* Readings table */}
              <Box className="mt-8">
                <Divider className="mb-4" />

                {/* Table header */}
                <Flex
                  justify="between"
                  align="center"
                  className="mb-4 px-6 py-4 bg-gray-100 rounded"
                  style={{ background: '#eceef2' }}
                >
                  <Text weight="semibold" size="sm" color="text.muted">
                    Date
                  </Text>
                  <Text weight="semibold" size="sm" color="text.muted">
                    Reading
                  </Text>
                </Flex>

                {/* Table rows */}
                {readings && readings.length > 0 ? (
                  readings.map((reading, idx) => (
                    <Flex
                      key={idx}
                      justify="between"
                      align="center"
                      className="mb-2 px-6 py-3 bg-white rounded border border-gray-200"
                    >
                      <Text size="sm" color="text.muted">
                        {reading.date || '2025-05-20'}
                      </Text>
                      <Flex gap={2} align="center">
                        {reading.imageThumbnail && (
                          <Box
                            as="img"
                            src={reading.imageThumbnail}
                            alt="Reading"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteReading?.(reading.id)}
                          style={{ color: colors.danger.DEFAULT }}
                        >
                          ✕
                        </Button>
                      </Flex>
                    </Flex>
                  ))
                ) : (
                  <Text size="sm" color="text.muted" className="text-center py-4">
                    No readings available.
                  </Text>
                )}

                {/* Upload button */}
                <Button
                  variant="outline"
                  onClick={onUploadData}
                  className="mt-4"
                >
                  Upload data
                </Button>
              </Box>
            </>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default ParameterSection;
