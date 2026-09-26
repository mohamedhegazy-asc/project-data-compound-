const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all sub-admins
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: 'subadmin' }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في جلب بيانات المشرفين' });
  }
});

// @route   POST /api/users
// @desc    Create a new sub-admin
router.post('/', async (req, res) => {
  try {
    const { name, phone, allowedParcels, canDelete } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'الاسم ورقم الهاتف حقول مطلوبة' });
    }

    const cleanPhone = phone.trim();

    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ message: 'رقم الهاتف هذا مسجل بالفعل لمشرف آخر' });
    }

    const newUser = new User({
      name: name.trim(),
      phone: cleanPhone,
      password: cleanPhone, // Phone is both username & password
      role: 'subadmin',
      allowedParcels: Array.isArray(allowedParcels) ? allowedParcels : [],
      canDelete: Boolean(canDelete)
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'حدث خطأ أثناء إضافة المشرف' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update a sub-admin
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, allowedParcels, canDelete } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'المشرف غير موجود' });
    }

    if (name) user.name = name.trim();
    if (phone) {
      user.phone = phone.trim();
      user.password = phone.trim(); // keep password synced with phone
    }
    if (allowedParcels !== undefined) {
      user.allowedParcels = Array.isArray(allowedParcels) ? allowedParcels : [];
    }
    if (canDelete !== undefined) {
      user.canDelete = Boolean(canDelete);
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء تعديل بيانات المشرف' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a sub-admin
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المشرف غير موجود' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'لا يمكن حذف السوبر أدمن الرئيسي' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف المشرف بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف المشرف' });
  }
});

module.exports = router;
