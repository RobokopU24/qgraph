import _ from 'lodash';
import strings from './stringUtils';

/**
 * Given a biolink class build a list of parent classes
 * Ex: Given 'gene' as an input this function will return:
 *
 * [ "gene", "gene_or_gene_product", "macromolecular_machine",
 *   "genomic_entity", "molecular_entity", "biological_entity",
 *   "named_thing" ]
 */
function getHierarchy(biolink, className) {
  const standardizedClassDictionary = _.transform(biolink.classes,
    (result, value, key) => { result[key] = value; });

  let currentType = className;
  const hierarchy = [currentType];
  // Repeat until we hit the bottom of the hierarchy
  while (
    standardizedClassDictionary[currentType] &&
    standardizedClassDictionary[currentType].is_a
  ) {
    // reassign current type to parent type
    currentType = standardizedClassDictionary[currentType].is_a;
    hierarchy.push(currentType);
  }
  // console.log(hierarchy);
  return hierarchy;
}

const baseClass = 'biological entity';

/**
 * Filter out concepts that are not derived classes of base class
 * @param {object} biolink Biolink context
 * @returns {array} list of valid concepts
 */
function getValidConcepts(biolink) {
  const validClasses = Object.keys(biolink.classes).filter((type) => getHierarchy(biolink, type).includes(baseClass));
  return validClasses.map((type) => strings.fromBiolink(type));
}

export default {
  getHierarchy,
  getValidConcepts,
};
