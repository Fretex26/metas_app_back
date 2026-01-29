import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { ISponsorRepository } from '../../domain/repositories/sponsor.repository';
import { Sponsor } from '../../domain/entities/sponsor.entity';
import { UpdateSponsorDto } from '../dto/update-sponsor.dto';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para actualizar el perfil de patrocinador
 */
@Injectable()
export class UpdateSponsorProfileUseCase {
  constructor(
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(
    userId: string,
    updateSponsorDto: UpdateSponsorDto,
  ): Promise<Sponsor> {
    // Obtener el sponsor actual
    const currentSponsor = await this.sponsorRepository.findByUserId(userId);

    if (!currentSponsor) {
      throw new NotFoundException(
        'No se encontró perfil de patrocinador para este usuario',
      );
    }

    // Solo se puede actualizar si está en estado PENDING o APPROVED
    // Si está REJECTED o DISABLED, se requiere aprobación del admin
    if (
      currentSponsor.status === SponsorStatus.REJECTED ||
      currentSponsor.status === SponsorStatus.DISABLED
    ) {
      throw new ForbiddenException(
        'No puedes actualizar el perfil en el estado actual. Contacta a un administrador.',
      );
    }

    // Mantener el estado actual sin cambios
    // Crear sponsor actualizado
    const updatedSponsor = new Sponsor(
      currentSponsor.id,
      currentSponsor.userId,
      updateSponsorDto.businessName ?? currentSponsor.businessName,
      updateSponsorDto.description ?? currentSponsor.description,
      updateSponsorDto.category ?? currentSponsor.category,
      updateSponsorDto.logoUrl ?? currentSponsor.logoUrl,
      updateSponsorDto.contactEmail ?? currentSponsor.contactEmail,
      currentSponsor.status,
      currentSponsor.reviewedBy,
      currentSponsor.reviewedAt,
      currentSponsor.rejectionReason,
      currentSponsor.createdAt,
    );

    return await this.sponsorRepository.update(updatedSponsor);
  }
}
