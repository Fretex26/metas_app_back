import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import type { ISponsorEnrollmentRepository } from '../../domain/repositories/sponsor-enrollment.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { SponsorEnrollment } from '../../domain/entities/sponsor-enrollment.entity';
import { Project } from '../../../projects/domain/entities/project.entity';
import { EnrollmentStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para actualizar el estado de un enrollment
 * Solo el sponsor puede cambiar el estado entre ACTIVE e INACTIVE
 */
@Injectable()
export class UpdateEnrollmentStatusUseCase {
  constructor(
    @Inject('ISponsorEnrollmentRepository')
    private readonly enrollmentRepository: ISponsorEnrollmentRepository,
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    enrollmentId: string,
    newStatus: EnrollmentStatus,
    sponsorUserId: string,
  ): Promise<SponsorEnrollment> {
    // Verificar que el enrollment existe
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    // Verificar que el usuario es un sponsor
    const sponsor = await this.sponsorRepository.findByUserId(sponsorUserId);
    if (!sponsor) {
      throw new ForbiddenException(
        'Solo los patrocinadores pueden cambiar el estado de las inscripciones',
      );
    }

    // Verificar que el sponsored goal pertenece al sponsor
    const sponsoredGoal = await this.sponsoredGoalRepository.findById(
      enrollment.sponsoredGoalId,
    );
    if (!sponsoredGoal || sponsoredGoal.sponsorId !== sponsor.id) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta inscripción',
      );
    }

    // Validar que solo se puede cambiar entre ACTIVE e INACTIVE
    if (
      newStatus !== EnrollmentStatus.ACTIVE &&
      newStatus !== EnrollmentStatus.INACTIVE
    ) {
      throw new BadRequestException(
        'Solo se puede cambiar el estado entre ACTIVE e INACTIVE',
      );
    }

    // Actualizar el enrollment
    const updatedEnrollment = new SponsorEnrollment(
      enrollment.id,
      enrollment.sponsoredGoalId,
      enrollment.userId,
      newStatus,
      enrollment.enrolledAt,
    );

    const savedEnrollment =
      await this.enrollmentRepository.update(updatedEnrollment);

    // Actualizar isActive del proyecto asociado
    const project =
      await this.projectRepository.findByEnrollmentId(enrollmentId);
    if (project) {
      const updatedProject = new Project(
        project.id,
        project.userId,
        project.name,
        project.description,
        project.purpose,
        project.budget,
        project.finalDate,
        project.resourcesAvailable,
        project.resourcesNeeded,
        project.sponsoredGoalId,
        project.enrollmentId,
        newStatus === EnrollmentStatus.ACTIVE, // isActive basado en el status
        project.status, // status
        project.rewardId,
        project.createdAt,
      );

      await this.projectRepository.update(updatedProject);
    }

    return savedEnrollment;
  }
}
