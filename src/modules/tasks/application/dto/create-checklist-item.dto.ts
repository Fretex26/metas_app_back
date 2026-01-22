import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO para crear un checklist item
 */
export class CreateChecklistItemDto {
  @ApiProperty({
    description: 'Descripción del checklist item',
    example: 'Revisar código',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Indica si el item es requerido',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el item está marcado como completado',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;
}
