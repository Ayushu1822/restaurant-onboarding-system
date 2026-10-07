import React from 'react';

export default function Dashboard({ onLogout }) {
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>FOODOS <span style={{fontSize: '11px', color: '#3b82f6'}}>POS</span></h2>
        <ul style={styles.navLinks}>
          <li style={{...styles.navItem, backgroundColor: '#0f294a', color: '#fff'}}>Online Orders</li>
          <li style={styles.navItem}>Counter POS</li>
          <li style={styles.navItem}>Tables</li>
          <li style={styles.navItem}>Kitchen</li>
          <li style={styles.navItem}>Menu</li>
          <li style={styles.navItem}>Reports</li>
        </ul>
        <div style={styles.userInfo}>
          <p style={{margin: 0, fontSize: '13px', fontWeight: 'bold'}}>Admin User</p>
          <button onClick={onLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={{fontSize: '20px', margin: 0, color: '#fff'}}>Online Orders Dashboard</h1>
          <span style={styles.badge}>Live Connected</span>
        </div>
        <div style={styles.kanbanBoard}>
          <div style={styles.column}>
            <h3>New Orders (3)</h3>
            <div style={styles.orderCard}>
              <strong>Priya Sharma</strong>
              <p style={{fontSize: '12px', color: '#94a3b8'}}>Chicken Drumsticks ×2 - ₹398</p>
            </div>
          </div>
          <div style={styles.column}>
            <h3>Preparing (2)</h3>
            <div style={styles.orderCard}>
              <strong>Ravi Kumar</strong>
              <p style={{fontSize: '12px', color: '#94a3b8'}}>Spicy Double Burger ×3 - ₹750</p>
            </div>
          </div>
          <div style={styles.column}>
            <h3>Ready (2)</h3>
            <div style={styles.orderCard}>
              <strong>Rohit Verma</strong>
              <p style={{fontSize: '12px', color: '#94a3b8'}}>Chicken Fillet Burger Combo - ₹538</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#030712', color: '#f8fafc', fontFamily: 'sans-serif' },
  sidebar: { width: '240px', backgroundColor: '#070d1a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px' },
  logo: { color: '#fff', fontSize: '18px', fontWeight: '800', marginBottom: '30px' },
  navLinks: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navItem: { padding: '12px 16px', borderRadius: '8px', fontSize: '14px', color: '#94a3b8', cursor: 'pointer' },
  userInfo: { borderTop: '1px solid #1e293b', paddingTop: '15px' },
  logoutBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginTop: '8px', width: '100%' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '20px 30px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#070d1a' },
  badge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' },
  kanbanBoard: { display: 'flex', gap: '20px', padding: '30px', overflowX: 'auto', flex: 1 },
  column: { backgroundColor: '#0b132b', border: '1px solid #1e293b', borderRadius: '12px', width: '280px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  orderCard: { backgroundColor: '#070d1a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }
};