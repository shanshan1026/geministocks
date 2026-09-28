import { toPng, toJpeg } from 'html-to-image';

/**
 * Configuration options for image export
 */
interface ExportOptions {
  /** The HTML element to export */
  element: HTMLElement;
  /** Dynamic filename based on context/theme */
  filename: string;
  /** Optional pixel ratio for higher resolution (default: 2) */
  pixelRatio?: number;
  /** Export format: 'png' or 'jpeg' (default: 'png') */
  format?: 'png' | 'jpeg';
  /** JPEG quality 0-1 (default: 0.95) */
  quality?: number;
  /** Background color for the export (default: '#ffffff') */
  backgroundColor?: string;
}

/**
 * Sanitizes a string for use as a filename
 */
export const sanitizeFilename = (text: string): string => {
  return text
    .substring(0, 50) // Limit length
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\u4e00-\u9fa5-]/g, '') // Keep alphanumeric, Chinese chars, and hyphens
    .replace(/_+/g, '_') // Remove consecutive underscores
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};

/**
 * Generates a dynamic filename based on report type and content
 */
export const generateExportFilename = (
  reportType: 'analysis' | 'stock' | 'positional',
  title: string,
  locale: string = 'en'
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedTitle = sanitizeFilename(title);
  
  const prefixes: Record<string, Record<string, string>> = {
    analysis: {
      zh: '多维度投资分析报告',
      en: 'Investment_Analysis_Report',
    },
    stock: {
      zh: '股票分析报告',
      en: 'Stock_Analysis_Report',
    },
    positional: {
      zh: '阵地战分析报告',
      en: 'Positional_Warfare_Report',
    },
  };

  const prefix = prefixes[reportType]?.[locale] || prefixes[reportType]?.en || 'Report';
  
  return `${prefix}_${sanitizedTitle}_${timestamp}`;
};

/**
 * Filter function to handle problematic elements during export
 * This helps avoid CORS errors and rendering issues in production
 */
const filterNode = (node: HTMLElement): boolean => {
  // Skip elements that commonly cause CORS issues
  if (node.tagName === 'IFRAME') return false;
  if (node.tagName === 'VIDEO') return false;
  if (node.tagName === 'AUDIO') return false;
  
  // Skip external images that might cause CORS issues
  if (node.tagName === 'IMG') {
    const src = (node as HTMLImageElement).src;
    // Allow data URLs and same-origin images
    if (src.startsWith('data:') || src.startsWith(window.location.origin)) {
      return true;
    }
    // Skip external images to avoid CORS issues
    if (src.startsWith('http') && !src.includes(window.location.hostname)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Clones and prepares styles for export
 * Ensures fonts and styles are properly captured
 */
const prepareForExport = async (element: HTMLElement): Promise<void> => {
  // Force all fonts to load before export
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  
  // Give browser time to render any lazy-loaded content
  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Browser canvas safety limits.
 * Chrome/Firefox cap each axis around 32,767px and total area around 268MP,
 * Safari is stricter. Staying below these prevents silent down-scaling
 * (which causes blurry exports) or outright failures on long reports.
 */
const MAX_CANVAS_DIMENSION = 16000;
const MAX_CANVAS_AREA = 150_000_000; // ~150 megapixels, safe across browsers

/**
 * Computes the largest pixel ratio that keeps the output canvas
 * within browser limits, preserving the element's exact aspect ratio.
 */
const getSafePixelRatio = (width: number, height: number, requested: number): number => {
  if (width <= 0 || height <= 0) return 1;
  const byDimension = Math.min(MAX_CANVAS_DIMENSION / width, MAX_CANVAS_DIMENSION / height);
  const byArea = Math.sqrt(MAX_CANVAS_AREA / (width * height));
  return Math.max(1, Math.min(requested, byDimension, byArea));
};

/**
 * Exports an HTML element as an image with production-safe settings
 * Handles CORS issues, font loading, canvas size limits, and dynamic filenames.
 * Resolves with the final downloaded filename.
 */
export const exportElementAsImage = async (options: ExportOptions): Promise<string> => {
  const {
    element,
    filename,
    pixelRatio,
    format = 'png',
    quality = 0.95,
    backgroundColor = '#ffffff',
  } = options;

  // Prepare element for export (fonts + pending renders)
  await prepareForExport(element);

  // Measure the element precisely. Using getBoundingClientRect (and rounding UP)
  // avoids the 1px right/bottom cropping caused by fractional layout sizes.
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);

  // Prefer the device's native pixel ratio (min 2 for crisp text, capped at 3),
  // then clamp to what the browser canvas can actually hold.
  const requestedRatio = pixelRatio ?? Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
  const safeRatio = getSafePixelRatio(width, height, requestedRatio);

  // Integer canvas dimensions derived from ONE ratio keep the aspect
  // ratio identical to the on-screen element (no stretching).
  const canvasWidth = Math.round(width * safeRatio);
  const canvasHeight = Math.round(height * safeRatio);

  // Configure export options with production-safe settings
  const exportConfig = {
    cacheBust: true,
    backgroundColor,
    // Explicit dimensions: capture exactly the element's box
    width,
    height,
    canvasWidth,
    canvasHeight,
    // Neutralize styles on the cloned root that distort the capture:
    // - margins would offset the content inside the capture box
    // - in-flight animations/transitions can be captured mid-frame (wrong opacity/position)
    // - box-shadow bleeds outside the box and gets clipped into gray smudges at the edges
    style: {
      margin: '0',
      animation: 'none',
      transition: 'none',
      transform: 'none',
      boxShadow: 'none',
      width: `${width}px`,
      height: `${height}px`,
    } as Partial<CSSStyleDeclaration>,
    // Skip problematic nodes to avoid CORS errors
    filter: filterNode,
    // App uses system fonts only; skip webfont embedding (faster, no CORS noise).
    // Computed styles are inlined per-node, so text rendering matches the page.
    fontEmbedCSS: '',
    skipAutoScale: true,
    // Use CORS-safe fetch mode
    fetchRequestInit: {
      mode: 'cors' as RequestMode,
      credentials: 'omit' as RequestCredentials,
    },
    // Handle SVG issues in production
    includeQueryParams: true,
    // Quality for JPEG format
    quality: format === 'jpeg' ? quality : undefined,
  };

  const exportFn = format === 'jpeg' ? toJpeg : toPng;
  const finalFilename = `${filename}.${format}`;

  try {
    let dataUrl: string;
    try {
      dataUrl = await exportFn(element, exportConfig);
    } catch {
      // One retry: Safari/WebKit occasionally fails the first capture
      // while resources are still being inlined.
      await new Promise((resolve) => setTimeout(resolve, 300));
      dataUrl = await exportFn(element, exportConfig);
    }

    // Create and trigger download
    const link = document.createElement('a');
    link.download = finalFilename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return finalFilename;
  } catch (error) {
    // Re-throw with more descriptive error
    console.error('Export failed:', error);
    throw new Error(
      error instanceof Error 
        ? `导出失败: ${error.message}` 
        : '导出失败: 未知错误'
    );
  }
};

/** Escapes HTML special characters for safe interpolation into markup */
const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface HtmlExportOptions {
  element: HTMLElement;
  filename: string;
  /** Document title shown in the browser tab of the exported file */
  title?: string;
  locale?: string;
}

/**
 * Exports an HTML element as a standalone .html document.
 * Inlines all same-origin stylesheet rules so the exported report
 * renders with the exact same fonts, colors, and layout as the page.
 * Resolves with the final downloaded filename.
 */
export const exportElementAsHtml = async (options: HtmlExportOptions): Promise<string> => {
  const { element, filename, title = filename, locale = 'zh' } = options;

  // Clone the report subtree so we can safely strip non-content nodes
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove UI-only nodes (same set the old print/PDF flow hid via @media print)
  clone.querySelectorAll('.no-print').forEach((node) => node.remove());

  // Canvas content does not survive serialization — snapshot to <img>
  const sourceCanvases = element.querySelectorAll('canvas');
  const cloneCanvases = clone.querySelectorAll('canvas');
  cloneCanvases.forEach((cloneCanvas, i) => {
    const source = sourceCanvases[i] as HTMLCanvasElement | undefined;
    try {
      if (!source) throw new Error('missing source canvas');
      const img = document.createElement('img');
      img.src = source.toDataURL('image/png');
      img.style.width = `${source.getBoundingClientRect().width}px`;
      img.style.height = 'auto';
      img.alt = '';
      cloneCanvas.replaceWith(img);
    } catch {
      cloneCanvas.remove();
    }
  });

  // Collect every same-origin CSS rule (Tailwind utilities, theme tokens, etc.)
  let css = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        css += rule.cssText + '\n';
      }
    } catch {
      // Cross-origin stylesheet — skip silently
    }
  }

  const html = [
    '<!DOCTYPE html>',
    `<html lang="${locale === 'zh' ? 'zh-CN' : 'en'}">`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    `<style>${css}</style>`,
    '<style>',
    'body{margin:0;padding:24px;background:#f5f5f4;display:flex;justify-content:center;-webkit-print-color-adjust:exact;print-color-adjust:exact;}',
    '.v0-report-root{max-width:1024px;width:100%;}',
    '.v0-report-root button{pointer-events:none;}',
    '</style>',
    '</head>',
    '<body>',
    `<main class="v0-report-root">${clone.outerHTML}</main>`,
    '</body>',
    '</html>',
  ].join('\n');

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const finalFilename = `${filename}.html`;

  const link = document.createElement('a');
  link.download = finalFilename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Delay revocation so the download has time to start
  setTimeout(() => URL.revokeObjectURL(url), 10_000);

  return finalFilename;
};

/**
 * Creates a fallback export using canvas API
 * Used when html-to-image fails
 */
export const exportElementFallback = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  // This is a simplified fallback that captures just the visible content
  // It won't capture complex CSS but works reliably
  try {
    const canvas = document.createElement('canvas');
    const rect = element.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw text content as fallback
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(element.textContent?.substring(0, 100) || 'Report', 20, 40);
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Fallback export failed:', error);
    throw error;
  }
};
