import React, { useState, useEffect } from 'react';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Online Orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Robust Profile State from LocalStorage / Auth
  const [profileData, setProfileData] = useState({
    businessName: 'FOODOS Restaurant',
    ownerName: 'Admin User',
    email: 'owner@restaurant.com',
    phone: '9876543210',
    address: '44, Residency Road, Bengaluru'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setProfileData({
          businessName: parsed.businessName || 'FOODOS Restaurant',
          ownerName: parsed.ownerName || 'Admin User',
          email: parsed.email || 'owner@restaurant.com',
          phone: parsed.phoneNumber || parsed.phone || '9876543210',
          address: parsed.address ? `${parsed.address.line1 || ''}, ${parsed.address.area || ''}` : '44, Residency Road, Bengaluru'
        });
      } catch (e) {
        // fallback
      }
    }
  }, []);

  const [orders, setOrders] = useState([
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
      subtotal: 813.00,
      discount: 50.00,
      gst: 40.00,
      total: 803.00,
      payment: 'PAID'
    },
    {
      id: '#KO01/000001',
      customer: 'Priya Sharma',
      time: '2m ago',
      status: 'Accepted',
      type: 'Delivery',
      channel: 'WhatsApp',
      duration: '20 min',
      items: [
        { name: 'Chicken Drumsticks', qty: 2, price: 398.00, desc: 'Spicy · Serves 1' },
        { name: 'Sprite', qty: 2, price: 120.00 },
        { name: 'Chicken Fillet Burger Combo', qty: 1, price: 269.00 }
      ],
      address: '12, MG Road, Bengaluru',
      phone: '9888877777',
      subtotal: 787.00,
      discount: 0,
      gst: 35.00,
      total: 822.00,
      payment: 'COD'
    },
    {
      id: '#KO01/004405',
      customer: 'Ravi Kumar',
      time: '11d ago',
      status: 'Preparing',
      type: 'Delivery',
      channel: 'Web',
      duration: '20 min',
      items: [
        { name: 'Spicy Double Baik', qty: 3, price: 750.00 }
      ],
      address: '5th Block, Koramangala',
      phone: '9911223344',
      subtotal: 750.00,
      discount: 0,
      gst: 30.00,
      total: 780.00,
      payment: 'PAID'
    },
    {
      id: '#KO01/007711',
      customer: 'Rohit Verma',
      time: '18m ago',
      status: 'Ready',
      type: 'Delivery',
      channel: 'Web',
      duration: '20 min',
      items: [
        { name: 'Chicken Fillet Burger Combo', qty: 2, price: 538.00 },
        { name: 'Sprite', qty: 1, price: 60.00 }
      ],
      address: 'Indiranagar 2nd Stage',
      phone: '9844112233',
      subtotal: 598.00,
      discount: 0,
      gst: 25.00,
      total: 623.00,
      payment: 'PAID'
    },
    {
      id: '#KO01/007713',
      customer: 'Karan Kapoor',
      time: '40m ago',
      status: 'Picked Up',
      type: 'Delivery',
      channel: 'Web',
      duration: '25 min',
      items: [
        { name: 'Egg Biryani', qty: 3, price: 675.00 }
      ],
      address: 'Jayanagar 4th Block',
      phone: '9741556677',
      subtotal: 675.00,
      discount: 0,
      gst: 28.00,
      total: 703.00,
      payment: 'PAID'
    }
  ]);

  const handleAcceptAndOpenReceipt = (orderId, e) => {
    e.stopPropagation();
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: 'Accepted' } : o);
    setOrders(updatedOrders);
    const acceptedOrder = updatedOrders.find(o => o.id === orderId);
    setSelectedOrder(acceptedOrder);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setSelectedOrder(null);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

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
              <span>
                {tab === 'Online Orders' ? '🛒' : tab === 'Counter POS' ? '💳' : tab === 'Tables' ? '🪑' : tab === 'Kitchen' ? '🍳' : tab === 'Menu' ? '📖' : tab === 'Reports' ? '📊' : tab === 'Promotions' ? '🏷️' : tab === 'Customers' ? '👥' : tab === 'Complaints' ? '⚠️' : tab === 'Gallery' ? '🖼️' : '⚙️'} {tab}
              </span>
              {tab === 'Online Orders' && <span style={styles.badgeCount}>{orders.filter(o => o.status === 'New').length}</span>}
            </li>
          ))}
        </ul>

        <div style={styles.userInfo} onClick={() => setShowProfileModal(true)}>
          <div style={styles.userAvatar}>{profileData.ownerName.substring(0,2).toUpperCase()}</div>
          <div style={{flex: 1, overflow: 'hidden'}}>
            <div style={{fontSize: '13px', fontWeight: 'bold', color: '#fff'}}>{profileData.ownerName}</div>
            <div style={{fontSize: '11px', color: '#6ee7b7'}}>View Profile</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        
        {/* TOP HEADER */}
        <div style={styles.header}>
          <h2 style={styles.pageTitle}>{activeTab}</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button style={styles.pausedItemsBtn}>Manage Paused Items 5</button>
            <div style={styles.bellIcon} title="Notifications">🔔</div>
            <button onClick={onLogout} style={styles.topLogoutBtn}>Sign Out</button>
          </div>
        </div>

        {activeTab !== 'Online Orders' ? (
          <div style={styles.tabContentPlaceholder}>
            <h2>{activeTab} Management Panel</h2>
            <p style={{color: '#64748b'}}>Configure your restaurant {activeTab.toLowerCase()} data synced with PostgreSQL database.</p>
          </div>
        ) : (
          <>
            <div style={styles.subHeader}>
              <span style={{fontWeight: '600', color: '#1e293b'}}>
                {orders.length} orders today · <span style={{color: '#16a34a'}}>{orders.filter(o => o.status === 'New').length} need action</span>
              </span>
            </div>

            {/* KANBAN BOARD COLUMNS (FULL WIDTH & UNIFORM SIZING) */}
            <div style={styles.kanbanBoard}>
              
              {/* 1. NEW */}
              <div style={styles.column}>
                <div style={styles.columnHeader}>
                  <span>New</span>
                  <span style={styles.colBadge}>{orders.filter(o => o.status === 'New').length}</span>
                </div>
                <div style={styles.cardList}>
                  {orders.filter(o => o.status === 'New').map(order => (
                    <div key={order.id} style={styles.orderCard} onClick={() => setSelectedOrder(order)}>
                      <div style={styles.cardTopRow}>
                        <div>
                          <strong style={{fontSize: '15px', color: '#0f172a'}}>{order.customer}</strong>
                          <div style={{fontSize: '11px', color: '#64748b'}}>{order.id} · {order.time}</div>
                        </div>
                        <span style={styles.newTag}>NEW</span>
                      </div>
                      <div style={styles.tagsRow}>
                        <span style={styles.tag}>🛵 {order.type}</span>
                        <span style={styles.tag}>🟢 {order.channel}</span>
                      </div>
                      <div style={styles.timeTag}>🕒 {order.duration}</div>
                      <div style={styles.orderItems}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={styles.itemRow}>
                            <span>{item.name} ×{item.qty}</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateOrderStatus(order.id, 'Rejected')} style={styles.rejectBtn}>Reject</button>
                        <button onClick={(e) => handleAcceptAndOpenReceipt(order.id, e)} style={styles.acceptBtn}>Accept</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. ACCEPTED */}
              <div style={styles.column}>
                <div style={styles.columnHeader}>
                  <span>Accepted</span>
                  <span style={styles.colBadge}>{orders.filter(o => o.status === 'Accepted').length}</span>
                </div>
                <div style={styles.cardList}>
                  {orders.filter(o => o.status === 'Accepted').map(order => (
                    <div key={order.id} style={styles.orderCard} onClick={() => setSelectedOrder(order)}>
                      <div style={styles.cardTopRow}>
                        <div>
                          <strong style={{fontSize: '15px', color: '#0f172a'}}>{order.customer}</strong>
                          <div style={{fontSize: '11px', color: '#64748b'}}>{order.id} · {order.time}</div>
                        </div>
                        <span style={styles.acceptedTag}>ACCEPTED</span>
                      </div>
                      <div style={styles.tagsRow}>
                        <span style={styles.tag}>🛵 {order.type}</span>
                        <span style={styles.tag}>🟢 {order.channel}</span>
                      </div>
                      <div style={styles.timeTag}>🕒 {order.duration}</div>
                      <div style={styles.orderItems}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={styles.itemRow}>
                            <span>{item.name} ×{item.qty}</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.cardActionsFull} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateOrderStatus(order.id, 'Preparing')} style={styles.startPrepBtn}>Start preparing</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. PREPARING */}
              <div style={styles.column}>
                <div style={styles.columnHeader}>
                  <span>Preparing</span>
                  <span style={styles.colBadge}>{orders.filter(o => o.status === 'Preparing').length}</span>
                </div>
                <div style={styles.cardList}>
                  {orders.filter(o => o.status === 'Preparing').map(order => (
                    <div key={order.id} style={styles.orderCard} onClick={() => setSelectedOrder(order)}>
                      <div style={styles.cardTopRow}>
                        <div>
                          <strong style={{fontSize: '15px', color: '#0f172a'}}>{order.customer}</strong>
                          <div style={{fontSize: '11px', color: '#64748b'}}>{order.id} · {order.time}</div>
                        </div>
                        <span style={styles.prepTag}>PREPARING</span>
                      </div>
                      <div style={styles.tagsRow}>
                        <span style={styles.tag}>🛵 {order.type}</span>
                        <span style={styles.tag}>🌐 {order.channel}</span>
                      </div>
                      <div style={styles.timeTag}>🕒 {order.duration}</div>
                      <div style={styles.orderItems}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={styles.itemRow}>
                            <span>{item.name} ×{item.qty}</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.cardActionsFull} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateOrderStatus(order.id, 'Ready')} style={styles.markReadyBtn}>Mark ready</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. READY */}
              <div style={styles.column}>
                <div style={styles.columnHeader}>
                  <span>Ready</span>
                  <span style={styles.colBadge}>{orders.filter(o => o.status === 'Ready').length}</span>
                </div>
                <div style={styles.cardList}>
                  {orders.filter(o => o.status === 'Ready').map(order => (
                    <div key={order.id} style={styles.orderCard} onClick={() => setSelectedOrder(order)}>
                      <div style={styles.cardTopRow}>
                        <div>
                          <strong style={{fontSize: '15px', color: '#0f172a'}}>{order.customer}</strong>
                          <div style={{fontSize: '11px', color: '#64748b'}}>{order.id} · {order.time}</div>
                        </div>
                        <span style={styles.readyTag}>READY</span>
                      </div>
                      <div style={styles.tagsRow}>
                        <span style={styles.tag}>🛵 {order.type}</span>
                        <span style={styles.tag}>🌐 {order.channel}</span>
                      </div>
                      <div style={styles.timeTag}>🕒 {order.duration}</div>
                      <div style={styles.orderItems}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={styles.itemRow}>
                            <span>{item.name} ×{item.qty}</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.cardActionsFull} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateOrderStatus(order.id, 'Picked Up')} style={styles.markPickedUpBtn}>Mark picked up</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. PICKED UP */}
              <div style={styles.column}>
                <div style={styles.columnHeader}>
                  <span>Picked Up</span>
                  <span style={styles.colBadge}>{orders.filter(o => o.status === 'Picked Up').length}</span>
                </div>
                <div style={styles.cardList}>
                  {orders.filter(o => o.status === 'Picked Up').map(order => (
                    <div key={order.id} style={styles.orderCard} onClick={() => setSelectedOrder(order)}>
                      <div style={styles.cardTopRow}>
                        <div>
                          <strong style={{fontSize: '15px', color: '#0f172a'}}>{order.customer}</strong>
                          <div style={{fontSize: '11px', color: '#64748b'}}>{order.id} · {order.time}</div>
                        </div>
                        <span style={styles.pickedUpTag}>PICKED UP</span>
                      </div>
                      <div style={styles.tagsRow}>
                        <span style={styles.tag}>🛵 {order.type}</span>
                        <span style={styles.tag}>🌐 {order.channel}</span>
                      </div>
                      <div style={styles.timeTag}>🕒 {order.duration}</div>
                      <div style={styles.orderItems}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={styles.itemRow}>
                            <span>{item.name} ×{item.qty}</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* SLIDE-OVER ORDER DETAILS & RECEIPT DRAWER */}
      {selectedOrder && (
        <div style={styles.drawerOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <h3 style={{margin: 0, fontSize: '18px'}}>Order details & Receipt</h3>
              <div style={{display: 'flex', gap: '8px'}}>
                <button onClick={handlePrintReceipt} style={styles.printBtn} title="Print Receipt">🖨️ Print</button>
                <button onClick={() => setSelectedOrder(null)} style={styles.closeDrawerBtn}>Close</button>
              </div>
            </div>

            <div style={styles.drawerBody}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                <div>
                  <h2 style={{margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a'}}>{selectedOrder.customer}</h2>
                  <div style={{fontSize: '12px', color: '#64748b'}}>{selectedOrder.id} · {selectedOrder.time}</div>
                </div>
                <span style={styles.statusPill}>{selectedOrder.status.toUpperCase()}</span>
              </div>

              <div style={{display: 'flex', gap: '8px', marginBottom: '15px'}}>
                <span style={styles.tag}>🛵 {selectedOrder.type}</span>
                <span style={styles.tag}>🌐 {selectedOrder.channel}</span>
                <span style={styles.tag}>🕒 {selectedOrder.duration}</span>
              </div>

              <div style={{fontSize: '13px', color: '#334155', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px'}}>
                📍 {selectedOrder.address}<br/>
                📞 <a href={`tel:${selectedOrder.phone}`} style={{color: '#2563eb', fontWeight: '600'}}>{selectedOrder.phone}</a>
              </div>

              <div style={{marginBottom: '20px'}}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px'}}>
                    <div>
                      <div style={{fontWeight: '500'}}>{item.name} ×{item.qty}</div>
                      {item.desc && <div style={{fontSize: '11px', color: '#64748b'}}>{item.desc}</div>}
                    </div>
                    <div style={{fontWeight: '600'}}>₹{item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{borderTop: '1px solid #e2e8f0', paddingTop: '15px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>Sub total</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{display: 'flex', justifyContent: 'space-between', color: '#16a34a'}}>
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>GST</span>
                  <span>₹{selectedOrder.gst.toFixed(2)}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '5px'}}>
                  <span>Total</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '4px'}}>
                  <span>Payment · {selectedOrder.payment}</span>
                  <span style={{color: '#16a34a', fontWeight: 'bold'}}>{selectedOrder.payment}</span>
                </div>
              </div>
            </div>

            <div style={styles.drawerFooter}>
              {selectedOrder.status === 'New' && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, 'Accepted')} style={styles.drawerActionBtn}>Accept Order</button>
              )}
              {selectedOrder.status === 'Accepted' && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, 'Preparing')} style={styles.drawerActionBtn}>Start preparing</button>
              )}
              {selectedOrder.status === 'Preparing' && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, 'Ready')} style={styles.drawerActionBtn}>Mark ready</button>
              )}
              {selectedOrder.status === 'Ready' && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, 'Picked Up')} style={styles.drawerActionBtn}>Mark picked up</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div style={styles.drawerOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>Restaurant Admin Profile</h3>
              <button onClick={() => setShowProfileModal(false)} style={styles.closeDrawerBtn}>✕</button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div style={styles.profileCard}>
                <div style={styles.profileLabel}>Business Name</div>
                <div style={styles.profileValue}>{profileData.businessName}</div>
              </div>
              <div style={styles.profileCard}>
                <div style={styles.profileLabel}>Owner Name</div>
                <div style={styles.profileValue}>{profileData.ownerName}</div>
              </div>
              <div style={styles.profileCard}>
                <div style={styles.profileLabel}>Email Address</div>
                <div style={styles.profileValue}>{profileData.email}</div>
              </div>
              <div style={styles.profileCard}>
                <div style={styles.profileLabel}>Phone Number</div>
                <div style={styles.profileValue}>{profileData.phone}</div>
              </div>
              <div style={styles.profileCard}>
                <div style={styles.profileLabel}>Registered Address</div>
                <div style={styles.profileValue}>{profileData.address}</div>
              </div>
            </div>

            <button onClick={() => setShowProfileModal(false)} style={{...styles.drawerActionBtn, marginTop: '24px'}}>
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden', margin: 0, padding: 0, boxSizing: 'border-box' },
  sidebar: { width: '260px', backgroundColor: '#022c22', display: 'flex', flexDirection: 'column', color: '#ffffff', flexShrink: 0, height: '100vh' },
  brandBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoIcon: { fontSize: '24px' },
  brandName: { fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' },
  brandSub: { fontSize: '10px', color: '#6ee7b7', letterSpacing: '1px', fontWeight: '600' },
  navLinks: { listStyle: 'none', padding: '10px 0', margin: 0, overflowY: 'auto', flex: 1 },
  navItem: { padding: '12px 20px', fontSize: '14px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' },
  navItemActive: { padding: '12px 20px', fontSize: '14px', color: '#ffffff', backgroundColor: '#064e3b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #10b981', fontWeight: '600' },
  badgeCount: { backgroundColor: '#10b981', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' },
  userInfo: { padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#01231b', cursor: 'pointer' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', width: 'calc(100vw - 260px)' },
  header: { height: '65px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', flexShrink: 0 },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
  pausedItemsBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' },
  bellIcon: { fontSize: '18px', cursor: 'pointer' },
  topLogoutBtn: { backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  subHeader: { padding: '15px 25px', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', fontSize: '14px' },
  tabContentPlaceholder: { padding: '40px', flex: 1, backgroundColor: '#f8fafc' },
  kanbanBoard: { display: 'flex', gap: '16px', padding: '20px', overflowX: 'auto', flex: 1, backgroundColor: '#f8fafc', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' },
  column: { backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', width: '300px', minWidth: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: '100%' },
  columnHeader: { padding: '14px 16px', fontWeight: '700', fontSize: '14px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' },
  colBadge: { backgroundColor: '#cbd5e1', color: '#334155', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' },
  cardList: { overflowY: 'auto', padding: '10px', flex: 1 },
  orderCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer' },
  cardTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  newTag: { backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  acceptedTag: { backgroundColor: '#fef9c3', color: '#854d0e', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  prepTag: { backgroundColor: '#ffedd5', color: '#c2410c', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  readyTag: { backgroundColor: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  pickedUpTag: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  tagsRow: { display: 'flex', gap: '6px', marginBottom: '8px' },
  tag: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' },
  timeTag: { fontSize: '11px', color: '#64748b', marginBottom: '12px', fontWeight: '500' },
  orderItems: { borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '10px 0', marginBottom: '12px', fontSize: '13px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '500', color: '#1e293b', marginBottom: '4px' },
  cardActions: { display: 'flex', gap: '10px' },
  rejectBtn: { flex: 1, backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  acceptBtn: { flex: 1, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  cardActionsFull: { display: 'flex' },
  startPrepBtn: { width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  markReadyBtn: { width: '100%', backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  markPickedUpBtn: { width: '100%', backgroundColor: '#047857', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  drawerOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 },
  drawer: { width: '420px', backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)' },
  drawerHeader: { padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  printBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  closeDrawerBtn: { backgroundColor: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  drawerBody: { padding: '20px', flex: 1, overflowY: 'auto' },
  statusPill: { backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
  drawerFooter: { padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  drawerActionBtn: { width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  profileModal: { width: '420px', backgroundColor: '#ffffff', padding: '25px', borderRadius: '14px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', margin: 'auto' },
  profileCard: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px' },
  profileLabel: { fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' },
  profileValue: { fontSize: '14px', fontWeight: '600', color: '#0f172a' }
};