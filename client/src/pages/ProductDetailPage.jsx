import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../utils/api';

function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 확인
  useEffect(() => {
    console.log('ProductDetailPage 컴포넌트 마운트됨, ID:', id);
    return () => {
      console.log('ProductDetailPage 컴포넌트 언마운트됨');
    };
  }, [id]);

  const fetchProduct = React.useCallback(async () => {
    if (!id) {
      console.error('상품 ID가 없습니다.');
      setError('상품 ID가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('상품 조회 API 호출:', id);
      const response = await getProductById(id);
      console.log('상품 조회 응답:', response);
      
      if (response && response.success && response.data) {
        console.log('상품 데이터 설정:', response.data);
        setProduct(response.data);
      } else {
        const errorMsg = (response && response.message) || '상품을 찾을 수 없습니다.';
        console.error('상품 조회 실패:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('상품 조회 오류:', error);
      setError('상품 정보를 불러오는 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      console.log('상품 ID로 데이터 가져오기:', id);
      fetchProduct();
    } else {
      console.error('상품 ID가 없습니다.');
      setError('상품 ID가 없습니다.');
      setLoading(false);
    }
  }, [id, fetchProduct]);

  const handleAddToCart = () => {
    // TODO: 장바구니 기능 구현
    alert('장바구니에 추가되었습니다!');
  };

  const handleExperienceProgram = () => {
    if (product?.link) {
      window.open(product.link, '_blank', 'noopener,noreferrer');
    } else {
      alert('프로그램 링크가 없습니다.');
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
        flexDirection: 'column',
        gap: '20px',
        fontSize: '1.5rem'
      }}>
        <div>로딩 중...</div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>
          상품 ID: {id || '없음'}
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#90EE90' }}>
          {error || '상품을 찾을 수 없습니다.'}
        </div>
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
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      position: 'relative'
    }}>
      {/* 헤더 */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#90EE90',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7dd87d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#90EE90';
          }}
        >
          <span>←</span>
          홈으로 돌아가기
        </button>
        <div style={{
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          전북대학교 영어영문학과
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
        gap: '40px',
        padding: '100px 40px 40px'
      }}>
        {/* 왼쪽: 프로그램 임베드 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            height: '80vh',
            backgroundColor: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {product?.link ? (
              <iframe
                src={product.link}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title={product?.name || '프로그램 미리보기'}
                allow="fullscreen"
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '1.2rem'
              }}>
                프로그램 미리보기
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 상품 정보 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 0'
        }}>
          {/* 제목 */}
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: '#fff',
            lineHeight: '1.2'
          }}>
            {product?.name || '상품명 없음'}
          </h1>

          {/* 가격 */}
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#90EE90',
            marginBottom: '16px'
          }}>
            ₩{(product?.price && typeof product.price === 'number') ? product.price.toLocaleString() : '0'}
          </div>

          {/* 개발자 */}
          {product?.developer && (
            <div style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '32px'
            }}>
              개발자: {product.developer}
            </div>
          )}

          {/* 설명 */}
          <div style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            whiteSpace: 'pre-wrap'
          }}>
            {product?.description || '설명이 없습니다.'}
          </div>

          {/* 액션 버튼 */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: 'auto'
          }}>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: '16px 32px',
                backgroundColor: '#90EE90',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(144, 238, 144, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#7dd87d';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(144, 238, 144, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#90EE90';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(144, 238, 144, 0.3)';
              }}
            >
              장바구니에 추가
            </button>
            <button
              onClick={handleExperienceProgram}
              style={{
                flex: 1,
                padding: '16px 32px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              프로그램 체험하기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

