import React, { useState } from 'react';
import { Phone, Lock, LogIn, Shield, AlertCircle } from 'lucide-react';

function LoginModal({ onLogin, API_BASE_URL, showToast }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    // If password hasn't been modified separately or matches old phone, auto-sync
    if (!password || password === phone) {
      setPassword(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('برجاء إدخال رقم الهاتف');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

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
        showToast(`مرحباً بك يا ${data.user.name}`);
        onLogin(data.user);
      } else {
        setErrorMsg(data.message || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('خطأ في الاتصال بالسيرفر');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSuperAdmin = () => {
    setPhone('01015112428');
    setPassword('01015112428');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        direction: 'rtl'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: '#1e3a8a',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 10px 20px rgba(30, 58, 138, 0.3)'
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            تسجيل الدخول للنظام
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            نظام إدارة السكان والكومباوند - ميفيدا Hegazy
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
              رقم الهاتف
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="أدخل رقم الهاتف (مثال: 01015112428)"
                value={phone}
                onChange={handlePhoneChange}
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}
              />
              <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
              كلمة السر (رقم الهاتف)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="أدخل كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  fontSize: '0.95rem'
                }}
              />
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: '700',
              justifyContent: 'center',
              backgroundColor: '#1e3a8a'
            }}
          >
            <LogIn size={20} />
            {isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
