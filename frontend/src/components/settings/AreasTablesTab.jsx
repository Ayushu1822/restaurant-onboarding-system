// FILE: src/components/settings/AreasTablesTab.jsx
import React, { useState } from 'react';

export default function AreasTablesTab({ formData, setFormData }) {
  const [showAddAreaBox, setShowAddAreaBox] = useState(false);
  const [newAreaNameInput, setNewAreaNameInput] = useState('');
  const [activeAreaForTableBox, setActiveAreaForTableBox] = useState(null);
  const [newTableForm, setNewTableForm] = useState({ name: '', pax: 4 });

  const handleAutoOpenToggle = (val) => {
    setFormData(prev => ({
      ...prev,
      areasAndTables: { ...prev.areasAndTables, autoOpenQrScan: val }
    }));
  };

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

  return (
    <div style={S.sectionGroup}>
      <div style={S.serviceHoursBanner}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <div style={{fontWeight: 900, color: '#0369a1', fontSize: 15}}>Auto-Open on QR Scan</div>
          <div style={{fontSize: 12, color: '#0c4a6e', fontWeight: 800}}>Let customers open a table by scanning, without staff opening it first.</div>
        </div>
        <input type="checkbox" checked={formData.areasAndTables?.autoOpenQrScan ?? true} onChange={e => handleAutoOpenToggle(e.target.checked)} style={{width: 22, height: 22, cursor: 'pointer', accentColor: '#0284c7'}} />
      </div>

      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 10}}>
        <button type="button" onClick={() => setShowAddAreaBox(true)} style={S.addAreaBtn}>+ Add Area</button>
      </div>

      {showAddAreaBox && (
        <div style={S.inlineCardForm}>
          <h4 style={{margin: '0 0 10px 0', fontSize: 15, fontWeight: 900, color: '#0f172a'}}>Add New Area</h4>
          <div style={{display: 'flex', gap: 10}}>
            <input type="text" placeholder="Enter area name (e.g., Rooftop, Balcony)" value={newAreaNameInput} onChange={e => setNewAreaNameInput(e.target.value)} style={S.input} autoFocus />
            <button type="button" onClick={handleSaveNewArea} style={S.saveInlineBtn}>Save Area</button>
            <button type="button" onClick={() => setShowAddAreaBox(false)} style={S.cancelInlineBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div style={S.noticeBanner}>Every table can have its own QR code. Customers scan it to view the menu and add items directly to the table's order in POS.</div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 24, marginTop: 10}}>
        {formData.areasAndTables?.areas?.map(area => (
          <div key={area.id} style={S.areaContainer}>
            <div style={S.areaHeader}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <span style={{fontSize: 16}}>🪑</span>
                <span style={{fontWeight: 900, fontSize: 16, color: '#0f172a'}}>{area.name}</span>
                <span style={{fontSize: 12, color: '#64748b', fontWeight: 800}}>({area.tables?.length || 0} tables)</span>
              </div>
              <button type="button" onClick={() => setActiveAreaForTableBox(area.id)} style={S.addTableBtn}>+ Add Table</button>
            </div>

            {activeAreaForTableBox === area.id && (
              <div style={{...S.inlineCardForm, marginBottom: 16}}>
                <h4 style={{margin: '0 0 10px 0', fontSize: 14, fontWeight: 900, color: '#0f172a'}}>Add Table in {area.name}</h4>
                <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
                  <input type="text" placeholder="Table Name (e.g. T5)" value={newTableForm.name} onChange={e => setNewTableForm({...newTableForm, name: e.target.value})} style={{...S.input, flex: 2}} autoFocus />
                  <input type="number" placeholder="Pax (seats)" value={newTableForm.pax} onChange={e => setNewTableForm({...newTableForm, pax: e.target.value})} style={{...S.input, flex: 1}} />
                  <button type="button" onClick={e => handleSaveNewTable(e, area.id)} style={S.saveInlineBtn}>Save Table</button>
                  <button type="button" onClick={() => setActiveAreaForTableBox(null)} style={S.cancelInlineBtn}>Cancel</button>
                </div>
              </div>
            )}

            <div style={S.tablesGrid}>
              {area.tables?.map(table => (
                <div key={table.id} style={S.tableCard}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <span style={{fontWeight: 900, fontSize: 15, color: '#0f172a'}}>{table.name}</span>
                      <span style={{backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 900, border: '1px solid #cbd5e1'}}># QR {table.qrEnabled ? 'on' : 'off'}</span>
                    </div>
                    <button type="button" onClick={() => handleDeleteTable(area.id, table.id)} style={S.iconBtn} title="Delete Table">🗑️</button>
                  </div>
                  <div style={{fontSize: 12, color: '#475569', fontWeight: 800, marginBottom: 14}}>
                    {table.pax} pax · <strong style={{color: table.status === 'Occupied' ? '#dc2626' : '#059669'}}>{table.status || 'Available'}</strong>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #f1f5f9', paddingTop: 10}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                      <input type="checkbox" checked={table.qrEnabled ?? true} onChange={() => handleToggleTableQr(area.id, table.id)} style={{width: 16, height: 16, cursor: 'pointer', accentColor: '#059669'}} />
                      <span style={{fontSize: 12, fontWeight: 900, color: '#0f172a'}}>QR ordering</span>
                    </div>
                    <button type="button" onClick={() => alert(`Viewing QR Code for ${table.name}`)} style={S.viewQrBtn}>📱 View QR</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: 16 },
  serviceHoursBanner: { backgroundColor: '#e0f2fe', border: '2px solid #7dd3fc', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  addAreaBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  inlineCardForm: { backgroundColor: '#fff', border: '2px solid #0f172a', borderRadius: 12, padding: 16, marginBottom: 16 },
  saveInlineBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  cancelInlineBtn: { backgroundColor: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '8px 14px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  noticeBanner: { backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: 10, fontSize: 12, fontWeight: 800 },
  areaContainer: { backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: 14, padding: 16 },
  areaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 10 },
  addTableBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 900, fontSize: 11, cursor: 'pointer' },
  tablesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  tableCard: { backgroundColor: '#fff', border: '2px solid #cbd5e1', borderRadius: 12, padding: 14 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 },
  viewQrBtn: { backgroundColor: '#f1f5f9', color: '#0f172a', border: '1.5px solid #cbd5e1', padding: '4px 10px', borderRadius: 6, fontWeight: 900, fontSize: 11, cursor: 'pointer' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #94a3b8', fontSize: 13, fontWeight: 800, color: '#0f172a', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%' }
};