import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, getProducts } from '../utils/api';

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    recentProducts: []
  });

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
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success) {
        // 전체 상품 수를 가져오기 위해 큰 limit으로 다시 요청
        const allProductsResponse = await getProducts({
          page: 1,
          limit: 1000,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

        setStats({
          totalProducts: allProductsResponse.total || allProductsResponse.data?.length || 0,
          recentProducts: response.data || []
        });
      }
    } catch (error) {
      console.error('통계 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      paddingTop: '80px'
    },
    header: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #e0e0e0',
      padding: '30px 40px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    headerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    userName: {
      fontSize: '1rem',
      color: '#666'
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '40px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    },
    statCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '12px',
      fontWeight: '500'
    },
    statValue: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#333'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    },
    actionCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block'
    },
    actionTitle: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: '#333'
    },
    actionDescription: {
      fontSize: '0.95rem',
      color: '#666',
      lineHeight: '1.6'
    },
    recentProductsCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '24px',
      color: '#333'
    },
    productList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    productItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textDecoration: 'none',
      color: 'inherit'
    },
    productImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      backgroundColor: '#f5f5f5'
    },
    productInfo: {
      flex: 1
    },
    productName: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '4px',
      color: '#333'
    },
    productMeta: {
      fontSize: '0.85rem',
      color: '#666'
    },
    productPrice: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#333'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontSize: '1.2rem',
      color: '#666'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>관리자 대시보드</h1>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name}님</span>
            <Link
              to="/"
              style={{
                padding: '8px 16px',
                backgroundColor: '#333',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#555';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
              }}
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div style={styles.content}>
        {/* 통계 카드 */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>전체 상품 수</div>
            <div style={styles.statValue}>{stats.totalProducts}</div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div style={styles.actionsGrid}>
          <Link
            to="/admin/products/create"
            style={styles.actionCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <div style={styles.actionTitle}>➕ 새 상품 등록</div>
            <div style={styles.actionDescription}>
              새로운 상품을 등록하고 관리하세요.
            </div>
          </Link>

          <Link
            to="/admin/products"
            style={styles.actionCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <div style={styles.actionTitle}>📦 상품 목록 관리</div>
            <div style={styles.actionDescription}>
              등록된 모든 상품을 조회, 수정, 삭제할 수 있습니다.
            </div>
          </Link>
        </div>

        {/* 최근 등록된 상품 */}
        <div style={styles.recentProductsCard}>
          <h2 style={styles.sectionTitle}>최근 등록된 상품</h2>
          {stats.recentProducts.length > 0 ? (
            <div style={styles.productList}>
              {stats.recentProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/admin/products/${product._id}`}
                  style={styles.productItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                    e.currentTarget.style.borderColor = '#ccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAwIiB5PSI1MDAiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  ) : (
                    <div style={{
                      ...styles.productImage,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '0.8rem'
                    }}>
                      이미지 없음
                    </div>
                  )}
                  <div style={styles.productInfo}>
                    <div style={styles.productName}>{product.name}</div>
                    <div style={styles.productMeta}>
                      {product.developer && `개발자: ${product.developer} • `}
                      {product.createdAt && new Date(product.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div style={styles.productPrice}>
                    ₩{product.price?.toLocaleString() || 0}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              등록된 상품이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
