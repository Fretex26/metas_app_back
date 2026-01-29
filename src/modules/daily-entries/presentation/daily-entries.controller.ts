import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
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
import { SponsorStatusGuard } from '../../../shared/guards/sponsor-status.guard';
import { LoadUserInterceptor } from '../../../shared/interceptors/load-user.interceptor';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateDailyEntryDto } from '../application/dto/create-daily-entry.dto';
import { GetDailyEntryByDateQueryDto } from '../application/dto/get-daily-entry-by-date-query.dto';
import { DailyEntryResponseDto } from '../application/dto/daily-entry-response.dto';
import { CreateDailyEntryUseCase } from '../application/use-cases/create-daily-entry.use-case';
import { GetUserDailyEntriesUseCase } from '../application/use-cases/get-user-daily-entries.use-case';
import { GetDailyEntryByDateUseCase } from '../application/use-cases/get-daily-entry-by-date.use-case';

/**
 * Controlador REST para gestión de daily entries
 *
 * Permite crear y consultar entradas diarias del usuario
 *
 * @apiTag daily-entries
 */
@ApiTags('daily-entries')
@Controller('daily-entries')
@UseGuards(FirebaseAuthGuard, SponsorStatusGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class DailyEntriesController {
  constructor(
    private readonly createDailyEntryUseCase: CreateDailyEntryUseCase,
    private readonly getUserDailyEntriesUseCase: GetUserDailyEntriesUseCase,
    private readonly getDailyEntryByDateUseCase: GetDailyEntryByDateUseCase,
  ) {}

  /**
   * Crea un nuevo daily entry
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear entrada diaria',
    description:
      'Crea una nueva entrada diaria para el usuario en el sprint indicado. sprintId es obligatorio: cada daily entry pertenece a un sprint. Solo se permite una entrada por usuario por día por sprint.',
  })
  @ApiResponse({
    status: 201,
    description: 'Entrada diaria creada exitosamente',
    type: DailyEntryResponseDto,
  })
  async createDailyEntry(
    @Body() createDailyEntryDto: CreateDailyEntryDto,
    @CurrentUser() user: UserPayload,
  ): Promise<DailyEntryResponseDto> {
    const dailyEntry = await this.createDailyEntryUseCase.execute(
      createDailyEntryDto,
      user.userId || user.uid,
    );
    return this.toResponseDto(dailyEntry);
  }

  /**
   * Obtiene todas las entradas diarias del usuario autenticado
   */
  @Get()
  @ApiOperation({
    summary: 'Listar entradas diarias del usuario',
    description:
      'Obtiene la lista de todas las entradas diarias del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de entradas diarias',
    type: [DailyEntryResponseDto],
  })
  async getUserDailyEntries(
    @CurrentUser() user: UserPayload,
  ): Promise<DailyEntryResponseDto[]> {
    const dailyEntries = await this.getUserDailyEntriesUseCase.execute(
      user.userId || user.uid,
    );
    return dailyEntries.map((entry) => this.toResponseDto(entry));
  }

  /**
   * Obtiene una entrada diaria por fecha y sprint.
   * sprintId es obligatorio: cada daily entry pertenece a un sprint; sin filtrar por sprint
   * se podría devolver la entrada de otro sprint (p. ej. en la página de detalle del sprint).
   */
  @Get('date/:date')
  @ApiOperation({
    summary: 'Obtener entrada diaria por fecha y sprint',
    description:
      'Obtiene la entrada diaria del usuario para una fecha y un sprint. Requiere query param sprintId. Devuelve 404 si no existe entrada para esa fecha en ese sprint.',
  })
  @ApiParam({
    name: 'date',
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'sprintId',
    description: 'ID del sprint. Obligatorio. La entrada diaria pertenece a un sprint.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Entrada diaria encontrada',
    type: DailyEntryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'sprintId ausente o no válido',
  })
  @ApiResponse({
    status: 404,
    description:
      'No se encontró entrada diaria para esa fecha en el sprint indicado',
  })
  async getDailyEntryByDate(
    @Param('date') date: string,
    @Query() query: GetDailyEntryByDateQueryDto,
    @CurrentUser() user: UserPayload,
  ): Promise<DailyEntryResponseDto> {
    const dateObj = new Date(date);
    const dailyEntry = await this.getDailyEntryByDateUseCase.execute(
      user.userId || user.uid,
      dateObj,
      query.sprintId,
    );
    return this.toResponseDto(dailyEntry);
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(dailyEntry: any): DailyEntryResponseDto {
    return {
      id: dailyEntry.id,
      userId: dailyEntry.userId,
      taskId: dailyEntry.taskId,
      sprintId: dailyEntry.sprintId,
      notesYesterday: dailyEntry.notesYesterday,
      notesToday: dailyEntry.notesToday,
      difficulty: dailyEntry.difficulty,
      energyChange: dailyEntry.energyChange,
      createdAt: dailyEntry.createdAt,
    };
  }
}
