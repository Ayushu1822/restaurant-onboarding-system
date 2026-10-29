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
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'categories' | 'variants' | 'addon-groups' | 'addons'

  // Tax groups fetched from Settings / Restaurant Profile
  const [taxGroups, setTaxGroups] = useState([
    { name: 'Standard Restaurant (5%)', rate: 5, cgst: 2.5, sgst: 2.5 }
  ]);

  // Menus list state with localStorage persistence
  const userEmail = localStorage.getItem('userEmail') || 'default_user';
  const storedCustomMenus = localStorage.getItem(`customMenus_${userEmail}`);

  const [menus, setMenus] = useState(storedCustomMenus ? JSON.parse(storedCustomMenus) : [
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
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      alert('Please login first.');
      setLoading(false);
      return;
    }
    fetchData(userEmail);
    window.openPausedItemsModal = () => setShowPausedModal(true);
    return () => { delete window.openPausedItemsModal; };
  }, []);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(`customMenus_${userEmail}`, JSON.stringify(menus));
    }
  }, [menus, userEmail]);

  const fetchData = async (email) => {
    try {
      // Fetch Restaurant Profile for Tax Groups
      const profileRes = await fetch(`${API_BASE_URL}/api/v1/restaurants/email/${email}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.billingConfig) {
          try {
            const billing = typeof profileData.billingConfig === 'string' ? JSON.parse(profileData.billingConfig) : profileData.billingConfig;
            if (billing && billing.taxGroups) {
              setTaxGroups(billing.taxGroups);
              if (billing.defaultTaxGroup && billing.defaultTaxGroup !== 'No default') {
                setNewItemForm(prev => ({ ...prev, taxGroup: billing.defaultTaxGroup }));
              }
            }
          } catch (e) {}
        }
      }

      // Fetch Menu Items and enrich with stored tax group map
      const menuRes = await fetch(`${API_BASE_URL}/api/v1/menu?email=${email}`);
      if (menuRes.ok) {
        const data = await menuRes.json();
        if (Array.isArray(data)) {
          const storedTaxMap = JSON.parse(localStorage.getItem(`itemTaxMap_${email}`) || '{}');
          const enriched = data.map(item => ({
            ...item,
            taxGroup: item.taxGroup || storedTaxMap[item.id] || storedTaxMap[item.itemName] || 'Standard Restaurant (5%)'
          }));
          setMenuItems(enriched);
        }
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

  const handleOpenAddItemModal = () => {
    const defaultTg = taxGroups[0]?.name || 'Standard Restaurant (5%)';
    setNewItemForm(prev => ({ ...prev, taxGroup: prev.taxGroup || defaultTg }));
    setShowAddItemModal(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!newItemForm.itemName || !newItemForm.unitPrice) return alert('Please enter Item Name and Price.');

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
      .then(async res => {
        if (res.ok) {
          const savedItem = await res.json().catch(() => ({}));
          // Save selected tax group mapping in localStorage so it persists across refreshes
          const storedTaxMap = JSON.parse(localStorage.getItem(`itemTaxMap_${userEmail}`) || '{}');
          if (savedItem.id) storedTaxMap[savedItem.id] = newItemForm.taxGroup;
          storedTaxMap[newItemForm.itemName] = newItemForm.taxGroup;
          localStorage.setItem(`itemTaxMap_${userEmail}`, JSON.stringify(storedTaxMap));

          setShowAddItemModal(false);
          setNewItemForm({ itemName: '', description: '', unitPrice: '', category: 'Main Course', taxGroup: taxGroups[0]?.name || 'Standard Restaurant (5%)' });
          fetchData(userEmail);
          showMsg('✅ Item added successfully with correct tax group!', 'success');
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
      <div className="mn">
        <style>{css}</style>

        <div className="mn-header">
          <div className="mn-header-left">
            <button onClick={() => setActiveMenu(null)} className="mn-back-btn">← Back to Menus</button>
            <div>
              <h2 className="mn-title">
                {activeMenu.icon} {activeMenu.name}
              </h2>
              <p className="mn-subtitle">
                {activeMenu.description || 'Manage items, categories, variants, and add-ons'} · Channel: {activeMenu.channel}
              </p>
            </div>
          </div>

          <div className="mn-header-actions">
            {activeTab === 'items' && (
              <button onClick={handleOpenAddItemModal} className="mn-primary-btn">+ Add Item</button>
            )}
            {activeTab === 'categories' && (
              <button onClick={() => setShowAddCategoryModal(true)} className="mn-primary-btn">+ Add Category</button>
            )}
            {activeTab === 'variants' && (
              <button onClick={() => setShowAddVariantModal(true)} className="mn-primary-btn">+ Add Variant</button>
            )}
            {activeTab === 'addons' && (
              <button onClick={() => setShowAddAddonModal(true)} className="mn-primary-btn">+ Add Add-on</button>
            )}
            {activeTab === 'addon-groups' && (
              <button onClick={() => setShowAddGroupModal(true)} className="mn-primary-btn">+ Add Group</button>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`mn-alert ${message.type === 'error' ? 'is-error' : 'is-success'}`}>
            {message.text}
          </div>
        )}

        {/* 5 Sub Navigation Tabs */}
        <div className="mn-tabs">
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
              className={`mn-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ITEMS */}
        {activeTab === 'items' && (
          <div className="mn-panel">
            <div className="mn-summary">
              <span>{activeCatalogName.toUpperCase()} · <strong>{totalAvailable} AVAILABLE</strong> · <strong className="mn-red">{totalPaused} PAUSED</strong></span>
            </div>

            {loading ? (
              <div className="mn-center">
                <span className="mn-spinner" aria-hidden="true" />
                Loading items...
              </div>
            ) : catalogFilteredItems.length === 0 ? (
              <div className="mn-empty">No items found in this menu. Click "+ Add Item" above!</div>
            ) : (
              dynamicCategories.map(cat => {
                const catItems = catalogFilteredItems.filter(i => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="mn-cat-block">
                    <div className="mn-cat-header">{cat}</div>
                    <div className="mn-cat-card">
                      {catItems.map((item, idx) => {
                        const isLive = item.status === 'LIVE';
                        return (
                          <div key={item.id} className="mn-item-row">
                            <div className="mn-item-left">
                              <span className={`mn-dot ${isLive ? 'is-live' : 'is-paused'}`}></span>
                              <div>
                                <span className="mn-item-name">{item.itemName}</span>
                                {item.description && <div className="mn-item-desc">{item.description}</div>}
                              </div>
                            </div>
                            <div className="mn-item-right">
                              <span className="mn-tax-chip">🏷️ {item.taxGroup}</span>
                              <span className="mn-price">₹{Number(item.unitPrice || 0).toFixed(2)}</span>
                              <button onClick={() => handleToggleStatus(item.id, item.status)} className={`mn-toggle ${isLive ? 'is-live' : 'is-paused'}`}>
                                {isLive ? '🟢 Live' : '🔴 Paused'}
                              </button>
                              <button onClick={() => handleDeleteItem(item.id, item.itemName)} title="Delete" className="mn-delete-btn">🗑️</button>
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
          <div className="mn-panel mn-card-box">
            <div className="mn-box-head">
              <div>
                <h3 className="mn-box-title">Categories</h3>
                <p className="mn-box-desc">Categories appear on POS sidebar and online menu navigation.</p>
              </div>
              <button onClick={() => setShowAddCategoryModal(true)} className="mn-primary-btn">+ Add Category</button>
            </div>
            <div className="mn-simple-grid">
              {categories.map(c => (
                <div key={c.id} className="mn-simple-card">
                  <div className="mn-simple-name">{c.name}</div>
                  <div className="mn-simple-sub">Display Name: {c.displayName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VARIANTS */}
        {activeTab === 'variants' && (
          <div className="mn-panel mn-card-box">
            <div className="mn-box-head">
              <div>
                <h3 className="mn-box-title">Variants</h3>
                <p className="mn-box-desc">Size or portion options an item can be sold in.</p>
              </div>
              <button onClick={() => setShowAddVariantModal(true)} className="mn-primary-btn">+ Add Variant</button>
            </div>
            <div className="mn-simple-col">
              {variants.map(v => (
                <div key={v.id} className="mn-simple-row">
                  <span className="mn-simple-name">{v.name}</span>
                  <span className="mn-active-chip">Active</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADDON GROUPS */}
        {activeTab === 'addon-groups' && (
          <div className="mn-panel mn-card-box">
            <div className="mn-box-head">
              <div>
                <h3 className="mn-box-title">Add-on groups</h3>
                <p className="mn-box-desc">Buckets that add-ons belong to, e.g. Dips or Sides.</p>
              </div>
              <button onClick={() => setShowAddGroupModal(true)} className="mn-primary-btn">+ Add Group</button>
            </div>
            <div className="mn-simple-col">
              {addonGroups.map(ag => (
                <div key={ag.id} className="mn-simple-row">
                  <div>
                    <div className="mn-simple-name">{ag.name}</div>
                    <div className="mn-simple-sub">Display: {ag.displayName}</div>
                  </div>
                  <span className="mn-count-chip">1 Add-on</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ADDONS */}
        {activeTab === 'addons' && (
          <div className="mn-panel mn-card-box">
            <div className="mn-box-head">
              <div>
                <h3 className="mn-box-title">Add-ons</h3>
                <p className="mn-box-desc">Extras customers can add to an item.</p>
              </div>
              <button onClick={() => setShowAddAddonModal(true)} className="mn-primary-btn">+ Add Add-on</button>
            </div>
            <div className="mn-table-wrap">
              <table className="mn-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Group</th>
                    <th>Price</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {addons.map(ad => (
                    <tr key={ad.id}>
                      <td><strong className="mn-strong">{ad.name}</strong></td>
                      <td>{ad.group}</td>
                      <td><strong className="mn-green">₹{ad.price.toFixed(2)}</strong></td>
                      <td>
                        <input type="checkbox" checked={ad.available} readOnly className="mn-checkbox" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MODALS ================= */}

        {/* Modal: Add Item */}
        {showAddItemModal && (
          <div className="mn-overlay" onClick={() => setShowAddItemModal(false)}>
            <form onSubmit={handleSaveItem} className="mn-modal" onClick={e => e.stopPropagation()}>
              <div className="mn-modal-head">
                <div>
                  <h3 className="mn-modal-title">Add Item</h3>
                  <p className="mn-modal-sub">Every item needs a tax group.</p>
                </div>
                <button type="button" onClick={() => setShowAddItemModal(false)} className="mn-close-x">✕</button>
              </div>

              <label className="mn-label">Item Name *</label>
              <input type="text" placeholder="e.g. Butter Chicken" value={newItemForm.itemName} onChange={e => setNewItemForm({...newItemForm, itemName: e.target.value})} className="mn-input" required autoFocus />

              <label className="mn-label">Description</label>
              <textarea placeholder="Short note or ingredients..." value={newItemForm.description} onChange={e => setNewItemForm({...newItemForm, description: e.target.value})} className="mn-input mn-textarea" />

              <div className="mn-two-col">
                <div className="mn-col">
                  <label className="mn-label">Price (₹) *</label>
                  <input type="number" step="0.01" placeholder="299" value={newItemForm.unitPrice} onChange={e => setNewItemForm({...newItemForm, unitPrice: e.target.value})} className="mn-input" required />
                </div>
                <div className="mn-col">
                  <label className="mn-label">Category</label>
                  <select value={newItemForm.category} onChange={e => setNewItemForm({...newItemForm, category: e.target.value})} className="mn-input">
                    {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <label className="mn-label">Tax Group *</label>
              <select value={newItemForm.taxGroup} onChange={e => setNewItemForm({...newItemForm, taxGroup: e.target.value})} className="mn-input">
                {taxGroups.map(tg => (
                  <option key={tg.name} value={tg.name}>{tg.name} ({tg.rate}%)</option>
                ))}
              </select>
              <div className="mn-hint">
                CGST {taxGroups.find(t => t.name === newItemForm.taxGroup)?.cgst || 2.5}% + SGST {taxGroups.find(t => t.name === newItemForm.taxGroup)?.sgst || 2.5}%
              </div>

              <div className="mn-btn-row">
                <button type="submit" className="mn-save-btn">Save</button>
                <button type="button" onClick={() => setShowAddItemModal(false)} className="mn-cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Category */}
        {showAddCategoryModal && (
          <div className="mn-overlay" onClick={() => setShowAddCategoryModal(false)}>
            <form onSubmit={handleSaveCategory} className="mn-modal" onClick={e => e.stopPropagation()}>
              <h3 className="mn-modal-title mn-mb">Add category</h3>
              <label className="mn-label">Category name *</label>
              <input type="text" placeholder="e.g. Starters" value={newCatForm.name} onChange={e => setNewCatForm({...newCatForm, name: e.target.value})} className="mn-input" required autoFocus />
              <label className="mn-label">Display name (optional)</label>
              <input type="text" placeholder="Shown to customers" value={newCatForm.displayName} onChange={e => setNewCatForm({...newCatForm, displayName: e.target.value})} className="mn-input" />
              <div className="mn-btn-row mn-mt">
                <button type="submit" className="mn-save-btn">Save</button>
                <button type="button" onClick={() => setShowAddCategoryModal(false)} className="mn-cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Variant */}
        {showAddVariantModal && (
          <div className="mn-overlay" onClick={() => setShowAddVariantModal(false)}>
            <form onSubmit={handleSaveVariant} className="mn-modal" onClick={e => e.stopPropagation()}>
              <h3 className="mn-modal-title mn-mb">Add variant</h3>
              <label className="mn-label">Variant name *</label>
              <input type="text" placeholder="e.g. Half / Full" value={newVarName} onChange={e => setNewVarName(e.target.value)} className="mn-input" required autoFocus />
              <div className="mn-btn-row mn-mt">
                <button type="submit" className="mn-save-btn">Save</button>
                <button type="button" onClick={() => setShowAddVariantModal(false)} className="mn-cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Add-on Group */}
        {showAddGroupModal && (
          <div className="mn-overlay" onClick={() => setShowAddGroupModal(false)}>
            <form onSubmit={handleSaveGroup} className="mn-modal" onClick={e => e.stopPropagation()}>
              <h3 className="mn-modal-title mn-mb">Add add-on group</h3>
              <label className="mn-label">Group name *</label>
              <input type="text" placeholder="e.g. Dips or Sides" value={newGroupForm.name} onChange={e => setNewGroupForm({...newGroupForm, name: e.target.value})} className="mn-input" required autoFocus />
              <label className="mn-label">Display name</label>
              <input type="text" placeholder="Defaults to group name" value={newGroupForm.displayName} onChange={e => setNewGroupForm({...newGroupForm, displayName: e.target.value})} className="mn-input" />
              <div className="mn-btn-row mn-mt">
                <button type="submit" className="mn-save-btn">Save</button>
                <button type="button" onClick={() => setShowAddGroupModal(false)} className="mn-cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Add-on */}
        {showAddAddonModal && (
          <div className="mn-overlay" onClick={() => setShowAddAddonModal(false)}>
            <form onSubmit={handleSaveAddon} className="mn-modal" onClick={e => e.stopPropagation()}>
              <h3 className="mn-modal-title mn-mb">Add add-on</h3>
              <label className="mn-label">Name *</label>
              <input type="text" placeholder="e.g. Extra Cheese" value={newAddonForm.name} onChange={e => setNewAddonForm({...newAddonForm, name: e.target.value})} className="mn-input" required autoFocus />
              
              <div className="mn-two-col">
                <div className="mn-col">
                  <label className="mn-label">Price (₹) *</label>
                  <input type="number" step="0.01" placeholder="30" value={newAddonForm.price} onChange={e => setNewAddonForm({...newAddonForm, price: e.target.value})} className="mn-input" required />
                </div>
                <div className="mn-col">
                  <label className="mn-label">Tag</label>
                  <input type="text" placeholder="Optional" value={newAddonForm.tag} onChange={e => setNewAddonForm({...newAddonForm, tag: e.target.value})} className="mn-input" />
                </div>
              </div>

              <label className="mn-label">Group *</label>
              <select value={newAddonForm.group} onChange={e => setNewAddonForm({...newAddonForm, group: e.target.value})} className="mn-input">
                {addonGroups.map(ag => <option key={ag.name} value={ag.name}>{ag.name}</option>)}
              </select>

              <label className="mn-label">Description</label>
              <input type="text" placeholder="Optional" value={newAddonForm.description} onChange={e => setNewAddonForm({...newAddonForm, description: e.target.value})} className="mn-input" />

              <div className="mn-avail-row">
                <input type="checkbox" checked={newAddonForm.available} onChange={e => setNewAddonForm({...newAddonForm, available: e.target.checked})} className="mn-checkbox" />
                <label className="mn-avail-label">Available</label>
              </div>

              <div className="mn-btn-row mn-mt">
                <button type="submit" className="mn-save-btn">Save</button>
                <button type="button" onClick={() => setShowAddAddonModal(false)} className="mn-cancel-btn">Cancel</button>
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
    <div className="mn">
      <style>{css}</style>

      <div className="mn-header">
        <div>
          <h2 className="mn-title mn-title-lg">Menus</h2>
          <p className="mn-subtitle">Create menus, activate them per channel, and manage items.</p>
        </div>

        <div className="mn-header-actions">
          <button 
            onClick={() => setShowPausedModal(true)}
            onMouseEnter={() => setHoveredBtn('paused')}
            onMouseLeave={() => setHoveredBtn(null)}
            className={`mn-paused-btn ${totalPaused > 0 ? 'has-paused' : ''}`}
          >
            🔴 Manage Paused Items <span className="mn-paused-pill">{totalPaused}</span>
          </button>

          <button 
            onClick={() => setShowNewMenuModal(true)}
            onMouseEnter={() => setHoveredBtn('newMenu')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="mn-primary-btn"
          >
            + Add Menu
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mn-alert ${message.type === 'error' ? 'is-error' : 'is-success'}`}>
          {message.text}
        </div>
      )}

      {/* Menu Catalog Cards (Reactive Hover Effects) */}
      <div className="mn-catalogs">
        {menus.map(menu => {
          return (
            <div 
              key={menu.id}
              onClick={() => setActiveMenu(menu)}
              onMouseEnter={() => setHoveredCard(menu.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`mn-catalog ${menu.channel === 'Online' ? 'is-online' : 'is-inhouse'}`}
            >
              <div className="mn-catalog-top">
                <span className={menu.channel === 'Online' ? 'mn-badge-online' : 'mn-badge-inhouse'}>
                  {menu.channel === 'Online' ? '🟢 ONLINE CHANNEL' : '🍴 IN-HOUSE MENU'}
                </span>
                <span className="mn-manage-link">Click to Manage →</span>
              </div>
              <h3 className="mn-catalog-name">
                <span className="mn-catalog-icon">{menu.icon}</span> {menu.name}
              </h3>
              <p className="mn-catalog-desc">{menu.description}</p>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Menu */}
      {showNewMenuModal && (
        <div className="mn-overlay" onClick={() => setShowNewMenuModal(false)}>
          <form onSubmit={handleCreateMenu} className="mn-modal" onClick={e => e.stopPropagation()}>
            <div className="mn-modal-head">
              <div>
                <h3 className="mn-modal-title">New Menu</h3>
                <p className="mn-modal-sub">Give the menu a name, an icon, and choose which channel it primarily serves.</p>
              </div>
              <button type="button" onClick={() => setShowNewMenuModal(false)} className="mn-close-x">✕</button>
            </div>

            <label className="mn-label">Menu name *</label>
            <input 
              type="text" 
              placeholder="e.g. Lunch Special, Bar Menu" 
              value={newMenuForm.name} 
              onChange={e => setNewMenuForm({...newMenuForm, name: e.target.value})} 
              className="mn-input" 
              required 
              autoFocus 
            />

            <label className="mn-label">Description (optional)</label>
            <textarea 
              placeholder="Short note shown to captains and staff" 
              value={newMenuForm.description} 
              onChange={e => setNewMenuForm({...newMenuForm, description: e.target.value})} 
              className="mn-input mn-textarea" 
            />

            <label className="mn-label">Icon</label>
            <div className="mn-icon-grid">
              {AVAILABLE_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setNewMenuForm({...newMenuForm, icon: ic})}
                  className={`mn-icon-btn ${newMenuForm.icon === ic ? 'is-selected' : ''}`}
                >
                  {ic}
                </button>
              ))}
            </div>

            <label className="mn-label">Primary channel</label>
            <select 
              value={newMenuForm.channel} 
              onChange={e => setNewMenuForm({...newMenuForm, channel: e.target.value})} 
              className="mn-input"
            >
              <option value="In-house">In-house</option>
              <option value="Online">Online</option>
            </select>
            <div className="mn-hint mn-hint-lg">
              Classification only. You can still activate this menu on either channel.
            </div>

            <div className="mn-btn-row mn-end">
              <button type="button" onClick={() => setShowNewMenuModal(false)} className="mn-cancel-btn">Cancel</button>
              <button type="submit" className="mn-red-btn">Create menu</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Manage Paused Items */}
      {showPausedModal && (
        <div className="mn-overlay" onClick={() => setShowPausedModal(false)}>
          <div className="mn-modal" onClick={e => e.stopPropagation()}>
            <div className="mn-modal-head">
              <h3 className="mn-modal-title">🔴 Manage Paused Items ({allPausedItems.length})</h3>
              <button onClick={() => setShowPausedModal(false)} className="mn-close-x">✕</button>
            </div>

            {allPausedItems.length === 0 ? (
              <div className="mn-paused-empty">No paused items across your restaurant menus! All dishes are LIVE.</div>
            ) : (
              <div className="mn-paused-list">
                {allPausedItems.map(item => (
                  <div key={item.id} className="mn-paused-row">
                    <div>
                      <div className="mn-paused-name">{item.itemName}</div>
                      <div className="mn-paused-meta">{item.category} · {item.catalogName || 'Default In-House Menu'}</div>
                    </div>
                    <button onClick={() => handleToggleStatus(item.id, 'PAUSED')} className="mn-make-live">
                      Make Live 🟢
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowPausedModal(false)} className="mn-save-btn">Close Modal</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Styles (frontend only) ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

.mn {
  --ink: #0f172a;
  --ink-soft: #334155;
  --ink-faint: #64748b;
  --line: #e2e8f0;
  --surface: #ffffff;
  --canvas: #f3f5f9;
  --green: #059669;
  --green-dark: #047857;
  --red: #ef4444;
  --red-dark: #dc2626;

  padding: clamp(16px, 3vw, 36px);
  padding-bottom: 90px;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  text-align: left;
  font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  color: var(--ink);
  background:
    radial-gradient(900px 420px at 100% -10%, rgba(5, 150, 105, 0.09), transparent 60%),
    radial-gradient(700px 380px at -10% 0%, rgba(239, 68, 68, 0.06), transparent 60%),
    var(--canvas);
}
.mn *, .mn *::before, .mn *::after { box-sizing: border-box; }
.mn-red { color: var(--red-dark); }
.mn-green { color: var(--green); }
.mn-strong { color: var(--ink); }
.mn-mb { margin-bottom: 18px !important; }
.mn-mt { margin-top: 18px; }

/* ---------- Header ---------- */
.mn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
  animation: mn-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.mn-header-left { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.mn-header-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.mn-title { margin: 0; font-size: clamp(22px, 2.8vw, 28px); font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.mn-title-lg { font-size: clamp(28px, 3.6vw, 36px); letter-spacing: -0.03em; }
.mn-subtitle { margin: 6px 0 0 0; font-size: 15px; color: var(--ink-faint); font-weight: 600; }

/* ---------- Buttons ---------- */
.mn-primary-btn {
  position: relative;
  overflow: hidden;
  font-family: inherit;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.mn-primary-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -80%;
  width: 50%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
}
.mn-primary-btn:hover { transform: translateY(-3px); filter: brightness(1.05); box-shadow: 0 14px 28px rgba(5, 150, 105, 0.4); }
.mn-primary-btn:hover::after { left: 130%; }
.mn-primary-btn:active { transform: translateY(0) scale(0.97); }

.mn-back-btn {
  font-family: inherit;
  background: #fff;
  border: 2px solid #d5dde8;
  padding: 11px 18px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  color: var(--ink-soft);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.mn-back-btn:hover { transform: translateX(-4px); border-color: var(--green); background: #f0fdf9; box-shadow: 0 8px 18px rgba(5, 150, 105, 0.14); }
.mn-back-btn:active { transform: translateX(-2px) scale(0.97); }

.mn-paused-btn {
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 2px solid #d5dde8;
  color: var(--ink-soft);
  padding: 13px 20px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.mn-paused-btn.has-paused { border-color: var(--red-dark); color: var(--red-dark); }
.mn-paused-btn:hover { background: #fef2f2; transform: translateY(-3px); box-shadow: 0 12px 24px rgba(239, 68, 68, 0.2); }
.mn-paused-btn:active { transform: translateY(0) scale(0.97); }
.mn-paused-pill { background: var(--red-dark); color: #fff; padding: 2px 9px; border-radius: 999px; font-size: 13px; font-weight: 800; }
.mn-paused-btn.has-paused .mn-paused-pill { animation: mn-pulse 2s infinite; }

.mn-save-btn {
  width: 100%;
  font-family: inherit;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  padding: 15px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(5, 150, 105, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.mn-save-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 14px 26px rgba(5, 150, 105, 0.38); }
.mn-save-btn:active { transform: translateY(0) scale(0.97); }

.mn-red-btn {
  font-family: inherit;
  background: linear-gradient(135deg, #f87171, #dc2626);
  color: #fff;
  border: none;
  padding: 14px 26px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(239, 68, 68, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.mn-red-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 14px 26px rgba(239, 68, 68, 0.4); }
.mn-red-btn:active { transform: translateY(0) scale(0.97); }

.mn-cancel-btn {
  flex: 1;
  font-family: inherit;
  background: #f1f5f9;
  color: var(--ink-soft);
  border: 2px solid #cbd5e1;
  padding: 14px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.mn-cancel-btn:hover { background: #e2e8f0; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1); }
.mn-cancel-btn:active { transform: translateY(0) scale(0.97); }

/* ---------- Alerts ---------- */
.mn-alert {
  padding: 14px 18px;
  border-radius: 14px;
  margin-bottom: 22px;
  font-size: 15px;
  font-weight: 800;
  border: 2px solid;
  animation: mn-slide 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.mn-alert.is-success { background: #f0fdf4; color: #166534; border-color: #4ade80; }
.mn-alert.is-error { background: #fef2f2; color: #991b1b; border-color: #f87171; }

/* ---------- Catalog cards ---------- */
.mn-catalogs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 24px;
  margin-bottom: 24px;
}
.mn-catalog {
  --accent: var(--green);
  position: relative;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: 26px 26px 24px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 28px -14px rgba(15, 23, 42, 0.16);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
  animation: mn-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.mn-catalog:nth-child(2) { animation-delay: 0.08s; }
.mn-catalog:nth-child(3) { animation-delay: 0.16s; }
.mn-catalog:nth-child(n+4) { animation-delay: 0.24s; }
.mn-catalog.is-inhouse { --accent: #3b82f6; }
.mn-catalog::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  background: var(--accent);
  transition: height 0.28s ease;
}
.mn-catalog::after {
  content: '';
  position: absolute;
  right: -40px;
  bottom: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.07;
  transition: transform 0.4s ease, opacity 0.3s ease;
}
.mn-catalog:hover {
  transform: translateY(-7px);
  border-color: var(--accent);
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05), 0 26px 46px -16px rgba(15, 23, 42, 0.28);
}
.mn-catalog:hover::before { height: 9px; }
.mn-catalog:hover::after { transform: scale(2.4); opacity: 0.1; }

.mn-catalog-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.mn-badge-online,
.mn-badge-inhouse { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; }
.mn-badge-online { background: #ecfdf5; color: var(--green-dark); border: 1.5px solid #6ee7b7; }
.mn-badge-inhouse { background: #eff6ff; color: #1d4ed8; border: 1.5px solid #93c5fd; }
.mn-manage-link { font-size: 13px; color: var(--accent); font-weight: 800; transition: transform 0.25s ease; display: inline-block; }
.mn-catalog:hover .mn-manage-link { transform: translateX(6px); }

.mn-catalog-name { position: relative; z-index: 1; margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.mn-catalog-icon { display: inline-block; transition: transform 0.3s ease; }
.mn-catalog:hover .mn-catalog-icon { transform: scale(1.25) rotate(-8deg); }
.mn-catalog-desc { position: relative; z-index: 1; margin: 0; font-size: 15px; color: var(--ink-faint); font-weight: 600; line-height: 1.5; }

/* ---------- Tabs ---------- */
.mn-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid var(--line);
  padding-bottom: 14px;
  margin-bottom: 24px;
  overflow-x: auto;
  animation: mn-rise 0.5s 0.06s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.mn-tab {
  font-family: inherit;
  background: none;
  border: none;
  padding: 11px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  color: var(--ink-faint);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.mn-tab:hover { background: #e8edf3; color: var(--ink); transform: translateY(-2px); }
.mn-tab.is-active { background: var(--ink); color: #fff; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.28); }
.mn-tab.is-active:hover { background: #1e293b; }

.mn-panel { animation: mn-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* ---------- Items tab ---------- */
.mn-summary {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px 22px;
  font-size: 15px;
  font-weight: 800;
  color: var(--ink-soft);
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 22px -14px rgba(15, 23, 42, 0.12);
}

.mn-cat-block { margin-bottom: 26px; }
.mn-cat-header {
  font-size: 13px;
  font-weight: 800;
  color: var(--green-dark);
  background: #ecfdf5;
  padding: 8px 16px;
  border-radius: 10px;
  display: inline-block;
  border: 1.5px solid #10b981;
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.mn-cat-card {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--line);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 26px -14px rgba(15, 23, 42, 0.12);
}

.mn-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px 24px;
  background: var(--surface);
  border-bottom: 1px solid #eef2f7;
  transition: background 0.2s ease, padding-left 0.2s ease, box-shadow 0.2s ease;
  animation: mn-fade 0.4s ease both;
}
.mn-item-row:last-child { border-bottom: none; }
.mn-item-row:nth-child(2) { animation-delay: 0.04s; }
.mn-item-row:nth-child(3) { animation-delay: 0.08s; }
.mn-item-row:nth-child(4) { animation-delay: 0.12s; }
.mn-item-row:nth-child(n+5) { animation-delay: 0.16s; }
.mn-item-row:hover { background: #f0fdf9; padding-left: 30px; box-shadow: inset 5px 0 0 var(--green); }

.mn-item-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.mn-item-right { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.mn-item-name { font-size: 17px; font-weight: 800; color: var(--ink); }
.mn-item-desc { font-size: 13px; color: var(--ink-faint); font-weight: 600; margin-top: 3px; }
.mn-price { font-size: 18px; font-weight: 800; color: var(--ink); }
.mn-tax-chip { font-size: 13px; font-weight: 800; color: var(--green); background: #ecfdf5; padding: 5px 11px; border-radius: 8px; }

.mn-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.mn-dot.is-live { background: #10b981; animation: mn-dot-pulse 2s infinite; }
.mn-dot.is-paused { background: #ef4444; }

.mn-toggle {
  font-family: inherit;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.mn-toggle.is-live { background: #ecfdf5; color: var(--green-dark); border: 2px solid #10b981; }
.mn-toggle.is-paused { background: #fef2f2; color: var(--red-dark); border: 2px solid #fca5a5; }
.mn-toggle.is-live:hover { background: #10b981; color: #fff; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(16, 185, 129, 0.32); }
.mn-toggle.is-paused:hover { background: #ef4444; color: #fff; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(239, 68, 68, 0.32); }
.mn-toggle:active { transform: translateY(0) scale(0.95); }

.mn-delete-btn {
  font-family: inherit;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  transition: background 0.2s ease, transform 0.2s ease;
}
.mn-delete-btn:hover { background: #fee2e2; transform: scale(1.15) rotate(-8deg); }
.mn-delete-btn:active { transform: scale(0.92); }

/* ---------- Other tabs ---------- */
.mn-card-box {
  background: var(--surface);
  border-radius: 22px;
  border: 1px solid var(--line);
  padding: clamp(18px, 2.4vw, 30px);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 30px -16px rgba(15, 23, 42, 0.14);
}
.mn-box-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 22px; }
.mn-box-title { margin: 0; font-size: 22px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.mn-box-desc { margin: 5px 0 0 0; font-size: 14px; color: var(--ink-faint); font-weight: 600; }

.mn-simple-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 16px; }
.mn-simple-col { display: flex; flex-direction: column; gap: 12px; }
.mn-simple-card,
.mn-simple-row {
  background: #f8fafc;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
  animation: mn-fade 0.4s ease both;
}
.mn-simple-card { padding: 20px; }
.mn-simple-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 18px 22px; }
.mn-simple-card:hover { border-color: var(--green); background: #f0fdf4; transform: translateY(-4px); box-shadow: 0 14px 28px rgba(5, 150, 105, 0.14); }
.mn-simple-row:hover { border-color: var(--green); background: #f0fdf4; transform: translateX(5px); box-shadow: 0 10px 22px rgba(5, 150, 105, 0.12); }
.mn-simple-name { font-weight: 800; color: var(--ink); font-size: 17px; }
.mn-simple-sub { font-size: 14px; color: var(--ink-faint); font-weight: 600; margin-top: 4px; }
.mn-active-chip { font-size: 13px; color: var(--green-dark); font-weight: 800; background: #d1fae5; padding: 6px 14px; border-radius: 999px; }
.mn-count-chip { font-size: 14px; font-weight: 800; color: var(--green); }

/* Table */
.mn-table-wrap { width: 100%; overflow-x: auto; border: 1px solid var(--line); border-radius: 16px; background: #fff; }
.mn-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 15px; min-width: 480px; }
.mn-table thead tr { background: #f1f5f9; }
.mn-table th { padding: 16px 20px; font-weight: 800; color: #475569; font-size: 14px; border-bottom: 2px solid var(--line); }
.mn-table td { padding: 17px 20px; font-weight: 700; color: var(--ink-soft); border-bottom: 1px solid #eef2f7; }
.mn-table tbody tr { transition: background 0.18s ease, box-shadow 0.18s ease; animation: mn-fade 0.4s ease both; }
.mn-table tbody tr:hover { background: #f0fdf9; box-shadow: inset 4px 0 0 var(--green); }
.mn-table tbody tr:last-child td { border-bottom: none; }

/* Loading / empty */
.mn-center { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; padding: 56px 20px; color: var(--ink-faint); font-weight: 700; }
.mn-spinner { width: 30px; height: 30px; border-radius: 50%; border: 3px solid var(--line); border-top-color: var(--green); animation: mn-spin 0.8s linear infinite; }
.mn-empty {
  text-align: center;
  padding: 60px 24px;
  background: #fff;
  border-radius: 20px;
  border: 2px dashed #cbd5e1;
  color: var(--ink-faint);
  font-weight: 700;
  font-size: 16px;
}

/* ---------- Modals ---------- */
.mn-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 2000;
  animation: mn-fade 0.25s ease both;
}
.mn-modal {
  width: min(520px, 100%);
  background: #fff;
  padding: clamp(20px, 3vw, 32px);
  border-radius: 26px;
  text-align: left;
  box-shadow: 0 30px 64px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--line);
  max-height: 92vh;
  overflow-y: auto;
  animation: mn-pop 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.mn-modal-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 22px; }
.mn-modal-title { margin: 0 0 4px 0; color: var(--ink); font-weight: 800; font-size: 22px; letter-spacing: -0.02em; }
.mn-modal-sub { margin: 0; font-size: 14px; color: var(--ink-faint); font-weight: 600; line-height: 1.45; }

.mn-close-x {
  font-family: inherit;
  background: #f1f5f9;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 17px;
  font-weight: 800;
  color: var(--ink-faint);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease;
}
.mn-close-x:hover { background: #fee2e2; color: var(--red-dark); transform: rotate(90deg); }

.mn-label { font-size: 13px; font-weight: 800; display: block; margin-bottom: 7px; color: var(--ink-soft); }
.mn-input {
  width: 100%;
  font-family: inherit;
  padding: 13px 16px;
  border-radius: 12px;
  border: 2px solid #d5dde8;
  font-size: 15px;
  margin-bottom: 16px;
  background: #f8fafc;
  outline: none;
  font-weight: 700;
  color: var(--ink);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.mn-input::placeholder { color: #94a3b8; font-weight: 600; }
.mn-input:hover { border-color: #b6c3d4; }
.mn-input:focus { border-color: var(--green); background: #fff; box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.18); }
.mn-textarea { height: 84px; resize: none; line-height: 1.45; }

.mn-two-col { display: flex; gap: 14px; }
.mn-col { flex: 1; min-width: 0; }
.mn-hint { font-size: 13px; color: var(--ink-faint); font-weight: 700; margin-top: -6px; margin-bottom: 18px; }
.mn-hint-lg { margin-bottom: 20px; }
.mn-btn-row { display: flex; gap: 12px; }
.mn-btn-row .mn-save-btn { flex: 1; width: auto; }
.mn-end { justify-content: flex-end; }

.mn-avail-row { display: flex; align-items: center; gap: 12px; margin: 10px 0; }
.mn-avail-label { font-size: 15px; font-weight: 800; color: var(--ink); cursor: pointer; }
.mn-checkbox { width: 20px; height: 20px; accent-color: var(--green); cursor: pointer; }

/* Icon picker */
.mn-icon-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px; margin-bottom: 18px; }
.mn-icon-btn {
  font-family: inherit;
  padding: 10px 0;
  font-size: 21px;
  border: 2px solid #d5dde8;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}
.mn-icon-btn:hover { transform: translateY(-3px) scale(1.1); border-color: #94a3b8; box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12); }
.mn-icon-btn.is-selected { border-color: var(--red); background: #fef2f2; box-shadow: 0 6px 14px rgba(239, 68, 68, 0.25); transform: scale(1.08); }

/* Paused modal */
.mn-paused-empty { text-align: center; padding: 36px 20px; color: var(--ink-faint); font-size: 15px; font-weight: 700; background: #f8fafc; border-radius: 16px; border: 2px dashed #cbd5e1; margin-bottom: 18px; line-height: 1.5; }
.mn-paused-list { max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; padding-right: 4px; }
.mn-paused-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.mn-paused-row:hover { border-color: #fca5a5; background: #fff7f7; transform: translateX(4px); box-shadow: 0 8px 18px rgba(239, 68, 68, 0.1); }
.mn-paused-name { font-size: 16px; font-weight: 800; color: var(--ink); }
.mn-paused-meta { font-size: 13px; color: var(--ink-faint); font-weight: 600; margin-top: 3px; }
.mn-make-live {
  font-family: inherit;
  background: #ecfdf5;
  color: var(--green-dark);
  border: 2px solid #10b981;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.mn-make-live:hover { background: #10b981; color: #fff; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3); }

/* ---------- Animations ---------- */
@keyframes mn-rise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes mn-slide {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes mn-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mn-pop {
  from { opacity: 0; transform: translateY(18px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes mn-spin { to { transform: rotate(360deg); } }
@keyframes mn-dot-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70%  { box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
@keyframes mn-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
  70%  { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
}

/* ---------- Keyboard focus ---------- */
.mn button:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.5);
  outline-offset: 2px;
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .mn-header-actions { width: 100%; }
  .mn-header-actions .mn-primary-btn,
  .mn-header-actions .mn-paused-btn { flex: 1; justify-content: center; }
  .mn-item-row { padding: 16px; }
  .mn-item-row:hover { padding-left: 20px; }
  .mn-item-right { width: 100%; justify-content: space-between; }
  .mn-icon-grid { grid-template-columns: repeat(4, 1fr); }
  .mn-two-col { flex-direction: column; gap: 0; }
  .mn-btn-row { flex-direction: column-reverse; }
  .mn-end { justify-content: stretch; }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .mn *, .mn *::before, .mn *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;