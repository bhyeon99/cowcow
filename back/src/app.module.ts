import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 엔티티 임포트
import { User } from './users/user.entity';
import { UserBarn } from './user-barns/user-barn.entity';
import { Cow } from './cows/cow.entity';
import { Auction } from './auctions/auction.entity';
import { AuctionBid } from './auction-bids/auction-bid.entity';
import { AuctionCow } from './auction-cows/auction-cow.entity';
import { Alarm } from './alarms/alarm.entity';

// 모듈 임포트
import { UsersModule } from './users/users.module';
import { AuctionsModule } from './auctions/auctions.module';
import { CowsModule } from './cows/cows.module';
import { AuctionBidsModule } from './auction-bids/auction-bids.module';
import { UserBarnsModule } from './user-barns/user-barns.module';
import { AuctionCowsModule } from './auction-cows/auction-cows.module';
import { AlarmsModule } from './alarms/alarms.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'project-db-cgi.smhrd.com',
      port: 3307,
      username: 'ohi0',
      password: 'smart123!',
      database: 'ohi0',
      entities: [
        User, UserBarn, Cow, Auction, AuctionBid, AuctionCow, Alarm
      ],
      synchronize: false,
    }),
    UsersModule,
    AuctionsModule,
    CowsModule,
    AuctionBidsModule,
    UserBarnsModule,
    AuctionCowsModule,
    AlarmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
