import { SponsorEnrollment } from '../entities/sponsor-enrollment.entity';

/**
 * Interfaz del repositorio de sponsor enrollments
 */
export interface ISponsorEnrollmentRepository {
  create(enrollment: SponsorEnrollment): Promise<SponsorEnrollment>;
  findById(id: string): Promise<SponsorEnrollment | null>;
  findBySponsoredGoalIdAndUserId(
    sponsoredGoalId: string,
    userId: string,
  ): Promise<SponsorEnrollment | null>;
  findByUserEmailAndSponsor(
    userEmail: string,
    sponsorId: string,
  ): Promise<SponsorEnrollment[]>;
  findBySponsoredGoalId(sponsoredGoalId: string): Promise<SponsorEnrollment[]>;
  update(enrollment: SponsorEnrollment): Promise<SponsorEnrollment>;
  delete(id: string): Promise<void>;
}
