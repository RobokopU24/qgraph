import React from 'react';

import {
  Grid, Row, Col,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
    <Grid>
      <Row>
        <Col md={8}>
          <h2>
            ROBOKOP Tutorial
          </h2>
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
            In the ROBOKOP user interface (UI), a user either enters <code>2,3,7,8-tetrachlorodibenzo-P-dioxin</code> or the equivalent CURIE (UMLS:C003965) in the first node (n0). If the autocomplete dropdown menu cannot identify an exact text match, then a user can try simplifying the entry by, for example, not specifying a specific isomer and entering <code>tetrachlorodibenzo-p-dioxin</code>.
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
          <figure>
            <img src={fig1} alt="One-hop query for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP." />
            <figcaption>One-hop query for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.</figcaption>
          </figure>
          <p>
            After clicking on <code>QUICK SUBMIT</code>, ROBOKOP will return an answer set, or a set of knowledge subgraphs.
          </p>
          <figure>
            <img src={fig2} alt="Bubble graph for one-hop query results." />
            <img src={fig3} alt="One-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP." />
            <figcaption>One-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.</figcaption>
          </figure>
          <p>
            Users can then explore answers or knowledge subgraphs. In this example, the top-ranked answer is for neoplasm, with a score of 0.814. Clicking the answer path will display the answer knowledge subgraph in the Answer Explorer.
          </p>
          <figure>
            <img src={fig4} alt="Exploring one-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP." />
            <figcaption>Exploring one-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.</figcaption>
          </figure>
          <p>
            Clicking on the <code>positively correlated with</code> edge shows the provenance underlying the assertion, which  takes the form: <em>biolink:primary_knowledge_source</em> : <em>infores:ctd</em>; <em>biolink:aggregator_knowledge_source</em> : <em>infores:automat-robokop</em>. In this example, CTD is the primary knowledge source from which the edge is derived, and Automat ROBOKOP KG is the aggregator knowledge source that contributed the CTD edge.
          </p>
          <p>
            Clicking on <code>Result JSON</code> exposes the answer knowledge subgraph in JSON format.
          </p>
          <figure>
            <img src={fig5} alt="Provenance for ‘positively correlated with’ edge shows that CTD is the primary knowledge source and that it was contributed by the aggregator knowledge source, Automat ROBOKOP KG. The answer knowledge subgraph is also displayed in JSON format." />
            <figcaption>Provenance for <code>positively correlated with</code> edge shows that CTD is the primary knowledge source and that it was contributed by the aggregator knowledge source, Automat ROBOKOP KG. The answer knowledge subgraph is also displayed in JSON format.</figcaption>
          </figure>
          <figure>
            <img src={fig6} alt="Example PubMed abstract contributed by the curated primary knowledge source, CTD." />
            <figcaption>Example PubMed abstract contributed by the curated primary knowledge source, CTD.</figcaption>
          </figure>
          <p>
            Clicking on the <code>occurs together in literature with</code> edge shows that there are 1722 co-occurrences of <code>2,3,7,8-tetrachlorodibenzo-P-dioxin</code> and <code>neoplasm</code> in PubMed abstracts, as determined by OmniCorp.
          </p>
          <figure>
            <img src={fig7} alt="Provenance for ‘occurs together in literature with’ edge shows that there are 1722 co-occurrences of ‘2,3,7,8-tetrachlorodibenzo-P-dioxin’ and ‘neoplasm’ in PubMed abstracts, as determined by OmniCorp." />
            <figcaption>Provenance for <code>occurs together in literature with</code> edge shows that there are 1722 co-occurrences of <code>2,3,7,8-tetrachlorodibenzo-P-dioxin</code> and <code>neoplasm</code> in PubMed abstracts, as determined by OmniCorp.</figcaption>
          </figure>
          <hr />
          <h3>
            ROBOKOP Multi-hop and Non-linear Queries
          </h3>
          <p>
            In addition to one-hop queries, ROBOKOP supports multi-hop and non-linear queries. Theoretically, ROBOKOP supports any query graph that a user creates. However, the more complex the query, the longer the running time and the higher the chance that ROBOKOP will not return an answer set, especially if very specific nodes/predicates are included in a complex query. In general, users will find it easier to begin with simple high-level queries and then iteratively refine them until the desired level of knowledge can be obtained within the constraints of the overall knowledge available in ROBOKOP.
          </p>
          <p>
            For examples of other queries, please see the templated preloaded queries on the <Link to="/question">ROBOKOP question-builder page</Link>.
          </p>
        </Col>
      </Row>
    </Grid>
  );
}
