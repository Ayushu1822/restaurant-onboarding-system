import React, { useState } from 'react';

export default function CustomersModule() {
  const [customers] = useState([
    { name: 'Golu Patel', phone: '9811122233', food: 'Veg', email: 'golu@example.com', address: 'Civil Lines, Meerut' },
    { name: 'Ayush Chaturvedi', phone: '9822233344', food: 'Non-Veg', email: 'ayush@example.com', address: 'Shastri Nagar, Meerut' },
    { name: 'Harish Panchal', phone: '9833344455', food: 'Veg', email: 'harish@example.com', address: 'Begum Bridge, Meerut' },
    { name: 'Krishna Kumar', phone: '9844455566', food: 'Non-Veg', email: 'krishna@example.com', address: 'Saket Colony, Meerut' },
    { name: 'Anokh', phone: '9855566677', food: 'Veg', email: 'anokh@example.com', address: 'Delhi Road, Meerut' }
  ]);

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>Customers CRM</h2>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Phone</th>
              <th style={{ padding: '12px 16px' }}>Preference</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{c.name}</td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>{c.phone}</td>
                <td style={{ padding: '14px 16px' }}><span style={{ background: c.food === 'Veg' ? '#d1fae5' : '#fee2e2', color: c.food === 'Veg' ? '#065f46' : '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{c.food}</span></td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{c.email}</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{c.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}