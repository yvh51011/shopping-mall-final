const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // 1. 상품 id (MongoDB의 _id를 사용하거나, 명시적인 productId 필드 추가 가능)
  productId: {
    type: String,
    unique: true,
    trim: true,
    index: true
  },
  // 2. 상품(프로그램 이름)
  name: {
    type: String,
    required: [true, '상품(프로그램 이름)을 입력해주세요.'],
    trim: true
  },
  // 3. 상품 가격
  price: {
    type: Number,
    required: [true, '상품 가격을 입력해주세요.'],
    min: [0, '가격은 0 이상이어야 합니다.']
  },
  // 4. 상품 이미지
  image: {
    type: String,
    required: [true, '상품 이미지를 입력해주세요.'],
    trim: true
  },
  // 5. 상품 설명
  description: {
    type: String,
    required: [true, '상품 설명을 입력해주세요.'],
    trim: true
  },
  // 6. 프로그램 링크
  link: {
    type: String,
    required: [true, '프로그램 링크를 입력해주세요.'],
    trim: true,
    validate: {
      validator: function(v) {
        // URL 형식 검증 (http:// 또는 https://로 시작)
        return /^https?:\/\/.+/.test(v);
      },
      message: '유효한 URL 형식이 아닙니다. (http:// 또는 https://로 시작해야 합니다)'
    }
  },
  // 7. 개발자 이름
  developer: {
    type: String,
    required: [true, '개발자 이름을 입력해주세요.'],
    trim: true
  },
  // 8. 등록자 정보 (상품을 등록한 사용자)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: false // 선택적 필드로 변경
  }
}, {
  timestamps: true
});

// productId 자동 생성 (저장 전에 생성)
productSchema.pre('save', function(next) {
  if (!this.productId && this.isNew) {
    // 새 문서인 경우 ObjectId를 미리 생성하여 productId로 사용
    this.productId = new mongoose.Types.ObjectId().toString();
  }
  next();
});

// 중복 에러 처리
productSchema.post('save', function(error, doc, next) {
  if (error && error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('이미 존재하는 상품 ID입니다.'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Product', productSchema);

