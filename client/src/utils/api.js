import axios from 'axios';

// API 기본 URL 설정
// 우선순위: 환경 변수 > 개발 환경 프록시 > 프로덕션 기본값
// 환경 변수가 설정되지 않은 경우:
// - 개발 환경: Vite 프록시 사용 (/api)
// - 프로덕션: 환경 변수 필수 (설정하지 않으면 오류)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? '/api' : (() => {
    console.error('❌ VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다!');
    console.error('프로덕션 환경에서는 반드시 VITE_API_BASE_URL을 설정해야 합니다.');
    return '';
  })());

// API URL 로깅 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL || '프록시 사용 (/api)');
}

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // CORS 문제 해결
});

// 요청 인터셉터 (토큰 추가 등)
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // 필요시 토큰 추가
        // config.headers.Authorization = `Bearer ${user.token}`;
      } catch (e) {
        console.error('사용자 정보 파싱 오류:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버가 응답했지만 에러 상태 코드
      console.error('API 에러:', error.response.data);
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못함
      console.error('서버 응답 없음:', error.request);
    } else {
      // 요청 설정 중 오류 발생
      console.error('요청 설정 오류:', error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== 인증 관련 ====================

/**
 * 로그인
 * @param {Object} credentials - { email, password }
 * @returns {Promise} 로그인 응답
 */
export const login = async (credentials) => {
  try {
    console.log('로그인 API 호출:', { url: `${API_BASE_URL}/auth/login`, credentials: { ...credentials, password: '***' } });
    const response = await api.post('/auth/login', credentials);
    console.log('로그인 API 응답:', response.data);
    
    if (response.data.success && response.data.data) {
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(response.data.data));
      console.log('사용자 정보 저장 완료');
    }
    
    return response.data;
  } catch (error) {
    console.error('로그인 오류 상세:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
      request: error.request
    });
    
    // 네트워크 오류인 경우
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
      return {
        success: false,
        message: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
      };
    }
    
    // 서버 응답이 있는 경우
    return {
      success: false,
      message: error.response?.data?.message || `로그인 중 오류가 발생했습니다. (${error.response?.status || '알 수 없는 오류'})`,
    };
  }
};

/**
 * 회원가입
 * @param {Object} userData - { email, name, password, address, user_type }
 * @returns {Promise} 회원가입 응답
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.success && response.data.data) {
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  } catch (error) {
    console.error('회원가입 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '회원가입 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 로그아웃
 */
export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/';
};

/**
 * 현재 로그인한 사용자 정보 가져오기
 * @returns {Object|null} 사용자 정보 또는 null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (e) {
    console.error('사용자 정보 파싱 오류:', e);
    return null;
  }
};

/**
 * 서버 연결 상태 확인
 * @returns {Promise} 서버 상태 정보
 */
export const testServerConnection = async () => {
  try {
    const response = await api.get('/health');
    return {
      status: 'ok',
      ...response.data,
    };
  } catch (error) {
    console.error('서버 연결 확인 오류:', error);
    return {
      status: 'error',
      message: error.response?.data?.message || '서버에 연결할 수 없습니다.',
      mongodb: 'disconnected',
    };
  }
};

// ==================== 상품 관련 ====================

/**
 * 상품 목록 조회
 * @param {Object} params - { page, limit, search, sortBy, sortOrder, minPrice, maxPrice, developer }
 * @returns {Promise} 상품 목록 응답
 */
export const getProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.developer) queryParams.append('developer', params.developer);
    
    const queryString = queryParams.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '상품 목록을 불러오는데 실패했습니다.',
      data: [],
      total: 0,
      totalPages: 0,
    };
  }
};

/**
 * 특정 상품 조회
 * @param {String} productId - 상품 ID
 * @returns {Promise} 상품 정보 응답
 */
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('상품 조회 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '상품을 불러오는데 실패했습니다.',
      data: null,
    };
  }
};

/**
 * 상품 생성
 * @param {Object} productData - 상품 정보
 * @returns {Promise} 생성 응답
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('상품 생성 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '상품 생성에 실패했습니다.',
    };
  }
};

/**
 * 상품 수정
 * @param {String} productId - 상품 ID
 * @param {Object} productData - 수정할 상품 정보
 * @returns {Promise} 수정 응답
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error('상품 수정 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '상품 수정에 실패했습니다.',
    };
  }
};

/**
 * 상품 삭제
 * @param {String} productId - 상품 ID
 * @returns {Promise} 삭제 응답
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '상품 삭제에 실패했습니다.',
    };
  }
};

// ==================== 장바구니 관련 ====================

/**
 * 장바구니 조회
 * @param {String} userId - 사용자 ID
 * @returns {Promise} 장바구니 응답
 */
export const getCart = async (userId) => {
  try {
    // 장바구니 API가 있다고 가정 (없으면 로컬 스토리지 사용)
    const response = await api.get(`/users/${userId}/cart`);
    return response.data;
  } catch (error) {
    console.error('장바구니 조회 오류:', error);
    // 장바구니 API가 없을 수 있으므로 빈 장바구니 반환
    return {
      success: true,
      data: [],
      totalAmount: 0,
    };
  }
};

/**
 * 장바구니에 상품 추가
 * @param {String} userId - 사용자 ID
 * @param {String} productId - 상품 ID
 * @param {Number} quantity - 수량
 * @returns {Promise} 추가 응답
 */
export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    const response = await api.post(`/users/${userId}/cart`, {
      productId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error('장바구니 추가 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '장바구니에 추가하는데 실패했습니다.',
    };
  }
};

/**
 * 장바구니에서 상품 제거
 * @param {String} userId - 사용자 ID
 * @param {String} cartItemId - 장바구니 항목 ID
 * @returns {Promise} 제거 응답
 */
export const removeFromCart = async (userId, cartItemId) => {
  try {
    const response = await api.delete(`/users/${userId}/cart/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error('장바구니 제거 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '장바구니에서 제거하는데 실패했습니다.',
    };
  }
};

// ==================== 주문 관련 ====================

/**
 * 주문 생성
 * @param {String} userId - 사용자 ID
 * @param {Object} orderData - 주문 정보 (name, phone, email, address, notes)
 * @param {String} paymentMethod - 결제 수단
 * @param {Object} paymentInfo - 결제 정보 (imp_uid, merchant_uid, paid_amount, pay_method)
 * @returns {Promise} 주문 생성 응답
 */
export const createOrder = async (userId, orderData, paymentMethod, paymentInfo) => {
  try {
    const response = await api.post(`/users/${userId}/orders`, {
      ...orderData,
      paymentMethod,
      paymentInfo,
    });
    return response.data;
  } catch (error) {
    console.error('주문 생성 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '주문 생성에 실패했습니다.',
    };
  }
};

/**
 * 주문 목록 조회
 * @param {String} userId - 사용자 ID
 * @returns {Promise} 주문 목록 응답
 */
export const getOrders = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/orders`);
    return response.data;
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '주문 목록을 불러오는데 실패했습니다.',
      data: [],
    };
  }
};

/**
 * 특정 주문 조회
 * @param {String} userId - 사용자 ID
 * @param {String} orderId - 주문 ID
 * @returns {Promise} 주문 정보 응답
 */
export const getOrderById = async (userId, orderId) => {
  try {
    const response = await api.get(`/users/${userId}/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('주문 조회 오류:', error);
    return {
      success: false,
      message: error.response?.data?.message || '주문을 불러오는데 실패했습니다.',
      data: null,
    };
  }
};

export default api;
