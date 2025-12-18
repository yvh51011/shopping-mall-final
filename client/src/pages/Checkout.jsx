import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCurrentUser, getCart, createOrder } from '../utils/api';

function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [impReady, setImpReady] = useState(false);
  
  // 포트원(아임포트) 스크립트 로드 및 초기화
  useEffect(() => {
    const initPortOne = () => {
      if (window.IMP) {
        try {
          window.IMP.init('imp55881214'); // 고객사 식별코드
          setImpReady(true);
          console.log('포트원 초기화 완료');
          return true;
        } catch (error) {
          console.error('포트원 초기화 오류:', error);
          return false;
        }
      }
      return false;
    };

    // 이미 로드되어 있으면 바로 초기화
    if (initPortOne()) {
      return;
    }

    // 스크립트가 로드될 때까지 대기 (100ms 간격으로 체크)
    let checkCount = 0;
    const maxChecks = 50; // 최대 5초 (50 * 100ms)
    
    const checkInterval = setInterval(() => {
      checkCount++;
      if (initPortOne()) {
        clearInterval(checkInterval);
      } else if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        // 동적으로 스크립트 로드 시도
        console.log('포트원 스크립트 동적 로드 시도');
        const existingScript = document.querySelector('script[src*="iamport"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://cdn.iamport.kr/v1/iamport.js';
          script.type = 'text/javascript';
          script.async = true;
          script.onload = () => {
            console.log('포트원 스크립트 동적 로드 완료');
            if (initPortOne()) {
              console.log('포트원 동적 초기화 완료');
            }
          };
          script.onerror = () => {
            console.error('포트원 스크립트 동적 로드 실패');
          };
          document.head.appendChild(script);
        } else {
          // 스크립트가 이미 있지만 아직 로드되지 않은 경우
          existingScript.onload = () => {
            if (initPortOne()) {
              console.log('포트원 스크립트 로드 후 초기화 완료');
            }
          };
        }
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser._id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setUser(currentUser);
    loadCart();
  }, [navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      
      if (!user || !user._id) {
        navigate('/login');
        return;
      }

      const response = await getCart(user._id);
      
      if (response.success && response.data) {
        const formattedItems = response.data.map(item => ({
          _id: item._id,
          productId: item.product?._id || item.product,
          name: item.product?.name || '',
          price: item.product?.price || 0,
          image: item.product?.image || '',
          quantity: item.quantity || 1
        }));
        
        setCartItems(formattedItems);
        setTotalAmount(response.totalAmount || 0);
        
        // 사용자 정보로 폼 초기화
        setFormData({
          name: user.name || '',
          phone: '',
          email: user.email || '',
          address: user.address || '',
          notes: ''
        });
      } else {
        if (response.data && response.data.length === 0) {
          alert('장바구니가 비어있습니다.');
          navigate('/cart');
        }
      }
    } catch (error) {
      console.error('장바구니 로드 오류:', error);
      alert('장바구니를 불러오는 중 오류가 발생했습니다.');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = '연락처를 입력해주세요.';
    } else if (!/^[0-9-+\s()]+$/.test(formData.phone)) {
      newErrors.phone = '유효한 연락처를 입력해주세요.';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      navigate('/cart');
      return;
    }

    // 포트원 스크립트 로드 확인
    if (!window.IMP || !impReady) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setSubmitting(true);
    
    // 포트원 결제 요청
    const { IMP } = window;
    const merchantUid = `order_${Date.now()}_${user._id}`; // 주문 고유 번호
    
    // 결제 요청 파라미터 (예시 코드와 동일한 형식)
    IMP.request_pay({
      pg: 'html5_inicis',
      pay_method: 'card',
      merchant_uid: merchantUid, // 상점에서 관리하는 주문 번호를 전달
      name: cartItems.length === 1 
        ? cartItems[0].name 
        : `${cartItems[0].name} 외 ${cartItems.length - 1}개`, // 주문명:결제테스트
      amount: totalAmount, // 결제금액
      buyer_email: formData.email, // 구매자 이메일
      buyer_name: formData.name, // 구매자 이름
      buyer_tel: formData.phone, // 구매자 전화번호
      buyer_addr: formData.address || '', // 구매자 주소
      buyer_postcode: '', // 구매자 우편번호 (선택사항)
      m_redirect_url: `${window.location.origin}/checkout` // 모바일에서 결제 완료 후 리디렉션 될 URL
    }, async (rsp) => {
      // 결제 완료 후 콜백
      if (rsp.success) {
        // 결제 성공 시 주문 생성
        try {
          const response = await createOrder(user._id, {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address || '',
            notes: formData.notes || ''
          }, 'card', {
            imp_uid: rsp.imp_uid, // 포트원 거래 고유 번호
            merchant_uid: rsp.merchant_uid, // 주문 번호
            paid_amount: rsp.paid_amount, // 결제 금액
            pay_method: rsp.pay_method // 결제 수단
          });

          if (response.success) {
            alert('주문이 완료되었습니다!');
            // 장바구니 업데이트 이벤트 발생
            window.dispatchEvent(new Event('cartUpdated'));
            // 주문 완료 페이지로 이동
            navigate(`/orders/${response.data._id}`);
          } else {
            alert(response.message || '주문 처리 중 오류가 발생했습니다.');
            setSubmitting(false);
          }
        } catch (error) {
          console.error('주문 오류:', error);
          alert('주문 처리 중 오류가 발생했습니다.');
          setSubmitting(false);
        }
      } else {
        // 결제 실패
        alert(`결제에 실패했습니다: ${rsp.error_msg || '알 수 없는 오류'}`);
        setSubmitting(false);
      }
    });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#fff',
      paddingTop: '80px'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '30px'
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: '#90EE90',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '5px 10px',
      marginRight: '15px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      margin: 0
    },
    progressBar: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '40px',
      padding: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px'
    },
    step: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.5)'
    },
    activeStep: {
      color: '#90EE90',
      fontWeight: '600'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
      marginTop: '30px'
    },
    formSection: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '30px',
      borderRadius: '12px'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '0.95rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '1rem',
      boxSizing: 'border-box',
      transition: 'all 0.2s'
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#90EE90',
      backgroundColor: 'rgba(255, 255, 255, 0.15)'
    },
    errorText: {
      color: '#ff6b6b',
      fontSize: '0.85rem',
      marginTop: '5px'
    },
    summarySection: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '30px',
      borderRadius: '12px',
      height: 'fit-content',
      position: 'sticky',
      top: '100px'
    },
    orderItem: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    orderItemImage: {
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    orderItemInfo: {
      flex: 1
    },
    orderItemName: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '5px'
    },
    orderItemPrice: {
      fontSize: '0.9rem',
      color: '#90EE90'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '15px',
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '2px solid rgba(255, 255, 255, 0.2)',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#90EE90'
    },
    placeOrderButton: {
      width: '100%',
      padding: '15px',
      backgroundColor: '#90EE90',
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: submitting ? 'not-allowed' : 'pointer',
      marginTop: '30px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.7)' }}>
          주문 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        {/* 헤더 */}
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() => navigate('/cart')}
          >
            ←
          </button>
          <h1 style={styles.title}>주문하기</h1>
        </div>

        {/* 진행 단계 */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.step, ...(currentStep >= 1 ? styles.activeStep : {}) }}>
            <span>1</span>
            <span>배송 정보</span>
          </div>
          <div style={{ ...styles.step, ...(currentStep >= 2 ? styles.activeStep : {}) }}>
            <span>2</span>
            <span>결제</span>
          </div>
          <div style={{ ...styles.step, ...(currentStep >= 3 ? styles.activeStep : {}) }}>
            <span>3</span>
            <span>확인</span>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={styles.mainContent}>
          {/* 왼쪽: 배송 정보 폼 */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>
              <span>📦</span>
              <span>배송 정보</span>
            </h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>이름 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="이름을 입력해주세요"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#90EE90';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
              {errors.name && <div style={styles.errorText}>{errors.name}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>연락처 *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="010-1234-5678"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#90EE90';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
              {errors.phone && <div style={styles.errorText}>{errors.phone}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>이메일 *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#90EE90';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
              {errors.email && <div style={styles.errorText}>{errors.email}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>주소 (선택)</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="주소를 입력해주세요 (선택사항)"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#90EE90';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>요청사항 (선택)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="요청사항을 입력해주세요 (선택사항)"
                rows="4"
                style={{
                  ...styles.input,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#90EE90';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>
          </div>

          {/* 오른쪽: 주문 요약 */}
          <div style={styles.summarySection}>
            <h2 style={styles.sectionTitle}>
              <span>주문 요약</span>
            </h2>

            {/* 주문 상품 목록 */}
            <div style={{ marginBottom: '30px' }}>
              {cartItems.map((item) => (
                <div key={item._id} style={styles.orderItem}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={styles.orderItemImage}
                  />
                  <div style={styles.orderItemInfo}>
                    <div style={styles.orderItemName}>{item.name}</div>
                    <div style={styles.orderItemPrice}>
                      ₩{item.price.toLocaleString()} × {item.quantity || 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 금액 요약 */}
            <div>
              <div style={styles.summaryRow}>
                <span>소계 ({cartItems.length}개 상품)</span>
                <span>₩{totalAmount.toLocaleString()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>배송비</span>
                <span>무료</span>
              </div>
              <div style={styles.summaryRow}>
                <span>세금</span>
                <span>포함</span>
              </div>
              <div style={styles.totalRow}>
                <span>총 결제금액</span>
                <span>₩{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* 주문하기 버튼 */}
            <button
              style={styles.placeOrderButton}
              onClick={handlePlaceOrder}
              disabled={submitting}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {submitting ? (
                <>
                  <span>처리 중...</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>주문하기</span>
                </>
              )}
            </button>

            <div style={{
              marginTop: '15px',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              안전한 SSL 암호화 결제
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

