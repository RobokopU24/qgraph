/**
 * @file Central location of all API service URLs.
 */

// ARAs
const strider = `${process.env.STRIDER}/query`;
const aragorn = `${process.env.ARAGORN}/query`;
const robokop = `${process.env.ROBOKOP}/query`;

// internal services
const robokache = process.env.ROBOKACHE;
const query_dispatcher = process.env.QUERY_DISPATCHER;

// external APIs
const node_norm = process.env.NODE_NORMALIZER;
const name_resolver = process.env.NAME_RESOLVER;
const biolink = process.env.BIOLINK;

console.log(process.env);

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
