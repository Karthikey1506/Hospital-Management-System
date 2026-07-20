import Papa from 'papaparse';
import jsPDF from 'jspdf';

// 1. CSV EXPORT HELPER
export function exportToCSV(filename, dataArray) {
  if (!dataArray || !dataArray.length) {
    alert('No data available to export.');
    return;
  }
  const csv = Papa.unparse(dataArray);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 2. PDF INVOICE EXPORT HELPER (INR Currency)
export function generatePDFInvoice(billData) {
  const doc = new jsPDF();

  // Header background banner
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, 210, 40, 'F');

  // Hospital Title
  doc.setTextColor(0, 242, 254);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDPULSE CARE HOSPITAL', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Enterprise Clinical & Medical Center', 14, 28);

  // Invoice Title Right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('OFFICIAL INVOICE', 140, 22);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Invoice No: ${billData.invoiceNumber || 'INV-2026'}`, 140, 28);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 34);

  // Patient Info Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 14, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Patient Name: ${billData.patientName || 'N/A'}`, 14, 59);
  doc.text(`Payment Status: ${billData.status || 'PENDING'}`, 14, 65);
  doc.text(`Insurance Claim: ${billData.insuranceClaimStatus || 'N/A'}`, 14, 71);

  // Line separator
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 78, 196, 78);

  // Table Headers
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 82, 182, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text('Item Description', 18, 88);
  doc.text('Amount (INR)', 160, 88);

  // Table Rows
  let y = 100;
  const items = [
    { name: 'Physician Consultation Fee', cost: billData.consultationFee || 0 },
    { name: 'Ward Stay & Bed Care Charge', cost: billData.bedCharge || 0 },
    { name: 'Pathology & Diagnostic Tests', cost: billData.labCharge || 0 },
    { name: 'Pharmacy & Dispensed Medicines', cost: billData.pharmacyCharge || 0 }
  ];

  doc.setFont('helvetica', 'normal');
  items.forEach(item => {
    doc.text(item.name, 18, y);
    doc.text(`Rs. ${Number(item.cost).toLocaleString('en-IN')}`, 160, y);
    y += 8;
  });

  doc.line(14, y + 4, 196, y + 4);
  y += 12;

  // Subtotal & Total
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 125, y);
  doc.text(`Rs. ${Number(billData.subtotal || 0).toLocaleString('en-IN')}`, 160, y);
  y += 7;

  doc.text('Discount / Subsidy:', 125, y);
  doc.text(`-Rs. ${Number(billData.discount || 0).toLocaleString('en-IN')}`, 160, y);
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 150, 200);
  doc.text('TOTAL AMOUNT DUE:', 115, y);
  doc.text(`Rs. ${Number(billData.totalAmount || 0).toLocaleString('en-IN')}`, 160, y);

  // Footer Note
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for choosing MedPulse Care. For billing inquiries, contact billing@medpulse.org', 14, 280);

  // Save PDF
  doc.save(`${billData.invoiceNumber || 'Invoice'}_MedPulse.pdf`);
}
