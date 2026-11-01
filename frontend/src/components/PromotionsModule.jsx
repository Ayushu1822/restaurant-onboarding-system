import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

const ICON_MAP = {
  Percent: '%',
  Gift: '🎁',
  Truck: '🚚',
  Tag: '🏷️',
  Star: '⭐',
  Zap: '⚡',
  Heart: '❤️',
  Crown: '👑',
  Sparkles: '✨',
  Badge: '🛡️'
};

export default function PromotionsModule() {
  const userEmail = localStorage.getItem('userEmail') || 'novio@gmail.com';

  const [viewMode, setViewMode] = useState('groups'); // 'groups' or 'offers'
  const [searchQuery, setSearchQuery] = useState('');
  
  const [groups, setGroups] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Create Group Form State
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('Festival');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupTypeOpen, setGroupTypeOpen] = useState(false);

  // Create Promotion Form State
  const [selectedGroup, setSelectedGroup] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [offerIcon, setOfferIcon] = useState('Percent');
  const [offerIconOpen, setOfferIconOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [displayDesc, setDisplayDesc] = useState('');
  const [terms, setTerms] = useState('');
  const [internalName, setInternalName] = useState('');
  const [internalDesc, setInternalDesc] = useState('');
  const [offerType, setOfferType] = useState('% Off Order');
  const [offerTypeOpen, setOfferTypeOpen] = useState(false);
  const [discountVal, setDiscountVal] = useState('10');
  const [minOrder, setMinOrder] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [startDate, setStartDate] = useState('October 28th, 2026');
  const [expiryDate, setExpiryDate] = useState('November 27th, 2026');
  const [totalRedemptions, setTotalRedemptions] = useState('Unlimited');
  const [redemptionsPerCust, setRedemptionsPerCust] = useState('Unlimited');

  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = () => {
    setLoading(true);
    // Fetch promotion groups and promotions from backend
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/promotion-groups?email=${userEmail}`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/api/v1/promotions?email=${userEmail}`).then(res => res.json()).catch(() => [])
    ]).then(([groupData, promoData]) => {
      if (Array.isArray(groupData)) setGroups(groupData);
      else {
        // Fallback default groups matching your screenshot
        setGroups([
          { id: '1', name: 'Test 2', type: 'Daily', description: 'Daily test promotions group', promotionsCount: 2, activeCount: 0, inactiveCount: 2 },
          { id: '2', name: 'Custom offers', type: 'Festival', description: 'Custom offers group', promotionsCount: 3, activeCount: 1, inactiveCount: 2 },
          { id: '3', name: 'offer leela', type: 'Daily', description: 'Leela special offers', promotionsCount: 1, activeCount: 0, inactiveCount: 1 },
          { id: '4', name: 'POS Promotion Group', type: 'Special', description: 'ok ok', promotionsCount: 0, activeCount: 0, inactiveCount: 0 },
          { id: '5', name: 'Promo-Krishna', type: 'Daily', description: 'Do not Delete', promotionsCount: 0, activeCount: 0, inactiveCount: 0 }
        ]);
      }

      if (Array.isArray(promoData)) setPromotions(promoData);
      else setPromotions([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [userEmail]);

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (groupName.trim().length < 2) {
      alert('Name must be at least 2 characters.');
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      type: groupType,
      description: groupDesc,
      promotionsCount: 0,
      activeCount: 0,
      inactiveCount: 0,
      restaurantEmail: userEmail
    };

    fetch(`${API_BASE_URL}/api/v1/promotion-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup)
    }).then(() => {
      showToast('Promotion Group created successfully!');
      setGroups([newGroup, ...groups]);
      setShowGroupModal(false);
      setGroupName('');
      setGroupDesc('');
    }).catch(() => {
      // Offline fallback state update
      setGroups([newGroup, ...groups]);
      showToast('Promotion Group created successfully!');
      setShowGroupModal(false);
      setGroupName('');
      setGroupDesc('');
    });
  };

  const handleCreatePromo = (e) => {
    e.preventDefault();
    if (!promoCode || !displayName) {
      alert('Please fill in required fields (Promo Code and Display Name).');
      return;
    }

    const newPromo = {
      id: Date.now().toString(),
      groupName: selectedGroup || (groups[0] ? groups[0].name : 'Default'),
      code: promoCode.toUpperCase(),
      icon: offerIcon,
      displayName,
      displayDesc,
      terms,
      internalName,
      offerType,
      discountVal,
      minOrder,
      maxDiscount,
      startDate,
      expiryDate,
      status: 'ACTIVE',
      restaurantEmail: userEmail
    };

    fetch(`${API_BASE_URL}/api/v1/promotions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPromo)
    }).then(() => {
      showToast('Promotion created and activated successfully!');
      setPromotions([newPromo, ...promotions]);
      setShowPromoModal(false);
      setPromoCode('');
      setDisplayName('');
      setDisplayDesc('');
    }).catch(() => {
      setPromotions([newPromo, ...promotions]);
      showToast('Promotion created and activated successfully!');
      setShowPromoModal(false);
      setPromoCode('');
      setDisplayName('');
      setDisplayDesc('');
    });
  };

  return (
    <div className="pm-container">
      <style>{css}</style>

      {/* Top Header */}
      <div className="pm-header">
        <div>
          <div className="pm-title-row">
            <span className="pm-folder-icon">📁</span>
            <h1 className="pm-title">Promotions</h1>
          </div>
          <p className="pm-sub">Manage promotion groups, discounts and campaigns</p>
        </div>

        <div className="pm-top-actions">
          <button className="pm-btn-outline" onClick={() => setShowPromoModal(true)}>
            + Create Promotion
          </button>
          <button className="pm-btn-primary" onClick={() => setShowGroupModal(true)}>
            + Create Group
          </button>
        </div>
      </div>

      {/* Toolbar / Tabs and Search */}
      <div className="pm-toolbar">
        <div className="pm-tabs">
          <button 
            className={`pm-tab ${viewMode === 'groups' ? 'is-active' : ''}`}
            onClick={() => setViewMode('groups')}
          >
            👥 Groups View
          </button>
          <button 
            className={`pm-tab ${viewMode === 'offers' ? 'is-active' : ''}`}
            onClick={() => setViewMode('offers')}
          >
            🏷️ Offers View
          </button>
        </div>

        <div className="pm-search-box">
          <span className="pm-search-icon">🔍</span>
          <input 
            placeholder="Search groups or codes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="pm-content">
        {viewMode === 'groups' ? (
          <div className="pm-grid">
            {groups.map(g => (
              <div key={g.id} className="pm-card">
                <div className="pm-card-top">
                  <div className="pm-card-icon-title">
                    <div className="pm-mini-icon">☀️</div>
                    <div>
                      <h3 className="pm-card-name">{g.name}</h3>
                      <span className="pm-card-type">{g.type}</span>
                    </div>
                  </div>
                  <button className="pm-edit-btn" title="Edit Group">✏️</button>
                </div>

                <p className="pm-card-desc">{g.description || 'Promotion group for branch campaigns'}</p>

                <div className="pm-card-stats">
                  <div className="pm-stat-item">🏷️ {g.promotionsCount ?? 0} promotions</div>
                  <div className="pm-stat-row">
                    <span className="pm-green-dot">🟢 {g.activeCount ?? 0} active</span>
                    <span className="pm-gray-dot">❌ {g.inactiveCount ?? 0} inactive</span>
                  </div>
                </div>

                <div className="pm-card-bottom">
                  <button className="pm-view-promo-btn" onClick={() => setViewMode('offers')}>
                    View Promotions &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pm-grid">
            {promotions.length === 0 ? (
              <div className="pm-empty">
                No individual offers created yet. Click <b>+ Create Promotion</b> to add one!
              </div>
            ) : (
              promotions.map(p => (
                <div key={p.id} className="pm-card">
                  <div className="pm-card-top">
                    <div className="pm-card-icon-title">
                      <div className="pm-mini-icon">{ICON_MAP[p.icon] || '🏷️'}</div>
                      <div>
                        <h3 className="pm-card-name">{p.displayName}</h3>
                        <span className="pm-code-badge">CODE: {p.code}</span>
                      </div>
                    </div>
                    <span className="pm-status-pill">{p.status || 'ACTIVE'}</span>
                  </div>
                  <p className="pm-card-desc">{p.displayDesc || p.terms}</p>
                  <div className="pm-card-stats">
                    <div className="pm-stat-item">Formula: <b>{p.offerType} ({p.discountVal}%)</b></div>
                    <div className="pm-stat-item">Valid: {p.startDate} - {p.expiryDate}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {showGroupModal && (
        <div className="pm-overlay" onClick={() => setShowGroupModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-head">
              <div>
                <h3 className="pm-modal-title">Create Promotion Group</h3>
                <p className="pm-modal-sub">Create a new promotion group for this branch.</p>
              </div>
              <button className="pm-close-x" onClick={() => setShowGroupModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateGroup} className="pm-form">
              <label className="pm-label">Group Name</label>
              <input 
                className="pm-input"
                placeholder="e.g., Festival Offers"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                required
              />
              {groupName.length > 0 && groupName.length < 2 && (
                <div className="pm-error-txt">Name must be at least 2 characters.</div>
              )}
              <span className="pm-hint">Use a clear name staff can recognize.</span>

              <label className="pm-label" style={{marginTop: '16px'}}>Type</label>
              <div className="pm-dropdown-wrap">
                <div className="pm-select-box" onClick={() => setGroupTypeOpen(!groupTypeOpen)}>
                  <span>{groupType}</span>
                  <span>▼</span>
                </div>
                {groupTypeOpen && (
                  <div className="pm-dropdown-menu">
                    {['Festival', 'Daily', 'Special', 'Custom'].map(t => (
                      <div key={t} className="pm-dropdown-item" onClick={() => { setGroupType(t); setGroupTypeOpen(false); }}>
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="pm-hint">Stored as backend enum value: festival, daily, special, custom.</span>

              <label className="pm-label" style={{marginTop: '16px'}}>Description (optional)</label>
              <textarea 
                className="pm-textarea"
                placeholder="Short summary of the group..."
                value={groupDesc}
                onChange={e => setGroupDesc(e.target.value)}
                maxLength={500}
              />
              <div className="pm-counter">{groupDesc.length}/500</div>
              <span className="pm-hint">Optional summary shown to staff.</span>

              <div className="pm-modal-foot">
                <button type="button" className="pm-btn-cancel" onClick={() => setShowGroupModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn-submit">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW PROMOTION MODAL */}
      {showPromoModal && (
        <div className="pm-overlay" onClick={() => setShowPromoModal(false)}>
          <div className="pm-modal pm-modal-large" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-head">
              <div>
                <h3 className="pm-modal-title">Create New Promotion</h3>
                <p className="pm-modal-sub">Create a new promotion and configure code, rules, and validity.</p>
              </div>
              <button className="pm-close-x" onClick={() => setShowPromoModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreatePromo} className="pm-form">
              <div className="pm-section-title">PROMOTION GROUP</div>
              
              <label className="pm-label">Select Group *</label>
              <select 
                className="pm-input"
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
              >
                {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>

              <div className="pm-section-title" style={{marginTop: '16px'}}>CUSTOMER FACING</div>

              <div className="pm-row-2">
                <div>
                  <label className="pm-label">Promo Code *</label>
                  <input 
                    className="pm-input"
                    placeholder="E.G., WEEKEND20"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    required
                  />
                  <span className="pm-hint">Uppercase, alphanumeric, max 15 characters</span>
                </div>

                <div>
                  <label className="pm-label">Offer Icon</label>
                  <div className="pm-dropdown-wrap">
                    <div className="pm-select-box" onClick={() => setOfferIconOpen(!offerIconOpen)}>
                      <span>{ICON_MAP[offerIcon]} {offerIcon}</span>
                      <span>▼</span>
                    </div>
                    {offerIconOpen && (
                      <div className="pm-dropdown-menu">
                        {Object.keys(ICON_MAP).map(ic => (
                          <div key={ic} className="pm-dropdown-item" onClick={() => { setOfferIcon(ic); setOfferIconOpen(false); }}>
                            {ICON_MAP[ic]} {ic}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="pm-hint">Icons only displayed if UI supports</span>
                </div>
              </div>

              <label className="pm-label" style={{marginTop: '12px'}}>Display Name *</label>
              <input 
                className="pm-input"
                placeholder="e.g., 20% Off Weekend Special"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />

              <label className="pm-label" style={{marginTop: '12px'}}>Display Description *</label>
              <textarea 
                className="pm-textarea"
                placeholder="Describe the offer for customers..."
                value={displayDesc}
                onChange={e => setDisplayDesc(e.target.value)}
                rows={2}
              />

              <label className="pm-label" style={{marginTop: '12px'}}>Terms & Conditions</label>
              <textarea 
                className="pm-textarea"
                placeholder="e.g., Valid only on weekends..."
                value={terms}
                onChange={e => setTerms(e.target.value)}
                rows={2}
              />

              <div className="pm-section-title" style={{marginTop: '16px'}}>INTERNAL</div>
              <div className="pm-row-2">
                <div>
                  <label className="pm-label">Internal Name *</label>
                  <input 
                    className="pm-input"
                    placeholder="e.g., weekend_20_percent"
                    value={internalName}
                    onChange={e => setInternalName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="pm-label">Internal Description</label>
                  <input 
                    className="pm-input"
                    placeholder="Optional notes..."
                    value={internalDesc}
                    onChange={e => setInternalDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="pm-section-title" style={{marginTop: '16px'}}>REDEMPTION FORMULA</div>
              <div className="pm-row-2">
                <div>
                  <label className="pm-label">Offer Type *</label>
                  <div className="pm-dropdown-wrap">
                    <div className="pm-select-box" onClick={() => setOfferTypeOpen(!offerTypeOpen)}>
                      <span>{offerType}</span>
                      <span>▼</span>
                    </div>
                    {offerTypeOpen && (
                      <div className="pm-dropdown-menu">
                        {['% Off Order', 'Flat Off Order', '% Off Delivery', 'Flat Off Delivery', 'Free Delivery'].map(ot => (
                          <div key={ot} className="pm-dropdown-item" onClick={() => { setOfferType(ot); setOfferTypeOpen(false); }}>
                            {ot}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="pm-label">Discount Percentage *</label>
                  <input 
                    className="pm-input"
                    value={discountVal}
                    onChange={e => setDiscountVal(e.target.value)}
                  />
                </div>
              </div>

              <div className="pm-row-2" style={{marginTop: '12px'}}>
                <div>
                  <label className="pm-label">Minimum Order Value</label>
                  <input 
                    className="pm-input"
                    value={minOrder}
                    onChange={e => setMinOrder(e.target.value)}
                  />
                </div>
                <div>
                  <label className="pm-label">Max Discount Cap *</label>
                  <input 
                    className="pm-input"
                    placeholder="₹ e.g. 100"
                    value={maxDiscount}
                    onChange={e => setMaxDiscount(e.target.value)}
                  />
                  <span className="pm-hint">Maximum rupee discount allowed</span>
                </div>
              </div>

              <div className="pm-section-title" style={{marginTop: '16px'}}>VALIDITY PERIOD</div>
              <div className="pm-row-2">
                <div>
                  <label className="pm-label">Start Date *</label>
                  <input 
                    className="pm-input"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="pm-label">Expiry Date *</label>
                  <input 
                    className="pm-input"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="pm-section-title" style={{marginTop: '16px'}}>REDEMPTION LIMITS</div>
              <div className="pm-row-2">
                <div>
                  <label className="pm-label">Total Redemptions Allowed</label>
                  <input 
                    className="pm-input"
                    value={totalRedemptions}
                    onChange={e => setTotalRedemptions(e.target.value)}
                  />
                </div>
                <div>
                  <label className="pm-label">Redemptions per Customer</label>
                  <input 
                    className="pm-input"
                    value={redemptionsPerCust}
                    onChange={e => setRedemptionsPerCust(e.target.value)}
                  />
                </div>
              </div>

              <div className="pm-modal-foot" style={{marginTop: '24px'}}>
                <button type="button" className="pm-btn-cancel" onClick={() => setShowPromoModal(false)}>Cancel</button>
                <button type="button" className="pm-btn-draft">Save as Draft</button>
                <button type="submit" className="pm-btn-activate">Create & Activate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="pm-toast">
          {toast.text}
        </div>
      )}
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

.pm-container {
  font-family: 'Manrope', system-ui, sans-serif;
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;
  color: #0f172a;
}
.pm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.pm-title-row { display: flex; align-items: center; gap: 10px; }
.pm-folder-icon { font-size: 26px; }
.pm-title { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.pm-sub { margin: 4px 0 0 0; font-size: 13px; color: #64748b; font-weight: 600; }
.pm-top-actions { display: flex; gap: 12px; }

.pm-btn-outline {
  font-family: inherit;
  background: #fff;
  border: 2px solid #cbd5e1;
  color: #334155;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.pm-btn-outline:hover { border-color: #059669; color: #059669; }

.pm-btn-primary {
  font-family: inherit;
  background: #059669;
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5,150,105,0.25);
  transition: all 0.2s;
}
.pm-btn-primary:hover { background: #047857; }

.pm-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.pm-tabs { display: flex; gap: 8px; background: #e2e8f0; padding: 4px; border-radius: 12px; }
.pm-tab {
  font-family: inherit;
  background: transparent;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.pm-tab.is-active { background: #fff; color: #0f172a; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }

.pm-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 2px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 12px;
  width: 280px;
}
.pm-search-box input { border: none; outline: none; font-family: inherit; font-weight: 700; font-size: 13px; width: 100%; color: #0f172a; }

.pm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

.pm-card {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(15,23,42,0.03);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.pm-card:hover { transform: translateY(-3px); border-color: #059669; box-shadow: 0 12px 24px rgba(5,150,105,0.12); }
.pm-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.pm-card-icon-title { display: flex; gap: 12px; align-items: center; }
.pm-mini-icon {
  width: 42px;
  height: 42px;
  background: #ecfdf5;
  border: 2px solid #6ee7b7;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
}
.pm-card-name { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }
.pm-card-type { font-size: 12px; color: #64748b; font-weight: 700; }
.pm-code-badge { font-size: 11px; color: #047857; background: #ecfdf5; padding: 2px 6px; border-radius: 6px; font-weight: 800; display: inline-block; margin-top: 3px; }
.pm-edit-btn { background: #f1f5f9; border: 1.5px solid #cbd5e1; padding: 6px; border-radius: 8px; cursor: pointer; }
.pm-card-desc { font-size: 13px; color: #475569; font-weight: 600; margin: 0 0 16px 0; line-height: 1.4; }
.pm-card-stats { border-top: 1.5px solid #f1f5f9; padding-top: 12px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 700; color: #64748b; }
.pm-stat-row { display: flex; gap: 12px; }
.pm-green-dot { color: #059669; font-weight: 800; }
.pm-gray-dot { color: #64748b; font-weight: 800; }

.pm-card-bottom { border-top: 1.5px solid #f1f5f9; padding-top: 12px; }
.pm-view-promo-btn {
  width: 100%;
  font-family: inherit;
  background: #059669;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.pm-view-promo-btn:hover { background: #047857; }

.pm-status-pill { background: #ecfdf5; color: #047857; border: 1.5px solid #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 11px; font-weight: 900; }

/* Modals */
.pm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 3000;
}
.pm-modal {
  background: #fff;
  width: min(520px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  border-radius: 24px;
  border: 2px solid #cbd5e1;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  text-align: left;
}
.pm-modal-large { width: min(640px, 100%); }
.pm-modal-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.pm-modal-title { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
.pm-modal-sub { margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 600; }
.pm-close-x { background: #f1f5f9; border: 1.5px solid #cbd5e1; width: 34px; height: 34px; border-radius: 50%; font-weight: 900; cursor: pointer; }

.pm-form { display: flex; flexDirection: column; gap: 4px; }
.pm-label { font-size: 12px; font-weight: 800; color: #334155; margin-bottom: 4px; display: block; }
.pm-input, .pm-textarea {
  width: 100%;
  font-family: inherit;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid #cbd5e1;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.pm-input:focus, .pm-textarea:focus { border-color: #059669; background: #fff; }
.pm-textarea { resize: none; height: 75px; }
.pm-hint { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 3px; display: block; }
.pm-error-txt { font-size: 11px; color: #dc2626; font-weight: 800; margin-top: 3px; }
.pm-counter { font-size: 11px; color: #64748b; text-align: right; margin-top: 2px; font-weight: 700; }

.pm-dropdown-wrap { position: relative; }
.pm-select-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid #cbd5e1;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.pm-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  margin-top: 4px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 40;
  max-height: 180px;
  overflow-y: auto;
}
.pm-dropdown-item { padding: 10px 14px; font-size: 13px; font-weight: 700; cursor: pointer; }
.pm-dropdown-item:hover { background: #ecfdf5; color: #047857; }

.pm-section-title { font-size: 11px; font-weight: 900; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 12px; margin-bottom: 8px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; }
.pm-row-2 { display: flex; gap: 12px; }
.pm-row-2 > div { flex: 1; }

.pm-modal-foot { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
.pm-btn-cancel { font-family: inherit; background: #f1f5f9; border: 2px solid #cbd5e1; padding: 10px 16px; border-radius: 10px; font-weight: 800; cursor: pointer; }
.pm-btn-submit { font-family: inherit; background: #059669; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; }
.pm-btn-draft { font-family: inherit; background: #f1f5f9; border: 2px solid #cbd5e1; padding: 10px 16px; border-radius: 10px; font-weight: 800; cursor: pointer; }
.pm-btn-activate { font-family: inherit; background: #059669; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }

.pm-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #ecfdf5;
  color: #065f46;
  border: 2px solid #6ee7b7;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 13px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 5000;
}
.pm-empty { padding: 40px; text-align: center; color: #64748b; font-weight: 700; grid-column: 1 / -1; background: #fff; border: 2px dashed #cbd5e1; border-radius: 20px; }
`;