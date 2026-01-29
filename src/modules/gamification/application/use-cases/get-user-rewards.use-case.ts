import { Injectable, Inject } from '@nestjs/common';
import type { IRewardRepository } from '../../domain/repositories/reward.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import { Reward } from '../../domain/entities/reward.entity';

/**
 * Caso de uso para obtener todas las rewards del usuario
 *
 * Obtiene todas las rewards asociadas a los proyectos y milestones del usuario.
 * Elimina duplicados si una reward aparece tanto en un proyecto como en un milestone.
 */
@Injectable()
export class GetUserRewardsUseCase {
  constructor(
    @Inject('IRewardRepository')
    private readonly rewardRepository: IRewardRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
  ) {}

  async execute(userId: string): Promise<Reward[]> {
    // Obtener todos los proyectos del usuario
    const projects = await this.projectRepository.findByUserId(userId);

    // Recopilar todos los rewardIds únicos
    const rewardIds = new Set<string>();

    // Recopilar rewardIds de proyectos
    projects.forEach((project) => {
      if (project.rewardId) {
        rewardIds.add(project.rewardId);
      }
    });

    // Recopilar rewardIds de milestones
    for (const project of projects) {
      const milestones = await this.milestoneRepository.findByProjectId(
        project.id,
      );
      milestones.forEach((milestone) => {
        if (milestone.rewardId) {
          rewardIds.add(milestone.rewardId);
        }
      });
    }

    // Si no hay rewardIds, retornar array vacío
    if (rewardIds.size === 0) {
      return [];
    }

    // Obtener todas las rewards
    const rewards = await this.rewardRepository.findByIds(
      Array.from(rewardIds),
    );

    return rewards;
  }
}
