import { useState, useEffect } from 'react';
import _ from 'lodash';
import strings from '~/utils/strings';

const baseClass = 'biolink:BiologicalEntity';

export default function useBiolinkModel() {
  const [biolinkModel, setBiolinkModel] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [hierarchies, setHierarchies] = useState({});
  const [predicates, setPredicates] = useState([]);

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
    const ancestors = [currentClass];
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
   * Get a list of ancestors for all biolink classes
   * @param {object} biolinkClasses - object of all biolink classes
   * @returns {{}} Object with classes as keys and descendant lists as values
   */
  function getAllAncestries(biolinkClasses) {
    const newHierarchies = Object.keys(biolinkClasses).reduce((obj, item) => {
      let ascendants = getAncestors(item, biolinkClasses);
      ascendants = ascendants.map((h) => strings.nodeFromBiolink(h));
      obj[strings.nodeFromBiolink(item)] = ascendants;
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
   * Get all descendants of a given class
   * @param {object} classes - all biolink classes
   * @param {*} targetClass - class we want to find the descendants of
   * @returns {[]} list of descendants
   */
  function getDescendants(classes, targetClass) {
    let descendants = [targetClass];
    Object.keys(classes).forEach((key) => {
      if (classes[key].is_a === targetClass) {
        descendants = descendants.concat(getDescendants(classes, key));
      }
    });
    return descendants;
  }

  useEffect(() => {
    if (biolinkModel) {
      const biolinkClasses = _.transform(biolinkModel.classes,
        (result, value, key) => { result[key] = value; });
      const allHierarchies = getAllAncestries(biolinkClasses);
      const allConcepts = getValidConcepts(allHierarchies);
      const allPredicates = getEdgePredicates();
      const namedThingDescendants = getDescendants(biolinkClasses, 'named thing');
      allHierarchies['biolink:NamedThing'] = namedThingDescendants.map(
        (descendant) => strings.nodeFromBiolink(descendant),
      );
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
  };
}
