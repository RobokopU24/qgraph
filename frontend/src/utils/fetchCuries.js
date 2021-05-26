import API from '~/API';

export default async function fetchCuries(entity, displayAlert) {
  // Get list of curies that match this search term
  const response = await API.nameResolver.entityLookup(entity, 1000);
  if (response.status === 'error') {
    displayAlert('error',
      'Failed to contact name resolver to search curies. Please try again later.');
    return [];
  }
  const curieResponse = Object.keys(response);
  if (!curieResponse.length) {
    return [];
  }

  // Pass curies to nodeNormalizer to get category information and
  // a better curie identifier
  const normalizationResponse = await API.nodeNormalization.getNormalizedNodesPost({ curies: curieResponse });

  if (normalizationResponse.status === 'error') {
    displayAlert('error',
      'Failed to contact node normalizer to search curies. Please try again later.');
    return [];
  }

  // Sometimes the nodeNormalizer returns null responses
  // so we use a filter to remove those
  const newOptions = Object.values(normalizationResponse).filter((c) => c).map((c) => ({
    name: c.id.label || c.id.identifier,
    category: c.type,
    id: c.id.identifier,
  }));

  return newOptions;
}
