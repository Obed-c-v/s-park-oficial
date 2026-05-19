const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/avatars'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.user_id}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected profile routes
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateProfile);
router.patch('/me/password', authenticate, authController.changePassword);
router.post('/me/foto', authenticate, upload.single('foto'), authController.uploadPhoto);

module.exports = router;
