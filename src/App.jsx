import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import AllBills from './components/AllBills';
import Stock from './components/Stock';
import StockLog from './components/StockLog';
import DamageGoods from './components/DamageGoods';
import ProfitLoss from './components/ProfitLoss';
import BillPreview from './components/BillPreview';
import Toast from './components/Toast';
import Login from './components/Login';
import { supabase } from './supabaseClient';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('sm_user') || 'null');
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation Router
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Core Storage States
  const [bills, setBills] = useState(() => {
    return JSON.parse(localStorage.getItem('sm_bills') || '[]');
  });

  const [stockLog, setStockLog] = useState([]);
  const [damageLog, setDamageLog] = useState([]);

  const [billCounter, setBillCounter] = useState(() => {
    return parseInt(localStorage.getItem('sm_billcounter') || '1000');
  });

  // Modal and Interactive States
  const [previewBill, setPreviewBill] = useState(null); // Draft Invoice Preview Modal
  const [viewBill, setViewBill] = useState(null);       // Saved Invoice View Modal
  const [toast, setToast] = useState(null);             // Dynamic Toast notification

  // Save changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sm_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sm_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sm_bills', JSON.stringify(bills));
  }, [bills]);



  useEffect(() => {
    localStorage.setItem('sm_billcounter', billCounter.toString());
  }, [billCounter]);

  // Enforce page redirection for Staff role
  useEffect(() => {
    if (currentUser?.role === 'staff' && currentPage !== 'stock') {
      setCurrentPage('stock');
    }
  }, [currentUser, currentPage]);

  // Fetch stock logs and damage logs from Supabase on mount or login change
  useEffect(() => {
    if (!currentUser) return;

    const fetchSupabaseData = async () => {
      try {
        // Fetch stock log
        const { data: stockData, error: stockError } = await supabase
          .from('stock_log')
          .select('*')
          .order('id', { ascending: false });

        if (stockError) throw stockError;

        if (stockData) {
          const formattedStock = stockData.map(row => ({
            id: parseInt(row.id),
            type: row.type,
            date: row.date,
            item: row.item,
            qty: parseInt(row.qty),
            rate: parseFloat(row.rate || 0),
            party: row.party || '—',
            note: row.note || ''
          }));
          setStockLog(formattedStock);
        } else {
          setStockLog([]);
        }

        // Fetch damage log
        const { data: damageData, error: damageError } = await supabase
          .from('damage_log')
          .select('*')
          .order('id', { ascending: false });

        if (damageError) throw damageError;

        if (damageData) {
          const formattedDamage = damageData.map(row => ({
            id: parseInt(row.id),
            date: row.date,
            item: row.item,
            qty: parseInt(row.qty),
            reason: row.reason || ''
          }));
          setDamageLog(formattedDamage);
        } else {
          setDamageLog([]);
        }
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
        showToast('⚠️', 'Error: Could not retrieve stock details from Supabase.');
      }
    };

    fetchSupabaseData();
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'staff') {
      setCurrentPage('stock');
    } else {
      setCurrentPage('dashboard');
    }
    showToast('👋', `Welcome, ${user.username}!`);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      setCurrentUser(null);
      setCurrentPage('dashboard');
      showToast('👋', 'Signed out successfully!');
    }
  };

  // Utility to show temporary toast
  const showToast = (icon, message) => {
    setToast({ icon, message });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  // Autocomplete & Stock levels calculation
  const stockSummary = useMemo(() => {
    const map = {};
    stockLog.forEach((l) => {
      if (!map[l.item]) map[l.item] = { qty: 0, totalCost: 0, totalAdded: 0 };
      if (l.type === 'add') {
        map[l.item].qty += l.qty;
        map[l.item].totalCost += l.qty * l.rate;
        map[l.item].totalAdded += l.qty;
      } else if (l.type === 'minus') {
        map[l.item].qty -= l.qty;
      }
    });
    damageLog.forEach((d) => {
      if (!map[d.item]) map[d.item] = { qty: 0, totalCost: 0, totalAdded: 0 };
      map[d.item].qty -= d.qty;
    });
    return map;
  }, [stockLog, damageLog]);

  // Billing Actions
  const handleSaveBill = (newBill) => {
    const nextCounter = billCounter + 1;
    const finalBill = {
      id: 'BILL-' + nextCounter,
      ...newBill,
      createdAt: new Date().toISOString()
    };
    
    setBills([finalBill, ...bills]);
    setBillCounter(nextCounter);
    showToast('✅', `Bill ${finalBill.billNo} saved successfully!`);
  };

  const handlePreviewBill = (draftBill) => {
    setPreviewBill(draftBill);
  };

  // All Bills Actions
  const handleViewBill = (billId) => {
    const selected = bills.find((b) => b.id === billId);
    if (selected) {
      setViewBill(selected);
    }
  };

  const handleDeleteBill = (billId) => {
    if (window.confirm('Delete this bill? This cannot be undone.')) {
      setBills(bills.filter((b) => b.id !== billId));
      showToast('🗑', 'Bill deleted successfully');
    }
  };

  // Stock Actions
  const handleAddStock = async (newStock) => {
    const logEntry = {
      type: 'add',
      date: new Date().toISOString().split('T')[0],
      ...newStock
    };

    try {
      const { data, error } = await supabase
        .from('stock_log')
        .insert([logEntry])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const savedEntry = {
          id: parseInt(data[0].id),
          type: data[0].type,
          date: data[0].date,
          ...newStock
        };
        setStockLog([savedEntry, ...stockLog]);
        showToast('✅', `Successfully added ${newStock.qty} units of ${newStock.item}!`);
      }
    } catch (err) {
      console.error('Error adding stock to Supabase:', err);
      showToast('⚠️', 'Failed to add stock. Database connection error.');
    }
  };

  const handleMinusStock = async (minusStock) => {
    const logEntry = {
      type: 'minus',
      date: new Date().toISOString().split('T')[0],
      ...minusStock,
      rate: 0
    };

    try {
      const { data, error } = await supabase
        .from('stock_log')
        .insert([logEntry])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const savedEntry = {
          id: parseInt(data[0].id),
          type: data[0].type,
          date: data[0].date,
          ...minusStock,
          rate: 0
        };
        setStockLog([savedEntry, ...stockLog]);
        showToast('✅', `Successfully removed ${minusStock.qty} units of ${minusStock.item}!`);
      }
    } catch (err) {
      console.error('Error removing stock from Supabase:', err);
      showToast('⚠️', 'Failed to remove stock. Database connection error.');
    }
  };

  // Damage Actions
  const handleLogDamage = async (damage) => {
    const logEntry = {
      date: new Date().toISOString().split('T')[0],
      ...damage
    };

    try {
      const { data, error } = await supabase
        .from('damage_log')
        .insert([logEntry])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const savedEntry = {
          id: parseInt(data[0].id),
          date: data[0].date,
          ...damage
        };
        setDamageLog([savedEntry, ...damageLog]);
        showToast('⚠️', `Damage logged: ${damage.qty} × ${damage.item}`);
      }
    } catch (err) {
      console.error('Error logging damage to Supabase:', err);
      showToast('⚠️', 'Failed to log damage. Database connection error.');
    }
  };

  const handleDeleteStockItem = async (itemName) => {
    if (window.confirm(`Are you sure you want to completely delete "${itemName}" from stock? This will delete all its logs permanently.`)) {
      try {
        const { error: stockError } = await supabase
          .from('stock_log')
          .delete()
          .eq('item', itemName);

        if (stockError) throw stockError;

        const { error: damageError } = await supabase
          .from('damage_log')
          .delete()
          .eq('item', itemName);

        if (damageError) throw damageError;

        setStockLog(stockLog.filter(l => l.item !== itemName));
        setDamageLog(damageLog.filter(d => d.item !== itemName));
        showToast('🗑', `Completely deleted "${itemName}" from database.`);
      } catch (err) {
        console.error('Error deleting stock item:', err);
        showToast('⚠️', 'Failed to delete item from Supabase.');
      }
    }
  };

  // PDF & Printing functions
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const getBillPrintHTML = (bill) => {
    const total = bill.items.reduce((s, i) => s + i.sale * i.qty, 0);
    const rows = bill.items.map(it => {
      const amt = it.sale * it.qty;
      return `<tr>
        <td>${escapeHtml(it.name)}</td>
        <td style="text-align:center;">${it.qty}</td>
        <td style="text-align:right;">&#8377;${it.sale.toFixed(2)}</td>
        <td style="text-align:right;">&#8377;${amt.toFixed(2)}</td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>${escapeHtml(bill.billNo)} - ${escapeHtml(bill.party)}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{
        font-family:'Segoe UI',Arial,sans-serif;
        background:#fff;
        color:#222;
        padding:40px;
        max-width:680px;
        margin:0 auto;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #111;}
      .company{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#111;}
      .company small{display:block;font-size:12px;font-weight:400;color:#777;margin-top:2px;letter-spacing:0;}
      .badge{background:#111;color:#fff;font-size:11px;padding:4px 10px;border-radius:4px;font-weight:600;letter-spacing:1px;}
      .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:28px;}
      .meta-box{background:#f8f8f8;border-radius:8px;padding:14px 16px;}
      .meta-box label{font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#999;display:block;margin-bottom:4px;}
      .meta-box span{font-size:14px;font-weight:600;color:#111;}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:0;}
      thead tr{background:#111;color:#fff;}
      thead th{padding:10px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}
      thead th:nth-child(2){text-align:center;}
      thead th:nth-child(3),thead th:nth-child(4){text-align:right;}
      tbody tr:nth-child(even){background:#f9f9f9;}
      tbody td{padding:10px 12px;border-bottom:1px solid #eee;color:#333;vertical-align:middle;}
      .total-section{display:flex;justify-content:flex-end;margin-top:16px;}
      .total-box{background:#111;color:#fff;padding:14px 20px;border-radius:8px;min-width:200px;}
      .total-box .lbl{font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#aaa;margin-bottom:4px;}
      .total-box .val{font-size:22px;font-weight:800;letter-spacing:-0.5px;}
      .footer{margin-top:32px;text-align:center;font-size:11px;color:#bbb;border-top:1px solid #eee;padding-top:16px;}
      @media print{
        body{
          padding:24px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page{size:A4;margin:15mm 12mm;}
      }
    </style>
    <script>window.onload=function(){window.print();window.close();}<\/script>
    </head><body>
    <div class="header">
      <div>
        <div class="company">TAX INVOICE<small>Customer Copy</small></div>
      </div>
      <div style="text-align:right;">
        <div class="badge">INVOICE</div>
        <div style="font-size:12px;color:#777;margin-top:8px;">Generated by StockMaster</div>
      </div>
    </div>
    <div class="meta-grid">
      <div class="meta-box"><label>Bill Number</label><span>${escapeHtml(bill.billNo)}</span></div>
      <div class="meta-box"><label>Date</label><span>${bill.date}</span></div>
      <div class="meta-box" style="grid-column:1/-1;"><label>Party / Customer</label><span>${escapeHtml(bill.party)}</span>${bill.notes ? `<div style="font-size:12px;color:#777;margin-top:4px;">${escapeHtml(bill.notes)}</div>` : ''}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Rate (&#8377;)</th>
          <th style="text-align:right;">Amount (&#8377;)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="total-section">
      <div class="total-box">
        <div class="lbl">Total Amount</div>
        <div class="val">&#8377;${total.toFixed(2)}</div>
      </div>
    </div>
    <div class="footer">Thank you for your business! &bull; This is a computer-generated bill. &bull; ${escapeHtml(bill.billNo)}</div>
    </body></html>`;
  };

  const handlePrint = (bill) => {
    const html = getBillPrintHTML(bill);
    
    // Create an off-screen iframe to bypass pop-up blockers and COOP headers in production
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.title = 'Print Bill';

    const cleanup = () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document || iframe.contentDocument;
    doc.open();
    doc.write(html);
    doc.close();

    // Listen for the afterprint event to clean up the iframe from DOM
    iframe.contentWindow.addEventListener('afterprint', cleanup);

    // Fallback cleanup after 60 seconds
    setTimeout(cleanup, 60000);
  };


  const handleDownload = (billId) => {
    const selected = bills.find((b) => b.id === billId);
    if (selected) {
      handlePrint(selected);
      showToast('⬇', `Opening print preview for ${selected.billNo}`);
    }
  };

  // Render correct page viewport
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            bills={bills} 
            damageLog={damageLog} 
            stockSummary={stockSummary}
            onNavigate={setCurrentPage}
            onViewBill={handleViewBill}
          />
        );
      case 'billing':
        return (
          <Billing 
            stockSummary={stockSummary}
            bills={bills}
            billCounter={billCounter}
            onSaveBill={handleSaveBill}
            onPreviewBill={handlePreviewBill}
            showToast={showToast}
          />
        );
      case 'bills':
        return (
          <AllBills 
            bills={bills} 
            onViewBill={handleViewBill} 
            onDownloadBill={handleDownload}
            onDeleteBill={handleDeleteBill}
          />
        );
      case 'stock':
        return (
          <Stock 
            stockSummary={stockSummary}
            onAddStock={handleAddStock}
            onMinusStock={handleMinusStock}
            showToast={showToast}
            role={currentUser?.role}
            onDeleteStockItem={handleDeleteStockItem}
          />
        );
      case 'stocklog':
        return (
          <StockLog 
            stockLog={stockLog} 
            damageLog={damageLog} 
          />
        );
      case 'damage':
        return (
          <DamageGoods 
            damageLog={damageLog} 
            stockSummary={stockSummary}
            onLogDamage={handleLogDamage}
            showToast={showToast}
          />
        );
      case 'profitloss':
        return (
          <ProfitLoss 
            bills={bills} 
            damageLog={damageLog} 
          />
        );
      default:
        return <Dashboard bills={bills} damageLog={damageLog} stockSummary={stockSummary} onNavigate={setCurrentPage} onViewBill={handleViewBill} />;
    }
  };

  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast toast={toast} onClose={handleCloseToast} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        currentUser={currentUser}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* MAIN VIEWPORT */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* DRAFT INVOICE PREVIEW MODAL */}
      {previewBill && (
        <div className="modal-overlay open no-print" onClick={() => setPreviewBill(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewBill(null)}>✕</button>
            <div className="modal-title">Customer Bill Preview</div>
            
            <BillPreview bill={previewBill} />

            <div className="btn-row no-print" style={{ marginTop: '24px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => { handlePrint(previewBill); setPreviewBill(null); }}
              >
                🖨 Print / Save PDF
              </button>
              <button className="btn btn-ghost" onClick={() => setPreviewBill(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVED INVOICE VIEW MODAL */}
      {viewBill && (
        <div className="modal-overlay open no-print" onClick={() => setViewBill(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewBill(null)}>✕</button>
            <div className="modal-title">Saved Invoice</div>
            
            <BillPreview bill={viewBill} />

            <div className="btn-row no-print" style={{ marginTop: '24px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => { handlePrint(viewBill); setViewBill(null); }}
              >
                🖨 Print
              </button>
              <button 
                className="btn btn-success" 
                onClick={() => { handleDownload(viewBill.id); setViewBill(null); }}
              >
                ⬇ Download PDF
              </button>
              <button className="btn btn-ghost" onClick={() => setViewBill(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      <Toast toast={toast} onClose={handleCloseToast} />
    </div>
  );
}
