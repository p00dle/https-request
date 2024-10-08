import { errors } from '../errors';

export function normalizeUrl(url: unknown): URL {
  if (url instanceof URL) return url;
  try {
    return new URL(url as string);
  } catch {
    throw new errors.RequestInvalidURL(`Invalid URL: ${url}`);
  }
}
