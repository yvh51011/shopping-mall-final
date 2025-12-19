import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
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
      </div>
    </nav>
  );
}

export default Navbar;

