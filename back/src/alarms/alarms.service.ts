import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarm } from './alarm.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AlarmsService {
  constructor(
    @InjectRepository(Alarm)
    private readonly alarmsRepository: Repository<Alarm>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // 새로운 알림 생성
  async createAlarm(userId: number, message: string): Promise<Alarm> {
    const user = await this.usersRepository.findOne({ where: { usrSeq: userId } });
    if (!user) {
      throw new NotFoundException(`ID ${userId}에 해당하는 사용자를 찾을 수 없습니다.`);
    }

    const alarm = this.alarmsRepository.create({
      user,
      alarmMsg: message,
      alarmIsRead: false,
    });

    return this.alarmsRepository.save(alarm);
  }

  // 특정 사용자의 모든 알림 조회
  async getUserAlarms(userId: number): Promise<Alarm[]> {
    const user = await this.usersRepository.findOne({ where: { usrSeq: userId } });
    if (!user) {
      throw new NotFoundException(`ID ${userId}에 해당하는 사용자를 찾을 수 없습니다.`);
    }

    return this.alarmsRepository.find({
      where: { user: { usrSeq: userId } },
      order: { alarmCrtDt: 'DESC' },
    });
  }

  // 특정 알림을 읽음 상태로 업데이트
  async markAsRead(alarmSeq: number): Promise<Alarm> {
    const alarm = await this.alarmsRepository.findOne({ where: { alarmSeq } });
    if (!alarm) {
      throw new NotFoundException(`ID ${alarmSeq}에 해당하는 알림을 찾을 수 없습니다.`);
    }

    alarm.alarmIsRead = true;
    return this.alarmsRepository.save(alarm);
  }

  // 특정 사용자의 읽지 않은 알림 개수 조회
  async getUnreadCount(userId: number): Promise<number> {
    return this.alarmsRepository.count({
      where: { user: { usrSeq: userId }, alarmIsRead: false },
    });
  }
}
