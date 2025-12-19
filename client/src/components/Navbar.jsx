import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/api';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 로그인 상태 확인
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // 로컬 스토리지 변경 감지 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 커스텀 이벤트 리스너 (같은 탭에서 로그인 시)
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    console.log('로그인 클릭');
    navigate('/login');
  };

  const handleSignupClick = (e) => {
    e.preventDefault();
    console.log('회원가입 클릭');
    navigate('/signup');
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
      <Link 
        to="/" 
        style={{
          color: '#fff',
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
          cursor: 'pointer'
        }}
      >
        Jeonbuk National University
      </Link>
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}>
        <Link 
          to="/" 
          style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1rem',
            transition: 'opacity 0.2s',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          전북대학교 영어영문학과
        </Link>
        <Link 
          to="/" 
          style={{
            color: '#90EE90',
            textDecoration: 'none',
            fontSize: '1rem',
            transition: 'opacity 0.2s',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          코드로 세상을 바꾸다
        </Link>
        
        {user ? (
          // 로그인된 사용자 메뉴
          <>
            <span style={{ color: '#90EE90', fontSize: '1rem' }}>
              {user.name}님
            </span>
            {user.user_type === 'admin' && (
              <Link 
                to="/admin"
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  padding: '8px 16px',
                  border: '1px solid #90EE90',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#90EE90';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                관리자
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                color: '#fff',
                backgroundColor: 'transparent',
                border: '1px solid #fff',
                borderRadius: '4px',
                padding: '8px 16px',
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
          // 로그인하지 않은 사용자 메뉴
          <>
            <Link 
              to="/login"
              onClick={handleLoginClick}
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'opacity 0.2s',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              로그인
            </Link>
            <Link 
              to="/signup"
              onClick={handleSignupClick}
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1rem',
                padding: '8px 16px',
                border: '1px solid #fff',
                borderRadius: '4px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                pointerEvents: 'auto'
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
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

