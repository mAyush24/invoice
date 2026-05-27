import React, { useState, useEffect, useRef } from 'react';

export default function Billing({ stockSummary, bills, billCounter, onSaveBill, onPreviewBill, showToast }) {
  // Local states for the invoice header
  const [party, setParty] = useState('');
  const [billNo, setBillNo] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // Local states for the item being added
  const [itemName, setItemName] = useState('');
  const [purchaseRate, setPurchaseRate] = useState('');
  const [saleRate, setSaleRate] = useState('');
  const [qty, setQty] = useState('');

  // Draft invoice items array
  const [items, setItems] = useState([]);

  // Autocomplete list from stock summary
  const stockItemsList = Object.keys(stockSummary).sort();

  // Reference for focusing back on Item Name
  const itemNameInputRef = useRef(null);

  // Initialize defaults
  useEffect(() => {
    if (!date) {
      setDate(new Date().toISOString().split('T')[0]);
    }
    setBillNo(`BILL-${billCounter + 1}`);
  }, [billCounter, date]);

  // Autocomplete rate handler
  const handleItemNameChange = (val) => {
    setItemName(val);
    
    // Check if the typed item matches a known stock item
    if (stockSummary[val]) {
      const summary = stockSummary[val];
      const avgPurchase = summary.totalAdded > 0 ? (summary.totalCost / summary.totalAdded) : 0;
      setPurchaseRate(avgPurchase.toFixed(2));

      // Attempt to look up the last sale rate used for this item in previous bills
      let lastSaleRate = '';
      for (const bill of bills) {
        const matchingItem = bill.items.find(i => i.name.toLowerCase() === val.toLowerCase());
        if (matchingItem) {
          lastSaleRate = matchingItem.sale;
          break;
        }
      }
      if (lastSaleRate !== '') {
        setSaleRate(lastSaleRate.toString());
      }
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const name = itemName.trim();
    const pRate = parseFloat(purchaseRate);
    const sRate = parseFloat(saleRate);
    const quantity = parseInt(qty);

    if (!name) {
      showToast('⚠️', 'Please enter an item name');
      return;
    }
    if (isNaN(pRate) || pRate < 0) {
      showToast('⚠️', 'Please enter a valid purchase rate');
      return;
    }
    if (isNaN(sRate) || sRate < 0) {
      showToast('⚠️', 'Please enter a valid sale rate');
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      showToast('⚠️', 'Please enter a quantity greater than 0');
      return;
    }

    setItems([...items, { name, purchase: pRate, sale: sRate, qty: quantity }]);
    
    // Reset item form fields
    setItemName('');
    setPurchaseRate('');
    setSaleRate('');
    setQty('');

    // Re-focus itemName input
    if (itemNameInputRef.current) {
      itemNameInputRef.current.focus();
    }
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleClear = () => {
    setItems([]);
    setParty('');
    setNotes('');
    setBillNo(`BILL-${billCounter + 1}`);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSave = () => {
    if (!party.trim()) {
      showToast('⚠️', 'Please enter party/customer name');
      return;
    }
    if (items.length === 0) {
      showToast('⚠️', 'Please add at least one item');
      return;
    }

    const finalBillNo = billNo.trim() || `BILL-${billCounter + 1}`;
    onSaveBill({
      billNo: finalBillNo,
      party: party.trim(),
      date,
      notes: notes.trim(),
      items: [...items]
    });

    handleClear();
  };

  const handlePreview = () => {
    if (items.length === 0) {
      showToast('⚠️', 'Add items first before previewing');
      return;
    }

    onPreviewBill({
      billNo: billNo.trim() || 'BILL-DRAFT',
      party: party.trim() || 'Customer Draft',
      date: date || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      items
    });
  };

  // Calculations for running footer
  const totalSale = items.reduce((sum, item) => sum + item.sale * item.qty, 0);
  const totalPurchase = items.reduce((sum, item) => sum + item.purchase * item.qty, 0);
  const netProfit = totalSale - totalPurchase;

  return (
    <div className="page">
      <div className="page-title">Create Bill</div>
      <div className="page-sub">Generate a customer bill with profit tracking</div>

      {/* Bill Metadata card */}
      <div className="card">
        <div className="card-title">Bill Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Party / Customer Name</label>
            <input 
              type="text" 
              value={party} 
              onChange={(e) => setParty(e.target.value)} 
              placeholder="e.g. Ramesh Traders" 
            />
          </div>
          <div className="form-group">
            <label>Bill Number</label>
            <input 
              type="text" 
              value={billNo} 
              onChange={(e) => setBillNo(e.target.value)} 
              placeholder="Auto or custom" 
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input 
              type="text" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Optional notes or terms" 
            />
          </div>
        </div>
      </div>

      {/* Invoice line items card */}
      <div className="card">
        <div className="card-title">Add Items</div>
        <form onSubmit={handleAddItem} className="add-item-row">
          <div className="form-group">
            <label>Item Name</label>
            <input 
              type="text" 
              ref={itemNameInputRef}
              value={itemName} 
              onChange={(e) => handleItemNameChange(e.target.value)} 
              placeholder="Item name" 
              list="stock-items-datalist"
              autoComplete="off"
            />
            <datalist id="stock-items-datalist">
              {stockItemsList.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label>Purchase Rate (₹)</label>
            <input 
              type="number" 
              step="any"
              value={purchaseRate} 
              onChange={(e) => setPurchaseRate(e.target.value)} 
              placeholder="0.00" 
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Sale Rate (₹)</label>
            <input 
              type="number" 
              step="any"
              value={saleRate} 
              onChange={(e) => setSaleRate(e.target.value)} 
              placeholder="0.00" 
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input 
              type="number" 
              value={qty} 
              onChange={(e) => setQty(e.target.value)} 
              placeholder="0" 
              min="1"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              + Add
            </button>
          </div>
        </form>

        <div className="table-wrap">
          <table className="bill-items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Purchase Rate</th>
                <th>Sale Rate</th>
                <th>Qty</th>
                <th>Sale Total</th>
                <th>Profit</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No items added yet
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const saleTot = it.sale * it.qty;
                  const purchaseTot = it.purchase * it.qty;
                  const profit = saleTot - purchaseTot;

                  return (
                    <tr key={idx}>
                      <td>{it.name}</td>
                      <td className="profit-column">₹{it.purchase.toFixed(2)}</td>
                      <td className="num-font">₹{it.sale.toFixed(2)}</td>
                      <td className="num-font">{it.qty}</td>
                      <td className="num-font">₹{saleTot.toFixed(2)}</td>
                      <td>
                        <span className={profit >= 0 ? 'badge badge-green' : 'badge badge-red'}>
                          ₹{profit.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-ghost" 
                          onClick={() => handleRemoveItem(idx)}
                          style={{ color: 'var(--red)', borderColor: 'transparent' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr style={{ fontWeight: 600, background: 'var(--surface2)' }}>
                  <td colSpan="4" style={{ textAlign: 'right', color: 'var(--muted)', fontSize: '12px' }}>
                    TOTAL
                  </td>
                  <td className="num-font">₹{totalSale.toFixed(2)}</td>
                  <td className="num-font" style={{ color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    ₹{netProfit.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-success" onClick={handleSave}>
            💾 Save Bill
          </button>
          <button type="button" className="btn btn-ghost" onClick={handlePreview}>
            👁 Preview (Customer)
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleClear}>
            🗑 Clear
          </button>
        </div>
      </div>
    </div>
  );
}
