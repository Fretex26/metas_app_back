import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';
import { CreateSponsoredGoalDto } from '../dto/create-sponsored-goal.dto';
import { SponsorStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo sponsored goal
 */
@Injectable()
export class CreateSponsoredGoalUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(
    createSponsoredGoalDto: CreateSponsoredGoalDto,
    userId: string,
  ): Promise<SponsoredGoal> {
    // Verificar que el usuario tiene un perfil de sponsor
    const sponsor = await this.sponsorRepository.findByUserId(userId);
    if (!sponsor) {
      throw new NotFoundException(
        'No se encontró perfil de patrocinador para este usuario',
      );
    }

    // Verificar que el sponsor está aprobado
    if (sponsor.status !== SponsorStatus.APPROVED) {
      throw new ForbiddenException(
        'Solo los patrocinadores aprobados pueden crear objetivos patrocinados',
      );
    }

    // Validar que las fechas son válidas
    const startDate = new Date(createSponsoredGoalDto.startDate);
    const endDate = new Date(createSponsoredGoalDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar que maxUsers es mayor a 0
    if (createSponsoredGoalDto.maxUsers <= 0) {
      throw new BadRequestException(
        'El número máximo de usuarios debe ser mayor a 0',
      );
    }

    // Crear la entidad de dominio
    const sponsoredGoal = new SponsoredGoal(
      uuidv4(),
      sponsor.id,
      createSponsoredGoalDto.name,
      createSponsoredGoalDto.description || '',
      createSponsoredGoalDto.criteria || null,
      startDate,
      endDate,
      createSponsoredGoalDto.verificationMethod,
      createSponsoredGoalDto.rewardId || null,
      createSponsoredGoalDto.maxUsers,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.sponsoredGoalRepository.create(sponsoredGoal);
  }
}
