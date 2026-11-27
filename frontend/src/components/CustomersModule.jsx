import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';


const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  'http://localhost:8080'
).replace(/\/$/, '');

const AGE_GROUPS = [
  '0-6', '6-12', '12-18', '18-24', '25-34',
  '35-44', '45-54', '55-64', '65-74', '75-84', '85-100+'
];

export default function CustomersModule() {
  const { t, translateDbValue, getLocalizedField } = useLanguage();
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
      return alert(t('posEnterNamePhoneAlert'));
    }

    const userEmail = localStorage.getItem('userEmail') || '';
    const payload = {
      ...formData,
      restaurantEmail: userEmail
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
          alert(t('csSaveCustomerFailAlert'));
        }
      })
      .catch(err => alert(`${t('smErrorPrefix')}: ` + err.message));
  };

  const handleDeleteCustomer = (id, name) => {
    if (!window.confirm(t('csDeleteCustomerConfirm').replace('{name}', name || ''))) return;

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
      .catch(() => {
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

  const formatGender = (g) => {
    if (!g) return '—';
    if (g === 'Male') return t('posGenderMale');
    if (g === 'Female') return t('posGenderFemale');
    if (g === 'Other') return t('posGenderOther');
    return translateDbValue(g);
  };

  const formatFood = (f) => {
    if (!f) return '';
    if (f === 'Veg') return t('posFoodVeg');
    if (f === 'Non-Veg') return t('posFoodNonVeg');
    if (f === 'Vegan') return t('posFoodVegan');
    if (f === 'Eggetarian') return t('posFoodEggetarian');
    return translateDbValue(f);
  };

  const getInitial = (name) => (name || '?').trim().charAt(0).toUpperCase();

  return (
    <div style={styles.container} className="mu-root">

      {/* Header Bar */}
      <div style={styles.headerRow}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px', flex: 1, flexWrap: 'wrap'}}>
          <input
            style={styles.searchBar}
            placeholder={`🔍 ${t('csSearchPlaceholder')}`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span style={styles.profileCount}>{t('csProfilesRegistered').replace('{count}', String(customers.length))}</span>
        </div>

        <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
          <button
            onClick={() => alert(t('csUploadCsvAlert'))}
            onMouseEnter={() => setHoveredBtn('upload')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.secondaryBtn,
              background: hoveredBtn === 'upload' ? '#e2e8f0' : '#f1f5f9'
            }}
          >
            📤 {t('csUploadCsvBtn')}
          </button>
          <button
            onClick={() => setShowModal(true)}
            onMouseEnter={() => setHoveredBtn('add')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.primaryBtn,
              background: hoveredBtn === 'add' ? '#065f46' : '#047857',
              boxShadow: hoveredBtn === 'add' ? '0 6px 16px rgba(4,120,87,0.35)' : '0 2px 6px rgba(4,120,87,0.2)'
            }}
          >
            + {t('posAddCustomerBtn')}
          </button>
        </div>
      </div>

      {/* CRM Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={{padding: '50px', textAlign: 'center', color: '#64748b'}}>
            <div className="mu-spinner" />
            <div style={{marginTop: '12px'}}>{t('csLoadingProfiles')}</div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>
            <div style={{fontSize: '40px', marginBottom: '8px'}}>👥</div>
            {t('csNoCustomersFound')}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>{t('mnNameCol').toUpperCase()}</th>
                <th style={styles.th}>{t('posGenderLabel').toUpperCase()}</th>
                <th style={styles.th}>{t('posAgeGroupLabel').toUpperCase()}</th>
                <th style={styles.th}>{t('posPreferredFoodLabel').toUpperCase()}</th>
                <th style={styles.th}>{t('tbPhoneUpper')}</th>
                <th style={styles.th}>{t('whatsappNumberLabel').toUpperCase()}</th>
                <th style={styles.th}>{t('emailLoginId').split(' ')[0].toUpperCase()}</th>
                <th style={styles.th}>{t('smAreaLabel').toUpperCase()} / {t('csAddressColUpper')}</th>
                <th style={{...styles.th, textAlign: 'center'}}>{t('rpActionsCol').toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c, index) => {
                const foodStyle = getFoodBadgeStyle(c.preferredFood);
                const isHovered = hoveredRow === index;
                const cName = getLocalizedField(c, 'customerName') || c.customerName;
                const cAddr = getLocalizedField(c, 'address') || c.address;

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
                    <td style={{...styles.td, fontWeight: '700', color: '#0f172a'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={styles.avatar}>{getInitial(cName)}</span>
                        <span>{cName}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{formatGender(c.gender)}</td>
                    <td style={styles.td}>
                      <span style={styles.ageBadge}>{c.ageGroup || '—'}</span>
                    </td>
                    <td style={styles.td}>
                      {c.preferredFood && (
                        <span style={{...styles.badge, background: foodStyle.bg, color: foodStyle.text, borderColor: foodStyle.border}}>
                          {formatFood(c.preferredFood)}
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>{c.customerPhone}</td>
                    <td style={styles.td}>{c.whatsappNumber || c.customerPhone || '—'}</td>
                    <td style={styles.td}>{c.customerEmail || '—'}</td>
                    <td style={{...styles.td, color: '#64748b', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {cAddr || '—'}
                    </td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <button
                        onClick={() => handleDeleteCustomer(c.id || c.customerPhone, cName)}
                        title={t('csDeleteProfileTitle')}
                        style={styles.deleteRowBtn}
                      >
                        🗑️ {t('tbDeleteBtn')}
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
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <form onSubmit={handleSaveCustomer} onClick={e => e.stopPropagation()} style={styles.modalCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>{t('csAddNewProfileTitle')}</h3>
              <button type="button" onClick={() => setShowModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            <label style={styles.label}>{t('posCustomerNameRequired')}</label>
            <input
              style={styles.input}
              placeholder={t('posFullNamePlaceholder')}
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              required
              autoFocus
            />

            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 140px'}}>
                <label style={styles.label}>{t('posGenderLabel')}</label>
                <select
                  style={styles.input}
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Male">{t('posGenderMale')}</option>
                  <option value="Female">{t('posGenderFemale')}</option>
                  <option value="Other">{t('posGenderOther')}</option>
                </select>
              </div>

              <div style={{flex: '1 1 140px'}}>
                <label style={styles.label}>{t('posAgeGroupLabel')}</label>
                <select
                  style={styles.input}
                  value={formData.ageGroup}
                  onChange={e => setFormData({...formData, ageGroup: e.target.value})}
                >
                  {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag} {t('csYearsWord')}</option>)}
                </select>
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 140px'}}>
                <label style={styles.label}>{t('posPreferredFoodLabel')}</label>
                <select
                  style={styles.input}
                  value={formData.preferredFood}
                  onChange={e => setFormData({...formData, preferredFood: e.target.value})}
                >
                  <option value="Veg">{t('posFoodVeg')}</option>
                  <option value="Non-Veg">{t('posFoodNonVeg')}</option>
                  <option value="Vegan">{t('posFoodVegan')}</option>
                  <option value="Eggetarian">{t('posFoodEggetarian')}</option>
                </select>
              </div>

              <div style={{flex: '1 1 140px'}}>
                <label style={styles.label}>{t('posPhoneNumberRequired')}</label>
                <input
                  style={styles.input}
                  placeholder={t('posTenDigitMobile')}
                  value={formData.customerPhone}
                  onChange={e => setFormData({...formData, customerPhone: e.target.value, whatsappNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <label style={styles.label}>{t('posEmailAddressLabel')}</label>
            <input
              style={styles.input}
              placeholder="customer@email.com"
              value={formData.customerEmail}
              onChange={e => setFormData({...formData, customerEmail: e.target.value})}
            />

            <label style={styles.label}>{t('receiptDeliveryAddress')}</label>
            <textarea
              style={{...styles.input, height: '65px', resize: 'none'}}
              placeholder={t('posAddressPlaceholder')}
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />

            <div style={{display: 'flex', gap: '10px', marginTop: '6px'}}>
              <button type="submit" style={styles.saveCustomerBtn}>{t('csSaveProfileBtn')}</button>
              <button type="button" onClick={() => setShowModal(false)} style={styles.cancelModalBtn}>{t('cancelBtn')}</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { padding: '24px', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box', overflowY: 'auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', gap: '15px', flexWrap: 'wrap' },
  searchBar: { width: '320px', maxWidth: '100%', padding: '11px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#fff', fontSize: '13px', outline: 'none', boxShadow: '0 2px 6px rgba(15,23,42,0.04)' },
  profileCount: { fontSize: '13px', color: '#64748b', fontWeight: '600' },
  primaryBtn: { background: '#047857', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  secondaryBtn: { background: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '10px 18px', borderRadius: '12px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  tableCard: { background: '#fff', borderRadius: '16px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 6px 20px rgba(15,23,42,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' },
  th: { padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#334155' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #34d399, #059669)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', border: '1px solid' },
  ageBadge: { background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
  deleteRowBtn: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '5px 10px', borderRadius: '8px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalCard: { width: '460px', maxHeight: '92vh', overflowY: 'auto', background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
  label: { fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px', color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', marginBottom: '12px', background: '#fff', outline: 'none' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' },
  saveCustomerBtn: { flex: 1, background: '#047857', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  cancelModalBtn: { flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }
};