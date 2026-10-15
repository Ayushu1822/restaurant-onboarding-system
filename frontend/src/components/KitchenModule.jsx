import React, { useState, useEffect } from 'react';

export default function KitchenModule() {
  const [kitchenOrders, setKitchenOrders] = useState([]);

  useEffect(() => {
    fetch('https://restaurant-backend-fphb.onrender.com/api/v1/orders')
      .then(res => res.json())
      .then(data => {
        const active = data.filter(o => ['Preparing', 'Accepted', 'New'].includes(o.status));
        setKitchenOrders(active);
      })
      .catch(err => console.error('Error fetching kitchen orders:', err));
  }, []);

  const markOrderReady = async (orderId) => {
    try {
      await fetch(`https://restaurant-backend-fphb.onrender.com/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Ready' })
      });
      setKitchenOrders(prev => prev.filter(o => o.orderId !== orderId));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Kitchen</h2>
        <div style={{ background: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
          {kitchenOrders.length} active orders in queue
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {kitchenOrders.map(order => (
          <div key={order.orderId} style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>{order.displayId}</span>
              <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>{order.orderType}</span>
            </div>

            {order.deliveryAddress && (
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '8px', borderRadius: '6px', fontSize: '12px', color: '#92400e', marginBottom: '12px' }}>
                <strong>Order Notes:</strong> {order.deliveryAddress}
              </div>
            )}

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '16px' }}>
              {order.items && order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px', color: '#334155' }}>
                  <span>{item.itemName}</span>
                  <strong style={{ color: '#0f172a' }}>×{item.quantity}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: '#334155' }} onClick={() => alert('Printing KOT...')}>Print KOT</button>
              <button style={{ flex: 2, padding: '10px', background: '#10b981', border: 'none', borderRadius: '6px', fontWeight: '600', color: '#fff', cursor: 'pointer' }} onClick={() => markOrderReady(order.orderId)}>Mark Ready</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}