/**
 * @file Central location of all API service URLs.
 */

// External ARAs
const strider = `${process.env.STRIDER}/query`;
const aragorn = `${process.env.ARAGORN}/query`;
const robokop = `${process.env.ROBOKOP}/query`;

module.exports = {
  strider,
  aragorn,
  robokop,
};
