import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Row, Col, Grid } from 'react-bootstrap';
import { FaSpinner } from 'react-icons/lib/fa';

import FlowbokopGraphViewer from './FlowbokopGraphViewer';

const graphStates = {
  fetching: 'fetching',
  empty: 'empty',
  display: 'display',
};

const propTypes = {
  // scrollToId: PropTypes.string,
  graphState: PropTypes.string, // One of {'fetching', 'empty', 'display'}
  height: PropTypes.string,
  width: PropTypes.string,
  // callbackFetchGraph: PropTypes.func,
  graph: PropTypes.shape({
    nodes: PropTypes.array,
    edges: PropTypes.array,
  }).isRequired,
  // wait: ,
  // callbackRefresh: PropTypes.func,
  // concepts: ,
};

const defaultProps = {
  graphState: graphStates.display,
  height: null,
  width: null,
};

class FlowbokopGraphFetchAndView extends React.Component {
  constructor(props) {
    super(props);

    this.divId = 'FlowbokopGraphFetchContainer';

    this.getHeight = this.getHeight.bind(this);
    this.getWidth = this.getWidth.bind(this);
    // this.scrollGraphToTop = this.scrollGraphToTop.bind(this);
  }

  getHeight() {
    let h = $(window).height() - 50;
    return `${h}px`;
  }
  getWidth() {
    // let w = 500;
    let w = $(`#${this.divId}`).innerWidth();
    // Ask how big the parent div is?
    return `${w}px`;
  }
  // scrollGraphToTop() {
  //   $('html, body').animate(
  //     {
  //       scrollTop: $(this.props.scrollToId).offset().top - 3,
  //     },
  //     1000,
  //   );
  // }

  render() {
    const fetching = this.props.graphState === graphStates.fetching;
    const notInitialized = this.props.graphState === graphStates.empty;

    const showGraph = (!(this.props.graph === null) && (this.props.graphState === graphStates.display));
    const showFetching = fetching;

    const panelExtraStyle = { margin: 0 };

    const height = this.props.height ? this.props.height : this.getHeight();
    const width = this.props.width ? this.props.width : this.getWidth();

    return (
      <div id={this.divId}>
        <Grid>
          <Row>
            <Col md={12}>
              <Panel style={panelExtraStyle} expanded={showGraph}>
                <Panel.Heading>
                  <Panel.Title>
                    Flowbokop Query Graph
                  </Panel.Title>
                </Panel.Heading>
                <Panel.Body style={{ padding: '0px' }}>
                  {showGraph &&
                    <FlowbokopGraphViewer
                      height={height}
                      width={width}
                      graph={this.props.graph}
                    />
                  }
                  {showFetching &&
                    <div style={{ margin: '15px', height, display: 'table', width: '100%' }}>
                      <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center' }}>
                        <FaSpinner className="icon-spin" style={{ marginRight: '10px', verticalAlign: 'text-top' }} />
                        Graph update in progress... Please wait.
                      </div>
                    </div>
                  }
                  {notInitialized &&
                    <div style={{ margin: '15px', height, display: 'table', width: '100%' }}>
                      <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center' }}>
                        Please setup input(s) to generate query graph.
                      </div>
                    </div>
                  }
                </Panel.Body>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

FlowbokopGraphFetchAndView.propTypes = propTypes;
FlowbokopGraphFetchAndView.defaultProps = defaultProps;

export default FlowbokopGraphFetchAndView;
export { graphStates };
