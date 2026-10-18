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
          // Filter for active preparing/pending orders or show all recent orders
          const activeOrders = data.filter(o => (o.status || 'Preparing') !== 'Ready' && (o.status || 'Preparing') !== 'Completed');
          if (activeOrders.length === 0 && data.length === 0) {
            // Fallback sample data if backend is completely empty
            setOrders([
              {
                id: 1,
                displayId: '#2-0042',
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
    fetch(`${API_BASE_URL}/api/v1/orders/${id}`, {
      method: 'DELETE' // or update status endpoint if available
    })
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
        <h2 style={{margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a'}}>Kitchen</h2>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span>{orders.length} preparing</span> <span style={{color: '#94a3b8'}}>·</span> <span>Orders currently being prepared · oldest first</span>
      </div>

      {/* Kitchen Ticket Cards Grid */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '60px', color: '#64748b'}}>Loading active kitchen orders from backend...</div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{fontSize: '40px', marginBottom: '10px'}}>🎉</span>
          <h3 style={{margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>Kitchen is all caught up!</h3>
          <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>Place orders in Counter POS or Online Orders to see them appear here instantly.</p>
        </div>
      ) : (
        <div style={styles.ticketsGrid}>
          {orders.map((order, idx) => {
            const orderId = order.id || idx;
            const displayId = order.displayId || `#POS-${orderId}`;
            const isCardHovered = hoveredCard === orderId;

            return (
              <div 
                key={orderId}
                onMouseEnter={() => setHoveredCard(orderId)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  ...styles.ticketCard,
                  transform: isCardHovered ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isCardHovered ? '0 12px 30px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {/* Ticket Header */}
                <div style={styles.ticketHeader}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span style={{fontSize: '16px', fontWeight: '900', color: '#0f172a'}}>{displayId}</span>
                    <span style={order.orderType === 'Dine-In' ? styles.tableBadge : styles.deliveryBadge}>
                      {order.orderType === 'Dine-In' ? '🪑 ' : '🚴 '} {order.deliveryAddress || order.orderType || 'Counter'}
                    </span>
                  </div>
                  <span style={{fontSize: '12px', color: '#64748b', fontWeight: '700'}}>{order.timeAgo || 'Just now'}</span>
                </div>

                {/* Order Notes Banner */}
                {order.orderNotes && (
                  <div style={styles.orderNotesBox}>
                    <div style={{fontSize: '10px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', marginBottom: '2px'}}>Order Notes</div>
                    <div style={{fontSize: '12px', color: '#78350f', fontWeight: '600', lineHeight: '1.4'}}>{order.orderNotes}</div>
                  </div>
                )}

                {/* Items List */}
                <div style={styles.itemsList}>
                  {order.items && order.items.map((it, i) => (
                    <div key={i} style={{marginBottom: i === order.items.length - 1 ? 0 : '10px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px', fontWeight: '800', color: '#0f172a'}}>
                        <span>{it.itemName}</span>
                        <span style={{color: '#047857'}}>×{it.quantity}</span>
                      </div>
                      {it.itemDescription && (
                        <div style={{fontSize: '11px', color: '#64748b', marginTop: '1px'}}>{it.itemDescription}</div>
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
                      transform: hoveredBtn === orderId ? 'translateY(-1px) scale(1.01)' : 'translateY(0) scale(1)',
                      boxShadow: hoveredBtn === orderId ? '0 4px 12px rgba(4,120,87,0.3)' : 'none'
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
  container: { padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto', paddingBottom: '80px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  statusBar: { fontSize: '13px', color: '#334155', fontWeight: '700', marginBottom: '24px', display: 'flex', gap: '6px', alignItems: 'center' },
  ticketsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  ticketCard: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' },
  ticketHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  tableBadge: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  deliveryBadge: { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  orderNotesBox: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px' },
  itemsList: { flex: 1, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '12px 0', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  ticketActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  printKotBtn: { background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' },
  readyBtn: { flex: 1, color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  emptyState: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px', border: '1.5px dashed #cbd5e1' }
};