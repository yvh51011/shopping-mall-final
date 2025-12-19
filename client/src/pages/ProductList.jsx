import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, getProducts, deleteProduct } from '../utils/api';

function ProductList() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'

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
    fetchProducts();
  }, [navigate, currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success) {
        setProducts(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total || 0);
      } else {
        console.error('상품 조회 실패:', response.message);
      }
    } catch (error) {
      console.error('상품 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteProduct(productId);

      if (response.success) {
        alert('상품이 삭제되었습니다.');
        fetchProducts();
      } else {
        alert('상품 삭제에 실패했습니다: ' + (response.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (productId) => {
    // 상품 상세 정보 페이지로 이동
    navigate(`/admin/products/${productId}`);
  };

  if (loading && products.length === 0) {
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
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/admin')}
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
            상품 관리
          </div>
        </div>
        <Link
          to="/admin/products/create"
          style={{
            padding: '10px 20px',
            backgroundColor: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>+</span>
          새 상품 등록
        </Link>
      </header>

      {/* 메인 컨텐츠 */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px'
      }}>
        {/* 탭 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'list' ? '#000' : 'transparent',
              color: activeTab === 'list' ? '#fff' : '#666',
              border: 'none',
              borderBottom: activeTab === 'list' ? '2px solid #000' : '2px solid transparent',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s'
            }}
          >
            상품 목록
          </button>
          <Link
            to="/admin/products/create"
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'create' ? '#000' : 'transparent',
              color: activeTab === 'create' ? '#fff' : '#666',
              border: 'none',
              borderBottom: activeTab === 'create' ? '2px solid #000' : '2px solid transparent',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '-2px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            상품 등록
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          alignItems: 'center'
        }}>
          <form
            onSubmit={handleSearch}
            style={{
              flex: 1,
              display: 'flex',
              gap: '12px'
            }}
          >
            <div style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                position: 'absolute',
                left: '16px',
                fontSize: '1.2rem',
                color: '#666'
              }}>
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="상품명으로 검색..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  fontSize: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#000'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
              }}
            >
              검색
            </button>
          </form>
          <button
            style={{
              padding: '12px 20px',
              backgroundColor: '#fff',
              color: '#333',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderColor = '#ccc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            <span>🔽</span>
            필터
          </button>
        </div>

        {/* 상품 테이블 */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f9f9f9',
                borderBottom: '2px solid #e0e0e0'
              }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  이미지
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  상품명
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  카테고리
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  가격
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#666',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    style={{
                      borderBottom: '1px solid #e0e0e0',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      <img
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          backgroundColor: '#f5f5f5'
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAwIiB5PSI1MDAiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      {product.name}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '0.95rem',
                      color: '#666'
                    }}>
                      {product.developer || '-'}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      ₩{product.price?.toLocaleString() || 0}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        <button
                          onClick={() => handleEdit(product._id)}
                          style={{
                            padding: '8px',
                            backgroundColor: 'transparent',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                            e.currentTarget.style.borderColor = '#ccc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = '#e0e0e0';
                          }}
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          style={{
                            padding: '8px',
                            backgroundColor: 'transparent',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffebee';
                            e.currentTarget.style.borderColor = '#f44336';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = '#e0e0e0';
                          }}
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                color: currentPage === 1 ? '#ccc' : '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              이전
            </button>
            <span style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              {currentPage} / {totalPages} (총 {total}개)
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                color: currentPage === totalPages ? '#ccc' : '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;

