import React from 'react';
import { 
  BarChart3, 
  Receipt, 
  ClipboardList, 
  Package, 
  FileText, 
  AlertTriangle, 
  DollarSign,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ 
  currentPage, 
  setCurrentPage, 
  currentUser, 
  onLogout, 
  isSidebarOpen, 
  setIsSidebarOpen 
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'billing', label: 'New Bill', icon: Receipt },
    { id: 'bills', label: 'All Bills', icon: ClipboardList },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'stocklog', label: 'Stock Log', icon: FileText },
    { id: 'damage', label: 'Damage Goods', icon: AlertTriangle },
    { id: 'profitloss', label: 'Profit & Loss', icon: DollarSign },
  ];

  // Restrict menu items for staff members to only show "Stock"
  const filteredMenuItems = currentUser?.role === 'staff'
    ? menuItems.filter(item => item.id === 'stock')
    : menuItems;

  const initials = currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile Top Bar Header */}
      <div className="mobile-topbar no-print">
        <button 
          type="button" 
          className="menu-toggle" 
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={22} />
        </button>
        <div className="logo-container" style={{ padding: 0, margin: 0 }}>
          Stock<span>Master</span>
        </div>
        <div className="mobile-user-avatar" title={currentUser?.username}>
          {initials}
        </div>
      </div>

      {/* Drawer Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="drawer-overlay no-print" 
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)} 
        />
      )}

      {/* Navigation Sidebar / Slide Drawer */}
      <nav className={`sidebar no-print ${isSidebarOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-header" style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo-container" style={{ padding: 0, margin: 0 }}>
            Stock<span>Master</span>
          </div>
          <button 
            type="button" 
            className="drawer-close" 
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {currentUser && (
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{currentUser.username}</div>
              <div className="user-role">{currentUser.role === 'admin' ? '👑 Admin' : '🛡️ Staff'}</div>
            </div>
          </div>
        )}

        <div className="nav-links">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (setIsSidebarOpen) setIsSidebarOpen(false); // Auto close drawer on menu selection
                }}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {onLogout && (
          <div className="sidebar-footer">
            <button 
              className="logout-btn" 
              onClick={() => {
                onLogout();
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }} 
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
