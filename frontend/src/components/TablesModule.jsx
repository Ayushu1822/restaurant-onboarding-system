import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function TablesModule() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  
  // Modal states for managing or adding tables
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New table form state
  const [newTableForm, setNewTableForm] = useState({
    tableId: '',
    section: 'MAIN',
    seats: 4,
    status: 'Available'
  });

  // Fetch tables from backend on load
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = () => {
    fetch(`${API_BASE_URL}/api/v1/tables`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTables(data);
        } else {
          // Fallback initial tables if DB is empty
          setTables([
            { tableId: 'T1', section: 'MAIN', seats: 2, status: 'Available', customerName: null, visitTime: null, currentAmount: null },
            { tableId: 'T2', section: 'MAIN', seats: 4, status: 'Available', customerName: null, visitTime: null, currentAmount: null },
            { tableId: 'T3', section: 'MAIN', seats: 4, status: 'Available', customerName: null, visitTime: null, currentAmount: null },
            { tableId: 'T3B', section: 'MAIN', seats: 4, status: 'Ready to Pay', customerName: 'Krishna', visitTime: '28m ago', currentAmount: 694.58 },
            { tableId: 'T4', section: 'MAIN', seats: 2, status: 'Billing', customerName: 'Asha', visitTime: '1h ago', currentAmount: 749.70 },
            { tableId: 'T5', section: 'PATIO', seats: 6, status: 'Available', customerName: null, visitTime: null, currentAmount: null },
            { tableId: 'T6', section: 'PATIO', seats: 4, status: 'Available', customerName: null, visitTime: null, currentAmount: null },
            { tableId: 'T7', section: 'PATIO', seats: 2, status: 'Available', customerName: null, visitTime: null, currentAmount: null },
            { tableId: 'B1', section: 'BAR', seats: 1, status: 'Occupied', customerName: 'Asha', visitTime: '20m ago', currentAmount: 66.15 },
            { tableId: 'B2', section: 'BAR', seats: 1, status: 'Available', customerName: null, visitTime: null, currentAmount: null }
          ]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tables:", err);
        setLoading(false);
      });
  };

  const handleUpdateStatus = (tableId, newStatus) => {
    const updated = tables.map(t => {
      if (t.tableId === tableId) {
        return { 
          ...t, 
          status: newStatus, 
          customerName: newStatus === 'Available' ? null : t.customerName,
          currentAmount: newStatus === 'Available' ? null : t.currentAmount 
        };
      }
      return t;
    });
    setTables(updated);
    setSelectedTable(null);

    // Sync with backend
    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}/status?status=${newStatus}`, {
      method: 'PUT'
    }).catch(err => console.log("Status sync warning:", err));
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableForm.tableId) return alert('Please enter a Table ID (e.g., T8, B3)');

    const newTableObj = {
      tableId: newTableForm.tableId.toUpperCase(),
      section: newTableForm.section,
      seats: Number(newTableForm.seats),
      status: 'Available',
      customerName: null,
      visitTime: null,
      currentAmount: null
    };

    setTables([...tables, newTableObj]);
    setShowAddModal(false);
    setNewTableForm({ tableId: '', section: 'MAIN', seats: 4, status: 'Available' });

    // Optional backend save call if endpoint exists
    fetch(`${API_BASE_URL}/api/v1/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTableObj)
    }).catch(err => console.log("Backend table create note:", err));
  };

  const handleDeleteTable = (tableId) => {
    if (!window.confirm(`Are you sure you want to delete table ${tableId}?`)) return;
    setTables(tables.filter(t => t.tableId !== tableId));
    setSelectedTable(null);

    fetch(`${API_BASE_URL}/api/v1/tables/${tableId}`, {
      method: 'DELETE'
    }).catch(err => console.log("Table delete note:", err));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'Occupied': return { bg: '#e0f2fe', text: '#0369a1', border: '#38bdf8' };
      case 'Ready to Pay': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'Billing': return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      case 'Reserved': return { bg: '#f1f5f9', text: '#475569', border: '#94a3b8' };
      default: return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  const openCount = tables.filter(t => t.status === 'Available').length;
  const occupiedCount = tables.filter(t => t.status === 'Occupied').length;
  const billingCount = tables.filter(t => t.status === 'Billing' || t.status === 'Ready to Pay').length;
  const reservedCount = tables.filter(t => t.status === 'Reserved').length;

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Tables Management</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(16,185,129,0.3)' }}
        >
          + Add New Table
        </button>
      </div>

      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px', fontWeight: '500' }}>
        <strong style={{ color: '#0f172a' }}>{openCount}/{tables.length} open</strong> &bull; {occupiedCount} occupied &bull; {billingCount} billing &bull; {reservedCount} reserved
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading tables from database...</div>
      ) : (
        ['MAIN', 'PATIO', 'BAR'].map(section => {
          const sectionTables = tables.filter(t => t.section === section);
          if (sectionTables.length === 0) return null;

          return (
            <div key={section} style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.08em', marginBottom: '14px' }}>{section}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {sectionTables.map(table => {
                  const st = getStatusStyle(table.status);
                  const isHovered = hoveredId === table.tableId;

                  return (
                    <div 
                      key={table.tableId} 
                      onClick={() => setSelectedTable(table)}
                      onMouseEnter={() => setHoveredId(table.tableId)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ 
                        background: '#fff', 
                        borderRadius: '14px', 
                        padding: '18px', 
                        border: `1.5px solid ${isHovered ? st.border : '#cbd5e1'}`, 
                        boxShadow: isHovered ? '0 12px 28px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                        transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '130px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{table.tableId}</span>
                          <span style={{ background: st.bg, color: st.text, padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{table.status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>{table.seats} seats</div>

                        {table.customerName ? (
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginBottom: '8px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{table.customerName} {table.visitTime && <span style={{ fontWeight: '400', color: '#64748b', fontSize: '11px' }}>&bull; {table.visitTime}</span>}</div>
                            {table.currentAmount && <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>₹{Number(table.currentAmount).toFixed(2)}</div>}
                          </div>
                        ) : (
                          <div style={{ height: '18px' }} />
                        )}
                      </div>

                      <div style={{ width: '100%', textAlign: 'center', padding: '6px 0', background: isHovered ? '#047857' : '#f8fafc', color: isHovered ? '#fff' : '#334155', borderRadius: '6px', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s' }}>
                        {table.status === 'Available' ? 'Free table' : 'Manage Table ›'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Table Management Modal */}
      {selectedTable && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedTable(null)}>
          <div style={{ width: '400px', backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Table {selectedTable.tableId}</h3>
              <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>{selectedTable.section} ({selectedTable.seats} seats)</span>
            </div>

            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Current Status: <strong style={{ color: '#0f172a' }}>{selectedTable.status}</strong>
              {selectedTable.customerName && <span style={{ display: 'block', marginTop: '4px' }}>Customer: {selectedTable.customerName} ({selectedTable.visitTime})</span>}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Update Status:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => handleUpdateStatus(selectedTable.tableId, 'Available')} style={{ padding: '10px', background: '#d1fae5', color: '#065f46', border: '1px solid #10b981', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Make Available</button>
                <button onClick={() => handleUpdateStatus(selectedTable.tableId, 'Occupied')} style={{ padding: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Mark Occupied</button>
                <button onClick={() => handleUpdateStatus(selectedTable.tableId, 'Ready to Pay')} style={{ padding: '10px', background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Ready to Pay</button>
                <button onClick={() => handleUpdateStatus(selectedTable.tableId, 'Billing')} style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Billing</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <button onClick={() => handleDeleteTable(selectedTable.tableId)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Delete Table</button>
              <button onClick={() => setSelectedTable(null)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTable} style={{ width: '380px', backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0f172a' }}>Add New Table</h3>
            
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Table ID / Name:</label>
            <input 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', boxSizing: 'border-box' }}
              placeholder="e.g. T8, B3, VIP1"
              value={newTableForm.tableId}
              onChange={e => setNewTableForm({...newTableForm, tableId: e.target.value})}
              required
            />

            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Section:</label>
            <select 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', background: '#fff' }}
              value={newTableForm.section}
              onChange={e => setNewTableForm({...newTableForm, section: e.target.value})}
            >
              <option value="MAIN">MAIN</option>
              <option value="PATIO">PATIO</option>
              <option value="BAR">BAR</option>
            </select>

            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Number of Seats:</label>
            <input 
              type="number"
              min="1"
              max="20"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}
              value={newTableForm.seats}
              onChange={e => setNewTableForm({...newTableForm, seats: e.target.value})}
              required
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Create Table</button>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}