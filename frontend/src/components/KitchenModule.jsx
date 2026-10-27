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
    const userEmail = localStorage.getItem('userEmail') || '';
    
    // ✅ Strictly fetch orders filtered by logged-in user email
    fetch(`${API_BASE_URL}/api/v1/orders?email=${userEmail}`)
      .then(res => {
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders([]); // Set empty for new accounts instead of global fallback
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backend fetch failed:", err);
        setOrders([]);
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
    <div className="kds">
      <style>{css}</style>

      <div className="kds-header">
        <div className="kds-heading">
          <h2 className="kds-title">
            Kitchen Display System (KDS)
            <span className="kds-live" aria-hidden="true" />
          </h2>
          <span className="kds-subtitle">Live synchronized order preparation queue for your account</span>
        </div>
        <button onClick={fetchKitchenOrders} className="kds-refresh">
          <span className="kds-refresh-icon">🔄</span> Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="kds-center">
          <span className="kds-spinner" aria-hidden="true" />
          Loading live kitchen orders...
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="kds-center kds-empty">🎉 All kitchen orders are completed! Queue is empty.</div>
      ) : (
        <div className="kds-grid">
          {activeOrders.map((o, idx) => {
            const orderId = o.id || o.orderId || o.displayId;
            const displayId = o.displayId || o.display_id || `#ORD-${idx+1}`;
            const customerName = o.customer || o.customerName || o.customer_name || 'Walk-In Guest';
            const orderType = o.type || o.orderType || o.order_type || 'Dine-In';
            const channel = o.channel || 'COUNTER';
            const status = o.status || 'New';
            
            const specialNote = o.customerRequest || o.customer_request || o.notes || o.specialNote || o.instruction || '';
            const items = o.items || o.orderItems || o.order_items || [];

            const currentStatus = status.toLowerCase();
            const showMarkReady = currentStatus === 'new' || currentStatus === 'preparing' || currentStatus === '';

            return (
              <div
                key={orderId || idx}
                className={`kds-card ${currentStatus === 'ready' ? 'is-ready' : 'is-cooking'}`}
              >
                <div className="kds-card-header">
                  <div className="kds-badges">
                    <span className="kds-id">{displayId}</span>
                    <span className="kds-channel">{channel}</span>
                  </div>
                  <span className="kds-type">{orderType}</span>
                </div>

                <div className="kds-customer">
                  <div className="kds-customer-name">{customerName}</div>
                  <div className="kds-customer-phone">{o.phone || o.customerPhone || o.customer_phone || ''}</div>
                </div>

                {specialNote && (
                  <div className="kds-note">
                    <span className="kds-note-label">📝 Special Note:</span> {specialNote}
                  </div>
                )}

                <div className="kds-items">
                  {items.map((it, iIdx) => {
                    const itemName = it.itemName || it.item_name || it.name || 'Food Item';
                    const itemQty = it.quantity || it.qty || 1;
                    const itemDesc = it.itemDescription || it.item_description || it.description || '';
                    return (
                      <div key={iIdx} className="kds-item">
                        <span className="kds-item-qty">{itemQty}x</span>
                        <span className="kds-item-name">{itemName}</span>
                        {itemDesc && (
                          <span className="kds-item-desc">({itemDesc})</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="kds-footer">
                  <div className="kds-actions">
                    <span className="kds-status">
                      Status: {status}
                    </span>
                    
                    {showMarkReady && (
                      <button 
                        onClick={() => handleUpdateStatus(orderId, 'Ready')}
                        className="kds-btn kds-btn-ready"
                      >
                        ✅ Mark Ready
                      </button>
                    )}

                    {currentStatus === 'ready' && (
                      <button 
                        onClick={() => handleUpdateStatus(orderId, 'Completed')}
                        className="kds-btn kds-btn-complete"
                      >
                        🚀 Complete
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteOrder(orderId)}
                      className="kds-btn-clear"
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

/* ---------- Styles (frontend only) ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

.kds {
  --ink: #111827;
  --ink-soft: #4b5563;
  --ink-faint: #6b7280;
  --line: #e5e7eb;
  --surface: #ffffff;
  --canvas: #f3f5f9;
  --cooking: #d97706;
  --cooking-bg: #fef3c7;
  --ready: #2563eb;
  --ready-bg: #dbeafe;
  --go: #059669;
  --go-dark: #047857;

  display: flex;
  flex-direction: column;
  flex: 1;
  padding: clamp(16px, 3vw, 32px);
  box-sizing: border-box;
  overflow-y: auto;
  font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(900px 420px at 100% -10%, rgba(37, 99, 235, 0.07), transparent 60%),
    radial-gradient(700px 380px at -10% 0%, rgba(5, 150, 105, 0.06), transparent 60%),
    var(--canvas);
}
.kds *, .kds *::before, .kds *::after { box-sizing: border-box; }

/* Header */
.kds-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.kds-title {
  margin: 0 0 4px 0;
  font-size: clamp(20px, 2.6vw, 26px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 10px;
}
.kds-subtitle { font-size: 13px; color: var(--ink-faint); font-weight: 600; }

.kds-live {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--go);
  box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.5);
  animation: kds-pulse 2s infinite;
  flex-shrink: 0;
}
@keyframes kds-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.5); }
  70%  { box-shadow: 0 0 0 9px rgba(5, 150, 105, 0); }
  100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
}

.kds-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  color: var(--ink);
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.kds-refresh:hover {
  transform: translateY(-1px);
  border-color: #c7d2fe;
  background: #f8faff;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.12);
}
.kds-refresh:hover .kds-refresh-icon { transform: rotate(180deg); }
.kds-refresh:active { transform: translateY(0) scale(0.98); }
.kds-refresh-icon { display: inline-block; transition: transform 0.4s ease; }

/* Loading / empty */
.kds-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  margin: 24px auto;
  padding: 56px 24px;
  width: 100%;
  max-width: 520px;
  color: var(--ink-soft);
  font-size: 15px;
  font-weight: 700;
  background: var(--surface);
  border: 1px dashed #cbd5e1;
  border-radius: 20px;
}
.kds-spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--line);
  border-top-color: var(--ready);
  animation: kds-spin 0.8s linear infinite;
}
@keyframes kds-spin { to { transform: rotate(360deg); } }

/* Grid */
.kds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 22px;
}

/* Order card: left stripe shows status */
.kds-card {
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 20px 20px 18px 24px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04), 0 8px 24px -12px rgba(17, 24, 39, 0.12);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.kds-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 6px;
  background: var(--cooking);
  transition: background 0.3s ease;
}
.kds-card.is-ready::before { background: var(--ready); }
.kds-card:hover {
  transform: translateY(-4px);
  border-color: #d1d9e6;
  box-shadow: 0 2px 4px rgba(17, 24, 39, 0.05), 0 18px 36px -14px rgba(17, 24, 39, 0.22);
}

.kds-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.kds-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.kds-id {
  background: var(--ink);
  color: #fff;
  padding: 5px 11px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
}
.kds-channel {
  background: #e0f2fe;
  color: #0369a1;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
}
.kds-type {
  background: #dcfce7;
  color: #15803d;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.kds-customer {
  background: #f8fafc;
  padding: 11px 14px;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #eef2f7;
}
.kds-customer-name { font-weight: 800; color: var(--ink); font-size: 15px; }
.kds-customer-phone { font-size: 12px; color: var(--ink-faint); font-weight: 600; margin-top: 2px; }
.kds-customer-phone:empty { display: none; }

.kds-note {
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.45;
  margin-bottom: 12px;
  color: #92400e;
  font-weight: 600;
}
.kds-note-label { font-weight: 800; color: #b45309; }

/* Items */
.kds-items {
  flex: 1;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid var(--line);
  padding-top: 12px;
}
.kds-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  padding: 7px 8px;
  margin: 0 -8px;
  border-radius: 10px;
  transition: background 0.15s ease;
}
.kds-item:hover { background: #f1f5f9; }
.kds-item-qty {
  font-weight: 800;
  color: var(--go-dark);
  background: #d1fae5;
  min-width: 34px;
  text-align: center;
  padding: 3px 6px;
  border-radius: 7px;
  font-size: 13px;
}
.kds-item-name { font-weight: 700; color: var(--ink); flex: 1; }
.kds-item-desc { font-size: 12px; color: var(--cooking); font-style: italic; font-weight: 600; }

/* Footer + actions */
.kds-footer { border-top: 1px solid var(--line); padding-top: 14px; }
.kds-actions { display: flex; gap: 8px; width: 100%; align-items: center; flex-wrap: wrap; }

.kds-status {
  font-size: 12px;
  font-weight: 800;
  color: var(--cooking);
  background: var(--cooking-bg);
  padding: 6px 10px;
  border-radius: 8px;
  white-space: nowrap;
  transition: background 0.3s ease, color 0.3s ease;
}
.kds-card.is-ready .kds-status { color: var(--ready); background: var(--ready-bg); }

.kds-btn {
  flex: 1;
  min-width: 120px;
  font-family: inherit;
  color: #fff;
  border: none;
  padding: 11px 14px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}
.kds-btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.kds-btn:active { transform: translateY(0) scale(0.97); }

.kds-btn-ready {
  background: linear-gradient(135deg, #10b981, #047857);
  box-shadow: 0 4px 12px rgba(4, 120, 87, 0.28);
}
.kds-btn-ready:hover { box-shadow: 0 10px 20px rgba(4, 120, 87, 0.35); }

.kds-btn-complete {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);
}
.kds-btn-complete:hover { box-shadow: 0 10px 20px rgba(37, 99, 235, 0.35); }

.kds-btn-clear {
  font-family: inherit;
  background: #f1f5f9;
  border: 1px solid var(--line);
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}
.kds-btn-clear:hover { background: #fee2e2; border-color: #fca5a5; transform: translateY(-2px); }
.kds-btn-clear:active { transform: translateY(0) scale(0.95); }

/* Keyboard focus */
.kds-refresh:focus-visible,
.kds-btn:focus-visible,
.kds-btn-clear:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.45);
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .kds-header { margin-bottom: 20px; }
  .kds-refresh { width: 100%; justify-content: center; }
  .kds-grid { gap: 16px; }
  .kds-card { padding: 16px 16px 16px 20px; }
  .kds-btn { min-width: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .kds *, .kds *::before, .kds *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;