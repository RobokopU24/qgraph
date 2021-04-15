import { useState, useEffect } from 'react';
import _ from 'lodash';
import strings from '~/utils/strings';

const baseClass = 'biolink:BiologicalEntity';

export default function useBiolink() {
  const [biolink, setBiolink] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [hierarchies, setHierarchies] = useState({});
  const [predicates, setPredicates] = useState([]);

  function getEdgePredicates() {
    const newPredicates = Object.entries(biolink.slots).map(([identifier, predicate]) => ({
      predicate: strings.edgeFromBiolink(identifier),
      domain: strings.nodeFromBiolink(predicate.domain),
      range: strings.nodeFromBiolink(predicate.range),
    }));
    return newPredicates;
  }

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
    // Repeat until we hit the top of the hierarchy
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
    return newHierarchies;
  }

  /**
   * Filter out concepts that are not derived classes of base class
   * @returns {array} list of valid concepts
   */
  function getValidConcepts(allHierarchies) {
    const newConcepts = Object.keys(allHierarchies).filter((key) => allHierarchies[key].includes(baseClass));
    return newConcepts;
  }

  function dig(obj, keys, target) {
    let types = [];
    keys.forEach((key) => {
      if (obj[key].is_a === target) {
        types.push(key);
        types = types.concat(dig(obj, keys, key));
      }
    });
    return types;
  }

  function getDepthHierarchy(className) {
    const standardizedClassDictionary = _.transform(biolink.classes,
      (result, value, key) => { result[key] = value; });

    // Repeat until we hit the bottom of the hierarchy
    // depth-first search
    const keys = Object.keys(standardizedClassDictionary);
    const hierarchy = [className, ...dig(standardizedClassDictionary, keys, className)];
    return hierarchy.map((h) => strings.nodeFromBiolink(h));
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
      const allHierarchies = makeHierarchies();
      const allConcepts = getValidConcepts(allHierarchies);
      const newPredicates = getEdgePredicates();
      const namedThingHierarchy = getDepthHierarchy('named thing');
      allHierarchies['biolink:NamedThing'] = namedThingHierarchy;
      setHierarchies(allHierarchies);
      setConcepts(allConcepts);
      setPredicates(newPredicates);
    }
  }, [biolink]);

  return {
    initialize,
    getHierarchy,
    getEdgePredicates,
    concepts,
    hierarchies,
    predicates,
  };
}
