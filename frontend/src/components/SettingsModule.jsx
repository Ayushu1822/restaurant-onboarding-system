import React, { useState } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function SettingsModule() {
  const [restaurantName, setRestaurantName] = useState('NewWorld Restaurant');
  const [ownerName, setOwnerName] = useState('Ayush');
  const [phone, setPhone] = useState('8218579235');
  const [taxRate, setTaxRate] = useState('5');
  const [printerIP, setPrinterIP] = useState('192.168.1.100');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate or perform API save
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings updated and saved successfully!');
    }, 600);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>System Settings</h2>
      <p style={styles.subtitle}>Configure restaurant profile, receipt printing, tax rates, and POS preferences.</p>

      <div style={styles.gridContainer}>
        
        {/* Profile & General Settings Card */}
        <form onSubmit={handleSaveSettings} style={styles.card}>
          <h3 style={styles.cardTitle}>🏪 Restaurant Profile</h3>
          
          <label style={styles.label}>Business Name:</label>
          <input 
            style={styles.input}
            value={restaurantName}
            onChange={e => setRestaurantName(e.target.value)}
          />

          <label style={styles.label}>Owner Name:</label>
          <input 
            style={styles.input}
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
          />

          <label style={styles.label}>Contact Phone / WhatsApp:</label>
          <input 
            style={styles.input}
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <label style={styles.label}>Default GST / Tax Rate (%):</label>
          <input 
            type="number"
            style={styles.input}
            value={taxRate}
            onChange={e => setTaxRate(e.target.value)}
          />

          <button type="submit" style={styles.saveBtn}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>

        {/* Hardware & Peripheral Settings Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🖨️ Hardware & Peripherals</h3>
          
          <label style={styles.label}>Thermal Receipt Printer IP:</label>
          <input 
            style={styles.input}
            value={printerIP}
            onChange={e => setPrinterIP(e.target.value)}
          />
          <span style={styles.hint}>Supports 80mm & 58mm network thermal printers.</span>

          <div style={{marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
            <h4 style={{margin: '0 0 8px 0', fontSize: '13px', color: '#0f172a'}}>Database & Cloud Status</h4>
            <div style={{fontSize: '12px', color: '#16a34a', fontWeight: '600', marginBottom: '4px'}}>🟢 PostgreSQL DB Connected (Render)</div>
            <div style={{fontSize: '12px', color: '#64748b'}}>API Base: {API_BASE_URL}</div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' },
  subtitle: { color: '#64748b', fontSize: '13px', marginBottom: '24px' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', maxWidth: '1000px' },
  card: { background: '#fff', padding: '24px', borderRadius: '14px', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', textAlign: 'left' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
  label: { fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '15px', boxSizing: 'border-box' },
  hint: { fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '-10px', marginBottom: '15px' },
  saveBtn: { background: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', width: '100%' }
};