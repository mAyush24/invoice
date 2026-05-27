import React from 'react';
import { 
  BarChart3, 
  Receipt, 
  ClipboardList, 
  Package, 
  FileText, 
  AlertTriangle, 
  DollarSign 
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'billing', label: 'New Bill', icon: Receipt },
    { id: 'bills', label: 'All Bills', icon: ClipboardList },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'stocklog', label: 'Stock Log', icon: FileText },
    { id: 'damage', label: 'Damage Goods', icon: AlertTriangle },
    { id: 'profitloss', label: 'Profit & Loss', icon: DollarSign },
  ];

  return (
    <nav className="sidebar no-print">
      <div className="logo-container">
        Stock<span>Master</span>
      </div>
      <div className="nav-links">
        {menuItems.map((item) => {
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
    </nav>
  );
}
