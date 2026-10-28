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

  // Inline Form States
  const [showAddAreaBox, setShowAddAreaBox] = useState(false);
  const [newAreaNameInput, setNewAreaNameInput] = useState('');

  const [activeAreaForTableBox, setActiveAreaForTableBox] = useState(null);
  const [newTableForm, setNewTableForm] = useState({ name: '', pax: 4 });

  const [showAddAgentBox, setShowAddAgentBox] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({ name: '', phone: '', vehicleNo: '' });

  const [taxFormMode, setTaxFormMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [taxFormData, setTaxFormData] = useState({
    name: '',
    rate: '',
    cgst: '',
    sgst: '',
    hsnCode: '',
    itcEligible: false,
    active: true
  });

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
        { id: 'tg-1', name: 'Standard Restaurant (5%)', rate: 5, cgst: 2.5, sgst: 2.5, hsnCode: '996331', itcEligible: false, status: 'Active' },
        { id: 'tg-2', name: 'Hotel Dining (Specified Premises) (18%)', rate: 18, cgst: 9, sgst: 9, hsnCode: '996331', itcEligible: false, status: 'Active' },
        { id: 'tg-3', name: 'Aerated/Carbonated Beverage (40%)', rate: 40, cgst: 20, sgst: 20, hsnCode: '220210', itcEligible: false, status: 'Active' },
        { id: 'tg-4', name: 'Non-Taxable / Exempt (0%)', rate: 0, cgst: 0, sgst: 0, hsnCode: '996331', itcEligible: false, status: 'Active' }
      ]
    },
    // 🖨️ Receipt & Printer Settings State
    receiptConfig: {
      restaurantName: 'LINGA FOODS',
      headerText: 'Linga Foods - Wonghikal',
      address: 'LINGA FOODS, No. 1540, Vellore Main Road, Wonghikal, Tiruvannamalai, Tamil Nadu 606604',
      phone: '91234400635',
      gstin: '37AAFP4128L1ZI',
      fssai: 'FSSAI: 22426260001195',
      footerNote: 'Thank You For Visiting Us!\n*** TEST PRINT ***\n*** NOT A VALID BILL / INVOICE ***',
      paperSize: '80mm'
    },
    printRules: {
      counterReceiptTrigger: 'auto',
      counterKotTrigger: 'auto',
      tableReceiptTrigger: 'manual',
      tableKotTrigger: 'auto',
      takeawayReceiptTrigger: 'auto',
      takeawayKotTrigger: 'auto'
    },
    printerInfo: {
      printerName: '',
      printReceiptDoc: true,
      printKotDoc: false
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

      let parsedReceipt = data.receiptConfig;
      if (typeof parsedReceipt === 'string') {
        try { parsedReceipt = JSON.parse(parsedReceipt); } catch (e) {}
      }

      let parsedRules = data.printRules;
      if (typeof parsedRules === 'string') {
        try { parsedRules = JSON.parse(parsedRules); } catch (e) {}
      }

      setFormData(prev => ({ 
        ...prev, 
        ...data, 
        email,
        serviceHours: parsedHours || prev.serviceHours,
        areasAndTables: parsedAreas || prev.areasAndTables,
        deliveryConfig: parsedDelivery || prev.deliveryConfig,
        billingConfig: parsedBilling || prev.billingConfig,
        receiptConfig: parsedReceipt || prev.receiptConfig,
        printRules: parsedRules || prev.printRules
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

  // --- Inline Area & Table Handlers ---
  const handleSaveNewArea = (e) => {
    e.preventDefault();
    if (!newAreaNameInput.trim()) return;

    const newArea = {
      id: 'area-' + Date.now(),
      name: newAreaNameInput.trim(),
      tables: []
    };

    setFormData(prev => ({
      ...prev,
      areasAndTables: {
        ...prev.areasAndTables,
        areas: [...prev.areasAndTables.areas, newArea]
      }
    }));
    setNewAreaNameInput('');
    setShowAddAreaBox(false);
  };

  const handleSaveNewTable = (e, areaId) => {
    e.preventDefault();
    if (!newTableForm.name.trim()) return;

    const newTable = {
      id: 'table-' + Date.now(),
      name: newTableForm.name.trim().toUpperCase(),
      pax: parseInt(newTableForm.pax) || 4,
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
    setNewTableForm({ name: '', pax: 4 });
    setActiveAreaForTableBox(null);
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

  // --- Inline Delivery Agent Handlers ---
  const handleSaveNewAgent = (e) => {
    e.preventDefault();
    if (!newAgentForm.name.trim()) return;

    const newAgent = {
      id: 'agent-' + Date.now(),
      name: newAgentForm.name.trim(),
      phone: newAgentForm.phone.trim() || '',
      vehicleNo: newAgentForm.vehicleNo.trim() || '',
      status: 'Available'
    };

    setFormData(prev => ({
      ...prev,
      deliveryConfig: {
        ...prev.deliveryConfig,
        agents: [...(prev.deliveryConfig.agents || []), newAgent]
      }
    }));
    setNewAgentForm({ name: '', phone: '', vehicleNo: '' });
    setShowAddAgentBox(false);
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

  // --- Inline Tax Group Handlers ---
  const handleTaxRateChange = (val) => {
    const rateNum = parseFloat(val) || 0;
    const half = (rateNum / 2).toFixed(1).replace(/\.0$/, '');
    setTaxFormData(prev => ({
      ...prev,
      rate: val,
      cgst: half,
      sgst: half
    }));
  };

  const handleOpenAddTaxForm = () => {
    setTaxFormData({ name: '', rate: '', cgst: '', sgst: '', hsnCode: '', itcEligible: false, active: true });
    setEditingTaxId(null);
    setTaxFormMode('add');
  };

  const handleOpenEditTaxForm = (tg) => {
    setTaxFormData({
      name: tg.name,
      rate: tg.rate,
      cgst: tg.cgst,
      sgst: tg.sgst,
      hsnCode: tg.hsnCode,
      itcEligible: tg.itcEligible || false,
      active: tg.status === 'Active'
    });
    setEditingTaxId(tg.id);
    setTaxFormMode('edit');
  };

  const handleSaveTaxGroup = (e) => {
    e.preventDefault();
    if (!taxFormData.name.trim()) return alert('Enter Group Name');

    const rateNum = parseFloat(taxFormData.rate) || 0;
    const halfRate = rateNum / 2;

    const groupObj = {
      id: editingTaxId || ('tg-' + Date.now()),
      name: taxFormData.name.trim(),
      rate: rateNum,
      cgst: parseFloat(taxFormData.cgst) || halfRate,
      sgst: parseFloat(taxFormData.sgst) || halfRate,
      hsnCode: taxFormData.hsnCode.trim() || '996331',
      itcEligible: taxFormData.itcEligible,
      status: taxFormData.active ? 'Active' : 'Inactive'
    };

    setFormData(prev => {
      const existing = prev.billingConfig?.taxGroups || [];
      let updatedGroups = [];
      if (editingTaxId) {
        updatedGroups = existing.map(tg => tg.id === editingTaxId ? groupObj : tg);
      } else {
        updatedGroups = [...existing, groupObj];
      }
      return {
        ...prev,
        billingConfig: {
          ...prev.billingConfig,
          taxGroups: updatedGroups
        }
      };
    });

    setTaxFormMode('list');
    setEditingTaxId(null);
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
        billingConfig: JSON.stringify(formData.billingConfig),
        receiptConfig: JSON.stringify(formData.receiptConfig),
        printRules: JSON.stringify(formData.printRules)
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
      let parsedReceipt = updated.receiptConfig;
      if (typeof parsedReceipt === 'string') {
        try { parsedReceipt = JSON.parse(parsedReceipt); } catch (e) {}
      }
      let parsedRules = updated.printRules;
      if (typeof parsedRules === 'string') {
        try { parsedRules = JSON.parse(parsedRules); } catch (e) {}
      }

      setFormData(prev => ({ 
        ...prev, 
        ...updated,
        serviceHours: parsedHours || prev.serviceHours,
        areasAndTables: parsedAreas || prev.areasAndTables,
        deliveryConfig: parsedDelivery || prev.deliveryConfig,
        billingConfig: parsedBilling || prev.billingConfig,
        receiptConfig: parsedReceipt || prev.receiptConfig,
        printRules: parsedRules || prev.printRules
      }));
      showMsg('✅ Printer, Receipt & Business settings successfully saved to database!', 'success');
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
          <span style={styles.subtitle}>Manage your business configurations, printers & receipt templates (Account: {formData.email})</span>
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
                  <button type="button" onClick={() => setShowAddAreaBox(true)} style={styles.addAreaBtn}>
                    + Add Area
                  </button>
                </div>

                {showAddAreaBox && (
                  <div style={styles.inlineCardForm}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '15px', fontWeight: '950', color: '#0f172a'}}>Add New Area</h4>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <input 
                        type="text" 
                        placeholder="Enter area name (e.g., Rooftop, Balcony)" 
                        value={newAreaNameInput} 
                        onChange={e => setNewAreaNameInput(e.target.value)} 
                        style={styles.input} 
                        autoFocus 
                      />
                      <button type="button" onClick={handleSaveNewArea} style={styles.saveInlineBtn}>Save Area</button>
                      <button type="button" onClick={() => setShowAddAreaBox(false)} style={styles.cancelInlineBtn}>Cancel</button>
                    </div>
                  </div>
                )}

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
                        <button type="button" onClick={() => setActiveAreaForTableBox(area.id)} style={styles.addTableBtn}>
                          + Add Table
                        </button>
                      </div>

                      {activeAreaForTableBox === area.id && (
                        <div style={{...styles.inlineCardForm, marginBottom: '16px'}}>
                          <h4 style={{margin: '0 0 10px 0', fontSize: '14px', fontWeight: '950', color: '#0f172a'}}>Add Table in {area.name}</h4>
                          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            <input 
                              type="text" 
                              placeholder="Table Name (e.g. T5)" 
                              value={newTableForm.name} 
                              onChange={e => setNewTableForm({...newTableForm, name: e.target.value})} 
                              style={{...styles.input, flex: 2}} 
                              autoFocus 
                            />
                            <input 
                              type="number" 
                              placeholder="Pax (seats)" 
                              value={newTableForm.pax} 
                              onChange={e => setNewTableForm({...newTableForm, pax: e.target.value})} 
                              style={{...styles.input, flex: 1}} 
                            />
                            <button type="button" onClick={e => handleSaveNewTable(e, area.id)} style={styles.saveInlineBtn}>Save Table</button>
                            <button type="button" onClick={() => setActiveAreaForTableBox(null)} style={styles.cancelInlineBtn}>Cancel</button>
                          </div>
                        </div>
                      )}

                      <div style={styles.tablesGrid}>
                        {area.tables?.map(table => (
                          <div key={table.id} style={styles.tableCard}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{fontWeight: '950', fontSize: '15px', color: '#0f172a'}}>{table.name}</span>
                                <span style={{backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', border: '1px solid #cbd5e1'}}>
                                  # QR {table.qrEnabled ? 'on' : 'off'}
                                </span>
                              </div>
                              <button type="button" onClick={() => handleDeleteTable(area.id, table.id)} style={styles.iconBtn} title="Delete Table">🗑️</button>
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
                              <button type="button" onClick={() => alert(`Viewing QR Code for ${table.name}`)} style={styles.viewQrBtn}>📱 View QR</button>
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
                    <input type="number" value={formData.deliveryConfig?.serviceRadius || '5'} onChange={e => handleDeliveryChange('serviceRadius', e.target.value)} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Point of Contact Name</label>
                    <input type="text" value={formData.deliveryConfig?.contactName || ''} onChange={e => handleDeliveryChange('contactName', e.target.value)} placeholder="e.g. Ramesh" style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Point of Contact Number</label>
                    <input type="text" value={formData.deliveryConfig?.contactNumber || ''} onChange={e => handleDeliveryChange('contactNumber', e.target.value)} placeholder="+91..." style={styles.input} />
                  </div>
                </div>

                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>📦 Delivery Method</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Delivery Partner</label>
                    <select value={formData.deliveryConfig?.deliveryPartner || 'WhatsCom'} onChange={e => handleDeliveryChange('deliveryPartner', e.target.value)} style={styles.input}>
                      <option value="WhatsCom">WhatsCom</option>
                      <option value="Dunzo">Dunzo</option>
                      <option value="Shadowfax">Shadowfax</option>
                      <option value="In-House">In-House Fleet</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Delivery Fee Charged To</label>
                    <select value={formData.deliveryConfig?.deliveryFeeChargedTo || 'Customer'} onChange={e => handleDeliveryChange('deliveryFeeChargedTo', e.target.value)} style={styles.input}>
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
                  <button type="button" onClick={() => setShowAddAgentBox(true)} style={styles.addAreaBtn}>
                    + Add Agent
                  </button>
                </div>

                {showAddAgentBox && (
                  <div style={styles.inlineCardForm}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '15px', fontWeight: '950', color: '#0f172a'}}>Add New Delivery Agent</h4>
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                      <input 
                        type="text" 
                        placeholder="Agent Name *" 
                        value={newAgentForm.name} 
                        onChange={e => setNewAgentForm({...newAgentForm, name: e.target.value})} 
                        style={{...styles.input, flex: 2}} 
                        autoFocus 
                      />
                      <input 
                        type="text" 
                        placeholder="Phone Number (+91...)" 
                        value={newAgentForm.phone} 
                        onChange={e => setNewAgentForm({...newAgentForm, phone: e.target.value})} 
                        style={{...styles.input, flex: 1.5}} 
                      />
                      <input 
                        type="text" 
                        placeholder="Vehicle No (e.g., TS 09 AB 1234)" 
                        value={newAgentForm.vehicleNo} 
                        onChange={e => setNewAgentForm({...newAgentForm, vehicleNo: e.target.value})} 
                        style={{...styles.input, flex: 1.5}} 
                      />
                      <button type="button" onClick={handleSaveNewAgent} style={styles.saveInlineBtn}>Save Agent</button>
                      <button type="button" onClick={() => setShowAddAgentBox(false)} style={styles.cancelInlineBtn}>Cancel</button>
                    </div>
                  </div>
                )}

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
                        
                        <button type="button" onClick={() => handleToggleAgentStatus(agent.id)} style={styles.agentToggleBtn}>
                          {agent.status === 'Available' ? 'Set unavailable' : 'Set available'}
                        </button>
                        <button type="button" onClick={() => handleDeleteAgent(agent.id)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}} title="Delete Agent">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: BILLING */}
            {activeTab === 'billing' && (
              <div style={styles.sectionGroup}>
                {taxFormMode === 'list' ? (
                  <>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <div>
                        <h3 style={{fontSize: '17px', fontWeight: '950', color: '#0f172a', margin: 0}}>Tax Groups</h3>
                        <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', margin: '4px 0 0 0'}}>
                          Shared GST rates assigned to menu items and mapped to receipts. CGST and SGST are each half the rate.
                        </p>
                      </div>
                      <button type="button" onClick={handleOpenAddTaxForm} style={styles.addTaxGroupBtn}>
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
                                <button type="button" onClick={() => handleOpenEditTaxForm(tg)} style={styles.actionEditBtn}>Edit</button>
                                <button type="button" onClick={() => handleToggleTaxGroupStatus(tg.id)} style={styles.actionDeactivateBtn}>
                                  {tg.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button type="button" onClick={() => handleDeleteTaxGroup(tg.id)} style={styles.actionDeleteBtn}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div style={styles.screenCardForm}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px'}}>
                      <div>
                        <h3 style={{margin: '0 0 4px 0', fontSize: '18px', fontWeight: '950', color: '#0f172a'}}>
                          {taxFormMode === 'add' ? 'New Tax Group' : 'Edit Tax Group'}
                        </h3>
                        <p style={{margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '800'}}>CGST and SGST are calculated automatically.</p>
                      </div>
                      <button type="button" onClick={() => setTaxFormMode('list')} style={{background: 'none', border: 'none', fontSize: '18px', fontWeight: '950', cursor: 'pointer', color: '#64748b'}}>✕</button>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px'}}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Group Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Standard Restaurant (5%)" 
                          value={taxFormData.name} 
                          onChange={e => setTaxFormData({...taxFormData, name: e.target.value})} 
                          style={styles.input} 
                          required 
                        />
                      </div>

                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Tax Rate % *</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 5, 12, 18" 
                          value={taxFormData.rate} 
                          onChange={e => handleTaxRateChange(e.target.value)} 
                          style={styles.input} 
                          required 
                        />
                      </div>

                      <div style={styles.grid2}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>CGST %</label>
                          <input 
                            type="text" 
                            value={taxFormData.cgst} 
                            onChange={e => setTaxFormData({...taxFormData, cgst: e.target.value})} 
                            style={{...styles.input, backgroundColor: '#f8fafc'}} 
                          />
                        </div>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>SGST %</label>
                          <input 
                            type="text" 
                            value={taxFormData.sgst} 
                            onChange={e => setTaxFormData({...taxFormData, sgst: e.target.value})} 
                            style={{...styles.input, backgroundColor: '#f8fafc'}} 
                          />
                        </div>
                      </div>

                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>HSN/SAC Code *</label>
                        <input 
                          type="text" 
                          value={taxFormData.hsnCode} 
                          onChange={e => setTaxFormData({...taxFormData, hsnCode: e.target.value})} 
                          style={styles.input} 
                          required 
                        />
                      </div>

                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0'}}>
                        <div>
                          <div style={{fontWeight: '950', fontSize: '13px', color: '#0f172a'}}>ITC Eligible</div>
                          <div style={{fontSize: '11px', color: '#64748b', fontWeight: '800'}}>Informational only — doesn't change bills.</div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={taxFormData.itcEligible} 
                          onChange={e => setTaxFormData({...taxFormData, itcEligible: e.target.checked})} 
                          style={{width: '20px', height: '20px', cursor: 'pointer', accentColor: '#059669'}} 
                        />
                      </div>

                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0'}}>
                        <div>
                          <div style={{fontWeight: '950', fontSize: '13px', color: '#0f172a'}}>Active</div>
                          <div style={{fontSize: '11px', color: '#64748b', fontWeight: '800'}}>Make this tax group available for menu mapping.</div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={taxFormData.active} 
                          onChange={e => setTaxFormData({...taxFormData, active: e.target.checked})} 
                          style={{width: '20px', height: '20px', cursor: 'pointer', accentColor: '#059669'}} 
                        />
                      </div>

                      <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px'}}>
                        <button type="button" onClick={() => setTaxFormMode('list')} style={styles.cancelFormBtn}>Cancel</button>
                        <button type="button" onClick={handleSaveTaxGroup} style={styles.saveFormBtn}>Save Tax Group</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: PRINTERS & RECEIPTS (FULL INTEGRATED) */}
            {activeTab === 'printers' && (
              <div style={styles.sectionGroup}>
                <h3 style={styles.sectionTitle}>🖨️ Thermal Printers & Receipt Templates</h3>
                <p style={{fontSize: '13px', color: '#64748b', fontWeight: '800', marginTop: '-4px', marginBottom: '20px'}}>
                  Configure your thermal printers, receipt branding fields, and print automation rules.
                </p>

                <div style={styles.serviceHoursBanner}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span style={{fontSize: '22px'}}>🖨️</span>
                    <div>
                      <div style={{fontWeight: '950', color: '#0369a1', fontSize: '15px'}}>Direct Browser & Thermal Printing</div>
                      <div style={{fontSize: '12px', color: '#0c4a6e', marginTop: '3px', fontWeight: '800'}}>
                        Receipts automatically format to 58mm or 80mm thermal paper widths upon printing.
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap'}}>
                  {/* Left Branding Fields */}
                  <div style={{flex: 1, minWidth: '300px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1.5px solid #e2e8f0'}}>
                    <h4 style={{margin: '0 0 16px 0', fontSize: '15px', fontWeight: '950', color: '#0f172a'}}>Receipt Branding & Fields</h4>
                    
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>RESTAURANT DISPLAY NAME</label>
                      <input 
                        style={styles.input} 
                        value={formData.receiptConfig?.restaurantName || ''} 
                        onChange={e => setFormData({...formData, receiptConfig: {...formData.receiptConfig, restaurantName: e.target.value}})} 
                      />
                    </div>

                    <div style={{...styles.fieldGroup, marginTop: '14px'}}>
                      <label style={styles.label}>HEADER TEXT / SUBTITLE</label>
                      <input 
                        style={styles.input} 
                        value={formData.receiptConfig?.headerText || ''} 
                        onChange={e => setFormData({...formData, receiptConfig: {...formData.receiptConfig, headerText: e.target.value}})} 
                      />
                    </div>

                    <div style={{...styles.fieldGroup, marginTop: '14px'}}>
                      <label style={styles.label}>STORE ADDRESS</label>
                      <textarea 
                        style={{...styles.input, height: '70px', resize: 'vertical'}} 
                        value={formData.receiptConfig?.address || ''} 
                        onChange={e => setFormData({...formData, receiptConfig: {...formData.receiptConfig, address: e.target.value}})} 
                      />
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px'}}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>PHONE NUMBER</label>
                        <input 
                          style={styles.input} 
                          value={formData.receiptConfig?.phone || ''} 
                          onChange={e => setFormData({...formData, receiptConfig: {...formData.receiptConfig, phone: e.target.value}})} 
                        />
                      </div>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>GST / TAX ID</label>
                        <input 
                          style={styles.input} 
                          value={formData.receiptConfig?.gstin || ''} 
                          onChange={e => setFormData({...formData, receiptConfig: {...formData.receiptConfig, gstin: e.target.value}})} 
                        />
                      </div>
                    </div>

                    <div style={{...styles.fieldGroup, marginTop: '14px'}}>
                      <label style={styles.label}>FSSAI / LICENSE NUMBER</label>
                      <input 
                        style={styles.input} 
                        value={formData.receiptConfig?.fssai || ''} 
                        onChange={e => setFormData({...formData, receiptConfig: {...formData.receiptConfig, fssai: e.target.value}})} 
                      />
                    </div>

                    <div style={{...styles.fieldGroup, marginTop: '14px'}}>
                      <label style={styles.label}>CUSTOM FOOTER NOTE</label>
                      <textarea 
                        style={{...styles.input, height: '70px', resize: 'vertical'}} 
                        value={formData.receiptConfig?.footerNote || ''} 
                        onChange={e => setFormData({...formData, receiptConfig: {...formData.receiptConfig, footerNote: e.target.value}})} 
                      />
                    </div>
                  </div>

                  {/* Right Live Preview */}
                  <div style={{width: '360px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1.5px solid #e2e8f0', textAlign: 'center'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'}}>
                      <h4 style={{margin: 0, fontSize: '13px', fontWeight: '950', color: '#64748b'}}>LIVE RECEIPT PREVIEW</h4>
                      <div style={{display: 'flex', gap: '6px'}}>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, receiptConfig: {...formData.receiptConfig, paperSize: '58mm'}})}
                          style={{backgroundColor: formData.receiptConfig?.paperSize === '58mm' ? '#059669' : '#f1f5f9', color: formData.receiptConfig?.paperSize === '58mm' ? '#fff' : '#334155', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '950', cursor: 'pointer'}}
                        >
                          58mm
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, receiptConfig: {...formData.receiptConfig, paperSize: '80mm'}})}
                          style={{backgroundColor: formData.receiptConfig?.paperSize === '80mm' ? '#059669' : '#f1f5f9', color: formData.receiptConfig?.paperSize === '80mm' ? '#fff' : '#334155', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '950', cursor: 'pointer'}}
                        >
                          80mm
                        </button>
                      </div>
                    </div>

                    <div style={{backgroundColor: '#fefefe', border: '1.5px dashed #cbd5e1', padding: '16px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '11px', textAlign: 'left', lineHeight: '1.4', color: '#000'}}>
                      <div style={{textAlign: 'center', fontWeight: 'bold', fontSize: '12px'}}>*** TEST PRINT ***</div>
                      <div style={{textAlign: 'center', fontWeight: '950', fontSize: '13px', marginTop: '4px'}}>{formData.receiptConfig?.restaurantName || 'RESTAURANT'}</div>
                      <div style={{textAlign: 'center', color: '#444', fontSize: '10px'}}>{formData.receiptConfig?.headerText || ''}</div>
                      <div style={{textAlign: 'center', color: '#444', fontSize: '10px', margin: '4px 0'}}>{formData.receiptConfig?.address || ''}</div>
                      <div style={{textAlign: 'center', color: '#444', fontSize: '10px'}}>Ph: {formData.receiptConfig?.phone || ''}</div>
                      <div style={{textAlign: 'center', color: '#444', fontSize: '10px'}}>GSTIN: {formData.receiptConfig?.gstin || ''}</div>
                      <div style={{textAlign: 'center', color: '#444', fontSize: '10px', marginBottom: '8px'}}>{formData.receiptConfig?.fssai || ''}</div>
                      
                      <div style={{borderTop: '1px dashed #000', margin: '6px 0'}}></div>
                      <div><strong>Invoice:</strong> INV-000724</div>
                      <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
                      
                      <div style={{borderTop: '1px dashed #000', margin: '6px 0'}}></div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
                        <span>Item</span><span>Qty Price</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Test Burger</span><span>2 x 200 = 400.00</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Test Coke</span><span>1 x 70 = 70.00</span>
                      </div>

                      <div style={{borderTop: '1px dashed #000', margin: '6px 0'}}></div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Subtotal:</span><span>₹470.00</span></div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Tax (5%):</span><span>₹23.50</span></div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginTop: '4px'}}>
                        <span>TOTAL:</span><span>₹494.00</span>
                      </div>
                      
                      <div style={{borderTop: '1px dashed #000', margin: '6px 0'}}></div>
                      <div style={{textAlign: 'center', whiteSpace: 'pre-line', fontSize: '10px', color: '#222', marginTop: '8px'}}>
                        {formData.receiptConfig?.footerNote || ''}
                      </div>
                    </div>
                  </div>
                </div>

                <h3 style={{...styles.sectionTitle, marginTop: '32px'}}>⚙️ Print Automation Rules</h3>
                <div style={styles.grid2}>
                  <div style={{backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1.5px solid #e2e8f0'}}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '14px', fontWeight: '950', color: '#0f172a'}}>Counter Orders</h4>
                    <label style={styles.label}>Receipt Print Trigger</label>
                    <select 
                      style={styles.input} 
                      value={formData.printRules?.counterReceiptTrigger || 'auto'}
                      onChange={e => setFormData({...formData, printRules: {...formData.printRules, counterReceiptTrigger: e.target.value}})}
                    >
                      <option value="auto">Automatically after successful payment</option>
                      <option value="manual">On Demand (Manual Print Button)</option>
                    </select>
                  </div>

                  <div style={{backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1.5px solid #e2e8f0'}}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '14px', fontWeight: '950', color: '#0f172a'}}>Table Orders</h4>
                    <label style={styles.label}>Receipt Print Trigger</label>
                    <select 
                      style={styles.input} 
                      value={formData.printRules?.tableReceiptTrigger || 'manual'}
                      onChange={e => setFormData({...formData, printRules: {...formData.printRules, tableReceiptTrigger: e.target.value}})}
                    >
                      <option value="auto">Automatically after successful payment</option>
                      <option value="manual">On Demand (Manual Print Button)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PLACEHOLDER FOR OTHER TABS */}
            {activeTab !== 'business' && activeTab !== 'profile' && activeTab !== 'hours' && activeTab !== 'tables' && activeTab !== 'delivery' && activeTab !== 'billing' && activeTab !== 'printers' && (
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
  placeholderTab: { textAlign: 'center', padding: '80px 20px', color: '#0f172a' },
  centerMsg: { padding: '40px', textAlign: 'center', fontWeight: '900', color: '#334155' },
  serviceHoursBanner: { backgroundColor: '#e0f2fe', border: '2px solid #7dd3fc', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  editHoursBtn: { backgroundColor: '#fff', color: '#0369a1', border: '2px solid #38bdf8', padding: '8px 16px', borderRadius: '10px', fontWeight: '950', fontSize: '12px', cursor: 'pointer' },
  dayCard: { backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '14px', padding: '18px', transition: 'all 0.25s ease' },
  dayCardHover: { borderColor: '#059669', backgroundColor: '#f0fdf4', transform: 'translateY(-2px)' },
  dayCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  timeInput: { padding: '8px 14px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '13px', fontWeight: '900', color: '#0f172a', backgroundColor: '#fff', width: '150px', outline: 'none' },
  addAreaBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' },
  noticeBanner: { backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' },
  areaContainer: { backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '14px', padding: '16px' },
  areaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px' },
  addTableBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' },
  tablesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' },
  tableCard: { backgroundColor: '#fff', border: '2px solid #cbd5e1', borderRadius: '12px', padding: '14px' },
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
  actionDeleteBtn: { background: 'none', border: 'none', color: '#dc2626', fontWeight: '900', cursor: 'pointer' },
  inlineCardForm: { backgroundColor: '#fff', border: '2px solid #0f172a', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  saveInlineBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '950', fontSize: '12px', cursor: 'pointer' },
  cancelInlineBtn: { backgroundColor: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontWeight: '950', fontSize: '12px', cursor: 'pointer' },
  screenCardForm: { backgroundColor: '#fff', border: '2.5px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
  saveFormBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  cancelFormBtn: { backgroundColor: '#fff', color: '#334155', border: '2px solid #cbd5e1', padding: '11px 18px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' }
};