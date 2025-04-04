import utils from './utils';
import { api } from './baseUrlProxy';

const routes = {
  async getDrugChemicalPairs({
    pagination,
    sort,
  }) {
    let response;
    try {
      response = await api.post(
        '/api/explore/drug-disease',
        {
          pagination: {
            offset: pagination.pageIndex * pagination.pageSize,
            limit: pagination.pageSize,
          },
          sort,
        },
      );
    } catch (error) {
      return utils.handleAxiosError(error);
    }
    return response.data;
  },
};

export default routes;
