import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBarnsService } from './user-barns.service';
import { UserBarnsController } from './user-barns.controller';
import { UserBarn } from './user-barn.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserBarn])],
  controllers: [UserBarnsController],
  providers: [UserBarnsService],
})
export class UserBarnsModule {}
