import { useState, useEffect } from 'react';
import _ from 'lodash';
import strings from './stringUtils';

const baseClass = 'biolink:BiologicalEntity';

export default function useBiolink() {
  const [biolink, setBiolink] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [hierarchies, setHierarchies] = useState({});

  /**
   * Given a biolink class build a list of parent classes
   * Ex: Given 'gene' as an input this function will return:
   *
   * [ "gene", "gene_or_gene_product", "macromolecular_machine",
   *   "genomic_entity", "molecular_entity", "biological_entity",
   *   "named_thing" ]
   */
  function getHierarchy(className) {
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

  function makeHierarchies() {
    const newHierarchies = Object.keys(biolink.classes).reduce((obj, item) => {
      let hierarchy = getHierarchy(item);
      hierarchy = hierarchy.map((h) => strings.nodeFromBiolink(h));
      obj[strings.nodeFromBiolink(item)] = hierarchy;
      return obj;
    }, {});
    setHierarchies(newHierarchies);
  }

  /**
   * Filter out concepts that are not derived classes of base class
   * @returns {array} list of valid concepts
   */
  function getValidConcepts() {
    const newConcepts = Object.keys(hierarchies).filter((key) => hierarchies[key].includes(baseClass));
    setConcepts(newConcepts);
  }

  function getEdgePredicates() {
    return Object.entries(biolink.slots).map(([identifier, predicate]) => ({
      type: strings.edgeFromBiolink(identifier),
      domain: strings.nodeFromBiolink(predicate.domain),
      range: strings.nodeFromBiolink(predicate.range),
    }));
  }

  /**
   * Store the biolink model and create list of valid node types
   * @param {object} biolinkObj object we get back from biolink model
   */
  function initialize(biolinkObj) {
    setBiolink(biolinkObj);
  }

  useEffect(() => {
    if (biolink) {
      makeHierarchies();
    }
  }, [biolink]);

  useEffect(() => {
    if (Object.keys(hierarchies).length) {
      getValidConcepts();
    }
  }, [hierarchies]);

  return {
    initialize,
    getHierarchy,
    getEdgePredicates,
    concepts,
    hierarchies,
  };
}
