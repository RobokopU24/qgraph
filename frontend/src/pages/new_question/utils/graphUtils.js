import * as d3 from 'd3';

const inverseEdgeType = {
  source: 'target',
  target: 'source',
};

/**
 * Get radian angle of edge from node
 * @param {int} cx connected node x position
 * @param {int} cy connected node y position
 * @param {int} x attached node x position
 * @param {int} y attached node y position
 */
function getAngle(cx, cy, x, y) {
  const delta_x = x - cx;
  const delta_y = y - cy;
  const theta_radians = Math.atan2(delta_y, delta_x);
  // const angle = theta_radians * (180 / Math.PI);
  return theta_radians;
}

function getAdjustedX(cx, cy, x, y, r) {
  const angle = getAngle(cx, cy, x, y);
  // cos takes radians
  const adjusted_x = cx + r * Math.cos(angle);
  return adjusted_x;
}

function getAdjustedY(cx, cy, x, y, r) {
  const angle = getAngle(cx, cy, x, y);
  // sin takes radians
  const adjusted_y = cy + r * Math.sin(angle);
  return adjusted_y;
}

/**
 * Get x and y positions on edge of node
 * @param {int} cx connected node x position
 * @param {int} cy connected node y position
 * @param {int} x attached node x position
 * @param {int} y attached node y position
 * @param {int} r node radius
 * @returns {obj} x and y postions on circumference of node
 */
function getAdjustedXY(cx, cy, x, y, r) {
  const adjusted_x = getAdjustedX(cx, cy, x, y, r);
  const adjusted_y = getAdjustedY(cx, cy, x, y, r);
  return { x: adjusted_x, y: adjusted_y };
}

/**
 * Find bounded value within graph bounds
 * @param {int} pos position to bound
 * @param {int} bound bound
 * @returns {int} bounded value
 */
function boundedEdge(pos, bound) {
  return Math.max(0, Math.min(pos, bound));
}

/**
 * Find bounded value within graph bounds
 * @param {int} pos position to bound
 * @param {int} bound bound
 * @returns {int} bounded value
 */
function boundedNode(pos, bound, r) {
  return Math.max(r, Math.min(bound - r, pos));
}

function ellipseOverflow() {
  const el = d3.select(this);
  let textLength = el.node().getComputedTextLength();
  let text = el.text();
  while (textLength > 60 && text.length > 0) {
    text = text.slice(0, -1);
    el.text(`${text}...`);
    textLength = el.node().getComputedTextLength();
  }
}

function getEdgeMiddle(edge) {
  const { source, target } = edge;
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  return { x: midX, y: midY };
}

/**
 * Determine if point is within a circle
 * @param {int} x x position of point
 * @param {int} y y position of point
 * @param {int} cx center x of circle
 * @param {int} cy center y of circle
 * @param {int} r radius of circle
 * @returns {bool} Is point within circle
 */
function isInside(x, y, cx, cy, r) {
  return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r ** 2;
}

/**
 * Is edge directed and should show an arrow
 * @param {obj} edge edge object
 * @returns {str} url(#arrow) or empty string
 */
function showArrow(edge) {
  return edge.predicate && edge.predicate.findIndex((p) => p !== 'biolink:related_to') > -1 ? 'url(#arrow)' : '';
}

function show() {
  d3.select(this)
    .transition()
    .duration(500)
    .style('opacity', 1);
}

function hide() {
  d3.select(this)
    .transition()
    .duration(1000)
    .style('opacity', 0);
}

export default {
  inverseEdgeType,

  getAdjustedXY,
  getAdjustedX,
  getAdjustedY,

  boundedNode,
  boundedEdge,

  ellipseOverflow,
  getEdgeMiddle,

  isInside,
  showArrow,

  show,
  hide,
};
