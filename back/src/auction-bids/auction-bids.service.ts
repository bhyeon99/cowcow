import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuctionBid } from './auction-bid.entity';
import { Auction } from 'src/auctions/auction.entity';
import { AlarmsService } from 'src/alarms/alarms.service';
import { AlarmsGateway } from 'src/alarms/alarms.gateway';
import { AuctionCowsService } from 'src/auction-cows/auction-cows.service';

@Injectable()
export class AuctionBidsService {
  constructor(
    @InjectRepository(AuctionBid)
    private readonly auctionBidsRepository: Repository<AuctionBid>,

    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,

    private readonly alarmsService: AlarmsService,
    private readonly alarmsGateway: AlarmsGateway,
    private readonly auctionCowsService: AuctionCowsService
  ) {}

  async createBid(bidData: Partial<AuctionBid>): Promise<AuctionBid> {
    const newBid = this.auctionBidsRepository.create(bidData);
    const savedBid = await this.auctionBidsRepository.save(newBid);

    const auction = await this.auctionsRepository.findOne({
      where: { aucSeq: bidData.aucSeq },
      relations: ['user'],
    });

    const acow = await this.auctionCowsService.findOne(bidData.acowSeq);

    if (!auction) {
      throw new NotFoundException(`ID ${bidData.aucSeq}에 해당하는 경매를 찾을 수 없습니다.`);
    }

    if(acow.acowStatus === '낙찰') {
      throw new NotFoundException(`ID ${bidData.aucSeq}에 해당하는 경매는 이미 낙찰되었습니다.`);
    }

    const sellerId = auction.user.usrSeq;
    const message = `${auction.aucBroadcastTitle}경매의 ${acow.cow.cowNo}가 입찰 갱신되었습니다.`;
    
    // 현재 입찰이 이루어진 acowSeq에 입찰한 모든 사용자 조회
    const allBidders = await this.auctionBidsRepository.find({
      where: { acowSeq: bidData.acowSeq },
      relations: ['user'], // 각 입찰자의 사용자 정보를 포함
    });

    // 중복을 제거하여 고유한 usrSeq만 남기기
    const uniqueBidders = Array.from(new Set(allBidders.map(bid => bid.user.usrSeq)))
    .filter(bidderId => bidderId !== bidData.bidAcc);

    // 알림 생성 - 데이터베이스에 저장
    const alarm = await this.alarmsService.createAlarm(sellerId, message);

    // 고유한 입찰자들에게 알림 전송 - WebSocket으로 실시간 알림 전달
    await Promise.all(
      uniqueBidders.map(async (bidderId) => {
        const bidderMessage = `${auction.aucBroadcastTitle}경매의 ${acow.cow.cowNo}가 입찰 갱신되었습니다.`;
        
        // 각 입찰자에 대한 알림 생성 및 전송
        const bidderAlarm = await this.alarmsService.createAlarm(bidderId, bidderMessage);
        await this.alarmsGateway.sendAlarm(bidderAlarm);
      })
    );

    // 알림 전송 - WebSocket으로 실시간 알림 전달
    await this.alarmsGateway.sendAlarm(alarm);

    return savedBid;
  }

  // 특정 경매소의 최고 입찰가 조회 (입찰자 정보 포함)
  async getHighestBid(acowSeq: number): Promise<AuctionBid | null> {
    return this.auctionBidsRepository.findOne({
      where: { acowSeq },
      relations: ['user'],
      order: { bidAmt: 'DESC' },
    });
  }
}
