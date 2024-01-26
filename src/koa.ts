import { TJWTClientPayload } from "./domains/auth/auth.interface"
import Koa, { Context } from "koa"

export type ApplicationContext = Context & {
  request: Koa.Request & {
    auth?: {
      user?: TJWTClientPayload | undefined
      isAdmin?: boolean | undefined
      jwt?: string | undefined
    }
  }
}
