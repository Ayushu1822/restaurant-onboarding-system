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
  const [editingCaptain, setEditingCaptain] = useState(null);

  // 🧾 Receipt & Print Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedOrderReceipt, setCompletedOrderReceipt] = useState(null);

  // 💳 Cash vs Online Split Payment State
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [onlineAmount, setOnlineAmount] = useState('');

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
          const storedTaxMap = JSON.parse(localStorage.getItem(`itemTaxMap_${email}`) || '{}');
          const normalized = data.map((item, idx) => {
            const rawPrice = item.price ?? item.itemPrice ?? item.cost ?? item.rate ?? item.amount ?? item.unitPrice ?? 0;
            const parsedPrice = Number(rawPrice);
            const taxGroupName = item.taxGroup || storedTaxMap[item.id] || storedTaxMap[item.itemName] || 'Standard Restaurant (5%)';
            
            let taxRate = 5;
            const match = taxGroupName.match(/\((\d+)%\)/);
            if (match && match[1]) {
              taxRate = Number(match[1]);
            }

            return {
              id: item.id || item.menuId || idx,
              name: item.name || item.itemName || item.dishName || item.title || 'Unnamed Item',
              price: isNaN(parsedPrice) ? 0 : parsedPrice,
              category: item.category || item.foodType || item.menuType || 'Main Course',
              taxGroup: taxGroupName,
              taxRate: taxRate
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
    if (editingCaptain) {
      fetch(`${API_BASE_URL}/api/v1/staff/${editingCaptain.id || editingCaptain._id}`, {
        method: 'PUT',
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
          setEditingCaptain(null);
          setNewCaptainForm({ name: '', phone: '' });
          fetchCaptains(userEmail);
          alert('Captain updated successfully!');
        } else {
          alert('Failed to update captain.');
        }
      })
      .catch(err => alert('Error: ' + err.message));
    } else {
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
          setNewCaptainForm({ name: '', phone: '' });
          fetchCaptains(userEmail);
          alert('Captain added successfully!');
        } else {
          alert('Failed to add captain.');
        }
      })
      .catch(err => alert('Error: ' + err.message));
    }
  };

  const handleDeleteCaptain = (captainId) => {
    if (!window.confirm('Are you sure you want to delete this captain?')) return;
    const userEmail = localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/staff/${captainId}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.ok) {
        fetchCaptains(userEmail);
      } else {
        alert('Failed to delete captain.');
      }
    })
    .catch(err => alert('Error: ' + err.message));
  };

  const handleSendKOT = (paymentMode = 'Cash/Online') => {
    const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalTax = cartItems.reduce((acc, i) => acc + ((i.price * i.qty * i.taxRate) / 100), 0);
    const totalAmount = Math.round(subtotal + totalTax);
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
        itemDescription: orderNote || '',
        taxGroup: i.taxGroup
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
      const receiptData = {
        orderId: data.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        tableName: activeOrderTable.name,
        areaName: activeOrderTable.areaName,
        captain: activeOrderTable.captain || 'Unassigned',
        orderType: orderType,
        items: [...cartItems],
        subtotal: subtotal,
        totalTax: totalTax,
        totalAmount: totalAmount,
        paymentMode: paymentMode,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      setCompletedOrderReceipt(receiptData);
      setShowReceiptModal(true);
      setActiveOrderTable(null);
      setCartItems([]);
      setOrderNote('');
    })
    .catch(err => {
      console.error(err);
      alert('Error sending order to kitchen.');
    });
  };

  // 🖨️ Bulletproof Print / Download Handler using Isolated Print Window
  const handlePrintReceipt = () => {
    if (!completedOrderReceipt) return;
    
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for printing.');
      return;
    }

    const itemsHtml = completedOrderReceipt.items.map(it => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>${it.qty}x ${it.name}</span>
        <span>₹${(it.price * it.qty).toFixed(2)}</span>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${completedOrderReceipt.orderId}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; background: #fff; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">RESTAURANT KOT & BILL</div>
          <div class="center" style="font-size: 11px; color: #555; margin-bottom: 10px;">${completedOrderReceipt.timestamp}</div>
          <div><strong>Order ID:</strong> ${completedOrderReceipt.orderId}</div>
          <div><strong>Table:</strong> ${completedOrderReceipt.tableName} (${completedOrderReceipt.areaName})</div>
          <div><strong>Captain:</strong> ${completedOrderReceipt.captain}</div>
          <div><strong>Type:</strong> ${completedOrderReceipt.orderType}</div>
          <div><strong>Payment:</strong> ${completedOrderReceipt.paymentMode}</div>
          <div class="line"></div>
          <div class="bold" style="margin-bottom: 6px;">ITEMS:</div>
          ${itemsHtml}
          <div class="line"></div>
          <div class="flex"><span>Subtotal:</span><span>₹${completedOrderReceipt.subtotal.toFixed(2)}</span></div>
          <div class="flex"><span>Tax:</span><span>₹${completedOrderReceipt.totalTax.toFixed(2)}</span></div>
          <div class="flex bold" style="font-size: 14px; margin-top: 6px;"><span>Total:</span><span>₹${completedOrderReceipt.totalAmount}</span></div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
    const totalTaxAmount = cartItems.reduce((acc, item) => acc + ((item.price * item.qty * item.taxRate) / 100), 0);
    const totalAmount = Math.round(subtotal + totalTaxAmount);

    return (
      <div className="tb-pos">
        <style>{css}</style>

        <div className="tb-pos-header">
          <div className="tb-pos-header-left">
            <h3 className="tb-pos-title">Table {activeOrderTable.name} ({activeOrderTable.areaName}) POS Terminal</h3>
            <span className="tb-pos-captain">🧑‍✈️ {activeOrderTable.captain || 'Unassigned'}</span>
          </div>
          <button onClick={() => setActiveOrderTable(null)} className="tb-exit-btn">✕ Exit POS</button>
        </div>

        <div className="tb-pos-body">
          
          <div className="tb-menu-panel">
            <h4 className="tb-panel-title">LIVE RESTAURANT MENU (DATABASE & TAX-MAPPED)</h4>
            
            {menuItems.length === 0 ? (
              <div className="tb-empty">
                No menu items found. Please add items via Menu Management module first.
              </div>
            ) : (
              categories.map(category => {
                const catItems = menuItems.filter(item => item.category === category);
                if (catItems.length === 0) return null;

                return (
                  <div key={category} className="tb-cat-block">
                    <div className="tb-cat">
                      📁 {category.toUpperCase()}
                    </div>
                    <div className="tb-food-grid">
                      {catItems.map(food => {
                        return (
                          <div 
                            key={food.id}
                            onClick={() => {
                              const existing = cartItems.find(i => i.id === food.id);
                              if (existing) {
                                setCartItems(cartItems.map(i => i.id === food.id ? {...i, qty: i.qty + 1} : i));
                              } else {
                                setCartItems([...cartItems, { ...food, qty: 1 }]);
                              }
                            }}
                            onMouseEnter={() => setHoveredMenuId(food.id)}
                            onMouseLeave={() => setHoveredMenuId(null)}
                            className="tb-food"
                          >
                            <div className="tb-food-name">{food.name}</div>
                            <div className="tb-food-row">
                              <div className="tb-food-price">₹{food.price}</div>
                              <span className="tb-food-tax">🏷️ {food.taxGroup}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="tb-cart-panel">
            <h4 className="tb-panel-title">ORDER RECEIPT & TAX BREAKDOWN</h4>
            
            <div className="tb-block">
              <label className="tb-label">ORDER TYPE</label>
              <div className="tb-type-row">
                {['Dine-In', 'Takeaway'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`tb-type-btn ${orderType === type ? 'is-active' : ''}`}
                  >
                    {type === 'Dine-In' ? '🍽️ Dine-In' : '🛍️ Takeaway'}
                  </button>
                ))}
              </div>
            </div>

            <div className="tb-cart-list">
              {cartItems.length === 0 ? (
                <div className="tb-cart-empty">
                  Cart is empty. Click items from menu.
                </div>
              ) : (
                cartItems.map((item, idx) => {
                  const itemTotal = item.price * item.qty;
                  const itemTax = (itemTotal * item.taxRate) / 100;
                  return (
                    <div key={idx} className="tb-cart-item">
                      <div className="tb-cart-top">
                        <div className="tb-cart-name">{item.name}</div>
                        <div className="tb-qty-wrap">
                          <button onClick={() => setCartItems(cartItems.map((i, iIdx) => iIdx === idx && i.qty > 1 ? {...i, qty: i.qty - 1} : i))} className="tb-qty-btn">-</button>
                          <span className="tb-qty-num">{item.qty}</span>
                          <button onClick={() => setCartItems(cartItems.map((i, iIdx) => iIdx === idx ? {...i, qty: i.qty + 1} : i))} className="tb-qty-btn">+</button>
                        </div>
                      </div>
                      <div className="tb-cart-bottom">
                        <span>₹{item.price} x {item.qty} = ₹{itemTotal}</span>
                        <span className="tb-cart-tax">Tax ({item.taxGroup}): +₹{itemTax.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="tb-block">
              <label className="tb-label">KITCHEN INSTRUCTION (KOT NOTE)</label>
              <input 
                type="text" 
                placeholder="e.g. Extra spicy..." 
                value={orderNote} 
                onChange={e => setOrderNote(e.target.value)} 
                className="tb-input"
              />
            </div>

            {cartItems.length > 0 && (
              <div className="tb-totals">
                <div className="tb-totals-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="tb-totals-row is-faint">
                  <span>Total Tax Included:</span>
                  <span>₹{totalTaxAmount.toFixed(2)}</span>
                </div>
                <div className="tb-totals-grand">
                  <span>Total Amount:</span>
                  <span className="tb-green">₹{totalAmount}</span>
                </div>
              </div>
            )}

            <div className="tb-pay-col">
              <button 
                onClick={() => handleSendKOT('Cash/Online')}
                disabled={cartItems.length === 0}
                className="tb-kot-btn"
              >
                🖨️ Send KOT to Kitchen & Show Receipt
              </button>
              <button 
                onClick={() => {
                  setCashAmount('');
                  setOnlineAmount(totalAmount.toString());
                  setShowSplitModal(true);
                }}
                disabled={cartItems.length === 0}
                className="tb-split-btn"
              >
                💳 Split Cash & Online Checkout
              </button>
            </div>

          </div>

        </div>

        {/* 💳 CASH VS ONLINE SPLIT PAYMENT MODAL */}
        {showSplitModal && (
          <div className="tb-overlay" onClick={() => setShowSplitModal(false)}>
            <div className="tb-modal" onClick={e => e.stopPropagation()}>
              <h3 className="tb-modal-title tb-mb">Split Payment (Cash & Online)</h3>
              <p className="tb-split-total">Total Bill Amount: <strong className="tb-green">₹{totalAmount}</strong></p>
              
              <div className="tb-block">
                <label className="tb-label">CASH AMOUNT (₹):</label>
                <input 
                  type="number" 
                  className="tb-input" 
                  placeholder="0" 
                  value={cashAmount}
                  onChange={e => {
                    const val = Number(e.target.value) || 0;
                    setCashAmount(e.target.value);
                    const remaining = Math.max(0, totalAmount - val);
                    setOnlineAmount(remaining.toString());
                  }}
                />
              </div>

              <div className="tb-block tb-block-lg">
                <label className="tb-label">ONLINE (UPI / CARD) AMOUNT (₹):</label>
                <input 
                  type="number" 
                  className="tb-input" 
                  placeholder="0" 
                  value={onlineAmount}
                  onChange={e => {
                    const val = Number(e.target.value) || 0;
                    setOnlineAmount(e.target.value);
                    const remaining = Math.max(0, totalAmount - val);
                    setCashAmount(remaining.toString());
                  }}
                />
              </div>

              <div className="tb-btn-row">
                <button 
                  onClick={() => {
                    const c = Number(cashAmount) || 0;
                    const o = Number(onlineAmount) || 0;
                    if (c + o !== totalAmount) {
                      return alert(`Split amounts (Cash ₹${c} + Online ₹${o} = ₹${c+o}) must equal Total Bill ₹${totalAmount}!`);
                    }
                    handleSendKOT(`Cash: ₹${c} | Online: ₹${o}`);
                    setShowSplitModal(false);
                  }}
                  className="tb-confirm-btn"
                >
                  Confirm Split & Complete Settlement
                </button>
                <button onClick={() => setShowSplitModal(false)} className="tb-light-btn">Cancel</button>
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
    <div className="tb">
      <style>{css}</style>

      <div className="tb-header">
        <div>
          <h2 className="tb-title">Restaurant Floor & Tables</h2>
          <p className="tb-subtitle">
            <strong className="tb-green">{availableCount}/{allTablesList.length} tables open</strong> · Synced live with Settings
          </p>
        </div>
        <div className="tb-header-btns">
          <button onClick={() => { setEditingCaptain(null); setNewCaptainForm({ name: '', phone: '' }); setShowCaptainManageModal(true); }} className="tb-captain-btn">🧑‍✈️ Manage Captains ({captainsList.length})</button>
          <button onClick={() => setShowAddModal(true)} className="tb-add-btn">+ Add Table</button>
        </div>
      </div>

      {message.text && (
        <div className={`tb-alert ${message.type === 'error' ? 'is-error' : 'is-success'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="tb-center">
          <span className="tb-spinner" aria-hidden="true" />
          Loading tables from database...
        </div>
      ) : areasAndTables.areas.length === 0 ? (
        <div className="tb-empty">
          No areas or tables found. Add them via Settings or click "+ Add Table" above!
        </div>
      ) : (
        areasAndTables.areas.map(area => {
          const areaTables = area.tables || [];
          if (areaTables.length === 0) return null;

          return (
            <div key={area.id} className="tb-area">
              <div className="tb-area-head">
                <span className="tb-area-chip">
                  🪑 {area.name.toUpperCase()} SECTION
                </span>
              </div>
              <div className="tb-grid">
                {areaTables.map(table => {
                  const status = table.status || 'Available';
                  const captainName = table.captain || 'Unassigned';

                  return (
                    <div 
                      key={table.id} 
                      onClick={() => setSelectedTable({ ...table, areaId: area.id, areaName: area.name })}
                      onMouseEnter={() => setHoveredId(table.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`tb-table ${status === 'Available' ? 'is-available' : 'is-occupied'}`}
                    >
                      <div>
                        <div className="tb-table-top">
                          <span className="tb-table-name">{table.name}</span>
                          <span className="tb-status">{status}</span>
                        </div>
                        <div className="tb-capacity">👥 Capacity: {table.pax} pax</div>
                        <div className={`tb-captain-pill ${captainName !== 'Unassigned' ? 'is-assigned' : ''}`}>
                          🧑‍✈️ Captain: {captainName}
                        </div>
                      </div>
                      
                      <div className="tb-table-cta">
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
        <div className="tb-overlay" onClick={() => setSelectedTable(null)}>
          <div className="tb-modal" onClick={e => e.stopPropagation()}>
            <div className="tb-modal-head">
              <h3 className="tb-modal-title">Table {selectedTable.name} ({selectedTable.areaName}) Control</h3>
              <button onClick={() => setSelectedTable(null)} className="tb-close-x">✕</button>
            </div>

            <div className="tb-block tb-block-lg">
              <label className="tb-label">ASSIGN FLOOR CAPTAIN</label>
              <select 
                className="tb-input tb-input-flush"
                defaultValue={selectedTable.captain || 'Unassigned'}
                onChange={(e) => handleUpdateTableStatusAndCaptain(selectedTable.areaId, selectedTable.id, selectedTable.status || 'Available', e.target.value, false)}
              >
                <option value="Unassigned">-- Select Captain --</option>
                {captainsList.map(c => (
                  <option key={c.id || c._id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <label className="tb-label">ACTIONS</label>
            <div className="tb-action-col">
              <button 
                onClick={() => handleUpdateTableStatusAndCaptain(selectedTable.areaId, selectedTable.id, 'Available', selectedTable.captain, false)} 
                className="tb-action-clear"
              >
                🟢 Clear Table (Make Available)
              </button>
              <button 
                onClick={() => handleUpdateTableStatusAndCaptain(selectedTable.areaId, selectedTable.id, 'Occupied', selectedTable.captain, true)} 
                className="tb-action-open"
              >
                🚀 Mark Occupied & Open POS Terminal
              </button>
            </div>

            <div className="tb-modal-foot">
              <button onClick={() => handleDeleteTable(selectedTable.areaId, selectedTable.id)} className="tb-delete-btn">Delete Table</button>
              <button onClick={() => setSelectedTable(null)} className="tb-close-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="tb-overlay" onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTable} className="tb-modal" onClick={e => e.stopPropagation()}>
            <h3 className="tb-modal-title tb-mb">Add New Table</h3>
            
            <label className="tb-label">TABLE NAME / ID:</label>
            <input className="tb-input" placeholder="e.g. T5" value={newTableForm.tableName} onChange={e => setNewTableForm({...newTableForm, tableName: e.target.value})} required />
            
            <label className="tb-label">SECTION / AREA NAME:</label>
            <input className="tb-input" placeholder="e.g. Main, Patio, Rooftop" value={newTableForm.areaName} onChange={e => setNewTableForm({...newTableForm, areaName: e.target.value})} required />

            <label className="tb-label">SEATS (PAX):</label>
            <input type="number" className="tb-input" value={newTableForm.pax} onChange={e => setNewTableForm({...newTableForm, pax: e.target.value})} required />

            <button type="submit" className="tb-add-btn tb-add-btn-full">Create Table</button>
          </form>
        </div>
      )}

      {/* MANAGE CAPTAINS MODAL */}
      {showCaptainManageModal && (
        <div className="tb-overlay" onClick={() => setShowCaptainManageModal(false)}>
          <div className="tb-modal tb-modal-md" onClick={e => e.stopPropagation()}>
            <div className="tb-modal-head">
              <h3 className="tb-modal-title">🧑‍✈️ Manage Floor Captains</h3>
              <button onClick={() => setShowCaptainManageModal(false)} className="tb-close-x">✕</button>
            </div>

            <div className="tb-cap-list">
              {captainsList.length === 0 ? (
                <div className="tb-cap-empty">
                  No captains added yet. Add one below!
                </div>
              ) : (
                captainsList.map(c => {
                  const cId = c.id || c._id;
                  return (
                    <div key={cId || c.name} className="tb-cap-row">
                      <div>
                        <div className="tb-cap-name">{c.name}</div>
                        <div className="tb-cap-phone">📞 {c.phone || 'No phone'}</div>
                      </div>
                      <div className="tb-cap-btns">
                        <button 
                          onClick={() => {
                            setEditingCaptain(c);
                            setNewCaptainForm({ name: c.name || '', phone: c.phone || '' });
                          }}
                          className="tb-edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCaptain(cId)}
                          className="tb-del-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleAddCaptain} className="tb-cap-form">
              <h4 className="tb-cap-form-title">
                {editingCaptain ? `✏️ Edit Captain: ${editingCaptain.name}` : '+ Add New Captain'}
              </h4>
              <label className="tb-label">CAPTAIN NAME:</label>
              <input className="tb-input" placeholder="e.g. Rahul Sharma" value={newCaptainForm.name} onChange={e => setNewCaptainForm({...newCaptainForm, name: e.target.value})} required />
              
              <label className="tb-label">PHONE:</label>
              <input className="tb-input" placeholder="10-digit mobile" value={newCaptainForm.phone} onChange={e => setNewCaptainForm({...newCaptainForm, phone: e.target.value})} />
              
              <div className="tb-btn-row">
                <button type="submit" className="tb-captain-btn tb-captain-save">
                  {editingCaptain ? 'Update Captain' : 'Save Captain'}
                </button>
                {editingCaptain && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingCaptain(null); setNewCaptainForm({ name: '', phone: '' }); }}
                    className="tb-light-btn"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧾 RECEIPT & PRINT PREVIEW MODAL */}
      {showReceiptModal && completedOrderReceipt && (
        <div className="tb-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="tb-modal tb-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="tb-modal-head">
              <h3 className="tb-modal-title">🧾 Order Receipt & KOT</h3>
              <button onClick={() => setShowReceiptModal(false)} className="tb-close-x">✕</button>
            </div>

            <div className="tb-receipt">
              <div className="tb-receipt-title">RESTAURANT KOT & BILL</div>
              <div className="tb-receipt-time">{completedOrderReceipt.timestamp}</div>
              <div><strong>Order ID:</strong> {completedOrderReceipt.orderId}</div>
              <div><strong>Table:</strong> {completedOrderReceipt.tableName} ({completedOrderReceipt.areaName})</div>
              <div><strong>Captain:</strong> {completedOrderReceipt.captain}</div>
              <div><strong>Type:</strong> {completedOrderReceipt.orderType}</div>
              <div><strong>Payment:</strong> {completedOrderReceipt.paymentMode}</div>
              <div className="tb-receipt-line"></div>
              <div className="tb-receipt-bold">ITEMS:</div>
              {completedOrderReceipt.items.map((it, idx) => (
                <div key={idx} className="tb-receipt-row">
                  <span>{it.qty}x {it.name}</span>
                  <span>₹{it.price * it.qty}</span>
                </div>
              ))}
              <div className="tb-receipt-line"></div>
              <div className="tb-receipt-row">
                <span>Subtotal:</span>
                <span>₹{completedOrderReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="tb-receipt-row">
                <span>Tax:</span>
                <span>₹{completedOrderReceipt.totalTax.toFixed(2)}</span>
              </div>
              <div className="tb-receipt-row tb-receipt-total">
                <span>Total:</span>
                <span>₹{completedOrderReceipt.totalAmount}</span>
              </div>
            </div>

            <div className="tb-btn-row">
              <button 
                onClick={handlePrintReceipt}
                className="tb-print-btn"
              >
                🖨️ Print / Download Receipt
              </button>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="tb-done-btn"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Styles (frontend only) ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

.tb, .tb-pos {
  --ink: #0f172a;
  --ink-soft: #334155;
  --ink-faint: #64748b;
  --line: #e2e8f0;
  --surface: #ffffff;
  --canvas: #f3f5f9;
  --green: #059669;
  --green-dark: #047857;
  --blue: #2563eb;
  --red: #dc2626;

  font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  color: var(--ink);
  box-sizing: border-box;
}
.tb *, .tb *::before, .tb *::after,
.tb-pos *, .tb-pos *::before, .tb-pos *::after { box-sizing: border-box; }

.tb {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  padding: clamp(16px, 3vw, 32px);
  padding-bottom: 80px;
  overflow-y: auto;
  background:
    radial-gradient(900px 420px at 100% -10%, rgba(37, 99, 235, 0.08), transparent 60%),
    radial-gradient(700px 380px at -10% 0%, rgba(5, 150, 105, 0.08), transparent 60%),
    var(--canvas);
}

.tb-green { color: var(--green); }
.tb-mb { margin-bottom: 16px !important; }

/* ---------- Floor header ---------- */
.tb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 26px;
  animation: tb-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.tb-title { margin: 0; font-size: clamp(26px, 3.4vw, 34px); font-weight: 800; letter-spacing: -0.03em; color: var(--ink); }
.tb-subtitle { margin: 6px 0 0 0; color: var(--ink-faint); font-size: 15px; font-weight: 600; }
.tb-header-btns { display: flex; gap: 12px; flex-wrap: wrap; }

.tb-add-btn,
.tb-captain-btn {
  font-family: inherit;
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.tb-add-btn { background: linear-gradient(135deg, #10b981, #047857); box-shadow: 0 8px 20px rgba(5, 150, 105, 0.28); }
.tb-captain-btn { background: linear-gradient(135deg, #3b82f6, #1d4ed8); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.28); }
.tb-add-btn:hover { transform: translateY(-3px); filter: brightness(1.06); box-shadow: 0 14px 28px rgba(5, 150, 105, 0.38); }
.tb-captain-btn:hover { transform: translateY(-3px); filter: brightness(1.06); box-shadow: 0 14px 28px rgba(37, 99, 235, 0.38); }
.tb-add-btn:active, .tb-captain-btn:active { transform: translateY(0) scale(0.97); }
.tb-add-btn-full { width: 100%; padding: 15px; margin-top: 10px; font-size: 16px; }
.tb-captain-save { flex: 1; padding: 14px; text-align: center; }

/* Alerts */
.tb-alert {
  padding: 14px 18px;
  border-radius: 14px;
  margin-bottom: 20px;
  font-size: 15px;
  font-weight: 800;
  border: 2px solid;
  animation: tb-slide 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.tb-alert.is-success { background: #f0fdf4; color: #166534; border-color: #4ade80; }
.tb-alert.is-error { background: #fef2f2; color: #991b1b; border-color: #f87171; }

/* Loading / empty */
.tb-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 60px 20px;
  color: var(--ink-faint);
  font-weight: 700;
  font-size: 16px;
}
.tb-spinner {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid var(--line);
  border-top-color: var(--blue);
  animation: tb-spin 0.8s linear infinite;
}
.tb-empty {
  text-align: center;
  padding: 56px 24px;
  color: var(--ink-faint);
  font-weight: 700;
  font-size: 16px;
  background: #fff;
  border-radius: 20px;
  border: 2px dashed #cbd5e1;
}

/* ---------- Areas & tables ---------- */
.tb-area { margin-bottom: 32px; animation: tb-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tb-area-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.tb-area-chip {
  font-size: 13px;
  font-weight: 800;
  color: var(--green-dark);
  background: #ecfdf5;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.5px solid #10b981;
  letter-spacing: 0.03em;
}

.tb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr)); gap: 22px; }

.tb-table {
  --accent: #10b981;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 190px;
  background: var(--surface);
  border-radius: 22px;
  padding: 24px 24px 22px 30px;
  border: 1px solid var(--line);
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 26px -14px rgba(15, 23, 42, 0.14);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  animation: tb-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.tb-table:nth-child(2) { animation-delay: 0.05s; }
.tb-table:nth-child(3) { animation-delay: 0.1s; }
.tb-table:nth-child(4) { animation-delay: 0.15s; }
.tb-table:nth-child(5) { animation-delay: 0.2s; }
.tb-table:nth-child(n+6) { animation-delay: 0.25s; }

.tb-table.is-occupied { --accent: #ef4444; }
.tb-table::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 7px;
  background: var(--accent);
  transition: width 0.25s ease;
}
.tb-table:hover {
  transform: translateY(-6px);
  border-color: var(--green);
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05), 0 24px 44px -16px rgba(5, 150, 105, 0.35);
}
.tb-table:hover::before { width: 11px; }

.tb-table-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 14px; }
.tb-table-name { font-size: 28px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.tb-status {
  background: #d1fae5;
  color: #065f46;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  border: 1.5px solid #34d399;
}
.tb-table.is-occupied .tb-status { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }

.tb-capacity { font-size: 15px; color: var(--ink-faint); font-weight: 700; margin-bottom: 12px; }
.tb-captain-pill {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 800;
  background: #f8fafc;
  padding: 9px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
}
.tb-captain-pill.is-assigned { color: var(--green); background: #ecfdf5; border-color: #a7f3d0; }

.tb-table-cta {
  width: 100%;
  text-align: center;
  padding: 12px 0;
  background: #f1f5f9;
  color: var(--ink-soft);
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  margin-top: 18px;
  transition: background 0.2s ease, color 0.2s ease, letter-spacing 0.2s ease;
}
.tb-table:hover .tb-table-cta { background: var(--green); color: #fff; letter-spacing: 0.02em; }

/* ---------- Modals ---------- */
.tb-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 1000;
  animation: tb-fade 0.25s ease both;
}
.tb-modal {
  width: min(480px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: #fff;
  padding: clamp(20px, 3vw, 32px);
  border-radius: 26px;
  box-shadow: 0 30px 64px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--line);
  text-align: left;
  animation: tb-pop 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.tb-modal-md { width: min(540px, 100%); }
.tb-modal-sm { width: min(440px, 100%); }

.tb-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.tb-modal-title { margin: 0; color: var(--ink); font-weight: 800; font-size: 21px; letter-spacing: -0.02em; line-height: 1.3; }

.tb-close-x {
  font-family: inherit;
  background: #f1f5f9;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 17px;
  font-weight: 800;
  color: var(--ink-faint);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease;
}
.tb-close-x:hover { background: #fee2e2; color: var(--red); transform: rotate(90deg); }

.tb-label { font-size: 12px; font-weight: 800; color: var(--ink-faint); display: block; margin-bottom: 7px; letter-spacing: 0.02em; }
.tb-block { margin-bottom: 16px; }
.tb-block-lg { margin-bottom: 22px; }

.tb-input {
  width: 100%;
  font-family: inherit;
  padding: 13px 16px;
  border-radius: 12px;
  border: 2px solid #d5dde8;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.tb-input-flush { margin-bottom: 0; }
.tb-block .tb-input { margin-bottom: 0; }
.tb-input::placeholder { color: #94a3b8; font-weight: 600; }
.tb-input:hover { border-color: #b6c3d4; }
.tb-input:focus { border-color: var(--green); background: #fff; box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.18); }

/* Table control actions */
.tb-action-col { display: flex; flex-direction: column; gap: 12px; margin-bottom: 22px; }
.tb-action-clear,
.tb-action-open {
  font-family: inherit;
  padding: 15px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.tb-action-clear { background: #d1fae5; color: #065f46; border: 2px solid #10b981; }
.tb-action-open { background: #eff6ff; color: #1d4ed8; border: 2px solid #38bdf8; }
.tb-action-clear:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.25); filter: brightness(0.98); }
.tb-action-open:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(56, 189, 248, 0.3); filter: brightness(0.98); }
.tb-action-clear:active, .tb-action-open:active { transform: translateY(0) scale(0.98); }

.tb-modal-foot { display: flex; justify-content: space-between; gap: 10px; border-top: 1.5px solid var(--line); padding-top: 16px; }
.tb-delete-btn,
.tb-close-btn {
  font-family: inherit;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.tb-delete-btn { background: #fee2e2; color: #991b1b; border: 2px solid #fca5a5; }
.tb-delete-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3); }
.tb-close-btn { background: #f1f5f9; color: var(--ink-soft); border: 2px solid #cbd5e1; }
.tb-close-btn:hover { background: #e2e8f0; transform: translateY(-2px); }

/* Shared button row */
.tb-btn-row { display: flex; gap: 12px; }
.tb-light-btn {
  font-family: inherit;
  padding: 13px 20px;
  background: #f1f5f9;
  color: var(--ink-soft);
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}
.tb-light-btn:hover { background: #e2e8f0; transform: translateY(-2px); }

/* Captains modal */
.tb-cap-list { max-height: 230px; overflow-y: auto; margin-bottom: 18px; display: flex; flex-direction: column; gap: 10px; padding-right: 4px; }
.tb-cap-empty { text-align: center; color: #94a3b8; font-size: 14px; font-weight: 700; padding: 24px; background: #f8fafc; border-radius: 14px; border: 2px dashed #cbd5e1; }
.tb-cap-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.tb-cap-row:hover { border-color: var(--green); background: #f0fdf4; transform: translateX(4px); box-shadow: 0 8px 18px rgba(5, 150, 105, 0.12); }
.tb-cap-name { font-size: 16px; font-weight: 800; color: var(--ink); }
.tb-cap-phone { font-size: 13px; color: var(--ink-faint); font-weight: 700; margin-top: 2px; }
.tb-cap-btns { display: flex; gap: 8px; }
.tb-edit-btn,
.tb-del-btn {
  font-family: inherit;
  padding: 8px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.tb-edit-btn { background: #eff6ff; color: #1d4ed8; border: 1.5px solid #93c5fd; }
.tb-edit-btn:hover { background: #2563eb; color: #fff; border-color: #2563eb; transform: translateY(-2px); }
.tb-del-btn { background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; }
.tb-del-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; transform: translateY(-2px); }

.tb-cap-form { border-top: 2px solid var(--line); padding-top: 18px; }
.tb-cap-form-title { margin: 0 0 14px 0; font-size: 16px; font-weight: 800; color: var(--ink-soft); }

/* Receipt modal */
.tb-receipt {
  background: #f8fafc;
  padding: 18px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  text-align: left;
  font-size: 14px;
  line-height: 1.55;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  margin-bottom: 22px;
  animation: tb-rise 0.4s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.tb-receipt-title { text-align: center; font-weight: 800; font-size: 16px; margin-bottom: 4px; }
.tb-receipt-time { text-align: center; color: var(--ink-faint); margin-bottom: 10px; }
.tb-receipt-line { border-top: 1px dashed #94a3b8; margin: 12px 0; }
.tb-receipt-bold { font-weight: 800; margin-bottom: 6px; }
.tb-receipt-row { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 3px; }
.tb-receipt-total { font-weight: 800; font-size: 16px; margin-top: 8px; }

.tb-print-btn {
  flex: 1;
  font-family: inherit;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.tb-print-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 12px 24px rgba(37, 99, 235, 0.38); }
.tb-done-btn {
  font-family: inherit;
  padding: 14px 24px;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.tb-done-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 12px 24px rgba(5, 150, 105, 0.38); }
.tb-print-btn:active, .tb-done-btn:active { transform: translateY(0) scale(0.97); }

/* ======================== POS TERMINAL ======================== */
.tb-pos {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  background: #fff;
  border-radius: 22px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
  overflow: hidden;
  animation: tb-fade 0.3s ease both;
}

.tb-pos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 18px 26px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #fff;
}
.tb-pos-header-left { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.tb-pos-title { margin: 0; font-size: clamp(18px, 2.2vw, 22px); font-weight: 800; letter-spacing: -0.01em; }
.tb-pos-captain {
  background: var(--green);
  color: #fff;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
}
.tb-exit-btn {
  font-family: inherit;
  background: rgba(255, 255, 255, 0.14);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  font-size: 15px;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.tb-exit-btn:hover { background: #ef4444; border-color: #ef4444; transform: translateY(-2px); }

.tb-pos-body { display: flex; flex: 1; min-height: 0; overflow: hidden; background: #f8fafc; }

.tb-menu-panel { flex: 1.4; min-width: 0; padding: 26px; overflow-y: auto; border-right: 2px solid var(--line); }
.tb-cart-panel { flex: 0 0 min(430px, 100%); background: #fff; display: flex; flex-direction: column; padding: 26px; overflow-y: auto; }

.tb-panel-title { margin: 0 0 16px 0; font-size: 13px; font-weight: 800; color: var(--ink-faint); letter-spacing: 0.06em; }

.tb-cat-block { margin-bottom: 26px; }
.tb-cat {
  font-size: 14px;
  font-weight: 800;
  color: var(--green-dark);
  margin-bottom: 14px;
  background: #ecfdf5;
  padding: 8px 14px;
  border-radius: 10px;
  display: inline-block;
  border: 1.5px solid #10b981;
}

.tb-food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 190px), 1fr)); gap: 16px; }
.tb-food {
  background: #fff;
  padding: 18px;
  border-radius: 18px;
  border: 2px solid var(--line);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  animation: tb-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.tb-food:hover { border-color: var(--green); background: #f0fdf9; transform: translateY(-4px); box-shadow: 0 16px 28px -10px rgba(5, 150, 105, 0.28); }
.tb-food:active { transform: translateY(0) scale(0.97); }
.tb-food-name { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 10px; }
.tb-food-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.tb-food-price { font-size: 18px; font-weight: 800; color: var(--green); }
.tb-food-tax { font-size: 11px; font-weight: 800; background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 8px; }

/* Order type */
.tb-type-row { display: flex; gap: 10px; }
.tb-type-btn {
  flex: 1;
  font-family: inherit;
  padding: 13px;
  background: #f1f5f9;
  color: var(--ink-soft);
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.tb-type-btn:hover { transform: translateY(-2px); border-color: var(--green); }
.tb-type-btn.is-active { background: var(--green); color: #fff; border-color: var(--green); box-shadow: 0 8px 18px rgba(5, 150, 105, 0.3); }

/* Cart */
.tb-cart-list { flex: 1; min-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; padding-right: 2px; }
.tb-cart-empty {
  text-align: center;
  color: #94a3b8;
  font-size: 15px;
  padding: 44px 20px;
  background: #f8fafc;
  border-radius: 18px;
  border: 2px dashed #cbd5e1;
  font-weight: 700;
}
.tb-cart-item {
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  animation: tb-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.tb-cart-item:hover { border-color: #a7f3d0; background: #f0fdf9; box-shadow: 0 8px 18px rgba(5, 150, 105, 0.1); }
.tb-cart-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px; }
.tb-cart-name { font-size: 16px; font-weight: 800; color: var(--ink); }
.tb-qty-wrap { display: flex; align-items: center; gap: 10px; }
.tb-qty-btn {
  width: 34px;
  height: 34px;
  font-family: inherit;
  font-size: 17px;
  background: #e2e8f0;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
}
.tb-qty-btn:hover { background: var(--green); color: #fff; border-color: var(--green); transform: scale(1.1); }
.tb-qty-btn:active { transform: scale(0.92); }
.tb-qty-num { font-size: 16px; font-weight: 800; width: 26px; text-align: center; }
.tb-cart-bottom { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 13px; color: var(--ink-faint); font-weight: 700; }
.tb-cart-tax { color: var(--green); font-weight: 800; }

/* Totals */
.tb-totals { border-top: 2px solid var(--line); padding-top: 16px; margin-bottom: 18px; font-size: 15px; font-weight: 800; color: var(--ink-soft); }
.tb-totals-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.tb-totals-row.is-faint { color: var(--ink-faint); margin-bottom: 12px; }
.tb-totals-grand {
  display: flex;
  justify-content: space-between;
  font-size: 22px;
  font-weight: 800;
  color: var(--ink);
  border-top: 2px dashed #cbd5e1;
  padding-top: 12px;
}

.tb-pay-col { display: flex; flex-direction: column; gap: 12px; }
.tb-kot-btn,
.tb-split-btn {
  font-family: inherit;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, background 0.2s ease;
}
.tb-kot-btn { padding: 16px; font-size: 16px; background: linear-gradient(135deg, #10b981, #047857); box-shadow: 0 8px 20px rgba(5, 150, 105, 0.3); }
.tb-split-btn { padding: 15px; font-size: 15px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.28); }
.tb-kot-btn:hover:not(:disabled) { transform: translateY(-3px); filter: brightness(1.06); box-shadow: 0 14px 28px rgba(5, 150, 105, 0.4); }
.tb-split-btn:hover:not(:disabled) { transform: translateY(-3px); filter: brightness(1.06); box-shadow: 0 14px 28px rgba(37, 99, 235, 0.4); }
.tb-kot-btn:active:not(:disabled), .tb-split-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
.tb-kot-btn:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }
.tb-split-btn:disabled { background: #f1f5f9; color: #94a3b8; box-shadow: none; cursor: not-allowed; }

/* Split modal */
.tb-split-total { font-size: 15px; color: var(--ink-faint); font-weight: 700; margin: 0 0 16px 0; }
.tb-split-total strong { font-size: 20px; }
.tb-confirm-btn {
  flex: 1;
  font-family: inherit;
  padding: 14px;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.tb-confirm-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 12px 24px rgba(5, 150, 105, 0.38); }
.tb-confirm-btn:active { transform: translateY(0) scale(0.97); }

/* ---------- Animations ---------- */
@keyframes tb-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tb-slide {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tb-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes tb-pop {
  from { opacity: 0; transform: translateY(14px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes tb-spin { to { transform: rotate(360deg); } }

/* ---------- Keyboard focus ---------- */
.tb button:focus-visible,
.tb-pos button:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.5);
  outline-offset: 2px;
}

/* ---------- Responsive ---------- */
@media (max-width: 980px) {
  .tb-pos { height: auto; min-height: 100%; overflow-y: auto; }
  .tb-pos-body { flex-direction: column; overflow: visible; }
  .tb-menu-panel { border-right: none; border-bottom: 2px solid var(--line); overflow: visible; }
  .tb-cart-panel { flex: 1 1 auto; overflow: visible; }
}
@media (max-width: 640px) {
  .tb-header-btns { width: 100%; }
  .tb-header-btns .tb-add-btn, .tb-header-btns .tb-captain-btn { flex: 1; }
  .tb-pos-header { padding: 14px 16px; }
  .tb-menu-panel, .tb-cart-panel { padding: 18px; }
  .tb-btn-row { flex-direction: column; }
  .tb-cap-row { flex-wrap: wrap; }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .tb *, .tb *::before, .tb *::after,
  .tb-pos *, .tb-pos *::before, .tb-pos *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;