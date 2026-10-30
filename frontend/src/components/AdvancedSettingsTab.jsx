// FILE: src/components/AdvancedSettingsTab.jsx
import React, { useState } from 'react';

const GREEN = '#10b981';
const GREEN_DARK = '#059669';
const RED = '#ef4444';
const AMBER = '#d97706';

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

/* ---------- receipt field definitions ---------- */
/* valueKey = editable text stored in formData.receiptConfig[valueKey] */

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
  onSave // optional: pass your save handler to wire the green "Save Changes" button
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
          {/* header row: title + save */}
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

          {/* sub-tabs (segmented pill) */}
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

          {/* ---------- PRINTERS ---------- */}
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

              {/* one-click printing (collapsible) */}
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
                {/* counter printer */}
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

                {/* kitchen printer */}
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

          {/* ---------- RECEIPT CONFIGURATION ---------- */}
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

              {/* live preview */}
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
                        {on('itemNotes') && <div>&nbsp;* Less spicy</div>}
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

          {/* ---------- PRINT RULES ---------- */}
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

      {/* TAB 9: SYSTEM */}
      {activeTab === 'system' && (
        <div style={styles.sectionGroup}>
          <h3 style={styles.sectionTitle}>⚙️ System Configuration</h3>
          <div style={styles.infoBox}>
            <div style={{ fontWeight: '950', color: '#0f172a', marginBottom: '4px' }}>System Preferences & Maintenance</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>
              Manage backend logs, cache clearing, system diagnostics, and hardware integration endpoints.
            </div>
          </div>
        </div>
      )}
    </>
  );
}