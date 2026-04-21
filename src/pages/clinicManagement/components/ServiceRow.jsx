import React from 'react';
import { Box, FormControl, FormLabel, Input, Button } from '../../../component-library';

export function ServiceRow({ service, onChange, onRemove }) {
  function changeField(name, value) {
    onChange({ ...service, [name]: value });
  }

  return (
    <Box className="p-4 border border-gray-200 rounded-md mb-4 bg-gray-50 flex flex-wrap gap-4 items-end">
      <FormControl className="flex-1 min-w-[200px]">
        <FormLabel>Service Name</FormLabel>
        <Input
          type="text"
          value={service.name}
          onChange={(e) => changeField('name', e.target.value)}
          placeholder="e.g. Dialysis Session"
        />
      </FormControl>
      
      <FormControl className="w-32">
        <FormLabel>Amount</FormLabel>
        <Input
          type="number"
          value={service.amount}
          onChange={(e) => changeField('amount', Number(e.target.value))}
          min={0}
        />
      </FormControl>

      <FormControl className="w-32">
        <FormLabel>Discount</FormLabel>
        <Input
          type="number"
          value={service.discount}
          onChange={(e) => changeField('discount', Number(e.target.value))}
          min={0}
          max={100}
        />
      </FormControl>

      <Button variant="danger" onClick={() => onRemove(service.id)}>
        Remove
      </Button>
    </Box>
  );
}
