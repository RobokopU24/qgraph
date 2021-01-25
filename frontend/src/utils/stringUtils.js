/**
 * Many Translator services now have differently formatted categories. These utilities
 * should help keep everything consistent internally.
<<<<<<< HEAD
 * Incoming biolink types are space case
 * All outgoing node types are 'biolink:PascalCase'
 * All outgoing edge types are 'biolink:snake_case'
 * User input types can be anything
=======
 * Incoming biolink categories are space case
 * All outgoing categories are 'biolink:PascalCase'
 * User input categories can be anything
>>>>>>> Did a smart find and replace for instances of type in the rest of the code base
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
 * @param {string} str string to convert to pascal case
 */
function toPascalCase(str) {
  const camelCaseStr = _.camelCase(str);
  const pascalCategory = `${camelCaseStr.charAt(0).toUpperCase()}${camelCaseStr.slice(1)}`;
  return pascalCategory;
}

function toArray(categories) {
  if (!Array.isArray(categories)) {
    return [categories];
  }
  return categories;
}

/**
 * Convert category from biolink into snake case
 * @param {string} category biolink category to ingest
 */
function nodeFromBiolink(category) {
  return category && `biolink:${toPascalCase(category)}`;
}

/**
 * Convert type from biolink into snake case
 * @param {string} type biolink type to ingest
 * @returns {string} 'biolink:snake_case'
 */
function edgeFromBiolink(type) {
  return type && `biolink:${toSnakeCase(type)}`;
}

/**
 * Convert label into prettier display
 * @param {string|array} arg string or array of wanted pretty display
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
    const out = pascalCategory.split(/(?=[A-Z][a-z])/g);
    return out.join(' ');
  } catch (err) {
    console.log('Error making display category:', err);
    return '';
  }
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
    console.log('Error making display predicate:', err);
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
  toArray,
  prettyDisplay,
  displayPredicate,
  displayCategory,
};
