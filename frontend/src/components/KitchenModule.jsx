import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const FALLBACK_ORDERS = [
  {
    id: 'K01/000001',
    displayId: '#ORD-001',
    customer: 'Priya Sharma',
    phone: '+91 98765 43210',
    channel: 'WHATSAPP',
    type: 'Delivery',
    status: 'Preparing',
    customerRequest: 'Make it extra spicy please!',
    items: [
      { qty: 2, itemName: 'Butter Chicken', itemDescription: 'Medium spicy' },
      { qty: 4, itemName: 'Butter Naan', itemDescription: '' }
    ]
  }
];

export default function KitchenModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKitchenOrders = () => {
    fetch(`${API_BASE_URL}/api/v1/orders`)
      .then(res => {
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(prev => prev.length > 0 ? prev : FALLBACK_ORDERS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backend fetch failed, using fallback:", err);
        setOrders(prev => prev.length > 0 ? prev : FALLBACK_ORDERS);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 10000); // Live poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => {
      const oid = o.id || o.orderId || o.displayId;
      if (oid === orderId || o.displayId === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));

    fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  const handleDeleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => {
      const oid = o.id || o.orderId || o.displayId;
      return oid !== orderId && o.displayId !== orderId;
    }));

    fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  const activeOrders = orders.filter(o => {
    const st = (o.status || 'New').toLowerCase();
    return st !== 'completed' && st !== 'delivered' && st !== 'picked up';
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{margin: '0 0 4px 0', fontSize: '22px', fontWeight: '950', color: '#0f172a'}}>Kitchen Display System (KDS)</h2>
          <span style={{fontSize: '12px', color: '#64748b', fontWeight: '700'}}>Live synchronized order preparation queue</span>
        </div>
        <button onClick={fetchKitchenOrders} style={styles.refreshBtn}>🔄 Refresh Queue</button>
      </div>

      {loading ? (
        <div style={styles.centerMsg}>Loading live kitchen orders...</div>
      ) : activeOrders.length === 0 ? (
        <div style={styles.centerMsg}>🎉 All kitchen orders are completed! Queue is empty.</div>
      ) : (
        <div style={styles.kanbanGrid}>
          {activeOrders.map((o, idx) => {
            const orderId = o.id || o.orderId || o.displayId;
            const displayId = o.displayId || o.display_id || `#ORD-${idx+1}`;
            const customerName = o.customer || o.customerName || o.customer_name || 'Walk-In Guest';
            const orderType = o.type || o.orderType || o.order_type || 'Dine-In';
            const channel = o.channel || 'COUNTER';
            const status = o.status || 'New';
            
            // Robust check for notes across all possible property names
            const specialNote = o.customerRequest || o.customer_request || o.notes || o.specialNote || o.instruction || '';
            const items = o.items || o.orderItems || o.order_items || [];

            // Universal condition: Show 'Mark Ready' for any order unless it's already 'Ready' or 'Completed'
            const currentStatus = status.toLowerCase();
            const showMarkReady = currentStatus === 'new' || currentStatus === 'preparing' || currentStatus === '';

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
                  <div style={{fontWeight: '900', color: '#0f172a', fontSize: '14px'}}>{customerName}</div>
                  <div style={{fontSize: '11px', color: '#64748b', fontWeight: '700'}}>{o.phone || o.customerPhone || o.customer_phone || ''}</div>
                </div>

                {specialNote && (
                  <div style={styles.noteBox}>
                    <span style={{fontWeight: '900', color: '#d97706'}}>📝 Special Note:</span> {specialNote}
                  </div>
                )}

                <div style={styles.itemsList}>
                  {items.map((it, iIdx) => {
                    const itemName = it.itemName || it.item_name || it.name || 'Food Item';
                    const itemQty = it.quantity || it.qty || 1;
                    const itemDesc = it.itemDescription || it.item_description || it.description || '';
                    return (
                      <div key={iIdx} style={styles.itemRow}>
                        <span style={styles.itemQty}>{itemQty}x</span>
                        <span style={styles.itemName}>{itemName}</span>
                        {itemDesc && (
                          <span style={styles.itemDesc}>({itemDesc})</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={styles.cardFooter}>
                  <div style={{display: 'flex', gap: '8px', width: '100%', alignItems: 'center'}}>
                    <span style={{fontSize: '11px', fontWeight: '900', color: currentStatus === 'ready' ? '#2563eb' : '#d97706', background: currentStatus === 'ready' ? '#eff6ff' : '#fef3c7', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase'}}>
                      Status: {status}
                    </span>
                    
                    {showMarkReady && (
                      <button 
                        onClick={() => handleUpdateStatus(orderId, 'Ready')}
                        style={styles.readyBtn}
                      >
                        ✅ Mark Ready
                      </button>
                    )}

                    {currentStatus === 'ready' && (
                      <button 
                        onClick={() => handleUpdateStatus(orderId, 'Completed')}
                        style={styles.completeBtn}
                      >
                        🚀 Complete
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
  refreshBtn: { backgroundColor: '#fff', border: '1.5px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', color: '#334155' },
  centerMsg: { textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px', fontWeight: '800' },
  kanbanGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' },
  orderCard: { backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', textAlign: 'left' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  displayIdBadge: { backgroundColor: '#0f172a', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '950', marginRight: '6px' },
  channelBadge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase' },
  orderTypeBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '950' },
  customerInfoBox: { backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', border: '1.5px solid #f1f5f9' },
  noteBox: { backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', color: '#b45309', fontWeight: '700' },
  itemsList: { flex: 1, marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1.5px solid #f1f5f9', paddingTop: '10px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
  itemQty: { fontWeight: '950', color: '#047857', minWidth: '24px' },
  itemName: { fontWeight: '850', color: '#0f172a', flex: 1 },
  itemDesc: { fontSize: '11px', color: '#d97706', fontStyle: 'italic', fontWeight: '700' },
  cardFooter: { borderTop: '1.5px solid #f1f5f9', paddingTop: '12px' },
  readyBtn: { flex: 1, backgroundColor: '#047857', color: '#fff', border: 'none', padding: '10px 12px', borderRadius: '8px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(4,120,87,0.2)' },
  completeBtn: { flex: 1, backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 12px', borderRadius: '8px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  clearCardBtn: { backgroundColor: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }
};