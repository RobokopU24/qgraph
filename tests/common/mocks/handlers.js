import { rest } from 'msw';

import biolink from '&/biolink_model.json';
import test_message from '&/test_message.json';

const handlers = [
  rest.get('/api/biolink', (req, res, ctx) => res(
    ctx.json(biolink),
  )),
  rest.post('/api/node_norm', (req, res, ctx) => {
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
  rest.post('/api/name_resolver', (req, res, ctx) => {
    const curie = req.url.searchParams.get('string');
    return res(
      ctx.json({
        [curie]: {},
      }),
    );
  }),
  rest.post('/api/quick_answer', (req, res, ctx) => res(
    ctx.json(test_message),
  )),
];

export default handlers;
