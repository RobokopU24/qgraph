import axios from 'axios';
import utils from './utils';
import { api } from './baseUrlProxy';
import testData1 from '../100_asthma_edges_response.json';
const baseRoutes = {
  async getNodeDetails(nodeId) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://robokop-automat.apps.renci.org/robokopkg/node/${nodeId}`,
      headers: {
        'Content-Type':
          'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await axios(
        config,
      );

      console.log({
        object: response.data,
      });

      return response.data;
      // return testData1;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(
        error,
      );
    }
  },

  async getNodeEdges(
    nodeId,
    pageSize,
    pageNumber,
    predicate,
  ) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://robokop-automat.apps.renci.org/robokopkg/edges/${nodeId}?limit=${pageSize}&offset=${
        pageNumber * pageSize
      }&predicate=${
        predicate === 'all'
          ? ''
          : predicate
      }`,
      headers: {
        'Content-Type':
          'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await axios(
        config,
      );

      return response.data;
      // return testData1;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(
        error,
      );
    }
  },

  async getNodeEdgeSummary(nodeId) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://robokop-automat.apps.renci.org/robokopkg/edge_summary/${nodeId}`,
      headers: {
        'Content-Type':
          'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await axios(
        config,
      );

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(
        error,
      );
    }
  },
};

const routes = {
  getNodeEdges: baseRoutes.getNodeEdges,
  getNodeDetails:
    baseRoutes.getNodeDetails,
  getNodeEdgeSummary:
    baseRoutes.getNodeEdgeSummary,
};

export default routes;
