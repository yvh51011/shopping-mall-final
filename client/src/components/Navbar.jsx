import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/api';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 사용자 정보 확인
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // localStorage 변경 감지
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    // 컴포넌트 마운트 시에도 확인
    const interval = setInterval(() => {
      const updatedUser = getCurrentUser();
      if (updatedUser !== user) {
        setUser(updatedUser);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
    window.location.reload(); // 페이지 새로고침으로 상태 업데이트
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: '#000000',
      backdropFilter: 'blur(10px)',
      borderBottom: 'none',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{
        color: '#fff',
        textDecoration: 'none',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'
      }}>
        Jeonbuk National University
      </Link>
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          color: '#fff',
          textDecoration: 'none',
          fontSize: '1rem',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
          전북대학교 영어영문학과
        </Link>
        <Link to="/" style={{
          color: '#90EE90',
          textDecoration: 'none',
          fontSize: '1rem',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
          코드로 세상을 바꾸다
        </Link>
        
        {user ? (
          <>
            <span style={{
              color: '#90EE90',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              {user.name}님 환영합니다
            </span>
            {user.user_type === 'admin' && (
              <Link to="/admin" style={{
                color: '#ffd700',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '8px 16px',
                border: '1px solid #ffd700',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffd700';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ffd700';
              }}>
                관리자
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                color: '#fff',
                backgroundColor: 'transparent',
                border: '1px solid #fff',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#fff';
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: '#fff',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              로그인
            </Link>
            <Link to="/signup" style={{
              color: '#fff',
              textDecoration: 'none',
              fontSize: '1rem',
              padding: '8px 16px',
              border: '1px solid #fff',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#fff';
            }}>
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

