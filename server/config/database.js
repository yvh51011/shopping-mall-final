const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MONGODB_ALTAS_URI 또는 MONGODB_ATLAS_URI를 기본으로 사용, 없으면 로컬 MongoDB 사용
    const mongoURI = process.env.MONGODB_ALTAS_URI 
      || process.env.MONGODB_ATLAS_URI 
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
      serverSelectionTimeoutMS: 10000, // 10초 타임아웃
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
    console.error('\n가능한 원인:');
    console.error('  1. MONGODB_ATLAS_URI가 올바르지 않습니다.');
    console.error('  2. MongoDB Atlas의 Network Access에서 IP가 허용되지 않았습니다.');
    console.error('  3. 사용자명/비밀번호가 잘못되었습니다.');
    console.error('  4. 클러스터가 실행 중이 아닙니다.');
    console.error('  5. 인터넷 연결이 없습니다.');
    console.warn('\n⚠️  MongoDB 없이 서버를 계속 실행합니다. MongoDB 연결이 필요하면 서버를 재시작하세요.\n');
    // process.exit(1) 제거 - 서버는 MongoDB 없이도 실행 가능
  }
};

module.exports = connectDB;
