/**
 * Many Translator services now have differently formatted categories. These utilities
 * should help keep everything consistent internally.
 * Incoming biolink types are space case
 * All outgoing node types are 'biolink:PascalCase'
 * All outgoing edge types are 'biolink:snake_case'
 * User input types can be anything
 */
import _ from 'lodash';

function toSpaceCase(str) {
  return _.startCase(str);
}

function toCamelCase(str) {
  return _.camelCase(str);
}

function toSnakeCase(str) {
  return _.snakeCase(str);
}

/**
 * Convert to pascal case with biolink curie format
 * @param {string} str - string to convert to pascal case
 */
function toPascalCase(str) {
  const camelCaseStr = _.camelCase(str);
  const pascalCase = `${camelCaseStr.charAt(0).toUpperCase()}${camelCaseStr.slice(1)}`;
  return pascalCase;
}

/**
 * Convert category from biolink into snake case
 * @param {string} category - biolink category to ingest
 */
function nodeFromBiolink(category) {
  return category && `biolink:${toPascalCase(category)}`;
}

/**
 * Convert type from biolink into snake case
 * @param {string} type - biolink type to ingest
 * @returns {string} 'biolink:snake_case'
 */
function edgeFromBiolink(type) {
  return type && `biolink:${toSnakeCase(type)}`;
}

/**
 * Convert label into prettier display
 * @param {string|array} arg - string or array of wanted pretty display
 * will only grab the first item in array
 */
function displayCategory(arg) {
  if (!arg) {
    return '';
  }
  let label = arg;
  if (Array.isArray(label)) {
    [label] = label;
  }
  try {
    // remove 'biolink:'
    const [, pascalCategory] = label.split(':');
    // split pascal case
    const splitCategory = pascalCategory.split(/(?=[A-Z][a-z])/g);
    return splitCategory.join(' ');
  } catch (err) {
    return '';
  }
}

/**
 * Readable version of 'Set of {category}'
 * @param {string} category - node category
 * @returns Set of {category}
 */
function setify(category) {
  let pluralCategory = displayCategory(category);
  if (pluralCategory.endsWith('ay')) {
    // Pathway
    pluralCategory = `${pluralCategory}s`;
  } else if (pluralCategory.endsWith('y')) {
    pluralCategory = `${pluralCategory.slice(0, pluralCategory.length - 1)}ies`;
  } else if (pluralCategory.endsWith('ms')) {
    // Population Of Individual Organisms
    pluralCategory = `${pluralCategory}`;
  } else if (pluralCategory.endsWith('s')) {
    pluralCategory = `${pluralCategory}es`;
  } else {
    pluralCategory = `${pluralCategory}s`;
  }
  return `Set of ${pluralCategory}`;
}

function displayPredicate(arg) {
  if (!arg) {
    return '';
  }
  let label = arg;
  if (Array.isArray(label)) {
    [label] = label;
  }
  try {
    // remove 'biolink:'
    const [, snake_type] = label.split(':');
    // split snake case
    const out = snake_type.split(/_/g);
    return out.join(' ');
  } catch (err) {
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

export default {
  nodeFromBiolink,
  edgeFromBiolink,
  toSpaceCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  prettyDisplay,
  displayPredicate,
  displayCategory,
  setify,
};
