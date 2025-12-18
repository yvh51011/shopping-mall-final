const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 모든 사용자 조회 (GET /api/users)
router.get('/', userController.getAllUsers);

// 특정 사용자 조회 (GET /api/users/:id)
router.get('/:id', userController.getUserById);

// 사용자 생성 (POST /api/users)
router.post('/', userController.createUser);

// 사용자 업데이트 (PUT /api/users/:id)
router.put('/:id', userController.updateUser);

// 사용자 삭제 (DELETE /api/users/:id)
router.delete('/:id', userController.deleteUser);

module.exports = router;

