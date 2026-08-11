import mammoth from 'mammoth';
import { generateFormattedDocx } from './generateFormattedDocx';
import { generateScopusPDF } from './generateScopusPDF';

interface Author {
  name: string;
  email?: string;
  affiliation?: string;
}

interface IssueData {
  volume?: string;
  issueNumber?: string;
  year?: number;
  publishDate?: string;
}

interface PipelineInput {
  fileBuffer: Buffer;
  title: string;
  authors: Author[];
  category: string;
  issue?: IssueData;
  doi?: string;
  journalName?: string;
  issn?: string;
  website?: string;
}

export async function runDocxPipeline(input: PipelineInput) {
  // 1. Content Extractor (Mammoth)
  const result = await mammoth.extractRawText({ buffer: input.fileBuffer });
  const rawText = result.value;

  // 2. Section Classifier
  const sectionHeadings = [
    { id: 'introduction', name: '1 Introduction', regex: /(?:1\s*[\.\-]?\s*)?Introduction/i },
    { id: 'literatureReview', name: '2 Review of Literature', regex: /(?:2\s*[\.\-]?\s*)?Review\s+of\s+Literature/i },
    { id: 'methodology', name: '3 Research Methodology', regex: /(?:3\s*[\.\-]?\s*)?(?:Research\s+)?Methodology|Objectives|Hypothesis/i },
    { id: 'results', name: '4 Results and Discussion', regex: /(?:4\s*[\.\-]?\s*)?Results\s+and\s+Discussion|Data\s+Analysis/i },
    { id: 'conclusion', name: '5 Conclusion', regex: /(?:5\s*[\.\-]?\s*)?Conclusion/i },
    { id: 'references', name: '6 References', regex: /(?:6\s*[\.\-]?\s*)?References/i },
  ];

  // Extract Abstract
  let abstract = '';
  const abstractIndex = rawText.search(/abstract/i);
  const keywordsIndex = rawText.search(/keywords/i);
  const introductionIndex = rawText.search(/introduction/i);
  
  if (abstractIndex !== -1) {
    const endIdx = keywordsIndex !== -1 ? keywordsIndex : (introductionIndex !== -1 ? introductionIndex : abstractIndex + 1200);
    abstract = rawText.substring(abstractIndex + 8, endIdx).trim().replace(/^[:\-\s\r\n]+/, '');
  }

  // Extract Keywords
  let keywordsStr = '';
  if (keywordsIndex !== -1) {
    const nextHeadingIndex = introductionIndex !== -1 ? introductionIndex : keywordsIndex + 250;
    keywordsStr = rawText.substring(keywordsIndex + 8, nextHeadingIndex).trim().replace(/^[:\-\s\r\n]+/, '');
  }

  // Extract outline sections text
  const sections: Record<string, string> = {
    introduction: '',
    literatureReview: '',
    methodology: '',
    results: '',
    conclusion: '',
    references: ''
  };

  const headingPositions = sectionHeadings.map(h => {
    const pos = rawText.search(h.regex);
    return { id: h.id, name: h.name, pos };
  }).filter(h => h.pos !== -1)
    .sort((a, b) => a.pos - b.pos);
    
  for (let i = 0; i < headingPositions.length; i++) {
    const current = headingPositions[i];
    const next = headingPositions[i + 1];
    
    const startPos = current.pos + current.name.length;
    const endPos = next ? next.pos : rawText.length;
    
    let sectionText = rawText.substring(startPos, endPos).trim().replace(/^[:\-\s\r\n]+/, '');
    sections[current.id] = sectionText;
  }

  // 3. Fallback/Default metadata settings
  const journalName = input.journalName || 'International Journal of Research in Computer Application & Management';
  const issn = input.issn || '2455-0116';
  const website = input.website || 'www.ijrcam.com';
  
  let volumeIssue = 'Vol. 1, Issue 1 (2026)';
  if (input.issue?.volume && input.issue?.issueNumber) {
    volumeIssue = `Vol. ${input.issue.volume}, Issue ${input.issue.issueNumber} (${input.issue.year || 2026})`;
  }

  // 4. Generate DOCX Buffer (Template Mapper + DOCX Generator)
  const docxBuffer = await generateFormattedDocx({
    journalName,
    issn,
    website,
    volumeIssue,
    title: input.title,
    authors: input.authors,
    abstract: abstract || 'Abstract not found in manuscript.',
    keywords: keywordsStr || 'Keywords not found in manuscript.',
    introduction: sections.introduction,
    literatureReview: sections.literatureReview,
    methodology: sections.methodology,
    results: sections.results,
    conclusion: sections.conclusion,
    references: sections.references,
  });

  // 5. Generate PDF Buffer (PDF Export)
  const pdfBuffer = await generateScopusPDF({
    title: input.title,
    abstract: abstract || 'Abstract not found in manuscript.',
    authors: input.authors.map(a => ({
      name: a.name,
      email: a.email,
      isCorresponding: true // Mark first as corresponding default
    })),
    keywords: keywordsStr ? keywordsStr.split(',').map(k => k.trim()) : [],
    category: input.category,
    issue: input.issue,
    doi: input.doi,
    introduction: sections.introduction,
    literatureReview: sections.literatureReview,
    methodology: sections.methodology,
    results: sections.results,
    conclusion: sections.conclusion,
    references: sections.references,
  });

  return {
    docxBuffer,
    pdfBuffer,
    abstract: abstract || 'Abstract not found.',
    keywords: keywordsStr || ''
  };
}
