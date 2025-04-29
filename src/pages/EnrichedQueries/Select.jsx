import React from 'react';

export default function Select({
  options,
  onChange,
  value,
  label,
  notSelectedOption,
}) {
  return (
    <div style={{ flex: '1' }}>
      <span
        style={{
          fontSize: '14px',
          color: '#626262',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          paddingLeft: '8px',
        }}
      >
        {label}
      </span>
      <select
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '16px',
          border: '1px solid #9F9F9F',
          borderRadius: '4px',
        }}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === notSelectedOption ? undefined : v);
        }}
      >
        {(notSelectedOption ? [notSelectedOption, ...options] : options).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
