import React, { useState } from 'react';

export default function StockLog({ stockLog, damageLog }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  // Merge stock logs and damage logs into a single unified array sorted chronologically
  let entries = [
    ...stockLog.map(l => ({ ...l, _src: 'stock' })),
    ...damageLog.map(d => ({ 
      id: d.id, 
      type: 'damage', 
      date: d.date, 
      item: d.item, 
      qty: d.qty, 
      rate: d.rate, 
      party: d.reason || '—', 
      _src: 'damage' 
    }))
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  // Apply filters
  if (search) {
    entries = entries.filter(e => e.item.toLowerCase().includes(search.toLowerCase()));
  }
  if (type) {
    entries = entries.filter(e => e.type === type);
  }

  return (
    <div className="page">
      <div className="page-title">Stock Log</div>
      <div className="page-sub">Complete history of all stock movements</div>

      <div className="card">
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '16px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Filter Item</label>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Item name..." 
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              <option value="add">Add</option>
              <option value="minus">Minus</option>
              <option value="damage">Damage</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {entries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-text">No movements logged yet</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Party / Note</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  let typeBadge;
                  if (e.type === 'add') {
                    typeBadge = <span className="tag-add">ADD</span>;
                  } else if (e.type === 'minus') {
                    typeBadge = <span className="tag-minus">MINUS</span>;
                  } else {
                    typeBadge = <span className="tag-damage">DAMAGE</span>;
                  }

                  return (
                    <tr key={e.id}>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>{e.date}</td>
                      <td>{typeBadge}</td>
                      <td>{e.item}</td>
                      <td>{e.type === 'minus' ? '-' : ''}{e.qty}</td>
                      <td>{e.party || '—'}</td>
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
