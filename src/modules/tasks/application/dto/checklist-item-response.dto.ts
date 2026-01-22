import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para ChecklistItem
 */
export class ChecklistItemResponseDto {
  @ApiProperty({
    description: 'ID del checklist item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID de la tarea',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  taskId: string | null;

  @ApiProperty({
    description: 'Descripción del checklist item',
    example: 'Revisar código',
  })
  description: string;

  @ApiProperty({
    description: 'Indica si el item es requerido',
    example: true,
  })
  isRequired: boolean;

  @ApiProperty({
    description: 'Indica si el item está marcado como completado',
    example: false,
  })
  isChecked: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
