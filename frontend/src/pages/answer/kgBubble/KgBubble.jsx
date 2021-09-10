/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import * as d3 from 'd3';
import Paper from '@material-ui/core/Paper';

import BiolinkContext from '~/context/biolink';
import kgUtils from '~/utils/knowledgeGraph';
import dragUtils from '~/utils/d3/drag';
import graphUtils from '~/utils/d3/graph';
import Loading from '~/components/loading/Loading';

import './kgBubble.css';

const nodePadding = 2;

/**
 * Knowledge Graph Bubble Graph
 * @param {array} nodes - list of node objects
 * @param {integer} numQgNodes - number of nodes in query graph
 * @param {integer} numResults - number of results in message
 */
export default function KgBubble({
  nodes, numQgNodes, numResults,
}) {
  const svgRef = useRef();
  const { colorMap } = useContext(BiolinkContext);
  const [drawing, setDrawing] = useState(false);

  /**
   * Initialize the svg size
   */
  function setSvgSize() {
    if (nodes.length) {
      const svg = d3.select(svgRef.current);
      const { width, height } = svg.node().parentNode.getBoundingClientRect();
      svg
        .attr('width', width)
        .attr('height', height)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', [0, 0, width, height]);
    }
  }
  useEffect(() => {
    setSvgSize();
  }, [nodes]);

  function drawBubbleGraph() {
    const svg = d3.select(svgRef.current);
    const { width, height } = svg.node().parentNode.getBoundingClientRect();
    // clear the graph
    svg.selectAll('*').remove();
    const getNodeRadius = kgUtils.getNodeRadius(width, height, numQgNodes, numResults);
    const converted_nodes = nodes.map((d) => ({ ...d, x: Math.random() * width, y: Math.random() * height }));
    const simulation = d3.forceSimulation(converted_nodes)
      .force('x', d3.forceX(width / 2).strength(0.02)) // pull all nodes horizontally towards middle of box
      .force('y', d3.forceY(height / 2).strength(0.2)) // pull all nodes vertically towards middle of box
      .force('collide', d3.forceCollide().radius( // prevent collisions
        (d) => getNodeRadius(d.count) + nodePadding,
      ).iterations(3)) // run the collide constraint multiple times to strongly enforce collision prevention
      .on('tick', () => {
        node
          .attr('transform', (d) => {
            let padding = getNodeRadius(d.count);
            // 70% of node radius so a dragged node can push into the graph bounds a little
            if (d.fx !== null && d.fx !== undefined) {
              padding *= 0.5;
            }
            d.x = graphUtils.getBoundedValue(d.x, width - padding, padding);
            d.y = graphUtils.getBoundedValue(d.y, height - padding, padding);
            return `translate(${d.x}, ${d.y})`;
          });
      });
    const node = svg.selectAll('g')
      .data(converted_nodes)
      .enter()
        .append('g')
          .attr('class', 'node')
          .call(dragUtils.dragNode(simulation))
          .call((n) => n.append('circle')
            .attr('r', (d) => getNodeRadius(d.count))
            .attr('fill', (d) => colorMap((d.categories && d.categories[0]) || 'unknown'))
            .call((nCircle) => nCircle.append('title')
              .text((d) => d.name)))
          .call((n) => n.append('text')
            .attr('class', 'nodeLabel')
            .style('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .style('font-weight', 600)
            .attr('alignment-baseline', 'middle')
            .text((d) => {
              if (getNodeRadius(d.count) < 15) {
                return '';
              }
              const { name, id } = d;
              return name || id || 'Something';
            })
            .each(graphUtils.ellipsisOverflow));

    simulation.alpha(1).restart();
  }

  useEffect(() => {
    if (nodes.length) {
      drawBubbleGraph();
    }
  }, [nodes]);

  useEffect(() => {
    let timer;
    window.addEventListener('resize', () => {
      const svg = d3.select(svgRef.current);
      // clear the graph
      svg.selectAll('*').remove();
      setDrawing(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSvgSize();
        drawBubbleGraph();
        setDrawing(false);
      }, 500);
    });
    return () => {
      window.removeEventListener('resize', () => {
        const svg = d3.select(svgRef.current);
        // clear the graph
        svg.selectAll('*').remove();
        setDrawing(true);
        clearTimeout(timer);
        timer = setTimeout(() => {
          setSvgSize();
          drawBubbleGraph();
          setDrawing(false);
        }, 500);
      });
    };
  }, [nodes]);

  return (
    <>
      {nodes.length > 0 && (
        <Paper id="kgBubbleContainer" elevation={3}>
          <h5 className="cardLabel">Knowledge Graph Bubble</h5>
          {drawing && (
            <Loading positionStatic />
          )}
          <svg ref={svgRef} />
        </Paper>
      )}
    </>
  );
}
