class HttpRequestError extends Error {}
class ResponseInvalidStatus extends HttpRequestError {}
class RequestInvalidArgument extends HttpRequestError {}
class ResponseInvalidCompression extends HttpRequestError {}
class RequestInvalidURL extends HttpRequestError {}
class ResponseRedirectCountExceeded extends HttpRequestError {}
class ResponseInvalidRedirect extends HttpRequestError {}
class ResponseInvalidReferrerPolicy extends HttpRequestError {}
class RequestInvalidHeader extends HttpRequestError {}
class ResponseInvalidJson extends HttpRequestError {}

export const errors = {
  HttpRequestError,
  ResponseInvalidStatus,
  RequestInvalidArgument,
  ResponseInvalidCompression,
  RequestInvalidURL,
  ResponseRedirectCountExceeded,
  ResponseInvalidRedirect,
  ResponseInvalidReferrerPolicy,
  RequestInvalidHeader,
  ResponseInvalidJson,
};
