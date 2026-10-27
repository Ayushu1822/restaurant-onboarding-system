import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ComplaintsModule() {
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [channelFilter, setChannelFilter] = useState('All channels');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      restaurantEmail: userEmail // ✅ Tied strictly to logged-in account
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

  // Filter orders based on user typing in the search/select box
  const matchingOrdersForDropdown = orders.filter(o => {
    const q = orderSearchQuery.toLowerCase().trim();
    const oId = (o.displayId || o.orderId || '').toLowerCase();
    const cName = (o.customerName || '').toLowerCase();
    const cPhone = (o.customerPhone || '').toLowerCase();
    // If query is empty, show top recent orders, otherwise filter by match
    if (!q) return true;
    return oId.includes(q) || cName.includes(q) || cPhone.includes(q);
  });

  return (
    <div style={{ padding: '28px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 Search by Order ID, Customer Name, or Mobile Number..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
        />
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#ff4757', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '950', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,71,87,0.2)' }}
        >
          + New Complaint
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', background: '#fff', padding: '16px', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
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
      </div>

      {/* Complaints Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredComplaints.map((c, idx) => {
          const statusColor = c.status === 'Closed' ? '#10b981' : c.status === 'Following Up' ? '#f59e0b' : '#ef4444';
          return (
            <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>{c.complaintId}</span>
                  <h4 style={{ margin: '2px 0', fontSize: '16px', fontWeight: '950', color: '#0f172a' }}>{c.orderId}</h4>
                </div>
                <select 
                  value={c.status} 
                  onChange={e => updateStatus(c.id, e.target.value)}
                  style={{ fontSize: '11px', fontWeight: '950', padding: '5px 10px', borderRadius: '8px', border: `1.5px solid ${statusColor}`, color: statusColor, background: '#fff', cursor: 'pointer' }}
                >
                  <option value="Open">Open</option>
                  <option value="Following Up">Following Up</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div style={{ fontSize: '13px', color: '#334155', fontWeight: '800', marginBottom: '12px' }}>
                👤 {c.customerName || 'Guest'} {c.customerPhone ? `• ${c.customerPhone}` : ''}
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '950' }}>{c.complaintType}</span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{c.channel}</span>
              </div>

              {c.notes && (
                <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                  💬 {c.notes}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontWeight: '800' }}>
                <span>🕒 Logged</span>
                <span style={{ color: statusColor }}>● {c.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for + New Complaint */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950' }}>Create New Complaint</h3>
              <button onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }} style={styles.closeXBtn}>✕</button>
            </div>

            <form onSubmit={handleCreateComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Order Search & Select Dropdown + Manual Fallback */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '4px' }}>SEARCH ORDER FROM DB OR TYPE MANUALLY</label>
                <input 
                  type="text" 
                  placeholder="Select from dropdown or type Order ID / Name..." 
                  value={orderSearchQuery}
                  onFocus={() => setShowOrderDropdown(true)}
                  onChange={e => {
                    setOrderSearchQuery(e.target.value);
                    setShowOrderDropdown(true);
                    // Allow manual typing fallback into orderId
                    setNewComplaint(prev => ({ ...prev, orderId: e.target.value }));
                  }}
                  style={styles.input}
                />
                
                {showOrderDropdown && matchingOrdersForDropdown.length > 0 && (
                  <div style={styles.dropdownResults}>
                    <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
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
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '4px' }}>ORDER ID *</label>
                <input type="text" placeholder="e.g. KO01/002978" required value={newComplaint.orderId} onChange={e => setNewComplaint({...newComplaint, orderId: e.target.value})} style={styles.input} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '4px' }}>CUSTOMER NAME *</label>
                <input type="text" placeholder="Customer Name" required value={newComplaint.customerName} onChange={e => setNewComplaint({...newComplaint, customerName: e.target.value})} style={styles.input} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '4px' }}>PHONE NUMBER</label>
                <input type="text" placeholder="Phone Number" value={newComplaint.customerPhone} onChange={e => setNewComplaint({...newComplaint, customerPhone: e.target.value})} style={styles.input} />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '4px' }}>COMPLAINT TYPE</label>
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
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '4px' }}>CHANNEL</label>
                <select value={newComplaint.channel} onChange={e => setNewComplaint({...newComplaint, channel: e.target.value})} style={styles.input}>
                  <option>WhatsApp Ordering</option>
                  <option>Web Ordering</option>
                  <option>Zomato</option>
                  <option>Swiggy</option>
                  <option>Counter</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '4px' }}>NOTES / DESCRIPTION</label>
                <textarea placeholder="Write complaint details here..." value={newComplaint.notes} onChange={e => setNewComplaint({...newComplaint, notes: e.target.value})} style={{...styles.input, height: '70px'}} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#059669', color: '#fff', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>Save Complaint</button>
                <button type="button" onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }} style={{ flex: 1, background: '#cbd5e1', color: '#0f172a', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  select: { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', fontWeight: '800' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '440px', background: '#fff', padding: '26px', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: '950', color: '#64748b', cursor: 'pointer' },
  dropdownResults: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', zIndex: 10000, maxHeight: '180px', overflowY: 'auto', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
  dropdownItem: { padding: '9px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: '800', color: '#1e293b' }
};