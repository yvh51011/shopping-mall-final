const API_BASE_URL = 'http://localhost:5000/api';

// 서버 연결 테스트
export const testServerConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('서버 연결 상태:', data);
    return data;
  } catch (error) {
    console.error('서버 연결 테스트 실패:', error);
    return { status: 'error', error: error.message };
  }
};

// 로컬 스토리지에서 사용자 정보 가져오기
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// 로컬 스토리지에 사용자 정보 저장
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// 로그인
export const login = async (credentials) => {
  try {
    // 이메일 정규화 (소문자 변환 및 공백 제거)
    const normalizedCredentials = {
      ...credentials,
      email: credentials.email ? credentials.email.toLowerCase().trim() : ''
    };
    
    console.log('로그인 API 요청:', {
      url: `${API_BASE_URL}/auth/login`,
      email: normalizedCredentials.email,
      passwordLength: normalizedCredentials.password ? normalizedCredentials.password.length : 0
    });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedCredentials),
    });

    console.log('로그인 응답 상태:', response.status, response.statusText);

    // 응답 파싱
    let data;
    try {
      const text = await response.text();
      console.log('로그인 응답 본문:', text);
      
      if (!text) {
        return {
          success: false,
          message: '서버로부터 응답을 받지 못했습니다.',
        };
      }
      
      data = JSON.parse(text);
      console.log('로그인 응답 데이터:', data);
    } catch (jsonError) {
      console.error('JSON 파싱 오류:', jsonError);
      return {
        success: false,
        message: '서버 응답을 처리할 수 없습니다.',
      };
    }
    
    // 성공 응답 처리
    if (data && data.success === true && data.data) {
      console.log('사용자 정보 저장:', data.data);
      setCurrentUser(data.data);
    } else {
      console.log('로그인 실패:', data);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    // 네트워크 오류인지 확인
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
      };
    }
    return {
      success: false,
      message: '로그인 중 오류가 발생했습니다: ' + error.message,
    };
  }
};

// 회원가입
export const register = async (userData) => {
  try {
    console.log('회원가입 시도:', `${API_BASE_URL}/auth/register`);
    console.log('요청 데이터:', userData);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('응답 상태:', response.status, response.statusText);
    console.log('응답 헤더:', response.headers);

    // 응답이 OK가 아니어도 JSON 파싱 시도
    let data;
    try {
      const text = await response.text();
      console.log('응답 본문 (텍스트):', text);
      data = JSON.parse(text);
      console.log('응답 데이터 (파싱됨):', data);
    } catch (jsonError) {
      console.error('JSON 파싱 오류:', jsonError);
      return {
        success: false,
        message: '서버 응답을 처리할 수 없습니다.',
      };
    }
    
    if (data.success && data.data) {
      setCurrentUser(data.data);
      console.log('사용자 정보 저장됨:', data.data);
    } else {
      console.log('회원가입 실패:', data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    // 네트워크 오류인지 확인
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
      };
    }
    return {
      success: false,
      message: '회원가입 중 오류가 발생했습니다: ' + error.message,
    };
  }
};

// 로그아웃
export const logout = () => {
  setCurrentUser(null);
};

// 상품 목록 가져오기
export const getProducts = async (params = {}) => {
  try {
    // 쿼리 파라미터 구성
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
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    console.log('상품 목록 API 호출:', url);
    
    const response = await fetch(url);
    
    console.log('상품 목록 API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('상품 목록 API 오류 응답:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('상품 목록 API 응답 데이터:', {
      success: data.success,
      count: data.count,
      total: data.total,
      dataLength: data.data ? data.data.length : 0
    });
    
    return data;
  } catch (error) {
    console.error('Get products error:', error);
    // 네트워크 오류인지 확인
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
        error: error.message
      };
    }
    return {
      success: false,
      message: '상품 조회 중 오류가 발생했습니다.',
      error: error.message
    };
  }
};

// 특정 상품 가져오기
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get product error:', error);
    return {
      success: false,
      message: '상품 조회 중 오류가 발생했습니다.',
    };
  }
};

// 장바구니 관련 함수들 (localStorage 기반)
export const getCart = () => {
  try {
    const cartStr = localStorage.getItem('cart');
    if (cartStr) {
      return JSON.parse(cartStr);
    }
    return [];
  } catch (e) {
    console.error('장바구니 가져오기 오류:', e);
    return [];
  }
};

export const addToCart = (product) => {
  try {
    const cart = getCart();
    const existingItem = cart.find(item => item.productId === product._id || item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // 커스텀 이벤트 발생하여 네비바에 알림
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
    
    return { success: true, cart };
  } catch (error) {
    console.error('장바구니 추가 오류:', error);
    return { success: false, message: '장바구니에 추가하는 중 오류가 발생했습니다.' };
  }
};

export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

export const updateCartItemQuantity = (productId, quantity) => {
  try {
    const cart = getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (!item) {
      return { success: false, message: '장바구니에 해당 상품이 없습니다.' };
    }
    
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // 커스텀 이벤트 발생하여 네비바에 알림
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
    
    return { success: true, cart };
  } catch (error) {
    console.error('장바구니 수량 수정 오류:', error);
    return { success: false, message: '장바구니 수량 수정 중 오류가 발생했습니다.' };
  }
};

export const removeFromCart = (productId) => {
  try {
    const cart = getCart();
    const filteredCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    
    // 커스텀 이벤트 발생하여 네비바에 알림
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: filteredCart } }));
    
    return { success: true, cart: filteredCart };
  } catch (error) {
    console.error('장바구니 삭제 오류:', error);
    return { success: false, message: '장바구니에서 삭제하는 중 오류가 발생했습니다.' };
  }
};

export const clearCart = () => {
  try {
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
    return { success: true };
  } catch (error) {
    console.error('장바구니 비우기 오류:', error);
    return { success: false, message: '장바구니를 비우는 중 오류가 발생했습니다.' };
  }
};

// 주문 생성
export const createOrder = async (userId, shippingInfo, paymentMethod = 'other', paymentInfo = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        shippingInfo,
        paymentMethod,
        paymentInfo
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create order error:', error);
    return {
      success: false,
      message: '주문 생성 중 오류가 발생했습니다: ' + error.message,
    };
  }
};
