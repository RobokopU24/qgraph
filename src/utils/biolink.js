import _ from 'lodash';

const standardizeCase = (str) => str && str.replaceAll(' ', '_').toLowerCase();

function getHierarchy(biolink, className) {
  const standardizedClassDictionary = _.transform(biolink.classes,
    (result, value, key) => { result[standardizeCase(key)] = value; });

  const hierarchy = [standardizeCase(className)];
  // Repeat until we hit the bottom of the hierarchy
  while (standardizedClassDictionary[hierarchy[hierarchy.length - 1]] &&
    standardizedClassDictionary[hierarchy[hierarchy.length - 1]].is_a) {
    hierarchy.push(
      standardizeCase(
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
  standardizeCase,
  getHierarchy,
  getValidConcepts,
};
