import React from 'react';
import { 
  BarChart3, 
  Receipt, 
  ClipboardList, 
  Package, 
  FileText, 
  AlertTriangle, 
  DollarSign,
  LogOut
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, currentUser, onLogout }) {
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
    <nav className="sidebar no-print">
      <div className="logo-container">
        Stock<span>Master</span>
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
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {onLogout && (
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
