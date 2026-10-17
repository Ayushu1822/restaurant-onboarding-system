import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const AGE_GROUPS = [
  '0-6', '6-12', '12-18', '18-24', '25-34', 
  '35-44', '45-54', '55-64', '65-74', '75-84', '85-100+'
];

export default function CounterPOS() {
  const [orderType, setOrderType] = useState(null); // 'Dine-In' or 'Takeaway'
  const [selectedTable, setSelectedTable] = useState('T1');
  const [tablesList, setTablesList] = useState([]);

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  
  // Identical Customer Form State matching CustomersModule
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [gender, setGender] = useState('Male');
  const [ageGroup, setAgeGroup] = useState('25-34');
  const [preferredFood, setPreferredFood] = useState('Veg');
  const [customerPhone, setCustomerPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');

  const [savedCustomers, setSavedCustomers] = useState([]);
  const [recentSearchQuery, setRecentSearchQuery] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/menu`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMenuItems(data); })
      .catch(err => console.log("Menu fetch error:", err));

    fetch(`${API_BASE_URL}/api/v1/customers`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSavedCustomers(data); })
      .catch(err => console.log("Customers fetch error:", err));

    fetch(`${API_BASE_URL}/api/v1/tables`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTablesList(data); })
      .catch(err => console.log("Tables fetch error:", err));
  }, []);

  const handlePhoneLookup = (phone) => {
    setCustomerPhone(phone);
    setWhatsappNumber(phone);
    const found = savedCustomers.find(c => c.customerPhone === phone);
    if (found) {
      setCustomerName(found.customerName || '');
      setGender(found.gender || 'Male');
      setAgeGroup(found.ageGroup || '25-34');
      setPreferredFood(found.preferredFood || 'Veg');
      setCustomerEmail(found.customerEmail || '');
      setAddress(found.address || '');
    }
  };

  const handleSelectExistingCustomer = (c) => {
    setCustomerPhone(c.customerPhone);
    setWhatsappNumber(c.whatsappNumber || c.customerPhone);
    setCustomerName(c.customerName || '');
    setGender(c.gender || 'Male');
    setAgeGroup(c.ageGroup || '25-34');
    setPreferredFood(c.preferredFood || 'Veg');
    setCustomerEmail(c.customerEmail || '');
    setAddress(c.address || '');
    setShowCustomerModal(false);
  };

  const handleDeleteCustomer = (e, phoneToRemove) => {
    e.stopPropagation();
    setSavedCustomers(savedCustomers.filter(c => c.customerPhone !== phoneToRemove));
  };

  const handleSaveCustomerProfile = (e) => {
    e.preventDefault();
    if (!customerPhone || !customerName) return alert('Please enter Name and Phone number.');

    const custObj = { 
      customerName, 
      gender,
      ageGroup,
      preferredFood,
      customerPhone, 
      whatsappNumber: whatsappNumber || customerPhone,
      customerEmail, 
      address 
    };

    fetch(`${API_BASE_URL}/api/v1/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custObj)
    }).catch(err => console.log("Customer save error:", err));

    if (!savedCustomers.some(c => c.customerPhone === customerPhone)) {
      setSavedCustomers([custObj, ...savedCustomers]);
    }
    setShowCustomerModal(false);
  };

  const handleAddToCart = (item) => {
    const itemId = item.id || item.menuId;
    const itemName = item.itemName || item.name;
    const itemPrice = item.unitPrice || item.price;

    const existing = cart.find(i => i.id === itemId);
    if (existing) {
      setCart(cart.map(i => i.id === itemId ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { id: itemId, name: itemName, price: itemPrice, qty: 1 }]);
    }
  };

  const handleUpdateQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.05;
  const totalAmount = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return alert('Cart is empty!');
    if (!customerPhone || !customerName) return alert('Please add Customer details using the "+ Add Customer" button.');

    setIsSubmitting(true);

    const orderPayload = {
      displayId: `#POS-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      customerEmail,
      orderType: orderType,
      channel: 'COUNTER',
      deliveryAddress: orderType === 'Dine-In' ? `Table: ${selectedTable}` : (address || 'Takeaway Counter'),
      paymentMethod,
      paymentStatus: 'PAID',
      status: 'Completed',
      subtotal: subtotal,
      totalAmount: totalAmount,
      items: cart.map(item => ({
        itemName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        itemDescription: ''
      }))
    };

    fetch(`${API_BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save order');
        return res.json();
      })
      .then(data => {
        setIsSubmitting(false);
        setLastCompletedOrder({ ...orderPayload, id: data.displayId || orderPayload.displayId });
      })
      .catch(err => {
        console.error("Order save error:", err);
        setIsSubmitting(false);
        setLastCompletedOrder(orderPayload);
      });
  };

  // Only show LIVE items in POS
  const filteredMenu = menuItems.filter(item => {
    const isLive = (item.status || 'LIVE') === 'LIVE';
    const name = item.itemName || item.name || '';
    const cat = item.category || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || cat.toLowerCase().includes(searchQuery.toLowerCase());
    return isLive && matchesSearch;
  });

  const filteredRecentCustomers = savedCustomers.filter(c => {
    const q = recentSearchQuery.toLowerCase();
    return (c.customerName || '').toLowerCase().includes(q) || (c.customerPhone || '').toLowerCase().includes(q);
  });

  // FULL-SCREEN IMMERSIVE MODE SELECTOR
  if (!orderType) {
    return (
      <div style={styles.fullScreenSelector}>
        <div style={styles.selectorCard}>
          <div style={styles.modalHeaderIcon}>🍽️</div>
          <h2 style={{margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a'}}>Counter POS Workstation</h2>
          <p style={{fontSize: '13px', color: '#64748b', marginBottom: '28px'}}>Select order fulfillment channel to proceed</p>
          
          <div style={{display: 'flex', gap: '20px', marginBottom: '25px'}}>
            <div 
              onClick={() => setOrderType('Dine-In')}
              onMouseEnter={() => setHoveredCard('Dine-In')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...styles.modeCard,
                borderColor: hoveredCard === 'Dine-In' ? '#047857' : '#e2e8f0',
                background: hoveredCard === 'Dine-In' ? '#ecfdf5' : '#fff',
                transform: hoveredCard === 'Dine-In' ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: hoveredCard === 'Dine-In' ? '0 15px 30px rgba(4,120,87,0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <span style={{fontSize: '36px', marginBottom: '10px'}}>🪑</span>
              <div style={{fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>DINE IN</div>
              <div style={{fontSize: '11px', color: '#64748b', marginTop: '4px'}}>Restaurant Table Service</div>
            </div>

            <div 
              onClick={() => setOrderType('Takeaway')}
              onMouseEnter={() => setHoveredCard('Takeaway')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...styles.modeCard,
                borderColor: hoveredCard === 'Takeaway' ? '#047857' : '#e2e8f0',
                background: hoveredCard === 'Takeaway' ? '#ecfdf5' : '#fff',
                transform: hoveredCard === 'Takeaway' ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: hoveredCard === 'Takeaway' ? '0 15px 30px rgba(4,120,87,0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <span style={{fontSize: '36px', marginBottom: '10px'}}>🛍️</span>
              <div style={{fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>TAKEAWAY</div>
              <div style={{fontSize: '11px', color: '#64748b', marginTop: '4px'}}>Counter Parcel Pickup</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.posContainer}>
      
      {/* Main Counter POS Workspace */}
      <div style={styles.menuSection}>
        <div style={styles.posHeader}>
          <div>
            <h2 style={{margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a'}}>Counter POS ({orderType})</h2>
            <span style={{fontSize: '12px', color: '#64748b'}}>Live Menu Synchronized</span>
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            {orderType === 'Dine-In' && (
              <select 
                style={styles.tableSelectDropdown}
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
              >
                {tablesList.length > 0 ? (
                  tablesList.map(t => <option key={t.tableId} value={t.tableId}>Table {t.tableId} ({t.section})</option>)
                ) : (
                  <>
                    <option value="T1">Table T1</option>
                    <option value="T2">Table T2</option>
                    <option value="T3">Table T3</option>
                  </>
                )}
              </select>
            )}
            <input 
              style={styles.searchBar}
              placeholder="🔍 Search dishes or categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={() => setOrderType(null)} 
              onMouseEnter={() => setHoveredBtn('changeMode')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...styles.switchModeBtn,
                background: hoveredBtn === 'changeMode' ? '#047857' : '#f1f5f9',
                color: hoveredBtn === 'changeMode' ? '#fff' : '#334155',
                borderColor: hoveredBtn === 'changeMode' ? '#047857' : '#cbd5e1',
                transform: hoveredBtn === 'changeMode' ? 'translateY(-2px) scale(1.02)' : 'translateY(0)',
                boxShadow: hoveredBtn === 'changeMode' ? '0 4px 12px rgba(4,120,87,0.25)' : 'none'
              }}
            >
              Change Mode
            </button>
          </div>
        </div>

        {/* Square Grid for Menu Items */}
        <div style={styles.menuGrid}>
          {filteredMenu.length === 0 ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b'}}>
              No live menu items found. Add or set items to LIVE in the Menu Module!
            </div>
          ) : (
            filteredMenu.map(item => {
              const itemId = item.id || item.menuId;
              const itemName = item.itemName || item.name;
              const itemPrice = item.unitPrice || item.price;
              const itemCategory = item.category || 'Dishes';
              const isCardHovered = hoveredCard === itemId;

              return (
                <div 
                  key={itemId} 
                  onClick={() => handleAddToCart(item)} 
                  onMouseEnter={() => setHoveredCard(itemId)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...styles.menuCard,
                    borderColor: isCardHovered ? '#047857' : '#e2e8f0',
                    transform: isCardHovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
                    boxShadow: isCardHovered ? '0 12px 25px rgba(4,120,87,0.15)' : '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <span style={styles.cardCategoryTag}>{itemCategory}</span>
                    <div style={{fontSize: '14px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{itemName}</div>
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto'}}>
                    <span style={{fontSize: '14px', fontWeight: '800', color: '#047857'}}>₹{itemPrice}</span>
                    <span style={{
                      background: isCardHovered ? '#047857' : '#d1fae5', 
                      color: isCardHovered ? '#fff' : '#065f46', 
                      padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                      transition: 'all 0.2s'
                    }}>
                      + Add
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Billing & Cart Sidebar */}
      <div style={styles.cartSidebar}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
          <h3 style={{margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>Current Bill</h3>
          <button 
            onClick={() => setShowCustomerModal(true)}
            onMouseEnter={() => setHoveredBtn('addCustomer')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.addCustomerBtn,
              background: hoveredBtn === 'addCustomer' ? '#047857' : '#ecfdf5',
              color: hoveredBtn === 'addCustomer' ? '#fff' : '#047857',
              borderColor: hoveredBtn === 'addCustomer' ? '#047857' : '#10b981',
              transform: hoveredBtn === 'addCustomer' ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
              boxShadow: hoveredBtn === 'addCustomer' ? '0 4px 12px rgba(4,120,87,0.3)' : 'none'
            }}
          >
            {customerPhone ? '👤 ' + customerName : '+ Add Customer'}
          </button>
        </div>

        <div style={styles.cartItemsList}>
          {cart.length === 0 ? (
            <div style={{textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '13px'}}>Cart is empty. Tap menu items.</div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={styles.cartItemRow}>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '13px', fontWeight: '600'}}>{item.name}</div>
                  <div style={{fontSize: '11px', color: '#64748b'}}>₹{item.price} each</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <button onClick={() => handleUpdateQty(item.id, -1)} style={styles.qtyBtn}>-</button>
                  <span style={{fontSize: '13px', fontWeight: 'bold'}}>{item.qty}</span>
                  <button onClick={() => handleUpdateQty(item.id, 1)} style={styles.qtyBtn}>+</button>
                </div>
                <div style={{fontSize: '13px', fontWeight: '700', width: '55px', textAlign: 'right'}}>₹{item.price * item.qty}</div>
              </div>
            ))
          )}
        </div>

        <div style={styles.cartFooter}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#64748b'}}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#64748b'}}>
            <span>GST (5%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', borderTop: '1px solid #cbd5e1', paddingTop: '10px', marginBottom: '15px', color: '#0f172a'}}>
            <span>Total Amount</span>
            <span style={{color: '#047857'}}>₹{totalAmount.toFixed(2)}</span>
          </div>

          <div style={{display: 'flex', gap: '8px', marginBottom: '15px'}}>
            {['UPI', 'CASH', 'CARD'].map(m => (
              <button 
                key={m} 
                onClick={() => setPaymentMethod(m)} 
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', 
                  border: paymentMethod === m ? '2px solid #047857' : '1px solid #cbd5e1', 
                  background: paymentMethod === m ? '#ecfdf5' : '#fff', 
                  fontWeight: '700', fontSize: '12px', cursor: 'pointer', 
                  transition: 'all 0.2s',
                  transform: paymentMethod === m ? 'translateY(-1px)' : 'translateY(0)'
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={isSubmitting} 
            onMouseEnter={() => setHoveredBtn('checkout')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.checkoutBtn,
              background: hoveredBtn === 'checkout' ? '#065f46' : '#047857',
              transform: hoveredBtn === 'checkout' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
              boxShadow: hoveredBtn === 'checkout' ? '0 6px 18px rgba(4,120,87,0.4)' : '0 4px 12px rgba(4,120,87,0.3)'
            }}
          >
            {isSubmitting ? 'Processing...' : 'Complete Order & Print Bill'}
          </button>
        </div>
      </div>

      {/* Identical Customer Form Modal Matching CustomersModule */}
      {showCustomerModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.customerModalCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>Add Customer Profile</h3>
              <button onClick={() => setShowCustomerModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            <form onSubmit={handleSaveCustomerProfile} style={{textAlign: 'left'}}>
              <label style={styles.modalLabel}>Customer Name *</label>
              <input 
                style={styles.inputField}
                placeholder="Full Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
              />

              <div style={{display: 'flex', gap: '10px'}}>
                <div style={{flex: 1}}>
                  <label style={styles.modalLabel}>Gender</label>
                  <select 
                    style={styles.inputField}
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{flex: 1}}>
                  <label style={styles.modalLabel}>Age Group</label>
                  <select 
                    style={styles.inputField}
                    value={ageGroup}
                    onChange={e => setAgeGroup(e.target.value)}
                  >
                    {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag} yrs</option>)}
                  </select>
                </div>
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <div style={{flex: 1}}>
                  <label style={styles.modalLabel}>Preferred Food</label>
                  <select 
                    style={styles.inputField}
                    value={preferredFood}
                    onChange={e => setPreferredFood(e.target.value)}
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </select>
                </div>

                <div style={{flex: 1}}>
                  <label style={styles.modalLabel}>Phone Number *</label>
                  <input 
                    style={styles.inputField}
                    placeholder="10-digit mobile"
                    value={customerPhone}
                    onChange={e => handlePhoneLookup(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label style={styles.modalLabel}>Email Address</label>
              <input 
                style={styles.inputField}
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />

              <label style={styles.modalLabel}>Delivery Address</label>
              <textarea 
                style={{...styles.inputField, height: '60px', resize: 'none'}}
                placeholder="Street, Area, City"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />

              <button type="submit" style={styles.saveCustomerBtn}>Save & Apply Profile</button>
            </form>

            {savedCustomers.length > 0 && (
              <div style={{marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px', textAlign: 'left'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase'}}>Recent Customers</span>
                  <input 
                    style={styles.recentSearchInput}
                    placeholder="Filter list..."
                    value={recentSearchQuery}
                    onChange={e => setRecentSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  {filteredRecentCustomers.length === 0 ? (
                    <div style={{fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '10px 0'}}>No matching recent guests</div>
                  ) : (
                    filteredRecentCustomers.map((c, idx) => {
                      const isRowHovered = hoveredRow === idx;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => handleSelectExistingCustomer(c)}
                          onMouseEnter={() => setHoveredRow(idx)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{
                            ...styles.recentCustomerRow,
                            background: isRowHovered ? '#ecfdf5' : '#f8fafc',
                            borderColor: isRowHovered ? '#10b981' : '#e2e8f0',
                            transform: isRowHovered ? 'translateX(2px)' : 'translateX(0)'
                          }}
                        >
                          <div style={{flex: 1, overflow: 'hidden'}}>
                            <div style={{fontWeight: '700', color: '#0f172a', fontSize: '13px'}}>{c.customerName}</div>
                            <div style={{fontSize: '11px', color: '#64748b'}}>{c.customerPhone} {c.ageGroup ? `• ${c.ageGroup}` : ''}</div>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteCustomer(e, c.customerPhone)}
                            title="Remove from recent list"
                            style={styles.deleteCustomerBtn}
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Larger Thermal Bill Print Modal */}
      {lastCompletedOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.receiptCard}>
            <div style={{textAlign: 'center', marginBottom: '15px'}}>
              <h3 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>FOODOS RESTAURANT</h3>
              <div style={{fontSize: '12px', color: '#64748b'}}>Counter POS Official Bill</div>
              <div style={{fontSize: '12px', borderBottom: '1.5px dashed #cbd5e1', paddingBottom: '8px', marginTop: '6px'}}>Order ID: {lastCompletedOrder.id}</div>
            </div>

            <div style={{fontSize: '13px', marginBottom: '14px', lineHeight: '1.6'}}>
              <div><strong>Customer:</strong> {lastCompletedOrder.customerName} ({lastCompletedOrder.customerPhone})</div>
              <div><strong>Fulfillment:</strong> {lastCompletedOrder.orderType} {lastCompletedOrder.deliveryAddress}</div>
              <div><strong>Payment Mode:</strong> {lastCompletedOrder.paymentMethod} (PAID)</div>
            </div>

            <div style={{borderTop: '1.5px dashed #cbd5e1', borderBottom: '1.5px dashed #cbd5e1', padding: '10px 0', marginBottom: '14px'}}>
              {lastCompletedOrder.items.map((it, idx) => (
                <div key={idx} style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px'}}>
                  <span>{it.quantity}x {it.itemName}</span>
                  <span>₹{it.unitPrice * it.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '16px', marginBottom: '24px'}}>
              <span>Total Bill Amount:</span>
              <span style={{color: '#047857'}}>₹{Number(lastCompletedOrder.totalAmount).toFixed(2)}</span>
            </div>

            <div style={{display: 'flex', gap: '12px'}}>
              <button onClick={() => window.print()} style={{flex: 1, background: '#047857', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.3)'}}>
                🖨️ Print Bill
              </button>
              <button onClick={() => { setLastCompletedOrder(null); setCart([]); setCustomerPhone(''); setCustomerName(''); setOrderType(null); }} style={{flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer'}}>
                New Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  fullScreenSelector: { display: 'flex', flex: 1, width: '100%', height: '100%', background: '#f8fafc', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' },
  selectorCard: { width: '520px', background: '#fff', padding: '45px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1.5px solid #e2e8f0' },
  modeCard: { flex: 1, padding: '35px 20px', borderRadius: '16px', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'center' },
  posContainer: { display: 'flex', height: '100vh', width: '100%', background: '#f8fafc', boxSizing: 'border-box', overflow: 'hidden' },
  menuSection: { flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'hidden' },
  posHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' },
  searchBar: { width: '280px', padding: '10px 15px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff', fontSize: '13px', transition: 'all 0.2s', outline: 'none' },
  tableSelectDropdown: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #10b981', background: '#ecfdf5', fontWeight: '700', color: '#065f46', fontSize: '13px', cursor: 'pointer' },
  switchModeBtn: { border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  // Square Grid Layout for Menu Cards
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '16px', overflowY: 'auto', flex: 1, paddingBottom: '20px' },
  menuCard: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', aspectRatio: '1 / 1' },
  cardCategoryTag: { fontSize: '10px', fontWeight: '800', color: '#047857', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px', textTransform: 'uppercase' },
  cartSidebar: { width: '380px', background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box', flexShrink: '0' },
  addCustomerBtn: { border: '1px solid #10b981', padding: '7px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  inputField: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px', background: '#fff', outline: 'none' },
  cartItemsList: { flex: 1, overflowY: 'auto', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
  cartItemRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px' },
  qtyBtn: { background: '#e2e8f0', border: 'none', width: '24px', height: '24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
  cartFooter: { paddingTop: '15px' },
  checkoutBtn: { width: '100%', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  customerModalCard: { width: '480px', background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' },
  modalLabel: { fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '3px', textAlign: 'left', color: '#334155' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' },
  saveCustomerBtn: { width: '100%', background: '#047857', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', marginTop: '5px' },
  recentSearchInput: { width: '110px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' },
  recentCustomerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.15s' },
  deleteCustomerBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px', borderRadius: '4px' },
  receiptCard: { width: '400px', background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'left', fontFamily: 'monospace', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }
};