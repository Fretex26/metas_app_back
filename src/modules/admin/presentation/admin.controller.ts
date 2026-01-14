import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { UserRole, SponsorStatus } from '../../../shared/types/enums';
import { RejectSponsorDto } from '../application/dto/reject-sponsor.dto';
import { SponsorListItemDto } from '../application/dto/sponsor-list-response.dto';
import { SponsorDetailResponseDto } from '../application/dto/sponsor-detail-response.dto';
import { GetPendingSponsorsUseCase } from '../application/use-cases/get-pending-sponsors.use-case';
import { ListAllSponsorsUseCase } from '../application/use-cases/list-all-sponsors.use-case';
import { GetSponsorDetailsUseCase } from '../application/use-cases/get-sponsor-details.use-case';
import { ApproveSponsorUseCase } from '../application/use-cases/approve-sponsor.use-case';
import { RejectSponsorUseCase } from '../application/use-cases/reject-sponsor.use-case';
import { DisableSponsorUseCase } from '../application/use-cases/disable-sponsor.use-case';
import { EnableSponsorUseCase } from '../application/use-cases/enable-sponsor.use-case';

/**
 * Controlador REST para gestión administrativa de patrocinadores
 * 
 * Solo accesible por usuarios con rol ADMIN
 * 
 * @apiTag admin
 */
@ApiTags('admin')
@Controller('admin/sponsors')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private readonly getPendingSponsorsUseCase: GetPendingSponsorsUseCase,
    private readonly listAllSponsorsUseCase: ListAllSponsorsUseCase,
    private readonly getSponsorDetailsUseCase: GetSponsorDetailsUseCase,
    private readonly approveSponsorUseCase: ApproveSponsorUseCase,
    private readonly rejectSponsorUseCase: RejectSponsorUseCase,
    private readonly disableSponsorUseCase: DisableSponsorUseCase,
    private readonly enableSponsorUseCase: EnableSponsorUseCase,
  ) {}

  /**
   * Obtiene la lista de sponsors pendientes de aprobación
   */
  @Get('pending')
  @ApiOperation({
    summary: 'Listar sponsors pendientes',
    description: 'Obtiene la lista de todos los sponsors que están pendientes de aprobación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sponsors pendientes',
    type: [SponsorListItemDto],
  })
  async getPendingSponsors(): Promise<SponsorListItemDto[]> {
    const sponsors = await this.getPendingSponsorsUseCase.execute();
    return sponsors.map((sponsor) => this.toListItemDto(sponsor));
  }

  /**
   * Obtiene la lista de todos los sponsors (opcionalmente filtrados por estado)
   */
  @Get()
  @ApiOperation({
    summary: 'Listar todos los sponsors',
    description: 'Obtiene la lista de todos los sponsors, opcionalmente filtrados por estado',
  })
  @ApiQuery({
    name: 'status',
    enum: SponsorStatus,
    required: false,
    description: 'Filtrar por estado del sponsor',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sponsors',
    type: [SponsorListItemDto],
  })
  async listAllSponsors(
    @Query('status') status?: SponsorStatus,
  ): Promise<SponsorListItemDto[]> {
    const sponsors = await this.listAllSponsorsUseCase.execute(status);
    return sponsors.map((sponsor) => this.toListItemDto(sponsor));
  }

  /**
   * Obtiene los detalles de un sponsor específico
   */
  @Get(':sponsorId')
  @ApiOperation({
    summary: 'Obtener detalles de un sponsor',
    description: 'Obtiene los detalles completos de un sponsor específico',
  })
  @ApiParam({
    name: 'sponsorId',
    description: 'ID del sponsor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del sponsor',
    type: SponsorDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sponsor no encontrado',
  })
  async getSponsorDetails(
    @Param('sponsorId') sponsorId: string,
  ): Promise<SponsorDetailResponseDto> {
    const sponsor = await this.getSponsorDetailsUseCase.execute(sponsorId);
    return this.toDetailDto(sponsor);
  }

  /**
   * Aprueba un sponsor pendiente
   */
  @Post(':sponsorId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprobar sponsor',
    description: 'Aprueba un sponsor que está pendiente de aprobación',
  })
  @ApiParam({
    name: 'sponsorId',
    description: 'ID del sponsor a aprobar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sponsor aprobado exitosamente',
    type: SponsorDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El sponsor no está en estado PENDING',
  })
  @ApiResponse({
    status: 404,
    description: 'Sponsor no encontrado',
  })
  async approveSponsor(
    @Param('sponsorId') sponsorId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsorDetailResponseDto> {
    const sponsor = await this.approveSponsorUseCase.execute(
      sponsorId,
      user.userId || user.uid,
    );
    return this.toDetailDto(sponsor);
  }

  /**
   * Rechaza un sponsor pendiente
   */
  @Post(':sponsorId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rechazar sponsor',
    description: 'Rechaza un sponsor que está pendiente de aprobación',
  })
  @ApiParam({
    name: 'sponsorId',
    description: 'ID del sponsor a rechazar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sponsor rechazado exitosamente',
    type: SponsorDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El sponsor no está en estado PENDING',
  })
  @ApiResponse({
    status: 404,
    description: 'Sponsor no encontrado',
  })
  async rejectSponsor(
    @Param('sponsorId') sponsorId: string,
    @Body() rejectSponsorDto: RejectSponsorDto,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsorDetailResponseDto> {
    const sponsor = await this.rejectSponsorUseCase.execute(
      sponsorId,
      user.userId || user.uid,
      rejectSponsorDto,
    );
    return this.toDetailDto(sponsor);
  }

  /**
   * Deshabilita un sponsor aprobado
   */
  @Post(':sponsorId/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deshabilitar sponsor',
    description: 'Deshabilita un sponsor que está aprobado, bloqueando su acceso a funcionalidades',
  })
  @ApiParam({
    name: 'sponsorId',
    description: 'ID del sponsor a deshabilitar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sponsor deshabilitado exitosamente',
    type: SponsorDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El sponsor no está en estado APPROVED',
  })
  @ApiResponse({
    status: 404,
    description: 'Sponsor no encontrado',
  })
  async disableSponsor(
    @Param('sponsorId') sponsorId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsorDetailResponseDto> {
    const sponsor = await this.disableSponsorUseCase.execute(
      sponsorId,
      user.userId || user.uid,
    );
    return this.toDetailDto(sponsor);
  }

  /**
   * Habilita un sponsor deshabilitado
   */
  @Post(':sponsorId/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Habilitar sponsor',
    description: 'Habilita un sponsor que está deshabilitado, restaurando su acceso a funcionalidades',
  })
  @ApiParam({
    name: 'sponsorId',
    description: 'ID del sponsor a habilitar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sponsor habilitado exitosamente',
    type: SponsorDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El sponsor no está en estado DISABLED',
  })
  @ApiResponse({
    status: 404,
    description: 'Sponsor no encontrado',
  })
  async enableSponsor(
    @Param('sponsorId') sponsorId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsorDetailResponseDto> {
    const sponsor = await this.enableSponsorUseCase.execute(
      sponsorId,
      user.userId || user.uid,
    );
    return this.toDetailDto(sponsor);
  }

  /**
   * Convierte una entidad ORM a DTO de lista
   */
  private toListItemDto(sponsor: any): SponsorListItemDto {
    return {
      id: sponsor.id,
      userId: sponsor.userId,
      businessName: sponsor.businessName,
      description: sponsor.description,
      category: sponsor.category,
      status: sponsor.status,
      reviewedAt: sponsor.reviewedAt,
      rejectionReason: sponsor.rejectionReason,
      createdAt: sponsor.createdAt,
    };
  }

  /**
   * Convierte una entidad ORM a DTO de detalle
   */
  private toDetailDto(sponsor: any): SponsorDetailResponseDto {
    return {
      id: sponsor.id,
      userId: sponsor.userId,
      userName: sponsor.user?.name || '',
      userEmail: sponsor.user?.email || '',
      businessName: sponsor.businessName,
      description: sponsor.description,
      category: sponsor.category,
      logoUrl: sponsor.logoUrl,
      contactEmail: sponsor.contactEmail,
      status: sponsor.status,
      reviewedBy: sponsor.reviewedBy,
      reviewerName: sponsor.reviewer?.name,
      reviewedAt: sponsor.reviewedAt,
      rejectionReason: sponsor.rejectionReason,
      createdAt: sponsor.createdAt,
    };
  }
}
