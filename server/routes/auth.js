const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// 로그인 (POST /api/auth/login)
router.post('/login', async (req, res) => {
  try {
    console.log('로그인 요청 받음:', req.body);
    console.log('MongoDB 연결 상태:', mongoose.connection.readyState === 1 ? '연결됨' : '연결 안됨');
    
    // MongoDB 연결 확인
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB가 연결되지 않았습니다!');
      return res.status(500).json({
        success: false,
        message: '데이터베이스 연결 오류입니다. 서버 관리자에게 문의하세요.',
        error: 'MongoDB not connected'
      });
    }
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('필수 필드 누락:', { email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 이메일을 소문자로 변환 (일관성 유지)
    const normalizedEmail = email.toLowerCase().trim();

    console.log('사용자 찾기 시도:', normalizedEmail);
    // 사용자 찾기
    const user = await User.findOne({ email: normalizedEmail });
    console.log('사용자 찾기 결과:', user ? '찾음' : '없음');
    
    // 데이터베이스에 있는 모든 이메일 확인 (디버깅용 - 사용자 없을 때만)
    if (!user) {
      try {
        const allUsers = await User.find({}, 'email').limit(10);
        console.log('데이터베이스에 있는 사용자 이메일 목록 (최대 10개):', allUsers.map(u => u.email));
      } catch (err) {
        console.error('사용자 목록 조회 오류:', err);
      }
    }

    if (!user) {
      console.log('사용자를 찾을 수 없음:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        hint: '회원가입을 먼저 진행해주세요.'
      });
    }

    // 비밀번호 확인 (bcrypt 사용)
    console.log('비밀번호 비교 시작');
    console.log('입력된 비밀번호 길이:', password ? password.length : 0);
    console.log('저장된 해시 길이:', user.password ? user.password.length : 0);
    console.log('저장된 해시 시작:', user.password ? user.password.substring(0, 10) : '없음');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('비밀번호 비교 결과:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('비밀번호 불일치 - 로그인 실패');
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // password 필드 제외하고 응답
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('로그인 성공:', userResponse.email);
    res.status(200).json({
      success: true,
      message: '로그인 성공',
      data: userResponse
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 회원가입 (POST /api/auth/register)
router.post('/register', async (req, res) => {
  try {
    console.log('회원가입 요청 받음:', req.body);
    console.log('MongoDB 연결 상태:', mongoose.connection.readyState === 1 ? '연결됨' : '연결 안됨');
    
    // MongoDB 연결 확인
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB가 연결되지 않았습니다!');
      return res.status(500).json({
        success: false,
        message: '데이터베이스 연결 오류입니다. 서버 관리자에게 문의하세요.',
        error: 'MongoDB not connected'
      });
    }
    
    const { email, name, password, user_type, address } = req.body;

    if (!email || !name || !password) {
      console.log('필수 필드 누락:', { email: !!email, name: !!name, password: !!password });
      return res.status(400).json({
        success: false,
        message: '이메일, 이름, 비밀번호는 필수입니다.'
      });
    }

    console.log('사용자 생성 시도:', email);
    
    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 사용자 생성
    const user = await User.create({
      email: email.toLowerCase().trim(),
      name,
      password: hashedPassword,
      user_type: user_type || 'customer',
      address
    });

    console.log('사용자 생성 성공:', user._id);
    // password 필드 제외하고 응답
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: userResponse
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    if (error.code === 11000) {
      console.log('중복 이메일:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('유효성 검사 실패:', messages);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;




