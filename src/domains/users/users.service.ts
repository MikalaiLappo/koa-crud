import PGClient from "../../modules/db/PGClient"
import { usersQueries } from "./users.queries"
import { CreateUserDTO, UpdateUserDataDTO } from "./users.dto"
import bcrypt from "bcrypt"
import { TUsersResponse } from "./users.interface"
import { sharedQueries } from "../shared.queries"
import type { IUser } from "../../model"

export default class UsersService {
  public static async getUsers(
    isAdminRequest?: boolean | undefined,
  ): Promise<TUsersResponse<IUser[]>> {
    try {
      const selectUsersQuery = isAdminRequest
        ? usersQueries.select.usersFullDataAdmin
        : usersQueries.select.usersPublicData
      const usersSelectResult = await PGClient.query<IUser>(selectUsersQuery)
      return { status: "OK", payload: usersSelectResult.rows }
    } catch (e) {
      if (e instanceof Error)
        return { status: "SERVICE_TO_HTTP_ERROR", error: e.message }
      return {
        status: "UNKNOWN_ERROR",
        error: "[UsersService] getUsers: unknown error",
      }
    }
  }

  public static async getUser(
    id: number,
    isAdminRequest?: boolean | undefined,
  ): Promise<TUsersResponse<IUser>> {
    try {
      const selectUserQuery = isAdminRequest
        ? usersQueries.select.userFullDataAdmin(id)
        : usersQueries.select.userPublicData(id)
      const userSelectResult = await PGClient.query<IUser>(selectUserQuery)

      const user = userSelectResult.rows[0]
      if (user === undefined) {
        return { status: "SERVICE_TO_HTTP_ERROR", error: "not found" } as const
      }
      return { status: "OK", payload: user }
    } catch (e) {
      if (e instanceof Error)
        return { status: "SERVICE_TO_HTTP_ERROR", error: e.message }
      return {
        status: "UNKNOWN_ERROR",
        error: "[UsersService] getUser: unknown error",
      }
    }
  }

  /**
   * A data that a user is able to update. Supposed to be the user's own data.
   * In contrary, admin is able to update more fields, e.g., `role`
   */
  private static USER_UPDATABLE_FIELDS = new Set([
    "username",
    "email",
    "password",
  ] as (keyof IUser)[])
  public static async updateUser(
    id: number,
    userUpdateData: UpdateUserDataDTO,
    isAdminRequest?: boolean | undefined,
  ): Promise<TUsersResponse<Partial<IUser>>> {
    try {
      if (userUpdateData.password) {
        userUpdateData.password = await bcrypt.hash(userUpdateData.password, 10)
      }
      const data = isAdminRequest
        ? Object.entries(userUpdateData)
        : Object.entries(userUpdateData).filter(([key]) =>
            UsersService.USER_UPDATABLE_FIELDS.has(key as keyof IUser),
          )

      const updateResult = await PGClient.query<Partial<IUser>>(
        usersQueries.update.userData(id, data),
      )
      const user = updateResult.rows[0]
      if (!user)
        return {
          status: "SERVICE_TO_HTTP_ERROR",
          error: "not found",
        }
      return { status: "OK", payload: user }
    } catch (e) {
      if (e instanceof Error)
        return { status: "SERVICE_TO_HTTP_ERROR", error: e.message }
      return {
        status: "UNKNOWN_ERROR",
        error: "[UsersService] updateUser: unknown error",
      }
    }
  }

  /**
   * `id` match check is delegated to controller layer
   * @param id
   */
  public static async deleteUser(
    id: number,
  ): Promise<TUsersResponse<Partial<IUser>>> {
    try {
      const deleteResult = await PGClient.query<Pick<IUser, "id">>(
        usersQueries.delete.user(id),
      )
      const user = deleteResult.rows[0]
      if (!user)
        return {
          status: "SERVICE_TO_HTTP_ERROR",
          error: "not found",
        }
      return { status: "OK", payload: user }
    } catch (e) {
      if (e instanceof Error)
        return { status: "SERVICE_TO_HTTP_ERROR", error: e.message }
      return {
        status: "UNKNOWN_ERROR",
        error: "[UsersService] updateUser: unknown error",
      }
    }
  }

  public static async createUser(
    userData: CreateUserDTO,
  ): Promise<TUsersResponse<Partial<IUser>>> {
    try {
      userData.password = await bcrypt.hash(userData.password, 10)

      const createResult = await PGClient.query<IUser>(
        sharedQueries.insert.createUser([
          userData.username,
          userData.email,
          userData.password,
          userData.role,
        ]),
      )
      const user = createResult.rows[0]
      if (!user)
        return {
          status: "SERVICE_TO_HTTP_ERROR",
          error: "new user data missing?",
        }

      return { status: "OK", payload: user }
    } catch (e) {
      if (e instanceof Error)
        return { status: "SERVICE_TO_HTTP_ERROR", error: e.message }
      return {
        status: "UNKNOWN_ERROR",
        error: "[UsersService] updateUser: unknown error",
      }
    }
  }
}
