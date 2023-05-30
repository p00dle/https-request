export interface Cookie {
  key: string;
  value: string;
  domain: string;
  isHttps: boolean;
  allowSubDomains: boolean;
  path: string;
  expires: number | null;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  isValid: boolean;
}
