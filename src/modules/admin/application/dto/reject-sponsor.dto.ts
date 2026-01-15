import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para rechazar un sponsor
 */
export class RejectSponsorDto {
  @ApiPropertyOptional({
    description: 'Razón del rechazo',
    example: 'Documentación incompleta',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La razón de rechazo debe ser una cadena de texto' })
  @MaxLength(500, {
    message: 'La razón de rechazo no puede exceder 500 caracteres',
  })
  rejectionReason?: string;
}
