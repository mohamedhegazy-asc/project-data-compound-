const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/login
// @desc    Login user with phone number and password
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'رقم الهاتف وكلمة السر حقول مطلوبة' });
    }

    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    // Find user by phone
    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      return res.status(400).json({ message: 'رقم الهاتف غير مسجل في النظام' });
    }

    // Check password (matches phone or stored password)
    if (user.password !== cleanPassword && cleanPhone !== cleanPassword) {
      return res.status(400).json({ message: 'كلمة السر غير صحيحة' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        allowedParcels: user.allowedParcels,
        canDelete: user.canDelete
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user by phone
router.get('/me', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: 'رقم الهاتف مطلوب' });
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      allowedParcels: user.allowedParcels,
      canDelete: user.canDelete
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في السيرفر' });
  }
});

module.exports = router;
