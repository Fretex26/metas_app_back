import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para actualizar un milestone existente
 */
export class UpdateMilestoneDto {
  @ApiPropertyOptional({
    description: 'Nombre del milestone',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción del milestone' })
  @IsOptional()
  @IsString()
  description?: string;
}
