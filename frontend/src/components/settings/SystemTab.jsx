// FILE: src/components/settings/SystemTab.jsx
import React, { useState } from 'react';

export default function SystemTab() {
  const [autoApproval, setAutoApproval] = useState({
    enabled: false,
    approveImmediately: false,
    minutes: '01',
    seconds: '20'
  });

  const [counterOrdering, setCounterOrdering] = useState({
    allowHoldOrders: true,
    maxHeldOrders: 5
  });

  const [notificationSound, setNotificationSound] = useState({
    enabled: true,
    selectedTone: 'Classic Ring'
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords] = useState({ current: false, new: false, confirm: false });

  // 10-Second Rich Real Chime / Melodic Audio Generator (Web Audio API)
  const playSoundTone = (toneName) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const duration = 9.0;

      if (toneName === 'Classic Ring') {
        for (let i = 0; i < 6; i++) {
          const startTime = now + (i * 1.5);
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc1.type = 'square';
          osc2.type = 'sawtooth';
          osc1.frequency.setValueAtTime(880, startTime);
          osc2.frequency.setValueAtTime(1320, startTime);

          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);

          osc1.start(startTime);
          osc2.start(startTime);
          osc1.stop(startTime + 1.2);
          osc2.stop(startTime + 1.2);
        }
      } else if (toneName === 'Soft Chime') {
        const chords = [
          [523.25, 659.25, 783.99],
          [587.33, 698.46, 880.00],
          [659.25, 783.99, 987.77]
        ];
        chords.forEach((chord, round) => {
          chord.forEach((freq, noteIdx) => {
            const startTime = now + (round * 3.0) + (noteIdx * 0.3);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + 2.5);
          });
        });
      } else if (toneName === 'Ding Dong') {
        for (let i = 0; i < 4; i++) {
          const startTime = now + (i * 2.2);
          [587.33, 440].forEach((freq, idx) => {
            const noteTime = startTime + (idx * 0.6);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);
            gain.gain.setValueAtTime(0.2, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(noteTime);
            osc.stop(noteTime + 1.5);
          });
        }
      } else {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + duration);
      }
    } catch (e) {
      console.log("Audio preview error:", e);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!securityForm.currentPassword || !securityForm.newPassword) {
      return alert('Please fill in current and new password');
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return alert('New passwords do not match!');
    }
    alert('Password updated successfully!');
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div style={S.sectionGroup}>
      <h3 style={S.sectionTitle}>⚙️ System & Operational Configurations</h3>

      <div style={S.systemCard}>
        <h4 style={{margin: '0 0 6px 0', fontSize: 16, fontWeight: 900, color: '#0f172a'}}>🕒 Order Auto Approval</h4>
        <p style={{margin: '0 0 16px 0', fontSize: 12, color: '#64748b', fontWeight: 800}}>When on, new online orders are approved automatically if no action is taken before the time limit.</p>
        
        <div style={S.sysToggleRow}>
          <div>
            <strong style={{fontSize: 14, color: '#0f172a'}}>Auto-approve orders</strong>
            <div style={{fontSize: 11, color: '#64748b', fontWeight: 800}}>Applies to this branch on every device.</div>
          </div>
          <input type="checkbox" checked={autoApproval.enabled} onChange={e => setAutoApproval({...autoApproval, enabled: e.target.checked})} style={S.checkbox} />
        </div>

        <div style={S.sysToggleRow}>
          <div>
            <strong style={{fontSize: 14, color: '#0f172a'}}>Approve immediately</strong>
            <div style={{fontSize: 11, color: '#64748b', fontWeight: 800}}>No wait time — orders are accepted the moment they arrive.</div>
          </div>
          <input type="checkbox" checked={autoApproval.approveImmediately} onChange={e => setAutoApproval({...autoApproval, approveImmediately: e.target.checked})} style={S.checkbox} />
        </div>

        <div style={{display: 'flex', gap: 12, marginTop: 14}}>
          <div style={S.timeBox}>
            <input type="text" value={autoApproval.minutes} onChange={e => setAutoApproval({...autoApproval, minutes: e.target.value})} style={S.timeField} /> min
          </div>
          <div style={S.timeBox}>
            <input type="text" value={autoApproval.seconds} onChange={e => setAutoApproval({...autoApproval, seconds: e.target.value})} style={S.timeField} /> sec
          </div>
        </div>
      </div>

      <div style={S.systemCard}>
        <h4 style={{margin: '0 0 6px 0', fontSize: 16, fontWeight: 900, color: '#0f172a'}}>🛒 Counter Ordering & Hold Orders</h4>
        <p style={{margin: '0 0 16px 0', fontSize: 12, color: '#64748b', fontWeight: 800}}>Configure operational controls for orders created from the Counter POS.</p>
        
        <div style={S.sysToggleRow}>
          <div>
            <strong style={{fontSize: 14, color: '#0f172a'}}>Allow Hold Orders</strong>
            <div style={{fontSize: 11, color: '#64748b', fontWeight: 800}}>Allow cashiers to temporarily hold an incomplete Counter Order.</div>
          </div>
          <input type="checkbox" checked={counterOrdering.allowHoldOrders} onChange={e => setCounterOrdering({...counterOrdering, allowHoldOrders: e.target.checked})} style={S.checkbox} />
        </div>

        <div style={{marginTop: 14, maxWidth: 280}}>
          <label style={S.label}>Maximum Held Orders</label>
          <input type="number" max="20" value={counterOrdering.maxHeldOrders} onChange={e => setCounterOrdering({...counterOrdering, maxHeldOrders: Number(e.target.value)})} style={S.input} />
        </div>
      </div>

      <div style={S.systemCard}>
        <h4 style={{margin: '0 0 6px 0', fontSize: 16, fontWeight: 900, color: '#0f172a'}}>🔔 New Order Notification Sound</h4>
        <p style={{margin: '0 0 16px 0', fontSize: 12, color: '#64748b', fontWeight: 800}}>Choose the chime that plays when a new online order arrives.</p>

        <div style={S.sysToggleRow}>
          <div>
            <strong style={{fontSize: 14, color: '#0f172a'}}>Play notification sound</strong>
            <div style={{fontSize: 11, color: '#64748b', fontWeight: 800}}>Mute to silence chimes on this device.</div>
          </div>
          <input type="checkbox" checked={notificationSound.enabled} onChange={e => setNotificationSound({...notificationSound, enabled: e.target.checked})} style={S.checkbox} />
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginTop: 14}}>
          {['Classic Ring', 'Soft Chime', 'Bell', 'Ding Dong', 'Ping', 'Arcade'].map(tone => (
            <div 
              key={tone} 
              onClick={() => setNotificationSound({...notificationSound, selectedTone: tone})}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                backgroundColor: notificationSound.selectedTone === tone ? '#fef2f2' : '#f8fafc',
                border: notificationSound.selectedTone === tone ? '2px solid #ef4444' : '1.5px solid #cbd5e1'
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <input type="radio" checked={notificationSound.selectedTone === tone} readOnly />
                <strong style={{fontSize: 13, color: '#0f172a'}}>{tone}</strong>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); playSoundTone(tone); }} style={S.previewBtn}>▶ Preview</button>
            </div>
          ))}
        </div>
      </div>

      <div style={S.systemCard}>
        <h4 style={{margin: '0 0 16px 0', fontSize: 16, fontWeight: 900, color: '#0f172a'}}>🔒 Security & Password</h4>
        <form onSubmit={handleUpdatePassword} style={{display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420}}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Current Password</label>
            <input type={showPasswords.current ? 'text' : 'password'} value={securityForm.currentPassword} onChange={e => setSecurityForm({...securityForm, currentPassword: e.target.value})} style={S.input} />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>New Password</label>
            <input type={showPasswords.new ? 'text' : 'password'} value={securityForm.newPassword} onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})} style={S.input} />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Re-enter New Password</label>
            <input type={showPasswords.confirm ? 'text' : 'password'} value={securityForm.confirmPassword} onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})} style={S.input} />
          </div>
          <button type="submit" style={S.updatePassBtn}>Update Password</button>
        </form>
      </div>
    </div>
  );
}

const S = {
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: 8 },
  systemCard: { backgroundColor: '#fff', border: '1.5px solid #cbd5e1', borderRadius: 16, padding: 24, marginBottom: 20 },
  sysToggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
  checkbox: { width: 20, height: 20, cursor: 'pointer', accentColor: '#059669' },
  timeBox: { display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', padding: '6px 12px', borderRadius: 8, fontWeight: 900 },
  timeField: { width: 30, border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 900, outline: 'none' },
  label: { fontSize: 12, fontWeight: 900, color: '#0f172a', marginBottom: 6, display: 'block' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #94a3b8', fontSize: 13, fontWeight: 800, color: '#0f172a', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%' },
  previewBtn: { backgroundColor: '#fff', border: '1.5px solid #cbd5e1', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 900, cursor: 'pointer' },
  updatePassBtn: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: 'pointer', marginTop: 6 }
};