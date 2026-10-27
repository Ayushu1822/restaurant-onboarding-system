import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const DEFAULT_CATEGORIES = ['Combos', 'Starters', 'Biryanis', 'Sandwiches', 'Burgers', 'Main Course'];
const AVAILABLE_ICONS = ['🍽️', '🌐', '☕', '🍕', '🥪', '🍦', '🍷', '🍺', '🍲', '🎂', '🥗', '☀️', '🌙', '✨', '⭐', '🍴'];

export default function MenuModule() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Two-tier navigation: null = menu list view, object = inside specific menu view
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'categories' | 'variants' | 'addons'

  // Tax groups fetched from Settings / Restaurant Profile
  const [taxGroups, setTaxGroups] = useState([
    { name: 'Standard Restaurant (5%)', rate: 5, cgst: 2.5, sgst: 2.5 }
  ]);

  // Menus list state
  const [menus, setMenus] = useState([
    { id: 'm-online', name: 'Default Online Menu', description: 'Menu served on your website and WhatsApp ordering.', icon: '🌐', channel: 'Online' },
    { id: 'm-inhouse', name: 'Default In-House Menu', description: 'Served at tables and takeaway counter.', icon: '🍽️', channel: 'In-house' }
  ]);

  // Sub-tab states
  const [categories, setCategories] = useState([
    { id: 'c-1', name: 'Chicken Meal', displayName: 'Chicken Specials' },
    { id: 'c-2', name: 'Main Course', displayName: 'Main Course' }
  ]);
  const [variants, setVariants] = useState([
    { id: 'v-1', name: 'online_store_no_show_variant' },
    { id: 'v-2', name: 'Full / Half' }
  ]);
  const [addonGroups, setAddonGroups] = useState([
    { id: 'ag-1', name: 'Spices', displayName: 'Spices' }
  ]);
  const [addons, setAddons] = useState([
    { id: 'ad-1', name: 'Krishna', group: 'Spices', price: 1.00, available: true, tag: '', description: '' }
  ]);

  // Modals visibility state
  const [showNewMenuModal, setShowNewMenuModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddAddonModal, setShowAddAddonModal] = useState(false);
  const [showPausedModal, setShowPausedModal] = useState(false);

  // Form states matching screenshots
  const [newMenuForm, setNewMenuForm] = useState({ name: '', description: '', icon: '🍽️', channel: 'In-house' });
  const [newItemForm, setNewItemForm] = useState({ itemName: '', description: '', unitPrice: '', category: 'Main Course', taxGroup: 'Standard Restaurant (5%)' });
  const [newCatForm, setNewCatForm] = useState({ name: '', displayName: '' });
  const [newVarName, setNewVarName] = useState('');
  const [newGroupForm, setNewGroupForm] = useState({ name: '', displayName: '' });
  const [newAddonForm, setNewAddonForm] = useState({ name: '', price: '', tag: '', group: 'Spices', description: '', available: true });

  // Hover states for reactive UI
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    fetchData();
    window.openPausedItemsModal = () => setShowPausedModal(true);
    return () => { delete window.openPausedItemsModal; };
  }, []);

  const fetchData = async () => {
    const userEmail = localStorage.getItem('userEmail') || '';
    try {
      // Fetch Restaurant Profile for Tax Groups
      const profileRes = await fetch(`${API_BASE_URL}/api/v1/restaurants/email/${userEmail}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.billingConfig) {
          const billing = typeof profileData.billingConfig === 'string' ? JSON.parse(profileData.billingConfig) : profileData.billingConfig;
          if (billing && billing.taxGroups) {
            setTaxGroups(billing.taxGroups);
            if (billing.defaultTaxGroup && billing.defaultTaxGroup !== 'No default') {
              setNewItemForm(prev => ({ ...prev, taxGroup: billing.defaultTaxGroup }));
            }
          }
        }
      }

      // Fetch Menu Items
      const menuRes = await fetch(`${API_BASE_URL}/api/v1/menu?email=${userEmail}`);
      if (menuRes.ok) {
        const data = await menuRes.json();
        if (Array.isArray(data)) setMenuItems(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'LIVE' ? 'PAUSED' : 'LIVE';
    fetch(`${API_BASE_URL}/api/v1/menu/${id}/status?status=${newStatus}`, { method: 'PUT' })
      .then(res => {
        if (res.ok) {
          setMenuItems(menuItems.map(item => item.id === id ? { ...item, status: newStatus } : item));
        }
      })
      .catch(err => console.error("Status error:", err));
  };

  const handleDeleteItem = (id, name) => {
    if (!window.confirm(`Delete "${name}" from menu?`)) return;
    fetch(`${API_BASE_URL}/api/v1/menu/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) setMenuItems(menuItems.filter(item => item.id !== id));
      })
      .catch(err => console.error("Delete error:", err));
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!newItemForm.itemName || !newItemForm.unitPrice) return alert('Please enter Item Name and Price.');

const userEmail = localStorage.getItem('userEmail') || '';
    const payload = {
      itemName: newItemForm.itemName,
      description: newItemForm.description,
      category: newItemForm.category,
      unitPrice: Number(newItemForm.unitPrice),
      taxGroup: newItemForm.taxGroup,
      catalogName: activeMenu ? activeMenu.name : 'Default In-House Menu',
      status: 'LIVE',
      restaurantEmail: userEmail
    };

    fetch(`${API_BASE_URL}/api/v1/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          setShowAddItemModal(false);
          setNewItemForm({ itemName: '', description: '', unitPrice: '', category: 'Main Course', taxGroup: taxGroups[0]?.name || 'Standard Restaurant (5%)' });
          fetchData();
          showMsg('✅ Item added successfully!', 'success');
        } else {
          alert('Failed to save menu item.');
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const handleCreateMenu = (e) => {
    e.preventDefault();
    if (!newMenuForm.name.trim()) return alert('Enter Menu Name');

    const created = {
      id: 'menu-' + Date.now(),
      name: newMenuForm.name.trim(),
      description: newMenuForm.description.trim(),
      icon: newMenuForm.icon,
      channel: newMenuForm.channel
    };
    setMenus([...menus, created]);
    setShowNewMenuModal(false);
    setNewMenuForm({ name: '', description: '', icon: '🍽️', channel: 'In-house' });
    showMsg('✅ New Menu created successfully!', 'success');
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!newCatForm.name.trim()) return alert('Enter category name');
    setCategories([...categories, {
      id: 'cat-' + Date.now(),
      name: newCatForm.name.trim(),
      displayName: newCatForm.displayName.trim() || newCatForm.name.trim()
    }]);
    setShowAddCategoryModal(false);
    setNewCatForm({ name: '', displayName: '' });
  };

  const handleSaveVariant = (e) => {
    e.preventDefault();
    if (!newVarName.trim()) return alert('Enter variant name');
    setVariants([...variants, { id: 'var-' + Date.now(), name: newVarName.trim() }]);
    setShowAddVariantModal(false);
    setNewVarName('');
  };

  const handleSaveGroup = (e) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) return alert('Enter group name');
    setAddonGroups([...addonGroups, {
      id: 'ag-' + Date.now(),
      name: newGroupForm.name.trim(),
      displayName: newGroupForm.displayName.trim() || newGroupForm.name.trim()
    }]);
    setShowAddGroupModal(false);
    setNewGroupForm({ name: '', displayName: '' });
  };

  const handleSaveAddon = (e) => {
    e.preventDefault();
    if (!newAddonForm.name.trim() || !newAddonForm.price) return alert('Enter name and price');
    setAddons([...addons, {
      id: 'ad-' + Date.now(),
      name: newAddonForm.name.trim(),
      price: parseFloat(newAddonForm.price) || 0,
      group: newAddonForm.group,
      tag: newAddonForm.tag,
      description: newAddonForm.description,
      available: newAddonForm.available
    }]);
    setShowAddAddonModal(false);
    setNewAddonForm({ name: '', price: '', tag: '', group: addonGroups[0]?.name || 'Spices', description: '', available: true });
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const activeCatalogName = activeMenu ? activeMenu.name : 'Default In-House Menu';
  const catalogFilteredItems = menuItems.filter(i => (i.catalogName || 'Default In-House Menu') === activeCatalogName);
  const totalAvailable = catalogFilteredItems.filter(i => i.status === 'LIVE').length;
  const totalPaused = catalogFilteredItems.filter(i => i.status === 'PAUSED').length;
  const allPausedItems = menuItems.filter(i => i.status === 'PAUSED');

  const dynamicCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories.map(c => c.name), ...menuItems.map(i => i.category).filter(Boolean)]));

  // ==========================================
  // VIEW 2: INSIDE A SPECIFIC MENU (5 TABS)
  // ==========================================
  if (activeMenu) {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <button onClick={() => setActiveMenu(null)} style={styles.backBtn}>← Back to Menus</button>
            <div>
              <h2 style={{margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a'}}>
                {activeMenu.icon} {activeMenu.name}
              </h2>
              <p style={{margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700'}}>
                {activeMenu.description || 'Manage items, categories, variants, and add-ons'} · Channel: {activeMenu.channel}
              </p>
            </div>
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
            {activeTab === 'items' && (
              <button onClick={() => setShowAddItemModal(true)} style={styles.primaryBtn}>+ Add Item</button>
            )}
            {activeTab === 'categories' && (
              <button onClick={() => setShowAddCategoryModal(true)} style={styles.primaryBtn}>+ Add Category</button>
            )}
            {activeTab === 'variants' && (
              <button onClick={() => setShowAddVariantModal(true)} style={styles.primaryBtn}>+ Add Variant</button>
            )}
            {activeTab === 'addons' && (
              <button onClick={() => setShowAddAddonModal(true)} style={styles.primaryBtn}>+ Add Add-on</button>
            )}
            {activeTab === 'addon-groups' && (
              <button onClick={() => setShowAddGroupModal(true)} style={styles.primaryBtn}>+ Add Group</button>
            )}
          </div>
        </div>

        {message.text && (
          <div style={{...styles.alert, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534'}}>
            {message.text}
          </div>
        )}

        {/* 5 Sub Navigation Tabs matching screenshots */}
        <div style={styles.subTabsRow}>
          {[
            { id: 'items', label: 'Items' },
            { id: 'categories', label: 'Categories' },
            { id: 'variants', label: 'Variants' },
            { id: 'addon-groups', label: 'Addon Groups' },
            { id: 'addons', label: 'Addons' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.subTabBtn,
                ...(activeTab === tab.id ? styles.activeSubTabBtn : {})
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ITEMS */}
        {activeTab === 'items' && (
          <div>
            <div style={styles.summaryStrip}>
              <span>{activeCatalogName.toUpperCase()} · <strong>{totalAvailable} AVAILABLE</strong> · <strong style={{color: '#dc2626'}}>{totalPaused} PAUSED</strong></span>
            </div>

            {loading ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>Loading items...</div>
            ) : catalogFilteredItems.length === 0 ? (
              <div style={styles.emptyBox}>No items found in this menu. Click "+ Add Item" above!</div>
            ) : (
              dynamicCategories.map(cat => {
                const catItems = catalogFilteredItems.filter(i => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} style={{marginBottom: '20px'}}>
                    <div style={styles.categoryHeader}>{cat}</div>
                    <div style={styles.categoryCard}>
                      {catItems.map((item, idx) => {
                        const isLive = item.status === 'LIVE';
                        return (
                          <div key={item.id} style={{
                            ...styles.itemRow,
                            borderBottom: idx === catItems.length - 1 ? 'none' : '1px solid #f1f5f9'
                          }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                              <span style={{width: '8px', height: '8px', borderRadius: '50%', background: isLive ? '#10b981' : '#ef4444'}}></span>
                              <div>
                                <span style={{fontSize: '14px', fontWeight: '800', color: '#0f172a'}}>{item.itemName}</span>
                                {item.description && <div style={{fontSize: '11px', color: '#64748b'}}>{item.description}</div>}
                              </div>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                              <span style={{fontSize: '12px', fontWeight: '900', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px'}}>🏷️ {item.taxGroup || 'Standard (5%)'}</span>
                              <span style={{fontSize: '14px', fontWeight: '950', color: '#0f172a'}}>₹{Number(item.unitPrice || 0).toFixed(2)}</span>
                              <button onClick={() => handleToggleStatus(item.id, item.status)} style={{
                                background: isLive ? '#ecfdf5' : '#fef2f2',
                                color: isLive ? '#047857' : '#dc2626',
                                border: `1.5px solid ${isLive ? '#10b981' : '#fca5a5'}`,
                                padding: '4px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer'
                              }}>
                                {isLive ? '🟢 Live' : '🔴 Paused'}
                              </button>
                              <button onClick={() => handleDeleteItem(item.id, item.itemName)} title="Delete" style={styles.deleteBtn}>🗑️</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div style={styles.cardContainer}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div>
                <h3 style={{margin: 0, fontSize: '16px', fontWeight: '950', color: '#0f172a'}}>Categories</h3>
                <p style={{margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700'}}>Categories appear on POS sidebar and online menu navigation.</p>
              </div>
              <button onClick={() => setShowAddCategoryModal(true)} style={styles.primaryBtn}>+ Add Category</button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px'}}>
              {categories.map(c => (
                <div key={c.id} style={styles.simpleCard}>
                  <div style={{fontWeight: '950', color: '#0f172a', fontSize: '15px'}}>{c.name}</div>
                  <div style={{fontSize: '12px', color: '#64748b', fontWeight: '800', marginTop: '4px'}}>Display Name: {c.displayName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VARIANTS */}
        {activeTab === 'variants' && (
          <div style={styles.cardContainer}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div>
                <h3 style={{margin: 0, fontSize: '16px', fontWeight: '950', color: '#0f172a'}}>Variants</h3>
                <p style={{margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700'}}>Size or portion options an item can be sold in.</p>
              </div>
              <button onClick={() => setShowAddVariantModal(true)} style={styles.primaryBtn}>+ Add Variant</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {variants.map(v => (
                <div key={v.id} style={styles.simpleCardRow}>
                  <span style={{fontWeight: '950', color: '#0f172a'}}>{v.name}</span>
                  <span style={{fontSize: '11px', color: '#047857', fontWeight: '900', background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px'}}>Active</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADDON GROUPS */}
        {activeTab === 'addon-groups' && (
          <div style={styles.cardContainer}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div>
                <h3 style={{margin: 0, fontSize: '16px', fontWeight: '950', color: '#0f172a'}}>Add-on groups</h3>
                <p style={{margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700'}}>Buckets that add-ons belong to, e.g. Dips or Sides.</p>
              </div>
              <button onClick={() => setShowAddGroupModal(true)} style={styles.primaryBtn}>+ Add Group</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {addonGroups.map(ag => (
                <div key={ag.id} style={styles.simpleCardRow}>
                  <div>
                    <div style={{fontWeight: '950', color: '#0f172a'}}>{ag.name}</div>
                    <div style={{fontSize: '11px', color: '#64748b', fontWeight: '800'}}>Display: {ag.displayName}</div>
                  </div>
                  <span style={{fontSize: '12px', fontWeight: '900', color: '#059669'}}>1 Add-on</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ADDONS */}
        {activeTab === 'addons' && (
          <div style={styles.cardContainer}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div>
                <h3 style={{margin: 0, fontSize: '16px', fontWeight: '950', color: '#0f172a'}}>Add-ons</h3>
                <p style={{margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700'}}>Extras customers can add to an item.</p>
              </div>
              <button onClick={() => setShowAddAddonModal(true)} style={styles.primaryBtn}>+ Add Add-on</button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Group</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {addons.map(ad => (
                    <tr key={ad.id} style={styles.tableRow}>
                      <td style={styles.td}><strong style={{color: '#0f172a'}}>{ad.name}</strong></td>
                      <td style={styles.td}>{ad.group}</td>
                      <td style={styles.td}><strong style={{color: '#059669'}}>₹{ad.price.toFixed(2)}</strong></td>
                      <td style={styles.td}>
                        <input type="checkbox" checked={ad.available} readOnly style={{accentColor: '#059669', width: '18px', height: '18px'}} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MODALS ================= */}

        {/* Modal: Add Item (With Settings Tax Groups Dropdown) */}
        {showAddItemModal && (
          <div style={styles.modalOverlay} onClick={() => setShowAddItemModal(false)}>
            <form onSubmit={handleSaveItem} style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <div>
                  <h3 style={{margin: '0 0 2px 0', color: '#0f172a', fontWeight: '950', fontSize: '18px'}}>Add Item</h3>
                  <p style={{margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '800'}}>Every item needs a tax group.</p>
                </div>
                <button type="button" onClick={() => setShowAddItemModal(false)} style={styles.closeXBtn}>✕</button>
              </div>

              <label style={styles.label}>Item Name *</label>
              <input type="text" placeholder="e.g. Butter Chicken" value={newItemForm.itemName} onChange={e => setNewItemForm({...newItemForm, itemName: e.target.value})} style={styles.input} required autoFocus />

              <label style={styles.label}>Description</label>
              <textarea placeholder="Short note or ingredients..." value={newItemForm.description} onChange={e => setNewItemForm({...newItemForm, description: e.target.value})} style={{...styles.input, height: '65px', resize: 'none'}} />

              <div style={{display: 'flex', gap: '12px'}}>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input type="number" step="0.01" placeholder="299" value={newItemForm.unitPrice} onChange={e => setNewItemForm({...newItemForm, unitPrice: e.target.value})} style={styles.input} required />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Category</label>
                  <select value={newItemForm.category} onChange={e => setNewItemForm({...newItemForm, category: e.target.value})} style={styles.input}>
                    {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <label style={styles.label}>Tax Group *</label>
              <select value={newItemForm.taxGroup} onChange={e => setNewItemForm({...newItemForm, taxGroup: e.target.value})} style={styles.input}>
                {taxGroups.map(tg => (
                  <option key={tg.name} value={tg.name}>{tg.name} ({tg.rate}%)</option>
                ))}
              </select>
              <div style={{fontSize: '11px', color: '#64748b', fontWeight: '800', marginTop: '-6px', marginBottom: '14px'}}>
                CGST {taxGroups.find(t => t.name === newItemForm.taxGroup)?.cgst || 2.5}% + SGST {taxGroups.find(t => t.name === newItemForm.taxGroup)?.sgst || 2.5}%
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" style={styles.saveBtn}>Save</button>
                <button type="button" onClick={() => setShowAddItemModal(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Category */}
        {showAddCategoryModal && (
          <div style={styles.modalOverlay} onClick={() => setShowAddCategoryModal(false)}>
            <form onSubmit={handleSaveCategory} style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <h3 style={{margin: '0 0 16px 0', color: '#0f172a', fontWeight: '950'}}>Add category</h3>
              <label style={styles.label}>Category name *</label>
              <input type="text" placeholder="e.g. Starters" value={newCatForm.name} onChange={e => setNewCatForm({...newCatForm, name: e.target.value})} style={styles.input} required autoFocus />
              <label style={styles.label}>Display name (optional)</label>
              <input type="text" placeholder="Shown to customers" value={newCatForm.displayName} onChange={e => setNewCatForm({...newCatForm, displayName: e.target.value})} style={styles.input} />
              <div style={{display: 'flex', gap: '10px', marginTop: '16px'}}>
                <button type="submit" style={styles.saveBtn}>Save</button>
                <button type="button" onClick={() => setShowAddCategoryModal(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Variant */}
        {showAddVariantModal && (
          <div style={styles.modalOverlay} onClick={() => setShowAddVariantModal(false)}>
            <form onSubmit={handleSaveVariant} style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <h3 style={{margin: '0 0 16px 0', color: '#0f172a', fontWeight: '950'}}>Add variant</h3>
              <label style={styles.label}>Variant name *</label>
              <input type="text" placeholder="e.g. Half / Full" value={newVarName} onChange={e => setNewVarName(e.target.value)} style={styles.input} required autoFocus />
              <div style={{display: 'flex', gap: '10px', marginTop: '16px'}}>
                <button type="submit" style={styles.saveBtn}>Save</button>
                <button type="button" onClick={() => setShowAddVariantModal(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Add-on Group */}
        {showAddGroupModal && (
          <div style={styles.modalOverlay} onClick={() => setShowAddGroupModal(false)}>
            <form onSubmit={handleSaveGroup} style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <h3 style={{margin: '0 0 16px 0', color: '#0f172a', fontWeight: '950'}}>Add add-on group</h3>
              <label style={styles.label}>Group name *</label>
              <input type="text" placeholder="e.g. Dips or Sides" value={newGroupForm.name} onChange={e => setNewGroupForm({...newGroupForm, name: e.target.value})} style={styles.input} required autoFocus />
              <label style={styles.label}>Display name</label>
              <input type="text" placeholder="Defaults to group name" value={newGroupForm.displayName} onChange={e => setNewGroupForm({...newGroupForm, displayName: e.target.value})} style={styles.input} />
              <div style={{display: 'flex', gap: '10px', marginTop: '16px'}}>
                <button type="submit" style={styles.saveBtn}>Save</button>
                <button type="button" onClick={() => setShowAddGroupModal(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Add-on */}
        {showAddAddonModal && (
          <div style={styles.modalOverlay} onClick={() => setShowAddAddonModal(false)}>
            <form onSubmit={handleSaveAddon} style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <h3 style={{margin: '0 0 16px 0', color: '#0f172a', fontWeight: '950'}}>Add add-on</h3>
              <label style={styles.label}>Name *</label>
              <input type="text" placeholder="e.g. Extra Cheese" value={newAddonForm.name} onChange={e => setNewAddonForm({...newAddonForm, name: e.target.value})} style={styles.input} required autoFocus />
              
              <div style={{display: 'flex', gap: '10px'}}>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input type="number" step="0.01" placeholder="30" value={newAddonForm.price} onChange={e => setNewAddonForm({...newAddonForm, price: e.target.value})} style={styles.input} required />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Tag</label>
                  <input type="text" placeholder="Optional" value={newAddonForm.tag} onChange={e => setNewAddonForm({...newAddonForm, tag: e.target.value})} style={styles.input} />
                </div>
              </div>

              <label style={styles.label}>Group *</label>
              <select value={newAddonForm.group} onChange={e => setNewAddonForm({...newAddonForm, group: e.target.value})} style={styles.input}>
                {addonGroups.map(ag => <option key={ag.name} value={ag.name}>{ag.name}</option>)}
              </select>

              <label style={styles.label}>Description</label>
              <input type="text" placeholder="Optional" value={newAddonForm.description} onChange={e => setNewAddonForm({...newAddonForm, description: e.target.value})} style={styles.input} />

              <div style={{display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0'}}>
                <input type="checkbox" checked={newAddonForm.available} onChange={e => setNewAddonForm({...newAddonForm, available: e.target.checked})} style={{width: '18px', height: '18px', accentColor: '#059669'}} />
                <label style={{fontSize: '13px', fontWeight: '900', color: '#0f172a'}}>Available</label>
              </div>

              <div style={{display: 'flex', gap: '10px', marginTop: '16px'}}>
                <button type="submit" style={styles.saveBtn}>Save</button>
                <button type="button" onClick={() => setShowAddAddonModal(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // VIEW 1: MAIN MENU LIST (Two Options + Catalog Cards)
  // ==========================================
  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={{margin: 0, fontSize: '24px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.02em'}}>Menus</h2>
          <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '700'}}>Create menus, activate them per channel, and manage items.</p>
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
            onClick={() => setShowNewMenuModal(true)}
            onMouseEnter={() => setHoveredBtn('newMenu')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.primaryBtn,
              background: hoveredBtn === 'newMenu' ? '#065f46' : '#047857',
              transform: hoveredBtn === 'newMenu' ? 'translateY(-2px)' : 'translateY(0)'
            }}
          >
            + Add Menu
          </button>
        </div>
      </div>

      {message.text && (
        <div style={{...styles.alert, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534', marginBottom: '20px'}}>
          {message.text}
        </div>
      )}

      {/* Menu Catalog Cards (Reactive Hover Effects) */}
      <div style={styles.catalogsGrid}>
        {menus.map(menu => {
          const isCardHovered = hoveredCard === menu.id;
          return (
            <div 
              key={menu.id}
              onClick={() => setActiveMenu(menu)}
              onMouseEnter={() => setHoveredCard(menu.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...styles.catalogCard,
                borderColor: isCardHovered ? '#059669' : '#cbd5e1',
                transform: isCardHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isCardHovered ? '0 12px 25px rgba(5,150,105,0.15)' : '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                <span style={menu.channel === 'Online' ? styles.liveOnlineBadge : styles.inhouseBadge}>
                  {menu.channel === 'Online' ? '🟢 ONLINE CHANNEL' : '🍴 IN-HOUSE MENU'}
                </span>
                <span style={{fontSize: '11px', color: '#059669', fontWeight: '900'}}>Click to Manage →</span>
              </div>
              <h3 style={{margin: '0 0 6px 0', fontSize: '18px', fontWeight: '950', color: '#0f172a'}}>
                {menu.icon} {menu.name}
              </h3>
              <p style={{margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '800'}}>{menu.description}</p>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Menu (Matching screenshot image_d54581.png) */}
      {showNewMenuModal && (
        <div style={styles.modalOverlay} onClick={() => setShowNewMenuModal(false)}>
          <form onSubmit={handleCreateMenu} style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div>
                <h3 style={{margin: '0 0 4px 0', fontSize: '18px', fontWeight: '950', color: '#0f172a'}}>New Menu</h3>
                <p style={{margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '800'}}>Give the menu a name, an icon, and choose which channel it primarily serves.</p>
              </div>
              <button type="button" onClick={() => setShowNewMenuModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            <label style={styles.label}>Menu name *</label>
            <input 
              type="text" 
              placeholder="e.g. Lunch Special, Bar Menu" 
              value={newMenuForm.name} 
              onChange={e => setNewMenuForm({...newMenuForm, name: e.target.value})} 
              style={styles.input} 
              required 
              autoFocus 
            />

            <label style={styles.label}>Description (optional)</label>
            <textarea 
              placeholder="Short note shown to captains and staff" 
              value={newMenuForm.description} 
              onChange={e => setNewMenuForm({...newMenuForm, description: e.target.value})} 
              style={{...styles.input, height: '70px', resize: 'none'}} 
            />

            <label style={styles.label}>Icon</label>
            <div style={styles.iconGrid}>
              {AVAILABLE_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setNewMenuForm({...newMenuForm, icon: ic})}
                  style={{
                    ...styles.iconOptionBtn,
                    borderColor: newMenuForm.icon === ic ? '#ef4444' : '#cbd5e1',
                    background: newMenuForm.icon === ic ? '#fef2f2' : '#fff'
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>

            <label style={styles.label}>Primary channel</label>
            <select 
              value={newMenuForm.channel} 
              onChange={e => setNewMenuForm({...newMenuForm, channel: e.target.value})} 
              style={styles.input}
            >
              <option value="In-house">In-house</option>
              <option value="Online">Online</option>
            </select>
            <div style={{fontSize: '11px', color: '#64748b', fontWeight: '800', marginTop: '-6px', marginBottom: '16px'}}>
              Classification only. You can still activate this menu on either channel.
            </div>

            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowNewMenuModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" style={styles.redSaveBtn}>Create menu</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Manage Paused Items */}
      {showPausedModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPausedModal(false)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '950', color: '#0f172a'}}>🔴 Manage Paused Items ({allPausedItems.length})</h3>
              <button onClick={() => setShowPausedModal(false)} style={styles.closeXBtn}>✕</button>
            </div>

            {allPausedItems.length === 0 ? (
              <div style={{textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px', fontWeight: '800'}}>No paused items across your restaurant menus! All dishes are LIVE.</div>
            ) : (
              <div style={{maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px'}}>
                {allPausedItems.map(item => (
                  <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0'}}>
                    <div>
                      <div style={{fontSize: '13px', fontWeight: '950', color: '#0f172a'}}>{item.itemName}</div>
                      <div style={{fontSize: '11px', color: '#64748b', fontWeight: '800'}}>{item.category} · {item.catalogName || 'Default In-House Menu'}</div>
                    </div>
                    <button onClick={() => handleToggleStatus(item.id, 'PAUSED')} style={{background: '#ecfdf5', color: '#047857', border: '1.5px solid #10b981', padding: '5px 12px', borderRadius: '6px', fontWeight: '950', fontSize: '11px', cursor: 'pointer'}}>
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
    </div>
  );
}

const styles = {
  container: { padding: '28px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto', paddingBottom: '80px', textAlign: 'left' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '950', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '12px', color: '#64748b', fontWeight: '800' },
  backBtn: { background: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '8px 14px', borderRadius: '10px', fontWeight: '950', fontSize: '12px', cursor: 'pointer', color: '#334155' },
  primaryBtn: { background: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(5,150,105,0.2)' },
  redSaveBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  pausedHeaderBtn: { border: '1.5px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  pausedCountPill: { background: '#dc2626', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '950' },
  catalogsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' },
  catalogCard: { background: '#fff', border: '2px solid #cbd5e1', borderRadius: '16px', padding: '22px', transition: 'all 0.25s ease', cursor: 'pointer' },
  liveOnlineBadge: { background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '950' },
  inhouseBadge: { background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '950' },
  summaryStrip: { background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '900', color: '#334155', marginBottom: '20px' },
  subTabsRow: { display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' },
  subTabBtn: { background: 'none', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '950', fontSize: '13px', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' },
  activeSubTabBtn: { background: '#0f172a', color: '#fff' },
  cardContainer: { background: '#fff', borderRadius: '16px', border: '2px solid #cbd5e1', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  categorySection: { marginBottom: '24px' },
  categoryHeader: { fontSize: '12px', fontWeight: '950', color: '#047857', background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', border: '1.5px solid #10b981', marginBottom: '10px', textTransform: 'uppercase' },
  categoryCard: { background: '#fff', borderRadius: '14px', border: '2px solid #cbd5e1', overflow: 'hidden' },
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#fff' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalCard: { width: '480px', background: '#fff', padding: '28px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '2px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' },
  label: { fontSize: '11px', fontWeight: '950', display: 'block', marginBottom: '6px', color: '#334155' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '2px solid #94a3b8', fontSize: '13px', boxSizing: 'border-box', marginBottom: '14px', background: '#fff', outline: 'none', fontWeight: '900', color: '#0f172a' },
  closeXBtn: { background: 'none', border: 'none', fontSize: '18px', fontWeight: '950', color: '#64748b', cursor: 'pointer' },
  saveBtn: { width: '100%', background: '#047857', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  cancelBtn: { flex: 1, background: '#f1f5f9', color: '#334155', border: '2px solid #cbd5e1', padding: '12px', borderRadius: '10px', fontWeight: '950', fontSize: '13px', cursor: 'pointer' },
  emptyBox: { textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1', color: '#64748b', fontWeight: '900' },
  simpleCard: { background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '12px', padding: '16px' },
  simpleCardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '12px', padding: '14px 18px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' },
  tableWrapper: { width: '100%', overflowX: 'auto', border: '2px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '12px 16px', fontWeight: '950', color: '#475569' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 16px', fontWeight: '800', color: '#334155' },
  iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', marginBottom: '14px' },
  iconOptionBtn: { padding: '8px', fontSize: '18px', border: '2px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#fff' },
  alert: { padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '900', border: '2px solid' }
};