const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * 상품 CRUD 라우터
 * 
 * @route GET /api/products
 * @desc 모든 상품 조회 (페이지네이션, 검색, 필터링 지원)
 * @query page, limit, sortBy, sortOrder, search, minPrice, maxPrice, developer
 * @access Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route POST /api/products
 * @desc 새 상품 생성
 * @body {String} name, {Number} price, {String} image, {String} description, {String} link, {String} developer
 * @access Admin (추후 미들웨어 추가 권장)
 */
router.post('/', productController.createProduct);

/**
 * @route GET /api/products/user/:userId
 * @desc 특정 사용자가 등록한 상품 조회
 * @param {String} userId - 사용자 ID
 * @query page, limit, sortBy, sortOrder
 * @access Public
 */
router.get('/user/:userId', productController.getProductsByUser);

/**
 * @route GET /api/products/:id
 * @desc 특정 상품 조회
 * @param {String} id - 상품 ID
 * @access Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route PUT /api/products/:id
 * @desc 상품 정보 업데이트
 * @param {String} id - 상품 ID
 * @body {String} name, {Number} price, {String} image, {String} description, {String} link, {String} developer (선택사항)
 * @access Admin (추후 미들웨어 추가 권장)
 */
router.put('/:id', productController.updateProduct);

/**
 * @route DELETE /api/products/:id
 * @desc 상품 삭제
 * @param {String} id - 상품 ID
 * @access Admin (추후 미들웨어 추가 권장)
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;






