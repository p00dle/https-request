import type { HttpStatusCodeValidation } from './types/HttpStatusCodeValidation';

import { errors } from './errors';

export function validateResponseStatus(validation?: HttpStatusCodeValidation, statusCode?: number) {
  if (typeof validation === 'undefined') return;
  if (typeof validation === 'function') return validation(statusCode);
  if (typeof statusCode !== 'number' || Number.isNaN(statusCode)) throw new errors.ResponseInvalidStatus('Response did not provide status code');
  if (typeof validation === 'number' && !Number.isNaN(validation)) {
    if (validation !== statusCode) throw new errors.ResponseInvalidStatus(`Expected status code ${validation} but got: ${statusCode}`);
    return;
  }
  if (Array.isArray(validation) && validation.length === 2) {
    if (statusCode < validation[0] || statusCode > validation[1]) {
      throw new errors.ResponseInvalidStatus(`Expected status code to be between ${validation[0]} and ${validation[1]} but got: ${statusCode}`);
    }
    return;
  }
  throw new errors.RequestInvalidArgument('Invalid validation argument provided');
}
