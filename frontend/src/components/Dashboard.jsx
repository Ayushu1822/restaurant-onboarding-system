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

function NavigationIcon({ tab }) {
  const icon = NAVIGATION_ICONS[tab] || NAVIGATION_ICONS['Online Orders'];
  return (
    <svg aria-hidden="true" className="navGlyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

  const [notificationSoundConfig, setNotificationSoundConfig] = useState({
    enabled: true,
    selectedTone: 'Classic Ring'
  });

  const [receiptConfig, setReceiptConfig] = useState({
    restaurantName: 'LINGA FOODS',
    headerText: 'Linga Foods - Wonghikal',
    address: 'LINGA FOODS, No. 1540, Vellore Main Road, Wonghikal, Tiruvannamalai, Tamil Nadu 606604',
    phone: '91234400635',
    gstin: '37AAFP4128L1ZI',
    fssai: 'FSSAI: 22426260001195',
    footerNote: 'Thank You For Visiting Us!\n*** TEST PRINT ***\n*** NOT A VALID BILL / INVOICE ***',
    paperSize: '80mm',
    density: 'Compact',
    toggles: {
      restaurantName: true,
      address: true,
      phone: true,
      gstin: true,
      fssai: true,
      invoiceNo: true,
      dateAndTime: true,
      itemNameQtyAmt: true,
      totalTax: true
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

  useEffect(() => {
    setOrderNote(getOrderNote(selectedOrder));
  }, [selectedOrder?.orderId]);

  // 🔔 10-Second Rich Real Chime / Melodic Audio Generator (Web Audio API)
  const playSynthesizedChime = (toneName = 'Classic Ring') => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const duration = 9.0;

      if (toneName === 'Soft Chime') {
        const chords = [
          [523.25, 659.25, 783.99],
          [587.33, 698.46, 880.00],
          [659.25, 783.99, 987.77]
        ];
        chords.forEach((chord, round) => {
          chord.forEach((freq, noteIdx) => {
            const startTime = now + (round * 3.0) + (noteIdx * 0.3);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + 2.5);
          });
        });
      } else if (toneName === 'Ding Dong') {
        for (let i = 0; i < 4; i++) {
          const startTime = now + (i * 2.2);
          [587.33, 440].forEach((freq, idx) => {
            const noteTime = startTime + (idx * 0.6);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);
            gain.gain.setValueAtTime(0.2, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(noteTime);
            osc.stop(noteTime + 1.5);
          });
        }
      } else if (toneName === 'Bell') {
        for (let i = 0; i < 3; i++) {
          const startTime = now + (i * 3.0);
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc1.type = 'triangle';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(440, startTime);
          osc2.frequency.setValueAtTime(880, startTime);
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.8);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);
          osc1.start(startTime);
          osc2.start(startTime);
          osc1.stop(startTime + 2.8);
          osc2.stop(startTime + 2.8);
        }
      } else if (toneName === 'Ping') {
        for (let i = 0; i < 12; i++) {
          const startTime = now + (i * 0.75);
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.50 + (i * 50), startTime);
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.8);
        }
      } else if (toneName === 'Arcade') {
        const melody = [440, 554.37, 659.25, 880, 987.77, 1108.73];
        for (let loop = 0; loop < 2; loop++) {
          melody.forEach((freq, idx) => {
            const startTime = now + (loop * 4.5) + (idx * 0.6);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.5);
          });
        }
      } else {
        // Classic Ring
        for (let i = 0; i < 6; i++) {
          const startTime = now + (i * 1.5);
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc1.type = 'square';
          osc2.type = 'sawtooth';
          osc1.frequency.setValueAtTime(880, startTime);
          osc2.frequency.setValueAtTime(1320, startTime);
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);
          osc1.start(startTime);
          osc2.start(startTime);
          osc1.stop(startTime + 1.2);
          osc2.stop(startTime + 1.2);
        }
      }
    } catch (e) {
      console.log("Audio play error:", e);
    }
  };

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchHeaderData = () => {
    fetch(`${API_BASE_URL}/api/v1/restaurants/email/${loggedInEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.notificationSound) {
            const parsedSnd = typeof data.notificationSound === 'string' ? JSON.parse(data.notificationSound) : data.notificationSound;
            setNotificationSoundConfig(prev => ({ ...prev, ...parsedSnd }));
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
            const parsedCfg = typeof data.receiptConfig === 'string' ? JSON.parse(data.receiptConfig) : data.receiptConfig;
            setReceiptConfig(prev => ({ ...prev, ...parsedCfg }));
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

        // 🔔 Check for brand new incoming orders
        const newOrdersList = formattedOrders.filter(o => o.status === 'New');
        if (knownOrderIdsRef.current.size > 0) {
          const hasBrandNew = newOrdersList.some(o => !knownOrderIdsRef.current.has(o.orderId));
          if (hasBrandNew) {
            if (notificationSoundConfig.enabled !== false) {
              playSynthesizedChime(notificationSoundConfig.selectedTone || 'Classic Ring');
            }
            const latestNewOrder = newOrdersList.find(o => !knownOrderIdsRef.current.has(o.orderId)) || newOrdersList[0];
            setNewOrderPopup(latestNewOrder);
          }
        }
        knownOrderIdsRef.current = new Set(formattedOrders.map(o => o.orderId));

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
  }, [loggedInEmail, refreshTick]);

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

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;
    
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      showToast('Popup blocked! Please allow popups for printing.', 'error');
      return;
    }

    const toggles = receiptConfig.toggles || {};
    const itemsHtml = selectedOrder.items.map(it => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>${it.qty}x ${it.name}</span>
        <span>₹${(it.price * it.qty).toFixed(2)}</span>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${selectedOrder.id}</title>
          <style>
            body { font-family: monospace; padding: 16px; color: #000; background: #fff; width: ${receiptConfig.paperSize === '58mm' ? '58mm' : '80mm'}; margin: 0 auto; font-size: ${receiptConfig.density === 'Compact' ? '10px' : '12px'}; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          ${toggles.restaurantName ? `<div class="center bold" style="font-size: 14px;">${receiptConfig.restaurantName}</div>` : ''}
          ${receiptConfig.headerText ? `<div class="center" style="font-size: 10px; color: #333;">${receiptConfig.headerText}</div>` : ''}
          ${toggles.address && receiptConfig.address ? `<div class="center" style="font-size: 10px; color: #333; margin: 3px 0;">${receiptConfig.address}</div>` : ''}
          ${toggles.phone && receiptConfig.phone ? `<div class="center" style="font-size: 10px; color: #333;">Ph: ${receiptConfig.phone}</div>` : ''}
          ${toggles.gstin && receiptConfig.gstin ? `<div class="center" style="font-size: 10px; color: #333;">GSTIN: ${receiptConfig.gstin}</div>` : ''}
          ${receiptConfig.fssai ? `<div class="center" style="font-size: 10px; color: #333; margin-bottom: 6px;">${receiptConfig.fssai}</div>` : ''}
          <div class="line"></div>
          ${toggles.invoiceNo ? `<div><strong>Order ID:</strong> ${selectedOrder.id}</div>` : ''}
          ${toggles.dateAndTime ? `<div><strong>Date:</strong> ${selectedOrder.time}</div>` : ''}
          <div><strong>Customer:</strong> ${selectedOrder.customer} (${selectedOrder.phone})</div>
          <div><strong>Type:</strong> ${selectedOrder.type} (${selectedOrder.channel})</div>
          <div><strong>Address:</strong> ${selectedOrder.address}</div>
          ${selectedOrder.customerRequest ? `<div><strong>Note:</strong> <span style="color: #d97706; font-weight: bold;">${selectedOrder.customerRequest}</span></div>` : ''}
          <div class="line"></div>
          <div class="bold" style="margin-bottom: 6px;">ITEMS:</div>
          ${itemsHtml}
          <div class="line"></div>
          <div class="flex"><span>Subtotal:</span><span>₹${selectedOrder.subtotal.toFixed(2)}</span></div>
          ${toggles.totalTax ? `<div class="flex"><span>Tax:</span><span>₹${(selectedOrder.totalTax || (selectedOrder.subtotal * 0.05)).toFixed(2)}</span></div>` : ''}
          <div class="flex bold" style="font-size: 13px; margin-top: 6px;"><span>Total:</span><span>₹${selectedOrder.total}</span></div>
          <div class="line"></div>
          <div class="center" style="font-size: 10px; white-space: pre-line; margin-top: 6px;">${receiptConfig.footerNote}</div>
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

  return (
    <div style={styles.container}>
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
        .statusTab.selected { color: #fff; background: #2563eb; border-color: #1d4ed8; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25); }
        .statusTab.selected span { color: #fff; }
        .orderTools > button, .searchOrders { height: 38px; border: 2px solid #cbd5e1; border-radius: 10px; background: #fff; color: #0f172a; font-weight: 700; }
        .orderTools > button { width: 38px; font-size: 18px; cursor: pointer; display: grid; place-items: center; }
        .searchOrders { display: flex; align-items: center; gap: 8px; padding: 0 12px; box-sizing: border-box; }
        .searchOrders span { font-size: 18px; color: #64748b; }
        .searchOrders input { width: 110px; border: 0; outline: 0; color: #0f172a; font-size: 12px; font-weight: 700; background: transparent; }
        .orderTools .managePaused { width: auto; height: 36px; flex: 0 0 auto; display: flex; align-items: center; gap: 8px; padding: 0 12px; border: 2px solid #fecaca; border-radius: 8px; background: #fff; color: #dc2626; font-size: 12px; font-weight: 800; white-space: nowrap; cursor: pointer; }
        .orderTools .managePaused b { background: #fef2f2; color: #dc2626; border-radius: 6px; padding: 2px 6px; border: 1.5px solid #f87171; font-weight: 900; }
        .orderSummary { border-radius: 12px !important; padding: 16px !important; border: 2px solid #cbd5e1 !important; transition: all 0.2s ease; }
        .orderSummary:hover { border-color: #2563eb !important; box-shadow: 0 6px 15px rgba(37,99,235,0.12) !important; }
        .orderSummary .orderStatus { padding: 4px 10px !important; font-size: 11px !important; border-radius: 8px !important; font-weight: 900 !important; border: 1.5px solid currentColor !important; }
        .orderTypeTag, .channelTag { display: inline-flex; align-items: center; margin-right: 6px; padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 800; border: 2px solid; }
        .orderTypeTag { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
        .channelTag { color: #059669; background: #ecfdf5; border-color: #a7f3d0; }
        .orderSummaryItems { border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 10px; color: #1e293b; font-size: 13px; font-weight: 800; }
        .orderSummaryItems div { margin: 4px 0; display: flex; justify-content: space-between; }
        .orderSummaryItems div span { color: #475569; font-weight: 700; }
        .orderSummaryItems small { color: #64748b; font-size: 12px; font-weight: 800; }
        .orderSummaryFooter { display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 10px; color: #64748b; font-size: 12px; font-weight: 800; }
        .orderSummaryFooter strong { color: #2563eb; font-size: 15px; font-weight: 900; }
        .emptyOrders, .emptyDetail { display: grid; place-items: center; min-height: 200px; padding: 30px; color: #64748b; font-size: 14px; font-weight: 800; text-align: center; background: #fff; border: 2px dashed #cbd5e1; border-radius: 12px; }
        .detailPanelHeading { min-height: 56px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; padding-top: 4px; }
        .detailPrintButton { width: 38px; height: 38px; border: 2px solid #cbd5e1; border-radius: 10px; background: #fff; font-size: 18px; cursor: pointer; display: grid; place-items: center; color: #334155; }
        .detailPrintButton:hover { border-color: #2563eb; color: #2563eb; }
        .detailPanelColumn .listHeaderTitle { margin: 0; color: #0f172a; font-size: 16px; font-weight: 900; }
        .orderDetailCard { display: flex; flex: 1; flex-direction: column; min-height: 0; overflow-y: auto; position: relative; border: 2px solid #cbd5e1; border-radius: 14px; padding: 18px; text-align: left; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .detailTopline { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .detailTopline h2 { margin: 0 0 8px; font-size: 20px; font-weight: 900; color: #0f172a; }
        .detailTags { display: flex; gap: 6px; }
        .detailOrderNumber { display: flex; align-items: center; gap: 12px; margin-top: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-weight: 900; }
        .detailOrderNumber a { color: #2563eb; font-family: inherit; text-decoration: none; font-weight: 900; border-bottom: 2px dashed #2563eb; padding-bottom: 1px; }
        .detailMeta, .detailAddress { margin-top: 8px; color: #475569; font-size: 13px; font-weight: 800; }
        .customerRequest { display: flex; flex-direction: column; gap: 6px; margin: 14px 0; padding: 12px 14px; border: 2px solid #fcd34d; border-radius: 10px; background: #fffbeb; color: #92400e; font-size: 13px; font-weight: 800; }
        .customerRequest strong { color: #b45309; font-size: 12px; font-weight: 900; letter-spacing: 0.5px; }
        .orderNotesEditor { display: flex; flex-direction: column; gap: 8px; margin: 14px 0; padding: 12px; border: 2px solid #cbd5e1; border-radius: 10px; background: #f8fafc; }
        .orderNotesEditor label { display: flex; flex-direction: column; gap: 6px; color: #1e293b; font-size: 12px; font-weight: 900; }
        .orderNotesEditor textarea { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 2px solid #94a3b8; border-radius: 8px; background: #fff; color: #0f172a; font: inherit; font-size: 13px; font-weight: 700; resize: vertical; outline: none; }
        .orderNotesEditor textarea:focus { border-color: #2563eb; }
        .saveOrderNotesButton { align-self: flex-end; padding: 8px 14px; border: 2px solid #047857; border-radius: 8px; background: #059669; color: #fff; font-size: 12px; font-weight: 900; cursor: pointer; box-shadow: 0 2px 5px rgba(5, 150, 105, 0.2); }
        .saveOrderNotesButton:hover { background: #047857; }
        .saveOrderNotesButton:disabled { cursor: wait; opacity: .65; }
        .prepTimeControl { display: flex; justify-content: space-between; align-items: center; min-height: 46px; margin: 12px 0 14px; padding: 6px 12px; border: 2px solid #cbd5e1; border-radius: 10px; color: #1e293b; font-size: 12px; font-weight: 900; background: #f8fafc; }
        .prepTimeControl > div { display: flex; align-items: center; gap: 10px; color: #0f172a; }
        .prepTimeControl button { width: 30px; height: 30px; border: 2px solid #94a3b8; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); font-size: 16px; font-weight: 900; cursor: pointer; display: grid; place-items: center; }
        .prepTimeControl button:hover { border-color: #2563eb; color: #2563eb; }
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
        .orderTotals .totalLine strong:last-child { color: #2563eb; font-size: 18px; font-weight: 900; }
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
      `}</style>

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
                className="navItem"
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
            <button onClick={() => setActiveTab('Menu')} style={styles.pausedItemsBtn}>
              🔴 Manage Paused Items <span style={styles.pausedCountBadge}>{pausedCount}</span>
            </button>
            <button onClick={onLogout} style={styles.topLogoutBtn}>Sign Out</button>
          </div>
        </div>

        {/* Tables Status Bar */}
        <div style={styles.tablesStatusBar} onClick={() => setActiveTab('Tables')}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#1e293b', fontSize: '12px'}}>
            <span>♜</span>
            <span>Tables</span>
            <span style={{color: '#cbd5e1'}}>·</span>
            <span style={{color: '#16a34a'}}>{tableStats.open}/{tableStats.total} open</span>
            <span style={{color: '#cbd5e1'}}>·</span>
            <span>{tableStats.occupied} occupied</span>
            <span style={{backgroundColor: '#2563eb', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '900'}}>{tableStats.billing} billing</span>
          </div>
          <span style={{color: '#64748b', fontSize: '16px', fontWeight: '900'}}>›</span>
        </div>

        {isOrdersFallback && activeTab === 'Online Orders' && (
          <div style={styles.fallbackNoticeBar}>
            <span style={{color: '#dc2626', fontWeight: '900'}}>⚠️ Connection Notice:</span> Unable to reach database orders endpoint.
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
              <div style={styles.masterListColumn}>
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
                        {status} <span>{orders.filter(order => order.status.toLowerCase() === status.toLowerCase()).length}</span>
                      </button>
                    ))}
                  </div>
                  <div className="orderTools">
                    <button title="Refresh orders" onClick={() => { setLoadingOrders(true); setRefreshTick(tick => tick + 1); }}>↻</button>
                    <label className="searchOrders"><span>⌕</span><input value={orderSearch} onChange={event => setOrderSearch(event.target.value)} placeholder="Search orders" /></label>
                    <button className="managePaused" onClick={() => setActiveTab('Menu')}>Manage Paused Items <b>{pausedCount}</b></button>
                  </div>
                </div>
                
                <div style={styles.scrollableCards}>
                  {loadingOrders ? (
                    <div style={{padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '700', fontSize: '13px'}}>Loading live database orders...</div>
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
                          style={{ ...styles.orderSummaryCard, borderColor: isSelected || isHovered ? '#2563eb' : '#cbd5e1', backgroundColor: '#fff' }}
                          onClick={() => setSelectedOrder(order)}
                          onMouseEnter={() => setHoveredCardId(order.orderId)}
                          onMouseLeave={() => setHoveredCardId(null)}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                            <div>
                              <strong style={{fontSize: '16px', color: '#0f172a', fontWeight: '900'}}>{order.customer}</strong>
                              <div style={{fontSize: '12px', color: '#64748b', fontWeight: '800'}}>{order.id}</div>
                            </div>
                            <span className="orderStatus" style={styles.statusBadgeSmall(order.status)}>{order.status}</span>
                          </div>

                          <div style={{fontSize: '12px', color: '#64748b', marginBottom: '10px', fontWeight: '700'}}>
                            <span className="orderTypeTag">♧ {order.type}</span> <span className="channelTag">◉ {order.channel}</span>
                          </div>

                          <div className="orderSummaryItems">
                            {order.items.slice(0, 2).map((it, idx) => (
                              <div key={idx}><span>{it.name}</span> <strong>×{it.qty}</strong></div>
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
                        <textarea value={orderNote} onChange={event => setOrderNote(event.target.value)} rows={2} placeholder="Add a note for the kitchen, staff, or customer" />
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
                      <div><span>Tax (Mapped)</span><strong>₹{(selectedOrder.totalTax || (selectedOrder.subtotal * 0.05)).toFixed(2)}</strong></div>
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

      {/* 🔔 Custom Professional New Order Popup Modal */}
      {newOrderPopup && (
        <div style={styles.modalOverlay}>
          <div style={styles.popupCard}>
            <div style={{fontSize: '38px', marginBottom: '8px'}}>🔔</div>
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
        <div style={{
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
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modernProfileCard} onClick={(e) => e.stopPropagation()}>
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
                <div style={styles.profileRow}><span>Business Name</span> <strong>{profileData.businessName}</strong></div>
                <div style={styles.profileRow}><span>Owner / Admin Name</span> <strong style={{color: '#059669'}}>{profileData.ownerName}</strong></div>
                <div style={styles.profileRow}><span>Login Email</span> <strong>{profileData.email}</strong></div>
                <div style={styles.profileRow}><span>Phone Number</span> <strong>{profileData.phone}</strong></div>
                <div style={styles.profileRow}><span>WhatsApp Number</span> <strong>{profileData.whatsappNumber}</strong></div>

                <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                  <button onClick={() => setIsEditingProfile(true)} style={styles.primaryModalBtn}>Edit Profile</button>
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
                  <button type="submit" style={styles.primaryModalBtn}>Save to Database</button>
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
  tablesStatusBar: { backgroundColor: '#f1f5fb', border: '2px solid #cbd5e1', margin: '8px 18px', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '12px', transition: 'background 0.2s', borderRadius: '10px' },
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