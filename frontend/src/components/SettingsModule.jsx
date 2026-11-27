// FILE: src/components/SettingsModule.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AdvancedSettingsTab from './AdvancedSettingsTab';
import { useLanguage } from './LanguageContext';

const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  'http://localhost:8080'
).replace(/\/$/, '');
/* =====================================================================
   UI STYLESHEET  (flame palette · animated border on hover · responsive)
   orange #f97316 · amber #fb923c · deep orange #ea580c · red-orange #ef4444
   Inline styles can't do :hover / :focus / media queries, so they live here.
   Nothing in this block touches logic.
   ===================================================================== */

const UI_CSS = `
@property --sm-angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes sm-spin{to{--sm-angle:360deg}}
@keyframes sm-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}

/* ---------- animated border: a bright highlight circles the border on hover ---------- */
.sm-card{position:relative;transition:box-shadow .25s ease,border-color .25s ease,transform .2s ease}
.sm-card::before{
  content:'';position:absolute;inset:-2px;border-radius:inherit;padding:2px;pointer-events:none;z-index:2;
  background:conic-gradient(from var(--sm-angle),
    rgba(254,215,170,0) 0%,rgba(254,215,170,0) 40%,
    #fed7aa 58%,#ffffff 68%,#fb923c 78%,#ef4444 88%,rgba(254,215,170,0) 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  mask-composite:exclude;
  opacity:0;transition:opacity .35s ease;animation:sm-spin 3.4s linear infinite}
.sm-card:hover::before,.sm-card:focus-within::before{opacity:1}
.sm-card:hover{border-color:#fbd5b5 !important;box-shadow:0 0 0 1px rgba(253,186,116,.25),0 14px 30px -16px rgba(249,115,22,.5) !important}
.sm-lift:hover{transform:translateY(-2px)}

/* ---------- buttons ---------- */
.sm-btn-primary{background-image:linear-gradient(110deg,#fb923c 0%,#f97316 35%,#fdba74 50%,#f97316 65%,#ef4444 100%);background-size:300% 100%;background-position:100% 0;
  transition:background-position .6s ease,box-shadow .2s ease,transform .1s ease}
.sm-btn-primary:not(:disabled):hover{background-position:0 0;box-shadow:0 8px 20px -6px rgba(249,115,22,.6)}
.sm-btn-primary:not(:disabled):active{transform:translateY(1px);box-shadow:none}
.sm-btn-primary:disabled{opacity:.65;cursor:not-allowed}

.sm-btn-ghost{transition:background-color .2s ease,border-color .2s ease,color .2s ease,box-shadow .2s ease,transform .1s ease}
.sm-btn-ghost:hover{background-color:#fff7ed !important;border-color:#fb923c !important;color:#c2410c !important;box-shadow:0 4px 12px -4px rgba(249,115,22,.35)}
.sm-btn-ghost:active{transform:translateY(1px);box-shadow:none}

.sm-btn-link{transition:background-color .15s ease,color .15s ease;padding:4px 8px !important;border-radius:6px !important}
.sm-btn-link:hover{background:#fff1e6 !important}

.sm-icon-btn{transition:background-color .15s ease,transform .15s ease;border-radius:8px !important;padding:4px 6px !important}
.sm-icon-btn:hover{background:#fff1e6 !important;transform:scale(1.12)}

.sm-sidebar-btn{transition:background-color .2s ease,border-color .2s ease,color .2s ease,transform .2s ease,box-shadow .2s ease}
.sm-sidebar-btn:not(.is-active):hover{background-color:#fff7ed !important;border-color:#fed7aa !important;color:#c2410c !important;transform:translateX(3px)}
.sm-sidebar-btn.is-active{background-image:linear-gradient(135deg,#fff7ed,#ffedd5);box-shadow:0 8px 18px -12px rgba(249,115,22,.7)}

.sm-btn-primary:focus-visible,.sm-btn-ghost:focus-visible,.sm-btn-link:focus-visible,.sm-icon-btn:focus-visible,.sm-sidebar-btn:focus-visible{
  outline:2px solid #fb923c;outline-offset:2px}

/* ---------- form fields (every input/select inside the module) ---------- */
.sm-root input:not([type=checkbox]):not([type=radio]),.sm-root select{transition:border-color .2s ease,box-shadow .2s ease,background-color .2s ease}
.sm-root input:not([type=checkbox]):not([type=radio]):not(:disabled):hover,.sm-root select:hover{border-color:#fb923c !important}
.sm-root input:not([type=checkbox]):not([type=radio]):focus,.sm-root select:focus{border-color:#f97316 !important;box-shadow:0 0 0 3px rgba(251,146,60,.25);outline:none}

/* ---------- table ---------- */
.sm-tr{transition:background-color .15s ease}
.sm-tr:hover{background-color:#fff8f3}

/* ---------- misc ---------- */
.sm-alert{animation:sm-in .25s ease}
.sm-user-grid{display:grid;grid-template-columns:1.6fr .9fr 1fr 1fr auto;gap:12px;align-items:flex-end}

/* ---------- responsive ---------- */
@media (max-width:1100px){
  .sm-user-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:900px){
  .sm-root{padding:14px !important}
  .sm-layout{flex-direction:column !important;gap:14px !important}
  .sm-sidebar{width:100% !important;flex-direction:row !important;overflow-x:auto;box-sizing:border-box;-webkit-overflow-scrolling:touch}
  .sm-sidebar-btn{width:auto !important;flex:0 0 auto;white-space:nowrap}
  .sm-sidebar-btn:not(.is-active):hover{transform:translateY(-1px)}
  .sm-content{width:100%;box-sizing:border-box;min-height:0 !important;padding:16px !important}
}
@media (max-width:720px){
  .sm-header{flex-direction:column;align-items:stretch !important;gap:12px;padding:14px 16px !important}
  .sm-header-actions{justify-content:space-between;flex-wrap:wrap;gap:10px !important}
  .sm-banner,.sm-row-card,.sm-day-head,.sm-area-head,.sm-wrap{flex-wrap:wrap;gap:10px}
  .sm-time-row{flex-wrap:wrap}
  .sm-time-input{width:auto !important;flex:1 1 120px;min-width:0}
}
@media (max-width:560px){
  .sm-user-grid{grid-template-columns:minmax(0,1fr)}
  .sm-wrap > input,.sm-wrap > select{flex:1 1 100% !important}
}

/* ---------- accessibility ---------- */
@media (prefers-reduced-motion:reduce){
  .sm-card::before{animation:none !important}
  .sm-card,.sm-btn-primary,.sm-btn-ghost,.sm-btn-link,.sm-icon-btn,.sm-sidebar-btn,.sm-tr,.sm-alert{transition:none !important;animation:none !important}
}
`;

function UiStyles() {
  return <style>{UI_CSS}</style>;
}

export default function SettingsModule() {
  const { setLanguage, t, translateDbValue } = useLanguage();

  const [activeTab, setActiveTab] = useState('business');
  const [receiptSubTab, setReceiptSubTab] = useState('printers');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const [fullProfile, setFullProfile] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUserForm, setNewUserForm] = useState({ name: '', userId: '', role: 'Captain', phone: '' });

  const [showAddAreaBox, setShowAddAreaBox] = useState(false);
  const [newAreaNameInput, setNewAreaNameInput] = useState('');
  const [activeAreaForTableBox, setActiveAreaForTableBox] = useState(null);
  const [newTableForm, setNewTableForm] = useState({ name: '', pax: 4 });

  const [showAddAgentBox, setShowAddAgentBox] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({ name: '', phone: '', vehicleNo: '' });

  const [taxFormMode, setTaxFormMode] = useState('list');
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [taxFormData, setTaxFormData] = useState({
    name: '', rate: '', cgst: '', sgst: '', hsnCode: '', itcEligible: false, active: true
  });

  const [formData, setFormData] = useState({
    restaurantId: '', userId: '', email: '', businessName: '', ownerName: '', phoneNumber: '', whatsappNumber: '',
    website: '', gstnNumber: '', businessRegistrationNumber: '', businessLicenseNumber: '', addressLine1: '',
    addressLine2: '', area: '', city: '', state: '', pinCode: '', latitude: '', longitude: '',
    onlineRestaurantName: '', branchDisplayName: '', businessShortCode: '', branchShortCode: '',
    whatsappBannerUrl: '', defaultItemImageUrl: '', firstName: '', lastName: '', preferredLanguage: 'English',
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
          id: 'main-area', name: 'Main',
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
      serviceRadius: '5', contactName: '', contactNumber: '', deliveryPartner: 'WhatsCom', deliveryFeeChargedTo: 'Customer',
      agents: [{ id: 'agent-1', name: 'Ramesh Kumar', phone: '+91 98765 43210', vehicleNo: 'TS 09 AB 1234', status: 'Available' }]
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
    receiptConfig: {
      density: 'Compact', restaurantName: 'Linga Foods', headerText: 'Linga Foods - Wonghikal',
      address: 'LINGA FOODS, No. 1540, Vellore Main Road, Wonghikal, Tiruvannamalai, Tamil Nadu 606604',
      phone: '91234400635', gstin: '37AAFP4128L1ZI', fssai: 'FSSAI: 22426260001195', email: 'support@lingafoods.com',
      footerNote: 'Thank You For Visiting Us!\n*** TEST PRINT ***\n*** NOT A VALID BILL / INVOICE ***', paperSize: '80mm',
      toggles: {
        logo: false, restaurantName: true, branchName: true, address: true, phone: true, gstin: true, email: false,
        fssai: true, headerText: true, invoiceNo: true, dateAndTime: true, orderId: true, tokenNumber: true, orderType: true,
        customerName: false, customerMobile: false, itemNameQtyAmt: true, itemRate: true, variantsAddons: true, itemNotes: true,
        discount: true, totalTax: true, taxBreakdown: true, paymentMethod: true, paymentReference: false
      }
    },
    printRules: {
      counterReceiptTrigger: 'auto', counterKotTrigger: 'auto', tableReceiptTrigger: 'manual',
      tableKotTrigger: 'auto', takeawayReceiptTrigger: 'auto', takeawayKotTrigger: 'auto'
    },
    printerInfo: { printerName: '', printReceiptDoc: true, printKotDoc: false }
  });

  useEffect(() => {
    const loggedInEmail = localStorage.getItem('userEmail');
    if (!loggedInEmail) {
      alert(t('tbNoLoggedInUserAlert'));
      setLoading(false);
      return;
    }
    setFormData(prev => ({ ...prev, email: loggedInEmail }));
    fetchProfile(loggedInEmail);
    fetchUsers(loggedInEmail);
  }, []);

  const fetchProfile = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/email/${email}`);
      if (!res.ok) throw new Error(t('smFetchProfileFail'));
      const data = await res.json();
      setFullProfile(data);

      let parsedHours = data.serviceHours;
      if (typeof parsedHours === 'string') { try { parsedHours = JSON.parse(parsedHours); } catch (e) {} }
      let parsedAreas = data.areasAndTables;
      if (typeof parsedAreas === 'string') { try { parsedAreas = JSON.parse(parsedAreas); } catch (e) {} }
      let parsedDelivery = data.deliveryConfig;
      if (typeof parsedDelivery === 'string') { try { parsedDelivery = JSON.parse(parsedDelivery); } catch (e) {} }
      let parsedBilling = data.billingConfig;
      if (typeof parsedBilling === 'string') { try { parsedBilling = JSON.parse(parsedBilling); } catch (e) {} }
      let parsedReceipt = data.receiptConfig;
      if (typeof parsedReceipt === 'string') { try { parsedReceipt = JSON.parse(parsedReceipt); } catch (e) {} }
      let parsedRules = data.printRules;
      if (typeof parsedRules === 'string') { try { parsedRules = JSON.parse(parsedRules); } catch (e) {} }
      let parsedPrinter = data.printerInfo;
      if (typeof parsedPrinter === 'string') { try { parsedPrinter = JSON.parse(parsedPrinter); } catch (e) {} }

      setFormData(prev => {
        const cachedLang = localStorage.getItem('preferredLanguage');
        const resolvedLang = cachedLang || data.preferredLanguage || prev.preferredLanguage || 'English';
        setLanguage(resolvedLang);

        return {
          ...prev,
          ...data,
          email,
          preferredLanguage: resolvedLang,
          serviceHours: parsedHours || prev.serviceHours,
          areasAndTables: parsedAreas || prev.areasAndTables,
          deliveryConfig: parsedDelivery || prev.deliveryConfig,
          billingConfig: parsedBilling || prev.billingConfig,
          receiptConfig: parsedReceipt ? { ...prev.receiptConfig, ...parsedReceipt } : prev.receiptConfig,
          printRules: parsedRules || prev.printRules,
          printerInfo: parsedPrinter || prev.printerInfo
        };
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      showMsg(t('smLoadProfileFail'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = (email) => {
    fetch(`${API_BASE_URL}/api/v1/staff?email=${email}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setUsersList(data); })
      .catch(err => console.log("Users fetch error:", err));
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim()) return alert(t('smEnterUserNameAlert'));
    const userEmail = formData.email || localStorage.getItem('userEmail') || '';

    if (editingUserId) {
      const targetUser = usersList.find(u => (u.id || u._id) === editingUserId);
      const payload = {
        name: newUserForm.name.trim(), userIdCode: newUserForm.userId.trim() || 'U01',
        role: newUserForm.role.toUpperCase(), phone: newUserForm.phone.trim(),
        status: targetUser?.status || 'Active', restaurantEmail: userEmail
      };
      fetch(`${API_BASE_URL}/api/v1/staff/${editingUserId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      }).then(res => {
        if (res.ok) {
          setEditingUserId(null);
          setNewUserForm({ name: '', userId: '', role: 'Captain', phone: '' });
          fetchUsers(userEmail);
          showMsg(t('smUserUpdatedToast'), 'success');
        } else { alert(t('smUserUpdateFailAlert')); }
      }).catch(err => alert('Error: ' + err.message));
    } else {
      fetch(`${API_BASE_URL}/api/v1/staff`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserForm.name.trim(), userIdCode: newUserForm.userId.trim() || 'U01', role: newUserForm.role.toUpperCase(), phone: newUserForm.phone.trim(), status: 'Active', restaurantEmail: userEmail })
      }).then(res => {
        if (res.ok) {
          setNewUserForm({ name: '', userId: '', role: 'Captain', phone: '' });
          fetchUsers(userEmail);
          showMsg(t('smUserCreatedToast'), 'success');
        } else { alert(t('smUserAddFailAlert')); }
      }).catch(err => alert('Error: ' + err.message));
    }
  };

  const handleToggleUserStatus = (userId) => {
    const userEmail = formData.email || localStorage.getItem('userEmail') || '';
    const target = usersList.find(u => (u.id || u._id) === userId);
    if (!target) return;
    const currentStatus = target.status || 'Active';
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const payload = {
      name: target.name, role: target.role || 'CAPTAIN', phone: target.phone || '',
      userIdCode: target.userIdCode || 'U01', status: nextStatus, restaurantEmail: userEmail
    };
    fetch(`${API_BASE_URL}/api/v1/staff/${userId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(res => {
      if (res.ok) { fetchUsers(userEmail); showMsg(t('smUserStatusUpdatedToast').replace('{status}', translateDbValue(nextStatus)), 'success'); }
      else { alert(t('smUserStatusFailAlert')); }
    }).catch(err => alert('Error: ' + err.message));
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm(t('smDeleteUserConfirm'))) return;
    const userEmail = formData.email || localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/staff/${userId}`, { method: 'DELETE' })
      .then(res => { if (res.ok) fetchUsers(userEmail); })
      .catch(err => alert('Error: ' + err.message));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'preferredLanguage') {
      setLanguage(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (field, value) => {
    setFormData(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, [field]: value } }));
  };

  const handleBillingDefaultChange = (val) => {
    setFormData(prev => ({ ...prev, billingConfig: { ...prev.billingConfig, defaultTaxGroup: val } }));
  };

  const handleToggleReceiptField = (key) => {
    setFormData(prev => ({
      ...prev,
      receiptConfig: {
        ...prev.receiptConfig,
        toggles: { ...prev.receiptConfig.toggles, [key]: !prev.receiptConfig.toggles[key] }
      }
    }));
  };

  const handleSaveNewArea = (e) => {
    e.preventDefault();
    if (!newAreaNameInput.trim()) return;
    const newArea = { id: 'area-' + Date.now(), name: newAreaNameInput.trim(), tables: [] };
    setFormData(prev => ({
      ...prev, areasAndTables: { ...prev.areasAndTables, areas: [...(prev.areasAndTables?.areas || []), newArea] }
    }));
    setNewAreaNameInput('');
    setShowAddAreaBox(false);
  };

  const handleSaveNewTable = (e, areaId) => {
    e.preventDefault();
    if (!newTableForm.name.trim()) return;
    const newTable = {
      id: 'table-' + Date.now(), name: newTableForm.name.trim().toUpperCase(),
      pax: parseInt(newTableForm.pax) || 4, qrEnabled: true, status: 'Available', captain: 'Unassigned'
    };
    setFormData(prev => ({
      ...prev, areasAndTables: {
        ...prev.areasAndTables,
        areas: (prev.areasAndTables?.areas || []).map(area => area.id === areaId ? { ...area, tables: [...(area.tables || []), newTable] } : area)
      }
    }));
    setNewTableForm({ name: '', pax: 4 });
    setActiveAreaForTableBox(null);
  };

  const handleToggleTableQr = (areaId, tableId) => {
    setFormData(prev => ({
      ...prev, areasAndTables: {
        ...prev.areasAndTables,
        areas: (prev.areasAndTables?.areas || []).map(area => area.id === areaId ? {
          ...area, tables: (area.tables || []).map(tb => tb.id === tableId ? { ...tb, qrEnabled: !tb.qrEnabled } : tb)
        } : area)
      }
    }));
  };

  const handleDeleteTable = (areaId, tableId) => {
    if (!window.confirm(t('tbDeleteTableConfirm'))) return;
    setFormData(prev => ({
      ...prev, areasAndTables: {
        ...prev.areasAndTables,
        areas: (prev.areasAndTables?.areas || []).map(area => area.id === areaId ? {
          ...area, tables: (area.tables || []).filter(tb => tb.id !== tableId)
        } : area)
      }
    }));
  };

  const handleSaveNewAgent = (e) => {
    e.preventDefault();
    if (!newAgentForm.name.trim()) return;
    const newAgent = {
      id: 'agent-' + Date.now(), name: newAgentForm.name.trim(),
      phone: newAgentForm.phone.trim() || '', vehicleNo: newAgentForm.vehicleNo.trim() || '', status: 'Available'
    };
    setFormData(prev => ({
      ...prev, deliveryConfig: { ...prev.deliveryConfig, agents: [...(prev.deliveryConfig?.agents || []), newAgent] }
    }));
    setNewAgentForm({ name: '', phone: '', vehicleNo: '' });
    setShowAddAgentBox(false);
  };

  const handleToggleAgentStatus = (agentId) => {
    setFormData(prev => ({
      ...prev, deliveryConfig: {
        ...prev.deliveryConfig,
        agents: (prev.deliveryConfig?.agents || []).map(ag => ag.id === agentId ? { ...ag, status: ag.status === 'Available' ? 'Unavailable' : 'Available' } : ag)
      }
    }));
  };

  const handleDeleteAgent = (agentId) => {
    if (!window.confirm(t('smDeleteAgentConfirm'))) return;
    setFormData(prev => ({
      ...prev, deliveryConfig: {
        ...prev.deliveryConfig, agents: (prev.deliveryConfig?.agents || []).filter(ag => ag.id !== agentId)
      }
    }));
  };

  const handleTaxRateChange = (val) => {
    const rateNum = parseFloat(val) || 0;
    const half = (rateNum / 2).toFixed(1).replace(/\.0$/, '');
    setTaxFormData(prev => ({ ...prev, rate: val, cgst: half, sgst: half }));
  };

  const handleOpenAddTaxForm = () => {
    setTaxFormData({ name: '', rate: '', cgst: '', sgst: '', hsnCode: '', itcEligible: false, active: true });
    setEditingTaxId(null);
    setTaxFormMode('add');
  };

  const handleOpenEditTaxForm = (tg) => {
    setTaxFormData({
      name: tg.name, rate: tg.rate, cgst: tg.cgst, sgst: tg.sgst, hsnCode: tg.hsnCode, itcEligible: tg.itcEligible || false, active: tg.status === 'Active'
    });
    setEditingTaxId(tg.id);
    setTaxFormMode('edit');
  };

  const handleSaveTaxGroup = (e) => {
    e.preventDefault();
    if (!taxFormData.name.trim()) return alert(t('smEnterTaxGroupNameAlert'));
    const rateNum = parseFloat(taxFormData.rate) || 0;
    const halfRate = rateNum / 2;
    const groupObj = {
      id: editingTaxId || ('tg-' + Date.now()), name: taxFormData.name.trim(), rate: rateNum,
      cgst: parseFloat(taxFormData.cgst) || halfRate, sgst: parseFloat(taxFormData.sgst) || halfRate,
      hsnCode: taxFormData.hsnCode.trim() || '996331', itcEligible: taxFormData.itcEligible, status: taxFormData.active ? 'Active' : 'Inactive'
    };
    setFormData(prev => {
      const existing = prev.billingConfig?.taxGroups || [];
      const updatedGroups = editingTaxId ? existing.map(tg => tg.id === editingTaxId ? groupObj : tg) : [...existing, groupObj];
      return { ...prev, billingConfig: { ...prev.billingConfig, taxGroups: updatedGroups } };
    });
    setTaxFormMode('list');
    setEditingTaxId(null);
  };

  const handleToggleTaxGroupStatus = (tgId) => {
    setFormData(prev => ({
      ...prev, billingConfig: {
        ...prev.billingConfig,
        taxGroups: (prev.billingConfig?.taxGroups || []).map(tg => tg.id === tgId ? { ...tg, status: tg.status === 'Active' ? 'Inactive' : 'Active' } : tg)
      }
    }));
  };

  const handleDeleteTaxGroup = (tgId) => {
    if (!window.confirm(t('smDeleteTaxGroupConfirm'))) return;
    setFormData(prev => ({
      ...prev, billingConfig: {
        ...prev.billingConfig, taxGroups: (prev.billingConfig?.taxGroups || []).filter(tg => tg.id !== tgId)
      }
    }));
  };

  const handleHourChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev, serviceHours: { ...prev.serviceHours, [day]: { ...prev.serviceHours?.[day], [field]: value } }
    }));
  };

  const handleAutoOpenToggle = (val) => {
    setFormData(prev => ({ ...prev, areasAndTables: { ...prev.areasAndTables, autoOpenQrScan: val } }));
  };

  const calculateBreakDuration = (end1, start2) => {
    try {
      const [h1, m1] = (end1 || '14:00').split(':').map(Number);
      const [h2, m2] = (start2 || '17:00').split(':').map(Number);
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diff <= 0) return t('smBreakOverlapping');
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } catch (e) { return '3h'; }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const latestRes = await fetch(`${API_BASE_URL}/api/v1/restaurants/email/${formData.email}`);
      const latestData = latestRes.ok ? await latestRes.json() : fullProfile;

      let existingAreasMap = {};
      const currentAreasAndTables = formData.areasAndTables || { autoOpenQrScan: true, areas: [] };
      try {
        const parsedLatestAreas = typeof latestData.areasAndTables === 'string' ? JSON.parse(latestData.areasAndTables) : latestData.areasAndTables;
        if (parsedLatestAreas?.areas) {
          parsedLatestAreas.areas.forEach(a => (a.tables || []).forEach(tb => { existingAreasMap[tb.id] = { status: tb.status, captain: tb.captain, qrEnabled: tb.qrEnabled }; }));
        }
      } catch (err) {}

      const mergedAreas = {
        ...currentAreasAndTables,
        autoOpenQrScan: currentAreasAndTables.autoOpenQrScan ?? true,
        areas: (currentAreasAndTables.areas || []).map(area => ({
          ...area,
          tables: (area.tables || []).map(tb => ({
            ...tb,
            status: existingAreasMap[tb.id]?.status || tb.status || 'Available',
            captain: existingAreasMap[tb.id]?.captain || tb.captain || 'Unassigned',
            qrEnabled: tb.qrEnabled ?? true
          }))
        }))
      };

      const payload = {
        ...latestData, ...formData,
        serviceHours: JSON.stringify(formData.serviceHours || {}),
        areasAndTables: JSON.stringify(mergedAreas),
        deliveryConfig: JSON.stringify(formData.deliveryConfig || {}),
        billingConfig: JSON.stringify(formData.billingConfig || {}),
        receiptConfig: JSON.stringify(formData.receiptConfig || {}),
        printRules: JSON.stringify(formData.printRules || {}),
        printerInfo: JSON.stringify(formData.printerInfo || {}),
        autoApproval: latestData.autoApproval ?? formData.autoApproval,
        counterOrdering: latestData.counterOrdering ?? formData.counterOrdering
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/${formData.restaurantId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text() || t('smSaveSettingsFail'));

      const updated = await res.json();
      setFullProfile(updated);
      showMsg(t('smAllSavedToast'), 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      showMsg(`❌ ${t('smErrorPrefix')}: ${err.message}`, 'error');
    } finally { setSaving(false); }
  };

  // ===== SYSTEM TAB: auto-approval + counter ordering (saved per branch on the server) =====
  const systemSettings = useMemo(() => {
    const parse = (v) => {
      if (!v) return undefined;
      if (typeof v === 'object') return v;
      try { return JSON.parse(v); } catch (e) { return undefined; }
    };
    return { autoApprove: parse(formData.autoApproval), counter: parse(formData.counterOrdering) };
  }, [formData.autoApproval, formData.counterOrdering]);

  const saveSystemField = async (field, payloadObj) => {
    if (!formData.restaurantId) throw new Error(t('smProfileNotLoadedErr'));
    const asString = JSON.stringify(payloadObj);
    const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/${formData.restaurantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email, [field]: asString })
    });
    if (!res.ok) throw new Error((await res.text()) || t('smSaveSettingsFail'));

    const saved = await res.json();
    if (saved[field] !== asString) {
      throw new Error(t('smServerNotStoredErr'));
    }
    setFormData(prev => ({ ...prev, [field]: asString }));
  };

  const handleSaveAutoApprove = (payload) => saveSystemField('autoApproval', payload);
  const handleSaveCounter = (payload) => saveSystemField('counterOrdering', payload);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const sidebarItems = [
    { id: 'business', label: t('businessInfo'), icon: '🏢' },
    { id: 'profile', label: t('profile'), icon: '👤' },
    { id: 'hours', label: t('serviceHours'), icon: '⏰' },
    { id: 'tables', label: t('areasTables'), icon: '🪑' },
    { id: 'users', label: t('users'), icon: '👥' },
    { id: 'delivery', label: t('delivery'), icon: '🛵' },
    { id: 'billing', label: t('billing'), icon: '💳' },
    { id: 'printers', label: t('printersReceipts'), icon: '🖨️' },
    { id: 'system', label: t('system'), icon: '⚙️' }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) return <div style={styles.centerMsg}>{t('smLoadingSettings')}</div>;

  const toggles = formData.receiptConfig?.toggles || {};

  return (
    <div className="sm-root" style={styles.container}>
      <UiStyles />

      <div className="sm-header" style={styles.header}>
        <div>
          <h2 style={styles.title}>{t('settingsTitle')}</h2>
          <span style={styles.subtitle}>{t('settingsSubtitle')} ({t('smAccountLabel')}: {formData.email})</span>
        </div>
        <div className="sm-header-actions" style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <span style={styles.statusBadge}>🟢 {t('liveSynced')}</span>
          <button onClick={handleSave} className="sm-btn-primary" style={styles.saveBtn} disabled={saving}>
            {saving ? t('savingToDb') : `💾 ${t('saveChanges')}`}
          </button>
        </div>
      </div>

      {message.text && (
        <div className="sm-alert" role="status" style={{...styles.alert, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534', borderColor: message.type === 'error' ? '#f87171' : '#4ade80'}}>
          {message.text}
        </div>
      )}

      <div className="sm-layout" style={styles.layout}>
        <div className="sm-sidebar" style={styles.sidebar}>
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`sm-sidebar-btn${activeTab === item.id ? ' is-active' : ''}`} style={{...styles.sidebarBtn, ...(activeTab === item.id ? styles.activeSidebarBtn : {})}}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        <div className="sm-content" style={styles.contentPanel}>
          <form onSubmit={handleSave} style={styles.formContainer}>

            {/* TAB 1: BUSINESS INFORMATION */}
            {activeTab === 'business' && (
              <div style={styles.sectionGroup}>
                <h3 style={styles.sectionTitle}>🏢 {t('smBizInfoIdentityTitle')}</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('businessNameRequired')}</label><input type="text" name="businessName" value={formData.businessName || ''} onChange={handleChange} style={styles.input} required /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smOwnerNameReq')}</label><input type="text" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} style={styles.input} required /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('emailLoginId')}</label><input type="email" name="email" value={formData.email || ''} style={{...styles.input, backgroundColor: '#fdeee3'}} disabled /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('whatsappNumberRequired')}</label><input type="text" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} style={styles.input} required /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smMobileNumReq')}</label><input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} style={styles.input} required /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smWebsiteLabel')}</label><input type="text" name="website" value={formData.website || ''} onChange={handleChange} placeholder="https://" style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smGstnNumReq')}</label><input type="text" name="gstnNumber" value={formData.gstnNumber || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smLicenseNumReq')}</label><input type="text" name="businessLicenseNumber" value={formData.businessLicenseNumber || ''} onChange={handleChange} style={styles.input} /></div>
                </div>

                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>🏷️ {t('smDisplayNamesCodesTitle')}</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smOnlineRestNameReq')}</label><input type="text" name="onlineRestaurantName" value={formData.onlineRestaurantName || ''} onChange={handleChange} placeholder={t('smPhOnlineRestName')} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smBranchDispNameReq')}</label><input type="text" name="branchDisplayName" value={formData.branchDisplayName || ''} onChange={handleChange} placeholder={t('smPhBranchDispName')} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smBizShortCodeReq')}</label><input type="text" name="businessShortCode" value={formData.businessShortCode || ''} onChange={handleChange} maxLength="5" placeholder={t('smPhBizShortCode')} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smBranchShortCodeReq')}</label><input type="text" name="branchShortCode" value={formData.branchShortCode || ''} onChange={handleChange} maxLength="2" placeholder={t('smPhBranchShortCode')} style={styles.input} /></div>
                </div>

                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>📍 {t('smAddressLocationTitle')}</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smAddrLine1')}</label><input type="text" name="addressLine1" value={formData.addressLine1 || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smAddrLine2')}</label><input type="text" name="addressLine2" value={formData.addressLine2 || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smAreaLabel')}</label><input type="text" name="area" value={formData.area || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smCityLabel')}</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smStateLabel')}</label><input type="text" name="state" value={formData.state || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smPinCodeLabel')}</label><input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} style={styles.input} /></div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFILE */}
            {activeTab === 'profile' && (
              <div style={styles.sectionGroup}>
                <h3 style={styles.sectionTitle}>👤 {t('adminUserProfile')}</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('ownerAdminName')}</label><input type="text" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} style={styles.input} required /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('firstName')}</label><input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('lastName')}</label><input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('emailLoginId')}</label><input type="email" name="email" value={formData.email || ''} style={{...styles.input, backgroundColor: '#fdeee3'}} disabled /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('mobileNumber')}</label><input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} style={styles.input} /></div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>{t('preferredLanguage')}</label>
                    <select name="preferredLanguage" value={formData.preferredLanguage || 'English'} onChange={handleChange} style={styles.input}>
                      <option value="English">English</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Marathi">Marathi</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SERVICE HOURS */}
            {activeTab === 'hours' && (
              <div style={styles.sectionGroup}>
                <div className="sm-banner" style={styles.serviceHoursBanner}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span style={{fontSize: '22px'}}>⏰</span>
                    <div>
                      <div style={{fontWeight: '950', color: '#c2410c', fontSize: '15px'}}>{t('smOnlineHoursTitle')}</div>
                      <div style={{fontSize: '12px', color: '#7c2d12', marginTop: '3px', fontWeight: '800'}}>{t('smOnlineHoursDesc')}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsEditingHours(!isEditingHours)} className="sm-btn-ghost" style={styles.editHoursBtn}>✏️ {isEditingHours ? t('smLockHoursBtn') : t('smEditHoursBtn')}</button>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px'}}>
                  {daysOfWeek.map(day => {
                    const dayData = formData.serviceHours?.[day] || { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' };
                    const breakDuration = calculateBreakDuration(dayData.shift1End, dayData.shift2Start);
                    const isHovered = hoveredCard === day;

                    return (
                      <div key={day} className="sm-card" style={{...styles.dayCard, ...(isHovered ? styles.dayCardHover : {})}} onMouseEnter={() => setHoveredCard(day)} onMouseLeave={() => setHoveredCard(null)}>
                        <div className="sm-day-head" style={styles.dayCardHeader}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                            <span style={{fontWeight: '950', fontSize: '16px', color: '#2a1710', width: '110px'}}>{t(`smDay${day}`) || day}</span>
                            <span style={{backgroundColor: dayData.holiday ? '#fef2f2' : '#ecfdf5', color: dayData.holiday ? '#dc2626' : '#059669', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '950', border: '1px solid currentColor'}}>
                              {dayData.holiday ? t('smHolidayLabel') : t('smOpenLabel')}
                            </span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{fontSize: '12px', fontWeight: '900', color: '#2a1710'}}>{t('smHolidayLabel')}</span>
                            <input type="checkbox" checked={dayData.holiday || false} onChange={e => handleHourChange(day, 'holiday', e.target.checked)} style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#f97316'}} />
                          </div>
                        </div>

                        {!dayData.holiday && (
                          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px'}}>
                            <div className="sm-time-row" style={{display: 'flex', gap: '14px', alignItems: 'center'}}>
                              <input type="text" className="sm-time-input" value={dayData.shift1Start || ''} onChange={e => handleHourChange(day, 'shift1Start', e.target.value)} disabled={!isEditingHours} style={styles.timeInput} />
                              <span style={{fontWeight: '900', color: '#5a3a2a'}}>{t('pmToWord')}</span>
                              <input type="text" className="sm-time-input" value={dayData.shift1End || ''} onChange={e => handleHourChange(day, 'shift1End', e.target.value)} disabled={!isEditingHours} style={styles.timeInput} />
                            </div>
                            <div style={{textAlign: 'center', fontSize: '12px', fontWeight: '950', color: '#b45309', backgroundColor: '#fef3c7', padding: '8px', borderRadius: '8px', border: '1.5px dashed #f59e0b'}}>
                              {t('smBreakPrefix')} {dayData.shift1End || '14:00'}–{dayData.shift2Start || '17:00'} ({breakDuration})
                            </div>
                            <div className="sm-time-row" style={{display: 'flex', gap: '14px', alignItems: 'center'}}>
                              <input type="text" className="sm-time-input" value={dayData.shift2Start || ''} onChange={e => handleHourChange(day, 'shift2Start', e.target.value)} disabled={!isEditingHours} style={styles.timeInput} />
                              <span style={{fontWeight: '900', color: '#5a3a2a'}}>{t('pmToWord')}</span>
                              <input type="text" className="sm-time-input" value={dayData.shift2End || ''} onChange={e => handleHourChange(day, 'shift2End', e.target.value)} disabled={!isEditingHours} style={styles.timeInput} />
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
                <div className="sm-banner" style={styles.serviceHoursBanner}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <div style={{fontWeight: '950', color: '#c2410c', fontSize: '15px'}}>{t('smAutoOpenQrTitle')}</div>
                    <div style={{fontSize: '12px', color: '#7c2d12', fontWeight: '800'}}>{t('smAutoOpenQrDesc')}</div>
                  </div>
                  <input type="checkbox" checked={formData.areasAndTables?.autoOpenQrScan ?? true} onChange={e => handleAutoOpenToggle(e.target.checked)} style={{width: '22px', height: '22px', cursor: 'pointer', accentColor: '#ea580c'}} />
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                  <button type="button" onClick={() => setShowAddAreaBox(true)} className="sm-btn-primary" style={styles.addAreaBtn}>+ {t('smAddAreaBtn')}</button>
                </div>

                {showAddAreaBox && (
                  <div className="sm-card" style={styles.inlineCardForm}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '15px', fontWeight: '950', color: '#2a1710'}}>{t('smAddNewAreaTitle')}</h4>
                    <div className="sm-wrap" style={{display: 'flex', gap: '10px'}}>
                      <input type="text" placeholder={t('smPhAreaName')} value={newAreaNameInput} onChange={e => setNewAreaNameInput(e.target.value)} style={styles.input} autoFocus />
                      <button type="button" onClick={handleSaveNewArea} className="sm-btn-primary" style={styles.saveInlineBtn}>{t('smSaveAreaBtn')}</button>
                      <button type="button" onClick={() => setShowAddAreaBox(false)} className="sm-btn-ghost" style={styles.cancelInlineBtn}>{t('cancelBtn')}</button>
                    </div>
                  </div>
                )}

                <div style={styles.noticeBanner}>{t('smQrNoticeBanner')}</div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '10px'}}>
                  {(formData.areasAndTables?.areas || []).map(area => (
                    <div key={area.id} className="sm-card" style={styles.areaContainer}>
                      <div className="sm-area-head" style={styles.areaHeader}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                          <span style={{fontSize: '16px'}}>🪑</span>
                          <span style={{fontWeight: '950', fontSize: '16px', color: '#2a1710'}}>{area.name}</span>
                          <span style={{fontSize: '12px', color: '#8a6a58', fontWeight: '800'}}>({area.tables?.length || 0} {t('navTables').toLowerCase()})</span>
                        </div>
                        <button type="button" onClick={() => setActiveAreaForTableBox(area.id)} className="sm-btn-primary" style={styles.addTableBtn}>+ {t('tbAddTableBtn')}</button>
                      </div>

                      {activeAreaForTableBox === area.id && (
                        <div className="sm-card" style={{...styles.inlineCardForm, marginBottom: '16px'}}>
                          <h4 style={{margin: '0 0 10px 0', fontSize: '14px', fontWeight: '950', color: '#2a1710'}}>{t('smAddTableInArea').replace('{area}', area.name)}</h4>
                          <div className="sm-wrap" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            <input type="text" placeholder={t('smPhTableName')} value={newTableForm.name} onChange={e => setNewTableForm({...newTableForm, name: e.target.value})} style={{...styles.input, flex: 2}} autoFocus />
                            <input type="number" placeholder={t('smPhPaxSeats')} value={newTableForm.pax} onChange={e => setNewTableForm({...newTableForm, pax: e.target.value})} style={{...styles.input, flex: 1}} />
                            <button type="button" onClick={e => handleSaveNewTable(e, area.id)} className="sm-btn-primary" style={styles.saveInlineBtn}>{t('smSaveTableBtn')}</button>
                            <button type="button" onClick={() => setActiveAreaForTableBox(null)} className="sm-btn-ghost" style={styles.cancelInlineBtn}>{t('cancelBtn')}</button>
                          </div>
                        </div>
                      )}

                      <div style={styles.tablesGrid}>
                        {(area.tables || []).map(tb => (
                          <div key={tb.id} className="sm-card sm-lift" style={styles.tableCard}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{fontWeight: '950', fontSize: '15px', color: '#2a1710'}}>{tb.name}</span>
                                <span style={{backgroundColor: '#fff1e6', color: '#c2410c', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', border: '1px solid #fed7aa'}}># QR {tb.qrEnabled ? t('smQrOnShort') : t('smQrOffShort')}</span>
                              </div>
                              <button type="button" onClick={() => handleDeleteTable(area.id, tb.id)} className="sm-icon-btn" style={styles.iconBtn} title={t('tbDeleteTableBtn')}>🗑️</button>
                            </div>
                            <div style={{fontSize: '12px', color: '#6b4a38', fontWeight: '800', marginBottom: '14px'}}>
                              {tb.pax} {t('tbPaxShort')} · <strong style={{color: tb.status === 'Occupied' ? '#dc2626' : '#059669'}}>{translateDbValue(tb.status || 'Available')}</strong>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #fdeee3', paddingTop: '10px', gap: '8px', flexWrap: 'wrap'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <input type="checkbox" checked={tb.qrEnabled ?? true} onChange={() => handleToggleTableQr(area.id, tb.id)} style={{width: '16px', height: '16px', cursor: 'pointer', accentColor: '#f97316'}} />
                                <span style={{fontSize: '12px', fontWeight: '900', color: '#2a1710'}}>{t('smQrOrderingLabel')}</span>
                              </div>
                              <button type="button" onClick={() => alert(t('smViewQrAlert').replace('{name}', tb.name))} className="sm-btn-ghost" style={styles.viewQrBtn}>📱 {t('smViewQrBtn')}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: USERS */}
            {activeTab === 'users' && (
              <div style={styles.sectionGroup}>
                <h3 style={styles.sectionTitle}>👥 {t('smUsersFloorStaffTitle')}</h3>
                <p style={{fontSize: '12px', color: '#8a6a58', fontWeight: '800', marginTop: '-8px', marginBottom: '16px'}}>
                  {t('smUsersFloorStaffDesc')}
                </p>

                <div className="sm-card" style={styles.userAddCard}>
                  <h4 style={{margin: '0 0 14px 0', fontSize: '14px', fontWeight: '950', color: '#2a1710'}}>{editingUserId ? `✏️ ${t('smEditUserCaptainTitle')}` : `👤 ${t('smAddUserTitle')}`}</h4>
                  <div className="sm-user-grid">
                    <div style={styles.fieldGroup}><label style={styles.label}>{t('smNameReq')}</label><input type="text" placeholder={t('smPhSampleName')} value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} style={styles.input} /></div>
                    <div style={styles.fieldGroup}><label style={styles.label}>{t('smUserIdReq')}</label><input type="text" placeholder="U01" value={newUserForm.userId} onChange={e => setNewUserForm({...newUserForm, userId: e.target.value})} style={styles.input} maxLength="5" /></div>
                    <div style={styles.fieldGroup}><label style={styles.label}>{t('smPhoneNoLabel')}</label><input type="text" placeholder={t('posTenDigitMobile')} value={newUserForm.phone} onChange={e => setNewUserForm({...newUserForm, phone: e.target.value})} style={styles.input} /></div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>{t('smRoleLabel')}</label>
                      <select value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})} style={styles.input}>
                        <option value="Captain">{t('tbCaptainLabel')}</option>
                        <option value="Manager">{t('smRoleManager')}</option>
                        <option value="Admin">{t('adminRole')}</option>
                        <option value="Kitchen">{t('smRoleKitchen')}</option>
                      </select>
                    </div>
                    <div style={{display: 'flex', gap: '6px'}}>
                      <button type="button" onClick={handleSaveUser} className="sm-btn-primary" style={styles.addUserBtn}>{editingUserId ? t('tbUpdateCaptainBtn').split(' ')[0] : `+ ${t('posAddBtn')}`}</button>
                      {editingUserId && (<button type="button" onClick={() => { setEditingUserId(null); setNewUserForm({ name: '', userId: '', role: 'Captain', phone: '' }); }} className="sm-btn-ghost" style={styles.cancelInlineBtn}>{t('cancelBtn')}</button>)}
                    </div>
                  </div>
                </div>

                <h4 style={{margin: '20px 0 12px 0', fontSize: '15px', fontWeight: '950', color: '#2a1710'}}>{t('users')} ({usersList.length})</h4>
                {usersList.length === 0 ? (
                  <div style={styles.emptyUsersBox}>{t('smNoUsersYet')}</div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {usersList.map(u => {
                      const uId = u.id || u._id;
                      const status = u.status || 'Active';
                      const isActive = status === 'Active';
                      return (
                        <div key={uId || u.name} className="sm-card sm-row-card" style={styles.userRowCard}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                            <div style={styles.userAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{fontWeight: '950', fontSize: '15px', color: '#2a1710'}}>{u.name}</span>
                                <span style={styles.userCodeBadge}>{u.userIdCode || 'U01'}</span>
                              </div>
                              <div style={{fontSize: '12px', color: '#8a6a58', fontWeight: '800', marginTop: '3px'}}>
                                {translateDbValue(u.role || 'Captain')} {u.phone ? `· 📞 ${u.phone}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="sm-wrap" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <span style={{backgroundColor: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#15803d' : '#991b1b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950'}}>{isActive ? t('mnActiveStatus') : t('pmInactiveWord')}</span>
                            <button type="button" onClick={() => { setEditingUserId(uId); setNewUserForm({ name: u.name || '', userId: u.userIdCode || '', role: u.role || 'Captain', phone: u.phone || '' }); }} className="sm-btn-link" style={styles.actionEditBtn}>{t('tbEditBtn')}</button>
                            <button type="button" onClick={() => handleToggleUserStatus(uId)} className="sm-btn-ghost" style={styles.userToggleBtn}>{isActive ? t('smDeactivateBtn') : t('pmActivateBtn')}</button>
                            <button type="button" onClick={() => handleDeleteUser(uId)} className="sm-icon-btn" style={styles.iconBtn} title={t('smDeleteUserTitle')}>🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: DELIVERY */}
            {activeTab === 'delivery' && (
              <div style={styles.sectionGroup}>
                <h3 style={styles.sectionTitle}>🛵 {t('smDeliverySetupTitle')}</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smServiceRadiusLabel')}</label><input type="number" value={formData.deliveryConfig?.serviceRadius || '5'} onChange={e => handleDeliveryChange('serviceRadius', e.target.value)} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smPocNameLabel')}</label><input type="text" value={formData.deliveryConfig?.contactName || ''} onChange={e => handleDeliveryChange('contactName', e.target.value)} placeholder={t('smPhPocName')} style={styles.input} /></div>
                  <div style={styles.fieldGroup}><label style={styles.label}>{t('smPocPhoneLabel')}</label><input type="text" value={formData.deliveryConfig?.contactNumber || ''} onChange={e => handleDeliveryChange('contactNumber', e.target.value)} placeholder="+91..." style={styles.input} /></div>
                </div>

                <h3 style={{...styles.sectionTitle, marginTop: '28px'}}>📦 {t('smDeliveryMethodTitle')}</h3>
                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>{t('smDeliveryPartnerLabel')}</label>
                    <select value={formData.deliveryConfig?.deliveryPartner || 'WhatsCom'} onChange={e => handleDeliveryChange('deliveryPartner', e.target.value)} style={styles.input}>
                      <option value="WhatsCom">WhatsCom</option>
                      <option value="Dunzo">Dunzo</option>
                      <option value="Shadowfax">Shadowfax</option>
                      <option value="In-House">{t('smInHouseFleetOpt')}</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>{t('smFeeChargedToLabel')}</label>
                    <select value={formData.deliveryConfig?.deliveryFeeChargedTo || 'Customer'} onChange={e => handleDeliveryChange('deliveryFeeChargedTo', e.target.value)} style={styles.input}>
                      <option value="Customer">{t('receiptCustomer')}</option>
                      <option value="Restaurant">{t('smRestaurantOpt')}</option>
                      <option value="Free">{t('smFreeDeliveryOpt')}</option>
                    </select>
                  </div>
                </div>

                <div className="sm-area-head" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', borderBottom: '2px solid #fed7aa', paddingBottom: '8px'}}>
                  <h3 style={{fontSize: '17px', fontWeight: '950', color: '#2a1710', margin: 0}}>👥 {t('smDeliveryAgentsHeading')} ({formData.deliveryConfig?.agents?.length || 0})</h3>
                  <button type="button" onClick={() => setShowAddAgentBox(true)} className="sm-btn-primary" style={styles.addAreaBtn}>+ {t('smAddAgentBtn')}</button>
                </div>

                {showAddAgentBox && (
                  <div className="sm-card" style={styles.inlineCardForm}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '15px', fontWeight: '950', color: '#2a1710'}}>{t('smAddNewAgentTitle')}</h4>
                    <div className="sm-wrap" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                      <input type="text" placeholder={t('smPhAgentNameReq')} value={newAgentForm.name} onChange={e => setNewAgentForm({...newAgentForm, name: e.target.value})} style={{...styles.input, flex: 2}} autoFocus />
                      <input type="text" placeholder={t('smPhAgentPhone')} value={newAgentForm.phone} onChange={e => setNewAgentForm({...newAgentForm, phone: e.target.value})} style={{...styles.input, flex: 1.5}} />
                      <input type="text" placeholder={t('smPhVehicleNo')} value={newAgentForm.vehicleNo} onChange={e => setNewAgentForm({...newAgentForm, vehicleNo: e.target.value})} style={{...styles.input, flex: 1.5}} />
                      <button type="button" onClick={handleSaveNewAgent} className="sm-btn-primary" style={styles.saveInlineBtn}>{t('smSaveAgentBtn')}</button>
                      <button type="button" onClick={() => setShowAddAgentBox(false)} className="sm-btn-ghost" style={styles.cancelInlineBtn}>{t('cancelBtn')}</button>
                    </div>
                  </div>
                )}

                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px'}}>
                  {(formData.deliveryConfig?.agents || []).map(agent => (
                    <div key={agent.id} className="sm-card sm-row-card" style={styles.agentCard}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{width: '36px', height: '36px', flexShrink: 0, borderRadius: '50%', backgroundColor: '#ffedd5', color: '#c2410c', border: '1.5px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '14px'}}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight: '950', fontSize: '15px', color: '#2a1710'}}>{agent.name}</div>
                          <div style={{fontSize: '12px', color: '#8a6a58', fontWeight: '800', marginTop: '2px'}}>📞 {agent.phone} · 🚗 {agent.vehicleNo || t('smNoVehicleNo')}</div>
                        </div>
                      </div>
                      <div className="sm-wrap" style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                        <span style={{backgroundColor: agent.status === 'Available' ? '#dcfce7' : '#fee2e2', color: agent.status === 'Available' ? '#15803d' : '#991b1b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950'}}>{translateDbValue(agent.status || 'Available')}</span>
                        <button type="button" onClick={() => handleToggleAgentStatus(agent.id)} className="sm-btn-ghost" style={styles.agentToggleBtn}>{agent.status === 'Available' ? t('smSetUnavailableBtn') : t('smSetAvailableBtn')}</button>
                        <button type="button" onClick={() => handleDeleteAgent(agent.id)} className="sm-icon-btn" style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}} title={t('smDeleteAgentTitle')}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: BILLING */}
            {activeTab === 'billing' && (
              <div style={styles.sectionGroup}>
                {taxFormMode === 'list' ? (
                  <>
                    <div className="sm-area-head" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <div>
                        <h3 style={{fontSize: '17px', fontWeight: '950', color: '#2a1710', margin: 0}}>{t('smTaxGroupsTitle')}</h3>
                        <p style={{fontSize: '12px', color: '#8a6a58', fontWeight: '800', margin: '4px 0 0 0'}}>{t('smTaxGroupsDesc')}</p>
                      </div>
                      <button type="button" onClick={handleOpenAddTaxForm} className="sm-btn-primary" style={styles.addTaxGroupBtn}>+ {t('smNewTaxGroupBtn')}</button>
                    </div>

                    <div style={{marginBottom: '20px', maxWidth: '360px'}}>
                      <label style={{fontSize: '12px', fontWeight: '950', color: '#2a1710', display: 'block', marginBottom: '6px'}}>{t('smDefaultTaxGroupLabel')}</label>
                      <select value={formData.billingConfig?.defaultTaxGroup || 'Standard Restaurant (5%)'} onChange={e => handleBillingDefaultChange(e.target.value)} style={styles.input}>
                        <option value="No default">{t('smNoDefaultOpt')}</option>
                        {(formData.billingConfig?.taxGroups || []).map(tg => (
                          <option key={tg.id} value={tg.name}>{tg.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHeaderRow}>
                            <th style={styles.th}>{t('smTaxGroupNameCol')}</th>
                            <th style={styles.th}>{t('receiptRate')}</th>
                            <th style={styles.th}>CGST</th>
                            <th style={styles.th}>SGST</th>
                            <th style={styles.th}>{t('smHsnCodeCol')}</th>
                            <th style={styles.th}>{t('rpStatusCol')}</th>
                            <th style={{...styles.th, textAlign: 'right'}}>{t('rpActionsCol')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData.billingConfig?.taxGroups || []).map(tg => (
                            <tr key={tg.id} className="sm-tr" style={styles.tableRow}>
                              <td style={styles.td}><strong style={{color: '#2a1710'}}>{tg.name}</strong></td>
                              <td style={styles.td}>{tg.rate}%</td>
                              <td style={styles.td}>{tg.cgst}%</td>
                              <td style={styles.td}>{tg.sgst}%</td>
                              <td style={styles.td}>{tg.hsnCode}</td>
                              <td style={styles.td}>
                                <span style={{backgroundColor: tg.status === 'Active' ? '#dcfce7' : '#fee2e2', color: tg.status === 'Active' ? '#15803d' : '#991b1b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950'}}>{tg.status === 'Active' ? t('mnActiveStatus') : t('pmInactiveWord')}</span>
                              </td>
                              <td style={{...styles.td, textAlign: 'right'}}>
                                <div style={{display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center'}}>
                                  <button type="button" onClick={() => handleOpenEditTaxForm(tg)} className="sm-btn-link" style={styles.actionEditBtn}>{t('tbEditBtn')}</button>
                                  <button type="button" onClick={() => handleToggleTaxGroupStatus(tg.id)} className="sm-btn-link" style={styles.actionDeactivateBtn}>{tg.status === 'Active' ? t('smDeactivateBtn') : t('pmActivateBtn')}</button>
                                  <button type="button" onClick={() => handleDeleteTaxGroup(tg.id)} className="sm-btn-link" style={styles.actionDeleteBtn}>{t('tbDeleteBtn')}</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="sm-card" style={styles.screenCardForm}>
                    <div className="sm-area-head" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #fed7aa', paddingBottom: '12px'}}>
                      <div>
                        <h3 style={{margin: '0 0 4px 0', fontSize: '18px', fontWeight: '950', color: '#2a1710'}}>{taxFormMode === 'add' ? t('smNewTaxGroupTitle') : t('smEditTaxGroupTitle')}</h3>
                        <p style={{margin: 0, fontSize: '12px', color: '#8a6a58', fontWeight: '800'}}>{t('smCgstSgstAutoHint')}</p>
                      </div>
                      <button type="button" onClick={() => setTaxFormMode('list')} className="sm-icon-btn" style={{background: 'none', border: 'none', fontSize: '18px', fontWeight: '950', cursor: 'pointer', color: '#8a6a58'}}>✕</button>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px'}}>
                      <div style={styles.fieldGroup}><label style={styles.label}>{t('smGroupNameReq')}</label><input type="text" placeholder={t('smPhTaxGroupName')} value={taxFormData.name} onChange={e => setTaxFormData({...taxFormData, name: e.target.value})} style={styles.input} required /></div>
                      <div style={styles.fieldGroup}><label style={styles.label}>{t('smTaxRatePctReq')}</label><input type="number" placeholder="e.g. 5, 12, 18" value={taxFormData.rate} onChange={e => handleTaxRateChange(e.target.value)} style={styles.input} required /></div>
                      <div style={styles.grid2}>
                        <div style={styles.fieldGroup}><label style={styles.label}>CGST %</label><input type="text" value={taxFormData.cgst} onChange={e => setTaxFormData({...taxFormData, cgst: e.target.value})} style={{...styles.input, backgroundColor: '#fff8f3'}} /></div>
                        <div style={styles.fieldGroup}><label style={styles.label}>SGST %</label><input type="text" value={taxFormData.sgst} onChange={e => setTaxFormData({...taxFormData, sgst: e.target.value})} style={{...styles.input, backgroundColor: '#fff8f3'}} /></div>
                      </div>
                      <div style={styles.fieldGroup}><label style={styles.label}>{t('smHsnSacReq')}</label><input type="text" value={taxFormData.hsnCode} onChange={e => setTaxFormData({...taxFormData, hsnCode: e.target.value})} style={styles.input} required /></div>
                      <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', flexWrap: 'wrap'}}>
                        <button type="button" onClick={() => setTaxFormMode('list')} className="sm-btn-ghost" style={styles.cancelFormBtn}>{t('cancelBtn')}</button>
                        <button type="button" onClick={handleSaveTaxGroup} className="sm-btn-primary" style={styles.saveFormBtn}>{t('smSaveTaxGroupBtn')}</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TABS 8 & 9 RENDERED VIA ADVANCED SETTINGS COMPONENT */}
            <AdvancedSettingsTab
              activeTab={activeTab}
              receiptSubTab={receiptSubTab}
              setReceiptSubTab={setReceiptSubTab}
              formData={formData}
              setFormData={setFormData}
              toggles={toggles}
              handleToggleReceiptField={handleToggleReceiptField}
              styles={styles}
              sidebarItems={sidebarItems}
              onSave={() => handleSave({ preventDefault: () => {} })}
              systemSettings={systemSettings}
              branchName={[formData.onlineRestaurantName || formData.businessName, formData.branchDisplayName].filter(Boolean).join(' - ')}
              onSaveAutoApprove={handleSaveAutoApprove}
              onSaveCounter={handleSaveCounter}
            />

          </form>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   STYLES  (flame palette: orange #f97316 / amber #fb923c / deep #ea580c /
   red-orange #ef4444 on warm cream surfaces, dark warm-brown ink #2a1710)
   Keys are unchanged because AdvancedSettingsTab reuses several of them.
   ===================================================================== */

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', background: 'linear-gradient(160deg,#fff7ed 0%,#fff1e6 45%,#ffe8d6 100%)', overflowY: 'auto', boxSizing: 'border-box', textAlign: 'left' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'linear-gradient(180deg,#ffffff 0%,#fff9f5 100%)', padding: '16px 24px', borderRadius: '16px', border: '2px solid #f4e1d3', boxShadow: '0 6px 18px -8px rgba(249,115,22,0.18)' },
  title: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: '950', color: '#2a1710' },
  subtitle: { fontSize: '12px', color: '#6b4a38', fontWeight: '800', wordBreak: 'break-word' },
  statusBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '950', border: '1.5px solid #86efac', whiteSpace: 'nowrap' },
  saveBtn: { backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.30)' },
  alert: { padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: '900', border: '2px solid' },
  layout: { display: 'flex', gap: '24px', flex: 1, alignItems: 'flex-start' },
  sidebar: { width: '260px', flexShrink: 0, background: 'linear-gradient(180deg,#ffffff 0%,#fff9f5 100%)', borderRadius: '16px', border: '2px solid #f4e1d3', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 6px 18px -10px rgba(249,115,22,0.18)' },
  sidebarBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', border: '2px solid transparent', borderRadius: '10px', fontWeight: '900', fontSize: '13px', color: '#3a2216', cursor: 'pointer', textAlign: 'left', width: '100%' },
  activeSidebarBtn: { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#f97316' },
  contentPanel: { flex: 1, minWidth: 0, background: 'linear-gradient(180deg,#ffffff 0%,#fffaf6 100%)', borderRadius: '16px', border: '2px solid #f4e1d3', padding: '24px', minHeight: '600px', boxShadow: '0 6px 18px -10px rgba(249,115,22,0.18)' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { fontSize: '17px', fontWeight: '950', color: '#2a1710', margin: '0 0 12px 0', borderBottom: '2px solid #fed7aa', paddingBottom: '8px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 },
  label: { fontSize: '12px', fontWeight: '950', color: '#2a1710' },
  input: { padding: '10px 14px', borderRadius: '10px', border: '2px solid #e8c9b3', fontSize: '13px', fontWeight: '900', color: '#2a1710', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  subTabBtn: { border: 'none', padding: '8px 16px', fontSize: '13px', fontWeight: '950', cursor: 'pointer', borderRadius: '8px' },
  infoBox: { backgroundColor: '#fff8f3', border: '1.5px solid #f4e1d3', borderRadius: '14px', padding: '16px' },
  refreshBtn: { marginTop: '10px', backgroundColor: '#fff', color: '#5a3a2a', border: '1.5px solid #e8c9b3', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' },
  addAreaBtn: { backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f4e1d3' },
  toggleLabel: { fontSize: '13px', fontWeight: '900', color: '#2a1710' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer', accentColor: '#f97316' },
  ruleCard: { backgroundColor: '#fff8f3', border: '1.5px solid #f4e1d3', borderRadius: '16px', padding: '20px' },
  ruleLabel: { fontSize: '12px', fontWeight: '950', color: '#2a1710', display: 'block', marginBottom: '8px' },
  radioLabel: { fontSize: '12px', fontWeight: '800', color: '#5a3a2a', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  centerMsg: { padding: '40px', textAlign: 'center', fontWeight: '900', color: '#5a3a2a' },
  serviceHoursBanner: { background: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '2px solid #fdba74', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  editHoursBtn: { backgroundColor: '#fff', color: '#c2410c', border: '2px solid #fb923c', padding: '8px 16px', borderRadius: '10px', fontWeight: '950', fontSize: '12px', cursor: 'pointer' },
  dayCard: { background: 'linear-gradient(180deg,#ffffff 0%,#fff8f3 100%)', border: '2px solid #f4e1d3', borderRadius: '14px', padding: '18px' },
  dayCardHover: { borderColor: '#fdba74', boxShadow: '0 14px 30px -16px rgba(249,115,22,0.5)' },
  dayCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  timeInput: { padding: '8px 14px', borderRadius: '8px', border: '2px solid #e8c9b3', fontSize: '13px', fontWeight: '900', color: '#2a1710', backgroundColor: '#fff', width: '150px', outline: 'none', boxSizing: 'border-box' },
  noticeBanner: { backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', lineHeight: 1.5 },
  areaContainer: { background: 'linear-gradient(180deg,#ffffff 0%,#fff8f3 100%)', border: '2px solid #f4e1d3', borderRadius: '14px', padding: '16px' },
  areaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '10px', gap: '10px' },
  addTableBtn: { backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' },
  tablesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '14px' },
  tableCard: { backgroundColor: '#fff', border: '2px solid #f4e1d3', borderRadius: '12px', padding: '14px' },
  iconBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' },
  viewQrBtn: { backgroundColor: '#fff8f3', color: '#2a1710', border: '1.5px solid #e8c9b3', padding: '4px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' },
  agentCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: 'linear-gradient(180deg,#ffffff 0%,#fff8f3 100%)', border: '2px solid #f4e1d3', borderRadius: '14px', padding: '16px' },
  agentToggleBtn: { backgroundColor: '#fff', color: '#2a1710', border: '1.5px solid #e8c9b3', padding: '6px 14px', borderRadius: '8px', fontWeight: '950', fontSize: '11px', cursor: 'pointer' },
  addTaxGroupBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' },
  tableWrapper: { width: '100%', overflowX: 'auto', border: '2px solid #f4e1d3', borderRadius: '12px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  tableHeaderRow: { backgroundColor: '#fff3e8', borderBottom: '2px solid #fed7aa' },
  th: { padding: '12px 16px', fontWeight: '950', color: '#6b4a38', whiteSpace: 'nowrap' },
  tableRow: { borderBottom: '1px solid #fdeee3' },
  td: { padding: '14px 16px', fontWeight: '800', color: '#5a3a2a' },
  actionEditBtn: { background: 'none', border: 'none', color: '#ea580c', fontWeight: '900', cursor: 'pointer' },
  actionDeactivateBtn: { background: 'none', border: 'none', color: '#d97706', fontWeight: '900', cursor: 'pointer' },
  actionDeleteBtn: { background: 'none', border: 'none', color: '#dc2626', fontWeight: '900', cursor: 'pointer' },
  inlineCardForm: { backgroundColor: '#fff', border: '2px solid #fdba74', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  saveInlineBtn: { backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '950', fontSize: '12px', cursor: 'pointer' },
  cancelInlineBtn: { backgroundColor: '#fdeee3', color: '#5a3a2a', border: '1.5px solid #e8c9b3', padding: '8px 14px', borderRadius: '8px', fontWeight: '950', fontSize: '12px', cursor: 'pointer' },
  screenCardForm: { backgroundColor: '#fff', border: '2.5px solid #f4e1d3', borderRadius: '16px', padding: '24px' },
  saveFormBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  cancelFormBtn: { backgroundColor: '#fff', color: '#5a3a2a', border: '2px solid #e8c9b3', padding: '11px 18px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  userAddCard: { background: 'linear-gradient(180deg,#ffffff 0%,#fff8f3 100%)', border: '1.5px solid #f4e1d3', borderRadius: '16px', padding: '20px' },
  addUserBtn: { backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', height: '41px' },
  emptyUsersBox: { textAlign: 'center', color: '#8a6a58', fontSize: '14px', fontWeight: '800', padding: '32px', backgroundColor: '#fff8f3', borderRadius: '14px', border: '2px dashed #e8c9b3' },
  userRowCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', backgroundColor: '#fff', border: '1.5px solid #f4e1d3', borderRadius: '14px', padding: '14px 18px' },
  userAvatar: { width: '38px', height: '38px', flexShrink: 0, borderRadius: '50%', backgroundColor: '#fff1e6', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '15px', border: '1.5px solid #fed7aa' },
  userCodeBadge: { backgroundColor: '#fff1e6', color: '#c2410c', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', border: '1px solid #fed7aa' },
  userToggleBtn: { backgroundColor: '#fff8f3', color: '#2a1710', border: '1.5px solid #e8c9b3', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }
};