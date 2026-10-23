import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form State mapped to Database RestaurantProfile entity
  const [formData, setFormData] = useState({
    restaurantId: '',
    userId: '',
    email: '', 
    businessName: '',
    ownerName: '', // ✅ Editable Owner Name
    phoneNumber: '',
    whatsappNumber: '',
    website: '',
    gstnNumber: '',
    businessRegistrationNumber: '',
    businessLicenseNumber: '',
    addressLine1: '',
    addressLine2: '',
    area: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: '',
    longitude: '',
    onlineRestaurantName: '',
    branchDisplayName: '',
    businessShortCode: '',
    branchShortCode: '',
    whatsappBannerUrl: '',
    defaultItemImageUrl: '',
    firstName: '',
    lastName: '',
    preferredLanguage: 'Telugu'
  });

  useEffect(() => {
    const loggedInEmail = localStorage.getItem('userEmail');
    if (!loggedInEmail) {
      alert('No logged-in user found! Please login or sign up first.');
      setLoading(false);
      return;
    }
    setFormData(prev => ({ ...prev, email: loggedInEmail }));
    fetchProfile(loggedInEmail);
  }, []);

  const fetchProfile = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/email/${email}`);
      if (!res.ok) throw new Error('Failed to fetch profile from database');
      const data = await res.json();
      setFormData(prev => ({ ...prev, ...data, email }));
    } catch (err) {
      console.error('Error fetching profile:', err);
      showMsg('Failed to load profile from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/${formData.restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to update settings in database');
      }

      const updated = await res.json();
      setFormData(prev => ({ ...prev, ...updated }));
      showMsg('✅ Changes successfully saved to database!', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      showMsg(`❌ Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
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

  if (loading) {
    return <div style={styles.centerMsg}>Loading latest settings from database for your account...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Settings</h2>
          <span style={styles.subtitle}>Manage your business configurations (Account: {formData.email})</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <span style={styles.statusBadge}>🟢 Live Account Synced</span>
          <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving to DB...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {message.text && (
        <div style={{...styles.alert, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534', borderColor: message.type === 'error' ? '#f87171' : '#4ade80'}}>
          {message.text}
        </div>
      )}

      {/* Main Layout */}
      <div style={styles.layout}>
        {/* Sidebar Navigation */}
        <div style={styles.sidebar}>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.sidebarBtn,
                ...(activeTab === item.id ? styles.activeSidebarBtn : {})
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div style={styles.contentPanel}>
          <form onSubmit={handleSave} style={styles.formContainer}>

            {/* TAB 1: BUSINESS INFORMATION */}
            {activeTab === 'business' && (
              <div style={styles.sectionGroup}>
                <h3 style={styles.sectionTitle}>🏢 Business Information & Identity</h3>
                
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Business Name *</label>
                    <input type="text" name="businessName" value={formData.businessName || ''} onChange={handleChange} style={styles.input} required />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Owner Name *</label>
                    <input type="text" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} style={styles.input} required />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Email ID (Login ID)</label>
                    <input type="email" name="email" value={formData.email || ''} style={{...styles.input, backgroundColor: '#f1f5f9'}} disabled />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>WhatsApp Business Number *</label>
                    <input type="text" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} style={styles.input} required />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Mobile Number *</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} style={styles.input} required />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Website</label>
                    <input type="text" name="website" value={formData.website || ''} onChange={handleChange} placeholder="https://" style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>GSTN Number *</label>
                    <input type="text" name="gstnNumber" value={formData.gstnNumber || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Business License Number *</label>
                    <input type="text" name="businessLicenseNumber" value={formData.businessLicenseNumber || ''} onChange={handleChange} style={styles.input} />
                  </div>
                </div>

                {/* Display Names & Codes */}
                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>🏷️ Display Names & Codes</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Online Restaurant Name *</label>
                    <input type="text" name="onlineRestaurantName" value={formData.onlineRestaurantName || ''} onChange={handleChange} placeholder="e.g. FOODOS Kitchen" style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Branch Display Name *</label>
                    <input type="text" name="branchDisplayName" value={formData.branchDisplayName || ''} onChange={handleChange} placeholder="e.g. Koramangala" style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Business Short Code *</label>
                    <input type="text" name="businessShortCode" value={formData.businessShortCode || ''} onChange={handleChange} maxLength="5" placeholder="e.g. KO" style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Branch Short Code *</label>
                    <input type="text" name="branchShortCode" value={formData.branchShortCode || ''} onChange={handleChange} maxLength="2" placeholder="e.g. 01" style={styles.input} />
                  </div>
                </div>

                {/* Address Section */}
                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>📍 Address & Location</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Address Line 1</label>
                    <input type="text" name="addressLine1" value={formData.addressLine1 || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Address Line 2</label>
                    <input type="text" name="addressLine2" value={formData.addressLine2 || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Area</label>
                    <input type="text" name="area" value={formData.area || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>City</label>
                    <input type="text" name="city" value={formData.city || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>State</label>
                    <input type="text" name="state" value={formData.state || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>PIN Code</label>
                    <input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} style={styles.input} />
                  </div>
                </div>

                {/* Supplementary Images Section */}
                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>🖼️ Supplementary Images</h3>
                <div style={styles.grid2}>
                  <div style={styles.imageUploadCard}>
                    <div style={{fontWeight: '900', color: '#0f172a', marginBottom: '6px'}}>Restaurant Banner for WhatsApp Order Flow</div>
                    <div style={{fontSize: '11px', color: '#64748b', marginBottom: '12px'}}>Appears as the banner on WhatsApp order flow welcome screen.</div>
                    <input 
                      type="text" 
                      name="whatsappBannerUrl" 
                      value={formData.whatsappBannerUrl || ''} 
                      onChange={handleChange} 
                      placeholder="Paste Image URL" 
                      style={styles.input} 
                    />
                  </div>
                  <div style={styles.imageUploadCard}>
                    <div style={{fontWeight: '900', color: '#0f172a', marginBottom: '6px'}}>Default Item Image</div>
                    <div style={{fontSize: '11px', color: '#64748b', marginBottom: '12px'}}>Used as default item image when specific image is not available.</div>
                    <input 
                      type="text" 
                      name="defaultItemImageUrl" 
                      value={formData.defaultItemImageUrl || ''} 
                      onChange={handleChange} 
                      placeholder="Paste Image URL" 
                      style={styles.input} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFILE */}
            {activeTab === 'profile' && (
              <div style={styles.sectionGroup}>
                <h3 style={styles.sectionTitle}>👤 Admin & User Profile</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Owner / Admin Name *</label>
                    <input type="text" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} style={styles.input} required />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>First Name</label>
                    <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Email (Login ID)</label>
                    <input type="email" name="email" value={formData.email || ''} style={{...styles.input, backgroundColor: '#f1f5f9'}} disabled />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Mobile Number</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Preferred Language</label>
                    <select name="preferredLanguage" value={formData.preferredLanguage || 'Telugu'} onChange={handleChange} style={styles.input}>
                      <option value="English">English</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PLACEHOLDER FOR OTHER TABS */}
            {activeTab !== 'business' && activeTab !== 'profile' && (
              <div style={styles.placeholderTab}>
                <h3>🚧 {sidebarItems.find(i => i.id === activeTab)?.label} Configuration</h3>
                <p style={{color: '#64748b', fontSize: '14px', marginTop: '8px'}}>
                  This operational sub-module is ready for integration.
                </p>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', backgroundColor: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box', textAlign: 'left' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#fff', padding: '16px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0' },
  title: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: '950', color: '#0f172a' },
  subtitle: { fontSize: '12px', color: '#64748b', fontWeight: '700' },
  statusBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '900' },
  saveBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(5,150,105,0.2)' },
  alert: { padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '850', border: '1.5px solid' },
  layout: { display: 'flex', gap: '24px', flex: 1, alignItems: 'flex-start' },
  sidebar: { width: '260px', backgroundColor: '#fff', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
  sidebarBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', fontWeight: '850', fontSize: '13px', color: '#334155', cursor: 'pointer', textAlign: 'left', width: '100%' },
  activeSidebarBtn: { backgroundColor: '#ecfdf5', color: '#047857', borderLeft: '4px solid #059669' },
  contentPanel: { flex: 1, backgroundColor: '#fff', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '24px', minHeight: '600px' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { fontSize: '16px', fontWeight: '950', color: '#0f172a', margin: '0 0 12px 0', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '8px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '900', color: '#334155' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#0f172a', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  imageUploadCard: { border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  placeholderTab: { textAlign: 'center', padding: '80px 20px', color: '#334155' },
  centerMsg: { padding: '40px', textAlign: 'center', fontWeight: '800', color: '#64748b' }
};