import React, { useState } from 'react';

export default function TablesModule() {
  const [tables, setTables] = useState([
    { id: 'T1', section: 'MAIN', seats: 2, status: 'Available', customer: null, time: null, amount: null },
    { id: 'T2', section: 'MAIN', seats: 4, status: 'Occupied', customer: 'Krishna', time: '35m ago', amount: 725.45 },
    { id: 'T3', section: 'MAIN', seats: 4, status: 'Occupied', customer: 'Krishna', time: '12m ago', amount: 540.23 },
    { id: 'T3B', section: 'MAIN', seats: 4, status: 'Ready to Pay', customer: 'Krishna', time: '28m ago', amount: 694.58 },
    { id: 'T4', section: 'MAIN', seats: 2, status: 'Billing', customer: 'Asha', time: '1h ago', amount: 749.70 },
    { id: 'T5', section: 'PATIO', seats: 6, status: 'Available', customer: null, time: null, amount: null },
    { id: 'T6', section: 'PATIO', seats: 4, status: 'Reserved', customer: 'Anita Rao', time: 'Today 04:46 AM', amount: null },
    { id: 'T7', section: 'PATIO', seats: 2, status: 'Available', customer: null, time: null, amount: null },
    { id: 'B1', section: 'BAR', seats: 1, status: 'Occupied', customer: 'Asha', time: '20m ago', amount: 66.15 },
    { id: 'B2', section: 'BAR', seats: 1, status: 'Available', customer: null, time: null, amount: null }
  ]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'Occupied': return { bg: '#e0f2fe', text: '#0369a1', border: '#38bdf8' };
      case 'Ready to Pay': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'Billing': return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      case 'Reserved': return { bg: '#f1f5f9', text: '#475569', border: '#94a3b8' };
      default: return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  const availableCount = tables.filter(t => t.status === 'Available').length;
  const occupiedCount = tables.filter(t => t.status === 'Occupied').length;
  const billingCount = tables.filter(t => t.status === 'Billing' || t.status === 'Ready to Pay').length;
  const reservedCount = tables.filter(t => t.status === 'Reserved').length;

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Tables</h2>
      </div>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        {availableCount}/{tables.length} open &bull; {occupiedCount} occupied &bull; {billingCount} billing &bull; {reservedCount} reserved
      </p>

      {['MAIN', 'PATIO', 'BAR'].map(section => (
        <div key={section} style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', marginBottom: '12px' }}>{section}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {tables.filter(t => t.section === section).map(table => {
              const st = getStatusStyle(table.status);
              return (
                <div key={table.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: `1px solid ${st.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{table.id}</span>
                    <span style={{ background: st.bg, color: st.text, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{table.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>{table.seats} seats</div>

                  {table.customer ? (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{table.customer} <span style={{ fontWeight: '400', color: '#64748b' }}>&bull; {table.time}</span></div>
                      {table.amount && <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', marginTop: '4px' }}>₹{table.amount.toFixed(2)}</div>}
                    </div>
                  ) : (
                    <div style={{ height: '30px' }} />
                  )}

                  <button style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: '600', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    {table.status === 'Available' ? 'Seat Table' : 'Manage Table'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}