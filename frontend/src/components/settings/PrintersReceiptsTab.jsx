// FILE: src/components/settings/PrintersReceiptsTab.jsx
import React, { useState, useRef } from 'react';

const DEFAULT_RULES = {
  counterReceiptTrigger: 'auto',
  counterKotTrigger: 'auto',
  tableReceiptTrigger: 'manual',
  tableKotTrigger: 'auto',
  takeawayReceiptTrigger: 'auto',
  takeawayKotTrigger: 'auto'
};

const BROWSER_PRINTER = 'This computer’s printer (via browser)';

const RULE_GROUPS = [
  {
    title: 'Counter Orders',
    receiptKey: 'counterReceiptTrigger',
    kotKey: 'counterKotTrigger',
    kotAutoLabel: 'Automatically after successful payment'
  },
  {
    title: 'Table Orders',
    receiptKey: 'tableReceiptTrigger',
    kotKey: 'tableKotTrigger',
    kotAutoLabel: 'Automatically when “Done Editing” is successfully completed',
    note: 'For Table Orders, subsequent KOTs contain only items or quantities added since the previous KOT.'
  },
  {
    title: 'Takeaway Orders',
    receiptKey: 'takeawayReceiptTrigger',
    kotKey: 'takeawayKotTrigger',
    kotAutoLabel: 'Automatically after successful payment'
  }
];

const REQUIRED_KEYS = new Set(['gstin', 'invoiceNo', 'dateAndTime', 'itemNameQtyAmt', 'totalTax']);

function Switch({ on, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      style={{
        position: 'relative', width: 34, height: 20, borderRadius: 10, border: 'none', padding: 0, flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: on ? (disabled ? '#fca5a5' : '#ef4444') : '#d1d5db',
        transition: 'background-color 0.15s'
      }}
    >
      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.25)' }} />
    </button>
  );
}

function ToggleCard({ item, on, onToggle, children }) {
  const locked = !!item.required;
  return (
    <div style={{ ...S.card, ...(locked ? S.cardLocked : {}) }}>
      <div style={S.cardTop}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', minWidth: 0 }}>
          {locked && <span style={S.lockIcon}>–</span>}
          <div style={{ minWidth: 0 }}>
            <div style={S.cardLabel}>{item.label}</div>
            {item.hint && <div style={S.cardHint}>{item.hint}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {locked && <span style={S.reqBadge}>REQUIRED</span>}
          <Switch on={locked ? true : on} disabled={locked} onChange={onToggle} />
        </div>
      </div>
      {children}
    </div>
  );
}

function Radio({ name, checked, onChange, label }) {
  return (
    <label style={S.radioRow}>
      <input type="radio" name={name} checked={checked} onChange={onChange} style={{ accentColor: '#ef4444', margin: 0 }} />
      <span>{label}</span>
    </label>
  );
}

export default function PrintersReceiptsTab({ formData, setFormData }) {
  const [sub, setSub] = useState('printers');
  const [oneClickOpen, setOneClickOpen] = useState(false);
  const [kitchenOpen, setKitchenOpen] = useState(false);
  const [connected, setConnected] = useState([]);
  const previewRef = useRef(null);

  const rc = formData.receiptConfig || {};
  const toggles = rc.toggles || {};
  const rules = { ...DEFAULT_RULES, ...(formData.printRules || {}) };
  const printer = formData.printerInfo || {};
  const hasPrinter = !!printer.printerName;
  const isOn = (key) => REQUIRED_KEYS.has(key) || !!toggles[key];

  const setRc = (patch) => setFormData((prev) => ({ ...prev, receiptConfig: { ...prev.receiptConfig, ...patch } }));

  const flipToggle = (key) =>
    setFormData((prev) => ({
      ...prev,
      receiptConfig: { ...prev.receiptConfig, toggles: { ...(prev.receiptConfig?.toggles || {}), [key]: !prev.receiptConfig?.toggles?.[key] } }
    }));

  const setRule = (key, value) =>
    setFormData((prev) => ({ ...prev, printRules: { ...DEFAULT_RULES, ...(prev.printRules || {}), [key]: value } }));

  const setPrinter = (patch) => setFormData((prev) => ({ ...prev, printerInfo: { ...(prev.printerInfo || {}), ...patch } }));

  const addPrinter = (name) => {
    setConnected((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setPrinter({ printerName: name });
  };

  const connectUsb = async () => {
    if (!navigator.usb) return alert('USB printing is not supported in this browser.');
    try {
      const d = await navigator.usb.requestDevice({ filters: [] });
      addPrinter(`USB: ${d.productName || 'USB Printer'}`);
    } catch (e) {}
  };

  const connectSerial = async () => {
    if (!navigator.serial) return alert('Serial printing is not supported in this browser.');
    try {
      await navigator.serial.requestPort();
      addPrinter(`Serial printer #${connected.filter((c) => c.startsWith('Serial')).length + 1}`);
    } catch (e) {}
  };

  const connectBle = async () => {
    if (!navigator.bluetooth) return alert('Bluetooth is not supported in this browser.');
    try {
      const d = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      addPrinter(`Bluetooth: ${d.name || 'BLE Printer'}`);
    } catch (e) {}
  };

  const addNetwork = () => {
    const ip = window.prompt('Enter the printer IP address (e.g. 192.168.1.50)');
    if (ip && ip.trim()) addPrinter(`Network: ${ip.trim()}`);
  };

  const printerOptions = Array.from(new Set([BROWSER_PRINTER, ...connected, printer.printerName, printer.kitchenPrinterName].filter(Boolean)));

  const address = [formData.addressLine1, formData.addressLine2, formData.area, formData.city, formData.state, formData.pinCode].filter(Boolean).join(', ') || rc.address || '';
  const phone = formData.phoneNumber || rc.phone || '';
  const gstin = formData.gstnNumber || rc.gstin || '';
  const email = formData.email || rc.email || '';
  const fssaiText = rc.fssai ? (rc.fssai.toUpperCase().startsWith('FSSAI') ? rc.fssai : `FSSAI: ${rc.fssai}`) : '';
  const displayName = rc.restaurantName || formData.businessName || '';
  const branchName = formData.branchDisplayName || formData.area || '';
  const branchLine = branchName ? `${displayName} - ${branchName}` : displayName;

  const SECTIONS = [
    {
      title: 'BRANDING & BUSINESS INFORMATION',
      items: [
        { key: 'logo', label: 'Logo', hint: 'Prints the uploaded image' },
        { key: 'restaurantName', label: 'Restaurant Display Name', hint: `Business: ${formData.businessName || displayName}`, input: true },
        { key: 'branchName', label: 'Branch Name', hint: branchLine },
        { key: 'headerText', label: 'Header Text' },
        { key: 'address', label: 'Address' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'email', label: 'Email' },
        { key: 'gstin', label: 'GST / Tax ID', hint: 'Mandatory for GST registered businesses', required: true },
        { key: 'fssai', label: 'FSSAI / Regulatory Number' }
      ]
    },
    {
      title: 'ORDER INFORMATION',
      items: [
        { key: 'invoiceNo', label: 'Invoice / Receipt Number', required: true },
        { key: 'dateAndTime', label: 'Date & Time', required: true },
        { key: 'orderId', label: 'Order ID' },
        { key: 'tokenNumber', label: 'Token Number', hint: 'Shows only for Counter Orders' },
        { key: 'orderType', label: 'Order Type', hint: 'e.g. Dine In, Takeaway' },
        { key: 'customerName', label: 'Customer Name', hint: 'Only where customer is attached' },
        { key: 'customerMobile', label: 'Customer Mobile', hint: 'Only when customer is attached' }
      ]
    },
    {
      title: 'ITEMS & PRICING',
      items: [
        { key: 'itemNameQtyAmt', label: 'Item Name / Quantity / Amount', required: true },
        { key: 'itemRate', label: 'Item Rate' },
        { key: 'variantsAddons', label: 'Variants / Add-ons' },
        { key: 'itemNotes', label: 'Item Notes' },
        { key: 'discount', label: 'Discount', hint: 'Only where a discount exists' },
        { key: 'totalTax', label: 'Total Tax', hint: 'Required on tax invoices', required: true },
        { key: 'taxBreakdown', label: 'Tax Breakdown', hint: 'CGST / SGST split' }
      ]
    },
    {
      title: 'PAYMENT INFORMATION',
      items: [
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'paymentReference', label: 'Payment Reference' }
      ]
    }
  ];

  const is58 = rc.paperSize === '58mm';
  const comfortable = rc.density === 'Comfortable';
  const paperStyle = {
    width: is58 ? 190 : 250, margin: '0 auto', backgroundColor: '#fff', border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: comfortable ? '16px 12px' : '10px 10px',
    fontFamily: "'Courier New', monospace", fontSize: is58 ? 8 : 9, lineHeight: comfortable ? 1.7 : 1.3, color: '#000', boxSizing: 'border-box'
  };
  const Dash = () => <div style={{ borderTop: '1px dashed #000', margin: comfortable ? '8px 0' : '4px 0' }} />;
  const Center = ({ children, bold, size }) => <div style={{ textAlign: 'center', fontWeight: bold ? 'bold' : 'normal', fontSize: size }}>{children}</div>;
  const Row = ({ l, r, bold }) => <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: bold ? 'bold' : 'normal' }}><span>{l}</span><span>{r}</span></div>;
  const ItemRow = ({ name, qty, rate, amt, head }) => (
    <div style={{ display: 'flex', fontWeight: head ? 'bold' : 'normal' }}>
      <span style={{ flex: 1 }}>{name}</span>
      <span style={{ width: 20, textAlign: 'right' }}>{qty}</span>
      {isOn('itemRate') && <span style={{ width: is58 ? 44 : 52, textAlign: 'right' }}>{rate}</span>}
      <span style={{ width: is58 ? 46 : 56, textAlign: 'right' }}>{amt}</span>
    </div>
  );
  const sampleDate = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

  const handleTestPrint = () => {
    const w = window.open('', '_blank', 'width=420,height=720');
    if (!w) return alert('Please allow pop-ups to run a test print.');
    w.document.write(`<html><head><title>Test Print</title><style>body{margin:0;padding:8px}</style></head><body>${previewRef.current.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={S.heading}><span>🖨️</span> Printers & Receipts</div>

      <div style={S.tabs}>
        {[['printers', 'Printers'], ['receipt', 'Receipt Configuration'], ['rules', 'Print Rules']].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setSub(id)} style={{ ...S.tab, ...(sub === id ? S.tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {sub === 'printers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 820 }}>
          <div style={{ ...S.panel, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>🖨️</span>
              <div>
                <div style={S.panelTitle}>Printing from this device</div>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, margin: '3px 0' }}>● Direct thermal printing supported</div>
                <div style={S.muted}>USB · Serial · Bluetooth (BLE) · Network (Epson ePOS) — connect below for silent printing.</div>
              </div>
            </div>
            <button type="button" onClick={() => alert('Refreshing connected printers...')} style={S.outlineBtn}>🔄 Refresh printers</button>
          </div>

          <div style={S.panel}>
            <button type="button" onClick={() => setOneClickOpen(!oneClickOpen)} style={S.collapseBtn}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left' }}>
                <span style={S.boltIcon}>⚡</span>
                <div>
                  <div style={S.panelTitle}>One-click printing — any printer, nothing to install</div>
                  <div style={S.muted}>Open FoodOS from a special Chrome shortcut and every receipt prints straight to default printer.</div>
                </div>
              </div>
              <span style={{ color: '#6b7280', fontSize: 12 }}>{oneClickOpen ? '⌃' : '⌄'}</span>
            </button>
            {oneClickOpen && (
              <div style={{ ...S.muted, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9', lineHeight: 1.6 }}>
                1. Close Chrome.<br />2. Right-click Chrome shortcut → Properties.<br />3. Append <strong>--kiosk-printing</strong> in Target.
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            <div style={{ ...S.panel, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ ...S.panelTitle, color: '#0f766e' }}>🖨️ Counter Printer</div>
                <div style={{ ...S.muted, marginTop: 2 }}>Used for customer receipts and KOT printing.</div>
              </div>
              {!hasPrinter && (
                <div style={S.infoNote}><span>ⓘ</span><span>No printer saved yet. Select below to save it.</span></div>
              )}
              <div>
                <div style={S.fieldLabel}>Printer</div>
                <select value={printer.printerName || ''} onChange={(e) => setPrinter({ printerName: e.target.value })} style={S.select}>
                  <option value="">Select Printer</option>
                  {printerOptions.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button type="button" onClick={connectUsb} style={S.connectBtn}>⌁ Connect USB</button>
                <button type="button" onClick={connectSerial} style={S.connectBtn}>⇄ Connect Serial</button>
                <button type="button" onClick={connectBle} style={S.connectBtn}>ᛒ Connect BLE</button>
                <button type="button" onClick={addNetwork} style={S.connectBtn}>📶 Add Network</button>
              </div>
              <div>
                <div style={{ ...S.fieldLabel, marginBottom: 6 }}>Documents</div>
                <label style={S.checkRow}><input type="checkbox" checked={printer.printReceiptDoc ?? true} onChange={(e) => setPrinter({ printReceiptDoc: e.target.checked })} /> Print Receipt</label>
                <label style={S.checkRow}><input type="checkbox" checked={printer.printKotDoc ?? false} onChange={(e) => setPrinter({ printKotDoc: e.target.checked })} /> Print KOT</label>
              </div>
            </div>

            <div style={{ ...S.panel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 6, minHeight: 240 }}>
              <div style={{ fontSize: 26 }}>👨‍🍳</div>
              <div style={S.panelTitle}>Kitchen Printer</div>
              {printer.kitchenPrinterName || kitchenOpen ? (
                <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                  <select value={printer.kitchenPrinterName || ''} onChange={(e) => setPrinter({ kitchenPrinterName: e.target.value })} style={S.select}>
                    <option value="">Select Printer</option>
                    {printerOptions.map((p) => (<option key={p} value={p}>{p}</option>))}
                  </select>
                  <button type="button" onClick={() => { setPrinter({ kitchenPrinterName: '' }); setKitchenOpen(false); }} style={S.outlineBtn}>Remove Kitchen Printer</button>
                </div>
              ) : (
                <>
                  <div style={S.muted}>No Kitchen Printer configured.</div>
                  <button type="button" onClick={() => setKitchenOpen(true)} style={{ ...S.outlineBtn, marginTop: 10 }}>+ Configure Kitchen Printer</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {sub === 'receipt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ ...S.panel, flex: '1 1 440px', maxWidth: 580, padding: 16 }}>
              <div style={S.sectionLabel}>RECEIPT DENSITY</div>
              <div style={{ display: 'inline-flex', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
                {['Compact', 'Comfortable'].map((d) => (
                  <button key={d} type="button" onClick={() => setRc({ density: d })} style={{ border: 'none', padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', backgroundColor: rc.density === d ? '#ef4444' : '#fff', color: rc.density === d ? '#fff' : '#374151' }}>{d}</button>
                ))}
              </div>

              {SECTIONS.map((sec) => (
                <div key={sec.title} style={{ marginBottom: 18 }}>
                  <div style={S.sectionLabel}>{sec.title}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'stretch' }}>
                    {sec.items.map((item) => (
                      <ToggleCard key={item.key} item={item} on={!!toggles[item.key]} onToggle={() => flipToggle(item.key)}>
                        {item.input && <input type="text" value={rc.restaurantName || ''} onChange={(e) => setRc({ restaurantName: e.target.value })} style={S.cardInput} />}
                      </ToggleCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...S.panel, flex: '0 0 330px', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Live Preview</span>
                <div style={{ display: 'inline-flex', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                  {['58mm', '80mm'].map((p) => (
                    <button key={p} type="button" onClick={() => setRc({ paperSize: p })} style={{ border: 'none', padding: '4px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer', backgroundColor: (rc.paperSize || '80mm') === p ? '#ef4444' : '#fff', color: (rc.paperSize || '80mm') === p ? '#fff' : '#374151' }}>{p}</button>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 }}>
                <div ref={previewRef}>
                  <div style={paperStyle}>
                    <Center bold>*** TEST PRINT ***</Center>
                    {isOn('restaurantName') && <Center bold size={is58 ? 10 : 11}>{displayName.toUpperCase()}</Center>}
                    {isOn('address') && address && <Center>{address}</Center>}
                    {isOn('phone') && phone && <Center>Ph: {phone}</Center>}
                    {isOn('gstin') && gstin && <Center>GSTIN: {gstin}</Center>}
                    <Dash />
                    <Center bold>TAX INVOICE</Center>
                    <Dash />
                    {isOn('invoiceNo') && <div>Receipt No: INV/000724</div>}
                    {isOn('dateAndTime') && <div>{sampleDate}</div>}
                    <Dash />
                    <ItemRow head name="Item" qty="Qty" rate="Rate" amt="Amount" />
                    <Dash />
                    <ItemRow name="Test Burger" qty="1" rate="₹300.00" amt="₹300.00" />
                    <Dash />
                    <Row bold l="TOTAL" r="₹462.00" />
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleTestPrint} disabled={!hasPrinter} style={{ ...S.outlineBtn, width: '100%', marginTop: 12, opacity: hasPrinter ? 1 : 0.55 }}>🖨️ Test Print</button>
            </div>
          </div>
        </div>
      )}

      {sub === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {RULE_GROUPS.map((g) => (
              <div key={g.title} style={{ ...S.panel, padding: 18 }}>
                <div style={{ ...S.panelTitle, fontSize: 14, marginBottom: 14 }}>{g.title}</div>
                <div style={S.ruleQ}>When should the Receipt print?</div>
                <Radio name={g.receiptKey} checked={rules[g.receiptKey] === 'auto'} onChange={() => setRule(g.receiptKey, 'auto')} label="Automatically after successful payment" />
                <Radio name={g.receiptKey} checked={rules[g.receiptKey] === 'manual'} onChange={() => setRule(g.receiptKey, 'manual')} label="On Demand" />

                <div style={{ ...S.ruleQ, marginTop: 16 }}>When should the KOT print?</div>
                <Radio name={g.kotKey} checked={rules[g.kotKey] === 'auto'} onChange={() => setRule(g.kotKey, 'auto')} label={g.kotAutoLabel} />
                <Radio name={g.kotKey} checked={rules[g.kotKey] === 'manual'} onChange={() => setRule(g.kotKey, 'manual')} label="On Demand" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  heading: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#111827', paddingBottom: 12, borderBottom: '1px solid #e5e7eb' },
  tabs: { display: 'inline-flex', alignSelf: 'flex-start', gap: 2, padding: 3, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 10 },
  tab: { border: 'none', backgroundColor: 'transparent', color: '#111827', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  tabActive: { backgroundColor: '#ef4444', color: '#fff' },
  panel: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, boxSizing: 'border-box' },
  panelTitle: { fontSize: 13, fontWeight: 600, color: '#111827' },
  muted: { fontSize: 11, color: '#6b7280', lineHeight: 1.45 },
  outlineBtn: { backgroundColor: '#fff', color: '#111827', border: '1px solid #d1d5db', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  collapseBtn: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' },
  boltIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 },
  infoNote: { display: 'flex', gap: 8, alignItems: 'flex-start', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 10.5, color: '#4b5563' },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 4 },
  select: { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, outline: 'none' },
  connectBtn: { backgroundColor: '#fff', color: '#111827', border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 10px', fontSize: 10.5, fontWeight: 600, cursor: 'pointer' },
  checkRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#111827', fontWeight: 500, marginBottom: 5, cursor: 'pointer' },
  sectionLabel: { fontSize: 10, fontWeight: 600, color: '#6b7280', letterSpacing: 0.4, marginBottom: 8 },
  card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 11px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: 8 },
  cardLocked: { backgroundColor: '#f9fafb' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardLabel: { fontSize: 11.5, fontWeight: 600, color: '#111827' },
  cardHint: { fontSize: 9.5, color: '#6b7280', marginTop: 1 },
  cardInput: { width: '100%', padding: '6px 9px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 11, outline: 'none' },
  lockIcon: { width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #ef4444', color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 },
  reqBadge: { backgroundColor: '#fee2e2', color: '#ef4444', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4 },
  ruleQ: { fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 8 },
  radioRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#111827', marginBottom: 7, cursor: 'pointer' }
};