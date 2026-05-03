/** Point d’entrée pratique pour les imports "@shared" */
export * from "./errors";
export * from "./types/Result";
export { logger } from "./utils/logger";
export { getUnknownErrorMessage } from "./utils/unknownError";
export {
  mapUnknownToAppError,
  runAsync,
  runSync,
} from "./utils/serviceResult";
export {
  jsonFromAppError,
  jsonFromUnknownError,
  withRouteHandler,
  type ApiErrorBody,
} from "./http/routeErrors";
export { zodToValidationError } from "./validation/zodToValidationError";
export { parseJsonBody } from "./http/parseJsonBody";
export { fetchWithTimeout } from "./http/fetchWithTimeout";
export { userFacingErrorMessage } from "./utils/userFacingError";
export { toastAppError, toastIfFailed } from "./utils/toastResult";
export {
  useServiceQuery,
  type ServiceQueryState,
} from "./hooks/useServiceQuery";
