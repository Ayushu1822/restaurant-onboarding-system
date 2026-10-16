import React, { useState } from 'react';

export default function PromotionsModule() {
  const [promos, setPromos] = useState([
    { id: 1, code: 'WELCOME50', discount: '50% OFF', desc: 'Flat 50% discount for first-time users', status: 'Active' },
    { id: 2, code: 'WEEKEND100', discount: '₹100 OFF', desc: 'Save ₹100 on orders above ₹499', status: 'Active' }
  ]);

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [desc, setDesc] = useState('');

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!code || !discount) return alert('Please enter promo code and discount value.');

    setPromos([...promos, { id: Date.now(), code: code.toUpperCase(), discount, desc, status: 'Active' }]);
    setCode('');
    setDiscount('');
    setDesc('');
    alert('Promotion created successfully!');
  };

  const toggleStatus = (id) => {
    setPromos(promos.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Paused' : 'Active' } : p));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Promotions & Discounts</h2>
      <p style={styles.subtitle}>Create promotional discount codes and banner offers for your restaurant.</p>

      {/* Create Promo Form */}
      <form onSubmit={handleAddPromo} style={styles.card}>
        <h3 style={styles.cardTitle}>🏷️ Create New Promo Code</h3>
        <div style={styles.formRow}>
          <input 
            style={styles.input}
            placeholder="Promo Code (e.g. FESTIVE20)"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
          />
          <input 
            style={styles.input}
            placeholder="Discount Value (e.g. 20% OFF)"
            value={discount}
            onChange={e => setDiscount(e.target.value)}
            required
          />
          <input 
            style={styles.input}
            placeholder="Description (e.g. Diwali special offer)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <button type="submit" style={styles.createBtn}>Add Promotion</button>
        </div>
      </form>

      {/* Promos List */}
      <div style={styles.grid}>
        {promos.map(promo => (
          <div key={promo.id} style={styles.promoCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px'}}>
              <div>
                <span style={styles.codeBadge}>{promo.code}</span>
                <h4 style={{margin: '8px 0 4px 0', fontSize: '18px', color: '#0f172a'}}>{promo.discount}</h4>
              </div>
              <span style={{
                background: promo.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                color: promo.status === 'Active' ? '#047857' : '#dc2626',
                padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700'
              }}>
                {promo.status}
              </span>
            </div>
            <p style={{fontSize: '12px', color: '#64748b', marginBottom: '15px'}}>{promo.desc}</p>
            <button onClick={() => toggleStatus(promo.id)} style={styles.toggleBtn}>
              {promo.status === 'Active' ? 'Pause Promo' : 'Activate Promo'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' },
  subtitle: { color: '#64748b', fontSize: '13px', marginBottom: '24px' },
  card: { background: '#fff', padding: '20px', borderRadius: '14px', border: '1.5px solid #e2e8f0', marginBottom: '24px', maxWidth: '900px', textAlign: 'left' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' },
  formRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '180px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' },
  createBtn: { background: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', maxWidth: '900px' },
  promoCard: { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  codeBadge: { background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', fontFamily: 'monospace' },
  toggleBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', width: '100%' }
};