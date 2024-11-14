import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('alarms')
export class Alarm {
  @PrimaryGeneratedColumn({ name: 'alarm_seq', unsigned: true })
  alarmSeq: number;

  @Column({ name: 'alarm_msg', unsigned: true, nullable: true })
  alarmMsg: string; // 알림 메시지

  @Column({name: 'alarm_is_read', unsigned: true, nullable: true, default: false })
  alarmIsRead: boolean; // 읽음 여부

  @CreateDateColumn({ name: 'alarm_crt_dt', unsigned: true, nullable: true })
  alarmCrtDt: Date; // 생성 날짜

  @ManyToOne(() => User, (user) => user.alarms)
  @JoinColumn({ name: 'usr_seq' }) // 외래 키 이름을 명시적으로 지정
  user: User; // 알림 수신자
}
