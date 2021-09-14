/**
 * @file Central location of all API service URLs.
 */

// ARAs
const strider = `${window.location.origin}/api/external/strider/query`;
const aragorn = `${window.location.origin}/api/external/aragorn/query`;
const robokop = `${window.location.origin}/api/external/robokop/query`;

// internal services
const robokache = `${window.location.origin}/api/robokache`;
const query_dispatcher = `${window.location.origin}/api/queryDispatcher`;

// external APIs
const node_norm = `${window.location.origin}/api/external/nodeNormalization`;
const name_resolver = `${window.location.origin}/api/external/nameResolver`;
const biolink = `${window.location.origin}/api/external/biolink`;

export {
  robokache,
  query_dispatcher,
  node_norm,
  name_resolver,
  biolink,
};

// default export of ARAs
export default {
  strider,
  aragorn,
  robokop,
};
