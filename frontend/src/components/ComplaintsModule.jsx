import React, { useState } from 'react';

export default function ComplaintsModule() {
  const [complaints, setComplaints] = useState([
    { id: 'CMP-1001', order: '#KO01/000001', customer: 'Golu Patel', issue: 'Missing Item', status: 'Open' },
    { id: 'CMP-1002', order: '#KO01/000002', customer: 'Ayush Chaturvedi', issue: 'Wrong Item', status: 'Following Up' },
    { id: 'CMP-1003', order: '#KO01/000003', customer: 'Harish Panchal', issue: 'Late Delivery', status: 'Closed' }
  ]);

  const updateStatus = (id, newStatus) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>Complaints & Support</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {complaints.map(c => (
          <div key={c.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>{c.id}</span>
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: c.status === 'Open' ? '#fee2e2' : c.status === 'Following Up' ? '#fef3c7' : '#d1fae5', color: c.status === 'Open' ? '#991b1b' : c.status === 'Following Up' ? '#92400e' : '#065f46', fontWeight: '600' }}>{c.status}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Order: <strong>{c.order}</strong></div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>{c.customer} &bull; {c.issue}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => updateStatus(c.id, 'Following Up')} style={{ flex: 1, padding: '6px', fontSize: '12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Investigate</button>
              <button onClick={() => updateStatus(c.id, 'Closed')} style={{ flex: 1, padding: '6px', fontSize: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close Ticket</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}