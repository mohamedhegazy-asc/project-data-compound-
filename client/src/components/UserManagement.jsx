import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function UserManagement({ API_BASE_URL, parcels, showToast }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Field States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedParcels, setSelectedParcels] = useState([]);
  const [canDelete, setCanDelete] = useState(false);
  const [allParcelsChecked, setAllParcelsChecked] = useState(false);

  // Form Validation Errors
  const [errors, setErrors] = useState({ name: '', phone: '', parcels: '' });
  const [touched, setTouched] = useState({ name: false, phone: false });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('خطأ في جلب بيانات المشرفين', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateName = (val) => {
    if (!val || !val.trim()) return 'اسم المشرف مطلوب';
    if (val.trim().length < 3) return 'الاسم يجب أن يتكون من 3 أحرف على الأقل';
    return '';
  };

  const validatePhone = (val) => {
    if (!val || !val.trim()) return 'رقم الهاتف مطلوب';
    const clean = val.trim();
    if (!/^01[0-9]{9}$/.test(clean)) {
      return 'برجاء إدخال رقم هاتف مصري صحيح يتكون من 11 رقم (مثال: 01012345678)';
    }
    return '';
  };

  const validateParcels = (allChecked, selParcels) => {
    if (!allChecked && (!selParcels || selParcels.length === 0)) {
      return 'برجاء اختيار بارسيل واحد على الأقل للمشرف';
    }
    return '';
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (touched.name) {
      setErrors(prev => ({ ...prev, name: validateName(val) }));
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (touched.phone) {
      setErrors(prev => ({ ...prev, phone: validatePhone(val) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'name') setErrors(prev => ({ ...prev, name: validateName(name) }));
    if (field === 'phone') setErrors(prev => ({ ...prev, phone: validatePhone(phone) }));
  };

  const openAddForm = () => {
    setEditingUser(null);
    setName('');
    setPhone('');
    setSelectedParcels([]);
    setCanDelete(false);
    setAllParcelsChecked(false);
    setErrors({ name: '', phone: '', parcels: '' });
    setTouched({ name: false, phone: false });
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setName(user.name);
    setPhone(user.phone);
    setSelectedParcels(user.allowedParcels || []);
    setCanDelete(user.canDelete || false);
    setAllParcelsChecked(user.allowedParcels?.includes('*') || false);
    setErrors({ name: '', phone: '', parcels: '' });
    setTouched({ name: false, phone: false });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setErrors({ name: '', phone: '', parcels: '' });
  };

  const toggleParcel = (pName) => {
    if (allParcelsChecked) return;
    let updated;
    if (selectedParcels.includes(pName)) {
      updated = selectedParcels.filter(p => p !== pName);
    } else {
      updated = [...selectedParcels, pName];
    }
    setSelectedParcels(updated);
    setErrors(prev => ({ ...prev, parcels: validateParcels(allParcelsChecked, updated) }));
  };

  const handleToggleAllParcels = (e) => {
    const checked = e.target.checked;
    setAllParcelsChecked(checked);
    const updated = checked ? ['*'] : [];
    setSelectedParcels(updated);
    setErrors(prev => ({ ...prev, parcels: validateParcels(checked, updated) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setTouched({ name: true, phone: true });

    const nErr = validateName(name);
    const pErr = validatePhone(phone);
    const parcErr = validateParcels(allParcelsChecked, selectedParcels);

    setErrors({ name: nErr, phone: pErr, parcels: parcErr });

    if (nErr || pErr || parcErr) return;

    const finalAllowed = allParcelsChecked ? ['*'] : selectedParcels;

    setIsSaving(true);
    const isEdit = editingUser !== null;
    const url = isEdit ? `${API_BASE_URL}/api/users/${editingUser._id}` : `${API_BASE_URL}/api/users`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          allowedParcels: finalAllowed,
          canDelete
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (showToast) showToast(isEdit ? 'تم تحديث بيانات المشرف بنجاح' : 'تم إضافة المشرف بنجاح');
        closeForm();
        fetchUsers();
      } else {
        if (data.message && data.message.includes('هاتف')) {
          setErrors(prev => ({ ...prev, phone: data.message }));
        } else if (showToast) {
          showToast(data.message || 'حدث خطأ أثناء الحفظ', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('خطأ في الاتصال بالشبكة', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: `حذف المشرف: ${user.name}`,
      text: 'هل أنت متأكد من حذف هذا المشرف؟ لن يتمكن من تسجيل الدخول مجدداً.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b3261e',
      cancelButtonColor: '#747775',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user._id}`, { method: 'DELETE' });
      if (res.ok) {
        if (showToast) showToast('تم حذف المشرف بنجاح');
        fetchUsers();
      } else {
        const data = await res.json();
        if (showToast) showToast(data.message || 'فشل الحذف', 'error');
      }
    } catch {
      if (showToast) showToast('خطأ بالاتصال بالسيرفر', 'error');
    }
  };

  return (
    <div style={{ padding: '1.5rem 0', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: '#ffffff',
        padding: '1.5rem 2rem',
        borderRadius: '20px',
        border: '1px solid #e1e3e8',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.4rem', fontWeight: '600', color: '#1f1f1f' }}>
            إدارة المشرفين والصلاحيات
          </h2>
          <p style={{ margin: 0, color: '#444746', fontSize: '0.875rem' }}>
            إضافة المشرفين وتعيين نطاق البارسيل وصلاحية الحذف لكل مشرف
          </p>
        </div>

        {!showForm && (
          <button
            onClick={openAddForm}
            style={{
              backgroundColor: '#0b57d0',
              color: '#ffffff',
              border: 'none',
              borderRadius: '100px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              transition: 'background-color 0.2s'
            }}
          >
            إضافة مشرف جديد
          </button>
        )}
      </div>

      {/* Inline Embedded Form Panel (Google Material 3 Style) */}
      {showForm && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #c4c7c5',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e1e3e8' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#1f1f1f' }}>
              {editingUser ? 'تعديل بيانات المشرف' : 'إضافة مشرف جديد'}
            </h3>
            <button
              onClick={closeForm}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#444746',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSave} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Name Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: errors.name ? '#b3261e' : '#444746', marginBottom: '0.4rem' }}>
                  اسم المشرف الكامل *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => handleBlur('name')}
                  placeholder="مثال: أحمد مصطفى"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    fontSize: '0.95rem',
                    color: '#1f1f1f',
                    backgroundColor: '#ffffff',
                    border: errors.name ? '2px solid #b3261e' : '1px solid #747775',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.name && (
                  <span style={{ color: '#b3261e', fontSize: '0.78rem', marginTop: '0.35rem', display: 'block', fontWeight: '500' }}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: errors.phone ? '#b3261e' : '#444746', marginBottom: '0.4rem' }}>
                  رقم الهاتف (يُستخدم كـ اسم مستخدم وكلمة سر) *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder="01012345678"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    fontSize: '0.95rem',
                    color: '#1f1f1f',
                    backgroundColor: '#ffffff',
                    border: errors.phone ? '2px solid #b3261e' : '1px solid #747775',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.phone && (
                  <span style={{ color: '#b3261e', fontSize: '0.78rem', marginTop: '0.35rem', display: 'block', fontWeight: '500' }}>
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Allowed Parcels Chip Grid */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: errors.parcels ? '#b3261e' : '#1f1f1f' }}>
                  تحديد البارسيل المصرح بها للمشرف *
                </label>
                <label style={{ fontSize: '0.85rem', color: '#0b57d0', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={allParcelsChecked}
                    onChange={handleToggleAllParcels}
                    style={{ accentColor: '#0b57d0', width: '16px', height: '16px' }}
                  />
                  سماح لكل البارسيل
                </label>
              </div>

              {!allParcelsChecked && (
                <div style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: errors.parcels ? '2px solid #b3261e' : '1px solid #e1e3e8',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.6rem',
                  backgroundColor: '#f8fafd'
                }}>
                  {parcels.map((p) => {
                    const checked = selectedParcels.includes(p.name);
                    return (
                      <label
                        key={p._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.85rem',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '10px',
                          backgroundColor: checked ? '#c2e7ff' : '#ffffff',
                          border: checked ? '1px solid #0b57d0' : '1px solid #c4c7c5',
                          cursor: 'pointer',
                          fontWeight: checked ? '600' : 'normal',
                          color: checked ? '#001d35' : '#444746',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleParcel(p.name)}
                          style={{ accentColor: '#0b57d0' }}
                        />
                        <span>{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {errors.parcels && (
                <span style={{ color: '#b3261e', fontSize: '0.78rem', marginTop: '0.4rem', display: 'block', fontWeight: '500' }}>
                  {errors.parcels}
                </span>
              )}
            </div>

            {/* Delete Permission Switch Option */}
            <div style={{
              backgroundColor: '#f8fafd',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid #e1e3e8',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f1f1f' }}>
                  صلاحية حذف البيانات
                </div>
                <div style={{ fontSize: '0.8rem', color: '#444746', marginTop: '2px' }}>
                  السماح للمشرف وحسابه بحذف السكان والتسجيلات بشكل نهائي
                </div>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={canDelete}
                  onChange={(e) => setCanDelete(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: canDelete ? '#0b57d0' : '#c4c7c5',
                  borderRadius: '24px',
                  transition: '0.2s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: canDelete ? '22px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.2s'
                  }} />
                </span>
              </label>
            </div>

            {/* Form Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={closeForm}
                style={{
                  backgroundColor: 'transparent',
                  color: '#444746',
                  border: '1px solid #747775',
                  borderRadius: '100px',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  backgroundColor: isSaving ? '#a8c7fa' : '#0b57d0',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '0.65rem 1.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'جاري الحفظ...' : (editingUser ? 'تحديث البيانات' : 'حفظ المشرف')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e1e3e8', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafd', borderBottom: '1px solid #e1e3e8' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#444746' }}>اسم المشرف</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#444746' }}>رقم الهاتف (الدخول)</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#444746' }}>البارسيل المصرح بها</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#444746' }}>صلاحية الحذف</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#444746', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isAll = u.allowedParcels?.includes('*');
              return (
                <tr key={u._id} style={{ borderBottom: '1px solid #f1f3f8' }}>
                  <td style={{ padding: '1.2rem 1.5rem', fontWeight: '600', color: '#1f1f1f' }}>
                    {u.name}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#f1f3f8', padding: '4px 10px', borderRadius: '8px', fontWeight: '600', fontSize: '0.88rem', color: '#1f1f1f' }}>
                      {u.phone}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    {isAll ? (
                      <span style={{ backgroundColor: '#e8f0fe', color: '#0b57d0', padding: '4px 12px', borderRadius: '100px', fontWeight: '600', fontSize: '0.8rem' }}>
                        كل البارسيل
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {u.allowedParcels?.map((pName, idx) => (
                          <span key={idx} style={{ backgroundColor: '#f1f3f8', color: '#444746', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '500', border: '1px solid #e1e3e8' }}>
                            {pName}
                          </span>
                        ))}
                        {(!u.allowedParcels || u.allowedParcels.length === 0) && (
                          <span style={{ color: '#747775', fontSize: '0.8rem' }}>غير محدد</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    {u.canDelete ? (
                      <span style={{ color: '#146c2e', backgroundColor: '#e6f4ea', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>
                        مسموح بالمسح
                      </span>
                    ) : (
                      <span style={{ color: '#b3261e', backgroundColor: '#fdeded', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>
                        ممنوع الحذف
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button
                        onClick={() => openEditForm(u)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#0b57d0',
                          border: '1px solid #a8c7fa',
                          borderRadius: '8px',
                          padding: '4px 12px',
                          fontSize: '0.825rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#b3261e',
                          border: '1px solid #f9dedc',
                          borderRadius: '8px',
                          padding: '4px 12px',
                          fontSize: '0.825rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && !isLoading && (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#747775' }}>
                  لا يوجد مشرفين مضافين حتى الآن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
