import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IPointsWalletRepository } from '../../domain/repositories/points-wallet.repository';
import { PointsWallet } from '../../domain/entities/points-wallet.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para obtener la billetera de puntos de un usuario
 * Si no existe, crea una nueva con balance 0
 */
@Injectable()
export class GetWalletUseCase {
  constructor(
    @Inject('IPointsWalletRepository')
    private readonly pointsWalletRepository: IPointsWalletRepository,
  ) {}

  async execute(userId: string): Promise<PointsWallet> {
    let wallet = await this.pointsWalletRepository.findByUserId(userId);

    if (!wallet) {
      // Crear billetera si no existe
      wallet = new PointsWallet(uuidv4(), userId, 0, new Date(), new Date());
      wallet = await this.pointsWalletRepository.create(wallet);
    }

    return wallet;
  }
}
