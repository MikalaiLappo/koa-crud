import { ApplicationContext } from "../../koa"
import AuthService from "./auth.service"
import Koa from "koa"

const authMiddleware = async (ctx: ApplicationContext, next: Koa.Next) => {
  const authHeader = ctx.headers.authorization
  if (!authHeader) return next()
  const token = authHeader.split(" ").at(-1)
  const authResult = await AuthService.verifyToken(token)
  if (authResult.status !== "OK") {
    ctx.status = 401
    ctx.body = authResult
    return
  }
  ctx.request.auth = {
    user: authResult.payload,
    jwt: token,
    isAdmin: authResult.payload.userRole === "ADMIN",
  }
  await next()
}

export { authMiddleware }
