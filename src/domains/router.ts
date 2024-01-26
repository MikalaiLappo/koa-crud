import Router from "@koa/router"
import UsersController from "./users/users.controller"
import AuthController from "./auth/auth.controller"
import SecretController from "./secret/secret.controller"

const router = new Router()

router.get("/users/:id", UsersController.getUser)
router.get("/users", UsersController.getUsers)
router.post("/users", UsersController.createUser)
router.patch("/users/:id", UsersController.updateUser)
router.delete("/users/:id", UsersController.deleteUser)

router.post("/sign-up", AuthController.signUp)
router.post("/sign-in", AuthController.signIn)

router.post("/verify", AuthController.verify)


router.get("/secret", SecretController.accessSecret)

export { router }
