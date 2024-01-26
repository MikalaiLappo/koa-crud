import Koa from "koa"
import bodyParser from "koa-bodyparser"
import { router } from "./domains/router"
import "reflect-metadata"
import PGClient from "./modules/db/PGClient"
import { authMiddleware } from "./domains/auth/auth.middleware"
const app = new Koa()

async function run() {
  await PGClient.connect()

  app.use(bodyParser())
  app.use(authMiddleware)
  app.use(router.routes()).use(router.allowedMethods())

  app.listen(3005, () => {
    console.log("server running on port: 3005")
  })
}

run()
