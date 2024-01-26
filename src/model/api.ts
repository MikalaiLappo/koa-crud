export type TAPIOkStatuses = "OK"
export type TAPIErrorStatuses =
  | "SERVICE_TO_HTTP_ERROR"
  | "UNKNOWN_ERROR"
  | "TOKEN_INVALIDATION"
  | "GENERIC_HTTP_ERROR"

export type TAPIResponse<T> =
  | {
      status: TAPIOkStatuses
      payload: T
    }
  | {
      status: TAPIErrorStatuses
      error: string
    }
