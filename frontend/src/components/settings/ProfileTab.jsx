// FILE: src/components/settings/ProfileTab.jsx
import React from 'react';

export default function ProfileTab({ formData, handleChange }) {
  return (
    <div style={S.sectionGroup}>
      <h3 style={S.sectionTitle}>👤 Admin & User Profile</h3>
      <div style={S.grid2}>
        <div style={S.fieldGroup}>
          <label style={S.label}>Owner / Admin Name *</label>
          <input type="text" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} style={S.input} required />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>First Name</label>
          <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Last Name</label>
          <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Email (Login ID)</label>
          <input type="email" name="email" value={formData.email || ''} style={{...S.input, backgroundColor: '#f1f5f9'}} disabled />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Mobile Number</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Preferred Language</label>
          <select name="preferredLanguage" value={formData.preferredLanguage || 'Telugu'} onChange={handleChange} style={S.input}>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
          </select>
        </div>
      </div>
    </div>
  );
}

const S = {
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: 8 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: '#0f172a' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #94a3b8', fontSize: 13, fontWeight: 800, color: '#0f172a', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%' }
};