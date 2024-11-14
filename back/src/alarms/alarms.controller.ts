import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AlarmsService } from './alarms.service';

@Controller('alarms')
export class AlarmsController {
  constructor(private readonly alarmsService: AlarmsService) {}

  @Get(':userId')
  async getUserAlarms(@Param('userId') userId: number) {
    const alarm = this.alarmsService.getUserAlarms(userId);
    return alarm;
  }

  @Post()
  async createAlarm(@Body() body: { userId: number; message: string }) {
    return this.alarmsService.createAlarm(body.userId, body.message);
  }
}
