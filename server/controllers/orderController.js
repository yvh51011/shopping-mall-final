const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 주문 생성
exports.createOrder = async (req, res) => {
  try {
    const { userId, shippingInfo, paymentMethod = 'other', paymentInfo } = req.body;

    // 필수 필드 검증
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID가 필요합니다.'
      });
    }

    if (!shippingInfo || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.email) {
      return res.status(400).json({
        success: false,
        message: '배송 정보(이름, 연락처, 이메일)가 필요합니다.'
      });
    }

    // 장바구니에서 주문할 상품 가져오기
    const cartItems = await Cart.find({ user: userId })
      .populate('product', 'name price image description developer link');

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: '장바구니가 비어있습니다.'
      });
    }

    // 주문 상품 정보 구성 (스냅샷)
    const orderItems = cartItems.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
      developer: item.product.developer,
      link: item.product.link
    }));

    // 총 금액 계산
    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 주문 생성
    const paymentData = {
      method: paymentMethod,
      status: paymentInfo ? 'completed' : 'pending'
    };

    // 결제 정보가 있으면 추가
    if (paymentInfo) {
      paymentData.paidAt = new Date();
      paymentData.transactionId = paymentInfo.imp_uid || paymentInfo.merchant_uid;
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      shippingInfo: shippingInfo,
      payment: paymentData,
      status: paymentInfo ? 'paid' : 'pending'
    });

    // 주문 생성 후 장바구니 비우기
    await Cart.deleteMany({ user: userId });

    // populate로 사용자 정보 포함하여 반환
    await order.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: '주문이 성공적으로 생성되었습니다.',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: '주문 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 사용자의 주문 목록 조회
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID가 필요합니다.'
      });
    }

    // 페이지네이션
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 주문 목록 조회
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    // 전체 주문 개수
    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalOrders: totalOrders,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: '주문 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 모든 주문 목록 조회 (관리자용)
exports.getAllOrders = async (req, res) => {
  try {
    // 페이지네이션
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 필터링 옵션
    const status = req.query.status;
    const query = status ? { status: status } : {};

    // 주문 목록 조회
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    // 전체 주문 개수
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalOrders: totalOrders,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: '주문 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 특정 주문 조회
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body.userId;

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name price image description developer link');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    // 사용자 확인 (본인 주문이거나 관리자인지)
    if (userId && order.user._id.toString() !== userId) {
      // 관리자 권한 확인은 미들웨어에서 처리하는 것이 좋지만, 여기서는 간단히 처리
      // 실제로는 JWT 토큰에서 user_type을 확인해야 함
      return res.status(403).json({
        success: false,
        message: '권한이 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by id error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 주문 ID입니다.'
      });
    }
    res.status(500).json({
      success: false,
      message: '주문 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 주문 상태 업데이트 (관리자용)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // 상태 검증
    const validStatuses = ['pending', 'paid', 'processing', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 주문 상태입니다.'
      });
    }

    // 업데이트할 데이터 구성
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // 결제 상태도 함께 업데이트할 수 있도록
    if (status === 'paid' && req.body.paymentStatus) {
      updateData['payment.status'] = req.body.paymentStatus;
      if (req.body.paymentStatus === 'completed') {
        updateData['payment.paidAt'] = new Date();
      }
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    )
      .populate('user', 'name email')
      .populate('items.product', 'name price image description developer link');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '주문 상태가 업데이트되었습니다.',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 주문 ID입니다.'
      });
    }
    res.status(500).json({
      success: false,
      message: '주문 상태 업데이트 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 주문 취소
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body.userId;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    // 사용자 확인
    if (userId && order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '권한이 없습니다.'
      });
    }

    // 이미 취소되었거나 완료된 주문은 취소 불가
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '이미 취소된 주문입니다.'
      });
    }

    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '완료된 주문은 취소할 수 없습니다.'
      });
    }

    // 주문 취소
    order.status = 'cancelled';
    if (order.payment.status === 'completed') {
      order.payment.status = 'refunded';
    }
    await order.save();

    await order.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: '주문이 취소되었습니다.',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 주문 ID입니다.'
      });
    }
    res.status(500).json({
      success: false,
      message: '주문 취소 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

