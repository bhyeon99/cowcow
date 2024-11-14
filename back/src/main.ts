import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 (React와의 통신 허용)
  app.enableCors({
    origin: '*', // React 개발 서버 주소
    credentials: true,
  });

  // 요청 유효성 검사용 파이프라인 설정
  app.useGlobalPipes(new ValidationPipe());

  // 모든 인터페이스에서 접근 가능하도록 설정
  await app.listen(3001, '0.0.0.0');  
  console.log('NestJS server is running on http://0.0.0.0:3001');
}
bootstrap();
