import { Readable, Writable, pipeline, Duplex } from 'node:stream';

export function isReadableStream(val: unknown): val is Readable {
  if (val instanceof Readable) return true;
  return typeof val === 'object' && val !== null && 'pipe' in val && typeof val.pipe === 'function';
}

export function createReadableStream(data: string | Buffer | Uint8Array | Readable, chunkSize = 10000): Readable {
  if (isReadableStream(data)) {
    return data;
  }
  let start = 0;
  return new Readable({
    read() {
      if (start >= data.length) {
        this.push(null);
      } else {
        this.push(data.slice(start, start + chunkSize));
        start += chunkSize;
      }
    },
  });
}

export function collectStreamToBuffer(stream: Readable): Promise<Buffer> {
  const buffers: Buffer[] = [];
  const collectStream = new Writable({
    write(chunk, _, done) {
      buffers.push(chunk);
      done();
    },
  });
  return new Promise((resolve, reject) =>
    pipeline(stream, collectStream, (err) => (err ? reject(err) : resolve(Buffer.concat(buffers))))
  );
}

export function collectStreamToString(stream: Readable): Promise<string> {
  let output = '';
  const collectStream = new Writable({
    write(chunk, _, done) {
      output += chunk;
      done();
    },
  });
  return new Promise((resolve, reject) =>
    pipeline(stream, collectStream, (err) => (err ? reject(err) : resolve(output)))
  );
}

export function createReportStream(onDataChunk: (size: number) => unknown): Duplex {
  return new Duplex({
    write(chunk, encoding, done) {
      onDataChunk(Buffer.byteLength(chunk));
      this.push(chunk, encoding);
      done();
    },
  });
}
