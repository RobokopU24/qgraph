/**
 * Convert a type of visibility to what Robokache is expecting
 * @param {('Invisible'|'Private'|'Shareable'|'Public')} value
 */
export function useVisibility() {
  const visibilityMapping = {
    0: 'Invisible',
    1: 'Private',
    2: 'Shareable',
    3: 'Public',
  };

  function toString(key) {
    return visibilityMapping[key];
  }

  function toInt(val) {
    return parseInt(Object.keys(visibilityMapping).find((key) => visibilityMapping[key] === val), 10);
  }

  return {
    toString,
    toInt,
  };
}

export function formatDateTimeNicely(dateString) {
  const jsDate = new Date(dateString);
  const options = {
    dateStyle: 'long',
    timeStyle: 'long',
    hour12: true,
  };
  return Intl.DateTimeFormat('en-US', options).format(jsDate);
}
