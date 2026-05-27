import React, { useState } from 'react';

export default function DamageGoods({ damageLog, stockSummary, onLogDamage, showToast }) {
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [reason, setReason] = useState('');

  const handleItemChange = (val) => {
    setItem(val);
    
    // Autofill purchase rate if we have it in stock summary
    if (stockSummary[val]) {
      const summary = stockSummary[val];
      const avgPurchase = summary.totalAdded > 0 ? (summary.totalCost / summary.totalAdded) : 0;
      setRate(avgPurchase.toFixed(2));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = item.trim();
    const quantity = parseInt(qty);
    const costRate = parseFloat(rate);

    if (!name) {
      showToast('⚠️', 'Please enter an item name');
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      showToast('⚠️', 'Please enter a valid quantity');
      return;
    }
    if (isNaN(costRate) || costRate < 0) {
      showToast('⚠️', 'Please enter a valid purchase rate');
      return;
    }

    onLogDamage({
      item: name,
      qty: quantity,
      rate: costRate,
      reason: reason.trim() || '—'
    });

    // Reset fields
    setItem('');
    setQty('');
    setRate('');
    setReason('');
  };

  const stockItemsList = Object.keys(stockSummary).sort();
  const sortedDamage = [...damageLog].reverse();

  return (
    <div className="page">
      <div className="page-title">Damage Goods</div>
      <div className="page-sub">Record damaged items — their value is deducted from profit</div>

      {/* Log Damage form */}
      <div className="card">
        <div className="card-title" style={{ color: 'var(--red)' }}>
          ⚠️ Log Damage
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Item Name</label>
            <input 
              type="text" 
              value={item} 
              onChange={(e) => handleItemChange(e.target.value)} 
              placeholder="Item name" 
              list="damage-stock-datalist"
              autoComplete="off"
            />
            <datalist id="damage-stock-datalist">
              {stockItemsList.map(i => <option key={i} value={i} />)}
            </datalist>
          </div>
          <div className="form-group">
            <label>Quantity Damaged</label>
            <input 
              type="number" 
              value={qty} 
              onChange={(e) => setQty(e.target.value)} 
              placeholder="0" 
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Purchase Rate (₹)</label>
            <input 
              type="number" 
              step="any"
              value={rate} 
              onChange={(e) => setRate(e.target.value)} 
              placeholder="Cost price" 
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input 
              type="text" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="Why damaged?" 
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
            <button type="submit" className="btn btn-danger">
              ⚠️ Log Damage
            </button>
          </div>
        </form>
      </div>

      {/* Damage records */}
      <div className="card">
        <div className="card-title">Damage Records</div>
        <div className="table-wrap">
          {sortedDamage.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <div className="empty-state-text">No damage records logged</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Total Loss</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {sortedDamage.map((d) => {
                  const loss = d.qty * d.rate;
                  return (
                    <tr key={d.id}>
                      <td className="num-font" style={{ fontSize: '12px' }}>{d.date}</td>
                      <td>{d.item}</td>
                      <td className="num-font">{d.qty}</td>
                      <td className="num-font">₹{d.rate.toFixed(2)}</td>
                      <td className="num-font" style={{ color: 'var(--red)', fontWeight: 600 }}>₹{loss.toFixed(2)}</td>
                      <td>{d.reason || '—'}</td>
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
