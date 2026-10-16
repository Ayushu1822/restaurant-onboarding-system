import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function CounterPOS() {
  // If orderType is not chosen yet, show full-screen mode selector
  const [orderType, setOrderType] = useState(null); // 'Dine-In' or 'Takeaway'
  const [selectedTable, setSelectedTable] = useState('T1');
  const [tablesList, setTablesList] = useState([]);

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Menu fetched from Menu Module DB
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  
  // Customer modal & auto-fill state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [savedCustomers, setSavedCustomers] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  // Fetch Menu, Customers, and Tables on load
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
    const found = savedCustomers.find(c => c.customerPhone === phone);
    if (found) {
      setCustomerName(found.customerName);
      setCustomerEmail(found.customerEmail || '');
    }
  };

  const handleSaveCustomerProfile = (e) => {
    e.preventDefault();
    if (!customerPhone || !customerName) return alert('Please enter Name and Phone.');

    const custObj = { customerName, customerPhone, customerEmail };

    fetch(`${API_BASE_URL}/api/v1/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custObj)
    }).catch(err => console.log("Customer save error:", err));

    if (!savedCustomers.some(c => c.customerPhone === customerPhone)) {
      setSavedCustomers([...savedCustomers, custObj]);
    }
    setShowCustomerModal(false);
  };

  const handleAddToCart = (item) => {
    const itemId = item.id || item.menuId;
    const itemName = item.name || item.itemName;
    const itemPrice = item.price || item.unitPrice;

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
      channel: 'COUNTER', // Strict isolation: does not show in Online Orders
      deliveryAddress: orderType === 'Dine-In' ? `Table: ${selectedTable}` : 'Takeaway Counter',
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

  const filteredMenu = menuItems.filter(item => {
    const name = item.name || item.itemName || '';
    const cat = item.category || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || cat.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // FULL-SCREEN IMMERSIVE MODE SELECTOR (Bug 1 Fix)
  if (!orderType) {
    return (
      <div style={styles.fullScreenSelector}>
        <div style={styles.selectorCard}>
          <div style={styles.modalHeaderIcon}>🍽️</div>
          <h2 style={{margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a'}}>Welcome to Counter POS</h2>
          <p style={{fontSize: '14px', color: '#64748b', marginBottom: '30px'}}>How will the customer take this order?</p>
          
          <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
            <div 
              onClick={() => setOrderType('Dine-In')}
              onMouseEnter={() => setHoveredCard('Dine-In')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...styles.modeCard,
                borderColor: hoveredCard === 'Dine-In' ? '#10b981' : '#e2e8f0',
                background: hoveredCard === 'Dine-In' ? '#ecfdf5' : '#fff',
                transform: hoveredCard === 'Dine-In' ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: hoveredCard === 'Dine-In' ? '0 15px 30px rgba(4,120,87,0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <span style={{fontSize: '36px', marginBottom: '12px'}}>🪑</span>
              <div style={{fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>DINE IN</div>
              <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>Eat at restaurant tables</div>
            </div>

            <div 
              onClick={() => setOrderType('Takeaway')}
              onMouseEnter={() => setHoveredCard('Takeaway')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...styles.modeCard,
                borderColor: hoveredCard === 'Takeaway' ? '#10b981' : '#e2e8f0',
                background: hoveredCard === 'Takeaway' ? '#ecfdf5' : '#fff',
                transform: hoveredCard === 'Takeaway' ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: hoveredCard === 'Takeaway' ? '0 15px 30px rgba(4,120,87,0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <span style={{fontSize: '36px', marginBottom: '12px'}}>🛍️</span>
              <div style={{fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>TAKEAWAY</div>
              <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>Counter parcel pickup</div>
            </div>
          </div>
          <p style={{fontSize: '12px', color: '#94a3b8'}}>Select an option above to load the billing menu workspace.</p>
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
                borderColor: hoveredBtn === 'changeMode' ? '#047857' : '#cbd5e1'
              }}
            >
              Change Mode
            </button>
          </div>
        </div>

        <div style={styles.menuGrid}>
          {filteredMenu.length === 0 ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b'}}>
              No menu items found. Add dishes in the Menu Module!
            </div>
          ) : (
            filteredMenu.map(item => {
              const itemId = item.id || item.menuId;
              const itemName = item.name || item.itemName;
              const itemPrice = item.price || item.unitPrice;
              const itemDesc = item.desc || item.itemDescription || '';

              return (
                <div 
                  key={itemId} 
                  onClick={() => handleAddToCart(item)} 
                  onMouseEnter={() => setHoveredCard(itemId)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...styles.menuCard,
                    borderColor: hoveredCard === itemId ? '#10b981' : '#e2e8f0',
                    transform: hoveredCard === itemId ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: hoveredCard === itemId ? '0 10px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <div style={{fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px'}}>{itemName}</div>
                    <div style={{fontSize: '12px', color: '#64748b', marginBottom: '12px'}}>{itemDesc}</div>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '15px', fontWeight: '800', color: '#047857'}}>₹{itemPrice}</span>
                    <span style={{background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700'}}>+ Add</span>
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
              transform: hoveredBtn === 'addCustomer' ? 'translateY(-1px)' : 'translateY(0)'
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
                style={{flex: 1, padding: '8px', borderRadius: '6px', border: paymentMethod === m ? '2px solid #047857' : '1px solid #cbd5e1', background: paymentMethod === m ? '#ecfdf5' : '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'}}
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
              transform: hoveredBtn === 'checkout' ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: hoveredBtn === 'checkout' ? '0 6px 16px rgba(4,120,87,0.4)' : '0 4px 12px rgba(4,120,87,0.3)'
            }}
          >
            {isSubmitting ? 'Processing...' : 'Complete Order & Print Bill'}
          </button>
        </div>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSaveCustomerProfile} style={styles.promptCard}>
            <h3 style={{margin: '0 0 15px 0', fontSize: '18px', color: '#0f172a'}}>Customer Information</h3>
            
            <label style={{fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px', textAlign: 'left'}}>Phone Number (Auto-fills existing):</label>
            <input 
              style={{...styles.inputField, marginBottom: '12px'}}
              placeholder="Enter 10-digit phone"
              value={customerPhone}
              onChange={e => handlePhoneLookup(e.target.value)}
              list="saved-phones"
              required
            />
            <datalist id="saved-phones">
              {savedCustomers.map((c, i) => <option key={i} value={c.customerPhone}>{c.customerName}</option>)}
            </datalist>

            <label style={{fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px', textAlign: 'left'}}>Customer Name:</label>
            <input 
              style={{...styles.inputField, marginBottom: '12px'}}
              placeholder="Full Name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />

            <label style={{fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px', textAlign: 'left'}}>Email Address:</label>
            <input 
              style={{...styles.inputField, marginBottom: '20px'}}
              placeholder="customer@email.com"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
            />

            <div style={{display: 'flex', gap: '10px'}}>
              <button type="submit" style={{flex: 1, background: '#047857', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer'}}>Save & Select</button>
              <button type="button" onClick={() => setShowCustomerModal(false)} style={{flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Thermal Bill Print Modal */}
      {lastCompletedOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.receiptCard}>
            <div style={{textAlign: 'center', marginBottom: '15px'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '800'}}>FOODOS RESTAURANT</h3>
              <div style={{fontSize: '11px', color: '#64748b'}}>Counter POS Bill</div>
              <div style={{fontSize: '11px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', marginTop: '5px'}}>Order ID: {lastCompletedOrder.id}</div>
            </div>

            <div style={{fontSize: '12px', marginBottom: '10px', lineHeight: '1.5'}}>
              <div><strong>Customer:</strong> {lastCompletedOrder.customerName} ({lastCompletedOrder.customerPhone})</div>
              <div><strong>Type:</strong> {lastCompletedOrder.orderType} {lastCompletedOrder.deliveryAddress}</div>
              <div><strong>Payment:</strong> {lastCompletedOrder.paymentMethod} (PAID)</div>
            </div>

            <div style={{borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', marginBottom: '10px'}}>
              {lastCompletedOrder.items.map((it, idx) => (
                <div key={idx} style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px'}}>
                  <span>{it.quantity}x {it.itemName}</span>
                  <span>₹{it.unitPrice * it.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '14px', marginBottom: '20px'}}>
              <span>Total Bill:</span>
              <span style={{color: '#047857'}}>₹{Number(lastCompletedOrder.totalAmount).toFixed(2)}</span>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => window.print()} style={{flex: 1, background: '#047857', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer'}}>
                🖨️ Print Bill
              </button>
              <button onClick={() => { setLastCompletedOrder(null); setCart([]); setCustomerPhone(''); setCustomerName(''); setOrderType(null); }} style={{flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer'}}>
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
  selectorCard: { width: '500px', background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  modeCard: { flex: 1, padding: '30px 20px', borderRadius: '16px', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'center' },
  posContainer: { display: 'flex', height: '100vh', width: '100%', background: '#f8fafc', boxSizing: 'border-box', overflow: 'hidden' },
  menuSection: { flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'hidden' },
  posHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' },
  searchBar: { width: '280px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' },
  tableSelectDropdown: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #10b981', background: '#ecfdf5', fontWeight: '700', color: '#065f46', fontSize: '13px' },
  switchModeBtn: { border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', overflowY: 'auto', flex: 1, paddingBottom: '20px' },
  menuCard: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cartSidebar: { width: '380px', background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box', flexShrink: '0' },
  addCustomerBtn: { border: '1px solid #10b981', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  inputField: { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' },
  cartItemsList: { flex: 1, overflowY: 'auto', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
  cartItemRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px' },
  qtyBtn: { background: '#e2e8f0', border: 'none', width: '24px', height: '24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  cartFooter: { paddingTop: '15px' },
  checkoutBtn: { width: '100%', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  promptCard: { width: '420px', background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalHeaderIcon: { width: '60px', height: '60px', background: '#ecfdf5', color: '#047857', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 15px auto' },
  receiptCard: { width: '320px', background: '#fff', padding: '24px', borderRadius: '16px', textAlign: 'left', fontFamily: 'monospace', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
};