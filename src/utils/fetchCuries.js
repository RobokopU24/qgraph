import API from '~/API';

export default async function fetchCuries(entity, displayAlert, cancel) {
  // Get list of curies that match this search term
  console.log('lookup ${entity}');
  const response = await API.nameResolver.entityLookup(entity, 1000, cancel);
  if (response.status === 'error') {
    displayAlert('error',
      'Failed to contact name resolver to search curies. Please try again later.');
    return [];
  }
  const curieResponse = Object.keys(response);
  if (!curieResponse.length) {
    console.log('empty response');
    return [];
  }
  console.log(curieResponse);

  // Pass curies to nodeNormalizer to get category information and
  // a better curie identifier
  const normalizationResponse = await API.nodeNormalization.getNormalizedNodes({ curies: curieResponse }, cancel);

  if (normalizationResponse.status === 'error') {
    displayAlert('error',
      'Failed to contact node normalizer to search curies. Please try again later.');
    return [];
  }

  // Sometimes the nodeNormalizer returns null responses
  // so we use a filter to remove those
  const newOptions = Object.values(normalizationResponse).filter((c) => c).map((c) => ({
    name: c.id.label || c.id.identifier,
    categories: c.type,
    ids: [c.id.identifier],
  }));
  console.log(newOptions);

  return newOptions;
}
