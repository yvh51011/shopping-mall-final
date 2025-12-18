const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MONGODB_ATLAS_URI를 기본으로 사용, 없으면 로컬 MongoDB 사용
    // 참고: MONGODB_ALTAS_URI는 오타이므로 MONGODB_ATLAS_URI를 사용하세요
    const mongoURI = process.env.MONGODB_ATLAS_URI 
      || process.env.MONGODB_ALTAS_URI  // 오타 호환성 유지
      || 'mongodb://localhost:27017/shopping-mall';

    console.log('\n🔍 MongoDB 연결 정보:');
    if (process.env.MONGODB_ALTAS_URI || process.env.MONGODB_ATLAS_URI) {
      const atlasURI = process.env.MONGODB_ALTAS_URI || process.env.MONGODB_ATLAS_URI;
      console.log('📡 MongoDB Atlas 연결 시도 중...');
      console.log('📍 URI:', atlasURI.replace(/\/\/.*@/, '//***:***@'));
    } else {
      console.log('📡 로컬 MongoDB 연결 시도 중...');
      console.log('📍 URI: mongodb://localhost:27017/shopping-mall');
      console.log('⚠️  MONGODB_ALTAS_URI 또는 MONGODB_ATLAS_URI가 설정되지 않아 로컬 MongoDB를 사용합니다.');
    }
    console.log('');

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30초로 증가 (Heroku 환경 고려)
      connectTimeoutMS: 30000, // 연결 타임아웃 30초
      socketTimeoutMS: 45000, // 소켓 타임아웃 45초
      // MongoDB 6.0 이상에서는 더 이상 필요하지 않지만, 호환성을 위해 유지
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB 연결 성공!`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🔌 Ready State: ${conn.connection.readyState === 1 ? 'connected' : 'disconnected'}`);
    
    // 연결 상태 확인
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log(`📚 Collections: ${collections.length}개`);
      if (collections.length > 0) {
        console.log('   -', collections.map(c => c.name).join(', '));
      }
    } catch (err) {
      console.log('⚠️  Collections 목록 조회 실패 (권한 문제일 수 있음)');
    }
    console.log('');
  } catch (error) {
    console.error(`\n❌ MongoDB 연결 실패!`);
    console.error(`에러 메시지: ${error.message}`);
    console.error(`에러 코드: ${error.code || 'N/A'}`);
    console.error(`에러 이름: ${error.name || 'N/A'}`);
    
    // 더 자세한 에러 정보
    if (error.message.includes('authentication failed')) {
      console.error('\n🔐 인증 실패: 사용자명 또는 비밀번호가 잘못되었습니다.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n🌐 DNS 조회 실패: MongoDB 호스트를 찾을 수 없습니다.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n🚫 연결 거부: MongoDB 서버에 연결할 수 없습니다.');
    } else if (error.message.includes('timeout')) {
      console.error('\n⏱️  타임아웃: MongoDB 서버에 연결하는 데 시간이 너무 오래 걸립니다.');
    }
    
    console.error('\n가능한 원인:');
    console.error('  1. MONGODB_ATLAS_URI가 올바르지 않습니다.');
    console.error('  2. MongoDB Atlas의 Network Access에서 IP가 허용되지 않았습니다.');
    console.error('  3. 사용자명/비밀번호가 잘못되었습니다.');
    console.error('  4. 클러스터가 실행 중이 아닙니다.');
    console.error('  5. 인터넷 연결이 없습니다.');
    console.error('  6. 방화벽이나 네트워크 설정 문제');
    
    // 환경 변수 확인
    const hasURI = !!(process.env.MONGODB_ATLAS_URI || process.env.MONGODB_ALTAS_URI);
    if (!hasURI) {
      console.error('\n⚠️  MONGODB_ATLAS_URI 환경 변수가 설정되지 않았습니다!');
      console.error('   .env 파일에 MONGODB_ATLAS_URI를 추가하거나');
      console.error('   Heroku의 경우: heroku config:set MONGODB_ATLAS_URI="your-connection-string"');
    }
    
    console.warn('\n⚠️  MongoDB 없이 서버를 계속 실행합니다. MongoDB 연결이 필요하면 서버를 재시작하세요.\n');
    
    // 에러를 다시 throw하여 호출자가 처리할 수 있도록 함
    throw error;
  }
};

module.exports = connectDB;
