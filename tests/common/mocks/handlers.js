import { rest } from 'msw';

import biolink from '&/biolink_model.json';
import test_message from '&/test_message.json';

const handlers = [
  rest.get(`${process.env.BASE_URL || ''}/api/biolink`, (req, res, ctx) => res(
    ctx.json(biolink),
  )),
  rest.post(`${process.env.BASE_URL || ''}/api/node_norm`, (req, res, ctx) => {
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
  rest.post(`${process.env.BASE_URL || ''}/api/name_resolver`, (req, res, ctx) => {
    const curie = req.url.searchParams.get('string');
    return res(
      ctx.json({
        [curie]: {},
      }),
    );
  }),
  rest.post(`${process.env.BASE_URL || ''}/api/quick_answer`, (req, res, ctx) => res(
    ctx.json(test_message),
  )),
];

export default handlers;
