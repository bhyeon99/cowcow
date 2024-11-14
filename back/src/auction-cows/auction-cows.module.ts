import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionCow } from './auction-cow.entity';
import { AuctionCowsService } from './auction-cows.service';
import { AuctionCowsController } from './auction-cows.controller';
import { Auction } from '../auctions/auction.entity'; // Auction 엔티티 import
import { AuctionsService } from '../auctions/auctions.service'; // AuctionsService import
import { Cow } from '../cows/cow.entity'; // Cow 엔티티 import
import { User } from '../users/user.entity'; // User 엔티티 import (필요할 경우)
import { AuctionBid } from '../auction-bids/auction-bid.entity'; // AuctionBid 엔티티 import (필요할 경우)
import { AlarmsModule } from 'src/alarms/alarms.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuctionCow, Auction, Cow, User, AuctionBid]), AlarmsModule], // 필요한 모든 엔티티 추가
  controllers: [AuctionCowsController],
  providers: [AuctionCowsService, AuctionsService], // AuctionsService 추가
  exports: [AuctionCowsService, TypeOrmModule], // AuctionCowsService와 TypeOrmModule을 exports에 추가
})
export class AuctionCowsModule {}
