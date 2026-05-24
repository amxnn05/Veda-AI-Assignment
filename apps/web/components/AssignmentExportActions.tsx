'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import styles from '../app/assignments/[id]/AssignmentOutput.module.css';

interface AssignmentExportActionsProps {
  assignment?: {
    subject?: string;
  } | null;
  paperRef: React.RefObject<HTMLDivElement | null>;
}

export default function AssignmentExportActions({ assignment, paperRef }: AssignmentExportActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const preparePdfPagination = (element: HTMLElement, pxPageHeight: number) => {
    const pageBreakSpacers: HTMLElement[] = [];
    const safeBottomPadding = 36;
    const pageStartBuffer = 2;

    const selectors = [
      `.${styles.questionItem}`,
      `.${styles.sectionTitle}`,
      `.${styles.sectionHeader}`,
      `.${styles.instructionsSection}`,
      `.${styles.paperHeader}`,
      `.${styles.studentInfo}`
    ];

    const keepTogetherElements = Array.from(
      element.querySelectorAll<HTMLElement>(selectors.join(','))
    );

    const insertPageBreakBefore = (el: HTMLElement, height: number) => {
      const spacer = document.createElement('div');
      spacer.setAttribute('data-pdf-page-break-spacer', 'true');
      spacer.style.display = 'block';
      spacer.style.flex = '0 0 auto';
      spacer.style.height = `${Math.ceil(height)}px`;
      spacer.style.margin = '0';
      spacer.style.padding = '0';
      spacer.style.border = '0';
      spacer.style.breakInside = 'avoid';
      spacer.style.pageBreakInside = 'avoid';

      el.parentElement?.insertBefore(spacer, el);
      pageBreakSpacers.push(spacer);
    };

    for (let pass = 0; pass < 2; pass += 1) {
      const containerTop = element.getBoundingClientRect().top;

      keepTogetherElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top - containerTop;
        const elementHeight = rect.height;

        if (elementHeight >= pxPageHeight - safeBottomPadding) {
          return;
        }

        const pageOffset = elementTop % pxPageHeight;
        const remainingOnPage = pxPageHeight - pageOffset;
        const wouldSplit = elementHeight + safeBottomPadding > remainingOnPage;

        if (pageOffset > pageStartBuffer && wouldSplit) {
          insertPageBreakBefore(el, remainingOnPage + pageStartBuffer);
        }
      });

      // Force layout before the second pass so elements after newly inserted
      // page gaps are measured against their final positions.
      void element.offsetHeight;
    }

    return () => {
      pageBreakSpacers.forEach((spacer) => {
        spacer.remove();
      });
    };
  };

  const handleDownloadPDF = async () => {
    if (!paperRef.current) return;
    
    setIsDownloading(true);
    let restorePagination: (() => void) | undefined;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      
      const element = paperRef.current;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const pxPerMm = element.offsetWidth / pdfWidth;
      const pxPageHeight = pdfHeight * pxPerMm;

      restorePagination = preparePdfPagination(element, pxPageHeight);
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // Add subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${assignment?.subject || 'Assignment'}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      restorePagination?.();
      setIsDownloading(false);
    }
  };

  return (
    <button 
      className={styles.downloadBtn} 
      onClick={handleDownloadPDF}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <Loader2 size={18} className={styles.buttonSpinner} />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download size={18} />
          <span>Download as PDF</span>
        </>
      )}
    </button>
  );
}
