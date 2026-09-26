import React from 'react';
import { Users, Car, Map, LogOut, X, ShieldCheck, UserCheck, ChevronRight, ChevronLeft } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, isCollapsed, setIsCollapsed, currentUser, onLogout }) {
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
          className="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-box">MV</div>
            {!isCollapsed && <span className="sidebar-logo-text">ميفيدا Hegazy</span>}
          </div>
          {/* Close button - visible on mobile only */}
          <button className="sidebar-toggle-btn sidebar-close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Badge Info */}
        {currentUser && (
          <div className={`sidebar-user-badge ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-user-avatar" style={{
              backgroundColor: currentUser.role === 'superadmin' ? '#f59e0b' : '#3b82f6',
            }}>
              {currentUser.role === 'superadmin' ? <ShieldCheck size={20} /> : <UserCheck size={20} />}
            </div>
            {!isCollapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{currentUser.name}</div>
                <div className="sidebar-user-role" style={{
                  color: currentUser.role === 'superadmin' ? '#fbbf24' : '#93c5fd',
                }}>
                  {currentUser.role === 'superadmin' ? 'سوبر أدمن' : 'مشرف قطاع'}
                </div>
              </div>
            )}
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
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="sidebar-item-icon" />
                  {!isCollapsed && <span>{item.label}</span>}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <a className="sidebar-logout" onClick={onLogout} title={isCollapsed ? 'تسجيل الخروج' : undefined}>
            <LogOut size={20} />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </a>
        </div>

        {/* Desktop Collapse Toggle - fixed to the edge of the sidebar */}
        <button
          className="sidebar-collapse-btn desktop-only"
          onClick={() => setIsCollapsed(prev => !prev)}
          title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
