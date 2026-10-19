import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function KitchenModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
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
          const activeOrders = data.filter(o => {
            const st = (o.status || 'Preparing').toUpperCase();
            return st !== 'READY' && st !== 'COMPLETED' && st !== 'PICKED UP';
          });

          if (activeOrders.length === 0 && data.length === 0) {
            setOrders([
              {
                id: 1,
                displayId: '#KO-0042',
                customerName: 'Rahul Sharma',
                orderType: 'Dine-In',
                channel: 'WhatsApp',
                deliveryAddress: 'Table T2',
                orderNotes: 'Burger without mayo. Kid\'s portion — cut into halves.',
                timeAgo: '12m ago',
                status: 'Preparing',
                items: [
                  { itemName: 'Chicken Fillet Burger Combo', quantity: 2, itemDescription: 'No mayo on side' },
                  { itemName: 'Sprite', quantity: 2, itemDescription: '' }
                ]
              },
              {
                id: 2,
                displayId: '#POS-1002',
                customerName: 'Priya Patel',
                orderType: 'COUNTER',
                channel: 'Counter POS',
                deliveryAddress: 'Walk-In Counter',
                orderNotes: 'Customer is allergic to peanuts. Extra spicy.',
                timeAgo: '4m ago',
                status: 'Preparing',
                items: [
                  { itemName: 'Chicken Drumsticks', quantity: 2, itemDescription: 'Spicy · Serves 1' },
                  { itemName: 'Paneer Tikka Roll', quantity: 1, itemDescription: 'Extra mint chutney' }
                ]
              }
            ]);
          } else {
            setOrders(activeOrders);
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
        setOrders(orders.filter(o => o.id !== id && o.displayId !== id && o.orderId !== id));
      })
      .catch(() => {
        setOrders(orders.filter(o => o.id !== id && o.displayId !== id && o.orderId !== id));
      });
  };

  const handlePrintKOT = () => window.print();

  // Filter orders based on selected tab
  const filteredOrders = orders.filter(o => {
    const ch = (o.channel || o.orderType || '').toUpperCase();
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ONLINE') return ch.includes('WHATSAPP') || ch.includes('ZOMATO') || ch.includes('SWIGGY') || ch.includes('ONLINE');
    if (activeFilter === 'COUNTER') return ch.includes('COUNTER') || ch.includes('POS') || ch.includes('WALK');
    if (activeFilter === 'DINE-IN') return ch.includes('DINE') || ch.includes('TABLE');
    return true;
  });

  return (
    <div style={styles.container}>
      
      {/* Header Bar */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em'}}>Kitchen Display System (KDS)</h2>
          <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500'}}>Live incoming orders sorted across all channels</p>
        </div>

        {/* Channel Filter Pills */}
        <div style={styles.filterBar}>
          {[
            { key: 'ALL', label: `All (${orders.length})` },
            { key: 'ONLINE', label: '🌐 Online' },
            { key: 'COUNTER', label: '💳 Counter POS' },
            { key: 'DINE-IN', label: '🪑 Dine-In' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                ...styles.filterTabBtn,
                ...(activeFilter === tab.key ? styles.filterTabActive : {})
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span style={styles.statusPill}>🔥 {filteredOrders.length} Active Orders in Queue</span>
        <span style={{color: '#94a3b8'}}>•</span>
        <span style={{color: '#475569', fontWeight: '600'}}>Auto-syncing every 5 seconds</span>
      </div>

      {/* Kitchen Ticket Cards Grid */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '14px', fontWeight: '600'}}>Synchronizing live kitchen tickets...</div>
      ) : filteredOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{fontSize: '48px', marginBottom: '12px'}}>✨</span>
          <h3 style={{margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>No orders in this category!</h3>
          <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>Kitchen is fully caught up with incoming tickets.</p>
        </div>
      ) : (
        <div style={styles.ticketsGrid}>
          {filteredOrders.map((order, idx) => {
            const orderId = order.id || order.orderId || idx;
            const displayId = order.displayId || order.id || `#KOT-${idx + 1}`;
            const customerName = order.customerName || 'Valued Guest';
            const channel = order.channel || order.orderType || 'Online';
            const isCardHovered = hoveredCard === orderId;

            // Channel badge styling helper
            const getChannelBadgeStyle = (ch) => {
              const upper = ch.toUpperCase();
              if (upper.includes('WHATSAPP')) return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0', icon: '🟢' };
              if (upper.includes('ZOMATO')) return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', icon: '🔴' };
              if (upper.includes('SWIGGY')) return { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa', icon: '🟠' };
              if (upper.includes('COUNTER') || upper.includes('POS')) return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', icon: '💳' };
              return { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1', icon: '🍽️' };
            };

            const badgeInfo = getChannelBadgeStyle(channel);

            return (
              <div 
                key={orderId}
                onMouseEnter={() => setHoveredCard(orderId)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  ...styles.ticketCard,
                  borderColor: isCardHovered ? '#047857' : '#cbd5e1',
                  transform: isCardHovered ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isCardHovered ? '0 16px 30px -10px rgba(4,120,87,0.15)' : '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                {/* Ticket Header */}
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px'}}>
                    <div>
                      <div style={{fontSize: '17px', fontWeight: '900', color: '#0f172a', marginBottom: '4px'}}>{displayId}</div>
                      <div style={{fontSize: '13px', fontWeight: '800', color: '#047857'}}>👤 {customerName}</div>
                    </div>
                    <span style={styles.timeBadge}>🕒 {order.timeAgo || 'Just now'}</span>
                  </div>

                  {/* Channel & Location Tags */}
                  <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px'}}>
                    <span style={{
                      backgroundColor: badgeInfo.bg, 
                      color: badgeInfo.color, 
                      border: `1px solid ${badgeInfo.border}`, 
                      padding: '3px 9px', 
                      borderRadius: '6px', 
                      fontSize: '11.5px', 
                      fontWeight: '800'
                    }}>
                      {badgeInfo.icon} {channel}
                    </span>
                    <span style={styles.locationBadge}>
                      📍 {order.deliveryAddress || order.orderType || 'Counter'}
                    </span>
                  </div>
                </div>

                {/* Special Instructions Box */}
                {order.orderNotes && (
                  <div style={styles.orderNotesBox}>
                    <div style={{fontSize: '10px', fontWeight: '900', color: '#b45309', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.05em'}}>⚠️ Special Instructions</div>
                    <div style={{fontSize: '12.5px', color: '#78350f', fontWeight: '700', lineHeight: '1.4'}}>{order.orderNotes}</div>
                  </div>
                )}

                {/* Items List */}
                <div style={styles.itemsList}>
                  {order.items && order.items.map((it, i) => (
                    <div key={i} style={{marginBottom: i === order.items.length - 1 ? 0 : '10px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14.5px', fontWeight: '900', color: '#0f172a'}}>
                        <span>{it.itemName || it.name}</span>
                        <span style={{color: '#047857', background: '#ecfdf5', padding: '1px 8px', borderRadius: '6px', fontSize: '13px'}}>×{it.quantity || it.qty || 1}</span>
                      </div>
                      {(it.itemDescription || it.desc) && (
                        <div style={{fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: '600'}}>{it.itemDescription || it.desc}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={styles.ticketActions}>
                  <button onClick={handlePrintKOT} style={styles.printKotBtn}>🖨️ KOT</button>
                  <button 
                    onClick={() => handleMarkReady(orderId)}
                    onMouseEnter={() => setHoveredBtn(orderId)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      ...styles.readyBtn,
                      backgroundColor: hoveredBtn === orderId ? '#065f46' : '#047857',
                      transform: hoveredBtn === orderId ? 'scale(1.01)' : 'scale(1)'
                    }}
                  >
                    Mark Ready ✓
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
  container: { padding: '24px 30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto', paddingBottom: '90px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '15px' },
  filterBar: { display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '10px' },
  filterTabBtn: { background: 'transparent', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' },
  filterTabActive: { background: '#fff', color: '#0f172a', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' },
  statusBar: { fontSize: '13px', color: '#334155', fontWeight: '700', marginBottom: '22px', display: 'flex', gap: '8px', alignItems: 'center' },
  statusPill: { background: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: '1px solid #a7f3d0' },
  ticketsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' },
  ticketCard: { background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s ease' },
  locationBadge: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800' },
  timeBadge: { background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  orderNotesBox: { background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px' },
  itemsList: { flex: 1, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '12px 0', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  ticketActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  printKotBtn: { background: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '10px 14px', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  readyBtn: { flex: 1, color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  emptyState: { textAlign: 'center', padding: '70px 20px', background: '#fff', borderRadius: '16px', border: '2px dashed #cbd5e1' }
};