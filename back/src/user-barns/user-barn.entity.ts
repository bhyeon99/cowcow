import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity'; // User Entity import
import { Cow } from '../cows/cow.entity';

@Entity('user_barns')
export class UserBarn {
  @PrimaryGeneratedColumn({ name: 'usr_barn_seq', unsigned: true })
  usrBarnSeq: number; // 축사 시퀀스

  @Column({ name: 'usr_seq', unsigned: true, nullable: true })
  usrSeq: number; // 사용자 시퀀스 (Foreign Key)

  @Column({ name: 'usr_barn_name', nullable: true })
  usrBarnName: string; // 축사명

  @Column({ name: 'usr_barn_url', nullable: true})
  usrBarnUrl: string

  @ManyToOne(() => User, (user) => user.userBarns)
  @JoinColumn({ name: 'usr_seq' }) // 외래 키 컬럼 명시적으로 지정
  user: User; // 사용자와의 관계

  @OneToMany(() => Cow, (cow) => cow.userBarn)
  cow: Cow[]; // 축사와 경매의 관계
}
