import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function GalleryModule({ restaurantId = 'ae41c831-372b-4f56-8905-f67a93b8045b' }) {
  const [images, setImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  // Upload modal state
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Menu mapping state
  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);

  // Local state to store mapped menu item names per image for instant UI reflection
  const [imageMenuMap, setImageMenuMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`imageMenuMap_${restaurantId}`) || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(`imageMenuMap_${restaurantId}`, JSON.stringify(imageMenuMap));
  }, [imageMenuMap, restaurantId]);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/gallery?restaurantId=${restaurantId}&search=${encodeURIComponent(searchQuery || '')}`);
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch gallery images:', err);
      setImages([]);
    }
  }, [restaurantId, searchQuery]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const userEmail = localStorage.getItem('userEmail') || '';
      const res = await fetch(`${API_BASE_URL}/api/v1/menu?email=${userEmail}`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []));
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setMenuItems([]);
    }
  }, []);

  useEffect(() => {
    fetchImages();
    fetchMenuItems();
  }, [fetchImages, fetchMenuItems]);

  const toggleSelectImage = (id) => {
    setSelectedImageIds(prev =>
      Array.isArray(prev) && prev.includes(id) ? prev.filter(item => item !== id) : [...(Array.isArray(prev) ? prev : []), id]
    );
  };

  const handleSelectAll = (e) => {
    const safeImages = Array.isArray(images) ? images : [];
    if (e.target.checked) {
      setSelectedImageIds(safeImages.map(img => img.id));
    } else {
      setSelectedImageIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    const safeSelected = Array.isArray(selectedImageIds) ? selectedImageIds : [];
    if (safeSelected.length === 0) return;
    if (!window.confirm(`Delete ${safeSelected.length} selected image(s)?`)) return;
    try {
      for (const id of safeSelected) {
        await fetch(`${API_BASE_URL}/api/v1/gallery/${id}`, { method: 'DELETE' });
      }
      setSelectedImageIds([]);
      fetchImages();
    } catch (err) {
      console.error('Failed to delete images', err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const safeFiles = Array.isArray(uploadFiles) ? uploadFiles : [];
    if (safeFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    for (let file of safeFiles) {
      formData.append('files', file);
    }
    formData.append('restaurantId', restaurantId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/gallery/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setIsUploadModalOpen(false);
        setUploadFiles([]);
        fetchImages();
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleMapSubmit = async () => {
    const safeSelected = Array.isArray(selectedImageIds) ? selectedImageIds : [];
    if (safeSelected.length === 0) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/gallery/map-to-menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: safeSelected[0],
          menuItemIds: selectedMenuItemIds
        })
      });

      // Extract names of selected menu items to display instantly on the card
      const selectedNames = menuItems
        .filter(m => selectedMenuItemIds.includes(m.id || m.menuItemId))
        .map(m => m.itemName || m.name || m.dishName || m.dish_name)
        .filter(Boolean);

      setImageMenuMap(prev => ({
        ...prev,
        [safeSelected[0]]: selectedNames
      }));

      setIsMapModalOpen(false);
      setSelectedImageIds([]);
      setSelectedMenuItemIds([]);
      fetchImages();
      alert('Images successfully mapped to menu items!');
    } catch (err) {
      console.error('Mapping failed', err);
      alert('Error mapping images to menu items.');
    }
  };

  const safeImages = Array.isArray(images) ? images : [];
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const safeSelectedIds = Array.isArray(selectedImageIds) ? selectedImageIds : [];
  const safeSelectedMenuIds = Array.isArray(selectedMenuItemIds) ? selectedMenuItemIds : [];
  
  const activeImage = safeImages.find(img => img.id === safeSelectedIds[0]) || safeImages[0] || { fileName: 'image.png', fileUrl: '' };

  return (
    <div className="gl">
      <style>{css}</style>

      {/* Header */}
      <div className="gl-header">
        <div className="gl-title-area">
          <h2 className="gl-title">Gallery</h2>
          <span className="gl-badge">{safeImages.length} images</span>
        </div>
        <button className="gl-upload-btn" onClick={() => setIsUploadModalOpen(true)}>
          ↑ Upload Images
        </button>
      </div>

      {/* Search & Toolbar */}
      <div className="gl-toolbar">
        <div className="gl-search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search images by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gl-search-input"
          />
        </div>
        <div className="gl-toolbar-right">
          <span className="gl-library-info">{safeImages.length} images in your library</span>
          <label className="gl-select-all">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={safeSelectedIds.length === safeImages.length && safeImages.length > 0}
              className="gl-check-accent"
            />
            Select all
          </label>
        </div>
      </div>

      {/* Image Grid */}
      <div className="gl-grid">
        {safeImages.map((img) => {
          const isSelected = safeSelectedIds.includes(img.id);
          const rawUrl = img.fileUrl || img.file_url || '';
          const imageUrl = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
          
          // Get mapped menu items for this image
          const mappedNames = img.menuItemNames || img.menuItems || imageMenuMap[img.id] || [];
          const displayNames = Array.isArray(mappedNames)
            ? mappedNames.map(m => typeof m === 'object' ? (m.itemName || m.name || m.dishName) : m).filter(Boolean)
            : [];

          return (
            <div
              key={img.id}
              className={`gl-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => toggleSelectImage(img.id)}
            >
              <div className="gl-card-img-wrap">
                <img src={imageUrl} alt={img.fileName || img.file_name || 'Gallery Image'} className="gl-card-img" onError={(e) => { e.target.src = 'https://placehold.co/300x180?text=Image+Not+Found'; }} />
                <input
                  type="checkbox"
                  className="gl-card-checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectImage(img.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="gl-card-footer">
                <strong className="gl-card-title">{img.fileName || img.file_name}</strong>
                <small className="gl-card-subtitle">{img.fileType?.split('/')[1]?.toUpperCase() || 'JPEG'} · {img.fileSize || '45 KB'}</small>
                
                {/* 🏷️ Mapped Menu Item Badges */}
                {displayNames.length > 0 && (
                  <div className="gl-mapped-wrap">
                    {displayNames.map((name, i) => (
                      <span key={i} className="gl-mapped-badge">🍽️ {name}</span>
                    ))}
                  </div>
                )}

                <span className="gl-card-date">{img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      {safeSelectedIds.length > 0 && (
        <div className="gl-floating">
          <span className="gl-floating-text">{safeSelectedIds.length} image selected</span>
          <div className="gl-floating-buttons">
            <button className="gl-clear-btn" onClick={() => setSelectedImageIds([])}>✕ Clear</button>
            <button className="gl-map-btn" onClick={() => setIsMapModalOpen(true)}>🔗 Map to Menu</button>
            <button className="gl-delete-btn" onClick={handleDeleteSelected}>🗑️ Delete</button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="gl-overlay">
          <div className="gl-modal">
            <div className="gl-modal-header">
              <div>
                <h3 className="gl-modal-title">Upload images</h3>
                <p className="gl-modal-sub">PNG or JPEG, up to 5MB each and 10 at a time.</p>
              </div>
              <button className="gl-close-btn" onClick={() => setIsUploadModalOpen(false)}>✕</button>
            </div>
            
            <div className="gl-dropzone">
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg"
                onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                id="fileInputHidden"
                className="gl-hidden-input"
              />
              <label htmlFor="fileInputHidden" className="gl-drop-label">
                <div className="gl-drop-icon">⬆</div>
                <strong>Drop images here, or click to browse</strong>
                <span className="gl-drop-count">{uploadFiles.length}/10 selected</span>
              </label>
            </div>

            <div className="gl-modal-footer">
              <button className="gl-secondary-btn" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
              <button
                className="gl-primary-btn"
                onClick={handleUploadSubmit}
                disabled={uploading || uploadFiles.length === 0}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map to Menu Modal */}
      {isMapModalOpen && (
        <div className="gl-overlay">
          <div className="gl-modal gl-modal-wide">
            <div className="gl-modal-header">
              <div>
                <h3 className="gl-modal-title">Map images to menu items</h3>
                <p className="gl-modal-sub">Pick an image, then choose the menu items it should appear on.</p>
              </div>
              <button className="gl-close-btn" onClick={() => setIsMapModalOpen(false)}>✕</button>
            </div>

            <div className="gl-preview">
              {(() => {
                const rawPrevUrl = activeImage.fileUrl || activeImage.file_url || '';
                const prevUrl = rawPrevUrl.startsWith('http') ? rawPrevUrl : `${API_BASE_URL}${rawPrevUrl.startsWith('/') ? '' : '/'}${rawPrevUrl}`;
                return <img src={prevUrl} alt="preview" className="gl-preview-img" onError={(e) => { e.target.src = 'https://placehold.co/50x50?text=Img'; }} />;
              })()}
              <div className="gl-preview-text">
                <strong className="gl-preview-name">{activeImage.fileName || activeImage.file_name}</strong>
                <span className="gl-preview-meta">
                  {safeSelectedMenuIds.length === 0 ? 'No menu items selected' : `${safeSelectedMenuIds.length} menu items selected`}
                </span>
              </div>
            </div>

            <div className="gl-menu-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="gl-search-input"
              />
            </div>

            <div className="gl-checklist">
              {safeMenuItems
                .filter(item => {
                  const itemName = item?.itemName || item?.name || item?.dishName || item?.dish_name || '';
                  return itemName.toLowerCase().includes((menuSearch || '').toLowerCase());
                })
                .map(item => {
                  const itemId = item.id || item.menuItemId;
                  const itemName = item.itemName || item.name || item.dishName || item.dish_name || 'Unnamed Dish';
                  const isChecked = safeSelectedMenuIds.includes(itemId);
                  return (
                    <label
                      key={itemId}
                      className={`gl-check-row ${isChecked ? 'is-checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedMenuItemIds(prev => {
                            const safePrev = Array.isArray(prev) ? prev : [];
                            return safePrev.includes(itemId) 
                              ? safePrev.filter(id => id !== itemId) 
                              : [...safePrev, itemId];
                          });
                        }}
                        className="gl-check-box"
                      />
                      <span className="gl-check-name">{itemName}</span>
                    </label>
                  );
                })}
            </div>

            <div className="gl-modal-footer">
              <span className="gl-footer-note">
                {safeSelectedMenuIds.length === 0 ? 'Nothing to map yet' : `${safeSelectedMenuIds.length} mapped`}
              </span>
              <div className="gl-footer-btns">
                <button className="gl-secondary-btn" onClick={() => setIsMapModalOpen(false)}>Cancel</button>
                <button className="gl-primary-btn" onClick={handleMapSubmit}>Map Images</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Styles (frontend only) ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

.gl {
  --ink: #111827;
  --ink-soft: #374151;
  --ink-faint: #6b7280;
  --line: #e5e7eb;
  --surface: #ffffff;
  --canvas: #f3f6f5;
  --green: #05c98a;
  --green-dark: #047857;
  --coral: #ff5a5f;
  --coral-dark: #e8434a;

  padding: clamp(16px, 3vw, 32px);
  min-height: 100vh;
  box-sizing: border-box;
  font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  color: var(--ink);
  background:
    radial-gradient(900px 420px at 100% -10%, rgba(5, 201, 138, 0.1), transparent 60%),
    radial-gradient(700px 380px at -10% 0%, rgba(255, 90, 95, 0.07), transparent 60%),
    var(--canvas);
}
.gl *, .gl *::before, .gl *::after { box-sizing: border-box; }

/* ---------- Header ---------- */
.gl-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  animation: gl-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.gl-title-area { display: flex; align-items: center; gap: 14px; }
.gl-title { margin: 0; font-size: clamp(26px, 3.4vw, 34px); font-weight: 800; letter-spacing: -0.03em; color: var(--ink); }
.gl-badge {
  background: var(--green);
  color: #003d2b;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(5, 201, 138, 0.3);
}

.gl-upload-btn {
  font-family: inherit;
  background: linear-gradient(135deg, #ff6b6f, #f0434a);
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(255, 90, 95, 0.32);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.gl-upload-btn:hover { transform: translateY(-3px); filter: brightness(1.06); box-shadow: 0 14px 28px rgba(255, 90, 95, 0.4); }
.gl-upload-btn:active { transform: translateY(0) scale(0.97); }

/* ---------- Toolbar ---------- */
.gl-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--surface);
  padding: 16px 22px;
  border: 1px solid var(--line);
  border-radius: 18px;
  margin-bottom: 26px;
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04), 0 10px 26px -14px rgba(17, 24, 39, 0.12);
  animation: gl-rise 0.5s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.gl-search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 460px;
  min-width: 240px;
  border: 2px solid #d5dbe3;
  border-radius: 12px;
  padding: 11px 16px;
  background: #f9fafb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.gl-search-box:hover { border-color: #b8c1cd; }
.gl-search-box:focus-within { border-color: var(--green); background: #fff; box-shadow: 0 0 0 4px rgba(5, 201, 138, 0.18); }
.gl-search-input {
  font-family: inherit;
  border: none;
  outline: none;
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  background: transparent;
}
.gl-search-input::placeholder { color: #9ca3af; font-weight: 600; }

.gl-toolbar-right { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; color: var(--ink-faint); font-size: 14px; font-weight: 700; }
.gl-select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 800;
  color: var(--ink-soft);
  padding: 8px 14px;
  border-radius: 10px;
  transition: background 0.2s ease;
}
.gl-select-all:hover { background: #ecfdf5; }
.gl-check-accent { width: 18px; height: 18px; accent-color: var(--green); cursor: pointer; }

/* ---------- Grid ---------- */
.gl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 24px;
  padding-bottom: 110px;
}

.gl-card {
  position: relative;
  background: var(--surface);
  border: 2px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04), 0 10px 24px -14px rgba(17, 24, 39, 0.16);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  animation: gl-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.gl-card:nth-child(2) { animation-delay: 0.04s; }
.gl-card:nth-child(3) { animation-delay: 0.08s; }
.gl-card:nth-child(4) { animation-delay: 0.12s; }
.gl-card:nth-child(5) { animation-delay: 0.16s; }
.gl-card:nth-child(6) { animation-delay: 0.2s; }
.gl-card:nth-child(n+7) { animation-delay: 0.24s; }

.gl-card:hover {
  transform: translateY(-6px);
  border-color: #c9d3de;
  box-shadow: 0 2px 4px rgba(17, 24, 39, 0.05), 0 22px 40px -16px rgba(17, 24, 39, 0.26);
}
.gl-card.is-selected {
  border-color: var(--green);
  box-shadow: 0 0 0 4px rgba(5, 201, 138, 0.22), 0 18px 36px -16px rgba(5, 201, 138, 0.45);
}

.gl-card-img-wrap { position: relative; height: 190px; background: #eef1f4; overflow: hidden; }
.gl-card-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
.gl-card:hover .gl-card-img { transform: scale(1.08); }
.gl-card-img-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(17, 24, 39, 0.35), transparent 45%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.gl-card:hover .gl-card-img-wrap::after,
.gl-card.is-selected .gl-card-img-wrap::after { opacity: 1; }

.gl-card-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  width: 22px;
  height: 22px;
  accent-color: var(--green);
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s ease;
}
.gl-card-checkbox:hover { transform: scale(1.15); }

.gl-card-footer { padding: 16px; }
.gl-card-title { display: block; font-size: 15px; font-weight: 800; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gl-card-subtitle { display: block; font-size: 13px; font-weight: 600; color: #8b95a3; margin-top: 4px; }
.gl-card-date { display: block; font-size: 13px; font-weight: 600; color: #8b95a3; margin-top: 4px; }
.gl-card-date:empty { display: none; }

.gl-mapped-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 6px; }
.gl-mapped-badge {
  background: #ecfdf5;
  color: var(--green-dark);
  border: 1.5px solid #10b981;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.gl-mapped-badge:hover { background: #10b981; color: #fff; transform: translateY(-1px); }

/* ---------- Floating action bar ---------- */
.gl-floating {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--line);
  box-shadow: 0 18px 44px rgba(17, 24, 39, 0.22);
  padding: 14px 24px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 28px;
  z-index: 100;
  max-width: calc(100vw - 24px);
  animation: gl-bar-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes gl-bar-in {
  from { opacity: 0; transform: translate(-50%, 24px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
.gl-floating-text { font-weight: 800; color: var(--ink); font-size: 16px; white-space: nowrap; }
.gl-floating-buttons { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.gl-clear-btn {
  font-family: inherit;
  background: none;
  border: none;
  color: var(--ink-soft);
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.2s ease, color 0.2s ease;
}
.gl-clear-btn:hover { background: #f3f4f6; color: var(--ink); }

.gl-map-btn {
  font-family: inherit;
  background: #fff;
  border: 2px solid #d5dbe3;
  color: var(--ink);
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.gl-map-btn:hover { transform: translateY(-2px); border-color: var(--green); background: #ecfdf5; box-shadow: 0 8px 18px rgba(5, 201, 138, 0.22); }
.gl-map-btn:active { transform: translateY(0) scale(0.97); }

.gl-delete-btn {
  font-family: inherit;
  background: linear-gradient(135deg, #ff6b6f, #f0434a);
  border: none;
  color: #fff;
  padding: 11px 18px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(255, 90, 95, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.gl-delete-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 12px 22px rgba(255, 90, 95, 0.4); }
.gl-delete-btn:active { transform: translateY(0) scale(0.97); }

/* ---------- Modals ---------- */
.gl-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 1000;
  animation: gl-fade 0.25s ease both;
}
.gl-modal {
  background: #fff;
  width: min(600px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: clamp(20px, 3vw, 32px);
  box-shadow: 0 30px 64px rgba(0, 0, 0, 0.3);
  animation: gl-pop 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.gl-modal-wide { width: min(680px, 100%); }

.gl-modal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
.gl-modal-title { margin: 0 0 6px 0; font-size: 22px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.gl-modal-sub { font-size: 14px; font-weight: 600; color: var(--ink-faint); margin: 0; line-height: 1.45; }

.gl-close-btn {
  font-family: inherit;
  background: #f3f4f6;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  color: var(--ink-faint);
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease;
}
.gl-close-btn:hover { background: #fee2e2; color: #dc2626; transform: rotate(90deg); }

/* Upload dropzone */
.gl-dropzone {
  border: 2.5px dashed #c5cdd8;
  border-radius: 18px;
  background: #f9fafb;
  cursor: pointer;
  margin-bottom: 20px;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}
.gl-dropzone:hover { border-color: var(--green); background: #f0fdf9; transform: scale(1.01); }
.gl-hidden-input { display: none; }
.gl-drop-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--ink-soft);
  font-size: 16px;
  padding: 48px 20px;
  text-align: center;
}
.gl-drop-icon {
  font-size: 30px;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #d1fae5;
  color: var(--green-dark);
  animation: gl-float 2.4s ease-in-out infinite;
}
.gl-drop-count { font-size: 14px; color: var(--ink-faint); font-weight: 700; }

@keyframes gl-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.gl-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid var(--line);
  padding-top: 18px;
}
.gl-footer-note { font-size: 14px; color: var(--ink-faint); font-weight: 700; }
.gl-footer-btns { display: flex; gap: 10px; }

.gl-secondary-btn {
  font-family: inherit;
  background: #fff;
  border: 2px solid #d5dbe3;
  padding: 11px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  font-size: 15px;
  color: var(--ink-soft);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.gl-secondary-btn:hover { transform: translateY(-2px); border-color: #aab4c1; background: #f9fafb; }
.gl-secondary-btn:active { transform: translateY(0) scale(0.97); }

.gl-primary-btn {
  font-family: inherit;
  background: linear-gradient(135deg, #ff6b6f, #f0434a);
  color: #fff;
  border: none;
  padding: 12px 26px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 6px 16px rgba(255, 90, 95, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}
.gl-primary-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 12px 24px rgba(255, 90, 95, 0.4); }
.gl-primary-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
.gl-primary-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

/* Map modal */
.gl-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1.5px solid var(--line);
  padding: 14px;
  border-radius: 16px;
  margin-bottom: 18px;
  background: #f9fafb;
}
.gl-preview-img { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 12px rgba(17, 24, 39, 0.15); flex-shrink: 0; }
.gl-preview-text { min-width: 0; }
.gl-preview-name { display: block; font-size: 16px; font-weight: 800; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gl-preview-meta { font-size: 14px; font-weight: 600; color: var(--ink-faint); }

.gl-menu-search {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid var(--coral);
  border-radius: 12px;
  padding: 11px 16px;
  margin-bottom: 18px;
  transition: box-shadow 0.2s ease;
}
.gl-menu-search:focus-within { box-shadow: 0 0 0 4px rgba(255, 90, 95, 0.18); }

.gl-checklist {
  max-height: 280px;
  overflow-y: auto;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  margin-bottom: 20px;
}
.gl-check-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  background: transparent;
  transition: background 0.18s ease, padding-left 0.18s ease;
}
.gl-check-row:last-child { border-bottom: none; }
.gl-check-row:hover { background: #f9fafb; padding-left: 24px; }
.gl-check-row.is-checked { background: #fff1f1; box-shadow: inset 4px 0 0 var(--coral); }
.gl-check-box { width: 18px; height: 18px; accent-color: var(--coral); cursor: pointer; flex-shrink: 0; }
.gl-check-name { font-size: 15px; font-weight: 700; color: #1f2937; }

/* ---------- Animations ---------- */
@keyframes gl-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gl-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes gl-pop {
  from { opacity: 0; transform: translateY(18px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ---------- Keyboard focus ---------- */
.gl-upload-btn:focus-visible,
.gl-clear-btn:focus-visible,
.gl-map-btn:focus-visible,
.gl-delete-btn:focus-visible,
.gl-close-btn:focus-visible,
.gl-secondary-btn:focus-visible,
.gl-primary-btn:focus-visible {
  outline: 3px solid rgba(5, 201, 138, 0.55);
  outline-offset: 2px;
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .gl-upload-btn { width: 100%; }
  .gl-search-box { max-width: none; width: 100%; }
  .gl-toolbar-right { width: 100%; justify-content: space-between; }
  .gl-grid { gap: 16px; }
  .gl-card-img-wrap { height: 170px; }
  .gl-floating { flex-direction: column; gap: 10px; width: calc(100vw - 24px); padding: 14px 16px; }
  .gl-floating-buttons { width: 100%; justify-content: space-between; }
  .gl-modal-footer { flex-direction: column; align-items: stretch; }
  .gl-footer-btns { justify-content: flex-end; }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .gl *, .gl *::before, .gl *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;