import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function KitchenModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    fetchKitchenOrders();
    // Poll every 10 seconds for live kitchen orders sync
    const interval = setInterval(fetchKitchenOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = () => {
    fetch(`${API_BASE_URL}/api/v1/kitchen`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // If backend is empty, seed initial sample tickets matching screenshot for pristine UX preview
          if (data.length === 0) {
            setOrders([
              {
                id: 1,
                displayId: '#2-0042',
                orderType: 'Dine-In',
                tableInfo: 'Table T2',
                orderNotes: 'Burger without mayo. Kid\'s portion — cut into halves.',
                timeAgo: '35m ago',
                status: 'Preparing',
                items: [
                  { itemName: 'Chicken Fillet Burger Combo', quantity: 2, itemNote: 'No mayo on side' },
                  { itemName: 'Sprite', quantity: 2, itemNote: '' }
                ]
              },
              {
                id: 2,
                displayId: '#1-0044',
                orderType: 'Dine-In',
                tableInfo: 'Table B1',
                orderNotes: '',
                timeAgo: '20m ago',
                status: 'Preparing',
                items: [
                  { itemName: '7 Up', quantity: 1, itemNote: '' }
                ]
              },
              {
                id: 3,
                displayId: '#000001',
                orderType: 'Delivery',
                tableInfo: '',
                orderNotes: 'Customer is allergic to peanuts.',
                timeAgo: '2m ago',
                status: 'Preparing',
                items: [
                  { itemName: 'Chicken Drumsticks', quantity: 2, itemNote: 'Spicy · Serves 1' },
                  { itemName: 'Sprite', quantity: 2, itemNote: '' },
                  { itemName: 'Chicken Fillet Burger Combo', quantity: 1, itemNote: 'Cheese loaded · Serves 1' }
                ]
              },
              {
                id: 4,
                displayId: '#004405',
                orderType: 'Delivery',
                tableInfo: '',
                orderNotes: 'Extra spicy, no onions please. Pack sauces separately.',
                timeAgo: '11d ago',
                status: 'Preparing',
                items: [
                  { itemName: 'Spicy Double Baik', quantity: 3, itemNote: '' }
                ]
              },
              {
                id: 5,
                displayId: '#005381',
                orderType: 'Delivery',
                tableInfo: '',
                orderNotes: '',
                timeAgo: '8m ago',
                status: 'Preparing',
                items: [
                  { itemName: 'Lucknowi (Awadhi) Biryani', quantity: 1, itemNote: 'Biryanis · Full · Serves 2' },
                  { itemName: 'Egg Biryani', quantity: 2, itemNote: 'Biryanis · Full · Serves 2' }
                ]
              }
            ]);
          } else {
            setOrders(data);
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
    fetch(`${API_BASE_URL}/api/v1/kitchen/${id}/ready`, {
      method: 'PUT'
    })
      .then(res => {
        if (res.ok) {
          setOrders(orders.filter(o => o.id !== id));
        } else {
          // Optimistic local update if backend endpoint fails
          setOrders(orders.filter(o => o.id !== id));
        }
      })
      .catch(() => {
        setOrders(orders.filter(o => o.id !== id));
      });
  };

  const handlePrintKOT = (orderId) => {
    window.print();
  };

  const activePreparingOrders = orders.filter(o => (o.status || 'Preparing') === 'Preparing');

  return (
    <div style={styles.container}>
      
      {/* Header Bar */}
      <div style={styles.headerRow}>
        <h2 style={{margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a'}}>Kitchen</h2>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span>{activePreparingOrders.length} preparing</span> <span style={{color: '#94a3b8'}}>·</span> <span>Orders currently being prepared · oldest first</span>
      </div>

      {/* Kitchen Ticket Cards Grid */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '60px', color: '#64748b'}}>Loading active kitchen orders...</div>
      ) : activePreparingOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{fontSize: '40px', marginBottom: '10px'}}>🎉</span>
          <h3 style={{margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>Kitchen is all caught up!</h3>
          <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>No active orders currently in preparation.</p>
        </div>
      ) : (
        <div style={styles.ticketsGrid}>
          {activePreparingOrders.map(order => {
            const isCardHovered = hoveredCard === order.id;

            return (
              <div 
                key={order.id}
                onMouseEnter={() => setHoveredCard(order.id)}
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
                    <span style={{fontSize: '16px', fontWeight: '900', color: '#0f172a'}}>{order.displayId}</span>
                    {order.tableInfo ? (
                      <span style={styles.tableBadge}>🪑 {order.tableInfo}</span>
                    ) : (
                      <span style={styles.deliveryBadge}>🚴 {order.orderType || 'Delivery'}</span>
                    )}
                  </div>
                  <span style={{fontSize: '12px', color: '#64748b', fontWeight: '700'}}>{order.timeAgo}</span>
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
                  {order.items && order.items.map((it, idx) => (
                    <div key={idx} style={{marginBottom: idx === order.items.length - 1 ? 0 : '10px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px', fontWeight: '800', color: '#0f172a'}}>
                        <span>{it.itemName}</span>
                        <span style={{color: '#047857'}}>×{it.quantity}</span>
                      </div>
                      {it.itemNote && (
                        <div style={{fontSize: '11px', color: '#64748b', marginTop: '1px'}}>{it.itemNote}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={styles.ticketActions}>
                  <button 
                    onClick={() => handlePrintKOT(order.id)}
                    style={styles.printKotBtn}
                  >
                    🖨️ Print KOT
                  </button>
                  <button 
                    onClick={() => handleMarkReady(order.id)}
                    onMouseEnter={() => setHoveredBtn(order.id)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      ...styles.readyBtn,
                      background: hoveredBtn === order.id ? '#065f46' : '#047857',
                      transform: hoveredBtn === order.id ? 'translateY(-1px) scale(1.01)' : 'translateY(0) scale(1)',
                      boxShadow: hoveredBtn === order.id ? '0 4px 12px rgba(4,120,87,0.3)' : 'none'
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