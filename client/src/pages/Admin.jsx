import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    
    // 로그인 확인
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // 어드민 권한 확인
    if (currentUser.user_type !== 'admin') {
      alert('관리자 권한이 필요합니다.');
      navigate('/');
      return;
    }

    setUser(currentUser);
    setLoading(false);
    
    // TODO: 실제 API에서 통계 데이터 가져오기
    // fetchStats();
    // fetchRecentOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'
    }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#333'
        }}>
          전북대 영어영문학과
        </div>
        <Link 
          to="/"
          style={{
            padding: '10px 20px',
            backgroundColor: '#333',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#555';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
          }}
        >
          쇼핑몰로 돌아가기
        </Link>
      </header>

      {/* 메인 컨텐츠 */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px'
      }}>
        {/* 제목 및 환영 메시지 */}
        <div style={{
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333'
          }}>
            관리자 대시보드
          </h1>
        </div>

        {/* 빠른 작업 */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          maxWidth: '600px'
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#333'
          }}>
            빠른 작업
          </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <Link
                to="/admin/products"
                style={{
                  padding: '14px 20px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000';
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>📦</span>
                상품 관리
              </Link>
              
              <Link
                to="/admin/products/create"
                style={{
                  padding: '14px 20px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#ccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>+</span>
                새 상품 등록
              </Link>
              
              <button style={{
                padding: '14px 20px',
                backgroundColor: 'transparent',
                color: '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#ccc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}>
                <span style={{ fontSize: '1.1rem' }}>👁️</span>
                주문 관리
              </button>
              
              <button style={{
                padding: '14px 20px',
                backgroundColor: 'transparent',
                color: '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#ccc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}>
                <span style={{ fontSize: '1.1rem' }}>📊</span>
                매출 분석
              </button>
              
              <button style={{
                padding: '14px 20px',
                backgroundColor: 'transparent',
                color: '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#ccc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}>
                <span style={{ fontSize: '1.1rem' }}>👥</span>
                고객 관리
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}

export default Admin;
