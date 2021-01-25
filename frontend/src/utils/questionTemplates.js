const questions = [
  {
    natural_question: 'What genetic conditions protect against ebola hemorrhagic fever?',
    machine_question: {
      nodes: [
        {
          id: 'node0',
          name: 'ebola hemorrhagic fever',
          category: 'disease',
          curie: 'MONDO:0005737',
        },
        {
          id: 'node1',
          category: 'gene',
        },
        {
          id: 'node2',
          category: 'genetic_condition',
        },
      ],
      edges: [
        {
          id: 'edge01',
          subject: 'node0',
          object: 'node1',
        },
        {
          id: 'edge12',
          subject: 'node1',
          object: 'node2',
        },
      ],
    },
  },
  {
    natural_question: 'What is the COP for imatinib and asthma?',
    machine_question: {
      nodes: [
        {
          id: 'node0',
          name: 'imatinib',
          category: 'chemical_substance',
          curie: 'PUBCHEM:5291',
        },
        {
          id: 'node1',
          category: 'gene',
        },
        {
          id: 'node2',
          category: 'biological_process',
          set: true,
        },
        {
          id: 'node3',
          category: 'cell',
        },
        {
          id: 'node4',
          category: 'anatomical_entity',
        },
        {
          id: 'node5',
          category: 'phenotypic_feature',
          set: true,
        },
        {
          id: 'node6',
          name: 'asthma',
          category: 'disease',
          curie: 'MONDO:0004979',
        },
      ],
      edges: [
        {
          id: 'edge01',
          subject: 'node0',
          object: 'node1',
        },
        {
          id: 'edge12',
          subject: 'node1',
          object: 'node2',
        },
        {
          id: 'edge23',
          subject: 'node2',
          object: 'node3',
        },
        {
          id: 'edge34',
          subject: 'node3',
          object: 'node4',
        },
        {
          id: 'edge45',
          subject: 'node4',
          object: 'node5',
        },
        {
          id: 'edge56',
          subject: 'node5',
          object: 'node6',
        },
      ],
    },
  },
  {
    natural_question: 'What genes are related to Fanconi Anemia?',
    machine_question: {
      nodes: [
        {
          id: 'node0',
          category: 'gene',
        },
        {
          id: 'node1',
          name: 'Fanconi Anemia',
          category: 'disease',
          curie: 'MONDO:0019391',
        },
      ],
      edges: [
        {
          id: 'edge01',
          subject: 'node0',
          object: 'node1',
        },
      ],
    },
  },
  {
    natural_question: 'What chemicals counteract toxicants worsening diabetes?',
    machine_question: {
      nodes: [
        {
          id: 'node0',
          category: 'disease',
          curie: 'MONDO:0005148',
        },
        {
          id: 'node1',
          category: 'chemical_substance',
        },
        {
          id: 'node2',
          category: 'gene',
        },
        {
          id: 'node3',
          category: 'chemical_substance',
        },
      ],
      edges: [
        {
          id: 'edge10',
          subject: 'node1',
          object: 'node0',
          category: 'contributes_to',
        },
        {
          id: 'edge21',
          subject: 'node2',
          object: 'node1',
          category: [
            'increases_degradation_of',
            'decreases_abundance_of',
            'decreases_response_to',
          ],
        },
        {
          id: 'edge32',
          subject: 'node3',
          object: 'node2',
          category: [
            'increases_activity_of',
            'increases_expression_of',
            'decreases_degradation_of',
            'increases_stability_of',
            'increases_synthesis_of',
            'increases_secretion_of',
          ],
        },
      ],
    },
  },
  {
    natural_question: 'Find chemicals that may affect multiple specific processes',
    machine_question: {
      nodes: [
        {
          id: 'node0',
          category: 'gene',
        },
        {
          name: ' voltage-gated sodium channel activity',
          curie: 'GO:0005248',
          id: 'node1',
          category: 'biological_process_or_activity',
        },
        {
          name: 'muscle contraction',
          curie: 'GO:0006936',
          id: 'node2',
          category: 'biological_process_or_activity',
        },
        {
          name: 'neuronal action potential',
          curie: 'GO:0019228',
          id: 'node3',
          category: 'biological_process_or_activity',
        },
        {
          id: 'node4',
          category: 'chemical_substance',
        },
      ],
      edges: [
        { id: 'edge01', subject: 'node0', object: 'node1' },
        { id: 'edge02', subject: 'node0', object: 'node2' },
        { id: 'edge03', subject: 'node0', object: 'node3' },
        { id: 'edge04', subject: 'node0', object: 'node4' },
      ],
    },
  },
  {
    natural_question: 'Find dual-acting COPD treatments',
    machine_question: {
      nodes: [
        {
          id: 'node0',
          category: 'disease',
          name: 'chronic obstructive pulmonary disorder',
          curie: 'MONDO:0005002',
        },
        {
          id: 'node1',
          category: 'gene',
        },
        {
          id: 'node2',
          category: 'gene',
        },
        {
          id: 'node3',
          category: 'chemical_substance',
        },
      ],
      edges: [
        {
          id: 'edge10',
          subject: 'node1',
          object: 'node0',
        },
        {
          id: 'edge20',
          subject: 'node2',
          object: 'node0',
        },
        {
          id: 'edge31',
          subject: 'node3',
          object: 'node1',
          category: 'interacts_with',
        },
        {
          id: 'edge32',
          subject: 'node3',
          object: 'node2',
          category: 'interacts_with',
        },
        {
          id: 'edge30',
          subject: 'node3',
          object: 'node0',
          category: 'treats',
        },
      ],
    },
  },
];

export default questions;
