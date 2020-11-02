import _ from 'lodash';

/*
 * Convert string to snake case by lowercase-ing and replacing
 * spaces with underscores.
*/
const snakeCase = (str) => str && str.replaceAll(' ', '_').toLowerCase();

/*
 * Given a biolink class build a list of parent classes
 * Ex: Given 'gene' as an input this function will return:
 *
 * [ "gene", "gene_or_gene_product", "macromolecular_machine",
 *   "genomic_entity", "molecular_entity", "biological_entity",
 *   "named_thing" ]
*/
function getHierarchy(biolink, className) {
  const standardizedClassDictionary = _.transform(biolink.classes,
    (result, value, key) => { result[snakeCase(key)] = value; });

  const hierarchy = [snakeCase(className)];
  // Repeat until we hit the bottom of the hierarchy
  while (standardizedClassDictionary[hierarchy[hierarchy.length - 1]] &&
    standardizedClassDictionary[hierarchy[hierarchy.length - 1]].is_a) {
    hierarchy.push(
      snakeCase(
        standardizedClassDictionary[hierarchy[hierarchy.length - 1]].is_a,
      ),
    );
  }
  return hierarchy;
}

const baseClass = 'biological_entity';

/*
 * Filter out concepts that are not derived classes of biological_entity
*/
function getValidConcepts(biolink) {
  return _.pickBy(biolink.classes,
    (value, identifier) => getHierarchy(biolink, identifier).includes(baseClass));
}

export default {
  snakeCase,
  getHierarchy,
  getValidConcepts,
};
