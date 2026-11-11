import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ComplaintsModule() {
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [channelFilter, setChannelFilter] = useState('All channels');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Comment Modal State
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activeComplaintForComment, setActiveComplaintForComment] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const [selectedOrderToLink, setSelectedOrderToLink] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);

  const [newComplaint, setNewComplaint] = useState({
    orderId: '',
    customerName: '',
    customerPhone: '',
    complaintType: 'Missing Item',
    channel: 'WhatsApp Ordering',
    notes: ''
  });

  useEffect(() => {
    fetchComplaints();
    fetchOrders();
  }, []);

  const fetchComplaints = () => {
    const userEmail = localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/complaints?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setComplaints(data);
      })
      .catch(err => console.error("Error fetching complaints:", err));
  };

  const fetchOrders = () => {
    const userEmail = localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/orders?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(err => console.error("Error fetching orders for linking:", err));
  };

  const handleSelectOrderForComplaint = (order) => {
    setSelectedOrderToLink(order);
    const resolvedOrderId = order.displayId || order.orderId || 'N/A';
    const resolvedName = order.customerName || 'Valued Guest';
    const resolvedPhone = order.customerPhone || '';
    const resolvedChannel = order.channel || 'WhatsApp Ordering';

    setNewComplaint(prev => ({
      ...prev,
      orderId: resolvedOrderId,
      customerName: resolvedName,
      customerPhone: resolvedPhone,
      channel: resolvedChannel
    }));
    setOrderSearchQuery(`${resolvedOrderId} — ${resolvedName} (${resolvedPhone || 'No Phone'})`);
    setShowOrderDropdown(false);
  };

  const handleCreateComplaint = (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem('userEmail') || '';
    const payload = {
      ...newComplaint,
      complaintId: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Open',
      restaurantEmail: userEmail
    };

    fetch(`${API_BASE_URL}/api/v1/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setIsModalOpen(false);
        setSelectedOrderToLink(null);
        setOrderSearchQuery('');
        setNewComplaint({
          orderId: '',
          customerName: '',
          customerPhone: '',
          complaintType: 'Missing Item',
          channel: 'WhatsApp Ordering',
          notes: ''
        });
        fetchComplaints();
      })
      .catch(err => console.error("Error creating complaint:", err));
  };

  const updateStatus = (id, newStatus) => {
    fetch(`${API_BASE_URL}/api/v1/complaints/${id}/status?status=${newStatus}`, {
      method: 'PUT'
    }).then(() => fetchComplaints());
  };

  // Add Comment / Note to a complaint
  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (!activeComplaintForComment || !newCommentText.trim()) return;

    const existingNotes = activeComplaintForComment.notes || '';
    const timestampTag = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]:`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${timestampTag} ${newCommentText.trim()}` : `${timestampTag} ${newCommentText.trim()}`;

    // Update via backend payload or notes field update endpoint if available, keeping schema safe
    const userEmail = localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...activeComplaintForComment,
        notes: updatedNotes,
        restaurantEmail: userEmail
      })
    })
      .then(() => {
        setNewCommentText('');
        setCommentModalOpen(false);
        setActiveComplaintForComment(null);
        fetchComplaints();
      })
      .catch(err => console.error("Error saving comment:", err));
  };

  // Metrics calculations
  const totalCount = complaints.length;
  const openCount = complaints.filter(c => c.status === 'Open').length;
  const followingUpCount = complaints.filter(c => c.status === 'Following Up').length;
  const closedCount = complaints.filter(c => c.status === 'Closed').length;

  // Real Avg Resolution Time Calculation (in minutes) from closed tickets
  const calculateRealAvgResolution = () => {
    const closedList = complaints.filter(c => c.status === 'Closed' && c.timestamp);
    if (closedList.length === 0) return '0m';
    
    let totalMinutes = 0;
    const now = new Date();
    closedList.forEach(c => {
      const created = new Date(c.timestamp);
      const diffMs = now - created;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins > 0) totalMinutes += diffMins;
    });

    const avgMins = Math.round(totalMinutes / closedList.length);
    if (avgMins >= 60) {
      return `${(avgMins / 60).toFixed(1)}h`;
    }
    return `${avgMins}m`;
  };

  // Filter logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      (c.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerPhone || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All statuses' || c.status === statusFilter;
    const matchesType = typeFilter === 'All types' || c.complaintType === typeFilter;
    const matchesChannel = channelFilter === 'All channels' || c.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesType && matchesChannel;
  });

  const matchingOrdersForDropdown = orders.filter(o => {
    const q = orderSearchQuery.toLowerCase().trim();
    const oId = (o.displayId || o.orderId || '').toLowerCase();
    const cName = (o.customerName || '').toLowerCase();
    const cPhone = (o.customerPhone || '').toLowerCase();
    if (!q) return true;
    return oId.includes(q) || cName.includes(q) || cPhone.includes(q);
  });

  return (
    <div style={{ padding: '32px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Metric Cards Row (Improved UI) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={styles.metricCard}>
          <span style={styles.metricTitle}>TOTAL COMPLAINTS</span>
          <h2 style={styles.metricValue}>{totalCount}</h2>
        </div>
        <div style={styles.metricCard}>
          <span style={{ ...styles.metricTitle, color: '#ef4444' }}>OPEN</span>
          <h2 style={{ ...styles.metricValue, color: '#ef4444' }}>{openCount}</h2>
        </div>
        <div style={styles.metricCard}>
          <span style={{ ...styles.metricTitle, color: '#f59e0b' }}>FOLLOWING UP</span>
          <h2 style={{ ...styles.metricValue, color: '#f59e0b' }}>{followingUpCount}</h2>
        </div>
        <div style={styles.metricCard}>
          <span style={{ ...styles.metricTitle, color: '#10b981' }}>CLOSED</span>
          <h2 style={{ ...styles.metricValue, color: '#10b981' }}>{closedCount}</h2>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricTitle}>TODAY</span>
          <h2 style={styles.metricValue}>{totalCount}</h2>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricTitle}>AVG. RESOLUTION</span>
          <h2 style={{ ...styles.metricValue, fontSize: '22px', color: '#0284c7' }}>{calculateRealAvgResolution()}</h2>
        </div>
      </div>

      {/* Top Search Bar & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <input 
            type="text" 
            placeholder="🔍 Search by Order ID, Customer Name, or Mobile Number..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#ff4757', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: '950', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,71,87,0.25)', transition: 'all 0.2s' }}
        >
          + New Complaint
        </button>
      </div>

      {/* Filters Bar with Date Pickers */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap', background: '#fff', padding: '18px', borderRadius: '16px', border: '1.5px solid #e2e8f0', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.select}>
          <option>All statuses</option>
          <option>Open</option>
          <option>Following Up</option>
          <option>Closed</option>
        </select>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={styles.select}>
          <option>All types</option>
          <option>Missing Item</option>
          <option>Wrong Item</option>
          <option>Late Delivery</option>
          <option>Food Quality</option>
          <option>Packaging</option>
          <option>Payment Issue</option>
          <option>Other</option>
        </select>

        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} style={styles.select}>
          <option>All channels</option>
          <option>WhatsApp Ordering</option>
          <option>Web Ordering</option>
          <option>Zomato</option>
          <option>Swiggy</option>
          <option>Counter</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={styles.dateInput} />
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>to</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={styles.dateInput} />
        </div>
      </div>

      {/* Complaints Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
        {filteredComplaints.map((c, idx) => {
          const statusColor = c.status === 'Closed' ? '#10b981' : c.status === 'Following Up' ? '#f59e0b' : '#ef4444';
          return (
            <div key={idx} style={{ background: '#fff', padding: '22px', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 6px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>{c.complaintId}</span>
                    <h4 style={{ margin: '2px 0', fontSize: '16px', fontWeight: '950', color: '#0f172a' }}>{c.orderId}</h4>
                  </div>
                  <select 
                    value={c.status} 
                    onChange={e => updateStatus(c.id, e.target.value)}
                    style={{ fontSize: '11px', fontWeight: '950', padding: '6px 12px', borderRadius: '10px', border: `1.5px solid ${statusColor}`, color: statusColor, background: '#fff', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="Open">Open</option>
                    <option value="Following Up">Following Up</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div style={{ fontSize: '13px', color: '#334155', fontWeight: '800', marginBottom: '14px' }}>
                  👤 {c.customerName || 'Guest'} {c.customerPhone ? `• ${c.customerPhone}` : ''}
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950' }}>{c.complaintType}</span>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>{c.channel}</span>
                </div>

                {c.notes && (
                  <div style={{ fontSize: '12px', color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #e2e8f0', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                    💬 {c.notes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontWeight: '800' }}>
                <span>🕒 Recently logged</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: statusColor }}>● {c.status}</span>
                  {/* Interactive Comment Icon button */}
                  <button 
                    onClick={() => { setActiveComplaintForComment(c); setCommentModalOpen(true); }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Add / View Comments"
                  >
                    💬 {c.notes ? '1+' : '0'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for + New Complaint */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950' }}>Create New Complaint</h3>
              <button onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }} style={styles.closeXBtn}>✕</button>
            </div>

            <form onSubmit={handleCreateComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>SEARCH ORDER FROM DB OR TYPE MANUALLY</label>
                <input 
                  type="text" 
                  placeholder="Select from dropdown or type Order ID / Name..." 
                  value={orderSearchQuery}
                  onFocus={() => setShowOrderDropdown(true)}
                  onChange={e => {
                    setOrderSearchQuery(e.target.value);
                    setShowOrderDropdown(true);
                    setNewComplaint(prev => ({ ...prev, orderId: e.target.value }));
                  }}
                  style={styles.input}
                />
                
                {showOrderDropdown && matchingOrdersForDropdown.length > 0 && (
                  <div style={styles.dropdownResults}>
                    <div style={{ padding: '8px 12px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      RECENT ORDERS FROM DATABASE (CLICK TO AUTO-FILL)
                    </div>
                    {matchingOrdersForDropdown.map((ord, oIdx) => (
                      <div 
                        key={oIdx} 
                        onClick={() => handleSelectOrderForComplaint(ord)}
                        style={styles.dropdownItem}
                      >
                        <strong>{ord.displayId || ord.orderId}</strong> — {ord.customerName} ({ord.customerPhone || 'No Phone'}) · ₹{ord.totalAmount || 0}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>ORDER ID *</label>
                <input type="text" placeholder="e.g. KO01/002978" required value={newComplaint.orderId} onChange={e => setNewComplaint({...newComplaint, orderId: e.target.value})} style={styles.input} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>CUSTOMER NAME *</label>
                <input type="text" placeholder="Customer Name" required value={newComplaint.customerName} onChange={e => setNewComplaint({...newComplaint, customerName: e.target.value})} style={styles.input} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>PHONE NUMBER</label>
                <input type="text" placeholder="Phone Number" value={newComplaint.customerPhone} onChange={e => setNewComplaint({...newComplaint, customerPhone: e.target.value})} style={styles.input} />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>COMPLAINT TYPE</label>
                <select value={newComplaint.complaintType} onChange={e => setNewComplaint({...newComplaint, complaintType: e.target.value})} style={styles.input}>
                  <option>Missing Item</option>
                  <option>Wrong Item</option>
                  <option>Late Delivery</option>
                  <option>Food Quality</option>
                  <option>Packaging</option>
                  <option>Payment Issue</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>CHANNEL</label>
                <select value={newComplaint.channel} onChange={e => setNewComplaint({...newComplaint, channel: e.target.value})} style={styles.input}>
                  <option>WhatsApp Ordering</option>
                  <option>Web Ordering</option>
                  <option>Zomato</option>
                  <option>Swiggy</option>
                  <option>Counter</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>NOTES / DESCRIPTION</label>
                <textarea placeholder="Write complaint details here..." value={newComplaint.notes} onChange={e => setNewComplaint({...newComplaint, notes: e.target.value})} style={{...styles.input, height: '80px'}} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" style={{ flex: 1, background: '#059669', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: 'pointer' }}>Save Complaint</button>
                <button type="button" onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }} style={{ flex: 1, background: '#e2e8f0', color: '#0f172a', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Comments / Viewing Notes */}
      {commentModalOpen && activeComplaintForComment && (
        <div style={styles.modalOverlay} onClick={() => { setCommentModalOpen(false); setActiveComplaintForComment(null); }}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950' }}>Complaint Notes & Comments</h3>
              <button onClick={() => { setCommentModalOpen(false); setActiveComplaintForComment(null); }} style={styles.closeXBtn}>✕</button>
            </div>

            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', fontWeight: '800' }}>
              Order: <strong>{activeComplaintForComment.orderId}</strong> ({activeComplaintForComment.customerName})
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', maxHeight: '160px', overflowY: 'auto', marginBottom: '16px', whiteSpace: 'pre-line', fontSize: '13px', color: '#334155', fontWeight: '700' }}>
              {activeComplaintForComment.notes ? activeComplaintForComment.notes : 'No previous notes or comments recorded for this complaint.'}
            </div>

            <form onSubmit={handleAddCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>ADD NEW COMMENT / FOLLOW-UP NOTE</label>
                <textarea 
                  placeholder="Type comment or closing note here..." 
                  value={newCommentText} 
                  onChange={e => setNewCommentText(e.target.value)} 
                  style={{ ...styles.input, height: '80px' }} 
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, background: '#0284c7', color: '#fff', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>Add Comment</button>
                <button type="button" onClick={() => { setCommentModalOpen(false); setActiveComplaintForComment(null); }} style={{ flex: 1, background: '#e2e8f0', color: '#0f172a', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  metricCard: { background: '#fff', padding: '18px 16px', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' },
  metricTitle: { fontSize: '10px', fontWeight: '950', color: '#64748b', letterSpacing: '0.5px' },
  metricValue: { margin: 0, fontSize: '26px', fontWeight: '950', color: '#0f172a' },
  select: { padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' },
  dateInput: { padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '12px', fontWeight: '800', background: '#f8fafc', outline: 'none', color: '#334155' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', fontWeight: '800' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '460px', background: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: '950', color: '#64748b', cursor: 'pointer' },
  dropdownResults: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '10px', zIndex: 10000, maxHeight: '190px', overflowY: 'auto', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
  dropdownItem: { padding: '10px 14px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: '800', color: '#1e293b' }
};