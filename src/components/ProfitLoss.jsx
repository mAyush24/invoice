import React from 'react';

export default function ProfitLoss({ bills, damageLog }) {
  // Financial Calculations
  const totalSale = bills.reduce((sum, b) => 
    sum + b.items.reduce((s, i) => s + i.sale * i.qty, 0)
  , 0);

  const totalPurchase = bills.reduce((sum, b) => 
    sum + b.items.reduce((s, i) => s + i.purchase * i.qty, 0)
  , 0);

  const totalDamage = damageLog.reduce((sum, d) => sum + d.qty * d.rate, 0);
  const grossProfit = totalSale - totalPurchase;
  const netProfit = grossProfit - totalDamage;

  return (
    <div className="page">
      <div className="page-title">Profit & Loss</div>
      <div className="page-sub">Complete financial overview — visible only to you</div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <div className="stat-label">Total Sale</div>
          <div className="stat-value yellow">₹{totalSale.toFixed(2)}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Total Purchase</div>
          <div className="stat-value yellow">₹{totalPurchase.toFixed(2)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Gross Profit</div>
          <div className="stat-value green">₹{grossProfit.toFixed(2)}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Damage Loss</div>
          <div className="stat-value red">₹{totalDamage.toFixed(2)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Net Profit</div>
          <div className="stat-value green">₹{netProfit.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Bill-wise Profit Breakdown</div>
        <div className="table-wrap">
          {bills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💰</div>
              <div className="empty-state-text">No transactions recorded yet</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Party</th>
                  <th>Date</th>
                  <th>Sale Total</th>
                  <th>Purchase Total</th>
                  <th>Gross Profit</th>
                  <th>Damage Deduction</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => {
                  const billSale = b.items.reduce((s, i) => s + i.sale * i.qty, 0);
                  const billPurch = b.items.reduce((s, i) => s + i.purchase * i.qty, 0);
                  const billGross = billSale - billPurch;

                  return (
                    <tr key={b.id}>
                      <td><span className="badge badge-yellow">{b.billNo}</span></td>
                      <td>{b.party}</td>
                      <td className="num-font">{b.date}</td>
                      <td className="num-font">₹{billSale.toFixed(2)}</td>
                      <td className="profit-column">₹{billPurch.toFixed(2)}</td>
                      <td>
                        <span className={billGross >= 0 ? 'badge badge-green' : 'badge badge-red'}>
                          ₹{billGross.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--red)' }}>—</td>
                      <td>
                        <span className={billGross >= 0 ? 'badge badge-green' : 'badge badge-red'}>
                          ₹{billGross.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Total damage deduction and net profit rows */}
                <tr style={{ background: 'var(--surface2)', fontWeight: 600 }}>
                  <td colSpan="5" style={{ textAlign: 'right', color: 'var(--muted)', fontSize: '12px' }}>
                    TOTAL DAMAGE DEDUCTION
                  </td>
                  <td></td>
                  <td className="num-font" style={{ color: 'var(--red)' }}>-₹{totalDamage.toFixed(2)}</td>
                  <td className="num-font" style={{ color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    ₹{netProfit.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
