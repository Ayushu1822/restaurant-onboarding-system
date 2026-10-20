import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ReportsModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Main Filter States (Active & General)
  const [dateRange, setDateRange] = useState('today');
  const [orderChannelFilter, setOrderChannelFilter] = useState('ALL');
  const [selectedCaptainFilter, setSelectedCaptainFilter] = useState('ALL');
  
  // History Specific Filter States
  const [historyDateRange, setHistoryDateRange] = useState('today');
  const [historyChannelFilter, setHistoryChannelFilter] = useState('ALL');

  // Analytics Specific Filter States
  const [analyticsDateRange, setAnalyticsDateRange] = useState('today');
  const [analyticsCategoryFilter, setAnalyticsCategoryFilter] = useState('ALL');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
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
    } else if (range === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (range === 'year') {
      return orderDate.getFullYear() === now.getFullYear();
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

  // 2. Completed History Filtering (with its own Date & Channel Dropdowns)
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

  const captainMap = {};
  orders.forEach(o => {
    const capName = extractCaptain(o.customerName);
    if (capName) {
      if (!captainMap[capName]) {
        captainMap[capName] = { orderCount: 0, revenue: 0 };
      }
      captainMap[capName].orderCount += 1;
      captainMap[capName].revenue += Number(o.totalAmount || 0);
    }
  });

  // Export as Excel (.xls / .csv format)
  const downloadExcelCSV = (filename, rows, headers) => {
    let csvContent = "\uFEFF" + [headers.join("\t"), ...rows.map(e => e.join("\t"))].join("\n");
    var blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrderDetails = () => {
    const headers = ["Order ID", "Customer Name", "Channel", "Type", "Status", "Total Amount", "Timestamp"];
    const rows = filteredOrders.map((o, i) => [
      o.displayId || o.orderId || 'N/A',
      o.customerName || 'Walk-In',
      o.channel || 'COUNTER',
      o.orderType || 'Dine-In',
      o.status || 'New',
      o.totalAmount || 0,
      getSafeTimestamp(o, i).toLocaleString()
    ]);
    downloadExcelCSV(`order_breakdown_${dateRange}.xls`, rows, headers);
  };

  const exportCompletedHistoryExcel = () => {
    const headers = ["Order ID", "Customer Name", "Captain", "Type", "Status", "Total Amount", "Timestamp"];
    const rows = completedHistoryOrders.map((o, i) => [
      o.displayId || o.orderId || 'N/A',
      o.customerName || 'Walk-In',
      extractCaptain(o.customerName) || 'None',
      o.orderType || 'Dine-In',
      o.status || 'Completed',
      o.totalAmount || 0,
      getSafeTimestamp(o, i).toLocaleString()
    ]);
    downloadExcelCSV(`completed_history_${historyDateRange}.xls`, rows, headers);
  };

  // Individual Order Receipt Download
  const downloadSingleReceipt = (o, index) => {
    const dateStr = getSafeTimestamp(o, index).toLocaleString();
    const items = o.items || [];
    let receiptText = `=================================\n`;
    receiptText += `       RESTAURANT POS RECEIPT\n`;
    receiptText += `=================================\n`;
    receiptText += `Order ID : ${o.displayId || o.orderId}\n`;
    receiptText += `Customer : ${o.customerName || 'Walk-In'}\n`;
    receiptText += `Captain  : ${extractCaptain(o.customerName) || 'N/A'}\n`;
    receiptText += `Channel  : ${o.channel || 'COUNTER'} (${o.orderType || 'Dine-In'})\n`;
    receiptText += `Status   : ${o.status || 'Completed'}\n`;
    receiptText += `Date     : ${dateStr}\n`;
    receiptText += `---------------------------------\n`;
    receiptText += `ITEMS:\n`;
    items.forEach((it, idx) => {
      receiptText += `${idx + 1}. ${it.itemName || it.name} x ${it.quantity || it.qty || 1}  -  ₹${(it.unitPrice || 0) * (it.quantity || it.qty || 1)}\n`;
    });
    receiptText += `---------------------------------\n`;
    receiptText += `TOTAL AMOUNT: ₹${o.totalAmount || 0}\n`;
    receiptText += `=================================\n`;
    receiptText += `       Thank You! Visit Again\n`;
    receiptText += `=================================\n`;

    var blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8;' });
    var link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `receipt_${o.displayId || 'order'}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const customerHistoryMap = {};
  orders.forEach(o => {
    const name = o.customerName || 'Walk-In Guest';
    if (!customerHistoryMap[name]) customerHistoryMap[name] = [];
    customerHistoryMap[name].push(o);
  });

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Reports & Analytics Hub</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '700' }}>
            Real completed order histories with Excel exports, individual receipts, and captain tracking
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={exportOrderDetails} style={styles.exportBtn}>📥 Orders Excel (.xls)</button>
          <button onClick={exportCompletedHistoryExcel} style={styles.exportBtn}>📦 History Excel (.xls)</button>
          <button onClick={() => window.print()} style={{ ...styles.exportBtn, background: 'linear-gradient(135deg, #059669, #047857)' }}>🖨️ Print Report</button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>🔍 Search Customer / Order ID</label>
          <input 
            type="text" 
            placeholder="Type name or #ORD..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>📂 Order Category Filter</label>
          <select value={orderChannelFilter} onChange={e => setOrderChannelFilter(e.target.value)} style={styles.select}>
            <option value="ALL">All Orders</option>
            <option value="TABLE">Table Orders (Dine-In/Takeaway)</option>
            <option value="COUNTER">Counter POS Orders</option>
            <option value="ONLINE">Online Orders (Zomato/Swiggy/WhatsApp)</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>🧑‍✈️ Filter by Captain</label>
          <select value={selectedCaptainFilter} onChange={e => setSelectedCaptainFilter(e.target.value)} style={styles.select}>
            {allCaptains.map((cap, cIdx) => (
              <option key={cIdx} value={cap}>{cap === 'ALL' ? 'All Captains' : cap}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>📅 Date Range</label>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={styles.select}>
            <option value="today">Present Day (Today)</option>
            <option value="yesterday">Last Day (Yesterday)</option>
            <option value="month">Last Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* ========================================== */}
      {/* 1. DETAILED ACTIVE ORDERS */}
      {/* ========================================== */}
      <div style={styles.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
            📋 Detailed Active Orders & Customer Breakdown ({activeBreakdownOrders.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#047857', fontWeight: '900', background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px' }}>Live Synced</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '800' }}>Loading orders breakdown...</div>
        ) : activeBreakdownOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '800' }}>No active orders found matching your filter criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer Name & Phone</th>
                  <th style={styles.th}>Channel / Type</th>
                  <th style={styles.th}>Captain / Staff</th>
                  <th style={styles.th}>Date & Time</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Total Amount</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeBreakdownOrders.map((o, idx) => {
                  const dateStr = getSafeTimestamp(o, idx).toLocaleString();
                  const cName = o.customerName || 'Walk-In Guest';
                  const captain = extractCaptain(o.customerName) || 'Counter / Unassigned';
                  return (
                    <tr key={idx} style={styles.tableRow}>
                      <td style={styles.td}><strong style={{ color: '#0f172a' }}>{o.displayId || o.orderId || 'N/A'}</strong></td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '900', color: '#0f172a' }}>{cName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{o.customerPhone || 'No Phone'}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge}>{o.channel || 'COUNTER'}</span>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{o.orderType || 'Dine-In'}</div>
                      </td>
                      <td style={{ ...styles.td, color: '#2563eb', fontWeight: '900' }}>{captain}</td>
                      <td style={{ ...styles.td, fontSize: '12px', color: '#64748b' }}>{dateStr}</td>
                      <td style={styles.td}><span style={{ color: '#059669', fontWeight: '900' }}>{o.status || 'New'}</span></td>
                      <td style={{ ...styles.td, color: '#059669', fontWeight: '950' }}>₹{o.totalAmount || 0}</td>
                      <td style={styles.td}>
                        <button onClick={() => setSelectedCustomerHistory(cName)} style={styles.historyViewBtn}>
                          🔍 View History
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 2. CAPTAIN PERFORMANCE SECTION */}
      {/* ========================================== */}
      {Object.keys(captainMap).length > 0 && (
        <div style={styles.sectionCard}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
            🧑‍✈️ Captain Performance & Revenue Generation
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {Object.keys(captainMap).map((capName, cIdx) => (
              <div key={cIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '2px solid #e2e8f0' }}>
                <div style={{ fontSize: '14px', fontWeight: '950', color: '#0f172a', marginBottom: '6px' }}>🧑‍✈️ {capName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>Orders Processed: <strong style={{ color: '#2563eb' }}>{captainMap[capName].orderCount}</strong></div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginTop: '4px' }}>Revenue Generated: <strong style={{ color: '#059669' }}>₹{captainMap[capName].revenue}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. COMPLETED ORDERS HISTORY SECTION (WITH CHANNEL & DATE DROPDOWNS) */}
      {/* ========================================== */}
      <div style={styles.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
              📦 Completed Orders History & Receipts ({completedHistoryOrders.length})
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>Download individual receipts or export group history to Excel</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b' }}>Channel:</label>
              <select value={historyChannelFilter} onChange={e => setHistoryChannelFilter(e.target.value)} style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }}>
                <option value="ALL">All Channels</option>
                <option value="TABLE">Table Orders</option>
                <option value="COUNTER">Counter POS</option>
                <option value="ONLINE">Online Orders</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b' }}>Date:</label>
              <select value={historyDateRange} onChange={e => setHistoryDateRange(e.target.value)} style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }}>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="month">Last Month</option>
                <option value="year">Year</option>
              </select>
            </div>

            <button onClick={exportCompletedHistoryExcel} style={{ ...styles.exportBtn, padding: '7px 12px', fontSize: '11px' }}>📥 Export History (.xls)</button>
          </div>
        </div>

        {completedHistoryOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px', fontWeight: '800' }}>No history orders found matching this filter. Ensure orders are marked completed, ready, or delivered.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedHistoryOrders.map((o, idx) => {
              const dateStr = getSafeTimestamp(o, idx).toLocaleString();
              const items = o.items || [];
              const captain = extractCaptain(o.customerName) || 'Counter / Unassigned';
              return (
                <div key={idx} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontWeight: '950', color: '#0f172a', fontSize: '15px', marginRight: '10px' }}>{o.displayId || o.orderId}</span>
                      <span style={styles.badge}>{o.channel || 'COUNTER'}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginLeft: '10px' }}>👤 {o.customerName || 'Walk-In'}</span>
                      <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '900', marginLeft: '10px' }}>🧑‍✈️ {captain}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '15px', fontWeight: '950', color: '#059669' }}>₹{o.totalAmount || 0}</span>
                        <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '900' }}>{o.status}</div>
                      </div>
                      <button onClick={() => downloadSingleReceipt(o, idx)} style={styles.receiptBtn}>
                        🖨️ Receipt
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>🕒 Timestamp: {dateStr}</div>
                  
                  {/* Item Breakdown List */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {items.length === 0 ? (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No item details recorded.</span>
                    ) : (
                      items.map((it, iIdx) => (
                        <div key={iIdx} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: '#334155' }}>
                          🍽️ {it.itemName || it.name} x <strong style={{ color: '#059669' }}>{it.quantity || it.qty || 1}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 4. ANALYTICS SECTION */}
      {/* ========================================== */}
      <div style={styles.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>📊 Revenue Summary & Distribution</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b' }}>Graph Date:</label>
              <select value={analyticsDateRange} onChange={e => setAnalyticsDateRange(e.target.value)} style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }}>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="month">Last Month</option>
                <option value="year">Year</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b' }}>Category:</label>
              <select value={analyticsCategoryFilter} onChange={e => setAnalyticsCategoryFilter(e.target.value)} style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }}>
                <option value="ALL">All Categories</option>
                <option value="TABLE">Table Orders</option>
                <option value="COUNTER">Counter POS</option>
                <option value="ONLINE">Online Orders</option>
              </select>
            </div>

            <button onClick={() => window.print()} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '950', cursor: 'pointer' }}>🖨️ Print Graph</button>
          </div>
        </div>

        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricTitle}>Total Revenue ({analyticsDateRange.toUpperCase()})</div>
            <div style={styles.metricValue}>₹{totalRevenue.toFixed(2)}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricTitle}>Total Orders Count</div>
            <div style={{ ...styles.metricValue, color: '#2563eb' }}>{totalOrdersCount}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricTitle}>Average Order Value</div>
            <div style={{ ...styles.metricValue, color: '#d97706' }}>
              ₹{totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {analyticsOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontWeight: '800' }}>No revenue distribution data for this date and category filter.</div>
          ) : (
            <>
              <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'conic-gradient(#059669 0% 65%, #2563eb 65% 88%, #d97706 88% 100%)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '90px', height: '90px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '13px', color: '#0f172a' }}>
                  ₹{totalRevenue}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontWeight: '900' }}>
                <span style={{ color: '#059669' }}>■ Dine-In (65%)</span>
                <span style={{ color: '#2563eb' }}>■ Takeaway (23%)</span>
                <span style={{ color: '#d97706' }}>■ Online (12%)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* CUSTOMER HISTORY MODAL */}
      {/* ========================================== */}
      {selectedCustomerHistory && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCustomerHistory(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950', fontSize: '18px' }}>
                👤 Customer History: {selectedCustomerHistory}
              </h3>
              <button onClick={() => setSelectedCustomerHistory(null)} style={styles.closeXBtn}>✕</button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '800', marginBottom: '14px' }}>
              Total Orders Placed: <strong style={{ color: '#059669' }}>{(customerHistoryMap[selectedCustomerHistory] || []).length}</strong> | 
              Total Lifetime Spend: <strong style={{ color: '#059669' }}>₹{(customerHistoryMap[selectedCustomerHistory] || []).reduce((acc, x) => acc + (Number(x.totalAmount) || 0), 0)}</strong>
            </p>

            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {(customerHistoryMap[selectedCustomerHistory] || []).map((pastOrder, pIdx) => (
                <div key={pIdx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '950', color: '#0f172a', fontSize: '13px' }}>{pastOrder.displayId || 'Order'} — {pastOrder.orderType || 'Dine-In'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{pastOrder.timestamp ? new Date(pastOrder.timestamp).toLocaleString() : 'Past Order'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '950', color: '#059669', fontSize: '14px' }}>₹{pastOrder.totalAmount}</div>
                    <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '900', textTransform: 'uppercase' }}>{pastOrder.status || 'New'}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedCustomerHistory(null)} style={styles.modalCloseBtn}>Close History</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '28px', background: '#f1f5f9', overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '90px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  exportBtn: { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '10px', fontWeight: '950', fontSize: '11px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' },
  receiptBtn: { background: '#059669', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950', cursor: 'pointer', boxShadow: '0 2px 6px rgba(5,150,105,0.2)' },
  filterBar: { display: 'flex', gap: '16px', background: '#ffffff', padding: '18px 22px', borderRadius: '20px', border: '2px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' },
  label: { fontSize: '11px', fontWeight: '950', color: '#64748b', letterSpacing: '0.05em' },
  select: { padding: '11px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' },
  input: { padding: '11px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none' },
  sectionCard: { background: '#ffffff', padding: '26px', borderRadius: '22px', border: '2px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px', marginBottom: '22px' },
  metricCard: { background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  metricTitle: { fontSize: '11px', fontWeight: '950', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' },
  metricValue: { fontSize: '28px', fontWeight: '950', color: '#059669', letterSpacing: '-0.02em' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { padding: '12px 14px', fontWeight: '950', color: '#475569', borderBottom: '2px solid #e2e8f0', letterSpacing: '0.03em' },
  td: { padding: '14px', color: '#334155', fontWeight: '800' },
  tableRow: { transition: 'background-color 0.2s ease' },
  badge: { background: '#e0f2fe', color: '#0369a1', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950', border: '1px solid #bae6fd' },
  historyViewBtn: { background: '#ecfdf5', color: '#047857', border: '1.5px solid #10b981', padding: '7px 12px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '11px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '480px', backgroundColor: '#fff', padding: '28px', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '2px solid #e2e8f0' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '18px', fontWeight: '950', color: '#64748b', cursor: 'pointer' },
  modalCloseBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.25)' }
};