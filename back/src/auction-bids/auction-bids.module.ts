import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionBidsService } from './auction-bids.service';
import { AuctionBidsController } from './auction-bids.controller';
import { AuctionBid } from './auction-bid.entity';
import { Auction } from '../auctions/auction.entity';
import { AlarmsService } from '../alarms/alarms.service';
import { Alarm } from '../alarms/alarm.entity';
import { User } from '../users/user.entity';
import { AlarmsGateway } from 'src/alarms/alarms.gateway';
import { AuctionCowsModule } from 'src/auction-cows/auction-cows.module'; // AuctionCowsModule 임포트

@Module({
  imports: [
    TypeOrmModule.forFeature([AuctionBid, Auction, Alarm, User]),
    AuctionCowsModule, // AuctionCowsModule 추가
  ],
  controllers: [AuctionBidsController],
  providers: [AuctionBidsService, AlarmsService, AlarmsGateway],
})
export class AuctionBidsModule {}
