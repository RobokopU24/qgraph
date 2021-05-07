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

const nodePadding = 5;

export default function KgBubble({ nodes, knowledge_graph }) {
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
    const total = nodes.reduce((a, b) => a + b.count, 0);
    const converted_nodes = nodes.map((d) => ({ ...d, x: Math.random() * width, y: Math.random() * height }));
    const simulation = d3.forceSimulation(converted_nodes)
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.01))
      .force('forceX', d3.forceX(width / 2).strength(0.01))
      .force('forceY', d3.forceY(height / 2).strength(0.2))
      .force('collide', d3.forceCollide().radius(
        (d) => kgUtils.getNodeRadius(d.count, total, width) + nodePadding,
      ))
      .on('tick', () => {
        node
          .attr('transform', (d) => {
            const x = graphUtils.getBoundedValue(d.x, width, 0);
            const y = graphUtils.getBoundedValue(d.y, height, 0);
            return `translate(${x}, ${y})`;
          });
      });
    const node = svg.selectAll('g')
      .data(converted_nodes)
      .enter()
        .append('g')
          .attr('class', 'node')
          .call(dragUtils.dragNode(simulation, width, height, 20))
          .call((n) => n.append('circle')
            .attr('r', (d) => kgUtils.getNodeRadius(d.count, total, width))
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
              if (kgUtils.getNodeRadius(d.count, total, width) < 15) {
                return '';
              }
              const { name } = d;
              return name || 'Any';
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
      <h5 id="kgBubbleLabel">Knowledge Graph Bubble</h5>
      <svg ref={svgRef} />
    </Paper>
  );
}
