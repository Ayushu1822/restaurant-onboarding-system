import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function TablesModule() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [restaurantId, setRestaurantId] = useState('');
  const [fullProfile, setFullProfile] = useState({});

  const [captainsList, setCaptainsList] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  const [hoveredId, setHoveredId] = useState(null);
  const [hoveredMenuId, setHoveredMenuId] = useState(null);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeOrderTable, setActiveOrderTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCaptainManageModal, setShowCaptainManageModal] = useState(false);
  
  // Split payment state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  // Counter POS Order Type state (Dine-In vs Takeaway)
  const [orderType, setOrderType] = useState('Dine-In');

  const [newTableForm, setNewTableForm] = useState({ tableName: '', areaName: 'Main', pax: 4 });
  const [newCaptainForm, setNewCaptainForm] = useState({ name: '', phone: '' });
  const [cartItems, setCartItems] = useState([]);
  const [orderNote, setOrderNote] = useState('');

  // Areas & Tables Structured State (Synced with Settings & Database)
  const [areasAndTables, setAreasAndTables] = useState({
    autoOpenQrScan: true,
    areas: [
      {
        id: 'main-area',
        name: 'Main',
        tables: [
          { id: 't1', name: 'T1', pax: 2, qrEnabled: true, status: 'Available', captain: 'Unassigned' },
          { id: 't2', name: 'T2', pax: 4, qrEnabled: true, status: 'Available', captain: 'Unassigned' },
          { id: 't3', name: 'T3', pax: 4, qrEnabled: true, status: 'Available', captain: 'Unassigned' },
          { id: 't3b', name: 'T3B', pax: 4, qrEnabled: true, status: 'Available', captain: 'Unassigned' },
          { id: 't4', name: 'T4', pax: 2, qrEnabled: true, status: 'Available', captain: 'Unassigned' }
        ]
      }
    ]
  });

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert('No logged-in user found! Please login first.');
      setLoading(false);
      return;
    }
    fetchProfile(userEmail);
    fetchCaptains(userEmail);
    fetchLiveMenu(userEmail);
  }, []);

  const fetchProfile = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/email/${email}`);
      if (!res.ok) throw new Error('Failed to fetch restaurant profile');
      const data = await res.json();
      
      setFullProfile(data);
      setRestaurantId(data.restaurantId);

      let parsedAreas = data.areasAndTables;
      if (typeof parsedAreas === 'string') {
        try { parsedAreas = JSON.parse(parsedAreas); } catch (e) {}
      }

      if (parsedAreas && parsedAreas.areas) {
        parsedAreas.areas = parsedAreas.areas.map(area => ({
          ...area,
          tables: (area.tables || []).map(t => ({
            ...t,
            status: t.status || 'Available',
            captain: t.captain || 'Unassigned'
          }))
        }));
        setAreasAndTables(parsedAreas);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      showMsg('Failed to load tables from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCaptains = (email) => {
    fetch(`${API_BASE_URL}/api/v1/staff?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCaptainsList(data);
      })
      .catch(err => console.log("Captains fetch error:", err));
  };

  const fetchLiveMenu = (email) => {
    fetch(`${API_BASE_URL}/api/v1/menu?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item, idx) => {
            const rawPrice = item.price ?? item.itemPrice ?? item.cost ?? item.rate ?? item.amount ?? item.unitPrice ?? 0;
            const parsedPrice = Number(rawPrice);
            return {
              id: item.id || item.menuId || idx,
              name: item.name || item.itemName || item.dishName || item.title || 'Unnamed Item',
              price: isNaN(parsedPrice) ? 0 : parsedPrice,
              category: item.category || item.foodType || item.menuType || 'Main Course'
            };
          });
          setMenuItems(normalized);
        } else {
          setMenuItems([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch menu:", err);
        setMenuItems([]);
      });
  };

  const syncToDatabase = async (updatedAreasAndTables) => {
    setSaving(true);
    try {
      const payload = {
        ...fullProfile,
        areasAndTables: JSON.stringify(updatedAreasAndTables),
        serviceHours: typeof fullProfile.serviceHours === 'object' ? JSON.stringify(fullProfile.serviceHours) : fullProfile.serviceHours
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save changes to database');
      const updated = await res.json();
      setFullProfile(updated);
      showMsg('✅ Changes synced with database!', 'success');
    } catch (err) {
      console.error('Error saving changes:', err);
      showMsg('❌ Error saving to database.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTableStatusAndCaptain = (targetAreaId, targetTableId, newStatus, assignedCaptain, shouldOpenPOS = false) => {
    const updated = {
      ...areasAndTables,
      areas: areasAndTables.areas.map(area => {
        if (area.id === targetAreaId) {
          return {
            ...area,
            tables: area.tables.map(t => {
              if (t.id === targetTableId) {
                return {
                  ...t,
                  status: newStatus,
                  captain: assignedCaptain || 'Unassigned'
                };
              }
              return t;
            })
          };
        }
        return area;
      })
    };

    setAreasAndTables(updated);
    syncToDatabase(updated);
    setSelectedTable(null);

    if (shouldOpenPOS) {
      let foundTable = null;
      updated.areas.forEach(a => {
        a.tables.forEach(t => {
          if (t.id === targetTableId) foundTable = { ...t, areaName: a.name };
        });
      });

      if (foundTable) {
        setActiveOrderTable(foundTable);
        setCartItems([]);
        setOrderNote('');
        setOrderType('Dine-In');
      }
    }
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableForm.tableName) return alert('Enter Table Name/ID');

    const newTable = {
      id: 'table-' + Date.now(),
      name: newTableForm.tableName.toUpperCase(),
      pax: Number(newTableForm.pax) || 4,
      qrEnabled: true,
      status: 'Available',
      captain: 'Unassigned'
    };

    let areaExists = false;
    const updatedAreas = areasAndTables.areas.map(area => {
      if (area.name.toLowerCase() === newTableForm.areaName.toLowerCase()) {
        areaExists = true;
        return { ...area, tables: [...area.tables, newTable] };
      }
      return area;
    });

    if (!areaExists) {
      updatedAreas.push({
        id: 'area-' + Date.now(),
        name: newTableForm.areaName,
        tables: [newTable]
      });
    }

    const updated = { ...areasAndTables, areas: updatedAreas };
    setAreasAndTables(updated);
    syncToDatabase(updated);
    setShowAddModal(false);
    setNewTableForm({ tableName: '', areaName: 'Main', pax: 4 });
  };

  const handleDeleteTable = (targetAreaId, targetTableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;

    const updated = {
      ...areasAndTables,
      areas: areasAndTables.areas.map(area => {
        if (area.id === targetAreaId) {
          return {
            ...area,
            tables: area.tables.filter(t => t.id !== targetTableId)
          };
        }
        return area;
      })
    };

    setAreasAndTables(updated);
    syncToDatabase(updated);
    setSelectedTable(null);
  };

  const handleAddCaptain = (e) => {
    e.preventDefault();
    if (!newCaptainForm.name) return alert('Enter captain name');

    const userEmail = localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newCaptainForm.name, 
        role: 'CAPTAIN', 
        phone: newCaptainForm.phone,
        restaurantEmail: userEmail 
      })
    })
      .then(res => {
        if (res.ok) {
          setShowCaptainManageModal(false);
          setNewCaptainForm({ name: '', phone: '' });
          fetchCaptains(userEmail);
          alert('Captain added successfully!');
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const handleSendKOT = () => {
    const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalAmount = Math.round(subtotal * 1.05);
    const userEmail = localStorage.getItem('userEmail') || '';

    const orderPayload = {
      displayId: `Table ${activeOrderTable.name}`,
      restaurantEmail: userEmail,
      customerName: `Table ${activeOrderTable.name} (${activeOrderTable.captain || 'Unassigned'})`,
      channel: 'COUNTER',
      orderType: orderType,
      status: 'New',
      subtotal: subtotal,
      totalAmount: totalAmount,
      items: cartItems.map(i => ({
        itemName: i.name,
        quantity: i.qty,
        unitPrice: i.price,
        itemDescription: orderNote || ''
      }))
    };

    fetch(`${API_BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
    .then(res => {
      if (!res.ok) throw new Error("Server responded with error");
      return res.json();
    })
    .then(data => {
      alert(`🖨️ KOT Generated & Sent to Kitchen successfully for Table ${activeOrderTable.name}!\nType: ${orderType}`);
      setActiveOrderTable(null);
      setCartItems([]);
      setOrderNote('');
    })
    .catch(err => {
      console.error(err);
      alert('Error sending order to kitchen.');
    });
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const allTablesList = [];
  areasAndTables.areas.forEach(a => {
    (a.tables || []).forEach(t => allTablesList.push({ ...t, areaId: a.id, areaName: a.name }));
  });
  const availableCount = allTablesList.filter(t => (t.status || 'Available') === 'Available').length;

  const categories = [...new Set(menuItems.map(item => item.category))];

  // ==========================================
  // INLINE POS TERMINAL VIEW
  // ==========================================
  if (activeOrderTable) {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const gst = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + gst;

    return (
      <div style={styles.inlinePOSWrapper}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#0f172a', color: '#fff', borderRadius: '14px 14px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '950' }}>Table {activeOrderTable.name} ({activeOrderTable.areaName}) POS Terminal</h3>
            <span style={{ background: '#059669', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '950' }}>🧑‍✈️ {activeOrderTable.captain || 'Unassigned'}</span>
          </div>
          <button onClick={() => setActiveOrderTable(null)} style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '950' }}>✕ Exit POS</button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#f8fafc', borderRadius: '0 0 14px 14px' }}>
          
          <div style={{ flex: 1.4, padding: '24px', overflowY: 'auto', borderRight: '2px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '950', color: '#64748b', marginBottom: '16px', letterSpacing: '0.08em' }}>LIVE RESTAURANT MENU (DATABASE)</h4>
            
            {menuItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px', background: '#fff', borderRadius: '16px', border: '2px dashed #cbd5e1', fontWeight: '800' }}>
                No menu items found. Please add items via Menu Management module first.
              </div>
            ) : (
              categories.map(category => {
                const catItems = menuItems.filter(item => item.category === category);
                if (catItems.length === 0) return null;

                return (
                  <div key={category} style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '950', color: '#047857', marginBottom: '12px', background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', border: '1.5px solid #10b981' }}>
                      📁 {category.toUpperCase()}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                      {catItems.map(food => {
                        const isMenuHovered = hoveredMenuId === food.id;
                        return (
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
                            onMouseEnter={() => setHoveredMenuId(food.id)}
                            onMouseLeave={() => setHoveredMenuId(null)}
                            style={{ 
                              background: '#fff', padding: '16px', borderRadius: '16px', 
                              border: `2px solid ${isMenuHovered ? '#059669' : '#e2e8f0'}`, 
                              cursor: 'pointer', transition: 'all 0.2s ease', 
                              boxShadow: isMenuHovered ? '0 10px 20px -5px rgba(5,150,105,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                              transform: isMenuHovered ? 'translateY(-2px)' : 'translateY(0)'
                            }}
                          >
                            <div style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b', marginBottom: '8px' }}>{food.name}</div>
                            <div style={{ fontSize: '15px', fontWeight: '950', color: '#059669' }}>₹{food.price}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ width: '420px', background: '#fff', display: 'flex', flexDirection: 'column', padding: '24px', borderLeft: '2px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '950', color: '#64748b', marginBottom: '14px', letterSpacing: '0.08em' }}>ORDER RECEIPT & KOT</h4>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>ORDER TYPE</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Dine-In', 'Takeaway'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    style={{
                      flex: 1, padding: '10px',
                      background: orderType === type ? '#059669' : '#f1f5f9',
                      color: orderType === type ? '#fff' : '#334155',
                      border: '2px solid #cbd5e1', borderRadius: '10px', fontWeight: '950', cursor: 'pointer'
                    }}
                  >
                    {type === 'Dine-In' ? '🍽️ Dine-In' : '🛍️ Takeaway'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '40px 20px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1', fontWeight: '800' }}>
                  Cart is empty. Click items from menu.
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '950', color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>₹{item.price} x {item.qty} = <strong style={{ color: '#059669' }}>₹{item.price * item.qty}</strong></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => setCartItems(cartItems.map((i, iIdx) => iIdx === idx && i.qty > 1 ? {...i, qty: i.qty - 1} : i))} style={styles.qtyBtn}>-</button>
                      <span style={{ fontSize: '14px', fontWeight: '950', width: '26px', textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => setCartItems(cartItems.map((i, iIdx) => iIdx === idx ? {...i, qty: i.qty + 1} : i))} style={styles.qtyBtn}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>KITCHEN INSTRUCTION (KOT NOTE)</label>
              <input 
                type="text" 
                placeholder="e.g. Extra spicy..." 
                value={orderNote} 
                onChange={e => setOrderNote(e.target.value)} 
                style={styles.input}
              />
            </div>

            {cartItems.length > 0 && (
              <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '14px', marginBottom: '16px', fontSize: '13px', fontWeight: '900', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                  <span>GST (5%):</span>
                  <span>₹{gst}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '950', color: '#0f172a', borderTop: '1.5px dashed #cbd5e1', paddingTop: '10px' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: '#059669' }}>₹{totalAmount}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={handleSendKOT}
                disabled={cartItems.length === 0}
                style={{ padding: '14px', background: cartItems.length === 0 ? '#cbd5e1' : '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer', fontSize: '14px' }}
              >
                🖨️ Send KOT to Kitchen & Save
              </button>
              <button 
                onClick={() => setShowSplitModal(true)}
                disabled={cartItems.length === 0}
                style={{ padding: '13px', background: cartItems.length === 0 ? '#f1f5f9' : '#2563eb', color: cartItems.length === 0 ? '#94a3b8' : '#fff', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                💳 Split Payment & Checkout
              </button>
            </div>

          </div>

        </div>

        {showSplitModal && (
          <div style={styles.modalOverlay} onClick={() => setShowSplitModal(false)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: '950' }}>Split Payment Calculator</h3>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '14px' }}>Total Bill: <strong style={{ color: '#059669' }}>₹{totalAmount}</strong></p>
              
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>SPLIT AMONG:</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[2, 3, 4, 5].map(num => (
                  <button 
                    key={num}
                    onClick={() => setSplitCount(num)}
                    style={{ flex: 1, padding: '10px', background: splitCount === num ? '#2563eb' : '#f1f5f9', color: splitCount === num ? '#fff' : '#334155', border: '2px solid #cbd5e1', borderRadius: '8px', fontWeight: '950', cursor: 'pointer' }}
                  >
                    {num} People
                  </button>
                ))}
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', marginBottom: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '800', display: 'block' }}>Each Person Pays:</span>
                <span style={{ fontSize: '24px', fontWeight: '950', color: '#059669' }}>₹{Math.round(totalAmount / splitCount)}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => {
                    alert(`✅ Payment settled for Table ${activeOrderTable.name}!`);
                    setShowSplitModal(false);
                    setActiveOrderTable(null);
                    setCartItems([]);
                  }}
                  style={{ flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}
                >
                  Confirm & Complete Settlement
                </button>
                <button onClick={() => setShowSplitModal(false)} style={{ padding: '12px 18px', background: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // STANDARD TABLES & AREAS FLOOR VIEW
  // ==========================================
  return (
    <div style={styles.moduleWrapper}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Restaurant Floor & Tables</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '700' }}>
            <strong style={{ color: '#059669' }}>{availableCount}/{allTablesList.length} tables open</strong> · Synced live with Settings
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowCaptainManageModal(true)} style={styles.captainManageBtn}>🧑‍✈️ Manage Captains</button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add Table</button>
        </div>
      </div>

      {message.text && (
        <div style={{...styles.alert, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534', borderColor: message.type === 'error' ? '#f87171' : '#4ade80'}}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '700' }}>Loading tables from database...</div>
      ) : areasAndTables.areas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '700', background: '#fff', borderRadius: '14px', border: '1.5px dashed #cbd5e1' }}>
          No areas or tables found. Add them via Settings or click "+ Add Table" above!
        </div>
      ) : (
        areasAndTables.areas.map(area => {
          const areaTables = area.tables || [];
          if (areaTables.length === 0) return null;

          return (
            <div key={area.id} style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '950', color: '#047857', background: '#ecfdf5', padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #10b981', letterSpacing: '0.05em' }}>
                  🪑 {area.name.toUpperCase()} SECTION
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {areaTables.map(table => {
                  const isHovered = hoveredId === table.id;
                  const status = table.status || 'Available';
                  const captainName = table.captain || 'Unassigned';

                  return (
                    <div 
                      key={table.id} 
                      onClick={() => setSelectedTable({ ...table, areaId: area.id, areaName: area.name })}
                      onMouseEnter={() => setHoveredId(table.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ 
                        background: '#fff', borderRadius: '18px', padding: '22px', 
                        border: `2.5px solid ${isHovered ? '#059669' : '#e2e8f0'}`, 
                        boxShadow: isHovered ? '0 20px 30px -10px rgba(5, 150, 105, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '150px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '22px', fontWeight: '950', color: '#0f172a' }}>{table.name}</span>
                          <span style={{ background: status === 'Available' ? '#d1fae5' : '#fee2e2', color: status === 'Available' ? '#065f46' : '#991b1b', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', border: `1px solid ${status === 'Available' ? '#34d399' : '#fca5a5'}` }}>{status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '10px' }}>👥 Capacity: {table.pax} pax</div>
                        <div style={{ fontSize: '12px', color: captainName !== 'Unassigned' ? '#059669' : '#94a3b8', fontWeight: '900', background: captainName !== 'Unassigned' ? '#ecfdf5' : '#f8fafc', padding: '7px 12px', borderRadius: '10px', border: `1px solid ${captainName !== 'Unassigned' ? '#a7f3d0' : '#e2e8f0'}` }}>
                          🧑‍✈️ Captain: {captainName}
                        </div>
                      </div>
                      
                      <div style={{ width: '100%', textAlign: 'center', padding: '9px 0', background: isHovered ? '#059669' : '#f1f5f9', color: isHovered ? '#fff' : '#334155', borderRadius: '10px', fontWeight: '900', fontSize: '12px', marginTop: '14px', transition: 'all 0.2s' }}>
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

      {selectedTable && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTable(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950', fontSize: '18px' }}>Table {selectedTable.name} ({selectedTable.areaName}) Control</h3>
              <button onClick={() => setSelectedTable(null)} style={styles.closeXBtn}>✕</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>ASSIGN FLOOR CAPTAIN</label>
              <select 
                style={styles.input}
                defaultValue={selectedTable.captain || 'Unassigned'}
                onChange={(e) => handleUpdateTableStatusAndCaptain(selectedTable.areaId, selectedTable.id, selectedTable.status || 'Available', e.target.value, false)}
              >
                <option value="Unassigned">-- Select Captain --</option>
                {captainsList.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>ACTIONS</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => handleUpdateTableStatusAndCaptain(selectedTable.areaId, selectedTable.id, 'Available', selectedTable.captain, false)} 
                style={{ padding: '12px', background: '#d1fae5', color: '#065f46', border: '2px solid #10b981', borderRadius: '12px', fontWeight: '950', cursor: 'pointer' }}
              >
                🟢 Clear Table (Make Available)
              </button>
              <button 
                onClick={() => handleUpdateTableStatusAndCaptain(selectedTable.areaId, selectedTable.id, 'Occupied', selectedTable.captain, true)} 
                style={{ padding: '12px', background: '#eff6ff', color: '#1d4ed8', border: '2px solid #38bdf8', borderRadius: '12px', fontWeight: '950', cursor: 'pointer' }}
              >
                🚀 Mark Occupied & Open POS Terminal
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #e2e8f0', paddingTop: '14px' }}>
              <button onClick={() => handleDeleteTable(selectedTable.areaId, selectedTable.id)} style={{ background: '#fee2e2', color: '#991b1b', border: '2px solid #fca5a5', padding: '10px 16px', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>Delete Table</button>
              <button onClick={() => setSelectedTable(null)} style={{ background: '#f1f5f9', color: '#334155', border: '2px solid #cbd5e1', padding: '10px 18px', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTable} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: '950' }}>Add New Table</h3>
            
            <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>TABLE NAME / ID:</label>
            <input style={styles.input} placeholder="e.g. T5" value={newTableForm.tableName} onChange={e => setNewTableForm({...newTableForm, tableName: e.target.value})} required />
            
            <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>SECTION / AREA NAME:</label>
            <input style={styles.input} placeholder="e.g. Main, Patio, Rooftop" value={newTableForm.areaName} onChange={e => setNewTableForm({...newTableForm, areaName: e.target.value})} required />

            <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>SEATS (PAX):</label>
            <input type="number" style={styles.input} value={newTableForm.pax} onChange={e => setNewTableForm({...newTableForm, pax: e.target.value})} required />

            <button type="submit" style={{ ...styles.addBtn, width: '100%', padding: '12px', marginTop: '10px' }}>Create Table</button>
          </form>
        </div>
      )}

      {showCaptainManageModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCaptainManageModal(false)}>
          <form onSubmit={handleAddCaptain} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: '950' }}>Add Floor Captain</h3>
            <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>CAPTAIN NAME:</label>
            <input style={styles.input} placeholder="e.g. Rahul Sharma" value={newCaptainForm.name} onChange={e => setNewCaptainForm({...newCaptainForm, name: e.target.value})} required />
            <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>PHONE:</label>
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
  inlinePOSWrapper: { display: 'flex', flexDirection: 'column', flex: 1, height: '100%', background: '#fff', borderRadius: '14px', border: '2.5px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden', boxSizing: 'border-box' },
  addBtn: { background: '#059669', color: '#fff', border: '2px solid #047857', padding: '11px 20px', borderRadius: '12px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(5,150,105,0.25)' },
  captainManageBtn: { background: '#2563eb', color: '#fff', border: '2px solid #1d4ed8', padding: '11px 20px', borderRadius: '12px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '440px', backgroundColor: '#fff', padding: '26px', borderRadius: '22px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '2px solid #e2e8f0', textAlign: 'left' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '2.5px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box', fontSize: '13px', outline: 'none', fontWeight: '800' },
  qtyBtn: { width: '28px', height: '28px', background: '#e2e8f0', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '18px', fontWeight: '950', color: '#64748b', cursor: 'pointer' },
  alert: { padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: '900', border: '2px solid' }
};