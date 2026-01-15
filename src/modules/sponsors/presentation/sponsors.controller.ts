import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateSponsorDto } from '../application/dto/create-sponsor.dto';
import { UpdateSponsorDto } from '../application/dto/update-sponsor.dto';
import { SponsorResponseDto } from '../application/dto/sponsor-response.dto';
import { CreateSponsorUseCase } from '../application/use-cases/create-sponsor.use-case';
import { GetSponsorProfileUseCase } from '../application/use-cases/get-sponsor-profile.use-case';
import { UpdateSponsorProfileUseCase } from '../application/use-cases/update-sponsor-profile.use-case';

/**
 * Controlador REST para gestión de sponsors (perfiles de patrocinadores)
 * 
 * Permite a los usuarios solicitar ser patrocinadores y gestionar su perfil
 * 
 * @apiTag sponsors
 */
@ApiTags('sponsors')
@Controller('sponsors')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SponsorsController {
  constructor(
    private readonly createSponsorUseCase: CreateSponsorUseCase,
    private readonly getSponsorProfileUseCase: GetSponsorProfileUseCase,
    private readonly updateSponsorProfileUseCase: UpdateSponsorProfileUseCase,
  ) {}

  /**
   * Crea una nueva solicitud de patrocinador
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Solicitar ser patrocinador',
    description:
      'Crea una nueva solicitud para ser patrocinador. La solicitud quedará en estado PENDING hasta que un administrador la revise.',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud de patrocinador creada exitosamente',
    type: SponsorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una solicitud de patrocinador para este usuario',
  })
  async createSponsor(
    @Body() createSponsorDto: CreateSponsorDto,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsorResponseDto> {
    const sponsor = await this.createSponsorUseCase.execute(
      createSponsorDto,
      user.userId || user.uid,
    );
    return this.toResponseDto(sponsor);
  }

  /**
   * Obtiene el perfil de patrocinador del usuario autenticado
   */
  @Get('profile')
  @ApiOperation({
    summary: 'Obtener perfil de patrocinador',
    description:
      'Obtiene el perfil de patrocinador del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil de patrocinador encontrado',
    type: SponsorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró perfil de patrocinador para este usuario',
  })
  async getSponsorProfile(
    @CurrentUser() user: UserPayload,
  ): Promise<SponsorResponseDto> {
    const sponsor = await this.getSponsorProfileUseCase.execute(
      user.userId || user.uid,
    );
    return this.toResponseDto(sponsor);
  }

  /**
   * Actualiza el perfil de patrocinador del usuario autenticado
   */
  @Put('profile')
  @ApiOperation({
    summary: 'Actualizar perfil de patrocinador',
    description:
      'Actualiza el perfil de patrocinador. El estado se mantiene sin cambios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil de patrocinador actualizado exitosamente',
    type: SponsorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró perfil de patrocinador para este usuario',
  })
  @ApiResponse({
    status: 403,
    description: 'No puedes actualizar el perfil en el estado actual',
  })
  async updateSponsorProfile(
    @Body() updateSponsorDto: UpdateSponsorDto,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsorResponseDto> {
    const sponsor = await this.updateSponsorProfileUseCase.execute(
      user.userId || user.uid,
      updateSponsorDto,
    );
    return this.toResponseDto(sponsor);
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(sponsor: any): SponsorResponseDto {
    return {
      id: sponsor.id,
      userId: sponsor.userId,
      businessName: sponsor.businessName,
      description: sponsor.description,
      category: sponsor.category,
      logoUrl: sponsor.logoUrl,
      contactEmail: sponsor.contactEmail,
      status: sponsor.status,
      reviewedBy: sponsor.reviewedBy,
      reviewedAt: sponsor.reviewedAt,
      rejectionReason: sponsor.rejectionReason,
      createdAt: sponsor.createdAt,
    };
  }
}
