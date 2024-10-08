import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HttpsTestServer } from './lib/HttpsTestServer';
import { request } from './request';

const TEST_SERVER_PORT = 8686;
function getPath(path: string): { server: string; client: string } {
  return { server: path, client: `https://localhost:${TEST_SERVER_PORT}${path}` };
}

describe('request', () => {
  let server: HttpsTestServer | null = null;
  beforeAll(() => {
    server = new HttpsTestServer({ port: TEST_SERVER_PORT });
    return server.start();
  });
  afterAll(() => server?.stop());
  it('should handle transfer encoding chunked', async () => {
    const MESSAGE = 'foobar';
    const path = getPath('/transfer-encoding-chunked');
    server?.on('GET', path.server, (_, res) => {
      res.setHeader('Transfer-Encoding', 'chunked');
      res.end(MESSAGE);
    });
    const { data, headers } = await request({
      url: path.client,
      responseBodyType: 'string',
      nodeOptions: { rejectUnauthorized: false },
    });
    expect(data).toBe(MESSAGE);
  });
});
