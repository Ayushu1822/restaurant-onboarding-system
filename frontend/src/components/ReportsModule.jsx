import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ReportsModule({ orders: parentOrders }) {
  const [orders, setOrders] = useState(parentOrders || []);
  const [closedComplaints, setClosedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState('today');
  const [orderChannelFilter, setOrderChannelFilter] = useState('ALL');
  const [selectedCaptainFilter, setSelectedCaptainFilter] = useState('ALL');
  const [historyDateRange, setHistoryDateRange] = useState('today');
  const [historyChannelFilter, setHistoryChannelFilter] = useState('ALL');
  const [analyticsDateRange, setAnalyticsDateRange] = useState('today');
  const [analyticsCategoryFilter, setAnalyticsCategoryFilter] = useState('ALL');

  // Captain Specific Date Filter State
  const [captainDateRange, setCaptainDateRange] = useState('today');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [selectedCaptainDetails, setSelectedCaptainDetails] = useState(null);

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

  // Captain Map filtered by Captain Date Range Dropdown
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

      <div style={styles.headerRow}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '950', color: '#0f172a', margin: 0 }}>Reports & Analytics Hub</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '700' }}>
            Real-time kitchen synced order histories, captain performance breakdown, and closed complaints archive
          </p>
        </div>
        <div>
          <button onClick={() => window.print()} style={styles.exportBtn}>🖨️ Print Report</button>
        </div>
      </div>

      <div className="printable-report-area" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
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
            <label style={styles.label}>📂 Category</label>
            <select value={orderChannelFilter} onChange={e => setOrderChannelFilter(e.target.value)} style={styles.select}>
              <option value="ALL">All Orders</option>
              <option value="TABLE">Table Orders</option>
              <option value="COUNTER">Counter POS</option>
              <option value="ONLINE">Online Orders</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>🧑‍✈️ Captain</label>
            <select value={selectedCaptainFilter} onChange={e => setSelectedCaptainFilter(e.target.value)} style={styles.select}>
              {allCaptains.map((cap, cIdx) => (
                <option key={cIdx} value={cap}>{cap === 'ALL' ? 'All Captains' : cap}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>📅 Date Range</label>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={styles.select}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* ========================================== */}
        {/* CAPTAIN PERFORMANCE SECTION WITH DATE FILTER */}
        {/* ========================================== */}
        <div style={styles.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
              🧑‍✈️ Captain Performance & Revenue Generation (Click any captain for full order details)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b' }}>Captain Date:</label>
              <select value={captainDateRange} onChange={e => setCaptainDateRange(e.target.value)} style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }}>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {Object.keys(captainMap).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '25px', color: '#94a3b8', fontWeight: '800' }}>No captain orders found for this date range.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {Object.keys(captainMap).map((capName, cIdx) => (
                <div 
                  key={cIdx} 
                  onClick={() => setSelectedCaptainDetails({ name: capName, orders: captainMap[capName].orders })}
                  style={styles.captainCard}
                >
                  <div style={{ fontSize: '15px', fontWeight: '950', color: '#0f172a', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🧑‍✈️ {capName}</span>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '900' }}>View Orders ›</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>Total Orders: <strong style={{ color: '#2563eb' }}>{captainMap[capName].orderCount}</strong></div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginTop: '4px' }}>Total Revenue: <strong style={{ color: '#059669' }}>₹{captainMap[capName].revenue}</strong></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 1. ACTIVE ORDERS */}
        <div style={styles.sectionCard}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
            📋 Detailed Active Orders & Customer Breakdown ({activeBreakdownOrders.length})
          </h3>
          {activeBreakdownOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontWeight: '800' }}>No active orders found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Channel</th>
                    <th style={styles.th}>Captain</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBreakdownOrders.map((o, idx) => (
                    <tr key={idx} style={styles.tableRow}>
                      <td style={styles.td}><strong>{o.displayId || o.orderId}</strong></td>
                      <td style={styles.td}>{o.customerName || 'Walk-In'}</td>
                      <td style={styles.td}><span style={styles.badge}>{o.channel || 'COUNTER'}</span></td>
                      <td style={{ ...styles.td, color: '#2563eb', fontWeight: '900' }}>{extractCaptain(o.customerName) || 'Unassigned'}</td>
                      <td style={{ ...styles.td, color: '#059669', fontWeight: '900' }}>{o.status || 'New'}</td>
                      <td style={{ ...styles.td, fontWeight: '950' }}>₹{o.totalAmount || 0}</td>
                      <td style={styles.td}>
                        <button onClick={() => setSelectedCustomerHistory(o.customerName)} style={styles.historyViewBtn}>🔍 History</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2. COMPLETED ORDERS HISTORY */}
        <div style={styles.sectionCard}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
            📦 Completed Orders History Archive ({completedHistoryOrders.length})
          </h3>
          {completedHistoryOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontWeight: '800' }}>No completed orders in history.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedHistoryOrders.map((o, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '950', color: '#0f172a' }}>{o.displayId || o.orderId}</span>
                    <span style={styles.badge}>{o.channel || 'COUNTER'}</span>
                    <span style={{ fontSize: '12px', fontWeight: '800' }}>👤 {o.customerName || 'Walk-In'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontWeight: '950', color: '#059669' }}>₹{o.totalAmount || 0}</span>
                    <button onClick={() => printSingleReceipt(o, idx)} style={styles.receiptBtn}>🖨️ Receipt</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. CLOSED COMPLAINTS ARCHIVE */}
        <div style={styles.sectionCard}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
            ✅ Closed & Resolved Complaints Archive ({closedComplaints.length})
          </h3>
          {closedComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontWeight: '800' }}>No closed complaints found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {closedComplaints.map((c, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '950', color: '#0f172a' }}>{c.complaintId}</span>
                    <span style={styles.badge}>{c.orderId}</span>
                    <span style={{ fontSize: '12px', fontWeight: '800' }}>👤 {c.customerName || 'Guest'}</span>
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '900' }}>{c.complaintType}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '950', textTransform: 'uppercase' }}>● Closed</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ========================================== */}
      {/* CAPTAIN DETAILED ORDERS MODAL */}
      {/* ========================================== */}
      {selectedCaptainDetails && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCaptainDetails(null)}>
          <div style={styles.modalLargeCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950', fontSize: '18px' }}>
                🧑‍✈️ Captain Details: {selectedCaptainDetails.name} ({selectedCaptainDetails.orders.length} Orders)
              </h3>
              <button onClick={() => setSelectedCaptainDetails(null)} style={styles.closeXBtn}>✕</button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {selectedCaptainDetails.orders.map((ord, oIdx) => (
                <div key={oIdx} style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '950', color: '#0f172a', fontSize: '14px' }}>{ord.displayId || ord.orderId || 'Order'}</div>
                    <div style={{ fontSize: '12px', color: '#334155', fontWeight: '800', marginTop: '2px' }}>
                      👤 {ord.customerName || 'Walk-In'} {ord.customerPhone ? `• 📞 ${ord.customerPhone}` : ''}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginTop: '2px' }}>
                      Status: <span style={{ color: '#059669', fontWeight: '900' }}>{ord.status || 'Completed'}</span> | Channel: {ord.channel || 'COUNTER'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '950', color: '#059669', fontSize: '16px' }}>₹{ord.totalAmount || 0}</div>
                    <button onClick={() => printSingleReceipt(ord, oIdx)} style={{ ...styles.receiptBtn, marginTop: '6px' }}>🖨️ Receipt</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedCaptainDetails(null)} style={styles.modalCloseBtn}>Close Captain View</button>
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
                <div key={pIdx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '950', color: '#0f172a' }}>{pastOrder.displayId || 'Order'}</div>
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
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '28px', background: '#f1f5f9', overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '90px', fontFamily: 'system-ui, sans-serif' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  exportBtn: { background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '950', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.2)' },
  receiptBtn: { background: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '950', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '16px', background: '#ffffff', padding: '18px 22px', borderRadius: '20px', border: '1.5px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' },
  label: { fontSize: '11px', fontWeight: '950', color: '#64748b' },
  select: { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' },
  input: { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none' },
  sectionCard: { background: '#ffffff', padding: '26px', borderRadius: '20px', border: '1.5px solid #e2e8f0', marginBottom: '24px' },
  captainCard: { background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { padding: '12px 14px', fontWeight: '950', color: '#475569', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '14px', color: '#334155', fontWeight: '800' },
  tableRow: { transition: 'background-color 0.2s ease' },
  badge: { background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950', border: '1.5px solid #bae6fd' },
  historyViewBtn: { background: '#ecfdf5', color: '#047857', border: '1.5px solid #10b981', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '11px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '460px', backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1.5px solid #e2e8f0' },
  modalLargeCard: { width: '600px', backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1.5px solid #e2e8f0', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: '950', color: '#64748b', cursor: 'pointer' },
  modalCloseBtn: { width: '100%', padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }
};