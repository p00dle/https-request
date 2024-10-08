import * as fs from 'node:fs/promises';

await fs.rm('./dist/cjs/types', { recursive: true, force: true });
await fs.rm('./dist/esm/types', { recursive: true, force: true });
await fs.writeFile('./dist/cjs/package.json', '{"type": "commonjs"}', {
  encoding: 'utf8',
});
