import { EnrollmentStatus } from '../../../../shared/types/enums';

/**
 * Entidad de dominio SponsorEnrollment
 * Representa la inscripción de un usuario a un objetivo patrocinado
 */
export class SponsorEnrollment {
  constructor(
    public readonly id: string,
    public readonly sponsoredGoalId: string,
    public readonly userId: string,
    public readonly status: EnrollmentStatus,
    public readonly enrolledAt: Date,
  ) {}
}
