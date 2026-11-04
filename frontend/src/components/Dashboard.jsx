import React, { useState, useEffect, useRef } from 'react';
import './LoginScreen.css';

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
import SettingsModule from "./SettingsModule";
import { playNotificationChime, unlockNotificationAudio } from './AdvancedSettingsTab';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const getOrderNote = (order) => {
  if (!order) return '';
  return order.customerRequest || order.customer_request || order.notes || '';
};

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

const STEPS = ['New', 'Accepted', 'Preparing', 'Ready', 'Picked Up'];
const STATUS_COLORS = { New: '#0284c7', Accepted: '#d97706', Preparing: '#ea580c', Ready: '#7c3aed', 'Picked Up': '#16a34a', Completed: '#16a34a' };
const STATUS_ICONS = { New: '🆕', Accepted: '👍', Preparing: '🍳', Ready: '📦', 'Picked Up': '✅' };
const NEXT_STATUS = { New: 'Accepted', Accepted: 'Preparing', Preparing: 'Ready', Ready: 'Picked Up' };

// "5 min ago" label. Falls back to the original text if the timestamp can't be parsed.
const timeAgo = (value, now) => {
  const t = Date.parse(value);
  if (Number.isNaN(t)) return { text: String(value || ''), mins: null };
  const mins = Math.floor((now - t) / 60000);
  if (mins < 0 || mins > 60 * 24 * 7) return { text: String(value || ''), mins: null };
  if (mins < 1) return { text: 'Just now', mins };
  if (mins < 60) return { text: `${mins} min ago`, mins };
  if (mins < 1440) return { text: `${Math.floor(mins / 60)} hr ago`, mins };
  return { text: `${Math.floor(mins / 1440)} d ago`, mins };
};

function NavigationIcon({ tab }) {
  const icon = NAVIGATION_ICONS[tab] || NAVIGATION_ICONS['Online Orders'];
  return (
    <svg aria-hidden="true" className="navGlyph" style={{ '--glow': icon.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icon.paths.map(path => <path d={path} key={path} />)}
    </svg>
  );
}

export default function Dashboard({ user, onLogout }) {
  const loggedInEmail = user?.email || localStorage.getItem('userEmail') || 'novio@gmail.com';

  const [activeTab, setActiveTab] = useState('Online Orders');
  // UI: sidebar starts collapsed on phones
  const [isNavExpanded, setIsNavExpanded] = useState(typeof window !== 'undefined' ? window.innerWidth > 680 : true);
  const [statusFilter, setStatusFilter] = useState('Accepted');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [prepMinutes, setPrepMinutes] = useState(20);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  
  const [toastMessage, setToastMessage] = useState(null);
  const [newOrderPopup, setNewOrderPopup] = useState(null);

  const [isProfileFallback, setIsProfileFallback] = useState(false);
  const [isOrdersFallback, setIsOrdersFallback] = useState(false);
  
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

  const [receiptConfig, setReceiptConfig] = useState({
    restaurantName: 'LINGA FOODS',
    branchName: 'Wonghikal',
    headerText: 'Linga Foods - Wonghikal',
    address: 'LINGA FOODS, No. 1540, Vellore Main Road, Wonghikal, Tiruvannamalai, Tamil Nadu 606604',
    phone: '91234400635',
    email: '',
    gstin: '37AAFP4128L1ZI',
    fssai: 'FSSAI: 22426260001195',
    footerNote: 'Thank You For Visiting Us!\n*** TEST PRINT ***\n*** NOT A VALID BILL / INVOICE ***',
    paperSize: '80mm',
    density: 'Compact',
    toggles: {
      logo: false,
      restaurantName: true,
      branchName: true,
      headerText: false,
      address: true,
      phone: true,
      email: false,
      gstin: true,
      fssai: true,
      invoiceNo: true,
      dateAndTime: true,
      orderId: true,
      tokenNumber: true,
      orderType: true,
      customerName: true,
      customerMobile: true,
      itemNameQtyAmt: true,
      itemRate: true,
      variants: true,
      itemNotes: true,
      discount: true,
      totalTax: true,
      taxBreakdown: true,
      paymentMethod: true,
      paymentReference: false,
      footerText: true
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [savingOrderNotes, setSavingOrderNotes] = useState(false);

  const knownOrderIdsRef = useRef(new Set());
  const hasLoadedOrdersRef = useRef(false);

  useEffect(() => {
    setOrderNote(getOrderNote(selectedOrder));
  }, [selectedOrder?.orderId]);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchHeaderData = () => {
    fetch(`${API_BASE_URL}/api/v1/restaurants/email/${loggedInEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.receiptConfig) {
            let parsedCfg = data.receiptConfig;
            if (typeof parsedCfg === 'string') {
              try { parsedCfg = JSON.parse(parsedCfg); } catch (e) { parsedCfg = {}; }
            }
            setReceiptConfig(prev => ({
              ...prev,
              ...parsedCfg,
              toggles: {
                ...(prev.toggles || {}),
                ...(parsedCfg.toggles || {})
              }
            }));
          }

          if (data.areasAndTables) {
            let parsedAreas = data.areasAndTables;
            if (typeof parsedAreas === 'string') {
              try { parsedAreas = JSON.parse(parsedAreas); } catch (e) {}
            }

            if (parsedAreas && parsedAreas.areas) {
              let allTables = [];
              parsedAreas.areas.forEach(area => {
                if (area.tables) {
                  allTables = allTables.concat(area.tables);
                }
              });

              if (allTables.length > 0) {
                const open = allTables.filter(t => (t.status || 'Available') === 'Available').length;
                const occupied = allTables.filter(t => (t.status || 'Available') === 'Occupied').length;
                const billing = allTables.filter(t => t.status === 'Billing' || t.status === 'Ready to Pay').length;
                setTableStats({ open, total: allTables.length, occupied, billing });
              }
            }
          }
        }
      })
      .catch(err => console.log("Table stats sync note:", err));

    fetch(`${API_BASE_URL}/api/v1/menu?email=${loggedInEmail}`)
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
    const interval = setInterval(fetchHeaderData, 4000);
    return () => clearInterval(interval);
  }, [loggedInEmail]);

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
          if (data.receiptConfig) {
            let parsedCfg = data.receiptConfig;
            if (typeof parsedCfg === 'string') {
              try { parsedCfg = JSON.parse(parsedCfg); } catch (e) { parsedCfg = {}; }
            }
            setReceiptConfig(prev => ({
              ...prev,
              ...parsedCfg,
              toggles: {
                ...(prev.toggles || {}),
                ...(parsedCfg.toggles || {})
              }
            }));
          }
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
    fetch(`${API_BASE_URL}/api/v1/orders?email=${loggedInEmail}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async res => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Server status ${res.status}: ${errText}`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : [];
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
          const mappedItems = rawItems.map(i => {
            const rawPrice = i.unitPrice ?? i.unit_price ?? i.price ?? 150.00;
            const taxRate = i.taxRate ?? 5;
            return {
              name: i.itemName || i.item_name || i.name || 'Food Item',
              qty: i.quantity || i.qty || 1,
              price: Number(rawPrice),
              taxRate: Number(taxRate),
              desc: i.itemDescription || i.item_description || ''
            };
          });

          const resolvedOrderId = o.orderId || o.order_id || o.id;
          const resolvedDisplayId = o.displayId || o.display_id || resolvedOrderId || `#KO01/00000${index + 1}`;
          
          const istTimestamp = o.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

          const subtotalCalc = mappedItems.length > 0 
            ? mappedItems.reduce((acc, it) => acc + (it.price * it.qty), 0)
            : (o.subtotal || 500.00);

          const taxCalc = mappedItems.length > 0
            ? mappedItems.reduce((acc, it) => acc + ((it.price * it.qty * it.taxRate) / 100), 0)
            : (subtotalCalc * 0.05);

          const totalCalc = Math.round(subtotalCalc + taxCalc);

          return {
            id: resolvedDisplayId,
            orderId: resolvedOrderId,
            customer: o.customerName || o.customer_name || 'Valued Customer',
            time: istTimestamp,
            timestamp: istTimestamp,
            status: o.status || 'New',
            type: o.orderType || o.order_type || 'Delivery',
            channel: o.channel || 'WhatsApp',
            items: mappedItems.length > 0 ? mappedItems : [{ name: 'Order Meal', qty: 1, price: 200.00, taxRate: 5, desc: '' }],
            address: o.deliveryAddress || o.delivery_address || 'MG Road, Bengaluru',
            phone: o.customerPhone || o.customer_phone || '9876543210',
            customerRequest: getOrderNote(o),
            subtotal: subtotalCalc,
            totalTax: taxCalc,
            total: totalCalc
          };
        });

        // 🔔 Chime once for orders we haven't seen before (skips the very first load)
        if (hasLoadedOrdersRef.current) {
          const freshOrders = formattedOrders.filter(
            o => !knownOrderIdsRef.current.has(o.orderId) && ['New', 'Accepted'].includes(o.status)
          );
          if (freshOrders.length > 0) {
            playNotificationChime(); // reads this device's mute + chosen chime
            setNewOrderPopup(freshOrders[0]);
          }
        }
        hasLoadedOrdersRef.current = true;
        knownOrderIdsRef.current = new Set(formattedOrders.map(o => o.orderId));

        setOrders(formattedOrders);
        if (formattedOrders.length > 0) {
          // keep the open order in sync (e.g. after auto-approval)
          setSelectedOrder(current =>
            current ? (formattedOrders.find(o => o.orderId === current.orderId) || current) : formattedOrders[0]
          );
        }
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error("❌ FETCH FAILED:", err);
        setIsOrdersFallback(true);
        setLoadingOrders(false);
      });
  }, [loggedInEmail, refreshTick]);

  // 🔄 Poll orders every 5 seconds so new orders and auto-approvals appear without pressing refresh
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  // 🔊 Browsers block sound until the first click; unlock audio on first interaction
  useEffect(() => {
    const unlock = () => {
      unlockNotificationAudio();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
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
        whatsappNumber: editForm.whatsappNumber,
        email: loggedInEmail
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
        showToast('Profile globally updated and saved to PostgreSQL database!');
      })
      .catch(err => {
        showToast('Error saving profile globally: ' + err.message, 'error');
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
      showToast('Notifications not supported by this browser.', 'error');
      return;
    }
    const permission = Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
    setAlertsEnabled(permission === 'granted');
    if (permission === 'granted') {
      showToast('Desktop alerts successfully enabled!');
    }
  };

  const isFieldOn = (key, defVal = true) => {
    if (receiptConfig.toggles && receiptConfig.toggles[key] !== undefined) {
      return receiptConfig.toggles[key];
    }
    return receiptConfig[key] !== undefined ? receiptConfig[key] : defVal;
  };

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;
    
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      showToast('Popup blocked! Please allow popups for printing.', 'error');
      return;
    }

    const density = receiptConfig.density || 'Compact';
    const paperSize = receiptConfig.paperSize || '80mm';

    const itemsHtml = selectedOrder.items.map(it => `
      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>${it.qty}x ${it.name}</span>
          <span>₹${(it.price * it.qty).toFixed(2)}</span>
        </div>
        ${isFieldOn('itemRate', true) ? `<div style="font-size: 9px; color: #555;">Rate: ₹${it.price} each (${it.taxRate || 5}% tax)</div>` : ''}
        ${isFieldOn('itemNotes', true) && it.desc ? `<div style="font-size: 9px; color: #b45309; font-style: italic;">&nbsp;• ${it.desc}</div>` : ''}
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${selectedOrder.id}</title>
          <style>
            body { font-family: monospace; padding: 16px; color: #000; background: #fff; width: ${paperSize === '58mm' ? '58mm' : '80mm'}; margin: 0 auto; font-size: ${density === 'Compact' ? '10px' : '12px'}; line-height: 1.4; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          ${isFieldOn('logo', false) && receiptConfig.logoUrl ? `<div class="center" style="margin-bottom: 6px;"><img src="${receiptConfig.logoUrl}" style="max-width: 50%; max-height: 45px; filter: grayscale(1);" /></div>` : ''}
          ${isFieldOn('headerText', false) && receiptConfig.headerText ? `<div class="center" style="font-size: 10px; color: #333;">${receiptConfig.headerText}</div>` : ''}
          ${isFieldOn('restaurantName', true) ? `<div class="center bold" style="font-size: 14px;">${(receiptConfig.restaurantName || 'RESTAURANT').toUpperCase()}</div>` : ''}
          ${isFieldOn('branchName', true) && receiptConfig.branchName ? `<div class="center" style="font-size: 11px;">${receiptConfig.branchName}</div>` : ''}
          ${isFieldOn('address', true) && receiptConfig.address ? `<div class="center" style="font-size: 10px; color: #333; margin: 3px 0; white-space: pre-line;">${receiptConfig.address}</div>` : ''}
          ${isFieldOn('phone', true) && receiptConfig.phone ? `<div class="center" style="font-size: 10px; color: #333;">Ph: ${receiptConfig.phone}</div>` : ''}
          ${isFieldOn('email', false) && receiptConfig.email ? `<div class="center" style="font-size: 10px; color: #333;">${receiptConfig.email}</div>` : ''}
          ${isFieldOn('gstin', true) && receiptConfig.gstin ? `<div class="center" style="font-size: 10px; color: #333;">GSTIN: ${receiptConfig.gstin}</div>` : ''}
          ${isFieldOn('fssai', true) && receiptConfig.fssai ? `<div class="center" style="font-size: 10px; color: #333; margin-bottom: 6px;">${receiptConfig.fssai}</div>` : ''}
          
          <div class="line"></div>
          ${isFieldOn('invoiceNo', true) ? `<div><strong>Receipt No:</strong> ${selectedOrder.id}</div>` : ''}
          ${isFieldOn('orderId', true) ? `<div><strong>Order ID:</strong> ${selectedOrder.orderId || selectedOrder.id}</div>` : ''}
          ${isFieldOn('orderType', true) ? `<div><strong>Type:</strong> ${selectedOrder.type} (${selectedOrder.channel})</div>` : ''}
          ${isFieldOn('dateAndTime', true) ? `<div><strong>Date:</strong> ${selectedOrder.time}</div>` : ''}
          ${isFieldOn('customerName', true) && selectedOrder.customer ? `<div><strong>Customer:</strong> ${selectedOrder.customer}</div>` : ''}
          ${isFieldOn('customerMobile', true) && selectedOrder.phone ? `<div><strong>Mobile:</strong> ${selectedOrder.phone}</div>` : ''}
          ${isFieldOn('address', true) && selectedOrder.address ? `<div><strong>Delivery Address:</strong> ${selectedOrder.address}</div>` : ''}
          ${selectedOrder.customerRequest ? `<div><strong>Note:</strong> <span style="color: #b45309; font-weight: bold;">${selectedOrder.customerRequest}</span></div>` : ''}
          
          <div class="line"></div>
          <div class="bold" style="margin-bottom: 6px;">ITEMS:</div>
          ${itemsHtml}
          
          <div class="line"></div>
          <div class="flex"><span>Subtotal:</span><span>₹${selectedOrder.subtotal.toFixed(2)}</span></div>
          ${isFieldOn('discount', true) && selectedOrder.discount ? `<div class="flex"><span>Discount:</span><span>-₹${Number(selectedOrder.discount).toFixed(2)}</span></div>` : ''}
          
          ${isFieldOn('totalTax', true) && !isFieldOn('taxBreakdown', true) ? `<div class="flex"><span>Total Tax:</span><span>₹${(selectedOrder.totalTax || (selectedOrder.subtotal * 0.05)).toFixed(2)}</span></div>` : ''}
          ${isFieldOn('totalTax', true) && isFieldOn('taxBreakdown', true) ? `
            <div class="flex"><span>CGST (2.5%):</span><span>₹${((selectedOrder.totalTax || (selectedOrder.subtotal * 0.05)) / 2).toFixed(2)}</span></div>
            <div class="flex"><span>SGST (2.5%):</span><span>₹${((selectedOrder.totalTax || (selectedOrder.subtotal * 0.05)) / 2).toFixed(2)}</span></div>
          ` : ''}
          
          <div class="flex bold" style="font-size: 13px; margin-top: 6px;"><span>TOTAL:</span><span>₹${Number(selectedOrder.total).toFixed(2)}</span></div>
          
          <div class="line"></div>
          ${isFieldOn('paymentMethod', true) ? `<div><strong>Payment:</strong> PAID Online / ${selectedOrder.channel}</div>` : ''}
          
          <div class="line"></div>
          ${isFieldOn('footerText', true) && receiptConfig.footerNote ? `<div class="center" style="font-size: 10px; white-space: pre-line; margin-top: 6px;">${receiptConfig.footerNote}</div>` : ''}
          
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
      showToast('Order notes successfully saved!');
    } catch (error) {
      console.error('Failed to save order notes:', error);
      showToast(`Unable to save order notes: ${error.message}`, 'error');
    } finally {
      setSavingOrderNotes(false);
    }
  };

  // UI-only helpers (no backend calls)
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const countByStatus = (s) => orders.filter(o => o.status.toLowerCase() === s.toLowerCase()).length;
  const activeValue = orders.filter(o => !['Picked Up', 'Completed'].includes(o.status)).reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const tablePct = tableStats.total ? Math.round((tableStats.occupied / tableStats.total) * 100) : 0;

  return (
    <div className="dashRoot" style={styles.container}>
      <style>{`
        .dashboardSidebar { position: relative; transition: width .18s ease; background-color: #001e16 !important; border-right: 2px solid #0b3328; }
        .sidebarToggle { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 36px; height: 36px; margin: 10px 0 8px 16px; padding: 0; border: 2px solid #164535; border-radius: 8px; background: #0b3328; cursor: pointer; flex: 0 0 auto; }
        .dashboardSidebar > .sidebarToggle { align-self: flex-start; margin-left: 16px; margin-right: auto; }
        .sidebarToggle:hover { background: #124734; border-color: #22c55e; }
        .sidebarToggle span { display: block; width: 16px; height: 2.5px; border-radius: 2px; background: #fff; }
        .sidebarNavLinks { display: flex; flex-direction: column; justify-content: center; align-items: stretch; gap: 4px; }
        .dashboardSidebarExpanded .sidebarNavLinks { align-items: stretch; justify-content: center; }
        .dashboardSidebarExpanded .brandBox { display: flex !important; }
        .navItem { position: relative; display: flex; align-items: center; justify-content: center !important; min-height: 46px; padding: 10px 0 !important; cursor: pointer; border: 2px solid transparent; border-radius: 8px; margin: 3px 6px; }
        .dashboardSidebarExpanded .navItem { justify-content: flex-start !important; padding: 10px 14px !important; color: #d6e4dd !important; }
        .dashboardSidebarExpanded .navItem > span:first-child { width: auto !important; flex: 1; justify-content: flex-start; }
        .dashboardSidebarExpanded .navItem > span:last-child { position: static; margin: 0 0 0 auto; font-size: 11px; }
        .dashboardSidebarExpanded .navIcon { width: auto !important; justify-content: flex-start !important; gap: 12px !important; }
        .navIcon { display: flex; width: 100%; align-items: center; justify-content: center; gap: 0; }
        .navGlyph { display: block; flex: 0 0 24px; width: 24px; height: 24px; color: #91aaa0; }
        .navItemActive .navGlyph { color: #e8fff5; }
        .navLabel { display: none; white-space: nowrap; line-height: 22px; font-size: 13px; font-weight: 700; }
        .dashboardSidebarExpanded .navLabel { display: inline; }
        .navBadge { position: absolute; top: 2px; right: 2px; margin: 0 !important; min-width: 18px; text-align: center; }
        .dashboardSidebarExpanded .navBadge { position: static; margin-left: auto !important; }
        .topBrand { display: flex; align-items: center; gap: 10px; min-width: 200px; text-align: left; color: #edf5f1; }
        .topBrandMark { color: #f04f50; font-size: 26px; }
        .topBrand strong { display: block; font-size: 15px; line-height: 1.2; letter-spacing: .02em; }
        .topBrand small, .profileName small { display: block; color: #91aaa0; font-size: 10px; line-height: 1.4; }
        .headerActions { display: flex; align-items: center; gap: 10px; }
        .alertButton, .profileButton, .detailPrintButton { height: 38px; border: 2px solid #164535; border-radius: 10px; background: #052d22; color: #d6e4dd; cursor: pointer; }
        .alertButton { padding: 0 13px; font-size: 12px; font-weight: 700; }
        .alertButton span { margin-right: 6px; }
        .profileButton { display: flex; align-items: center; gap: 10px; padding: 4px 11px 4px 6px; }
        .profileInitials { display: grid; place-items: center; background: #0b4635; color: #e8fff5; border-radius: 50%; width: 28px; height: 28px; font-size: 11px; font-weight: 800; }
        .profileName { min-width: 68px; text-align: left; font-size: 11px; }
        .profileName strong { display: block; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; }
        .headerActions > button:last-child:not(.profileButton):not(.alertButton) { border: 2px solid #fca5a5; background: #fee2e2; color: #991b1b; font-size: 12px; font-weight: 800; padding: 8px 16px; border-radius: 10px; cursor: pointer; }
        .ordersHeading { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 12px; border-bottom: 2px solid #cbd5e1; background: #fff; }
        .ordersHeading h1 { margin: 0; font-size: 20px; line-height: 1.3; font-weight: 900; letter-spacing: -.02em; color: #0f172a; }
        .availability { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 12px; font-weight: 800; }
        .availability b { margin-left: 4px; padding: 3px 8px; border-radius: 6px; color: #059669; background: #ecfdf5; border: 2px solid #a7f3d0; font-weight: 900; }
        .availability .pausedPill { color: #dc2626; background: #fef2f2; border-color: #fecaca; }
        .orderToolbar { min-height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0; padding: 4px 0; }
        .statusTabs, .orderTools { display: flex; align-items: center; gap: 8px; }
        .statusTabs { min-width: 0; overflow-x: auto; padding: 4px 0; }
        .orderTools { flex-shrink: 0; }
        .statusTab { white-space: nowrap; padding: 8px 14px; background: #fff; border: 2px solid #cbd5e1; border-radius: 24px; font-size: 12px; font-weight: 800; color: #334155; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
        .statusTab span { margin-left: 4px; color: #64748b; font-weight: 900; }
        .statusTab.selected { color: #fff; background: #0d9488; border-color: #0f766e; box-shadow: 0 4px 10px rgba(13, 148, 136, 0.25); }
        .statusTab.selected span { color: #fff; }
        .orderTools > button, .searchOrders { height: 38px; border: 2px solid #cbd5e1; border-radius: 10px; background: #fff; color: #0f172a; font-weight: 700; }
        .orderTools > button { width: 38px; font-size: 18px; cursor: pointer; display: grid; place-items: center; }
        .searchOrders { display: flex; align-items: center; gap: 8px; padding: 0 12px; box-sizing: border-box; }
        .searchOrders span { font-size: 18px; color: #64748b; }
        .searchOrders input { width: 110px; border: 0; outline: 0; color: #0f172a; font-size: 12px; font-weight: 700; background: transparent; }
        .orderTools .managePaused { width: auto; height: 36px; flex: 0 0 auto; display: flex; align-items: center; gap: 8px; padding: 0 12px; border: 2px solid #fecaca; border-radius: 8px; background: #fff; color: #dc2626; font-size: 12px; font-weight: 800; white-space: nowrap; cursor: pointer; }
        .orderTools .managePaused b { background: #fef2f2; color: #dc2626; border-radius: 6px; padding: 2px 6px; border: 1.5px solid #f87171; font-weight: 900; }
        .orderSummary { border-radius: 12px !important; padding: 16px !important; border: 2px solid #cbd5e1 !important; transition: all 0.2s ease; }
        .orderSummary:hover { border-color: #0d9488 !important; box-shadow: 0 6px 15px rgba(13,148,136,0.12) !important; }
        .orderSummary .orderStatus { padding: 4px 10px !important; font-size: 11px !important; border-radius: 8px !important; font-weight: 900 !important; border: 1.5px solid currentColor !important; }
        .orderTypeTag, .channelTag { display: inline-flex; align-items: center; margin-right: 6px; padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 800; border: 2px solid; }
        .orderTypeTag { color: #0d9488; background: #f0fdfa; border-color: #99f6e4; }
        .channelTag { color: #059669; background: #ecfdf5; border-color: #a7f3d0; }
        .orderSummaryItems { border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 10px; color: #1e293b; font-size: 13px; font-weight: 800; }
        .orderSummaryItems div { margin: 4px 0; display: flex; justify-content: space-between; }
        .orderSummaryItems div span { color: #475569; font-weight: 700; }
        .orderSummaryItems small { color: #64748b; font-size: 12px; font-weight: 800; }
        .orderSummaryFooter { display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 10px; color: #64748b; font-size: 12px; font-weight: 800; }
        .orderSummaryFooter strong { color: #0d9488; font-size: 15px; font-weight: 900; }
        .emptyOrders, .emptyDetail { display: grid; place-items: center; min-height: 200px; padding: 30px; color: #64748b; font-size: 14px; font-weight: 800; text-align: center; background: #fff; border: 2px dashed #cbd5e1; border-radius: 12px; }
        .detailPanelHeading { min-height: 56px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; padding-top: 4px; }
        .detailPrintButton { width: 38px; height: 38px; border: 2px solid #cbd5e1; border-radius: 10px; background: #fff; font-size: 18px; cursor: pointer; display: grid; place-items: center; color: #334155; }
        .detailPrintButton:hover { border-color: #0d9488; color: #0d9488; }
        .detailPanelColumn .listHeaderTitle { margin: 0; color: #0f172a; font-size: 16px; font-weight: 900; }
        .orderDetailCard { display: flex; flex: 1; flex-direction: column; min-height: 0; overflow-y: auto; position: relative; border: 2px solid #cbd5e1; border-radius: 14px; padding: 18px; text-align: left; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .detailTopline { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .detailTopline h2 { margin: 0 0 8px; font-size: 20px; font-weight: 900; color: #0f172a; }
        .detailTags { display: flex; gap: 6px; }
        .detailOrderNumber { display: flex; align-items: center; gap: 12px; margin-top: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-weight: 900; }
        .detailOrderNumber a { color: #0d9488; font-family: inherit; text-decoration: none; font-weight: 900; border-bottom: 2px dashed #0d9488; padding-bottom: 1px; }
        .detailMeta, .detailAddress { margin-top: 8px; color: #475569; font-size: 13px; font-weight: 800; }
        .customerRequest { display: flex; flex-direction: column; gap: 6px; margin: 14px 0; padding: 12px 14px; border: 2px solid #fcd34d; border-radius: 10px; background: #fffbeb; color: #92400e; font-size: 13px; font-weight: 800; }
        .customerRequest strong { color: #b45309; font-size: 12px; font-weight: 900; letter-spacing: 0.5px; }
        .orderNotesEditor { display: flex; flex-direction: column; gap: 8px; margin: 14px 0; padding: 12px; border: 2px solid #cbd5e1; border-radius: 10px; background: #f8fafc; }
        .orderNotesEditor label { display: flex; flex-direction: column; gap: 6px; color: #1e293b; font-size: 12px; font-weight: 900; }
        .orderNotesEditor textarea { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 2px solid #94a3b8; border-radius: 8px; background: #fff; color: #0f172a; font: inherit; font-size: 13px; font-weight: 700; resize: vertical; outline: none; }
        .orderNotesEditor textarea:focus { border-color: #0d9488; }
        .saveOrderNotesButton { align-self: flex-end; padding: 8px 14px; border: 2px solid #047857; border-radius: 8px; background: #059669; color: #fff; font-size: 12px; font-weight: 900; cursor: pointer; box-shadow: 0 2px 5px rgba(5, 150, 105, 0.2); }
        .saveOrderNotesButton:hover { background: #047857; }
        .saveOrderNotesButton:disabled { cursor: wait; opacity: .65; }
        .prepTimeControl { display: flex; justify-content: space-between; align-items: center; min-height: 46px; margin: 12px 0 14px; padding: 6px 12px; border: 2px solid #cbd5e1; border-radius: 10px; color: #1e293b; font-size: 12px; font-weight: 900; background: #f8fafc; }
        .prepTimeControl > div { display: flex; align-items: center; gap: 10px; color: #0f172a; }
        .prepTimeControl button { width: 30px; height: 30px; border: 2px solid #94a3b8; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); font-size: 16px; font-weight: 900; cursor: pointer; display: grid; place-items: center; }
        .prepTimeControl button:hover { border-color: #0d9488; color: #0d9488; }
        .prepTimeControl small { font-size: 12px; font-weight: 800; color: #475569; }
        .itemsHeading { color: #1e293b; font-size: 13px; font-weight: 900; letter-spacing: 0.5px; margin-top: 6px; }
        .menuOrigin { margin-top: 6px; padding-bottom: 10px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; font-weight: 800; }
        .detailItems { display: flex; flex-direction: column; }
        .detailItem { padding: 10px 0; border-bottom: 2px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 800; }
        .detailItemLine { display: flex; justify-content: space-between; gap: 14px; }
        .detailItemLine strong { white-space: nowrap; font-weight: 900; color: #0f172a; }
        .detailItemLine strong small { margin-right: 6px; color: #475569; font-weight: 800; }
        .detailItemDescription { padding: 4px 0 0 10px; color: #475569; font-size: 12px; font-weight: 700; }
        .orderTotals { margin-top: auto; padding-top: 12px; }
        .orderTotals > div { display: flex; justify-content: space-between; padding: 6px 0; color: #475569; font-size: 13px; font-weight: 800; }
        .orderTotals > div strong:last-child { color: #0f172a; font-weight: 900; }
        .orderTotals .totalLine { margin-top: 8px; padding-top: 10px; border-top: 2px solid #cbd5e1; color: #0f172a; font-size: 16px; font-weight: 900; }
        .orderTotals .totalLine strong:last-child { color: #0d9488; font-size: 18px; font-weight: 900; }
        .detailActionBar { position: sticky; bottom: -18px; margin: 12px -18px -18px; padding: 14px 18px; border-top: 2px solid #cbd5e1; background: #fff; border-radius: 0 0 14px 14px; }
        .prepareButton { width: 100%; min-height: 46px; border: 2px solid #dc2626; border-radius: 10px; background: #ef4444; color: #fff; font-size: 14px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); transition: all 0.2s; }
        .prepareButton:hover { background: #dc2626; box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4); }
        .completedMessage { display: block; padding: 12px; color: #059669; text-align: center; font-size: 13px; font-weight: 900; background: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 10px; }
        @media (max-width: 950px) {
          .orderToolbar { align-items: flex-start; flex-direction: column; padding: 8px 0; height: auto; }
          .statusTabs { width: 100%; overflow-x: auto; padding-bottom: 4px; }
          .orderTools { width: 100%; }
          .searchOrders { flex: 1; }
          .searchOrders input { width: 100%; }
          .splitViewWrapper { padding-left: 12px !important; padding-right: 12px !important; }
          .detailPanelColumn { padding-left: 10px !important; }
        }
        @media (max-width: 680px) {
          .dashboardSidebar:not(.dashboardSidebarExpanded) { width: 50px !important; }
          .dashboardSidebarExpanded { width: 230px !important; position: absolute; inset: 0 auto 0 0; z-index: 1000; box-shadow: 10px 0 30px rgba(0,0,0,0.3); }
          .header { padding: 0 12px !important; }
          .topBrand { min-width: 0; }
          .topBrand small, .alertButton, .profileName, .profileButton > span:last-child { display: none; }
          .headerActions { gap: 6px; }
          .profileButton { border: 0; padding: 0; }
          .ordersHeading { padding: 12px; }
          .ordersHeading h1 { font-size: 18px; }
          .availability { font-size: 10px; }
          .splitViewWrapper { flex-direction: column; overflow-y: auto !important; }
          .masterListColumn { flex: 0 0 45%; min-height: 220px; }
          .detailPanelColumn { flex: 1 0 55%; min-height: 450px; border-left: 0 !important; border-top: 2px solid #cbd5e1 !important; padding: 0 !important; }
          .orderDetailCard { min-height: 0; }
        }
        @media print {
          body * { visibility: hidden !important; }
          #printable-thermal-receipt, #printable-thermal-receipt * { visibility: visible !important; }
          #printable-thermal-receipt { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 100% !important; box-shadow: none !important; border: none !important; background: #fff !important; margin: 0 !important; padding: 24px !important; z-index: 999999 !important; }
          #printable-thermal-receipt .orderNotesEditor { display: none !important; }
        }
/* DashboardEnhance.css — import AFTER your other styles. Frontend only. */
.dashRoot {
  --sp-1: 8px; --sp-2: 12px; --sp-3: 16px; --sp-4: 24px;
  --ease: cubic-bezier(.22, .8, .3, 1);
  --shadow-sm: 0 1px 3px rgba(15,23,42,.06);
  --shadow-md: 0 8px 22px rgba(15,23,42,.10);
  height: 100vh; height: 100dvh !important;
  -webkit-tap-highlight-color: transparent;
}

/* ---------- Keyframes ---------- */
@keyframes dFadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes dFadeIn   { from { opacity: 0; } to { opacity: 1; } }
@keyframes dSlideLeft{ from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
@keyframes dSlideRight{from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
@keyframes dPop      { 0% { opacity: 0; transform: scale(.86) translateY(10px); } 70% { transform: scale(1.03); } 100% { opacity: 1; transform: none; } }
@keyframes dToast    { from { opacity: 0; transform: translateY(24px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes dPulse    { 0% { box-shadow: 0 0 0 0 rgba(3,105,161,.45); } 70% { box-shadow: 0 0 0 9px rgba(3,105,161,0); } 100% { box-shadow: 0 0 0 0 rgba(3,105,161,0); } }
@keyframes dRing     { 0%,100% { transform: rotate(0); } 15% { transform: rotate(16deg); } 30% { transform: rotate(-14deg); } 45% { transform: rotate(10deg); } 60% { transform: rotate(-6deg); } }
@keyframes dShimmer  { from { background-position: 200% 0; } to { background-position: -200% 0; } }

/* ---------- Page load ---------- */
.dashRoot .dashboardSidebar { animation: dSlideLeft .5s var(--ease) both; }
.dashRoot .header           { animation: dFadeUp .5s var(--ease) .05s both; }
.dashRoot .ordersHeading    { animation: dFadeUp .5s var(--ease) .12s both; }
.dashRoot .orderToolbar     { animation: dFadeUp .5s var(--ease) .18s both; }
.dashRoot .tablesBar        { animation: dFadeUp .5s var(--ease) .15s both; }
.dashRoot .moduleFade       { animation: dFadeIn .35s var(--ease) both; }

/* ---------- Global smoothness ---------- */
.dashRoot button, .dashRoot li, .dashRoot a, .dashRoot input, .dashRoot textarea,
.dashRoot .orderSummary, .dashRoot .statusTab, .dashRoot .tablesBar {
  transition: transform .2s var(--ease), box-shadow .2s var(--ease), background-color .2s var(--ease),
              border-color .2s var(--ease), color .2s var(--ease), opacity .2s var(--ease);
}
.dashRoot button:active { transform: scale(.96) !important; }
.dashRoot :focus-visible { outline: 3px solid rgba(13,148,136,.45); outline-offset: 2px; }

/* ---------- Sidebar ---------- */
.dashRoot .dashboardSidebar { transition: width .3s var(--ease); }
.dashRoot .navItem:hover { background: rgba(255,255,255,.08) !important; transform: translateX(3px); }
.dashRoot .navItem:hover .navGlyph { transform: scale(1.18); color: #fff; }
.dashRoot .navGlyph { transition: transform .2s var(--ease), color .2s; }
.dashRoot .navLabel { animation: dFadeIn .3s ease both; }
.dashRoot .sidebarToggle:hover { transform: scale(1.08); }

/* ---------- Header ---------- */
.dashRoot .headerActions { gap: var(--sp-2); }
.dashRoot .alertButton:hover, .dashRoot .profileButton:hover { background: #0a3d2e; border-color: #22c55e; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,.25); }
.dashRoot .headerActions > button:last-child:hover { background: #fecaca; transform: translateY(-2px); }

/* ---------- Tables bar ---------- */
.dashRoot .tablesBar:hover { background: #e6f7f5 !important; transform: translateY(-1px); box-shadow: var(--shadow-sm); }

/* ---------- Order cards ---------- */
.dashRoot .scrollCards { padding: var(--sp-1) 6px var(--sp-3) var(--sp-1) !important; gap: var(--sp-2) !important; }
.dashRoot .orderSummary { animation: dFadeUp .45s var(--ease) both; }
.dashRoot .orderSummary:hover { transform: translateY(-4px) scale(1.01); box-shadow: var(--shadow-md) !important; }
.dashRoot .orderSummary.isSelected { background: #f0fdfa !important; box-shadow: 0 0 0 3px rgba(13,148,136,.15) !important; }
.dashRoot .orderStatus.isNew { animation: dPulse 1.8s infinite; }

/* ---------- Status tabs / tools ---------- */
.dashRoot .statusTab:hover { transform: translateY(-2px); border-color: #0d9488; box-shadow: 0 4px 10px rgba(13,148,136,.15); }
.dashRoot .statusTab.selected { transform: translateY(-1px); }
.dashRoot .orderTools > button:hover, .dashRoot .detailPrintButton:hover { transform: translateY(-2px) rotate(8deg); box-shadow: var(--shadow-sm); }
.dashRoot .searchOrders:focus-within { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,.15); }
.dashRoot .searchOrders input { transition: width .3s var(--ease); }
.dashRoot .searchOrders input:focus { width: 160px; }
.dashRoot .statusTabs { scrollbar-width: none; }
.dashRoot .statusTabs::-webkit-scrollbar { display: none; }

/* ---------- Detail panel ---------- */
.dashRoot .orderDetailCard { animation: dSlideRight .4s var(--ease) both; padding: var(--sp-4) !important; }
.dashRoot .detailActionBar { margin: var(--sp-2) calc(var(--sp-4) * -1) calc(var(--sp-4) * -1) !important; padding: var(--sp-3) var(--sp-4) !important; }
.dashRoot .detailItem { animation: dFadeUp .4s var(--ease) both; }
.dashRoot .detailItem:nth-child(2) { animation-delay: .05s; } .dashRoot .detailItem:nth-child(3) { animation-delay: .1s; }
.dashRoot .detailItem:nth-child(4) { animation-delay: .15s; } .dashRoot .detailItem:nth-child(n+5) { animation-delay: .2s; }
.dashRoot .prepareButton:hover { transform: translateY(-2px); }
.dashRoot .saveOrderNotesButton:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(5,150,105,.3); }
.dashRoot .prepTimeControl button:hover { transform: scale(1.12); }
.dashRoot .emptyDetail, .dashRoot .emptyOrders { animation: dFadeIn .4s ease both; }

/* ---------- Loading skeleton ---------- */
.dashRoot .skeleton {
  height: 128px; border-radius: 12px; margin-bottom: var(--sp-2);
  background: linear-gradient(90deg, #eef2f7 25%, #f8fafc 37%, #eef2f7 63%);
  background-size: 400% 100%; animation: dShimmer 1.4s linear infinite;
}

/* ---------- Modals / popup / toast ---------- */
.dashRoot .modalOverlay { animation: dFadeIn .25s ease both; padding: var(--sp-3); box-sizing: border-box; }
.dashRoot .popupCard, .dashRoot .profileCard {
  width: min(92vw, 460px) !important; max-height: 90dvh; overflow-y: auto; box-sizing: border-box;
  animation: dPop .45s var(--ease) both;
}
.dashRoot .popupCard .bell { display: inline-block; font-size: 38px; margin-bottom: 8px; transform-origin: top center; animation: dRing 1.2s ease .3s 2; }
.dashRoot .toast { animation: dToast .4s var(--ease) both; max-width: calc(100vw - 32px); }
.dashRoot .profileRow:hover { background: #f1f5f9 !important; transform: translateX(3px); }

/* ---------- Mobile drawer overlay ---------- */
.dashRoot .navOverlay { display: none; }

/* ---------- Responsive ---------- */
@media (max-width: 950px) {
  .dashRoot .ordersHeading { padding: var(--sp-3) var(--sp-3) var(--sp-2); }
  .dashRoot .orderToolbar { gap: var(--sp-2); }
  .dashRoot .orderTools { flex-wrap: wrap; }
  .dashRoot .orderTools .managePaused { flex: 1 1 100%; justify-content: center; }
}
@media (max-width: 680px) {
  .dashRoot .navOverlay { display: block; position: fixed; inset: 0; z-index: 900; background: rgba(2,12,9,.55); backdrop-filter: blur(3px); animation: dFadeIn .25s ease both; }
  .dashRoot .dashboardSidebarExpanded { animation: dSlideLeft .3s var(--ease) both; }
  .dashRoot .header { height: 58px !important; }
  .dashRoot .ordersHeading { flex-direction: column; align-items: flex-start; gap: var(--sp-1); }
  .dashRoot .splitViewWrapper { padding: 0 var(--sp-2) var(--sp-3) !important; gap: var(--sp-3) !important; }
  .dashRoot .masterListColumn { flex: 0 0 auto !important; max-height: 60dvh; }
  .dashRoot .detailPanelColumn { padding-top: var(--sp-3) !important; }
  .dashRoot .orderDetailCard { padding: var(--sp-3) !important; }
  .dashRoot .detailActionBar { margin: var(--sp-2) calc(var(--sp-3) * -1) calc(var(--sp-3) * -1) !important; padding: var(--sp-2) var(--sp-3) !important; }
  .dashRoot .detailTopline { flex-direction: column; }
  .dashRoot .statusTab, .dashRoot .orderTools > button, .dashRoot .searchOrders { min-height: 42px; }
  .dashRoot .toast { left: 16px; right: 16px; bottom: 16px !important; }
  .dashRoot .profileRow { flex-direction: column; align-items: flex-start !important; gap: 4px; }
}
@media (hover: none) {
  .dashRoot .orderSummary:hover, .dashRoot .navItem:hover, .dashRoot .statusTab:hover { transform: none; }
}

/* ---------- Respect reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .dashRoot *, .dashRoot *::before, .dashRoot *::after { animation: none !important; transition: none !important; }
}

/* ================= GLOW EFFECTS ================= */
@keyframes dGlow   { 0%,100% { filter: drop-shadow(0 0 3px var(--glow)); } 50% { filter: drop-shadow(0 0 9px var(--glow)) drop-shadow(0 0 16px var(--glow)); } }
@keyframes dBox    { 0%,100% { box-shadow: 0 0 8px rgba(5,201,138,.45); } 50% { box-shadow: 0 0 20px rgba(5,201,138,.85); } }
@keyframes dBadge  { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,.7); } 50% { box-shadow: 0 0 12px 3px rgba(52,211,153,.7); } }
@keyframes dLogo   { 0%,100% { text-shadow: 0 0 6px rgba(240,79,80,.5); } 50% { text-shadow: 0 0 16px rgba(240,79,80,.95); } }

/* Sidebar icons: each tab glows in its own colour (set via --glow) */
.dashRoot .navItem .navGlyph { color: var(--glow, #91aaa0); opacity: .8; filter: drop-shadow(0 0 3px var(--glow)); animation: dGlow 3s ease-in-out infinite; }
.dashRoot .navItem:hover .navGlyph { opacity: 1; transform: scale(1.2) rotate(-4deg); filter: drop-shadow(0 0 8px var(--glow)) drop-shadow(0 0 16px var(--glow)); animation: none; }
.dashRoot .navItem:hover { background: rgba(255,255,255,.07) !important; box-shadow: inset 0 0 14px rgba(255,255,255,.05); }
.dashRoot .navItem.navItemActive { box-shadow: 0 0 14px rgba(5,201,138,.6); animation: dBox 2.4s ease-in-out infinite; }
.dashRoot .navItem.navItemActive .navGlyph { color: #003d2b; filter: none; animation: none; opacity: 1; }
.dashRoot .navItem.navItemActive .navLabel { color: #003d2b; }
.dashRoot .navBadge { animation: dBadge 1.8s ease-in-out infinite; }
.dashRoot .sidebarToggle:hover { box-shadow: 0 0 14px rgba(34,197,94,.7); }
.dashRoot .sidebarToggle span { transition: width .2s, background .2s; }
.dashRoot .sidebarToggle:hover span { background: #22c55e; }

/* Logo / brand */
.dashRoot .topBrandMark { animation: dLogo 2.6s ease-in-out infinite; display: inline-block; }
.dashRoot .topBrand strong { text-shadow: 0 0 10px rgba(52,211,153,.35); }
.dashRoot .brandBox span { filter: drop-shadow(0 0 8px rgba(52,211,153,.6)); }

/* Header */
.dashRoot .alertButton:hover, .dashRoot .profileButton:hover { box-shadow: 0 0 16px rgba(34,197,94,.55); }
.dashRoot .profileInitials { box-shadow: 0 0 10px rgba(52,211,153,.5); }
.dashRoot .profileButton:hover .profileInitials { box-shadow: 0 0 16px rgba(52,211,153,.9); }
.dashRoot .headerActions > button:last-child:hover { box-shadow: 0 0 16px rgba(248,113,113,.6); }

/* Orders */
.dashRoot .statusTab.selected { box-shadow: 0 0 16px rgba(13,148,136,.55); }
.dashRoot .statusTab:hover { box-shadow: 0 0 12px rgba(13,148,136,.35); }
.dashRoot .orderSummary:hover, .dashRoot .orderSummary.isSelected { box-shadow: 0 0 0 1px #0d9488, 0 8px 24px rgba(13,148,136,.28) !important; }
.dashRoot .orderStatus.isNew { box-shadow: 0 0 10px rgba(3,105,161,.5); }
.dashRoot .tablesBar:hover { box-shadow: 0 0 14px rgba(13,148,136,.25); }
.dashRoot .prepareButton { box-shadow: 0 0 14px rgba(239,68,68,.45); }
.dashRoot .prepareButton:hover { box-shadow: 0 0 24px rgba(239,68,68,.8); }
.dashRoot .saveOrderNotesButton:hover { box-shadow: 0 0 16px rgba(5,150,105,.6); }
.dashRoot .orderTools > button:hover, .dashRoot .detailPrintButton:hover { box-shadow: 0 0 12px rgba(13,148,136,.4); }
.dashRoot .primaryModalBtn:hover { box-shadow: 0 0 16px rgba(5,150,105,.6); }
.dashRoot .popupCard .bell { filter: drop-shadow(0 0 10px rgba(250,204,21,.8)); }
.dashRoot .completedMessage { box-shadow: 0 0 12px rgba(5,150,105,.25); }

@media (prefers-reduced-motion: reduce) {
  .dashRoot .navItem .navGlyph, .dashRoot .navItem.navItemActive, .dashRoot .navBadge, .dashRoot .topBrandMark { animation: none !important; }
}


/* ================= v3: TEAL + GOLD THEME, ONE-SCREEN LAYOUT ================= */
.dashRoot { --teal: #0d9488; --teal-d: #0f766e; --teal-l: #14b8a6; --gold: #d97706; --gold-l: #fbbf24; --ink: #0f172a; }
@keyframes dShine { 0% { transform: translateX(-130%); } 60%, 100% { transform: translateX(330%); } }
@keyframes dFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes dLive  { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.7); } 70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
@keyframes dLate  { 0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); } 50% { box-shadow: 0 0 16px 2px rgba(245,158,11,.5); } }
@keyframes dBump  { 0% { transform: scale(1); } 40% { transform: scale(1.3); } 100% { transform: scale(1); } }
@keyframes dStep  { 0%, 100% { box-shadow: 0 0 6px 1px var(--st); } 50% { box-shadow: 0 0 16px 4px var(--st); } }

/* ---------- Header ---------- */
.dashRoot .header { box-shadow: 0 6px 22px rgba(0,30,22,.35); border-bottom: 2px solid transparent !important; border-image: linear-gradient(90deg, transparent, var(--teal-l), var(--gold-l), transparent) 1; }
.dashRoot .topBrand strong { color: var(--gold-l); }
.dashRoot .navBadge { background: var(--gold-l) !important; color: #422006 !important; }
@keyframes dBadge { 0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,.7); } 50% { box-shadow: 0 0 12px 3px rgba(251,191,36,.7); } }

/* ---------- Sidebar: always fits one screen, never scrolls ---------- */
.dashRoot .dashboardSidebar { overflow: hidden; height: 100dvh !important; }
.dashRoot .sidebarNavLinks { flex: 1 1 0 !important; min-height: 0; overflow: hidden !important; overflow-y: hidden !important; justify-content: space-evenly !important; padding: 4px 0 !important; gap: 0 !important; }
.dashRoot .navItem { flex: 1 1 0; min-height: 0 !important; max-height: 50px; height: auto !important; margin: 2px 6px !important; padding: 0 !important; }
.dashRoot .dashboardSidebarExpanded .navItem { padding: 0 14px !important; }
@media (max-height: 760px) {
  .dashRoot .navGlyph { width: 20px; height: 20px; flex-basis: 20px; }
  .dashRoot .navLabel { font-size: 12px; }
  .dashRoot .sidebarToggle { margin: 6px 0 4px 16px; width: 32px; height: 32px; }
  .dashRoot .brandBox { padding: 10px 16px !important; }
}
@media (max-height: 600px) {
  .dashRoot .brandBox { display: none !important; }
  .dashRoot .navGlyph { width: 18px; height: 18px; flex-basis: 18px; }
}

/* ---------- Online orders: heading, summary row, tabs ---------- */
.dashRoot .liveDot { display: inline-block; width: 9px; height: 9px; margin-right: 10px; border-radius: 50%; background: #10b981; animation: dLive 1.8s infinite; }
.dashRoot .sumRow { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; padding: 12px 18px 0; animation: dFadeUp .5s var(--ease) .2s both; }
.dashRoot .sumCard { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; background: #fff; border: 1px solid #e2e8f0; border-left: 4px solid var(--c); box-shadow: 0 2px 10px rgba(15,23,42,.06); }
.dashRoot .sumCard:hover { transform: translateY(-3px); box-shadow: 0 0 0 1px var(--c), 0 10px 22px rgba(15,23,42,.12); }
.dashRoot .sumIcon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; font-size: 17px; font-weight: 900; color: var(--c); background: color-mix(in srgb, var(--c) 14%, #fff); }
.dashRoot .sumCard b { display: block; font-size: 20px; line-height: 1.1; font-weight: 900; color: var(--ink); }
.dashRoot .sumCard small { font-size: 11px; font-weight: 800; color: #64748b; }
.dashRoot .statusTab i { font-style: normal; margin-right: 4px; }
.dashRoot .statusTab .cnt { display: inline-grid; place-items: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; background: #f1f5f9; animation: dBump .4s ease; }
.dashRoot .statusTab.selected .cnt { background: rgba(255,255,255,.25); }
.dashRoot .scrollCards { scrollbar-width: thin; scrollbar-color: #99f6e4 transparent; }

/* ---------- Order cards ---------- */
.dashRoot .orderSummary { border-left: 5px solid var(--st, #cbd5e1) !important; box-shadow: 0 2px 10px rgba(15,23,42,.06); }
.dashRoot .orderSummary.isLate { animation: dFadeUp .45s var(--ease) both, dLate 2.2s ease-in-out .5s infinite; }
.dashRoot .agoTag { display: inline-flex; align-items: center; gap: 4px; }
.dashRoot .orderSummaryFooter strong { color: var(--gold); }

/* ---------- Empty states ---------- */
.dashRoot .emptyOrders, .dashRoot .emptyDetail { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(180deg, #f0fdfa, #fff); border-color: #99f6e4; }
.dashRoot .emptyIcon { font-size: 44px; animation: dFloat 3s ease-in-out infinite; }

/* ---------- Tables bar progress ---------- */
.dashRoot .tblProg { width: 90px; height: 6px; border-radius: 4px; background: #e2e8f0; overflow: hidden; }
.dashRoot .tblProg i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--teal-l), var(--gold-l)); transition: width .6s var(--ease); }

/* ---------- Selected order (bill) panel: fits one screen ---------- */
.dashRoot .detailPanelColumn { overflow: hidden !important; }
.dashRoot .orderDetailCard { --p: clamp(10px, 1.6vh, 18px); padding: 0 !important; gap: 0; overflow: hidden; border: 1px solid #e2e8f0 !important; border-radius: 16px !important; box-shadow: 0 12px 32px rgba(15,23,42,.10), 0 0 0 1px color-mix(in srgb, var(--st) 25%, transparent) !important; }
.dashRoot .orderDetailCard > * { flex-shrink: 0; }
.dashRoot .billHead { display: flex; align-items: center; gap: 12px; padding: var(--p) calc(var(--p) + 4px); background: linear-gradient(120deg, color-mix(in srgb, var(--st) 18%, #fff), #fff 70%); border-bottom: 3px solid var(--st); }
.dashRoot .avatar { display: grid; place-items: center; flex: 0 0 auto; width: clamp(34px, 5vh, 46px); height: clamp(34px, 5vh, 46px); border-radius: 50%; color: #fff; font-weight: 900; font-size: 15px; background: linear-gradient(135deg, var(--st), color-mix(in srgb, var(--st) 55%, #000)); box-shadow: 0 0 0 3px #fff, 0 0 16px var(--st); }
.dashRoot .billHead h2 { margin: 0 !important; font-size: clamp(15px, 2.3vh, 19px) !important; line-height: 1.2; }
.dashRoot .billHead .sub { font-family: ui-monospace, Menlo, monospace; font-size: 12px; font-weight: 800; color: #64748b; }
.dashRoot .billHead .orderStatus { margin-left: auto; box-shadow: 0 0 14px color-mix(in srgb, var(--st) 55%, transparent); }

.dashRoot .tracker { display: flex; align-items: center; padding: calc(var(--p) * .8) calc(var(--p) + 4px) 0; }
.dashRoot .step { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 0 0 auto; font-size: 9.5px; font-weight: 800; color: #94a3b8; }
.dashRoot .step i { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: #e2e8f0; color: #fff; font-style: normal; font-size: 10px; }
.dashRoot .step.done { color: var(--teal-d); }
.dashRoot .step.done i { background: var(--teal); }
.dashRoot .step.now { color: var(--ink); }
.dashRoot .step.now i { background: var(--st); animation: dStep 1.8s ease-in-out infinite; }
.dashRoot .bar { flex: 1; height: 3px; margin: 0 2px 12px; border-radius: 2px; background: #e2e8f0; }
.dashRoot .bar.done { background: linear-gradient(90deg, var(--teal), var(--teal-l)); }

.dashRoot .infoGrid { display: grid; gap: 6px; padding: calc(var(--p) * .8) calc(var(--p) + 4px) 0; }
.dashRoot .infoRow { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border-radius: 10px; background: #f8fafc; border: 1px solid #eef2f7; font-size: 12.5px; font-weight: 800; color: #334155; text-decoration: none; }
.dashRoot a.infoRow:hover { background: #f0fdfa; border-color: #99f6e4; transform: translateX(3px); }
.dashRoot .infoRow i { font-style: normal; display: grid; place-items: center; flex: 0 0 auto; width: 24px; height: 24px; border-radius: 8px; background: #ccfbf1; font-size: 13px; }
.dashRoot .infoRow span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dashRoot .customerRequest { margin: calc(var(--p) * .7) calc(var(--p) + 4px) 0 !important; padding: 8px 12px !important; border-color: var(--gold-l) !important; animation: dLate 2.4s ease-in-out infinite; }
.dashRoot .orderNotesEditor { margin: calc(var(--p) * .7) calc(var(--p) + 4px) 0 !important; padding: 8px !important; gap: 8px !important; flex-direction: row !important; align-items: flex-end; }
.dashRoot .orderNotesEditor label { flex: 1; font-size: 11px !important; gap: 3px !important; }
.dashRoot .orderNotesEditor textarea { resize: none !important; padding: 6px 10px !important; height: 34px; }
.dashRoot .saveOrderNotesButton { align-self: flex-end !important; white-space: nowrap; }
.dashRoot .prepTimeControl { margin: calc(var(--p) * .7) calc(var(--p) + 4px) 0 !important; min-height: 0 !important; padding: 5px 10px !important; border-radius: 999px !important; background: #f0fdfa !important; border-color: #99f6e4 !important; }
.dashRoot .prepTimeControl button { border-radius: 50% !important; width: 26px !important; height: 26px !important; }

.dashRoot .itemsHeading { padding: calc(var(--p) * .8) calc(var(--p) + 4px) 4px; margin: 0 !important; font-size: 11px !important; color: #64748b !important; }
.dashRoot .menuOrigin { display: none; }
.dashRoot .detailItems { flex: 1 1 auto !important; min-height: 56px; overflow-y: auto; padding: 0 calc(var(--p) + 4px); gap: 6px; scrollbar-width: none; }
.dashRoot .detailItems::-webkit-scrollbar { display: none; }
.dashRoot .detailItem { flex-shrink: 0; padding: 7px 10px !important; border: 1px solid #e2e8f0 !important; border-radius: 10px; background: #fff; box-shadow: 0 1px 4px rgba(15,23,42,.05); }
.dashRoot .detailItem:hover { border-color: var(--teal) !important; transform: translateX(3px); }
.dashRoot .detailItemLine > span { display: flex; align-items: center; gap: 8px; }
.dashRoot .qtyBadge { display: inline-grid; place-items: center; min-width: 26px; height: 22px; padding: 0 6px; border-radius: 7px; background: linear-gradient(135deg, var(--teal), var(--teal-l)); color: #fff; font-size: 11px; font-weight: 900; }

.dashRoot .orderTotals { margin: calc(var(--p) * .6) 0 0 !important; padding: calc(var(--p) * .6) calc(var(--p) + 4px) 0 !important; border-top: 2px dashed #cbd5e1; }
.dashRoot .orderTotals > div { padding: 2px 0 !important; font-size: 12.5px !important; }
.dashRoot .orderTotals .totalLine { border-top: 0 !important; margin-top: 2px !important; padding-top: 4px !important; }
.dashRoot .orderTotals .totalLine strong:last-child { color: var(--gold) !important; font-size: clamp(18px, 3vh, 24px) !important; text-shadow: 0 0 14px rgba(251,191,36,.55); }

.dashRoot .detailActionBar { position: static !important; margin: 0 !important; padding: calc(var(--p) * .7) calc(var(--p) + 4px) calc(var(--p) + 2px) !important; border-top: 0 !important; background: transparent !important; }
.dashRoot .prepareButton { position: relative; overflow: hidden; min-height: clamp(38px, 6vh, 48px) !important; border: 0 !important; border-radius: 12px !important; letter-spacing: .02em; background: linear-gradient(135deg, var(--st), color-mix(in srgb, var(--st) 60%, #000)) !important; box-shadow: 0 6px 18px color-mix(in srgb, var(--st) 45%, transparent), inset 0 0 0 1px rgba(255,255,255,.15) !important; }
.dashRoot .prepareButton::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 35%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent); animation: dShine 3.2s ease-in-out infinite; }
.dashRoot .prepareButton:hover { box-shadow: 0 0 26px var(--st) !important; }

@media (max-height: 780px) {
  .dashRoot .infoGrid { grid-template-columns: 1fr 1fr; }
  .dashRoot .infoRow.addr { grid-column: 1 / -1; }
}
@media (max-height: 700px) {
  .dashRoot .step span { display: none; }
  .dashRoot .bar { margin-bottom: 0; }
  .dashRoot .sumRow { display: none; }
}

/* ---------- Shadows, glow and focus everywhere ---------- */
.dashRoot .popupCard, .dashRoot .profileCard { box-shadow: 0 30px 70px rgba(0,0,0,.35), 0 0 40px rgba(20,184,166,.25) !important; }
.dashRoot .primaryModalBtn { position: relative; overflow: hidden; background: linear-gradient(135deg, var(--teal), var(--teal-l)) !important; box-shadow: 0 6px 16px rgba(13,148,136,.4); }
.dashRoot .primaryModalBtn:hover { box-shadow: 0 0 22px rgba(20,184,166,.8); transform: translateY(-2px); }
.dashRoot input:focus, .dashRoot textarea:focus { border-color: var(--teal) !important; box-shadow: 0 0 0 3px rgba(20,184,166,.25) !important; }
.dashRoot .ordersHeading { box-shadow: 0 4px 14px rgba(15,23,42,.05); }
.dashRoot .tablesBar { box-shadow: 0 2px 10px rgba(15,23,42,.06); }
.dashRoot .availability b { animation: dLive 2.4s infinite; }

@media (max-width: 950px) { .dashRoot .sumRow { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 10px 12px 0; } }
@media (max-width: 680px) {
  .dashRoot .orderDetailCard { overflow: visible; }
  .dashRoot .detailItems { overflow: visible; }
}
@media (prefers-reduced-motion: reduce) {
  .dashRoot .prepareButton::after, .dashRoot .liveDot, .dashRoot .emptyIcon, .dashRoot .step.now i, .dashRoot .customerRequest { animation: none !important; }
}
      `}</style>

      {/* Mobile drawer overlay */}
      {isNavExpanded && <div className="navOverlay" onClick={() => setIsNavExpanded(false)} />}

      {/* Sidebar */}
      <div className={`dashboardSidebar${isNavExpanded ? ' dashboardSidebarExpanded' : ''}`} style={{ ...styles.sidebar, width: isNavExpanded ? '230px' : '56px' }}>
        <button type="button" className="sidebarToggle" aria-label={isNavExpanded ? 'Collapse navigation' : 'Expand navigation'} aria-expanded={isNavExpanded} onClick={() => setIsNavExpanded(expanded => !expanded)}>
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
          {['Online Orders', 'Counter POS', 'Tables', 'Kitchen', 'Menu', 'Reports', 'Promotions', 'Customers', 'Complaints', 'Gallery', 'Settings'].map((tab) => {
            const isActive = activeTab === tab;
            const isHovered = hoveredTab === tab;
            return (
              <li 
                key={tab}
                className={`navItem${isActive ? ' navItemActive' : ''}`}
                style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : {}), ...(isHovered && !isActive ? styles.navItemHover : {}) }}
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
        <div className="header" style={styles.header}>
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
            <button onClick={() => setActiveTab('Menu')} style={styles.pausedItemsBtn}>
              🔴 Manage Paused Items <span style={styles.pausedCountBadge}>{pausedCount}</span>
            </button>
            <button onClick={onLogout} style={styles.topLogoutBtn}>Sign Out</button>
          </div>
        </div>

        {/* Tables Status Bar */}
        <div className="tablesBar" style={styles.tablesStatusBar} onClick={() => setActiveTab('Tables')}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#1e293b', fontSize: '12px'}}>
            <span>♜</span>
            <span>Tables</span>
            <span style={{color: '#cbd5e1'}}>·</span>
            <span style={{color: '#16a34a'}}>{tableStats.open}/{tableStats.total} open</span>
            <span style={{color: '#cbd5e1'}}>·</span>
            <span>{tableStats.occupied} occupied</span>
            <span style={{backgroundColor: '#0d9488', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '900'}}>{tableStats.billing} billing</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><div className="tblProg" title={`${tablePct}% occupied`}><i style={{width: `${tablePct}%`}} /></div><span style={{color: '#64748b', fontSize: '16px', fontWeight: '900'}}>›</span></div>
        </div>

        {isOrdersFallback && activeTab === 'Online Orders' && (
          <div style={styles.fallbackNoticeBar}>
            <span style={{color: '#dc2626', fontWeight: '900'}}>⚠️ Connection Notice:</span> Unable to reach database orders endpoint.
          </div>
        )}

        {/* Dynamic Module Router */}
        {activeTab === 'Online Orders' && (
          <div className="moduleFade" style={styles.onlineOrdersContainer}>
            <div className="ordersHeading">
              <h1><span className="liveDot" />Online orders</h1>
              <div className="availability"><span>Available <b>{orders.filter(o => !['Picked Up', 'Completed'].includes(o.status)).length}</b></span><span>·</span><span>Paused <b className="pausedPill">{pausedCount}</b></span></div>
            </div>

            <div className="sumRow">
              {[
                ['New', '🆕', '#0284c7', countByStatus('New')],
                ['Preparing', '🍳', '#ea580c', countByStatus('Preparing')],
                ['Ready', '📦', '#7c3aed', countByStatus('Ready')],
                ['Active value', '₹', '#d97706', '₹' + Math.round(activeValue).toLocaleString('en-IN')]
              ].map(([label, icon, c, val]) => (
                <div className="sumCard" key={label} style={{ '--c': c }}>
                  <span className="sumIcon">{icon}</span>
                  <div><b>{val}</b><small>{label}</small></div>
                </div>
              ))}
            </div>

            <div className="splitViewWrapper" style={styles.splitViewWrapper}>
              <div className="masterListColumn" style={styles.masterListColumn}>
                <div className="orderToolbar">
                  <div className="statusTabs" role="tablist">
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
                        <i>{STATUS_ICONS[status]}</i>{status} <span className="cnt" key={countByStatus(status)}>{countByStatus(status)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="orderTools">
                    <button title="Refresh orders" onClick={() => { setLoadingOrders(true); setRefreshTick(tick => tick + 1); }}>↻</button>
                    <label className="searchOrders"><span>⌕</span><input value={orderSearch} onChange={event => setOrderSearch(event.target.value)} placeholder="Search orders" /></label>
                    <button className="managePaused" onClick={() => setActiveTab('Menu')}>Manage Paused Items <b>{pausedCount}</b></button>
                  </div>
                </div>
                
                <div className="scrollCards" style={styles.scrollableCards}>
                  {loadingOrders ? (
                    <>{[0, 1, 2].map(i => <div key={i} className="skeleton" />)}</>
                  ) : filteredOrders.length === 0 ? (
                    <div className="emptyOrders"><span className="emptyIcon">{orders.length === 0 ? '🍽️' : '🔍'}</span><span>{orders.length === 0 ? 'No online orders yet. New orders will appear here.' : 'No orders match this status or search.'}</span></div>
                  ) : (
                    filteredOrders.map((order, idx) => {
                      const isSelected = selectedOrder?.orderId === order.orderId;
                      const isHovered = hoveredCardId === order.orderId;
                      const ago = timeAgo(order.timestamp, nowTick);
                      const late = ago.mins !== null && ago.mins >= 15 && ['New', 'Accepted'].includes(order.status);
                      return (
                        <div 
                          key={order.orderId || order.id} 
                          className={`orderSummary${isSelected ? ' isSelected' : ''}${late ? ' isLate' : ''}`}
                          style={{ ...styles.orderSummaryCard, '--st': STATUS_COLORS[order.status] || '#16a34a', animationDelay: `${Math.min(idx, 8) * 50}ms`, borderColor: isSelected || isHovered ? '#0d9488' : '#cbd5e1', backgroundColor: '#fff' }}
                          onClick={() => setSelectedOrder(order)}
                          onMouseEnter={() => setHoveredCardId(order.orderId)}
                          onMouseLeave={() => setHoveredCardId(null)}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                            <div>
                              <strong style={{fontSize: '16px', color: '#0f172a', fontWeight: '900'}}>{order.customer}</strong>
                              <div style={{fontSize: '12px', color: '#64748b', fontWeight: '800'}}>{order.id}</div>
                            </div>
                            <span className={`orderStatus${order.status === 'New' ? ' isNew' : ''}`} style={styles.statusBadgeSmall(order.status)}>{order.status}</span>
                          </div>

                          <div style={{fontSize: '12px', color: '#64748b', marginBottom: '10px', fontWeight: '700'}}>
                            <span className="orderTypeTag">♧ {order.type}</span> <span className="channelTag">◉ {order.channel}</span>
                          </div>

                          <div className="orderSummaryItems">
                            {order.items.slice(0, 2).map((it, i2) => (
                              <div key={i2}><span>{it.name}</span> <strong>×{it.qty}</strong></div>
                            ))}
                            {order.items.length > 2 && <small>+ {order.items.length - 2} more</small>}
                          </div>

                          <div className="orderSummaryFooter">
                            <span className="agoTag">🕒 {ago.text}</span><strong>₹{order.total.toFixed(2)}</strong>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="detailPanelColumn" style={styles.detailPanelColumn}>
                <div className="detailPanelHeading">
                  <div style={styles.listHeaderTitle}>Selected order</div>
                  {selectedOrder && (
                    <button onClick={handlePrintReceipt} className="detailPrintButton" title="Print order">⎙</button>
                  )}
                </div>

                {selectedOrder ? (
                  (() => {
                    const stc = STATUS_COLORS[selectedOrder.status] || '#16a34a';
                    const doneStatus = ['Picked Up', 'Completed'].includes(selectedOrder.status);
                    const stepIdx = doneStatus ? STEPS.length - 1 : Math.max(0, STEPS.indexOf(selectedOrder.status));
                    const nextColor = STATUS_COLORS[NEXT_STATUS[selectedOrder.status]] || stc;
                    const initials = String(selectedOrder.customer || '?').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
                    return (
                      <div className="orderDetailCard" key={selectedOrder.orderId} id="printable-thermal-receipt" style={{ '--st': stc }}>
                        <div className="billHead">
                          <span className="avatar">{initials}</span>
                          <div style={{ minWidth: 0 }}>
                            <h2>{selectedOrder.customer}</h2>
                            <div className="sub">{selectedOrder.id}</div>
                          </div>
                          <span className={`orderStatus${selectedOrder.status === 'New' ? ' isNew' : ''}`} style={styles.statusBadgeSmall(selectedOrder.status)}>{selectedOrder.status}</span>
                        </div>

                        <div className="tracker">
                          {STEPS.map((step, i) => {
                            const isDone = doneStatus || i < stepIdx;
                            const isNow = !doneStatus && i === stepIdx;
                            return (
                              <React.Fragment key={step}>
                                <div className={`step${isDone ? ' done' : ''}${isNow ? ' now' : ''}`}>
                                  <i>{isDone ? '✓' : i + 1}</i><span>{step}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`bar${i < stepIdx || doneStatus ? ' done' : ''}`} />}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        <div className="infoGrid">
                          <a className="infoRow" href={`tel:${selectedOrder.phone}`}><i>📞</i><span>{selectedOrder.phone}</span></a>
                          <div className="infoRow"><i>🕒</i><span>{timeAgo(selectedOrder.timestamp, nowTick).text} · {selectedOrder.type} · {selectedOrder.channel}</span></div>
                          <a className="infoRow addr" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address || '')}`} target="_blank" rel="noopener noreferrer"><i>📍</i><span>{selectedOrder.address}</span></a>
                        </div>

                        {getOrderNote(selectedOrder) && (
                          <div className="customerRequest">
                            <strong>⚠ ORDER NOTE · SHARED WITH KITCHEN &amp; STAFF</strong>
                            <span style={{whiteSpace: 'pre-wrap'}}>{getOrderNote(selectedOrder)}</span>
                          </div>
                        )}
                        <div className="orderNotesEditor">
                          <label>
                            Order note (kitchen, staff and receipt)
                            <textarea value={orderNote} onChange={event => setOrderNote(event.target.value)} rows={1} placeholder="Add a note for the kitchen, staff, or customer" />
                          </label>
                          <button type="button" className="saveOrderNotesButton" onClick={saveOrderNotes} disabled={savingOrderNotes}>
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
                        <div className="detailItems">
                          {selectedOrder.items.map((item, index) => (
                            <div className="detailItem" key={`${item.name}-${index}`} style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}>
                              <div className="detailItemLine">
                                <span><b className="qtyBadge">×{item.qty}</b>{item.name}</span>
                                <strong>₹{(item.price * item.qty).toFixed(2)}</strong>
                              </div>
                              {item.desc && <div className="detailItemDescription">{item.desc}</div>}
                            </div>
                          ))}
                        </div>

                        <div className="orderTotals">
                          <div><span>Subtotal</span><strong>₹{selectedOrder.subtotal.toFixed(2)}</strong></div>
                          <div><span>Tax (Mapped)</span><strong>₹{(selectedOrder.totalTax || (selectedOrder.subtotal * 0.05)).toFixed(2)}</strong></div>
                          <div className="totalLine"><strong>Total</strong><strong>₹{selectedOrder.total.toFixed(2)}</strong></div>
                        </div>

                        <div className="detailActionBar">
                          {!doneStatus ? (
                            <button onClick={() => updateOrderStatus(selectedOrder.orderId, selectedOrder.status)} className="prepareButton" style={{ '--st': nextColor }}>
                              ♧ &nbsp;{getNextActionLabel(selectedOrder.status)}
                            </button>
                          ) : (
                            <span className="completedMessage">Order completed successfully ✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="emptyDetail"><span className="emptyIcon">🧾</span><span>Select an order to view its details.</span></div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'Online Orders' && (
          <div className="moduleFade" key={activeTab} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'auto' }}>
            {activeTab === 'Counter POS' && <CounterPOS />}
            {activeTab === 'Tables' && <TablesModule />}
            {activeTab === 'Kitchen' && <KitchenModule />}
            {activeTab === 'Menu' && <MenuModule />}
            {activeTab === 'Reports' && <ReportsModule orders={orders} />}
            {activeTab === 'Customers' && <CustomersModule />}
            {activeTab === 'Complaints' && <ComplaintsModule />}
            {activeTab === 'Promotions' && <PromotionsModule />}
            {activeTab === 'Gallery' && <GalleryModule restaurantId={restaurantId} />}
            {activeTab === 'Settings' && <SettingsModule />}
          </div>
        )}
      </div>

      {/* 🔔 Custom Professional New Order Popup Modal */}
      {newOrderPopup && (
        <div className="modalOverlay" style={styles.modalOverlay}>
          <div className="popupCard" style={styles.popupCard}>
            <div className="bell">🔔</div>
            <h3 style={{margin: '0 0 6px 0', fontSize: '20px', fontWeight: '950', color: '#0f172a'}}>New Online Order Received!</h3>
            <p style={{margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', fontWeight: '800'}}>
              Order <b>{newOrderPopup.id}</b> from <b>{newOrderPopup.customer}</b> (₹{newOrderPopup.total})
            </p>
            <div style={{display: 'flex', gap: '10px', width: '100%'}}>
              <button 
                onClick={() => {
                  setSelectedOrder(newOrderPopup);
                  setActiveTab('Online Orders');
                  setNewOrderPopup(null);
                }} 
                className="primaryModalBtn"
                style={styles.primaryModalBtn}
              >
                View Order
              </button>
              <button 
                onClick={() => setNewOrderPopup(null)} 
                style={styles.secondaryModalBtn}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Custom Toast Banner */}
      {toastMessage && (
        <div className="toast" style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 4000,
          backgroundColor: toastMessage.type === 'error' ? '#fee2e2' : '#ecfdf5',
          color: toastMessage.type === 'error' ? '#991b1b' : '#065f46',
          border: `2px solid ${toastMessage.type === 'error' ? '#fca5a5' : '#6ee7b7'}`,
          padding: '14px 20px', borderRadius: '12px', fontWeight: '900', fontSize: '13px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          {toastMessage.text}
        </div>
      )}

      {/* Modern Styled Profile Modal */}
      {showProfileModal && (
        <div className="modalOverlay" style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div className="profileCard" style={styles.modernProfileCard} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '14px'}}>
              <div>
                <h3 style={{margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '950'}}>Admin Profile</h3>
                <span style={{fontSize: '12px', color: '#64748b', fontWeight: '700'}}>Manage your restaurant account details</span>
              </div>
              <button onClick={() => setShowProfileModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            {isProfileFallback && (
              <div style={{fontSize: '11px', color: '#dc2626', marginBottom: '12px', fontWeight: 'bold', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px'}}>
                ⚠️ Running on local profile fallback (Database sync pending)
              </div>
            )}
            
            {!isEditingProfile ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                <div className="profileRow" style={styles.profileRow}><span>Business Name</span> <strong>{profileData.businessName}</strong></div>
                <div className="profileRow" style={styles.profileRow}><span>Owner / Admin Name</span> <strong style={{color: '#059669'}}>{profileData.ownerName}</strong></div>
                <div className="profileRow" style={styles.profileRow}><span>Login Email</span> <strong>{profileData.email}</strong></div>
                <div className="profileRow" style={styles.profileRow}><span>Phone Number</span> <strong>{profileData.phone}</strong></div>
                <div className="profileRow" style={styles.profileRow}><span>WhatsApp Number</span> <strong>{profileData.whatsappNumber}</strong></div>

                <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                  <button onClick={() => setIsEditingProfile(true)} className="primaryModalBtn" style={styles.primaryModalBtn}>Edit Profile</button>
                  <button onClick={() => setShowProfileModal(false)} style={styles.secondaryModalBtn}>Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <label style={styles.modalLabel}>Business Name *</label>
                <input 
                  style={styles.modalInput}
                  value={editForm.businessName} 
                  onChange={e => setEditForm({...editForm, businessName: e.target.value})} 
                  required
                />
                
                <label style={styles.modalLabel}>Owner / Admin Name *</label>
                <input 
                  style={styles.modalInput}
                  value={editForm.ownerName} 
                  onChange={e => setEditForm({...editForm, ownerName: e.target.value})} 
                  required
                />

                <label style={styles.modalLabel}>Phone Number (Verified)</label>
                <input 
                  style={{...styles.modalInput, backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed'}}
                  value={editForm.phone} 
                  disabled
                />

                <label style={styles.modalLabel}>WhatsApp Number *</label>
                <input 
                  style={styles.modalInput}
                  value={editForm.whatsappNumber} 
                  onChange={e => setEditForm({...editForm, whatsappNumber: e.target.value})} 
                  required
                />

                <div style={{display: 'flex', gap: '10px', marginTop: '16px'}}>
                  <button type="submit" className="primaryModalBtn" style={styles.primaryModalBtn}>Save to Database</button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} style={styles.secondaryModalBtn}>Cancel</button>
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
  sidebar: { width: '56px', backgroundColor: '#191919', display: 'flex', flexDirection: 'column', color: '#fff', height: '100vh', flexShrink: 0 },
  brandBox: { display: 'none', alignItems: 'center', gap: '12px', padding: '22px 20px', borderBottom: '2px solid rgba(255,255,255,0.1)' },
  logoIcon: { fontSize: '26px' },
  brandName: { fontSize: '19px', fontWeight: '900', letterSpacing: '0.02em' },
  brandSub: { fontSize: '11px', color: '#34d399', fontWeight: '800', letterSpacing: '0.05em' },
  navLinks: { listStyle: 'none', padding: '10px 0', margin: 0, flex: 1, overflowY: 'auto' },
  navItem: { padding: '10px 0', margin: '3px 6px', height: '44px', fontSize: '14px', color: '#d4d4d4', cursor: 'pointer', display: 'flex', justifyContent: 'center', textAlign: 'center', fontWeight: '700', transition: 'all 0.2s', borderRadius: '8px' },
  navItemHover: { backgroundColor: '#303030', color: '#fff' },
  navItemActive: { padding: '10px 0', margin: '3px 6px', height: '44px', fontSize: '14px', color: '#003d2b', backgroundColor: '#05c98a', cursor: 'pointer', display: 'flex', justifyContent: 'center', fontWeight: '900', textAlign: 'center', borderRadius: '8px' },
  badgeCount: { backgroundColor: '#34d399', color: '#022c22', fontSize: '12px', padding: '2px 9px', borderRadius: '12px', fontWeight: '900' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0, backgroundColor: '#fff' },
  header: { height: '65px', backgroundColor: '#001e16', borderBottom: '2px solid #0b3328', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 },
  tablesStatusBar: { backgroundColor: '#f0fdfa', border: '2px solid #cbd5e1', margin: '8px 18px', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '12px', transition: 'background 0.2s', borderRadius: '10px' },
  fallbackNoticeBar: { backgroundColor: '#fffbe8', border: '2px solid #fcd34d', margin: '8px 18px', padding: '10px 14px', fontSize: '13px', color: '#92400e', textAlign: 'left', flexShrink: 0, borderRadius: '10px', fontWeight: '700' },
  pausedItemsBtn: { backgroundColor: '#fff', border: '2px solid #dc2626', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', color: '#dc2626', cursor: 'pointer', display: 'none', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  pausedCountBadge: { backgroundColor: '#dc2626', color: '#fff', fontSize: '11px', padding: '2px 7px', borderRadius: '10px', fontWeight: '900' },
  topLogoutBtn: { backgroundColor: '#fee2e2', color: '#991b1b', border: '2px solid #fca5a5', padding: '8px 18px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' },
  onlineOrdersContainer: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', backgroundColor: '#fff', minWidth: 0 },
  splitViewWrapper: { display: 'flex', flex: 1, padding: '0 18px 14px', gap: '16px', overflow: 'hidden', minHeight: 0, minWidth: 0 },
  masterListColumn: { flex: '1 1 52%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, minWidth: 0 },
  detailPanelColumn: { flex: '1 1 48%', display: 'flex', flexDirection: 'column', overflowY: 'hidden', minHeight: 0, minWidth: 0, padding: '0 0 0 14px', borderLeft: '2px solid #cbd5e1' },
  scrollableCards: { display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, padding: '0 6px 10px 0' },
  orderSummaryCard: { border: '2px solid #cbd5e1', borderRadius: '12px', padding: '16px', cursor: 'pointer', backgroundColor: '#fff', textAlign: 'left', flexShrink: 0, transition: 'all 0.2s ease' },
  statusBadgeSmall: (status) => ({
    backgroundColor: status === 'New' ? '#e0f2fe' : status === 'Accepted' ? '#fef9c3' : status === 'Preparing' ? '#ffedd5' : status === 'Ready' ? '#ede9fe' : '#dcfce7',
    color: status === 'New' ? '#0369a1' : status === 'Accepted' ? '#854d0e' : status === 'Preparing' ? '#c2410c' : status === 'Ready' ? '#6d28d9' : '#15803d',
    fontSize: '12px', fontWeight: '900', padding: '5px 12px', borderRadius: '8px', textTransform: 'uppercase', border: '1.5px solid currentColor'
  }),
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  popupCard: { width: '420px', backgroundColor: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  modernProfileCard: { width: '460px', backgroundColor: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0', textAlign: 'left' },
  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '13px', fontWeight: '800', color: '#334155' },
  modalLabel: { fontSize: '12px', fontWeight: '900', color: '#334155', display: 'block', marginBottom: '4px' },
  modalInput: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '800', outline: 'none', background: '#fff', boxSizing: 'border-box' },
  primaryModalBtn: { flex: 1, backgroundColor: '#059669', color: '#fff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  secondaryModalBtn: { flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '11px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: '950', color: '#64748b', cursor: 'pointer' }
};