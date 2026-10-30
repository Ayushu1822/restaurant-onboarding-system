// FILE: src/components/settings/BusinessInfoTab.jsx
import React from 'react';

export default function BusinessInfoTab({ formData, handleChange }) {
  return (
    <div style={S.sectionGroup}>
      <h3 style={S.sectionTitle}>🏢 Business Information & Identity</h3>
      <div style={S.grid2}>
        <div style={S.fieldGroup}>
          <label style={S.label}>Business Name *</label>
          <input type="text" name="businessName" value={formData.businessName || ''} onChange={handleChange} style={S.input} required />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Owner Name *</label>
          <input type="text" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} style={S.input} required />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Email ID (Login ID)</label>
          <input type="email" name="email" value={formData.email || ''} style={{...S.input, backgroundColor: '#f1f5f9'}} disabled />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>WhatsApp Business Number *</label>
          <input type="text" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} style={S.input} required />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Mobile Number *</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} style={S.input} required />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Website</label>
          <input type="text" name="website" value={formData.website || ''} onChange={handleChange} placeholder="https://" style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>GSTN Number *</label>
          <input type="text" name="gstnNumber" value={formData.gstnNumber || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Business License Number *</label>
          <input type="text" name="businessLicenseNumber" value={formData.businessLicenseNumber || ''} onChange={handleChange} style={S.input} />
        </div>
      </div>

      <h3 style={{...S.sectionTitle, marginTop: 28}}>🏷️ Display Names & Codes</h3>
      <div style={S.grid2}>
        <div style={S.fieldGroup}>
          <label style={S.label}>Online Restaurant Name *</label>
          <input type="text" name="onlineRestaurantName" value={formData.onlineRestaurantName || ''} onChange={handleChange} placeholder="e.g. FOODOS Kitchen" style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Branch Display Name *</label>
          <input type="text" name="branchDisplayName" value={formData.branchDisplayName || ''} onChange={handleChange} placeholder="e.g. Koramangala" style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Business Short Code *</label>
          <input type="text" name="businessShortCode" value={formData.businessShortCode || ''} onChange={handleChange} maxLength="5" placeholder="e.g. KO" style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Branch Short Code *</label>
          <input type="text" name="branchShortCode" value={formData.branchShortCode || ''} onChange={handleChange} maxLength="2" placeholder="e.g. 01" style={S.input} />
        </div>
      </div>

      <h3 style={{...S.sectionTitle, marginTop: 28}}>📍 Address & Location</h3>
      <div style={S.grid2}>
        <div style={S.fieldGroup}>
          <label style={S.label}>Address Line 1</label>
          <input type="text" name="addressLine1" value={formData.addressLine1 || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Address Line 2</label>
          <input type="text" name="addressLine2" value={formData.addressLine2 || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Area</label>
          <input type="text" name="area" value={formData.area || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>City</label>
          <input type="text" name="city" value={formData.city || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>State</label>
          <input type="text" name="state" value={formData.state || ''} onChange={handleChange} style={S.input} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>PIN Code</label>
          <input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} style={S.input} />
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
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #94a3b8', fontSize: '13px', fontWeight: 800, color: '#0f172a', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }
};