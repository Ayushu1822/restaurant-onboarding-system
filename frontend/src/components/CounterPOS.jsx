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
  
  // Receipt Configuration state synced with Settings Module
  const [receiptConfig, setReceiptConfig] = useState({
    restaurantName: 'LINGA FOODS',
    headerText: 'Linga Foods - Wonghikal',
    address: 'LINGA FOODS, No. 1540, Vellore Main Road, Wonghikal, Tiruvannamalai, Tamil Nadu 606604',
    phone: '91234400635',
    gstin: '37AAFP4128L1ZI',
    fssai: 'FSSAI: 22426260001195',
    footerNote: 'Thank You For Visiting Us!\n*** TEST PRINT ***\n*** NOT A VALID BILL / INVOICE ***',
    paperSize: '80mm',
    density: 'Compact',
    toggles: {
      restaurantName: true,
      address: true,
      phone: true,
      gstin: true,
      fssai: true,
      invoiceNo: true,
      dateAndTime: true,
      itemNameQtyAmt: true,
      totalTax: true
    }
  });
  
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
    const userEmail = localStorage.getItem('userEmail') || '';

    // Fetch Restaurant Profile to load receiptConfig & tax rules
    fetch(`${API_BASE_URL}/api/v1/restaurants/email/${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.receiptConfig) {
          const parsedCfg = typeof data.receiptConfig === 'string' ? JSON.parse(data.receiptConfig) : data.receiptConfig;
          setReceiptConfig(prev => ({ ...prev, ...parsedCfg }));
        }
      })
      .catch(err => console.log("Profile fetch error:", err));

    // Fetch Menu synced with account & tax mapping
    fetch(`${API_BASE_URL}/api/v1/menu?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const storedTaxMap = JSON.parse(localStorage.getItem(`itemTaxMap_${userEmail}`) || '{}');
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
              ...item,
              id: item.id || item.menuId || idx,
              name: item.name || item.itemName || item.dishName || item.title || 'Unnamed Item',
              price: isNaN(parsedPrice) ? 0 : parsedPrice,
              category: item.category || item.foodType || item.menuType || 'Dishes',
              taxGroup: taxGroupName,
              taxRate: taxRate
            };
          });
          setMenuItems(normalized);
        }
      })
      .catch(err => console.log("Menu fetch error:", err));

    // Fetch Customers strictly isolated by account email
    fetch(`${API_BASE_URL}/api/v1/customers?email=${userEmail}`)
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

    const userEmail = localStorage.getItem('userEmail') || '';
    const custObj = { 
      customerName, 
      gender,
      ageGroup,
      preferredFood,
      customerPhone, 
      whatsappNumber: whatsappNumber || customerPhone,
      customerEmail, 
      address,
      restaurantEmail: userEmail
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
    const taxRate = item.taxRate ?? 5;
    const taxGroup = item.taxGroup || 'Standard Restaurant (5%)';

    const existing = cart.find(i => i.id === itemId);
    if (existing) {
      setCart(cart.map(i => i.id === itemId ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { id: itemId, name: itemName, price: itemPrice, taxRate, taxGroup, qty: 1 }]);
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
  const tax = cart.reduce((acc, item) => acc + ((item.price * item.qty * item.taxRate) / 100), 0);
  const totalAmount = Math.round(subtotal + tax);

  const handleCheckout = () => {
    if (cart.length === 0) return alert('Cart is empty!');
    if (!customerPhone || !customerName) return alert('Please add Customer details using the "+ Add Customer" button.');

    setIsSubmitting(true);
    const userEmail = localStorage.getItem('userEmail') || '';
    const istTimestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const finalPaymentDescription = splitPayment 
      ? `Split: ${pay1Method} (₹${pay1Amount || (totalAmount/2).toFixed(2)}) + ${pay2Method} (₹${(totalAmount - (Number(pay1Amount) || totalAmount/2)).toFixed(2)})`
      : paymentMethod;

    const orderPayload = {
      displayId: `#POS-${Math.floor(1000 + Math.random() * 9000)}`,
      restaurantEmail: userEmail,
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
      totalTax: tax,
      totalAmount: totalAmount,
      timestamp: istTimestamp,
      items: cart.map(item => ({
        itemName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        taxRate: item.taxRate,
        taxGroup: item.taxGroup,
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
        setLastCompletedOrder({ ...orderPayload, id: orderPayload.displayId });
      });
  };

  const handlePrintReceipt = () => {
    if (!lastCompletedOrder) return;
    
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for printing.');
      return;
    }

    const toggles = receiptConfig.toggles || {};
    const itemsHtml = lastCompletedOrder.items.map(it => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>${it.quantity}x ${it.itemName}</span>
        <span>₹${(it.unitPrice * it.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${lastCompletedOrder.id}</title>
          <style>
            body { font-family: monospace; padding: 16px; color: #000; background: #fff; width: ${receiptConfig.paperSize === '58mm' ? '58mm' : '80mm'}; margin: 0 auto; font-size: ${receiptConfig.density === 'Compact' ? '10px' : '12px'}; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          ${toggles.restaurantName ? `<div class="center bold" style="font-size: 14px;">${receiptConfig.restaurantName}</div>` : ''}
          ${receiptConfig.headerText ? `<div class="center" style="font-size: 10px; color: #333;">${receiptConfig.headerText}</div>` : ''}
          ${toggles.address && receiptConfig.address ? `<div class="center" style="font-size: 10px; color: #333; margin: 3px 0;">${receiptConfig.address}</div>` : ''}
          ${toggles.phone && receiptConfig.phone ? `<div class="center" style="font-size: 10px; color: #333;">Ph: ${receiptConfig.phone}</div>` : ''}
          ${toggles.gstin && receiptConfig.gstin ? `<div class="center" style="font-size: 10px; color: #333;">GSTIN: ${receiptConfig.gstin}</div>` : ''}
          ${receiptConfig.fssai ? `<div class="center" style="font-size: 10px; color: #333; margin-bottom: 6px;">${receiptConfig.fssai}</div>` : ''}
          <div class="line"></div>
          ${toggles.invoiceNo ? `<div><strong>Order ID:</strong> ${lastCompletedOrder.id}</div>` : ''}
          ${toggles.dateAndTime ? `<div><strong>Date:</strong> ${lastCompletedOrder.timestamp}</div>` : ''}
          <div><strong>Customer:</strong> ${lastCompletedOrder.customerName} (${lastCompletedOrder.customerPhone})</div>
          <div><strong>Type:</strong> ${lastCompletedOrder.orderType}</div>
          <div><strong>Payment:</strong> ${splitPayment ? `Split (${pay1Method} + ${pay2Method})` : lastCompletedOrder.paymentMethod}</div>
          <div class="line"></div>
          <div class="bold" style="margin-bottom: 6px;">ITEMS:</div>
          ${itemsHtml}
          <div class="line"></div>
          <div class="flex"><span>Subtotal:</span><span>₹${lastCompletedOrder.subtotal.toFixed(2)}</span></div>
          ${toggles.totalTax ? `<div class="flex"><span>Tax:</span><span>₹${lastCompletedOrder.totalTax.toFixed(2)}</span></div>` : ''}
          <div class="flex bold" style="font-size: 13px; margin-top: 6px;"><span>Total:</span><span>₹${lastCompletedOrder.totalAmount}</span></div>
          <div class="line"></div>
          <div class="center" style="font-size: 10px; white-space: pre-line; margin-top: 6px;">${receiptConfig.footerNote}</div>
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
      <div className="cp-select">
        <style>{css}</style>
        <div className="cp-select-card">
          <div className="cp-select-icon">🍽️</div>
          <h2 className="cp-select-title">Counter POS Workstation</h2>
          <p className="cp-select-sub">Select order fulfillment channel to proceed</p>
          
          <div className="cp-mode-row">
            <div 
              onClick={() => setOrderType('Dine-In')}
              onMouseEnter={() => setHoveredCard('Dine-In')}
              onMouseLeave={() => setHoveredCard(null)}
              className="cp-mode"
            >
              <span className="cp-mode-icon">🪑</span>
              <div className="cp-mode-name">DINE IN</div>
              <div className="cp-mode-sub">Table Service Counter</div>
            </div>

            <div 
              onClick={() => setOrderType('Takeaway')}
              onMouseEnter={() => setHoveredCard('Takeaway')}
              onMouseLeave={() => setHoveredCard(null)}
              className="cp-mode is-takeaway"
            >
              <span className="cp-mode-icon">🛍️</span>
              <div className="cp-mode-name">TAKEAWAY</div>
              <div className="cp-mode-sub">Counter Parcel Pickup</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp">
      <style>{css}</style>
      
      {/* Main Counter POS Workspace */}
      <div className="cp-menu">
        <div className="cp-head">
          <div>
            <h2 className="cp-title">Counter POS ({orderType})</h2>
            <span className="cp-subtitle">Live Menu & Tax Synchronized</span>
          </div>
          <div className="cp-head-tools">
            <input 
              className="cp-search"
              placeholder="🔍 Search dishes or categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={() => setOrderType(null)} 
              onMouseEnter={() => setHoveredBtn('changeMode')}
              onMouseLeave={() => setHoveredBtn(null)}
              className="cp-switch-btn"
            >
              Change Mode
            </button>
          </div>
        </div>

        {/* Categorized Rectangular Card Grid */}
        <div className="cp-menu-scroll">
          {filteredMenu.length === 0 ? (
            <div className="cp-empty">
              No live menu items found. Add dishes in the Menu Module!
            </div>
          ) : (
            uniqueCategories.map(cat => {
              const catItems = filteredMenu.filter(item => (item.category || 'Dishes') === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="cp-cat-block">
                  <div className="cp-cat-title">{cat}</div>
                  <div className="cp-grid">
                    {catItems.map(item => {
                      const itemId = item.id || item.menuId;
                      const itemName = item.itemName || item.name;
                      const itemPrice = item.unitPrice || item.price;
                      const itemCat = item.category || 'Dishes';
                      const isInCart = cart.some(i => i.id === itemId);

                      return (
                        <div 
                          key={itemId} 
                          onClick={() => handleAddToCart(item)} 
                          onMouseEnter={() => setHoveredCard(itemId)}
                          onMouseLeave={() => setHoveredCard(null)}
                          className={`cp-card ${isInCart ? 'is-in-cart' : ''}`}
                        >
                          <div className="cp-card-top">
                            <div className="cp-card-name-wrap">
                              <div className={`cp-check ${isInCart ? 'is-on' : ''}`}>
                                {isInCart && <span className="cp-check-mark">✓</span>}
                              </div>
                              <span className="cp-card-name">{itemName}</span>
                            </div>
                          </div>

                          <div className="cp-card-meta">
                            <span>{itemCat}</span>
                            <span className="cp-tax-chip">🏷️ {item.taxGroup}</span>
                          </div>

                          <div className="cp-card-bottom">
                            <span className="cp-card-price">₹{itemPrice}</span>
                            <span className="cp-add-chip">
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
      <div className="cp-cart">
        <div className="cp-cart-head">
          <h3 className="cp-cart-title">Current Bill</h3>
          <button 
            onClick={() => setShowCustomerModal(true)}
            onMouseEnter={() => setHoveredBtn('addCustomer')}
            onMouseLeave={() => setHoveredBtn(null)}
            className={`cp-customer-btn ${customerPhone ? 'has-customer' : ''}`}
          >
            {customerPhone ? '👤 ' + customerName : '+ Add Customer'}
          </button>
        </div>

        <div className="cp-cart-list">
          {cart.length === 0 ? (
            <div className="cp-cart-empty">Cart is empty. Tap menu items.</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cp-cart-row">
                <div className="cp-cart-info">
                  <div className="cp-cart-name">{item.name}</div>
                  <div className="cp-cart-meta">₹{item.price} each · <span className="cp-cart-tax">{item.taxRate}% Tax</span></div>
                </div>
                <div className="cp-qty-wrap">
                  <button onClick={() => handleUpdateQty(item.id, -1)} className="cp-qty-btn">-</button>
                  <span className="cp-qty-num">{item.qty}</span>
                  <button onClick={() => handleUpdateQty(item.id, 1)} className="cp-qty-btn">+</button>
                </div>
                <div className="cp-cart-line">₹{item.price * item.qty}</div>
              </div>
            ))
          )}
        </div>

        {/* 📝 Special Note / Customer Instructions Input Box */}
        <div className="cp-note-block">
          <label className="cp-note-label">SPECIAL NOTE / KITCHEN INSTRUCTION</label>
          <input 
            className="cp-note-input"
            placeholder="e.g. Less spicy, Extra cheese..."
            value={specialNote}
            onChange={e => setSpecialNote(e.target.value)}
          />
        </div>

        <div className="cp-cart-footer">
          <div className="cp-sum-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="cp-sum-row cp-sum-tax">
            <span>Total Tax (Mapped)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="cp-sum-total">
            <span>Total Amount</span>
            <span className="cp-green">₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="cp-pay-row">
            {['UPI', 'CASH', 'CARD'].map(m => (
              <button 
                key={m} 
                onClick={() => setPaymentMethod(m)} 
                className={`cp-pay-btn ${paymentMethod === m ? 'is-active' : ''}`}
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
            className="cp-checkout-btn"
          >
            {isSubmitting ? 'Processing...' : 'Complete Order & Print Bill'}
          </button>
        </div>
      </div>

      {/* Customer Form Modal */}
      {showCustomerModal && (
        <div className="cp-overlay">
          <div className="cp-modal">
            <div className="cp-modal-head">
              <h3 className="cp-modal-title">Add Customer Profile</h3>
              <button onClick={() => setShowCustomerModal(false)} className="cp-close-x">✕</button>
            </div>

            <form onSubmit={handleSaveCustomerProfile} className="cp-form">
              <label className="cp-label">Customer Name *</label>
              <input 
                className="cp-input"
                placeholder="Full Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
              />

              <div className="cp-two-col">
                <div className="cp-col">
                  <label className="cp-label">Gender</label>
                  <select 
                    className="cp-input"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="cp-col">
                  <label className="cp-label">Age Group</label>
                  <select 
                    className="cp-input"
                    value={ageGroup}
                    onChange={e => setAgeGroup(e.target.value)}
                  >
                    {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag} yrs</option>)}
                  </select>
                </div>
              </div>

              <div className="cp-two-col">
                <div className="cp-col">
                  <label className="cp-label">Preferred Food</label>
                  <select 
                    className="cp-input"
                    value={preferredFood}
                    onChange={e => setPreferredFood(e.target.value)}
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </select>
                </div>

                <div className="cp-col">
                  <label className="cp-label">Phone Number *</label>
                  <input 
                    className="cp-input"
                    placeholder="10-digit mobile"
                    value={customerPhone}
                    onChange={e => handlePhoneLookup(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label className="cp-label">Email Address</label>
              <input 
                className="cp-input"
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />

              <label className="cp-label">Delivery Address</label>
              <textarea 
                className="cp-input cp-textarea"
                placeholder="Street, Area, City"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />

              <button type="submit" className="cp-save-btn">Save & Apply Profile</button>
            </form>

            {savedCustomers.length > 0 && (
              <div className="cp-recent">
                <div className="cp-recent-head">
                  <span className="cp-recent-title">Recent Customers</span>
                  <input 
                    className="cp-recent-search"
                    placeholder="Filter list..."
                    value={recentSearchQuery}
                    onChange={e => setRecentSearchQuery(e.target.value)}
                  />
                </div>

                <div className="cp-recent-list">
                  {filteredRecentCustomers.length === 0 ? (
                    <div className="cp-recent-empty">No matching recent guests</div>
                  ) : (
                    filteredRecentCustomers.map((c, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleSelectExistingCustomer(c)}
                        onMouseEnter={() => setHoveredRow(idx)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="cp-recent-row"
                      >
                        <div className="cp-recent-info">
                          <div className="cp-recent-name">{c.customerName}</div>
                          <div className="cp-recent-phone">{c.customerPhone} {c.ageGroup ? `• ${c.ageGroup}` : ''}</div>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteCustomer(e, c.customerPhone)}
                          title="Remove from recent list"
                          className="cp-recent-del"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bill & Receipt Modal with Split Payment Option */}
      {lastCompletedOrder && (
        <div className="cp-overlay">
          <div className="cp-modal cp-receipt">
            <div className="cp-receipt-head">
              <h3 className="cp-receipt-name">{receiptConfig.restaurantName}</h3>
              <div className="cp-receipt-header-text">{receiptConfig.headerText}</div>
              <div className="cp-receipt-address">{receiptConfig.address}</div>
              <div className="cp-receipt-id">
                Order ID: {lastCompletedOrder.id} · {lastCompletedOrder.timestamp}
              </div>
            </div>

            <div className="cp-receipt-info">
              <div><strong>Customer:</strong> {lastCompletedOrder.customerName} ({lastCompletedOrder.customerPhone})</div>
              <div><strong>Fulfillment:</strong> {lastCompletedOrder.orderType} ({lastCompletedOrder.deliveryAddress})</div>
              {lastCompletedOrder.customerRequest && (
                <div><strong>Note:</strong> <span className="cp-receipt-note">{lastCompletedOrder.customerRequest}</span></div>
              )}
            </div>

            <div className="cp-receipt-items">
              {lastCompletedOrder.items.map((it, idx) => (
                <div key={idx} className="cp-receipt-item">
                  <span>{it.quantity}x {it.itemName}</span>
                  <span>₹{it.unitPrice * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="cp-receipt-sum">
              <span>Subtotal:</span>
              <span>₹{lastCompletedOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="cp-receipt-sum cp-receipt-sum-tax">
              <span>Total Tax:</span>
              <span>₹{lastCompletedOrder.totalTax.toFixed(2)}</span>
            </div>
            <div className="cp-receipt-total">
              <span>Total Amount:</span>
              <span className="cp-green">₹{Number(lastCompletedOrder.totalAmount).toFixed(2)}</span>
            </div>

            {/* 💳 SPLIT PAYMENT SECTION INSIDE RECEIPT MODAL */}
            <div className="cp-split-box">
              <div className="cp-split-head">
                <div>
                  <div className="cp-split-title">⚡ Split Payment</div>
                  <div className="cp-split-sub">Divide bill across two payment modes</div>
                </div>
                <input
                  type="checkbox"
                  checked={splitPayment}
                  onChange={(e) => setSplitPayment(e.target.checked)}
                  className="cp-split-check"
                />
              </div>

              {splitPayment && (
                <div className="cp-split-body">
                  <div className="cp-split-row">
                    <span className="cp-split-label">Pay 1:</span>
                    <select value={pay1Method} onChange={e => setPay1Method(e.target.value)} className="cp-split-select">
                      <option value="Cash">Cash 💵</option>
                      <option value="UPI">UPI 📱</option>
                      <option value="Card">Card 💳</option>
                    </select>
                    <input 
                      type="number"
                      placeholder="Amount"
                      value={pay1Amount}
                      onChange={e => setPay1Amount(e.target.value)}
                      className="cp-split-input"
                    />
                  </div>
                  <div className="cp-split-pay2">
                    Pay 2 ({pay2Method}): ₹{(lastCompletedOrder.totalAmount - (Number(pay1Amount) || 0)).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <div className="cp-btn-row">
              <button onClick={handlePrintReceipt} className="cp-print-btn">
                🖨️ Print / Download Bill
              </button>
              <button onClick={() => { setLastCompletedOrder(null); setCart([]); setCustomerPhone(''); setCustomerName(''); setSpecialNote(''); setOrderType(null); setSplitPayment(false); }} className="cp-new-btn">
                New Order
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

.cp, .cp-select {
  --ink: #0f172a;
  --ink-soft: #334155;
  --ink-faint: #64748b;
  --bd: #c3cedc;
  --bd-soft: #dbe3ed;
  --surface: #ffffff;
  --canvas: #eef2f7;
  --green: #047857;
  --green-bright: #10b981;
  --green-fill: #ecfdf5;
  --blue: #2563eb;
  --amber: #d97706;
  --red: #dc2626;

  font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  color: var(--ink);
  box-sizing: border-box;
}
.cp *, .cp *::before, .cp *::after,
.cp-select *, .cp-select *::before, .cp-select *::after { box-sizing: border-box; }
.cp-green { color: var(--green); }

/* ======================== MODE SELECTOR ======================== */
.cp-select {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  justify-content: center;
  align-items: center;
  background:
    radial-gradient(900px 500px at 100% -10%, rgba(16, 185, 129, 0.18), transparent 60%),
    radial-gradient(800px 480px at -10% 110%, rgba(37, 99, 235, 0.14), transparent 60%),
    var(--canvas);
}
.cp-select-card {
  width: min(600px, 100%);
  background: var(--surface);
  padding: clamp(28px, 5vw, 52px);
  border-radius: 30px;
  text-align: center;
  border: 2px solid var(--bd);
  box-shadow: 0 30px 60px -20px rgba(15, 23, 42, 0.25);
  animation: cp-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-select-icon {
  width: 84px;
  height: 84px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  font-size: 42px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 2px solid #6ee7b7;
  border-radius: 26px;
  animation: cp-float 3s ease-in-out infinite;
}
.cp-select-title { margin: 0 0 8px 0; font-size: clamp(26px, 4vw, 32px); font-weight: 800; color: var(--ink); letter-spacing: -0.03em; }
.cp-select-sub { font-size: 16px; color: var(--ink-faint); font-weight: 600; margin: 0 0 32px 0; }

.cp-mode-row { display: flex; gap: 20px; }
.cp-mode {
  flex: 1;
  padding: 34px 20px;
  border-radius: 22px;
  border: 2px solid #86efac;
  background: linear-gradient(160deg, #f0fdf4, #dcfce7);
  cursor: pointer;
  text-align: center;
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
  animation: cp-rise 0.6s 0.12s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-mode.is-takeaway {
  border-color: #93c5fd;
  background: linear-gradient(160deg, #eff6ff, #dbeafe);
  animation-delay: 0.22s;
}
.cp-mode:hover {
  transform: translateY(-8px);
  border-color: var(--green);
  box-shadow: 0 24px 40px -14px rgba(4, 120, 87, 0.35);
}
.cp-mode.is-takeaway:hover { border-color: var(--blue); box-shadow: 0 24px 40px -14px rgba(37, 99, 235, 0.35); }
.cp-mode:active { transform: translateY(-3px) scale(0.98); }
.cp-mode-icon { display: inline-block; font-size: 46px; margin-bottom: 12px; transition: transform 0.3s ease; }
.cp-mode:hover .cp-mode-icon { transform: scale(1.2) rotate(-8deg); }
.cp-mode-name { font-size: 20px; font-weight: 800; color: var(--ink); letter-spacing: 0.02em; }
.cp-mode-sub { font-size: 14px; color: var(--ink-faint); font-weight: 600; margin-top: 6px; }

/* ======================== POS LAYOUT ======================== */
.cp {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background:
    radial-gradient(900px 420px at 100% -10%, rgba(16, 185, 129, 0.1), transparent 60%),
    radial-gradient(700px 380px at -10% 0%, rgba(37, 99, 235, 0.07), transparent 60%),
    var(--canvas);
}
.cp-menu { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: clamp(16px, 2vw, 28px); overflow: hidden; }

.cp-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
  animation: cp-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-title { margin: 0; font-size: clamp(22px, 2.6vw, 30px); font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.cp-subtitle { font-size: 14px; color: var(--ink-faint); font-weight: 700; }
.cp-head-tools { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

.cp-search {
  width: 300px;
  max-width: 100%;
  font-family: inherit;
  padding: 13px 18px;
  border-radius: 14px;
  border: 2px solid var(--bd);
  background: #fff;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, width 0.25s ease;
}
.cp-search::placeholder { color: #94a3b8; font-weight: 600; }
.cp-search:hover { border-color: #9fb0c5; }
.cp-search:focus { width: 340px; border-color: var(--green-bright); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }

.cp-switch-btn {
  font-family: inherit;
  background: #fff;
  color: var(--ink-soft);
  border: 2px solid var(--bd);
  padding: 13px 20px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.cp-switch-btn:hover { background: var(--green); color: #fff; border-color: var(--green); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(4, 120, 87, 0.3); }
.cp-switch-btn:active { transform: translateY(0) scale(0.97); }

.cp-menu-scroll { flex: 1; overflow-y: auto; padding: 4px 6px 24px 2px; }
.cp-empty {
  text-align: center;
  padding: 64px 24px;
  color: var(--ink-faint);
  font-weight: 700;
  font-size: 16px;
  background: #fff;
  border: 2px dashed var(--bd);
  border-radius: 22px;
}

.cp-cat-block { margin-bottom: 28px; }
.cp-cat-title {
  display: inline-block;
  font-size: 14px;
  font-weight: 800;
  color: var(--green);
  background: var(--green-fill);
  border: 2px solid #6ee7b7;
  padding: 7px 16px;
  border-radius: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.cp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap: 18px; }

/* Menu cards */
.cp-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  background: linear-gradient(170deg, #ffffff, #f5f8fb);
  border: 2px solid var(--bd);
  border-radius: 20px;
  padding: 18px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
  animation: cp-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-card:nth-child(2) { animation-delay: 0.04s; }
.cp-card:nth-child(3) { animation-delay: 0.08s; }
.cp-card:nth-child(4) { animation-delay: 0.12s; }
.cp-card:nth-child(n+5) { animation-delay: 0.16s; }

.cp-card:hover {
  transform: translateY(-5px);
  border-color: var(--green);
  background: linear-gradient(170deg, #f0fdf9, #d9f7ea);
  box-shadow: 0 20px 34px -14px rgba(4, 120, 87, 0.35);
}
.cp-card:active { transform: translateY(-1px) scale(0.98); }
.cp-card.is-in-cart {
  border-color: var(--green-bright);
  background: linear-gradient(170deg, #ecfdf5, #c9f4e0);
  box-shadow: 0 10px 22px -12px rgba(16, 185, 129, 0.5);
}

.cp-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.cp-card-name-wrap { display: flex; align-items: center; gap: 12px; min-width: 0; }
.cp-card-name { font-size: 17px; font-weight: 800; color: var(--ink); }

.cp-check {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2.5px solid #9fb0c5;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.25s ease;
}
.cp-check.is-on { border-color: var(--green); background: var(--green); transform: scale(1.12); animation: cp-pop-check 0.3s ease both; }
.cp-check-mark { color: #fff; font-size: 12px; font-weight: 800; line-height: 1; }

.cp-card-meta { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; font-weight: 700; color: var(--ink-faint); margin: 0 0 14px 34px; }
.cp-tax-chip { background: #fff; border: 1.5px solid var(--bd-soft); padding: 3px 9px; border-radius: 8px; font-weight: 800; color: var(--ink-soft); font-size: 12px; }
.cp-card.is-in-cart .cp-tax-chip, .cp-card:hover .cp-tax-chip { border-color: #a7f3d0; }

.cp-card-bottom { display: flex; justify-content: space-between; align-items: center; margin-left: 34px; }
.cp-card-price { font-size: 20px; font-weight: 800; color: var(--green); }
.cp-add-chip {
  background: #d1fae5;
  color: #065f46;
  border: 2px solid #6ee7b7;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.cp-card:hover .cp-add-chip { background: var(--green); color: #fff; border-color: var(--green); transform: scale(1.06); }
.cp-card.is-in-cart .cp-add-chip { background: var(--green); color: #fff; border-color: var(--green); }

/* ======================== CART SIDEBAR ======================== */
.cp-cart {
  width: 410px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: clamp(16px, 2vw, 26px);
  background: linear-gradient(180deg, #ffffff, #f6f9fc);
  border-left: 2px solid var(--bd);
  box-shadow: -14px 0 34px -22px rgba(15, 23, 42, 0.3);
  animation: cp-slide-left 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-cart-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 16px; }
.cp-cart-title { margin: 0; font-size: 22px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }

.cp-customer-btn {
  font-family: inherit;
  background: var(--green-fill);
  color: var(--green);
  border: 2px solid var(--green-bright);
  padding: 9px 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.cp-customer-btn.has-customer { background: var(--green); color: #fff; border-color: var(--green); }
.cp-customer-btn:hover { background: var(--green); color: #fff; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(4, 120, 87, 0.32); }
.cp-customer-btn:active { transform: translateY(0) scale(0.97); }

.cp-cart-list {
  flex: 1;
  min-height: 140px;
  overflow-y: auto;
  border-top: 2px solid var(--bd-soft);
  border-bottom: 2px solid var(--bd-soft);
  padding: 14px 4px 14px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}
.cp-cart-empty {
  text-align: center;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 700;
  padding: 34px 16px;
  border: 2px dashed var(--bd);
  border-radius: 16px;
  background: #f8fafc;
}
.cp-cart-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #f0f5fa;
  border: 2px solid var(--bd-soft);
  padding: 12px 14px;
  border-radius: 16px;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  animation: cp-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-cart-row:hover { border-color: #6ee7b7; background: #ecfdf5; transform: translateX(-3px); box-shadow: 0 8px 18px rgba(16, 185, 129, 0.14); }
.cp-cart-info { flex: 1; min-width: 0; }
.cp-cart-name { font-size: 15px; font-weight: 800; color: var(--ink); }
.cp-cart-meta { font-size: 12px; color: var(--ink-faint); font-weight: 700; margin-top: 2px; }
.cp-cart-tax { color: var(--green); font-weight: 800; }
.cp-qty-wrap { display: flex; align-items: center; gap: 8px; }
.cp-qty-btn {
  width: 32px;
  height: 32px;
  font-family: inherit;
  font-size: 17px;
  font-weight: 800;
  background: #fff;
  color: var(--ink-soft);
  border: 2px solid var(--bd);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
}
.cp-qty-btn:hover { background: var(--green); color: #fff; border-color: var(--green); transform: scale(1.12); }
.cp-qty-btn:active { transform: scale(0.92); }
.cp-qty-num { font-size: 16px; font-weight: 800; min-width: 22px; text-align: center; }
.cp-cart-line { font-size: 15px; font-weight: 800; width: 64px; text-align: right; color: var(--ink); }

/* Note */
.cp-note-block { margin: 14px 0 12px; }
.cp-note-label { font-size: 12px; font-weight: 800; color: var(--ink-faint); display: block; margin-bottom: 6px; letter-spacing: 0.03em; }
.cp-note-input {
  width: 100%;
  font-family: inherit;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid var(--bd);
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  background: #fffdf5;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.cp-note-input::placeholder { color: #a8a29e; font-weight: 600; }
.cp-note-input:hover { border-color: #9fb0c5; }
.cp-note-input:focus { border-color: var(--amber); background: #fff; box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.18); }

/* Totals */
.cp-cart-footer { padding-top: 6px; }
.cp-sum-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--ink-faint); }
.cp-sum-tax { margin-bottom: 12px; }
.cp-sum-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 22px;
  font-weight: 800;
  color: var(--ink);
  background: var(--green-fill);
  border: 2px solid #6ee7b7;
  border-radius: 16px;
  padding: 13px 16px;
  margin-bottom: 16px;
}

.cp-pay-row { display: flex; gap: 10px; margin-bottom: 16px; }
.cp-pay-btn {
  flex: 1;
  font-family: inherit;
  padding: 12px 8px;
  border-radius: 12px;
  border: 2px solid var(--bd);
  background: #fff;
  color: var(--ink-soft);
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.cp-pay-btn:hover { transform: translateY(-2px); border-color: var(--green-bright); background: #f0fdf9; }
.cp-pay-btn.is-active { background: var(--green); color: #fff; border-color: var(--green); box-shadow: 0 10px 20px rgba(4, 120, 87, 0.3); transform: translateY(-2px); }

.cp-checkout-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  font-family: inherit;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(4, 120, 87, 0.34);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.cp-checkout-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -80%;
  width: 50%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
}
.cp-checkout-btn:hover:not(:disabled) { transform: translateY(-3px); filter: brightness(1.06); box-shadow: 0 16px 32px rgba(4, 120, 87, 0.45); }
.cp-checkout-btn:hover:not(:disabled)::after { left: 130%; }
.cp-checkout-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
.cp-checkout-btn:disabled { opacity: 0.65; cursor: wait; }

/* ======================== MODALS ======================== */
.cp-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 2000;
  animation: cp-fade 0.25s ease both;
}
.cp-modal {
  width: min(520px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: #fff;
  padding: clamp(20px, 3vw, 32px);
  border-radius: 28px;
  border: 2px solid var(--bd);
  box-shadow: 0 30px 64px rgba(0, 0, 0, 0.32);
  text-align: left;
  animation: cp-pop 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cp-modal-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; }
.cp-modal-title { margin: 0; font-size: 22px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.cp-close-x {
  font-family: inherit;
  background: #f1f5f9;
  border: 2px solid var(--bd-soft);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 800;
  color: var(--ink-faint);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease, border-color 0.2s ease;
}
.cp-close-x:hover { background: #fee2e2; color: var(--red); border-color: #fca5a5; transform: rotate(90deg); }

.cp-form { text-align: left; }
.cp-label { font-size: 13px; font-weight: 800; display: block; margin-bottom: 6px; color: var(--ink-soft); }
.cp-input {
  width: 100%;
  font-family: inherit;
  padding: 12px 15px;
  border-radius: 12px;
  border: 2px solid var(--bd);
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 14px;
  background: #f6f9fc;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.cp-input::placeholder { color: #94a3b8; font-weight: 600; }
.cp-input:hover { border-color: #9fb0c5; }
.cp-input:focus { border-color: var(--green-bright); background: #fff; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
.cp-textarea { height: 80px; resize: none; line-height: 1.45; }
.cp-two-col { display: flex; gap: 14px; }
.cp-col { flex: 1; min-width: 0; }

.cp-save-btn {
  width: 100%;
  font-family: inherit;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  margin-top: 4px;
  box-shadow: 0 8px 20px rgba(4, 120, 87, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.cp-save-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 14px 28px rgba(4, 120, 87, 0.4); }
.cp-save-btn:active { transform: translateY(0) scale(0.98); }

/* Recent customers */
.cp-recent { margin-top: 20px; border-top: 2px solid var(--bd-soft); padding-top: 16px; text-align: left; }
.cp-recent-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
.cp-recent-title { font-size: 13px; font-weight: 800; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.04em; }
.cp-recent-search {
  width: 130px;
  font-family: inherit;
  padding: 7px 11px;
  border-radius: 10px;
  border: 2px solid var(--bd);
  font-size: 13px;
  font-weight: 700;
  outline: none;
  background: #f6f9fc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, width 0.25s ease;
}
.cp-recent-search:focus { width: 160px; border-color: var(--green-bright); background: #fff; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
.cp-recent-list { max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px; }
.cp-recent-empty { font-size: 14px; color: #94a3b8; font-weight: 700; text-align: center; padding: 14px 0; }
.cp-recent-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 14px;
  cursor: pointer;
  border: 2px solid var(--bd-soft);
  background: #f3f7fb;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}
.cp-recent-row:hover { background: #ecfdf5; border-color: var(--green-bright); transform: translateX(4px); box-shadow: 0 8px 16px rgba(16, 185, 129, 0.14); }
.cp-recent-info { flex: 1; overflow: hidden; }
.cp-recent-name { font-weight: 800; color: var(--ink); font-size: 15px; }
.cp-recent-phone { font-size: 13px; color: var(--ink-faint); font-weight: 600; }
.cp-recent-del {
  font-family: inherit;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 6px 8px;
  border-radius: 10px;
  transition: background 0.2s ease, transform 0.2s ease;
}
.cp-recent-del:hover { background: #fee2e2; transform: scale(1.18) rotate(-8deg); }

/* ======================== RECEIPT ======================== */
.cp-receipt { width: min(470px, 100%); }
.cp-receipt-head { text-align: center; margin-bottom: 14px; }
.cp-receipt-name { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
.cp-receipt-header-text { font-size: 13px; color: var(--ink-faint); font-weight: 700; margin-top: 2px; }
.cp-receipt-address { font-size: 12px; color: var(--ink-faint); font-weight: 600; margin-top: 3px; line-height: 1.4; }
.cp-receipt-id { font-size: 13px; font-weight: 700; color: var(--ink-soft); border-bottom: 2px dashed var(--bd); padding-bottom: 10px; margin-top: 10px; }

.cp-receipt-info { font-size: 14px; font-weight: 600; margin-bottom: 12px; line-height: 1.55; color: var(--ink-soft); }
.cp-receipt-note { color: var(--amber); font-weight: 800; }
.cp-receipt-items {
  border-top: 2px dashed var(--bd);
  border-bottom: 2px dashed var(--bd);
  padding: 12px 0;
  margin-bottom: 12px;
  max-height: 170px;
  overflow-y: auto;
}
.cp-receipt-item { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; margin-bottom: 6px; gap: 10px; }
.cp-receipt-sum { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; margin-bottom: 6px; color: var(--ink-faint); }
.cp-receipt-sum-tax { margin-bottom: 10px; }
.cp-receipt-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
  font-size: 19px;
  background: var(--green-fill);
  border: 2px solid #6ee7b7;
  border-radius: 14px;
  padding: 11px 14px;
  margin-bottom: 14px;
}

.cp-split-box {
  background: linear-gradient(160deg, #f0fdf4, #e1f9ea);
  border: 2px solid #86efac;
  border-radius: 16px;
  padding: 13px 15px;
  margin-bottom: 16px;
}
.cp-split-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.cp-split-title { font-weight: 800; font-size: 15px; color: var(--ink); }
.cp-split-sub { font-size: 12px; color: var(--ink-faint); font-weight: 600; margin-top: 2px; }
.cp-split-check { width: 22px; height: 22px; cursor: pointer; accent-color: var(--green); }
.cp-split-body { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; border-top: 2px solid #bbf7d0; padding-top: 12px; animation: cp-drop 0.25s ease both; }
.cp-split-row { display: flex; gap: 8px; align-items: center; }
.cp-split-label { font-size: 13px; font-weight: 800; width: 52px; flex-shrink: 0; }
.cp-split-select,
.cp-split-input {
  font-family: inherit;
  padding: 9px 11px;
  border-radius: 10px;
  border: 2px solid var(--bd);
  font-size: 14px;
  background: #fff;
  outline: none;
  font-weight: 700;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.cp-split-select { flex: 1; cursor: pointer; }
.cp-split-input { width: 100px; }
.cp-split-select:focus, .cp-split-input:focus { border-color: var(--green-bright); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
.cp-split-pay2 { font-size: 13px; color: var(--green); font-weight: 800; }

.cp-btn-row { display: flex; gap: 12px; }
.cp-print-btn {
  flex: 1;
  font-family: inherit;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(4, 120, 87, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.cp-print-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 14px 28px rgba(4, 120, 87, 0.4); }
.cp-new-btn {
  flex: 1;
  font-family: inherit;
  background: #f1f5f9;
  color: var(--ink-soft);
  border: 2px solid var(--bd);
  padding: 14px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.cp-new-btn:hover { background: #e2e8f0; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1); }
.cp-print-btn:active, .cp-new-btn:active { transform: translateY(0) scale(0.98); }

/* ======================== ANIMATIONS ======================== */
@keyframes cp-rise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cp-slide-left {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes cp-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cp-pop {
  from { opacity: 0; transform: translateY(14px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes cp-pop-check {
  0%   { transform: scale(0.6); }
  60%  { transform: scale(1.3); }
  100% { transform: scale(1.12); }
}
@keyframes cp-drop {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cp-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-7px); }
}

/* ======================== KEYBOARD FOCUS ======================== */
.cp button:focus-visible,
.cp-select .cp-mode:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.55);
  outline-offset: 2px;
}

/* ======================== RESPONSIVE ======================== */
@media (max-width: 1024px) {
  .cp-cart { width: 360px; }
}
@media (max-width: 900px) {
  .cp { flex-direction: column; height: auto; min-height: 100vh; overflow: visible; }
  .cp-menu { overflow: visible; }
  .cp-menu-scroll { overflow: visible; }
  .cp-cart { width: 100%; border-left: none; border-top: 2px solid var(--bd); box-shadow: 0 -14px 34px -22px rgba(15, 23, 42, 0.3); }
  .cp-search, .cp-search:focus { width: 100%; }
  .cp-head-tools { width: 100%; }
  .cp-switch-btn { flex: 1; }
}
@media (max-width: 560px) {
  .cp-mode-row { flex-direction: column; }
  .cp-two-col { flex-direction: column; gap: 0; }
  .cp-btn-row { flex-direction: column; }
  .cp-split-row { flex-wrap: wrap; }
  .cp-split-input { width: 100%; }
}

/* ======================== REDUCED MOTION ======================== */
@media (prefers-reduced-motion: reduce) {
  .cp *, .cp *::before, .cp *::after,
  .cp-select *, .cp-select *::before, .cp-select *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;