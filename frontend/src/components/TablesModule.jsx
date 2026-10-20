import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function TablesModule() {
  const [tables, setTables] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const [newTableForm, setNewTableForm] = useState({ tableId: '', section: 'MAIN', seats: 4 });
  const [newStaffForm, setNewStaffForm] = useState({ name: '', role: 'WAITER', phone: '' });

  useEffect(() => {
    fetchTables();
    fetchStaff();
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

  const fetchStaff = () => {
    fetch(`${API_BASE_URL}/api/v1/staff`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaffList(data);
      })
      .catch(err => console.log("Staff fetch error:", err));
  };

  const handleUpdateStatusAndStaff = (tableId, newStatus, assignedCaptain) => {
    const payload = { status: newStatus };
    if (assignedCaptain !== undefined) payload.captain = assignedCaptain;

    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) fetchTables();
        else handleLegacyStatusUpdate(tableId, newStatus);
      })
      .catch(() => handleLegacyStatusUpdate(tableId, newStatus));

    setSelectedTable(null);
  };

  const handleLegacyStatusUpdate = (tableId, newStatus) => {
    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}/status?status=${newStatus}`, { method: 'PUT' })
      .then(res => { if (res.ok) fetchTables(); })
      .catch(err => console.error("Legacy update error:", err));
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

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaffForm.name) return alert('Enter staff name');

    fetch(`${API_BASE_URL}/api/v1/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaffForm)
    })
      .then(res => {
        if (res.ok) {
          setShowStaffModal(false);
          setNewStaffForm({ name: '', role: 'WAITER', phone: '' });
          fetchStaff();
          alert('Staff member added successfully!');
        } else {
          alert('Failed to add staff');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Restaurant Tables & Captains</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            <strong>{tables.filter(t => t.status === 'Available').length}/{tables.length} tables open</strong> • Assign waitstaff for live service
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowStaffModal(true)} style={styles.staffBtn}>👥 Manage / Add Staff</button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add New Table</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '600' }}>Loading floor tables & staff from database...</div>
      ) : tables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
          No tables found. Click "+ Add New Table" above to begin.
        </div>
      ) : (
        ['MAIN', 'PATIO', 'BAR'].map(section => {
          const sectionTables = tables.filter(t => t.section === section);
          if (sectionTables.length === 0) return null;

          return (
            <div key={section} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: '900', color: '#047857', letterSpacing: '0.08em', background: '#ecfdf5', padding: '4px 12px', borderRadius: '6px', border: '1px solid #10b981' }}>{section} SECTION</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '18px' }}>
                {sectionTables.map(table => {
                  const isHovered = hoveredId === table.tableId;
                  const status = table.status || 'Available';
                  const captainName = table.captain || table.waiterName || 'Unassigned';

                  return (
                    <div 
                      key={table.tableId} 
                      onClick={() => setSelectedTable(table)}
                      onMouseEnter={() => setHoveredId(table.tableId)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ 
                        background: '#fff', borderRadius: '16px', padding: '20px', 
                        border: `2px solid ${isHovered ? '#047857' : '#e2e8f0'}`, 
                        boxShadow: isHovered ? '0 15px 30px rgba(4,120,87,0.12)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{table.tableId}</span>
                          <span style={{ background: status === 'Available' ? '#d1fae5' : status === 'Billing' ? '#eff6ff' : '#fee2e2', color: status === 'Available' ? '#065f46' : status === 'Billing' ? '#1d4ed8' : '#991b1b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>{status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>👥 Capacity: {table.seats} seats</div>
                        <div style={{ fontSize: '12px', color: '#047857', fontWeight: '800', background: '#ecfdf5', padding: '6px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                          🧑‍✈️ Captain: {captainName}
                        </div>
                      </div>
                      
                      <div style={{ width: '100%', textAlign: 'center', padding: '8px 0', background: isHovered ? '#047857' : '#f8fafc', color: isHovered ? '#fff' : '#334155', borderRadius: '8px', fontWeight: '800', fontSize: '12px', transition: 'all 0.2s', marginTop: '12px' }}>
                        Manage & Assign ›
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '900', fontSize: '18px' }}>Table {selectedTable.tableId} Management</h3>
              <button onClick={() => setSelectedTable(null)} style={styles.closeXBtn}>✕</button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '6px' }}>ASSIGN WAITER / CAPTAIN</label>
              <select 
                style={styles.input}
                defaultValue={selectedTable.captain || ''}
                onChange={(e) => handleUpdateStatusAndStaff(selectedTable.tableId, selectedTable.status || 'Occupied', e.target.value)}
              >
                <option value="">-- Select Captain / Waiter --</option>
                {staffList.map(s => (
                  <option key={s.id || s.name} value={s.name}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '6px' }}>UPDATE TABLE STATUS</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <button onClick={() => handleUpdateStatusAndStaff(selectedTable.tableId, 'Available', 'Unassigned')} style={{ padding: '10px', background: '#d1fae5', color: '#065f46', border: '1px solid #10b981', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>Make Available (Clear)</button>
              <button onClick={() => handleUpdateStatusAndStaff(selectedTable.tableId, 'Occupied')} style={{ padding: '10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>Mark Occupied</button>
              <button onClick={() => handleUpdateStatusAndStaff(selectedTable.tableId, 'Billing')} style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>Ready for Billing</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <button onClick={() => handleDeleteTable(selectedTable.tableId)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Delete Table</button>
              <button onClick={() => setSelectedTable(null)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Table Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTable} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontWeight: '900' }}>Add New Table</h3>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '5px' }}>TABLE ID / NAME:</label>
            <input style={styles.input} placeholder="e.g. T8" value={newTableForm.tableId} onChange={e => setNewTableForm({...newTableForm, tableId: e.target.value})} required />
            
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '5px' }}>SECTION:</label>
            <select style={{...styles.input, background: '#fff'}} value={newTableForm.section} onChange={e => setNewTableForm({...newTableForm, section: e.target.value})}>
              <option value="MAIN">MAIN</option><option value="PATIO">PATIO</option><option value="BAR">BAR</option>
            </select>

            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '5px' }}>SEATS:</label>
            <input type="number" style={styles.input} value={newTableForm.seats} onChange={e => setNewTableForm({...newTableForm, seats: e.target.value})} required />

            <button type="submit" style={{ ...styles.addBtn, width: '100%', padding: '12px', marginTop: '10px' }}>Create Table</button>
          </form>
        </div>
      )}

      {/* Add Staff Modal */}
      {showStaffModal && (
        <div style={styles.modalOverlay} onClick={() => setShowStaffModal(false)}>
          <form onSubmit={handleAddStaff} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontWeight: '900' }}>Add Waiter / Captain</h3>
            
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '5px' }}>STAFF NAME:</label>
            <input style={styles.input} placeholder="e.g. Rahul Sharma" value={newStaffForm.name} onChange={e => setNewStaffForm({...newStaffForm, name: e.target.value})} required />
            
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '5px' }}>ROLE:</label>
            <select style={{...styles.input, background: '#fff'}} value={newStaffForm.role} onChange={e => setNewStaffForm({...newStaffForm, role: e.target.value})}>
              <option value="WAITER">Waiter</option>
              <option value="CAPTAIN">Captain</option>
            </select>

            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '5px' }}>PHONE NUMBER:</label>
            <input style={styles.input} placeholder="10-digit mobile" value={newStaffForm.phone} onChange={e => setNewStaffForm({...newStaffForm, phone: e.target.value})} />

            <button type="submit" style={{ ...styles.staffBtn, width: '100%', padding: '12px', marginTop: '10px', textAlign: 'center' }}>Save Staff Member</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  moduleWrapper: { display: 'flex', flexDirection: 'column', flex: 1, height: '100%', padding: '24px', background: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '80px' },
  addBtn: { background: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.25)', transition: 'all 0.2s' },
  staffBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'all 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { width: '400px', backgroundColor: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1.5px solid #e2e8f0' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '15px', boxSizing: 'border-box', fontSize: '13px', outline: 'none' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }
};