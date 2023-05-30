import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import { isConsumeResponseType } from './lib/isConsumerResponseType';
import { createReportStream } from './lib/stream';
import { CombinedOptions } from './types/CombinedOptions';

export function reportContentLength(options: CombinedOptions, response: IncomingMessage): void {
  if (options.onContentLength) {
    const contentLengthHeader = response.headers['content-length'];
    if (typeof contentLengthHeader === 'string') {
      const contentLength = +contentLengthHeader;
      if (!isNaN(contentLength)) options.onContentLength(contentLength);
    }
  }
}

export function applyReportStream(options: CombinedOptions, response: IncomingMessage, dataStream: Readable): Readable {
  if (options.onDataChunk && isConsumeResponseType(options.responseType)) {
    const reporterStream = createReportStream(options.onDataChunk);
    dataStream.pipe(reporterStream);
    return reporterStream;
  } else {
    return response;
  }
}
