import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ReportsModule({ orders: parentOrders }) {
  const [orders, setOrders] = useState(parentOrders || []);
  const [closedComplaints, setClosedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Receipt Configuration state synced with Settings Module
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
  
  // Filter States
  const [dateRange, setDateRange] = useState('today');
  const [orderChannelFilter, setOrderChannelFilter] = useState('ALL');
  const [selectedCaptainFilter, setSelectedCaptainFilter] = useState('ALL');
  
  const [historyDateRange, setHistoryDateRange] = useState('all');
  const [historyChannelFilter, setHistoryChannelFilter] = useState('ALL');

  const [analyticsDateRange, setAnalyticsDateRange] = useState('today');
  const [analyticsCategoryFilter, setAnalyticsCategoryFilter] = useState('ALL');

  const [captainDateRange, setCaptainDateRange] = useState('today');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [selectedCaptainDetails, setSelectedCaptainDetails] = useState(null);

  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    const loggedInEmail = localStorage.getItem('userEmail') || 'novio@gmail.com';

    // Fetch Restaurant Profile to sync receiptConfig
    fetch(`${API_BASE_URL}/api/v1/restaurants/email/${loggedInEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.receiptConfig) {
          const parsedCfg = typeof data.receiptConfig === 'string' ? JSON.parse(data.receiptConfig) : data.receiptConfig;
          setReceiptConfig(prev => ({ ...prev, ...parsedCfg }));
        }
      })
      .catch(err => console.log("Profile fetch error:", err));

    fetch(`${API_BASE_URL}/api/v1/orders?email=${loggedInEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reports orders:", err);
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/api/v1/complaints?email=${loggedInEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClosedComplaints(data.filter(c => c.status && c.status.toLowerCase() === 'closed'));
        }
      })
      .catch(err => console.error("Error fetching complaints for reports:", err));
  };

  // Robust timestamp parser handling high-precision ISO strings safely with IST fallback
  const getSafeTimestamp = (order, index) => {
    if (order.timestamp) {
      let ts = order.timestamp;
      ts = ts.replace(/\.(\d{3})\d+/, '.$1');
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }
    const fallbackDate = new Date();
    fallbackDate.setHours(fallbackDate.getHours() - index);
    return fallbackDate;
  };

  const extractCaptain = (customerName) => {
    const cName = customerName || '';
    if (cName.includes('(') && cName.includes(')')) {
      const match = cName.match(/\(([^)]+)\)/);
      if (match) return match[1].trim();
    }
    return null;
  };

  const allCaptains = ['ALL', ...new Set(orders.map(o => extractCaptain(o.customerName)).filter(Boolean))];

  const checkDateMatch = (orderDate, range) => {
    if (range === 'all') return true;
    const now = new Date();
    if (range === 'today') {
      return orderDate.toDateString() === now.toDateString();
    } else if (range === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return orderDate.toDateString() === yesterday.toDateString();
    } else if (range === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return orderDate >= oneWeekAgo && orderDate <= now;
    } else if (range === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (range === 'year') {
      return orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // 1. Active Orders Filtering
  const filteredOrders = orders.filter((o, idx) => {
    const st = (o.status || 'New').toLowerCase();
    const isCompleted = st === 'completed' || st === 'delivered' || st === 'settled' || st === 'paid';
    if (isCompleted) return false;

    let matchesChannel = true;
    const channel = (o.channel || 'COUNTER').toUpperCase();
    const disp = (o.displayId || '').toUpperCase();
    if (orderChannelFilter === 'TABLE') {
      matchesChannel = disp.includes('TABLE') || (o.orderType || '').toLowerCase().includes('dine');
    } else if (orderChannelFilter === 'COUNTER') {
      matchesChannel = channel === 'COUNTER' && !disp.includes('TABLE');
    } else if (orderChannelFilter === 'ONLINE') {
      matchesChannel = channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP';
    }

    let matchesCaptain = true;
    const orderCaptain = extractCaptain(o.customerName);
    if (selectedCaptainFilter !== 'ALL') {
      matchesCaptain = orderCaptain === selectedCaptainFilter;
    }

    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const cName = (o.customerName || '').toLowerCase();
      const oId = (o.displayId || o.orderId || '').toLowerCase();
      matchesSearch = cName.includes(q) || oId.includes(q);
    }

    return matchesChannel && matchesCaptain && matchesSearch;
  });

  const activeBreakdownOrders = filteredOrders;

  // 2. Completed History Filtering
  const completedHistoryOrders = orders.filter((o, idx) => {
    const st = (o.status || 'New').toLowerCase();
    const isCompleted = st === 'completed' || st === 'delivered' || st === 'picked up' || st === 'ready' || st === 'settled' || st === 'paid' || st === 'preparing';
    if (!isCompleted) return false;

    const orderDate = getSafeTimestamp(o, idx);
    let matchesDate = checkDateMatch(orderDate, historyDateRange);

    let matchesChannel = true;
    const channel = (o.channel || 'COUNTER').toUpperCase();
    const disp = (o.displayId || '').toUpperCase();
    if (historyChannelFilter === 'TABLE') {
      matchesChannel = disp.includes('TABLE') || (o.orderType || '').toLowerCase().includes('dine');
    } else if (historyChannelFilter === 'COUNTER') {
      matchesChannel = channel === 'COUNTER' && !disp.includes('TABLE');
    } else if (historyChannelFilter === 'ONLINE') {
      matchesChannel = channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP';
    }

    return matchesDate && matchesChannel;
  });

  // 3. Analytics Filtering
  const analyticsOrders = orders.filter((o, idx) => {
    const orderDate = getSafeTimestamp(o, idx);
    let matchesDate = checkDateMatch(orderDate, analyticsDateRange);

    let matchesCat = true;
    if (analyticsCategoryFilter !== 'ALL') {
      const channel = (o.channel || 'COUNTER').toUpperCase();
      const disp = (o.displayId || '').toUpperCase();
      if (analyticsCategoryFilter === 'TABLE') matchesCat = disp.includes('TABLE') || (o.orderType || '').toLowerCase().includes('dine');
      if (analyticsCategoryFilter === 'COUNTER') matchesCat = channel === 'COUNTER' && !disp.includes('TABLE');
      if (analyticsCategoryFilter === 'ONLINE') matchesCat = channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP';
    }
    return matchesDate && matchesCat;
  });

  const totalRevenue = analyticsOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const totalOrdersCount = analyticsOrders.length;

  let tableRev = 0, counterRev = 0, onlineRev = 0;
  analyticsOrders.forEach(o => {
    const rev = Number(o.totalAmount) || 0;
    const channel = (o.channel || 'COUNTER').toUpperCase();
    const disp = (o.displayId || '').toUpperCase();
    if (disp.includes('TABLE') || (o.orderType || '').toLowerCase().includes('dine')) {
      tableRev += rev;
    } else if (channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP') {
      onlineRev += rev;
    } else {
      counterRev += rev;
    }
  });

  const tablePct = totalRevenue > 0 ? (tableRev / totalRevenue) * 100 : 0;
  const counterPct = totalRevenue > 0 ? (counterRev / totalRevenue) * 100 : 0;
  const onlinePct = totalRevenue > 0 ? (onlineRev / totalRevenue) * 100 : 0;

  const p1 = tablePct;
  const p2 = tablePct + counterPct;
  const dynamicPieBackground = totalRevenue > 0 
    ? `conic-gradient(#059669 0% ${p1}%, #2563eb ${p1}% ${p2}%, #d97706 ${p2}% 100%)`
    : '#e2e8f0';

  // 4. Captains Mapping
  const captainMap = {};
  orders.forEach((o, idx) => {
    const capName = extractCaptain(o.customerName);
    if (capName) {
      const orderDate = getSafeTimestamp(o, idx);
      if (checkDateMatch(orderDate, captainDateRange)) {
        if (!captainMap[capName]) {
          captainMap[capName] = { orderCount: 0, revenue: 0, orders: [] };
        }
        captainMap[capName].orderCount += 1;
        captainMap[capName].revenue += Number(o.totalAmount || 0);
        captainMap[capName].orders.push(o);
      }
    }
  });

  const sortedCaptainKeys = Object.keys(captainMap).sort((a, b) => {
    if (a.toLowerCase().includes('unassigned') || a.toLowerCase().includes('counter')) return 1;
    if (b.toLowerCase().includes('unassigned') || b.toLowerCase().includes('counter')) return -1;
    return a.localeCompare(b);
  });

  // 🖨️ Synchronized Settings-Based Receipt Printer Utility with Accurate Original Timestamp
  const printSingleReceipt = (o, index) => {
    let dateStr = o.timestamp;
    if (!dateStr) {
      const orderDateObj = getSafeTimestamp(o, index);
      dateStr = orderDateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }

    const items = o.items || o.orderItems || [];
    const toggles = receiptConfig.toggles || {};

    let printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for printing.');
      return;
    }

    const itemsHtml = items.map(it => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>${it.quantity || it.qty || 1}x ${it.itemName || it.name || 'Item'}</span>
        <span>₹${((Number(it.unitPrice || it.price) || 0) * (Number(it.quantity || it.qty) || 1)).toFixed(2)}</span>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${o.displayId || o.orderId || 'Order'}</title>
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
          ${toggles.invoiceNo ? `<div><strong>Order ID:</strong> ${o.displayId || o.orderId || 'N/A'}</div>` : ''}
          ${toggles.dateAndTime ? `<div><strong>Date:</strong> ${dateStr}</div>` : ''}
          <div><strong>Customer:</strong> ${o.customerName || 'Walk-In'}</div>
          <div><strong>Captain:</strong> ${extractCaptain(o.customerName) || 'Unassigned'}</div>
          <div><strong>Channel:</strong> ${o.channel || 'COUNTER'}</div>
          <div><strong>Status:</strong> ${o.status || 'Completed'}</div>
          <div class="line"></div>
          <div class="bold" style="margin-bottom: 6px;">ITEMS:</div>
          ${itemsHtml}
          <div class="line"></div>
          <div class="flex"><span>Subtotal:</span><span>₹${(o.subtotal || o.totalAmount || 0).toFixed(2)}</span></div>
          ${toggles.totalTax ? `<div class="flex"><span>Tax:</span><span>₹${(o.totalTax || 0).toFixed(2)}</span></div>` : ''}
          <div class="flex bold" style="font-size: 13px; margin-top: 6px;"><span>Total:</span><span>₹${o.totalAmount || 0}</span></div>
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

  const printBulkHistory = () => {
    let printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;
    
    const rowsHtml = completedHistoryOrders.map((o) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.displayId || o.orderId}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.customerName || 'Walk-In'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.channel || 'COUNTER'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.status || 'Completed'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">₹${o.totalAmount || 0}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <html>
        <head><title>Completed Orders History Report</title></head>
        <body style="font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b;">
          <h2 style="margin-bottom: 5px;">${receiptConfig.restaurantName} - Completed Orders Report</h2>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</p>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px;">Order ID</th>
                <th style="padding: 10px;">Customer</th>
                <th style="padding: 10px;">Channel</th>
                <th style="padding: 10px;">Status</th>
                <th style="padding: 10px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  const customerHistoryMap = {};
  orders.forEach(o => {
    const name = o.customerName || 'Walk-In Guest';
    if (!customerHistoryMap[name]) customerHistoryMap[name] = [];
    customerHistoryMap[name].push(o);
  });

  return (
    <div className="rp">
      <style>{css}</style>

      {/* Top Header */}
      <div className="rp-header">
        <div>
          <h2 className="rp-title">Reports & Analytics Hub</h2>
          <p className="rp-subtitle">
            Enterprise-grade kitchen synchronized operational metrics, audits, and real-time ledger
          </p>
        </div>
        <div className="rp-header-tools">
          <button onClick={() => window.print()} className="rp-export-btn">🖨️ Print Full Dashboard</button>
        </div>
      </div>

      <div className="printable-report-area rp-stack">
        
        {/* SECTION 1: ACTIVE ORDERS REPORT */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">📋 Active Orders & Live Breakdown</h3>
              <p className="rp-section-desc">Live operational queue showing all pending & preparing orders</p>
            </div>
            <div className="rp-tools">
              <button onClick={() => window.print()} className="rp-pill-btn">🖨️ Print Active Orders</button>
            </div>
          </div>

          <div className="rp-filters">
            <input 
              type="text" 
              placeholder="🔍 Search customer name or order ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="rp-search"
            />
            <select value={orderChannelFilter} onChange={e => setOrderChannelFilter(e.target.value)} className="rp-select">
              <option value="ALL">All Channels</option>
              <option value="TABLE">Table Orders</option>
              <option value="COUNTER">Counter POS</option>
              <option value="ONLINE">Online (Zomato/Swiggy)</option>
            </select>
            <select value={selectedCaptainFilter} onChange={e => setSelectedCaptainFilter(e.target.value)} className="rp-select">
              {allCaptains.map((cap, cIdx) => (
                <option key={cIdx} value={cap}>{cap === 'ALL' ? 'All Captains' : cap}</option>
              ))}
            </select>
          </div>

          {activeBreakdownOrders.length === 0 ? (
            <div className="rp-empty">No active orders matching your filter criteria.</div>
          ) : (
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Channel / Type</th>
                    <th>Captain</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBreakdownOrders.map((o, idx) => (
                    <tr key={idx}>
                      <td><strong className="rp-strong">{o.displayId || o.orderId}</strong></td>
                      <td>{o.customerName || 'Walk-In'}</td>
                      <td><span className="rp-badge">{o.channel || 'COUNTER'}</span></td>
                      <td className="rp-captain-cell">{extractCaptain(o.customerName) || 'Unassigned'}</td>
                      <td>
                        <span className={`rp-status ${(o.status || 'New').toLowerCase() === 'ready' ? 'is-ready' : ''}`}>
                          {o.status || 'New'}
                        </span>
                      </td>
                      <td className="rp-amount">₹{o.totalAmount || 0}</td>
                      <td>
                        <button onClick={() => setSelectedCustomerHistory(o.customerName)} className="rp-history-btn">🔍 History</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 2: PAST ORDERS HISTORY & RECEIPTS */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">📦 Past Orders & History Archive</h3>
              <p className="rp-section-desc">All past and completed orders are permanently retained here</p>
            </div>
            <div className="rp-tools">
              <select value={historyDateRange} onChange={e => setHistoryDateRange(e.target.value)} className="rp-select">
                <option value="all">All Time (Default)</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Year</option>
              </select>
              <button onClick={printBulkHistory} className="rp-pill-btn">🖨️ Print Whole Ledger</button>
            </div>
          </div>

          {completedHistoryOrders.length === 0 ? (
            <div className="rp-empty">No past completed orders found.</div>
          ) : (
            <div className="rp-list rp-list-400">
              {completedHistoryOrders.map((o, idx) => (
                <div 
                  key={idx} 
                  className="rp-hist-row"
                  onMouseEnter={() => setHoveredCard(`hist-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="rp-row-left">
                    <span className="rp-hist-id">{o.displayId || o.orderId}</span>
                    <span className="rp-badge">{o.channel || 'COUNTER'}</span>
                    <span className="rp-hist-customer">👤 {o.customerName || 'Walk-In'}</span>
                    <span className="rp-hist-status">Status: {o.status}</span>
                  </div>
                  <div className="rp-row-right">
                    <span className="rp-hist-amount">₹{o.totalAmount || 0}</span>
                    <button onClick={() => printSingleReceipt(o, idx)} className="rp-receipt-btn">🖨️ Receipt</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: CAPTAINS PERFORMANCE REPORT */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">🧑‍✈️ Captains Performance & Analytics</h3>
              <p className="rp-section-desc">Click any captain card to inspect complete past & present assigned orders</p>
            </div>
            <select value={captainDateRange} onChange={e => setCaptainDateRange(e.target.value)} className="rp-select">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {sortedCaptainKeys.length === 0 ? (
            <div className="rp-empty">No captain assignments recorded for this period.</div>
          ) : (
            <div className="rp-cap-grid">
              {sortedCaptainKeys.map((capName, cIdx) => (
                <div 
                  key={cIdx} 
                  onClick={() => setSelectedCaptainDetails({ name: capName, orders: captainMap[capName].orders })}
                  className="rp-cap-card"
                  onMouseEnter={() => setHoveredCard(`cap-${cIdx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="rp-cap-top">
                    <span className="rp-cap-name">🧑‍✈️ {capName}</span>
                    <span className="rp-cap-inspect">Inspect ›</span>
                  </div>
                  <div className="rp-cap-line">Orders Managed: <strong className="rp-blue">{captainMap[capName].orderCount}</strong></div>
                  <div className="rp-cap-line">Revenue Generated: <strong className="rp-green">₹{captainMap[capName].revenue}</strong></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: PAST COMPLAINTS ARCHIVE */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">✅ Closed & Resolved Complaints Archive</h3>
              <p className="rp-section-desc">Synced historical log of all successfully closed customer complaints</p>
            </div>
          </div>

          {closedComplaints.length === 0 ? (
            <div className="rp-empty">No closed complaints archived yet.</div>
          ) : (
            <div className="rp-list rp-list-350">
              {closedComplaints.map((c, idx) => (
                <div key={idx} className="rp-complaint-row">
                  <div className="rp-row-left">
                    <span className="rp-hist-id">{c.complaintId}</span>
                    <span className="rp-badge">{c.orderId}</span>
                    <span className="rp-hist-customer">👤 {c.customerName || 'Guest'}</span>
                    <span className="rp-complaint-type">{c.complaintType}</span>
                  </div>
                  <span className="rp-closed">● Closed</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: REVENUE DISTRIBUTION & ANALYTICS */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">📊 Revenue Distribution & Analytics</h3>
              <p className="rp-section-desc">Visual breakdown by dining channels and revenue generation</p>
            </div>
            <div className="rp-tools">
              <select value={analyticsCategoryFilter} onChange={e => setAnalyticsCategoryFilter(e.target.value)} className="rp-select">
                <option value="ALL">All Categories</option>
                <option value="TABLE">Table Orders</option>
                <option value="COUNTER">Counter POS</option>
                <option value="ONLINE">Online</option>
              </select>
              <select value={analyticsDateRange} onChange={e => setAnalyticsDateRange(e.target.value)} className="rp-select">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          <div className="rp-metrics">
            <div className="rp-metric">
              <div className="rp-metric-title">Total Revenue</div>
              <div className="rp-metric-value">₹{totalRevenue.toFixed(2)}</div>
            </div>
            <div className="rp-metric">
              <div className="rp-metric-title">Total Orders Count</div>
              <div className="rp-metric-value is-blue">{totalOrdersCount}</div>
            </div>
            <div className="rp-metric">
              <div className="rp-metric-title">Avg Order Value</div>
              <div className="rp-metric-value is-amber">
                ₹{totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Dynamic Pie Chart Visual */}
          <div className="rp-chart">
            {analyticsOrders.length === 0 ? (
              <div className="rp-empty">No revenue distribution data available for this range.</div>
            ) : (
              <>
                <div className="rp-pie" style={{ background: dynamicPieBackground }}>
                  <div className="rp-pie-center">
                    ₹{totalRevenue.toFixed(0)}
                  </div>
                </div>
                <div className="rp-legend">
                  <span className="rp-legend-item is-dine">■ Dine-In / Table ({tablePct.toFixed(1)}%)</span>
                  <span className="rp-legend-item is-counter">■ Takeaway / Counter ({counterPct.toFixed(1)}%)</span>
                  <span className="rp-legend-item is-online">■ Online Aggregators ({onlinePct.toFixed(1)}%)</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* CAPTAIN DETAILED ORDERS MODAL */}
      {selectedCaptainDetails && (
        <div className="rp-overlay" onClick={() => setSelectedCaptainDetails(null)}>
          <div className="rp-modal rp-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-head">
              <h3 className="rp-modal-title">
                🧑‍✈️ Captain Ledger: {selectedCaptainDetails.name} ({selectedCaptainDetails.orders.length} Orders)
              </h3>
              <button onClick={() => setSelectedCaptainDetails(null)} className="rp-close-x">✕</button>
            </div>

            <div className="rp-modal-list rp-modal-list-420">
              {selectedCaptainDetails.orders.map((ord, oIdx) => (
                <div key={oIdx} className="rp-modal-row">
                  <div>
                    <div className="rp-mr-id">{ord.displayId || ord.orderId || 'Order'}</div>
                    <div className="rp-mr-customer">
                      👤 {ord.customerName || 'Walk-In'} {ord.customerPhone ? `• 📞 ${ord.customerPhone}` : ''}
                    </div>
                    <div className="rp-mr-meta">
                      Status: <span className="rp-green">{ord.status || 'Completed'}</span> · Channel: {ord.channel || 'COUNTER'}
                    </div>
                  </div>
                  <div className="rp-mr-right">
                    <div className="rp-mr-amount">₹{ord.totalAmount || 0}</div>
                    <button onClick={() => printSingleReceipt(ord, oIdx)} className="rp-receipt-btn rp-mt">🖨️ Receipt</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedCaptainDetails(null)} className="rp-modal-close">Close Captain Ledger</button>
          </div>
        </div>
      )}

      {/* CUSTOMER HISTORY MODAL */}
      {selectedCustomerHistory && (
        <div className="rp-overlay" onClick={() => setSelectedCustomerHistory(null)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-head">
              <h3 className="rp-modal-title">👤 Customer History: {selectedCustomerHistory}</h3>
              <button onClick={() => setSelectedCustomerHistory(null)} className="rp-close-x">✕</button>
            </div>
            <div className="rp-modal-list rp-modal-list-300">
              {(customerHistoryMap[selectedCustomerHistory] || []).map((pastOrder, pIdx) => (
                <div key={pIdx} className="rp-modal-row">
                  <div>
                    <div className="rp-mr-id">{pastOrder.displayId || 'Order'}</div>
                    <div className="rp-mr-status">{pastOrder.status}</div>
                  </div>
                  <div className="rp-mr-right">
                    <div className="rp-mr-amount is-small">₹{pastOrder.totalAmount}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedCustomerHistory(null)} className="rp-modal-close">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Styles (frontend only) ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

.rp {
  --ink: #0f172a;
  --ink-soft: #334155;
  --ink-faint: #64748b;
  --line: #e2e8f0;
  --surface: #ffffff;
  --canvas: #f3f5f9;
  --green: #059669;
  --green-dark: #047857;
  --blue: #2563eb;
  --amber: #d97706;

  display: flex;
  flex-direction: column;
  flex: 1;
  padding: clamp(16px, 3vw, 36px);
  padding-bottom: 100px;
  box-sizing: border-box;
  overflow-y: auto;
  font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  color: var(--ink);
  background:
    radial-gradient(900px 420px at 100% -10%, rgba(37, 99, 235, 0.08), transparent 60%),
    radial-gradient(700px 380px at -10% 0%, rgba(5, 150, 105, 0.07), transparent 60%),
    var(--canvas);
}
.rp *, .rp *::before, .rp *::after { box-sizing: border-box; }

/* ---------- Header ---------- */
.rp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}
.rp-title {
  margin: 0;
  font-size: clamp(26px, 3.4vw, 34px);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--ink);
}
.rp-subtitle { margin: 8px 0 0 0; color: var(--ink-faint); font-size: 15px; font-weight: 600; }
.rp-header-tools { display: flex; gap: 12px; }

.rp-export-btn {
  font-family: inherit;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.rp-export-btn:hover { transform: translateY(-3px); filter: brightness(1.06); box-shadow: 0 14px 28px rgba(5, 150, 105, 0.36); }
.rp-export-btn:active { transform: translateY(0) scale(0.97); }

/* ---------- Sections ---------- */
.rp-stack { display: flex; flex-direction: column; gap: 30px; }

.rp-section {
  background: var(--surface);
  padding: clamp(18px, 2.4vw, 32px);
  border-radius: 24px;
  border: 1px solid var(--line);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 14px 34px -16px rgba(15, 23, 42, 0.14);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  animation: rp-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.rp-section:nth-child(2) { animation-delay: 0.08s; }
.rp-section:nth-child(3) { animation-delay: 0.16s; }
.rp-section:nth-child(4) { animation-delay: 0.24s; }
.rp-section:nth-child(5) { animation-delay: 0.32s; }
.rp-section:hover { border-color: #d3dcea; box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05), 0 22px 44px -18px rgba(15, 23, 42, 0.2); }

@keyframes rp-rise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rp-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
}
.rp-section-title { margin: 0; font-size: clamp(19px, 2.2vw, 23px); font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.rp-section-desc { margin: 5px 0 0 0; font-size: 14px; color: var(--ink-faint); font-weight: 600; }
.rp-tools { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

/* ---------- Buttons ---------- */
.rp-pill-btn {
  font-family: inherit;
  background: var(--ink);
  color: #fff;
  border: none;
  padding: 13px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.rp-pill-btn:hover { transform: translateY(-2px); background: #1e293b; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.3); }
.rp-pill-btn:active { transform: translateY(0) scale(0.97); }

.rp-receipt-btn {
  font-family: inherit;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.rp-receipt-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 10px 20px rgba(5, 150, 105, 0.35); }
.rp-receipt-btn:active { transform: translateY(0) scale(0.96); }
.rp-receipt-btn.rp-mt { margin-top: 10px; }

.rp-history-btn {
  font-family: inherit;
  background: #ecfdf5;
  color: var(--green-dark);
  border: 1.5px solid #10b981;
  padding: 9px 15px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.rp-history-btn:hover { background: #10b981; color: #fff; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3); }
.rp-history-btn:active { transform: translateY(0) scale(0.96); }

/* ---------- Filters ---------- */
.rp-filters { display: flex; gap: 14px; margin-bottom: 22px; flex-wrap: wrap; align-items: center; }
.rp-search {
  flex: 1;
  min-width: 240px;
  font-family: inherit;
  padding: 14px 18px;
  border-radius: 12px;
  border: 2px solid #d5dde8;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.rp-search::placeholder { color: #94a3b8; font-weight: 600; }
.rp-search:hover { border-color: #b6c3d4; }
.rp-search:focus { border-color: var(--blue); background: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); }

.rp-select {
  font-family: inherit;
  padding: 14px 18px;
  border-radius: 12px;
  border: 2px solid #d5dde8;
  font-size: 15px;
  font-weight: 700;
  background: #f8fafc;
  outline: none;
  cursor: pointer;
  color: var(--ink-soft);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.rp-select:hover { border-color: #b6c3d4; background: #fff; }
.rp-select:focus { border-color: var(--blue); background: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); }

/* ---------- Table ---------- */
.rp-table-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid var(--line); }
.rp-table { width: 100%; border-collapse: collapse; font-size: 15px; min-width: 760px; }
.rp-table thead tr { background: #f1f5f9; }
.rp-table th {
  padding: 16px 18px;
  font-weight: 800;
  font-size: 14px;
  color: #475569;
  text-align: left;
  white-space: nowrap;
  border-bottom: 2px solid var(--line);
}
.rp-table td { padding: 17px 18px; color: var(--ink-soft); font-weight: 700; border-bottom: 1px solid #eef2f7; }
.rp-table tbody tr { transition: background 0.18s ease, box-shadow 0.18s ease; animation: rp-fade 0.4s ease both; }
.rp-table tbody tr:hover { background: #eff6ff; box-shadow: inset 4px 0 0 var(--blue); }
.rp-table tbody tr:last-child td { border-bottom: none; }

@keyframes rp-fade { from { opacity: 0; } to { opacity: 1; } }

.rp-strong { color: var(--ink); font-weight: 800; }
.rp-captain-cell { color: var(--blue) !important; font-weight: 800 !important; }
.rp-amount { color: var(--green) !important; font-weight: 800 !important; font-size: 16px; }

.rp-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  color: #b45309;
  background: #fef3c7;
}
.rp-status.is-ready { color: var(--blue); background: #dbeafe; }

.rp-badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  border: 1.5px solid #bae6fd;
}

/* ---------- Lists (history + complaints) ---------- */
.rp-list { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; padding: 4px 6px 4px 2px; }
.rp-list-400 { max-height: 440px; }
.rp-list-350 { max-height: 390px; }

.rp-hist-row,
.rp-complaint-row {
  background: #f8fafc;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
  animation: rp-fade 0.4s ease both;
}
.rp-hist-row { cursor: pointer; }
.rp-hist-row:hover {
  border-color: var(--green);
  background: #f0fdf4;
  transform: translateY(-3px);
  box-shadow: 0 12px 26px rgba(5, 150, 105, 0.14);
}
.rp-complaint-row:hover { border-color: #a7f3d0; background: #f0fdf9; transform: translateY(-2px); box-shadow: 0 10px 22px rgba(16, 185, 129, 0.12); }

.rp-row-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.rp-row-right { display: flex; align-items: center; gap: 18px; }
.rp-hist-id { font-weight: 800; color: var(--ink); font-size: 17px; }
.rp-hist-customer { font-size: 15px; color: var(--ink-soft); font-weight: 700; }
.rp-hist-status { font-size: 14px; color: var(--green); font-weight: 800; }
.rp-hist-amount { font-weight: 800; color: var(--green); font-size: 19px; }

.rp-complaint-type { background: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 800; }
.rp-closed { font-size: 13px; color: #10b981; font-weight: 800; }

/* ---------- Captain cards ---------- */
.rp-cap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 18px; }
.rp-cap-card {
  background: #f8fafc;
  padding: 22px;
  border-radius: 18px;
  border: 1.5px solid var(--line);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
  animation: rp-fade 0.4s ease both;
}
.rp-cap-card:hover {
  border-color: var(--blue);
  background: #eff6ff;
  transform: translateY(-5px);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.16);
}
.rp-cap-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; }
.rp-cap-name { font-size: 18px; font-weight: 800; color: var(--ink); }
.rp-cap-inspect { font-size: 14px; color: var(--blue); font-weight: 800; transition: transform 0.2s ease; white-space: nowrap; }
.rp-cap-card:hover .rp-cap-inspect { transform: translateX(5px); }
.rp-cap-line { font-size: 15px; color: var(--ink-faint); font-weight: 700; margin-top: 5px; }
.rp-blue { color: var(--blue); font-size: 17px; }
.rp-green { color: var(--green); font-weight: 800; }
.rp-cap-line .rp-green { font-size: 17px; }

/* ---------- Metrics ---------- */
.rp-metrics { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 20px; margin-bottom: 26px; }
.rp-metric {
  background: linear-gradient(145deg, #f8fafc, #eef2f7);
  padding: 26px;
  border-radius: 20px;
  border: 1.5px solid var(--line);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.rp-metric:hover { transform: translateY(-5px); border-color: #cbd5e1; box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12); }
.rp-metric-title { font-size: 14px; font-weight: 800; color: var(--ink-faint); margin-bottom: 10px; }
.rp-metric-value { font-size: clamp(30px, 3.4vw, 40px); font-weight: 800; color: var(--green); letter-spacing: -0.03em; }
.rp-metric-value.is-blue { color: var(--blue); }
.rp-metric-value.is-amber { color: var(--amber); }

/* ---------- Chart ---------- */
.rp-chart {
  background: #f8fafc;
  padding: 32px 24px;
  border-radius: 22px;
  border: 1.5px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.rp-pie {
  width: 210px;
  height: 210px;
  border-radius: 50%;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  animation: rp-pie-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.rp-pie:hover { transform: scale(1.05) rotate(4deg); box-shadow: 0 22px 44px rgba(15, 23, 42, 0.22); }
@keyframes rp-pie-in {
  from { opacity: 0; transform: scale(0.6) rotate(-120deg); }
  to   { opacity: 1; transform: scale(1) rotate(0); }
}
.rp-pie-center {
  width: 118px;
  height: 118px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 19px;
  color: var(--ink);
  box-shadow: inset 0 2px 8px rgba(15, 23, 42, 0.08);
}
.rp-legend { display: flex; gap: 14px 24px; font-size: 15px; font-weight: 800; flex-wrap: wrap; justify-content: center; }
.rp-legend-item { padding: 8px 14px; border-radius: 999px; background: #fff; border: 1.5px solid var(--line); transition: transform 0.2s ease, box-shadow 0.2s ease; }
.rp-legend-item:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(15, 23, 42, 0.1); }
.rp-legend-item.is-dine { color: #059669; }
.rp-legend-item.is-counter { color: #2563eb; }
.rp-legend-item.is-online { color: #d97706; }

/* ---------- Empty state ---------- */
.rp-empty {
  text-align: center;
  padding: 44px 24px;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 18px;
}
.rp-chart .rp-empty { width: 100%; }

/* ---------- Modals ---------- */
.rp-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 1000;
  animation: rp-fade 0.25s ease both;
}
.rp-modal {
  width: min(500px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: #fff;
  padding: clamp(18px, 3vw, 32px);
  border-radius: 24px;
  border: 1px solid var(--line);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
  animation: rp-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.rp-modal-lg { width: min(680px, 100%); }
@keyframes rp-pop {
  from { opacity: 0; transform: translateY(18px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.rp-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--line);
}
.rp-modal-title { margin: 0; color: var(--ink); font-weight: 800; font-size: 20px; line-height: 1.3; }
.rp-close-x {
  font-family: inherit;
  background: #f1f5f9;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 17px;
  font-weight: 800;
  color: #64748b;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease;
}
.rp-close-x:hover { background: #fee2e2; color: #dc2626; transform: rotate(90deg); }

.rp-modal-list { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; margin-bottom: 22px; padding-right: 4px; }
.rp-modal-list-420 { max-height: 420px; }
.rp-modal-list-300 { max-height: 300px; }

.rp-modal-row {
  background: #f8fafc;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1.5px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.rp-modal-row:hover { border-color: var(--green); background: #f0fdf4; transform: translateX(4px); box-shadow: 0 8px 18px rgba(5, 150, 105, 0.12); }
.rp-mr-id { font-weight: 800; color: var(--ink); font-size: 17px; }
.rp-mr-customer { font-size: 15px; color: var(--ink-soft); font-weight: 700; margin-top: 5px; }
.rp-mr-meta { font-size: 14px; color: var(--ink-faint); font-weight: 600; margin-top: 4px; }
.rp-mr-status { font-size: 14px; color: var(--ink-faint); font-weight: 600; margin-top: 2px; }
.rp-mr-right { text-align: right; }
.rp-mr-amount { font-weight: 800; color: var(--green); font-size: 21px; }
.rp-mr-amount.is-small { font-size: 18px; }

.rp-modal-close {
  width: 100%;
  font-family: inherit;
  padding: 15px;
  background: var(--ink);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.rp-modal-close:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.3); }
.rp-modal-close:active { transform: translateY(0) scale(0.98); }

/* ---------- Keyboard focus ---------- */
.rp-export-btn:focus-visible,
.rp-pill-btn:focus-visible,
.rp-receipt-btn:focus-visible,
.rp-history-btn:focus-visible,
.rp-close-x:focus-visible,
.rp-modal-close:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.5);
  outline-offset: 2px;
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .rp-header-tools, .rp-export-btn { width: 100%; }
  .rp-tools { width: 100%; }
  .rp-tools .rp-select, .rp-tools .rp-pill-btn { flex: 1; min-width: 140px; }
  .rp-select, .rp-search { width: 100%; }
  .rp-hist-row, .rp-complaint-row { padding: 16px; }
  .rp-row-right { width: 100%; justify-content: space-between; }
  .rp-pie { width: 180px; height: 180px; }
  .rp-pie-center { width: 100px; height: 100px; font-size: 17px; }
}

/* ---------- Print ---------- */
@media print {
  body * { visibility: hidden !important; }
  .printable-report-area, .printable-report-area * { visibility: visible !important; }
  .printable-report-area { position: absolute; left: 0; top: 0; width: 100%; background: #fff !important; }
  .rp-section, .rp-pie, .rp-table tbody tr { animation: none !important; }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .rp *, .rp *::before, .rp *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;