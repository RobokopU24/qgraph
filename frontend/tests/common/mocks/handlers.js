import { rest } from 'msw';

import biolink from '&/biolink_model.json';
import test_message from '&/test_message.json';

const handlers = [
  rest.get('/api/external/biolink', (req, res, ctx) => res(
    ctx.json(biolink.data),
  )),
  rest.post('/api/external/nodeNormalization/get_normalized_nodes', (req, res, ctx) => {
    const curie = req.body.curies[0];
    return res(
      ctx.json({
        [curie]: {
          id: {
            label: curie,
            identifier: curie,
          },
          type: 'biolink:Disease',
        },
      }),
    );
  }),
  rest.post('/api/external/nameResolver/lookup', (req, res, ctx) => {
    const curie = req.url.searchParams.get('string');
    return res(
      ctx.json({
        [curie]: {},
      }),
    );
  }),
  rest.post('/api/external/strider/query', (req, res, ctx) => res(
    ctx.json(test_message),
  )),
];

export default handlers;
