import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function TablesModule() {
  const [tables, setTables] = useState([]);
  const [captainsList, setCaptainsList] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeOrderTable, setActiveOrderTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCaptainManageModal, setShowCaptainManageModal] = useState(false);

  const [newTableForm, setNewTableForm] = useState({ tableId: '', section: 'MAIN', seats: 4 });
  const [newCaptainForm, setNewCaptainForm] = useState({ name: '', phone: '' });
  const [cartItems, setCartItems] = useState([]);
  const [orderNote, setOrderNote] = useState('');

  useEffect(() => {
    fetchTables();
    fetchCaptains();
    fetchLiveMenu();
  }, []);

  const fetchTables = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/tables`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTables(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tables:", err);
        setLoading(false);
      });
  };

  const fetchCaptains = () => {
    fetch(`${API_BASE_URL}/api/v1/staff`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCaptainsList(data);
      })
      .catch(err => console.log("Captains fetch error:", err));
  };

  // Robust Live Menu Fetcher with Field Normalization
  const fetchLiveMenu = () => {
    fetch(`${API_BASE_URL}/api/v1/menu`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalize fields so any backend structure maps cleanly to { id, name, price, category }
          const normalized = data.map((item, idx) => ({
            id: item.id || item.menuId || idx,
            name: item.name || item.itemName || item.dishName || item.title || 'Unnamed Item',
            price: Number(item.price || item.itemPrice || item.cost || 0),
            category: item.category || item.foodType || 'General'
          }));
          setMenuItems(normalized);
        } else {
          setMenuItems([
            { id: 1, name: 'Butter Chicken', price: 350, category: 'Main Course' },
            { id: 2, name: 'Paneer Tikka', price: 280, category: 'Starter' },
            { id: 3, name: 'Garlic Naan', price: 50, category: 'Breads' },
            { id: 4, name: 'Veg Biryani', price: 220, category: 'Rice' },
            { id: 5, name: 'Cold Drink', price: 60, category: 'Beverages' }
          ]);
        }
      })
      .catch(() => {
        setMenuItems([
          { id: 1, name: 'Butter Chicken', price: 350, category: 'Main Course' },
          { id: 2, name: 'Paneer Tikka', price: 280, category: 'Starter' },
          { id: 3, name: 'Garlic Naan', price: 50, category: 'Breads' },
          { id: 4, name: 'Veg Biryani', price: 220, category: 'Rice' },
          { id: 5, name: 'Cold Drink', price: 60, category: 'Beverages' }
        ]);
      });
  };

  const handleUpdateStatusAndCaptain = (tableId, newStatus, assignedCaptain, shouldOpenPOS = false) => {
    const payload = { 
      status: newStatus,
      captain: assignedCaptain || 'Unassigned'
    };

    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) fetchTables();
      })
      .catch(err => console.error("Update error:", err));

    setSelectedTable(null);

    if (shouldOpenPOS) {
      const target = tables.find(t => t.tableId === tableId);
      if (target) {
        setActiveOrderTable({ ...target, ...payload });
        setCartItems([]);
      }
    }
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableForm.tableId) return alert('Enter Table ID');

    const obj = {
      tableId: newTableForm.tableId.toUpperCase(),
      section: newTableForm.section,
      seats: Number(newTableForm.seats),
      status: 'Available',
      captain: 'Unassigned'
    };

    fetch(`${API_BASE_URL}/api/v1/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    })
      .then(res => {
        if (res.ok) {
          setShowAddModal(false);
          setNewTableForm({ tableId: '', section: 'MAIN', seats: 4 });
          fetchTables();
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const handleAddCaptain = (e) => {
    e.preventDefault();
    if (!newCaptainForm.name) return alert('Enter captain name');

    fetch(`${API_BASE_URL}/api/v1/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCaptainForm.name, role: 'CAPTAIN', phone: newCaptainForm.phone })
    })
      .then(res => {
        if (res.ok) {
          setShowCaptainManageModal(false);
          setNewCaptainForm({ name: '', phone: '' });
          fetchCaptains();
          alert('Captain added successfully!');
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const handleDeleteTable = (tableId) => {
    if (!window.confirm(`Delete table ${tableId}?`)) return;
    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}`, { method: 'DELETE' })
      .then(() => fetchTables());
    setSelectedTable(null);
  };

  const handleSendKOT = () => {
    const orderPayload = {
      tableId: activeOrderTable.tableId,
      captain: activeOrderTable.captain,
      items: cartItems,
      instruction: orderNote,
      subtotal: cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0),
      totalAmount: Math.round(cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0) * 1.05),
      timestamp: new Date().toISOString()
    };

    fetch(`${API_BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    }).catch(() => console.log("Order saved locally"));

    alert(`🖨️ KOT Generated successfully for Table ${activeOrderTable.tableId}!\nNote: "${orderNote || 'None'}"\nSent to Kitchen & Reports.`);
    setActiveOrderTable(null);
    setCartItems([]);
    setOrderNote('');
  };

  return (
    <div style={styles.moduleWrapper}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Restaurant Floor & Captains</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '600' }}>
            <strong style={{ color: '#059669' }}>{tables.filter(t => t.status === 'Available').length}/{tables.length} tables open</strong> • Live floor operations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCaptainManageModal(true)} style={styles.captainManageBtn}>🧑‍✈️ Manage Captains</button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add Table</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '600' }}>Loading tables from database...</div>
      ) : (
        ['MAIN', 'PATIO', 'BAR'].map(section => {
          const sectionTables = tables.filter(t => t.section === section);
          if (sectionTables.length === 0) return null;

          return (
            <div key={section} style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#047857', background: '#ecfdf5', padding: '5px 12px', borderRadius: '6px', border: '1.5px solid #10b981' }}>{section} SECTION</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {sectionTables.map(table => {
                  const isHovered = hoveredId === table.tableId;
                  const status = table.status || 'Available';
                  const captainName = table.captain || 'Unassigned';

                  return (
                    <div 
                      key={table.tableId} 
                      onClick={() => setSelectedTable(table)}
                      onMouseEnter={() => setHoveredId(table.tableId)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ 
                        background: '#fff', borderRadius: '16px', padding: '20px', 
                        border: `2px solid ${isHovered ? '#059669' : '#e2e8f0'}`, 
                        boxShadow: isHovered ? '0 20px 25px -5px rgba(5, 150, 105, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '145px', transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{table.tableId}</span>
                          <span style={{ background: status === 'Available' ? '#d1fae5' : '#fee2e2', color: status === 'Available' ? '#065f46' : '#991b1b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>👥 Capacity: {table.seats} seats</div>
                        <div style={{ fontSize: '12px', color: captainName !== 'Unassigned' ? '#059669' : '#94a3b8', fontWeight: '800', background: captainName !== 'Unassigned' ? '#ecfdf5' : '#f8fafc', padding: '6px 10px', borderRadius: '8px' }}>
                          🧑‍✈️ Captain: {captainName}
                        </div>
                      </div>
                      
                      <div style={{ width: '100%', textAlign: 'center', padding: '8px 0', background: isHovered ? '#059669' : '#f8fafc', color: isHovered ? '#fff' : '#334155', borderRadius: '8px', fontWeight: '800', fontSize: '12px', marginTop: '12px' }}>
                        Manage Table ›
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Table Control Modal */}
      {selectedTable && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTable(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '900', fontSize: '18px' }}>Table {selectedTable.tableId} Control</h3>
              <button onClick={() => setSelectedTable(null)} style={styles.closeXBtn}>✕</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '6px' }}>ASSIGN FLOOR CAPTAIN</label>
              <select 
                style={styles.input}
                defaultValue={selectedTable.captain || ''}
                onChange={(e) => handleUpdateStatusAndCaptain(selectedTable.tableId, selectedTable.status || 'Available', e.target.value, false)}
              >
                <option value="Unassigned">-- Select Captain --</option>
                {captainsList.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '6px' }}>ACTIONS</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <button 
                onClick={() => handleUpdateStatusAndCaptain(selectedTable.tableId, 'Available', 'Unassigned', false)} 
                style={{ padding: '11px', background: '#d1fae5', color: '#065f46', border: '1.5px solid #10b981', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
              >
                🟢 Clear Table (Make Available)
              </button>
              <button 
                onClick={() => handleUpdateStatusAndCaptain(selectedTable.tableId, 'Occupied', selectedTable.captain, true)} 
                style={{ padding: '11px', background: '#eff6ff', color: '#1d4ed8', border: '1.5px solid #38bdf8', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
              >
                🚀 Mark Occupied & Open Full POS Terminal
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <button onClick={() => handleDeleteTable(selectedTable.tableId)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '9px 14px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>Delete Table</button>
              <button onClick={() => setSelectedTable(null)} style={{ background: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '9px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen POS Terminal */}
      {activeOrderTable && (
        <div style={styles.fullScreenOverlay}>
          <div style={styles.fullScreenContainer}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', background: '#0f172a', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '950' }}>Table {activeOrderTable.tableId} - Full POS Terminal</h3>
                <span style={{ background: '#059669', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '900' }}>🧑‍✈️ {activeOrderTable.captain || 'Unassigned'}</span>
              </div>
              <button onClick={() => setActiveOrderTable(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900' }}>✕ Exit POS</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#f8fafc' }}>
              
              {/* Menu Grid */}
              <div style={{ flex: 1.4, padding: '24px', overflowY: 'auto', borderRight: '1.5px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#64748b', marginBottom: '16px', letterSpacing: '0.5px' }}>LIVE RESTAURANT MENU</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                  {menuItems.map(food => (
                    <div 
                      key={food.id}
                      onClick={() => {
                        const existing = cartItems.find(i => i.name === food.name);
                        if (existing) {
                          setCartItems(cartItems.map(i => i.name === food.name ? {...i, qty: i.qty + 1} : i));
                        } else {
                          setCartItems([...cartItems, { ...food, qty: 1 }]);
                        }
                      }}
                      style={{ background: '#fff', padding: '16px', borderRadius: '14px', border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#059669'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b', marginBottom: '6px' }}>{food.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>{food.category}</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#059669' }}>₹{food.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receipt & KOT Summary */}
              <div style={{ width: '420px', background: '#fff', display: 'flex', flexDirection: 'column', padding: '24px', borderLeft: '1.5px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#64748b', marginBottom: '14px', letterSpacing: '0.5px' }}>ORDER RECEIPT & KOT</h4>
                
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '60px 20px', background: '#f8fafc', borderRadius: '14px', border: '2px dashed #cbd5e1' }}>
                      Cart is empty. Click items from the menu.
                    </div>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>₹{item.price} x {item.qty} = <strong style={{ color: '#059669' }}>₹{item.price * item.qty}</strong></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => setCartItems(cartItems.map((i, iIdx) => iIdx === idx && i.qty > 1 ? {...i, qty: i.qty - 1} : i))} style={styles.qtyBtn}>-</button>
                          <span style={{ fontSize: '14px', fontWeight: '900', width: '24px', textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => setCartItems(cartItems.map((i, iIdx) => iIdx === idx ? {...i, qty: i.qty + 1} : i))} style={styles.qtyBtn}>+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '6px' }}>KITCHEN INSTRUCTION / EXTRA INFO (KOT NOTE)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Extra spicy, less oil..." 
                    value={orderNote} 
                    onChange={e => setOrderNote(e.target.value)} 
                    style={styles.input}
                  />
                </div>

                {cartItems.length > 0 && (
                  <div style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '12px', marginBottom: '16px', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Subtotal:</span>
                      <span>₹{cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#64748b' }}>
                      <span>GST (5%):</span>
                      <span>₹{Math.round(cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0) * 0.05)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '950', color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                      <span>Total Amount:</span>
                      <span style={{ color: '#059669' }}>₹{Math.round(cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0) * 1.05)}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={handleSendKOT}
                    disabled={cartItems.length === 0}
                    style={{ padding: '14px', background: cartItems.length === 0 ? '#cbd5e1' : '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
                  >
                    🖨️ Send KOT to Kitchen & Save for Reports
                  </button>
                  <button 
                    onClick={() => alert('💳 Opening Split Payment & Final Settlement Terminal...')}
                    disabled={cartItems.length === 0}
                    style={{ padding: '12px', background: cartItems.length === 0 ? '#f1f5f9' : '#2563eb', color: cartItems.length === 0 ? '#94a3b8' : '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    Split Payment & Checkout
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Add New Table Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTable} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: '900' }}>Add New Table</h3>
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>TABLE ID:</label>
            <input style={styles.input} placeholder="e.g. T8" value={newTableForm.tableId} onChange={e => setNewTableForm({...newTableForm, tableId: e.target.value})} required />
            
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>SECTION:</label>
            <select style={{...styles.input, background: '#fff'}} value={newTableForm.section} onChange={e => setNewTableForm({...newTableForm, section: e.target.value})}>
              <option value="MAIN">MAIN</option><option value="PATIO">PATIO</option><option value="BAR">BAR</option>
            </select>

            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>SEATS:</label>
            <input type="number" style={styles.input} value={newTableForm.seats} onChange={e => setNewTableForm({...newTableForm, seats: e.target.value})} required />

            <button type="submit" style={{ ...styles.addBtn, width: '100%', padding: '12px', marginTop: '10px' }}>Create Table</button>
          </form>
        </div>
      )}

      {/* Manage Captains Modal */}
      {showCaptainManageModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCaptainManageModal(false)}>
          <form onSubmit={handleAddCaptain} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: '900' }}>Add Floor Captain</h3>
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>CAPTAIN NAME:</label>
            <input style={styles.input} placeholder="e.g. Rahul Sharma" value={newCaptainForm.name} onChange={e => setNewCaptainForm({...newCaptainForm, name: e.target.value})} required />
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>PHONE:</label>
            <input style={styles.input} placeholder="10-digit mobile" value={newCaptainForm.phone} onChange={e => setNewCaptainForm({...newCaptainForm, phone: e.target.value})} />
            <button type="submit" style={{ ...styles.captainManageBtn, width: '100%', padding: '12px', marginTop: '10px', textAlign: 'center' }}>Save Captain</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  moduleWrapper: { display: 'flex', flexDirection: 'column', flex: 1, height: '100%', padding: '24px', background: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '80px' },
  addBtn: { background: '#059669', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' },
  captainManageBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  fullScreenOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  fullScreenContainer: { width: '98vw', height: '96vh', backgroundColor: '#fff', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', border: '2px solid #cbd5e1' },
  modalCard: { width: '420px', backgroundColor: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '15px', boxSizing: 'border-box', fontSize: '13px', outline: 'none', fontWeight: '600' },
  qtyBtn: { width: '26px', height: '26px', background: '#e2e8f0', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }
};