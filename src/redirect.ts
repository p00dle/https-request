import type { IncomingMessage } from 'node:http';

export function isRedirect(status?: unknown): boolean {
  return typeof status === 'number' ? status >= 300 && status < 400 : false;
}

export function isPathAbsolute(str: string): boolean {
  return /^https*:\/\//.test(str);
}

export function makeRedirectUrl(previous: URL, current: string): URL {
  return isPathAbsolute(current) ? new URL(current) : new URL(current, previous.origin);
}

export function getRedirectLocation(response: IncomingMessage): string {
  const locationHeader = response.headers.location;
  if (!locationHeader)
    throw new Error(`Redirect response (status: ${response.statusCode}) did not specify a location header`);
  return locationHeader;
}
