import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThreeBackground from '../components/ThreeBackground';
import { getProducts } from '../utils/api';

// 스타일 상수
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden'
  },
  heroSection: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 20px',
    position: 'relative',
    zIndex: 1,
    overflow: 'visible'
  },
  textOverlay: {
    position: 'relative',
    zIndex: 2,
    padding: '60px 80px',
    borderRadius: '20px',
    background: 'transparent',
    backdropFilter: 'none',
    border: 'none',
    boxShadow: 'none'
  },
  headline: {
    fontSize: 'clamp(5rem, 12vw, 8.5rem)',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '30px',
    lineHeight: '1.05',
    zIndex: 3,
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    letterSpacing: '-0.03em',
    textShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.2), 0 4px 20px rgba(0, 0, 0, 0.5)'
  },
  blinkingText: {
    animation: 'blink 1.5s ease-in-out infinite'
  },
  subheadline: {
    fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
    color: '#fff',
    marginBottom: '45px',
    maxWidth: '900px',
    opacity: 1,
    zIndex: 3,
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    lineHeight: '1.5',
    textShadow: '0 0 20px rgba(255, 255, 255, 0.2), 0 2px 10px rgba(0, 0, 0, 0.4)',
    fontWeight: '400'
  },
  ctaButton: {
    padding: '16px 32px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    zIndex: 3,
    position: 'relative',
    boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
    margin: '0 auto'
  },
  sectionContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '100px 20px',
    position: 'relative',
    zIndex: 1
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 'bold',
    marginBottom: '50px',
    textAlign: 'center'
  },
  programGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginTop: '50px'
  },
  programCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    backdropFilter: 'blur(10px)'
  },
  programTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#fff'
  },
  programDescription: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  programPrice: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '60px 20px',
    marginTop: '100px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center'
  }
};

// 프로그램 카드 컴포넌트
const ProgramCard = ({ product, onHover, navigate }) => {
  const handleClick = () => {
    // 상품 디테일 페이지로 이동
    const productId = product._id || product.productId;
    console.log('상품 클릭:', { productId, product });
    if (productId) {
      console.log('상품 디테일 페이지로 이동:', `/product/${productId}`);
      navigate(`/product/${productId}`);
    } else {
      console.error('상품 ID를 찾을 수 없습니다:', product);
    }
  };

  return (
    <div 
      style={styles.programCard}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.cursor = product.link ? 'pointer' : 'default';
        if (onHover) onHover();
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }}
    >
      {product.image && (
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        />
      )}
      <h3 style={styles.programTitle}>{product.name}</h3>
      <p style={styles.programDescription}>{product.description}</p>
      {product.developer && (
        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '12px',
          fontStyle: 'italic'
        }}>
          개발자: {product.developer}
        </p>
      )}
      <p style={styles.programPrice}>₩{product.price.toLocaleString()}</p>
      {product.link && (
        <p style={{
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.5)',
          marginTop: '12px',
          textDecoration: 'underline'
        }}>
          프로그램 보기 →
        </p>
      )}
    </div>
  );
};

function Home() {
  const navigate = useNavigate();
  const programsSectionRef = useRef(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // API에서 상품 목록 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 모든 상품을 가져오기 위해 큰 limit 값 사용
        const result = await getProducts({
          page: 1,
          limit: 1000, // 충분히 큰 값으로 모든 상품 가져오기
          sortBy: 'createdAt',
          sortOrder: 'desc' // 최신순
        });

        console.log('상품 조회 응답:', result);

        // 서버 응답 구조: { success: true, data: [...], total, ... }
        if (result.success && result.data && Array.isArray(result.data)) {
          setPrograms(result.data);
          console.log(`✅ ${result.data.length}개의 상품을 불러왔습니다.`);
        } else if (result.success && result.data) {
          // data가 배열이 아닌 경우도 처리
          setPrograms(Array.isArray(result.data) ? result.data : []);
        } else {
          const errorMessage = result.message || '상품을 불러오는데 실패했습니다.';
          setError(errorMessage);
          console.error('상품 조회 실패:', result);
        }
      } catch (err) {
        console.error('상품 조회 중 오류:', err);
        setError('상품을 불러오는 중 오류가 발생했습니다: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 스크롤 핸들러
  const scrollToPrograms = () => {
    programsSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      {/* 히어로 섹션 */}
      <div style={styles.heroSection}>
        <ThreeBackground />
        <div style={styles.textOverlay}>
          <h1 style={styles.headline}>
            <span style={{ color: '#90EE90' }}>Innovate.</span><br />
            <span style={styles.blinkingText}>Create<span style={{ color: '#ff0000', fontSize: '0.2em', verticalAlign: 'baseline' }}>❤</span></span><br />
            <span style={{ color: '#90EE90' }}>Inspire.</span>
          </h1>
          <p style={styles.subheadline}>
            전북대학교 영어영문학과 학생들이 바이브 코딩으로 만든<br />
            혁신적인 영어 학습 웹프로그램을 소개하고 판매합니다.
          </p>
          <button 
            style={styles.ctaButton}
            onClick={scrollToPrograms}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            <span>Explore Our Work</span>
            <span style={{ fontSize: '1.1rem', marginLeft: '6px' }}>→</span>
          </button>
        </div>
      </div>

      {/* 프로그램 소개 섹션 */}
      <div ref={programsSectionRef} style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>Our Web Programs</h2>
        <p style={{ 
          textAlign: 'center', 
          fontSize: '1.2rem', 
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '50px',
          maxWidth: '800px',
          margin: '0 auto 50px'
        }}>
          전북대학교 영어영문학과 학생들의 창의성과 기술력이 만나 탄생한<br />
          다양한 웹프로그램을 만나보세요.
        </p>
        
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.2rem'
          }}>
            상품을 불러오는 중...
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#ff5252',
            fontSize: '1rem',
            backgroundColor: 'rgba(255, 82, 82, 0.1)',
            borderRadius: '8px',
            marginBottom: '30px',
            maxWidth: '600px',
            margin: '0 auto 30px'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && programs.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.2rem'
          }}>
            등록된 상품이 없습니다.
          </div>
        )}

        {!loading && programs.length > 0 && (
          <div style={styles.programGrid}>
            {programs.map((program) => (
              <ProgramCard
                key={program._id || program.productId}
                product={program}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#fff' }}>About Us</h4>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
              전북대학교 영어영문학과<br />
              학생들의 창의적인 웹프로그램을<br />
              소개하고 판매합니다.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#fff' }}>Contact</h4>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '10px' }}>
              전북대학교 영어영문학과 황요한 교수
            </p>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Email: yvh5101@jbnu.ac.kr
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#fff' }}>Quick Links</h4>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '10px' }}>
              이용약관
            </p>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              개인정보처리방침
            </p>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          paddingTop: '30px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem'
        }}>
          © 2025 전북대학교 영어영문학과. All rights reserved.
        </div>
      </footer>
      
      <style>{`
        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;

