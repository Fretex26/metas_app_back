import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import type { ISponsorEnrollmentRepository } from '../../domain/repositories/sponsor-enrollment.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Project } from '../../../projects/domain/entities/project.entity';

/**
 * Caso de uso para obtener los proyectos patrocinados de un usuario
 * Solo retorna los proyectos creados por el sponsor específico
 */
@Injectable()
export class GetUserSponsoredProjectsUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
    @Inject('ISponsorEnrollmentRepository')
    private readonly enrollmentRepository: ISponsorEnrollmentRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(userEmail: string, sponsorUserId: string): Promise<Project[]> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario es un sponsor
    const sponsor = await this.sponsorRepository.findByUserId(sponsorUserId);
    if (!sponsor) {
      throw new ForbiddenException(
        'Solo los patrocinadores pueden buscar proyectos de usuarios',
      );
    }

    // Obtener enrollments del usuario con el sponsor específico
    const enrollments =
      await this.enrollmentRepository.findByUserEmailAndSponsor(
        userEmail,
        sponsor.id,
      );

    // Obtener los proyectos asociados a estos enrollments
    const projects: Project[] = [];
    for (const enrollment of enrollments) {
      const project = await this.projectRepository.findByEnrollmentId(
        enrollment.id,
      );
      if (project) {
        projects.push(project);
      }
    }

    return projects;
  }
}
