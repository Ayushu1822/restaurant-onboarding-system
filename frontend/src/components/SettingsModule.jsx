import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Store full profile so we preserve unedited fields
  const [fullProfile, setFullProfile] = useState({});

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
    },
    areasAndTables: {
      autoOpenQrScan: true,
      areas: [
        {
          id: 'main-area',
          name: 'Main',
          tables: [
            { id: 't1', name: 'T1', pax: 2, qrEnabled: true, status: 'Available', captain: 'Unassigned' },
            { id: 't2', name: 'T2', pax: 4, qrEnabled: true, status: 'Available', captain: 'Unassigned' },
            { id: 't3', name: 'T3', pax: 4, qrEnabled: true, status: 'Available', captain: 'Unassigned' },
            { id: 't3b', name: 'T3B', pax: 4, qrEnabled: true, status: 'Available', captain: 'Unassigned' },
            { id: 't4', name: 'T4', pax: 2, qrEnabled: true, status: 'Available', captain: 'Unassigned' }
          ]
        }
      ]
    },
    deliveryConfig: {
      serviceRadius: '5',
      contactName: '',
      contactNumber: '',
      deliveryPartner: 'WhatsCom',
      deliveryFeeChargedTo: 'Customer',
      agents: [
        { id: 'agent-1', name: 'Ramesh Kumar', phone: '+91 98765 43210', vehicleNo: 'TS 09 AB 1234', status: 'Available' }
      ]
    },
    billingConfig: {
      defaultTaxGroup: 'Standard Restaurant (5%)',
      taxGroups: [
        { id: 'tg-1', name: 'Standard Restaurant (5%)', rate: 5, cgst: 2.5, sgst: 2.5, hsnCode: '996331', status: 'Active' },
        { id: 'tg-2', name: 'Hotel Dining (Specified Premises) (18%)', rate: 18, cgst: 9, sgst: 9, hsnCode: '996331', status: 'Active' },
        { id: 'tg-3', name: 'Aerated/Carbonated Beverage (40%)', rate: 40, cgst: 20, sgst: 20, hsnCode: '220210', status: 'Active' },
        { id: 'tg-4', name: 'Non-Taxable / Exempt (0%)', rate: 0, cgst: 0, sgst: 0, hsnCode: '996331', status: 'Active' }
      ]
    }
  });

  useEffect(() => {
    const loggedInEmail = localStorage.getItem('userEmail');
    if (!loggedInEmail) {
      alert('No logged-in user found! Please login first.');
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
      
      setFullProfile(data);

      let parsedHours = data.serviceHours;
      if (typeof parsedHours === 'string') {
        try { parsedHours = JSON.parse(parsedHours); } catch (e) {}
      }

      let parsedAreas = data.areasAndTables;
      if (typeof parsedAreas === 'string') {
        try { parsedAreas = JSON.parse(parsedAreas); } catch (e) {}
      }

      let parsedDelivery = data.deliveryConfig;
      if (typeof parsedDelivery === 'string') {
        try { parsedDelivery = JSON.parse(parsedDelivery); } catch (e) {}
      }

      let parsedBilling = data.billingConfig;
      if (typeof parsedBilling === 'string') {
        try { parsedBilling = JSON.parse(parsedBilling); } catch (e) {}
      }

      setFormData(prev => ({ 
        ...prev, 
        ...data, 
        email,
        serviceHours: parsedHours || prev.serviceHours,
        areasAndTables: parsedAreas || prev.areasAndTables,
        deliveryConfig: parsedDelivery || prev.deliveryConfig,
        billingConfig: parsedBilling || prev.billingConfig
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

  const handleDeliveryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      deliveryConfig: {
        ...prev.deliveryConfig,
        [field]: value
      }
    }));
  };

  const handleBillingDefaultChange = (val) => {
    setFormData(prev => ({
      ...prev,
      billingConfig: {
        ...prev.billingConfig,
        defaultTaxGroup: val
      }
    }));
  };

  const handleAddTaxGroup = () => {
    const name = prompt('Enter Tax Group Name (e.g., Luxury Dining (18%)):');
    if (!name || !name.trim()) return;
    const rateStr = prompt('Enter Total Tax Rate % (e.g., 5, 12, 18):', '5');
    const rate = parseFloat(rateStr) || 0;
    const hsnCode = prompt('Enter HSN/SAC Code:', '996331');

    const halfRate = rate / 2;
    const newTg = {
      id: 'tg-' + Date.now(),
      name: name.trim(),
      rate: rate,
      cgst: halfRate,
      sgst: halfRate,
      hsnCode: hsnCode || '996331',
      status: 'Active'
    };

    setFormData(prev => ({
      ...prev,
      billingConfig: {
        ...prev.billingConfig,
        taxGroups: [...(prev.billingConfig.taxGroups || []), newTg]
      }
    }));
  };

  const handleToggleTaxGroupStatus = (tgId) => {
    setFormData(prev => ({
      ...prev,
      billingConfig: {
        ...prev.billingConfig,
        taxGroups: prev.billingConfig.taxGroups.map(tg => {
          if (tg.id === tgId) {
            const nextStatus = tg.status === 'Active' ? 'Inactive' : 'Active';
            return { ...tg, status: nextStatus };
          }
          return tg;
        })
      }
    }));
  };

  const handleDeleteTaxGroup = (tgId) => {
    if (!window.confirm('Are you sure you want to delete this Tax Group?')) return;
    setFormData(prev => ({
      ...prev,
      billingConfig: {
        ...prev.billingConfig,
        taxGroups: prev.billingConfig.taxGroups.filter(tg => tg.id !== tgId)
      }
    }));
  };

  const handleAddAgent = () => {
    const name = prompt('Enter Delivery Agent Name:');
    if (!name || !name.trim()) return;
    const phone = prompt('Enter Phone Number:', '+91 ');
    const vehicleNo = prompt('Enter Vehicle Number (e.g., TS 09 AB 1234):', '');

    const newAgent = {
      id: 'agent-' + Date.now(),
      name: name.trim(),
      phone: phone || '',
      vehicleNo: vehicleNo || '',
      status: 'Available'
    };

    setFormData(prev => ({
      ...prev,
      deliveryConfig: {
        ...prev.deliveryConfig,
        agents: [...(prev.deliveryConfig.agents || []), newAgent]
      }
    }));
  };

  const handleToggleAgentStatus = (agentId) => {
    setFormData(prev => ({
      ...prev,
      deliveryConfig: {
        ...prev.deliveryConfig,
        agents: prev.deliveryConfig.agents.map(ag => {
          if (ag.id === agentId) {
            const nextStatus = ag.status === 'Available' ? 'Unavailable' : 'Available';
            return { ...ag, status: nextStatus };
          }
          return ag;
        })
      }
    }));
  };

  const handleDeleteAgent = (agentId) => {
    if (!window.confirm('Are you sure you want to delete this delivery agent?')) return;
    setFormData(prev => ({
      ...prev,
      deliveryConfig: {
        ...prev.deliveryConfig,
        agents: prev.deliveryConfig.agents.filter(ag => ag.id !== agentId)
      }
    }));
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

  const handleAutoOpenToggle = (val) => {
    setFormData(prev => ({
      ...prev,
      areasAndTables: { ...prev.areasAndTables, autoOpenQrScan: val }
    }));
  };

  const handleAddArea = () => {
    const areaName = prompt('Enter new area name (e.g., Rooftop, Balcony):');
    if (!areaName || !areaName.trim()) return;

    const newArea = {
      id: 'area-' + Date.now(),
      name: areaName.trim(),
      tables: []
    };

    setFormData(prev => ({
      ...prev,
      areasAndTables: {
        ...prev.areasAndTables,
        areas: [...prev.areasAndTables.areas, newArea]
      }
    }));
  };

  const handleAddTable = (areaId) => {
    const tableName = prompt('Enter table name (e.g., T5, B1):');
    if (!tableName || !tableName.trim()) return;
    const paxCount = prompt('Enter seating capacity (pax):', '4');

    const newTable = {
      id: 'table-' + Date.now(),
      name: tableName.trim(),
      pax: parseInt(paxCount) || 4,
      qrEnabled: true,
      status: 'Available',
      captain: 'Unassigned'
    };

    setFormData(prev => ({
      ...prev,
      areasAndTables: {
        ...prev.areasAndTables,
        areas: prev.areasAndTables.areas.map(area => {
          if (area.id === areaId) {
            return { ...area, tables: [...area.tables, newTable] };
          }
          return area;
        })
      }
    }));
  };

  const handleToggleTableQr = (areaId, tableId) => {
    setFormData(prev => ({
      ...prev,
      areasAndTables: {
        ...prev.areasAndTables,
        areas: prev.areasAndTables.areas.map(area => {
          if (area.id === areaId) {
            return {
              ...area,
              tables: area.tables.map(t => t.id === tableId ? { ...t, qrEnabled: !t.qrEnabled } : t)
            };
          }
          return area;
        })
      }
    }));
  };

  const handleDeleteTable = (areaId, tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    setFormData(prev => ({
      ...prev,
      areasAndTables: {
        ...prev.areasAndTables,
        areas: prev.areasAndTables.areas.map(area => {
          if (area.id === areaId) {
            return {
              ...area,
              tables: area.tables.filter(t => t.id !== tableId)
            };
          }
          return area;
        })
      }
    }));
  };

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
      const latestRes = await fetch(`${API_BASE_URL}/api/v1/restaurants/email/${formData.email}`);
      const latestData = latestRes.ok ? await latestRes.json() : fullProfile;

      let existingAreasMap = {};
      let latestAreasAndTables = formData.areasAndTables;

      try {
        const parsedLatestAreas = typeof latestData.areasAndTables === 'string' 
          ? JSON.parse(latestData.areasAndTables) 
          : latestData.areasAndTables;

        if (parsedLatestAreas && parsedLatestAreas.areas) {
          latestAreasAndTables = parsedLatestAreas;
          parsedLatestAreas.areas.forEach(a => {
            (a.tables || []).forEach(t => {
              existingAreasMap[t.id] = { status: t.status, captain: t.captain, qrEnabled: t.qrEnabled };
            });
          });
        }
      } catch (err) {}

      const mergedAreas = {
        ...latestAreasAndTables,
        autoOpenQrScan: formData.areasAndTables.autoOpenQrScan,
        areas: formData.areasAndTables.areas.map(area => ({
          ...area,
          tables: area.tables.map(t => ({
            ...t,
            status: existingAreasMap[t.id]?.status || t.status || 'Available',
            captain: existingAreasMap[t.id]?.captain || t.captain || 'Unassigned',
            qrEnabled: t.qrEnabled ?? true
          }))
        }))
      };

      const payload = {
        ...latestData,
        ...formData,
        serviceHours: JSON.stringify(formData.serviceHours),
        areasAndTables: JSON.stringify(mergedAreas),
        deliveryConfig: JSON.stringify(formData.deliveryConfig),
        billingConfig: JSON.stringify(formData.billingConfig)
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
      setFullProfile(updated);

      let parsedHours = updated.serviceHours;
      if (typeof parsedHours === 'string') {
        try { parsedHours = JSON.parse(parsedHours); } catch (e) {}
      }
      let parsedAreas = updated.areasAndTables;
      if (typeof parsedAreas === 'string') {
        try { parsedAreas = JSON.parse(parsedAreas); } catch (e) {}
      }
      let parsedDelivery = updated.deliveryConfig;
      if (typeof parsedDelivery === 'string') {
        try { parsedDelivery = JSON.parse(parsedDelivery); } catch (e) {}
      }
      let parsedBilling = updated.billingConfig;
      if (typeof parsedBilling === 'string') {
        try { parsedBilling = JSON.parse(parsedBilling); } catch (e) {}
      }

      setFormData(prev => ({ 
        ...prev, 
        ...updated,
        serviceHours: parsedHours || prev.serviceHours,
        areasAndTables: parsedAreas || prev.areasAndTables,
        deliveryConfig: parsedDelivery || prev.deliveryConfig,
        billingConfig: parsedBilling || prev.billingConfig
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
    { id: 'delivery', label: 'Delivery', icon: '🛵' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'printers', label: 'Printers & Receipts', icon: '🖨️' },
    { id: 'users', label: 'Users', icon: '👥' },
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
                        Configure working days with multiple shifts. Gaps between shifts are treated as breaks automatically.
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

            {/* TAB 4: AREAS & TABLES */}
            {activeTab === 'tables' && (
              <div style={styles.sectionGroup}>
                <div style={styles.serviceHoursBanner}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <div style={{fontWeight: '950', color: '#0369a1', fontSize: '15px'}}>Auto-Open on QR Scan</div>
                    <div style={{fontSize: '12px', color: '#0c4a6e', fontWeight: '800'}}>
                      Let customers open a table by scanning, without staff opening it first.
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.areasAndTables?.autoOpenQrScan ?? true} 
                    onChange={e => handleAutoOpenToggle(e.target.checked)}
                    style={{width: '22px', height: '22px', cursor: 'pointer', accentColor: '#0284c7'}}
                  />
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                  <button type="button" onClick={handleAddArea} style={styles.addAreaBtn}>
                    + Add Area
                  </button>
                </div>

                <div style={styles.noticeBanner}>
                  Every table can have its own QR code. Customers scan it to view the menu and add items directly to the table's order in POS.
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '10px'}}>
                  {formData.areasAndTables?.areas?.map(area => (
                    <div key={area.id} style={styles.areaContainer}>
                      <div style={styles.areaHeader}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                          <span style={{fontSize: '16px'}}>🪑</span>
                          <span style={{fontWeight: '950', fontSize: '16px', color: '#0f172a'}}>{area.name}</span>
                          <span style={{fontSize: '12px', color: '#64748b', fontWeight: '800'}}>({area.tables?.length || 0} tables)</span>
                        </div>
                        <button type="button" onClick={() => handleAddTable(area.id)} style={styles.addTableBtn}>
                          + Add Table
                        </button>
                      </div>

                      <div style={styles.tablesGrid}>
                        {area.tables?.map(table => (
                          <div 
                            key={table.id} 
                            style={styles.tableCard}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{fontWeight: '950', fontSize: '15px', color: '#0f172a'}}>{table.name}</span>
                                <span style={{backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', border: '1px solid #cbd5e1'}}>
                                  # QR {table.qrEnabled ? 'on' : 'off'}
                                </span>
                              </div>
                              <button type="button" onClick={() => handleDeleteTable(area.id, table.id)} style={styles.iconBtn} title="Delete Table">
                                🗑️
                              </button>
                            </div>

                            <div style={{fontSize: '12px', color: '#475569', fontWeight: '800', marginBottom: '14px'}}>
                              {table.pax} pax · <strong style={{color: table.status === 'Occupied' ? '#dc2626' : '#059669'}}>{table.status || 'Available'}</strong>
                            </div>

                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #f1f5f9', paddingTop: '10px'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <input 
                                  type="checkbox" 
                                  checked={table.qrEnabled ?? true} 
                                  onChange={() => handleToggleTableQr(area.id, table.id)}
                                  style={{width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669'}}
                                />
                                <span style={{fontSize: '12px', fontWeight: '900', color: '#0f172a'}}>QR ordering</span>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => alert(`Viewing QR Code for ${table.name} (${area.name})`)}
                                style={styles.viewQrBtn}
                              >
                                📱 View QR
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: DELIVERY */}
            {activeTab === 'delivery' && (
              <div style={styles.sectionGroup}>
                <h3 style={styles.sectionTitle}>🛵 Delivery Setup</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Service Radius (KM)</label>
                    <input 
                      type="number" 
                      value={formData.deliveryConfig?.serviceRadius || '5'} 
                      onChange={e => handleDeliveryChange('serviceRadius', e.target.value)} 
                      style={styles.input} 
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Point of Contact Name</label>
                    <input 
                      type="text" 
                      value={formData.deliveryConfig?.contactName || ''} 
                      onChange={e => handleDeliveryChange('contactName', e.target.value)} 
                      placeholder="e.g. Ramesh" 
                      style={styles.input} 
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Point of Contact Number</label>
                    <input 
                      type="text" 
                      value={formData.deliveryConfig?.contactNumber || ''} 
                      onChange={e => handleDeliveryChange('contactNumber', e.target.value)} 
                      placeholder="+91..." 
                      style={styles.input} 
                    />
                  </div>
                </div>

                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>📦 Delivery Method</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Delivery Partner</label>
                    <select 
                      value={formData.deliveryConfig?.deliveryPartner || 'WhatsCom'} 
                      onChange={e => handleDeliveryChange('deliveryPartner', e.target.value)} 
                      style={styles.input}
                    >
                      <option value="WhatsCom">WhatsCom</option>
                      <option value="Dunzo">Dunzo</option>
                      <option value="Shadowfax">Shadowfax</option>
                      <option value="In-House">In-House Fleet</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Delivery Fee Charged To</label>
                    <select 
                      value={formData.deliveryConfig?.deliveryFeeChargedTo || 'Customer'} 
                      onChange={e => handleDeliveryChange('deliveryFeeChargedTo', e.target.value)} 
                      style={styles.input}
                    >
                      <option value="Customer">Customer</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Free">Free Delivery</option>
                    </select>
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px'}}>
                  <h3 style={{fontSize: '17px', fontWeight: '950', color: '#0f172a', margin: 0}}>
                    👥 Delivery Agents ({formData.deliveryConfig?.agents?.length || 0})
                  </h3>
                  <button type="button" onClick={handleAddAgent} style={styles.addAreaBtn}>
                    + Add Agent
                  </button>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px'}}>
                  {formData.deliveryConfig?.agents?.map(agent => (
                    <div key={agent.id} style={styles.agentCard}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '14px'}}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight: '950', fontSize: '15px', color: '#0f172a'}}>{agent.name}</div>
                          <div style={{fontSize: '12px', color: '#64748b', fontWeight: '800', marginTop: '2px'}}>
                            📞 {agent.phone} · 🚗 {agent.vehicleNo || 'No Vehicle No.'}
                          </div>
                        </div>
                      </div>

                      <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                        <span style={{
                          backgroundColor: agent.status === 'Available' ? '#dcfce7' : '#fee2e2',
                          color: agent.status === 'Available' ? '#15803d' : '#991b1b',
                          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950'
                        }}>
                          {agent.status || 'Available'}
                        </span>
                        
                        <button 
                          type="button" 
                          onClick={() => handleToggleAgentStatus(agent.id)}
                          style={styles.agentToggleBtn}
                        >
                          {agent.status === 'Available' ? 'Set unavailable' : 'Set available'}
                        </button>

                        <button 
                          type="button" 
                          onClick={() => handleDeleteAgent(agent.id)}
                          style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}}
                          title="Delete Agent"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: BILLING & TAX */}
            {activeTab === 'billing' && (
              <div style={styles.sectionGroup}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                  <div>
                    <h3 style={{fontSize: '17px', fontWeight: '950', color: '#0f172a', margin: 0}}>Tax Groups</h3>
                    <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', margin: '4px 0 0 0'}}>
                      Shared GST rates assigned to menu items. CGST and SGST are each half the rate.
                    </p>
                  </div>
                  <button type="button" onClick={handleAddTaxGroup} style={styles.addTaxGroupBtn}>
                    + New Tax Group
                  </button>
                </div>

                <div style={{marginBottom: '20px', maxWidth: '360px'}}>
                  <label style={{fontSize: '12px', fontWeight: '950', color: '#0f172a', display: 'block', marginBottom: '6px'}}>
                    Default Tax Group (pre-selected for new items)
                  </label>
                  <select 
                    value={formData.billingConfig?.defaultTaxGroup || 'Standard Restaurant (5%)'} 
                    onChange={e => handleBillingDefaultChange(e.target.value)}
                    style={styles.input}
                  >
                    <option value="No default">No default</option>
                    {formData.billingConfig?.taxGroups?.map(tg => (
                      <option key={tg.id} value={tg.name}>{tg.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Tax Group Name</th>
                        <th style={styles.th}>Rate</th>
                        <th style={styles.th}>CGST</th>
                        <th style={styles.th}>SGST</th>
                        <th style={styles.th}>HSN/SAC Code</th>
                        <th style={styles.th}>Status</th>
                        <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.billingConfig?.taxGroups?.map(tg => (
                        <tr key={tg.id} style={styles.tableRow}>
                          <td style={styles.td}><strong style={{color: '#0f172a'}}>{tg.name}</strong></td>
                          <td style={styles.td}>{tg.rate}%</td>
                          <td style={styles.td}>{tg.cgst}%</td>
                          <td style={styles.td}>{tg.sgst}%</td>
                          <td style={styles.td}>{tg.hsnCode}</td>
                          <td style={styles.td}>
                            <span style={{
                              backgroundColor: tg.status === 'Active' ? '#dcfce7' : '#fee2e2',
                              color: tg.status === 'Active' ? '#15803d' : '#991b1b',
                              padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950'
                            }}>
                              {tg.status}
                            </span>
                          </td>
                          <td style={{...styles.td, textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center'}}>
                            <button 
                              type="button" 
                              onClick={() => alert(`Editing tax group: ${tg.name}`)}
                              style={styles.actionEditBtn}
                            >
                              Edit
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleToggleTaxGroupStatus(tg.id)}
                              style={styles.actionDeactivateBtn}
                            >
                              {tg.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteTaxGroup(tg.id)}
                              style={styles.actionDeleteBtn}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PLACEHOLDER FOR OTHER TABS */}
            {activeTab !== 'business' && activeTab !== 'profile' && activeTab !== 'hours' && activeTab !== 'tables' && activeTab !== 'delivery' && activeTab !== 'billing' && (
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
  timeInput: { padding: '8px 14px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '13px', fontWeight: '900', color: '#0f172a', backgroundColor: '#fff', width: '150px', outline: 'none' },
  addAreaBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' },
  noticeBanner: { backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' },
  areaContainer: { backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '14px', padding: '16px' },
  areaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px' },
  addTableBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' },
  tablesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  tableCard: { backgroundColor: '#fff', border: '2px solid #cbd5e1', borderRadius: '12px', padding: '14px', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  iconBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' },
  viewQrBtn: { backgroundColor: '#f1f5f9', color: '#0f172a', border: '1.5px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' },
  agentCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '14px', padding: '16px' },
  agentToggleBtn: { backgroundColor: '#fff', color: '#0f172a', border: '1.5px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontWeight: '950', fontSize: '11px', cursor: 'pointer' },
  addTaxGroupBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' },
  tableWrapper: { width: '100%', overflowX: 'auto', border: '2px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '12px 16px', fontWeight: '950', color: '#475569' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 16px', fontWeight: '800', color: '#334155' },
  actionEditBtn: { background: 'none', border: 'none', color: '#2563eb', fontWeight: '900', cursor: 'pointer' },
  actionDeactivateBtn: { background: 'none', border: 'none', color: '#d97706', fontWeight: '900', cursor: 'pointer' },
  actionDeleteBtn: { background: 'none', border: 'none', color: '#dc2626', fontWeight: '900', cursor: 'pointer' }
};