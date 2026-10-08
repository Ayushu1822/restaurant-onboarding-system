import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Online Orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    businessName: 'Loading...',
    ownerName: 'Loading...',
    email: '',
    phone: '',
    address: '44, Residency Road, Bengaluru'
  });

  useEffect(() => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;

    fetch(`${API_BASE_URL}/api/v1/auth/me?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        if (data) {
          setProfileData({
            businessName: data.businessName || 'FOODOS Restaurant',
            ownerName: data.ownerName || 'Admin',
            email: data.email || userEmail,
            phone: data.phoneNumber || 'N/A',
            address: data.address ? `${data.address.line1 || ''}, ${data.address.area || ''}` : '44, Residency Road, Bengaluru'
          });
        }
      })
      .catch(err => console.error("Error loading profile:", err));
  }, []);

  const handleProfileSaveSubmit = (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem('user_email');

    fetch(`${API_BASE_URL}/api/v1/auth/profile?email=${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: profileData.businessName,
        ownerName: profileData.ownerName,
        phoneNumber: profileData.phone
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    })
    .then(() => {
      alert('Profile updated and saved to PostgreSQL database successfully!');
      setShowProfileModal(false);
    })
    .catch(err => alert('Failed to update profile in database.'));
  };

  const [orders, setOrders] = useState([
    {
      id: '#KO01/000001',
      customer: 'Priya Sharma',
      time: '2m ago',
      status: 'Picked Up',
      type: 'Delivery',
      channel: 'WhatsApp',
      duration: '20 min',
      items: [
        { name: 'Chicken Drumsticks', qty: 2, price: 398.00, desc: 'Spicy · Serves 1', modifiers: [{ name: 'Garlic dip', qty: 1, price: 20.00 }, { name: 'Extra fries', qty: 1, price: 60.00 }] },
        { name: 'Sprite', qty: 2, price: 120.00 },
        { name: 'Chicken Fillet Burger Combo', qty: 1, price: 269.00, desc: 'Cheese loaded · Serves 1' }
      ],
      address: '12, MG Road, Bengaluru · 1.2 km',
      phone: '9876543210',
      customerRequest: 'Customer is allergic to peanuts.',
      subtotal: 867.00,
      promoCode: 'WELCOME10 (10%)',
      discount: 86.70,
      gst: 43.35,
      deliveryCharge: 15.00,
      total: 838.65,
      paymentMethod: 'UPI',
      paymentStatus: 'PENDING'
    },
    {
      id: '#KO01/000002',
      customer: 'Arjun Mehta',
      time: '3m ago',
      status: 'New',
      type: 'Delivery',
      channel: 'Web',
      duration: '15 min',
      items: [
        { name: 'Lucknowi (Awadhi) Biryani', qty: 2, price: 700.00 },
        { name: 'Chicken 65', qty: 1, price: 220.00 },
        { name: '7 Up', qty: 4, price: 70.00 }
      ],
      address: 'Indiranagar, Bengaluru · 2.5 km',
      phone: '9811223344',
      customerRequest: 'Deliver without ringing the doorbell.',
      subtotal: 990.00,
      promoCode: '',
      discount: 0.00,
      gst: 45.00,
      deliveryCharge: 20.00,
      total: 1055.00,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING'
    },
    {
      id: '#KO01/000003',
      customer: 'Sneha Iyer',
      time: '4m ago',
      status: 'New',
      type: 'Pickup',
      channel: 'Web',
      duration: '15 min',
      items: [
        { name: 'Paneer Tikka Sandwich', qty: 2, price: 458.00 },
        { name: 'Cold Coffee', qty: 2, price: 240.00 },
        { name: 'Garlic Bread', qty: 1, price: 115.00 }
      ],
      address: '44, Residency Road, Bengaluru',
      phone: '9123456780',
      customerRequest: '',
      subtotal: 813.00,
      promoCode: '',
      discount: 0.00,
      gst: 40.00,
      deliveryCharge: 0.00,
      total: 853.00,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID'
    }
  ]);

  useEffect(() => {
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handlePrintReceipt = () => window.print();

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
          {[
            'Online Orders', 'Counter POS', 'Tables', 'Kitchen', 'Menu', 
            'Reports', 'Promotions', 'Customers', 'Complaints', 'Gallery', 'Settings'
          ].map((tab) => (
            <li 
              key={tab}
              style={activeTab === tab ? styles.navItemActive : styles.navItem}
              onClick={() => setActiveTab(tab)}
            >
              <span style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                {tab === 'Online Orders' ? '🛒' : tab === 'Counter POS' ? '💳' : tab === 'Tables' ? '🪑' : tab === 'Kitchen' ? '🍳' : tab === 'Menu' ? '📖' : tab === 'Reports' ? '📊' : tab === 'Promotions' ? '🏷️' : tab === 'Customers' ? '👥' : tab === 'Complaints' ? '⚠️' : tab === 'Gallery' ? '🖼️' : '⚙️'} {tab}
              </span>
              {tab === 'Online Orders' && <span style={styles.badgeCount}>{orders.filter(o => o.status === 'New').length}</span>}
            </li>
          ))}
        </ul>

        <div style={styles.userInfo} onClick={() => setShowProfileModal(true)}>
          <div style={styles.userAvatar}>{profileData.ownerName ? profileData.ownerName.substring(0,2).toUpperCase() : 'AD'}</div>
          <div style={{flex: 1, overflow: 'hidden'}}>
            <div style={{fontSize: '13px', fontWeight: 'bold', color: '#fff'}}>{profileData.ownerName}</div>
            <div style={{fontSize: '11px', color: '#6ee7b7'}}>PostgreSQL Admin</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        
        {/* TOP HEADER */}
        <div style={styles.header}>
          <h2 style={styles.pageTitle}>{activeTab}</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button onClick={() => setActiveTab('Menu')} style={styles.pausedItemsBtn}>
              Manage Paused Items <span style={styles.pausedCountBadge}>5</span>
            </button>
            <div style={styles.bellIcon} title="Notifications">🔔</div>
            <button onClick={onLogout} style={styles.topLogoutBtn}>Sign Out</button>
          </div>
        </div>

        {activeTab !== 'Online Orders' ? (
          <div style={styles.tabContentPlaceholder}>
            <div style={styles.placeholderCard}>
              <h2 style={{color: '#0f172a', margin: '0 0 8px 0'}}>{activeTab} Management Panel</h2>
              <p style={{color: '#64748b', margin: 0}}>Database-backed management module for restaurant {activeTab.toLowerCase()}.</p>
            </div>
          </div>
        ) : (
          <div style={styles.onlineOrdersContainer}>
            <div style={styles.subHeader}>
              <span style={{fontWeight: '600', color: '#1e293b'}}>
                {orders.length} orders today · <span style={{color: '#16a34a'}}>{orders.filter(o => o.status === 'New').length} need action</span>
              </span>
            </div>

            {/* SPLIT MASTER-DETAIL LAYOUT */}
            <div style={styles.splitViewWrapper}>
              
              {/* LEFT: MASTER ORDER LIST */}
              <div style={styles.masterListColumn}>
                <div style={styles.listHeaderTitle}>All orders ({orders.length})</div>
                <div style={styles.scrollableCards}>
                  {orders.map(order => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <div 
                        key={order.id} 
                        style={{
                          ...styles.orderSummaryCard, 
                          borderColor: isSelected ? '#10b981' : '#e2e8f0',
                          backgroundColor: isSelected ? '#f0fdf4' : '#ffffff'
                        }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                          <div>
                            <strong style={{fontSize: '15px', color: '#0f172a'}}>{order.customer}</strong>
                            <div style={{fontSize: '11px', color: '#64748b'}}>{order.id}</div>
                          </div>
                          <span style={styles.statusBadgeSmall(order.status)}>{order.status}</span>
                        </div>

                        <div style={{fontSize: '11px', color: '#64748b', marginBottom: '10px'}}>
                          🛵 {order.type} · 🟢 {order.channel} · 🕒 {order.time}
                        </div>

                        <div style={{fontSize: '13px', color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginBottom: '8px'}}>
                          {order.items.map((it, idx) => (
                            <div key={idx} style={{marginBottom: '2px'}}>
                              {it.qty} × {it.name}
                            </div>
                          ))}
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '14px', color: '#0f172a'}}>
                          <span>₹{order.total.toFixed(2)}</span>
                          <span style={{color: '#10b981'}}>›</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: DETAILED VIEW PANEL */}
              <div style={styles.detailPanelColumn}>
                <div style={styles.listHeaderTitle}>Order details</div>

                {selectedOrder ? (
                  <div style={styles.detailCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px'}}>
                      <div>
                        <h3 style={{margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a'}}>{selectedOrder.customer}</h3>
                        <div style={{fontSize: '12px', color: '#64748b'}}>{selectedOrder.id} · {selectedOrder.time}</div>
                      </div>
                      <span style={styles.statusBadgeSmall(selectedOrder.status)}>{selectedOrder.status}</span>
                    </div>

                    <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
                      <span style={styles.tag}>🛵 {selectedOrder.type}</span>
                      <span style={styles.tag}>🟢 {selectedOrder.channel}</span>
                      <span style={styles.tag}>🕒 {selectedOrder.duration}</span>
                    </div>

                    <div style={{marginBottom: '20px'}}>
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} style={{marginBottom: '12px', fontSize: '14px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#0f172a'}}>
                            <span>{item.name} ×{item.qty}</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
                          {item.desc && <div style={{fontSize: '12px', color: '#64748b'}}>{item.desc}</div>}
                          {item.modifiers && item.modifiers.map((mod, mIdx) => (
                            <div key={mIdx} style={{fontSize: '12px', color: '#64748b', paddingLeft: '12px'}}>
                              + {mod.name} ×{mod.qty} ₹{mod.price.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div style={{fontSize: '13px', color: '#334155', marginBottom: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px'}}>
                      📍 {selectedOrder.address}<br/>
                      📞 <span style={{color: '#16a34a', fontWeight: '600'}}>{selectedOrder.phone}</span>
                    </div>

                    {selectedOrder.customerRequest && (
                      <div style={styles.customerRequestBox}>
                        <strong>CUSTOMER REQUEST</strong>
                        <div>{selectedOrder.customerRequest}</div>
                      </div>
                    )}

                    <div style={{borderTop: '1px solid #e2e8f0', paddingTop: '15px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Sub total</span>
                        <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedOrder.promoCode && (
                        <div style={{display: 'flex', justifyContent: 'space-between', color: '#16a34a'}}>
                          <span>{selectedOrder.promoCode}</span>
                          <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>GST</span>
                        <span>₹{selectedOrder.gst.toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Delivery charge</span>
                        <span>₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '5px'}}>
                        <span>Total</span>
                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '4px'}}>
                        <span>Payment · {selectedOrder.paymentMethod}</span>
                        <span style={{color: selectedOrder.paymentStatus === 'PAID' ? '#16a34a' : '#dc2626', fontWeight: 'bold'}}>{selectedOrder.paymentStatus}</span>
                      </div>
                    </div>

                    <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <button onClick={handlePrintReceipt} style={styles.printIconBtn}>🖨️ Print Receipt</button>
                      {selectedOrder.status === 'New' && (
                        <button onClick={() => updateOrderStatus(selectedOrder.id, 'Accepted')} style={styles.actionBtn}>Accept Order</button>
                      )}
                      {selectedOrder.status === 'Accepted' && (
                        <button onClick={() => updateOrderStatus(selectedOrder.id, 'Preparing')} style={styles.actionBtn}>Start Preparing</button>
                      )}
                      {selectedOrder.status === 'Preparing' && (
                        <button onClick={() => updateOrderStatus(selectedOrder.id, 'Ready')} style={styles.actionBtn}>Mark Ready</button>
                      )}
                      {selectedOrder.status === 'Ready' && (
                        <button onClick={() => updateOrderStatus(selectedOrder.id, 'Picked Up')} style={styles.actionBtn}>Mark Picked Up</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={styles.emptyDetailPrompt}>Select an order from the list to view full details.</div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div style={styles.drawerOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>PostgreSQL Admin Profile</h3>
              <button onClick={() => setShowProfileModal(false)} style={styles.closeDrawerBtn}>✕</button>
            </div>

            <form onSubmit={handleProfileSaveSubmit} style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
              <div>
                <label style={styles.profileLabel}>Business Name</label>
                <input type="text" value={profileData.businessName} onChange={(e) => setProfileData({...profileData, businessName: e.target.value})} style={styles.inputField} required />
              </div>
              <div>
                <label style={styles.profileLabel}>Owner Name</label>
                <input type="text" value={profileData.ownerName} onChange={(e) => setProfileData({...profileData, ownerName: e.target.value})} style={styles.inputField} required />
              </div>
              <div>
                <label style={styles.profileLabel}>Email (Read-only)</label>
                <input type="email" value={profileData.email} disabled style={{...styles.inputField, backgroundColor: '#f1f5f9', color: '#64748b'}} />
              </div>
              <div>
                <label style={styles.profileLabel}>Phone Number</label>
                <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} style={styles.inputField} />
              </div>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button type="button" onClick={() => setShowProfileModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden', margin: 0, padding: 0, boxSizing: 'border-box', position: 'fixed', top: 0, left: 0 },
  sidebar: { width: '260px', backgroundColor: '#022c22', display: 'flex', flexDirection: 'column', color: '#ffffff', flexShrink: 0, height: '100vh' },
  brandBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoIcon: { fontSize: '24px' },
  brandName: { fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' },
  brandSub: { fontSize: '10px', color: '#6ee7b7', letterSpacing: '1px', fontWeight: '600' },
  navLinks: { listStyle: 'none', padding: '10px 0', margin: 0, overflowY: 'auto', flex: 1 },
  navItem: { padding: '12px 20px', fontSize: '14px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease' },
  navItemActive: { padding: '12px 20px', fontSize: '14px', color: '#ffffff', backgroundColor: '#064e3b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #10b981', fontWeight: '600', transition: 'all 0.2s ease' },
  badgeCount: { backgroundColor: '#10b981', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' },
  userInfo: { padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#01231b', cursor: 'pointer' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', width: 'calc(100vw - 260px)' },
  header: { height: '65px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', flexShrink: 0 },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
  pausedItemsBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  pausedCountBadge: { backgroundColor: '#e11d48', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' },
  bellIcon: { fontSize: '18px', cursor: 'pointer' },
  topLogoutBtn: { backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  onlineOrdersContainer: { display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#f8fafc', overflow: 'hidden' },
  subHeader: { padding: '12px 25px', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', fontSize: '14px', flexShrink: 0 },
  splitViewWrapper: { display: 'flex', flex: 1, overflow: 'hidden', padding: '20px', gap: '20px' },
  masterListColumn: { width: '420px', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  detailPanelColumn: { flex: 1, display: 'flex', flexDirection: 'column' },
  listHeaderTitle: { fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '12px' },
  scrollableCards: { overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' },
  orderSummaryCard: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  detailCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', flex: 1, overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' },
  emptyDetailPrompt: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statusBadgeSmall: (status) => ({
    backgroundColor: status === 'New' ? '#e0f2fe' : status === 'Accepted' ? '#fef9c3' : status === 'Preparing' ? '#ffedd5' : status === 'Ready' ? '#dcfce7' : '#f1f5f9',
    color: status === 'New' ? '#0369a1' : status === 'Accepted' ? '#854d0e' : status === 'Preparing' ? '#c2410c' : status === 'Ready' ? '#15803d' : '#475569',
    fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase'
  }),
  tag: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '500' },
  customerRequestBox: { backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#92400e', marginBottom: '15px' },
  printIconBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  actionBtn: { backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  tabContentPlaceholder: { padding: '40px', flex: 1, backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
  placeholderCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '600px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  drawerOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  profileModal: { width: '420px', backgroundColor: '#ffffff', padding: '25px', borderRadius: '14px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  profileLabel: { fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' },
  inputField: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { flex: 1, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  closeDrawerBtn: { backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }
};