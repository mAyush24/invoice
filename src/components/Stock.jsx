import React, { useState } from 'react';

export default function Stock({ stockSummary, onAddStock, onMinusStock, showToast }) {
  // Add Stock state variables
  const [addItemName, setAddItemName] = useState('');
  const [addQty, setAddQty] = useState('');
  const [addRate, setAddRate] = useState('');
  const [addSupplier, setAddSupplier] = useState('');

  // Minus Stock state variables
  const [minusParty, setMinusParty] = useState('');
  const [minusItemName, setMinusItemName] = useState('');
  const [minusQty, setMinusQty] = useState('');
  const [minusNote, setMinusNote] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const name = addItemName.trim();
    const qty = parseInt(addQty);
    const rate = parseFloat(addRate);

    if (!name) {
      showToast('⚠️', 'Please enter an item name');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showToast('⚠️', 'Please enter a valid quantity');
      return;
    }
    if (isNaN(rate) || rate < 0) {
      showToast('⚠️', 'Please enter a valid purchase rate');
      return;
    }

    onAddStock({
      item: name,
      qty,
      rate,
      party: addSupplier.trim() || '—'
    });

    // Reset fields
    setAddItemName('');
    setAddQty('');
    setAddRate('');
    setAddSupplier('');
  };

  const handleMinusSubmit = (e) => {
    e.preventDefault();
    const name = minusItemName.trim();
    const qty = parseInt(minusQty);

    if (!name) {
      showToast('⚠️', 'Please enter an item name');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showToast('⚠️', 'Please enter a valid quantity');
      return;
    }

    onMinusStock({
      item: name,
      qty,
      party: minusParty.trim() || '—',
      note: minusNote.trim()
    });

    // Reset fields
    setMinusParty('');
    setMinusItemName('');
    setMinusQty('');
    setMinusNote('');
  };

  const stockItemsList = Object.keys(stockSummary).sort();

  return (
    <div className="page">
      <div className="page-title">Stock Management</div>
      <div className="page-sub">Manually add or remove stock items</div>

      <div className="stock-flex-grid">
        {/* ADD STOCK CARD */}
        <div className="card">
          <div className="card-title" style={{ color: 'var(--green)' }}>
            ➕ Add Stock
          </div>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label>Item Name</label>
              <input 
                type="text" 
                value={addItemName}
                onChange={(e) => setAddItemName(e.target.value)}
                placeholder="Item name"
                list="add-stock-datalist"
                autoComplete="off"
              />
              <datalist id="add-stock-datalist">
                {stockItemsList.map(item => <option key={item} value={item} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                placeholder="e.g. 100" 
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Rate per unit (₹)</label>
              <input 
                type="number" 
                step="any"
                value={addRate}
                onChange={(e) => setAddRate(e.target.value)}
                placeholder="e.g. 50" 
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Supplier / Note</label>
              <input 
                type="text" 
                value={addSupplier}
                onChange={(e) => setAddSupplier(e.target.value)}
                placeholder="Supplier name or note" 
              />
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '8px' }}>
              ➕ Add Stock
            </button>
          </form>
        </div>

        {/* MINUS STOCK CARD */}
        <div className="card">
          <div className="card-title" style={{ color: 'var(--accent)' }}>
            ➖ Minus Stock
          </div>
          <form onSubmit={handleMinusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label>Party Name</label>
              <input 
                type="text" 
                value={minusParty}
                onChange={(e) => setMinusParty(e.target.value)}
                placeholder="Who received goods" 
              />
            </div>
            <div className="form-group">
              <label>Item Name</label>
              <input 
                type="text" 
                value={minusItemName}
                onChange={(e) => setMinusItemName(e.target.value)}
                placeholder="Item name" 
                list="minus-stock-datalist"
                autoComplete="off"
              />
              <datalist id="minus-stock-datalist">
                {stockItemsList.map(item => <option key={item} value={item} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                value={minusQty}
                onChange={(e) => setMinusQty(e.target.value)}
                placeholder="e.g. 20" 
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Note</label>
              <input 
                type="text" 
                value={minusNote}
                onChange={(e) => setMinusNote(e.target.value)}
                placeholder="Optional note" 
              />
            </div>
            <button type="submit" className="btn btn-danger" style={{ marginTop: '8px' }}>
              ➖ Minus Stock
            </button>
          </form>
        </div>
      </div>

      {/* CURRENT STOCK LEVEL CARD */}
      <div className="card">
        <div className="card-title">📦 Current Stock Levels</div>
        <div className="table-wrap">
          {stockItemsList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">No stock records found. Add stock to begin tracking.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>In Stock</th>
                  <th>Avg Rate</th>
                  <th>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {stockItemsList.map((item) => {
                  const s = stockSummary[item];
                  const avg = s.totalAdded > 0 ? (s.totalCost / s.totalAdded) : 0;
                  const val = s.qty > 0 ? s.qty * avg : 0;

                  return (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>
                        <span className={`badge ${s.qty > 0 ? 'badge-green' : s.qty === 0 ? 'badge-gray' : 'badge-red'}`}>
                          {s.qty}
                        </span>
                      </td>
                      <td className="num-font">₹{avg.toFixed(2)}</td>
                      <td className="num-font">₹{val.toFixed(2)}</td>
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
