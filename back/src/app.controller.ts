import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('example')
  getExample() {
    return { message: 'Hello from NestJS!' };
  }
}
