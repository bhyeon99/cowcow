import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { UserBarn } from '../user-barns/user-barn.entity'; // UserBarn Entity import
import { Cow } from '../cows/cow.entity'; // Cow Entity import
import { Auction } from '../auctions/auction.entity'; // Auction Entity import
import { AuctionBid } from '../auction-bids/auction-bid.entity'; // AuctionBid Entity import
import { AuctionCow } from '../auction-cows/auction-cow.entity';
import { Alarm } from 'src/alarms/alarm.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'usr_seq', unsigned: true })
  usrSeq: number; // 사용자 시퀀스

  @Column({ name: 'usr_typ', nullable: true })
  usrTyp: string; // 사용자 구분

  @Column({ name: 'usr_acc', nullable: true })
  usrAcc: string; // 아이디

  @Column({ name: 'usr_pwd', nullable: true })
  usrPwd: string; // 비밀번호

  @Column({ name: 'usr_nm', nullable: true })
  usrNm: string; // 이름

  @Column({ name: 'usr_phn', nullable: true })
  usrPhn: string; // 전화번호

  @Column({ name: 'usr_eml', nullable: true })
  usrEml: string; // 이메일

  @CreateDateColumn({ name: 'usr_crt_dt', type: 'datetime' })
  usrCrtDt: Date; // 생성일

  @OneToMany(() => UserBarn, (userBarn) => userBarn.user)
  userBarns: UserBarn[]; // 사용자와 축사의 관계

  @OneToMany(() => Cow, (cow) => cow.user)
  cows: Cow[]; // 사용자와 소의 관계

  @OneToMany(() => Auction, (auction) => auction.user)
  auctions: Auction[]; // 사용자와 경매의 관계

  @OneToMany(() => AuctionBid, (auctionBid) => auctionBid.user)
  auctionBids: AuctionBid[]; // 사용자와 입찰의 관계

  // 사용자가 낙찰받은 경매들
  @OneToMany(() => AuctionCow, (auctionCow) => auctionCow.winningUser)
  auctionsWon: AuctionCow[];

  @OneToMany(() => Alarm, (alarms) => alarms.user)
  alarms: Alarm[];
}
