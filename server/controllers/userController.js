const User = require('../models/User');

// 모든 사용자 조회
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // password 필드 제외
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 특정 사용자 조회
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.'
      });
    }
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 사용자 생성
exports.createUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    // 필수 필드 검증
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일, 이름, 비밀번호는 필수입니다.'
      });
    }

    // 사용자 생성
    const user = await User.create({
      email,
      name,
      password,
      user_type: user_type || 'customer',
      address
    });

    // password 필드 제외하고 응답
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      data: userResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: '사용자 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 사용자 업데이트
exports.updateUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    // 업데이트할 데이터 구성
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = password;
    if (user_type) updateData.user_type = user_type;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true, // 업데이트된 문서 반환
        runValidators: true // 스키마 검증 실행
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자가 성공적으로 업데이트되었습니다.',
      data: user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: '사용자 업데이트 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 사용자 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.',
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.'
      });
    }
    res.status(500).json({
      success: false,
      message: '사용자 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

