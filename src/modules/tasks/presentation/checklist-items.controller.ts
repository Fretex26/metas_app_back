import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { LoadUserInterceptor } from '../../../shared/interceptors/load-user.interceptor';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateChecklistItemDto } from '../application/dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from '../application/dto/update-checklist-item.dto';
import { ChecklistItemResponseDto } from '../application/dto/checklist-item-response.dto';
import { CreateChecklistItemUseCase } from '../application/use-cases/create-checklist-item.use-case';
import { GetChecklistItemByIdUseCase } from '../application/use-cases/get-checklist-item-by-id.use-case';
import { GetChecklistItemsByTaskIdUseCase } from '../application/use-cases/get-checklist-items-by-task-id.use-case';
import { UpdateChecklistItemUseCase } from '../application/use-cases/update-checklist-item.use-case';
import { DeleteChecklistItemUseCase } from '../application/use-cases/delete-checklist-item.use-case';

/**
 * Controlador REST para gestión de checklist items
 * 
 * Permite crear, listar, obtener, actualizar y eliminar checklist items de una task
 * 
 * @apiTag checklist-items
 */
@ApiTags('checklist-items')
@Controller('tasks/:taskId/checklist-items')
@UseGuards(FirebaseAuthGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class ChecklistItemsController {
  constructor(
    private readonly createChecklistItemUseCase: CreateChecklistItemUseCase,
    private readonly getChecklistItemByIdUseCase: GetChecklistItemByIdUseCase,
    private readonly getChecklistItemsByTaskIdUseCase: GetChecklistItemsByTaskIdUseCase,
    private readonly updateChecklistItemUseCase: UpdateChecklistItemUseCase,
    private readonly deleteChecklistItemUseCase: DeleteChecklistItemUseCase,
  ) {}

  /**
   * Obtiene todos los checklist items de una task
   */
  @Get()
  @ApiOperation({
    summary: 'Listar checklist items de una task',
    description: 'Obtiene la lista de todos los checklist items de una task específica',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID de la tarea',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de checklist items',
    type: [ChecklistItemResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a esta tarea',
  })
  async getChecklistItems(
    @Param('taskId') taskId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<ChecklistItemResponseDto[]> {
    const checklistItems = await this.getChecklistItemsByTaskIdUseCase.execute(
      taskId,
      user.userId || user.uid,
    );
    return checklistItems.map((item) => this.toResponseDto(item));
  }

  /**
   * Crea un nuevo checklist item
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear checklist item',
    description: 'Crea un nuevo checklist item para una task',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID de la tarea',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Checklist item creado exitosamente',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para crear checklist items en esta tarea',
  })
  async createChecklistItem(
    @Param('taskId') taskId: string,
    @Body() createChecklistItemDto: CreateChecklistItemDto,
    @CurrentUser() user: UserPayload,
  ): Promise<ChecklistItemResponseDto> {
    const checklistItem = await this.createChecklistItemUseCase.execute(
      taskId,
      user.userId || user.uid,
      createChecklistItemDto,
    );
    return this.toResponseDto(checklistItem);
  }

  /**
   * Obtiene un checklist item específico por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener checklist item por ID',
    description: 'Obtiene los detalles de un checklist item específico',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID de la tarea',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del checklist item',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del checklist item',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist item no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a este checklist item',
  })
  async getChecklistItem(
    @Param('id') checklistItemId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<ChecklistItemResponseDto> {
    const checklistItem = await this.getChecklistItemByIdUseCase.execute(
      checklistItemId,
      user.userId || user.uid,
    );
    return this.toResponseDto(checklistItem);
  }

  /**
   * Actualiza un checklist item existente
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar checklist item',
    description: 'Actualiza los datos de un checklist item existente',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID de la tarea',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del checklist item',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist item actualizado exitosamente',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist item no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar este checklist item',
  })
  async updateChecklistItem(
    @Param('id') checklistItemId: string,
    @Param('taskId') taskId: string,
    @Body() updateChecklistItemDto: UpdateChecklistItemDto,
    @CurrentUser() user: UserPayload,
  ): Promise<ChecklistItemResponseDto> {
    const checklistItem = await this.updateChecklistItemUseCase.execute(
      checklistItemId,
      user.userId || user.uid,
      updateChecklistItemDto,
    );
    return this.toResponseDto(checklistItem);
  }

  /**
   * Elimina un checklist item
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar checklist item',
    description: 'Elimina un checklist item existente',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID de la tarea',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del checklist item',
  })
  @ApiResponse({
    status: 204,
    description: 'Checklist item eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist item no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar este checklist item',
  })
  async deleteChecklistItem(
    @Param('id') checklistItemId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    await this.deleteChecklistItemUseCase.execute(
      checklistItemId,
      user.userId || user.uid,
    );
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(checklistItem: any): ChecklistItemResponseDto {
    return {
      id: checklistItem.id,
      taskId: checklistItem.taskId,
      description: checklistItem.description,
      isRequired: checklistItem.isRequired,
      isChecked: checklistItem.isChecked,
      createdAt: checklistItem.createdAt,
    };
  }
}
