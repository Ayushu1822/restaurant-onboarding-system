import React, { useState } from 'react';

export default function GalleryModule() {
  const [images, setImages] = useState([
    { id: 1, title: 'Delicious Butter Chicken', category: 'Main Course', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Crispy Paneer Tikka', category: 'Starters', url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'Aromatic Veg Biryani', category: 'Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80' }
  ]);

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Main Course');
  const [uploadUrl, setUploadUrl] = useState('');

  const handleAddImage = (e) => {
    e.preventDefault();
    if (!uploadTitle || !uploadUrl) return alert('Please enter a title and image URL.');
    
    setImages([...images, { id: Date.now(), title: uploadTitle, category: uploadCategory, url: uploadUrl }]);
    setUploadTitle('');
    setUploadUrl('');
    alert('Image added to restaurant gallery!');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Restaurant Gallery</h2>
      <p style={styles.subtitle}>Manage promotional food photos, dish imagery, and restaurant ambiance pictures.</p>

      {/* Upload Form Box */}
      <form onSubmit={handleAddImage} style={styles.uploadCard}>
        <h3 style={styles.cardTitle}>➕ Add New Photo</h3>
        <div style={styles.formRow}>
          <input 
            style={styles.input}
            placeholder="Photo Title (e.g. Special Thali)"
            value={uploadTitle}
            onChange={e => setUploadTitle(e.target.value)}
            required
          />
          <select 
            style={styles.select}
            value={uploadCategory}
            onChange={e => setUploadCategory(e.target.value)}
          >
            <option value="Main Course">Main Course</option>
            <option value="Starters">Starters</option>
            <option value="Rice">Rice & Breads</option>
            <option value="Beverages">Beverages</option>
            <option value="Ambiance">Ambiance</option>
          </select>
          <input 
            style={styles.input}
            placeholder="Image URL (e.g. https://...)"
            value={uploadUrl}
            onChange={e => setUploadUrl(e.target.value)}
            required
          />
          <button type="submit" style={styles.uploadBtn}>Upload Photo</button>
        </div>
      </form>

      {/* Gallery Grid */}
      <div style={styles.grid}>
        {images.map(img => (
          <div key={img.id} style={styles.imageCard}>
            <img src={img.url} alt={img.title} style={styles.imgThumb} />
            <div style={styles.imgInfo}>
              <div style={styles.imgTitle}>{img.title}</div>
              <span style={styles.badge}>{img.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowY: 'auto' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' },
  subtitle: { color: '#64748b', fontSize: '13px', marginBottom: '24px' },
  uploadCard: { background: '#fff', padding: '20px', borderRadius: '14px', border: '1.5px solid #e2e8f0', marginBottom: '24px', maxWidth: '900px', textAlign: 'left' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' },
  formRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '200px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' },
  select: { padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' },
  uploadBtn: { background: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', maxWidth: '1000px' },
  imageCard: { background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  imgThumb: { width: '100%', height: '160px', objectFit: 'cover' },
  imgInfo: { padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  imgTitle: { fontSize: '14px', fontWeight: '700', color: '#0f172a' },
  badge: { background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }
};