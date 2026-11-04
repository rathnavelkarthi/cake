/**
 * Client-side utility for seamless PDF generation and direct downloads
 * Uses html2canvas + jsPDF with iframe-isolated DOM rendering for 100% CSS fidelity.
 */

export interface DownloadPdfOptions {
  format?: "a4" | "thermal";
  filename?: string;
  marginMm?: number;
}

/**
 * Downloads arbitrary HTML content as a real .pdf file.
 */
export async function downloadHtmlAsPdf(
  htmlContent: string,
  filename: string = "document.pdf",
  options?: DownloadPdfOptions
): Promise<void> {
  if (typeof window === "undefined") return;

  const isThermal = options?.format === "thermal";
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  // Create an off-screen iframe to guarantee isolated CSS styling (preventing Tailwind leaks)
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = isThermal ? "360px" : "800px";
  iframe.style.height = "1200px";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      throw new Error("Could not initialize printing context in iframe.");
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Small delay to allow images and font metrics to settle
    await new Promise((resolve) => setTimeout(resolve, 200));

    const bodyElement = doc.body;
    const scrollHeight = Math.max(bodyElement.scrollHeight, bodyElement.offsetHeight);
    iframe.style.height = `${scrollHeight + 40}px`;

    const canvas = await html2canvas(bodyElement, {
      scale: 2, // 2x Retina resolution for sharp crisp text and borders
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: isThermal ? 360 : 800,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.96);

    if (isThermal) {
      // Continuous 80mm roll format
      const pdfWidthMm = 80;
      const pdfHeightMm = (canvas.height * pdfWidthMm) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidthMm, Math.max(pdfHeightMm, 100)],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidthMm, pdfHeightMm);
      pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    } else {
      // Standard A4: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const marginMm = options?.marginMm ?? 0;
      const usableWidthMm = pageWidthMm - marginMm * 2;
      const totalPdfHeightMm = (canvas.height * usableWidthMm) / canvas.width;

      let heightLeftMm = totalPdfHeightMm;
      let positionMm = marginMm;

      // First page
      pdf.addImage(imgData, "JPEG", marginMm, positionMm, usableWidthMm, totalPdfHeightMm);
      heightLeftMm -= pageHeightMm;

      // Additional pages if document spills over
      while (heightLeftMm > 0) {
        positionMm = heightLeftMm - totalPdfHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", marginMm, positionMm, usableWidthMm, totalPdfHeightMm);
        heightLeftMm -= pageHeightMm;
      }

      pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    }
  } catch (err) {
    console.warn("Direct PDF download fallback to print dialog:", err);
    // Fallback: trigger system print / save as PDF dialog
    printHtmlDocument(htmlContent);
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Triggers isolated print preview for document HTML without opening popups.
 */
export function printHtmlDocument(htmlContent: string): void {
  if (typeof window === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 350);
}
