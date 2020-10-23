import _ from 'lodash';

const standardizeCase = (str) => str && str.replaceAll(' ', '_').toLowerCase();

const baseClass = 'biological_entity';

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

export default {
  standardizeCase,
  getHierarchy,
};
