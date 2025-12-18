require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB 연결 (비동기 - 서버 시작을 막지 않음)
connectDB().catch(err => {
  console.error('MongoDB 연결 중 오류:', err);
});


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
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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
