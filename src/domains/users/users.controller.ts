import { validate } from "class-validator"
import {
  request,
  summary,
  responsesAll,
  tagsAll,
} from "koa-swagger-decorator"
import UsersService from "./users.service"
import { ApplicationContext } from "../../koa"
import { plainToInstance } from "class-transformer"
import { UserIDParamDTO, UpdateUserDataDTO, CreateUserDTO } from "./users.dto"

@responsesAll({
  200: { description: "success" },
  400: { description: "bad request" },
  401: { description: "unauthorized, missing/wrong jwt token" },
})
@tagsAll(["User"])
export default class UsersController {
  @request("get", "/users")
  @summary("Find all users")
  public static async getUsers(ctx: ApplicationContext): Promise<void> {
    const usersQueryResult = await UsersService.getUsers(
      ctx.request.auth?.isAdmin,
    )
    ctx.body = usersQueryResult
    if (usersQueryResult.status !== "OK") {
      ctx.status = 500
      return
    }
    ctx.status = 200
  }

  public static async getUser(ctx: ApplicationContext) {
    const params = plainToInstance(UserIDParamDTO, ctx.params)
    const idValidationErrors = await validate(params, {
      validationError: { target: false },
    })
    if (idValidationErrors.length > 0) {
      ctx.status = 400
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: idValidationErrors }
      return
    }

    const userQueryResult = await UsersService.getUser(
      params.id,
      ctx.request.auth?.isAdmin,
    )
    ctx.body = userQueryResult
    if (userQueryResult.status !== "OK") {
      ctx.status = userQueryResult.error === "not found" ? 404 : 500
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: userQueryResult.error }
      return
    }

    ctx.status = 200
  }

  public static async updateUser(ctx: ApplicationContext) {
    if (!ctx.request.auth) {
      ctx.status = 401
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: "unauthorized" }
      return
    }

    const userUpdateData = plainToInstance(UpdateUserDataDTO, ctx.request.body)
    const userUpdateDataValidationErrors = await validate(userUpdateData, {
      validationError: { target: false },
    })
    if (userUpdateDataValidationErrors.length !== 0) {
      ctx.status = 400
      ctx.body = { status: "GENERI_HTTP_ERROR", error: userUpdateDataValidationErrors }
      return
    }
    if (
      !userUpdateData.email &&
      !userUpdateData.role &&
      !userUpdateData.password &&
      !userUpdateData.username
    ) {
      ctx.status = 400
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: "empty update data" }
      return
    }
    const params = plainToInstance(UserIDParamDTO, ctx.params)
    const idValidationErrors = await validate(params, {
      validationError: { target: false },
    })
    if (idValidationErrors.length !== 0) {
      ctx.status = 400
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: "invalid user id" }
      return
    }

    const isOwnUpdate = params.id === ctx.request.auth?.user?.userId
    const isAdmin = ctx.request.auth?.isAdmin
    if (!isOwnUpdate && !isAdmin) {
      ctx.status = 403
      ctx.body = {
        status: "GENERIC_HTTP_ERROR",
        error: "no rights to update someone's account",
      }
      return
    }

    const updateResult = await UsersService.updateUser(
      params.id,
      userUpdateData,
      isAdmin,
    )

    ctx.body = updateResult
    if (updateResult.status === "OK") {
      ctx.status = 200
      return
    }
    ctx.status = updateResult.error === "not found" ? 404 : 500
  }

  public static async deleteUser(ctx: ApplicationContext) {
    if (!ctx.request.auth) {
      ctx.status = 401
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: "unauthorized" }
      return
    }

    const params = plainToInstance(UserIDParamDTO, ctx.params)
    const idValidationErrors = await validate(params, {
      validationError: { target: false },
    })
    if (idValidationErrors.length !== 0) {
      ctx.status = 400
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: "invalid user id" }
      return
    }

    const isOwnUpdate = params.id === ctx.request.auth?.user?.userId
    const isAdmin = ctx.request.auth?.isAdmin
    if (!isOwnUpdate && !isAdmin) {
      ctx.status = 403
      ctx.body = {
        status: "GENERIC_HTTP_ERROR",
        error: "no rights to delete someone's account",
      }
      return
    }

    const deleteResult = await UsersService.deleteUser(params.id)

    ctx.body = deleteResult
    if (deleteResult.status === "OK") {
      ctx.status = 200
      return
    }
    ctx.status = deleteResult.error === "not found" ? 404 : 500
  }

  public static async createUser(ctx: ApplicationContext) {
    if (!ctx.request.auth) {
      ctx.status = 401
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: "unauthorized" }
      return
    }

    const isAdmin = ctx.request.auth?.isAdmin
    if (!isAdmin) {
      ctx.status = 403
      ctx.body = {
        status: "GENERIC_HTTP_ERROR",
        error: "no rights to update someone's account",
      }
      return
    }

    const userCreateData = plainToInstance(CreateUserDTO, ctx.request.body)
    const userCreateDataValidationErrors = await validate(userCreateData, {
      validationError: { target: false },
    })
    if (userCreateDataValidationErrors.length !== 0) {
      ctx.status = 400
      ctx.body = { status: "GENERIC_HTTP_ERROR", error: userCreateDataValidationErrors }
      return
    }

    const createUserResult = await UsersService.createUser(userCreateData)

    ctx.body = createUserResult
    if (createUserResult.status === "OK") {
      ctx.status = 200
      return
    }
    ctx.status = createUserResult.error === "not found" ? 404 : 500
  }
}
