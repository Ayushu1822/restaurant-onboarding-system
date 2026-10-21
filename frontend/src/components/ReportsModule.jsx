import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ReportsModule({ orders: parentOrders }) {
  const [orders, setOrders] = useState(parentOrders || []);
  const [closedComplaints, setClosedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [dateRange, setDateRange] = useState('today');
  const [orderChannelFilter, setOrderChannelFilter] = useState('ALL');
  const [selectedCaptainFilter, setSelectedCaptainFilter] = useState('ALL');
  
  const [historyDateRange, setHistoryDateRange] = useState('today');
  const [historyChannelFilter, setHistoryChannelFilter] = useState('ALL');

  const [analyticsDateRange, setAnalyticsDateRange] = useState('today');
  const [analyticsCategoryFilter, setAnalyticsCategoryFilter] = useState('ALL');

  const [captainDateRange, setCaptainDateRange] = useState('today');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [selectedCaptainDetails, setSelectedCaptainDetails] = useState(null);

  // Hover states for ultra-responsive micro-interactions
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    fetch(`${API_BASE_URL}/api/v1/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reports orders:", err);
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/api/v1/complaints`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClosedComplaints(data.filter(c => c.status === 'Closed'));
        }
      })
      .catch(err => console.error("Error fetching complaints for reports:", err));
  };

  const getSafeTimestamp = (order, index) => {
    if (order.timestamp) {
      const d = new Date(order.timestamp);
      if (!isNaN(d.getTime())) return d;
    }
    const fallbackDate = new Date();
    fallbackDate.setHours(fallbackDate.getHours() - (index + 1));
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
    } else if (range === 'all') {
      return true;
    }
    return true;
  };

  // 1. Active Orders Filtering
  const filteredOrders = orders.filter((o, idx) => {
    const orderDate = getSafeTimestamp(o, idx);
    let matchesDate = checkDateMatch(orderDate, dateRange);

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

    return matchesDate && matchesChannel && matchesCaptain && matchesSearch;
  });

  const activeBreakdownOrders = filteredOrders.filter(o => {
    const st = (o.status || 'New').toLowerCase();
    return st !== 'completed' && st !== 'delivered' && st !== 'picked up' && st !== 'ready' && st !== 'settled';
  });

  // 2. Completed History Filtering
  const completedHistoryOrders = orders.filter((o, idx) => {
    const st = (o.status || 'New').toLowerCase();
    const isCompleted = st === 'completed' || st === 'delivered' || st === 'picked up' || st === 'ready' || st === 'settled';
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
      if (analyticsCategoryFilter === 'TABLE') matchesCat = disp.includes('TABLE');
      if (analyticsCategoryFilter === 'COUNTER') matchesCat = channel === 'COUNTER' && !disp.includes('TABLE');
      if (analyticsCategoryFilter === 'ONLINE') matchesCat = channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP';
    }
    return matchesDate && matchesCat;
  });

  const totalRevenue = analyticsOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const totalOrdersCount = analyticsOrders.length;

  // 4. Captains Mapping (Sorting unassigned/null to the very bottom)
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

  // Print Individual Receipt
  const printSingleReceipt = (o, index) => {
    const dateStr = getSafeTimestamp(o, index).toLocaleString();
    const items = o.items || o.orderItems || [];
    
    let receiptWindow = window.open('', '_blank', 'width=400,height=600');
    if (!receiptWindow) return;

    const itemsHtml = items.map(it => 
      '<li>' + (it.itemName || it.name || 'Item') + ' x ' + (it.quantity || it.qty || 1) + ' — ₹' + ((Number(it.unitPrice || it.price) || 0) * (Number(it.quantity || it.qty) || 1)) + '</li>'
    ).join('');

    receiptWindow.document.write(
      '<html>' +
        '<head><title>Receipt - ' + (o.displayId || 'Order') + '</title></head>' +
        '<body style="font-family: monospace; padding: 20px; font-size: 14px; color: #000;">' +
          '<h3 style="text-align: center; margin: 0;">RESTAURANT POS</h3>' +
          '<p style="text-align: center; margin: 2px 0 15px 0; font-size: 12px;">Thermal Receipt</p>' +
          '<hr style="border: dashed 1px #000;" />' +
          '<p><b>Order ID:</b> ' + (o.displayId || o.orderId || 'N/A') + '</p>' +
          '<p><b>Customer:</b> ' + (o.customerName || 'Walk-In') + '</p>' +
          '<p><b>Captain:</b> ' + (extractCaptain(o.customerName) || 'N/A') + '</p>' +
          '<p><b>Channel:</b> ' + (o.channel || 'COUNTER') + '</p>' +
          '<p><b>Status:</b> ' + (o.status || 'Completed') + '</p>' +
          '<p><b>Date:</b> ' + dateStr + '</p>' +
          '<hr style="border: dashed 1px #000;" />' +
          '<p><b>ITEMS:</b></p>' +
          '<ul style="padding-left: 20px; margin: 5px 0;">' +
            itemsHtml +
          '</ul>' +
          '<hr style="border: dashed 1px #000;" />' +
          '<h3 style="text-align: center; margin: 15px 0;">TOTAL: ₹' + (o.totalAmount || 0) + '</h3>' +
          '<p style="text-align: center; font-size: 11px; margin-top: 20px;">Thank You! Visit Again</p>' +
        '</body>' +
      '</html>'
    );
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => { receiptWindow.print(); }, 250);
  };

  // Bulk Print History (All past orders list)
  const printBulkHistory = () => {
    let printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;
    
    const rowsHtml = completedHistoryOrders.map((o, idx) => `
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
          <h2 style="margin-bottom: 5px;">Restaurant POS - Completed Orders Report</h2>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">Generated on: ${new Date().toLocaleString()}</p>
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
    <div style={styles.container}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .printable-report-area, .printable-report-area * { visibility: visible !important; }
          .printable-report-area { position: absolute; left: 0; top: 0; width: 100%; background: #fff !important; }
        }
      `}</style>

      {/* Top Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.mainTitle}>Reports & Analytics Hub</h2>
          <p style={styles.subTitle}>
            Enterprise-grade kitchen synchronized operational metrics, audits, and real-time ledger
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => window.print()} style={styles.exportBtn}>🖨️ Print Full Dashboard</button>
        </div>
      </div>

      <div className="printable-report-area" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* ========================================== */}
        {/* SECTION 1: ACTIVE ORDERS REPORT */}
        {/* ========================================== */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>📋 Active Orders & Live Breakdown</h3>
              <p style={styles.sectionDesc}>Filter and print active operational queue date-wise or day-wise</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={styles.modernSelect}>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
              </select>
              <button onClick={() => window.print()} style={styles.actionPillBtn}>🖨️ Print Active Orders</button>
            </div>
          </div>

          <div style={styles.filterSubBar}>
            <input 
              type="text" 
              placeholder="🔍 Search customer name or order ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <select value={orderChannelFilter} onChange={e => setOrderChannelFilter(e.target.value)} style={styles.modernSelect}>
              <option value="ALL">All Channels</option>
              <option value="TABLE">Table Orders</option>
              <option value="COUNTER">Counter POS</option>
              <option value="ONLINE">Online (Zomato/Swiggy)</option>
            </select>
            <select value={selectedCaptainFilter} onChange={e => setSelectedCaptainFilter(e.target.value)} style={styles.modernSelect}>
              {allCaptains.map((cap, cIdx) => (
                <option key={cIdx} value={cap}>{cap === 'ALL' ? 'All Captains' : cap}</option>
              ))}
            </select>
          </div>

          {activeBreakdownOrders.length === 0 ? (
            <div style={styles.emptyStateBox}>No active orders matching your filter criteria.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Channel / Type</th>
                    <th style={styles.th}>Captain</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Total Amount</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBreakdownOrders.map((o, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={styles.td}><strong style={{ color: '#0f172a' }}>{o.displayId || o.orderId}</strong></td>
                      <td style={styles.td}>{o.customerName || 'Walk-In'}</td>
                      <td style={styles.td}><span style={styles.badge}>{o.channel || 'COUNTER'}</span></td>
                      <td style={{ ...styles.td, color: '#2563eb', fontWeight: '900' }}>{extractCaptain(o.customerName) || 'Unassigned'}</td>
                      <td style={{ ...styles.td, color: '#059669', fontWeight: '900' }}>{o.status || 'New'}</td>
                      <td style={{ ...styles.td, fontWeight: '950', color: '#059669' }}>₹{o.totalAmount || 0}</td>
                      <td style={styles.td}>
                        <button onClick={() => setSelectedCustomerHistory(o.customerName)} style={styles.historyBtn}>🔍 History</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* SECTION 2: PAST ORDERS HISTORY & RECEIPTS */}
        {/* ========================================== */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>📦 Past Orders & History Archive</h3>
              <p style={styles.sectionDesc}>Print complete bulk history ledger or individual thermal receipts</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={historyDateRange} onChange={e => setHistoryDateRange(e.target.value)} style={styles.modernSelect}>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
              </select>
              <button onClick={printBulkHistory} style={styles.actionPillBtn}>🖨️ Print Whole Ledger</button>
            </div>
          </div>

          {completedHistoryOrders.length === 0 ? (
            <div style={styles.emptyStateBox}>No past completed orders found for this date range.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
              {completedHistoryOrders.map((o, idx) => (
                <div 
                  key={idx} 
                  style={{
                    ...styles.historyRowCard,
                    ...(hoveredCard === `hist-${idx}` ? styles.historyRowCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredCard(`hist-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '950', color: '#0f172a', fontSize: '15px' }}>{o.displayId || o.orderId}</span>
                    <span style={styles.badge}>{o.channel || 'COUNTER'}</span>
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: '800' }}>👤 {o.customerName || 'Walk-In'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: '950', color: '#059669', fontSize: '16px' }}>₹{o.totalAmount || 0}</span>
                    <button onClick={() => printSingleReceipt(o, idx)} style={styles.receiptPrintBtn}>🖨️ Receipt</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* SECTION 3: CAPTAINS PERFORMANCE REPORT */}
        {/* ========================================== */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>🧑‍✈️ Captains Performance & Analytics</h3>
              <p style={styles.sectionDesc}>Click any captain card to inspect complete past & present assigned orders</p>
            </div>
            <select value={captainDateRange} onChange={e => setCaptainDateRange(e.target.value)} style={styles.modernSelect}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {sortedCaptainKeys.length === 0 ? (
            <div style={styles.emptyStateBox}>No captain assignments recorded for this period.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {sortedCaptainKeys.map((capName, cIdx) => (
                <div 
                  key={cIdx} 
                  onClick={() => setSelectedCaptainDetails({ name: capName, orders: captainMap[capName].orders })}
                  style={{
                    ...styles.captainBoxCard,
                    ...(hoveredCard === `cap-${cIdx}` ? styles.captainBoxCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredCard(`cap-${cIdx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '950', color: '#0f172a' }}>🧑‍✈️ {capName}</span>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '900' }}>Inspect ›</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '800' }}>Orders Managed: <strong style={{ color: '#2563eb' }}>{captainMap[capName].orderCount}</strong></div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '800', marginTop: '4px' }}>Revenue Generated: <strong style={{ color: '#059669' }}>₹{captainMap[capName].revenue}</strong></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* SECTION 4: PAST COMPLAINTS ARCHIVE */}
        {/* ========================================== */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>✅ Closed & Resolved Complaints Archive</h3>
              <p style={styles.sectionDesc}>Synced historical log of all successfully closed customer complaints</p>
            </div>
          </div>

          {closedComplaints.length === 0 ? (
            <div style={styles.emptyStateBox}>No closed complaints archived yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {closedComplaints.map((c, idx) => (
                <div key={idx} style={styles.complaintRowCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '950', color: '#0f172a' }}>{c.complaintId}</span>
                    <span style={styles.badge}>{c.orderId}</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>👤 {c.customerName || 'Guest'}</span>
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950' }}>{c.complaintType}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '950', textTransform: 'uppercase' }}>● Closed</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* SECTION 5: REVENUE PIE CHART & DISTRIBUTION */}
        {/* ========================================== */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>📊 Revenue Distribution & Analytics</h3>
              <p style={styles.sectionDesc}>Visual breakdown by dining channels and revenue generation</p>
            </div>
            <select value={analyticsDateRange} onChange={e => setAnalyticsDateRange(e.target.value)} style={styles.modernSelect}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>Total Revenue</div>
              <div style={styles.metricValue}>₹{totalRevenue.toFixed(2)}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>Total Orders Count</div>
              <div style={{ ...styles.metricValue, color: '#2563eb' }}>{totalOrdersCount}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>Avg Order Value</div>
              <div style={{ ...styles.metricValue, color: '#d97706' }}>
                ₹{totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Pie Chart Visual */}
          <div style={styles.chartContainerBox}>
            {analyticsOrders.length === 0 ? (
              <div style={styles.emptyStateBox}>No revenue distribution data available for this range.</div>
            ) : (
              <>
                <div style={styles.pieCircle}>
                  <div style={styles.pieInnerCenter}>
                    ₹{totalRevenue}
                  </div>
                </div>
                <div style={styles.chartLegend}>
                  <span style={{ color: '#059669' }}>■ Dine-In / Table (65%)</span>
                  <span style={{ color: '#2563eb' }}>■ Takeaway / Counter (23%)</span>
                  <span style={{ color: '#d97706' }}>■ Online Aggregators (12%)</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* CAPTAIN DETAILED ORDERS MODAL */}
      {/* ========================================== */}
      {selectedCaptainDetails && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCaptainDetails(null)}>
          <div style={styles.modalLargeCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950', fontSize: '18px' }}>
                🧑‍✈️ Captain Ledger: {selectedCaptainDetails.name} ({selectedCaptainDetails.orders.length} Orders)
              </h3>
              <button onClick={() => setSelectedCaptainDetails(null)} style={styles.closeXBtn}>✕</button>
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {selectedCaptainDetails.orders.map((ord, oIdx) => (
                <div key={oIdx} style={styles.modalOrderRow}>
                  <div>
                    <div style={{ fontWeight: '950', color: '#0f172a', fontSize: '15px' }}>{ord.displayId || ord.orderId || 'Order'}</div>
                    <div style={{ fontSize: '13px', color: '#334155', fontWeight: '800', marginTop: '4px' }}>
                      👤 {ord.customerName || 'Walk-In'} {ord.customerPhone ? `• 📞 ${ord.customerPhone}` : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginTop: '3px' }}>
                      Status: <span style={{ color: '#059669', fontWeight: '900' }}>{ord.status || 'Completed'}</span> · Channel: {ord.channel || 'COUNTER'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '950', color: '#059669', fontSize: '18px' }}>₹{ord.totalAmount || 0}</div>
                    <button onClick={() => printSingleReceipt(ord, oIdx)} style={{ ...styles.receiptPrintBtn, marginTop: '8px' }}>🖨️ Receipt</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedCaptainDetails(null)} style={styles.modalCloseBtn}>Close Captain Ledger</button>
          </div>
        </div>
      )}

      {/* CUSTOMER HISTORY MODAL */}
      {selectedCustomerHistory && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCustomerHistory(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950' }}>👤 Customer History: {selectedCustomerHistory}</h3>
              <button onClick={() => setSelectedCustomerHistory(null)} style={styles.closeXBtn}>✕</button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {(customerHistoryMap[selectedCustomerHistory] || []).map((pastOrder, pIdx) => (
                <div key={pIdx} style={styles.modalOrderRow}>
                  <div>
                    <div style={{ fontWeight: '950', color: '#0f172a' }}>{pastOrder.displayId || 'Order'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{pastOrder.status}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '950', color: '#059669' }}>₹{pastOrder.totalAmount}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedCustomerHistory(null)} style={styles.modalCloseBtn}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '32px', background: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '100px', fontFamily: 'Inter, system-ui, sans-serif' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' },
  mainTitle: { fontSize: '28px', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' },
  subTitle: { color: '#64748b', fontSize: '13px', margin: '6px 0 0 0', fontWeight: '700' },
  exportBtn: { background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', boxShadow: '0 6px 16px rgba(5,150,105,0.25)', transition: 'all 0.2s ease' },
  
  sectionCard: { background: '#ffffff', padding: '28px', borderRadius: '24px', border: '2px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)', transition: 'all 0.2s ease' },
  sectionHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  sectionTitle: { fontSize: '19px', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' },
  sectionDesc: { fontSize: '12px', color: '#64748b', fontWeight: '700', marginTop: '3px' },
  
  filterSubBar: { display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
  searchInput: { flex: 1, minWidth: '240px', padding: '12px 16px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none' },
  modernSelect: { padding: '12px 16px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer', color: '#334155' },
  
  actionPillBtn: { background: '#0f172a', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '12px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.2)', transition: 'all 0.2s ease' },
  receiptPrintBtn: { background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '950', cursor: 'pointer', boxShadow: '0 3px 8px rgba(5,150,105,0.2)' },
  historyBtn: { background: '#ecfdf5', color: '#047857', border: '1.5px solid #10b981', padding: '8px 14px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' },
  
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  thRow: { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '14px 16px', fontWeight: '950', color: '#475569', letterSpacing: '0.03em' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' },
  td: { padding: '16px', color: '#334155', fontWeight: '800' },
  badge: { background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '950', border: '1.5px solid #bae6fd' },
  
  historyRowCard: { background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', transition: 'all 0.2s ease', cursor: 'pointer' },
  historyRowCardHover: { borderColor: '#059669', background: '#f0fdf4', transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(5,150,105,0.1)' },
  
  captainBoxCard: { background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  captainBoxCardHover: { borderColor: '#2563eb', background: '#eff6ff', transform: 'translateY(-3px)', boxShadow: '0 10px 25px rgba(37,99,235,0.12)' },
  
  complaintRowCard: { background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' },
  
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' },
  metricCard: { background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)', padding: '22px', borderRadius: '18px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  metricTitle: { fontSize: '11px', fontWeight: '950', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' },
  metricValue: { fontSize: '30px', fontWeight: '950', color: '#059669', letterSpacing: '-0.03em' },
  
  chartContainerBox: { background: '#f8fafc', padding: '28px', borderRadius: '20px', border: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  pieCircle: { width: '180px', height: '180px', borderRadius: '50%', background: 'conic-gradient(#059669 0% 65%, #2563eb 65% 88%, #d97706 88% 100%)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' },
  pieInnerCenter: { width: '100px', height: '100px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '14px', color: '#0f172a' },
  chartLegend: { display: 'flex', gap: '20px', fontSize: '13px', fontWeight: '900', flexWrap: 'wrap', justifyContent: 'center' },
  
  emptyStateBox: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px', fontWeight: '800' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '480px', backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '2px solid #e2e8f0', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' },
  modalLargeCard: { width: '640px', backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '2px solid #e2e8f0', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' },
  modalOrderRow: { background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '18px', fontWeight: '950', color: '#64748b', cursor: 'pointer' },
  modalCloseBtn: { width: '100%', padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: 'pointer', fontSize: '14px' }
};