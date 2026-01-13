import { Injectable, ConflictException, Inject } from '@nestjs/common';
import type { ISponsorRepository } from '../../domain/repositories/sponsor.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import { Sponsor } from '../../domain/entities/sponsor.entity';
import { CreateSponsorDto } from '../dto/create-sponsor.dto';
import { SponsorStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo sponsor (solicitud de patrocinador)
 */
@Injectable()
export class CreateSponsorUseCase {
  constructor(
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    createSponsorDto: CreateSponsorDto,
    userId: string,
  ): Promise<Sponsor> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictException('Usuario no encontrado');
    }

    // Verificar que el usuario no tiene ya una solicitud de patrocinador
    const existingSponsor = await this.sponsorRepository.findByUserId(userId);
    if (existingSponsor) {
      throw new ConflictException(
        'Ya existe una solicitud de patrocinador para este usuario',
      );
    }

    // Crear la entidad de dominio
    const sponsor = new Sponsor(
      uuidv4(),
      userId,
      createSponsorDto.businessName,
      createSponsorDto.description,
      createSponsorDto.category,
      createSponsorDto.logoUrl || null,
      createSponsorDto.contactEmail,
      SponsorStatus.PENDING,
      null,
      null,
      null,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.sponsorRepository.create(sponsor);
  }
}
