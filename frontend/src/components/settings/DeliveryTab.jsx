// FILE: src/components/settings/DeliveryTab.jsx
import React, { useState } from 'react';

export default function DeliveryTab({ formData, setFormData }) {
  const [showAddAgentBox, setShowAddAgentBox] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({ name: '', phone: '', vehicleNo: '' });

  const handleDeliveryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      deliveryConfig: { ...prev.deliveryConfig, [field]: value }
    }));
  };

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

  return (
    <div style={S.sectionGroup}>
      <h3 style={S.sectionTitle}>🛵 Delivery Setup</h3>
      <div style={S.grid2}>
        <div style={S.fieldGroup}>
          <label style={S.label}>Service Radius (KM)</label>
          <input type="number" value={formData.deliveryConfig?.serviceRadius || '5'} onChange={e => handleDeliveryChange('serviceRadius', e.target.value)} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Point of Contact Name</label>
          <input type="text" value={formData.deliveryConfig?.contactName || ''} onChange={e => handleDeliveryChange('contactName', e.target.value)} placeholder="e.g. Ramesh" style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Point of Contact Number</label>
          <input type="text" value={formData.deliveryConfig?.contactNumber || ''} onChange={e => handleDeliveryChange('contactNumber', e.target.value)} placeholder="+91..." style={S.input} />
        </div>
      </div>

      <h3 style={{...S.sectionTitle, marginTop: 28}}>📦 Delivery Method</h3>
      <div style={S.grid2}>
        <div style={S.fieldGroup}>
          <label style={S.label}>Delivery Partner</label>
          <select value={formData.deliveryConfig?.deliveryPartner || 'WhatsCom'} onChange={e => handleDeliveryChange('deliveryPartner', e.target.value)} style={S.input}>
            <option value="WhatsCom">WhatsCom</option>
            <option value="Dunzo">Dunzo</option>
            <option value="Shadowfax">Shadowfax</option>
            <option value="In-House">In-House Fleet</option>
          </select>
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Delivery Fee Charged To</label>
          <select value={formData.deliveryConfig?.deliveryFeeChargedTo || 'Customer'} onChange={e => handleDeliveryChange('deliveryFeeChargedTo', e.target.value)} style={S.input}>
            <option value="Customer">Customer</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Free">Free Delivery</option>
          </select>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, borderBottom: '2px solid #e2e8f0', paddingBottom: 8}}>
        <h3 style={{fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0}}>👥 Delivery Agents ({formData.deliveryConfig?.agents?.length || 0})</h3>
        <button type="button" onClick={() => setShowAddAgentBox(true)} style={S.addAreaBtn}>+ Add Agent</button>
      </div>

      {showAddAgentBox && (
        <div style={S.inlineCardForm}>
          <h4 style={{margin: '0 0 10px 0', fontSize: 15, fontWeight: 900, color: '#0f172a'}}>Add New Delivery Agent</h4>
          <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
            <input type="text" placeholder="Agent Name *" value={newAgentForm.name} onChange={e => setNewAgentForm({...newAgentForm, name: e.target.value})} style={{...S.input, flex: 2}} autoFocus />
            <input type="text" placeholder="Phone Number (+91...)" value={newAgentForm.phone} onChange={e => setNewAgentForm({...newAgentForm, phone: e.target.value})} style={{...S.input, flex: 1.5}} />
            <input type="text" placeholder="Vehicle No (e.g., TS 09 AB 1234)" value={newAgentForm.vehicleNo} onChange={e => setNewAgentForm({...newAgentForm, vehicleNo: e.target.value})} style={{...S.input, flex: 1.5}} />
            <button type="button" onClick={handleSaveNewAgent} style={S.saveInlineBtn}>Save Agent</button>
            <button type="button" onClick={() => setShowAddAgentBox(false)} style={S.cancelInlineBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10}}>
        {formData.deliveryConfig?.agents?.map(agent => (
          <div key={agent.id} style={S.agentCard}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: 36, height: 36, borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14}}>
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{fontWeight: 900, fontSize: 15, color: '#0f172a'}}>{agent.name}</div>
                <div style={{fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: 2}}>📞 {agent.phone} · 🚗 {agent.vehicleNo || 'No Vehicle No.'}</div>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <span style={{backgroundColor: agent.status === 'Available' ? '#dcfce7' : '#fee2e2', color: agent.status === 'Available' ? '#15803d' : '#991b1b', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900}}>{agent.status || 'Available'}</span>
              <button type="button" onClick={() => handleToggleAgentStatus(agent.id)} style={S.agentToggleBtn}>{agent.status === 'Available' ? 'Set unavailable' : 'Set available'}</button>
              <button type="button" onClick={() => handleDeleteAgent(agent.id)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 16}} title="Delete Agent">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: 8 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: '#0f172a' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #94a3b8', fontSize: 13, fontWeight: 800, color: '#0f172a', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%' },
  addAreaBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  inlineCardForm: { backgroundColor: '#fff', border: '2px solid #0f172a', borderRadius: 12, padding: 16, marginBottom: 16 },
  saveInlineBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  cancelInlineBtn: { backgroundColor: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '8px 14px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  agentCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: 14, padding: 16 },
  agentToggleBtn: { backgroundColor: '#fff', color: '#0f172a', border: '1.5px solid #cbd5e1', padding: '6px 14px', borderRadius: 8, fontWeight: 900, fontSize: 11, cursor: 'pointer' }
};