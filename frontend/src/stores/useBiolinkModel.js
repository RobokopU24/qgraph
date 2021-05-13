import { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import strings from '~/utils/strings';
import getNodeCategoryColorMap from '~/utils/colors';

const baseClass = 'biolink:BiologicalEntity';

export default function useBiolinkModel() {
  const [biolinkModel, setBiolinkModel] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [hierarchies, setHierarchies] = useState({});
  const [predicates, setPredicates] = useState([]);
  const colorMap = useCallback(getNodeCategoryColorMap(concepts), [concepts]);

  /**
   * Get a list of all predicates in the biolink model
   * @returns {object[]} list of predicate objects
   */
  function getEdgePredicates() {
    const newPredicates = Object.entries(biolinkModel.slots).map(([identifier, predicate]) => ({
      predicate: strings.edgeFromBiolink(identifier),
      domain: strings.nodeFromBiolink(predicate.domain),
      range: strings.nodeFromBiolink(predicate.range),
    }));
    return newPredicates;
  }

  /**
   * Given a biolink class, build a list of parent classes
   * Ex: Given 'gene' as an input this function will return:
   *
   * [ "gene", "gene_or_gene_product", "macromolecular_machine",
   *   "genomic_entity", "molecular_entity", "biological_entity",
   *   "named_thing" ]
   *
   * @param {string} className - a biolink class
   * @param {object} biolinkClasses - object of all biolink classes
   * @returns {string[]} list of related biolink classes
   */
  function getAncestors(childClass, classes) {
    let currentClass = childClass;
    const ancestors = [];
    // Repeat until we hit the top of the classes
    while (
      classes[currentClass] &&
      classes[currentClass].is_a
    ) {
      // reassign current type to parent type
      currentClass = classes[currentClass].is_a;
      ancestors.push(currentClass);
    }
    return ancestors;
  }

  /**
   * Get all descendants by getting direct descendants recursively
   * @param {string} parentClass - biolink class to get direct descendants of
   * @param {object} classes - object of all biolink classes
   * @returns {string[]} list of all descendants
   */
  function getDirectDescendants(parentClass, classes) {
    let descendants = [];
    Object.keys(classes).forEach((key) => {
      if (classes[key].is_a === parentClass) {
        descendants.push(key);
        // Repeat until we hit the bottom of the classes
        descendants = descendants.concat(getDirectDescendants(key, classes));
      }
    });
    return descendants;
  }

  /**
   * Get a list of hierarchies for all biolink classes
   * @param {object} biolinkClasses - object of all biolink classes
   * @returns {object} Object with classes as keys and descendant lists as values
   */
  function getAllHierarchies(biolinkClasses) {
    const newHierarchies = Object.keys(biolinkClasses).reduce((obj, item) => {
      let ancestors = getAncestors(item, biolinkClasses);
      ancestors = ancestors.map((h) => strings.nodeFromBiolink(h));
      let descendants = getDirectDescendants(item, biolinkClasses);
      descendants = descendants.map((h) => strings.nodeFromBiolink(h));
      obj[strings.nodeFromBiolink(item)] = [...descendants, strings.nodeFromBiolink(item), ...ancestors];
      return obj;
    }, {});
    return newHierarchies;
  }

  /**
   * Filter out concepts that are not derived classes of base class
   * @param {object} allHierarchies - object of all hierarchy lists
   * @returns {array} list of valid concepts
   */
  function getValidConcepts(allHierarchies) {
    const newConcepts = Object.keys(allHierarchies).filter((biolinkClass) => allHierarchies[biolinkClass].includes(baseClass));
    return newConcepts;
  }

  useEffect(() => {
    if (biolinkModel) {
      const biolinkClasses = _.transform(biolinkModel.classes,
        (result, value, key) => { result[key] = value; });
      const allHierarchies = getAllHierarchies(biolinkClasses);
      const allConcepts = getValidConcepts(allHierarchies);
      const allPredicates = getEdgePredicates();
      setHierarchies(allHierarchies);
      setConcepts(allConcepts);
      setPredicates(allPredicates);
    }
  }, [biolinkModel]);

  return {
    setBiolinkModel,
    concepts,
    hierarchies,
    predicates,
    colorMap,
  };
}
