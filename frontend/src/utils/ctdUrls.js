export default function ctdUrls(category, equalIds) {
  let id = '';
  let ctdCategory = '';
  if (category === 'chemical_substance') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('MESH'));
    if (id) {
      id = id.substr(id.indexOf(':') + 1);
    }
    ctdCategory = 'chem';
  } else if (category === 'disease') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('MESH') || ei.toUpperCase().includes('OMIM'));
    ctdCategory = 'disease';
  } else if (category === 'gene') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('NCBIGENE'));
    if (id) {
      id = id.substr(id.indexOf(':') + 1);
    }
    ctdCategory = 'gene';
  } else if (category === 'biological_process') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('GO'));
    ctdCategory = 'go';
  } else if (category === 'pathway') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('KEGG') || ei.toUpperCase().includes('REACT'));
    ctdCategory = 'pathway';
  }
  // const onto = id.substr(0, id.indexOf(':'));
  return { label: 'CTD', url: `http://ctdbase.org/detail.go?category=${ctdCategory}&acc=${id}`, iconUrl: 'http://ctdbase.org/images/ctdlogo_xs.v15420.png' };
}
