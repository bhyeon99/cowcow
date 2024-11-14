import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Cow } from '../cows/cow.entity';
import { AuctionBid } from '../auction-bids/auction-bid.entity';
import { Auction } from 'src/auctions/auction.entity';


@Entity('auction_cows')
export class AuctionCow {
  @PrimaryGeneratedColumn({ name: 'acow_seq', unsigned: true })
  acowSeq: number;

  @Column({ name: 'cow_seq', nullable: true})
  cowSeq: number;

  @Column({ name: 'auc_seq', unsigned: true, nullable: true })
  aucSeq: number; // 경매 시퀀스 (Foreign Key)

  @Column({ name : 'acow_winner_seq', unsigned: true, nullable: true})
  acowWinnerSeq: number;

  @Column({ name: 'acow_crt_dt', type: 'datetime' })
  acowCrtDt: Date;
  
  @Column({ name: 'acow_del_dt', type: 'datetime', nullable: true})
  acowDelDt: Date;

  @Column({ name: 'acow_status', default: '진행중' })
  acowStatus: string;

  @Column({ name: 'acow_final_bid', type: 'int', nullable: true })
  acowFinalBid: number;

  @Column({ name: 'acow_bottom_price', default: 0})
  acowBottomPrice: number;

  @Column({ name: 'acow_predict_price', default: 0, nullable: true})
  acowPredictPrice: number;

  // 소와의 관계 설정
  @ManyToOne(() => Cow, (cow) => cow.auctions)
  @JoinColumn({ name: 'cow_seq' })
  cow: Cow;

  @ManyToOne(() => Auction, (auction) => auction.auctionCows)
  @JoinColumn({ name: 'auc_seq' })  // 외래 키 지정
  auction: Auction;

  // 낙찰자와의 관계 설정
  @ManyToOne(() => User, (user) => user.auctionsWon)
  @JoinColumn({ name: 'acow_winner_seq' }) // 외래 키 컬럼 명시적으로 지정
  winningUser: User; // 낙찰자 정보

  // 입찰과의 양방향 관계 설정
  @OneToMany(() => AuctionBid, (auctionBid) => auctionBid.auctionCow)
  auctionCowBids: AuctionBid[];

}
