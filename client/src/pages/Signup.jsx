import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, getCurrentUser, testServerConnection } from '../utils/api';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    address: ''
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
    if (!formData.email || !formData.name || !formData.password) {
      setError('이메일, 이름, 비밀번호는 필수입니다.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await register(userData);
      
      if (response.success) {
        // 회원가입 성공 - Navbar 업데이트를 위한 이벤트 발생
        window.dispatchEvent(new Event('userLogin'));
        alert('회원가입에 성공했습니다!');
        navigate('/');
      } else {
        setError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Signup error:', err);
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
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>회원가입</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#000'
          }}>
            이메일 주소 <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="예: example@email.com"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#666', 
            marginTop: '4px',
            marginBottom: '0'
          }}>
            이메일 주소를 아이디로 사용합니다.
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#000'
          }}>
            이름 <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="예: 홍길동"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#666', 
            marginTop: '4px',
            marginBottom: '0'
          }}>
            서비스에서 표시될 이름을 입력해주세요.
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#000'
          }}>
            비밀번호 <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="최소 4자 이상"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#666', 
            marginTop: '4px',
            marginBottom: '0'
          }}>
            비밀번호는 최소 4자 이상이어야 합니다.
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#000'
          }}>
            비밀번호 확인 <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="위에서 입력한 비밀번호를 다시 입력하세요"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#666', 
            marginTop: '4px',
            marginBottom: '0'
          }}>
            비밀번호를 정확히 입력했는지 확인하기 위해 다시 입력해주세요.
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#000'
          }}>
            주소 (선택사항)
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="예: 서울특별시 강남구 테헤란로 123"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#666', 
            marginTop: '4px',
            marginBottom: '0'
          }}>
            배송이 필요한 경우 주소를 입력해주세요. (선택사항)
          </p>
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
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontSize: '1.1rem' }}>
            로그인
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

export default Signup;




