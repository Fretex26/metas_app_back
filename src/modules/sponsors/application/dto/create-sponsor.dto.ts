import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
} from 'class-validator';

/**
 * DTO para crear un nuevo sponsor (solicitud de patrocinador)
 */
export class CreateSponsorDto {
  @ApiProperty({
    description: 'Nombre de la empresa o negocio',
    example: 'Tech Solutions Inc.',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre de la empresa es requerido' })
  @IsString({ message: 'El nombre de la empresa debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre de la empresa no puede exceder 255 caracteres' })
  businessName: string;

  @ApiProperty({
    description: 'Descripción de la empresa o negocio',
    example: 'Empresa especializada en soluciones tecnológicas innovadoras',
  })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description: string;

  @ApiProperty({
    description: 'Categoría de la empresa',
    example: 'Technology',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'La categoría es requerida' })
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La categoría no puede exceder 100 caracteres' })
  category: string;

  @ApiPropertyOptional({
    description: 'URL del logo de la empresa',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString({ message: 'La URL del logo debe ser una cadena de texto' })
  logoUrl?: string;

  @ApiProperty({
    description: 'Email de contacto',
    example: 'contact@techsolutions.com',
  })
  @IsNotEmpty({ message: 'El email de contacto es requerido' })
  @IsEmail({}, { message: 'El email de contacto debe ser un email válido' })
  contactEmail: string;
}
