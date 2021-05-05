/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import React, {
  useEffect, useRef, useContext, useMemo,
} from 'react';
import * as d3 from 'd3';

import BiolinkContext from '~/context/biolink';
import getNodeCategoryColorMap from '~/utils/colors';
import kgUtils from './utils/kg';
import graphUtils from '~/utils/d3/graph';

const height = 400;
const width = 400;
const nodePadding = 5;

export default function KgBubble({ nodes, knowledge_graph }) {
  const svgRef = useRef();
  const { concepts } = useContext(BiolinkContext);
  const colorMap = useMemo(() => getNodeCategoryColorMap(concepts), [concepts]);

  useEffect(() => {
    d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', [0, 0, width, height]);
  }, []);

  useEffect(() => {
    if (knowledge_graph) {
      const svg = d3.select(svgRef.current);
      // clear the graph
      svg.selectAll('*').remove();
      const total = nodes.reduce((a, b) => a + b.count, 0);
      const converted_nodes = nodes.map((d) => ({ ...d, x: Math.random() * width, y: Math.random() * height }));
      const simulation = d3.forceSimulation()
        .force('center', d3.forceCenter(width / 2, height / 2).strength(1))
        .force('forceX', d3.forceX(width / 2).strength(0.2))
        .force('forceY', d3.forceY(height / 2).strength(0.2))
        .on('tick', () => {
          node
            .attr('transform', (d) => `translate(${d.x}, ${d.y})`);
        });
      const node = svg.selectAll('g')
        .data(converted_nodes)
        .enter()
          .append('g')
            .attr('class', 'node')
            .call(kgUtils.dragNode(simulation))
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

      simulation.nodes(converted_nodes)
        .force('collide', d3.forceCollide().radius(
          (d) => kgUtils.getNodeRadius(d.count, total, width) + nodePadding,
        ));

      simulation.alpha(1).restart();
    }
  }, [knowledge_graph]);

  return (
    <svg ref={svgRef} />
  );
}
