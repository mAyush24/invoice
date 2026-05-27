import React from 'react';

export default function Dashboard({ bills, damageLog, stockSummary, onNavigate, onViewBill }) {
  // Calculations
  const totalBills = bills.length;
  
  const totalSale = bills.reduce((sum, b) => 
    sum + b.items.reduce((s, i) => s + i.sale * i.qty, 0)
  , 0);

  const totalPurchase = bills.reduce((sum, b) => 
    sum + b.items.reduce((s, i) => s + i.purchase * i.qty, 0)
  , 0);

  const totalDamage = damageLog.reduce((sum, d) => sum + d.qty * d.rate, 0);
  const netProfit = totalSale - totalPurchase - totalDamage;
  const stockItemsCount = Object.keys(stockSummary).length;

  const recentBills = bills.slice(0, 8);

  return (
    <div className="page">
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Overview of your business</div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <div className="stat-label">Total Bills</div>
          <div className="stat-value yellow">{totalBills}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Total Sale</div>
          <div className="stat-value yellow">₹{totalSale.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Net Profit</div>
          <div className="stat-value green">₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Damage Loss</div>
          <div className="stat-value red">₹{totalDamage.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Stock Items</div>
          <div className="stat-value yellow">{stockItemsCount}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent Bills</div>
        <div className="table-wrap">
          {recentBills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">
                No bills yet.{' '}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigate('billing'); }} 
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}
                >
                  Create one →
                </a>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Party</th>
                  <th>Date</th>
                  <th>Sale Amount</th>
                  <th>Profit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((b) => {
                  const billSaleTotal = b.items.reduce((s, i) => s + i.sale * i.qty, 0);
                  const billPurchTotal = b.items.reduce((s, i) => s + i.purchase * i.qty, 0);
                  const profit = billSaleTotal - billPurchTotal;

                  return (
                    <tr key={b.id}>
                      <td><span className="badge badge-yellow">{b.billNo}</span></td>
                      <td>{b.party}</td>
                      <td>{b.date}</td>
                      <td className="num-font">₹{billSaleTotal.toFixed(2)}</td>
                      <td>
                        <span className={profit >= 0 ? 'badge badge-green' : 'badge badge-red'}>
                          ₹{profit.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-ghost" onClick={() => onViewBill(b.id)}>
                          👁 View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
