import { ApplicationContext } from "../../koa";

export default class SecretController {
  public static async accessSecret(ctx: ApplicationContext) {
    if (ctx.request.auth?.user?.userRole !== "ADMIN") {
      ctx.status = 403
      return 
    }
    ctx.status = 200
  }
}
