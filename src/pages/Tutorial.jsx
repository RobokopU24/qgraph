import React from 'react';

import {
  Grid, Row, Col,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Figure from '../components/figure/Figure';

import fig1 from '../../public/images/tutorial/1.png';
import fig2 from '../../public/images/tutorial/2.png';
import fig3 from '../../public/images/tutorial/3.png';
import fig4 from '../../public/images/tutorial/4.png';
import fig5 from '../../public/images/tutorial/5.png';
import fig6 from '../../public/images/tutorial/6.png';
import fig7 from '../../public/images/tutorial/7.png';

/**
 * Robokop Guide Page
 */
export default function Tutorial() {
  return (
    <Grid style={{ marginBottom: '50px' }}>
      <Row>
        <Col md={8}>
          <h2>
            ROBOKOP Tutorial
          </h2>
          <hr />
          <h3>
            ROBOKOP One-hop Queries
          </h3>
          <p>
            For new users, simple one-hop queries provide a good starting point. For example, the query below asks for all diseases in ROBOKOP that are associated with the input node <code>2,3,7,8-tetrachlorodibenzo-P-dioxin</code>. The query is structured as a subject-predicate-object <code>triple</code>:
          </p>
          <p style={{ textAlign: 'center' }}>
            <em>2 3 7 8-tetrachlorodibenzo-p-dioxin -&gt; associated with -&gt; disease</em>
          </p>
          <p>
            In the ROBOKOP user interface (UI), a user either enters <code>2,3,7,8-tetrachlorodibenzo-P-dioxin</code> or the equivalent CURIE (PUBCHEM.COMPOUND:15625) in the first node (n0). If the autocomplete dropdown menu cannot identify an exact text match, then a user can try simplifying the entry by, for example, not specifying a specific isomer and entering <code>tetrachlorodibenzo-p-dioxin</code>.
          </p>
          <p>
            Note that users can lookup CURIEs by name using the <a href="https://name-resolution-sri.renci.org/docs#/" target="_blank" rel="noreferrer">Translator Name Resolver service</a>, which is a service that was created by the <a href="https://ncats.nih.gov/translator/about" target="_blank" rel="noopener noreferrer">Biomedical Data Translator Consortium</a>, funded by the National Center for Advancing Translational Sciences.
          </p>
          <p>
            After selecting n0, a user can then select a predicate from the autocomplete dropdown menu. In this case, <code>associated with</code> was selected. For the second node (n1), a user can select a category from Biolink Model. Here, <code>Disease</code> was selected.
          </p>
          <p>
            Note that users can refer to this <a href="http://tree-viz-biolink.herokuapp.com/" target="_blank" rel="noopener noreferrer">Biolink Model tree visualization</a> for help with node and predicate categories.
          </p>
          <Figure image={fig1} imageAlt="One-hop query for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.">
            One-hop query for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.
          </Figure>
          <p>
            After clicking on <code>SUBMIT</code>, ROBOKOP will return an answer set, or a set of knowledge subgraphs.
          </p>
          <Figure image={fig2} figureStyle={{ marginBottom: 0 }} alt="Bubble graph for one-hop query results." />
          <Figure image={fig3} figureStyle={{ marginTop: 0 }} alt="One-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.">
            One-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.
          </Figure>
          <p>
            Users can then explore answers or knowledge subgraphs. Note that the size of each &lsquo;bubble&rsquo; in the Knowledge Graph Bubble reflects how relatively common that entity is represented among the full answer set. In this example, the top-ranked answer is for neoplasm, with a score of 0.814. Clicking the answer path will display the answer knowledge subgraph in the Answer Explorer.
          </p>
          <Figure image={fig4} imageAlt="Exploring one-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.">
            Exploring one-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.
          </Figure>
          <p>
            Clicking on the <code>positively correlated with</code> edge shows the provenance underlying the assertion, which  takes the form: <em>biolink:primary_knowledge_source</em> : <em>infores:ctd</em>; <em>biolink:aggregator_knowledge_source</em> : <em>infores:automat-robokop</em>. In this example, CTD is the primary knowledge source from which the edge is derived, and Automat ROBOKOP KG is the aggregator knowledge source that contributed the CTD edge.
          </p>
          <p>
            Clicking on <code>Result JSON</code> exposes the answer knowledge subgraph in JSON format.
          </p>
          <Figure image={fig5} imageAlt="Provenance for ‘positively correlated with’ edge shows that CTD is the primary knowledge source and that it was contributed by the aggregator knowledge source, Automat ROBOKOP KG. The answer knowledge subgraph is also displayed in JSON format.">
            Provenance for <code>positively correlated with</code> edge shows that CTD is the primary knowledge source and that it was contributed by the aggregator knowledge source, Automat ROBOKOP KG. The answer knowledge subgraph is also displayed in JSON format.
          </Figure>
          <Figure image={fig6} imageAlt="Example PubMed abstract contributed by the curated primary knowledge source, CTD.">
            Example PubMed abstract contributed by the curated primary knowledge source, CTD.
          </Figure>
          <p>
            Clicking on the <code>occurs together in literature with</code> edge shows that there are 1722 co-occurrences of <code>2,3,7,8-tetrachlorodibenzo-P-dioxin</code> and <code>neoplasm</code> in PubMed abstracts, as determined by OmniCorp.
          </p>
          <Figure image={fig7} imageAlt="Provenance for ‘occurs together in literature with’ edge shows that there are 1722 co-occurrences of ‘2,3,7,8-tetrachlorodibenzo-P-dioxin’ and ‘neoplasm’ in PubMed abstracts, as determined by OmniCorp.">
            Provenance for <code>occurs together in literature with</code> edge shows that there are 1722 co-occurrences of <code>2,3,7,8-tetrachlorodibenzo-P-dioxin</code> and <code>neoplasm</code> in PubMed abstracts, as determined by OmniCorp.
          </Figure>
          <hr />
          <h3>
            ROBOKOP Multi-hop and Non-linear Queries
          </h3>
          <p>
            In addition to one-hop queries, ROBOKOP supports multi-hop and non-linear queries. Theoretically, ROBOKOP supports any query graph that a user creates. However, the more complex the query, the longer the running time and the higher the chance that ROBOKOP will not return an answer set, especially if very specific nodes/predicates are included in a complex query. In general, users will find it easier to begin with simple high-level queries and then iteratively refine them until the desired level of knowledge can be obtained within the constraints of the overall knowledge available in ROBOKOP.
          </p>
          <p>
            For examples of other queries, please see the templated preloaded queries on the <Link to="/">ROBOKOP question-builder page</Link>.
          </p>
        </Col>
      </Row>
    </Grid>
  );
}
