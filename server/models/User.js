const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'كلمة السر مطلوبة']
  },
  role: {
    type: String,
    enum: ['superadmin', 'subadmin'],
    default: 'subadmin'
  },
  allowedParcels: {
    type: [String],
    default: []
  },
  canDelete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
