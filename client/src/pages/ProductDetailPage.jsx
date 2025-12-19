import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProductById } from '../utils/api';

function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('상품 상세 정보 가져오기:', id);
        const response = await getProductById(id);
        
        console.log('상품 상세 응답:', response);
        
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError(response.message || '상품을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('상품 상세 조회 오류:', err);
        setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError('상품 ID가 없습니다.');
      setLoading(false);
    }
  }, [id]);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      paddingTop: '80px'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px'
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: 'transparent',
      color: '#90EE90',
      border: '1px solid #90EE90',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      marginBottom: '30px',
      textDecoration: 'none',
      transition: 'all 0.2s'
    },
    productContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '60px',
      marginTop: '30px'
    },
    imageSection: {
      position: 'relative'
    },
    productImage: {
      width: '100%',
      height: '500px',
      objectFit: 'cover',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    infoSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    productName: {
      fontSize: 'clamp(2rem, 4vw, 3.5rem)',
      fontWeight: 'bold',
      marginBottom: '16px',
      lineHeight: '1.2'
    },
    productPrice: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#90EE90',
      marginBottom: '24px'
    },
    productDescription: {
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: '24px'
    },
    productMeta: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    metaItem: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '1rem'
    },
    metaLabel: {
      color: 'rgba(255, 255, 255, 0.6)'
    },
    metaValue: {
      color: '#fff',
      fontWeight: '500'
    },
    linkButton: {
      display: 'inline-block',
      padding: '16px 32px',
      backgroundColor: '#90EE90',
      color: '#000',
      textDecoration: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '600',
      textAlign: 'center',
      transition: 'all 0.2s',
      marginTop: '20px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontSize: '1.5rem',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#ff5252'
    },
    errorMessage: {
      fontSize: '1.2rem',
      marginBottom: '20px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.loadingContainer}>
            상품 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.errorContainer}>
            <div style={styles.errorMessage}>
              {error || '상품을 찾을 수 없습니다.'}
            </div>
            <Link 
              to="/" 
              style={styles.backButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#90EE90';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#90EE90';
              }}
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <Link 
          to="/" 
          style={styles.backButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#90EE90';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#90EE90';
          }}
        >
          ← 뒤로 가기
        </Link>

        <div style={styles.productContainer}>
          {/* 이미지 섹션 */}
          <div style={styles.imageSection}>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                style={styles.productImage}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzBhMGEwYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
              />
            ) : (
              <div style={{
                ...styles.productImage,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '1.2rem'
              }}>
                이미지 없음
              </div>
            )}
          </div>

          {/* 정보 섹션 */}
          <div style={styles.infoSection}>
            <h1 style={styles.productName}>{product.name}</h1>
            <div style={styles.productPrice}>
              ₩{product.price?.toLocaleString() || 0}
            </div>
            
            {product.description && (
              <div style={styles.productDescription}>
                {product.description}
              </div>
            )}

            <div style={styles.productMeta}>
              {product.developer && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>개발자</span>
                  <span style={styles.metaValue}>{product.developer}</span>
                </div>
              )}
              {product.createdAt && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>등록일</span>
                  <span style={styles.metaValue}>
                    {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
            </div>

            {product.link && (
              <a 
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.linkButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                프로그램 보기 →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
