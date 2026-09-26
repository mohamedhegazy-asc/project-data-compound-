import React from 'react';
import { Users, Car, Map, LogOut, X, ShieldCheck, UserCheck } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, currentUser, onLogout }) {
  const menuItems = [
    { id: 'residents', label: 'إدارة السكان', icon: Users },
    { id: 'cars', label: 'إدارة السيارات', icon: Car },
    { id: 'parcels', label: 'البارسيل', icon: Map },
  ];

  if (currentUser?.role === 'superadmin') {
    menuItems.push({ id: 'users', label: 'إدارة المشرفين', icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }} 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-box">
              MV
            </div>
            <span className="sidebar-logo-text">ميفيدا Hegazy</span>
          </div>
          {/* Close button - visible on mobile only */}
          <button className="sidebar-toggle-btn sidebar-close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Badge Info */}
        {currentUser && (
          <div style={{
            margin: '0.5rem 1rem 1rem 1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: currentUser.role === 'superadmin' ? '#f59e0b' : '#3b82f6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              {currentUser.role === 'superadmin' ? <ShieldCheck size={20} /> : <UserCheck size={20} />}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                color: 'white',
                fontWeight: '700',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentUser.name}
              </div>
              <div style={{
                color: currentUser.role === 'superadmin' ? '#fbbf24' : '#93c5fd',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {currentUser.role === 'superadmin' ? 'سوبر أدمن' : 'مشرف قطاع'}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Menu */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <a
                  className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="sidebar-item-icon" />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <a className="sidebar-logout" onClick={onLogout}>
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </a>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
