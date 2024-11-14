import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cow } from './cow.entity';

@Injectable()
export class CowsService {
  constructor(
    @InjectRepository(Cow)
    private readonly cowsRepository: Repository<Cow>,
  ) {}

  // 소 등록
  async create(cowData: Partial<Cow>): Promise<Cow> {
    const cow = this.cowsRepository.create(cowData);
    return this.cowsRepository.save(cow);
  }

  // 특정 소 조회
  async findOne(id: number): Promise<Cow> {
    const cow = await this.cowsRepository.findOne({
      where: { cowSeq: id },
      relations: ['user', 'auctions', 'userBarn'], // 연관된 데이터도 조회
    });
    if (!cow) {
      throw new NotFoundException(`Cow with ID ${id} not found`);
    }
    return cow;
  }

  // 모든 소 조회
  async findAll(): Promise<Cow[]> {
    return this.cowsRepository.find({ relations: ['user', 'auctions', 'userBarn'] });
  }

    // 사용자별 소 조회
  async findByUserId(userId: number): Promise<Cow[]> {
    return this.cowsRepository.find({
      where: { usrSeq: userId },
    });
  }

  // 특정 소 삭제
  async delete(id: number) {
    return this.cowsRepository.delete(id);
  }

  // 특정 농가 소 조회 메서드
  async findByBarnId(barnId: number): Promise<Cow[]> {
    return this.cowsRepository.find({ where: { usrBarnSeq: barnId } });
  }
}