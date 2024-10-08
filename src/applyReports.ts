import type { IncomingMessage } from 'node:http';
import type { Readable } from 'node:stream';
import { createReporterStream } from 'std-util';
import type { RequestBodyType } from './types/RequestBodyType';
import type { RequestParams } from './types/RequestParams';

export function applyReports(
  dataStream: Readable,
  contentLengthHeader?: string | number,
  onContentLength?: (n: number) => void,
  onDataChunk?: (n: number) => void,
): Readable {
  if (onContentLength) {
    if (typeof contentLengthHeader !== 'undefined') {
      const contentLength = +contentLengthHeader;
      if (!Number.isNaN(contentLength) && contentLength >= 0) onContentLength(contentLength);
    }
  }
  if (onDataChunk) {
    const reporterStream = createReporterStream(onDataChunk);
    dataStream.pipe(reporterStream);
    return reporterStream;
  }
  return dataStream;
}
