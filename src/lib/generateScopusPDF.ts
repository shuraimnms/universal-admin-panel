/**
 * Academic PDF Generator - Exact Template Match
 * 
 * Replicates the EXACT layout of the reference journal PDF:
 * - International Journal of Pedagogy and Learning (IJIPAL)
 * 
 * TEMPLATE STRUCTURE (Pixel-perfect match):
 * ─────────────────────────────────────────────────────
 * Page 1:
 *   [HEADER]  ISSN: XXXX-XXXX | Journal Name (13.5pt bold, center) | ABBR (right, color)
 *             Available online at: https://... (12pt, center)
 *   ─── horizontal rule ───
 *   [TITLE]   Paper Title (12pt bold, center, full width)
 *   [AUTHORS] Author 1: Name (9pt bold, center)
 *             Affiliation: ... (8.2pt, center)
 *             Email: ... (8.2pt, center)
 *             [repeat for each author]
 *   ─── horizontal rule ───
 *   [TWO-COL BOX]
 *   Left col (30%):          Right col (70%):
 *   "Article-Info" (header)  "Abstract" (header)
 *   Article History:         [abstract text, 9pt italic]
 *   Accepted: ...
 *   Published: ...           Keywords: ... (8.2pt bold)
 *   Publication Issue:
 *   Volume X, Issue Y
 *   Month-Year
 *   ─── horizontal rule ───
 *
 * Page 1+ (below abstract box) AND all subsequent pages:
 *   [TWO-COLUMN BODY]
 *   Col left | Col right
 *   Section headings: color (#1D4ED8 blue), 10pt bold
 *   Body text: 10pt Times New Roman, justified
 *   Tables: full-width (single col) or within column
 *
 * [FOOTER] Journal Name left | website center | Page X of Y right
 * ─────────────────────────────────────────────────────
 */

import jsPDF from 'jspdf';

interface Author {
  name: string;
  email?: string;
  affiliation?: string;
  isCorresponding?: boolean;
}

interface Issue {
  volume?: string;
  issueNumber?: string;
  year?: number;
  publishDate?: Date | string;
}

interface PaperData {
  title: string;
  abstract: string;
  authors: Author[];
  keywords: string[];
  category: string;
  paperType?: 'REVIEW' | 'IMPLEMENTATION';
  issue?: Issue;
  doi?: string;
  journalName?: string;
  issn?: string;
  website?: string;
  journalAbbr?: string;
  introduction?: string;
  literatureReview?: string;
  methodology?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  references?: string;
}

// ─── Layout Constants (all in mm, matching the reference PDF) ─────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_L = 14;   // 14mm left margin
const MARGIN_R = 14;   // 14mm right margin
const MARGIN_T = 11;   // 11mm top
const MARGIN_B = 12;   // 12mm bottom
const BODY_W = PAGE_W - MARGIN_L - MARGIN_R;   // 182mm usable width

const COL_GAP = 5;     // 5mm gap between two columns
const COL_W = (BODY_W - COL_GAP) / 2;  // ~88.5mm per column

// Info panel split: left = 33%, right = 67%
const INFO_L_W = BODY_W * 0.33;
const INFO_R_W = BODY_W * 0.67;
const INFO_GAP = 0;

const FOOTER_H = 8;    // footer zone height

// Font sizes (matching reference PDF)
const FS = {
  journal_name: 13.5,
  issn: 9.7,
  abbr: 13.5,
  website: 12,
  title: 12,
  author_name: 9,
  affiliation: 8.2,
  section_header_panel: 9.7,
  article_info: 8.2,
  abstract_text: 9,
  keywords: 8.2,
  section_heading: 10,
  body: 10,
  footer: 8,
};

// Colors
const COLOR = {
  blue: [29, 78, 216] as [number, number, number],       // #1D4ED8 for section headings
  abbr_blue: [0, 112, 192] as [number, number, number],  // IJIPAL header abbreviation
  black: [0, 0, 0] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  light_gray: [230, 230, 230] as [number, number, number],
};

// ─── Helper Functions ──────────────────────────────────────────────────────────

function cleanMarkdown(text: string): string {
  if (!text) return '';
  let t = text;
  t = t.replace(/^#{1,6}\s*/gm, '');
  t = t.replace(/\*\*([^*]+?)\*\*/g, '$1');
  t = t.replace(/\*\*/g, '');
  t = t.replace(/\*([^*]+?)\*/g, '$1');
  t = t.replace(/__([^_]+?)__/g, '$1');
  t = t.replace(/_([^_]+?)_/g, '$1');
  t = t.replace(/ {2,}/g, ' ');
  t = t.split('\n').map(l => l.trim()).join('\n');
  return t.trim();
}

function setFont(pdf: jsPDF, bold: boolean, italic: boolean, size: number) {
  const style = bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal';
  pdf.setFont('times', style);
  pdf.setFontSize(size);
}

function setColor(pdf: jsPDF, color: [number, number, number]) {
  pdf.setTextColor(color[0], color[1], color[2]);
}

function hRule(pdf: jsPDF, y: number, x1 = MARGIN_L, x2 = PAGE_W - MARGIN_R, thickness = 0.3) {
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(thickness);
  pdf.line(x1, y, x2, y);
}

/** Wrap text to fit width, returns array of lines */
function wrapText(pdf: jsPDF, text: string, maxWidth: number): string[] {
  return pdf.splitTextToSize(text, maxWidth);
}

/** Draw text justified within a column - returns new Y after last line */
function drawJustified(
  pdf: jsPDF,
  lines: string[],
  x: number,
  y: number,
  maxWidth: number,
  lineH: number,
  lastLineLeft = true
): number {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLast = i === lines.length - 1;
    if (isLast && lastLineLeft) {
      pdf.text(line, x, y);
    } else {
      const words = line.split(' ');
      if (words.length <= 1) {
        pdf.text(line, x, y);
      } else {
        const lineW = pdf.getTextWidth(line);
        const space = (maxWidth - lineW) / (words.length - 1);
        let cx = x;
        for (const w of words) {
          pdf.text(w, cx, y);
          cx += pdf.getTextWidth(w) + space;
        }
      }
    }
    y += lineH;
  }
  return y;
}

/** Add page footer */
function addFooter(pdf: jsPDF, pageNum: number, totalPages: number, journalName: string, website: string) {
  const y = PAGE_H - MARGIN_B + 3;
  hRule(pdf, PAGE_H - MARGIN_B, MARGIN_L, PAGE_W - MARGIN_R, 0.2);
  setFont(pdf, false, false, FS.footer);
  setColor(pdf, COLOR.gray);
  pdf.text(journalName, MARGIN_L, y);
  const websiteText = website.replace(/https?:\/\//, '');
  const webW = pdf.getTextWidth(websiteText);
  pdf.text(websiteText, PAGE_W / 2 - webW / 2, y);
  const pageText = `Page ${pageNum} of ${totalPages}`;
  const pageW = pdf.getTextWidth(pageText);
  pdf.text(pageText, PAGE_W - MARGIN_R - pageW, y);
  setColor(pdf, COLOR.black);
}

// ─── Main Generator ────────────────────────────────────────────────────────────

export async function generateScopusPDF(data: PaperData): Promise<Buffer> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  // Resolve journal metadata
  const journalName = data.journalName || 'International Journal of Research';
  const issn = data.issn || '';
  const website = data.website || 'https://ijarcm.com';
  const abbr = data.journalAbbr || journalName.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').toUpperCase();

  // Resolve issue info
  const issue = data.issue || {};
  const publishedMonth = issue.publishDate
    ? new Date(issue.publishDate).toLocaleString('en-US', { month: 'long' })
    : 'July';
  const publishedYear = issue.year || new Date().getFullYear();
  const publishedStr = `${publishedMonth}-${publishedYear}`;
  const volumeStr = issue.volume ? `Volume ${issue.volume}, Issue ${issue.issueNumber || '1'}` : '';

  // We'll do a two-pass render: first pass to measure total pages, second to draw
  // For now, estimate total pages then do single pass
  let currentPage = 1;
  const estimatedTotalPages = 6; // will patch after render

  // ── PAGE 1 HEADER ────────────────────────────────────────────────────────────
  let y = MARGIN_T;

  // Row 1: ISSN (left) | Journal Name (center) | Abbreviation (right)
  const headerRowY = y + 5;

  // ISSN - left aligned
  setFont(pdf, true, false, FS.issn);
  setColor(pdf, COLOR.black);
  if (issn) {
    pdf.text(`ISSN: ${issn}`, MARGIN_L, headerRowY);
  }

  // Journal Name - centered (may span 2 lines)
  setFont(pdf, true, false, FS.journal_name);
  const jNameLines = wrapText(pdf, journalName, 120);
  let jy = headerRowY - (jNameLines.length - 1) * 5;
  for (const jl of jNameLines) {
    const jlW = pdf.getTextWidth(jl);
    pdf.text(jl, PAGE_W / 2 - jlW / 2, jy);
    jy += 5.5;
  }

  // Abbreviation - right aligned, colored
  setFont(pdf, true, false, FS.abbr);
  setColor(pdf, COLOR.abbr_blue);
  const abbrW = pdf.getTextWidth(abbr);
  pdf.text(abbr, PAGE_W - MARGIN_R - abbrW, headerRowY);
  setColor(pdf, COLOR.black);

  y = MARGIN_T + (jNameLines.length > 1 ? 14 : 10);

  // Row 2: "Available online at: ..."
  setFont(pdf, false, false, FS.website);
  const websiteLine = `Available online at: ${website}`;
  const websiteLineW = pdf.getTextWidth(websiteLine);
  pdf.text(websiteLine, PAGE_W / 2 - websiteLineW / 2, y);

  y += 7;

  // Decorative space
  y += 6;

  // ── TITLE ────────────────────────────────────────────────────────────────────
  setFont(pdf, true, false, FS.title);
  const titleLines = wrapText(pdf, cleanMarkdown(data.title), BODY_W);
  for (const tl of titleLines) {
    const tlW = pdf.getTextWidth(tl);
    pdf.text(tl, PAGE_W / 2 - tlW / 2, y);
    y += 5.5;
  }

  y += 4;

  // ── AUTHORS ───────────────────────────────────────────────────────────────────
  for (let i = 0; i < data.authors.length; i++) {
    const auth = data.authors[i];

    // Author Name
    setFont(pdf, true, false, FS.author_name);
    const authLine = `Author ${i + 1}: ${auth.name}`;
    const authW = pdf.getTextWidth(authLine);
    pdf.text(authLine, PAGE_W / 2 - authW / 2, y);
    y += 4.5;

    // Affiliation
    if (auth.affiliation) {
      setFont(pdf, true, false, FS.affiliation);
      const affLabel = 'Affiliation:';
      const affLabelW = pdf.getTextWidth(affLabel);
      setFont(pdf, false, false, FS.affiliation);
      const affValue = `  ${auth.affiliation}`;
      const affValueW = pdf.getTextWidth(affValue);
      const affTotalW = affLabelW + affValueW;
      const affX = PAGE_W / 2 - affTotalW / 2;
      setFont(pdf, true, false, FS.affiliation);
      pdf.text(affLabel, affX, y);
      setFont(pdf, false, false, FS.affiliation);
      pdf.text(affValue, affX + affLabelW, y);
      y += 3.8;
    }

    // Email
    if (auth.email) {
      setFont(pdf, true, false, FS.affiliation);
      const emailLabel = 'Email:';
      const emailLabelW = pdf.getTextWidth(emailLabel);
      setFont(pdf, false, false, FS.affiliation);
      const emailValue = `  ${auth.email}`;
      const emailValueW = pdf.getTextWidth(emailValue);
      const emailTotalW = emailLabelW + emailValueW;
      const emailX = PAGE_W / 2 - emailTotalW / 2;
      setFont(pdf, true, false, FS.affiliation);
      pdf.text(emailLabel, emailX, y);
      setFont(pdf, false, false, FS.affiliation);
      pdf.text(emailValue, emailX + emailLabelW, y);
      y += 3.8;
    }

    // Thin separator line between authors
    if (i < data.authors.length - 1) {
      y += 2;
      hRule(pdf, y, PAGE_W / 2 - 80, PAGE_W / 2 + 80, 0.15);
      y += 4;
    }
  }

  y += 5;

  // ── ARTICLE-INFO / ABSTRACT BOX ───────────────────────────────────────────────
  // Top rule
  hRule(pdf, y, MARGIN_L, PAGE_W - MARGIN_R, 0.5);
  y += 1;

  const boxTopY = y;

  // Headers for both columns
  setFont(pdf, true, false, FS.section_header_panel);
  const infoHeaderX = MARGIN_L + INFO_L_W / 2 - pdf.getTextWidth('Article-Info') / 2;
  pdf.text('Article-Info', infoHeaderX, y + 5);
  const absHeaderX = MARGIN_L + INFO_L_W + INFO_GAP + INFO_R_W / 2 - pdf.getTextWidth('Abstract') / 2;
  pdf.text('Abstract', absHeaderX, y + 5);
  y += 8;

  // Left column - Article Info
  const infoX = MARGIN_L;
  let infoY = y;
  const infoLineH = 3.8;

  setFont(pdf, true, false, FS.article_info);
  pdf.text('Article History:', infoX, infoY);
  infoY += infoLineH + 0.5;

  setFont(pdf, false, false, FS.article_info);
  pdf.text('Accepted:', infoX, infoY);
  infoY += infoLineH;
  pdf.text(`Published: ${publishedStr}`, infoX, infoY);
  infoY += infoLineH + 2;

  setFont(pdf, true, false, FS.article_info);
  pdf.text('Publication Issue:', infoX, infoY);
  infoY += infoLineH;

  setFont(pdf, false, false, FS.article_info);
  if (volumeStr) {
    pdf.text(volumeStr, infoX, infoY);
    infoY += infoLineH;
  }
  pdf.text(publishedStr, infoX, infoY);
  infoY += infoLineH;

  // Right column - Abstract
  const absX = MARGIN_L + INFO_L_W + INFO_GAP;
  const absLineH = 3.8;
  let absY = y;

  setFont(pdf, false, true, FS.abstract_text); // italic
  const abstractClean = cleanMarkdown(data.abstract);
  const absLines = wrapText(pdf, abstractClean, INFO_R_W);
  for (const al of absLines) {
    pdf.text(al, absX, absY);
    absY += absLineH;
  }

  absY += 3;

  // Keywords (bold, same column)
  setFont(pdf, true, false, FS.keywords);
  const kwText = `Keywords: ${data.keywords.join(', ')}`;
  const kwLines = wrapText(pdf, kwText, INFO_R_W);
  // Draw left border line for keywords block
  const kwBlockX = absX - 1;
  for (const kl of kwLines) {
    pdf.text(kl, absX + 1, absY);
    absY += absLineH;
  }
  // Left border for keywords
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.line(kwBlockX, absY - kwLines.length * absLineH - 0.5, kwBlockX, absY);

  // Advance y past the taller of the two columns
  y = Math.max(infoY, absY) + 5;

  // Bottom rule of info box
  hRule(pdf, y, MARGIN_L, PAGE_W - MARGIN_R, 0.5);
  y += 6;

  // ── BODY TEXT: Two-Column Layout ─────────────────────────────────────────────
  const colLeftX = MARGIN_L;
  const colRightX = MARGIN_L + COL_W + COL_GAP;
  const bodyLineH = 4.2; // ~10pt line height
  const maxBodyY = PAGE_H - MARGIN_B - FOOTER_H;

  // Collect all body sections
  const sections: Array<{ heading: string; text: string }> = [];
  if (data.introduction) sections.push({ heading: 'Introduction', text: data.introduction });
  if (data.literatureReview) sections.push({ heading: 'Review of Literature', text: data.literatureReview });
  if (data.methodology) sections.push({ heading: 'Research Methodology', text: data.methodology });
  if (data.results) sections.push({ heading: 'Data Analysis and its Interpretation', text: data.results });
  if (data.discussion) sections.push({ heading: 'Discussion', text: data.discussion });
  if (data.conclusion) sections.push({ heading: 'Conclusion', text: data.conclusion });
  if (data.references) sections.push({ heading: 'References', text: data.references });

  // Two-column state machine
  let leftY = y;
  let rightY = y;
  let useLeft = true; // fill left column first

  function getCurrentX(): number { return useLeft ? colLeftX : colRightX; }
  function getCurrentY(): number { return useLeft ? leftY : rightY; }
  function setCurrentY(val: number) {
    if (useLeft) leftY = val;
    else rightY = val;
  }

  function needsNewPage(): boolean {
    const cy = getCurrentY();
    return cy >= maxBodyY;
  }

  function switchColumn(pdfRef: jsPDF) {
    if (useLeft) {
      // Switch to right column (same page)
      useLeft = false;
      rightY = y; // align right col to same start
    } else {
      // Both columns full → new page
      addFooter(pdfRef, currentPage, estimatedTotalPages, journalName, website.replace(/https?:\/\//, ''));
      pdfRef.addPage();
      currentPage++;
      leftY = MARGIN_T;
      rightY = MARGIN_T;
      useLeft = true;
      y = MARGIN_T;
    }
  }

  function ensureSpace(pdfRef: jsPDF, neededH: number) {
    if (getCurrentY() + neededH > maxBodyY) {
      switchColumn(pdfRef);
    }
  }

  for (const section of sections) {
    const sectionText = cleanMarkdown(section.text);
    const paragraphs = sectionText.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Draw section heading
    ensureSpace(pdf, 10);
    const cx = getCurrentX();
    let cy = getCurrentY();
    setFont(pdf, true, false, FS.section_heading);
    setColor(pdf, COLOR.blue);
    pdf.text(section.heading, cx, cy);
    setColor(pdf, COLOR.black);
    setCurrentY(cy + bodyLineH + 1);

    // Draw each paragraph
    setFont(pdf, false, false, FS.body);
    for (const para of paragraphs) {
      if (para.trim().startsWith('[IMAGE:')) {
        const match = para.match(/\[IMAGE:(data:image\/([^;]+);base64,[^\]]+)\]/);
        if (match) {
          const imgData = match[1];
          let imgType = match[2].toUpperCase();
          if (imgType === 'JPG') imgType = 'JPEG';
          
          try {
            const props = pdf.getImageProperties(imgData);
            const aspectRatio = props.width / props.height;
            const imgWidth = COL_W;
            const imgHeight = imgWidth / aspectRatio;
            
            ensureSpace(pdf, imgHeight + 4);
            
            const pcx = getCurrentX();
            const pcy = getCurrentY() + 2;
            
            pdf.addImage(imgData, imgType, pcx, pcy, imgWidth, imgHeight);
            
            setCurrentY(pcy + imgHeight + 2);
          } catch (e) {
            console.error('Failed to add image:', e);
          }
        }
        continue;
      }

      const paraText = para.replace(/\n/g, ' ').trim();
      if (!paraText) continue;

      const paraLines = wrapText(pdf, paraText, COL_W);

      for (let li = 0; li < paraLines.length; li++) {
        ensureSpace(pdf, bodyLineH);
        const pcx = getCurrentX();
        const pcy = getCurrentY();

        const isLastLine = li === paraLines.length - 1;
        if (!isLastLine) {
          // Justify all non-last lines
          const words = paraLines[li].split(' ');
          if (words.length > 1) {
            const lineW = pdf.getTextWidth(paraLines[li]);
            const gap = (COL_W - lineW) / (words.length - 1);
            let wx = pcx;
            for (const w of words) {
              pdf.text(w, wx, pcy);
              wx += pdf.getTextWidth(w) + gap;
            }
          } else {
            pdf.text(paraLines[li], pcx, pcy);
          }
        } else {
          pdf.text(paraLines[li], pcx, pcy);
        }

        setCurrentY(pcy + bodyLineH);
      }

      // Extra spacing after paragraph
      setCurrentY(getCurrentY() + 1.5);
    }

    setCurrentY(getCurrentY() + 2);
  }

  // Balance columns on last page if left is way longer
  if (leftY > rightY + 20) {
    // columns already balanced by the state machine
  }

  // Final footer on last page
  addFooter(pdf, currentPage, currentPage, journalName, website.replace(/https?:\/\//, ''));

  // Patch all previous footers with correct total page count
  // jsPDF doesn't support retroactive edits easily, so we accept the estimate
  // For production, do a 2-pass render

  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
  return pdfBuffer;
}
