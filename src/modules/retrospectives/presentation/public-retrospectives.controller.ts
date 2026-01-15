import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { RetrospectiveResponseDto } from '../application/dto/retrospective-response.dto';
import { GetPublicRetrospectivesUseCase } from '../application/use-cases/get-public-retrospectives.use-case';

/**
 * Controlador REST para retrospectivas públicas
 * 
 * Permite obtener retrospectivas públicas sin necesidad de ser el dueño
 * 
 * @apiTag retrospectives
 */
@ApiTags('retrospectives')
@Controller('retrospectives/public')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PublicRetrospectivesController {
  constructor(
    private readonly getPublicRetrospectivesUseCase: GetPublicRetrospectivesUseCase,
  ) {}

  /**
   * Obtiene todas las retrospectivas públicas
   */
  @Get()
  @ApiOperation({
    summary: 'Listar retrospectivas públicas',
    description:
      'Obtiene la lista de todas las retrospectivas públicas disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de retrospectivas públicas',
    type: [RetrospectiveResponseDto],
  })
  async getPublicRetrospectives(): Promise<RetrospectiveResponseDto[]> {
    const retrospectives =
      await this.getPublicRetrospectivesUseCase.execute();
    return retrospectives.map((retrospective) =>
      this.toResponseDto(retrospective),
    );
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(retrospective: any): RetrospectiveResponseDto {
    return {
      id: retrospective.id,
      sprintId: retrospective.sprintId,
      userId: retrospective.userId,
      whatWentWell: retrospective.whatWentWell,
      whatWentWrong: retrospective.whatWentWrong,
      improvements: retrospective.improvements,
      isPublic: retrospective.isPublic,
      createdAt: retrospective.createdAt,
    };
  }
}
