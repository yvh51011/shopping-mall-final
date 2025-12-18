import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 1234,
    totalProducts: 156,
    totalCustomers: 2345,
    totalSales: 45678
  });
  const [recentOrders, setRecentOrders] = useState([
    {
      id: 'ORD-001234',
      customer: '김민수',
      date: '2024-12-30',
      status: '처리중',
      amount: 219
    },
    {
      id: 'ORD-001233',
      customer: '이영희',
      date: '2024-12-29',
      status: '송중',
      amount: 156
    },
    {
      id: 'ORD-001232',
      customer: '박준호',
      date: '2024-12-29',
      status: '완료',
      amount: 342
    }
  ]);

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

  const getStatusColor = (status) => {
    switch(status) {
      case '완료': return '#4CAF50';
      case '처리중': return '#FF9800';
      case '송중': return '#2196F3';
      default: return '#757575';
    }
  };

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
          CIDER ADMIN
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
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
            margin: 0
          }}>
            CIDER 쇼핑몰 관리 시스템에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* 총 주문 */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  총 주문
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {stats.totalOrders.toLocaleString()}
                </div>
              </div>
              <div style={{
                fontSize: '2rem',
                color: '#4CAF50'
              }}>
                🛒
              </div>
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: '#4CAF50',
              fontWeight: '500'
            }}>
              +12% from last month
            </div>
          </div>

          {/* 총 상품 */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  총 상품
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {stats.totalProducts.toLocaleString()}
                </div>
              </div>
              <div style={{
                fontSize: '2rem',
                color: '#2196F3'
              }}>
                📦
              </div>
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: '#4CAF50',
              fontWeight: '500'
            }}>
              +3% from last month
            </div>
          </div>

          {/* 총 고객 */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  총 고객
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {stats.totalCustomers.toLocaleString()}
                </div>
              </div>
              <div style={{
                fontSize: '2rem',
                color: '#FF9800'
              }}>
                👥
              </div>
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: '#4CAF50',
              fontWeight: '500'
            }}>
              +8% from last month
            </div>
          </div>

          {/* 총 매출 */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  총 매출
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  ${stats.totalSales.toLocaleString()}
                </div>
              </div>
              <div style={{
                fontSize: '2rem',
                color: '#9C27B0'
              }}>
                📈
              </div>
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: '#4CAF50',
              fontWeight: '500'
            }}>
              +15% from last month
            </div>
          </div>
        </div>

        {/* 하단 레이아웃: 빠른 작업 + 최근 주문 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '20px'
        }}>
          {/* 빠른 작업 */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
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

          {/* 최근 주문 */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#333',
                margin: 0
              }}>
                최근 주문
              </h2>
              <Link 
                to="#"
                style={{
                  fontSize: '0.9rem',
                  color: '#2196F3',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                전체보기
              </Link>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '4px'
                    }}>
                      {order.id}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#666',
                      marginBottom: '2px'
                    }}>
                      {order.customer} · {order.date}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: getStatusColor(order.status) + '20',
                      color: getStatusColor(order.status),
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {order.status}
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      ${order.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
