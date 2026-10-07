import React from 'react';

export default function Dashboard({ onLogout }) {
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.brandBox}>
          <span style={styles.logoIcon}>🛡️</span>
          <div>
            <div style={styles.brandName}>FOODOS</div>
            <div style={styles.brandSub}>RESTAURANT POS</div>
          </div>
        </div>

        <ul style={styles.navLinks}>
          <li style={styles.navItemActive}>
            <span>🛒 Online Orders</span>
            <span style={styles.badgeCount}>3</span>
          </li>
          <li style={styles.navItem}>💳 Counter POS</li>
          <li style={styles.navItem}>🪑 Tables</li>
          <li style={styles.navItem}>🍳 Kitchen</li>
          <li style={styles.navItem}>📖 Menu</li>
          <li style={styles.navItem}>📊 Reports</li>
          <li style={styles.navItem}>🏷️ Promotions</li>
          <li style={styles.navItem}>👥 Customers</li>
          <li style={styles.navItem}>⚠️ Complaints</li>
          <li style={styles.navItem}>🖼️ Gallery</li>
          <li style={styles.navItem}>⚙️ Settings</li>
        </ul>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>K6</div>
          <div style={{flex: 1}}>
            <div style={{fontSize: '13px', fontWeight: 'bold', color: '#fff'}}>krishna 6</div>
            <div style={{fontSize: '11px', color: '#94a3b8'}}>Admin</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        {/* TOP HEADER */}
        <div style={styles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <h2 style={styles.pageTitle}>Online Orders</h2>
            <div style={styles.alertBanner}>
              ⚠️ Live preview lost connection. <button style={styles.tryAgainBtn}>Try again</button> ✕
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button style={styles.pausedItemsBtn}>Manage Paused Items 5</button>
            <div style={styles.bellIcon}>🔔</div>
          </div>
        </div>

        {/* SUB-HEADER INFO */}
        <div style={styles.subHeader}>
          <span style={{fontWeight: '600', color: '#1e293b'}}>10 orders today · <span style={{color: '#16a34a'}}>3 need action</span></span>
        </div>

        {/* KANBAN BOARD COLUMNS */}
        <div style={styles.kanbanBoard}>
          
          {/* COLUMN 1: NEW */}
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <span>New</span>
              <span style={styles.colBadge}>3</span>
            </div>

            {/* Order Card 1 */}
            <div style={styles.orderCard}>
              <div style={styles.cardTopRow}>
                <div>
                  <strong style={{fontSize: '15px', color: '#0f172a'}}>Priya Sharma</strong>
                  <div style={{fontSize: '11px', color: '#64748b'}}>#KO01/000001 · 2m ago</div>
                </div>
                <span style={styles.newTag}>NEW</span>
              </div>
              <div style={styles.tagsRow}>
                <span style={styles.tag}>🛵 Delivery</span>
                <span style={styles.tag}>🟢 WhatsApp</span>
              </div>
              <div style={styles.timeTag}>🕒 20 min</div>
              
              <div style={styles.orderItems}>
                <div style={styles.itemRow}>
                  <span>Chicken Drumsticks ×2</span>
                  <span>₹398.00</span>
                </div>
                <div style={styles.itemSub}>Spicy · Serves 1<br/>+ Garlic dip ×1 (₹20)<br/>+ Extra fries ×1 (₹60)</div>
                <div style={styles.itemRow}>
                  <span>Sprite ×2</span>
                  <span>₹120.00</span>
                </div>
                <div style={styles.itemRow}>
                  <span>Chicken Fillet Burger Combo ×1</span>
                  <span>₹269.00</span>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button style={styles.rejectBtn}>Reject</button>
                <button style={styles.acceptBtn}>Accept</button>
              </div>
            </div>
          </div>

          {/* COLUMN 2: ACCEPTED */}
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <span>Accepted</span>
              <span style={styles.colBadge}>2</span>
            </div>

            <div style={styles.orderCard}>
              <div style={styles.cardTopRow}>
                <div>
                  <strong style={{fontSize: '15px', color: '#0f172a'}}>Bhavya</strong>
                  <div style={{fontSize: '11px', color: '#64748b'}}>#KO01/002978 · 6d ago</div>
                </div>
                <span style={styles.acceptedTag}>ACCEPTED</span>
              </div>
              <div style={styles.tagsRow}>
                <span style={styles.tag}>🛵 Delivery</span>
                <span style={styles.tag}>🟢 WhatsApp</span>
              </div>
              <div style={styles.timeTag}>🕒 20 min</div>

              <div style={styles.orderItems}>
                <div style={styles.itemRow}>
                  <span>Chicken Fillet Sandwich Combo ×2</span>
                  <span>₹578.00</span>
                </div>
              </div>

              <div style={styles.cardActionsFull}>
                <button style={styles.startPrepBtn}>Start preparing</button>
              </div>
            </div>
          </div>

          {/* COLUMN 3: PREPARING */}
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <span>Preparing</span>
              <span style={styles.colBadge}>2</span>
            </div>

            <div style={styles.orderCard}>
              <div style={styles.cardTopRow}>
                <div>
                  <strong style={{fontSize: '15px', color: '#0f172a'}}>Ravi Kumar</strong>
                  <div style={{fontSize: '11px', color: '#64748b'}}>#KO01/004405 · 11d ago</div>
                </div>
                <span style={styles.prepTag}>PREPARING</span>
              </div>
              <div style={styles.tagsRow}>
                <span style={styles.tag}>🛵 Delivery</span>
                <span style={styles.tag}>🌐 Web</span>
              </div>
              <div style={styles.timeTag}>🕒 20 min</div>

              <div style={styles.orderItems}>
                <div style={styles.itemRow}>
                  <span>Spicy Double Baik ×3</span>
                  <span>₹750.00</span>
                </div>
              </div>

              <div style={styles.cardActionsFull}>
                <button style={styles.markReadyBtn}>Mark ready</button>
              </div>
            </div>
          </div>

          {/* COLUMN 4: READY */}
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <span>Ready</span>
              <span style={styles.colBadge}>2</span>
            </div>

            <div style={styles.orderCard}>
              <div style={styles.cardTopRow}>
                <div>
                  <strong style={{fontSize: '15px', color: '#0f172a'}}>Rohit Verma</strong>
                  <div style={{fontSize: '11px', color: '#64748b'}}>#KO01/007711 · 18m ago</div>
                </div>
                <span style={styles.readyTag}>READY</span>
              </div>
              <div style={styles.tagsRow}>
                <span style={styles.tag}>🛵 Delivery</span>
                <span style={styles.tag}>🌐 Web</span>
              </div>
              <div style={styles.timeTag}>🕒 20 min</div>

              <div style={styles.orderItems}>
                <div style={styles.itemRow}>
                  <span>Chicken Fillet Burger Combo ×2</span>
                  <span>₹538.00</span>
                </div>
                <div style={styles.itemRow}>
                  <span>Sprite ×1</span>
                  <span>₹60.00</span>
                </div>
              </div>

              <div style={styles.cardActionsFull}>
                <button style={styles.markPickedUpBtn}>Mark picked up</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden', margin: 0, padding: 0, boxSizing: 'border-box' },
  sidebar: { width: '260px', backgroundColor: '#022c22', display: 'flex', flexDirection: 'column', color: '#ffffff', flexShrink: 0 },
  brandBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoIcon: { fontSize: '24px' },
  brandName: { fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' },
  brandSub: { fontSize: '10px', color: '#6ee7b7', letterSpacing: '1px', fontWeight: '600' },
  navLinks: { listStyle: 'none', padding: '10px 0', margin: 0, overflowY: 'auto', flex: 1 },
  navItem: { padding: '12px 20px', fontSize: '14px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' },
  navItemActive: { padding: '12px 20px', fontSize: '14px', color: '#ffffff', backgroundColor: '#064e3b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'between', borderLeft: '4px solid #10b981', fontWeight: '600' },
  badgeCount: { backgroundColor: '#10b981', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' },
  userInfo: { padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#01231b' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50% style', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  header: { height: '65px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', flexShrink: 0 },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
  alertBanner: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: '#991b1b' },
  tryAgainBtn: { background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' },
  pausedItemsBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' },
  bellIcon: { fontSize: '18px', cursor: 'pointer' },
  subHeader: { padding: '15px 25px', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', fontSize: '14px' },
  kanbanBoard: { display: 'flex', gap: '20px', padding: '25px', overflowX: 'auto', flex: 1, backgroundColor: '#f8fafc', alignItems: 'flex-start' },
  column: { backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: '100%' },
  columnHeader: { padding: '14px 16px', fontWeight: '700', fontSize: '14px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' },
  colBadge: { backgroundColor: '#cbd5e1', color: '#334155', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' },
  orderCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', margin: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  newTag: { backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  acceptedTag: { backgroundColor: '#fef9c3', color: '#854d0e', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  prepTag: { backgroundColor: '#ffedd5', color: '#c2410c', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  readyTag: { backgroundColor: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  tagsRow: { display: 'flex', gap: '6px', marginBottom: '8px' },
  tag: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' },
  timeTag: { fontSize: '11px', color: '#64748b', marginBottom: '12px', fontWeight: '500' },
  orderItems: { borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '10px 0', marginBottom: '12px', fontSize: '13px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '500', color: '#1e293b', marginBottom: '4px' },
  itemSub: { fontSize: '11px', color: '#64748b', marginBottom: '6px', paddingLeft: '8px' },
  cardActions: { display: 'flex', gap: '10px' },
  rejectBtn: { flex: 1, backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  acceptBtn: { flex: 1, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  cardActionsFull: { display: 'flex' },
  startPrepBtn: { width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  markReadyBtn: { width: '100%', backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  markPickedUpBtn: { width: '100%', backgroundColor: '#047857', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }
};