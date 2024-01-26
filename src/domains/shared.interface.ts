import { IUser } from "@repo/model"

export type TUserCreationData = Pick<
  IUser,
  "email" | "username" | "password" | "role"
>
