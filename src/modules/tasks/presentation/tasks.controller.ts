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
import { SponsorStatusGuard } from '../../../shared/guards/sponsor-status.guard';
import { LoadUserInterceptor } from '../../../shared/interceptors/load-user.interceptor';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateTaskDto } from '../application/dto/create-task.dto';
import { UpdateTaskDto } from '../application/dto/update-task.dto';
import { TaskResponseDto } from '../application/dto/task-response.dto';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { GetMilestoneTasksUseCase } from '../application/use-cases/get-milestone-tasks.use-case';
import { GetTaskByIdUseCase } from '../application/use-cases/get-task-by-id.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../application/use-cases/delete-task.use-case';

/**
 * Controlador REST para gestión de tasks
 * 
 * Permite crear, listar, obtener, actualizar y eliminar tasks
 * Las tasks siempre pertenecen a un milestone y opcionalmente a un sprint
 * 
 * @apiTag tasks
 */
@ApiTags('tasks')
@Controller('milestone/:milestoneId/task')
@UseGuards(FirebaseAuthGuard, SponsorStatusGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getMilestoneTasksUseCase: GetMilestoneTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  /**
   * Obtiene todas las tasks de un milestone
   */
  @Get()
  @ApiOperation({
    summary: 'Listar tasks del milestone',
    description: 'Obtiene la lista de todas las tareas de un milestone específico',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas',
    type: [TaskResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Milestone no encontrado',
  })
  async getMilestoneTasks(
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.getMilestoneTasksUseCase.execute(
      milestoneId,
      user.userId || user.uid,
    );
    return tasks.map((task) => this.toResponseDto(task));
  }

  /**
   * Crea un nuevo task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear task',
    description:
      'Crea un nuevo task para un milestone. El sprintId es opcional. Si se proporciona, el periodo de la tarea no debe exceder el periodo del sprint.',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Milestone o Sprint no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El periodo de la tarea excede el del sprint, el sprint no pertenece al milestone, o las fechas son inválidas',
  })
  async createTask(
    @Param('milestoneId') milestoneId: string,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto> {
    // Asegurar que el milestoneId en el DTO coincida con el parámetro de la ruta
    const taskDtoWithMilestone = { ...createTaskDto, milestoneId };
    const task = await this.createTaskUseCase.execute(
      taskDtoWithMilestone,
      user.userId || user.uid,
    );
    return this.toResponseDto(task);
  }

  /**
   * Obtiene un task específico por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener task por ID',
    description: 'Obtiene los detalles de un task específico',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la tarea',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a esta tarea',
  })
  async getTask(
    @Param('id') taskId: string,
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto> {
    const task = await this.getTaskByIdUseCase.execute(
      taskId,
      user.userId || user.uid,
    );
    return this.toResponseDto(task);
  }

  /**
   * Actualiza un task existente
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar task',
    description: 'Actualiza los datos de un task existente',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar esta tarea',
  })
  async updateTask(
    @Param('id') taskId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto> {
    const task = await this.updateTaskUseCase.execute(
      taskId,
      user.userId || user.uid,
      updateTaskDto,
    );
    return this.toResponseDto(task);
  }

  /**
   * Elimina un task
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar task',
    description: 'Elimina un task existente',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea',
  })
  @ApiResponse({
    status: 204,
    description: 'Tarea eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar esta tarea',
  })
  async deleteTask(
    @Param('id') taskId: string,
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    await this.deleteTaskUseCase.execute(taskId, user.userId || user.uid);
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(task: any): TaskResponseDto {
    return {
      id: task.id,
      milestoneId: task.milestoneId,
      sprintId: task.sprintId,
      name: task.name,
      description: task.description,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      resourcesAvailable: task.resourcesAvailable,
      resourcesNeeded: task.resourcesNeeded,
      incentivePoints: task.incentivePoints,
      createdAt: task.createdAt,
    };
  }
}
