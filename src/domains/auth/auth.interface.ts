import type { IUser, TAPIResponse } from "@repo/model"

export type TJWTUserData = {
  userId: IUser["id"]
  userRole: IUser["role"]
}
export type TToken = string
/**
 * `iat` argument is built-in by `jwt.sign`
 */
export type TJWTClientPayload = TJWTUserData & { iat: number }
export type TAuthResult = TAPIResponse<TJWTClientPayload>
export type TAuthResponse = TAPIResponse<TJWTClientPayload | TToken>
