import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { Auction } from './auction.entity';
import { User } from '../users/user.entity';
import { Cow } from '../cows/cow.entity';
import { AuctionCow } from '../auction-cows/auction-cow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, User, AuctionCow, Cow])],
  controllers: [AuctionsController],
  providers: [AuctionsService],
})
export class AuctionsModule {}
