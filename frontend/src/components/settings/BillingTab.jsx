// FILE: src/components/settings/BillingTab.jsx
import React from 'react';

export default function BillingTab({ formData, setFormData, taxFormMode, setTaxFormMode, taxFormData, setTaxFormData, editingTaxId, setEditingTaxId }) {

  const handleBillingDefaultChange = (val) => {
    setFormData(prev => ({
      ...prev,
      billingConfig: { ...prev.billingConfig, defaultTaxGroup: val }
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
      const updatedGroups = editingTaxId ? existing.map(tg => tg.id === editingTaxId ? groupObj : tg) : [...existing, groupObj];
      return { ...prev, billingConfig: { ...prev.billingConfig, taxGroups: updatedGroups } };
    });

    setTaxFormMode('list');
    setEditingTaxId(null);
  };

  const handleToggleTaxGroupStatus = (tgId) => {
    setFormData(prev => ({
      ...prev,
      billingConfig: {
        ...prev.billingConfig,
        taxGroups: prev.billingConfig.taxGroups.map(tg => tg.id === tgId ? { ...tg, status: tg.status === 'Active' ? 'Inactive' : 'Active' } : tg)
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

  return (
    <div style={S.sectionGroup}>
      {taxFormMode === 'list' ? (
        <>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
            <div>
              <h3 style={{fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0}}>Tax Groups</h3>
              <p style={{fontSize: 12, color: '#64748b', fontWeight: 800, margin: '4px 0 0 0'}}>Shared GST rates assigned to menu items and mapped to receipts.</p>
            </div>
            <button type="button" onClick={handleOpenAddTaxForm} style={S.addTaxGroupBtn}>+ New Tax Group</button>
          </div>

          <div style={{marginBottom: 20, maxWidth: 360}}>
            <label style={{fontSize: 12, fontWeight: 900, color: '#0f172a', display: 'block', marginBottom: 6}}>Default Tax Group</label>
            <select value={formData.billingConfig?.defaultTaxGroup || 'Standard Restaurant (5%)'} onChange={e => handleBillingDefaultChange(e.target.value)} style={S.input}>
              <option value="No default">No default</option>
              {formData.billingConfig?.taxGroups?.map(tg => (
                <option key={tg.id} value={tg.name}>{tg.name}</option>
              ))}
            </select>
          </div>

          <div style={S.tableWrapper}>
            <table style={S.table}>
              <thead>
                <tr style={S.tableHeaderRow}>
                  <th style={S.th}>Tax Group Name</th>
                  <th style={S.th}>Rate</th>
                  <th style={S.th}>CGST</th>
                  <th style={S.th}>SGST</th>
                  <th style={S.th}>HSN/SAC Code</th>
                  <th style={S.th}>Status</th>
                  <th style={{...S.th, textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.billingConfig?.taxGroups?.map(tg => (
                  <tr key={tg.id} style={S.tableRow}>
                    <td style={S.td}><strong style={{color: '#0f172a'}}>{tg.name}</strong></td>
                    <td style={S.td}>{tg.rate}%</td>
                    <td style={S.td}>{tg.cgst}%</td>
                    <td style={S.td}>{tg.sgst}%</td>
                    <td style={S.td}>{tg.hsnCode}</td>
                    <td style={S.td}>
                      <span style={{backgroundColor: tg.status === 'Active' ? '#dcfce7' : '#fee2e2', color: tg.status === 'Active' ? '#15803d' : '#991b1b', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900}}>{tg.status}</span>
                    </td>
                    <td style={{...S.td, textAlign: 'right', display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center'}}>
                      <button type="button" onClick={() => handleOpenEditTaxForm(tg)} style={S.actionEditBtn}>Edit</button>
                      <button type="button" onClick={() => handleToggleTaxGroupStatus(tg.id)} style={S.actionDeactivateBtn}>{tg.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                      <button type="button" onClick={() => handleDeleteTaxGroup(tg.id)} style={S.actionDeleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={S.screenCardForm}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '2px solid #e2e8f0', paddingBottom: 12}}>
            <div>
              <h3 style={{margin: '0 0 4px 0', fontSize: 18, fontWeight: 900, color: '#0f172a'}}>{taxFormMode === 'add' ? 'New Tax Group' : 'Edit Tax Group'}</h3>
              <p style={{margin: 0, fontSize: 12, color: '#64748b', fontWeight: 800}}>CGST and SGST are calculated automatically.</p>
            </div>
            <button type="button" onClick={() => setTaxFormMode('list')} style={{background: 'none', border: 'none', fontSize: 18, fontWeight: 900, cursor: 'pointer', color: '#64748b'}}>✕</button>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600}}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Group Name *</label>
              <input type="text" placeholder="e.g. Standard Restaurant (5%)" value={taxFormData.name} onChange={e => setTaxFormData({...taxFormData, name: e.target.value})} style={S.input} required />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Tax Rate % *</label>
              <input type="number" placeholder="e.g. 5, 12, 18" value={taxFormData.rate} onChange={e => handleTaxRateChange(e.target.value)} style={S.input} required />
            </div>
            <div style={S.grid2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>CGST %</label>
                <input type="text" value={taxFormData.cgst} onChange={e => setTaxFormData({...taxFormData, cgst: e.target.value})} style={{...S.input, backgroundColor: '#f8fafc'}} />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>SGST %</label>
                <input type="text" value={taxFormData.sgst} onChange={e => setTaxFormData({...taxFormData, sgst: e.target.value})} style={{...S.input, backgroundColor: '#f8fafc'}} />
              </div>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>HSN/SAC Code *</label>
              <input type="text" value={taxFormData.hsnCode} onChange={e => setTaxFormData({...taxFormData, hsnCode: e.target.value})} style={S.input} required />
            </div>
            <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10}}>
              <button type="button" onClick={() => setTaxFormMode('list')} style={S.cancelFormBtn}>Cancel</button>
              <button type="button" onClick={handleSaveTaxGroup} style={S.saveFormBtn}>Save Tax Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: 16 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: '#0f172a' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #94a3b8', fontSize: 13, fontWeight: 800, color: '#0f172a', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%' },
  addTaxGroupBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  tableWrapper: { width: '100%', overflowX: 'auto', border: '1.5px solid #e2e8f0', borderRadius: 12, backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 },
  tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' },
  th: { padding: '12px 16px', fontWeight: 900, color: '#475569' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 16px', fontWeight: 800, color: '#334155' },
  actionEditBtn: { background: 'none', border: 'none', color: '#2563eb', fontWeight: 900, cursor: 'pointer' },
  actionDeactivateBtn: { background: 'none', border: 'none', color: '#d97706', fontWeight: 900, cursor: 'pointer' },
  actionDeleteBtn: { background: 'none', border: 'none', color: '#dc2626', fontWeight: 900, cursor: 'pointer' },
  screenCardForm: { backgroundColor: '#fff', border: '2px solid #cbd5e1', borderRadius: 16, padding: 24 },
  saveFormBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: 'pointer' },
  cancelFormBtn: { backgroundColor: '#fff', color: '#334155', border: '1.5px solid #cbd5e1', padding: '11px 18px', borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: 'pointer' }
};