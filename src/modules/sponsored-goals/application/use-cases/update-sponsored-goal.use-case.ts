import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import type { ICategoryRepository } from '../../../categories/domain/repositories/category.repository';
import { Category } from '../../../categories/domain/entities/category.entity';
import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';
import { UpdateSponsoredGoalDto } from '../dto/update-sponsored-goal.dto';

/**
 * Caso de uso para actualizar un objetivo patrocinado.
 * Solo el sponsor dueño puede actualizarlo.
 * Solo se modifican los campos enviados en el DTO.
 */
@Injectable()
export class UpdateSponsoredGoalUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    sponsoredGoalId: string,
    userId: string,
    dto: UpdateSponsoredGoalDto,
  ): Promise<SponsoredGoal> {
    const goal = await this.sponsoredGoalRepository.findById(sponsoredGoalId);
    if (!goal) {
      throw new NotFoundException('Objetivo patrocinado no encontrado');
    }

    const sponsor = await this.sponsorRepository.findByUserId(userId);
    if (!sponsor) {
      throw new NotFoundException(
        'No se encontró perfil de patrocinador para este usuario',
      );
    }

    if (goal.sponsorId !== sponsor.id) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este objetivo patrocinado',
      );
    }

    const startDate =
      dto.startDate != null ? new Date(dto.startDate) : goal.startDate;
    const endDate = dto.endDate != null ? new Date(dto.endDate) : goal.endDate;
    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    if (dto.maxUsers != null && dto.maxUsers < 1) {
      throw new BadRequestException(
        'El número máximo de usuarios debe ser al menos 1',
      );
    }

    let categories: Category[] = goal.categories;
    if (dto.categoryIds !== undefined) {
      if (dto.categoryIds.length === 0) {
        categories = [];
      } else {
        categories = await this.categoryRepository.findByIds(dto.categoryIds);
        if (categories.length !== dto.categoryIds.length) {
          throw new BadRequestException(
            'Una o más categorías especificadas no existen',
          );
        }
      }
    }

    const updated = new SponsoredGoal(
      goal.id,
      goal.sponsorId,
      goal.projectId,
      dto.name ?? goal.name,
      dto.description ?? goal.description,
      categories,
      startDate,
      endDate,
      dto.verificationMethod ?? goal.verificationMethod,
      dto.rewardId !== undefined ? dto.rewardId : goal.rewardId,
      dto.maxUsers ?? goal.maxUsers,
      goal.createdAt,
    );

    return this.sponsoredGoalRepository.update(updated);
  }
}
