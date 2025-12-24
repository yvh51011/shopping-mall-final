import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getCurrentUser } from '../utils/api';
import Navbar from '../components/Navbar';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('📦 ProductDetailPage 컴포넌트 렌더링 중...', { id });
    
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getProductById(id);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.message || '상품을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('상품 조회 오류:', err);
      setError('상품을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        <Navbar />
        <div>로딩 중...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#fff'
      }}>
        <Navbar />
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#ff4444' }}>
            {error || '상품을 찾을 수 없습니다'}
          </h1>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#90EE90',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Navbar />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 20px 40px'
      }}>
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '30px',
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
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
          ← 뒤로가기
        </button>

        {/* 상품 정보 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* 상품 이미지 */}
          <div>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                이미지 없음
              </div>
            )}
          </div>

          {/* 상품 상세 정보 */}
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              {product.name}
            </h1>

            {product.developer && (
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '20px'
              }}>
                개발자: {product.developer}
              </p>
            )}

            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#90EE90',
              marginBottom: '30px'
            }}>
              ₩{product.price?.toLocaleString() || '0'}
            </div>

            {product.description && (
              <div style={{
                marginBottom: '30px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>상품 설명</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
              </div>
            )}

            {product.link && (
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  backgroundColor: '#90EE90',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  marginTop: '20px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                상품 링크로 이동 →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
