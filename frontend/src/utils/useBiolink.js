import { useRef } from 'react';
import _ from 'lodash';
import strings from './stringUtils';

const baseClass = 'biological entity';

export default function useBiolink() {
  const biolink = useRef(null);
  const concepts = useRef([]);

  /**
   * Given a biolink class build a list of parent classes
   * Ex: Given 'gene' as an input this function will return:
   *
   * [ "gene", "gene_or_gene_product", "macromolecular_machine",
   *   "genomic_entity", "molecular_entity", "biological_entity",
   *   "named_thing" ]
   */
  function getHierarchy(className) {
    const standardizedClassDictionary = _.transform(biolink.current.classes,
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

  /**
   * Filter out concepts that are not derived classes of base class
   * @returns {array} list of valid concepts
   */
  function getValidConcepts() {
    // const allHierarchies = Object.keys(biolink.current.classes).map((type) => ({ [type]: getHierarchy(type) })).filter((hier) => hier.includes(baseClass));
    // console.log(allHierarchies);
    const validClasses = Object.keys(biolink.current.classes).filter((type) => getHierarchy(type).includes(baseClass));
    return validClasses.map((type) => strings.fromBiolink(type));
  }

  function getEdgeTypes() {
    return Object.defineProperties(biolink.current.slots).map(([identifier, predicate]) => ({
      label: strings.toSnakeCase(identifier),
      domain: strings.fromBiolink(predicate.domain),
      range: strings.fromBiolink(predicate.range),
    }));
  }

  /**
   * Store the biolink model and create list of valid node types
   * @param {object} biolinkObj object we get back from biolink model
   */
  function initialize(biolinkObj) {
    biolink.current = biolinkObj;
    concepts.current = getValidConcepts();
  }

  return {
    initialize,
    getHierarchy,
    getEdgeTypes,
    concepts: concepts.current,
  };
}
