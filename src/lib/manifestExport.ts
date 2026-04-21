// Helpers for exporting a ProductionManifest as JSON or a compact contact-sheet PDF.
import { jsPDF } from "jspdf";
import type { ProductionManifest } from "@/types/videoAd";

export function downloadManifestJSON(manifest: ProductionManifest, filename?: string) {
  const safeName = (filename || manifest.title || "manifest")
    .replace(/[^\w\-]+/g, "_")
    .toLowerCase();
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
  triggerDownload(blob, `${safeName}.json`);
}

/**
 * Compact contact-sheet PDF: 3 thumbs per row, shot # + duration captions.
 * Falls back to colored placeholder when a frame URL is missing.
 */
export async function downloadStoryboardPDF(
  manifest: ProductionManifest,
  frames: Record<string, string>,
  filename?: string,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;
  const cols = 3;
  const gap = 12;
  const cellW = (pageW - margin * 2 - gap * (cols - 1)) / cols;

  // Aspect ratio for thumb image area
  const aspect =
    manifest.aspectRatio === "16:9" ? 9 / 16
    : manifest.aspectRatio === "1:1" ? 1
    : 16 / 9; // 9:16 vertical
  const imgH = cellW * aspect;
  const captionH = 28;
  const cellH = imgH + captionH;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(manifest.title || "Storyboard", margin, margin);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `${manifest.shots.length} shots · ${manifest.durationSeconds}s · ${manifest.aspectRatio}`,
    margin,
    margin + 14,
  );
  doc.setTextColor(0);

  let x = margin;
  let y = margin + 32;

  for (let i = 0; i < manifest.shots.length; i++) {
    const shot = manifest.shots[i];
    const url = frames[String(i)];

    if (y + cellH > pageH - margin) {
      doc.addPage();
      y = margin;
      x = margin;
    }

    // Thumb area
    if (url) {
      try {
        const dataUrl = await urlToDataURL(url);
        const fmt = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(dataUrl, fmt, x, y, cellW, imgH, undefined, "FAST");
      } catch {
        drawPlaceholder(doc, x, y, cellW, imgH, "Image unavailable");
      }
    } else {
      drawPlaceholder(doc, x, y, cellW, imgH, "No frame yet");
    }

    // Caption
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`#${i + 1} · ${shot.durationSeconds}s`, x + 4, y + imgH + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(110);
    doc.text(`${shot.cameraMotion} → ${shot.transition}`, x + 4, y + imgH + 22);
    doc.setTextColor(0);

    if ((i + 1) % cols === 0) {
      x = margin;
      y += cellH + gap;
    } else {
      x += cellW + gap;
    }
  }

  const safeName = (filename || manifest.title || "storyboard")
    .replace(/[^\w\-]+/g, "_")
    .toLowerCase();
  doc.save(`${safeName}.pdf`);
}

function drawPlaceholder(doc: jsPDF, x: number, y: number, w: number, h: number, label: string) {
  doc.setFillColor(240, 240, 245);
  doc.rect(x, y, w, h, "F");
  doc.setDrawColor(220);
  doc.rect(x, y, w, h);
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(label, x + w / 2, y + h / 2, { align: "center", baseline: "middle" });
  doc.setTextColor(0);
}

async function urlToDataURL(url: string): Promise<string> {
  // Already a data URL
  if (url.startsWith("data:")) return url;
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Fetch ${res.status}`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
