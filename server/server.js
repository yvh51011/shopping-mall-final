require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB 연결 이벤트 리스너 설정
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB 연결됨');
  console.log(`📍 Host: ${mongoose.connection.host}`);
  console.log(`📦 Database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB 연결 오류:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB 연결 끊어짐');
});

// 프로세스 종료 시 MongoDB 연결 종료
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB 연결이 종료되었습니다.');
  process.exit(0);
});

// MongoDB 연결 시도
connectDB().catch(err => {
  console.error('MongoDB 초기 연결 실패:', err.message);
});

// MongoDB 연결 상태 주기적 확인 및 재연결 시도
setInterval(() => {
  if (mongoose.connection.readyState === 0) {
    console.log('🔄 MongoDB 연결이 끊어졌습니다. 재연결 시도 중...');
    connectDB().catch(err => {
      console.error('MongoDB 재연결 실패:', err.message);
    });
  }
}, 30000); // 30초마다 확인


// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shopping Mall API Server is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'ok',
    mongodb: {
      state: states[readyState] || 'unknown',
      readyState: readyState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
      isConnected: readyState === 1
    },
    timestamp: new Date().toISOString()
  });
});

// MongoDB 연결 상태 상세 확인 엔드포인트
app.get('/api/mongodb-status', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const mongoURI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_ALTAS_URI;
  const hasURI = !!mongoURI;
  
  res.json({
    connection: {
      state: states[readyState] || 'unknown',
      readyState: readyState,
      isConnected: readyState === 1,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
      port: mongoose.connection.port || null
    },
    environment: {
      hasMongoURI: hasURI,
      uriPrefix: hasURI ? mongoURI.substring(0, 20) + '...' : 'not set',
      nodeEnv: process.env.NODE_ENV || 'not set'
    },
    timestamp: new Date().toISOString()
  });
});

// API 라우트
try {
  app.use('/api/products', require('./routes/products'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ All API routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  console.error(error.stack);
  process.exit(1);
}

// 라우트 등록 확인 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  console.log('API Routes registered:');
  console.log('  - /api/products');
  console.log('  - /api/users');
  console.log('  - /api/auth');
}

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 서버 시작
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
});

// 서버 에러 핸들링
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error('Please stop the existing server or use a different port.');
    console.error('To find and kill the process:');
    console.error(`  Windows: netstat -ano | findstr :${PORT}`);
    console.error(`  Then: taskkill /PID <PID> /F`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
