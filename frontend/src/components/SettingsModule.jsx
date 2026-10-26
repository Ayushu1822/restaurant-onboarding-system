import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Form State mapped to Database RestaurantProfile entity + Service Hours
  const [formData, setFormData] = useState({
    restaurantId: '',
    userId: '',
    email: '', 
    businessName: '',
    ownerName: '',
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
    preferredLanguage: 'Telugu',
    serviceHours: {
      Monday: { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' },
      Tuesday: { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' },
      Wednesday: { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' },
      Thursday: { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' },
      Friday: { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' },
      Saturday: { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' },
      Sunday: { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' }
    }
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
      
      let parsedHours = data.serviceHours;
      if (typeof parsedHours === 'string') {
        try { parsedHours = JSON.parse(parsedHours); } catch (e) {}
      }

      setFormData(prev => ({ 
        ...prev, 
        ...data, 
        email,
        serviceHours: parsedHours || prev.serviceHours
      }));
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

  const handleHourChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      serviceHours: {
        ...prev.serviceHours,
        [day]: {
          ...prev.serviceHours[day],
          [field]: value
        }
      }
    }));
  };

  // Helper to dynamically calculate break duration between shift 1 end and shift 2 start
  const calculateBreakDuration = (end1, start2) => {
    try {
      const [h1, m1] = (end1 || '14:00').split(':').map(Number);
      const [h2, m2] = (start2 || '17:00').split(':').map(Number);
      const mins1 = h1 * 60 + m1;
      const mins2 = h2 * 60 + m2;
      const diff = mins2 - mins1;
      if (diff <= 0) return 'Overlapping';
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } catch (e) {
      return '3h';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        ...formData,
        serviceHours: JSON.stringify(formData.serviceHours)
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/${formData.restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to update settings in database');
      }

      const updated = await res.json();
      let parsedHours = updated.serviceHours;
      if (typeof parsedHours === 'string') {
        try { parsedHours = JSON.parse(parsedHours); } catch (e) {}
      }

      setFormData(prev => ({ 
        ...prev, 
        ...updated,
        serviceHours: parsedHours || prev.serviceHours 
      }));
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

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>🖼️ Supplementary Images</h3>
                <div style={styles.grid2}>
                  <div style={styles.imageUploadCard}>
                    <div style={{fontWeight: '950', color: '#0f172a', marginBottom: '6px'}}>Restaurant Banner for WhatsApp Order Flow</div>
                    <div style={{fontSize: '11px', color: '#475569', fontWeight: '700', marginBottom: '12px'}}>Appears as the banner on WhatsApp order flow welcome screen.</div>
                    <input type="text" name="whatsappBannerUrl" value={formData.whatsappBannerUrl || ''} onChange={handleChange} placeholder="Paste Image URL" style={styles.input} />
                  </div>
                  <div style={styles.imageUploadCard}>
                    <div style={{fontWeight: '950', color: '#0f172a', marginBottom: '6px'}}>Default Item Image</div>
                    <div style={{fontSize: '11px', color: '#475569', fontWeight: '700', marginBottom: '12px'}}>Used as default item image when specific image is not available.</div>
                    <input type="text" name="defaultItemImageUrl" value={formData.defaultItemImageUrl || ''} onChange={handleChange} placeholder="Paste Image URL" style={styles.input} />
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

            {/* TAB 3: SERVICE HOURS */}
            {activeTab === 'hours' && (
              <div style={styles.sectionGroup}>
                <div style={styles.serviceHoursBanner}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span style={{fontSize: '22px'}}>⏰</span>
                    <div>
                      <div style={{fontWeight: '950', color: '#0369a1', fontSize: '15px'}}>Online Ordering Hours</div>
                      <div style={{fontSize: '12px', color: '#0c4a6e', marginTop: '3px', fontWeight: '800'}}>
                        Configure working days with multiple shifts. Gaps between shifts are treated as breaks automatically — no need to define them separately.
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingHours(!isEditingHours)} 
                    style={styles.editHoursBtn}
                  >
                    ✏️ {isEditingHours ? 'Lock Hours' : 'Edit Hours'}
                  </button>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px'}}>
                  {daysOfWeek.map(day => {
                    const dayData = formData.serviceHours?.[day] || { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' };
                    const breakDuration = calculateBreakDuration(dayData.shift1End, dayData.shift2Start);
                    const isHovered = hoveredCard === day;

                    return (
                      <div 
                        key={day} 
                        style={{
                          ...styles.dayCard,
                          ...(isHovered ? styles.dayCardHover : {})
                        }}
                        onMouseEnter={() => setHoveredCard(day)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div style={styles.dayCardHeader}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                            <span style={{fontWeight: '950', fontSize: '16px', color: '#0f172a', width: '110px'}}>{day}</span>
                            <span style={{backgroundColor: dayData.holiday ? '#fef2f2' : '#ecfdf5', color: dayData.holiday ? '#dc2626' : '#059669', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '950', border: '1px solid currentColor'}}>
                              {dayData.holiday ? 'Holiday' : 'Open'}
                            </span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{fontSize: '12px', fontWeight: '900', color: '#0f172a'}}>Holiday</span>
                            <input 
                              type="checkbox" 
                              checked={dayData.holiday || false} 
                              onChange={e => handleHourChange(day, 'holiday', e.target.checked)}
                              style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669'}}
                            />
                          </div>
                        </div>

                        {!dayData.holiday && (
                          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px'}}>
                            <div style={{display: 'flex', gap: '14px', alignItems: 'center'}}>
                              <input 
                                type="text" 
                                value={dayData.shift1Start} 
                                onChange={e => handleHourChange(day, 'shift1Start', e.target.value)} 
                                disabled={!isEditingHours}
                                style={styles.timeInput} 
                              />
                              <span style={{fontWeight: '900', color: '#334155'}}>to</span>
                              <input 
                                type="text" 
                                value={dayData.shift1End} 
                                onChange={e => handleHourChange(day, 'shift1End', e.target.value)} 
                                disabled={!isEditingHours}
                                style={styles.timeInput} 
                              />
                            </div>

                            <div style={{textAlign: 'center', fontSize: '12px', fontWeight: '950', color: '#b45309', backgroundColor: '#fef3c7', padding: '8px', borderRadius: '8px', border: '1.5px dashed #f59e0b'}}>
                              Break {dayData.shift1End}–{dayData.shift2Start} ({breakDuration})
                            </div>

                            <div style={{display: 'flex', gap: '14px', alignItems: 'center'}}>
                              <input 
                                type="text" 
                                value={dayData.shift2Start} 
                                onChange={e => handleHourChange(day, 'shift2Start', e.target.value)} 
                                disabled={!isEditingHours}
                                style={styles.timeInput} 
                              />
                              <span style={{fontWeight: '900', color: '#334155'}}>to</span>
                              <input 
                                type="text" 
                                value={dayData.shift2End} 
                                onChange={e => handleHourChange(day, 'shift2End', e.target.value)} 
                                disabled={!isEditingHours}
                                style={styles.timeInput} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PLACEHOLDER FOR OTHER TABS */}
            {activeTab !== 'business' && activeTab !== 'profile' && activeTab !== 'hours' && (
              <div style={styles.placeholderTab}>
                <h3>🚧 {sidebarItems.find(i => i.id === activeTab)?.label} Configuration</h3>
                <p style={{color: '#475569', fontSize: '14px', fontWeight: '800', marginTop: '8px'}}>
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
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', backgroundColor: '#f1f5f9', overflowY: 'auto', boxSizing: 'border-box', textAlign: 'left' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#fff', padding: '16px 24px', borderRadius: '16px', border: '2px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  title: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: '950', color: '#0f172a' },
  subtitle: { fontSize: '12px', color: '#475569', fontWeight: '800' },
  statusBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '950', border: '1.5px solid #86efac' },
  saveBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)', transition: 'all 0.2s ease' },
  alert: { padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: '900', border: '2px solid' },
  layout: { display: 'flex', gap: '24px', flex: 1, alignItems: 'flex-start' },
  sidebar: { width: '260px', backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #cbd5e1', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  sidebarBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', border: '2px solid transparent', borderRadius: '10px', fontWeight: '900', fontSize: '13px', color: '#1e293b', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s ease' },
  activeSidebarBtn: { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#10b981', boxShadow: '0 2px 8px rgba(16,185,129,0.15)' },
  contentPanel: { flex: 1, backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #cbd5e1', padding: '24px', minHeight: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { fontSize: '17px', fontWeight: '950', color: '#0f172a', margin: '0 0 12px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '950', color: '#0f172a' },
  input: { padding: '10px 14px', borderRadius: '10px', border: '2px solid #94a3b8', fontSize: '13px', fontWeight: '900', color: '#0f172a', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  imageUploadCard: { border: '2px dashed #94a3b8', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  placeholderTab: { textAlign: 'center', padding: '80px 20px', color: '#0f172a' },
  centerMsg: { padding: '40px', textAlign: 'center', fontWeight: '900', color: '#334155' },
  serviceHoursBanner: { backgroundColor: '#e0f2fe', border: '2px solid #7dd3fc', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  editHoursBtn: { backgroundColor: '#fff', color: '#0369a1', border: '2px solid #38bdf8', padding: '8px 16px', borderRadius: '10px', fontWeight: '950', fontSize: '12px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(56,189,248,0.2)' },
  dayCard: { backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '14px', padding: '18px', transition: 'all 0.25s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  dayCardHover: { borderColor: '#059669', backgroundColor: '#f0fdf4', transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(5,150,105,0.12)' },
  dayCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  timeInput: { padding: '8px 14px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '13px', fontWeight: '900', color: '#0f172a', backgroundColor: '#fff', width: '150px', outline: 'none' }
};