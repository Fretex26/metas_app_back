import { Injectable, Inject } from '@nestjs/common';
import type { IProjectRepository } from '../repositories/project.repository';

/**
 * Servicio de dominio para proyectos
 * Contiene la lógica de negocio relacionada con proyectos
 */
@Injectable()
export class ProjectDomainService {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  /**
   * Valida que el usuario no exceda el límite de 6 proyectos
   * @param userId - ID del usuario
   * @throws Error si el usuario ya tiene 6 proyectos
   */
  async validateProjectLimit(userId: string): Promise<void> {
    const projectCount = await this.projectRepository.countByUserId(userId);
    const MAX_PROJECTS = 6;

    if (projectCount >= MAX_PROJECTS) {
      throw new Error(
        `El usuario ya tiene el límite máximo de ${MAX_PROJECTS} proyectos activos`,
      );
    }
  }
}
