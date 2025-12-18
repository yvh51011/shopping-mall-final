// MongoDB 연결 테스트 스크립트
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔍 환경 변수 확인 중...\n');
    
    // 환경 변수 확인
    const atlasURI = process.env.MONGODB_ATLAS_URI;
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('MONGODB_ATLAS_URI:', atlasURI ? `✅ 설정됨 (${atlasURI.substring(0, 30)}...)` : '❌ 설정되지 않음');
    console.log('MONGODB_URI:', mongoURI ? `✅ 설정됨` : '❌ 설정되지 않음');
    console.log('');
    
    // 사용할 URI 결정
    const mongoURI_final = atlasURI || mongoURI || 'mongodb://localhost:27017/shopping-mall';
    
    if (atlasURI) {
      console.log('📡 MongoDB Atlas 연결 시도 중...');
    } else if (mongoURI) {
      console.log('📡 MongoDB URI 연결 시도 중...');
    } else {
      console.log('📡 로컬 MongoDB 연결 시도 중...');
    }
    
    console.log('연결 URI:', mongoURI_final.replace(/\/\/.*@/, '//***:***@')); // 비밀번호 숨김
    console.log('');
    
    // 연결 시도
    const conn = await mongoose.connect(mongoURI_final, {
      serverSelectionTimeoutMS: 5000, // 5초 타임아웃
    });
    
    console.log('✅ MongoDB 연결 성공!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🔌 Ready State: ${conn.connection.readyState === 1 ? 'connected' : 'disconnected'}`);
    
    // 연결 상태 확인
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📚 Collections: ${collections.length}개`);
    if (collections.length > 0) {
      console.log('   -', collections.map(c => c.name).join(', '));
    }
    
    await mongoose.disconnect();
    console.log('\n✅ 테스트 완료 - 연결 종료');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB 연결 실패!');
    console.error('에러 메시지:', error.message);
    console.error('\n가능한 원인:');
    console.error('  1. MONGODB_ATLAS_URI가 올바르지 않습니다.');
    console.error('  2. MongoDB Atlas의 Network Access에서 IP가 허용되지 않았습니다.');
    console.error('  3. 사용자명/비밀번호가 잘못되었습니다.');
    console.error('  4. 클러스터가 실행 중이 아닙니다.');
    console.error('  5. 인터넷 연결이 없습니다.');
    process.exit(1);
  }
};

testConnection();



