import { useRef } from 'react';
import _ from 'lodash';
import strings from './stringUtils';

const baseClass = 'biological entity';

export default function useBiolink() {
  const biolink = useRef(null);
  const concepts = useRef([]);
  const hierarchies = useRef({});

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

  function makeHierarchies() {
    return Object.keys(biolink.current.classes).reduce((obj, item) => {
      let hierarchy = getHierarchy(item);
      if (hierarchy.includes(baseClass)) {
        hierarchy = hierarchy.map((h) => strings.nodeFromBiolink(h));
        obj[strings.nodeFromBiolink(item)] = hierarchy;
      }
      return obj;
    }, {});
  }

  /**
   * Filter out concepts that are not derived classes of base class
   * @returns {array} list of valid concepts
   */
  function getValidConcepts() {
    // const allHierarchies = Object.keys(biolink.current.classes).map((type) => ({ [type]: getHierarchy(type) })).filter((hier) => hier.includes(baseClass));
    // console.log(allHierarchies);
    const validClasses = Object.keys(biolink.current.classes).filter((type) => getHierarchy(type).includes(baseClass));
    return validClasses.map((type) => strings.nodeFromBiolink(type));
  }

  function getEdgeTypes() {
    return Object.entries(biolink.current.slots).map(([identifier, predicate]) => ({
      type: strings.edgeFromBiolink(identifier),
      label: strings.toSpaceCase(identifier),
      domain: strings.nodeFromBiolink(predicate.domain),
      range: strings.nodeFromBiolink(predicate.range),
    }));
  }

  /**
   * Store the biolink model and create list of valid node types
   * @param {object} biolinkObj object we get back from biolink model
   */
  function initialize(biolinkObj) {
    biolink.current = biolinkObj;
    concepts.current = getValidConcepts();
    hierarchies.current = makeHierarchies();
  }

  return {
    initialize,
    getHierarchy,
    getEdgeTypes,
    concepts: concepts.current,
    hierarchies: hierarchies.current,
  };
}
