import utils from './utils';
import { api } from './baseUrlProxy';

const routes = {
  async getDrugChemicalPairs() {
    let response;
    try {
      response = await api.post('/api/explore');
    } catch (error) {
      return utils.handleAxiosError(error);
    }
    return response.data;
  },
};

export default routes;
