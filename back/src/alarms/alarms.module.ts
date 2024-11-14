import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmsController } from './alarms.controller';
import { AlarmsService } from './alarms.service';
import { Alarm } from './alarm.entity';
import { User } from '../users/user.entity';
import { AlarmsGateway } from './alarms.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm, User])],
  controllers: [AlarmsController],
  providers: [AlarmsService, AlarmsGateway],
  exports: [AlarmsService, AlarmsGateway],
})
export class AlarmsModule {}
