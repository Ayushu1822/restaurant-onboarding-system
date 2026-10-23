import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const DEFAULT_CATEGORIES = ['Combos', 'Starters', 'Biryanis', 'Sandwiches', 'Burgers', 'Main Course'];

export default function MenuModule() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCatalog, setActiveCatalog] = useState('Default Online Menu');
  const [showPausedModal, setShowPausedModal] = useState(false);
  
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Add Item Modal state
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Combos');
  const [customCategory, setCustomCategory] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  useEffect(() => {
    fetchMenuItems();
    window.openPausedItemsModal = () => setShowPausedModal(true);
    return () => { delete window.openPausedItemsModal; };
  }, []);

  const fetchMenuItems = () => {
    const userEmail = localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/menu?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMenuItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Menu fetch error:", err);
        setLoading(false);
      });
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'LIVE' ? 'PAUSED' : 'LIVE';
    fetch(`${API_BASE_URL}/api/v1/menu/${id}/status?status=${newStatus}`, {
      method: 'PUT'
    })
      .then(res => {
        if (res.ok) {
          setMenuItems(menuItems.map(item => item.id === id ? { ...item, status: newStatus } : item));
        }
      })
      .catch(err => console.error("Status update error:", err));
  };

  const handleDeleteItem = (id, name) => {
    if (!window.confirm(`Delete "${name}" from menu?`)) return;

    fetch(`${API_BASE_URL}/api/v1/menu/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.ok) {
          setMenuItems(menuItems.filter(item => item.id !== id));
        }
      })
      .catch(err => console.error("Delete error:", err));
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    const finalCategory = category === 'ADD_NEW' ? customCategory.trim() : category;
    if (!itemName || !unitPrice || !finalCategory) return alert('Please enter Item Name, Price, and Category.');

    const userEmail = localStorage.getItem('userEmail') || '';
    const newItem = {
      itemName,
      category: finalCategory,
      unitPrice: Number(unitPrice),
      catalogName: activeCatalog,
      status: 'LIVE',
      restaurantEmail: userEmail // ✅ Tied strictly to current logged-in account
    };

    fetch(`${API_BASE_URL}/api/v1/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    })
      .then(res => {
        if (res.ok) {
          setShowModal(false);
          setItemName('');
          setUnitPrice('');
          setCustomCategory('');
          setCategory('Combos');
          fetchMenuItems();
        } else {
          alert('Failed to save menu item.');
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const catalogFilteredItems = menuItems.filter(i => (i.catalogName || 'Default In-House Menu') === activeCatalog);

  const totalAvailable = catalogFilteredItems.filter(i => i.status === 'LIVE').length;
  const totalPaused = catalogFilteredItems.filter(i => i.status === 'PAUSED').length;
  const allPausedItems = menuItems.filter(i => i.status === 'PAUSED');

  const dynamicCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...menuItems.map(i => i.category).filter(Boolean)]));

  return (
    <div style={styles.container}>
      
      {/* Header Bar */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em'}}>Menus</h2>
          <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500'}}>Create menus, activate them per channel, and manage items.</p>
        </div>

        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button 
            onClick={() => setShowPausedModal(true)}
            onMouseEnter={() => setHoveredBtn('paused')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.pausedHeaderBtn,
              background: hoveredBtn === 'paused' ? '#fef2f2' : '#fff',
              borderColor: totalPaused > 0 ? '#dc2626' : '#cbd5e1',
              color: totalPaused > 0 ? '#dc2626' : '#334155'
            }}
          >
            🔴 Manage Paused Items <span style={styles.pausedCountPill}>{totalPaused}</span>
          </button>

          <button 
            onClick={() => setShowModal(true)}
            onMouseEnter={() => setHoveredBtn('newMenu')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.primaryBtn,
              background: hoveredBtn === 'newMenu' ? '#065f46' : '#047857',
              transform: hoveredBtn === 'newMenu' ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredBtn === 'newMenu' ? '0 6px 16px rgba(4,120,87,0.35)' : '0 2px 6px rgba(4,120,87,0.2)'
            }}
          >
            + Add Dish
          </button>
        </div>
      </div>

      {/* Menu Catalog Cards */}
      <div style={styles.catalogsGrid}>
        
        {/* Default Online Menu Card */}
        <div 
          onClick={() => setActiveCatalog('Default Online Menu')}
          onMouseEnter={() => setHoveredCard('online')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...styles.catalogCard,
            borderColor: activeCatalog === 'Default Online Menu' ? '#047857' : (hoveredCard === 'online' ? '#10b981' : '#cbd5e1'),
            background: activeCatalog === 'Default Online Menu' ? '#f0fdf4' : '#fff',
            transform: hoveredCard === 'online' ? 'translateY(-3px)' : 'translateY(0)',
            boxShadow: hoveredCard === 'online' ? '0 12px 25px rgba(4,120,87,0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px'}}>
            <span style={styles.liveOnlineBadge}>🟢 ONLINE CHANNEL</span>
            <span style={{fontSize: '11px', color: '#047857', fontWeight: '800'}}>{activeCatalog === 'Default Online Menu' ? 'ACTIVE VIEW' : 'Click to View'}</span>
          </div>
          <h3 style={{margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>Default Online Menu</h3>
          <p style={{margin: '0 0 16px 0', fontSize: '12px', color: '#64748b'}}>Menu served on your website and WhatsApp ordering.</p>
        </div>

        {/* Default In-House Menu Card */}
        <div 
          onClick={() => setActiveCatalog('Default In-House Menu')}
          onMouseEnter={() => setHoveredCard('inhouse')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...styles.catalogCard,
            borderColor: activeCatalog === 'Default In-House Menu' ? '#047857' : (hoveredCard === 'inhouse' ? '#10b981' : '#cbd5e1'),
            background: activeCatalog === 'Default In-House Menu' ? '#f0fdf4' : '#fff',
            transform: hoveredCard === 'inhouse' ? 'translateY(-3px)' : 'translateY(0)',
            boxShadow: hoveredCard === 'inhouse' ? '0 12px 25px rgba(4,120,87,0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px'}}>
            <span style={styles.inhouseBadge}>🍴 IN-HOUSE DEFAULT</span>
            <span style={{fontSize: '11px', color: '#047857', fontWeight: '800'}}>{activeCatalog === 'Default In-House Menu' ? 'ACTIVE VIEW' : 'Click to View'}</span>
          </div>
          <h3 style={{margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>Default In-House Menu</h3>
          <p style={{margin: '0 0 16px 0', fontSize: '12px', color: '#64748b'}}>Served at tables and takeaway counter.</p>
        </div>

      </div>

      {/* Summary Status Strip */}
      <div style={styles.summaryStrip}>
        <span>{activeCatalog.toUpperCase()} · <strong>{totalAvailable} AVAILABLE</strong> · <strong style={{color: '#dc2626'}}>{totalPaused} PAUSED</strong></span>
        {totalPaused > 0 && (
          <button onClick={() => setShowPausedModal(true)} style={styles.viewPausedLink}>
            View Paused Items ({totalPaused}) →
          </button>
        )}
      </div>

      {/* Categorized Items List */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '50px', color: '#64748b'}}>Loading menu catalog from PostgreSQL...</div>
      ) : catalogFilteredItems.length === 0 ? (
        <div style={{textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', border: '1.5px dashed #cbd5e1', color: '#64748b'}}>
          No items found in {activeCatalog} for this account. Click "+ Add Dish" above!
        </div>
      ) : (
        dynamicCategories.map(cat => {
          const catItems = catalogFilteredItems.filter(item => item.category === cat);
          if (catItems.length === 0) return null;

          return (
            <div key={cat} style={styles.categorySection}>
              <div style={styles.categoryHeader}>{cat}</div>
              <div style={styles.categoryCard}>
                {catItems.map((item, idx) => {
                  const isRowHovered = hoveredRow === item.id;
                  const isLive = item.status === 'LIVE';

                  return (
                    <div 
                      key={item.id}
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        ...styles.itemRow,
                        background: isRowHovered ? '#f8fafc' : '#fff',
                        borderBottom: idx === catItems.length - 1 ? 'none' : '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <span style={{width: '8px', height: '8px', borderRadius: '50%', background: isLive ? '#10b981' : '#ef4444'}}></span>
                        <div>
                          <span style={{fontSize: '14px', fontWeight: '700', color: '#0f172a'}}>{item.itemName}</span>
                          <span style={{fontSize: '11px', color: '#94a3b8', marginLeft: '10px'}}>({item.catalogName || 'Default In-House Menu'})</span>
                        </div>
                      </div>

                      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <span style={{fontSize: '14px', fontWeight: '800', color: '#0f172a'}}>₹{item.unitPrice.toFixed(2)}</span>
                        
                        <button 
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          style={{
                            background: isLive ? '#ecfdf5' : '#fef2f2',
                            color: isLive ? '#047857' : '#dc2626',
                            border: `1.5px solid ${isLive ? '#10b981' : '#fca5a5'}`,
                            padding: '4px 12px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {isLive ? '🟢 Live' : '🔴 Paused'}
                        </button>

                        <button 
                          onClick={() => handleDeleteItem(item.id, item.itemName)}
                          title="Delete Item"
                          style={styles.deleteBtn}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Manage Paused Items Modal */}
      {showPausedModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>🔴 Manage Paused Items ({allPausedItems.length})</h3>
              <button onClick={() => setShowPausedModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            {allPausedItems.length === 0 ? (
              <div style={{textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px'}}>No paused items across your restaurant menus! All dishes are LIVE.</div>
            ) : (
              <div style={{maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px'}}>
                {allPausedItems.map(item => (
                  <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                    <div>
                      <div style={{fontSize: '13px', fontWeight: '700', color: '#0f172a'}}>{item.itemName}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{item.category} · {item.catalogName || 'Default In-House Menu'}</div>
                    </div>
                    <button 
                      onClick={() => handleToggleStatus(item.id, 'PAUSED')}
                      style={{background: '#ecfdf5', color: '#047857', border: '1px solid #10b981', padding: '5px 12px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer'}}
                    >
                      Make Live 🟢
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowPausedModal(false)} style={styles.saveBtn}>Close Modal</button>
          </div>
        </div>
      )}

      {/* Add New Menu Item Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSaveItem} style={styles.modalCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a'}}>Add Dish to {activeCatalog}</h3>
              <button type="button" onClick={() => setShowModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            <label style={styles.label}>Dish Name *</label>
            <input 
              style={styles.input}
              placeholder="e.g. Butter Chicken"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
            />

            <div style={{display: 'flex', gap: '12px'}}>
              <div style={{flex: 1}}>
                <label style={styles.label}>Category</label>
                <select 
                  style={styles.input}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="ADD_NEW">+ Create New Category...</option>
                </select>
              </div>

              <div style={{flex: 1}}>
                <label style={styles.label}>Price (₹) *</label>
                <input 
                  type="number"
                  step="0.01"
                  style={styles.input}
                  placeholder="299"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {category === 'ADD_NEW' && (
              <>
                <label style={styles.label}>New Category Name *</label>
                <input 
                  style={styles.input}
                  placeholder="e.g. Desserts, Beverages"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  required
                />
              </>
            )}

            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
              <button type="submit" style={styles.saveBtn}>Save Dish</button>
              <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { padding: '28px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto', paddingBottom: '80px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  primaryBtn: { background: '#047857', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  pausedHeaderBtn: { border: '1.5px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  pausedCountPill: { background: '#dc2626', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '900' },
  viewPausedLink: { background: 'none', border: 'none', color: '#dc2626', fontWeight: '800', fontSize: '12px', cursor: 'pointer' },
  catalogsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' },
  catalogCard: { background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '22px', transition: 'all 0.25s ease', cursor: 'pointer' },
  liveOnlineBadge: { background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  inhouseBadge: { background: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  summaryStrip: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '24px' },
  categorySection: { marginBottom: '20px' },
  categoryHeader: { fontSize: '12px', fontWeight: '900', color: '#64748b', letterSpacing: '0.06em', marginBottom: '8px', textTransform: 'uppercase' },
  categoryCard: { background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden' },
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', transition: 'background 0.15s ease' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalCard: { width: '460px', background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' },
  label: { fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px', color: '#334155' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', marginBottom: '12px', background: '#fff', outline: 'none' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' },
  saveBtn: { width: '100%', background: '#047857', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' },
  cancelBtn: { flex: 1, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }
};