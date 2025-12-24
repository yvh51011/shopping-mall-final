import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
const ProgramCard = React.memo(({ product, onHover }) => {
  const { _id, name, description, price, image, developer } = product;
  const [imageError, setImageError] = useState(false);
  
  return (
    <Link
      to={`/product/${_id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div 
        style={styles.programCard}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          if (onHover) onHover();
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }}
      >
        {image && !imageError ? (
          <img
            src={image}
            alt={name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '200px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '3rem'
          }}>
            📦
          </div>
        )}
        <h3 style={styles.programTitle}>{name}</h3>
        {developer && (
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '10px'
          }}>
            개발자: {developer}
          </p>
        )}
        <p style={styles.programDescription}>{description}</p>
        <p style={styles.programPrice}>₩{price?.toLocaleString() || '0'}</p>
      </div>
    </Link>
  );
});

ProgramCard.displayName = 'ProgramCard';

function Home() {
  console.log('🏠 Home 컴포넌트 렌더링 중...');
  
  const programsSectionRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 스크롤 핸들러
  const scrollToPrograms = () => {
    programsSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  // 상품 데이터 가져오기
  useEffect(() => {
    console.log('✅ Home 컴포넌트 마운트 완료');
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getProducts({
          page: 1,
          limit: 12, // 홈 화면에 최대 12개 상품 표시
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        if (response.success && response.data) {
          setProducts(response.data);
          console.log('✅ 상품 목록 로드 완료:', response.data.length, '개');
        } else {
          setError(response.message || '상품을 불러오는데 실패했습니다.');
          console.error('❌ 상품 목록 로드 실패:', response.message);
        }
      } catch (err) {
        console.error('❌ 상품 목록 조회 오류:', err);
        setError('상품을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
    
    return () => {
      console.log('🔄 Home 컴포넌트 언마운트');
    };
  }, []);

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
        
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.2rem'
          }}>
            상품을 불러오는 중...
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#ff4444',
            fontSize: '1.1rem'
          }}>
            {error}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.2rem'
          }}>
            등록된 상품이 없습니다.
          </div>
        ) : (
          <div style={styles.programGrid}>
            {products.map((product) => (
              <ProgramCard
                key={product._id}
                product={product}
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

