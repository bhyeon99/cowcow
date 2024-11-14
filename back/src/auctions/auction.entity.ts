import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { AuctionBid } from '../auction-bids/auction-bid.entity';
import { AuctionCow } from '../auction-cows/auction-cow.entity';

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn({ name: 'auc_seq', unsigned: true })
  aucSeq: number;

  @Column({ name: 'usr_seq', unsigned: true, nullable: true })
  usrSeq: number;

  @Column({ name: 'auc_broadcast_title', nullable: true })
  aucBroadcastTitle: string;

  @Column({ name: 'auc_status', nullable: true, default: '진행중' })
  aucStatus: string;

  @Column({ name: 'auc_crt_dt', type: 'datetime' })
  aucCrtDt: Date;

  @Column({ name: 'auc_del_dt', nullable: true})
  aucDelDt: Date;

  @Column({ name: 'auc_end_dt', nullable: true})
  aucEndDt: Date;

  // 사용자와의 관계 설정 (경매 등록자)
  @ManyToOne(() => User, (user) => user.auctions)
  @JoinColumn({ name: 'usr_seq' })
  user: User;

  @OneToMany(() => AuctionCow, (auctionCow) => auctionCow.auction)
  auctionCows: AuctionCow[];

  // 입찰과의 양방향 관계 설정
  @OneToMany(() => AuctionBid, (auctionBid) => auctionBid.auction)
  bids: AuctionBid[];
}
