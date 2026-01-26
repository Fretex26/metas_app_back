import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para Reward
 * 
 * Representa una recompensa que puede ser otorgada a usuarios.
 * Los campos opcionales pueden ser null.
 */
export class RewardResponseDto {
  @ApiProperty({
    description: 'ID único de la reward (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la recompensa',
    example: 'Recompensa del Proyecto 1',
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    description: 'Descripción opcional de la recompensa',
    example: 'Descripción opcional',
    nullable: true,
    required: false,
  })
  description: string | null;

  @ApiProperty({
    description: 'Instrucciones para reclamar la recompensa',
    example: 'Instrucciones opcionales',
    nullable: true,
    required: false,
  })
  claimInstructions: string | null;

  @ApiProperty({
    description: 'URL válida para reclamar la recompensa',
    example: 'https://ejemplo.com/reclamar',
    maxLength: 500,
    nullable: true,
    required: false,
  })
  claimLink: string | null;
}
