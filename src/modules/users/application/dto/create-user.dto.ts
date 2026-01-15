import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'IDs de las categorías de interés del usuario',
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las categorías deben ser un array' })
  @IsUUID('4', { each: true, message: 'Cada ID de categoría debe ser un UUID válido' })
  categoryIds?: string[];
}
