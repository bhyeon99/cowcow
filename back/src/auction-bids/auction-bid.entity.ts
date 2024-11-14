import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity'; // User Entity import
import { Auction } from '../auctions/auction.entity'; // Auction Entity import
import { AuctionCow } from '../auction-cows/auction-cow.entity';

@Entity('auction_bids')
export class AuctionBid {
  @PrimaryGeneratedColumn({ name: 'bid_seq', unsigned: true })
  bidSeq: number; // 입찰 시퀀스

  @Column({ name: 'acow_seq', unsigned: true, nullable: true })
  acowSeq: number;

  @Column({ name: 'auc_seq', unsigned: true, nullable: true })
  aucSeq: number; // 경매 시퀀스 (Foreign Key)

  @Column({ name: 'bid_acc', unsigned: true, nullable: true })
  bidAcc: number; // 입찰자 시퀀스 (Foreign Key)

  @Column({ name: 'bid_amt', type: 'int', nullable: true })
  bidAmt: number; // 입찰 금액

  @Column({ name: 'bid_dt', type: 'datetime' })
  bidDt: Date; // 입찰 일시

  // 경매와의 관계 설정
  @ManyToOne(() => Auction, (auction) => auction.bids)
  @JoinColumn({ name: 'auc_seq' }) // 외래 키 컬럼 명시적으로 지정
  auction: Auction; // 경매와의 관계

  // 입찰자와의 관계 설정
  @ManyToOne(() => User, (user) => user.auctionBids)
  @JoinColumn({ name: 'bid_acc' }) // 외래 키 컬럼 명시적으로 지정
  user: User; // 입찰자와의 관계

  // 경매소와의 관계 설정
  @ManyToOne(() => AuctionCow, (auctionCow) => auctionCow.auctionCowBids)
  @JoinColumn({ name: 'acow_seq' }) // 외래 키 컬럼 명시적으로 지정
  auctionCow: AuctionCow; // 입찰자와의 관계
  
}
