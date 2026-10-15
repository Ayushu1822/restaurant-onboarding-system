import React, { useState } from 'react';

export default function MenuModule() {
  const [activeMenu, setActiveMenu] = useState('online');
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Chicken Fillet Sandwich Combo', category: 'Combos', price: 289.00, status: 'Live' },
    { id: 2, name: 'Chicken Drumsticks', category: 'Starters', price: 199.00, status: 'Live' },
    { id: 3, name: 'Paneer Tikka Sandwich', category: 'Sandwiches', price: 229.00, status: 'Paused' },
    { id: 4, name: 'Butter Chicken', category: 'Main Course', price: 400.00, status: 'Live' }
  ]);

  const toggleStatus = (id) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'Live' ? 'Paused' : 'Live' } : item));
  };

  const pausedCount = menuItems.filter(i => i.status === 'Paused').length;
  const availableCount = menuItems.filter(i => i.status === 'Live').length;

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Menus</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Create menus, activate them per channel, and manage items.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', border: activeMenu === 'online' ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', cursor: 'pointer' }} onClick={() => setActiveMenu('online')}>
          <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>LIVE ONLINE</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '10px 0 4px' }}>Default Online Menu</h3>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Served on website and WhatsApp ordering.</p>
        </div>

        <div style={{ background: '#fff', border: activeMenu === 'in-house' ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', cursor: 'pointer' }} onClick={() => setActiveMenu('in-house')}>
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>IN-HOUSE DEFAULT</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '10px 0 4px' }}>Default In-House Menu</h3>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Served at tables and takeaway counter.</p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '14px 20px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600', fontSize: '14px', color: '#334155', border: '1px solid #e2e8f0' }}>
        ITEMS &bull; {availableCount} AVAILABLE &bull; <span style={{ color: '#ef4444' }}>{pausedCount} PAUSED</span>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {menuItems.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{item.category}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{item.price.toFixed(2)}</span>
              <button onClick={() => toggleStatus(item.id)} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', background: item.status === 'Live' ? '#d1fae5' : '#fee2e2', color: item.status === 'Live' ? '#065f46' : '#991b1b', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                {item.status === 'Live' ? '🟢 Live' : '🔴 Paused'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}