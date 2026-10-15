import React, { useState } from 'react';

export default function CounterPOS() {
  const [cart, setCart] = useState([]);
  const [orderType] = useState('EAT IN'); // Fixed mode, button removed
  const [hoveredId, setHoveredId] = useState(null);

  const menuItems = [
    { id: 1, name: 'Chicken Fillet Sandwich Combo', category: 'Combos', price: 289.00 },
    { id: 2, name: 'Chicken Fillet Burger Combo', category: 'Combos', price: 269.00 },
    { id: 3, name: 'Chicken Drumsticks', category: 'Starters', price: 199.00 },
    { id: 4, name: 'Chicken 65', category: 'Starters', price: 240.00 },
    { id: 5, name: 'Lucknowi Biryani', category: 'Biryanis', price: 320.00 },
    { id: 6, name: 'Egg Biryani', category: 'Biryanis', price: 225.00 },
    { id: 7, name: 'Veg Club Sandwich', category: 'Sandwiches', price: 159.00 },
    { id: 8, name: 'Garlic Bread', category: 'Sides', price: 115.00 },
    { id: 9, name: 'Sprite', category: 'Beverages', price: 60.00 },
    { id: 10, name: 'Cold Coffee', category: 'Beverages', price: 120.00 }
  ];

  const toggleItemSelection = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add items to print a receipt.');
      return;
    }
    window.print();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!');
    
    const newOrder = {
      displayId: '#KO01/' + Math.floor(100000 + Math.random() * 900000),
      customerName: 'Counter Walk-in',
      customerPhone: '0000000000',
      orderType: orderType === 'EAT IN' ? 'Dine-In' : 'Takeaway',
      channel: 'Direct',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      status: 'Preparing',
      subtotal: subtotal,
      totalAmount: total,
      items: cart.map(i => ({ itemName: i.name, quantity: i.qty, unitPrice: i.price }))
    };

    try {
      const res = await fetch('https://restaurant-backend-fphb.onrender.com/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        alert('Order placed successfully to Kitchen!');
        setCart([]);
      } else {
        alert('Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* Left: Menu Grid */}
      <div style={{ flex: 3, padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{orderType}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
          {menuItems.map(item => {
            const isSelected = cart.some(i => i.id === item.id);
            const isHovered = hoveredId === item.id;

            return (
              <div 
                key={item.id} 
                onClick={() => toggleItemSelection(item)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ 
                  background: '#fff', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  border: isSelected ? '2px solid #10b981' : isHovered ? '2px solid #cbd5e1' : '1px solid #e2e8f0', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease', 
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 6px 15px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{item.category}</div>
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    border: isSelected ? '2px solid #10b981' : '2px solid #cbd5e1', 
                    backgroundColor: isSelected ? '#10b981' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {isSelected ? '✓' : ''}
                  </div>
                </div>

                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px', minHeight: '40px', lineHeight: '1.3' }}>
                  {item.name}
                </div>

                <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981' }}>
                  ₹{item.price.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Current Order Cart */}
      <div style={{ flex: 1.5, background: '#fff', borderLeft: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Current Order</h3>
          <button 
            onClick={handlePrintReceipt}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#334155' }}
          >
            🖨️ Print Receipt
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
          {cart.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginTop: '60px' }}>
              Tap items or checkboxes to add them.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>₹{item.price.toFixed(2)} each</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} style={{ width: '24px', height: '24px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                  <span style={{ fontSize: '13px', fontWeight: '600', width: '20px', textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} style={{ width: '24px', height: '24px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              <span>GST (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              Place Order & Print KOT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}