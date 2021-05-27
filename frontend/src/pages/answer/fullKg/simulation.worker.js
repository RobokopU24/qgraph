/** Web Worker to run d3 force simulation and return placed nodes and edges */
import * as d3 from 'd3';

onmessage = (e) => {
  const { edges, nodes } = e.data;
  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody())
    .force('collide', d3.forceCollide(10).strength(0.5))
    .force('link', d3.forceLink(edges).id((d) => d.id).distance(50).strength(1))
    .force('forceX', d3.forceX())
    .force('forceY', d3.forceY())
    .stop();

  const numTicks = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
  for (let i = 0; i < numTicks; i += 1) {
    postMessage({ type: 'tick', progress: (i / numTicks) * 100 });
    simulation.tick();
  }

  postMessage({ type: 'display', nodes, edges });
};
