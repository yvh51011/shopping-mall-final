const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI가 설정되지 않았습니다. MongoDB 연결을 건너뜁니다.');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // MongoDB 6.0 이상에서는 더 이상 필요하지 않지만, 호환성을 위해 유지
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB 연결 실패: ${error.message}`);
    console.warn('MongoDB 없이 서버를 계속 실행합니다. MongoDB 연결이 필요하면 서버를 재시작하세요.');
    // process.exit(1) 제거 - 서버는 MongoDB 없이도 실행 가능
  }
};

module.exports = connectDB;
