// FILE: src/components/AdvancedSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

/* Flame palette: bright orange primary, red-orange accent, warm cream surfaces.
   RED is kept only for danger / errors / required badges. */
const BRAND = '#f97316';
const BRAND_DARK = '#ea580c';
const BRAND_LIGHT = '#fdba74';
const RED = '#ef4444';
const AMBER = '#d97706';
const API_BASE_URL = 'http://localhost:8080';

/* =====================================================================
   UI STYLESHEET (hover / focus / responsive)
   Inline styles can't do :hover, :focus or media queries, so these live in
   one injected <style>. Rules use !important only where they must beat the
   inline base styles. No logic depends on anything in here.
   ===================================================================== */

const UI_CSS = `
/* =====  BRAND THEME  ===================================================
   orange #f97316 · amber #fb923c · deep orange #ea580c · red-orange #ef4444 · warm ink #2a1710
   ===================================================================== */
@property --ice-angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes as-ice-spin{to{--ice-angle:360deg}}
@keyframes as-sheen{from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes as-fade{from{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:none}}

/* ---------- BRAND BORDER: a frosty highlight that circles the border on hover ---------- */
.as-card,.as-card-flush,.as-toggle-card,.as-chime,.as-row,.as-btn-outline{position:relative}
.as-card::before,.as-card-flush::before,.as-toggle-card::before,.as-chime::before,.as-row::before,.as-btn-outline::before{
  content:'';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;pointer-events:none;z-index:2;
  background:conic-gradient(from var(--ice-angle),
    rgba(254,215,170,0) 0%,rgba(254,215,170,0) 40%,
    #fed7aa 58%,#ffffff 68%,#fb923c 78%,#ffedd5 90%,rgba(254,215,170,0) 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  mask-composite:exclude;
  opacity:0;transition:opacity .35s ease;animation:as-ice-spin 3.4s linear infinite}
.as-card-flush::before{inset:0}
.as-card:hover::before,.as-card-flush:hover::before,.as-toggle-card:hover::before,.as-toggle-card:focus-within::before,
.as-chime:hover::before,.as-chime:focus-within::before,.as-row:not(.is-disabled):hover::before,.as-btn-outline:hover::before{opacity:1}

/* frosty glow that comes with the ice ring */
.as-card,.as-card-flush{transition:box-shadow .3s ease,border-color .3s ease}
.as-card:hover,.as-card-flush:hover{border-color:#fbd5b5 !important;box-shadow:0 0 0 1px rgba(253,186,116,.25),0 12px 32px -14px rgba(249,115,22,.40) !important}

/* ---------- buttons ---------- */
.as-btn-outline{transition:background-color .2s ease,border-color .2s ease,color .2s ease,box-shadow .2s ease,transform .1s ease;white-space:nowrap}
.as-btn-outline:hover{background-color:#fff7ed !important;border-color:#fdba74 !important;color:#c2410c !important;box-shadow:0 4px 14px -4px rgba(249,115,22,.40)}
.as-btn-outline:active{transform:translateY(1px);box-shadow:none}

.as-btn-save{background-image:linear-gradient(110deg,#fb923c 0%,#f97316 35%,#fdba74 50%,#f97316 65%,#ef4444 100%);background-size:300% 100%;background-position:100% 0;transition:background-position .6s ease,box-shadow .2s ease,transform .1s ease}
.as-btn-save:disabled{background-image:none}
.as-btn-save:not(:disabled):hover{background-position:0 0;box-shadow:0 6px 18px -4px rgba(249,115,22,.55)}
.as-btn-save:not(:disabled):active{transform:translateY(1px);box-shadow:none}

.as-btn-danger{transition:background-color .15s ease,box-shadow .15s ease,transform .1s ease}
.as-btn-danger:hover{background-color:#dc2626 !important;box-shadow:0 4px 12px rgba(239,68,68,.35)}
.as-btn-danger:active{transform:translateY(1px);box-shadow:none}

.as-link-btn{transition:opacity .15s ease}
.as-link-btn:hover{text-decoration:underline;opacity:.85}

.as-btn-outline:focus-visible,.as-btn-save:focus-visible,.as-btn-danger:focus-visible,
.as-link-btn:focus-visible,.as-seg:focus-visible,.as-collapse:focus-visible,.as-switch:focus-visible{
  outline:2px solid #fb923c;outline-offset:2px}

/* ---------- segmented / tab buttons ---------- */
.as-seg{transition:background-color .2s ease,color .2s ease,box-shadow .2s ease}
.as-seg:not(.is-active):hover{background-color:#ffedd5 !important;color:#9a3412 !important}
.as-seg.is-active{background-image:linear-gradient(135deg,#fb923c,#f97316 55%,#ef4444);box-shadow:0 2px 8px -2px rgba(249,115,22,.55)}

/* ---------- switch ---------- */
.as-switch{transition:background-color .2s ease,filter .15s ease,box-shadow .2s ease}
.as-switch[aria-checked="true"]{background-image:linear-gradient(135deg,#fb923c,#f97316 55%,#ef4444);box-shadow:0 0 0 3px rgba(251,146,60,.20)}
.as-switch:not(:disabled):hover{filter:brightness(.95)}

/* ---------- form fields ---------- */
.as-field{transition:border-color .2s ease,box-shadow .2s ease,background-color .2s ease}
.as-field:not(:disabled):hover{border-color:#fdba74 !important}
.as-field:focus{border-color:#f97316 !important;box-shadow:0 0 0 3px rgba(251,146,60,.25);outline:none}

/* ---------- interactive cards / rows ---------- */
.as-toggle-card{transition:border-color .2s ease,box-shadow .2s ease,background-color .2s ease}
.as-toggle-card:hover{border-color:#fbd5b5 !important;box-shadow:0 8px 20px -12px rgba(249,115,22,.45);background-color:#fffbf8 !important}
.as-toggle-card:focus-within{border-color:#fdba74 !important}

.as-row{transition:border-color .2s ease,background-color .2s ease}
.as-row:not(.is-disabled):hover{border-color:#fbd5b5 !important;background-color:#fffaf5 !important}

.as-chime{transition:border-color .2s ease,background .2s ease,box-shadow .2s ease,transform .15s ease}
.as-chime:not(.is-selected):hover{border-color:#fbd5b5 !important;background:linear-gradient(135deg,#ffffff,#fff7ed) !important;transform:translateY(-1px);box-shadow:0 10px 22px -14px rgba(249,115,22,.5)}
.as-chime.is-selected{box-shadow:0 0 0 3px rgba(251,146,60,.18),0 10px 22px -14px rgba(249,115,22,.5)}

.as-collapse{transition:background-color .2s ease}
.as-collapse:hover{background-color:#fff7ed !important}

.as-radio{transition:color .15s ease}
.as-radio:hover{color:#c2410c !important}

.as-msg{animation:as-fade .2s ease}

/* ---------- layout helpers ---------- */
.as-fluid{min-width:0;max-width:100%}
.as-two-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.as-preview-card{width:380px;max-width:100%}
.as-subtabs{max-width:100%}

/* ---------- responsive ---------- */
@media (max-width:900px){
  .as-preview-card{width:100% !important}
}
@media (max-width:720px){
  .as-two-col{grid-template-columns:minmax(0,1fr) !important}
  .as-head{flex-wrap:wrap;gap:10px}
  .as-card{padding:14px !important}
  .as-printer-top{flex-direction:column;align-items:stretch !important}
  .as-printer-top .as-btn-outline{width:100%}
  .as-section-head{flex-wrap:wrap}
  .as-row{flex-wrap:wrap}
  .as-chime{flex-wrap:wrap}
  .as-timer-row{flex-wrap:wrap}
  .as-subtabs{display:flex !important;width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
  .as-subtabs .as-seg{flex:1 0 auto;white-space:nowrap}
  .as-collapse-body{padding-left:18px !important}
}
@media (max-width:420px){
  .as-btn-outline{padding:8px 10px !important}
  .as-actions .as-btn-outline{flex:1 1 100%}
}

/* ---------- accessibility ---------- */
@media (prefers-reduced-motion:reduce){
  .as-card::before,.as-card-flush::before,.as-toggle-card::before,.as-chime::before,.as-row::before,.as-btn-outline::before{animation:none !important}
  .as-btn-outline,.as-btn-save,.as-btn-danger,.as-seg,.as-switch,.as-field,.as-toggle-card,.as-row,.as-chime,.as-collapse,.as-link-btn,.as-msg,.as-card,.as-card-flush{
    transition:none !important;animation:none !important}
}
`;

function UiStyles() {
  return <style>{UI_CSS}</style>;
}

/* ---------- small local helpers ---------- */

const card = {
  background: 'linear-gradient(180deg,#ffffff 0%,#fff9f5 100%)',
  border: '1.5px solid #f4e1d3',
  borderRadius: '14px',
  padding: '18px',
  boxShadow: '0 1px 2px rgba(15,23,42,.04)'
};

const outlineBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  backgroundColor: '#fff',
  border: '1.5px solid #e8c9b3',
  borderRadius: '8px',
  padding: '7px 12px',
  fontSize: '11px',
  fontWeight: '900',
  color: '#2a1710',
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
      className="as-switch"
      style={{
        position: 'relative',
        width: '34px',
        height: '20px',
        flexShrink: 0,
        borderRadius: '999px',
        border: 'none',
        padding: 0,
        backgroundColor: checked ? BRAND : '#e0cfc3',
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
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
          boxShadow: '0 1px 2px rgba(0,0,0,.25)',
          transition: 'left .18s cubic-bezier(.4,0,.2,1)'
        }}
      />
    </button>
  );
}

function ToggleCard({ field, on, onToggle, value, onValueChange, requiredBadgeText }) {
  const locked = !!field.required;
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '8px',
    padding: '7px 9px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#2a1710',
    border: '1.5px solid #e8c9b3',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
    opacity: locked || on ? 1 : 0.55
  };
  return (
    <div
      className="as-toggle-card"
      style={{
        border: '1.5px solid #f4e1d3',
        borderRadius: '10px',
        padding: '10px 12px',
        backgroundColor: locked ? '#fff8f3' : '#fff'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#2a1710' }}>{field.label}</div>
          {field.hint && (
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#b39786', marginTop: '2px' }}>{field.hint}</div>
          )}
        </div>
        {locked ? (
          <span
            style={{
              flexShrink: 0,
              fontSize: '9px',
              fontWeight: '950',
              color: RED,
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              padding: '2px 5px'
            }}
          >
            {requiredBadgeText}
          </span>
        ) : (
          <Switch checked={on} onChange={onToggle} />
        )}
      </div>

      {field.valueKey && field.multiline && (
        <textarea
          rows={2}
          className="as-field"
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      )}
      {field.valueKey && !field.multiline && (
        <input
          type="text"
          className="as-field"
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
    <label className="as-radio" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#2a1710', cursor: 'pointer', lineHeight: 1.4 }}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: BRAND, marginTop: '2px', cursor: 'pointer', flexShrink: 0 }}
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
  { id: 'classic', label: 'Classic Ring', labelKey: 'asChimeClassicLabel', desc: 'Two-tone alert — the current default.', descKey: 'asChimeClassicDesc' },
  { id: 'soft', label: 'Soft Chime', labelKey: 'asChimeSoftLabel', desc: 'Gentle rising three-note chime.', descKey: 'asChimeSoftDesc' },
  { id: 'bell', label: 'Bell', labelKey: 'asChimeBellLabel', desc: 'Bright bell-like ding.', descKey: 'asChimeBellDesc' },
  { id: 'dingdong', label: 'Ding Dong', labelKey: 'asChimeDingDongLabel', desc: 'Classic two-note doorbell.', descKey: 'asChimeDingDongDesc' },
  { id: 'ping', label: 'Ping', labelKey: 'asChimePingLabel', desc: 'Short, crisp single ping.', descKey: 'asChimePingDesc' },
  { id: 'arcade', label: 'Arcade', labelKey: 'asChimeArcadeLabel', desc: 'Playful ascending square-wave riff.', descKey: 'asChimeArcadeDesc' }
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

const RECEIPT_SECTIONS_DEF = [
  {
    titleKey: 'asSecBranding',
    titleFallback: 'BRANDING & BUSINESS INFORMATION',
    fields: [
      { key: 'logo', labelKey: 'asFldLogo', labelFallback: 'Logo', hintKey: 'asHintLogo', hintFallback: 'Paste an image URL to print it', def: false, valueKey: 'logoUrl', placeholderKey: 'asPhLogoUrl', placeholderFallback: 'https://.../logo.png' },
      { key: 'restaurantName', labelKey: 'asFldRestName', labelFallback: 'Restaurant Display Name', def: true, valueKey: 'restaurantName', placeholderKey: 'asPhRestName', placeholderFallback: 'Restaurant name' },
      { key: 'branchName', labelKey: 'asFldBranchName', labelFallback: 'Branch Name', def: true, valueKey: 'branchName', placeholderKey: 'asPhBranchName', placeholderFallback: 'Branch name' },
      { key: 'headerText', labelKey: 'asFldHeaderText', labelFallback: 'Header Text', def: false, valueKey: 'headerText', placeholderKey: 'asPhHeaderText', placeholderFallback: 'e.g. Welcome to our restaurant' },
      { key: 'address', labelKey: 'asFldAddress', labelFallback: 'Address', def: true, valueKey: 'address', placeholderKey: 'asPhAddress', placeholderFallback: 'Street, city, state, PIN', multiline: true },
      { key: 'phone', labelKey: 'mobileNumber', labelFallback: 'Phone Number', def: true, valueKey: 'phone', placeholderKey: 'asPhPhone', placeholderFallback: '10-digit number' },
      { key: 'email', labelKey: 'asFldEmail', labelFallback: 'Email', def: false, valueKey: 'email', placeholderKey: 'asPhEmail', placeholderFallback: 'name@example.com' },
      { key: 'gstin', labelKey: 'asFldGstin', labelFallback: 'GST / Tax ID', hintKey: 'asHintGstin', hintFallback: 'Mandatory for GST registered businesses', required: true, valueKey: 'gstin', placeholderKey: 'asPhGstin', placeholderFallback: '15-character GSTIN' },
      { key: 'fssai', labelKey: 'asFldFssai', labelFallback: 'FSSAI / Regulatory Number', def: true, valueKey: 'fssai', placeholderKey: 'asPhFssai', placeholderFallback: '14-digit FSSAI number' }
    ]
  },
  {
    titleKey: 'asSecOrderInfo',
    titleFallback: 'ORDER INFORMATION',
    fields: [
      { key: 'invoiceNo', labelKey: 'asFldInvoiceNo', labelFallback: 'Invoice / Receipt Number', required: true },
      { key: 'dateAndTime', labelKey: 'asFldDateTime', labelFallback: 'Date & Time', required: true },
      { key: 'orderId', labelKey: 'receiptOrderId', labelFallback: 'Order ID', def: true },
      { key: 'tokenNumber', labelKey: 'asFldTokenNo', labelFallback: 'Token Number', hintKey: 'asHintTokenNo', hintFallback: 'Shows only for Counter Orders', def: true },
      { key: 'orderType', labelKey: 'asFldOrderType', labelFallback: 'Order Type', hintKey: 'asHintOrderType', hintFallback: 'e.g. Dine In, Takeaway', def: true },
      { key: 'customerName', labelKey: 'receiptCustomer', labelFallback: 'Customer Name', hintKey: 'asHintCustAttached', hintFallback: 'Only when customer is attached', def: false },
      { key: 'customerMobile', labelKey: 'asFldCustMobile', labelFallback: 'Customer Mobile', hintKey: 'asHintCustAttached', hintFallback: 'Only when customer is attached', def: false }
    ]
  },
  {
    titleKey: 'asSecItemsPricing',
    titleFallback: 'ITEMS & PRICING',
    fields: [
      { key: 'itemNameQtyAmt', labelKey: 'asFldItemQtyAmt', labelFallback: 'Item Name / Quantity / Amount', required: true },
      { key: 'itemRate', labelKey: 'asFldItemRate', labelFallback: 'Item Rate', def: true },
      { key: 'variants', labelKey: 'asFldVariants', labelFallback: 'Variants / Add-ons', def: true },
      { key: 'itemNotes', labelKey: 'asFldItemNotes', labelFallback: 'Item Notes', def: true },
      { key: 'discount', labelKey: 'discount', labelFallback: 'Discount', hintKey: 'asHintDiscountExists', hintFallback: 'Only when a discount exists', def: true },
      { key: 'totalTax', labelKey: 'totalTax', labelFallback: 'Total Tax', hintKey: 'asHintTaxInvoice', hintFallback: 'Required on tax invoices', required: true },
      { key: 'taxBreakdown', labelKey: 'asFldTaxSplit', labelFallback: 'Tax Breakdown', hintKey: 'asHintCgstSgst', hintFallback: 'CGST / SGST split', def: true }
    ]
  },
  {
    titleKey: 'asSecPaymentInfo',
    titleFallback: 'PAYMENT INFORMATION',
    fields: [
      { key: 'paymentMethod', labelKey: 'asFldPayMethod', labelFallback: 'Payment Method', def: true },
      { key: 'paymentReference', labelKey: 'asFldPayRef', labelFallback: 'Payment Reference', def: false }
    ]
  },
  {
    titleKey: 'asSecFooter',
    titleFallback: 'FOOTER',
    fields: [
      { key: 'footerText', labelKey: 'asFldFooterMsg', labelFallback: 'Footer Message', def: true, valueKey: 'footerText', placeholderKey: 'asPhFooterMsg', placeholderFallback: 'Thank you for visiting us!', multiline: true }
    ]
  }
];

const RULE_GROUPS_DEF = [
  { id: 'counter', titleKey: 'rpCounterPosOpt', titleFallback: 'Counter Orders', receiptDefault: 'auto', kotDefault: 'auto', kotAutoKey: 'asKotAutoPay', kotAutoFallback: 'Automatically after successful payment' },
  { id: 'table', titleKey: 'rpTableOrdersOpt', titleFallback: 'Table Orders', receiptDefault: 'demand', kotDefault: 'auto', kotAutoKey: 'asKotAutoDoneEdit', kotAutoFallback: 'Automatically when “Done Editing” is successfully completed' },
  { id: 'takeaway', titleKey: 'asTakeawayOrders', titleFallback: 'Takeaway Orders', receiptDefault: 'auto', kotDefault: 'auto', kotAutoKey: 'asKotAutoPay', kotAutoFallback: 'Automatically after successful payment' }
];

/* =====================================================================
   SYSTEM TAB
   ===================================================================== */

const sysInput = (disabled, extra = {}) => ({
  boxSizing: 'border-box',
  padding: '9px 11px',
  fontSize: '13px',
  fontWeight: '800',
  color: disabled ? '#b39786' : '#2a1710',
  backgroundColor: disabled ? '#fff8f3' : '#fff',
  border: '1.5px solid #f4e1d3',
  borderRadius: '8px',
  outline: 'none',
  fontFamily: 'inherit',
  cursor: disabled ? 'not-allowed' : 'text',
  ...extra
});

function SaveBtn({ disabled, saving, onClick, label, savingText }) {
  return (
    <button
      type="button"
      disabled={disabled || saving}
      onClick={onClick}
      className="as-btn-save"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: disabled || saving ? BRAND_LIGHT : BRAND,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '9px 16px',
        fontSize: '12px',
        fontWeight: '950',
        cursor: disabled || saving ? 'not-allowed' : 'pointer'
      }}
    >
      💾 {saving ? savingText : label}
    </button>
  );
}

function SectionCard({ icon, title, description, sub, right, children }) {
  return (
    <div className="as-card" style={{ ...card, maxWidth: '760px' }}>
      <div className="as-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '950', color: '#2a1710' }}>
            <span style={{ color: BRAND_DARK, marginRight: '6px' }}>{icon}</span>
            {title}
          </div>
          {description && <div style={{ fontSize: '11px', color: '#8a6a58', fontWeight: '700', marginTop: '4px', lineHeight: 1.5 }}>{description}</div>}
          {sub && <div style={{ fontSize: '10.5px', color: '#b39786', fontWeight: '700', marginTop: '3px' }}>{sub}</div>}
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
      className={`as-row${disabled ? ' is-disabled' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 14px',
        border: bordered ? '1.5px solid #fdeee3' : 'none',
        borderRadius: '10px',
        backgroundColor: disabled ? '#fffaf6' : '#fff',
        opacity: disabled ? 0.65 : 1
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 180px' }}>
        <div style={{ fontSize: '12.5px', fontWeight: '950', color: disabled ? '#b39786' : '#2a1710' }}>{title}</div>
        {hint && <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#b39786', marginTop: '2px', lineHeight: 1.45 }}>{hint}</div>}
      </div>
      {control}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  const isError = msg.type === 'error';
  return (
    <div
      className="as-msg"
      role="status"
      style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: '800',
        marginTop: '10px',
        padding: '6px 10px',
        borderRadius: '8px',
        lineHeight: 1.45,
        color: isError ? '#b91c1c' : '#047857',
        backgroundColor: isError ? '#fef2f2' : '#ecfdf5',
        border: `1px solid ${isError ? '#fecaca' : '#a7f3d0'}`
      }}
    >
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
  const { t } = useLanguage();
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
    ? t('asAutoStatusOff')
    : autoSaved.immediate
    ? t('asAutoStatusImmediate')
    : t('asAutoStatusTimer')
        .replace('{min}', String(autoSaved.minutes || 0))
        .replace('{sec}', String(autoSaved.seconds || 0));

  const saveAuto = async () => {
    if (timerInvalid) {
      setAutoMsg({ type: 'error', text: t('asAutoTimerInvalidAlert') });
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
      setAutoMsg({ type: 'ok', text: t('asAutoSavedMsg') });
    } catch (e) {
      setAutoMsg({ type: 'error', text: e?.message || t('asAutoSaveFailMsg') });
    } finally {
      setAutoSaving(false);
    }
  };

  const maxHeldNum = Number(counter.maxHeld);
  const counterInvalid = counter.allowHold && (!maxHeldNum || maxHeldNum < 1 || maxHeldNum > 20);
  const counterDirty = JSON.stringify(counter) !== JSON.stringify(counterSaved);

  const saveCounter = async () => {
    if (counterInvalid) {
      setCounterMsg({ type: 'error', text: t('asMaxHeldRangeAlert') });
      return;
    }
    const payload = { allowHold: counter.allowHold, maxHeld: maxHeldNum || counterSaved.maxHeld };
    setCounterSaving(true);
    setCounterMsg(null);
    try {
      if (onSaveCounter) await onSaveCounter(payload);
      setCounterSaved(payload);
      setCounter(payload);
      setCounterMsg({ type: 'ok', text: t('asCounterSavedMsg') });
    } catch (e) {
      setCounterMsg({ type: 'error', text: e?.message || t('asCounterSaveFailMsg') });
    } finally {
      setCounterSaving(false);
    }
  };

  const soundDirty = JSON.stringify(sound) !== JSON.stringify(soundSaved);
  const saveSound = () => {
    saveSoundSettings(sound);
    setSoundSaved(sound);
    setSoundMsg({ type: 'ok', text: t('asSoundSavedMsg') });
  };

  const timerDisabled = !auto.enabled || auto.immediate;

  return (
    <div style={styles.sectionGroup}>
      <h3 style={styles.sectionTitle}>⚙️ {t('system')}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* ===== 1. ORDER AUTO APPROVAL ===== */}
        <SectionCard
          icon="🕒"
          title={t('asOrderAutoApprovalTitle')}
          description={t('asOrderAutoApprovalDesc')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SettingRow
              title={t('asAutoApproveToggleTitle')}
              hint={t('asAutoApproveToggleHint')}
              control={
                <Switch
                  checked={auto.enabled}
                  onChange={() => setAuto({ ...auto, enabled: !auto.enabled, immediate: auto.enabled ? false : auto.immediate })}
                />
              }
            />
            <SettingRow
              title={t('asApproveImmediatelyTitle')}
              hint={t('asApproveImmediatelyHint')}
              disabled={!auto.enabled}
              control={<Switch checked={auto.immediate} disabled={!auto.enabled} onChange={() => setAuto({ ...auto, immediate: !auto.immediate })} />}
            />

            <div className="as-timer-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginTop: '4px', opacity: timerDisabled ? 0.65 : 1 }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#b39786', marginBottom: '4px' }}>{t('asMinutesLabel')}</div>
                <input
                  type="text"
                  inputMode="numeric"
                  className="as-field"
                  disabled={timerDisabled}
                  value={auto.minutes}
                  onChange={(e) => setAuto({ ...auto, minutes: clampInt(e.target.value, 0, 59) })}
                  style={sysInput(timerDisabled, { width: '70px', textAlign: 'center' })}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#8a6a58', paddingBottom: '10px' }}>{t('minShort')}</span>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#b39786', marginBottom: '4px' }}>{t('asSecondsLabel')}</div>
                <input
                  type="text"
                  inputMode="numeric"
                  className="as-field"
                  disabled={timerDisabled}
                  value={auto.seconds}
                  onChange={(e) => setAuto({ ...auto, seconds: clampInt(e.target.value, 0, 59) })}
                  style={sysInput(timerDisabled, { width: '70px', textAlign: 'center' })}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#8a6a58', paddingBottom: '10px' }}>{t('asSecShort')}</span>
            </div>
            {timerInvalid && (
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: AMBER }}>ⓘ {t('asWaitTimeGtZero')}</div>
            )}

            <div style={{ fontSize: '11px', fontWeight: '800', color: '#5a3a2a' }}>
              {t('asCurrentPrefix')}: <b style={{ color: '#2a1710' }}>{currentLabel}</b>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <SaveBtn
              label={t('mnSaveBtn')}
              savingText={t('savingDots')}
              disabled={!autoDirty || timerInvalid}
              saving={autoSaving}
              onClick={saveAuto}
            />
          </div>
          <Msg msg={autoMsg} />
        </SectionCard>

        {/* ===== 2. COUNTER ORDERING ===== */}
        <SectionCard
          icon="🏪"
          title={t('asCounterOrderingTitle')}
          description={t('asCounterOrderingDesc')}
          sub={branchName ? `${t('kdsBranch')} ${branchName}` : undefined}
          right={
            <SaveBtn
              label={t('saveChanges')}
              savingText={t('savingDots')}
              disabled={!counterDirty || counterInvalid}
              saving={counterSaving}
              onClick={saveCounter}
            />
          }
        >
          <div style={{ border: '1.5px solid #f4e1d3', borderRadius: '12px', padding: '4px 14px' }}>
            <div style={{ fontSize: '10px', fontWeight: '950', color: '#8a6a58', padding: '12px 0 8px', borderBottom: '1px solid #fdeee3' }}>{t('asHoldOrdersSec')}</div>
            <SettingRow
              bordered={false}
              title={t('asAllowHoldTitle')}
              hint={t('asAllowHoldHint')}
              control={<Switch checked={counter.allowHold} onChange={() => setCounter({ ...counter, allowHold: !counter.allowHold })} />}
            />
            <div style={{ borderTop: '1px solid #fdeee3' }} />
            <SettingRow
              bordered={false}
              disabled={!counter.allowHold}
              title={t('asMaxHeldTitle')}
              hint={t('asMaxHeldHint')}
              control={
                <div style={{ textAlign: 'right' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="as-field"
                    disabled={!counter.allowHold}
                    value={counter.maxHeld}
                    onChange={(e) => setCounter({ ...counter, maxHeld: clampInt(e.target.value, 0, 20) })}
                    style={sysInput(!counter.allowHold, { width: '110px' })}
                  />
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#b39786', marginTop: '3px' }}>{t('asMax20Hint')}</div>
                </div>
              }
            />
          </div>
          <Msg msg={counterMsg} />
        </SectionCard>

        {/* ===== 3. NEW ORDER NOTIFICATION SOUND ===== */}
        <SectionCard
          icon="🔔"
          title={t('asSoundTitle')}
          description={t('asSoundDesc')}
        >
          <SettingRow
            title={`🔊 ${t('asPlaySoundToggle')}`}
            hint={t('asPlaySoundHint')}
            control={<Switch checked={sound.enabled} onChange={() => setSound({ ...sound, enabled: !sound.enabled })} />}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '10px', marginTop: '10px' }}>
            {CHIMES.map((c) => {
              const selected = sound.soundId === c.id;
              return (
                <div
                  key={c.id}
                  className={`as-chime${selected ? ' is-selected' : ''}`}
                  onClick={() => setSound({ ...sound, soundId: c.id })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: `1.5px solid ${selected ? BRAND : '#f4e1d3'}`,
                    background: selected ? 'linear-gradient(135deg,#fff7ed,#ffedd5)' : 'linear-gradient(180deg,#ffffff,#fffaf6)'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', minWidth: 0 }}>
                    <input
                      type="radio"
                      name="chime"
                      checked={selected}
                      onChange={() => setSound({ ...sound, soundId: c.id })}
                      style={{ accentColor: BRAND, marginTop: '3px', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#2a1710' }}>{t(c.labelKey) || c.label}</span>
                      <span style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: '#b39786', marginTop: '2px', lineHeight: 1.4 }}>{t(c.descKey) || c.desc}</span>
                    </span>
                  </label>
                  <button
                    type="button"
                    className="as-btn-outline"
                    style={{ ...outlineBtn, flexShrink: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playNotificationChime(c.id, true);
                    }}
                  >
                    ▷ {t('asPreviewBtn')}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <SaveBtn label={t('mnSaveBtn')} savingText={t('savingDots')} disabled={!soundDirty} onClick={saveSound} />
          </div>
          <Msg msg={soundMsg} />
        </SectionCard>

        {/* ===== 4. SECURITY & PASSWORD MANAGEMENT ===== */}
        <div style={{ maxWidth: '760px' }}>
          <div style={{ fontSize: '13px', fontWeight: '950', color: '#2a1710', marginBottom: '8px' }}>{t('asSecurityTitle')}</div>
          <div className="as-card" style={card}>
            <div style={{ fontSize: '12px', color: '#8a6a58', fontWeight: '700', marginBottom: '14px', lineHeight: 1.5 }}>
              {t('asSecurityDesc')}
            </div>
            <button
              type="button"
              className="as-btn-danger"
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('userEmail');
                localStorage.setItem('open_forgot_password', 'true');
                window.location.href = window.location.pathname + '#forgot';
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
              🔐 {t('asResetPasswordBtn')}
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
  const { t } = useLanguage();
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
      setPrinterMsg({ type: 'ok', text: `${t('asConnectedPrefix')}: ${name}` });
    } catch (e) {
      setPrinterMsg({ type: 'error', text: e?.name === 'NotFoundError' ? t('asNoDeviceSelected') : e?.message || t('asCouldNotConnect') });
    }
  };

  const handleTestPrint = async () => {
    setPrinterMsg(null);
    try {
      const r = await testPrint(receiptConfig);
      setPrinterMsg(
        r.printed
          ? { type: 'ok', text: t('asTestPrintSent') }
          : { type: 'error', text: t('asNoPrinterConsolePreview') }
      );
    } catch (e) {
      setPrinterMsg({ type: 'error', text: e?.message || t('asTestPrintFailed') });
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
    { id: 'printers', label: t('asSubTabPrinters') },
    { id: 'receipt', label: t('asSubTabReceiptConfig') },
    { id: 'rules', label: t('asSubTabPrintRules') }
  ];

  const receiptSections = RECEIPT_SECTIONS_DEF.map((sec) => ({
    title: t(sec.titleKey) || sec.titleFallback,
    fields: sec.fields.map((f) => ({
      ...f,
      label: t(f.labelKey) || f.labelFallback,
      hint: f.hintKey ? (t(f.hintKey) || f.hintFallback) : undefined,
      placeholder: f.placeholderKey ? (t(f.placeholderKey) || f.placeholderFallback) : undefined
    }))
  }));

  const ruleGroups = RULE_GROUPS_DEF.map((g) => ({
    ...g,
    title: t(g.titleKey) || g.titleFallback,
    kotAutoLabel: t(g.kotAutoKey) || g.kotAutoFallback
  }));

  const dash = <div style={{ borderTop: '1px dashed #000', margin: compact ? '4px 0' : '8px 0' }} />;
  const row = (l, r, bold) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontWeight: bold ? 'bold' : 'normal' }}>
      <span>{l}</span>
      <span>{r}</span>
    </div>
  );
  const on = (key) => isOn(receiptSections.flatMap((s) => s.fields).find((f) => f.key === key));

  const knownPrinterNames = ['System-Default', 'Thermal-80mm', 'Thermal-58mm'];

  return (
    <>
      <UiStyles />

      {/* TAB 8: PRINTERS & RECEIPTS */}
      {activeTab === 'printers' && (
        <div style={styles.sectionGroup}>
          <div className="as-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ ...styles.sectionTitle, margin: 0 }}>🖨️ {t('printersReceipts')}</h3>
            <button
              type="button"
              className="as-btn-save"
              onClick={() => (onSave ? onSave() : alert(t('asSettingsSavedAlert')))}
              style={{ backgroundColor: BRAND, color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '12px', fontWeight: '950', cursor: 'pointer' }}
            >
              💾 {t('saveChanges')}
            </button>
          </div>

          <div
            className="as-subtabs"
            role="tablist"
            style={{
              display: 'inline-flex',
              gap: '2px',
              padding: '3px',
              border: '1.5px solid #f4e1d3',
              borderRadius: '10px',
              backgroundColor: '#fff',
              marginBottom: '20px'
            }}
          >
            {subTabs.map((tb) => (
              <button
                key={tb.id}
                type="button"
                role="tab"
                aria-selected={receiptSubTab === tb.id}
                className={`as-seg${receiptSubTab === tb.id ? ' is-active' : ''}`}
                onClick={() => setReceiptSubTab(tb.id)}
                style={{
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  backgroundColor: receiptSubTab === tb.id ? BRAND : 'transparent',
                  color: receiptSubTab === tb.id ? '#fff' : '#2a1710'
                }}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {receiptSubTab === 'printers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="as-card as-printer-top" style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', minWidth: 0 }}>
                  <span style={{ fontSize: '20px' }}>🖨️</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '950', color: '#2a1710', fontSize: '13px', marginBottom: '3px' }}>{t('asPrintingThisDevice')}</div>
                    <div style={{ fontSize: '11px', color: BRAND_DARK, fontWeight: '900', marginBottom: '4px' }}>● {t('asDirectThermalSupported')}</div>
                    <div style={{ fontSize: '11px', color: '#8a6a58', fontWeight: '700', lineHeight: 1.5 }}>
                      {t('asThermalConnectionsHint')}
                    </div>
                  </div>
                </div>
                <button type="button" className="as-btn-outline" onClick={() => setPrinterStatus(getPrinterStatus())} style={{ ...outlineBtn, flexShrink: 0 }}>
                  🔄 {t('asRefreshPrintersBtn')}
                </button>
              </div>

              <div className="as-card-flush" style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <button
                  type="button"
                  className="as-collapse"
                  aria-expanded={oneClickOpen}
                  onClick={() => setOneClickOpen(!oneClickOpen)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <span style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '8px', background: 'linear-gradient(135deg,#ffedd5,#fed7aa)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: BRAND_DARK }}>⚡</span>
                    <div>
                      <div style={{ fontWeight: '950', fontSize: '13px', color: '#2a1710' }}>{t('asOneClickTitle')}</div>
                      <div style={{ fontSize: '11px', color: '#8a6a58', fontWeight: '700' }}>
                        {t('asOneClickDesc')}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: '#8a6a58', transform: oneClickOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }}>⌄</span>
                </button>
                {oneClickOpen && (
                  <div className="as-collapse-body as-msg" style={{ padding: '0 18px 16px 62px', fontSize: '11px', color: '#6b4a38', fontWeight: '700', lineHeight: 1.6 }}>
                    {t('asOneClickStep1')}<br />
                    {t('asOneClickStep2')}<br />
                    {t('asOneClickStep3')}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                <div className="as-card as-fluid" style={{ ...card, flex: '1 1 340px', maxWidth: '440px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '950', color: '#2a1710' }}>🖨️ {t('asCounterPrinterTitle')}</div>
                  <p style={{ fontSize: '11px', color: '#8a6a58', fontWeight: '700', margin: '4px 0 12px', lineHeight: 1.5 }}>
                    {t('asCounterPrinterDesc')}
                  </p>

                  {!hasPrinter && (
                    <div style={{ backgroundColor: '#fff8f3', border: '1px solid #f4e1d3', borderRadius: '8px', padding: '10px 12px', fontSize: '10.5px', color: '#8a6a58', fontWeight: '700', marginBottom: '14px', lineHeight: 1.5 }}>
                      ⓘ {t('asNoPrinterSavedNotice')}
                    </div>
                  )}

                  <label style={styles.label}>{t('asPrinterFieldLabel')}</label>
                  <select
                    className="as-field"
                    style={{ ...styles.input, maxWidth: '100%' }}
                    value={printerInfo.printerName || ''}
                    onChange={(e) => setPrinterInfo({ printerName: e.target.value })}
                  >
                    <option value="">{t('asSelectPrinterOpt')}</option>
                    <option value="System-Default">{t('asDefaultSystemPrinterOpt')}</option>
                    <option value="Thermal-80mm">{t('asThermal80Opt')}</option>
                    <option value="Thermal-58mm">{t('asThermal58Opt')}</option>
                    {printerInfo.printerName && !knownPrinterNames.includes(printerInfo.printerName) && (
                      <option value={printerInfo.printerName}>{printerInfo.printerName}</option>
                    )}
                  </select>

                  <div className="as-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0 8px' }}>
                    <button type="button" className="as-btn-outline" style={outlineBtn} onClick={() => connectWith(connectUsb)}>🔌 {t('asConnectUsbBtn')}</button>
                    <button type="button" className="as-btn-outline" style={outlineBtn} onClick={() => connectWith(connectSerial)}>📶 {t('asConnectSerialBtn')}</button>
                    <button type="button" className="as-btn-outline" style={outlineBtn} onClick={() => connectWith(connectBluetooth)}>🔵 {t('asConnectBleBtn')}</button>
                    <button type="button" className="as-btn-outline" style={outlineBtn} onClick={() => alert(t('asNetworkPrinterAlert'))}>🌐 {t('asAddNetworkPrinterBtn')}</button>
                  </div>
                  {printerStatus.connected ? (
                    <div style={{ fontSize: '11px', fontWeight: '800', color: BRAND_DARK, marginBottom: '8px' }}>
                      ● {t('asConnectedPrefix')}: {printerStatus.name} ({printerStatus.type}){' '}
                      <button
                        type="button"
                        className="as-link-btn"
                        onClick={async () => {
                          await disconnectPrinter();
                          setPrinterStatus(getPrinterStatus());
                        }}
                        style={{ background: 'none', border: 'none', color: RED, fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}
                      >
                        {t('asDisconnectBtn')}
                      </button>
                    </div>
                  ) : hasPrinter ? (
                    <div style={{ fontSize: '11px', fontWeight: '800', color: AMBER, marginBottom: '8px' }}>
                      ⓘ {t('asSavedPrinterNotConnected').replace('{name}', printerInfo.printerName)}
                    </div>
                  ) : null}
                  <Msg msg={printerMsg} />
                  <div style={{ fontSize: '10px', color: '#b39786', fontWeight: '700', margin: '10px 0 14px', lineHeight: 1.5 }}>
                    {t('asBrowserPrinterLimitHint')}
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: '950', color: '#2a1710', marginBottom: '8px' }}>{t('asDocumentsHeading')}</div>
                  <label className="as-radio" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', marginBottom: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={printReceipt} onChange={() => setPrinterInfo({ printReceipt: !printReceipt })} style={{ ...styles.checkbox, accentColor: BRAND }} />
                    {t('asPrintReceiptChk')}
                  </label>
                  <label className="as-radio" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                    <input type="checkbox" checked={printKot} onChange={() => setPrinterInfo({ printKot: !printKot })} style={{ ...styles.checkbox, accentColor: BRAND }} />
                    {t('asPrintKotChk')}
                  </label>
                </div>

                <div className="as-card as-fluid" style={{ ...card, flex: '1 1 340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '260px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>👨‍🍳</div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '950', color: '#2a1710' }}>{t('asKitchenPrinterTitle')}</h4>
                  <div style={{ fontSize: '11px', color: '#8a6a58', fontWeight: '700' }}>{t('asNoKitchenPrinterMsg')}</div>
                  <div style={{ fontSize: '11px', color: '#b39786', fontWeight: '700', marginBottom: '14px' }}>
                    {t('asKitchenPrinterOptionalHint')}
                  </div>
                  <button type="button" className="as-btn-outline" style={outlineBtn} onClick={() => alert(t('asKitchenSetupAlert'))}>＋ {t('asConfigureKitchenPrinterBtn')}</button>
                </div>
              </div>
            </div>
          )}

          {receiptSubTab === 'receipt' && (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div className="as-card as-fluid" style={{ ...card, flex: '1 1 520px', maxWidth: '720px', backgroundColor: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: '950', color: '#8a6a58', marginBottom: '8px' }}>{t('asReceiptDensityLabel')}</div>
                <div style={{ display: 'inline-flex', border: '1.5px solid #f4e1d3', borderRadius: '8px', overflow: 'hidden' }}>
                  {[
                    { id: 'Compact', label: t('asDensityCompact') },
                    { id: 'Comfortable', label: t('asDensityComfortable') }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className={`as-seg${density === d.id ? ' is-active' : ''}`}
                      onClick={() => setReceiptConfig({ density: d.id })}
                      style={{
                        border: 'none',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        backgroundColor: density === d.id ? BRAND : '#fff',
                        color: density === d.id ? '#fff' : '#5a3a2a'
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: '#b39786', fontWeight: '700', margin: '6px 0 18px' }}>
                  {t('asDensityHint')}
                </div>

                {receiptSections.map((section) => (
                  <div key={section.title} style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '950', color: '#8a6a58', marginBottom: '10px' }}>{section.title}</div>
                    <div className="as-two-col">
                      {section.fields.map((f) => (
                        <ToggleCard
                          key={f.key}
                          field={f}
                          on={isOn(f)}
                          onToggle={() => handleToggleReceiptField(f.key)}
                          value={f.valueKey ? receiptConfig[f.valueKey] : undefined}
                          onValueChange={f.valueKey ? (v) => setReceiptConfig({ [f.valueKey]: v }) : undefined}
                          requiredBadgeText={t('asRequiredBadge')}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="as-card as-preview-card" style={{ ...card, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '950', color: '#2a1710' }}>{t('asLivePreviewTitle')}</h4>
                  <div style={{ display: 'inline-flex', gap: '2px', padding: '2px', backgroundColor: '#fdeee3', borderRadius: '8px' }}>
                    {['58mm', '80mm'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`as-seg${paperSize === p ? ' is-active' : ''}`}
                        onClick={() => setReceiptConfig({ paperSize: p })}
                        style={{
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '900',
                          cursor: 'pointer',
                          backgroundColor: paperSize === p ? BRAND : 'transparent',
                          color: paperSize === p ? '#fff' : '#5a3a2a'
                        }}
                      >
                        {p.replace('mm', ' mm')}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fff8f3', borderRadius: '10px', padding: '14px', display: 'flex', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: previewWidth + 24 + 'px',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 8px rgba(15,23,42,.12)',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: compact ? '9px' : '10.5px',
                      lineHeight: compact ? 1.35 : 1.7,
                      color: '#000',
                      textAlign: 'left',
                      overflowWrap: 'anywhere',
                      transition: 'width .2s ease'
                    }}
                  >
                    {on('logo') && receiptConfig.logoUrl && (
                      <div style={{ textAlign: 'center', margin: '4px 0' }}>
                        <img src={receiptConfig.logoUrl} alt="logo" style={{ maxWidth: '60%', maxHeight: '50px', filter: 'grayscale(1)' }} />
                      </div>
                    )}
                    {on('headerText') && receiptConfig.headerText && <div style={{ textAlign: 'center' }}>{receiptConfig.headerText}</div>}
                    {on('restaurantName') && <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2em' }}>{(receiptConfig.restaurantName || t('asPreviewRestName')).toUpperCase()}</div>}
                    {on('branchName') && <div style={{ textAlign: 'center' }}>{receiptConfig.branchName || t('asPreviewBranchName')}</div>}
                    {on('address') && <div style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{receiptConfig.address || t('asPreviewAddress')}</div>}
                    {on('phone') && <div style={{ textAlign: 'center' }}>{t('receiptPhoneShort')}: {receiptConfig.phone || '0000000000'}</div>}
                    {on('email') && <div style={{ textAlign: 'center' }}>{receiptConfig.email || 'name@example.com'}</div>}
                    {on('gstin') && <div style={{ textAlign: 'center' }}>GSTIN: {receiptConfig.gstin || '00AAAAA0000A1Z5'}</div>}
                    {on('fssai') && <div style={{ textAlign: 'center' }}>FSSAI: {receiptConfig.fssai || '00000000000000'}</div>}
                    {dash}
                    {on('tokenNumber') && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9em' }}>{t('posTokenLabel')}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.8em' }}>000724</div>
                      </div>
                    )}
                    {on('invoiceNo') && <div>{t('receiptNo')}: INV-000724</div>}
                    {on('orderId') && <div>{t('receiptOrderId')}: ORD-000724</div>}
                    {on('orderType') && <div>{t('posTakeawayMode')}</div>}
                    {on('dateAndTime') && <div>29 Oct 2026, 8:10 am</div>}
                    {on('customerName') && <div>{t('receiptCustomer')}: {t('rpGuestWord')}</div>}
                    {on('customerMobile') && <div>{t('receiptMobile')}: 9XXXXXXXXX</div>}
                    {dash}
                    {on('itemNameQtyAmt') && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontWeight: 'bold' }}>
                          <span>{t('defaultFoodItem')}</span>
                          <span>{on('itemRate') ? t('asPreviewQtyRateAmt') : t('asPreviewQtyAmt')}</span>
                        </div>
                        {row(t('asSampleBurger'), on('itemRate') ? '2  ₹300.00  ₹620.00' : '2  ₹620.00')}
                        {on('variants') && <div> + {t('asSampleCheese')} x1 ₹20.00</div>}
                        {on('itemNotes') && <div> {t('asSampleLessSpicy')}</div>}
                        {row(t('asSampleCola'), on('itemRate') ? '1  ₹70.00  ₹70.00' : '1  ₹70.00')}
                      </div>
                    )}
                    {dash}
                    {row(t('subtotal'), '₹690.00')}
                    {on('discount') && row(t('discount'), '-₹50.00')}
                    {on('totalTax') && !on('taxBreakdown') && row(t('totalTax'), '₹29.50')}
                    {on('totalTax') && on('taxBreakdown') && (
                      <>
                        {row('CGST 2.5%', '₹14.75')}
                        {row('SGST 2.5%', '₹14.75')}
                      </>
                    )}
                    {row(t('totalUpper'), '₹669.50', true)}
                    {dash}
                    {on('paymentMethod') && <div>{t('asPaidByCard')}</div>}
                    {on('paymentReference') && <div>{t('asRefPrefix')}: TXN123456</div>}
                    {on('footerText') && (
                      <div style={{ textAlign: 'center', marginTop: '6px', whiteSpace: 'pre-line' }}>
                        {receiptConfig.footerText || t('asDefaultFooterMsg')}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="as-btn-outline"
                  onClick={handleTestPrint}
                  style={{ ...outlineBtn, width: '100%', marginTop: '14px', padding: '9px' }}
                >
                  🖨️ {t('asTestPrintBtn')}
                </button>
                {!printerStatus.connected && (
                  <div style={{ fontSize: '10px', color: '#b39786', fontWeight: '700', marginTop: '6px' }}>
                    {t('asTestPrintConsoleHint')}
                  </div>
                )}
                <Msg msg={printerMsg} />
              </div>
            </div>
          )}

          {receiptSubTab === 'rules' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '16px', alignItems: 'start' }}>
                {ruleGroups.map((g) => {
                  const receipt = getRule(g.id, 'receipt', g.receiptDefault);
                  const kot = getRule(g.id, 'kot', g.kotDefault);
                  const warn = !hasPrinter && (
                    <div style={{ fontSize: '10px', fontWeight: '800', color: AMBER, margin: '8px 0 0' }}>
                      ⓘ {t('asNoPrinterAutoPrintWarn')}
                    </div>
                  );
                  return (
                    <div key={g.id} className="as-card" style={card}>
                      <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '950', color: '#2a1710' }}>{g.title}</h4>

                      <div style={{ fontSize: '12px', fontWeight: '900', color: '#2a1710', marginBottom: '8px' }}>{t('asWhenReceiptPrintQ')}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Radio name={g.id + 'Receipt'} checked={receipt === 'auto'} onChange={() => setRule(g.id, 'receipt', 'auto')} label={t('asAutoAfterPayment')} />
                        <Radio name={g.id + 'Receipt'} checked={receipt === 'demand'} onChange={() => setRule(g.id, 'receipt', 'demand')} label={t('asOnDemandOpt')} />
                      </div>
                      {warn}

                      <div style={{ fontSize: '12px', fontWeight: '900', color: '#2a1710', margin: '18px 0 8px' }}>{t('asWhenKotPrintQ')}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Radio name={g.id + 'Kot'} checked={kot === 'auto'} onChange={() => setRule(g.id, 'kot', 'auto')} label={g.kotAutoLabel} />
                        <Radio name={g.id + 'Kot'} checked={kot === 'demand'} onChange={() => setRule(g.id, 'kot', 'demand')} label={t('asOnDemandOpt')} />
                      </div>
                      {warn}

                      {g.id === 'table' && (
                        <div style={{ marginTop: '14px', backgroundColor: '#fff8f3', border: '1px solid #f4e1d3', borderRadius: '8px', padding: '10px 12px', fontSize: '10.5px', color: '#8a6a58', fontWeight: '700', lineHeight: 1.5 }}>
                          ⓘ {t('asTableKotNote')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '11px', color: '#8a6a58', fontWeight: '700', marginTop: '14px' }}>
                {t('asOnDemandFooterHint')}
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