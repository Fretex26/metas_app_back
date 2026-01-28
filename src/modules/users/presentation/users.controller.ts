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
import { SponsorStatusGuard } from '../../../shared/guards/sponsor-status.guard';
import {
  SkipSponsorStatusGuard,
  SponsorStatusExempt,
} from '../../../shared/decorators/sponsor-status.decorators';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { UserResponseDto } from '../application/dto/user-response.dto';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from '../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../application/use-cases/update-user-profile.use-case';

/**
 * Controlador REST para gestión de usuarios
 *
 * @apiTag users
 */
@ApiTags('users')
@Controller('users')
@UseGuards(FirebaseAuthGuard, SponsorStatusGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  /**
   * Crea un nuevo usuario en el sistema
   * Se llama después del registro en Firebase Authentication
   */
  @Post()
  @SkipSponsorStatusGuard()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo usuario',
    description:
      'Crea un nuevo usuario en el sistema después del registro en Firebase. El Firebase UID se obtiene del token de autenticación.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El email o Firebase UID ya está registrado',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: UserPayload,
  ): Promise<UserResponseDto> {
    // Usar el UID del token de Firebase
    createUserDto.firebaseUid = user.uid;
    if (!createUserDto.email && user.email) {
      createUserDto.email = user.email;
    }

    const userDomain = await this.createUserUseCase.execute(createUserDto);

    return this.toResponseDto(userDomain);
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  @Get('profile')
  @SponsorStatusExempt()
  @ApiOperation({
    summary: 'Obtener perfil del usuario',
    description: 'Obtiene el perfil del usuario autenticado actualmente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getProfile(@CurrentUser() user: UserPayload): Promise<UserResponseDto> {
    const userDomain = await this.getUserProfileUseCase.execute(user.uid);
    return this.toResponseDto(userDomain);
  }

  /**
   * Actualiza el perfil del usuario autenticado
   */
  @Put('profile')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario',
    description: 'Actualiza el perfil del usuario autenticado actualmente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: UserPayload,
  ): Promise<UserResponseDto> {
    const userDomain = await this.updateUserProfileUseCase.execute(
      user.uid,
      updateUserDto,
    );
    return this.toResponseDto(userDomain);
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      categories: user.categories
        ? user.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            createdAt: cat.createdAt,
          }))
        : [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
