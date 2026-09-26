import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Pencil, Check, X, Phone, User, MapPin, Lock, Unlock } from 'lucide-react';
import Swal from 'sweetalert2';

function UserManagement({ API_BASE_URL, parcels, showToast }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedParcels, setSelectedParcels] = useState([]);
  const [canDelete, setCanDelete] = useState(false);
  const [allParcelsChecked, setAllParcelsChecked] = useState(false);

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
      showToast('خطأ في جلب بيانات المشرفين', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setPhone('');
    setSelectedParcels([]);
    setCanDelete(false);
    setAllParcelsChecked(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setName(user.name);
    setPhone(user.phone);
    setSelectedParcels(user.allowedParcels || []);
    setCanDelete(user.canDelete || false);
    setAllParcelsChecked(user.allowedParcels?.includes('*') || false);
    setIsModalOpen(true);
  };

  const toggleParcel = (pName) => {
    if (allParcelsChecked) return;
    if (selectedParcels.includes(pName)) {
      setSelectedParcels(selectedParcels.filter(p => p !== pName));
    } else {
      setSelectedParcels([...selectedParcels, pName]);
    }
  };

  const handleToggleAllParcels = (e) => {
    const checked = e.target.checked;
    setAllParcelsChecked(checked);
    if (checked) {
      setSelectedParcels(['*']);
    } else {
      setSelectedParcels([]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('الاسم ورقم الهاتف حقول مطلوبة', 'error');
      return;
    }

    const finalAllowed = allParcelsChecked ? ['*'] : selectedParcels;

    if (!allParcelsChecked && finalAllowed.length === 0) {
      showToast('يجب تحديد بارسيل واحد على الأقل للمشرف', 'error');
      return;
    }

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
        showToast(isEdit ? 'تم تحديث بيانات المشرف بنجاح' : 'تم إضافة المشرف بنجاح');
        setIsModalOpen(false);
        fetchUsers();
      } else {
        showToast(data.message || 'حدث خطأ أثناء الحفظ', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ في الاتصال بالشبكة', 'error');
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
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف المشرف بنجاح');
        fetchUsers();
      } else {
        const data = await res.json();
        showToast(data.message || 'فشل الحذف', 'error');
      }
    } catch {
      showToast('خطأ بالاتصال بالسيرفر', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck color="#2563eb" /> إدارة المشرفين والصلاحيات
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>إضافة وتعيين صلاحيات المشرفين حسب نطاق البارسيل المصرح به</p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          إضافة مشرف جديد
        </button>
      </div>

      {/* Users Table */}
      <div className="table-responsive-wrapper" style={{ backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '800' }}>اسم المشرف</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '800' }}>رقم الهاتف (الدخول)</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '800' }}>البارسيل المصرح بها</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '800' }}>صلاحية الحذف</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isAll = u.allowedParcels?.includes('*');
              return (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.2rem 1.5rem', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {u.name[0]}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                      {u.phone}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    {isAll ? (
                      <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', border: '1px solid #fde68a' }}>
                        ⭐ كل البارسيل
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {u.allowedParcels?.map((pName, idx) => (
                          <span key={idx} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', border: '1px solid #bfdbfe' }}>
                            <MapPin size={10} style={{ display: 'inline', marginLeft: '2px' }} /> {pName}
                          </span>
                        ))}
                        {(!u.allowedParcels || u.allowedParcels.length === 0) && (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>غير محدد</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    {u.canDelete ? (
                      <span style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Unlock size={12} /> مسموح بالمسح
                      </span>
                    ) : (
                      <span style={{ color: '#b91c1c', backgroundColor: '#fee2e2', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> ممنوع الحذف
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => openEditModal(u)} title="تعديل المشرف">
                        <Pencil size={16} />
                      </button>
                      <button className="btn" style={{ padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626' }} onClick={() => handleDelete(u)} title="حذف المشرف">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && !isLoading && (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  لا يوجد مشرفين مضافين حتى الآن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Sub-Admin Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingUser ? 'تعديل بيانات المشرف' : 'إضافة مشرف جديد'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">اسم المشرف</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: أحمد مصطفى"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">رقم الهاتف (سيستخدم لتسجيل الدخول وكلمة السر)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مثال: 01099998888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Allowed Parcels Selection */}
                <div className="form-group">
                  <label className="form-label required" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>تحديد البارسيل المصرح بها للمشرف</span>
                    <label style={{ fontSize: '0.82rem', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>
                      <input
                        type="checkbox"
                        checked={allParcelsChecked}
                        onChange={handleToggleAllParcels}
                        style={{ marginLeft: '6px' }}
                      />
                      سماح لكل البارسيل
                    </label>
                  </label>

                  {!allParcelsChecked && (
                    <div style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '0.5rem',
                      backgroundColor: '#f8fafc'
                    }}>
                      {parcels.map((p) => {
                        const checked = selectedParcels.includes(p.name);
                        return (
                          <label
                            key={p._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: checked ? '#eff6ff' : 'white',
                              border: checked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              fontWeight: checked ? 'bold' : 'normal',
                              color: checked ? '#1d4ed8' : '#334155'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleParcel(p.name)}
                            />
                            <span>{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Delete Permission Toggle */}
                <div className="form-group" style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0, fontWeight: '700', color: '#c2410c' }}>
                    <input
                      type="checkbox"
                      checked={canDelete}
                      onChange={(e) => setCanDelete(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>السماح للمشرف بحذف السكان والبيانات</span>
                  </label>
                  <p style={{ fontSize: '0.78rem', color: '#9a3412', margin: '4px 28px 0 0' }}>
                    (افتراضياً لا يستطيع المشرف الحذف حفاظاً على دقة البيانات ما لم تقم بتفعيل هذا الخيار)
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'جاري الحفظ...' : (editingUser ? 'تحديث المشرف' : 'حفظ المشرف')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
