// FILE: src/components/settings/SettingsModule.jsx
import React, { useState, useEffect } from 'react';
import BusinessInfoTab from './BusinessInfoTab';
import ProfileTab from './ProfileTab';
import ServiceHoursTab from './ServiceHoursTab';
import AreasTablesTab from './AreasTablesTab';
import UsersTab from './UsersTab';
import DeliveryTab from './DeliveryTab';
import BillingTab from './BillingTab';
import PrintersReceiptsTab from './PrintersReceiptsTab';
import SystemTab from './SystemTab';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Extra states needed by specific tabs
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [taxFormMode, setTaxFormMode] = useState('list');
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [taxFormData, setTaxFormData] = useState({ name: '', rate: '', cgst: '', sgst: '', hsnCode: '', itcEligible: false, active: true });

  const [formData, setFormData] = useState({
    restaurantId: '', email: '', businessName: '', ownerName: '', phoneNumber: '', whatsappNumber: '', website: '',
    gstnNumber: '', businessLicenseNumber: '', addressLine1: '', addressLine2: '', area: '', city: '', state: '', pinCode: '',
    onlineRestaurantName: '', branchDisplayName: '', businessShortCode: '', branchShortCode: '', firstName: '', lastName: '', preferredLanguage: 'Telugu',
    serviceHours: {}, areasAndTables: { areas: [] }, deliveryConfig: { agents: [] }, billingConfig: { taxGroups: [] },
    receiptConfig: { density: 'Compact', paperSize: '80mm', toggles: {} }, printRules: {}, printerInfo: {}
  });

  useEffect(() => {
    const loggedInEmail = localStorage.getItem('userEmail');
    if (!loggedInEmail) { setLoading(false); return; }
    setFormData(prev => ({ ...prev, email: loggedInEmail }));
    fetchProfile(loggedInEmail);
    fetchUsers(loggedInEmail);
  }, []);

  const fetchProfile = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/email/${email}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, ...data, email }));
      }
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const fetchUsers = (email) => {
    fetch(`${API_BASE_URL}/api/v1/staff?email=${email}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setUsersList(data); })
      .catch(err => console.log(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        serviceHours: JSON.stringify(formData.serviceHours),
        areasAndTables: JSON.stringify(formData.areasAndTables),
        deliveryConfig: JSON.stringify(formData.deliveryConfig),
        billingConfig: JSON.stringify(formData.billingConfig),
        receiptConfig: JSON.stringify(formData.receiptConfig),
        printRules: JSON.stringify(formData.printRules),
        printerInfo: JSON.stringify(formData.printerInfo)
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/${formData.restaurantId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      showMsg('💾 All settings successfully saved to database!', 'success');
    } catch (err) {
      showMsg(`❌ Error: ${err.message}`, 'error');
    } finally { setSaving(false); }
  };

  const sidebarItems = [
    { id: 'business', label: 'Business Information', icon: '🏢' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'hours', label: 'Service Hours', icon: '⏰' },
    { id: 'tables', label: 'Areas & Tables', icon: '🪑' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'delivery', label: 'Delivery', icon: '🛵' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'printers', label: 'Printers & Receipts', icon: '🖨️' },
    { id: 'system', label: 'System', icon: '⚙️' }
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontWeight: 900 }}>Loading settings...</div>;

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>Settings</h2>
          <span style={S.subtitle}>Manage business configurations & operational rules</span>
        </div>
        <button onClick={handleSave} style={S.saveBtn} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {message.text && (
        <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, fontWeight: 900, background: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#991b1b' : '#15803d' }}>
          {message.text}
        </div>
      )}

      <div style={S.layout}>
        <div style={S.sidebar}>
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ ...S.sidebarBtn, ...(activeTab === item.id ? S.activeSidebarBtn : {}) }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        <div style={S.contentPanel}>
          <form onSubmit={handleSave}>
            {activeTab === 'business' && <BusinessInfoTab formData={formData} handleChange={handleChange} />}
            {activeTab === 'profile' && <ProfileTab formData={formData} handleChange={handleChange} />}
            {activeTab === 'hours' && <ServiceHoursTab formData={formData} setFormData={setFormData} isEditingHours={isEditingHours} setIsEditingHours={setIsEditingHours} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />}
            {activeTab === 'tables' && <AreasTablesTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'users' && <UsersTab formData={formData} usersList={usersList} setUsersList={setUsersList} fetchUsers={fetchUsers} showMsg={showMsg} />}
            {activeTab === 'delivery' && <DeliveryTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'billing' && <BillingTab formData={formData} setFormData={setFormData} taxFormMode={taxFormMode} setTaxFormMode={setTaxFormMode} taxFormData={taxFormData} setTaxFormData={setTaxFormData} editingTaxId={editingTaxId} setEditingTaxId={setEditingTaxId} />}
            {activeTab === 'printers' && <PrintersReceiptsTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'system' && <SystemTab />}
          </form>
        </div>
      </div>
    </div>
  );
}

const S = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: 24, backgroundColor: '#f1f5f9', boxSizing: 'border-box', textAlign: 'left' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#fff', padding: '16px 24px', borderRadius: 16, border: '1.5px solid #cbd5e1' },
  title: { margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#475569', fontWeight: 800 },
  saveBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 900, cursor: 'pointer' },
  layout: { display: 'flex', gap: 24, alignItems: 'flex-start' },
  sidebar: { width: 260, backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #cbd5e1', padding: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  sidebarBtn: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', backgroundColor: 'transparent', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 13, color: '#1e293b', cursor: 'pointer', textAlign: 'left', width: '100%' },
  activeSidebarBtn: { backgroundColor: '#ecfdf5', color: '#047857' },
  contentPanel: { flex: 1, backgroundColor: '#fff', borderRadius: 16, border: '1.5px solid #cbd5e1', padding: 24, minHeight: 600 }
};