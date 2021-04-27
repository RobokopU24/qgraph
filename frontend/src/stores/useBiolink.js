import { useState, useEffect } from 'react';
import _ from 'lodash';
import strings from '~/utils/strings';

const baseClass = 'biolink:BiologicalEntity';

export default function useBiolink() {
  const [biolink, setBiolink] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [descendancies, setDescendancies] = useState({});
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
  function getDescendants(childClass, classes) {
    let currentClass = childClass;
    const descendantList = [currentClass];
    // Repeat until we hit the top of the classes
    while (
      classes[currentClass] &&
      classes[currentClass].is_a
    ) {
      // reassign current type to parent type
      currentClass = classes[currentClass].is_a;
      descendantList.push(currentClass);
    }
    return descendantList;
  }

  /**
   * Get a list of descendants for all biolink classes
   * @param {object} biolinkClasses - object of all biolink classes
   * @returns {{}} Object with classes as keys and descendant lists as values
   */
  function getAllDescendancies(biolinkClasses) {
    const newHierarchies = Object.keys(biolinkClasses).reduce((obj, item) => {
      let hierarchy = getDescendants(item, biolinkClasses);
      hierarchy = hierarchy.map((h) => strings.nodeFromBiolink(h));
      obj[strings.nodeFromBiolink(item)] = hierarchy;
      return obj;
    }, {});
    return newHierarchies;
  }

  /**
   * Filter out concepts that are not derived classes of base class
   * @param {object} allDescendancies - object of all descendant lists
   * @returns {array} list of valid concepts
   */
  function getValidConcepts(allDescendancies) {
    const newConcepts = Object.keys(allDescendancies).filter((biolinkClass) => allDescendancies[biolinkClass].includes(baseClass));
    return newConcepts;
  }

  /**
   * Get all direct descendants of a target class, recursively
   * @param {object} classes - all biolink classes
   * @param {*} targetClass - class we want to find the descendants of
   * @returns {[]} list of descendants
   */
  function getDirectDescendantsRecursive(classes, targetClass) {
    let descendants = [];
    Object.keys(classes).forEach((key) => {
      if (classes[key].is_a === targetClass) {
        descendants.push(key);
        descendants = descendants.concat(getDirectDescendantsRecursive(classes, key));
      }
    });
    return descendants;
  }

  /**
   * Get all descendants by getting direct descendants recursively
   * @param {string} currentClass - biolink class to get all descendants of
   * @param {object} classes - object of all biolink classes
   * @returns {[]} list of all descendants
   */
  function getAllDescendants(currentClass, classes) {
    const descendants = [currentClass, ...getDirectDescendantsRecursive(classes, currentClass)];
    return descendants.map((h) => strings.nodeFromBiolink(h));
  }

  useEffect(() => {
    if (biolink) {
      const biolinkClasses = _.transform(biolink.classes,
        (result, value, key) => { result[key] = value; });
      const allDescendancies = getAllDescendancies(biolinkClasses);
      const allConcepts = getValidConcepts(allDescendancies);
      const allPredicates = getEdgePredicates();
      const namedThingDescendants = getAllDescendants('named thing', biolinkClasses);
      allDescendancies['biolink:NamedThing'] = namedThingDescendants;
      setDescendancies(allDescendancies);
      setConcepts(allConcepts);
      setPredicates(allPredicates);
    }
  }, [biolink]);

  return {
    setBiolink,
    getEdgePredicates,
    concepts,
    descendancies,
    predicates,
  };
}
