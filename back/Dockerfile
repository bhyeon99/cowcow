# NestJS를 위한 Node.js 기반 이미지 사용
FROM node:18-alpine

# 작업 디렉터리 설정
WORKDIR /app

# package.json과 관련 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# NestJS 빌드
RUN npm run build

# 서버 실행
CMD ["npm", "run", "start:prod"]

# 컨테이너가 사용할 포트
EXPOSE 3001
