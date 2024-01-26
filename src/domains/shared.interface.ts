import { IUser } from "../model";

export type TUserCreationData = Pick<
  IUser,
  "email" | "username" | "password" | "role"
>
