import { Controller, Post, Body, Get, Delete, Param, Res, HttpStatus, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':usrEml')
  async confirmUser(@Param('usrEml') usrEml: string): Promise<boolean> {
    return this.usersService.findUser(usrEml);
  }

  @Post('signup') // POST /users/signup
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
  }

  @Post('login') // POST /users/login
  async loginUser(@Body() userData: { usrEml: string; usrPwd: string }): Promise<User | null> {
    return this.usersService.validateUser(userData.usrEml, userData.usrPwd);
  }

  @Delete('delete/:id') // DELETE /users/:id
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteUser(id);
  }

  @Post('kakao-login')
  async kakaoLogin(@Body() userData: any, @Res() res) {
    try {
      const user = await this.usersService.findOrCreateUser(userData);
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      console.error('카카오 로그인 처리 실패:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '카카오 로그인 처리 실패' });
    }
  }

    // 사용자 정보 업데이트
  @Patch(':id') // PATCH /users/:id
  async updateUser(@Param('id') id: number, @Body() updateData: Partial<User>): Promise<User> {
    return this.usersService.updateUser(id, updateData);
  }
}
