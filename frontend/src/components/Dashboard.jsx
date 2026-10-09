import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Online Orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  
  // Real Database Profile State
  const [profileData, setProfileData] = useState({
    businessName: 'Loading...',
    ownerName: 'Loading...',
    email: '',
    phone: '',
    address: '44, Residency Road, Bengaluru'
  });

  // Fetch Profile Live from PostgreSQL Database on Mount
  useEffect(() => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;

    fetch(`${API_BASE_URL}/api/v1/auth/me?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setProfileData({
            businessName: data.businessName || 'FOODOS Restaurant',
            ownerName: data.ownerName || data.businessName || 'Admin',
            email: data.email || userEmail,
            phone: data.phoneNumber || '9876543210',
            address: data.address ? `${data.address.line1 || ''}, ${data.address.area || ''}` : '44, Residency Road, Bengaluru'
          });
        }
      })
      .catch(err => console.error("Error loading profile from DB:", err));
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
    .then(res => res.json())
    .then(() => {
      alert('Profile updated and saved to PostgreSQL database successfully!');
      setShowProfileModal(false);
    })
    .catch(() => alert('Failed to update profile in database.'));
  };

  // Live Orders State fetched from PostgreSQL Backend
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/orders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        const formattedOrders = data.map(o => ({
          id: o.displayId || '#KO01/000001',
          orderId: o.orderId,
          customer: o.customerName || 'Guest',
          time: '2m ago',
          status: o.status || 'New',
          type: o.orderType || 'Delivery',
          channel: o.channel || 'Web',
          duration: '15 min',
          items: o.items ? o.items.map(i => ({
            name: i.itemName,
            qty: i.quantity,
            price: i.unitPrice * i.quantity,
            desc: i.itemDescription,
            modifiers: i.modifiers ? i.modifiers.map(m => ({ name: m.modifierName, qty: m.quantity, price: m.modifierPrice })) : []
          })) : [],
          address: o.deliveryAddress || 'MG Road, Bengaluru',
          phone: o.customerPhone || '9876543210',
          customerRequest: o.customerRequest || '',
          subtotal: o.subtotal || 0,
          promoCode: o.promoCode || '',
          discount: o.discountAmount || 0,
          gst: o.gstAmount || 0,
          deliveryCharge: o.deliveryCharge || 0,
          total: o.totalAmount || 0,
          paymentMethod: o.paymentMethod || 'UPI',
          paymentStatus: o.paymentStatus || 'PENDING'
        }));

        setOrders(formattedOrders);
        if (formattedOrders.length > 0) {
          setSelectedOrder(formattedOrders[0]);
        }
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error("Error fetching orders from PostgreSQL backend:", err);
        setLoadingOrders(false);
      });
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/status?status=${newStatus}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update status in DB');
        return res.json();
      })
      .then(() => {
        setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      })
      .catch(err => {
        console.error(err);
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      });
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
          ].map((tab) => {
            const isActive = activeTab === tab;
            const isHovered = hoveredTab === tab;
            return (
              <li 
                key={tab}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  ...(isHovered && !isActive ? styles.navItemHover : {})
                }}
                onClick={() => setActiveTab(tab)}
                onMouseEnter={() => setHoveredTab(tab)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <span style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  {tab === 'Online Orders' ? '🛒' : tab === 'Counter POS' ? '💳' : tab === 'Tables' ? '🪑' : tab === 'Kitchen' ? '🍳' : tab === 'Menu' ? '📖' : tab === 'Reports' ? '📊' : tab === 'Promotions' ? '🏷️' : tab === 'Customers' ? '👥' : tab === 'Complaints' ? '⚠️' : tab === 'Gallery' ? '🖼️' : '⚙️'} {tab}
                </span>
                {tab === 'Online Orders' && <span style={styles.badgeCount}>{orders.filter(o => o.status === 'New').length}</span>}
              </li>
            );
          })}
        </ul>

        {/* LIVE DATABASE PROFILE IN SIDEBAR */}
        <div style={styles.userInfo} onClick={() => setShowProfileModal(true)} title="Click to edit profile">
          <div style={styles.userAvatar}>
            {profileData.ownerName ? profileData.ownerName.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div style={{flex: 1, overflow: 'hidden', textAlign: 'left'}}>
            <div style={{fontSize: '13px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              {profileData.ownerName}
            </div>
            <div style={{fontSize: '11px', color: '#6ee7b7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              {profileData.businessName}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        
        {/* TOP HEADER WITH RESTORED SIGN OUT BUTTON */}
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
              <h2 style={{color: '#0f172a', margin: '0 0 8px 0', textAlign: 'left'}}>{activeTab} Management Panel</h2>
              <p style={{color: '#64748b', margin: 0, textAlign: 'left'}}>Database-backed management module for restaurant {activeTab.toLowerCase()}.</p>
            </div>
          </div>
        ) : (
          <div style={styles.onlineOrdersContainer}>
            
            {/* SUBHEADER COUNTERS */}
            <div style={styles.subHeader}>
              <span style={{fontWeight: '600', color: '#0f172a'}}>
                {orders.length} orders today · <span style={{color: '#16a34a'}}>{orders.filter(o => o.status === 'New').length} need action</span>
              </span>
            </div>

            {/* EQUALLY BALANCED SPLIT MASTER-DETAIL LAYOUT */}
            <div style={styles.splitViewWrapper}>
              
              {/* LEFT COLUMN: ALL ORDERS LIST */}
              <div style={styles.masterListColumn}>
                <div style={styles.listHeaderTopRow}>
                  <span style={styles.listHeaderTitle}>All orders ({orders.length})</span>
                  <span style={styles.sortText}>Newest first</span>
                </div>
                
                <div style={styles.scrollableCards}>
                  {loadingOrders ? (
                    <div style={{padding: '20px', color: '#64748b', textAlign: 'center'}}>Loading orders from PostgreSQL...</div>
                  ) : orders.length === 0 ? (
                    <div style={{padding: '20px', color: '#64748b', textAlign: 'center'}}>No orders found in database.</div>
                  ) : (
                    orders.map(order => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <div 
                          key={order.id} 
                          style={{
                            ...styles.orderSummaryCard, 
                            borderColor: isSelected ? '#10b981' : '#cbd5e1',
                            backgroundColor: '#ffffff'
                          }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', textAlign: 'left'}}>
                            <div>
                              <strong style={{fontSize: '16px', color: '#0f172a'}}>{order.customer}</strong>
                              <div style={{fontSize: '12px', color: '#64748b'}}>{order.id}</div>
                            </div>
                            <span style={styles.statusBadgeSmall(order.status)}>{order.status}</span>
                          </div>

                          <div style={{fontSize: '12px', color: '#64748b', marginBottom: '12px', textAlign: 'left'}}>
                            🛵 {order.type} · 🟢 {order.channel} · 🕒 {order.time}
                          </div>

                          <div style={{fontSize: '14px', color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '10px', textAlign: 'left'}}>
                            {order.items.map((it, idx) => (
                              <div key={idx} style={{marginBottom: '4px', fontWeight: '500', textAlign: 'left'}}>
                                {it.qty} × {it.name}
                              </div>
                            ))}
                          </div>

                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '16px', color: '#0f172a', borderTop: '1px solid #f1f5f9', paddingTop: '10px', textAlign: 'left'}}>
                            <span>₹{order.total.toFixed(2)}</span>
                            <span style={{color: '#10b981', fontSize: '18px'}}>›</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: ORDER DETAILS & RECEIPT BOX */}
              <div style={styles.detailPanelColumn}>
                <div style={styles.listHeaderTitle}>Order details</div>

                {selectedOrder ? (
                  <div style={styles.detailCard}>
                    
                    {/* Header */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px', textAlign: 'left'}}>
                      <div>
                        <h3 style={{margin: '0 0 2px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700'}}>{selectedOrder.customer}</h3>
                        <div style={{fontSize: '12px', color: '#64748b', fontWeight: '500'}}>{selectedOrder.id} · {selectedOrder.time}</div>
                      </div>
                      <span style={styles.statusBadgeSmall(selectedOrder.status)}>{selectedOrder.status}</span>
                    </div>

                    <div style={{display: 'flex', gap: '8px', marginBottom: '16px', textAlign: 'left'}}>
                      <span style={styles.tag}>🛵 {selectedOrder.type}</span>
                      <span style={styles.tag}>🟢 {selectedOrder.channel}</span>
                      <span style={styles.tag}>🕒 {selectedOrder.duration}</span>
                    </div>

                    {/* Items & Modifiers (Fully Left-Aligned) */}
                    <div style={{marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', textAlign: 'left'}}>
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} style={{marginBottom: '12px', fontSize: '14px', textAlign: 'left'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a', textAlign: 'left'}}>
                            <span>{item.name} ×{item.qty}</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
                          {item.desc && <div style={{fontSize: '12px', color: '#64748b', textAlign: 'left'}}>{item.desc}</div>}
                          {item.modifiers && item.modifiers.map((mod, mIdx) => (
                            <div key={mIdx} style={{fontSize: '12px', color: '#64748b', paddingLeft: '8px', marginTop: '2px', textAlign: 'left'}}>
                              + {mod.name} ×{mod.qty} ₹{mod.price.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Address & Phone */}
                    <div style={{fontSize: '13px', color: '#334155', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', textAlign: 'left', lineHeight: '1.5'}}>
                      📍 {selectedOrder.address}<br/>
                      📞 <span style={{color: '#16a34a', fontWeight: '700'}}>{selectedOrder.phone}</span>
                    </div>

                    {/* Customer Request Box (Allergy Notice) */}
                    {selectedOrder.customerRequest && (
                      <div style={styles.customerRequestBox}>
                        <strong style={{fontSize: '11px', letterSpacing: '0.5px', display: 'block', marginBottom: '4px'}}>CUSTOMER REQUEST</strong>
                        <div>{selectedOrder.customerRequest}</div>
                      </div>
                    )}

                    {/* Financial Calculations (Fully Left-Aligned & High Visibility) */}
                    <div style={{fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', textAlign: 'left'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Sub total</span>
                        <span style={{fontWeight: '600'}}>₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedOrder.promoCode && (
                        <div style={{display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '600'}}>
                          <span>{selectedOrder.promoCode}</span>
                          <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>GST</span>
                        <span style={{fontWeight: '600'}}>₹{selectedOrder.gst.toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Delivery charge</span>
                        <span style={{fontWeight: '600'}}>₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px', color: '#0f172a'}}>
                        <span>Total</span>
                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: '600'}}>
                        <span>Payment · {selectedOrder.paymentMethod}</span>
                        <span style={{color: selectedOrder.paymentStatus === 'PAID' ? '#16a34a' : '#dc2626', fontWeight: 'bold'}}>{selectedOrder.paymentStatus}</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px'}}>
                      <button onClick={handlePrintReceipt} style={styles.printIconBtn}>🖨️</button>
                      <div style={{display: 'flex', gap: '10px'}}>
                        {selectedOrder.status === 'New' && (
                          <button onClick={() => updateOrderStatus(selectedOrder.orderId || selectedOrder.id, 'Accepted')} style={styles.actionBtn}>Accept Order</button>
                        )}
                        {selectedOrder.status === 'Accepted' && (
                          <button onClick={() => updateOrderStatus(selectedOrder.orderId || selectedOrder.id, 'Preparing')} style={styles.actionBtn}>Start Preparing</button>
                        )}
                        {selectedOrder.status === 'Preparing' && (
                          <button onClick={() => updateOrderStatus(selectedOrder.orderId || selectedOrder.id, 'Ready')} style={styles.actionBtn}>Mark Ready</button>
                        )}
                        {selectedOrder.status === 'Ready' && (
                          <button onClick={() => updateOrderStatus(selectedOrder.orderId || selectedOrder.id, 'Picked Up')} style={styles.actionBtn}>Mark Picked Up</button>
                        )}
                      </div>
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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', textAlign: 'left'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>PostgreSQL Admin Profile</h3>
              <button onClick={() => setShowProfileModal(false)} style={styles.closeDrawerBtn}>✕</button>
            </div>

            <form onSubmit={handleProfileSaveSubmit} style={{display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left'}}>
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
  navItem: { padding: '12px 20px', fontSize: '14px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease', textAlign: 'left' },
  navItemHover: { backgroundColor: '#033d30', color: '#ffffff' },
  navItemActive: { padding: '12px 20px', fontSize: '14px', color: '#ffffff', backgroundColor: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #10b981', fontWeight: '600', transition: 'all 0.2s ease', textAlign: 'left' },
  badgeCount: { backgroundColor: '#10b981', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' },
  userInfo: { padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#01231b', cursor: 'pointer', transition: 'background-color 0.2s' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff', flexShrink: 0 },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', width: 'calc(100vw - 260px)' },
  header: { height: '65px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', flexShrink: 0 },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0, textAlign: 'left' },
  pausedItemsBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  pausedCountBadge: { backgroundColor: '#e11d48', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' },
  bellIcon: { fontSize: '18px', cursor: 'pointer' },
  topLogoutBtn: { backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
  onlineOrdersContainer: { display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#f8fafc', overflow: 'hidden' },
  subHeader: { padding: '12px 25px', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', fontSize: '14px', flexShrink: 0, textAlign: 'left' },
  splitViewWrapper: { display: 'flex', flex: 1, overflow: 'hidden', padding: '20px', gap: '24px', boxSizing: 'border-box' },
  masterListColumn: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: '380px' },
  detailPanelColumn: { flex: 1.2, display: 'flex', flexDirection: 'column', minWidth: '420px' },
  listHeaderTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', textAlign: 'left' },
  listHeaderTitle: { fontSize: '14px', fontWeight: '700', color: '#334155', textAlign: 'left' },
  sortText: { fontSize: '12px', color: '#64748b', textAlign: 'right' },
  scrollableCards: { overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' },
  orderSummaryCard: { border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'left' },
  detailCard: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '24px', flex: 1, overflowY: 'auto', boxShadow: '0 6px 12px -2px rgba(0,0,0,0.05)', textAlign: 'left' },
  emptyDetailPrompt: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#64748b', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statusBadgeSmall: (status) => ({
    backgroundColor: status === 'New' ? '#e0f2fe' : status === 'Accepted' ? '#fef9c3' : status === 'Preparing' ? '#ffedd5' : status === 'Ready' ? '#dcfce7' : '#f1f5f9',
    color: status === 'New' ? '#0369a1' : status === 'Accepted' ? '#854d0e' : status === 'Preparing' ? '#c2410c' : status === 'Ready' ? '#15803d' : '#475569',
    fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.3px'
  }),
  tag: { backgroundColor: '#f1f5f9', color: '#334155', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' },
  customerRequestBox: { backgroundColor: '#fef3c7', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', color: '#92400e', marginBottom: '16px', textAlign: 'left', fontWeight: '500' },
  printIconBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  actionBtn: { backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
  tabContentPlaceholder: { padding: '40px', flex: 1, backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
  placeholderCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '600px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'left' },
  drawerOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  profileModal: { width: '420px', backgroundColor: '#ffffff', padding: '25px', borderRadius: '14px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'left' },
  profileLabel: { fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block', textAlign: 'left' },
  inputField: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', textAlign: 'left' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { flex: 1, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  closeDrawerBtn: { backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }
};