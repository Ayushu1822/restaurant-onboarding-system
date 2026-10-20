import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function TablesModule() {
  const [tables, setTables] = useState([]);
  const [captainsList, setCaptainsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCaptainManageModal, setShowCaptainManageModal] = useState(false);

  const [newTableForm, setNewTableForm] = useState({ tableId: '', section: 'MAIN', seats: 4 });
  const [newCaptainForm, setNewCaptainForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchTables();
    fetchCaptains();
  }, []);

  const fetchTables = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/tables`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTables(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tables:", err);
        setLoading(false);
      });
  };

  const fetchCaptains = () => {
    fetch(`${API_BASE_URL}/api/v1/staff`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter only captains or general staff
          setCaptainsList(data.filter(s => (s.role || '').toUpperCase().includes('CAPTAIN') || true));
        }
      })
      .catch(err => console.log("Captains fetch error:", err));
  };

  const handleUpdateStatusAndCaptain = (tableId, newStatus, assignedCaptain) => {
    // Standardized payload matching Spring Boot expectations
    const payload = { 
      status: newStatus,
      captain: assignedCaptain || 'Unassigned'
    };

    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          fetchTables();
        } else {
          // Fallback to query param route if needed
          fetch(`${API_BASE_URL}/api/v1/tables/${tableId}/status?status=${newStatus}`, { method: 'PUT' })
            .then(() => fetchTables());
        }
      })
      .catch(err => console.error("Update error:", err));

    setSelectedTable(null);
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableForm.tableId) return alert('Enter Table ID');

    const obj = {
      tableId: newTableForm.tableId.toUpperCase(),
      section: newTableForm.section,
      seats: Number(newTableForm.seats),
      status: 'Available',
      captain: 'Unassigned'
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

  const handleAddCaptain = (e) => {
    e.preventDefault();
    if (!newCaptainForm.name) return alert('Enter captain name');

    fetch(`${API_BASE_URL}/api/v1/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCaptainForm.name,
        role: 'CAPTAIN',
        phone: newCaptainForm.phone
      })
    })
      .then(res => {
        if (res.ok) {
          setShowCaptainManageModal(false);
          setNewCaptainForm({ name: '', phone: '' });
          fetchCaptains();
          alert('Captain added successfully!');
        } else {
          alert('Failed to add captain');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Restaurant Floor & Captains</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '600' }}>
            <strong style={{ color: '#059669' }}>{tables.filter(t => t.status === 'Available').length}/{tables.length} tables open</strong> • Assign floor captains for table service
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCaptainManageModal(true)} style={styles.captainManageBtn}>🧑‍✈️ Manage Captains</button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add Table</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '600' }}>Loading floor tables from database...</div>
      ) : tables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '2px dashed #cbd5e1', color: '#64748b', fontWeight: '600' }}>
          No tables found. Click "+ Add Table" above to begin.
        </div>
      ) : (
        ['MAIN', 'PATIO', 'BAR'].map(section => {
          const sectionTables = tables.filter(t => t.section === section);
          if (sectionTables.length === 0) return null;

          return (
            <div key={section} style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#047857', letterSpacing: '0.08em', background: '#ecfdf5', padding: '5px 12px', borderRadius: '6px', border: '1.5px solid #10b981' }}>{section} SECTION</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {sectionTables.map(table => {
                  const isHovered = hoveredId === table.tableId;
                  const status = table.status || 'Available';
                  const captainName = table.captain || 'Unassigned';

                  return (
                    <div 
                      key={table.tableId} 
                      onClick={() => setSelectedTable(table)}
                      onMouseEnter={() => setHoveredId(table.tableId)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ 
                        background: '#fff', borderRadius: '16px', padding: '20px', 
                        border: `2px solid ${isHovered ? '#059669' : '#e2e8f0'}`, 
                        boxShadow: isHovered ? '0 20px 25px -5px rgba(5, 150, 105, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '145px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{table.tableId}</span>
                          <span style={{ background: status === 'Available' ? '#d1fae5' : status === 'Billing' ? '#eff6ff' : '#fee2e2', color: status === 'Available' ? '#065f46' : status === 'Billing' ? '#1d4ed8' : '#991b1b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>👥 Capacity: {table.seats} seats</div>
                        <div style={{ fontSize: '12px', color: captainName !== 'Unassigned' ? '#059669' : '#94a3b8', fontWeight: '800', background: captainName !== 'Unassigned' ? '#ecfdf5' : '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: `1px solid ${captainName !== 'Unassigned' ? '#bbf7d0' : '#e2e8f0'}` }}>
                          🧑‍✈️ Captain: {captainName}
                        </div>
                      </div>
                      
                      <div style={{ width: '100%', textAlign: 'center', padding: '8px 0', background: isHovered ? '#059669' : '#f8fafc', color: isHovered ? '#fff' : '#334155', borderRadius: '8px', fontWeight: '800', fontSize: '12px', transition: 'all 0.2s', marginTop: '12px' }}>
                        Manage Table & Captain ›
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Table Management & Captain Assignment Modal */}
      {selectedTable && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTable(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '900', fontSize: '18px' }}>Table {selectedTable.tableId} Management</h3>
              <button onClick={() => setSelectedTable(null)} style={styles.closeXBtn}>✕</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>ASSIGN FLOOR CAPTAIN</label>
              <select 
                style={styles.input}
                defaultValue={selectedTable.captain || ''}
                onChange={(e) => handleUpdateStatusAndCaptain(selectedTable.tableId, selectedTable.status || 'Occupied', e.target.value)}
              >
                <option value="Unassigned">-- Select Captain --</option>
                {captainsList.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>UPDATE TABLE STATUS</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <button onClick={() => handleUpdateStatusAndCaptain(selectedTable.tableId, 'Available', 'Unassigned')} style={{ padding: '11px', background: '#d1fae5', color: '#065f46', border: '1.5px solid #10b981', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Make Available (Clear Table)</button>
              <button onClick={() => handleUpdateStatusAndCaptain(selectedTable.tableId, 'Occupied')} style={{ padding: '11px', background: '#eff6ff', color: '#1d4ed8', border: '1.5px solid #38bdf8', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Mark Occupied</button>
              <button onClick={() => handleUpdateStatusAndCaptain(selectedTable.tableId, 'Billing')} style={{ padding: '11px', background: '#fee2e2', color: '#991b1b', border: '1.5px solid #ef4444', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Ready for Billing</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <button onClick={() => handleDeleteTable(selectedTable.tableId)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '9px 14px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>Delete Table</button>
              <button onClick={() => setSelectedTable(null)} style={{ background: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '9px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Table Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTable} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: '900' }}>Add New Table</h3>
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>TABLE ID / NAME:</label>
            <input style={styles.input} placeholder="e.g. T8" value={newTableForm.tableId} onChange={e => setNewTableForm({...newTableForm, tableId: e.target.value})} required />
            
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>SECTION:</label>
            <select style={{...styles.input, background: '#fff'}} value={newTableForm.section} onChange={e => setNewTableForm({...newTableForm, section: e.target.value})}>
              <option value="MAIN">MAIN</option><option value="PATIO">PATIO</option><option value="BAR">BAR</option>
            </select>

            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>SEATS:</label>
            <input type="number" style={styles.input} value={newTableForm.seats} onChange={e => setNewTableForm({...newTableForm, seats: e.target.value})} required />

            <button type="submit" style={{ ...styles.addBtn, width: '100%', padding: '12px', marginTop: '10px' }}>Create Table</button>
          </form>
        </div>
      )}

      {/* Manage Captains Modal */}
      {showCaptainManageModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCaptainManageModal(false)}>
          <form onSubmit={handleAddCaptain} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: '900' }}>Add Floor Captain</h3>
            
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>CAPTAIN NAME:</label>
            <input style={styles.input} placeholder="e.g. Rahul Sharma" value={newCaptainForm.name} onChange={e => setNewCaptainForm({...newCaptainForm, name: e.target.value})} required />
            
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '5px' }}>PHONE NUMBER:</label>
            <input style={styles.input} placeholder="10-digit mobile" value={newCaptainForm.phone} onChange={e => setNewCaptainForm({...newCaptainForm, phone: e.target.value})} />

            <button type="submit" style={{ ...styles.captainManageBtn, width: '100%', padding: '12px', marginTop: '10px', textAlign: 'center' }}>Save Captain</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  moduleWrapper: { display: 'flex', flexDirection: 'column', flex: 1, height: '100%', padding: '24px', background: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '80px' },
  addBtn: { background: '#059669', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)', transition: 'all 0.2s' },
  captainManageBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'all 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '420px', backgroundColor: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '15px', boxSizing: 'border-box', fontSize: '13px', outline: 'none', fontWeight: '600' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }
};