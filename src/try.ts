import { httpsRequest } from './https-request';
import { HttpsTestServer } from './lib/HttpsTestServer';

async function run() {
  const server = new HttpsTestServer({});
  await server.start();
  console.log('server listening');
  server.on('GET', '/', (_, res) => res.end('HELLO'));
  try {
    const [str] = await httpsRequest({
      url: 'https://localhost',
      responseType: 'string',
      rejectUnauthorized: false,
      validateHttpStatus: 201,
    });
    console.log(str);
  } catch (err) {
    console.error('CAUGHT', err);
  } finally {
    await server.stop();
  }
}

run();
