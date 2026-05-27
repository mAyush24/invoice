import React, { useState } from 'react';

export default function Stock({ stockSummary, onAddStock, onMinusStock, showToast, role, onDeleteStockItem }) {
  // Add Stock state variables
  const [addItemName, setAddItemName] = useState('');
  const [addQty, setAddQty] = useState('');
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
    const rate = 0; // Amount/Rate input is completely removed

    if (!name) {
      showToast('⚠️', 'Please enter an item name');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      showToast('⚠️', 'Please enter a valid quantity');
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
      <div className="page-sub">
        {role === 'admin' 
          ? 'View current inventory levels and stock status' 
          : 'Manually add or remove stock items'}
      </div>

      {/* Forms are ONLY accessible to Staff role, not Admin */}
      {role !== 'admin' && (
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
      )}

      {/* CURRENT STOCK LEVEL CARD */}
      <div className="card">
        <div className="card-title">📦 Current Stock Levels</div>
        <div className="table-wrap">
          {stockItemsList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">No stock records found.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>In Stock</th>
                  {role === 'staff' && <th style={{ width: '100px', textAlign: 'center' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {stockItemsList.map((item) => {
                  const s = stockSummary[item];

                  return (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>
                        <span className={`badge ${s.qty > 0 ? 'badge-green' : s.qty === 0 ? 'badge-gray' : 'badge-red'}`}>
                          {s.qty}
                        </span>
                      </td>
                      {role === 'staff' && (
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => onDeleteStockItem && onDeleteStockItem(item)}
                            style={{ padding: '6px 12px', fontSize: '11px', gap: '4px' }}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      )}
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
