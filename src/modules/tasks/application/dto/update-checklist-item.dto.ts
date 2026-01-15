import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar un checklist item
 */
export class UpdateChecklistItemDto {
  @ApiPropertyOptional({
    description: 'Descripción del checklist item',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Indica si el item es requerido',
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el item está marcado como completado',
  })
  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;
}
