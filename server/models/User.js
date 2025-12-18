const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일을 입력해주세요.'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    validate: {
      validator: function(v) {
        // 간단한 이메일 형식 검증
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: '유효한 이메일 형식이 아닙니다.'
    }
  },
  name: {
    type: String,
    required: [true, '이름을 입력해주세요.'],
    trim: true
  },
  password: {
    type: String,
    required: [true, '비밀번호를 입력해주세요.'],
    minlength: [4, '비밀번호는 최소 4자 이상이어야 합니다.']
  },
  user_type: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 이메일 중복 에러 처리
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('이미 존재하는 이메일입니다.'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);
