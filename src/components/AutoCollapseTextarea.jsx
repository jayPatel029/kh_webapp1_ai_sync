import React, { useState } from 'react';

const BASE_STYLE = {
  width: '100%',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  padding: '8px',
  fontSize: '13px',
  outline: 'none',
  resize: 'vertical',
  transition: 'height 160ms ease',
};

const AutoCollapseTextarea = ({ value, onChange, onFocus, onBlur, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <textarea
      {...props}
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      rows={isFocused ? 3 : 1}
      style={{
        ...BASE_STYLE,
        ...style,
        height: isFocused ? '78px' : '36px',
        overflowY: isFocused ? 'auto' : 'hidden',
      }}
    />
  );
};

export default AutoCollapseTextarea;
