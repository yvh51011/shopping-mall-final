import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCurrentUser, getProductById } from '../utils/api';

const API_BASE_URL = 'http://localhost:5000/api';

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

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
    fetchProduct();
  }, [navigate, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getProductById(id);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.message || '상품을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('상품 조회 오류:', error);
      setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('상품이 삭제되었습니다.');
        navigate('/admin/products');
      } else {
        alert('상품 삭제에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

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

  if (error || !product) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#d32f2f' }}>
          {error || '상품을 찾을 수 없습니다.'}
        </div>
        <button
          onClick={() => navigate('/admin/products')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          상품 목록으로 돌아가기
        </button>
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
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/admin/products')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#333',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ←
          </button>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            상품 상세 정보
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <Link
            to={`/admin/products/edit/${id}`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
            }}
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b71c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#d32f2f';
            }}
          >
            삭제
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          {/* 상품 이미지 및 기본 정보 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '400px 1fr',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* 이미지 */}
            <div>
              <img
                src={product.image || '/placeholder.png'}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwMCIgeT0iNTAwIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>

            {/* 기본 정보 */}
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#333'
              }}>
                {product.name}
              </h1>

              <div style={{
                marginBottom: '24px',
                paddingBottom: '24px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#000',
                  marginBottom: '8px'
                }}>
                  ₩{product.price?.toLocaleString() || 0}
                </div>
              </div>

              {/* 상품 정보 카드 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    상품 ID
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {product.productId || product._id}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    개발자
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {product.developer || '-'}
                  </div>
                </div>
              </div>

              {/* 등록 정보 */}
              {product.createdBy && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    등록자
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {typeof product.createdBy === 'object' 
                      ? product.createdBy.name || product.createdBy.email 
                      : '-'}
                  </div>
                </div>
              )}

              {/* 등록일 */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  등록일
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  {product.createdAt 
                    ? new Date(product.createdAt).toLocaleString('ko-KR')
                    : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* 상품 설명 */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#333'
            }}>
              상품 설명
            </h2>
            <div style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#666',
              whiteSpace: 'pre-wrap'
            }}>
              {product.description || '설명이 없습니다.'}
            </div>
          </div>

          {/* 프로그램 링크 */}
          {product.link && (
            <div style={{
              marginBottom: '32px',
              paddingBottom: '32px',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#333'
              }}>
                프로그램 링크
              </h2>
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '1rem',
                  color: '#2196F3',
                  textDecoration: 'none',
                  wordBreak: 'break-all'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {product.link}
              </a>
            </div>
          )}

          {/* 액션 버튼 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => navigate('/admin/products')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
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
              목록으로
            </button>
            <Link
              to={`/admin/products/edit/${id}`}
              style={{
                padding: '12px 24px',
                backgroundColor: '#000',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
              }}
            >
              수정하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;




