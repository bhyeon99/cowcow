import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CowsService } from './cows.service';
import { CowsController } from './cows.controller';
import { Cow } from './cow.entity';
import { User } from '../users/user.entity'; // User Entity import
import { UserBarn } from 'src/user-barns/user-barn.entity';
import { AuctionCow } from 'src/auction-cows/auction-cow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cow, User, UserBarn, AuctionCow])],
  controllers: [CowsController],
  providers: [CowsService],
})
export class CowsModule {}
