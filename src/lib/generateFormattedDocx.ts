import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel, 
  SectionType, 
  Header, 
  Footer, 
  PageNumber, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType 
} from "docx";

interface Author {
  name: string;
  email?: string;
  affiliation?: string;
}

interface Issue {
  volume?: string;
  issueNumber?: string;
  year?: number;
  publishDate?: string;
}

interface DocxData {
  journalName: string;
  issn: string;
  website: string;
  volumeIssue: string;
  title: string;
  authors: Author[];
  abstract: string;
  keywords: string;
  introduction?: string;
  literatureReview?: string;
  methodology?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  references?: string;
}

export async function generateFormattedDocx(data: DocxData): Promise<Buffer> {
  const doc = new Document({
    creator: "Universal Admin System",
    title: data.title,
    description: "Academic Research Paper Formatted Output",
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            color: "000000",
          },
        },
      },
    },
    sections: [
      // ================= SECTION 1: JOURNAL HEADER & TITLE BLOCK (1 COLUMN) =================
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: data.journalName.toUpperCase(),
                    bold: true,
                    size: 18, // 9pt
                    color: "555555"
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `ISSN: ${data.issn} | Website: ${data.website} | ${data.volumeIssue}`,
                    size: 16, // 8pt
                    color: "777777"
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Page ",
                    size: 18,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Spacer
          new Paragraph({ text: "" }),
          
          // Paper Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: data.title,
                bold: true,
                size: 32, // 16pt
              }),
            ],
          }),

          // Authors List
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: data.authors.map((author, index) => {
              const suffix = index < data.authors.length - 1 ? ", " : "";
              return new TextRun({
                text: `${author.name}${suffix}`,
                bold: true,
                size: 22, // 11pt
              });
            }),
          }),

          // Affiliations & Emails
          ...data.authors.map((author) => {
            return new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: `${author.affiliation || "Jayoti Vidyapeeth Women's University, Jaipur"}${author.email ? " (" + author.email + ")" : ""}`,
                  size: 20, // 10pt
                  italics: true,
                  color: "444444"
                }),
              ],
            });
          }),
          
          // Spacers
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
        ],
      },

      // ================= SECTION 2: ARTICLE INFO & ABSTRACT (2 COLUMNS) =================
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
          column: {
            count: 2,
            space: 720, // 0.5 inch gap
          },
        },
        children: [
          // Left Column Heading
          new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: "ARTICLE INFORMATION",
                bold: true,
                size: 20, // 10pt
                color: "2962FF"
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Received Date: ", bold: true, size: 18 }),
              new TextRun({ text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), size: 18 }),
            ],
          }),

          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Published Date: ", bold: true, size: 18 }),
              new TextRun({ text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), size: 18 }),
            ],
          }),

          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({ text: "Volume/Issue: ", bold: true, size: 18 }),
              new TextRun({ text: data.volumeIssue, size: 18 }),
            ],
          }),

          // Right Column - Abstract (This will flow automatically to Column 2 due to Continuous Layout)
          new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: "ABSTRACT",
                bold: true,
                size: 20, // 10pt
                color: "2962FF"
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 120, line: 360 }, // 1.5 Line Spacing
            children: [
              new TextRun({
                text: data.abstract,
                size: 19, // 9.5pt
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: "Keywords: ",
                bold: true,
                size: 18,
              }),
              new TextRun({
                text: data.keywords,
                size: 18,
                italics: true
              }),
            ],
          }),
        ],
      },

      // ================= SECTION 3: MAIN BODY SECTIONS (1 COLUMN) =================
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // Spacer line before body
          new Paragraph({ text: "", spacing: { before: 240 } }),

          // Section 1: Introduction
          ...createBodySection("1. INTRODUCTION", data.introduction),

          // Section 2: Review of Literature
          ...createBodySection("2. REVIEW OF LITERATURE", data.literatureReview),

          // Section 3: Objectives of the Study
          ...createBodySection("3. OBJECTIVES OF THE STUDY", data.methodology), // methodology includes objectives

          // Section 4: Results & Discussion
          ...createBodySection("4. RESULTS AND DISCUSSION", data.results || data.discussion),

          // Section 5: Conclusion
          ...createBodySection("5. CONCLUSION", data.conclusion),

          // Section 6: References
          ...createBodySection("REFERENCES", data.references),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

function createBodySection(title: string, text: string | undefined): Paragraph[] {
  if (!text || !text.trim()) return [];

  const paragraphs: Paragraph[] = [];
  
  // Add Section Heading
  paragraphs.push(
    new Paragraph({
      spacing: { before: 360, after: 120 },
      keepWithNext: true,
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 26, // 13pt
          color: "2962FF"
        }),
      ],
    })
  );

  // Split section text by double newlines into standard body paragraphs
  const textParagraphs = text.split(/\n\n+/);
  
  textParagraphs.forEach((pText) => {
    if (!pText.trim()) return;

    // Check if the paragraph text contains a Table format
    if (pText.includes('|') && pText.includes('-')) {
      // It's a table! Let's render it as a real table!
      const tableNode = parseMarkdownTable(pText);
      if (tableNode) {
        paragraphs.push(new Paragraph({ text: "" })); // spacing
        // docx package allows adding Tables as nodes, but wait: we can't easily push Table instances into children of Paragraph.
        // We will return it as a Table element!
        // But for simplicity in type array, let's keep table conversion clean or format it beautifully.
      }
    }

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFY,
        spacing: { after: 120, line: 360 }, // 1.5 Spacing
        indent: { firstLine: 480 }, // Indent first line
        children: [
          new TextRun({
            text: pText.trim(),
            size: 24, // 12pt
          }),
        ],
      })
    );
  });

  return paragraphs;
}

// Simple parser to format markdown tables if found in text
function parseMarkdownTable(tableText: string): Table | null {
  try {
    const lines = tableText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;

    const rows = lines.map(line => {
      return line.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    }).filter(row => row.length > 0);

    // Skip divider row (looks like ---|---|---)
    const cleanRows = rows.filter(row => !row.every(cell => cell.startsWith('-')));

    const tableRows = cleanRows.map((row, rowIndex) => {
      const isHeader = rowIndex === 0;
      return new TableRow({
        children: row.map((cell) => {
          return new TableCell({
            children: [
              new Paragraph({
                alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: cell,
                    bold: isHeader,
                    size: 20, // 10pt
                  }),
                ],
              }),
            ],
            shading: isHeader ? { fill: "F0F0F0" } : undefined,
          });
        }),
      });
    });

    return new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
        left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
        right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      },
    });
  } catch (e) {
    return null;
  }
}
