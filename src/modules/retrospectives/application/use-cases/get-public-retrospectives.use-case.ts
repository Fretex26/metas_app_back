import { Injectable, Inject } from '@nestjs/common';
import type { IRetrospectiveRepository } from '../../domain/repositories/retrospective.repository';
import { Retrospective } from '../../domain/entities/retrospective.entity';

/**
 * Caso de uso para obtener todas las retrospectivas públicas
 */
@Injectable()
export class GetPublicRetrospectivesUseCase {
  constructor(
    @Inject('IRetrospectiveRepository')
    private readonly retrospectiveRepository: IRetrospectiveRepository,
  ) {}

  async execute(): Promise<Retrospective[]> {
    return await this.retrospectiveRepository.findPublicRetrospectives();
  }
}
