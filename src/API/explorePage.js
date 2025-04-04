import utils from './utils';
import { api } from './baseUrlProxy';

const routes = {
  async getDrugChemicalPairs({
    pagination: {
      pageIndex,
      pageSize,
    },
  }) {
    let response;
    try {
      response = await api.post(
        '/api/explore/drug-disease',
        {
          pagination: {
            offset: pageIndex * pageSize,
            limit: pageSize,
          },
        },
      );
    } catch (error) {
      return utils.handleAxiosError(error);
    }
    return response.data;
  },
};

export default routes;
