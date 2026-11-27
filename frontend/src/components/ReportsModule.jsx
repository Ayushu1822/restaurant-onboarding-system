import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  'http://localhost:8080'
).replace(/\/$/, '');

export default function ReportsModule({ orders: parentOrders }) {
  const { t, translateDbValue, getLocalizedField } = useLanguage();
  const [orders, setOrders] = useState(parentOrders || []);
  const [closedComplaints, setClosedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Receipt Configuration state synced with Settings Module (Clean footer default)
  const [receiptConfig, setReceiptConfig] = useState({
    restaurantName: 'LINGA FOODS',
    headerText: 'Linga Foods - Wonghikal',
    address: 'LINGA FOODS, No. 1540, Vellore Main Road, Wonghikal, Tiruvannamalai, Tamil Nadu 606604',
    phone: '91234400635',
    gstin: '37AAFP4128L1ZI',
    fssai: 'FSSAI: 22426260001195',
    footerNote: 'Thank You For Visiting Us!\nHave a wonderful dining experience with us.',
    paperSize: '80mm',
    density: 'Compact',
    toggles: {
      restaurantName: true,
      address: true,
      phone: true,
      gstin: true,
      fssai: true,
      invoiceNo: true,
      dateAndTime: true,
      itemNameQtyAmt: true,
      totalTax: true
    }
  });

  // Filter States
  const [dateRange, setDateRange] = useState('today');
  const [orderChannelFilter, setOrderChannelFilter] = useState('ALL');
  const [selectedCaptainFilter, setSelectedCaptainFilter] = useState('ALL');

  const [historyDateRange, setHistoryDateRange] = useState('all');
  const [historyChannelFilter, setHistoryChannelFilter] = useState('ALL');

  const [analyticsDateRange, setAnalyticsDateRange] = useState('today');
  const [analyticsCategoryFilter, setAnalyticsCategoryFilter] = useState('ALL');

  const [captainDateRange, setCaptainDateRange] = useState('today');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [selectedCaptainDetails, setSelectedCaptainDetails] = useState(null);

  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    const loggedInEmail = localStorage.getItem('userEmail') || 'novio@gmail.com';

    // Fetch Restaurant Profile to sync receiptConfig
    fetch(`${API_BASE_URL}/api/v1/restaurants/email/${loggedInEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.receiptConfig) {
          const parsedCfg = typeof data.receiptConfig === 'string' ? JSON.parse(data.receiptConfig) : data.receiptConfig;
          setReceiptConfig(prev => ({ ...prev, ...parsedCfg }));
        }
      })
      .catch(err => console.log("Profile fetch error:", err));

    fetch(`${API_BASE_URL}/api/v1/orders?email=${loggedInEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reports orders:", err);
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/api/v1/complaints?email=${loggedInEmail}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClosedComplaints(data.filter(c => c.status && c.status.toLowerCase() === 'closed'));
        }
      })
      .catch(err => console.error("Error fetching complaints for reports:", err));
  };

  const getSafeTimestamp = (order, index) => {
    if (order.timestamp) {
      let ts = String(order.timestamp);
      const m = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i);
      if (m) {
        let h = Number(m[4]) % 12;
        if (m[7].toLowerCase() === 'pm') h += 12;
        const parsed = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), h, Number(m[5]), Number(m[6] || 0));
        if (!isNaN(parsed.getTime())) return parsed;
      }
      ts = ts.replace(/\.(\d{3})\d+/, '.$1');
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }
    const fallbackDate = new Date();
    fallbackDate.setHours(fallbackDate.getHours() - index);
    return fallbackDate;
  };

  const extractCaptain = (customerName) => {
    const cName = customerName || '';
    if (cName.includes('(') && cName.includes(')')) {
      const match = cName.match(/\(([^)]+)\)/);
      if (match) return match[1].trim();
    }
    return null;
  };

  const allCaptains = ['ALL', ...new Set(orders.map(o => extractCaptain(o.customerName)).filter(Boolean))];

  const checkDateMatch = (orderDate, range) => {
    if (range === 'all') return true;
    const now = new Date();
    if (range === 'today') {
      return orderDate.toDateString() === now.toDateString();
    } else if (range === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return orderDate.toDateString() === yesterday.toDateString();
    } else if (range === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return orderDate >= oneWeekAgo && orderDate <= now;
    } else if (range === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (range === 'year') {
      return orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredOrders = orders.filter((o) => {
    const st = (o.status || 'New').toLowerCase();
    const isSettledOrDone = st === 'completed' || st === 'delivered' || st === 'settled' || st === 'paid' || st === 'picked up';
    if (isSettledOrDone) return false;

    let matchesChannel = true;
    const channel = (o.channel || 'COUNTER').toUpperCase();
    const disp = (o.displayId || '').toUpperCase();
    if (orderChannelFilter === 'TABLE') {
      matchesChannel = disp.includes('TABLE') || (o.orderType || '').toLowerCase().includes('dine');
    } else if (orderChannelFilter === 'COUNTER') {
      matchesChannel = channel === 'COUNTER' && !disp.includes('TABLE');
    } else if (orderChannelFilter === 'ONLINE') {
      matchesChannel = channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP';
    }

    let matchesCaptain = true;
    const orderCaptain = extractCaptain(o.customerName);
    if (selectedCaptainFilter !== 'ALL') {
      matchesCaptain = orderCaptain === selectedCaptainFilter;
    }

    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const cName = (o.customerName || '').toLowerCase();
      const oId = (o.displayId || o.orderId || '').toLowerCase();
      matchesSearch = cName.includes(q) || oId.includes(q);
    }

    return matchesChannel && matchesCaptain && matchesSearch;
  });

  const activeBreakdownOrders = filteredOrders;

  const completedHistoryOrders = orders.filter((o, idx) => {
    const st = (o.status || 'New').toLowerCase();
    const isFinished = st === 'completed' || st === 'delivered' || st === 'picked up' || st === 'settled' || st === 'paid';
    if (!isFinished) return false;

    const orderDate = getSafeTimestamp(o, idx);
    let matchesDate = checkDateMatch(orderDate, historyDateRange);

    let matchesChannel = true;
    const channel = (o.channel || 'COUNTER').toUpperCase();
    const disp = (o.displayId || '').toUpperCase();
    if (historyChannelFilter === 'TABLE') {
      matchesChannel = disp.includes('TABLE') || (o.orderType || '').toLowerCase().includes('dine');
    } else if (historyChannelFilter === 'COUNTER') {
      matchesChannel = channel === 'COUNTER' && !disp.includes('TABLE');
    } else if (historyChannelFilter === 'ONLINE') {
      matchesChannel = channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP';
    }

    return matchesDate && matchesChannel;
  });

  const analyticsOrders = orders.filter((o, idx) => {
    const orderDate = getSafeTimestamp(o, idx);
    let matchesDate = checkDateMatch(orderDate, analyticsDateRange);

    let matchesCat = true;
    if (analyticsCategoryFilter !== 'ALL') {
      const channel = (o.channel || 'COUNTER').toUpperCase();
      const disp = (o.displayId || '').toUpperCase();
      if (analyticsCategoryFilter === 'TABLE') matchesCat = disp.includes('TABLE') || (o.orderType || '').toLowerCase().includes('dine');
      if (analyticsCategoryFilter === 'COUNTER') matchesCat = channel === 'COUNTER' && !disp.includes('TABLE');
      if (analyticsCategoryFilter === 'ONLINE') matchesCat = channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP';
    }
    return matchesDate && matchesCat;
  });

  const totalRevenue = analyticsOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const totalOrdersCount = analyticsOrders.length;

  let tableRev = 0, counterRev = 0, onlineRev = 0;
  analyticsOrders.forEach(o => {
    const rev = Number(o.totalAmount) || 0;
    const channel = (o.channel || 'COUNTER').toUpperCase();
    const disp = (o.displayId || '').toUpperCase();
    if (disp.includes('TABLE') || (o.orderType || '').toLowerCase().includes('dine')) {
      tableRev += rev;
    } else if (channel === 'ZOMATO' || channel === 'SWIGGY' || channel === 'WHATSAPP') {
      onlineRev += rev;
    } else {
      counterRev += rev;
    }
  });

  const tablePct = totalRevenue > 0 ? (tableRev / totalRevenue) * 100 : 0;
  const counterPct = totalRevenue > 0 ? (counterRev / totalRevenue) * 100 : 0;
  const onlinePct = totalRevenue > 0 ? (onlineRev / totalRevenue) * 100 : 0;

  const p1 = tablePct;
  const p2 = tablePct + counterPct;
  const dynamicPieBackground = totalRevenue > 0
    ? `conic-gradient(#059669 0% ${p1}%, #2563eb ${p1}% ${p2}%, #d97706 ${p2}% 100%)`
    : '#e2e8f0';

  const captainMap = {};
  orders.forEach((o, idx) => {
    const capName = extractCaptain(o.customerName);
    if (capName) {
      const orderDate = getSafeTimestamp(o, idx);
      if (checkDateMatch(orderDate, captainDateRange)) {
        if (!captainMap[capName]) {
          captainMap[capName] = { orderCount: 0, revenue: 0, orders: [] };
        }
        captainMap[capName].orderCount += 1;
        captainMap[capName].revenue += Number(o.totalAmount || 0);
        captainMap[capName].orders.push(o);
      }
    }
  });

  const sortedCaptainKeys = Object.keys(captainMap).sort((a, b) => {
    if (a.toLowerCase().includes('unassigned') || a.toLowerCase().includes('counter')) return 1;
    if (b.toLowerCase().includes('unassigned') || b.toLowerCase().includes('counter')) return -1;
    return a.localeCompare(b);
  });

  const formatCaptainDisplay = (capName) => {
    if (!capName) return t('tbUnassignedLabel');
    if (capName.toLowerCase() === 'unassigned') return t('tbUnassignedLabel');
    return capName;
  };

  // 🖨️ Thermal Receipt Printer Utility
  const printSingleReceipt = (o, index) => {
    let dateStr = o.timestamp;
    if (!dateStr) {
      const orderDateObj = getSafeTimestamp(o, index);
      dateStr = orderDateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }

    const items = o.items || o.orderItems || [];
    const toggles = receiptConfig.toggles || {};

    let printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      alert(t('popupBlockedToast'));
      return;
    }

    const itemsHtml = items.map(it => {
      const rawName = it.itemName || it.name || t('defaultFoodItem');
      const itemLabel = getLocalizedField(it, 'itemName') || getLocalizedField(it, 'name') || rawName;
      return `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>${it.quantity || it.qty || 1}x ${itemLabel}</span>
          <span>₹${((Number(it.unitPrice || it.price) || 0) * (Number(it.quantity || it.qty) || 1)).toFixed(2)}</span>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${t('receiptTitlePrefix')} - ${o.displayId || o.orderId || t('orderWord')}</title>
          <style>
            body { font-family: monospace; padding: 16px; color: #000; background: #fff; width: ${receiptConfig.paperSize === '58mm' ? '58mm' : '80mm'}; margin: 0 auto; font-size: ${receiptConfig.density === 'Compact' ? '10px' : '12px'}; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          ${toggles.restaurantName ? `<div class="center bold" style="font-size: 14px;">${receiptConfig.restaurantName}</div>` : ''}
          ${receiptConfig.headerText ? `<div class="center" style="font-size: 10px; color: #333;">${receiptConfig.headerText}</div>` : ''}
          ${toggles.address && receiptConfig.address ? `<div class="center" style="font-size: 10px; color: #333; margin: 3px 0;">${receiptConfig.address}</div>` : ''}
          ${toggles.phone && receiptConfig.phone ? `<div class="center" style="font-size: 10px; color: #333;">${t('receiptPhoneShort')}: ${receiptConfig.phone}</div>` : ''}
          ${toggles.gstin && receiptConfig.gstin ? `<div class="center" style="font-size: 10px; color: #333;">GSTIN: ${receiptConfig.gstin}</div>` : ''}
          ${receiptConfig.fssai ? `<div class="center" style="font-size: 10px; color: #333; margin-bottom: 6px;">${receiptConfig.fssai}</div>` : ''}
          <div className="line"></div>
          ${toggles.invoiceNo ? `<div><strong>${t('receiptOrderId')}:</strong> ${o.displayId || o.orderId || 'N/A'}</div>` : ''}
          ${toggles.dateAndTime ? `<div><strong>${t('receiptDate')}:</strong> ${dateStr}</div>` : ''}
          <div><strong>${t('receiptCustomer')}:</strong> ${o.customerName || t('kdsWalkIn')}</div>
          <div><strong>${t('tbCaptainLabel')}:</strong> ${formatCaptainDisplay(extractCaptain(o.customerName))}</div>
          <div><strong>${t('rpChannelCol')}:</strong> ${translateDbValue(o.channel || 'COUNTER')}</div>
          <div><strong>${t('rpStatusCol')}:</strong> ${translateDbValue(o.status || 'Completed')}</div>
          <div className="line"></div>
          <div className="bold" style="margin-bottom: 6px;">${t('receiptItemsHeading')}:</div>
          ${itemsHtml}
          <div className="line"></div>
          <div className="flex"><span>${t('subtotal')}:</span><span>₹${(o.subtotal || o.totalAmount || 0).toFixed(2)}</span></div>
          ${toggles.totalTax ? `<div className="flex"><span>${t('posTaxLabel')}:</span><span>₹${(o.totalTax || 0).toFixed(2)}</span></div>` : ''}
          <div className="flex bold" style="font-size: 13px; margin-top: 6px;"><span>${t('total')}:</span><span>₹${o.totalAmount || 0}</span></div>
          <div className="line"></div>
          <div className="center" style="font-size: 10px; white-space: pre-line; margin-top: 6px;">${receiptConfig.footerNote}</div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 📊 Professional Styled Excel (.xls) Export Utility
  const exportToExcelXLS = (dataList, filename) => {
    if (!dataList || dataList.length === 0) {
      alert(t('rpNoExportDataAlert'));
      return;
    }

    const rowsHtml = dataList.map(o => `
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px; mso-number-format:'\@';">${o.displayId || o.orderId || ''}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${o.customerName || t('kdsWalkIn')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${translateDbValue(o.channel || 'COUNTER')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${translateDbValue(o.status || '')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; mso-number-format:'Currency';">₹${o.totalAmount || 0}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${o.timestamp || new Date().toISOString()}</td>
      </tr>
    `).join('');

    const htmlTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; font-size: 11pt; }
            th { background-color: #059669; color: #ffffff; font-weight: bold; border: 1px solid #047857; padding: 10px; text-align: left; }
            td { vertical-align: middle; }
          </style>
        </head>
        <body>
          <h2>${receiptConfig.restaurantName} - ${t('rpReportExportSuffix')}</h2>
          <p>${t('rpGeneratedOnLabel')}: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          <table>
            <thead>
              <tr>
                <th>${t('receiptOrderId')}</th>
                <th>${t('rpCustomerNameCol')}</th>
                <th>${t('rpChannelCol')}</th>
                <th>${t('rpStatusCol')}</th>
                <th>${t('rpTotalAmountCol')}</th>
                <th>${t('rpTimestampCol')}</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlTemplate], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simple Print for Active Orders
  const printSimpleActiveOrders = () => {
    let printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;

    const rowsHtml = activeBreakdownOrders.map((o) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.displayId || o.orderId}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.customerName || t('kdsWalkIn')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${translateDbValue(o.channel || 'COUNTER')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${translateDbValue(o.status || 'New')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">₹${o.totalAmount || 0}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <html>
        <head><title>${t('rpActiveOrdersPrintTitle')}</title></head>
        <body style="font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b;">
          <h2 style="margin-bottom: 5px;">${receiptConfig.restaurantName} - ${t('rpActiveOrdersPrintTitle')}</h2>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">${t('rpGeneratedOnLabel')}: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</p>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px;">${t('receiptOrderId')}</th>
                <th style="padding: 10px;">${t('receiptCustomer')}</th>
                <th style="padding: 10px;">${t('rpChannelCol')}</th>
                <th style="padding: 10px;">${t('rpStatusCol')}</th>
                <th style="padding: 10px;">${t('total')}</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  const printBulkHistory = () => {
    let printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;

    const rowsHtml = completedHistoryOrders.map((o) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.displayId || o.orderId}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.customerName || t('kdsWalkIn')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${translateDbValue(o.channel || 'COUNTER')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${translateDbValue(o.status || 'Completed')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">₹${o.totalAmount || 0}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <html>
        <head><title>${t('rpCompletedHistoryPrintTitle')}</title></head>
        <body style="font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b;">
          <h2 style="margin-bottom: 5px;">${receiptConfig.restaurantName} - ${t('rpCompletedHistoryPrintTitle')}</h2>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">${t('rpGeneratedOnLabel')}: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</p>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px;">${t('receiptOrderId')}</th>
                <th style="padding: 10px;">${t('receiptCustomer')}</th>
                <th style="padding: 10px;">${t('rpChannelCol')}</th>
                <th style="padding: 10px;">${t('rpStatusCol')}</th>
                <th style="padding: 10px;">${t('total')}</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  // Captain Ledger Print
  const printCaptainLedger = (captainName, capOrders) => {
    let printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;

    const rowsHtml = capOrders.map((o) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.displayId || o.orderId}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${o.customerName || t('kdsWalkIn')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${translateDbValue(o.channel || 'COUNTER')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${translateDbValue(o.status || 'Completed')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">₹${o.totalAmount || 0}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <html>
        <head><title>${t('rpCaptainReportPrefix')}: ${captainName}</title></head>
        <body style="font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b;">
          <h2 style="margin-bottom: 5px;">${t('rpCaptainReportPrefix')}: ${captainName}</h2>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">${t('rpGeneratedOnLabel')}: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px;">${t('receiptOrderId')}</th>
                <th style="padding: 10px;">${t('receiptCustomer')}</th>
                <th style="padding: 10px;">${t('rpChannelCol')}</th>
                <th style="padding: 10px;">${t('rpStatusCol')}</th>
                <th style="padding: 10px;">${t('total')}</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  // Complaints Print
  const printComplaintsReport = () => {
    let printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;
    const rowsHtml = closedComplaints.map(c => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${c.complaintId}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${c.orderId}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${c.customerName || t('rpGuestWord')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${c.complaintType}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #10b981; font-weight: bold;">${t('rpClosedLabel')}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <html>
        <head><title>${t('rpResolvedComplaintsPrintTitle')}</title></head>
        <body style="font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b;">
          <h2>${t('rpResolvedComplaintsPrintTitle')}</h2>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; margin-top: 15px;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px;">${t('rpComplaintIdCol')}</th>
                <th style="padding: 10px;">${t('receiptOrderId')}</th>
                <th style="padding: 10px;">${t('receiptCustomer')}</th>
                <th style="padding: 10px;">${t('rpTypeCol')}</th>
                <th style="padding: 10px;">${t('rpStatusCol')}</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  // Revenue Report Print
  const printRevenueReport = () => {
    let printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head><title>${t('rpRevenueAnalyticsPrintTitle')}</title></head>
        <body style="font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b;">
          <h2>${t('rpRevenueAnalyticsPrintTitle')}</h2>
          <p><strong>${t('rpTotalRevenueMetric')}:</strong> ₹${totalRevenue.toFixed(2)}</p>
          <p><strong>${t('rpTotalOrdersMetric')}:</strong> ${totalOrdersCount}</p>
          <p><strong>${t('rpDineInTableRevLabel')}:</strong> ₹${tableRev.toFixed(2)} (${tablePct.toFixed(1)}%)</p>
          <p><strong>${t('rpCounterRevLabel')}:</strong> ₹${counterRev.toFixed(2)} (${counterPct.toFixed(1)}%)</p>
          <p><strong>${t('rpOnlineRevLabel')}:</strong> ₹${onlineRev.toFixed(2)} (${onlinePct.toFixed(1)}%)</p>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  const customerHistoryMap = {};
  orders.forEach(o => {
    const name = o.customerName || t('kdsWalkInGuest');
    if (!customerHistoryMap[name]) customerHistoryMap[name] = [];
    customerHistoryMap[name].push(o);
  });

  return (
    <div className="rp">
      <style>{css}</style>

      {/* Top Header */}
      <div className="rp-header">
        <div>
          <h2 className="rp-title">{t('rpHubTitle')}</h2>
          <p className="rp-subtitle">
            {t('rpHubSubtitle')}
          </p>
        </div>
      </div>

      <div className="printable-report-area rp-stack">

        {/* SECTION 1: ACTIVE ORDERS REPORT */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">📋 {t('rpActiveOrdersTitle')}</h3>
              <p className="rp-section-desc">{t('rpActiveOrdersDesc')}</p>
            </div>
            <div className="rp-tools">
              <button onClick={() => exportToExcelXLS(activeBreakdownOrders, 'Active_Orders')} className="rp-pill-btn" style={{ background: '#059669' }}>📊 {t('rpExportExcelBtn')}</button>
              <button onClick={printSimpleActiveOrders} className="rp-pill-btn">🖨️ {t('rpSimplePrintBtn')}</button>
            </div>
          </div>

          <div className="rp-filters">
            <input
              type="text"
              placeholder={`🔍 ${t('rpSearchCustomerOrderPlaceholder')}`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="rp-search"
            />
            <select value={orderChannelFilter} onChange={e => setOrderChannelFilter(e.target.value)} className="rp-select">
              <option value="ALL">{t('rpAllChannelsOpt')}</option>
              <option value="TABLE">{t('rpTableOrdersOpt')}</option>
              <option value="COUNTER">{t('rpCounterPosOpt')}</option>
              <option value="ONLINE">{t('rpOnlineAggregatorsOpt')}</option>
            </select>
            <select value={selectedCaptainFilter} onChange={e => setSelectedCaptainFilter(e.target.value)} className="rp-select">
              {allCaptains.map((cap, cIdx) => (
                <option key={cIdx} value={cap}>{cap === 'ALL' ? t('rpAllCaptainsOpt') : formatCaptainDisplay(cap)}</option>
              ))}
            </select>
          </div>

          {activeBreakdownOrders.length === 0 ? (
            <div className="rp-empty">{t('rpNoActiveOrdersFilter')}</div>
          ) : (
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>{t('receiptOrderId')}</th>
                    <th>{t('receiptCustomer')}</th>
                    <th>{t('rpChannelTypeCol')}</th>
                    <th>{t('tbCaptainLabel')}</th>
                    <th>{t('rpStatusCol')}</th>
                    <th>{t('rpTotalAmountCol')}</th>
                    <th>{t('rpActionsCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBreakdownOrders.map((o, idx) => (
                    <tr key={idx}>
                      <td><strong className="rp-strong">{o.displayId || o.orderId}</strong></td>
                      <td>{o.customerName || t('kdsWalkIn')}</td>
                      <td><span className="rp-badge">{translateDbValue(o.channel || 'COUNTER')}</span></td>
                      <td className="rp-captain-cell">{formatCaptainDisplay(extractCaptain(o.customerName))}</td>
                      <td>
                        <span className={`rp-status ${(o.status || 'New').toLowerCase() === 'ready' ? 'is-ready' : ''}`}>
                          {translateDbValue(o.status || 'New')}
                        </span>
                      </td>
                      <td className="rp-amount">₹{o.totalAmount || 0}</td>
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => printSingleReceipt(o, idx)} className="rp-receipt-btn" title={t('rpPrintReceiptTitle')}>🖨️ {t('rpReceiptShortBtn')}</button>
                        <button onClick={() => setSelectedCustomerHistory(o.customerName || t('kdsWalkInGuest'))} className="rp-history-btn">🔍 {t('rpHistoryBtn')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 2: PAST ORDERS HISTORY & RECEIPTS */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">📦 {t('rpPastOrdersTitle')}</h3>
              <p className="rp-section-desc">{t('rpPastOrdersDesc')}</p>
            </div>
            <div className="rp-tools">
              <select value={historyDateRange} onChange={e => setHistoryDateRange(e.target.value)} className="rp-select">
                <option value="all">{t('rpAllTimeDefaultOpt')}</option>
                <option value="today">{t('rpRangeToday')}</option>
                <option value="yesterday">{t('rpRangeYesterday')}</option>
                <option value="week">{t('rpRangeWeek')}</option>
                <option value="month">{t('rpRangeMonth')}</option>
                <option value="year">{t('rpRangeYear')}</option>
              </select>
              <button onClick={() => exportToExcelXLS(completedHistoryOrders, 'Completed_Orders_History')} className="rp-pill-btn" style={{ background: '#059669' }}>📊 {t('rpExportExcelBtn')}</button>
              <button onClick={printBulkHistory} className="rp-pill-btn">🖨️ {t('rpPrintWholeLedgerBtn')}</button>
            </div>
          </div>

          {completedHistoryOrders.length === 0 ? (
            <div className="rp-empty">{t('rpNoPastCompletedOrders')}</div>
          ) : (
            <div className="rp-list rp-list-400">
              {completedHistoryOrders.map((o, idx) => (
                <div
                  key={idx}
                  className="rp-hist-row"
                  onMouseEnter={() => setHoveredCard(`hist-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="rp-row-left">
                    <span className="rp-hist-id">{o.displayId || o.orderId}</span>
                    <span className="rp-badge">{translateDbValue(o.channel || 'COUNTER')}</span>
                    <span className="rp-hist-customer">👤 {o.customerName || t('kdsWalkIn')}</span>
                    <span className="rp-hist-status">{t('kdsStatusLabel')} {translateDbValue(o.status)}</span>
                  </div>
                  <div className="rp-row-right">
                    <span className="rp-hist-amount">₹{o.totalAmount || 0}</span>
                    <button onClick={() => printSingleReceipt(o, idx)} className="rp-receipt-btn">🖨️ {t('rpReceiptShortBtn')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: CAPTAINS PERFORMANCE REPORT */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">🧑‍✈️ {t('rpCaptainsPerfTitle')}</h3>
              <p className="rp-section-desc">{t('rpCaptainsPerfDesc')}</p>
            </div>
            <div className="rp-tools">
              <select value={captainDateRange} onChange={e => setCaptainDateRange(e.target.value)} className="rp-select">
                <option value="today">{t('rpRangeToday')}</option>
                <option value="yesterday">{t('rpRangeYesterday')}</option>
                <option value="week">{t('rpRangeWeek')}</option>
                <option value="month">{t('rpRangeMonth')}</option>
                <option value="year">{t('rpRangeYear')}</option>
                <option value="all">{t('rpRangeAllTime')}</option>
              </select>
            </div>
          </div>

          {sortedCaptainKeys.length === 0 ? (
            <div className="rp-empty">{t('rpNoCaptainAssignments')}</div>
          ) : (
            <div className="rp-cap-grid">
              {sortedCaptainKeys.map((capName, cIdx) => {
                const capDisplay = formatCaptainDisplay(capName);
                return (
                  <div
                    key={cIdx}
                    onClick={() => setSelectedCaptainDetails({ name: capDisplay, orders: captainMap[capName].orders })}
                    className="rp-cap-card"
                    onMouseEnter={() => setHoveredCard(`cap-${cIdx}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="rp-cap-top">
                      <span className="rp-cap-name">🧑‍✈️ {capDisplay}</span>
                      <span className="rp-cap-inspect">{t('rpInspectWord')} ›</span>
                    </div>
                    <div className="rp-cap-line">{t('rpOrdersManagedLabel')}: <strong className="rp-blue">{captainMap[capName].orderCount}</strong></div>
                    <div className="rp-cap-line">{t('rpRevenueGeneratedLabel')}: <strong className="rp-green">₹{captainMap[capName].revenue}</strong></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: PAST COMPLAINTS ARCHIVE */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">✅ {t('rpClosedComplaintsTitle')}</h3>
              <p className="rp-section-desc">{t('rpClosedComplaintsDesc')}</p>
            </div>
            <div className="rp-tools">
              <button onClick={() => exportToExcelXLS(closedComplaints, 'Resolved_Complaints')} className="rp-pill-btn" style={{ background: '#059669' }}>📊 {t('rpExportExcelBtn')}</button>
              <button onClick={printComplaintsReport} className="rp-pill-btn">🖨️ {t('rpPrintComplaintsBtn')}</button>
            </div>
          </div>

          {closedComplaints.length === 0 ? (
            <div className="rp-empty">{t('rpNoClosedComplaints')}</div>
          ) : (
            <div className="rp-list rp-list-350">
              {closedComplaints.map((c, idx) => (
                <div key={idx} className="rp-complaint-row">
                  <div className="rp-row-left">
                    <span className="rp-hist-id">{c.complaintId}</span>
                    <span className="rp-badge">{c.orderId}</span>
                    <span className="rp-hist-customer">👤 {c.customerName || t('rpGuestWord')}</span>
                    <span className="rp-complaint-type">{c.complaintType}</span>
                  </div>
                  <span className="rp-closed">● {t('rpClosedLabel')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: REVENUE DISTRIBUTION & ANALYTICS */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div>
              <h3 className="rp-section-title">📊 {t('rpRevenueAnalyticsTitle')}</h3>
              <p className="rp-section-desc">{t('rpRevenueAnalyticsDesc')}</p>
            </div>
            <div className="rp-tools">
              <select value={analyticsCategoryFilter} onChange={e => setAnalyticsCategoryFilter(e.target.value)} className="rp-select">
                <option value="ALL">{t('rpAllCategoriesOpt')}</option>
                <option value="TABLE">{t('rpTableOrdersOpt')}</option>
                <option value="COUNTER">{t('rpCounterPosOpt')}</option>
                <option value="ONLINE">{t('rpOnlineOpt')}</option>
              </select>
              <select value={analyticsDateRange} onChange={e => setAnalyticsDateRange(e.target.value)} className="rp-select">
                <option value="today">{t('rpRangeToday')}</option>
                <option value="yesterday">{t('rpRangeYesterday')}</option>
                <option value="week">{t('rpRangeWeek')}</option>
                <option value="month">{t('rpRangeMonth')}</option>
                <option value="year">{t('rpRangeYear')}</option>
                <option value="all">{t('rpRangeAllTime')}</option>
              </select>
              <button onClick={() => exportToExcelXLS(analyticsOrders, 'Revenue_Analytics')} className="rp-pill-btn" style={{ background: '#059669' }}>📊 {t('rpExportExcelBtn')}</button>
              <button onClick={printRevenueReport} className="rp-pill-btn">🖨️ {t('rpPrintAnalyticsBtn')}</button>
            </div>
          </div>

          <div className="rp-metrics">
            <div className="rp-metric">
              <div className="rp-metric-title">{t('rpTotalRevenueMetric')}</div>
              <div className="rp-metric-value">₹{totalRevenue.toFixed(2)}</div>
            </div>
            <div className="rp-metric">
              <div className="rp-metric-title">{t('rpTotalOrdersMetric')}</div>
              <div className="rp-metric-value is-blue">{totalOrdersCount}</div>
            </div>
            <div className="rp-metric">
              <div className="rp-metric-title">{t('rpAvgOrderValueMetric')}</div>
              <div className="rp-metric-value is-amber">
                ₹{totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Dynamic Pie Chart Visual */}
          <div className="rp-chart">
            {analyticsOrders.length === 0 ? (
              <div className="rp-empty">{t('rpNoRevenueData')}</div>
            ) : (
              <>
                <div className="rp-pie" style={{ background: dynamicPieBackground }}>
                  <div className="rp-pie-center">
                    ₹{totalRevenue.toFixed(0)}
                  </div>
                </div>
                <div className="rp-legend">
                  <span className="rp-legend-item is-dine">■ {t('rpLegendDineIn')} ({tablePct.toFixed(1)}%)</span>
                  <span className="rp-legend-item is-counter">■ {t('rpLegendCounter')} ({counterPct.toFixed(1)}%)</span>
                  <span className="rp-legend-item is-online">■ {t('rpLegendOnline')} ({onlinePct.toFixed(1)}%)</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* CAPTAIN DETAILED ORDERS MODAL */}
      {selectedCaptainDetails && (
        <div className="rp-overlay" onClick={() => setSelectedCaptainDetails(null)}>
          <div className="rp-modal rp-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-head">
              <h3 className="rp-modal-title">
                🧑‍✈️ {t('rpCaptainLedgerPrefix')}: {selectedCaptainDetails.name} ({selectedCaptainDetails.orders.length} {t('statOrders')})
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => exportToExcelXLS(selectedCaptainDetails.orders, `Captain_${selectedCaptainDetails.name}`)} className="rp-pill-btn" style={{ padding: '8px 12px', fontSize: '12px', background: '#059669' }}>📊 {t('rpExcelShort')}</button>
                <button onClick={() => printCaptainLedger(selectedCaptainDetails.name, selectedCaptainDetails.orders)} className="rp-pill-btn" style={{ padding: '8px 12px', fontSize: '12px' }}>🖨️ {t('rpPrintShort')}</button>
                <button onClick={() => setSelectedCaptainDetails(null)} className="rp-close-x">✕</button>
              </div>
            </div>

            <div className="rp-modal-list rp-modal-list-420">
              {selectedCaptainDetails.orders.map((ord, oIdx) => (
                <div key={oIdx} className="rp-modal-row">
                  <div>
                    <div className="rp-mr-id">{ord.displayId || ord.orderId || t('orderWord')}</div>
                    <div className="rp-mr-customer">
                      👤 {ord.customerName || t('kdsWalkIn')} {ord.customerPhone ? `• 📞 ${ord.customerPhone}` : ''}
                    </div>
                    <div className="rp-mr-meta">
                      {t('kdsStatusLabel')} <span className="rp-green">{translateDbValue(ord.status || 'Completed')}</span> · {t('rpChannelCol')}: {translateDbValue(ord.channel || 'COUNTER')}
                    </div>
                  </div>
                  <div className="rp-mr-right">
                    <div className="rp-mr-amount">₹{ord.totalAmount || 0}</div>
                    <button onClick={() => printSingleReceipt(ord, oIdx)} className="rp-receipt-btn rp-mt">🖨️ {t('rpReceiptShortBtn')}</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedCaptainDetails(null)} className="rp-modal-close">{t('rpCloseCaptainLedgerBtn')}</button>
          </div>
        </div>
      )}

      {/* CUSTOMER HISTORY MODAL */}
      {selectedCustomerHistory && (
        <div className="rp-overlay" onClick={() => setSelectedCustomerHistory(null)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-head">
              <h3 className="rp-modal-title">👤 {t('rpCustomerHistoryPrefix')}: {selectedCustomerHistory}</h3>
              <button onClick={() => setSelectedCustomerHistory(null)} className="rp-close-x">✕</button>
            </div>
            <div className="rp-modal-list rp-modal-list-300">
              {(customerHistoryMap[selectedCustomerHistory] || []).map((pastOrder, pIdx) => (
                <div key={pIdx} className="rp-modal-row">
                  <div>
                    <div className="rp-mr-id">{pastOrder.displayId || t('orderWord')}</div>
                    <div className="rp-mr-status">{translateDbValue(pastOrder.status)}</div>
                  </div>
                  <div className="rp-mr-right">
                    <div className="rp-mr-amount is-small">₹{pastOrder.totalAmount}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedCustomerHistory(null)} className="rp-modal-close">{t('closeBtn')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Styles (frontend only) ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

.rp {
  --ink: #0f172a;
  --ink-soft: #334155;
  --ink-faint: #64748b;
  --line: #e2e8f0;
  --surface: #ffffff;
  --canvas: #f3f5f9;
  --green: #059669;
  --green-dark: #047857;
  --blue: #2563eb;
  --amber: #d97706;

  display: flex;
  flex-direction: column;
  flex: 1;
  padding: clamp(16px, 3vw, 36px);
  padding-bottom: 100px;
  box-sizing: border-box;
  overflow-y: auto;
  font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  color: var(--ink);
  background:
    radial-gradient(900px 420px at 100% -10%, rgba(37, 99, 235, 0.08), transparent 60%),
    radial-gradient(700px 380px at -10% 0%, rgba(5, 150, 105, 0.07), transparent 60%),
    var(--canvas);
}
.rp *, .rp *::before, .rp *::after { box-sizing: border-box; }

.rp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}
.rp-title {
  margin: 0;
  font-size: clamp(26px, 3.4vw, 34px);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--ink);
}
.rp-subtitle { margin: 8px 0 0 0; color: var(--ink-faint); font-size: 15px; font-weight: 600; }

.rp-stack { display: flex; flex-direction: column; gap: 30px; }

.rp-section {
  background: var(--surface);
  padding: clamp(18px, 2.4vw, 32px);
  border-radius: 24px;
  border: 1px solid var(--line);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 14px 34px -16px rgba(15, 23, 42, 0.14);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.rp-section:hover { border-color: #d3dcea; box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05), 0 22px 44px -18px rgba(15, 23, 42, 0.2); }

.rp-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
}
.rp-section-title { margin: 0; font-size: clamp(19px, 2.2vw, 23px); font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.rp-section-desc { margin: 5px 0 0 0; font-size: 14px; color: var(--ink-faint); font-weight: 600; }
.rp-tools { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.rp-pill-btn {
  font-family: inherit;
  background: var(--ink);
  color: #fff;
  border: none;
  padding: 11px 18px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
  transition: transform 0.2s ease, filter 0.2s ease;
}
.rp-pill-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

.rp-receipt-btn {
  font-family: inherit;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  transition: transform 0.2s ease, filter 0.2s ease;
}
.rp-receipt-btn:hover { transform: translateY(-2px); filter: brightness(1.07); }
.rp-receipt-btn.rp-mt { margin-top: 10px; }

.rp-history-btn {
  font-family: inherit;
  background: #ecfdf5;
  color: var(--green-dark);
  border: 1.5px solid #10b981;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.rp-history-btn:hover { background: #10b981; color: #fff; transform: translateY(-2px); }

.rp-filters { display: flex; gap: 14px; margin-bottom: 22px; flex-wrap: wrap; align-items: center; }
.rp-search {
  flex: 1;
  min-width: 240px;
  font-family: inherit;
  padding: 13px 18px;
  border-radius: 12px;
  border: 2px solid #d5dde8;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  background: #f8fafc;
  outline: none;
}
.rp-search:focus { border-color: var(--blue); background: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); }

.rp-select {
  font-family: inherit;
  padding: 13px 16px;
  border-radius: 12px;
  border: 2px solid #d5dde8;
  font-size: 14px;
  font-weight: 700;
  background: #f8fafc;
  outline: none;
  cursor: pointer;
  color: var(--ink-soft);
}
.rp-select:hover { border-color: #b6c3d4; background: #fff; }

.rp-table-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid var(--line); }
.rp-table { width: 100%; border-collapse: collapse; font-size: 15px; min-width: 760px; }
.rp-table thead tr { background: #f1f5f9; }
.rp-table th { padding: 16px 18px; font-weight: 800; font-size: 14px; color: #475569; text-align: left; border-bottom: 2px solid var(--line); }
.rp-table td { padding: 16px 18px; color: var(--ink-soft); font-weight: 700; border-bottom: 1px solid #eef2f7; }
.rp-table tbody tr:hover { background: #eff6ff; }

.rp-strong { color: var(--ink); font-weight: 800; }
.rp-captain-cell { color: var(--blue) !important; font-weight: 800 !important; }
.rp-amount { color: var(--green) !important; font-weight: 800 !important; font-size: 16px; }

.rp-status { display: inline-block; padding: 5px 10px; border-radius: 999px; font-size: 13px; font-weight: 800; color: #b45309; background: #fef3c7; }
.rp-status.is-ready { color: var(--blue); background: #dbeafe; }

.rp-badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 5px 10px; border-radius: 8px; font-size: 13px; font-weight: 800; border: 1.5px solid #bae6fd; }

.rp-list { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; padding: 4px; }
.rp-list-400 { max-height: 440px; }
.rp-list-350 { max-height: 390px; }

.rp-hist-row, .rp-complaint-row {
  background: #f8fafc;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.rp-hist-row:hover { border-color: var(--green); background: #f0fdf4; transform: translateY(-2px); }
.rp-complaint-row:hover { border-color: #a7f3d0; background: #f0fdf9; }

.rp-row-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.rp-row-right { display: flex; align-items: center; gap: 18px; }
.rp-hist-id { font-weight: 800; color: var(--ink); font-size: 17px; }
.rp-hist-customer { font-size: 15px; color: var(--ink-soft); font-weight: 700; }
.rp-hist-status { font-size: 14px; color: var(--green); font-weight: 800; }
.rp-hist-amount { font-weight: 800; color: var(--green); font-size: 19px; }

.rp-complaint-type { background: #d1fae5; color: #065f46; padding: 5px 10px; border-radius: 8px; font-size: 13px; font-weight: 800; }
.rp-closed { font-size: 13px; color: #10b981; font-weight: 800; }

.rp-cap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 18px; }
.rp-cap-card {
  background: #f8fafc;
  padding: 22px;
  border-radius: 18px;
  border: 1.5px solid var(--line);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.rp-cap-card:hover { border-color: var(--blue); background: #eff6ff; transform: translateY(-4px); }
.rp-cap-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.rp-cap-name { font-size: 18px; font-weight: 800; color: var(--ink); }
.rp-cap-inspect { font-size: 14px; color: var(--blue); font-weight: 800; }
.rp-cap-line { font-size: 15px; color: var(--ink-faint); font-weight: 700; margin-top: 5px; }
.rp-blue { color: var(--blue); font-size: 17px; }
.rp-green { color: var(--green); font-weight: 800; }

.rp-metrics { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 20px; margin-bottom: 26px; }
.rp-metric {
  background: linear-gradient(145deg, #f8fafc, #eef2f7);
  padding: 24px;
  border-radius: 20px;
  border: 1.5px solid var(--line);
}
.rp-metric-title { font-size: 14px; font-weight: 800; color: var(--ink-faint); margin-bottom: 8px; }
.rp-metric-value { font-size: clamp(28px, 3.2vw, 38px); font-weight: 800; color: var(--green); }
.rp-metric-value.is-blue { color: var(--blue); }
.rp-metric-value.is-amber { color: var(--amber); }

.rp-chart {
  background: #f8fafc;
  padding: 32px 24px;
  border-radius: 22px;
  border: 1.5px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.rp-pie {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.1);
}
.rp-pie-center {
  width: 110px;
  height: 110px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
}
.rp-legend { display: flex; gap: 12px 20px; font-size: 14px; font-weight: 800; flex-wrap: wrap; justify-content: center; }
.rp-legend-item { padding: 6px 12px; border-radius: 999px; background: #fff; border: 1px solid var(--line); }
.rp-legend-item.is-dine { color: #059669; }
.rp-legend-item.is-counter { color: #2563eb; }
.rp-legend-item.is-online { color: #d97706; }

.rp-empty { text-align: center; padding: 40px; color: #64748b; font-size: 15px; font-weight: 700; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; }

.rp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 1000;
}
.rp-modal {
  width: min(500px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  padding: 26px;
  border-radius: 24px;
  border: 1px solid var(--line);
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}
.rp-modal-lg { width: min(700px, 100%); }
.rp-modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid var(--line); }
.rp-modal-title { margin: 0; color: var(--ink); font-weight: 800; font-size: 19px; }
.rp-close-x { background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 16px; font-weight: 800; color: #64748b; cursor: pointer; }
.rp-modal-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; margin-bottom: 18px; }
.rp-modal-list-420 { max-height: 400px; }
.rp-modal-list-300 { max-height: 300px; }
.rp-modal-row { background: #f8fafc; padding: 14px 18px; border-radius: 14px; border: 1.5px solid var(--line); display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.rp-mr-id { font-weight: 800; color: var(--ink); font-size: 16px; }
.rp-mr-customer { font-size: 14px; color: var(--ink-soft); font-weight: 700; margin-top: 3px; }
.rp-mr-meta { font-size: 13px; color: var(--ink-faint); font-weight: 600; margin-top: 2px; }
.rp-mr-right { text-align: right; }
.rp-mr-amount { font-weight: 800; color: var(--green); font-size: 18px; }
.rp-modal-close { width: 100%; font-family: inherit; padding: 14px; background: var(--ink); color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 15px; }

@media print {
  body * { visibility: hidden !important; }
  .printable-report-area, .printable-report-area * { visibility: visible !important; }
  .printable-report-area { position: absolute; left: 0; top: 0; width: 100%; background: #fff !important; }
}
`;