import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import moment from 'moment';

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {String} sheetName - Name of the sheet
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${moment().format('YYYY-MM-DD')}.xlsx`);

    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
};

/**
 * Export table data to PDF
 * @param {Array} columns - Column definitions [{header: 'Name', dataKey: 'name'}]
 * @param {Array} data - Array of row data
 * @param {String} filename - Name of the file (without extension)
 * @param {String} title - Document title
 * @param {Object} options - Additional options
 */
export const exportToPDF = (columns, data, filename = 'export', title = 'Report', options = {}) => {
  try {
    console.log('Starting PDF export with:', { columns, dataLength: data.length, filename, title, options });

    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    console.log('jsPDF instance created');

    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);

    // Add subtitle/date range if provided
    if (options.subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(options.subtitle, 14, 28);
    }

    // Add company/shop name if provided
    if (options.shopName) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(options.shopName, 14, 12);
    }

    console.log('Adding table to PDF...');

    // Generate table
    autoTable(doc, {
      startY: options.subtitle ? 35 : 28,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey] || '')),
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [103, 126, 234],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 10 }
    });

    console.log('Table added successfully');

    // Add summary if provided
    if (options.summary && options.summary.length > 0) {
      const finalY = doc.lastAutoTable.finalY || 35;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary:', 14, finalY + 10);
      doc.setFont('helvetica', 'normal');

      let yPos = finalY + 16;
      options.summary.forEach(item => {
        doc.text(`${item.label}: ${item.value}`, 14, yPos);
        yPos += 6;
      });
    }

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const pdfFilename = `${filename}_${moment().format('YYYY-MM-DD')}.pdf`;
    console.log('Saving PDF as:', pdfFilename);
    doc.save(pdfFilename);

    console.log('PDF saved successfully');
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      columns,
      dataLength: data?.length
    });
    return false;
  }
};

/**
 * Export sales report to Excel with formatted data
 */
export const exportSalesReportToExcel = (bills) => {
  const data = bills.map(bill => ({
    'Bill No': bill.billNo,
    'Date': moment(bill.billDate).format('DD/MM/YYYY HH:mm'),
    'Customer': bill.customerName || 'Walk-in',
    'Mobile': bill.customerMobile || '-',
    'User': bill.userName,
    'Items': bill.items?.length || 0,
    'Subtotal': `₹${bill.subtotal?.toFixed(2)}`,
    'Discount': `₹${bill.discount?.toFixed(2) || '0.00'}`,
    'GST': `₹${bill.gstAmount?.toFixed(2) || '0.00'}`,
    'Grand Total': `₹${bill.grandTotal?.toFixed(2)}`,
    'Payment Mode': bill.paymentMode,
    'Status': bill.status
  }));

  return exportToExcel(data, 'Sales_Report', 'Sales');
};

/**
 * Export purchase report to Excel with formatted data
 */
export const exportPurchaseReportToExcel = (purchases) => {
  const data = purchases.map(purchase => ({
    'Purchase No': purchase.purchaseNo,
    'Date': moment(purchase.invoiceDate).format('DD/MM/YYYY'),
    'Supplier': purchase.supplierName,
    'Mobile': purchase.supplierMobile || '-',
    'Invoice No': purchase.invoiceNo,
    'Items': purchase.items?.length || 0,
    'Invoice Amount': `₹${purchase.invoiceAmount?.toFixed(2)}`,
    'GST': `₹${purchase.gstAmount?.toFixed(2) || '0.00'}`,
    'Paid': `₹${purchase.paidAmount?.toFixed(2)}`,
    'Pending': `₹${purchase.pendingAmount?.toFixed(2)}`,
    'Payment Status': purchase.paymentStatus,
    'Type': purchase.isLocalPurchase ? 'Local' : 'Regular'
  }));

  return exportToExcel(data, 'Purchase_Report', 'Purchases');
};

/**
 * Export sales report to PDF
 */
export const exportSalesReportToPDF = (bills, dateRange, summary) => {
  try {
    if (!bills || bills.length === 0) {
      console.error('No bills data to export');
      return false;
    }

    const columns = [
      { header: 'Bill No', dataKey: 'billNo' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Customer', dataKey: 'customer' },
      { header: 'Items', dataKey: 'items' },
      { header: 'Grand Total', dataKey: 'total' },
      { header: 'Payment', dataKey: 'payment' },
      { header: 'Status', dataKey: 'status' }
    ];

    const data = bills.map(bill => ({
      billNo: bill.billNo || '',
      date: moment(bill.billDate).format('DD/MM/YY HH:mm'),
      customer: bill.customerName || 'Walk-in',
      items: bill.items?.length || 0,
      total: `₹${(bill.grandTotal || 0).toFixed(2)}`,
      payment: bill.paymentMode || '',
      status: bill.status || ''
    }));

    const subtitle = (dateRange && dateRange[0] && dateRange[1])
      ? `Period: ${dateRange[0].format('DD/MM/YYYY')} to ${dateRange[1].format('DD/MM/YYYY')}`
      : 'All Records';

    const summaryData = summary ? [
      { label: 'Total Bills', value: summary.count || 0 },
      { label: 'Total Sales', value: `₹${(summary.totalSales || 0).toFixed(2)}` },
      { label: 'Average Bill', value: `₹${((summary.totalSales / summary.count) || 0).toFixed(2)}` }
    ] : [];

    return exportToPDF(
      columns,
      data,
      'Sales_Report',
      'Sales Report',
      {
        shopName: 'Juicy',
        subtitle,
        summary: summaryData,
        orientation: 'portrait'
      }
    );
  } catch (error) {
    console.error('Error in exportSalesReportToPDF:', error);
    return false;
  }
};

/**
 * Export purchase report to PDF
 */
export const exportPurchaseReportToPDF = (purchases, dateRange, summary) => {
  try {
    if (!purchases || purchases.length === 0) {
      console.error('No purchase data to export');
      return false;
    }

    const columns = [
      { header: 'Purchase No', dataKey: 'purchaseNo' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Invoice No', dataKey: 'invoiceNo' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Paid', dataKey: 'paid' },
      { header: 'Pending', dataKey: 'pending' },
      { header: 'Status', dataKey: 'status' }
    ];

    const data = purchases.map(purchase => ({
      purchaseNo: purchase.purchaseNo || '',
      date: moment(purchase.invoiceDate).format('DD/MM/YY'),
      supplier: purchase.supplierName || '',
      invoiceNo: purchase.invoiceNo || '',
      amount: `₹${(purchase.invoiceAmount || 0).toFixed(2)}`,
      paid: `₹${(purchase.paidAmount || 0).toFixed(2)}`,
      pending: `₹${(purchase.pendingAmount || 0).toFixed(2)}`,
      status: purchase.paymentStatus || ''
    }));

    const subtitle = (dateRange && dateRange[0] && dateRange[1])
      ? `Period: ${dateRange[0].format('DD/MM/YYYY')} to ${dateRange[1].format('DD/MM/YYYY')}`
      : 'All Records';

    const summaryData = summary ? [
      { label: 'Total Purchases', value: summary.count || 0 },
      { label: 'Total Amount', value: `₹${(summary.totalAmount || 0).toFixed(2)}` },
      { label: 'Total Pending', value: `₹${(summary.totalPending || 0).toFixed(2)}` }
    ] : [];

    return exportToPDF(
      columns,
      data,
      'Purchase_Report',
      'Purchase Report',
      {
        shopName: 'Juicy',
        subtitle,
        summary: summaryData,
        orientation: 'landscape'
      }
    );
  } catch (error) {
    console.error('Error in exportPurchaseReportToPDF:', error);
    return false;
  }
};

/**
 * Print thermal bill with settings from database
 * @param {Object} bill - Bill data
 * @param {Object} settings - Business settings (optional, will fetch if not provided)
 */
export const printThermalBill = async (bill, settings = null) => {
  try {
    // Fetch settings if not provided
    if (!settings) {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/settings`);
      const data = await response.json();
      settings = data.settings;
    }

    const shopName = settings?.shopName || 'Smart Cafe';
    const shopTagline = settings?.shopTagline || '';
    const shopMobile = settings?.shopMobile || '';
    const shopAddress = settings?.shopAddress || '';
    const logo = settings?.logo || '';
    const enableLogo = settings?.thermalPrinterSettings?.enableLogo || false;
    const footerText = settings?.thermalPrinterSettings?.footerText || 'Thank You! Visit Again';
    const paperWidth = settings?.thermalPrinterSettings?.paperWidth || 80;

    // Calculate dimensions based on paper width
    let bodyWidth, fontSize, headerSize;
    if (paperWidth >= 76) {
      bodyWidth = `${paperWidth - 8}mm`;
      fontSize = '12px';
      headerSize = '16px';
    } else {
      bodyWidth = '50mm';
      fontSize = '11px';
      headerSize = '14px';
    }

    const printWindow = window.open('', '_blank', 'width=400,height=600');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill #${bill.billNo}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            @page {
              size: ${paperWidth}mm auto;
              margin: 0;
            }
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: ${fontSize};
            margin: 0;
            padding: 5mm;
            width: ${bodyWidth};
            line-height: 1.4;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .double-line {
            border-top: 2px solid #000;
            margin: 5px 0;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: ${paperWidth >= 76 ? '11px' : '10px'};
          }
          .item-name {
            flex: 2;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 5px;
          }
          .item-qty {
            flex: 0.5;
            text-align: center;
          }
          .item-price {
            flex: 0.8;
            text-align: right;
            padding-right: 5px;
          }
          .item-total {
            flex: 0.8;
            text-align: right;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: ${paperWidth >= 76 ? '11px' : '10px'};
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-weight: bold;
          }
          .grand-total {
            font-size: ${paperWidth >= 76 ? '14px' : '13px'};
            font-weight: bold;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 5px 0;
            margin: 5px 0;
          }
          h2 {
            margin: 5px 0;
            font-size: ${headerSize};
            text-transform: uppercase;
          }
          p {
            margin: 2px 0;
          }
          .small {
            font-size: ${paperWidth >= 76 ? '10px' : '9px'};
          }
          .logo {
            max-width: ${paperWidth >= 76 ? '60px' : '50px'};
            max-height: ${paperWidth >= 76 ? '60px' : '50px'};
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="center">
          ${enableLogo && logo ? `<img src="${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${logo}" alt="Logo" class="logo" />` : ''}
          <h2>${shopName.toUpperCase()}</h2>
          ${shopTagline ? `<p class="small">${shopTagline}</p>` : ''}
          ${shopAddress ? `<p class="small">${shopAddress}</p>` : ''}
          ${shopMobile ? `<p class="small">Ph: ${shopMobile}</p>` : ''}
        </div>
        <div class="double-line"></div>

        <div class="info-row">
          <span class="bold">Bill No:</span>
          <span>${bill.billNo}</span>
        </div>
        <div class="info-row">
          <span class="bold">Date:</span>
          <span>${moment(bill.billDate).format('DD/MM/YYYY HH:mm')}</span>
        </div>
        ${bill.seatNumber ? `
          <div class="info-row">
            <span class="bold">Seat No:</span>
            <span>${bill.seatNumber}</span>
          </div>
        ` : ''}
        ${bill.customerName ? `
          <div class="info-row">
            <span class="bold">Customer:</span>
            <span>${bill.customerName}</span>
          </div>
        ` : ''}
        ${bill.customerMobile ? `
          <div class="info-row">
            <span class="bold">Phone:</span>
            <span>${bill.customerMobile}</span>
          </div>
        ` : ''}
        <div class="info-row">
          <span class="bold">Cashier:</span>
          <span>${bill.userName}</span>
        </div>

        <div class="double-line"></div>

        <div class="item-row bold">
          <span class="item-name">Item</span>
          <span class="item-qty">Qty</span>
          <span class="item-price">Rate</span>
          <span class="item-total">Amt</span>
        </div>
        <div class="line"></div>

        ${bill.items?.map(item => `
          <div class="item-row">
            <span class="item-name" title="${item.itemName}">${item.itemName}</span>
            <span class="item-qty">${item.quantity}</span>
            <span class="item-price">₹${item.price?.toFixed(2)}</span>
            <span class="item-total">₹${item.itemTotal?.toFixed(2)}</span>
          </div>
        `).join('')}

        <div class="line"></div>

        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${bill.subtotal?.toFixed(2)}</span>
        </div>

        ${bill.discountAmount > 0 ? `
          <div class="total-row" style="font-size: ${paperWidth >= 76 ? '11px' : '10px'};">
            <span>Discount (${bill.discountPercent}%):</span>
            <span>- ₹${bill.discountAmount?.toFixed(2)}</span>
          </div>
        ` : ''}

        ${bill.gstAmount > 0 ? `
          <div class="total-row" style="font-size: ${paperWidth >= 76 ? '11px' : '10px'};">
            <span>GST (${bill.gstPercent || 5}%):</span>
            <span>₹${bill.gstAmount?.toFixed(2)}</span>
          </div>
        ` : ''}

        <div class="total-row grand-total">
          <span>GRAND TOTAL:</span>
          <span>₹${bill.grandTotal?.toFixed(2)}</span>
        </div>

        <div class="info-row bold">
          <span>Payment:</span>
          <span>${bill.paymentMode}</span>
        </div>

        ${bill.paymentMode === 'Mixed' && bill.paymentDetails ? `
          <div style="font-size: ${paperWidth >= 76 ? '10px' : '9px'}; margin: 3px 0;">
            ${bill.paymentDetails.cash ? `<div class="info-row"><span>Cash:</span><span>₹${bill.paymentDetails.cash.toFixed(2)}</span></div>` : ''}
            ${bill.paymentDetails.upi ? `<div class="info-row"><span>UPI:</span><span>₹${bill.paymentDetails.upi.toFixed(2)}</span></div>` : ''}
            ${bill.paymentDetails.card ? `<div class="info-row"><span>Card:</span><span>₹${bill.paymentDetails.card.toFixed(2)}</span></div>` : ''}
          </div>
        ` : ''}

        <div class="double-line"></div>

        <div class="center" style="margin-top: 8px;">
          <p class="bold">${footerText}</p>
          <p class="small" style="margin-top: 5px;">Powered by Smart Cafe POS</p>
        </div>

        <script>
          window.onload = function() {
            // Auto print after a short delay
            setTimeout(() => {
              window.print();
              // Close window after printing
              setTimeout(() => window.close(), 800);
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    return true;
  } catch (error) {
    console.error('Thermal print error:', error);
    // Show error to user if print fails
    alert('Failed to open print window. Please try again.');
    return false;
  }
};
