import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { getCurrentUser, getProductById, createProduct, updateProduct, testServerConnection } from '../utils/api';

// Cloudinary 설정 (환경 변수에서 가져오기)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// 환경 변수 검증
const isCloudinaryConfigured = CLOUDINARY_CLOUD_NAME && 
  CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' && 
  CLOUDINARY_CLOUD_NAME.trim() !== '' &&
  CLOUDINARY_UPLOAD_PRESET && 
  CLOUDINARY_UPLOAD_PRESET.trim() !== '';

// 개발 환경에서 환경 변수 확인 로그
if (import.meta.env.DEV) {
  console.log('🔍 Cloudinary 환경 변수 확인:');
  console.log('   CLOUDINARY_CLOUD_NAME:', CLOUDINARY_CLOUD_NAME ? `${CLOUDINARY_CLOUD_NAME.substring(0, 4)}...` : '❌ 없음');
  console.log('   CLOUDINARY_UPLOAD_PRESET:', CLOUDINARY_UPLOAD_PRESET || '❌ 없음');
  console.log('   설정 완료:', isCloudinaryConfigured ? '✅' : '❌');
}

function CreateProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // 수정 모드인지 확인하기 위한 ID
  const isEditMode = !!id; // id가 있으면 수정 모드
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    link: '',
    developer: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const widgetRef = useRef(null);

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
    
    // 수정 모드인 경우 기존 상품 데이터 로드
    if (isEditMode) {
      fetchProductData();
    } else {
      setLoading(false);
    }

    // 서버 연결 상태 확인
    testServerConnection().then(status => {
      if (status.status === 'error') {
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        console.log('✅ 서버 연결 확인됨:', status);
      }
    });
  }, [navigate, id, isEditMode]);

  // 수정 모드에서 기존 상품 데이터 가져오기
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getProductById(id);
      
      if (response.success && response.data) {
        const product = response.data;
        setFormData({
          name: product.name || '',
          price: product.price?.toString() || '',
          image: product.image || '',
          description: product.description || '',
          link: product.link || '',
          developer: product.developer || ''
        });
        setImagePreview(product.image || '');
        console.log('✅ 상품 데이터 로드 성공:', product);
      } else {
        setError(response.message || '상품을 찾을 수 없습니다.');
        console.error('❌ 상품 데이터 로드 실패:', response);
      }
    } catch (error) {
      console.error('❌ 상품 데이터 로드 오류:', error);
      setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    
    // 이미지 URL이 변경되면 미리보기 업데이트
    if (e.target.name === 'image') {
      setImagePreview(e.target.value);
    }
  };

  // Cloudinary 위젯 열기
  const openCloudinaryWidget = () => {
    // Cloudinary 위젯 스크립트 확인
    if (typeof cloudinary === 'undefined') {
      setError('Cloudinary 위젯을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    // 환경 변수 확인
    if (!isCloudinaryConfigured) {
      // 에러 대신 안내 메시지 표시
      alert('Cloudinary를 사용하려면 .env 파일에 VITE_CLOUDINARY_CLOUD_NAME과 VITE_CLOUDINARY_UPLOAD_PRESET을 설정하고 서버를 재시작해주세요.\n\n또는 아래 입력란에 이미지 URL을 직접 입력할 수 있습니다.');
      console.warn('Cloudinary 환경 변수 누락:', {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET
      });
      return;
    }

    const widget = cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'camera', 'url'],
        multiple: false,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          },
          fonts: {
            default: null,
            "'Poppins', sans-serif": {
              url: 'https://fonts.googleapis.com/css?family=Poppins',
              active: true
            }
          }
        }
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          let errorMessage = '이미지 업로드 중 오류가 발생했습니다.';
          
          // 특정 에러 메시지 처리
          if (error.message && error.message.includes('whitelisted')) {
            errorMessage = 'Upload Preset이 unsigned 업로드를 허용하지 않습니다. Cloudinary Dashboard에서 Upload Preset의 Signing mode를 "Unsigned"로 설정해주세요.';
          } else if (error.message) {
            errorMessage = `업로드 오류: ${error.message}`;
          }
          
          setError(errorMessage);
          return;
        }

        if (result && result.event === 'success') {
          const imageUrl = result.info.secure_url;
          setFormData({
            ...formData,
            image: imageUrl
          });
          setImagePreview(imageUrl);
          setError('');
          console.log('이미지 업로드 성공:', imageUrl);
        } else if (result && result.event === 'close') {
          console.log('업로드 위젯이 닫혔습니다.');
        } else if (result && result.event === 'abort') {
          console.log('업로드가 취소되었습니다.');
        }
      }
    );

    widgetRef.current = widget;
    widget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.name || !formData.price || !formData.image || !formData.description || !formData.link || !formData.developer) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 가격 숫자 검증
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError('가격은 0 이상의 숫자여야 합니다.');
      return;
    }

    // URL 형식 검증
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(formData.link)) {
      setError('프로그램 링크는 http:// 또는 https://로 시작하는 유효한 URL이어야 합니다.');
      return;
    }

    // 이미지 URL 형식 검증
    if (!urlPattern.test(formData.image)) {
      setError('이미지 URL은 http:// 또는 https://로 시작하는 유효한 URL이어야 합니다.');
      return;
    }

    setSubmitting(true);
    try {
      const actionText = isEditMode ? '수정' : '등록';
      console.log(`상품 ${actionText} 시도:`, {
        name: formData.name.trim(),
        price: price,
        image: formData.image.trim(),
        description: formData.description.trim(),
        link: formData.link.trim(),
        developer: formData.developer.trim()
      });

      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser._id) {
        setError('로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        setSubmitting(false);
        return;
      }

      // 상품 등록/수정 API 호출
      const requestBody = {
        name: formData.name.trim(),
        price: price,
        image: formData.image.trim(),
        description: formData.description.trim(),
        link: formData.link.trim(),
        developer: formData.developer.trim()
      };

      // 등록 모드인 경우에만 createdBy 추가
      if (!isEditMode) {
        requestBody.createdBy = currentUser._id;
      }

      console.log(`상품 ${actionText} 요청 데이터:`, requestBody);

      // API 함수 사용
      const response = isEditMode 
        ? await updateProduct(id, requestBody)
        : await createProduct(requestBody);

      console.log(`상품 ${actionText} 응답 데이터:`, response);

      // 응답 상태 확인
      if (!response.success) {
        let errorMessage = response.message || response.error || `서버 오류`;
        
        // 에러 배열이 있는 경우
        if (response.errors && Array.isArray(response.errors)) {
          errorMessage = `${errorMessage}: ${response.errors.join(', ')}`;
        }
        
        // 누락된 필드가 있는 경우
        if (data.missingFields && data.missingFields.length > 0) {
          errorMessage = `${errorMessage}\n누락된 필드: ${data.missingFields.join(', ')}`;
        }
        
        console.error(`상품 ${actionText} 실패:`, {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        
        setError(errorMessage);
        setSubmitting(false);
        return;
      }

      // 성공 처리
      if (data.success && data.data) {
        console.log(`상품 ${actionText} 성공:`, data.data);
        alert(`상품이 성공적으로 ${actionText}되었습니다!`);
        
        if (isEditMode) {
          // 수정 모드: 상품 상세 페이지로 이동
          navigate(`/admin/products/${id}`);
        } else {
          // 생성 모드: 폼 초기화 후 관리자 페이지로 이동
          setFormData({
            name: '',
            price: '',
            image: '',
            description: '',
            link: '',
            developer: ''
          });
          setImagePreview('');
          navigate('/admin');
        }
      } else {
        const errorMsg = response.message || `상품 ${actionText}에 실패했습니다.`;
        console.error(`상품 ${actionText} 실패 (success가 false):`, response);
        setError(errorMsg);
      }
    } catch (err) {
      const actionText = isEditMode ? '수정' : '등록';
      console.error(`Product ${actionText} error:`, err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (서버를 시작하려면: cd server && npm run dev)');
      } else {
        setError(`상품 ${actionText} 중 오류가 발생했습니다: ` + err.message);
      }
    } finally {
      setSubmitting(false);
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

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f5f5f5',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative'
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
          to="/admin"
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
          대시보드로 돌아가기
        </Link>
      </header>

      {/* 메인 컨텐츠 */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '30px',
          color: '#333'
        }}>
          {isEditMode ? '상품 정보 수정' : '새 상품 등록'}
        </h1>

        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.95rem'
            }}>
              {error}
            </div>
          )}

          {/* 상품명 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333'
            }}>
              상품(프로그램 이름) <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2196F3'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {/* 가격 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333'
            }}>
              상품 가격 <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="1"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2196F3'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {/* 이미지 업로드 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333'
            }}>
              상품 이미지 <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            {!isCloudinaryConfigured && (
              <div style={{
                padding: '12px',
                backgroundColor: '#e3f2fd',
                color: '#1565c0',
                borderRadius: '6px',
                marginBottom: '12px',
                fontSize: '0.9rem',
                border: '1px solid #90caf9'
              }}>
                ℹ️ Cloudinary를 사용하려면 .env 파일에 VITE_CLOUDINARY_CLOUD_NAME과 VITE_CLOUDINARY_UPLOAD_PRESET을 설정하고 서버를 재시작하세요. (선택사항: URL을 직접 입력할 수도 있습니다)
              </div>
            )}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <button
                type="button"
                onClick={openCloudinaryWidget}
                disabled={!isCloudinaryConfigured}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isCloudinaryConfigured ? '#0078FF' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: isCloudinaryConfigured ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap',
                  opacity: isCloudinaryConfigured ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (isCloudinaryConfigured) {
                    e.currentTarget.style.backgroundColor = '#0056CC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isCloudinaryConfigured) {
                    e.currentTarget.style.backgroundColor = '#0078FF';
                  }
                }}
              >
                📷 이미지 업로드
              </button>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                placeholder="이미지 URL을 입력하세요 (예: https://example.com/image.jpg)"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            
            {/* 이미지 미리보기 */}
            {(imagePreview || formData.image) && (
              <div style={{
                marginTop: '16px',
                textAlign: 'center',
                padding: '16px',
                border: '2px dashed #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }}>
                <img
                  src={imagePreview || formData.image}
                  alt="미리보기"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'block',
                    margin: '0 auto'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.textContent = '이미지를 불러올 수 없습니다.';
                    errorDiv.style.color = '#d32f2f';
                    errorDiv.style.padding = '20px';
                    e.target.parentNode.appendChild(errorDiv);
                  }}
                />
                {(imagePreview || formData.image) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image: '' });
                      setImagePreview('');
                    }}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      backgroundColor: '#ff5252',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff1744';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff5252';
                    }}
                  >
                    이미지 제거
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 설명 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333'
            }}>
              상품 설명 <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2196F3'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {/* 프로그램 링크 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333'
            }}>
              프로그램 링크 <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              required
              placeholder="https://example.com/program"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2196F3'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {/* 개발자 이름 */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333'
            }}>
              개발자 이름 <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <input
              type="text"
              name="developer"
              value={formData.developer}
              onChange={handleChange}
              required
              placeholder="홍길동"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2196F3'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {/* 버튼 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <Link
              to="/admin"
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                textDecoration: 'none',
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
              취소
            </Link>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 24px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#000';
                }
              }}
            >
              {submitting 
                ? (isEditMode ? '수정 중...' : '등록 중...') 
                : (isEditMode ? '상품 수정' : '상품 등록')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;

