export function generateCrossrefXML(
  paper: any,
  settings: any,
  journalSettings: any
): string {
  const timestamp = Date.now().toString();
  const batchId = `BATCH-${paper.id}-${timestamp}`;
  const publicationDate = new Date(paper.publicationDate || paper.publishedAt || new Date());
  
  const pubYear = publicationDate.getFullYear();
  const pubMonth = String(publicationDate.getMonth() + 1).padStart(2, '0');
  const pubDay = String(publicationDate.getDate()).padStart(2, '0');

  const depositorName = settings.depositorName || 'Admin';
  const depositorEmail = settings.depositorEmail || 'admin@example.com';
  
  const journalTitle = journalSettings.journalName || 'Unknown Journal';
  const journalAbbrev = journalSettings.shortName || '';
  const issn = journalSettings.issn || journalSettings.eissn || '';
  
  // Build authors XML
  let contributorsXml = '';
  if (paper.paperAuthors && paper.paperAuthors.length > 0) {
    contributorsXml = `
          <contributors>
${paper.paperAuthors.map((pa: any, index: number) => {
      const seq = index === 0 ? 'first' : 'additional';
      const role = 'author';
      const firstName = pa.user?.firstName || 'Unknown';
      const lastName = pa.user?.lastName || 'Unknown';
      // Add ORCID if available (assuming it might be added to User later)
      return `            <person_name sequence="${seq}" contributor_role="${role}">
              <given_name>${escapeXml(firstName)}</given_name>
              <surname>${escapeXml(lastName)}</surname>
            </person_name>`;
    }).join('\n')}
          </contributors>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="4.3.7" xmlns="http://www.crossref.org/schema/4.3.7" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.crossref.org/schema/4.3.7 http://www.crossref.org/schemas/crossref4.3.7.xsd">
  <head>
    <doi_batch_id>${batchId}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${escapeXml(depositorName)}</depositor_name>
      <email_address>${escapeXml(depositorEmail)}</email_address>
    </depositor>
    <registrant>${escapeXml(settings.publisherName || journalSettings.publisher)}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata>
        <full_title>${escapeXml(journalTitle)}</full_title>
        <abbrev_title>${escapeXml(journalAbbrev)}</abbrev_title>
        <issn media_type="electronic">${escapeXml(issn)}</issn>
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <month>${pubMonth}</month>
          <day>${pubDay}</day>
          <year>${pubYear}</year>
        </publication_date>
        ${paper.volumeNumber ? `<journal_volume><volume>${escapeXml(paper.volumeNumber)}</volume></journal_volume>` : ''}
        ${paper.issueNumber ? `<issue>${escapeXml(paper.issueNumber)}</issue>` : ''}
      </journal_issue>
      <journal_article publication_type="full_text">
        <titles>
          <title>${escapeXml(paper.title)}</title>
        </titles>
${contributorsXml}
        <publication_date media_type="online">
          <month>${pubMonth}</month>
          <day>${pubDay}</day>
          <year>${pubYear}</year>
        </publication_date>
        <doi_data>
          <doi>${escapeXml(paper.doi)}</doi>
          <resource>${escapeXml(journalSettings.homepage || '')}/paper/${paper.id}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;

  return xml.trim();
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
