import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Length,
  Min,
} from "class-validator"
import { Transform } from "class-transformer"
import { TUserCreationData } from "../shared.interface"
import { IUser, TRole } from "../../model"

export class UserIDParamDTO implements Pick<IUser, "id"> {
  @Transform((id) => parseInt(id.value), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  @Min(1)
  id: number
}

export class UpdateUserDataDTO
  implements Pick<IUser, "email" | "username" | "password" | "role">
{
  @Length(2, 80)
  @IsOptional()
  username: string

  @Length(6, 100)
  @IsEmail()
  @IsOptional()
  email: string

  @Length(6, 24)
  @IsOptional()
  password: string

  @IsEnum(["ADMIN", "USER"] as TRole[])
  @IsOptional()
  role: TRole
}

export class CreateUserDTO implements TUserCreationData {
  @Length(2, 80)
  @IsOptional()
  username: string

  @Length(6, 100)
  @IsEmail()
  @IsOptional()
  email: string

  @Length(6, 24)
  @IsOptional()
  password: string

  @IsEnum(["ADMIN", "USER"] as TRole[])
  @IsOptional()
  role: TRole
}

export const userSchema: Record<
  keyof IUser,
  { type: string; required: boolean; example: any }
> = {
  id: { type: "number", required: true, example: 1 },
  username: { type: "string", required: true, example: "Mikalai" },
  email: { type: "string", required: true, example: "mikalailappo@yandex.by" },
  password: { type: "string", required: true, example: "%hashed password%" },
  role: { type: "enum", required: true, example: "ADMIN" },
  createdAt: { type: "timestamp", required: true, example: "123" },
  updatedAt: { type: "timestamp", required: true, example: "123" },
}
