import React, { useState } from 'react';

function LoginModal({ onLogin, API_BASE_URL, showToast }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ phone: false, password: false });

  const validatePhone = (val) => {
    if (!val || !val.trim()) return 'رقم الهاتف مطلوب';
    const clean = val.trim();
    if (!/^01[0-9]{9}$/.test(clean)) {
      return 'برجاء إدخال رقم هاتف مصري صحيح يتكون من 11 رقم (مثال: 01012345678)';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val || !val.trim()) return 'كلمة السر مطلوبة';
    return '';
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (!password || password === phone) {
      setPassword(val);
    }
    if (touched.phone) {
      setPhoneError(validatePhone(val));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setPasswordError(validatePassword(val));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'phone') setPhoneError(validatePhone(phone));
    if (field === 'password') setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ phone: true, password: true });

    const pErr = validatePhone(phone);
    const passErr = validatePassword(password);

    setPhoneError(pErr);
    setPasswordError(passErr);

    if (pErr || passErr) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          password: (password || phone).trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (showToast) showToast(`تم تسجيل الدخول بنجاح (${data.user.name})`);
        onLogin(data.user);
      } else {
        setServerError(data.message || 'رقم الهاتف أو كلمة السر غير صحيحة');
      }
    } catch (err) {
      console.error(err);
      setServerError('تعذر الاتصال بالسيرفر، برجاء المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f8fafd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '460px',
        padding: '3rem 2.5rem',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e1e3e8'
      }}>
        {/* Google Material Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: '#0b57d0',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '1.25rem',
            marginBottom: '1rem',
            letterSpacing: '0.5px'
          }}>
            MV
          </div>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: '600',
            color: '#1f1f1f',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.3px'
          }}>
            تسجيل الدخول
          </h1>
          <p style={{ color: '#444746', fontSize: '0.9rem', margin: 0 }}>
            نظام إدارة ميفيدا Hegazy
          </p>
        </div>

        {/* Server Level Error Banner */}
        {serverError && (
          <div style={{
            backgroundColor: '#fdeded',
            color: '#b3261e',
            border: '1px solid #f9dedc',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {serverError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Phone Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.825rem',
              fontWeight: '600',
              color: phoneError ? '#b3261e' : '#444746',
              marginBottom: '0.4rem'
            }}>
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              placeholder="01012345678"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '0.95rem',
                color: '#1f1f1f',
                backgroundColor: '#ffffff',
                border: phoneError ? '2px solid #b3261e' : '1px solid #747775',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                if (!phoneError) e.target.style.borderColor = '#0b57d0';
              }}
            />
            {phoneError && (
              <span style={{ color: '#b3261e', fontSize: '0.78rem', marginTop: '0.35rem', display: 'block', fontWeight: '500' }}>
                {phoneError}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.825rem',
              fontWeight: '600',
              color: passwordError ? '#b3261e' : '#444746',
              marginBottom: '0.4rem'
            }}>
              كلمة السر
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              placeholder="أدخل كلمة السر"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '0.95rem',
                color: '#1f1f1f',
                backgroundColor: '#ffffff',
                border: passwordError ? '2px solid #b3261e' : '1px solid #747775',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                if (!passwordError) e.target.style.borderColor = '#0b57d0';
              }}
            />
            {passwordError && (
              <span style={{ color: '#b3261e', fontSize: '0.78rem', marginTop: '0.35rem', display: 'block', fontWeight: '500' }}>
                {passwordError}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.9rem',
              backgroundColor: isSubmitting ? '#a8c7fa' : '#0b57d0',
              color: '#ffffff',
              border: 'none',
              borderRadius: '100px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              transition: 'background-color 0.2s, box-shadow 0.2s'
            }}
          >
            {isSubmitting ? 'جاري التحقق...' : 'التالي'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
