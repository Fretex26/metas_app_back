import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MilestoneStatus } from '../../../../shared/types/enums';

export class UpdateMilestoneStatusDto {
  @ApiProperty({
    enum: MilestoneStatus,
    example: MilestoneStatus.IN_PROGRESS,
    description: 'Nuevo estado de la milestone',
  })
  @IsEnum(MilestoneStatus)
  status: MilestoneStatus;
}
