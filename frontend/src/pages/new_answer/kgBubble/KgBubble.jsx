/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import React, {
  useEffect, useRef, useContext,
} from 'react';
import * as d3 from 'd3';
import Paper from '@material-ui/core/Paper';

import BiolinkContext from '~/context/biolink';
import kgUtils from '../utils/kg';
import dragUtils from '~/utils/d3/drag';
import graphUtils from '~/utils/d3/graph';

import './kgBubble.css';

const nodePadding = 2;

export default function KgBubble({
  nodes, knowledge_graph, numQgNodes, numResults,
}) {
  const svgRef = useRef();
  const { colorMap } = useContext(BiolinkContext);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const { width, height } = svg.node().parentNode.getBoundingClientRect();
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', [0, 0, width, height]);
  }, []);

  function drawBubbleGraph() {
    const svg = d3.select(svgRef.current);
    const { width, height } = svg.node().parentNode.getBoundingClientRect();
    // clear the graph
    svg.selectAll('*').remove();
    const getNodeRadius = kgUtils.getNodeRadius(width, height, numQgNodes, numResults);
    const converted_nodes = nodes.map((d) => ({ ...d, x: Math.random() * width, y: Math.random() * height }));
    const simulation = d3.forceSimulation(converted_nodes)
      .force('forceX', d3.forceX(width / 2).strength(0.02)) // pull all nodes horizontally towards middle of box
      .force('forceY', d3.forceY(height / 2).strength(0.2)) // pull all nodes vertically towards middle of box
      .force('collide', d3.forceCollide().strength(1).radius( // prevent collisions
        (d) => getNodeRadius(d.count) + nodePadding,
      ))
      .on('tick', () => {
        node
          .attr('transform', (d) => {
            const nodeRadius = getNodeRadius(d.count);
            d.x = graphUtils.getBoundedValue(d.x, width - nodeRadius, nodeRadius);
            d.y = graphUtils.getBoundedValue(d.y, height - nodeRadius, nodeRadius);
            return `translate(${d.x}, ${d.y})`;
          });
      });
    const node = svg.selectAll('g')
      .data(converted_nodes)
      .enter()
        .append('g')
          .attr('class', 'node')
          .call(dragUtils.dragNode(simulation, width, height, 20))
          .call((n) => n.append('circle')
            .attr('r', (d) => getNodeRadius(d.count))
            .attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown'))
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
    if (knowledge_graph) {
      drawBubbleGraph();
    }
  }, [knowledge_graph]);

  return (
    <Paper id="kgBubbleContainer" elevation={3}>
      <h5 className="cardLabel">Knowledge Graph Bubble</h5>
      <svg ref={svgRef} />
    </Paper>
  );
}
