import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBarn } from './user-barn.entity';

@Injectable()
export class UserBarnsService {
  constructor(
    @InjectRepository(UserBarn)
    private readonly userBarnsRepository: Repository<UserBarn>,
  ) {}

  // 모든 축사 조회
  async findAll(): Promise<UserBarn[]> {
    return this.userBarnsRepository.find();
  }

  // 특정 축사 조회
  async findOne(usrBarnSeq: number): Promise<UserBarn> {
    const barn = await this.userBarnsRepository.findOne({ where: { usrBarnSeq } });
    if (!barn) {
      throw new NotFoundException(`Barn with ID ${usrBarnSeq} not found`);
    }
    return barn;
  }

  // 유저의 농장 목록 가져오기
  async getUserBarnsByUser(usrSeq: number): Promise<UserBarn[]> {
    return this.userBarnsRepository.find({
      where: { user: { usrSeq } },
    });
  }

  // 축사 생성
  async create(data: Partial<UserBarn>): Promise<UserBarn> {
    const newBarn = this.userBarnsRepository.create(data);
    return this.userBarnsRepository.save(newBarn);
  }

  // 축사 삭제
  async remove(usrBarnSeq: number): Promise<void> {
    const result = await this.userBarnsRepository.delete(usrBarnSeq);
    if (result.affected === 0) {
      throw new NotFoundException(`Barn with ID ${usrBarnSeq} not found`);
    }
  }
}
