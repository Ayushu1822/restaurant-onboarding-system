import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const FALLBACK_RESTAURANT_PROFILE = {
  businessName: 'NewWorld Restaurant',
  ownerName: 'Ayush',
  phone: '8218579235',
  whatsappNumber: '8218579235'
};

const HYBRID_DUMMY_ORDERS = [
  { id: '#KO01/000001', orderId: 'd1', customer: 'Rahul Sharma', time: '2m ago', status: 'New', type: 'Delivery', channel: 'WhatsApp', items: [{ name: 'Chicken Drumsticks', qty: 2, price: 199.00, desc: 'Spicy · Serves 1' }, { name: 'Sprite', qty: 2, price: 60.00, desc: 'Cold 300ml' }], address: '12, MG Road, Bengaluru', phone: '9876543210', customerRequest: 'Make it extra spicy please.', subtotal: 518.00, total: 507.10 },
  { id: '#KO01/000002', orderId: 'd2', customer: 'Neha Kapoor', time: '12m ago', status: 'New', type: 'Delivery', channel: 'Swiggy', items: [{ name: 'Lucknowi Biryani', qty: 2, price: 350.00, desc: 'Authentic spices · Serves 2' }, { name: 'Chicken 65', qty: 1, price: 220.00, desc: 'Crispy starter' }], address: 'Indiranagar, Bengaluru', phone: '9811223399', customerRequest: 'Deliver without ringing doorbell.', subtotal: 920.00, total: 986.00 },
  { id: '#KO01/000003', orderId: 'd3', customer: 'Karan Singh', time: '25m ago', status: 'Accepted', type: 'Pickup', channel: 'Zomato', items: [{ name: 'Paneer Tikka Sandwich', qty: 2, price: 229.00, desc: 'Grilled with mint chutney' }, { name: 'Cold Coffee', qty: 2, price: 120.00, desc: 'Thick shake' }], address: '44, Residency Road, Bengaluru', phone: '9123456711', customerRequest: '', subtotal: 698.00, total: 733.00 },
  { id: '#KO01/000004', orderId: 'd4', customer: 'Ananya Verma', time: '35m ago', status: 'Preparing', type: 'Delivery', channel: 'WhatsApp', items: [{ name: 'Butter Chicken', qty: 1, price: 420.00, desc: 'Rich gravy · Serves 2' }, { name: 'Garlic Naan', qty: 4, price: 45.00, desc: 'Tandoor baked' }], address: 'Koramangala 4th Block, Bengaluru', phone: '9988776655', customerRequest: 'Extra butter on naan.', subtotal: 600.00, total: 655.00 },
  { id: '#KO01/000005', orderId: 'd5', customer: 'Vikram Malhotra', time: '42m ago', status: 'Ready', type: 'Delivery', channel: 'Web', items: [{ name: 'Pepperoni Pizza', qty: 1, price: 599.00, desc: 'Large 12 inch' }, { name: 'Coke Zero', qty: 2, price: 90.00, desc: 'Can 330ml' }], address: 'Jayanagar 3rd Block, Bengaluru', phone: '9711223344', customerRequest: 'Cut into 8 slices.', subtotal: 779.00, total: 742.95 },
  { id: '#KO01/000006', orderId: 'd6', customer: 'Pooja Hegde', time: '50m ago', status: 'Picked Up', type: 'Pickup', channel: 'Web', items: [{ name: 'Veg Hakka Noodles', qty: 2, price: 180.00, desc: 'Wok tossed veggies' }, { name: 'Chilli Paneer Dry', qty: 1, price: 260.00, desc: 'Semi-gravy spicy' }], address: 'MG Road Counter Pickup', phone: '9844556677', customerRequest: 'Pack extra soy sauce.', subtotal: 620.00, total: 651.00 },
  { id: '#KO01/000007', orderId: 'd7', customer: 'Siddharth Roy', time: '1h ago', status: 'New', type: 'Delivery', channel: 'WhatsApp', items: [{ name: 'Mutton Rogan Josh', qty: 1, price: 550.00, desc: 'Kashmiri style delicacy' }, { name: 'Tandoori Roti', qty: 3, price: 30.00, desc: 'Whole wheat' }], address: 'Ulsoor, Bengaluru', phone: '9122334455', customerRequest: 'Make gravy medium spicy.', subtotal: 640.00, total: 692.00 },
  { id: '#KO01/000008', orderId: 'd8', customer: 'Meera Nambiar', time: '1h 15m ago', status: 'Accepted', type: 'Delivery', channel: 'Swiggy', items: [{ name: 'Crispy Veg Burger', qty: 2, price: 149.00, desc: 'Potato & corn patty' }, { name: 'French Fries', qty: 1, price: 110.00, desc: 'Large salted' }], address: 'Whitefield, Bengaluru', phone: '9899887766', customerRequest: 'Provide ketchup sachets.', subtotal: 408.00, total: 415.90 },
  { id: '#KO01/000009', orderId: 'd9', customer: 'Aditya Rao', time: '1h 30m ago', status: 'Preparing', type: 'Delivery', channel: 'Zomato', items: [{ name: 'Hyderabadi Chicken Dum Biryani', qty: 2, price: 320.00, desc: 'With mirchi ka salan' }], address: 'BTM Layout, Bengaluru', phone: '9333222111', customerRequest: 'Add extra boiled egg.', subtotal: 640.00, total: 692.00 },
  { id: '#KO01/000010', orderId: 'd10', customer: 'Divya Menon', time: '2h ago', status: 'Ready', type: 'Pickup', channel: 'Web', items: [{ name: 'Chocolate Lava Cake', qty: 3, price: 150.00, desc: 'Warm gooey center' }, { name: 'Vanilla Ice Cream Scoop', qty: 3, price: 60.00, desc: 'Side serving' }], address: 'Residency Road Store Counter', phone: '9555666777', customerRequest: 'Pack securely for travel.', subtotal: 630.00, total: 661.50 }
];

export default function Dashboard({ user, onLogout }) {
  const loggedInEmail = user?.email || localStorage.getItem('userEmail') || 'novio@gmail.com';

  const [activeTab, setActiveTab] = useState('Online Orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
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
  const [orders, setOrders] = useState(HYBRID_DUMMY_ORDERS);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch profile specifically tied to logged-in email
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/restaurants/email/${loggedInEmail}`)
      .then(res => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      })
      .then(data => {
        if (data && data.businessName) {
          if (data.restaurantId) setRestaurantId(data.restaurantId);
          const fetched = {
            businessName: data.businessName,
            ownerName: data.ownerName,
            email: loggedInEmail,
            phone: data.phoneNumber || data.phone_number || FALLBACK_RESTAURANT_PROFILE.phone,
            whatsappNumber: data.whatsappNumber || data.whatsapp_number || FALLBACK_RESTAURANT_PROFILE.whatsappNumber
          };
          setProfileData(fetched);
          setEditForm(fetched);
        }
      })
      .catch(err => {
        console.log("Using fallback profile data:", err);
      });
  }, [loggedInEmail]);

  // Fetch database orders with hybrid fallback
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
        if (orderList.length === 0) {
          setIsFallbackMode(true);
          setOrders(HYBRID_DUMMY_ORDERS);
          setSelectedOrder(HYBRID_DUMMY_ORDERS[0]);
          setLoadingOrders(false);
          return;
        }

        setIsFallbackMode(false);
        const formattedOrders = orderList.map((o, index) => {
          const rawItems = o.items || o.orderItems || [];
          const mappedItems = rawItems.map(i => ({
            name: i.itemName || i.item_name || 'Food Item',
            qty: i.quantity || 1,
            price: i.unitPrice || i.unit_price || 150.00,
            desc: i.itemDescription || i.item_description || ''
          }));

          return {
            id: o.displayId || o.display_id || o.id || `#KO01/00000${index + 1}`,
            orderId: o.orderId || o.order_id || o.id,
            customer: o.customerName || o.customer_name || 'Valued Customer',
            time: '5m ago',
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
        console.warn("Backend unavailable, activating hybrid fallback:", err);
        setIsFallbackMode(true);
        setOrders(HYBRID_DUMMY_ORDERS);
        setSelectedOrder(HYBRID_DUMMY_ORDERS[0]);
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
        const savedProfile = {
          ...profileData,
          businessName: updated.businessName || editForm.businessName,
          ownerName: updated.ownerName || editForm.ownerName,
          phone: updated.phoneNumber || updated.phone_number || editForm.phone,
          whatsappNumber: updated.whatsappNumber || updated.whatsapp_number || editForm.whatsappNumber
        };
        setProfileData(savedProfile);
        setIsEditingProfile(false);
        alert('Profile permanently updated and saved to database!');
      })
      .catch(err => {
        setProfileData(editForm);
        setIsEditingProfile(false);
        alert('Profile updated locally! (Server sync notice: ' + err.message + ')');
      });
  };

  const updateOrderStatus = (orderId, currentStatus) => {
    let nextStatus = 'Accepted';
    if (currentStatus === 'New') nextStatus = 'Accepted';
    else if (currentStatus === 'Accepted') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Ready';
    else if (currentStatus === 'Ready') nextStatus = 'Picked Up';
    else return;

    const updatedList = orders.map(o => (o.orderId === orderId || o.id === orderId) ? { ...o, status: nextStatus } : o);
    setOrders(updatedList);
    const found = updatedList.find(o => o.orderId === orderId || o.id === orderId);
    if (found) setSelectedOrder(found);

    fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/status?status=${nextStatus}`, {
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

        <div style={styles.userInfo} onClick={() => { setShowProfileModal(true); setIsEditingProfile(false); }}>
          <div style={styles.userAvatar}>{profileData.ownerName && profileData.ownerName !== 'Loading...' ? profileData.ownerName.substring(0, 2).toUpperCase() : 'AY'}</div>
          <div style={{flex: 1, overflow: 'hidden', textAlign: 'left'}}>
            <div style={{fontSize: '13px', fontWeight: 'bold', color: '#fff'}}>{profileData.ownerName}</div>
            <div style={{fontSize: '11px', color: '#6ee7b7'}}>{profileData.businessName}</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h2 style={styles.pageTitle}>{activeTab}</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button onClick={() => setActiveTab('Menu')} style={styles.pausedItemsBtn}>
              Manage Paused Items <span style={styles.pausedCountBadge}>5</span>
            </button>
            <button onClick={onLogout} style={styles.topLogoutBtn}>Sign Out</button>
          </div>
        </div>

        {/* RED-LINED FALLBACK BANNER */}
        {isFallbackMode && activeTab === 'Online Orders' && (
          <div style={styles.fallbackNoticeBar}>
            <span style={{color: '#dc2626', fontWeight: 'bold'}}>⚠️ Fallback Mode Active:</span> Showing hybrid offline test orders (Database currently connecting or syncing).
          </div>
        )}

        {activeTab !== 'Online Orders' ? (
          <div style={styles.tabContentPlaceholder}>
            <div style={styles.placeholderCard}>
              <h2 style={{color: '#0f172a', margin: '0 0 8px 0', textAlign: 'left'}}>{activeTab} Management Panel</h2>
              <p style={{color: '#64748b', margin: 0, textAlign: 'left'}}>Module for restaurant {activeTab.toLowerCase()}.</p>
            </div>
          </div>
        ) : (
          <div style={styles.onlineOrdersContainer}>
            <div style={styles.subHeader}>
              <span style={{fontWeight: '600', color: '#0f172a'}}>
                {orders.length} orders total · <span style={{color: '#16a34a'}}>{orders.filter(o => o.status === 'New').length} need action</span>
              </span>
            </div>

            <div style={styles.splitViewWrapper}>
              
              {/* LEFT LIST */}
              <div style={styles.masterListColumn}>
                <div style={styles.listHeaderTopRow}>
                  <span style={styles.listHeaderTitle}>All orders ({orders.length})</span>
                </div>
                
                <div style={styles.scrollableCards}>
                  {loadingOrders ? (
                    <div style={{padding: '20px', textAlign: 'center'}}>Loading database orders...</div>
                  ) : orders.length === 0 ? (
                    <div style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>No orders found.</div>
                  ) : (
                    orders.map(order => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <div 
                          key={order.id} 
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

              {/* RIGHT DETAILS */}
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
                          onClick={() => updateOrderStatus(selectedOrder.orderId || selectedOrder.id, selectedOrder.status)} 
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
      </div>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div style={styles.drawerOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{margin: '0 0 15px 0', color: '#0f172a'}}>Admin Profile</h3>
            
            {!isEditingProfile ? (
              <div>
                <p style={{color: '#334155'}}><strong>Business:</strong> {profileData.businessName}</p>
                <p style={{color: '#334155'}}><strong>Owner:</strong> {profileData.ownerName}</p>
                <p style={{color: '#334155'}}><strong>Email:</strong> {profileData.email}</p>
                <p style={{color: '#334155'}}><strong>Phone:</strong> {profileData.phone}</p>
                <p style={{color: '#334155'}}><strong>WhatsApp:</strong> {profileData.whatsappNumber}</p>
                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  <button onClick={() => setIsEditingProfile(true)} style={styles.actionBtn}>Edit Profile</button>
                  <button onClick={() => setShowProfileModal(false)} style={{...styles.actionBtn, backgroundColor: '#64748b'}}>Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Business Name:</label>
                <input 
                  style={{padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                  value={editForm.businessName} 
                  onChange={e => setEditForm({...editForm, businessName: e.target.value})} 
                />
                
                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Owner Name:</label>
                <input 
                  style={{padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                  value={editForm.ownerName} 
                  onChange={e => setEditForm({...editForm, ownerName: e.target.value})} 
                />

                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Phone Number:</label>
                <input 
                  style={{padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                />

                <label style={{fontSize: '12px', fontWeight: 'bold'}}>WhatsApp Number:</label>
                <input 
                  style={{padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                  value={editForm.whatsappNumber} 
                  onChange={e => setEditForm({...editForm, whatsappNumber: e.target.value})} 
                />

                <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                  <button type="submit" style={styles.actionBtn}>Save Changes</button>
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
  container: { display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflowY: 'auto', fontFamily: 'sans-serif' },
  sidebar: { width: '260px', backgroundColor: '#022c22', display: 'flex', flexDirection: 'column', color: '#fff', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 },
  brandBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoIcon: { fontSize: '24px' },
  brandName: { fontSize: '18px', fontWeight: '800' },
  brandSub: { fontSize: '10px', color: '#6ee7b7' },
  navLinks: { listStyle: 'none', padding: '10px 0', margin: 0, flex: 1, overflowY: 'auto' },
  navItem: { padding: '12px 20px', fontSize: '14px', color: '#94a3b8', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', textAlign: 'left' },
  navItemHover: { backgroundColor: '#033d30', color: '#fff' },
  navItemActive: { padding: '12px 20px', fontSize: '14px', color: '#fff', backgroundColor: '#047857', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderLeft: '4px solid #10b981', fontWeight: '600', textAlign: 'left' },
  badgeCount: { backgroundColor: '#10b981', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' },
  userInfo: { padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#01231b', cursor: 'pointer' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowY: 'auto' },
  header: { height: '65px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', flexShrink: 0 },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
  fallbackNoticeBar: { backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', borderLeft: '4px solid #dc2626', padding: '10px 25px', fontSize: '13px', color: '#991b1b', textAlign: 'left' },
  pausedItemsBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' },
  pausedCountBadge: { backgroundColor: '#e11d48', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' },
  topLogoutBtn: { backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  onlineOrdersContainer: { display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#f8fafc' },
  subHeader: { padding: '12px 25px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', fontSize: '14px', textAlign: 'left' },
  splitViewWrapper: { display: 'flex', flex: 1, padding: '20px', gap: '24px' },
  masterListColumn: { flex: 1, display: 'flex', flexDirection: 'column' },
  detailPanelColumn: { flex: 1.2, display: 'flex', flexDirection: 'column' },
  listHeaderTopRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  listHeaderTitle: { fontSize: '14px', fontWeight: '700', color: '#334155', textAlign: 'left' },
  scrollableCards: { display: 'flex', flexDirection: 'column', gap: '14px' },
  orderSummaryCard: { border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', cursor: 'pointer', backgroundColor: '#fff', textAlign: 'left' },
  detailCard: { backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '24px', textAlign: 'left' },
  emptyDetailPrompt: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#64748b', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statusBadgeSmall: (status) => ({
    backgroundColor: status === 'New' ? '#e0f2fe' : status === 'Accepted' ? '#fef9c3' : status === 'Preparing' ? '#ffedd5' : status === 'Ready' ? '#ede9fe' : '#dcfce7',
    color: status === 'New' ? '#0369a1' : status === 'Accepted' ? '#854d0e' : status === 'Preparing' ? '#c2410c' : status === 'Ready' ? '#6d28d9' : '#15803d',
    fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase'
  }),
  customerRequestBox: { backgroundColor: '#fef3c7', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', color: '#92400e', marginBottom: '16px', textAlign: 'left' },
  printIconBtn: { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  actionBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
  tabContentPlaceholder: { padding: '40px', flex: 1, display: 'flex', justifyContent: 'center' },
  placeholderCard: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '600px' },
  drawerOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  profileModal: { width: '420px', backgroundColor: '#fff', padding: '25px', borderRadius: '14px', textAlign: 'left' }
};