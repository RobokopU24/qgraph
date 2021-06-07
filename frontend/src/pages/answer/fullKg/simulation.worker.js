/** Web Worker to run d3 force simulation and return placed nodes and edges */
import * as d3 from 'd3';

onmessage = (e) => {
  const { edges, nodes } = e.data;
  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody()) // create global electrostatic charge
    .force('collide', d3.forceCollide(15).strength(0.5)) // prevent node overlap
    .force('link', d3.forceLink(edges).id((d) => d.id).distance(50)) // add edges with length
    .force('forceX', d3.forceX()) // center graph on x axis
    .force('forceY', d3.forceY()) // center graph on y axis
    .stop(); // stop simulation, as we're going to manually step through all ticks

  const numTicks = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
  for (let i = 0; i < numTicks; i += 1) {
    postMessage({ type: 'tick', progress: (i / numTicks) * 100 });
    simulation.tick();
  }

  postMessage({ type: 'display', nodes, edges });
};
