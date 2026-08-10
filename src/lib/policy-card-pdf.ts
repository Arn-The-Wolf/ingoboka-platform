import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { PolicyCard } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const BRAND_GREEN = [0, 81, 39] as const;
const BRAND_GOLD = [253, 170, 48] as const;
const BRAND_DARK = [0, 61, 30] as const;

async function loadLogoDataUrl(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const response = await fetch('/images/brand/ingoboka-mark-light.svg');
    const svgText = await response.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 128, 128);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

function statusLabel(status: PolicyCard['status']): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
}

/** Generate a branded policy card PDF with QR verification code. */
export async function downloadPolicyCardPdf(card: PolicyCard): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;

  // Header band
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(...BRAND_GOLD);
  doc.rect(0, 42, pageWidth, 2, 'F');

  const logo = await loadLogoDataUrl();
  if (logo) {
    doc.addImage(logo, 'PNG', margin, 8, 18, 18);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Ingoboka', margin + (logo ? 22 : 0), 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Digital Policy Identification Card', margin + (logo ? 22 : 0), 28);

  doc.setFontSize(9);
  doc.text(`Generated ${formatDate(new Date().toISOString())}`, pageWidth - margin, 28, {
    align: 'right',
  });

  // Card body
  const cardTop = 54;
  const cardHeight = 72;
  doc.setFillColor(...BRAND_GREEN);
  doc.roundedRect(margin, cardTop, pageWidth - margin * 2, cardHeight, 4, 4, 'F');
  doc.setFillColor(...BRAND_GOLD);
  doc.roundedRect(margin, cardTop, pageWidth - margin * 2, 3, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('POLICY NUMBER', margin + 8, cardTop + 14);
  doc.setFontSize(16);
  doc.text(card.policyNumber, margin + 8, cardTop + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(card.productName, margin + 8, cardTop + 32);
  doc.text(card.insurerName, margin + 8, cardTop + 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('HOLDER', margin + 8, cardTop + 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(card.holderName, margin + 8, cardTop + 56);

  const col2X = pageWidth / 2 + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('COVERAGE', col2X, cardTop + 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(formatCurrency(card.coverageAmount, card.currency), col2X, cardTop + 56);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('VALID UNTIL', col2X, cardTop + 62);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(card.validTo), col2X, cardTop + 68);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('STATUS', pageWidth - margin - 8, cardTop + 14, { align: 'right' });
  doc.setFontSize(10);
  doc.text(statusLabel(card.status), pageWidth - margin - 8, cardTop + 20, { align: 'right' });

  // QR section
  const qrTop = cardTop + cardHeight + 14;
  doc.setTextColor(...BRAND_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Scan to verify this policy', margin, qrTop);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    'Healthcare providers and partners can scan the QR code to confirm active coverage.',
    margin,
    qrTop + 7,
    { maxWidth: pageWidth - margin * 2 - 52 }
  );

  const qrDataUrl = await QRCode.toDataURL(card.qrPayload, {
    width: 256,
    margin: 1,
    color: { dark: '#005127', light: '#ffffff' },
  });

  const qrSize = 44;
  const qrX = pageWidth - margin - qrSize;
  doc.setDrawColor(...BRAND_GOLD);
  doc.setLineWidth(0.8);
  doc.roundedRect(qrX - 2, qrTop - 2, qrSize + 4, qrSize + 4, 2, 2, 'S');
  doc.addImage(qrDataUrl, 'PNG', qrX, qrTop, qrSize, qrSize);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const verifyUrl =
    card.qrPayload.length > 72 ? `${card.qrPayload.slice(0, 69)}…` : card.qrPayload;
  doc.text(verifyUrl, margin, qrTop + qrSize + 6, { maxWidth: pageWidth - margin * 2 });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 16;
  doc.setDrawColor(...BRAND_GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_GREEN);
  doc.text('Ingoboka · Digital microinsurance for Rwanda', pageWidth / 2, footerY, {
    align: 'center',
  });
  doc.setTextColor(140, 140, 140);
  doc.text('This document is for verification purposes only. No PII is encoded in the QR URL.', pageWidth / 2, footerY + 5, {
    align: 'center',
  });

  doc.save(`ingoboka-policy-${card.policyNumber}.pdf`);
}
