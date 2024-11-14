import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UserBarnsService } from './user-barns.service';
import { UserBarn } from './user-barn.entity';

@Controller('user-barns')
export class UserBarnsController {
  constructor(private readonly userBarnsService: UserBarnsService) {}

  // 모든 축사 조회
  @Get()
  async getAllBarns(): Promise<UserBarn[]> {
    return this.userBarnsService.findAll();
  }

  // 특정 축사 조회
  @Get(':id')
  async getBarn(@Param('id') id: number): Promise<UserBarn> {
    return this.userBarnsService.findOne(id);
  }

  // 특정 유저의 농장 목록 가져오기
  @Get('/user/:usrSeq')
  async getUserBarns(@Param('usrSeq') usrSeq: number) {
    return this.userBarnsService.getUserBarnsByUser(usrSeq);
  }

  // 축사 생성
  @Post()
  async createBarn(@Body() data: Partial<UserBarn>): Promise<UserBarn> {
    return this.userBarnsService.create(data);
  }

  // 축사 삭제
  @Delete(':id')
  async deleteBarn(@Param('id') id: number): Promise<void> {
    return this.userBarnsService.remove(id);
  }
}
