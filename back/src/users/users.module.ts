import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuctionCow } from '../auction-cows/auction-cow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuctionCow])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
