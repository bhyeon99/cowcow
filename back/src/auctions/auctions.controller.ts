import { 
  Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, 
  Patch
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { Auction } from './auction.entity';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  // 모든 경매 조회 (GET /auctions)
  @Get()
  async getAllAuctions(): Promise<Auction[]> {
    return this.auctionsService.findAll();
  }

  // 특정 경매 조회 (GET /auctions/:id)
  @Get(':id')
  async getAuction(@Param('id') id: number): Promise<Auction | null> {
    const auction = await this.auctionsService.findOne(id);
    if (!auction) {
      throw new NotFoundException(`ID ${id}에 해당하는 경매를 찾을 수 없습니다.`);
    }
    return auction;
  }

  // 경매 생성 (POST /auctions)
  @Post()
  async createAuction(
    @Body() auctionData: { 
      title: string; 
      usrSeq: number; 
      usrBarnSeq: number; 
      cows: { cowSeq: number; minValue: number; predictPrice: number }[] 
    }
  ) {
    try {
      const newAuction = await this.auctionsService.createAuction(auctionData);
      return { message: '경매가 성공적으로 등록되었습니다.', auction: newAuction };
    } catch (error) {
      console.error('경매 등록 중 오류 발생:', error);
      throw new NotFoundException('경매를 생성할 수 없습니다.');
    }
  }

  // 경매 삭제 (DELETE /auctions/:id)
  @Delete(':id')
  async deleteAuction(@Param('id') id: number): Promise<void> {
    await this.auctionsService.delete(id);
  }

  // 경매 상태 업데이트 (PATCH /auctions/:id/status)
  @Patch(':id/status')
  async updateAuctionStatus(
    @Param('id') id: number,
    @Body() body: { aucStatus: string },
  ): Promise<Auction> {
    const updatedAuction = await this.auctionsService.updateAuctionStatus(id, body.aucStatus);
    if (!updatedAuction) {
      throw new NotFoundException(`ID ${id}에 해당하는 경매를 찾을 수 없습니다.`);
    }
    return updatedAuction;
  }

}
