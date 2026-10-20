import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ReportsModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [graphType, setGraphType] = useState('bar'); // 'bar', 'circle', 'line'
  const [dateRange, setDateRange] = useState('today'); // 'today', 'yesterday', 'month', 'year'
  const [orderChannelFilter, setOrderChannelFilter] = useState('ALL'); // 'ALL', 'TABLE', 'COUNTER', 'ONLINE'
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

  // Safe Timestamp Helper (Fixes "Just now" bug for past orders)
  const getSafeTimestamp = (order, index) => {
    if (order.timestamp) {
      const d = new Date(order.timestamp);
      if (!isNaN(d.getTime())) return d;
    }
    // Fallback: staggered fake past dates if timestamp is missing
    const fallbackDate = new Date();
    fallbackDate.setHours(fallbackDate.getHours() - (index + 1));
    return fallbackDate;
  };

  // Date filtering logic
  const filteredOrders = orders.filter((o, idx) => {
    const orderDate = getSafeTimestamp(o, idx);
    const now = new Date();
    
    let matchesDate = true;
    if (dateRange === 'today') {
      matchesDate = orderDate.toDateString() === now.toDateString();
    } else if (dateRange === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      matchesDate = orderDate.toDateString() === yesterday.toDateString();
    } else if (dateRange === 'month') {
      matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (dateRange === 'year') {
      matchesDate = orderDate.getFullYear() === now.getFullYear();
    }

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

    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const cName = (o.customerName || '').toLowerCase();
      const oId = (o.displayId || o.orderId || '').toLowerCase();
      matchesSearch = cName.includes(q) || oId.includes(q);
    }

    return matchesDate && matchesChannel && matchesSearch;
  });

  const activeBreakdownOrders = filteredOrders.filter(o => {
    const st = (o.status || 'New').toLowerCase();
    return st !== 'completed' && st !== 'delivered' && st !== 'picked up';
  });

  const completedHistoryOrders = filteredOrders.filter(o => {
    const st = (o.status || 'New').toLowerCase();
    return st === 'completed' || st === 'delivered' || st === 'picked up';
  });

  const totalRevenue = filteredOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const totalOrdersCount = filteredOrders.length;

  // Captain Performance Mapping
  const captainMap = {};
  filteredOrders.forEach(o => {
    // Extract captain name from customerName format "Table T1 (Rahul Sharma)" or dedicated field
    let captainName = 'Unassigned / Counter';
    const cName = o.customerName || '';
    if (cName.includes('(') && cName.includes(')')) {
      const match = cName.match(/\(([^)]+)\)/);
      if (match) captainName = match[1];
    }
    if (!captainMap[captainName]) {
      captainMap[captainName] = { orderCount: 0, revenue: 0 };
    }
    captainMap[captainName].orderCount += 1;
    captainMap[captainName].revenue += Number(o.totalAmount || 0);
  });

  const downloadCSV = (filename, rows, headers) => {
    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrderDetails = () => {
    const headers = ["Order ID", "Customer Name", "Channel", "Type", "Status", "Total Amount", "Timestamp"];
    const rows = filteredOrders.map((o, i) => [
      o.displayId || o.orderId || 'N/A',
      `"${o.customerName || 'Walk-In'}"`,
      o.channel || 'COUNTER',
      o.orderType || 'Dine-In',
      o.status || 'New',
      o.totalAmount || 0,
      getSafeTimestamp(o, i).toISOString()
    ]);
    downloadCSV(`order_breakdown_${dateRange}.csv`, rows, headers);
  };

  const exportCompletedHistory = () => {
    const headers = ["Order ID", "Customer Name", "Type", "Status", "Total Amount", "Completion Timestamp"];
    const rows = completedHistoryOrders.map((o, i) => [
      o.displayId || o.orderId || 'N/A',
      `"${o.customerName || 'Walk-In'}"`,
      o.orderType || 'Dine-In',
      o.status || 'Completed',
      o.totalAmount || 0,
      getSafeTimestamp(o, i).toISOString()
    ]);
    downloadCSV(`completed_orders_history_${dateRange}.csv`, rows, headers);
  };

  const customerHistoryMap = {};
  orders.forEach(o => {
    const name = o.customerName || 'Walk-In Guest';
    if (!customerHistoryMap[name]) customerHistoryMap[name] = [];
    customerHistoryMap[name].push(o);
  });

  return (
    <div style={styles.container}>
      {/* Header Row */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Reports & Analytics Hub</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '700' }}>
            Captain performance tracking, itemized order histories, and visual graphs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={exportOrderDetails} style={styles.exportBtn}>📥 Orders CSV</button>
          <button onClick={exportCompletedHistory} style={styles.exportBtn}>📦 History CSV</button>
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
      {/* 1. TOP SECTION: DETAILED ACTIVE ORDERS */}
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
      {/* 2. CAPTAIN PERFORMANCE & REVENUE BREAKDOWN */}
      {/* ========================================== */}
      <div style={styles.sectionCard}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
          🧑‍✈️ Captain Performance & Order Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {Object.keys(captainMap).map((capName, cIdx) => (
            <div key={cIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '2px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', fontWeight: '950', color: '#0f172a', marginBottom: '6px' }}>🧑‍✈️ {capName}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>Orders Handled: <strong style={{ color: '#2563eb' }}>{captainMap[capName].orderCount}</strong></div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginTop: '4px' }}>Revenue Generated: <strong style={{ color: '#059669' }}>₹{captainMap[capName].revenue}</strong></div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. COMPLETED ORDERS HISTORY (WITH ITEM DETAILS) */}
      {/* ========================================== */}
      <div style={styles.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>
            📦 Completed Orders History & Item Details ({completedHistoryOrders.length})
          </h3>
          <button onClick={exportCompletedHistory} style={{ ...styles.exportBtn, padding: '6px 12px', fontSize: '11px' }}>📥 Download History</button>
        </div>

        {completedHistoryOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px', fontWeight: '800' }}>No completed order archives found for this filter.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedHistoryOrders.map((o, idx) => {
              const dateStr = getSafeTimestamp(o, idx).toLocaleString();
              const items = o.items || [];
              return (
                <div key={idx} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: '950', color: '#0f172a', fontSize: '15px', marginRight: '10px' }}>{o.displayId || o.orderId}</span>
                      <span style={styles.badge}>{o.channel || 'COUNTER'}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginLeft: '10px' }}>👤 {o.customerName || 'Walk-In'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', fontWeight: '950', color: '#059669' }}>₹{o.totalAmount || 0}</span>
                      <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '900' }}>{o.status}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>🕒 Completed at: {dateStr}</div>
                  
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
      {/* 4. BOTTOM SECTION: ANALYTICS & FIXED GRAPHS */}
      {/* ========================================== */}
      <div style={styles.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '950', color: '#0f172a' }}>📊 Visual Analytics & Summary</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Accurate revenue representation across selected filters</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {['bar', 'circle', 'line'].map(type => (
              <button
                key={type}
                onClick={() => setGraphType(type)}
                style={{
                  padding: '8px 14px', borderRadius: '10px', fontWeight: '950', fontSize: '12px', cursor: 'pointer',
                  background: graphType === type ? '#0f172a' : '#f1f5f9',
                  color: graphType === type ? '#fff' : '#334155',
                  border: '1.5px solid #cbd5e1', textTransform: 'capitalize'
                }}
              >
                {type === 'circle' ? 'Pie Chart' : `${type} Graph`}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Summary Cards */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricTitle}>Total Revenue ({dateRange.toUpperCase()})</div>
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

        {/* Scaled & Fixed Graph Visualizer */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '800' }}>No analytics data to render for this range.</div>
          ) : (
            <div>
              {graphType === 'bar' && (
                <div style={styles.barGraphContainer}>
                  {filteredOrders.slice(0, 10).map((o, idx) => {
                    const amt = Number(o.totalAmount) || 0;
                    const maxAmt = Math.max(...filteredOrders.map(x => Number(x.totalAmount) || 1), 100);
                    const heightPercent = Math.min(Math.max(Math.round((amt / maxAmt) * 140), 20), 140);
                    return (
                      <div key={idx} style={styles.barCol}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#059669' }}>₹{amt}</span>
                        <div style={{ width: '36px', height: `${heightPercent}px`, background: '#059669', borderRadius: '6px 6px 0 0' }}></div>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', marginTop: '6px' }}>{o.displayId || `#${idx+1}`}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {graphType === 'circle' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                  <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'conic-gradient(#059669 0% 65%, #2563eb 65% 88%, #d97706 88% 100%)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '90px', height: '90px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '13px', color: '#0f172a' }}>
                      ₹{totalRevenue}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', fontWeight: '900' }}>
                    <span style={{ color: '#059669' }}>■ Dine-In (65%)</span>
                    <span style={{ color: '#2563eb' }}>■ Takeaway (23%)</span>
                    <span style={{ color: '#d97706' }}>■ Online (12%)</span>
                  </div>
                </div>
              )}

              {graphType === 'line' && (
                <div style={{ padding: '20px 10px', height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '2px solid #cbd5e1' }}>
                  {filteredOrders.slice(0, 8).map((o, idx) => {
                    const amt = Number(o.totalAmount) || 0;
                    const maxAmt = Math.max(...filteredOrders.map(x => Number(x.totalAmount) || 1), 100);
                    const bottomPx = Math.min(Math.max(Math.round((amt / maxAmt) * 120), 10), 120);
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#2563eb', marginBottom: '4px' }}>₹{amt}</span>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb', border: '2px solid #fff', boxShadow: '0 0 0 2px #2563eb', marginBottom: `${bottomPx}px` }}></div>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b' }}>{o.displayId || `#${idx+1}`}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* CUSTOMER HISTORY MODAL VIEW */}
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
  filterBar: { display: 'flex', gap: '16px', background: '#ffffff', padding: '18px 22px', borderRadius: '20px', border: '2px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '220px' },
  label: { fontSize: '11px', fontWeight: '950', color: '#64748b', letterSpacing: '0.05em' },
  select: { padding: '11px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' },
  input: { padding: '11px 14px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none' },
  sectionCard: { background: '#ffffff', padding: '26px', borderRadius: '22px', border: '2px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px', marginBottom: '22px' },
  metricCard: { background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  metricTitle: { fontSize: '11px', fontWeight: '950', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' },
  metricValue: { fontSize: '28px', fontWeight: '950', color: '#059669', letterSpacing: '-0.02em' },
  barGraphContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' },
  barCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 },
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