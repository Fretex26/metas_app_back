import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../shared/types/enums';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Sponsor en la respuesta de auth/me (solo si user.role === 'sponsor' y existe perfil).
 */
export class AuthMeSponsorDto {
  @ApiProperty({ description: 'ID del sponsor', example: 'uuid' })
  id: string;

  @ApiProperty({
    description: 'Estado del sponsor',
    enum: SponsorStatus,
    example: SponsorStatus.PENDING,
  })
  status: SponsorStatus;

  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Tech Solutions Inc.',
  })
  businessName: string;
}

/**
 * Usuario en la respuesta de auth/me.
 */
export class AuthMeUserDto {
  @ApiProperty({ description: 'ID del usuario', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Nombre', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ description: 'Email', example: 'juan@example.com' })
  email: string;

  @ApiProperty({
    description: 'Rol',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;
}

/**
 * Respuesta de GET /auth/me.
 * Incluye user y, si es sponsor, su perfil con status para decidir redirección en frontend.
 */
export class AuthMeResponseDto {
  @ApiProperty({ type: AuthMeUserDto, description: 'Usuario autenticado' })
  user: AuthMeUserDto;

  @ApiPropertyOptional({
    type: AuthMeSponsorDto,
    nullable: true,
    description: 'Perfil sponsor (solo si role === sponsor y existe)',
  })
  sponsor?: AuthMeSponsorDto | null;
}
