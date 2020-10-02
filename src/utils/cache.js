export const visibilityMapping = {
  0: 'Invisible',
  1: 'Private',
  2: 'Shareable',
  3: 'Public',
};

export function formatDateTimeNicely(dateString) {
  const jsDate = new Date(dateString);
  const options = {
    dateStyle: 'long',
    timeStyle: 'long',
    hour12: true,
  };
  return Intl.DateTimeFormat('en-US', options).format(jsDate);
}
