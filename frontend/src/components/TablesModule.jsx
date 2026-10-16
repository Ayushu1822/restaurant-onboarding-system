import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function TablesModule() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableForm, setNewTableForm] = useState({ tableId: '', section: 'MAIN', seats: 4 });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/tables`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTables(data);
        } else {
          setTables([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tables:", err);
        setLoading(false);
      });
  };

  const handleUpdateStatus = (tableId, newStatus) => {
    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}/status?status=${newStatus}`, {
      method: 'PUT'
    })
      .then(res => {
        if (res.ok) fetchTables();
      })
      .catch(err => console.error("Status update error:", err));
    setSelectedTable(null);
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableForm.tableId) return alert('Enter Table ID');

    const obj = {
      tableId: newTableForm.tableId.toUpperCase(),
      section: newTableForm.section,
      seats: Number(newTableForm.seats),
      status: 'Available'
    };

    fetch(`${API_BASE_URL}/api/v1/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    })
      .then(res => {
        if (res.ok) {
          setShowAddModal(false);
          setNewTableForm({ tableId: '', section: 'MAIN', seats: 4 });
          fetchTables();
        } else {
          alert('Failed to save table');
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const handleDeleteTable = (tableId) => {
    if (!window.confirm(`Delete table ${tableId}?`)) return;
    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}`, { method: 'DELETE' })
      .then(() => fetchTables())
      .catch(err => console.error(err));
    setSelectedTable(null);
  };

  return (
    <div style={styles.moduleWrapper}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Tables Management</h2>
        <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add New Table</button>
      </div>

      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
        <strong>{tables.filter(t => t.status === 'Available').length}/{tables.length} open</strong>
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Loading live tables from PostgreSQL...</div>
      ) : tables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          No tables found. Click "+ Add New Table" above.
        </div>
      ) : (
        ['MAIN', 'PATIO', 'BAR'].map(section => {
          const sectionTables = tables.filter(t => t.section === section);
          if (sectionTables.length === 0) return null;

          return (
            <div key={section} style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.08em', marginBottom: '14px' }}>{section}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {sectionTables.map(table => {
                  const isHovered = hoveredId === table.tableId;
                  return (
                    <div 
                      key={table.tableId} 
                      onClick={() => setSelectedTable(table)}
                      onMouseEnter={() => setHoveredId(table.tableId)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ 
                        background: '#fff', borderRadius: '14px', padding: '18px', 
                        border: `1.5px solid ${isHovered ? '#10b981' : '#cbd5e1'}`, 
                        boxShadow: isHovered ? '0 12px 28px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        transition: 'all 0.25s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{table.tableId}</span>
                          <span style={{ background: table.status === 'Available' ? '#d1fae5' : '#fee2e2', color: table.status === 'Available' ? '#065f46' : '#991b1b', padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{table.status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{table.seats} seats</div>
                      </div>
                      <div style={{ width: '100%', textAlign: 'center', padding: '7px 0', background: isHovered ? '#047857' : '#f1f5f9', color: isHovered ? '#fff' : '#0f172a', borderRadius: '6px', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s' }}>
                        Manage Table ›
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {selectedTable && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTable(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Table {selectedTable.tableId}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => handleUpdateStatus(selectedTable.tableId, 'Available')} style={{ padding: '10px', background: '#d1fae5', color: '#065f46', border: '1px solid #10b981', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Make Available</button>
              <button onClick={() => handleUpdateStatus(selectedTable.tableId, 'Occupied')} style={{ padding: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Mark Occupied</button>
              <button onClick={() => handleUpdateStatus(selectedTable.tableId, 'Billing')} style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Billing</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => handleDeleteTable(selectedTable.tableId)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
              <button onClick={() => setSelectedTable(null)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTable} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Add New Table</h3>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Table ID:</label>
            <input style={styles.input} placeholder="e.g. T8" value={newTableForm.tableId} onChange={e => setNewTableForm({...newTableForm, tableId: e.target.value})} required />
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Section:</label>
            <select style={{...styles.input, background: '#fff'}} value={newTableForm.section} onChange={e => setNewTableForm({...newTableForm, section: e.target.value})}>
              <option value="MAIN">MAIN</option><option value="PATIO">PATIO</option><option value="BAR">BAR</option>
            </select>
            <button type="submit" style={styles.addBtn}>Create Table</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  moduleWrapper: { display: 'flex', flexDirection: 'column', flex: 1, height: '100%', padding: '24px', background: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '80px' },
  addBtn: { background: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(4,120,87,0.3)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '380px', backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', boxSizing: 'border-box' }
};