import React, { useState, useEffect } from 'react';

// Import all modular sub-components
import KitchenModule from './KitchenModule';
import MenuModule from './MenuModule';
import ReportsModule from './ReportsModule';
import CustomersModule from './CustomersModule';
import ComplaintsModule from './ComplaintsModule';
import TablesModule from './TablesModule';
import CounterPOS from './CounterPOS';
import PromotionsModule from './PromotionsModule';
import GalleryModule from './GalleryModule';
import SettingsModule from './SettingsModule';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const FALLBACK_RESTAURANT_PROFILE = {
  businessName: 'NewWorld Restaurant',
  ownerName: 'Ayush',
  phone: '8218579235',
  whatsappNumber: '8218579235'
};

export default function Dashboard({ user, onLogout }) {
  const loggedInEmail = user?.email || localStorage.getItem('userEmail') || 'novio@gmail.com';

  const [activeTab, setActiveTab] = useState('Online Orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  
  const [isProfileFallback, setIsProfileFallback] = useState(false);
  const [isOrdersFallback, setIsOrdersFallback] = useState(false);
  
  // Live Table Stats State for Header Bar
  const [tableStats, setTableStats] = useState({ open: 5, total: 10, occupied: 3, billing: 1 });
  const [pausedCount, setPausedCount] = useState(0);

  const [restaurantId, setRestaurantId] = useState('ae41c831-372b-4f56-8905-f67a93b8045b');
  const [profileData, setProfileData] = useState({
    businessName: FALLBACK_RESTAURANT_PROFILE.businessName,
    ownerName: FALLBACK_RESTAURANT_PROFILE.ownerName,
    email: loggedInEmail,
    phone: FALLBACK_RESTAURANT_PROFILE.phone,
    whatsappNumber: FALLBACK_RESTAURANT_PROFILE.whatsappNumber
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch live table stats & paused items count from PostgreSQL
  const fetchHeaderData = () => {
    fetch(`${API_BASE_URL}/api/v1/tables`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const open = data.filter(t => t.status === 'Available').length;
          const occupied = data.filter(t => t.status === 'Occupied').length;
          const billing = data.filter(t => t.status === 'Billing' || t.status === 'Ready to Pay').length;
          setTableStats({ open, total: data.length, occupied, billing });
        }
      })
      .catch(err => console.log("Table stats sync note:", err));

    fetch(`${API_BASE_URL}/api/v1/menu`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const paused = data.filter(i => i.status === 'PAUSED').length;
          setPausedCount(paused);
        }
      })
      .catch(err => console.log("Paused items sync note:", err));
  };

  useEffect(() => {
    fetchHeaderData();
    const interval = setInterval(fetchHeaderData, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/restaurants/email/${loggedInEmail}`)
      .then(res => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      })
      .then(data => {
        if (data) {
          setIsProfileFallback(false);
          const fetchedId = data.restaurantId || data.restaurant_id || data.id;
          if (fetchedId) setRestaurantId(fetchedId);
          const fetched = {
            businessName: data.businessName || data.business_name || FALLBACK_RESTAURANT_PROFILE.businessName,
            ownerName: data.ownerName || data.owner_name || FALLBACK_RESTAURANT_PROFILE.ownerName,
            email: loggedInEmail,
            phone: data.phoneNumber || data.phone_number || FALLBACK_RESTAURANT_PROFILE.phone,
            whatsappNumber: data.whatsappNumber || data.whatsapp_number || FALLBACK_RESTAURANT_PROFILE.whatsappNumber
          };
          setProfileData(fetched);
          setEditForm(fetched);
        }
      })
      .catch(err => {
        console.log("Profile offline/fallback active:", err);
        setIsProfileFallback(true);
      });
  }, [loggedInEmail]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/orders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server status ${res.status}`);
        return res.json();
      })
      .then(data => {
        let orderList = Array.isArray(data) ? data : [];
        setIsOrdersFallback(false);
        
        // Strict Online Orders Filter (excluding COUNTER, POS, WALK-IN)
        const onlineOnlyList = orderList.filter(o => {
          const ch = (o.channel || '').toUpperCase();
          const type = (o.orderType || '').toUpperCase();
          return ch !== 'COUNTER' && ch !== 'POS' && ch !== 'WALK-IN' && type !== 'DINE-IN' && type !== 'TAKEAWAY';
        });

        const formattedOrders = onlineOnlyList.map((o, index) => {
          const rawItems = o.items || o.orderItems || [];
          const mappedItems = rawItems.map(i => ({
            name: i.itemName || i.item_name || 'Food Item',
            qty: i.quantity || 1,
            price: i.unitPrice || i.unit_price || 150.00,
            desc: i.itemDescription || i.item_description || ''
          }));

          const resolvedOrderId = o.orderId || o.order_id || o.id;
          const resolvedDisplayId = o.displayId || o.display_id || resolvedOrderId || `#KO01/00000${index + 1}`;

          return {
            id: resolvedDisplayId,
            orderId: resolvedOrderId,
            customer: o.customerName || o.customer_name || 'Valued Customer',
            time: 'Just now',
            status: o.status || 'New',
            type: o.orderType || o.order_type || 'Delivery',
            channel: o.channel || 'WhatsApp',
            items: mappedItems.length > 0 ? mappedItems : [{ name: 'Order Meal', qty: 1, price: 200.00, desc: '' }],
            address: o.deliveryAddress || o.delivery_address || 'MG Road, Bengaluru',
            phone: o.customerPhone || o.customer_phone || '9876543210',
            customerRequest: o.customerRequest || o.customer_request || '',
            subtotal: o.subtotal || 500.00,
            total: o.totalAmount || o.total_amount || 540.00
          };
        });

        setOrders(formattedOrders);
        if (formattedOrders.length > 0) setSelectedOrder(formattedOrders[0]);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error("❌ FETCH FAILED:", err);
        setIsOrdersFallback(true);
        setOrders([]);
        setLoadingOrders(false);
      });
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/v1/restaurants/${restaurantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: editForm.businessName,
        ownerName: editForm.ownerName,
        phoneNumber: editForm.phone,
        whatsappNumber: editForm.whatsappNumber
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update profile on server');
        return res.json();
      })
      .then(updated => {
        setIsProfileFallback(false);
        const savedProfile = {
          ...profileData,
          businessName: updated.businessName || editForm.businessName,
          ownerName: updated.ownerName || editForm.ownerName,
          phone: updated.phoneNumber || updated.phone_number || editForm.phone,
          whatsappNumber: updated.whatsappNumber || updated.whatsapp_number || editForm.whatsappNumber
        };
        setProfileData(savedProfile);
        setEditForm(savedProfile);
        setIsEditingProfile(false);
        setShowProfileModal(false);
        alert('Profile globally updated and saved to PostgreSQL database!');
      })
      .catch(err => {
        alert('Error saving profile globally: ' + err.message);
      });
  };

  const updateOrderStatus = (targetId, currentStatus) => {
    let nextStatus = 'Accepted';
    if (currentStatus === 'New') nextStatus = 'Accepted';
    else if (currentStatus === 'Accepted') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Ready';
    else if (currentStatus === 'Ready') nextStatus = 'Picked Up';
    else return;

    const updatedList = orders.map(o => (o.orderId === targetId || o.id === targetId) ? { ...o, status: nextStatus } : o);
    setOrders(updatedList);
    const found = updatedList.find(o => o.orderId === targetId || o.id === targetId);
    if (found) setSelectedOrder(found);

    fetch(`${API_BASE_URL}/api/v1/orders/${targetId}/status?status=${nextStatus}`, {
      method: 'PUT'
    }).catch(err => console.log("Status sync warning:", err));
  };

  const getNextActionLabel = (status) => {
    switch (status) {
      case 'New': return 'Accept Order';
      case 'Accepted': return 'Start Preparing 🍳';
      case 'Preparing': return 'Mark Ready 📦';
      case 'Ready': return 'Complete / Hand Over ✓';
      default: return 'Completed';
    }
  };

  const handlePrintReceipt = () => window.print();

  return (
    <div style={styles.container}>
      {/* Sidebar with Smooth Hover Animations */}
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
                <span style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  {tab === 'Online Orders' ? '🛒' : tab === 'Counter POS' ? '💳' : tab === 'Tables' ? '🪑' : tab === 'Kitchen' ? '🍳' : tab === 'Menu' ? '📖' : tab === 'Reports' ? '📊' : tab === 'Promotions' ? '🏷️' : tab === 'Customers' ? '👥' : tab === 'Complaints' ? '⚠️' : tab === 'Gallery' ? '🖼️' : '⚙️'} {tab}
                </span>
                {tab === 'Online Orders' && <span style={styles.badgeCount}>{orders.filter(o => o.status === 'New').length}</span>}
              </li>
            );
          })}
        </ul>

        {/* Social-Media-Style Admin Profile Widget */}
        <div 
          style={{
            ...styles.userInfo,
            ...(isProfileFallback ? styles.userInfoFallbackRedLine : {})
          }} 
          onClick={() => { setShowProfileModal(true); setIsEditingProfile(false); }}
        >
          <div style={styles.userAvatar}>
            {profileData.ownerName && profileData.ownerName !== 'Loading...' ? profileData.ownerName.substring(0, 2).toUpperCase() : 'AY'}
            <span style={styles.onlineDot}></span>
          </div>
          <div style={{flex: 1, overflow: 'hidden', textAlign: 'left'}}>
            <div style={{fontSize: '13px', fontWeight: '800', color: '#fff'}}>{profileData.ownerName}</div>
            <div style={{fontSize: '11px', color: '#6ee7b7', fontWeight: '600'}}>{profileData.businessName}</div>
          </div>
          <span style={{color: '#94a3b8', fontSize: '14px'}}>⚙️</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h2 style={styles.pageTitle}>{activeTab}</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button 
              onClick={() => setActiveTab('Menu')} 
              style={styles.pausedItemsBtn}
            >
              🔴 Manage Paused Items <span style={styles.pausedCountBadge}>{pausedCount}</span>
            </button>
            <button onClick={onLogout} style={styles.topLogoutBtn}>Sign Out</button>
          </div>
        </div>

        {/* Live Tables Header Bar */}
        <div style={styles.tablesStatusBar} onClick={() => setActiveTab('Tables')}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#334155'}}>
            <span>🪑</span>
            <span>Tables</span>
            <span style={{color: '#cbd5e1'}}>·</span>
            <span style={{color: '#16a34a'}}>{tableStats.open}/{tableStats.total} open</span>
            <span style={{color: '#cbd5e1'}}>·</span>
            <span>{tableStats.occupied} occupied</span>
            <span style={{backgroundColor: '#2563eb', color: '#fff', padding: '1px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700'}}>{tableStats.billing} billing</span>
          </div>
          <span style={{color: '#94a3b8', fontSize: '16px', fontWeight: 'bold'}}>›</span>
        </div>

        {isOrdersFallback && activeTab === 'Online Orders' && (
          <div style={styles.fallbackNoticeBar}>
            <span style={{color: '#dc2626', fontWeight: 'bold'}}>⚠️ Connection Notice:</span> Unable to reach database orders endpoint.
          </div>
        )}

        {/* Dynamic Module Router */}
        {activeTab === 'Online Orders' && (
          <div style={styles.onlineOrdersContainer}>
            <div style={styles.subHeader}>
              <span style={{fontWeight: '700', color: '#0f172a'}}>
                {orders.length} online orders · <span style={{color: '#16a34a'}}>{orders.filter(o => o.status === 'New').length} need action</span>
              </span>
            </div>

            <div style={styles.splitViewWrapper}>
              <div style={styles.masterListColumn}>
                <div style={styles.listHeaderTopRow}>
                  <span style={styles.listHeaderTitle}>All online orders ({orders.length})</span>
                </div>
                
                <div style={styles.scrollableCards}>
                  {loadingOrders ? (
                    <div style={{padding: '20px', textAlign: 'center'}}>Loading database orders...</div>
                  ) : orders.length === 0 ? (
                    <div style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>No online orders found in database.</div>
                  ) : (
                    orders.map(order => {
                      const isSelected = selectedOrder?.orderId === order.orderId;
                      return (
                        <div 
                          key={order.orderId || order.id} 
                          style={{
                            ...styles.orderSummaryCard, 
                            borderColor: isSelected ? '#10b981' : '#cbd5e1'
                          }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                            <div>
                              <strong style={{fontSize: '16px', color: '#0f172a'}}>{order.customer}</strong>
                              <div style={{fontSize: '12px', color: '#64748b'}}>{order.id}</div>
                            </div>
                            <span style={styles.statusBadgeSmall(order.status)}>{order.status}</span>
                          </div>

                          <div style={{fontSize: '12px', color: '#64748b', marginBottom: '12px'}}>
                            🛵 {order.type} · 🟢 {order.channel} · 🕒 {order.time}
                          </div>

                          <div style={{fontSize: '14px', color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '10px'}}>
                            {order.items.map((it, idx) => (
                              <div key={idx} style={{marginBottom: '4px', fontWeight: '500'}}>
                                {it.qty} × {it.name}
                              </div>
                            ))}
                          </div>

                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px'}}>
                            <span>₹{order.total.toFixed(2)}</span>
                            <span style={{color: '#10b981', fontSize: '18px'}}>›</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={styles.detailPanelColumn}>
                <div style={styles.listHeaderTitle}>Order details</div>

                {selectedOrder ? (
                  <div style={styles.detailCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px'}}>
                      <div>
                        <h3 style={{margin: '0 0 2px 0', fontSize: '18px', color: '#0f172a'}}>{selectedOrder.customer}</h3>
                        <div style={{fontSize: '12px', color: '#64748b'}}>{selectedOrder.id} · {selectedOrder.time}</div>
                      </div>
                      <span style={styles.statusBadgeSmall(selectedOrder.status)}>{selectedOrder.status}</span>
                    </div>

                    <div style={{marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px'}}>
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} style={{marginBottom: '12px', fontSize: '14px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '700'}}>
                            <span>{item.name} ×{item.qty}</span>
                            <span>₹{(item.price * item.qty).toFixed(2)}</span>
                          </div>
                          {item.desc && <div style={{fontSize: '12px', color: '#64748b'}}>{item.desc}</div>}
                        </div>
                      ))}
                    </div>

                    <div style={{fontSize: '13px', color: '#334155', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px'}}>
                      📍 {selectedOrder.address}<br/>
                      📞 <span style={{color: '#16a34a', fontWeight: '700'}}>{selectedOrder.phone}</span>
                    </div>

                    {selectedOrder.customerRequest && (
                      <div style={styles.customerRequestBox}>
                        <strong style={{fontSize: '11px', display: 'block', marginBottom: '4px'}}>CUSTOMER REQUEST</strong>
                        <div>{selectedOrder.customerRequest}</div>
                      </div>
                    )}

                    <div style={{fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Sub total</span>
                        <span style={{fontWeight: '600'}}>₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px'}}>
                        <span>Total</span>
                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px'}}>
                      <button onClick={handlePrintReceipt} style={styles.printIconBtn}>🖨️</button>
                      
                      {selectedOrder.status !== 'Picked Up' && selectedOrder.status !== 'Completed' ? (
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.orderId, selectedOrder.status)} 
                          style={styles.actionBtn}
                        >
                          {getNextActionLabel(selectedOrder.status)}
                        </button>
                      ) : (
                        <span style={{color: '#16a34a', fontWeight: '700', fontSize: '14px'}}>Order Completed Successfully ✓</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={styles.emptyDetailPrompt}>Select an order from the list.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Counter POS' && <CounterPOS />}
        {activeTab === 'Tables' && <TablesModule />}
        {activeTab === 'Kitchen' && <KitchenModule />}
        {activeTab === 'Menu' && <MenuModule />}
        {activeTab === 'Reports' && <ReportsModule orders={orders} />}
        {activeTab === 'Customers' && <CustomersModule />}
        {activeTab === 'Complaints' && <ComplaintsModule />}
        {activeTab === 'Promotions' && <PromotionsModule />}
        {activeTab === 'Gallery' && <GalleryModule />}
        {activeTab === 'Settings' && <SettingsModule />}
      </div>

      {/* Social-Media-Style Profile Modal */}
      {showProfileModal && (
        <div style={styles.drawerOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '900'}}>Admin Profile Settings</h3>
              <button onClick={() => setShowProfileModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            {isProfileFallback && (
              <div style={{fontSize: '11px', color: '#dc2626', marginBottom: '12px', fontWeight: 'bold'}}>
                ⚠️ Running on local profile fallback (Database sync pending)
              </div>
            )}
            <div style={styles.modalRedAccentLine}></div>
            
            {!isEditingProfile ? (
              <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <div style={styles.profileCardRow}><span>Business Name:</span> <strong>{profileData.businessName}</strong></div>
                <div style={styles.profileCardRow}><span>Owner Name:</span> <strong>{profileData.ownerName}</strong></div>
                <div style={styles.profileCardRow}><span>Email Address:</span> <strong>{profileData.email}</strong></div>
                <div style={styles.profileCardRow}><span>Phone Number:</span> <strong>{profileData.phone}</strong></div>
                <div style={styles.profileCardRow}><span>WhatsApp Number:</span> <strong>{profileData.whatsappNumber}</strong></div>

                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  <button onClick={() => setIsEditingProfile(true)} style={styles.actionBtn}>Edit Live Profile</button>
                  <button onClick={() => setShowProfileModal(false)} style={{...styles.actionBtn, backgroundColor: '#64748b'}}>Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Business Name:</label>
                <input 
                  style={{padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none'}}
                  value={editForm.businessName} 
                  onChange={e => setEditForm({...editForm, businessName: e.target.value})} 
                  required
                />
                
                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Owner Name:</label>
                <input 
                  style={{padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none'}}
                  value={editForm.ownerName} 
                  onChange={e => setEditForm({...editForm, ownerName: e.target.value})} 
                  required
                />

                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Phone Number:</label>
                <input 
                  style={{padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none'}}
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                  required
                />

                <label style={{fontSize: '12px', fontWeight: 'bold'}}>WhatsApp Number:</label>
                <input 
                  style={{padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none'}}
                  value={editForm.whatsappNumber} 
                  onChange={e => setEditForm({...editForm, whatsappNumber: e.target.value})} 
                  required
                />

                <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                  <button type="submit" style={styles.actionBtn}>Save to Database</button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} style={{...styles.actionBtn, backgroundColor: '#64748b'}}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', margin: 0, padding: 0 },
  sidebar: { width: '260px', backgroundColor: '#022c22', display: 'flex', flexDirection: 'column', color: '#fff', height: '100vh', flexShrink: 0 },
  brandBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoIcon: { fontSize: '24px' },
  brandName: { fontSize: '18px', fontWeight: '900', letterSpacing: '0.02em' },
  brandSub: { fontSize: '10px', color: '#6ee7b7', fontWeight: '700', letterSpacing: '0.05em' },
  navLinks: { listStyle: 'none', padding: '12px 0', margin: 0, flex: 1, overflowY: 'auto' },
  navItem: { padding: '13px 20px', fontSize: '14px', color: '#94a3b8', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', textAlign: 'left', fontWeight: '600', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' },
  navItemHover: { backgroundColor: '#033d30', color: '#fff', transform: 'translateX(4px)' },
  navItemActive: { padding: '13px 20px', fontSize: '14px', color: '#fff', backgroundColor: '#047857', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderLeft: '4px solid #10b981', fontWeight: '800', textAlign: 'left', boxShadow: 'inset 0 0 12px rgba(0,0,0,0.15)' },
  badgeCount: { backgroundColor: '#10b981', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' },
  userInfo: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#01231b', cursor: 'pointer', transition: 'background 0.2s' },
  userInfoFallbackRedLine: { borderBottom: '3px solid #ef4444', backgroundColor: '#450a0a' },
  userAvatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', position: 'relative', border: '2px solid #10b981', fontSize: '13px' },
  onlineDot: { position: 'absolute', bottom: '0px', right: '0px', width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid #01231b' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 },
  header: { height: '65px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', flexShrink: 0 },
  pageTitle: { fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' },
  tablesStatusBar: { backgroundColor: '#eff6ff', borderBottom: '1px solid #dbeafe', padding: '10px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '13px', transition: 'background 0.2s' },
  fallbackNoticeBar: { backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', borderLeft: '4px solid #dc2626', padding: '10px 25px', fontSize: '13px', color: '#991b1b', textAlign: 'left', flexShrink: 0 },
  pausedItemsBtn: { backgroundColor: '#fff', border: '1.5px solid #dc2626', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  pausedCountBadge: { backgroundColor: '#dc2626', color: '#fff', fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: '900' },
  topLogoutBtn: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' },
  onlineOrdersContainer: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', backgroundColor: '#f8fafc', minWidth: 0 },
  subHeader: { padding: '12px 25px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', fontSize: '14px', textAlign: 'left', flexShrink: 0 },
  splitViewWrapper: { display: 'flex', flex: 1, padding: '20px', gap: '24px', overflow: 'hidden', minHeight: 0, minWidth: 0 },
  masterListColumn: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, minWidth: 0 },
  detailPanelColumn: { flex: 1.2, display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 0, minWidth: 0, paddingRight: '5px' },
  listHeaderTopRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexShrink: 0 },
  listHeaderTitle: { fontSize: '14px', fontWeight: '800', color: '#334155', textAlign: 'left', flexShrink: 0, marginBottom: '10px' },
  scrollableCards: { display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1, paddingRight: '5px' },
  orderSummaryCard: { border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '20px', cursor: 'pointer', backgroundColor: '#fff', textAlign: 'left', flexShrink: 0, transition: 'all 0.2s' },
  detailCard: { backgroundColor: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '24px', textAlign: 'left' },
  emptyDetailPrompt: { backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' },
  statusBadgeSmall: (status) => ({
    backgroundColor: status === 'New' ? '#e0f2fe' : status === 'Accepted' ? '#fef9c3' : status === 'Preparing' ? '#ffedd5' : status === 'Ready' ? '#ede9fe' : '#dcfce7',
    color: status === 'New' ? '#0369a1' : status === 'Accepted' ? '#854d0e' : status === 'Preparing' ? '#c2410c' : status === 'Ready' ? '#6d28d9' : '#15803d',
    fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase'
  }),
  customerRequestBox: { backgroundColor: '#fef3c7', border: '1.5px solid #fde68a', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', color: '#92400e', marginBottom: '16px', textAlign: 'left', fontWeight: '600' },
  printIconBtn: { backgroundColor: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
  actionBtn: { backgroundColor: '#047857', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' },
  drawerOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  profileModal: { width: '460px', backgroundColor: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0' },
  modalRedAccentLine: { height: '3px', backgroundColor: '#10b981', width: '100%', marginBottom: '16px', borderRadius: '2px' },
  profileCardRow: { fontSize: '13px', color: '#334155', display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }
};