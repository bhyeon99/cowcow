/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, Delete, NotFoundException } from '@nestjs/common';
import { CowsService } from './cows.service';
import { Cow } from './cow.entity';

@Controller('cows')
export class CowsController {
  constructor(private readonly cowService: CowsService) {}

  // 소 등록 API
  @Post()
  async createCow(@Body() cowData: Partial<Cow>): Promise<Cow> {
    return this.cowService.create(cowData);
  }

  // 특정 소 조회 API
  @Get(':id')
  async getCowById(@Param('id') id: number): Promise<Cow> {
    return this.cowService.findOne(id);
  }

  // 모든 소 조회 API
  @Get()
  async getAllCows(): Promise<Cow[]> {
    return this.cowService.findAll();
  }

  // 특정 사용자 소 조회 API
  @Get('/user/:userId')
  async getCowsByUserId(@Param('userId') userId: number): Promise<Cow[]> {
    return this.cowService.findByUserId(userId);
  }

  @Delete(':id')
  async deleteCow(@Param('id') id: number): Promise<void> {
    const result = await this.cowService.delete(id);
    if (!result.affected) {
      throw new NotFoundException('해당 소를 찾을 수 없습니다.');
    }
  }
  // 특정 농가의 소 조회 API
  @Get('/barn/:barnId')
  async getCowsByBarnId(@Param('barnId') barnId: number): Promise<Cow[]> {
    return this.cowService.findByBarnId(barnId);
  }
}