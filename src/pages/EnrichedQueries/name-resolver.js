import axios from 'axios';

export default async function nameLookup({
  name,
  limit = 100,
  biolinkTypeFilter,
  taxaFilter,
  signal,
}) {
  const { data } = await axios.get('https://robokop-name-resolver.apps.renci.org/lookup', {
    signal,
    params: {
      string: name,
      autocomplete: true,
      offset: 0,
      limit,
      biolink_type: biolinkTypeFilter,
      only_taxa: (taxaFilter || []).join('|'),
    },
  });

  return data;
}
