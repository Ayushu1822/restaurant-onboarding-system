// FILE: src/components/settings/UsersTab.jsx
import React, { useState } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function UsersTab({ formData, usersList, setUsersList, fetchUsers, showMsg }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUserForm, setNewUserForm] = useState({ name: '', userId: '', role: 'Captain', phone: '' });

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim()) return alert('Enter user name');

    const userEmail = formData.email || localStorage.getItem('userEmail') || '';
    
    if (editingUserId) {
      const targetUser = usersList.find(u => (u.id || u._id) === editingUserId);
      const payload = {
        name: newUserForm.name.trim(),
        userIdCode: newUserForm.userId.trim() || 'U01',
        role: newUserForm.role.toUpperCase(),
        phone: newUserForm.phone.trim(),
        status: targetUser?.status || 'Active',
        restaurantEmail: userEmail
      };

      fetch(`${API_BASE_URL}/api/v1/staff/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (res.ok) {
          setEditingUserId(null);
          setNewUserForm({ name: '', userId: '', role: 'Captain', phone: '' });
          fetchUsers(userEmail);
          showMsg('✅ User successfully updated!', 'success');
        } else {
          alert('Failed to update user.');
        }
      })
      .catch(err => alert('Error: ' + err.message));
    } else {
      fetch(`${API_BASE_URL}/api/v1/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newUserForm.name.trim(), 
          userIdCode: newUserForm.userId.trim() || 'U01',
          role: newUserForm.role.toUpperCase(), 
          phone: newUserForm.phone.trim(),
          status: 'Active',
          restaurantEmail: userEmail 
        })
      })
      .then(res => {
        if (res.ok) {
          setNewUserForm({ name: '', userId: '', role: 'Captain', phone: '' });
          fetchUsers(userEmail);
          showMsg('✅ User successfully created & synced!', 'success');
        } else {
          alert('Failed to add user.');
        }
      })
      .catch(err => alert('Error: ' + err.message));
    }
  };

  const handleToggleUserStatus = (userId) => {
    const userEmail = formData.email || localStorage.getItem('userEmail') || '';
    const target = usersList.find(u => (u.id || u._id) === userId);
    if (!target) return;

    const currentStatus = target.status || 'Active';
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    const payload = {
      name: target.name,
      role: target.role || 'CAPTAIN',
      phone: target.phone || '',
      userIdCode: target.userIdCode || 'U01',
      status: nextStatus,
      restaurantEmail: userEmail
    };

    fetch(`${API_BASE_URL}/api/v1/staff/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (res.ok) {
        fetchUsers(userEmail);
        showMsg(`✅ User status updated to ${nextStatus}`, 'success');
      } else {
        alert('Failed to update user status.');
      }
    })
    .catch(err => alert('Error: ' + err.message));
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const userEmail = formData.email || localStorage.getItem('userEmail') || '';
    fetch(`${API_BASE_URL}/api/v1/staff/${userId}`, { method: 'DELETE' })
      .then(res => { if (res.ok) fetchUsers(userEmail); })
      .catch(err => alert('Error: ' + err.message));
  };

  return (
    <div style={S.sectionGroup}>
      <h3 style={S.sectionTitle}>👥 Users & Floor Staff</h3>
      <p style={{fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: -8, marginBottom: 16}}>
        Create or edit Captains, Managers, and Staff here. They will appear simultaneously across Tables for assignment and order tracking.
      </p>

      <div style={S.userAddCard}>
        <h4 style={{margin: '0 0 14px 0', fontSize: 14, fontWeight: 900, color: '#0f172a'}}>
          {editingUserId ? '✏️ Edit User / Captain' : '👤 Add User'}
        </h4>
        <div style={{display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end'}}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Name *</label>
            <input type="text" placeholder="e.g. Ravi Kumar" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} style={S.input} />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>User ID *</label>
            <input type="text" placeholder="U01" value={newUserForm.userId} onChange={e => setNewUserForm({...newUserForm, userId: e.target.value})} style={S.input} maxLength="5" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Phone No</label>
            <input type="text" placeholder="10-digit mobile" value={newUserForm.phone} onChange={e => setNewUserForm({...newUserForm, phone: e.target.value})} style={S.input} />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Role</label>
            <select value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})} style={S.input}>
              <option value="Captain">Captain</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
              <option value="Kitchen">Kitchen Staff</option>
            </select>
          </div>
          <div style={{display: 'flex', gap: 6}}>
            <button type="button" onClick={handleSaveUser} style={S.addUserBtn}>{editingUserId ? 'Update' : '+ Add'}</button>
            {editingUserId && (
              <button type="button" onClick={() => { setEditingUserId(null); setNewUserForm({ name: '', userId: '', role: 'Captain', phone: '' }); }} style={S.cancelInlineBtn}>Cancel</button>
            )}
          </div>
        </div>
      </div>

      <h4 style={{margin: '20px 0 12px 0', fontSize: 15, fontWeight: 900, color: '#0f172a'}}>Users ({usersList.length})</h4>
      
      {usersList.length === 0 ? (
        <div style={S.emptyUsersBox}>No users added yet. Use the form above to add your first captain or manager!</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          {usersList.map(u => {
            const uId = u.id || u._id;
            const status = u.status || 'Active';
            const isActive = status === 'Active';
            return (
              <div key={uId || u.name} style={S.userRowCard}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <div style={S.userAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <span style={{fontWeight: 900, fontSize: 15, color: '#0f172a'}}>{u.name}</span>
                      <span style={S.userCodeBadge}>{u.userIdCode || 'U01'}</span>
                    </div>
                    <div style={{fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: 3}}>
                      {u.role || 'Captain'} {u.phone ? `· 📞 ${u.phone}` : ''}
                    </div>
                  </div>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <span style={{backgroundColor: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#15803d' : '#991b1b', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900}}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button type="button" onClick={() => { setEditingUserId(uId); setNewUserForm({ name: u.name || '', userId: u.userIdCode || '', role: u.role || 'Captain', phone: u.phone || '' }); }} style={S.actionEditBtn}>Edit</button>
                  <button type="button" onClick={() => handleToggleUserStatus(uId)} style={S.userToggleBtn}>{isActive ? 'Deactivate' : 'Activate'}</button>
                  <button type="button" onClick={() => handleDeleteUser(uId)} style={S.iconBtn} title="Delete User">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const S = {
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: 8 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: '#0f172a' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #94a3b8', fontSize: 13, fontWeight: 800, color: '#0f172a', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%' },
  userAddCard: { backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20 },
  addUserBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: 'pointer', height: 41 },
  cancelInlineBtn: { backgroundColor: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '8px 14px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  emptyUsersBox: { textAlign: 'center', color: '#64748b', fontSize: 14, fontWeight: 800, padding: 32, backgroundColor: '#f8fafc', borderRadius: 14, border: '2px dashed #cbd5e1' },
  userRowCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '14px 18px' },
  userAvatar: { width: 38, height: 38, borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, border: '1.5px solid #a7f3d0' },
  userCodeBadge: { backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 900, border: '1px solid #cbd5e1' },
  userToggleBtn: { backgroundColor: '#f1f5f9', color: '#0f172a', border: '1.5px solid #cbd5e1', padding: '6px 12px', borderRadius: 8, fontWeight: 900, fontSize: 11, cursor: 'pointer' },
  actionEditBtn: { background: 'none', border: 'none', color: '#2563eb', fontWeight: 900, cursor: 'pointer' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }
};