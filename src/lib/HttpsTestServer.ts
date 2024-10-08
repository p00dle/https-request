import type * as http from 'node:http';
import * as https from 'node:https';
import type { Duplex } from 'node:stream';
type HttpMethod = 'GET' | 'POST';
type Unsubscribe = () => void;

const HTTPS_TEST_SERVER_CERT = `-----BEGIN CERTIFICATE-----
MIIDwzCCAqsCFAuyUqdj6qSjuYegrMQQbQOoJTNLMA0GCSqGSIb3DQEBCwUAMIGc
MQswCQYDVQQGEwJVSzEWMBQGA1UECAwNQ291bnR5IEFudHJpbTEQMA4GA1UEBwwH
QmVsZmFzdDEQMA4GA1UECgwHcHJpdmF0ZTEMMAoGA1UECwwDbi9hMSIwIAYDVQQD
DBlIVFRQUy1SRVFVRVNULVNBTVBMRS1DRVJUMR8wHQYJKoZIhvcNAQkBFhBub3RA
cmVsZXZhbnQuY29tMCAXDTIzMDEwMzE0NDgzMloYDzIwNTAwNTIwMTQ0ODMyWjCB
nDELMAkGA1UEBhMCVUsxFjAUBgNVBAgMDUNvdW50eSBBbnRyaW0xEDAOBgNVBAcM
B0JlbGZhc3QxEDAOBgNVBAoMB3ByaXZhdGUxDDAKBgNVBAsMA24vYTEiMCAGA1UE
AwwZSFRUUFMtUkVRVUVTVC1TQU1QTEUtQ0VSVDEfMB0GCSqGSIb3DQEJARYQbm90
QHJlbGV2YW50LmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKDd
1YqSHqLUx9Gjp5ksQwPCqtBUTxabmvh9AQAZuAmmd2oxgFv66Cq56wsE3fnXzaiI
WzANFVJV5et0aWJOApS3mZzdXyOwGb1otKNMwml/GYrlpR6np7JNxo/KZODsLCvV
inz1DlLaXR+Ib3W1ZFd0mnv7W8lmc5aBRINOUGNY5qJ9k/KLd2+cs1a6PUToUIQq
Zr3LhGJl/iC9qExTm1KpyQsdRVuweKdih2n/udoA5NP9VxMFz4dTGfsdLwU+u/GZ
6ObFE+Hgl9zxMDmX+lpMG/MWt4rzPYblIv6TwQY425jlxBbzombCznmkf2Gpqvqe
eILquN1XqlfFZaX68WsCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEADWaer7hVLNTR
MEIf/HWKyprHAMXNtvK9lGzvRcpnQVlFrWtSYwtkoODBH4Uni9ipRnGdF9EXPrVF
FfEtuG1Mk+DpRePsP6Zh13Qj7Rj/JM7iMcD5nuHIEhisiGavrl9fg537S1TI8r6Z
+tOVnJoYPuIp1vE/9dudR4uefjYf85ns6IlvfCgr6oLIvaDcIGpCv9lxOqHM+f26
mafCC/mE8Kdg/gpRCpolAtO+VEyc/WLjn1EV6iSFCRHSchLNDIJLUMNzVTLl1F2r
Ol6Vxj2+5EGbqr0baLrSVnTxVB+GyZ6Jgzi0+tglFcTVl/DLtsb5icPekACg+s5V
WgpeHA/crA==
-----END CERTIFICATE-----`;

const HTTPS_TEST_SERVER_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAoN3VipIeotTH0aOnmSxDA8Kq0FRPFpua+H0BABm4CaZ3ajGA
W/roKrnrCwTd+dfNqIhbMA0VUlXl63RpYk4ClLeZnN1fI7AZvWi0o0zCaX8ZiuWl
Hqensk3Gj8pk4OwsK9WKfPUOUtpdH4hvdbVkV3Sae/tbyWZzloFEg05QY1jmon2T
8ot3b5yzVro9ROhQhCpmvcuEYmX+IL2oTFObUqnJCx1FW7B4p2KHaf+52gDk0/1X
EwXPh1MZ+x0vBT678Zno5sUT4eCX3PEwOZf6Wkwb8xa3ivM9huUi/pPBBjjbmOXE
FvOiZsLOeaR/Yamq+p54guq43VeqV8VlpfrxawIDAQABAoIBAQCHOJGUrqkD9NqW
dPufvN4EHjGZdxUYCurkb6dUn0ndCsocQMoGB037BFb35zp0FpvwS9Zi+MxwbnYb
Srp/ANYYjpCYlFix1gh897PIBPDy3vzojYsTzpgfQFNlcRsFGmEy44hK628D5Dwd
EoGmrzhOb1ygVTTdgbotzDF8MmtOZgn2tJDzL2uz6Vf7WZ64a2qWr1tpzFhMTkp2
SN0MKPOeX8bIhsSNet+E473yqSMuwfrmkrtAZRhXQAf85p4yppuDwZ4+pvJi52XD
9BmjjHthGYiZf5D6kzwugauOAG1zEE/rn6YzD8saQdz50gd/PpIETTu1xNNBapFS
jzDw0a/BAoGBANGymjkjb3t1me5fEzrhBFSQbkdVPfjFnNDP/pozDVw9bdT6kmKk
utHqDv4bSPUyh3XJdTjEhfHK4ilTcjHsrbV7/udlY47MEukcne6JPKUZ8W89N70/
g7GtYYqQu51y31e8VbXE8yNOS+s0kxnyPJPMNnXZec5fd8uqPQPCbZVLAoGBAMRi
/0L/smeFa98mcMOnuPnWVCeB6IBLPeNdV8cs+4EzBkGafddOGiPIZ1L7XB6PiWls
ykY1xpOXWM1jlN99DzDzOlkFhdrS0Bwiz21RGfpCieiN/65nR5syAg8uQlXZdxDK
zvV6ibjtdNLK/GUUsCCYxCkuWlJwnNoFXSFT5CBhAoGBAIGZmKdntybeb9xa9k+V
ck+xU/bSQBLYTyre4cP7eW5gqNjQZFiC5tOFjO6Pfm/MYtvxPnlvPDlL4qsX36Pr
WxCnKctpZjaC+c0I2rLqLoj7l7PgaeqUrpfJSFeTS+Drdg2LYI2Ow5Y2dcVQIPoQ
NFBEDgSX/CgH6Mn+1ObV61QxAoGBAL7+8Pc+K0pXDnR2tFD1PAdvlWTfCTpM8yG/
VHFXpDshXsJK+Hx/bxjB/QtNf2gRfTjVH1xtTHWaSjlm0hERVcbrpyGRJ3+Ma+4R
RN8ycytbrzhHchUySQf8+Ne+y7Em0I+6TtGbnXoHJwkjdZjxJ+Jr8MuEUz++Wi4H
7W1OY53BAoGAR3DmZlIZMeAlYzdpYP3QZ+8POP12xzLPzeLPJyZuS353wdFrGvV6
V9MATeuewX2JN0nOxPZR+TwO4EoJksRQK7ZZE0UjpIciM3Rm1pnqXRmlBawT9P/3
eu3ZkZvNbKMcDBr/DKA7pEOWzErk9hdUzYJf68j0a/lJQ0XqqTM66iI=
-----END RSA PRIVATE KEY-----`;

export class HttpsTestServer {
  private serverInstance: https.Server | null = null;
  private sockets = new Set<Duplex>();
  private pathHandlers: Record<HttpMethod, Record<string, http.RequestListener>> = { GET: {}, POST: {} };
  private throwOnUnhandled: boolean;
  private throwOnDuplicateHandler: boolean;
  private port: number;
  private serverOptions: { key: string; cert: string };
  constructor({
    throwOnUnhandled = false,
    throwOnDuplicateHandler = true,
    port = 443,
    key = HTTPS_TEST_SERVER_KEY,
    cert = HTTPS_TEST_SERVER_CERT,
  }: {
    throwOnUnhandled?: boolean;
    throwOnDuplicateHandler?: boolean;
    port?: number;
    key?: string;
    cert?: string;
  } = {}) {
    this.throwOnUnhandled = throwOnUnhandled;
    this.throwOnDuplicateHandler = throwOnDuplicateHandler;
    this.port = port;
    this.serverOptions = { key, cert };
  }

  public start() {
    return new Promise<void>((resolve) => {
      if (!this.serverInstance) {
        this.serverInstance = https.createServer(this.serverOptions, this.requestListener.bind(this));
        this.serverInstance.listen(this.port, resolve);
        this.serverInstance.on('connection', (socket) => {
          this.sockets.add(socket);
        });
      } else {
        resolve();
      }
    });
  }

  public stop() {
    return new Promise<void>((resolve, reject) => {
      for (const socket of this.sockets) {
        socket.destroy();
      }
      if (this.serverInstance) {
        this.serverInstance.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public on(method: HttpMethod, path: string, handler: http.RequestListener): Unsubscribe {
    if (this.throwOnDuplicateHandler && this.pathHandlers[method][path]) {
      throw new Error(`Handler already registered for [${method}] [${path}]`);
    }
    this.pathHandlers[method][path] = handler;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.pathHandlers[method][path];
    };
  }

  private requestListener: http.RequestListener = async (req, res) => {
    const method: HttpMethod = (req.method as HttpMethod) || 'GET';
    const path = req.url || '/';
    if (this.pathHandlers[method][path]) {
      this.pathHandlers[method][path](req, res);
    } else {
      res.statusCode = 404;
      res.end('Not found');
      if (this.throwOnUnhandled) {
        await this.stop();
        throw new Error(`Unhandled: [${method}] [${path}]`);
      }
    }
  };
}
