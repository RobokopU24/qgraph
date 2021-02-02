export default function ctdUrls(category, equalIds) {
  let id = '';
  let ctdType = '';
  if (category === 'biolink:ChemicalSubstance') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('MESH'));
    if (id) {
      id = id.substr(id.indexOf(':') + 1);
    }
    ctdType = 'chem';
  } else if (category === 'biolink:Disease') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('MESH') || ei.toUpperCase().includes('OMIM'));
    ctdType = 'disease';
  } else if (category === 'biolink:Gene') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('NCBIGENE'));
    if (id) {
      id = id.substr(id.indexOf(':') + 1);
    }
    ctdType = 'gene';
  } else if (category === 'biolink:BiologicalProcess') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('GO'));
    ctdType = 'go';
  } else if (category === 'biolink:Pathway') {
    id = equalIds.find((ei) => ei.toUpperCase().includes('KEGG') || ei.toUpperCase().includes('REACT'));
    ctdType = 'pathway';
  }
  // const onto = id.substr(0, id.indexOf(':'));
  return { label: 'CTD', url: `http://ctdbase.org/detail.go?type=${ctdType}&acc=${id}`, iconUrl: 'http://ctdbase.org/images/ctdlogo_xs.v15420.png' };
}
