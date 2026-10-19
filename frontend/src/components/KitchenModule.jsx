import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function KitchenModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKitchenOrders = () => {
    fetch(`${API_BASE_URL}/api/v1/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Kitchen orders fetch error:", err);
        setError("Failed to load kitchen orders");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 10000); // Live poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (orderId, newStatus) => {
    // 1. Instantly update UI state so it never reverts or jumps back
    setOrders(prev => prev.map(o => {
      const oid = o.id || o.orderId || o.displayId;
      if (oid === orderId || o.displayId === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));

    // 2. Send standard REST update to backend (PUT /api/v1/orders/:id)
    fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {
      // Fallback patch attempt
      fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(() => {});
    });
  };

  const handleDeleteOrder = (orderId) => {
    // 1. Instantly remove from local UI state
    setOrders(prev => prev.filter(o => {
      const oid = o.id || o.orderId || o.displayId;
      return oid !== orderId && o.displayId !== orderId;
    }));

    // 2. Background delete request
    fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  // Filter only active kitchen orders (hide completed/delivered)
  const activeOrders = orders.filter(o => {
    const st = (o.status || 'Preparing').toLowerCase();
    return st !== 'completed' && st !== 'delivered' && st !== 'picked up';
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{margin: '0 0 4px 0', fontSize: '22px', fontWeight: '900', color: '#0f172a'}}>Kitchen Display System (KDS)</h2>
          <span style={{fontSize: '12px', color: '#64748b'}}>Live synchronized order preparation queue</span>
        </div>
        <button onClick={fetchKitchenOrders} style={styles.refreshBtn}>🔄 Refresh Queue</button>
      </div>

      {loading ? (
        <div style={styles.centerMsg}>Loading live kitchen orders...</div>
      ) : error ? (
        <div style={{...styles.centerMsg, color: '#dc2626'}}>{error}</div>
      ) : activeOrders.length === 0 ? (
        <div style={styles.centerMsg}>🎉 All kitchen orders are completed! Queue is empty.</div>
      ) : (
        <div style={styles.kanbanGrid}>
          {activeOrders.map((o, idx) => {
            const orderId = o.id || o.orderId || o.displayId;
            const displayId = o.displayId || `#ORD-${idx+1}`;
            const customerName = o.customer || o.customerName || 'Walk-In Guest';
            const orderType = o.type || o.orderType || 'Dine-In';
            const channel = o.channel || 'COUNTER';
            const status = o.status || 'Preparing';
            const specialNote = o.customerRequest || o.specialNote || '';
            const items = o.items || [];

            return (
              <div key={orderId || idx} style={styles.orderCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.displayIdBadge}>{displayId}</span>
                    <span style={styles.channelBadge}>{channel}</span>
                  </div>
                  <span style={styles.orderTypeBadge}>{orderType}</span>
                </div>

                <div style={styles.customerInfoBox}>
                  <div style={{fontWeight: '800', color: '#0f172a', fontSize: '14px'}}>{customerName}</div>
                  <div style={{fontSize: '11px', color: '#64748b'}}>{o.phone || o.customerPhone || ''}</div>
                </div>

                {specialNote && (
                  <div style={styles.noteBox}>
                    <span style={{fontWeight: '800', color: '#d97706'}}>📝 Special Note:</span> {specialNote}
                  </div>
                )}

                <div style={styles.itemsList}>
                  {items.map((it, iIdx) => (
                    <div key={iIdx} style={styles.itemRow}>
                      <span style={styles.itemQty}>{it.quantity || it.qty || 1}x</span>
                      <span style={styles.itemName}>{it.itemName || it.name}</span>
                      {it.itemDescription && (
                        <span style={styles.itemDesc}>({it.itemDescription})</span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={styles.cardFooter}>
                  <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                    {status === 'Preparing' && (
                      <button 
                        onClick={() => handleUpdateStatus(orderId, 'Ready')}
                        style={styles.readyBtn}
                      >
                        ✅ Mark Ready
                      </button>
                    )}
                    {status === 'Ready' && (
                      <button 
                        onClick={() => handleUpdateStatus(orderId, 'Completed')}
                        style={styles.completeBtn}
                      >
                        🚀 Complete Order
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteOrder(orderId)}
                      style={styles.clearCardBtn}
                      title="Clear / Dismiss"
                    >
                      🗑️
                    </button>
                  </div>
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
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', backgroundColor: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  refreshBtn: { backgroundColor: '#fff', border: '1.5px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', color: '#334155' },
  centerMsg: { textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px', fontWeight: '600' },
  kanbanGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  orderCard: { backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', textAlign: 'left' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  displayIdBadge: { backgroundColor: '#0f172a', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', marginRight: '6px' },
  channelBadge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
  orderTypeBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  customerInfoBox: { backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #f1f5f9' },
  noteBox: { backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', color: '#b45309' },
  itemsList: { flex: 1, marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
  itemQty: { fontWeight: '900', color: '#047857', minWidth: '24px' },
  itemName: { fontWeight: '700', color: '#0f172a', flex: 1 },
  itemDesc: { fontSize: '11px', color: '#d97706', fontStyle: 'italic' },
  cardFooter: { borderTop: '1px solid #f1f5f9', paddingTop: '12px' },
  readyBtn: { flex: 1, backgroundColor: '#047857', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(4,120,87,0.2)' },
  completeBtn: { flex: '1', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' },
  clearCardBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }
};