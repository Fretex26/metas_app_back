import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IRewardRepository } from '../../domain/repositories/reward.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import { Reward } from '../../domain/entities/reward.entity';

/**
 * Caso de uso para obtener una reward específica por ID
 *
 * Verifica que la reward pertenezca al usuario (esté asociada a alguno de sus proyectos o milestones).
 * Si no pertenece al usuario, lanza ForbiddenException.
 * Si no existe, lanza NotFoundException.
 */
@Injectable()
export class GetRewardByIdUseCase {
  constructor(
    @Inject('IRewardRepository')
    private readonly rewardRepository: IRewardRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
  ) {}

  async execute(rewardId: string, userId: string): Promise<Reward> {
    // Obtener todos los proyectos del usuario
    const projects = await this.projectRepository.findByUserId(userId);
    const projectIds = projects.map((p) => p.id);

    // Obtener todos los milestones de los proyectos del usuario
    const userMilestones: Array<{ rewardId: string | null }> = [];
    for (const projectId of projectIds) {
      const milestones =
        await this.milestoneRepository.findByProjectId(projectId);
      userMilestones.push(...milestones);
    }

    // Recopilar todos los rewardIds del usuario
    const userRewardIds = new Set<string>();

    // Recopilar rewardIds de proyectos
    projects.forEach((project) => {
      if (project.rewardId) {
        userRewardIds.add(project.rewardId);
      }
    });

    // Recopilar rewardIds de milestones
    userMilestones.forEach((milestone) => {
      if (milestone.rewardId) {
        userRewardIds.add(milestone.rewardId);
      }
    });

    // Verificar permisos: la reward debe pertenecer al usuario
    if (!userRewardIds.has(rewardId)) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta recompensa',
      );
    }

    // Buscar la reward
    const reward = await this.rewardRepository.findById(rewardId);

    if (!reward) {
      throw new NotFoundException('Recompensa no encontrada');
    }

    return reward;
  }
}
