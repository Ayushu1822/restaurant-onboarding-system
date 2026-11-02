// FILE: src/components/AdvancedSettingsTab.jsx
import React, { useState, useEffect } from 'react';

const GREEN = '#10b981';
const GREEN_DARK = '#059669';
const GREEN_LIGHT = '#86e0bd';
const RED = '#ef4444';
const AMBER = '#d97706';
const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

/* ---------- small local helpers ---------- */

const card = {
  backgroundColor: '#fff',
  border: '1.5px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px'
};

const outlineBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  backgroundColor: '#fff',
  border: '1.5px solid #cbd5e1',
  borderRadius: '8px',
  padding: '7px 12px',
  fontSize: '11px',
  fontWeight: '900',
  color: '#0f172a',
  cursor: 'pointer'
};

function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      style={{
        position: 'relative',
        width: '34px',
        height: '20px',
        flexShrink: 0,
        borderRadius: '999px',
        border: 'none',
        padding: 0,
        backgroundColor: checked ? RED : '#d1d5db',
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color .15s'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '16px' : '2px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          transition: 'left .15s'
        }}
      />
    </button>
  );
}

function ToggleCard({ field, on, onToggle, value, onValueChange }) {
  const locked = !!field.required;
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '8px',
    padding: '7px 9px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
    opacity: locked || on ? 1 : 0.55
  };
  return (
    <div
      style={{
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        padding: '10px 12px',
        backgroundColor: locked ? '#f8fafc' : '#fff'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a' }}>{field.label}</div>
          {field.hint && (
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginTop: '2px' }}>{field.hint}</div>
          )}
        </div>
        {locked ? (
          <span
            style={{
              fontSize: '9px',
              fontWeight: '950',
              color: RED,
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              padding: '2px 5px'
            }}
          >
            REQUIRED
          </span>
        ) : (
          <Switch checked={on} onChange={onToggle} />
        )}
      </div>

      {field.valueKey && field.multiline && (
        <textarea
          rows={2}
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      )}
      {field.valueKey && !field.multiline && (
        <input
          type="text"
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function Radio({ name, checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#0f172a', cursor: 'pointer' }}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: RED, marginTop: '2px', cursor: 'pointer' }}
      />
      <span>{label}</span>
    </label>
  );
}

/* =====================================================================
   NOTIFICATION SOUND HELPERS (per device -> localStorage)
   ===================================================================== */

export const SOUND_STORAGE_KEY = 'foodos.notificationSound';

export const CHIMES = [
  { id: 'classic', label: 'Classic Ring', desc: 'Two-tone alert — the current default.' },
  { id: 'soft', label: 'Soft Chime', desc: 'Gentle rising three-note chime.' },
  { id: 'bell', label: 'Bell', desc: 'Bright bell-like ding.' },
  { id: 'dingdong', label: 'Ding Dong', desc: 'Classic two-note doorbell.' },
  { id: 'ping', label: 'Ping', desc: 'Short, crisp single ping.' },
  { id: 'arcade', label: 'Arcade', desc: 'Playful ascending square-wave riff.' }
];

const CHIME_NOTES = {
  classic: {
    wave: 'sine',
    partials: [[1, 1, 1], [2, 0.35, 0.6], [3, 0.15, 0.4]],
    notes: [[880, 0, 0.3], [660, 0.28, 0.5]],
    echo: 0.2
  },
  soft: {
    wave: 'sine',
    partials: [[1, 1, 1], [2, 0.25, 0.7]],
    notes: [[523.25, 0, 0.5], [659.25, 0.2, 0.5], [783.99, 0.4, 0.9]],
    echo: 0.35
  },
  bell: {
    wave: 'sine',
    partials: [[1, 1, 1], [2.76, 0.5, 0.5], [5.4, 0.3, 0.3], [8.93, 0.15, 0.2]],
    notes: [[784, 0, 1.6]],
    echo: 0.3
  },
  dingdong: {
    wave: 'sine',
    partials: [[1, 1, 1], [2.01, 0.4, 0.6], [3, 0.2, 0.4]],
    notes: [[659.25, 0, 0.7], [523.25, 0.45, 1.0]],
    echo: 0.2
  },
  ping: {
    wave: 'triangle',
    partials: [[1, 1, 1], [3, 0.3, 0.3]],
    notes: [[1318.5, 0, 0.25]],
    echo: 0.15
  },
  arcade: {
    wave: 'square',
    partials: [[1, 1, 1]],
    notes: [[392, 0, 0.12], [523.25, 0.1, 0.12], [659.25, 0.2, 0.12], [783.99, 0.3, 0.12], [1046.5, 0.4, 0.25]],
    echo: 0.1,
    lowpass: 2400
  }
};

export function getSoundSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SOUND_STORAGE_KEY) || '{}');
    return { enabled: raw.enabled ?? true, soundId: raw.soundId || 'classic' };
  } catch {
    return { enabled: true, soundId: 'classic' };
  }
}

export function saveSoundSettings(settings) {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

let audioCtx = null;

export function unlockNotificationAudio() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch {}
}

export function playNotificationChime(soundId, force = false) {
  const settings = getSoundSettings();
  if (!force && !settings.enabled) return;
  const def = CHIME_NOTES[soundId || settings.soundId] || CHIME_NOTES.classic;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const t0 = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.value = 0.9;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = def.lowpass || 6000;
    master.connect(filter);
    filter.connect(ctx.destination);

    if (def.echo) {
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.18;
      const feedback = ctx.createGain();
      feedback.gain.value = def.echo;
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      filter.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(ctx.destination);
    }

    def.notes.forEach(([freq, start, dur]) => {
      def.partials.forEach(([ratio, level, decay]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = def.wave;
        osc.frequency.value = freq * ratio;
        const begin = t0 + start;
        const end = begin + dur * decay;
        gain.gain.setValueAtTime(0.0001, begin);
        gain.gain.exponentialRampToValueAtTime(0.22 * level, begin + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.connect(gain);
        gain.connect(master);
        osc.start(begin);
        osc.stop(end + 0.05);
      });
    });
  } catch {}
}

/* ---------- receipt field definitions ---------- */

const RECEIPT_SECTIONS = [
  {
    title: 'BRANDING & BUSINESS INFORMATION',
    fields: [
      { key: 'logo', label: 'Logo', hint: 'Paste an image URL to print it', def: false, valueKey: 'logoUrl', placeholder: 'https://.../logo.png' },
      { key: 'restaurantName', label: 'Restaurant Display Name', def: true, valueKey: 'restaurantName', placeholder: 'Restaurant name' },
      { key: 'branchName', label: 'Branch Name', def: true, valueKey: 'branchName', placeholder: 'Branch name' },
      { key: 'headerText', label: 'Header Text', def: false, valueKey: 'headerText', placeholder: 'e.g. Welcome to our restaurant' },
      { key: 'address', label: 'Address', def: true, valueKey: 'address', placeholder: 'Street, city, state, PIN', multiline: true },
      { key: 'phone', label: 'Phone Number', def: true, valueKey: 'phone', placeholder: '10-digit number' },
      { key: 'email', label: 'Email', def: false, valueKey: 'email', placeholder: 'name@example.com' },
      { key: 'gstin', label: 'GST / Tax ID', hint: 'Mandatory for GST registered businesses', required: true, valueKey: 'gstin', placeholder: '15-character GSTIN' },
      { key: 'fssai', label: 'FSSAI / Regulatory Number', def: true, valueKey: 'fssai', placeholder: '14-digit FSSAI number' }
    ]
  },
  {
    title: 'ORDER INFORMATION',
    fields: [
      { key: 'invoiceNo', label: 'Invoice / Receipt Number', required: true },
      { key: 'dateAndTime', label: 'Date & Time', required: true },
      { key: 'orderId', label: 'Order ID', def: true },
      { key: 'tokenNumber', label: 'Token Number', hint: 'Shows only for Counter Orders', def: true },
      { key: 'orderType', label: 'Order Type', hint: 'e.g. Dine In, Takeaway', def: true },
      { key: 'customerName', label: 'Customer Name', hint: 'Only when customer is attached', def: false },
      { key: 'customerMobile', label: 'Customer Mobile', hint: 'Only when customer is attached', def: false }
    ]
  },
  {
    title: 'ITEMS & PRICING',
    fields: [
      { key: 'itemNameQtyAmt', label: 'Item Name / Quantity / Amount', required: true },
      { key: 'itemRate', label: 'Item Rate', def: true },
      { key: 'variants', label: 'Variants / Add-ons', def: true },
      { key: 'itemNotes', label: 'Item Notes', def: true },
      { key: 'discount', label: 'Discount', hint: 'Only when a discount exists', def: true },
      { key: 'totalTax', label: 'Total Tax', hint: 'Required on tax invoices', required: true },
      { key: 'taxBreakdown', label: 'Tax Breakdown', hint: 'CGST / SGST split', def: true }
    ]
  },
  {
    title: 'PAYMENT INFORMATION',
    fields: [
      { key: 'paymentMethod', label: 'Payment Method', def: true },
      { key: 'paymentReference', label: 'Payment Reference', def: false }
    ]
  },
  {
    title: 'FOOTER',
    fields: [
      { key: 'footerText', label: 'Footer Message', def: true, valueKey: 'footerText', placeholder: 'Thank you for visiting us!', multiline: true }
    ]
  }
];

const RULE_GROUPS = [
  { id: 'counter', title: 'Counter Orders', receiptDefault: 'auto', kotDefault: 'auto', kotAutoLabel: 'Automatically after successful payment' },
  { id: 'table', title: 'Table Orders', receiptDefault: 'demand', kotDefault: 'auto', kotAutoLabel: 'Automatically when “Done Editing” is successfully completed' },
  { id: 'takeaway', title: 'Takeaway Orders', receiptDefault: 'auto', kotDefault: 'auto', kotAutoLabel: 'Automatically after successful payment' }
];

/* =====================================================================
   SYSTEM TAB
   ===================================================================== */

const sysInput = (disabled, extra = {}) => ({
  boxSizing: 'border-box',
  padding: '9px 11px',
  fontSize: '13px',
  fontWeight: '800',
  color: disabled ? '#94a3b8' : '#0f172a',
  backgroundColor: disabled ? '#f8fafc' : '#fff',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  outline: 'none',
  fontFamily: 'inherit',
  cursor: disabled ? 'not-allowed' : 'text',
  ...extra
});

function SaveBtn({ disabled, saving, onClick, label = 'Save' }) {
  return (
    <button
      type="button"
      disabled={disabled || saving}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: disabled || saving ? GREEN_LIGHT : GREEN,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '9px 16px',
        fontSize: '12px',
        fontWeight: '950',
        cursor: disabled || saving ? 'not-allowed' : 'pointer'
      }}
    >
      💾 {saving ? 'Saving...' : label}
    </button>
  );
}

function SectionCard({ icon, title, description, sub, right, children }) {
  return (
    <div style={{ ...card, maxWidth: '760px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '950', color: '#0f172a' }}>
            <span style={{ color: GREEN_DARK, marginRight: '6px' }}>{icon}</span>
            {title}
          </div>
          {description && <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginTop: '4px' }}>{description}</div>}
          {sub && <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '700', marginTop: '3px' }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ title, hint, disabled, control, bordered = true }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 14px',
        border: bordered ? '1.5px solid #f1f5f9' : 'none',
        borderRadius: '10px',
        backgroundColor: disabled ? '#fafafa' : '#fff',
        opacity: disabled ? 0.65 : 1
      }}
    >
      <div>
        <div style={{ fontSize: '12.5px', fontWeight: '950', color: disabled ? '#94a3b8' : '#0f172a' }}>{title}</div>
        {hint && <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8', marginTop: '2px' }}>{hint}</div>}
      </div>
      {control}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ fontSize: '11px', fontWeight: '800', marginTop: '10px', color: msg.type === 'error' ? RED : GREEN_DARK }}>
      {msg.text}
    </div>
  );
}

function PasswordField({ label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '950', color: '#0f172a', marginBottom: '6px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          style={sysInput(false, { width: '100%', paddingRight: '56px' })}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '11px', fontWeight: '800', color: '#64748b', cursor: 'pointer' }}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

const clampInt = (v, min, max) => {
  const n = parseInt(String(v).replace(/\D/g, ''), 10);
  if (Number.isNaN(n)) return '';
  return Math.min(max, Math.max(min, n));
};

function SystemTab({ styles, systemSettings, branchName, onSaveAutoApprove, onSaveCounter, onChangePassword }) {
  const initAuto = {
    enabled: systemSettings?.autoApprove?.enabled ?? false,
    immediate: systemSettings?.autoApprove?.immediate ?? false,
    minutes: systemSettings?.autoApprove?.minutes ?? 1,
    seconds: systemSettings?.autoApprove?.seconds ?? 20
  };
  const [autoSaved, setAutoSaved] = useState(initAuto);
  const [auto, setAuto] = useState(initAuto);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoMsg, setAutoMsg] = useState(null);

  const initCounter = {
    allowHold: systemSettings?.counter?.allowHold ?? true,
    maxHeld: systemSettings?.counter?.maxHeld ?? 5
  };
  const [counterSaved, setCounterSaved] = useState(initCounter);
  const [counter, setCounter] = useState(initCounter);
  const [counterSaving, setCounterSaving] = useState(false);
  const [counterMsg, setCounterMsg] = useState(null);

  const [soundSaved, setSoundSaved] = useState(getSoundSettings());
  const [sound, setSound] = useState(getSoundSettings());
  const [soundMsg, setSoundMsg] = useState(null);

  /* ---------- 4. SECURITY (Two-Step Verification Flow) ---------- */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    if (!systemSettings) return;
    if (systemSettings.autoApprove) {
      const v = { ...initAuto, ...systemSettings.autoApprove };
      setAutoSaved(v);
      setAuto(v);
    }
    if (systemSettings.counter) {
      const v = { ...initCounter, ...systemSettings.counter };
      setCounterSaved(v);
      setCounter(v);
    }
  }, [systemSettings]);

  const minutesNum = Number(auto.minutes) || 0;
  const secondsNum = Number(auto.seconds) || 0;
  const totalSeconds = minutesNum * 60 + secondsNum;
  const timerInvalid = auto.enabled && !auto.immediate && totalSeconds <= 0;
  const autoDirty = JSON.stringify(auto) !== JSON.stringify(autoSaved);

  const currentLabel = !autoSaved.enabled
    ? 'Off — staff accept every order'
    : autoSaved.immediate
    ? 'On — orders are approved immediately'
    : `On — auto-approve after ${autoSaved.minutes || 0} min ${autoSaved.seconds || 0} sec`;

  const saveAuto = async () => {
    if (timerInvalid) {
      setAutoMsg({ type: 'error', text: 'Set a wait time greater than 0, or turn on "Approve immediately".' });
      return;
    }
    const payload = {
      enabled: auto.enabled,
      immediate: auto.enabled && auto.immediate,
      minutes: minutesNum,
      seconds: secondsNum
    };
    setAutoSaving(true);
    setAutoMsg(null);
    try {
      if (onSaveAutoApprove) await onSaveAutoApprove(payload);
      setAutoSaved({ ...auto, ...payload });
      setAuto({ ...auto, ...payload });
      setAutoMsg({ type: 'ok', text: 'Auto-approval settings saved.' });
    } catch (e) {
      setAutoMsg({ type: 'error', text: e?.message || 'Could not save auto-approval settings.' });
    } finally {
      setAutoSaving(false);
    }
  };

  const maxHeldNum = Number(counter.maxHeld);
  const counterInvalid = counter.allowHold && (!maxHeldNum || maxHeldNum < 1 || maxHeldNum > 20);
  const counterDirty = JSON.stringify(counter) !== JSON.stringify(counterSaved);

  const saveCounter = async () => {
    if (counterInvalid) {
      setCounterMsg({ type: 'error', text: 'Maximum held orders must be between 1 and 20.' });
      return;
    }
    const payload = { allowHold: counter.allowHold, maxHeld: maxHeldNum || counterSaved.maxHeld };
    setCounterSaving(true);
    setCounterMsg(null);
    try {
      if (onSaveCounter) await onSaveCounter(payload);
      setCounterSaved(payload);
      setCounter(payload);
      setCounterMsg({ type: 'ok', text: 'Counter ordering settings saved.' });
    } catch (e) {
      setCounterMsg({ type: 'error', text: e?.message || 'Could not save counter ordering settings.' });
    } finally {
      setCounterSaving(false);
    }
  };

  const soundDirty = JSON.stringify(sound) !== JSON.stringify(soundSaved);
  const saveSound = () => {
    saveSoundSettings(sound);
    setSoundSaved(sound);
    setSoundMsg({ type: 'ok', text: 'Sound preference saved on this device.' });
  };

  /* ----- STEP 1: Verify Current Password using Login API ----- */
  const handleVerifyCurrentPassword = async (e) => {
    e.preventDefault(); // <-- Prevents page refresh/reload
    if (!currentPw) {
      return setPwMsg({ type: 'error', text: 'Please enter your current password.' });
    }

    setPwSaving(true);
    setPwMsg(null);

    try {
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('user_email') || '';
      if (!userEmail) throw new Error('No logged-in user email found. Please login again.');

      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: currentPw })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Incorrect current password. Please try again.');
      }

      setIsVerified(true);
      setPwMsg({ type: 'ok', text: '✅ Current password verified! Now enter your new password.' });
    } catch (e) {
      setPwMsg({ type: 'error', text: e?.message || 'Password verification failed.' });
    } finally {
      setPwSaving(false);
    }
  };

  /* ----- STEP 2: Save New Password directly to DB ----- */
  const handleUpdateNewPassword = async (e) => {
    e.preventDefault(); // <-- Prevents page refresh/reload
    if (!newPw || newPw.length < 6) {
      return setPwMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
    }
    if (newPw !== confirmPw) {
      return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    }
    if (newPw === currentPw) {
      return setPwMsg({ type: 'error', text: 'New password must be different from your current password.' });
    }

    setPwSaving(true);
    setPwMsg(null);

    try {
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('user_email') || '';
      
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, currentPassword: currentPw, newPassword: newPw })
      });

      if (!res.ok) {
        if (onChangePassword) {
          await onChangePassword({ currentPassword: currentPw, newPassword: newPw });
        } else {
          throw new Error('Failed to update password in database.');
        }
      }

      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setIsVerified(false);
      setPwMsg({ type: 'ok', text: '🔐 Password successfully updated in database!' });
    } catch (e) {
      setPwMsg({ type: 'error', text: e?.message || 'Could not update password.' });
    } finally {
      setPwSaving(false);
    }
  };

  const timerDisabled = !auto.enabled || auto.immediate;

  return (
    <div style={styles.sectionGroup}>
      <h3 style={styles.sectionTitle}>⚙️ System</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* ===== 1. ORDER AUTO APPROVAL ===== */}
        <SectionCard
          icon="🕒"
          title="Order Auto Approval"
          description="When on, new online orders are approved automatically if no action is taken before the time limit. When off, every order waits for staff to accept or reject it."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SettingRow
              title="Auto-approve orders"
              hint="Applies to this branch on every device."
              control={
                <Switch
                  checked={auto.enabled}
                  onChange={() => setAuto({ ...auto, enabled: !auto.enabled, immediate: auto.enabled ? false : auto.immediate })}
                />
              }
            />
            <SettingRow
              title="Approve immediately"
              hint="No wait time — orders are accepted the moment they arrive."
              disabled={!auto.enabled}
              control={<Switch checked={auto.immediate} disabled={!auto.enabled} onChange={() => setAuto({ ...auto, immediate: !auto.immediate })} />}
            />

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginTop: '4px', opacity: timerDisabled ? 0.65 : 1 }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>Minutes</div>
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={timerDisabled}
                  value={auto.minutes}
                  onChange={(e) => setAuto({ ...auto, minutes: clampInt(e.target.value, 0, 59) })}
                  style={sysInput(timerDisabled, { width: '70px', textAlign: 'center' })}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', paddingBottom: '10px' }}>min</span>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>Seconds</div>
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={timerDisabled}
                  value={auto.seconds}
                  onChange={(e) => setAuto({ ...auto, seconds: clampInt(e.target.value, 0, 59) })}
                  style={sysInput(timerDisabled, { width: '70px', textAlign: 'center' })}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', paddingBottom: '10px' }}>sec</span>
            </div>
            {timerInvalid && (
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: AMBER }}>ⓘ Wait time must be greater than 0.</div>
            )}

            <div style={{ fontSize: '11px', fontWeight: '800', color: '#334155' }}>
              Current: <b style={{ color: '#0f172a' }}>{currentLabel}</b>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <SaveBtn disabled={!autoDirty || timerInvalid} saving={autoSaving} onClick={saveAuto} />
          </div>
          <Msg msg={autoMsg} />
        </SectionCard>

        {/* ===== 2. COUNTER ORDERING ===== */}
        <SectionCard
          icon="🏪"
          title="Counter Ordering"
          description="Configure operational controls for orders created from the Counter POS."
          sub={branchName ? `Branch: ${branchName}` : undefined}
          right={<SaveBtn label="Save Changes" disabled={!counterDirty || counterInvalid} saving={counterSaving} onClick={saveCounter} />}
        >
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '4px 14px' }}>
            <div style={{ fontSize: '10px', fontWeight: '950', color: '#64748b', padding: '12px 0 8px', borderBottom: '1px solid #f1f5f9' }}>HOLD ORDERS</div>
            <SettingRow
              bordered={false}
              title="Allow Hold Orders"
              hint="Allow cashiers to temporarily hold an incomplete Counter Order and continue serving another customer."
              control={<Switch checked={counter.allowHold} onChange={() => setCounter({ ...counter, allowHold: !counter.allowHold })} />}
            />
            <div style={{ borderTop: '1px solid #f1f5f9' }} />
            <SettingRow
              bordered={false}
              disabled={!counter.allowHold}
              title="Maximum Held Orders"
              hint="Maximum number of Counter Orders that can be held at the same time."
              control={
                <div style={{ textAlign: 'right' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={!counter.allowHold}
                    value={counter.maxHeld}
                    onChange={(e) => setCounter({ ...counter, maxHeld: clampInt(e.target.value, 0, 20) })}
                    style={sysInput(!counter.allowHold, { width: '110px' })}
                  />
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginTop: '3px' }}>Maximum 20</div>
                </div>
              }
            />
          </div>
          <Msg msg={counterMsg} />
        </SectionCard>

        {/* ===== 3. NEW ORDER NOTIFICATION SOUND ===== */}
        <SectionCard
          icon="🔔"
          title="New Order Notification Sound"
          description="Choose the chime that plays when a new online order arrives. Plays once per new order — not on a loop."
        >
          <SettingRow
            title="🔊 Play notification sound"
            hint="Mute to silence chimes on this device."
            control={<Switch checked={sound.enabled} onChange={() => setSound({ ...sound, enabled: !sound.enabled })} />}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginTop: '10px' }}>
            {CHIMES.map((c) => {
              const selected = sound.soundId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSound({ ...sound, soundId: c.id })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: `1.5px solid ${selected ? RED : '#e2e8f0'}`,
                    backgroundColor: selected ? '#fff5f5' : '#fff'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="chime"
                      checked={selected}
                      onChange={() => setSound({ ...sound, soundId: c.id })}
                      style={{ accentColor: RED, marginTop: '3px', cursor: 'pointer' }}
                    />
                    <span>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#0f172a' }}>{c.label}</span>
                      <span style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: '#94a3b8', marginTop: '2px' }}>{c.desc}</span>
                    </span>
                  </label>
                  <button
                    type="button"
                    style={outlineBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      playNotificationChime(c.id, true);
                    }}
                  >
                    ▷ Preview
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <SaveBtn disabled={!soundDirty} onClick={saveSound} />
          </div>
          <Msg msg={soundMsg} />
        </SectionCard>

        {/* ===== 4. SECURITY (Two-Step Password Verification Flow) ===== */}
        <div style={{ maxWidth: '760px' }}>
          <div style={{ fontSize: '13px', fontWeight: '950', color: '#0f172a', marginBottom: '8px' }}>Security & Password Management</div>
          <div style={card}>
            {!isVerified ? (
              /* STEP 1: Enter & Verify Current Password */
              <form onSubmit={handleVerifyCurrentPassword}>
                <PasswordField 
                  label="Enter Current (Previous) Password" 
                  value={currentPw} 
                  autoComplete="current-password" 
                  onChange={(v) => setCurrentPw(v)} 
                />
                <button
                  type="submit"
                  disabled={pwSaving}
                  style={{
                    width: '100%',
                    backgroundColor: pwSaving ? GREEN_LIGHT : GREEN,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    fontSize: '13px',
                    fontWeight: '950',
                    cursor: pwSaving ? 'not-allowed' : 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {pwSaving ? 'Verifying...' : 'Verify Current Password'}
                </button>
              </form>
            ) : (
              /* STEP 2: Unlocked New Password Fields */
              <form onSubmit={handleUpdateNewPassword}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: '#166534' }}>🔓 Current password verified successfully</span>
                  <button 
                    type="button" 
                    onClick={() => { setIsVerified(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwMsg(null); }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                </div>

                <PasswordField 
                  label="New Password" 
                  value={newPw} 
                  autoComplete="new-password" 
                  onChange={(v) => setNewPw(v)} 
                />
                <PasswordField 
                  label="Re-enter New Password" 
                  value={confirmPw} 
                  autoComplete="new-password" 
                  onChange={(v) => setConfirmPw(v)} 
                />
                <button
                  type="submit"
                  disabled={pwSaving}
                  style={{
                    width: '100%',
                    backgroundColor: pwSaving ? GREEN_LIGHT : GREEN,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    fontSize: '13px',
                    fontWeight: '950',
                    cursor: pwSaving ? 'not-allowed' : 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {pwSaving ? 'Updating Database...' : 'Save New Password'}
                </button>
              </form>
            )}
            <Msg msg={pwMsg} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function AdvancedSettingsTab({
  activeTab,
  receiptSubTab,
  setReceiptSubTab,
  formData,
  setFormData,
  toggles,
  handleToggleReceiptField,
  styles,
  sidebarItems,
  onSave,
  systemSettings,
  branchName,
  onSaveAutoApprove,
  onSaveCounter,
  onChangePassword
}) {
  const [oneClickOpen, setOneClickOpen] = useState(false);

  const printerInfo = formData.printerInfo || {};
  const receiptConfig = formData.receiptConfig || {};
  const printRules = formData.printRules || {};
  const hasPrinter = !!printerInfo.printerName;

  const printReceipt = printerInfo.printReceipt ?? true;
  const printKot = printerInfo.printKot ?? false;

  const setPrinterInfo = (patch) => setFormData({ ...formData, printerInfo: { ...printerInfo, ...patch } });
  const setReceiptConfig = (patch) => setFormData({ ...formData, receiptConfig: { ...receiptConfig, ...patch } });

  const getRule = (group, field, fallback) => printRules?.[group]?.[field] ?? fallback;
  const setRule = (group, field, value) =>
    setFormData({
      ...formData,
      printRules: { ...printRules, [group]: { ...(printRules[group] || {}), [field]: value } }
    });

  const isOn = (f) => (f.required ? true : toggles[f.key] ?? f.def);

  const density = receiptConfig.density || 'Compact';
  const paperSize = receiptConfig.paperSize || '80mm';
  const previewWidth = paperSize === '58mm' ? 230 : 300;
  const compact = density === 'Compact';

  const subTabs = [
    { id: 'printers', label: 'Printers' },
    { id: 'receipt', label: 'Receipt Configuration' },
    { id: 'rules', label: 'Print Rules' }
  ];

  const dash = <div style={{ borderTop: '1px dashed #000', margin: compact ? '4px 0' : '8px 0' }} />;
  const row = (l, r, bold) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: bold ? 'bold' : 'normal' }}>
      <span>{l}</span>
      <span>{r}</span>
    </div>
  );
  const on = (key) => isOn(RECEIPT_SECTIONS.flatMap((s) => s.fields).find((f) => f.key === key));

  return (
    <>
      {/* TAB 8: PRINTERS & RECEIPTS */}
      {activeTab === 'printers' && (
        <div style={styles.sectionGroup}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ ...styles.sectionTitle, margin: 0 }}>🖨️ Printers & Receipts</h3>
            <button
              type="button"
              onClick={() => (onSave ? onSave() : alert('Settings saved'))}
              style={{ backgroundColor: GREEN, color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '12px', fontWeight: '950', cursor: 'pointer' }}
            >
              💾 Save Changes
            </button>
          </div>

          <div
            style={{
              display: 'inline-flex',
              gap: '2px',
              padding: '3px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              backgroundColor: '#fff',
              marginBottom: '20px'
            }}
          >
            {subTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setReceiptSubTab(t.id)}
                style={{
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  backgroundColor: receiptSubTab === t.id ? RED : 'transparent',
                  color: receiptSubTab === t.id ? '#fff' : '#0f172a'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {receiptSubTab === 'printers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>🖨️</span>
                  <div>
                    <div style={{ fontWeight: '950', color: '#0f172a', fontSize: '13px', marginBottom: '3px' }}>Printing from this device</div>
                    <div style={{ fontSize: '11px', color: GREEN_DARK, fontWeight: '900', marginBottom: '4px' }}>● Direct thermal printing supported</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                      USB · Serial / Bluetooth · Bluetooth (BLE) · Network (Epson ePOS) — connect a printer below for silent printing. Nothing to install.
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => alert('Refreshing connected printers...')} style={{ ...outlineBtn, flexShrink: 0 }}>
                  🔄 Refresh printers
                </button>
              </div>

              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setOneClickOpen(!oneClickOpen)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: RED }}>⚡</span>
                    <div>
                      <div style={{ fontWeight: '950', fontSize: '13px', color: '#0f172a' }}>One-click printing — any printer, nothing to install</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                        Open FoodOS from a special Chrome shortcut and every receipt prints straight to this computer's default printer, with no print window.
                      </div>
                    </div>
                  </div>
                  <span style={{ color: '#64748b', transform: oneClickOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>⌄</span>
                </button>
                {oneClickOpen && (
                  <div style={{ padding: '0 18px 16px 62px', fontSize: '11px', color: '#475569', fontWeight: '700', lineHeight: 1.6 }}>
                    1. Close all Chrome windows.<br />
                    2. Create a Chrome shortcut with the <code>--kiosk-printing</code> flag.<br />
                    3. Open the app from that shortcut — receipts will print silently to the default printer.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                <div style={{ ...card, flex: '1 1 340px', maxWidth: '440px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '950', color: '#0f172a' }}>🖨️ Counter Printer</div>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', margin: '4px 0 12px' }}>
                    Used for customer receipts and optionally KOT printing.
                  </p>

                  {!hasPrinter && (
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '10.5px', color: '#64748b', fontWeight: '700', marginBottom: '14px' }}>
                      ⓘ No printer saved yet, so Print buttons use <b style={{ color: '#0f172a' }}>this computer's installed printer</b> through the browser — that's why printing works. Choose it below to save it here (needed for automatic prints), or connect a printer for silent printing.
                    </div>
                  )}

                  <label style={styles.label}>Printer</label>
                  <select
                    style={styles.input}
                    value={printerInfo.printerName || ''}
                    onChange={(e) => setPrinterInfo({ printerName: e.target.value })}
                  >
                    <option value="">Select Printer</option>
                    <option value="System-Default">Default System Printer</option>
                    <option value="Thermal-80mm">Thermal 80mm USB</option>
                    <option value="Thermal-58mm">Thermal 58mm USB</option>
                  </select>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0 8px' }}>
                    <button type="button" style={outlineBtn} onClick={() => alert('Connect USB printer')}>🔌 Connect USB printer</button>
                    <button type="button" style={outlineBtn} onClick={() => alert('Connect serial / Bluetooth (classic)')}>📶 Connect serial / Bluetooth (classic)</button>
                    <button type="button" style={outlineBtn} onClick={() => alert('Connect Bluetooth (BLE)')}>🔵 Connect Bluetooth (BLE)</button>
                    <button type="button" style={outlineBtn} onClick={() => alert('Add network printer')}>🌐 Add network printer</button>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginBottom: '14px' }}>
                    The browser can't list this computer's installed printers by name. Choose "This computer's printer (via browser)" to use them, or connect a USB, serial or network printer above.
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: '950', color: '#0f172a', marginBottom: '8px' }}>Documents</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', marginBottom: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={printReceipt} onChange={() => setPrinterInfo({ printReceipt: !printReceipt })} style={{ ...styles.checkbox, accentColor: RED }} />
                    Print Receipt
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                    <input type="checkbox" checked={printKot} onChange={() => setPrinterInfo({ printKot: !printKot })} style={{ ...styles.checkbox, accentColor: RED }} />
                    Print KOT
                  </label>
                </div>

                <div style={{ ...card, flex: '1 1 340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '260px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>👨‍🍳</div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '950', color: '#0f172a' }}>Kitchen Printer</h4>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>No Kitchen Printer configured.</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginBottom: '14px' }}>
                    Optional — a single Counter Printer can print both receipts and KOTs.
                  </div>
                  <button type="button" style={outlineBtn} onClick={() => alert('Configure Kitchen Printer')}>＋ Configure Kitchen Printer</button>
                </div>
              </div>
            </div>
          )}

          {receiptSubTab === 'receipt' && (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ ...card, flex: '1 1 520px', maxWidth: '720px', backgroundColor: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: '950', color: '#64748b', marginBottom: '8px' }}>RECEIPT DENSITY</div>
                <div style={{ display: 'inline-flex', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {['Compact', 'Comfortable'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setReceiptConfig({ density: d })}
                      style={{
                        border: 'none',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        backgroundColor: density === d ? RED : '#fff',
                        color: density === d ? '#fff' : '#334155'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', margin: '6px 0 18px' }}>
                  Only changes spacing and size — not which details are printed.
                </div>

                {RECEIPT_SECTIONS.map((section) => (
                  <div key={section.title} style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '950', color: '#64748b', marginBottom: '10px' }}>{section.title}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                      {section.fields.map((f) => (
                        <ToggleCard
                          key={f.key}
                          field={f}
                          on={isOn(f)}
                          onToggle={() => handleToggleReceiptField(f.key)}
                          value={f.valueKey ? receiptConfig[f.valueKey] : undefined}
                          onValueChange={f.valueKey ? (v) => setReceiptConfig({ [f.valueKey]: v }) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...card, width: '380px', maxWidth: '100%', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '950', color: '#0f172a' }}>Live Preview</h4>
                  <div style={{ display: 'inline-flex', gap: '2px', padding: '2px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                    {['58mm', '80mm'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setReceiptConfig({ paperSize: p })}
                        style={{
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '900',
                          cursor: 'pointer',
                          backgroundColor: paperSize === p ? RED : 'transparent',
                          color: paperSize === p ? '#fff' : '#334155'
                        }}
                      >
                        {p.replace('mm', ' mm')}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px', display: 'flex', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: previewWidth + 'px',
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,.12)',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: compact ? '9px' : '10.5px',
                      lineHeight: compact ? 1.35 : 1.7,
                      color: '#000',
                      textAlign: 'left'
                    }}
                  >
                    {on('logo') && receiptConfig.logoUrl && (
                      <div style={{ textAlign: 'center', margin: '4px 0' }}>
                        <img src={receiptConfig.logoUrl} alt="logo" style={{ maxWidth: '60%', maxHeight: '50px', filter: 'grayscale(1)' }} />
                      </div>
                    )}
                    {on('headerText') && receiptConfig.headerText && <div style={{ textAlign: 'center' }}>{receiptConfig.headerText}</div>}
                    {on('restaurantName') && <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2em' }}>{(receiptConfig.restaurantName || 'RESTAURANT NAME').toUpperCase()}</div>}
                    {on('branchName') && <div style={{ textAlign: 'center' }}>{receiptConfig.branchName || 'Branch name'}</div>}
                    {on('address') && <div style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{receiptConfig.address || 'Address line, City, State'}</div>}
                    {on('phone') && <div style={{ textAlign: 'center' }}>Ph: {receiptConfig.phone || '0000000000'}</div>}
                    {on('email') && <div style={{ textAlign: 'center' }}>{receiptConfig.email || 'name@example.com'}</div>}
                    {on('gstin') && <div style={{ textAlign: 'center' }}>GSTIN: {receiptConfig.gstin || '00AAAAA0000A1Z5'}</div>}
                    {on('fssai') && <div style={{ textAlign: 'center' }}>FSSAI: {receiptConfig.fssai || '00000000000000'}</div>}
                    {dash}
                    {on('tokenNumber') && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9em' }}>TOKEN</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.8em' }}>000724</div>
                      </div>
                    )}
                    {on('invoiceNo') && <div>Receipt No: INV-000724</div>}
                    {on('orderId') && <div>Order: ORD-000724</div>}
                    {on('orderType') && <div>Takeaway</div>}
                    {on('dateAndTime') && <div>29 Oct 2026, 8:10 am</div>}
                    {on('customerName') && <div>Customer: Guest</div>}
                    {on('customerMobile') && <div>Mobile: 9XXXXXXXXX</div>}
                    {dash}
                    {on('itemNameQtyAmt') && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>Item</span>
                          <span>{on('itemRate') ? 'Qty  Rate  Amount' : 'Qty  Amount'}</span>
                        </div>
                        {row('Test Burger', on('itemRate') ? '2  ₹300.00  ₹620.00' : '2  ₹620.00')}
                        {on('variants') && <div>&nbsp;+ Extra Cheese x1 ₹20.00</div>}
                        {on('itemNotes') && <div>&nbsp;Less spicy</div>}
                        {row('Test Cola', on('itemRate') ? '1  ₹70.00  ₹70.00' : '1  ₹70.00')}
                      </div>
                    )}
                    {dash}
                    {row('Subtotal', '₹690.00')}
                    {on('discount') && row('Discount', '-₹50.00')}
                    {on('totalTax') && !on('taxBreakdown') && row('Total Tax', '₹29.50')}
                    {on('totalTax') && on('taxBreakdown') && (
                      <>
                        {row('CGST 2.5%', '₹14.75')}
                        {row('SGST 2.5%', '₹14.75')}
                      </>
                    )}
                    {row('TOTAL', '₹669.50', true)}
                    {dash}
                    {on('paymentMethod') && <div>Paid by Card</div>}
                    {on('paymentReference') && <div>Ref: TXN123456</div>}
                    {on('footerText') && (
                      <div style={{ textAlign: 'center', marginTop: '6px', whiteSpace: 'pre-line' }}>
                        {receiptConfig.footerText || 'Thank you for visiting us!'}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!hasPrinter}
                  onClick={() => alert('Sending test print...')}
                  style={{ ...outlineBtn, width: '100%', marginTop: '14px', padding: '9px', opacity: hasPrinter ? 1 : 0.55, cursor: hasPrinter ? 'pointer' : 'not-allowed' }}
                >
                  🖨️ Test Print
                </button>
                {!hasPrinter && <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginTop: '6px' }}>Configure a Counter Printer first.</div>}
              </div>
            </div>
          )}

          {receiptSubTab === 'rules' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'start' }}>
                {RULE_GROUPS.map((g) => {
                  const receipt = getRule(g.id, 'receipt', g.receiptDefault);
                  const kot = getRule(g.id, 'kot', g.kotDefault);
                  const warn = !hasPrinter && (
                    <div style={{ fontSize: '10px', fontWeight: '800', color: AMBER, margin: '8px 0 0' }}>
                      ⓘ No printer is set up for this — nothing will auto-print.
                    </div>
                  );
                  return (
                    <div key={g.id} style={card}>
                      <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '950', color: '#0f172a' }}>{g.title}</h4>

                      <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>When should the Receipt print?</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Radio name={g.id + 'Receipt'} checked={receipt === 'auto'} onChange={() => setRule(g.id, 'receipt', 'auto')} label="Automatically after successful payment" />
                        <Radio name={g.id + 'Receipt'} checked={receipt === 'demand'} onChange={() => setRule(g.id, 'receipt', 'demand')} label="On Demand" />
                      </div>
                      {warn}

                      <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', margin: '18px 0 8px' }}>When should the KOT print?</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Radio name={g.id + 'Kot'} checked={kot === 'auto'} onChange={() => setRule(g.id, 'kot', 'auto')} label={g.kotAutoLabel} />
                        <Radio name={g.id + 'Kot'} checked={kot === 'demand'} onChange={() => setRule(g.id, 'kot', 'demand')} label="On Demand" />
                      </div>
                      {warn}

                      {g.id === 'table' && (
                        <div style={{ marginTop: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>
                          ⓘ For Table Orders, subsequent KOTs contain only items or quantities added since the previous KOT.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginTop: '14px' }}>
                “On Demand” documents are printed from the Print buttons on each order.
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'system' && (
        <SystemTab
          styles={styles}
          systemSettings={systemSettings}
          branchName={branchName}
          onSaveAutoApprove={onSaveAutoApprove}
          onSaveCounter={onSaveCounter}
          onChangePassword={onChangePassword}
        />
      )}
    </>
  );
}