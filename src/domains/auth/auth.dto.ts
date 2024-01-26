import { Length, IsEmail, IsJWT, IsEnum } from "class-validator"
import { TUserCreationData } from "../shared.interface"
import { TRole } from "../../model"

export class UserSignUpDTO implements TUserCreationData {
  @Length(2, 80)
  username: string

  @Length(6, 100)
  @IsEmail()
  email: string

  @Length(6, 24)
  password: string

  @IsEnum(["ADMIN", "USER"] as TRole[])
  role: TRole
}

export class UserSignInDTO {
  @Length(2, 80)
  usernameOrEmail: string

  @Length(6, 24)
  password: string
}

export class TokenVerifyDTO {
  @IsJWT()
  token: string
}
