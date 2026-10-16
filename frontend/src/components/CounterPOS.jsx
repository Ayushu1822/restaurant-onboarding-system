import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function CounterPOS() {
  const [orderTypeModal, setOrderTypeModal] = useState(true);
  const [orderType, setOrderType] = useState('Dine-In'); // 'Dine-In' or 'Takeaway'
  const [selectedTable, setSelectedTable] = useState('T1');
  
  const [hoveredCard, setHoveredCard] = useState(null);

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

  // Fetch Menu and Customers on load
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/menu`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMenuItems(data);
      })
      .catch(err => console.log("Menu fetch error, using fallback:", err));

    fetch(`${API_BASE_URL}/api/v1/customers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSavedCustomers(data);
      })
      .catch(err => console.log("Customers fetch error:", err));
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
      channel: 'COUNTER', // Strict isolation: will NOT show in Online Orders
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

  return (
    <div style={styles.posContainer}>
      
      {/* STEP 1: Dine-In vs Takeaway Reactive Start Modal */}
      {orderTypeModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.promptCard}>
            <div style={styles.modalHeaderIcon}>🍽️</div>
            <h2 style={{margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a'}}>How will the customer order?</h2>
            <p style={{fontSize: '13px', color: '#64748b', marginBottom: '25px'}}>Select order mode to configure billing workspace</p>
            
            <div style={{display: 'flex', gap: '16px', marginBottom: '25px'}}>
              <div 
                onClick={() => setOrderType('Dine-In')}
                onMouseEnter={() => setHoveredCard('Dine-In')}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  ...styles.modeSelectCard,
                  borderColor: orderType === 'Dine-In' ? '#047857' : (hoveredCard === 'Dine-In' ? '#34d399' : '#e2e8f0'),
                  background: orderType === 'Dine-In' ? '#ecfdf5' : (hoveredCard === 'Dine-In' ? '#f8fafc' : '#fff'),
                  transform: hoveredCard === 'Dine-In' ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredCard === 'Dine-In' ? '0 10px 25px rgba(4,120,87,0.12)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <span style={{fontSize: '28px', marginBottom: '8px'}}>🪑</span>
                <div style={{fontSize: '15px', fontWeight: '800', color: '#0f172a'}}>EAT IN</div>
                <div style={{fontSize: '11px', color: '#64748b', marginTop: '2px'}}>Dine-In at Table</div>
              </div>

              <div 
                onClick={() => setOrderType('Takeaway')}
                onMouseEnter={() => setHoveredCard('Takeaway')}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  ...styles.modeSelectCard,
                  borderColor: orderType === 'Takeaway' ? '#047857' : (hoveredCard === 'Takeaway' ? '#34d399' : '#e2e8f0'),
                  background: orderType === 'Takeaway' ? '#ecfdf5' : (hoveredCard === 'Takeaway' ? '#f8fafc' : '#fff'),
                  transform: hoveredCard === 'Takeaway' ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredCard === 'Takeaway' ? '0 10px 25px rgba(4,120,87,0.12)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <span style={{fontSize: '28px', marginBottom: '8px'}}>🛍️</span>
                <div style={{fontSize: '15px', fontWeight: '800', color: '#0f172a'}}>TAKEAWAY</div>
                <div style={{fontSize: '11px', color: '#64748b', marginTop: '2px'}}>Counter Parcel</div>
              </div>
            </div>

            {orderType === 'Dine-In' && (
              <div style={{marginBottom: '25px', textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                <label style={{fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: '#334155'}}>Assign Table:</label>
                <select 
                  style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: '600'}}
                  value={selectedTable}
                  onChange={e => setSelectedTable(e.target.value)}
                >
                  <option value="T1">Table T1 (Main - 2 seats)</option>
                  <option value="T2">Table T2 (Main - 4 seats)</option>
                  <option value="T3">Table T3 (Main - 4 seats)</option>
                  <option value="T5">Table T5 (Patio - 6 seats)</option>
                  <option value="B1">Table B1 (Bar - 1 seat)</option>
                </select>
              </div>
            )}

            <button onClick={() => setOrderTypeModal(false)} style={styles.startSessionBtn}>
              Start Punching Items ›
            </button>
          </div>
        </div>
      )}

      {/* Main Counter POS Workspace */}
      <div style={styles.menuSection}>
        <div style={styles.posHeader}>
          <div>
            <h2 style={{margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a'}}>Counter POS ({orderType} {orderType === 'Dine-In' ? `- ${selectedTable}` : ''})</h2>
            <span style={{fontSize: '12px', color: '#64748b'}}>Loaded from Menu Database</span>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <input 
              style={styles.searchBar}
              placeholder="🔍 Search menu dishes or categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button onClick={() => setOrderTypeModal(true)} style={styles.switchModeBtn}>Change Mode</button>
          </div>
        </div>

        <div style={styles.menuGrid}>
          {filteredMenu.length === 0 ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#64748b'}}>
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
            style={styles.addCustomerBtn}
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
                style={{flex: 1, padding: '8px', borderRadius: '6px', border: paymentMethod === m ? '2px solid #047857' : '1px solid #cbd5e1', background: paymentMethod === m ? '#ecfdf5' : '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer'}}
              >
                {m}
              </button>
            ))}
          </div>

          <button onClick={handleCheckout} disabled={isSubmitting} style={styles.checkoutBtn}>
            {isSubmitting ? 'Processing...' : 'Complete Order & Print Bill'}
          </button>
        </div>
      </div>

      {/* Customer Modal (+ Add Customer) */}
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
              <button onClick={() => { setLastCompletedOrder(null); setCart([]); setCustomerPhone(''); setCustomerName(''); }} style={{flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer'}}>
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
  posContainer: { display: 'flex', height: '100vh', width: '100%', background: '#f8fafc', boxSizing: 'border-box', overflow: 'hidden' },
  menuSection: { flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'hidden' },
  posHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' },
  searchBar: { width: '320px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' },
  switchModeBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', overflowY: 'auto', flex: 1, paddingBottom: '20px' },
  menuCard: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cartSidebar: { width: '380px', background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box', flexShrink: '0' },
  addCustomerBtn: { background: '#ecfdf5', color: '#047857', border: '1px solid #10b981', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' },
  inputField: { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' },
  cartItemsList: { flex: 1, overflowY: 'auto', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
  cartItemRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px' },
  qtyBtn: { background: '#e2e8f0', border: 'none', width: '24px', height: '24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  cartFooter: { paddingTop: '15px' },
  checkoutBtn: { width: '100%', background: '#047857', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.3)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  promptCard: { width: '420px', background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalHeaderIcon: { width: '50px', height: '50px', background: '#ecfdf5', color: '#047857', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 15px auto' },
  modeSelectCard: { flex: 1, padding: '20px 15px', borderRadius: '14px', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'center' },
  startSessionBtn: { width: '100%', background: '#047857', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.3)' },
  receiptCard: { width: '320px', background: '#fff', padding: '24px', borderRadius: '16px', textAlign: 'left', fontFamily: 'monospace', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
};