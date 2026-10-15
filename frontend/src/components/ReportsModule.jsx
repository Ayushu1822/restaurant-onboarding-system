import React, { useState, useEffect } from 'react';

export default function ReportsModule() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('https://restaurant-backend-fphb.onrender.com/api/v1/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  const paidCount = orders.filter(o => o.paymentStatus === 'PAID').length;

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>Reports & Insights</h2>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TOTAL ORDERS</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>{orders.length}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>REVENUE</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', marginTop: '6px' }}>₹{totalRevenue.toFixed(2)}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AVG. ORDER</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>₹{avgOrder.toFixed(2)}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>PAID ORDERS</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>{paidCount}</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>Order ID</th>
              <th style={{ padding: '12px 16px' }}>Customer</th>
              <th style={{ padding: '12px 16px' }}>Channel</th>
              <th style={{ padding: '12px 16px' }}>Total</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{order.displayId}</td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>{order.customerName}</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{order.channel}</td>
                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>₹{order.totalAmount}</td>
                <td style={{ padding: '14px 16px' }}><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{order.status}</span></td>
                <td style={{ padding: '14px 16px' }}><span style={{ color: order.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b', fontWeight: '600', fontSize: '12px' }}>{order.paymentStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}