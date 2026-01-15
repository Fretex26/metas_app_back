import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { UserRole } from '../../../../shared/types/enums';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com',
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @ApiProperty({
    description: 'UID de Firebase Authentication',
    example: 'firebase-uid-12345',
  })
  @IsNotEmpty({ message: 'El Firebase UID es requerido' })
  @IsString({ message: 'El Firebase UID debe ser una cadena de texto' })
  firebaseUid: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    default: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser uno de: user, sponsor, admin' })
  role?: UserRole;
}
