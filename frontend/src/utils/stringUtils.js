/**
 * Many Translator services now have differently formatted types. These utilities
 * should help keep everything consistent internally.
 * Incoming biolink types are space case
 * All outgoing types are 'biolink:PascalCase'
 * User input types can be anything
 */
import _ from 'lodash';

function toSpaceCase(str) {
  return _.startCase(str);
}

function toCamelCase(str) {
  return _.camelCase(str);
}

/**
 * Convert to pascal case with biolink curie format
 * @param {string} str string to convert to pascal case
 */
function toPascalCase(str) {
  const camelCaseStr = _.camelCase(str);
  const pascalType = `${camelCaseStr.charAt(0).toUpperCase()}${camelCaseStr.slice(1)}`;
  return pascalType;
}

function toArray(types) {
  if (!Array.isArray(types)) {
    return [types];
  }
  return types;
}

/**
 * Convert type from biolink into snake case
 * @param {string} type biolink type to ingest
 */
function fromBiolink(type) {
  return `biolink:${toPascalCase(type)}`;
}

/**
 * Convert label into prettier display
 * @param {string|array} arg string or array of wanted pretty display
 * will only grab the first item in array
 */
function displayType(arg) {
  if (!arg) {
    return '';
  }
  let label = arg;
  if (Array.isArray(label)) {
    [label] = label;
  }
  try {
    // remove 'biolink:'
    const [, pascalType] = label.split(':');
    // split pascal case
    const out = pascalType.split(/(?=[A-Z][a-z])/g);
    return out.join(' ');
  } catch (err) {
    console.log('Error making display type:', err);
    return '';
  }
}

/**
 * Convert label into prettier display
 * @param {string|array} arg string or array of wanted pretty display
 * will only grab the first item in array
 */
function prettyDisplay(arg) {
  if (!arg) {
    return '';
  }
  let label = arg;
  if (Array.isArray(label)) {
    [label] = label;
  }
  const out = label.replace(/_/g, ' ');
  return out.replace(/(?!or\b)\b\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function displayPredicate(arg) {
  if (!arg) {
    return '';
  }
}

export default {
  fromBiolink,
  toSpaceCase,
  toCamelCase,
  toPascalCase,
  toArray,
  prettyDisplay,
  displayType,
};
