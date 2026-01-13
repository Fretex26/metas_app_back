import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateTaskDto } from '../application/dto/create-task.dto';
import { UpdateTaskDto } from '../application/dto/update-task.dto';
import { TaskResponseDto } from '../application/dto/task-response.dto';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { GetSprintTasksUseCase } from '../application/use-cases/get-sprint-tasks.use-case';
import { GetTaskByIdUseCase } from '../application/use-cases/get-task-by-id.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../application/use-cases/delete-task.use-case';

/**
 * Controlador REST para gestión de tasks
 * 
 * Permite crear, listar, obtener, actualizar y eliminar tasks de un sprint
 * 
 * @apiTag tasks
 */
@ApiTags('tasks')
@Controller('sprints/:sprintId/tasks')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getSprintTasksUseCase: GetSprintTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  /**
   * Obtiene todas las tasks de un sprint
   */
  @Get()
  @ApiOperation({
    summary: 'Listar tasks del sprint',
    description: 'Obtiene la lista de todas las tareas de un sprint específico',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas',
    type: [TaskResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado',
  })
  async getSprintTasks(
    @Param('sprintId') sprintId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.getSprintTasksUseCase.execute(
      sprintId,
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
      'Crea un nuevo task para un sprint. El periodo de la tarea no debe exceder el periodo del sprint.',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El periodo de la tarea excede el del sprint o las fechas son inválidas',
  })
  async createTask(
    @Param('sprintId') sprintId: string,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute(
      createTaskDto,
      sprintId,
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
    name: 'sprintId',
    description: 'ID del sprint',
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
    name: 'sprintId',
    description: 'ID del sprint',
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
    name: 'sprintId',
    description: 'ID del sprint',
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
      sprintId: task.sprintId,
      name: task.name,
      description: task.description,
      startDate: task.startDate,
      endDate: task.endDate,
      resourcesAvailable: task.resourcesAvailable,
      resourcesNeeded: task.resourcesNeeded,
      incentivePoints: task.incentivePoints,
      createdAt: task.createdAt,
    };
  }
}
