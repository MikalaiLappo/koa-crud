import {
  TAuthResponse,
  TAuthResult,
  TJWTClientPayload,
  TJWTUserData,
} from "./auth.interface"
import jwt from "jsonwebtoken"
import PGClient from "../../modules/db/PGClient"
import { UserSignInDTO, UserSignUpDTO } from "./auth.dto"
import { authQueries } from "./auth.queries"
import bcrypt from "bcrypt"
import { sharedQueries } from "../shared.queries"
import { IUser } from "../../model"

const JWT_SECRET = "secret" as const

export default class AuthService {
  private static _sign(userPayload: TJWTUserData) {
    return jwt.sign(userPayload, JWT_SECRET)
  }

  private static _hash(password: string) {
    return bcrypt.hash(password, 10)
  }

  public static async verifyToken(
    maybeJWT: string | undefined | null,
  ): Promise<TAuthResult> {
    if (typeof maybeJWT !== "string")
      return {
        status: "UNKNOWN_ERROR",
        error: "[AuthService] verifyToken: no token provided",
      }

    try {
      const rawJWTPayload = jwt.verify(
        maybeJWT,
        JWT_SECRET,
      ) as TJWTClientPayload

      const userQueryResult = await PGClient.query<Pick<IUser, "role" | "id">>(
        authQueries.select.getVerificationUser(rawJWTPayload.userId),
      )
      const user = userQueryResult.rows[0]
      if (!user) {
        return { status: "TOKEN_INVALIDATION", error: "user deleted" } as const
      }
      if (user.role !== rawJWTPayload.userRole) {
        return {
          status: "TOKEN_INVALIDATION",
          error: "user's role used to update",
        } as const
      }

      return { status: "OK", payload: rawJWTPayload }
    } catch (e) {
      if (e instanceof Error)
        return { status: "TOKEN_INVALIDATION", error: e.message }
      return {
        status: "TOKEN_INVALIDATION",
        error: "[AuthService] verifyToken: unknown error",
      }
    }
  }

  public static async signIn(
    credentials: UserSignInDTO,
  ): Promise<TAuthResponse> {
    try {
      const selectUserQueryResult = await PGClient.query<
        Pick<IUser, "id" | "username" | "role" | "password">
      >(authQueries.select.getSignInUser(credentials.usernameOrEmail))
      const user = selectUserQueryResult.rows[0]

      if (user === undefined) {
        return { status: "SERVICE_TO_HTTP_ERROR", error: "not found" } as const
      }

      const isPasswordCorrect = await bcrypt.compare(
        credentials.password,
        user.password,
      )
      if (!isPasswordCorrect) {
        return {
          status: "SERVICE_TO_HTTP_ERROR",
          error: "wrong password",
        } as const
      }

      const token = AuthService._sign({ userId: user.id, userRole: user.role })
      return { status: "OK", payload: token }
    } catch (e) {
      if (e instanceof Error)
        return { status: "SERVICE_TO_HTTP_ERROR", error: e.message }
      return {
        status: "UNKNOWN_ERROR",
        error: "[AuthService] signIn: unknown error",
      }
    }
  }

  public static async signUp(userData: UserSignUpDTO): Promise<TAuthResponse> {
    try {
      userData.password = await AuthService._hash(userData.password)
      const insertUserQueryResult = await PGClient.query<IUser>(
        sharedQueries.insert.createUser([
          userData.username,
          userData.email,
          userData.password,
          userData.role,
        ]),
      )

      const newUser = insertUserQueryResult.rows[0]
      if (newUser === undefined) {
        return {
          status: "UNKNOWN_ERROR",
          error: "[AuthService] signUp: new user INSERT query error?",
        }
      }

      const token = AuthService._sign({
        userId: newUser.id,
        userRole: newUser.role,
      })
      return { status: "OK", payload: token }
    } catch (e) {
      if (e instanceof Error)
        return { status: "SERVICE_TO_HTTP_ERROR", error: e.message }
      return {
        status: "UNKNOWN_ERROR",
        error: "[AuthService] signUp: unknown error",
      }
    }
  }
}
