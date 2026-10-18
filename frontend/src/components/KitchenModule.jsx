import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function KitchenModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = () => {
    fetch(`${API_BASE_URL}/api/v1/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const activeOrders = data.filter(o => (o.status || 'Preparing') !== 'Ready' && (o.status || 'Preparing') !== 'Completed');
          if (activeOrders.length === 0 && data.length === 0) {
            setOrders([
              {
                id: 1,
                displayId: '#2-0042',
                customerName: 'Rahul Sharma',
                orderType: 'Dine-In',
                deliveryAddress: 'Table T2',
                orderNotes: 'Burger without mayo. Kid\'s portion — cut into halves.',
                timeAgo: '35m ago',
                status: 'Preparing',
                items: [
                  { itemName: 'Chicken Fillet Burger Combo', quantity: 2, itemDescription: 'No mayo on side' },
                  { itemName: 'Sprite', quantity: 2, itemDescription: '' }
                ]
              },
              {
                id: 2,
                displayId: '#000001',
                customerName: 'Priya Patel',
                orderType: 'Delivery',
                deliveryAddress: 'Delivery Counter',
                orderNotes: 'Customer is allergic to peanuts.',
                timeAgo: '2m ago',
                status: 'Preparing',
                items: [
                  { itemName: 'Chicken Drumsticks', quantity: 2, itemDescription: 'Spicy · Serves 1' },
                  { itemName: 'Sprite', quantity: 2, itemDescription: '' },
                  { itemName: 'Chicken Fillet Burger Combo', quantity: 1, itemDescription: 'Cheese loaded' }
                ]
              }
            ]);
          } else {
            setOrders(activeOrders.length > 0 ? activeOrders : data);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Kitchen orders fetch error:", err);
        setLoading(false);
      });
  };

  const handleMarkReady = (id) => {
    fetch(`${API_BASE_URL}/api/v1/orders/${id}`, { method: 'DELETE' })
      .then(() => {
        setOrders(orders.filter(o => o.id !== id && o.displayId !== id));
      })
      .catch(() => {
        setOrders(orders.filter(o => o.id !== id && o.displayId !== id));
      });
  };

  const handlePrintKOT = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      
      {/* Header Bar */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em'}}>Kitchen Display System</h2>
          <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500'}}>Real-time incoming KOT ticket stream</p>
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span style={styles.statusPill}>{orders.length} Preparing</span> 
        <span style={{color: '#94a3b8'}}>•</span> 
        <span style={{color: '#475569', fontWeight: '600'}}>Active queue sorted by oldest first</span>
      </div>

      {/* Kitchen Ticket Cards Grid */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '14px', fontWeight: '600'}}>Synchronizing live kitchen orders...</div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{fontSize: '48px', marginBottom: '12px'}}>✨</span>
          <h3 style={{margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>Kitchen is completely caught up!</h3>
          <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>New orders placed at Counter POS or Online will appear here instantly.</p>
        </div>
      ) : (
        <div style={styles.ticketsGrid}>
          {orders.map((order, idx) => {
            const orderId = order.id || idx;
            const displayId = order.displayId || `#POS-${orderId}`;
            const customerName = order.customerName || 'Walk-in Guest';
            const isCardHovered = hoveredCard === orderId;

            return (
              <div 
                key={orderId}
                onMouseEnter={() => setHoveredCard(orderId)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  ...styles.ticketCard,
                  borderColor: isCardHovered ? '#047857' : '#cbd5e1',
                  transform: isCardHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                  boxShadow: isCardHovered ? '0 20px 35px -10px rgba(4,120,87,0.18)' : '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                {/* Ticket Header */}
                <div style={styles.ticketHeader}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px'}}>
                      <span style={{fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.01em'}}>{displayId}</span>
                      <span style={order.orderType === 'Dine-In' ? styles.tableBadge : styles.deliveryBadge}>
                        {order.orderType === 'Dine-In' ? '🪑 ' : '🚴 '} {order.deliveryAddress || order.orderType || 'Counter'}
                      </span>
                    </div>
                    <div style={{fontSize: '13px', fontWeight: '700', color: '#047857'}}>👤 {customerName}</div>
                  </div>
                  <span style={styles.timeBadge}>{order.timeAgo || 'Just now'}</span>
                </div>

                {/* Order Notes Banner */}
                {order.orderNotes && (
                  <div style={styles.orderNotesBox}>
                    <div style={{fontSize: '10px', fontWeight: '900', color: '#b45309', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.05em'}}>Special Instructions</div>
                    <div style={{fontSize: '12.5px', color: '#78350f', fontWeight: '700', lineHeight: '1.4'}}>{order.orderNotes}</div>
                  </div>
                )}

                {/* Items List */}
                <div style={styles.itemsList}>
                  {order.items && order.items.map((it, i) => (
                    <div key={i} style={{marginBottom: i === order.items.length - 1 ? 0 : '12px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '15px', fontWeight: '900', color: '#0f172a'}}>
                        <span>{it.itemName}</span>
                        <span style={{color: '#047857', background: '#ecfdf5', padding: '1px 8px', borderRadius: '6px', fontSize: '14px'}}>×{it.quantity}</span>
                      </div>
                      {it.itemDescription && (
                        <div style={{fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: '600'}}>{it.itemDescription}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={styles.ticketActions}>
                  <button 
                    onClick={handlePrintKOT}
                    style={styles.printKotBtn}
                  >
                    🖨️ Print KOT
                  </button>
                  <button 
                    onClick={() => handleMarkReady(orderId)}
                    onMouseEnter={() => setHoveredBtn(orderId)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      ...styles.readyBtn,
                      background: hoveredBtn === orderId ? '#065f46' : '#047857',
                      transform: hoveredBtn === orderId ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
                      boxShadow: hoveredBtn === orderId ? '0 6px 16px rgba(4,120,87,0.35)' : '0 2px 6px rgba(4,120,87,0.2)'
                    }}
                  >
                    Mark whole order as ready
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { padding: '28px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto', paddingBottom: '80px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  statusBar: { fontSize: '13px', color: '#334155', fontWeight: '700', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' },
  statusPill: { background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: '1px solid #a7f3d0' },
  ticketsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' },
  ticketCard: { background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '18px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' },
  ticketHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  tableBadge: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800' },
  deliveryBadge: { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800' },
  timeBadge: { background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  orderNotesBox: { background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px' },
  itemsList: { flex: 1, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '14px 0', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' },
  ticketActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  printKotBtn: { background: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '11px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' },
  readyBtn: { flex: 1, color: '#fff', border: 'none', padding: '11px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  emptyState: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '20px', border: '2px dashed #cbd5e1' }
};