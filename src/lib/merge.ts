export function merge<T extends Record<string, unknown>>(a: T, b: T): T {
  return a ? Object.assign(a, b) : a;
}
