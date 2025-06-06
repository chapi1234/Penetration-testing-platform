const router = require('express').Router();
const authController = require('../controllers/authController');
const adminAuth = require('../middlewares/adminAuth');

router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.post('/admin-login', authController.adminLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;