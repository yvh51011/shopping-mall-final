# Shopping Mall Server

Node.js, Express, MongoDB를 사용한 쇼핑몰 서버 프로젝트입니다.

## 설치 방법

1. 의존성 패키지 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env` 파일이 이미 생성되어 있습니다. 필요에 따라 MongoDB 연결 문자열을 수정하세요.

## 실행 방법

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

서버는 기본적으로 `http://localhost:5000`에서 실행됩니다.

## 프로젝트 구조

```
server/
├── config/
│   └── database.js      # MongoDB 연결 설정
├── routes/              # API 라우트 (추후 추가)
├── models/              # MongoDB 모델 (추후 추가)
├── controllers/         # 컨트롤러 (추후 추가)
├── middleware/          # 커스텀 미들웨어 (추후 추가)
├── server.js            # Express 서버 메인 파일
├── package.json
└── .env                 # 환경 변수 (git에 포함되지 않음)
```

## 주요 패키지

- **express**: 웹 프레임워크
- **mongoose**: MongoDB ODM
- **dotenv**: 환경 변수 관리
- **cors**: CORS 설정
- **nodemon**: 개발 시 자동 재시작 (devDependencies)
