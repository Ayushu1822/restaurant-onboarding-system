import { useState, useEffect } from 'react';

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

const NAVIGATION_ICONS = {
  'Online Orders': { color: '#36c9a2', paths: ['M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6', 'M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z', 'M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'] },
  'Counter POS': { color: '#82b6ff', paths: ['M4 5h16v14H4z', 'M8 9h8', 'M8 13h2', 'M14 13h2', 'M8 16h2', 'M14 16h2'] },
  Tables: { color: '#f3ad62', paths: ['M4 8h16v4H4z', 'M6 12v8', 'M18 12v8', 'M8 8V5h8v3'] },
  Kitchen: { color: '#ff8585', paths: ['M6 12h12a3 3 0 0 1 3 3v4H3v-4a3 3 0 0 1 3-3Z', 'M8 9c-1-1 1-2 0-3', 'M12 9c-1-1 1-2 0-3', 'M16 9c-1-1 1-2 0-3'] },
  Menu: { color: '#c29aff', paths: ['M6 3h12a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M8 8h8', 'M8 12h8', 'M8 16h5'] },
  Reports: { color: '#66c8d7', paths: ['M4 19V5', 'M4 19h17', 'M8 16v-5', 'M13 16V7', 'M18 16V9'] },
  Promotions: { color: '#f4c65e', paths: ['M20.6 13.4 13 21l-10-10V3h8l9.6 9.6a.6.6 0 0 1 0 .8Z', 'M7 7h.01'] },
  Customers: { color: '#ed91c5', paths: ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'] },
  Complaints: { color: '#ff9a78', paths: ['M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z', 'M12 8v4', 'M12 16h.01'] },
  Gallery: { color: '#a3d77c', paths: ['M4 4h16v16H4z', 'M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'm20 15-5-5L5 20'] },
  Settings: { color: '#b5bec8', paths: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 2.6-.2-.1a1.7 1.7 0 0 0-1.8.4l-.1.1h-3l-.1-.2a1.7 1.7 0 0 0-1.4-1.2h-.2l-2.6-1.5.1-.2a1.7 1.7 0 0 0-.4-1.8l-.1-.1v-3l.2-.1a1.7 1.7 0 0 0 1.2-1.4v-.2l1.5-2.6.2.1a1.7 1.7 0 0 0 1.8-.4l.1-.1h3l.1.2a1.7 1.7 0 0 0 1.4 1.2h.2l2.6 1.5-.1.2a1.7 1.7 0 0 0 .4 1.8l.1.1v3l-.2.1a1.7 1.7 0 0 0-1.2 1.4Z'] }
};

function NavigationIcon({ tab }) {
  const icon = NAVIGATION_ICONS[tab];
  return (
    <svg
      aria-hidden="true"
      className="navGlyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon.paths.map(path => <path d={path} key={path} />)}
    </svg>
  );
}

export default function Dashboard({ user, onLogout }) {
  const loggedInEmail = user?.email || localStorage.getItem('userEmail') || 'novio@gmail.com';

  const [activeTab, setActiveTab] = useState('Online Orders');
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Accepted');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [prepMinutes, setPrepMinutes] = useState(20);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  
  const [isProfileFallback, setIsProfileFallback] = useState(false);
  const [isOrdersFallback, setIsOrdersFallback] = useState(false);
  
  // Checkout & Split Payment Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [splitPayment, setSplitPayment] = useState(false);
  const [pay1Method, setPay1Method] = useState('Cash');
  const [pay1Amount, setPay1Amount] = useState('');
  const [pay2Method, setPay2Method] = useState('UPI');

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
  const [refreshTick, setRefreshTick] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [savingOrderNotes, setSavingOrderNotes] = useState(false);

  useEffect(() => {
    setOrderNote(getOrderNote(selectedOrder));
  }, [selectedOrder?.orderId]);

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
        
        const onlineOnlyList = orderList.filter(o => {
          const ch = (o.channel || o.orderType || '').toUpperCase();
          if (ch.includes('COUNTER') || ch.includes('POS') || ch.includes('WALK-IN')) {
            return false;
          }
          return true;
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
            customerRequest: getOrderNote(o),
            subtotal: o.subtotal || 500.00,
            total: o.totalAmount || o.total_amount || 540.00
          };
        });

        setOrders(formattedOrders);
        if (formattedOrders.length > 0) {
          setSelectedOrder(current => current || formattedOrders[0]);
        }
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error("❌ FETCH FAILED:", err);
        setIsOrdersFallback(true);
        setOrders([]);
        setLoadingOrders(false);
      });
  }, [refreshTick]);

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

    fetch(`${API_BASE_URL}/api/v1/orders/${targetId}/status?status=${encodeURIComponent(nextStatus)}`, {
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

  const orderStatusTabs = ['New', 'Accepted', 'Preparing', 'Ready', 'Picked Up'];
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const query = orderSearch.trim().toLowerCase();
    const matchesSearch = !query || [order.customer, order.id, order.phone]
      .some(value => String(value || '').toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const handleEnableAlerts = async () => {
    if (!('Notification' in window)) {
      setAlertsEnabled(false);
      return;
    }
    const permission = Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
    setAlertsEnabled(permission === 'granted');
  };

  const handlePrintReceipt = () => window.print();

  const saveOrderNotes = async () => {
    if (!selectedOrder?.orderId) return;
    setSavingOrderNotes(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/orders/${selectedOrder.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerRequest: orderNote.trim() })
      });
      if (!response.ok) throw new Error(`Server status ${response.status}`);

      const updatedOrder = {
        ...selectedOrder,
        customerRequest: orderNote.trim()
      };
      setOrders(current => current.map(order =>
        order.orderId === selectedOrder.orderId ? { ...order, ...updatedOrder } : order
      ));
      setSelectedOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to save order notes:', error);
      alert(`Unable to save order notes: ${error.message}`);
    } finally {
      setSavingOrderNotes(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .dashboardSidebar { position: relative; transition: width .18s ease; background-color: #001e16 !important; }
        .sidebarToggle { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 34px; height: 34px; margin: 8px 0 6px 16px; padding: 0; border: 0; border-radius: 7px; background: #0b3328; cursor: pointer; flex: 0 0 auto; }
        .dashboardSidebar > .sidebarToggle { align-self: flex-start; margin-left: 16px; margin-right: auto; }
        .sidebarToggle:hover { background: #124734; }
        .sidebarToggle span { display: block; width: 15px; height: 2px; border-radius: 2px; background: #fff; }
        .sidebarNavLinks { display: flex; flex-direction: column; justify-content: center; align-items: stretch; gap: 3px; }
        .dashboardSidebarExpanded .sidebarNavLinks { align-items: stretch; justify-content: center; }
        .dashboardSidebarExpanded .brandBox { display: flex !important; }
        .navItem { position: relative; display: flex; align-items: center; justify-content: center !important; min-height: 42px; padding: 8px 0 !important; }
        .dashboardSidebarExpanded .navItem { justify-content: flex-start !important; padding: 8px 12px !important; color: #d6e4dd !important; }
        .dashboardSidebarExpanded .navItem > span:first-child { width: auto !important; flex: 1; justify-content: flex-start; }
        .dashboardSidebarExpanded .navItem > span:last-child { position: static; margin: 0 0 0 auto; font-size: 10px; }
        .dashboardSidebarExpanded .navIcon { width: auto !important; justify-content: flex-start !important; gap: 11px !important; }
        .navIcon { display: flex; width: 100%; align-items: center; justify-content: center; gap: 0; }
        .navGlyph { display: block; flex: 0 0 22px; width: 22px; height: 22px; color: #91aaa0; }
        .navItemActive .navGlyph { color: #e8fff5; }
        .navLabel { display: none; white-space: nowrap; line-height: 20px; font-size: 12px; }
        .dashboardSidebarExpanded .navLabel { display: inline; }
        .navBadge { position: absolute; top: 1px; right: 1px; margin: 0 !important; min-width: 15px; text-align: center; }
        .dashboardSidebarExpanded .navBadge { position: static; margin-left: auto !important; }
        .topBrand { display: flex; align-items: center; gap: 8px; min-width: 190px; text-align: left; color: #edf5f1; }
        .topBrandMark { color: #f04f50; font-size: 25px; }
        .topBrand strong { display: block; font-size: 14px; line-height: 1.2; letter-spacing: .02em; }
        .topBrand small, .profileName small { display: block; color: #91aaa0; font-size: 9px; line-height: 1.4; }
        .headerActions { display: flex; align-items: center; gap: 9px; }
        .alertButton, .profileButton, .detailPrintButton { height: 34px; border: 1px solid #164535; border-radius: 8px; background: #052d22; color: #d6e4dd; cursor: pointer; }
        .alertButton { padding: 0 11px; font-size: 11px; font-weight: 600; }
        .alertButton span { margin-right: 5px; }
        .profileButton { display: flex; align-items: center; gap: 8px; padding: 3px 9px 3px 4px; }
        .profileInitials { display: grid; place-items: center; background: #0b4635; color: #e8fff5; border-radius: 50%; width: 26px; height: 26px; font-size: 10px; font-weight: 700; }
        .profileName { min-width: 62px; text-align: left; font-size: 10px; }
        .profileName strong { display: block; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .headerActions > button:last-child:not(.profileButton):not(.alertButton) { border: 0; background: transparent; color: #d6e4dd; font-size: 11px; cursor: pointer; }
        .ordersHeading { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px 10px; border-bottom: 1px solid #ececec; }
        .ordersHeading h1 { margin: 0; font-size: 18px; line-height: 1.3; font-weight: 650; letter-spacing: -.02em; color: #25272b; }
        .availability { display: flex; align-items: center; gap: 8px; color: #8a8e95; font-size: 10px; }
        .availability b { margin-left: 4px; padding: 2px 5px; border-radius: 4px; color: #0b9d70; background: #e9f7f2; font-weight: 700; }
        .availability .pausedPill { color: #e54c50; background: #fff0f0; }
        .orderToolbar { min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-shrink: 0; }
        .statusTabs, .orderTools { display: flex; align-items: center; gap: 6px; }
        .statusTabs { min-width: 0; }
        .orderTools { flex-shrink: 0; }
        .statusTab { white-space: nowrap; padding: 6px 10px; background: #fff; border: 1px solid #e6e6e6; border-radius: 20px; font-size: 10px; font-weight: 600; color: #3e4248; cursor: pointer; box-shadow: 0 1px 2px #0000000a; }
        .statusTab span { margin-left: 3px; color: #777d84; }
        .statusTab.selected { color: #fff; background: #4385e8; border-color: #4385e8; }
        .statusTab.selected span { color: #fff; }
        .orderTools > button, .searchOrders { height: 32px; border: 1px solid #dce3e5; border-radius: 8px; background: #fff; color: #559e99; }
        .orderTools > button { width: 32px; font-size: 17px; cursor: pointer; }
        .searchOrders { display: flex; align-items: center; gap: 5px; padding: 0 8px; }
        .searchOrders span { font-size: 17px; }
        .searchOrders input { width: 75px; border: 0; outline: 0; color: #41464c; font-size: 10px; }
        .orderTools .managePaused { width: auto; height: 28px; flex: 0 0 auto; display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid #cfe6e2; border-radius: 6px; background: #fff; color: #288b82; font-size: 10px; white-space: nowrap; }
        .orderTools .managePaused b { background: #fff1d6; color: #d28b19; border-radius: 5px; padding: 2px 5px; }
        .orderSummary { border-radius: 9px !important; padding: 12px !important; }
        .orderSummary:hover { border-color: #4385e8 !important; }
        .orderSummary .orderStatus { padding: 3px 8px !important; font-size: 9px !important; border-radius: 12px !important; }
        .orderTypeTag, .channelTag { display: inline-flex; align-items: center; margin-right: 5px; padding: 3px 8px; border-radius: 12px; font-size: 9px; font-weight: 700; }
        .orderTypeTag { color: #4385e8; background: #edf4ff; border: 1px solid #c9dcff; }
        .channelTag { color: #0aa777; background: #e9faf3; border: 1px solid #b9ead9; }
        .orderSummaryItems { border-top: 1px solid #f0f0f0; padding-top: 7px; color: #41464c; font-size: 11px; }
        .orderSummaryItems div { margin: 3px 0; }
        .orderSummaryItems div span { color: #7c8187; }
        .orderSummaryItems small { color: #858a91; font-size: 10px; }
        .orderSummaryFooter { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; margin-top: 7px; padding-top: 7px; color: #92969b; font-size: 9px; }
        .orderSummaryFooter strong { color: #4385e8; font-size: 11px; }
        .emptyOrders, .emptyDetail { display: grid; place-items: center; min-height: 160px; padding: 24px; color: #858a91; font-size: 12px; text-align: center; }
        .detailPanelHeading { min-height: 52px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; padding-top: 8px; }
        .detailPrintButton { width: 32px; font-size: 17px; }
        .detailPanelColumn .listHeaderTitle { margin: 0; color: #464a50; font-size: 11px; }
        .orderDetailCard { display: flex; flex: 1; flex-direction: column; min-height: 0; overflow-y: auto; position: relative; border: 1px solid #e5e7eb; border-radius: 9px 9px 0 0; padding: 12px; text-align: left; background: #fff; }
        .detailTopline { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .detailTopline h2 { margin: 0 0 6px; font-size: 15px; font-weight: 650; color: #26292e; }
        .detailTags { display: flex; }
        .detailOrderNumber { display: flex; align-items: center; gap: 10px; margin-top: 9px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
        .detailOrderNumber a { color: #4385e8; font-family: inherit; text-decoration: none; font-weight: 600; }
        .detailMeta, .detailAddress { margin-top: 7px; color: #777d84; font-size: 10px; }
        .customerRequest { display: flex; flex-direction: column; gap: 3px; margin: 12px 0; padding: 8px 10px; border: 1px solid #f5d39b; border-radius: 8px; background: #fffaf1; color: #3d3d3d; font-size: 10px; }
        .customerRequest strong { color: #db941c; font-size: 9px; }
        .orderNotesEditor { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; padding: 10px; border: 1px solid #dbe3ea; border-radius: 8px; background: #f8fafc; }
        .orderNotesEditor label { display: flex; flex-direction: column; gap: 4px; color: #475569; font-size: 9px; font-weight: 700; }
        .orderNotesEditor textarea { width: 100%; box-sizing: border-box; padding: 7px 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; color: #334155; font: inherit; font-size: 10px; resize: vertical; }
        .saveOrderNotesButton { align-self: flex-end; padding: 6px 10px; border: 0; border-radius: 6px; background: #047857; color: #fff; font-size: 10px; font-weight: 700; cursor: pointer; }
        .saveOrderNotesButton:disabled { cursor: wait; opacity: .65; }
        .prepTimeControl { display: flex; justify-content: space-between; align-items: center; min-height: 38px; margin: 8px 0 11px; padding: 4px 8px; border: 1px solid #e5e7eb; border-radius: 8px; color: #858a91; font-size: 9px; }
        .prepTimeControl > div { display: flex; align-items: center; gap: 8px; color: #30343b; }
        .prepTimeControl button { width: 24px; height: 24px; border: 1px solid #e2e5e9; border-radius: 7px; background: #fff; box-shadow: 0 1px 3px #00000012; font-size: 15px; cursor: pointer; }
        .prepTimeControl small { font-size: 9px; font-weight: 500; }
        .itemsHeading { color: #64696f; font-size: 10px; font-weight: 700; }
        .menuOrigin { margin-top: 5px; padding-bottom: 7px; border-bottom: 1px solid #e8e8e8; color: #73787e; font-size: 9px; }
        .detailItems { display: flex; flex-direction: column; }
        .detailItem { padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #3e4248; font-size: 11px; }
        .detailItemLine { display: flex; justify-content: space-between; gap: 12px; }
        .detailItemLine strong { white-space: nowrap; }
        .detailItemLine strong small { margin-right: 5px; color: #858a91; font-weight: 500; }
        .detailItemDescription { padding: 4px 0 0 9px; color: #8a8e95; font-size: 9px; }
        .orderTotals { margin-top: auto; padding-top: 8px; }
        .orderTotals > div { display: flex; justify-content: space-between; padding: 4px 0; color: #858a91; font-size: 10px; }
        .orderTotals > div strong:last-child { color: #41464c; font-weight: 500; }
        .orderTotals .totalLine { margin-top: 5px; padding-top: 8px; border-top: 1px solid #e8e8e8; color: #292c30; font-size: 13px; }
        .orderTotals .totalLine strong:last-child { color: #4385e8; font-size: 14px; font-weight: 700; }
        .detailActionBar { position: sticky; bottom: -12px; margin: 8px -12px -12px; padding: 10px 12px; border-top: 1px solid #e7e7e7; background: #fff; }
        .prepareButton { width: 100%; min-height: 38px; border: 0; border-radius: 8px; background: #ff5553; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 4px #ff555333; }
        .prepareButton:hover { background: #eb4847; }
        .completedMessage { display: block; padding: 10px; color: #0a9b70; text-align: center; font-size: 11px; font-weight: 700; }
        @media (max-width: 950px) {
          .orderToolbar { align-items: flex-start; flex-direction: column; padding: 8px 0; }
          .statusTabs { width: 100%; overflow-x: auto; padding-bottom: 3px; }
          .orderTools { width: 100%; }
          .searchOrders { flex: 1; }
          .searchOrders input { width: 100%; }
          .splitViewWrapper { padding-left: 10px !important; padding-right: 10px !important; }
          .detailPanelColumn { padding-left: 8px !important; }
        }
        @media (max-width: 680px) {
          .dashboardSidebar:not(.dashboardSidebarExpanded) { width: 46px !important; }
          .dashboardSidebarExpanded { width: 220px !important; position: absolute; inset: 0 auto 0 0; z-index: 1000; box-shadow: 8px 0 24px #0003; }
          .header { padding: 0 10px !important; }
          .topBrand { min-width: 0; }
          .topBrand small, .alertButton, .profileName, .profileButton > span:last-child { display: none; }
          .headerActions { gap: 5px; }
          .profileButton { border: 0; padding: 0; }
          .ordersHeading { padding: 10px; }
          .ordersHeading h1 { font-size: 16px; }
          .availability { font-size: 9px; }
          .splitViewWrapper { flex-direction: column; overflow-y: auto !important; }
          .masterListColumn { flex: 0 0 42%; min-height: 200px; }
          .detailPanelColumn { flex: 1 0 58%; min-height: 420px; border-left: 0 !important; border-top: 1px solid #e8e8e8; padding: 0 !important; }
          .orderDetailCard { min-height: 0; }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-thermal-receipt, #printable-thermal-receipt * {
            visibility: visible !important;
          }
          #printable-thermal-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: #fff !important;
            margin: 0 !important;
            padding: 20px !important;
            z-index: 999999 !important;
          }
          #printable-thermal-receipt .orderNotesEditor {
            display: none !important;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div className={`dashboardSidebar${isNavExpanded ? ' dashboardSidebarExpanded' : ''}`} style={{ ...styles.sidebar, width: isNavExpanded ? '220px' : '54px' }}>
        <button
          type="button"
          className="sidebarToggle"
          aria-label={isNavExpanded ? 'Collapse navigation' : 'Expand navigation'}
          aria-expanded={isNavExpanded}
          onClick={() => setIsNavExpanded(expanded => !expanded)}
        >
          <span></span><span></span><span></span>
        </button>
        <div style={styles.brandBox}>
          <span style={styles.logoIcon}>🍽</span>
          <div>
            <div style={styles.brandName}>FOODOS</div>
            <div style={styles.brandSub}>RESTAURANT POS</div>
          </div>
        </div>

        <ul className="sidebarNavLinks" style={styles.navLinks}>
          {[
            'Online Orders', 'Counter POS', 'Tables', 'Kitchen', 'Menu', 
            'Reports', 'Promotions', 'Customers', 'Complaints', 'Gallery', 'Settings'
          ].map((tab) => {
            const isActive = activeTab === tab;
            const isHovered = hoveredTab === tab;
            return (
              <li 
                key={tab}
                className="navItem"
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  ...(isHovered && !isActive ? styles.navItemHover : {})
                }}
                onClick={() => setActiveTab(tab)}
                onMouseEnter={() => setHoveredTab(tab)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <span className="navIcon">
                  <NavigationIcon tab={tab} />
                  <span className="navLabel">{tab}</span>
                </span>
                {tab === 'Online Orders' && <span className="navBadge" style={styles.badgeCount}>{orders.filter(o => o.status === 'New').length}</span>}
              </li>
            );
          })}
        </ul>

      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div className="topBrand">
            <span className="topBrandMark">🍽</span>
            <div><strong>FOODOS</strong><small>Restaurant POS System</small></div>
          </div>
          <div className="headerActions">
            <button className="alertButton" onClick={handleEnableAlerts}>
              <span>♧</span> {alertsEnabled ? 'Alerts enabled' : 'Enable alerts'}
            </button>
            <button className="profileButton" onClick={() => { setShowProfileModal(true); setIsEditingProfile(false); }}>
              <span className="profileInitials">K6</span>
              <span className="profileName"><strong>{profileData.ownerName || 'Admin'}</strong><small>Admin</small></span>
              <span>⌄</span>
            </button>
            <button 
              onClick={() => setActiveTab('Menu')} 
              style={styles.pausedItemsBtn}
            >
              🔴 Manage Paused Items <span style={styles.pausedCountBadge}>{pausedCount}</span>
            </button>
            <button onClick={onLogout} style={styles.topLogoutBtn}>Sign Out</button>
          </div>
        </div>

        {/* Tables Status Bar */}
        <div style={styles.tablesStatusBar} onClick={() => setActiveTab('Tables')}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#1e293b'}}>
            <span>♜</span>
            <span>Tables</span>
            <span style={{color: '#cbd5e1'}}>·</span>
            <span style={{color: '#16a34a'}}>{tableStats.open}/{tableStats.total} open</span>
            <span style={{color: '#cbd5e1'}}>·</span>
            <span>{tableStats.occupied} occupied</span>
            <span style={{backgroundColor: '#2563eb', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800'}}>{tableStats.billing} billing</span>
          </div>
          <span style={{color: '#64748b', fontSize: '16px', fontWeight: 'bold'}}>›</span>
        </div>

        {isOrdersFallback && activeTab === 'Online Orders' && (
          <div style={styles.fallbackNoticeBar}>
            <span style={{color: '#dc2626', fontWeight: 'bold'}}>⚠️ Connection Notice:</span> Unable to reach database orders endpoint.
          </div>
        )}

        {/* Dynamic Module Router */}
        {activeTab === 'Online Orders' && (
          <div style={styles.onlineOrdersContainer}>
            <div className="ordersHeading">
              <h1>Online orders</h1>
              <div className="availability"><span>Available <b>{orders.filter(o => !['Picked Up', 'Completed'].includes(o.status)).length}</b></span><span>·</span><span>Paused <b className="pausedPill">{pausedCount}</b></span></div>
            </div>

            <div style={styles.splitViewWrapper}>
              {/* Left Column: Order Cards with Hover Effects */}
              <div style={styles.masterListColumn}>
                <div className="orderToolbar">
                  <div className="statusTabs" role="tablist" aria-label="Filter orders by status">
                    {orderStatusTabs.map(status => (
                      <button
                        key={status}
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === status}
                        className={`statusTab${statusFilter === status ? ' selected' : ''}`}
                        onClick={() => {
                          setStatusFilter(status);
                          const matchingOrders = orders.filter(order => order.status.toLowerCase() === status.toLowerCase());
                          if (matchingOrders.length > 0) setSelectedOrder(matchingOrders[0]);
                        }}
                      >
                        {status} <span>{orders.filter(order => order.status.toLowerCase() === status.toLowerCase()).length}</span>
                      </button>
                    ))}
                  </div>
                  <div className="orderTools">
                    <button title="Refresh orders" aria-label="Refresh orders" onClick={() => {
                      setLoadingOrders(true);
                      setRefreshTick(tick => tick + 1);
                    }}>↻</button>
                    <label className="searchOrders"><span>⌕</span><input value={orderSearch} onChange={event => setOrderSearch(event.target.value)} placeholder="Search orders" /></label>
                    <button className="managePaused" onClick={() => setActiveTab('Menu')}>Manage Paused Items <b>{pausedCount}</b></button>
                  </div>
                </div>
                
                <div style={styles.scrollableCards}>
                  {loadingOrders ? (
                    <div style={{padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '600'}}>Loading live database orders...</div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="emptyOrders">{orders.length === 0 ? 'No online orders yet. New orders will appear here.' : 'No orders match this status or search.'}</div>
                  ) : (
                    filteredOrders.map(order => {
                      const isSelected = selectedOrder?.orderId === order.orderId;
                      const isHovered = hoveredCardId === order.orderId;
                      return (
                        <div 
                          key={order.orderId || order.id} 
                          className="orderSummary"
                          style={{
                            ...styles.orderSummaryCard, 
                            borderColor: isSelected || isHovered ? '#4385e8' : '#e5e7eb',
                            backgroundColor: '#fff',
                            transform: 'none',
                            boxShadow: 'none'
                          }}
                          onClick={() => setSelectedOrder(order)}
                          onMouseEnter={() => setHoveredCardId(order.orderId)}
                          onMouseLeave={() => setHoveredCardId(null)}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                            <div>
                              <strong style={{fontSize: '15px', color: '#0f172a'}}>{order.customer}</strong>
                              <div style={{fontSize: '11px', color: '#64748b', fontWeight: '700'}}>{order.id}</div>
                            </div>
                            <span className="orderStatus" style={styles.statusBadgeSmall(order.status)}>{order.status}</span>
                          </div>

                          <div style={{fontSize: '11px', color: '#64748b', marginBottom: '10px', fontWeight: '600'}}>
                            <span className="orderTypeTag">♧ {order.type}</span> <span className="channelTag">◉ {order.channel}</span>
                          </div>

                          <div className="orderSummaryItems">
                            {order.items.slice(0, 2).map((it, idx) => (
                              <div key={idx}>{it.name} <span>×{it.qty}</span></div>
                            ))}
                            {order.items.length > 2 && <small>+ {order.items.length - 2} more</small>}
                          </div>

                          <div className="orderSummaryFooter">
                            <span>{order.time}</span><strong>₹{order.total.toFixed(2)}</strong>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Order Details & Compact Modern Thermal Receipt */}
              <div style={styles.detailPanelColumn}>
                <div className="detailPanelHeading">
                  <div style={styles.listHeaderTitle}>Selected order</div>
                  {selectedOrder && (
                    <button onClick={handlePrintReceipt} className="detailPrintButton" title="Print order">⎙</button>
                  )}
                </div>

                {selectedOrder ? (
                  <div className="orderDetailCard" id="printable-thermal-receipt">
                    <div className="detailTopline">
                      <div>
                        <h2>{selectedOrder.customer}</h2>
                        <div className="detailTags">
                          <span className="orderTypeTag">♧ {selectedOrder.type}</span>
                          <span className="channelTag">◉ {selectedOrder.channel}</span>
                        </div>
                      </div>
                      <span className="orderStatus" style={styles.statusBadgeSmall(selectedOrder.status)}>{selectedOrder.status}</span>
                    </div>

                    <div className="detailOrderNumber">
                      <strong>{selectedOrder.id}</strong>
                      <a href={`tel:${selectedOrder.phone}`}>♧ {selectedOrder.phone}</a>
                    </div>
                    <div className="detailMeta">{selectedOrder.time} · {selectedOrder.type}</div>
                    <div className="detailAddress">⌖ &nbsp;{selectedOrder.address}</div>

                    {getOrderNote(selectedOrder) && (
                      <div className="customerRequest">
                        <strong>▢ &nbsp; ORDER NOTE · SHARED WITH KITCHEN &amp; STAFF</strong>
                        <span style={{whiteSpace: 'pre-wrap'}}>{getOrderNote(selectedOrder)}</span>
                      </div>
                    )}
                    <div className="orderNotesEditor">
                      <label>
                        Order note (visible to kitchen and staff; included on the receipt)
                        <textarea
                          value={orderNote}
                          onChange={event => setOrderNote(event.target.value)}
                          rows={2}
                          placeholder="Add a note for the kitchen, staff, or customer"
                        />
                      </label>
                      <button
                        type="button"
                        className="saveOrderNotesButton"
                        onClick={saveOrderNotes}
                        disabled={savingOrderNotes}
                      >
                        {savingOrderNotes ? 'Saving…' : 'Save notes'}
                      </button>
                    </div>

                    <div className="prepTimeControl">
                      <span>◷ &nbsp; PREP</span>
                      <div>
                        <button aria-label="Decrease prep time" onClick={() => setPrepMinutes(minutes => Math.max(5, minutes - 5))}>−</button>
                        <strong>{prepMinutes}<small> min</small></strong>
                        <button aria-label="Increase prep time" onClick={() => setPrepMinutes(minutes => minutes + 5)}>+</button>
                      </div>
                    </div>

                    <div className="itemsHeading">ITEMS ({selectedOrder.items.length} LINES · {selectedOrder.items.reduce((sum, item) => sum + item.qty, 0)} QTY)</div>
                    <div className="menuOrigin">◫ &nbsp;FROM MENU · Default Online Menu</div>
                    <div className="detailItems">
                      {selectedOrder.items.map((item, index) => (
                        <div className="detailItem" key={`${item.name}-${index}`}>
                          <div className="detailItemLine">
                            <span>{item.name}</span>
                            <strong><small>×{item.qty}</small> ₹{(item.price * item.qty).toFixed(2)}</strong>
                          </div>
                          {item.desc && <div className="detailItemDescription">{item.desc}</div>}
                        </div>
                      ))}
                    </div>

                    <div className="orderTotals">
                      <div><span>Subtotal</span><strong>₹{selectedOrder.subtotal.toFixed(2)}</strong></div>
                      <div><span>GST (5%)</span><strong>₹{(selectedOrder.subtotal * 0.05).toFixed(2)}</strong></div>
                      <div className="totalLine"><strong>Total</strong><strong>₹{selectedOrder.total.toFixed(2)}</strong></div>
                    </div>

                    <div className="detailActionBar">
                      {selectedOrder.status !== 'Picked Up' && selectedOrder.status !== 'Completed' ? (
                        <button onClick={() => updateOrderStatus(selectedOrder.orderId, selectedOrder.status)} className="prepareButton">
                          ♧ &nbsp;{getNextActionLabel(selectedOrder.status)}
                        </button>
                      ) : (
                        <span className="completedMessage">Order completed successfully ✓</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="emptyDetail">Select an order to view its details.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkout & Split Payment Modal */}
        {showCheckoutModal && selectedOrder && (
          <div style={styles.drawerOverlay} onClick={() => setShowCheckoutModal(false)}>
            <div style={styles.checkoutModalContent} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Checkout & Split Payment</h3>
                <button onClick={() => setShowCheckoutModal(false)} style={styles.closeXBtn}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Tip Section */}
                <div style={styles.checkoutSectionCard}>
                  <label style={styles.checkoutLabel}>TIP (OPTIONAL)</label>
                  <div style={styles.tipGrid}>
                    {[0, 20, 50, 100].map(val => (
                      <button
                        key={val}
                        onClick={() => { setTip(val); setCustomTip(''); }}
                        style={{
                          ...styles.tipBtn,
                          backgroundColor: tip === val ? '#059669' : '#fff',
                          color: tip === val ? '#fff' : '#334155',
                          borderColor: tip === val ? '#059669' : '#cbd5e1'
                        }}
                      >
                        {val === 0 ? 'No tip' : `₹${val}`}
                      </button>
                    ))}
                    <input
                      type="number"
                      placeholder="Custom"
                      value={customTip}
                      onChange={(e) => { setTip('custom'); setCustomTip(e.target.value); }}
                      style={styles.customTipInput}
                    />
                  </div>
                </div>

                {/* Split Payment Toggle */}
                <div style={styles.checkoutSectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>Split payment</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Pay with two methods (e.g. Cash + UPI)</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={splitPayment}
                      onChange={(e) => setSplitPayment(e.target.checked)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#059669' }}
                    />
                  </div>
                </div>

                {/* Payment 1 */}
                <div style={styles.checkoutSectionCard}>
                  <label style={styles.checkoutLabel}>{splitPayment ? 'PAYMENT 1' : 'PAYMENT METHOD'}</label>
                  <div style={styles.methodGrid}>
                    {['Cash', 'UPI', 'Card'].map(m => (
                      <button
                        key={m}
                        onClick={() => setPay1Method(m)}
                        style={{
                          ...styles.methodBtn,
                          borderColor: pay1Method === m ? '#059669' : '#cbd5e1',
                          backgroundColor: pay1Method === m ? '#ecfdf5' : '#fff'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : '💳'}</span>
                        <span style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a' }}>{m}</span>
                      </button>
                    ))}
                  </div>
                  {splitPayment && (
                    <input
                      type="number"
                      placeholder="Amount for Payment 1 (e.g. 500)"
                      value={pay1Amount}
                      onChange={(e) => setPay1Amount(e.target.value)}
                      style={styles.splitAmountInput}
                    />
                  )}
                </div>

                {/* Payment 2 */}
                {splitPayment && (
                  <div style={styles.checkoutSectionCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={styles.checkoutLabel}>PAYMENT 2</label>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Balance • auto</span>
                    </div>
                    <div style={styles.methodGrid}>
                      {['Cash', 'UPI', 'Card'].map(m => (
                        <button
                          key={m}
                          onClick={() => setPay2Method(m)}
                          style={{
                            ...styles.methodBtn,
                            borderColor: pay2Method === m ? '#059669' : '#cbd5e1',
                            backgroundColor: pay2Method === m ? '#ecfdf5' : '#fff'
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>{m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : '💳'}</span>
                          <span style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a' }}>{m}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', display: 'block' }}>Total Amount:</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#059669' }}>
                    ₹{(selectedOrder.total + (tip === 'custom' ? Number(customTip) || 0 : tip)).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    alert('Payment processed successfully and receipt recorded!');
                    setShowCheckoutModal(false);
                  }}
                  style={styles.actionBtn}
                >
                  ✅ Complete Payment
                </button>
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

      {/* Profile Modal */}
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

                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Phone Number (Locked / Verified):</label>
                <input 
                  style={{padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b', outline: 'none', cursor: 'not-allowed'}}
                  value={editForm.phone} 
                  disabled
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
  sidebar: { width: '54px', backgroundColor: '#191919', display: 'flex', flexDirection: 'column', color: '#fff', height: '100vh', flexShrink: 0 },
  brandBox: { display: 'none', alignItems: 'center', gap: '12px', padding: '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoIcon: { fontSize: '24px' },
  brandName: { fontSize: '18px', fontWeight: '900', letterSpacing: '0.02em' },
  brandSub: { fontSize: '10px', color: '#34d399', fontWeight: '700', letterSpacing: '0.05em' },
  navLinks: { listStyle: 'none', padding: '8px 0', margin: 0, flex: 1, overflowY: 'auto' },
  navItem: { padding: '10px 0', margin: '2px 5px', height: '40px', fontSize: '14px', color: '#d4d4d4', cursor: 'pointer', display: 'flex', justifyContent: 'center', textAlign: 'center', fontWeight: '600', transition: 'all 0.2s', borderRadius: '7px' },
  navItemHover: { backgroundColor: '#303030', color: '#fff' },
  navItemActive: { padding: '10px 0', margin: '2px 5px', height: '40px', fontSize: '14px', color: '#003d2b', backgroundColor: '#05c98a', cursor: 'pointer', display: 'flex', justifyContent: 'center', borderLeft: 'none', fontWeight: '800', textAlign: 'center', borderRadius: '7px' },
  badgeCount: { backgroundColor: '#34d399', color: '#022c22', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' },
  userInfo: { padding: '9px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#191919', cursor: 'pointer', transition: 'background 0.2s' },
  userInfoFallbackRedLine: { borderBottom: '3px solid #ef4444', backgroundColor: '#450a0a' },
  userAvatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', position: 'relative', border: '2px solid #34d399', fontSize: '13px' },
  onlineDot: { position: 'absolute', bottom: '0px', right: '0px', width: '10px', height: '10px', backgroundColor: '#34d399', borderRadius: '50%', border: '2px solid #01231b' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0, backgroundColor: '#fff' },
  header: { height: '54px', backgroundColor: '#001e16', borderBottom: '1px solid #0b3328', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 },
  pageTitle: { fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' },
  tablesStatusBar: { backgroundColor: '#f1f5fb', border: '1px solid #d7e1f2', margin: '5px 16px', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '11px', transition: 'background 0.2s', borderRadius: '7px' },
  fallbackNoticeBar: { backgroundColor: '#fff8ef', border: '1px solid #f2d9b3', margin: '5px 16px', padding: '8px 12px', fontSize: '12px', color: '#8d5a14', textAlign: 'left', flexShrink: 0, borderRadius: '7px' },
  pausedItemsBtn: { backgroundColor: '#fff', border: '1.5px solid #dc2626', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: '#dc2626', cursor: 'pointer', display: 'none', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  pausedCountBadge: { backgroundColor: '#dc2626', color: '#fff', fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: '900' },
  topLogoutBtn: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' },
  onlineOrdersContainer: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', backgroundColor: '#fff', minWidth: 0 },
  subHeader: { padding: '12px 25px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', fontSize: '14px', textAlign: 'left', flexShrink: 0 },
  splitViewWrapper: { display: 'flex', flex: 1, padding: '0 16px 12px', gap: '12px', overflow: 'hidden', minHeight: 0, minWidth: 0 },
  masterListColumn: { flex: '1 1 52%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, minWidth: 0 },
  detailPanelColumn: { flex: '1 1 48%', display: 'flex', flexDirection: 'column', overflowY: 'hidden', minHeight: 0, minWidth: 0, padding: '0 0 0 12px', borderLeft: '1px solid #e8e8e8' },
  listHeaderTopRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexShrink: 0 },
  listHeaderTitle: { fontSize: '14px', fontWeight: '800', color: '#334155', textAlign: 'left', flexShrink: 0, marginBottom: '10px' },
  scrollableCards: { display: 'flex', flexDirection: 'column', gap: '9px', overflowY: 'auto', flex: 1, padding: '0 4px 8px 0' },
  orderSummaryCard: { border: '1px solid #e5e7eb', borderRadius: '9px', padding: '13px', cursor: 'pointer', backgroundColor: '#fff', textAlign: 'left', flexShrink: 0, transition: 'border-color 0.15s' },
  detailCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', textAlign: 'left', boxShadow: 'none' },
  emptyDetailPrompt: { backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' },
  statusBadgeSmall: (status) => ({
    backgroundColor: status === 'New' ? '#e0f2fe' : status === 'Accepted' ? '#fef9c3' : status === 'Preparing' ? '#ffedd5' : status === 'Ready' ? '#ede9fe' : '#dcfce7',
    color: status === 'New' ? '#0369a1' : status === 'Accepted' ? '#854d0e' : status === 'Preparing' ? '#c2410c' : status === 'Ready' ? '#6d28d9' : '#15803d',
    fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase'
  }),
  customerRequestBox: { backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', color: '#b45309', marginBottom: '16px', textAlign: 'left', fontWeight: '600' },
  printIconBtn: { backgroundColor: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', color: '#334155' },
  actionBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' },
  
  thermalReceiptBox: { backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '16px', fontFamily: 'monospace', maxHeight: '310px', overflowY: 'auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', marginBottom: '16px', transition: 'all 0.3s ease', position: 'relative' },
  receiptTopAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #059669, #2563eb, #d97706)' },
  receiptItemRow: { backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #f1f5f9', transition: 'all 0.2s' },
  receiptItemInstructionInput: { width: '100%', marginTop: '6px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' },
  checkoutTriggerBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' },
  
  drawerOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  checkoutModalContent: { width: '480px', backgroundColor: '#fff', padding: '24px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0' },
  checkoutSectionCard: { backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' },
  checkoutLabel: { fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' },
  tipGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', alignItems: 'center' },
  tipBtn: { padding: '8px 4px', borderRadius: '8px', border: '1.5px solid', fontWeight: '700', fontSize: '12px', cursor: 'pointer', textAlign: 'center' },
  customTipInput: { padding: '8px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', outline: 'none', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  methodGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  methodBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', borderRadius: '10px', border: '1.5px solid', cursor: 'pointer', gap: '4px' },
  splitAmountInput: { width: '100%', marginTop: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
  profileModal: { width: '460px', backgroundColor: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0' },
  modalRedAccentLine: { height: '3px', backgroundColor: '#059669', width: '100%', marginBottom: '16px', borderRadius: '2px' },
  profileCardRow: { fontSize: '13px', color: '#334155', display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }
};