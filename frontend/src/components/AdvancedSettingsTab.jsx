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

/* =====================================================================
   PRINTER CONNECTION + ESC/POS RECEIPT
   ===================================================================== */

let conn = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const isPrinterConnected = () => !!conn;
export const getPrinterStatus = () =>
  conn ? { connected: true, type: conn.type, name: conn.name } : { connected: false };

export async function disconnectPrinter() {
  if (!conn) return;
  const c = conn;
  conn = null;
  try {
    await c.close();
  } catch {}
}

export async function connectSerial(baudRate = 9600) {
  if (!navigator.serial) throw new Error('Serial printing is not supported here. Use Chrome or Edge.');
  const port = await navigator.serial.requestPort();
  await disconnectPrinter();
  await port.open({ baudRate });
  const writer = port.writable.getWriter();
  conn = {
    type: 'Serial / Bluetooth',
    name: 'Serial printer',
    write: async (bytes) => { await writer.write(bytes); },
    close: async () => {
      try { writer.releaseLock(); } catch {}
      await port.close();
    }
  };
  return conn.name;
}

export async function connectUsb() {
  if (!navigator.usb) throw new Error('USB printing is not supported here. Use Chrome or Edge.');
  const device = await navigator.usb.requestDevice({ filters: [] });
  await disconnectPrinter();
  await device.open();
  if (device.configuration === null) await device.selectConfiguration(1);

  const find = (printerClassOnly) => {
    for (const i of device.configuration.interfaces) {
      for (const alt of i.alternates) {
        if (printerClassOnly && alt.interfaceClass !== 7) continue;
        const out = alt.endpoints.find((e) => e.direction === 'out' && e.type === 'bulk');
        if (out) return { num: i.interfaceNumber, ep: out.endpointNumber };
      }
    }
    return null;
  };
  const found = find(true) || find(false);
  if (!found) {
    await device.close();
    throw new Error('This USB device has no printable endpoint.');
  }
  try {
    await device.claimInterface(found.num);
  } catch (e) {
    await device.close().catch(() => {});
    throw new Error('Windows is using this printer with its own driver.');
  }
  conn = {
    type: 'USB',
    name: device.productName || 'USB printer',
    write: async (bytes) => {
      for (let i = 0; i < bytes.length; i += 4096) {
        await device.transferOut(found.ep, bytes.slice(i, i + 4096));
      }
    },
    close: async () => {
      try { await device.releaseInterface(found.num); } catch {}
      await device.close();
    }
  };
  return conn.name;
}

const BLE_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455'
];

export async function connectBluetooth() {
  if (!navigator.bluetooth) throw new Error('Bluetooth printing is not supported here. Use Chrome or Edge.');
  const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: BLE_SERVICES });
  await disconnectPrinter();
  const server = await device.gatt.connect();
  let ch = null;
  const services = await server.getPrimaryServices();
  for (const s of services) {
    const chars = await s.getCharacteristics();
    ch = chars.find((c) => c.properties.writeWithoutResponse || c.properties.write);
    if (ch) break;
  }
  if (!ch) {
    server.disconnect();
    throw new Error('Could not find a writable printer channel on this Bluetooth device.');
  }
  const noResponse = !!ch.properties.writeWithoutResponse;
  conn = {
    type: 'Bluetooth (BLE)',
    name: device.name || 'Bluetooth printer',
    write: async (bytes) => {
      for (let i = 0; i < bytes.length; i += 100) {
        const chunk = bytes.slice(i, i + 100);
        if (noResponse) await ch.writeValueWithoutResponse(chunk);
        else await ch.writeValue(chunk);
        await sleep(20);
      }
    },
    close: async () => {
      if (device.gatt.connected) device.gatt.disconnect();
    }
  };
  return conn.name;
}

const clean = (s) => String(s ?? '').replace(/₹/g, 'Rs.').replace(/[^\x20-\x7E]/g, '?');

function makeDoc(width) {
  const out = [];
  const plain = [];
  const raw = (...b) => out.push(...b);

  const line = (s = '') => {
    const c = clean(s);
    for (let i = 0; i < c.length; i++) out.push(c.charCodeAt(i));
    out.push(0x0a);
    plain.push(c);
  };

  const wrap = (s, w = width) => {
    String(s ?? '')
      .split('\n')
      .forEach((para) => {
        let cur = '';
        clean(para)
          .split(/\s+/)
          .filter(Boolean)
          .forEach((word0) => {
            let word = word0;
            while (word.length > w) {
              if (cur) {
                line(cur);
                cur = '';
              }
              line(word.slice(0, w));
              word = word.slice(w);
            }
            if (!cur) cur = word;
            else if ((cur + ' ' + word).length <= w) cur += ' ' + word;
            else {
              line(cur);
              cur = word;
            }
          });
        line(cur);
      });
  };

  const lr = (l0, r0) => {
    let l = clean(l0);
    const r = clean(r0);
    if (l.length + r.length + 1 > width) l = l.slice(0, Math.max(1, width - r.length - 1));
    line(l + ' '.repeat(Math.max(1, width - l.length - r.length)) + r);
  };

  return {
    init: () => raw(0x1b, 0x40),
    align: (n) => raw(0x1b, 0x61, n),
    bold: (isOn) => raw(0x1b, 0x45, isOn ? 1 : 0),
    line,
    wrap,
    lr,
    rule: () => line('-'.repeat(width)),
    cut: () => raw(0x0a, 0x0a, 0x0a, 0x1d, 0x56, 0x42, 0x00),
    done: () => ({ bytes: new Uint8Array(out), plain: plain.join('\n') })
  };
}

export function buildReceipt(o, cfg = {}) {
  const t = cfg.toggles || {};
  const flag = (k, d = true) => (t[k] !== undefined ? t[k] : d);
  const money = (v) => 'Rs.' + Number(v || 0).toFixed(2);
  const width = cfg.paperSize === '58mm' ? 32 : 48;
  const d = makeDoc(width);

  d.init();
  d.align(1);
  if (flag('headerText', false) && cfg.headerText) d.wrap(cfg.headerText);
  if (flag('restaurantName')) {
    d.bold(true);
    d.wrap((cfg.restaurantName || 'RESTAURANT').toUpperCase());
    d.bold(false);
  }
  if (flag('branchName') && cfg.branchName) d.wrap(cfg.branchName);
  if (flag('address') && cfg.address) d.wrap(cfg.address);
  if (flag('phone') && cfg.phone) d.line('Ph: ' + cfg.phone);
  if (flag('email', false) && cfg.email) d.line(cfg.email);
  if (flag('gstin') && cfg.gstin) d.line('GSTIN: ' + cfg.gstin);
  if (flag('fssai') && cfg.fssai) d.line(cfg.fssai);
  d.align(0);
  d.rule();

  if (flag('tokenNumber') && o.token) {
    d.align(1);
    d.bold(true);
    d.line('TOKEN: #' + o.token);
    d.bold(false);
    d.align(0);
  }
  if (flag('invoiceNo')) d.line('Receipt: ' + (o.id || ''));
  if (flag('orderType') && o.type) d.line('Type: ' + o.type);
  if (flag('dateAndTime')) d.line('Date: ' + (o.timestamp || ''));
  if (flag('customerName') && o.customer) d.line('Customer: ' + o.customer);
  if (flag('customerMobile') && o.phone) d.line('Mobile: ' + o.phone);
  if (o.note) d.wrap('Note: ' + o.note);
  d.rule();

  (o.items || []).forEach((it) => {
    d.lr(`${it.qty}x ${it.name}`, money(it.price * it.qty));
    if (flag('itemRate')) d.line(`    @ ${money(it.price)}` + (it.taxRate ? ` (${it.taxRate}% tax)` : ''));
    if (flag('itemNotes') && it.note) d.wrap('    * ' + it.note);
  });
  d.rule();

  d.lr('Subtotal', money(o.subtotal));
  if (flag('discount') && o.discount) d.lr('Discount', '-' + money(o.discount));
  if (flag('totalTax')) {
    if (flag('taxBreakdown')) {
      d.lr('CGST', money((o.totalTax || 0) / 2));
      d.lr('SGST', money((o.totalTax || 0) / 2));
    } else {
      d.lr('Total Tax', money(o.totalTax));
    }
  }
  d.bold(true);
  d.lr('TOTAL', money(o.total));
  d.bold(false);
  d.rule();

  if (flag('paymentMethod') && o.paymentMethod) d.line('Payment: ' + o.paymentMethod);
  if (flag('footerText') && cfg.footerText) {
    d.align(1);
    d.wrap(cfg.footerText);
  }
  d.cut();
  return d.done();
}

export async function sendReceiptToPrinter(order, cfg) {
  if (!conn) return false;
  try {
    await conn.write(buildReceipt(order, cfg).bytes);
    return true;
  } catch (e) {
    console.warn('Printer write failed:', e);
    conn = null;
    return false;
  }
}

export async function testPrint(cfg) {
  const sample = {
    id: 'TEST-001',
    timestamp: new Date().toLocaleString('en-IN'),
    type: 'Takeaway',
    customer: 'Test Guest',
    phone: '9999999999',
    token: 101,
    note: 'Test print',
    items: [
      { name: 'Test Burger', qty: 2, price: 150, taxRate: 5, note: 'Less spicy' },
      { name: 'Test Cola', qty: 1, price: 70, taxRate: 5 }
    ],
    subtotal: 370,
    totalTax: 18.5,
    total: 388.5,
    paymentMethod: 'UPI'
  };
  const { bytes, plain } = buildReceipt(sample, cfg);
  if (!conn) {
    console.log(plain);
    return { printed: false, plain };
  }
  await conn.write(bytes);
  return { printed: true, plain };
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

const clampInt = (v, min, max) => {
  const n = parseInt(String(v).replace(/\D/g, ''), 10);
  if (Number.isNaN(n)) return '';
  return Math.min(max, Math.max(min, n));
};

function SystemTab({ styles, systemSettings, branchName, onSaveAutoApprove, onSaveCounter }) {
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

        {/* ===== 4. SECURITY & PASSWORD MANAGEMENT ===== */}
        <div style={{ maxWidth: '760px' }}>
          <div style={{ fontSize: '13px', fontWeight: '950', color: '#0f172a', marginBottom: '8px' }}>Security & Password Management</div>
          <div style={card}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '14px', lineHeight: 1.5 }}>
              Need to change or reset your account password? Click below to go to the password recovery screen.
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('userEmail');
                window.location.reload();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                backgroundColor: RED,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: '950',
                cursor: 'pointer'
              }}
            >
              🔐 Reset Password
            </button>
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
  onSaveCounter
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

  const [printerStatus, setPrinterStatus] = useState(getPrinterStatus());
  const [printerMsg, setPrinterMsg] = useState(null);

  const connectWith = async (fn) => {
    setPrinterMsg(null);
    try {
      const name = await fn();
      setPrinterStatus(getPrinterStatus());
      setPrinterInfo({ printerName: name });
      setPrinterMsg({ type: 'ok', text: `Connected: ${name}` });
    } catch (e) {
      setPrinterMsg({ type: 'error', text: e?.name === 'NotFoundError' ? 'No device selected.' : e?.message || 'Could not connect.' });
    }
  };

  const handleTestPrint = async () => {
    setPrinterMsg(null);
    try {
      const r = await testPrint(receiptConfig);
      setPrinterMsg(
        r.printed
          ? { type: 'ok', text: 'Test receipt sent to the printer.' }
          : { type: 'error', text: 'No printer is connected. A text preview was written to the browser console (F12).' }
      );
    } catch (e) {
      setPrinterMsg({ type: 'error', text: e?.message || 'Test print failed.' });
    }
  };

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

  const knownPrinterNames = ['System-Default', 'Thermal-80mm', 'Thermal-58mm'];

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
                <button type="button" onClick={() => setPrinterStatus(getPrinterStatus())} style={{ ...outlineBtn, flexShrink: 0 }}>
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
                    {printerInfo.printerName && !knownPrinterNames.includes(printerInfo.printerName) && (
                      <option value={printerInfo.printerName}>{printerInfo.printerName}</option>
                    )}
                  </select>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0 8px' }}>
                    <button type="button" style={outlineBtn} onClick={() => connectWith(connectUsb)}>🔌 Connect USB printer</button>
                    <button type="button" style={outlineBtn} onClick={() => connectWith(connectSerial)}>📶 Connect serial / Bluetooth (classic)</button>
                    <button type="button" style={outlineBtn} onClick={() => connectWith(connectBluetooth)}>🔵 Connect Bluetooth (BLE)</button>
                    <button type="button" style={outlineBtn} onClick={() => alert('Network printers need a small print service on the backend. Not available yet.')}>🌐 Add network printer</button>
                  </div>
                  {printerStatus.connected ? (
                    <div style={{ fontSize: '11px', fontWeight: '800', color: GREEN_DARK, marginBottom: '8px' }}>
                      ● Connected: {printerStatus.name} ({printerStatus.type}){' '}
                      <button
                        type="button"
                        onClick={async () => {
                          await disconnectPrinter();
                          setPrinterStatus(getPrinterStatus());
                        }}
                        style={{ background: 'none', border: 'none', color: RED, fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : hasPrinter ? (
                    <div style={{ fontSize: '11px', fontWeight: '800', color: AMBER, marginBottom: '8px' }}>
                      ⓘ Saved printer "{printerInfo.printerName}" is not connected on this device. Click a Connect button again.
                    </div>
                  ) : null}
                  <Msg msg={printerMsg} />
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', margin: '10px 0 14px' }}>
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
                  <button type="button" style={outlineBtn} onClick={() => alert('Kitchen printer setup is not available yet.')}>＋ Configure Kitchen Printer</button>
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
                        {on('variants') && <div> + Extra Cheese x1 ₹20.00</div>}
                        {on('itemNotes') && <div> Less spicy</div>}
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
                  onClick={handleTestPrint}
                  style={{ ...outlineBtn, width: '100%', marginTop: '14px', padding: '9px' }}
                >
                  🖨️ Test Print
                </button>
                {!printerStatus.connected && (
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginTop: '6px' }}>
                    No printer connected: a text preview goes to the browser console (F12).
                  </div>
                )}
                <Msg msg={printerMsg} />
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
        />
      )}
    </>
  );
}