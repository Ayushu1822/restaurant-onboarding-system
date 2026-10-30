// FILE: src/components/AdvancedSettingsTab.jsx
import React from 'react';

export default function AdvancedSettingsTab({
  activeTab,
  receiptSubTab,
  setReceiptSubTab,
  formData,
  setFormData,
  toggles,
  handleToggleReceiptField,
  styles,
  sidebarItems
}) {
  return (
    <>
      {/* TAB 8: PRINTERS & RECEIPTS */}
      {activeTab === 'printers' && (
        <div style={styles.sectionGroup}>
          <h3 style={styles.sectionTitle}>🖨️ Printers & Receipts</h3>
          
          <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
            <button type="button" onClick={() => setReceiptSubTab('printers')} style={{...styles.subTabBtn, backgroundColor: receiptSubTab === 'printers' ? '#ef4444' : '#f1f5f9', color: receiptSubTab === 'printers' ? '#fff' : '#334155'}}>Printers</button>
            <button type="button" onClick={() => setReceiptSubTab('receipt')} style={{...styles.subTabBtn, backgroundColor: receiptSubTab === 'receipt' ? '#ef4444' : '#f1f5f9', color: receiptSubTab === 'receipt' ? '#fff' : '#334155'}}>Receipt Configuration</button>
            <button type="button" onClick={() => setReceiptSubTab('rules')} style={{...styles.subTabBtn, backgroundColor: receiptSubTab === 'rules' ? '#ef4444' : '#f1f5f9', color: receiptSubTab === 'rules' ? '#fff' : '#334155'}}>Print Rules</button>
          </div>

          {receiptSubTab === 'printers' && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div style={styles.infoBox}>
                <div style={{fontWeight: '950', color: '#0f172a', marginBottom: '4px'}}>Printing from this device</div>
                <div style={{fontSize: '12px', color: '#059669', fontWeight: '900', marginBottom: '6px'}}>● Direct thermal printing supported</div>
                <div style={{fontSize: '11px', color: '#64748b', fontWeight: '800'}}>USB · Serial · Bluetooth · Bluetooth (BLE) · Network (Epson ePOS) — connect a printer below for silent printing. Nothing to install.</div>
                <button type="button" onClick={() => alert('Refreshing connected printers...')} style={styles.refreshBtn}>🔄 Refresh printers</button>
              </div>

              <div style={styles.grid2}>
                <div style={{backgroundColor: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '20px'}}>
                  <h4 style={{margin: '0 0 4px 0', fontSize: '15px', fontWeight: '950', color: '#0f172a'}}>Counter Printer</h4>
                  <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '16px'}}>Used for customer receipts and optionally KOT printing.</p>

                  <label style={styles.label}>Printer</label>
                  <select style={styles.input} value={formData.printerInfo?.printerName || ''} onChange={e => setFormData({...formData, printerInfo: {...formData.printerInfo, printerName: e.target.value}})}>
                    <option value="">Select Printer</option>
                    <option value="System-Default">Default System Printer</option>
                    <option value="Thermal-80mm">Thermal 80mm USB</option>
                    <option value="Thermal-58mm">Thermal 58mm USB</option>
                  </select>
                </div>

                <div style={{backgroundColor: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                  <div style={{fontSize: '32px', marginBottom: '8px'}}>👨‍🍳</div>
                  <h4 style={{margin: '0 0 4px 0', fontSize: '15px', fontWeight: '950', color: '#0f172a'}}>Kitchen Printer</h4>
                  <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '16px'}}>Optional — a single Counter Printer can print both receipts and KOTs.</p>
                </div>
              </div>
            </div>
          )}

          {receiptSubTab === 'receipt' && (
            <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start'}}>
              <div style={{flex: 1, minWidth: '400px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1.5px solid #e2e8f0', maxHeight: '72vh', overflowY: 'auto'}}>
                <h4 style={{margin: '0 0 10px 0', fontSize: '13px', fontWeight: '950', color: '#64748b'}}>RECEIPT DENSITY</h4>
                <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
                  <button type="button" onClick={() => setFormData({...formData, receiptConfig: {...formData.receiptConfig, density: 'Compact'}})} style={{backgroundColor: formData.receiptConfig?.density === 'Compact' ? '#ef4444' : '#fff', color: formData.receiptConfig?.density === 'Compact' ? '#fff' : '#334155', border: '1.5px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontWeight: '950', fontSize: '12px', cursor: 'pointer'}}>Compact</button>
                  <button type="button" onClick={() => setFormData({...formData, receiptConfig: {...formData.receiptConfig, density: 'Comfortable'}})} style={{backgroundColor: formData.receiptConfig?.density === 'Comfortable' ? '#ef4444' : '#fff', color: formData.receiptConfig?.density === 'Comfortable' ? '#fff' : '#334155', border: '1.5px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontWeight: '950', fontSize: '12px', cursor: 'pointer'}}>Comfortable</button>
                </div>

                <h4 style={{margin: '0 0 12px 0', fontSize: '13px', fontWeight: '950', color: '#64748b'}}>RECEIPT DISPLAY TOGGLES</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.restaurantName ?? true} onChange={() => handleToggleReceiptField('restaurantName')} style={styles.checkbox}/><span style={styles.toggleLabel}>Restaurant Name</span></div>
                  </div>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.address ?? true} onChange={() => handleToggleReceiptField('address')} style={styles.checkbox}/><span style={styles.toggleLabel}>Address</span></div>
                  </div>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.phone ?? true} onChange={() => handleToggleReceiptField('phone')} style={styles.checkbox}/><span style={styles.toggleLabel}>Phone</span></div>
                  </div>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.gstin ?? true} onChange={() => handleToggleReceiptField('gstin')} style={styles.checkbox}/><span style={styles.toggleLabel}>GSTIN</span></div>
                  </div>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.fssai ?? true} onChange={() => handleToggleReceiptField('fssai')} style={styles.checkbox}/><span style={styles.toggleLabel}>FSSAI</span></div>
                  </div>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.invoiceNo ?? true} onChange={() => handleToggleReceiptField('invoiceNo')} style={styles.checkbox}/><span style={styles.toggleLabel}>Invoice Number</span></div>
                  </div>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.dateAndTime ?? true} onChange={() => handleToggleReceiptField('dateAndTime')} style={styles.checkbox}/><span style={styles.toggleLabel}>Date & Time</span></div>
                  </div>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.itemNameQtyAmt ?? true} onChange={() => handleToggleReceiptField('itemNameQtyAmt')} style={styles.checkbox}/><span style={styles.toggleLabel}>Item Name / Qty / Amount</span></div>
                  </div>
                  <div style={styles.toggleRow}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><input type="checkbox" checked={toggles.totalTax ?? true} onChange={() => handleToggleReceiptField('totalTax')} style={styles.checkbox}/><span style={styles.toggleLabel}>Total Tax</span></div>
                  </div>
                </div>
              </div>

              <div style={{width: '380px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1.5px solid #e2e8f0', textAlign: 'center'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'}}>
                  <h4 style={{margin: 0, fontSize: '13px', fontWeight: '950', color: '#64748b'}}>Live Preview</h4>
                  <div style={{display: 'flex', gap: '6px'}}>
                    <button type="button" onClick={() => setFormData({...formData, receiptConfig: {...formData.receiptConfig, paperSize: '58mm'}})} style={{backgroundColor: formData.receiptConfig?.paperSize === '58mm' ? '#ef4444' : '#f1f5f9', color: formData.receiptConfig?.paperSize === '58mm' ? '#fff' : '#334155', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '950', cursor: 'pointer'}}>58 mm</button>
                    <button type="button" onClick={() => setFormData({...formData, receiptConfig: {...formData.receiptConfig, paperSize: '80mm'}})} style={{backgroundColor: formData.receiptConfig?.paperSize === '80mm' ? '#ef4444' : '#f1f5f9', color: formData.receiptConfig?.paperSize === '80mm' ? '#fff' : '#334155', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '950', cursor: 'pointer'}}>80 mm</button>
                  </div>
                </div>

                <div style={{backgroundColor: '#fefefe', border: '1.5px dashed #cbd5e1', padding: '16px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '11px', textAlign: 'left', lineHeight: '1.4', color: '#000'}}>
                  <div style={{textAlign: 'center', fontWeight: 'bold', fontSize: '12px'}}>*** TEST PRINT ***</div>
                  {toggles.restaurantName && <div style={{textAlign: 'center', fontWeight: '950', fontSize: '13px', marginTop: '4px'}}>{formData.receiptConfig?.restaurantName}</div>}
                  {toggles.address && <div style={{textAlign: 'center', color: '#444', fontSize: '10px', margin: '4px 0'}}>{formData.receiptConfig?.address}</div>}
                  {toggles.phone && <div style={{textAlign: 'center', color: '#444', fontSize: '10px'}}>Ph: {formData.receiptConfig?.phone}</div>}
                  {toggles.gstin && <div style={{textAlign: 'center', color: '#444', fontSize: '10px'}}>GSTIN: {formData.receiptConfig?.gstin}</div>}
                  <div style={{borderTop: '1px dashed #000', margin: '6px 0'}}></div>
                  {toggles.invoiceNo && <div>Invoice #: INV-000724</div>}
                  {toggles.dateAndTime && <div>Date: 29 Oct 2026, 7:19 am</div>}
                  <div style={{borderTop: '1px dashed #000', margin: '6px 0'}}></div>
                  {toggles.itemNameQtyAmt && (
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}><span>Item</span><span>Qty Amt</span></div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Paneer Tikka</span><span>2 400.00</span></div>
                    </div>
                  )}
                  <div style={{borderTop: '1px dashed #000', margin: '6px 0'}}></div>
                  {toggles.totalTax && <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Total Tax:</span><span>₹20.00</span></div>}
                  <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}><span>TOTAL:</span><span>₹420.00</span></div>
                </div>
              </div>
            </div>
          )}

          {receiptSubTab === 'rules' && (
            <div style={styles.grid3}>
              <div style={styles.ruleCard}>
                <h4 style={{margin: '0 0 14px 0', fontSize: '15px', fontWeight: '950', color: '#0f172a'}}>Counter Orders</h4>
                <label style={styles.ruleLabel}>When should the Receipt print?</label>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px'}}>
                  <label style={styles.radioLabel}><input type="radio" name="counterReceipt" defaultChecked/> Automatically after successful payment</label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 9: SYSTEM */}
      {activeTab === 'system' && (
        <div style={styles.sectionGroup}>
          <h3 style={styles.sectionTitle}>⚙️ System Configuration</h3>
          <div style={styles.infoBox}>
            <div style={{fontWeight: '950', color: '#0f172a', marginBottom: '4px'}}>System Preferences & Maintenance</div>
            <div style={{fontSize: '12px', color: '#64748b', fontWeight: '800'}}>Manage backend logs, cache clearing, system diagnostics, and hardware integration endpoints.</div>
          </div>
        </div>
      )}
    </>
  );
}