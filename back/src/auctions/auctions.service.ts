/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './auction.entity';
import { AuctionCow } from '../auction-cows/auction-cow.entity';
import { Cow } from '../cows/cow.entity'; // Cow 엔티티 추가
import { User } from '../users/user.entity';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,

    @InjectRepository(AuctionCow)
    private readonly auctionCowsRepository: Repository<AuctionCow>,

    @InjectRepository(Cow) // Cow 엔티티 주입
    private readonly cowsRepository: Repository<Cow>,
  ) {}

  // 1. 소 데이터 가져오기
  async getCowDataForPrediction(cowSeq: number): Promise<any> {
    const cow = await this.cowsRepository.findOne({ where: { cowSeq } });
    if (!cow) {
      throw new NotFoundException(`Cow with id ${cowSeq} not found`);
    }

    // 필요한 데이터만 반환
    return {
      kpn: cow.cowKpn,
      family: cow.cowFamily, // 계대가 이 필드라고 가정
      weight: cow.cowWeight, // 중량 필드 가정
      gender: cow.cowGdr,
      type: cow.cowJagigubun,
    };
  }

  // 2. 경매 생성
  async createAuction(auctionData: {
    title: string;
    usrSeq: number;
    usrBarnSeq: number;
    cows: { cowSeq: number; minValue: number; predictPrice: number }[];
  }): Promise<Auction> {
    const now = new Date();
    const aucCrtDt = new Date(now.getTime());

    const aucEndDt = new Date(aucCrtDt);
    aucEndDt.setDate(aucEndDt.getDate() + 5);
    console.log("AucEndDt: ", aucEndDt);

    const newAuction = this.auctionsRepository.create({
      aucBroadcastTitle: auctionData.title,
      usrSeq: auctionData.usrSeq,
      aucCrtDt: aucCrtDt,
      aucEndDt: aucEndDt,
      aucStatus: '진행중',
    });
    const savedAuction = await this.auctionsRepository.save(newAuction);

    try {
      const auctionCowPromises = auctionData.cows.map((cow) =>
        this.auctionCowsRepository.save({
          cowSeq: cow.cowSeq,
          aucSeq: savedAuction.aucSeq,
          acowBottomPrice: cow.minValue,
          acowPredictPrice: cow.predictPrice, // 이미 예측된 가격 사용
          acowCrtDt: new Date(now.getTime()),
        }),
      );

      await Promise.all(auctionCowPromises);
    } catch (error) {
      console.error('Error saving auction cows:', error);
      throw new Error('Error occurred while saving auction cows');
    }

    return savedAuction;
  }

  async findAll(): Promise<Auction[]> {
    return this.auctionsRepository.find({ relations: ['user', 'auctionCows'] });
  }

  async findOne(id: number): Promise<Auction | null> {
    return this.auctionsRepository.findOne({
      where: { aucSeq: id },
      relations: [
        'user',
        'auctionCows',
        'auctionCows.cow',
        'auctionCows.cow.userBarn',
      ],
    });
  }

  async delete(id: number): Promise<void> {
    const result = await this.auctionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('해당 경매를 찾을 수 없습니다.');
    }
  }

  // 경매 상태 업데이트
  async updateAuctionStatus(id: number, status: string): Promise<Auction> {
    // 상태 업데이트와 종료 시간 설정
    const updateData: Partial<Auction> = { aucStatus: status };
    if (status === '종료') {
      const now = new Date();
      updateData.aucDelDt = new Date(now.getTime());
    }
    
    await this.auctionsRepository.update(id, updateData);
    return this.auctionsRepository.findOneBy({ aucSeq: id });
  }
}
