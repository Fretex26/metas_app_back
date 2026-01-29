import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorEnrollmentRepository } from '../../domain/repositories/sponsor-enrollment.repository';
import { SponsorEnrollment } from '../../domain/entities/sponsor-enrollment.entity';
import { EnrollmentStatus } from '../../../../shared/types/enums';
import { DuplicateSponsoredProjectUseCase } from './duplicate-sponsored-project.use-case';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para inscribir un usuario a un objetivo patrocinado
 */
@Injectable()
export class EnrollInSponsoredGoalUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorEnrollmentRepository')
    private readonly enrollmentRepository: ISponsorEnrollmentRepository,
    private readonly duplicateProjectUseCase: DuplicateSponsoredProjectUseCase,
  ) {}

  async execute(
    sponsoredGoalId: string,
    userId: string,
  ): Promise<SponsorEnrollment> {
    // Verificar que el objetivo patrocinado existe
    const sponsoredGoal =
      await this.sponsoredGoalRepository.findById(sponsoredGoalId);
    if (!sponsoredGoal) {
      throw new NotFoundException('Objetivo patrocinado no encontrado');
    }

    // Verificar que el usuario no esté ya inscrito
    const existingEnrollment =
      await this.enrollmentRepository.findBySponsoredGoalIdAndUserId(
        sponsoredGoalId,
        userId,
      );
    if (existingEnrollment) {
      throw new ConflictException(
        'Ya estás inscrito en este objetivo patrocinado',
      );
    }

    // Verificar cupo disponible
    const enrollments =
      await this.enrollmentRepository.findBySponsoredGoalId(sponsoredGoalId);
    const activeEnrollments = enrollments.filter(
      (e) => e.status === EnrollmentStatus.ACTIVE,
    );

    if (activeEnrollments.length >= sponsoredGoal.maxUsers) {
      throw new BadRequestException(
        'Se ha alcanzado el número máximo de usuarios para este objetivo patrocinado',
      );
    }

    // Crear enrollment con estado ACTIVE
    const enrollment = new SponsorEnrollment(
      uuidv4(),
      sponsoredGoalId,
      userId,
      EnrollmentStatus.ACTIVE,
      new Date(),
    );

    const savedEnrollment = await this.enrollmentRepository.create(enrollment);

    // Duplicar el proyecto para el usuario
    await this.duplicateProjectUseCase.execute(
      sponsoredGoalId,
      userId,
      savedEnrollment.id,
    );

    return savedEnrollment;
  }
}
