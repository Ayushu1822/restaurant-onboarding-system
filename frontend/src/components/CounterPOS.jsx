import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const AGE_GROUPS = [
  '0-6', '6-12', '12-18', '18-24', '25-34', 
  '35-44', '45-54', '55-64', '65-74', '75-84', '85-100+'
];

export default function CounterPOS() {
  const [orderType, setOrderType] = useState(null); // 'Dine-In' or 'Takeaway'

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [specialNote, setSpecialNote] = useState(''); // 📝 Special Note / Instructions state
  
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
  
  // 💳 Split Payment State for Receipt & Checkout
  const [splitPayment, setSplitPayment] = useState(false);
  const [pay1Method, setPay1Method] = useState('Cash');
  const [pay1Amount, setPay1Amount] = useState('');
  const [pay2Method, setPay2Method] = useState('UPI');

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

    const finalPaymentDescription = splitPayment 
      ? `Split: ${pay1Method} (₹${pay1Amount || (totalAmount/2).toFixed(2)}) + ${pay2Method} (₹${(totalAmount - (pay1Amount || totalAmount/2)).toFixed(2)})`
      : paymentMethod;

    const orderPayload = {
      displayId: `#POS-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      customerEmail,
      orderType: orderType,
      channel: 'COUNTER',
      deliveryAddress: orderType === 'Dine-In' ? 'Dine-In Counter Service' : 'Takeaway Counter',
      customerRequest: specialNote || '', 
      paymentMethod: finalPaymentDescription,
      paymentStatus: 'PAID',
      status: 'Preparing', 
      subtotal: subtotal,
      totalAmount: totalAmount,
      items: cart.map(item => ({
        itemName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        itemDescription: specialNote || ''
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

  const filteredMenu = menuItems.filter(item => {
    const isLive = (item.status || 'LIVE') === 'LIVE';
    const name = item.itemName || item.name || '';
    const cat = item.category || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || cat.toLowerCase().includes(searchQuery.toLowerCase());
    return isLive && matchesSearch;
  });

  const uniqueCategories = Array.from(new Set(filteredMenu.map(i => i.category || 'Dishes')));

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
              <div style={{fontSize: '11px', color: '#64748b', marginTop: '4px'}}>Table Service Counter</div>
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

        {/* Categorized Rectangular Card Grid */}
        <div style={styles.scrollableMenuArea}>
          {filteredMenu.length === 0 ? (
            <div style={{textAlign: 'center', padding: '60px', color: '#64748b'}}>
              No live menu items found. Add dishes in the Menu Module!
            </div>
          ) : (
            uniqueCategories.map(cat => {
              const catItems = filteredMenu.filter(item => (item.category || 'Dishes') === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} style={{marginBottom: '24px'}}>
                  <div style={styles.categoryTitle}>{cat}</div>
                  <div style={styles.menuGrid}>
                    {catItems.map(item => {
                      const itemId = item.id || item.menuId;
                      const itemName = item.itemName || item.name;
                      const itemPrice = item.unitPrice || item.price;
                      const itemCat = item.category || 'Dishes';
                      const isCardHovered = hoveredCard === itemId;
                      const isInCart = cart.some(i => i.id === itemId);

                      return (
                        <div 
                          key={itemId} 
                          onClick={() => handleAddToCart(item)} 
                          onMouseEnter={() => setHoveredCard(itemId)}
                          onMouseLeave={() => setHoveredCard(null)}
                          style={{
                            ...styles.menuCard,
                            borderColor: isCardHovered ? '#047857' : '#e2e8f0',
                            transform: isCardHovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
                            boxShadow: isCardHovered ? '0 10px 20px rgba(4,120,87,0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                              <div style={{
                                width: '16px', height: '16px', borderRadius: '50%', 
                                border: `2px solid ${isInCart ? '#047857' : '#cbd5e1'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isInCart ? '#047857' : '#fff',
                                transition: 'all 0.2s'
                              }}>
                                {isInCart && <span style={{color: '#fff', fontSize: '9px', fontWeight: 'bold'}}>✓</span>}
                              </div>
                              <span style={{fontSize: '14px', fontWeight: '800', color: '#0f172a'}}>{itemName}</span>
                            </div>
                          </div>

                          <div style={{fontSize: '11px', color: '#64748b', marginLeft: '26px', marginBottom: '12px'}}>{itemCat}</div>

                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '26px'}}>
                            <span style={{fontSize: '14px', fontWeight: '800', color: '#047857'}}>₹{itemPrice}</span>
                            <span style={{
                              background: isCardHovered ? '#047857' : '#d1fae5', 
                              color: isCardHovered ? '#fff' : '#065f46', 
                              padding: '3px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                              transition: 'all 0.2s'
                            }}>
                              {isInCart ? 'Added (' + cart.find(i => i.id === itemId).qty + ')' : '+ Add'}
                            </span>
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
            <div style={{textAlign: 'center', color: '#94a3b8', padding: '30px 0', fontSize: '13px'}}>Cart is empty. Tap menu items.</div>
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

        {/* 📝 Special Note / Customer Instructions Input Box */}
        <div style={{marginTop: '10px', marginBottom: '10px'}}>
          <label style={{fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px'}}>SPECIAL NOTE / KITCHEN INSTRUCTION</label>
          <input 
            style={styles.specialNoteInput}
            placeholder="e.g. Less spicy, Extra cheese..."
            value={specialNote}
            onChange={e => setSpecialNote(e.target.value)}
          />
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

      {/* Customer Form Modal */}
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

      {/* Bill & Receipt Modal with Split Payment Option */}
      {lastCompletedOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.receiptCard}>
            <div style={{textAlign: 'center', marginBottom: '12px'}}>
              <h3 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>FOODOS RESTAURANT</h3>
              <div style={{fontSize: '12px', color: '#64748b'}}>Counter POS Official Bill</div>
              <div style={{fontSize: '12px', borderBottom: '1.5px dashed #cbd5e1', paddingBottom: '8px', marginTop: '6px'}}>Order ID: {lastCompletedOrder.id}</div>
            </div>

            <div style={{fontSize: '13px', marginBottom: '12px', lineHeight: '1.5'}}>
              <div><strong>Customer:</strong> {lastCompletedOrder.customerName} ({lastCompletedOrder.customerPhone})</div>
              <div><strong>Fulfillment:</strong> {lastCompletedOrder.orderType} ({lastCompletedOrder.deliveryAddress})</div>
              {lastCompletedOrder.customerRequest && (
                <div><strong>Note:</strong> <span style={{color: '#d97706', fontWeight: '700'}}>{lastCompletedOrder.customerRequest}</span></div>
              )}
            </div>

            <div style={{borderTop: '1.5px dashed #cbd5e1', borderBottom: '1.5px dashed #cbd5e1', padding: '10px 0', marginBottom: '12px'}}>
              {lastCompletedOrder.items.map((it, idx) => (
                <div key={idx} style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px'}}>
                  <span>{it.quantity}x {it.itemName}</span>
                  <span>₹{it.unitPrice * it.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px', marginBottom: '12px'}}>
              <span>Total Amount:</span>
              <span style={{color: '#047857'}}>₹{Number(lastCompletedOrder.totalAmount).toFixed(2)}</span>
            </div>

            {/* 💳 SPLIT PAYMENT SECTION INSIDE RECEIPT MODAL (Colorful & Responsive UX) */}
            <div style={styles.splitPaymentBox}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <div>
                  <div style={{fontWeight: '800', fontSize: '13px', color: '#0f172a'}}>⚡ Split Payment</div>
                  <div style={{fontSize: '10px', color: '#64748b'}}>Divide bill across two payment modes</div>
                </div>
                <input
                  type="checkbox"
                  checked={splitPayment}
                  onChange={(e) => setSplitPayment(e.target.checked)}
                  style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#047857'}}
                />
              </div>

              {splitPayment && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', borderTop: '1px solid #cbd5e1', paddingTop: '8px'}}>
                  <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                    <span style={{fontSize: '11px', fontWeight: '700', width: '65px'}}>Payment 1:</span>
                    <select value={pay1Method} onChange={e => setPay1Method(e.target.value)} style={styles.splitSelect}>
                      <option value="Cash">Cash 💵</option>
                      <option value="UPI">UPI 📱</option>
                      <option value="Card">Card 💳</option>
                    </select>
                    <input 
                      type="number"
                      placeholder="Amount"
                      value={pay1Amount}
                      onChange={e => setPay1Amount(e.target.value)}
                      style={styles.splitInput}
                    />
                  </div>

                  <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                    <span style={{fontSize: '11px', fontWeight: '700', width: '65px'}}>Payment 2:</span>
                    <select value={pay2Method} onChange={e => setPay2Method(e.target.value)} style={styles.splitSelect}>
                      <option value="UPI">UPI 📱</option>
                      <option value="Cash">Cash 💵</option>
                      <option value="Card">Card 💳</option>
                    </select>
                    <span style={{fontSize: '11px', fontWeight: '700', color: '#047857', flex: 1, textAlign: 'right', paddingRight: '4px'}}>
                      Bal: ₹{(lastCompletedOrder.totalAmount - (Number(pay1Amount) || lastCompletedOrder.totalAmount / 2)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div style={{fontSize: '12px', color: '#334155', marginBottom: '16px', background: '#f8fafc', padding: '8px', borderRadius: '6px'}}>
              <strong>Payment Status:</strong> {splitPayment ? `Split (${pay1Method} + ${pay2Method})` : lastCompletedOrder.paymentMethod} (PAID ✓)
            </div>

            <div style={{display: 'flex', gap: '12px'}}>
              <button onClick={() => window.print()} style={{flex: 1, background: '#047857', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.3)'}}>
                🖨️ Print Bill
              </button>
              <button onClick={() => { setLastCompletedOrder(null); setCart([]); setCustomerPhone(''); setCustomerName(''); setSpecialNote(''); setOrderType(null); setSplitPayment(false); }} style={{flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer'}}>
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
  switchModeBtn: { border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  scrollableMenuArea: { flex: 1, overflowY: 'auto', paddingBottom: '20px' },
  categoryTitle: { fontSize: '12px', fontWeight: '800', color: '#64748b', letterSpacing: '0.06em', marginBottom: '10px', textTransform: 'uppercase' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  menuCard: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cartSidebar: { width: '380px', background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box', flexShrink: '0' },
  addCustomerBtn: { border: '1px solid #10b981', padding: '7px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  specialNoteInput: { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', background: '#fff', outline: 'none' },
  inputField: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px', background: '#fff', outline: 'none' },
  cartItemsList: { flex: 1, overflowY: 'auto', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
  cartItemRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px' },
  qtyBtn: { background: '#e2e8f0', border: 'none', width: '24px', height: '24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
  cartFooter: { paddingTop: '10px' },
  checkoutBtn: { width: '100%', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  customerModalCard: { width: '480px', background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' },
  modalLabel: { fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '3px', textAlign: 'left', color: '#334155' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' },
  saveCustomerBtn: { width: '100%', background: '#047857', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', marginTop: '5px' },
  recentSearchInput: { width: '110px', padding: '4px 8px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '11px', outline: 'none' },
  recentCustomerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.15s' },
  deleteCustomerBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px', borderRadius: '4px' },
  receiptCard: { width: '420px', background: '#fff', padding: '24px', borderRadius: '20px', textAlign: 'left', fontFamily: 'Inter, sans-serif', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' },
  splitPaymentBox: { background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' },
  splitSelect: { padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff', outline: 'none', fontWeight: '600' },
  splitInput: { width: '80px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff', outline: 'none' }
};