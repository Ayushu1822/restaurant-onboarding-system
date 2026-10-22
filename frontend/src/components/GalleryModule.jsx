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

  // Menu mapping state (Safely initialized as arrays)
  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/gallery?restaurantId=${restaurantId}&search=${encodeURIComponent(searchQuery || '')}`);
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      // Mock fallback data matching screenshots if backend is offline
      setImages([
        { id: '1', fileName: 'Linga_Foods.png', fileUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300', fileType: 'image/png', fileSize: '1.0 MB', uploadedAt: '2026-06-27' },
        { id: '2', fileName: 'Andhra Meals.jpg', fileUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3b55e4?w=300', fileType: 'image/jpeg', fileSize: '45 KB', uploadedAt: '2026-06-28' },
        { id: '3', fileName: 'Gobi_Fried_Rice.jpeg', fileUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300', fileType: 'image/jpeg', fileSize: '45 KB', uploadedAt: '2026-06-28' },
        { id: '4', fileName: 'chicken sushi.png', fileUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300', fileType: 'image/png', fileSize: '21 KB', uploadedAt: '2026-09-05' },
        { id: '5', fileName: 'Chapathi.jpg', fileUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300', fileType: 'image/jpeg', fileSize: '21 KB', uploadedAt: '2026-09-05' }
      ]);
    }
  }, [restaurantId, searchQuery]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/menu/items?restaurantId=${restaurantId}`);
      const data = await res.json();
      // Ensure data is always an array to prevent .filter crash
      setMenuItems(Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []));
    } catch (err) {
      setMenuItems([
        { id: '1', name: 'green tea' },
        { id: '2', name: 'Ginger tea with milkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk' },
        { id: '3', name: 'crossiant' },
        { id: '4', name: 'pineapple cake' },
        { id: '5', name: 'Avakkaya rice' },
        { id: '6', name: 'gobi rice' }
      ]);
    }
  }, [restaurantId]);

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
      setIsMapModalOpen(false);
      setSelectedImageIds([]);
      setSelectedMenuItemIds([]);
      alert('Images successfully mapped to menu items!');
    } catch (err) {
      console.error('Mapping failed', err);
    }
  };

  const safeImages = Array.isArray(images) ? images : [];
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const safeSelectedIds = Array.isArray(selectedImageIds) ? selectedImageIds : [];
  const safeSelectedMenuIds = Array.isArray(selectedMenuItemIds) ? selectedMenuItemIds : [];
  
  const activeImage = safeImages.find(img => img.id === safeSelectedIds[0]) || safeImages[0] || { fileName: 'chicken sushi.png', fileUrl: '' };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleArea}>
          <h2 style={styles.title}>Gallery</h2>
          <span style={styles.badge}>{safeImages.length} images</span>
        </div>
        <button style={styles.uploadBtn} onClick={() => setIsUploadModalOpen(true)}>
          ↑ Upload Images
        </button>
      </div>

      {/* Search & Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search images by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.toolbarRight}>
          <span style={styles.libraryInfo}>{safeImages.length} images in your library</span>
          <label style={styles.selectAllLabel}>
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={safeSelectedIds.length === safeImages.length && safeImages.length > 0}
              style={styles.checkboxAccent}
            />
            Select all
          </label>
        </div>
      </div>

      {/* Image Grid */}
      <div style={styles.grid}>
        {safeImages.map((img) => {
          const isSelected = safeSelectedIds.includes(img.id);
          return (
            <div
              key={img.id}
              style={{
                ...styles.card,
                borderColor: isSelected ? '#05c98a' : '#e5e7eb',
                boxShadow: isSelected ? '0 0 0 2px rgba(5, 201, 138, 0.2)' : 'none'
              }}
              onClick={() => toggleSelectImage(img.id)}
            >
              <div style={styles.cardImageWrapper}>
                <img src={img.fileUrl} alt={img.fileName} style={styles.cardImg} />
                <input
                  type="checkbox"
                  style={styles.cardCheckbox}
                  checked={isSelected}
                  onChange={() => toggleSelectImage(img.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div style={styles.cardFooter}>
                <strong style={styles.cardTitle}>{img.fileName}</strong>
                <small style={styles.cardSubtitle}>{img.fileType?.split('/')[1]?.toUpperCase() || 'JPEG'} · {img.fileSize || '45 KB'}</small>
                <span style={styles.cardDate}>{img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString() : '28 Jun 2026'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      {safeSelectedIds.length > 0 && (
        <div style={styles.floatingBar}>
          <span style={styles.floatingText}>{safeSelectedIds.length} image selected</span>
          <div style={styles.floatingButtons}>
            <button style={styles.clearBtn} onClick={() => setSelectedImageIds([])}>✕ Clear</button>
            <button style={styles.mapBtn} onClick={() => setIsMapModalOpen(true)}>🔗 Map to Menu</button>
            <button style={styles.deleteBtn} onClick={handleDeleteSelected}>🗑️ Delete</button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Upload images</h3>
                <p style={styles.modalSubtext}>PNG or JPEG, up to 5MB each and 10 at a time. Images must be square so they fill menu tiles cleanly.</p>
              </div>
              <button style={styles.closeBtn} onClick={() => setIsUploadModalOpen(false)}>✕</button>
            </div>
            
            <div style={styles.dropZone}>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg"
                onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                id="fileInputHidden"
                style={{ display: 'none' }}
              />
              <label htmlFor="fileInputHidden" style={styles.dropLabel}>
                <div style={{ fontSize: '24px' }}>⬆</div>
                <strong>Drop images here, or click to browse</strong>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{uploadFiles.length}/10 selected</span>
              </label>
            </div>

            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
              {uploadFiles.length === 0 ? 'No images selected yet.' : `${uploadFiles.length} file(s) ready for upload.`}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.secondaryBtn} onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
              <button
                style={{ ...styles.primaryBtn, opacity: uploadFiles.length === 0 ? 0.5 : 1 }}
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
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, width: '640px' }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Map images to menu items</h3>
                <p style={styles.modalSubtext}>Pick an image, then choose the menu items it should appear on.</p>
              </div>
              <button style={styles.closeBtn} onClick={() => setIsMapModalOpen(false)}>✕</button>
            </div>

            <div style={styles.previewCard}>
              <img src={activeImage.fileUrl} alt="preview" style={styles.previewImg} />
              <div>
                <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>{activeImage.fileName}</strong>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {safeSelectedMenuIds.length === 0 ? 'No menu items selected' : `${safeSelectedMenuIds.length} menu items selected`}
                </span>
              </div>
            </div>

            <div style={styles.menuSearchBox}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.checklistContainer}>
              {safeMenuItems
                .filter(item => (item?.name || '').toLowerCase().includes((menuSearch || '').toLowerCase()))
                .map(item => {
                  const isChecked = safeSelectedMenuIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      style={{
                        ...styles.checkRow,
                        background: isChecked ? '#fdf2f2' : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedMenuItemIds(prev => {
                            const safePrev = Array.isArray(prev) ? prev : [];
                            return safePrev.includes(item.id) 
                              ? safePrev.filter(id => id !== item.id) 
                              : [...safePrev, item.id];
                          });
                        }}
                        style={{ width: '16px', height: 16, accentColor: '#ff5a5f' }}
                      />
                      <span style={{ fontSize: '13px', color: '#1f2937' }}>{item.name}</span>
                    </label>
                  );
                })}
            </div>

            <div style={styles.modalFooter}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {safeSelectedMenuIds.length === 0 ? 'Nothing to map yet' : `${safeSelectedMenuIds.length} mapped`}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={styles.secondaryBtn} onClick={() => setIsMapModalOpen(false)}>Cancel</button>
                <button style={styles.primaryBtn} onClick={handleMapSubmit}>Map Images</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles Object
const styles = {
  container: {
    padding: '24px',
    background: '#f8faf9',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827'
  },
  badge: {
    background: '#05c98a',
    color: '#003d2b',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 750
  },
  uploadBtn: {
    background: '#ff5a5f',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: 650,
    cursor: 'pointer'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '14px 20px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '450px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 12px',
    background: '#fff'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '13px'
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    color: '#6b7280',
    fontSize: '13px'
  },
  libraryInfo: {
    color: '#6b7280'
  },
  selectAllLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    fontWeight: 500
  },
  checkboxAccent: {
    accentColor: '#05c98a'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    paddingBottom: '80px'
  },
  card: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative'
  },
  cardImageWrapper: {
    position: 'relative',
    height: '180px',
    background: '#f3f4f6'
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  cardCheckbox: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    width: '18px',
    height: '18px',
    accentColor: '#05c98a',
    cursor: 'pointer'
  },
  cardFooter: {
    padding: '12px'
  },
  cardTitle: {
    display: 'block',
    fontSize: '13px',
    color: '#1f2937',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  cardSubtitle: {
    display: 'block',
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '2px'
  },
  cardDate: {
    display: 'block',
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '2px'
  },
  floatingBar: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'white',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    padding: '12px 24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    zIndex: 100
  },
  floatingText: {
    fontWeight: 600,
    color: '#111827',
    fontSize: '14px'
  },
  floatingButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#4b5563',
    cursor: 'pointer',
    fontWeight: 500
  },
  mapBtn: {
    background: 'white',
    border: '1px solid #d1d5db',
    color: '#1f2937',
    padding: '8px 14px',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  deleteBtn: {
    background: '#ff5a5f',
    border: 'none',
    color: 'white',
    padding: '8px 14px',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    width: 'min(600px, 92%)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    boxSizing: 'border-box'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  modalTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    color: '#111827'
  },
  modalSubtext: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  dropZone: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    background: '#fafafa',
    cursor: 'pointer',
    marginBottom: '16px'
  },
  dropLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#4b5563',
    fontSize: '13px'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px'
  },
  secondaryBtn: {
    background: 'white',
    border: '1px solid #d1d5db',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600
  },
  primaryBtn: {
    background: '#ff5a5f',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600
  },
  previewCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    border: '1px solid #e5e7eb',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '16px',
    background: '#f9fafb'
  },
  previewImg: {
    width: '50px',
    height: '50px',
    borderRadius: '6px',
    objectFit: 'cover'
  },
  menuSearchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #ff5a5f',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '16px'
  },
  checklistContainer: {
    maxHeight: '240px',
    overflowY: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer'
  }
};