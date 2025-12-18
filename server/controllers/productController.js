const Product = require('../models/Product');

// 공통 에러 핸들러
const handleError = (error, res, defaultMessage) => {
  console.error('Product Controller Error:', error);

  // CastError: 잘못된 ID 형식
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: '유효하지 않은 상품 ID입니다.'
    });
  }

  // 중복 키 에러
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: '이미 존재하는 상품 ID입니다.'
    });
  }

  // 유효성 검사 에러
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: '입력 데이터가 유효하지 않습니다.',
      errors: messages
    });
  }

  // 기본 에러
  return res.status(500).json({
    success: false,
    message: defaultMessage || '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// URL 유효성 검증
const validateURL = (url, fieldName = 'URL') => {
  const urlPattern = /^https?:\/\/.+/;
  return urlPattern.test(url);
};

// 가격 유효성 검증
const validatePrice = (price) => {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
};

// 모든 상품 조회 (페이지네이션 및 필터링 지원)
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // 검색 필터 (선택사항)
    const searchQuery = {};
    if (req.query.search) {
      searchQuery.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { developer: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // 개발자 필터 (선택사항)
    if (req.query.developer) {
      searchQuery.developer = { $regex: req.query.developer, $options: 'i' };
    }

    // 등록자 필터 (선택사항) - 특정 사용자가 등록한 상품만 조회
    if (req.query.createdBy) {
      searchQuery.createdBy = req.query.createdBy;
    }

    // 가격 범위 필터 (선택사항)
    if (req.query.minPrice || req.query.maxPrice) {
      searchQuery.price = {};
      if (req.query.minPrice) {
        searchQuery.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        searchQuery.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // 상품 조회 (등록자 정보 포함)
    const products = await Product.find(searchQuery)
      .populate('createdBy', 'name email user_type')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // 전체 개수
    const total = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    console.log(`상품 조회 성공: ${products.length}개 (전체 ${total}개, 페이지 ${page}/${totalPages})`);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data: products
    });
  } catch (error) {
    handleError(error, res, '상품 조회 중 오류가 발생했습니다.');
  }
};

// 특정 상품 조회
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email user_type');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    handleError(error, res, '상품 조회 중 오류가 발생했습니다.');
  }
};

// 특정 사용자가 등록한 상품 조회
exports.getProductsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // 사용자 ID 검증
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.'
      });
    }

    // 해당 사용자가 등록한 상품 조회
    const products = await Product.find({ createdBy: userId })
      .populate('createdBy', 'name email user_type')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // 전체 개수
    const total = await Product.countDocuments({ createdBy: userId });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data: products
    });
  } catch (error) {
    handleError(error, res, '사용자 상품 조회 중 오류가 발생했습니다.');
  }
};

// 상품 생성
exports.createProduct = async (req, res) => {
  try {
    console.log('상품 생성 요청 받음:', {
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const { productId, name, price, image, description, link, developer } = req.body;

    // 필수 필드 검증
    const requiredFields = { name, price, image, description, link, developer };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log('필수 필드 누락:', missingFields);
      return res.status(400).json({
        success: false,
        message: '모든 필수 필드를 입력해주세요.',
        missingFields
      });
    }

    // 가격 유효성 검증
    if (!validatePrice(price)) {
      return res.status(400).json({
        success: false,
        message: '가격은 0 이상의 숫자여야 합니다.'
      });
    }

    // 이미지 URL 검증 (Cloudinary URL 또는 일반 URL 모두 허용)
    if (image && !validateURL(image, '이미지')) {
      return res.status(400).json({
        success: false,
        message: '상품 이미지는 http:// 또는 https://로 시작하는 유효한 URL이어야 합니다.'
      });
    }

    // 프로그램 링크 URL 검증
    if (!validateURL(link, '프로그램 링크')) {
      return res.status(400).json({
        success: false,
        message: '프로그램 링크는 http:// 또는 https://로 시작하는 유효한 URL이어야 합니다.'
      });
    }

    // 상품 생성 데이터 구성
    const productData = {
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
      description: description.trim(),
      link: link.trim(),
      developer: developer.trim()
    };

    // productId가 제공된 경우에만 추가
    if (productId && productId.trim()) {
      productData.productId = productId.trim();
    }

    // 등록자 정보 추가 (요청 헤더나 body에서 가져오기)
    // 실제 구현 시 인증 미들웨어에서 req.user를 설정해야 함
    if (req.body.createdBy) {
      if (mongoose.Types.ObjectId.isValid(req.body.createdBy)) {
        productData.createdBy = req.body.createdBy;
      } else {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 등록자 ID입니다.'
        });
      }
    }

    // 상품 생성
    console.log('상품 생성 데이터:', productData);
    const product = await Product.create(productData);
    console.log('상품 생성 성공:', {
      id: product._id,
      productId: product.productId,
      name: product.name
    });

    res.status(201).json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다.',
      data: product
    });
  } catch (error) {
    console.error('상품 생성 오류:', error);
    handleError(error, res, '상품 등록 중 오류가 발생했습니다.');
  }
};

// 상품 업데이트
exports.updateProduct = async (req, res) => {
  try {
    const { productId, name, price, image, description, link, developer } = req.body;

    // 업데이트할 데이터 구성
    const updateData = {};

    if (productId !== undefined && productId !== null && productId !== '') {
      updateData.productId = productId.trim();
    }

    if (name !== undefined && name !== null && name !== '') {
      updateData.name = name.trim();
    }

    if (price !== undefined && price !== null) {
      if (!validatePrice(price)) {
        return res.status(400).json({
          success: false,
          message: '가격은 0 이상의 숫자여야 합니다.'
        });
      }
      updateData.price = Number(price);
    }

    if (image !== undefined && image !== null && image !== '') {
      // Cloudinary URL 또는 일반 URL 모두 허용
      if (image.trim() && !validateURL(image, '이미지')) {
        return res.status(400).json({
          success: false,
          message: '상품 이미지는 http:// 또는 https://로 시작하는 유효한 URL이어야 합니다.'
        });
      }
      updateData.image = image.trim();
    }

    if (description !== undefined && description !== null && description !== '') {
      updateData.description = description.trim();
    }

    if (link !== undefined && link !== null && link !== '') {
      if (!validateURL(link, '프로그램 링크')) {
        return res.status(400).json({
          success: false,
          message: '프로그램 링크는 http:// 또는 https://로 시작하는 유효한 URL이어야 합니다.'
        });
      }
      updateData.link = link.trim();
    }

    if (developer !== undefined && developer !== null && developer !== '') {
      updateData.developer = developer.trim();
    }

    // 업데이트할 데이터가 없는 경우
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '업데이트할 데이터가 없습니다.'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 업데이트되었습니다.',
      data: product
    });
  } catch (error) {
    handleError(error, res, '상품 업데이트 중 오류가 발생했습니다.');
  }
};

// 상품 삭제
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다.',
      data: {
        deletedProductId: product._id,
        deletedProductName: product.name
      }
    });
  } catch (error) {
    handleError(error, res, '상품 삭제 중 오류가 발생했습니다.');
  }
};






