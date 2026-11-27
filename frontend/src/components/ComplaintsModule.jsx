import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';


const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  'http://localhost:8080'
).replace(/\/$/, '');

/* =====================================================================
   UI STYLESHEET  (hover · animation · responsive)
   Colors are the same ones this screen already used. The ring animation
   picks up each card's own status color through the --ring variable.
   Nothing in here touches logic.
   ===================================================================== */

const UI_CSS = `
@property --cm-angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes cm-spin{to{--cm-angle:360deg}}
@keyframes cm-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cm-fade{from{opacity:0}to{opacity:1}}
@keyframes cm-pop{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}
@keyframes cm-sheet{from{transform:translateY(100%)}to{transform:none}}
@keyframes cm-numpop{0%{transform:scale(.8);opacity:.3}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes cm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cm-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes cm-drop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}

/* ---------- entrance (only fades/slides in, never blocks hover transforms) ---------- */
.cm-rise{animation:cm-rise .5s cubic-bezier(.2,.7,.2,1) backwards}
.cm-num{display:inline-block;animation:cm-numpop .45s ease}

/* ---------- cards: lift + animated border in the card's own status color ---------- */
.cm-card,.cm-metric{position:relative;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.cm-card::before,.cm-metric::before{
  content:'';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;pointer-events:none;z-index:2;
  background:conic-gradient(from var(--cm-angle),
    transparent 0%,transparent 45%,
    var(--ring,#ff4757) 66%,#ffffff 76%,var(--ring,#ff4757) 88%,transparent 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  mask-composite:exclude;
  opacity:0;transition:opacity .35s ease;animation:cm-spin 3.2s linear infinite}
.cm-card:hover::before,.cm-metric:hover::before{opacity:1}
.cm-card:hover{transform:translateY(-4px);box-shadow:0 20px 38px -20px rgba(15,23,42,.38) !important}
.cm-metric:hover{transform:translateY(-3px);box-shadow:0 14px 28px -16px rgba(15,23,42,.32) !important}

/* ---------- fields ---------- */
.cm-root input:not(:disabled),.cm-root select,.cm-root textarea{transition:border-color .2s ease,box-shadow .2s ease,background-color .2s ease}
.cm-root input:not(:disabled):hover,.cm-root select:hover,.cm-root textarea:hover{border-color:#94a3b8 !important}
.cm-root input:focus,.cm-root select:focus,.cm-root textarea:focus{border-color:#0284c7 !important;box-shadow:0 0 0 4px rgba(2,132,199,.15);background-color:#fff !important}

/* ---------- buttons ---------- */
.cm-btn-primary{position:relative;overflow:hidden;transition:transform .15s ease,box-shadow .2s ease,filter .2s ease}
.cm-btn-primary::after{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-20deg);transition:left .6s ease}
.cm-btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 22px -6px rgba(255,71,87,.5) !important;filter:brightness(1.04)}
.cm-btn-primary:hover::after{left:130%}
.cm-btn-primary:active{transform:translateY(0);box-shadow:0 3px 8px rgba(255,71,87,.3) !important}

.cm-btn-save,.cm-btn-blue,.cm-btn-neutral{transition:transform .15s ease,box-shadow .2s ease,filter .2s ease}
.cm-btn-save:hover{transform:translateY(-2px);box-shadow:0 10px 20px -8px rgba(5,150,105,.55);filter:brightness(1.06)}
.cm-btn-blue:hover{transform:translateY(-2px);box-shadow:0 10px 20px -8px rgba(2,132,199,.55);filter:brightness(1.06)}
.cm-btn-neutral:hover{transform:translateY(-2px);box-shadow:0 8px 16px -10px rgba(15,23,42,.4);filter:brightness(.96)}
.cm-btn-save:active,.cm-btn-blue:active,.cm-btn-neutral:active{transform:translateY(0);box-shadow:none}

.cm-chip-btn{transition:background-color .2s ease,border-color .2s ease,transform .15s ease,box-shadow .2s ease}
.cm-chip-btn:hover{background:#e0f2fe !important;border-color:#7dd3fc !important;transform:translateY(-1px);box-shadow:0 6px 14px -8px rgba(2,132,199,.55)}
.cm-chip-btn:active{transform:translateY(0)}

.cm-close{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:50% !important;transition:background-color .2s ease,color .2s ease,transform .25s ease}
.cm-close:hover{background:#f1f5f9 !important;color:#ef4444 !important;transform:rotate(90deg)}

.cm-status{transition:box-shadow .2s ease,transform .15s ease}
.cm-status:hover{transform:translateY(-1px);box-shadow:0 6px 14px -8px rgba(15,23,42,.4)}

.cm-btn-primary:focus-visible,.cm-btn-save:focus-visible,.cm-btn-blue:focus-visible,.cm-btn-neutral:focus-visible,
.cm-chip-btn:focus-visible,.cm-close:focus-visible{outline:2px solid #0284c7;outline-offset:2px}

/* ---------- order dropdown ---------- */
.cm-dd{animation:cm-drop .18s ease}
.cm-dd-item{transition:background-color .15s ease,padding-left .15s ease,border-color .15s ease;border-left:3px solid transparent}
.cm-dd-item:hover{background:#f1f5f9;padding-left:18px !important;border-left-color:#0284c7}

/* ---------- modal ---------- */
.cm-overlay{animation:cm-fade .2s ease;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.cm-modal{animation:cm-pop .3s cubic-bezier(.2,.9,.3,1.15) backwards}

/* ---------- empty state ---------- */
.cm-bob{display:inline-block;animation:cm-bob 2.4s ease-in-out infinite}
.cm-pulse{animation:cm-pulse 1.6s ease-in-out infinite}

/* ---------- responsive ---------- */
@media (max-width:900px){
  .cm-root{padding:20px !important}
}
@media (max-width:640px){
  .cm-root{padding:14px !important}
  .cm-metrics{grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:10px !important;margin-bottom:18px !important}
  .cm-metric{padding:14px 12px !important}
  .cm-top{flex-direction:column;align-items:stretch !important}
  .cm-top .cm-btn-primary{width:100%}
  .cm-filters{padding:14px !important;gap:10px !important}
  .cm-filters select{flex:1 1 calc(50% - 10px);min-width:0}
  .cm-dates{margin-left:0 !important;width:100%}
  .cm-dates input{flex:1;min-width:0}
  .cm-card{padding:16px !important}
  .cm-card:hover{transform:none}
  .cm-overlay{align-items:flex-end !important;padding:0 !important}
  .cm-modal{max-width:none !important;border-radius:22px 22px 0 0 !important;padding:20px !important;max-height:92vh !important;animation:cm-sheet .3s cubic-bezier(.2,.8,.2,1)}
}

/* ---------- accessibility ---------- */
@media (prefers-reduced-motion:reduce){
  .cm-rise,.cm-num,.cm-bob,.cm-pulse,.cm-dd,.cm-overlay,.cm-modal,.cm-card::before,.cm-metric::before{animation:none !important}
  .cm-card,.cm-metric,.cm-btn-primary,.cm-btn-save,.cm-btn-blue,.cm-btn-neutral,.cm-chip-btn,.cm-close,.cm-status,.cm-dd-item{transition:none !important}
}
`;

function UiStyles() {
  return <style>{UI_CSS}</style>;
}

export default function ComplaintsModule() {
  const { t, translateDbValue, getLocalizedField } = useLanguage();
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
    const resolvedName = order.customerName || t('kdsWalkInGuest');
    const resolvedPhone = order.customerPhone || '';
    const resolvedChannel = order.channel || 'WhatsApp Ordering';

    setNewComplaint(prev => ({
      ...prev,
      orderId: resolvedOrderId,
      customerName: resolvedName,
      customerPhone: resolvedPhone,
      channel: resolvedChannel
    }));
    setOrderSearchQuery(`${resolvedOrderId} — ${resolvedName} (${resolvedPhone || t('cmNoPhone')})`);
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
    <div className="mu-root cm-root" style={{ padding: '32px', background: 'linear-gradient(180deg, #f1f5f9 0%, #e8edf4 100%)', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' }}>
      <UiStyles />

      {/* Top Metric Cards Row */}
      <div className="cm-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="cm-metric cm-rise" style={{ ...styles.metricCard, borderTop: '4px solid #64748b', '--ring': '#64748b', animationDelay: '0ms' }}>
          <span style={styles.metricTitle}>{t('cmTotalComplaintsMetric')}</span>
          <h2 key={totalCount} className="cm-num" style={styles.metricValue}>{totalCount}</h2>
        </div>
        <div className="cm-metric cm-rise" style={{ ...styles.metricCard, borderTop: '4px solid #ef4444', '--ring': '#ef4444', animationDelay: '50ms' }}>
          <span style={{ ...styles.metricTitle, color: '#ef4444' }}>{t('cmOpenUpper')}</span>
          <h2 key={openCount} className="cm-num" style={{ ...styles.metricValue, color: '#ef4444' }}>{openCount}</h2>
        </div>
        <div className="cm-metric cm-rise" style={{ ...styles.metricCard, borderTop: '4px solid #f59e0b', '--ring': '#f59e0b', animationDelay: '100ms' }}>
          <span style={{ ...styles.metricTitle, color: '#f59e0b' }}>{t('cmFollowingUpUpper')}</span>
          <h2 key={followingUpCount} className="cm-num" style={{ ...styles.metricValue, color: '#f59e0b' }}>{followingUpCount}</h2>
        </div>
        <div className="cm-metric cm-rise" style={{ ...styles.metricCard, borderTop: '4px solid #10b981', '--ring': '#10b981', animationDelay: '150ms' }}>
          <span style={{ ...styles.metricTitle, color: '#10b981' }}>{t('cmClosedUpper')}</span>
          <h2 key={closedCount} className="cm-num" style={{ ...styles.metricValue, color: '#10b981' }}>{closedCount}</h2>
        </div>
        <div className="cm-metric cm-rise" style={{ ...styles.metricCard, borderTop: '4px solid #94a3b8', '--ring': '#94a3b8', animationDelay: '200ms' }}>
          <span style={styles.metricTitle}>{t('todayTag')}</span>
          <h2 key={totalCount} className="cm-num" style={styles.metricValue}>{totalCount}</h2>
        </div>
        <div className="cm-metric cm-rise" style={{ ...styles.metricCard, borderTop: '4px solid #0284c7', '--ring': '#0284c7', animationDelay: '250ms' }}>
          <span style={styles.metricTitle}>{t('cmAvgResolutionMetric')}</span>
          <h2 className="cm-num" style={{ ...styles.metricValue, fontSize: '22px', color: '#0284c7' }}>{calculateRealAvgResolution()}</h2>
        </div>
      </div>

      {/* Top Search Bar & Action */}
      <div className="cm-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder={`🔍 ${t('cmSearchPlaceholder')}`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cm-btn-primary"
          style={{ background: 'linear-gradient(135deg, #ff4757, #ef2f45)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '950', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,71,87,0.25)' }}
        >
          + {t('cmNewComplaintBtn')}
        </button>
      </div>

      {/* Filters Bar with Date Pickers */}
      <div className="cm-filters" style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap', background: '#fff', padding: '18px', borderRadius: '18px', border: '1.5px solid #e2e8f0', alignItems: 'center', boxShadow: '0 2px 10px rgba(15,23,42,0.04)' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.select}>
          <option value="All statuses">{t('cmAllStatusesOpt')}</option>
          <option value="Open">{t('cmStatusOpen')}</option>
          <option value="Following Up">{t('cmStatusFollowingUp')}</option>
          <option value="Closed">{t('rpClosedLabel')}</option>
        </select>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={styles.select}>
          <option value="All types">{t('cmAllTypesOpt')}</option>
          <option value="Missing Item">{t('cmTypeMissingItem')}</option>
          <option value="Wrong Item">{t('cmTypeWrongItem')}</option>
          <option value="Late Delivery">{t('cmTypeLateDelivery')}</option>
          <option value="Food Quality">{t('cmTypeFoodQuality')}</option>
          <option value="Packaging">{t('cmTypePackaging')}</option>
          <option value="Payment Issue">{t('cmTypePaymentIssue')}</option>
          <option value="Other">{t('posGenderOther')}</option>
        </select>

        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} style={styles.select}>
          <option value="All channels">{t('cmAllChannelsOpt')}</option>
          <option value="WhatsApp Ordering">{t('cmChanWhatsApp')}</option>
          <option value="Web Ordering">{t('cmChanWeb')}</option>
          <option value="Zomato">Zomato</option>
          <option value="Swiggy">Swiggy</option>
          <option value="Counter">{t('posPayCash') === 'Cash' ? 'Counter' : translateDbValue('COUNTER')}</option>
        </select>

        <div className="cm-dates" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={styles.dateInput} />
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>{t('pmToWord')}</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={styles.dateInput} />
        </div>
      </div>

      {/* Complaints Cards Grid */}
      {filteredComplaints.length === 0 ? (
        <div className="cm-rise" style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontWeight: '800', background: '#fff', borderRadius: '18px', border: '2px dashed #cbd5e1' }}>
          <div className="cm-bob" style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
          <div>{t('cmNoPreviousNotes')}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '18px' }}>
          {filteredComplaints.map((c, idx) => {
            const statusColor = c.status === 'Closed' ? '#10b981' : c.status === 'Following Up' ? '#f59e0b' : '#ef4444';
            const cName = getLocalizedField(c, 'customerName') || c.customerName || t('rpGuestWord');
            const cNotes = getLocalizedField(c, 'notes') || c.notes;

            return (
              <div key={idx} className="cm-card cm-rise" style={{ background: '#fff', padding: '22px', borderRadius: '18px', border: '1.5px solid #e2e8f0', borderLeft: `5px solid ${statusColor}`, boxShadow: '0 6px 16px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '--ring': statusColor, animationDelay: `${Math.min(idx, 10) * 45}ms` }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>{c.complaintId}</span>
                      <h4 style={{ margin: '2px 0', fontSize: '16px', fontWeight: '950', color: '#0f172a', wordBreak: 'break-word' }}>{c.orderId}</h4>
                    </div>
                    <select
                      value={c.status}
                      onChange={e => updateStatus(c.id, e.target.value)}
                      className="cm-status"
                      style={{ fontSize: '11px', fontWeight: '950', padding: '6px 12px', borderRadius: '10px', border: `1.5px solid ${statusColor}`, color: statusColor, background: '#fff', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="Open">{t('cmStatusOpen')}</option>
                      <option value="Following Up">{t('cmStatusFollowingUp')}</option>
                      <option value="Closed">{t('rpClosedLabel')}</option>
                    </select>
                  </div>

                  <div style={{ fontSize: '13px', color: '#334155', fontWeight: '800', marginBottom: '14px', wordBreak: 'break-word' }}>
                    👤 {cName} {c.customerPhone ? `• ${c.customerPhone}` : ''}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '950' }}>{translateDbValue(c.complaintType)}</span>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' }}>{translateDbValue(c.channel)}</span>
                  </div>

                  {cNotes && (
                    <div style={{ fontSize: '12px', color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #e2e8f0', whiteSpace: 'pre-line', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      💬 {cNotes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontWeight: '800', gap: '8px', flexWrap: 'wrap' }}>
                  <span>🕒 {t('cmRecentlyLogged')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={c.status === 'Open' ? 'cm-pulse' : undefined} style={{ color: statusColor }}>● {translateDbValue(c.status)}</span>
                    <button
                      onClick={() => { setActiveComplaintForComment(c); setCommentModalOpen(true); }}
                      className="cm-chip-btn"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title={t('cmAddViewCommentsTitle')}
                    >
                      💬 {c.notes ? '1+' : '0'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for + New Complaint */}
      {isModalOpen && (
        <div className="cm-overlay" style={styles.modalOverlay} onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }}>
          <div className="cm-modal" style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950' }}>{t('cmCreateModalTitle')}</h3>
              <button onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }} className="cm-close" style={styles.closeXBtn}>✕</button>
            </div>

            <form onSubmit={handleCreateComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>{t('cmSearchOrderDbLabel')}</label>
                <input
                  type="text"
                  placeholder={t('cmSelectOrderPlaceholder')}
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
                  <div className="cm-dd" style={styles.dropdownResults}>
                    <div style={{ padding: '8px 12px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      {t('cmRecentOrdersDropdownHint')}
                    </div>
                    {matchingOrdersForDropdown.map((ord, oIdx) => (
                      <div
                        key={oIdx}
                        className="cm-dd-item"
                        onClick={() => handleSelectOrderForComplaint(ord)}
                        style={styles.dropdownItem}
                      >
                        <strong>{ord.displayId || ord.orderId}</strong> — {ord.customerName} ({ord.customerPhone || t('cmNoPhone')}) · ₹{ord.totalAmount || 0}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>{t('cmOrderIdRequired')}</label>
                <input type="text" placeholder="e.g. KO01/002978" required value={newComplaint.orderId} onChange={e => setNewComplaint({...newComplaint, orderId: e.target.value})} style={styles.input} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>{t('posCustomerNameRequired')}</label>
                <input type="text" placeholder={t('posFullNamePlaceholder')} required value={newComplaint.customerName} onChange={e => setNewComplaint({...newComplaint, customerName: e.target.value})} style={styles.input} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>{t('loginEmailLabel').replace('Login Email', t('phoneNumberLabel'))}</label>
                <input type="text" placeholder={t('phoneNumberLabel')} value={newComplaint.customerPhone} onChange={e => setNewComplaint({...newComplaint, customerPhone: e.target.value})} style={styles.input} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>{t('cmComplaintTypeLabel')}</label>
                <select value={newComplaint.complaintType} onChange={e => setNewComplaint({...newComplaint, complaintType: e.target.value})} style={styles.input}>
                  <option value="Missing Item">{t('cmTypeMissingItem')}</option>
                  <option value="Wrong Item">{t('cmTypeWrongItem')}</option>
                  <option value="Late Delivery">{t('cmTypeLateDelivery')}</option>
                  <option value="Food Quality">{t('cmTypeFoodQuality')}</option>
                  <option value="Packaging">{t('cmTypePackaging')}</option>
                  <option value="Payment Issue">{t('cmTypePaymentIssue')}</option>
                  <option value="Other">{t('posGenderOther')}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>{t('mnChannelWord')}</label>
                <select value={newComplaint.channel} onChange={e => setNewComplaint({...newComplaint, channel: e.target.value})} style={styles.input}>
                  <option value="WhatsApp Ordering">{t('cmChanWhatsApp')}</option>
                  <option value="Web Ordering">{t('cmChanWeb')}</option>
                  <option value="Zomato">Zomato</option>
                  <option value="Swiggy">Swiggy</option>
                  <option value="Counter">{translateDbValue('COUNTER')}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>{t('cmNotesDescLabel')}</label>
                <textarea placeholder={t('cmNotesPlaceholder')} value={newComplaint.notes} onChange={e => setNewComplaint({...newComplaint, notes: e.target.value})} style={{...styles.input, height: '80px', resize: 'vertical', fontFamily: 'inherit'}} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="cm-btn-save" style={{ flex: 1, background: '#059669', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: 'pointer' }}>{t('cmSaveComplaintBtn')}</button>
                <button type="button" className="cm-btn-neutral" onClick={() => { setIsModalOpen(false); setShowOrderDropdown(false); }} style={{ flex: 1, background: '#e2e8f0', color: '#0f172a', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: '950', cursor: 'pointer' }}>{t('cancelBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Comments / Viewing Notes */}
      {commentModalOpen && activeComplaintForComment && (
        <div className="cm-overlay" style={styles.modalOverlay} onClick={() => { setCommentModalOpen(false); setActiveComplaintForComment(null); }}>
          <div className="cm-modal" style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '950' }}>{t('cmNotesCommentsTitle')}</h3>
              <button onClick={() => { setCommentModalOpen(false); setActiveComplaintForComment(null); }} className="cm-close" style={styles.closeXBtn}>✕</button>
            </div>

            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', fontWeight: '800' }}>
              {t('orderWord')}: <strong>{activeComplaintForComment.orderId}</strong> ({activeComplaintForComment.customerName})
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', maxHeight: '160px', overflowY: 'auto', marginBottom: '16px', whiteSpace: 'pre-line', fontSize: '13px', color: '#334155', fontWeight: '700', wordBreak: 'break-word' }}>
              {activeComplaintForComment.notes ? activeComplaintForComment.notes : t('cmNoPreviousNotes')}
            </div>

            <form onSubmit={handleAddCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '6px' }}>{t('cmAddFollowupLabel')}</label>
                <textarea
                  placeholder={t('cmCommentPlaceholder')}
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  style={{ ...styles.input, height: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="cm-btn-blue" style={{ flex: 1, background: '#0284c7', color: '#fff', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>{t('cmAddCommentBtn')}</button>
                <button type="button" className="cm-btn-neutral" onClick={() => { setCommentModalOpen(false); setActiveComplaintForComment(null); }} style={{ flex: 1, background: '#e2e8f0', color: '#0f172a', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>{t('closeBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  metricCard: { background: '#fff', padding: '18px 16px', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', gap: '6px' },
  metricTitle: { fontSize: '10px', fontWeight: '950', color: '#64748b', letterSpacing: '0.5px' },
  metricValue: { margin: 0, fontSize: '26px', fontWeight: '950', color: '#0f172a' },
  select: { padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' },
  dateInput: { padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '12px', fontWeight: '800', background: '#f8fafc', outline: 'none', color: '#334155' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', fontWeight: '800' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', boxSizing: 'border-box' },
  modalCard: { width: '100%', maxWidth: '460px', background: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: '950', color: '#64748b', cursor: 'pointer' },
  dropdownResults: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '10px', zIndex: 10000, maxHeight: '190px', overflowY: 'auto', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
  dropdownItem: { padding: '10px 14px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: '800', color: '#1e293b' }
};