import AuthService from "./auth.service"
import { validate } from "class-validator"
import { TokenVerifyDTO, UserSignInDTO, UserSignUpDTO } from "./auth.dto"
import { request, summary } from "koa-swagger-decorator"
import { plainToInstance } from "class-transformer"
import { ApplicationContext } from "../../koa"

export default class AuthController {
  public static async signIn(ctx: ApplicationContext): Promise<void> {
    const requestSignInPayload = plainToInstance(
      UserSignInDTO,
      ctx.request.body,
    )
    const validationResult = await validate(requestSignInPayload, {
      validationError: { target: false },
    })
    if (validationResult.length > 0) {
      ctx.status = 400
      return
    }

    const signInResult = await AuthService.signIn(requestSignInPayload)
    if (signInResult.status !== "OK") {
      ctx.status = signInResult.error === "not found" ? 404 : 400
      ctx.body = signInResult
      return
    }

    ctx.body = signInResult
    ctx.status = 200
  }

  @request("POST", "/sign-up")
  @summary("Create a user and get a token")
  public static async signUp(ctx: ApplicationContext) {
    const requestSignUpPayload = plainToInstance(
      UserSignUpDTO,
      ctx.request.body,
    )
    const validationResult = await validate(requestSignUpPayload, {
      validationError: { target: false },
    })

    if (validationResult.length !== 0) {
      ctx.status = 400
      ctx.body = { success: false, error: validationResult }
      return
    }

    const jwtResult = await AuthService.signUp(requestSignUpPayload)
    ctx.status = 200
    ctx.body = { success: true, token: jwtResult }
  }

  public static async verify(ctx: ApplicationContext) {
    const requestVerifyPayload = plainToInstance(
      TokenVerifyDTO,
      ctx.request.body,
    )
    const validationResult = await validate(requestVerifyPayload, {
      validationError: { target: false },
    })

    if (validationResult.length !== 0) {
      ctx.status = 400
      ctx.body = { success: true, error: validationResult }
      return
    }

    const jwtVerificationResult = await AuthService.verifyToken(
      requestVerifyPayload.token,
    )
    if (jwtVerificationResult.status !== "OK") {
      ctx.status = 400
      ctx.body = jwtVerificationResult
      return
    }

    ctx.status = 200
    ctx.body = { success: true, payload: jwtVerificationResult.payload }
  }
}
