import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCart, updateCartItemQuantity, removeFromCart, clearCart, getCurrentUser } from '../utils/api';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    loadCart();
    
    // 장바구니 업데이트 이벤트 리스너
    const handleCartUpdated = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdated);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, [navigate]);

  const loadCart = () => {
    try {
      const cart = getCart();
      setCartItems(cart);
      setLoading(false);
    } catch (error) {
      console.error('장바구니 로드 오류:', error);
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const result = updateCartItemQuantity(productId, newQuantity);
    if (result.success) {
      setCartItems(result.cart);
    } else {
      alert(result.message);
    }
  };

  const handleRemoveItem = (productId) => {
    if (window.confirm('정말 이 상품을 장바구니에서 제거하시겠습니까?')) {
      const result = removeFromCart(productId);
      if (result.success) {
        setCartItems(result.cart);
      } else {
        alert(result.message);
      }
    }
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니를 모두 비우시겠습니까?')) {
      const result = clearCart();
      if (result.success) {
        setCartItems([]);
      } else {
        alert(result.message);
      }
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
        로딩 중...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'
    }}>
      <Navbar />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 40px 40px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '40px',
          color: '#fff'
        }}>
          장바구니
        </h1>

        {cartItems.length === 0 ? (
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>
              🛒
            </div>
            <div style={{
              fontSize: '1.5rem',
              marginBottom: '16px',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              장바구니가 비어있습니다
            </div>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: '#90EE90',
                color: '#000',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                marginTop: '20px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#7dd87d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#90EE90';
              }}
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                총 {cartItems.length}개의 상품
              </div>
              <button
                onClick={handleClearCart}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                }}
              >
                전체 삭제
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    gap: '24px',
                    alignItems: 'center'
                  }}
                >
                  {/* 상품 이미지 */}
                  <Link
                    to={`/product/${item.productId}`}
                    style={{
                      flexShrink: 0,
                      width: '120px',
                      height: '120px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#0a0a0a',
                      textDecoration: 'none'
                    }}
                  >
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzBhMGEwYSIvPjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </Link>

                  {/* 상품 정보 */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <Link
                      to={`/product/${item.productId}`}
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        color: '#fff',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#90EE90';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#fff';
                      }}
                    >
                      {item.name}
                    </Link>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#90EE90'
                    }}>
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  {/* 수량 조절 */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: '#0a0a0a',
                      borderRadius: '8px',
                      padding: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'transparent',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '4px',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        −
                      </button>
                      <span style={{
                        minWidth: '40px',
                        textAlign: 'center',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#fff'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'transparent',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '4px',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: 'rgba(255, 255, 255, 0.5)',
                        border: 'none',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ff4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 총계 및 결제 버튼 */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '8px'
                }}>
                  총 결제금액
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#90EE90'
                }}>
                  ₩{calculateTotal().toLocaleString()}
                </div>
              </div>
              <Link
                to="/checkout"
                style={{
                  padding: '16px 48px',
                  backgroundColor: '#90EE90',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
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
                결제하기
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;

