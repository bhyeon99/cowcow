import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';  // DeleteResult 추가
import { AuctionCow } from './auction-cow.entity';
import { User } from '../users/user.entity';
import { AlarmsGateway } from 'src/alarms/alarms.gateway';
import { AlarmsService } from 'src/alarms/alarms.service';

@Injectable()
export class AuctionCowsService {
  constructor(
    @InjectRepository(AuctionCow)
    private readonly auctionCowRepository: Repository<AuctionCow>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly alarmsService: AlarmsService,
    private readonly alarmsGateway: AlarmsGateway,
  ) {}

  // 경매 소 생성
  async create(auctionCowData: Partial<AuctionCow>): Promise<AuctionCow> {
    const auctionCow = this.auctionCowRepository.create(auctionCowData);
    return await this.auctionCowRepository.save(auctionCow);
  }

  // 모든 경매 소 조회
  async findAll(): Promise<AuctionCow[]> {
    return await this.auctionCowRepository.find({
      relations: ['auction', 'cow'],
    });
  }

  // 특정 경매 소 조회 (ID로 조회)
  async findOne(id: number): Promise<AuctionCow> {
    const auctionCow = await this.auctionCowRepository.findOne({
      where: { acowSeq: id },
      relations: ['auction', 'cow', 'cow.userBarn'],
    });

    if (!auctionCow) {
      throw new NotFoundException(`ID ${id}에 해당하는 경매 소를 찾을 수 없습니다.`);
    }

    return auctionCow;
  }

  // 경매 소 삭제
  async delete(id: number): Promise<DeleteResult> {
    return await this.auctionCowRepository.delete(id);
  }

  // 경매 소 정보 업데이트
  // async update(id: number, auctionCowData: Partial<AuctionCow>): Promise<AuctionCow> {
  //   const auctionCow = await this.findOne(id); // 존재 여부 확인

  //   // 수정된 데이터 병합
  //   const updatedCow = this.auctionCowRepository.merge(auctionCow, auctionCowData);

  //   return await this.auctionCowRepository.save(updatedCow);
  // }


  async setWinningBid(
    acowSeq: number,
    acowWinnerSeq: number,
    acowFinalBid: number,
  ): Promise<AuctionCow> {
    const auctionCow = await this.auctionCowRepository.findOne({
      where: { acowSeq },
      relations: ['cow'],
    });

    if (!auctionCow) {
      throw new NotFoundException('해당 경매를 찾을 수 없습니다.');
    }


    const winningUser = await this.usersRepository.findOne({
      where: { usrSeq: acowWinnerSeq },
    });

    if (!winningUser) {
      throw new NotFoundException('낙찰자를 찾을 수 없습니다.');
    }

    const now = new Date();
    auctionCow.acowStatus = '낙찰';
    auctionCow.acowFinalBid = acowFinalBid;
    auctionCow.acowWinnerSeq = acowWinnerSeq;
    auctionCow.acowDelDt = new Date(now.getTime());

    const sellerId = acowWinnerSeq;
    const message = `회원님이 입찰한 ${auctionCow.cow.cowNo}상품이 낙찰되었습니다.`;

    // // 알림 생성 - 데이터베이스에 저장
    const alarm = await this.alarmsService.createAlarm(sellerId, message);

    // 알림 전송 - WebSocket으로 실시간 알림 전달
    await this.alarmsGateway.sendAlarm(alarm);

    return await this.auctionCowRepository.save(auctionCow);
  }

   // 로그인한 유저의 '낙찰'된 경매 데이터 조회
  async getCompletedAuctions(userSeq: number): Promise<any[]> {
    const auctions = await this.auctionCowRepository.find({
      where: { acowStatus: '낙찰' },
      relations: ['cow', 'cow.user', 'auction', 'winningUser'],
    });

    if (!auctions) {
      throw new NotFoundException('거래 내역이 없습니다.');
    }

    // 거래 유형을 추가
    const completedAuctions = auctions.map((auction) => {


      let type = ''; // 기본값
      if (auction.cow?.usrSeq == userSeq) {
        type = '판매'; // 소의 소유자가 현재 로그인한 유저인 경우
      } else if (auction.acowWinnerSeq == userSeq) {
        type = '구매'; // 낙찰자가 현재 로그인한 유저인 경우
      }

      return {
        ...auction,
        type,
      };
    });

    return completedAuctions.filter((zz) =>
      zz.type !== ''
    );
  }

  // 특정 경매의 모든 소가 낙찰되었는지 확인
  async areAllCowsSold(aucSeq: number): Promise<boolean> {
    const auctionCows = await this.auctionCowRepository.find({ where: { aucSeq } });
    return auctionCows.every((cow) => cow.acowStatus === '낙찰');
  }


}
