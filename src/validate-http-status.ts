import { IncomingMessage } from 'http';
import { CombinedOptions } from './types/CombinedOptions';

export function validateHttpStatus(options: CombinedOptions, response: IncomingMessage): void {
  if (!options.validateHttpStatus) return;
  if (!response.statusCode) throw new Error(`Response does not contain status code`);
  if (typeof options.validateHttpStatus === 'number') {
    if (options.validateHttpStatus !== response.statusCode) {
      throw new Error(
        `Response status code ${response.statusCode} not matching expected code ${options.validateHttpStatus}`
      );
    }
  } else {
    if (!options.validateHttpStatus(response.statusCode)) {
      throw new Error(`Response status code ${response.statusCode} does not match expected code`);
    }
  }
}
