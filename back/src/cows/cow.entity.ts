import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity'; // User Entity import
import { UserBarn } from 'src/user-barns/user-barn.entity';
import { AuctionCow } from 'src/auction-cows/auction-cow.entity';

@Entity('cows')
export class Cow {
  @PrimaryGeneratedColumn({ name: 'cow_seq', unsigned: true })
  cowSeq: number; // 소 시퀀스

  @Column({ name: 'usr_seq', unsigned: true, nullable: true })
  usrSeq: number; // 사용자 시퀀스 (Foreign Key)

  @Column({ name: 'usr_barn_seq', unsigned: true, nullable: true })
  usrBarnSeq: number;

  @Column({ name: 'cow_no', nullable: true })
  cowNo: string; // 개체 번호

  @Column({ name: 'cow_bir_dt', type: 'date', nullable: true })
  cowBirDt: Date; // 출생일

  @Column({ name: 'cow_gdr', nullable: true })
  cowGdr: string; // 성별

  @Column('decimal', { name: 'cow_kpn', precision: 10, scale: 1, nullable: true })
  cowKpn: string; // KPN 번호
  
  @Column({ name: 'cow_prt', type: 'int', nullable: true })
  cowPrt: number; // 산차

  @Column({ name: 'notes', type: 'varchar', length: 255, nullable: true })
  notes: string; // 비고

  @Column({ name: 'cow_region',  nullable: true })
  cowRegion: string;

  @Column({ name: 'cow_jagigubun', nullable: true})
  cowJagigubun: string;

  @Column({ name: 'cow_eomigubun', nullable: true})
  cowEomigubun: string;

  @Column({ name : 'cow_img1', nullable: true})
  cowImgOne : string;

  @Column({ name : 'cow_img2', nullable: true})
  cowImgTwo : string;


  @Column('decimal', { name : 'cow_family',  precision: 10, scale: 1, nullable: true })
  cowFamily : string;

  @Column({ name : 'cow_weight', nullable: true})
  cowWeight : number;


  @ManyToOne(() => User, (user) => user.cows)
  @JoinColumn({ name: 'usr_seq' }) // 외래 키 컬럼 명시적으로 지정
  user: User; // 사용자와의 관계

  // 축사와의 관계 설정
  @ManyToOne(() => UserBarn, (userBarn) => userBarn.cow)
  @JoinColumn({ name: 'usr_barn_seq' })
  userBarn: UserBarn;

  @OneToMany(() => AuctionCow, (auctionCow) => auctionCow.cow)
  auctions: AuctionCow[]; // 소와 경매의 관계

}
