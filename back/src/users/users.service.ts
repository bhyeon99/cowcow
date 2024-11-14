import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // 모든 사용자 조회
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // 사용자 생성 (회원가입)
  async create(userData: Partial<User>): Promise<User> {
    // 비밀번호를 암호화하지 않고 그대로 저장
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async findUser(usrEml: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { usrEml: usrEml },
    });
    
    return user ? false : true;
  }
  

  // 비밀번호 확인 메서드 추가
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { usrEml: email },
    });
    if (user && user.usrPwd === password) {
      // 비밀번호가 일치하는 경우
      return user; // 사용자 반환
    }
    return null; // 비밀번호가 일치하지 않는 경우 null 반환
  }

  // 사용자 삭제 (회원탈퇴)
  async deleteUser(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findOrCreateUser(userData: any): Promise<User> {
    const { kakaoId, email, nickname } = userData;

    // DB에서 카카오 아이디로 유저 조회
    let user = await this.usersRepository.findOne({ where: { usrAcc: kakaoId } });

    const now = new Date();
    // 유저가 없으면 새로 생성
    if (!user) {
      user = this.usersRepository.create({
        usrAcc: kakaoId,
        usrTyp: '카카오로그인',
        usrEml: email,
        usrNm: nickname,
        usrCrtDt: new Date(now.getTime()),
      });
      await this.usersRepository.save(user);
    }

    return user;
  }

  // 사용자 정보 업데이트
  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.usersRepository.findOneBy({ usrSeq: id });
  }
}
