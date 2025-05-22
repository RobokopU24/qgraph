import React from 'react';

export default function ShowPropertyValue({
  propertyValue,
}) {
  if (
    typeof propertyValue === 'boolean'
  ) {
    if (propertyValue) {
      return <span>Yes</span>;
    }
    return <span>No</span>;
  } else if (
    Array.isArray(propertyValue)
  ) {
    return (
      <span>
        {propertyValue.map((m) => (
          <div key={m}>{m}</div>
        ))}
      </span>
    );
  } else {
    return <span>{propertyValue}</span>;
  }
}
