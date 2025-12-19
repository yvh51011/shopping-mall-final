import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getCurrentUser, testServerConnection } from '../utils/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate('/');
    }
    
    // 서버 연결 상태 확인
    testServerConnection().then(status => {
      setServerStatus(status);
      if (status.status === 'error' || (status.mongodb && status.mongodb === 'disconnected')) {
        setError('서버 연결 오류: 서버가 실행 중인지 확인해주세요.');
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    // 이메일 형식 기본 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('유효한 이메일 형식을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('로그인 시도:', { email: formData.email.trim(), passwordLength: formData.password.length });
      
      const response = await login({
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('로그인 응답:', response);
      
      if (response && response.success === true) {
        // 로그인 성공 - Navbar 업데이트를 위한 이벤트 발생
        window.dispatchEvent(new Event('userLogin'));
        // 로그인 성공 - 홈으로 이동
        console.log('로그인 성공, 홈으로 이동');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        // 로그인 실패 - 에러 메시지 표시
        const errorMessage = response?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
        console.error('로그인 실패:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#fff',
      padding: '50px 20px'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        margin: '0 auto', 
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center'
      }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>로그인</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '1.1rem' }}>
            이메일:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '1.1rem' }}>
            비밀번호:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {serverStatus && serverStatus.mongodb === 'disconnected' && (
          <div style={{
            color: 'orange',
            marginBottom: '20px',
            padding: '12px',
            fontSize: '0.9rem',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            ⚠️ 데이터베이스 연결 안됨: MongoDB가 연결되지 않았습니다.
          </div>
        )}
        
        {error && (
          <div style={{
            color: 'red',
            marginBottom: '20px',
            padding: '12px',
            fontSize: '1rem',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.2rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
          계정이 없으신가요?{' '}
          <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none', fontSize: '1.1rem' }}>
            회원가입
          </Link>
        </p>
        <p style={{ fontSize: '1.1rem' }}>
          <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '1.1rem' }}>
            홈으로 돌아가기
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}

export default Login;

