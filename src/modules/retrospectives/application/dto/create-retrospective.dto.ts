import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO para crear un nuevo retrospective
 */
export class CreateRetrospectiveDto {
  @ApiProperty({
    description: 'Lo que salió bien durante el sprint',
    example:
      'Completamos todas las tareas planificadas y la comunicación fue excelente',
  })
  @IsNotEmpty({ message: 'El campo "lo que salió bien" es requerido' })
  @IsString({
    message: 'El campo "lo que salió bien" debe ser una cadena de texto',
  })
  whatWentWell: string;

  @ApiProperty({
    description: 'Lo que salió mal durante el sprint',
    example: 'Tuvimos algunos problemas con la integración de APIs externas',
  })
  @IsNotEmpty({ message: 'El campo "lo que salió mal" es requerido' })
  @IsString({
    message: 'El campo "lo que salió mal" debe ser una cadena de texto',
  })
  whatWentWrong: string;

  @ApiPropertyOptional({
    description: 'Mejoras propuestas para futuros sprints',
    example: 'Mejorar la comunicación diaria y asignar más tiempo para pruebas',
  })
  @IsOptional()
  @IsString({ message: 'Las mejoras deben ser una cadena de texto' })
  improvements?: string;

  @ApiPropertyOptional({
    description:
      'Indica si la retrospectiva es pública (visible para otros usuarios)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo isPublic debe ser un valor booleano' })
  isPublic?: boolean;
}
