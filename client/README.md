# Shopping Mall Client

Vite와 React를 사용한 쇼핑몰 클라이언트 프로젝트입니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구 및 개발 서버
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **ESLint** - 코드 린팅

## 설치 방법

1. 의존성 패키지 설치:
```bash
npm install
```

2. 환경 변수 설정 (선택사항):
`.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```bash
VITE_API_BASE_URL=http://localhost:5000
```

## 실행 방법

### 개발 모드
```bash
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 프로덕션 빌드
```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 프로덕션 미리보기
```bash
npm run preview
```

빌드된 프로덕션 버전을 미리 볼 수 있습니다.

## 프로젝트 구조

```
client/
├── public/              # 정적 파일
│   └── vite.svg
├── src/
│   ├── components/      # React 컴포넌트 (추후 추가)
│   ├── pages/           # 페이지 컴포넌트 (추후 추가)
│   ├── utils/           # 유틸리티 함수
│   │   └── api.js       # API 클라이언트 설정
│   ├── App.jsx          # 메인 App 컴포넌트
│   ├── App.css          # App 스타일
│   ├── main.jsx         # 진입점
│   └── index.css        # 전역 스타일
├── .eslintrc.cjs        # ESLint 설정
├── .gitignore
├── index.html           # HTML 템플릿
├── package.json
├── vite.config.js       # Vite 설정
└── README.md
```

## 주요 기능

- ⚡️ Vite를 통한 빠른 개발 서버 및 HMR (Hot Module Replacement)
- 🔄 React Router를 통한 라우팅 지원
- 🌐 Axios를 통한 API 통신
- 🎨 모던한 CSS 스타일링
- 🔍 ESLint를 통한 코드 품질 관리

## Vite 설정

`vite.config.js`에서 다음 설정이 포함되어 있습니다:

- React 플러그인
- 개발 서버 포트: 3000
- API 프록시: `/api` 요청을 `http://localhost:5000`으로 프록시

## 개발 팁

- Vite는 매우 빠른 HMR을 제공합니다. 파일을 저장하면 즉시 브라우저에 반영됩니다.
- `src/utils/api.js`에서 API 클라이언트를 설정하여 서버와 통신할 수 있습니다.
- 환경 변수는 `VITE_` 접두사를 붙여야 Vite에서 접근 가능합니다.

