import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ComplaintsModule() {
  const [complaints, setComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [channelFilter, setChannelFilter] = useState('All channels');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Complaint Form State
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
  }, []);

  const fetchComplaints = () => {
    fetch(`${API_BASE_URL}/api/v1/complaints`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setComplaints(data);
      })
      .catch(err => console.error("Error fetching complaints:", err));
  };

  const handleCreateComplaint = (e) => {
    e.preventDefault();
    const payload = {
      ...newComplaint,
      complaintId: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Open'
    };

    fetch(`${API_BASE_URL}/api/v1/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setIsModalOpen(false);
        fetchComplaints();
      })
      .catch(err => console.error("Error creating complaint:", err));
  };

  const updateStatus = (id, newStatus) => {
    fetch(`${API_BASE_URL}/api/v1/complaints/${id}/status?status=${newStatus}`, {
      method: 'PUT'
    }).then(() => fetchComplaints());
  };

  // Filtering Logic
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

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Bar with Search and + New Complaint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="🔍 Search by Order ID, Customer Name, or Mobile Number" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
        />
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#ff4757', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}
        >
          + New Complaint
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
        </select>

        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={styles.dateInput} />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={styles.dateInput} />
      </div>

      {/* Complaints Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredComplaints.map((c, idx) => {
          const statusColor = c.status === 'Closed' ? '#10b981' : c.status === 'Following Up' ? '#f59e0b' : '#ef4444';
          return (
            <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>{c.complaintId}</span>
                  <h4 style={{ margin: '2px 0', fontSize: '16px', fontWeight: '950', color: '#0f172a' }}>{c.orderId}</h4>
                </div>
                <select 
                  value={c.status} 
                  onChange={e => updateStatus(c.id, e.target.value)}
                  style={{ fontSize: '11px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${statusColor}`, color: statusColor, background: '#fff', cursor: 'pointer' }}
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
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '900' }}>{c.complaintType}</span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{c.channel}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <span>🕒 Recently</span>
                <span>💬 {c.notes ? '1 note' : 'No notes'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for + New Complaint */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3>Create New Complaint</h3>
            <form onSubmit={handleCreateComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <input type="text" placeholder="Order ID (e.g. KO01/002978)" required value={newComplaint.orderId} onChange={e => setNewComplaint({...newComplaint, orderId: e.target.value})} style={styles.input} />
              <input type="text" placeholder="Customer Name" required value={newComplaint.customerName} onChange={e => setNewComplaint({...newComplaint, customerName: e.target.value})} style={styles.input} />
              <input type="text" placeholder="Customer Phone" value={newComplaint.customerPhone} onChange={e => setNewComplaint({...newComplaint, customerPhone: e.target.value})} style={styles.input} />
              
              <select value={newComplaint.complaintType} onChange={e => setNewComplaint({...newComplaint, complaintType: e.target.value})} style={styles.input}>
                <option>Missing Item</option>
                <option>Wrong Item</option>
                <option>Late Delivery</option>
                <option>Food Quality</option>
                <option>Packaging</option>
                <option>Payment Issue</option>
                <option>Other</option>
              </select>

              <select value={newComplaint.channel} onChange={e => setNewComplaint({...newComplaint, channel: e.target.value})} style={styles.input}>
                <option>WhatsApp Ordering</option>
                <option>Web Ordering</option>
                <option>Zomato</option>
                <option>Swiggy</option>
              </select>

              <textarea placeholder="Notes / Description..." value={newComplaint.notes} onChange={e => setNewComplaint({...newComplaint, notes: e.target.value})} style={{...styles.input, height: '80px'}} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#059669', color: '#fff', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>Save Complaint</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: '#cbd5e1', color: '#0f172a', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  select: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none' },
  dateInput: { padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '400px', background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }
};