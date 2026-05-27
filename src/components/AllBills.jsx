import React, { useState } from 'react';

export default function AllBills({ bills, onViewBill, onDownloadBill, onDeleteBill }) {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Filtering logic
  const filteredBills = bills.filter((b) => {
    if (search && !b.party.toLowerCase().includes(search.toLowerCase())) return false;
    if (from && b.date < from) return false;
    if (to && b.date > to) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-title">All Bills</div>
      <div className="page-sub">View, print, and manage all generated bills</div>

      <div className="card">
        <div className="filter-grid">
          <div className="form-group">
            <label>Search Party / Customer</label>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Party name..." 
            />
          </div>
          <div className="form-group">
            <label>Date From</label>
            <input 
              type="date" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Date To</label>
            <input 
              type="date" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
            />
          </div>
        </div>

        <div className="table-wrap">
          {filteredBills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No bills match your criteria</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Party</th>
                  <th>Date</th>
                  <th className="hide-mobile">Items</th>
                  <th>Sale Total</th>
                  <th className="hide-mobile">Purchase Total</th>
                  <th>Profit</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((b) => {
                  const saleTotal = b.items.reduce((s, i) => s + i.sale * i.qty, 0);
                  const purchTotal = b.items.reduce((s, i) => s + i.purchase * i.qty, 0);
                  const profit = saleTotal - purchTotal;

                  return (
                    <tr key={b.id}>
                      <td><span className="badge badge-yellow">{b.billNo}</span></td>
                      <td>{b.party}</td>
                      <td className="num-font">{b.date}</td>
                      <td className="hide-mobile">{b.items.length} item(s)</td>
                      <td className="num-font">₹{saleTotal.toFixed(2)}</td>
                      <td className="profit-column hide-mobile">₹{purchTotal.toFixed(2)}</td>
                      <td>
                        <span className={profit >= 0 ? 'badge badge-green' : 'badge badge-red'}>
                          ₹{profit.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <button 
                          className="btn btn-sm btn-ghost" 
                          onClick={() => onViewBill(b.id)}
                          style={{ marginRight: '6px' }}
                        >
                          👁 View
                        </button>
                        <button 
                          className="btn btn-sm btn-ghost" 
                          onClick={() => onDownloadBill(b.id)}
                          style={{ color: 'var(--green)', borderColor: 'var(--green)', marginRight: '6px' }}
                        >
                          ⬇ PDF
                        </button>
                        <button 
                          className="btn btn-sm btn-ghost" 
                          onClick={() => onDeleteBill(b.id)}
                          style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                        >
                          🗑
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
