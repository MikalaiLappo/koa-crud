import { TRole } from "./role"

export interface IUser {
  id: number
  username: string
  email: string
  password: string
  role: TRole
  createdAt: number
  updatedAt: number
}
