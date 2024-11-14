import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { AuctionBidsService } from './auction-bids.service';
import { AuctionBid } from './auction-bid.entity';

@Controller('auction-bids')
export class AuctionBidsController {
  constructor(private readonly auctionBidsService: AuctionBidsService) {}

  // 입찰 등록
  @Post()
  async createBid(@Body() bidData: Partial<AuctionBid>): Promise<AuctionBid> {
    return this.auctionBidsService.createBid(bidData);
  }

  // 특정 경매의 최고 입찰가 조회
  @Get('highest/:acowSeq')
  async getHighestBid(@Param('acowSeq') acowSeq: number): Promise<AuctionBid> {
    const highestBid = await this.auctionBidsService.getHighestBid(acowSeq);
    if (!highestBid) {
      throw new NotFoundException('입찰 기록이 없습니다.');
    }
    return highestBid;
  }
}
