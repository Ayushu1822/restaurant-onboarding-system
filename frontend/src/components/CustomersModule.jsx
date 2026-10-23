import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const AGE_GROUPS = [
  '0-6', '6-12', '12-18', '18-24', '25-34', 
  '35-44', '45-54', '55-64', '65-74', '75-84', '85-100+'
];

export default function CustomersModule() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    gender: 'Male',
    ageGroup: '25-34',
    preferredFood: 'Veg',
    customerPhone: '',
    whatsappNumber: '',
    customerEmail: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    const userEmail = localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/customers?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching customers:", err);
        setLoading(false);
      });
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
      return alert('Please enter Name and Phone number.');
    }

    const userEmail = localStorage.getItem('userEmail') || '';
    const payload = {
      ...formData,
      restaurantEmail: userEmail // ✅ Tied strictly to current logged-in account
    };

    fetch(`${API_BASE_URL}/api/v1/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          setShowModal(false);
          setFormData({
            customerName: '', gender: 'Male', ageGroup: '25-34',
            preferredFood: 'Veg', customerPhone: '', whatsappNumber: '',
            customerEmail: '', address: ''
          });
          fetchCustomers();
        } else {
          alert('Failed to save customer profile.');
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const handleDeleteCustomer = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;

    fetch(`${API_BASE_URL}/api/v1/customers/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.ok || res.status === 204 || res.status === 200) {
          setCustomers(customers.filter(c => c.id !== id));
        } else {
          setCustomers(customers.filter(c => c.id !== id && c.customerPhone !== id));
        }
      })
      .catch(err => {
        setCustomers(customers.filter(c => c.id !== id));
      });
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.customerName || '').toLowerCase().includes(q) ||
      (c.customerPhone || '').toLowerCase().includes(q) ||
      (c.customerEmail || '').toLowerCase().includes(q)
    );
  });

  const getFoodBadgeStyle = (food) => {
    switch (food) {
      case 'Veg': return { bg: '#ecfdf5', text: '#047857', border: '#10b981' };
      case 'Non-Veg': return { bg: '#fef2f2', text: '#dc2626', border: '#f87171' };
      case 'Vegan': return { bg: '#f0fdf4', text: '#15803d', border: '#4ade80' };
      case 'Eggetarian': return { bg: '#fefce8', text: '#a16207', border: '#facc15' };
      default: return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Header Bar */}
      <div style={styles.headerRow}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px', flex: 1}}>
          <input 
            style={styles.searchBar}
            placeholder="🔍 Search name, phone, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span style={styles.profileCount}>{customers.length} profiles registered</span>
        </div>

        <div style={{display: 'flex', gap: '12px'}}>
          <button 
            onClick={() => alert('CSV Upload feature')} 
            onMouseEnter={() => setHoveredBtn('upload')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.secondaryBtn,
              background: hoveredBtn === 'upload' ? '#e2e8f0' : '#f1f5f9',
              transform: hoveredBtn === 'upload' ? 'translateY(-1px)' : 'translateY(0)'
            }}
          >
            📤 Upload CSV
          </button>
          <button 
            onClick={() => setShowModal(true)} 
            onMouseEnter={() => setHoveredBtn('add')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.primaryBtn,
              background: hoveredBtn === 'add' ? '#065f46' : '#047857',
              transform: hoveredBtn === 'add' ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredBtn === 'add' ? '0 6px 16px rgba(4,120,87,0.35)' : '0 2px 6px rgba(4,120,87,0.2)'
            }}
          >
            + Add Customer
          </button>
        </div>
      </div>

      {/* CRM Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={{padding: '50px', textAlign: 'center', color: '#64748b'}}>Loading customer profiles from PostgreSQL...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>No customer profiles found for this account.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>NAME</th>
                <th style={styles.th}>GENDER</th>
                <th style={styles.th}>AGE GROUP</th>
                <th style={styles.th}>PREFERRED FOOD</th>
                <th style={styles.th}>PHONE</th>
                <th style={styles.th}>WHATSAPP</th>
                <th style={styles.th}>EMAIL</th>
                <th style={styles.th}>ADDRESS</th>
                <th style={{...styles.th, textAlign: 'center'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c, index) => {
                const foodStyle = getFoodBadgeStyle(c.preferredFood);
                const isHovered = hoveredRow === index;
                return (
                  <tr 
                    key={c.id || c.customerPhone} 
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      ...styles.tr,
                      background: isHovered ? '#f8fafc' : '#fff'
                    }}
                  >
                    <td style={{...styles.td, fontWeight: '700', color: '#0f172a'}}>{c.customerName}</td>
                    <td style={styles.td}>{c.gender || '—'}</td>
                    <td style={styles.td}>
                      <span style={styles.ageBadge}>{c.ageGroup || '—'}</span>
                    </td>
                    <td style={styles.td}>
                      {c.preferredFood && (
                        <span style={{...styles.badge, background: foodStyle.bg, color: foodStyle.text, borderColor: foodStyle.border}}>
                          {c.preferredFood}
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>{c.customerPhone}</td>
                    <td style={styles.td}>{c.whatsappNumber || c.customerPhone || '—'}</td>
                    <td style={styles.td}>{c.customerEmail || '—'}</td>
                    <td style={{...styles.td, color: '#64748b', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {c.address || '—'}
                    </td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <button 
                        onClick={() => handleDeleteCustomer(c.id || c.customerPhone, c.customerName)}
                        title="Delete Customer Profile"
                        style={styles.deleteRowBtn}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Customer Modal with Age Group Dropdown */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSaveCustomer} style={styles.modalCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>Add New Customer Profile</h3>
              <button type="button" onClick={() => setShowModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            <label style={styles.label}>Customer Name *</label>
            <input 
              style={styles.input}
              placeholder="Full Name"
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              required
            />

            <div style={{display: 'flex', gap: '12px'}}>
              <div style={{flex: 1}}>
                <label style={styles.label}>Gender</label>
                <select 
                  style={styles.input}
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{flex: 1}}>
                <label style={styles.label}>Age Group</label>
                <select 
                  style={styles.input}
                  value={formData.ageGroup}
                  onChange={e => setFormData({...formData, ageGroup: e.target.value})}
                >
                  {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag} years</option>)}
                </select>
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px'}}>
              <div style={{flex: 1}}>
                <label style={styles.label}>Preferred Food</label>
                <select 
                  style={styles.input}
                  value={formData.preferredFood}
                  onChange={e => setFormData({...formData, preferredFood: e.target.value})}
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>

              <div style={{flex: 1}}>
                <label style={styles.label}>Phone Number *</label>
                <input 
                  style={styles.input}
                  placeholder="10-digit mobile"
                  value={formData.customerPhone}
                  onChange={e => setFormData({...formData, customerPhone: e.target.value, whatsappNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <label style={styles.label}>Email Address</label>
            <input 
              style={styles.input}
              placeholder="customer@email.com"
              value={formData.customerEmail}
              onChange={e => setFormData({...formData, customerEmail: e.target.value})}
            />

            <label style={styles.label}>Delivery Address</label>
            <textarea 
              style={{...styles.input, height: '65px', resize: 'none'}}
              placeholder="Street, Area, City"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />

            <div style={{display: 'flex', gap: '10px', marginTop: '6px'}}>
              <button type="submit" style={styles.saveCustomerBtn}>Save Profile</button>
              <button type="button" onClick={() => setShowModal(false)} style={styles.cancelModalBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', gap: '15px' },
  searchBar: { width: '320px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff', fontSize: '13px', outline: 'none' },
  profileCount: { fontSize: '13px', color: '#64748b', fontWeight: '600' },
  primaryBtn: { background: '#047857', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  secondaryBtn: { background: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  tableCard: { background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' },
  th: { padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#334155' },
  badge: { padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: '1px solid' },
  ageBadge: { background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
  deleteRowBtn: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '5px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalCard: { width: '460px', background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' },
  label: { fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px', color: '#334155' },
  input: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', marginBottom: '12px', background: '#fff', outline: 'none' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' },
  saveCustomerBtn: { flex: 1, background: '#047857', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  cancelModalBtn: { flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '11px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }
};