import type { request } from 'node:https';

// TODO: pick only relevant parts of the request type to make it easier to stub
export type NodeRequest = typeof request;
