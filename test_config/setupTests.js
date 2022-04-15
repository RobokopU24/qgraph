import 'regenerator-runtime/runtime';
import 'core-js/stable';
import server from '../tests/common/mocks/server';

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
