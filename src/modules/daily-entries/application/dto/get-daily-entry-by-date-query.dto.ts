import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Query params para obtener daily entry por fecha.
 * sprintId es obligatorio: cada daily entry pertenece a un sprint y la API
 * filtra por sprint para devolver la entrada del sprint correcto.
 */
export class GetDailyEntryByDateQueryDto {
  @ApiProperty({
    description:
      'ID del sprint. Obligatorio para filtrar la entrada diaria del sprint actual.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'sprintId es obligatorio' })
  @IsUUID('4', { message: 'sprintId debe ser un UUID válido' })
  sprintId: string;
}
