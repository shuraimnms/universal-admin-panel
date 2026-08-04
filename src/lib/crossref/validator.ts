export type ValidationStatus = 'READY' | 'WARNINGS' | 'ERRORS';

export interface ValidationResult {
  status: ValidationStatus;
  warnings: string[];
  errors: string[];
}

export function validateCrossrefMetadata(
  paper: any, 
  settings: any, 
  journalSettings: any
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Settings validation
  if (!settings || !settings.crossrefUser || !settings.crossrefPass || !settings.doiPrefix) {
    errors.push('Missing Crossref Settings (Username, Password, or DOI Prefix).');
  }

  // Journal Settings validation
  if (!journalSettings) {
    errors.push('Missing Journal Settings for Crossref (ISSN, Publisher Name, etc).');
  } else {
    if (!journalSettings.issn && !journalSettings.eissn) {
      errors.push('Journal must have an ISSN or EISSN.');
    }
    if (!journalSettings.publisher) {
      errors.push('Journal must have a publisher name configured.');
    }
  }

  // Paper validation
  if (!paper) {
    errors.push('Paper data is missing.');
    return { status: 'ERRORS', warnings, errors };
  }

  if (!paper.title) {
    errors.push('Paper is missing a title.');
  }

  if (!paper.doi) {
    errors.push('Paper is missing a DOI. Generate a DOI first.');
  }

  if (!paper.paperAuthors || paper.paperAuthors.length === 0) {
    errors.push('Paper is missing authors.');
  } else {
    const hasMissingAuthorNames = paper.paperAuthors.some((pa: any) => !pa.user?.firstName && !pa.user?.lastName);
    if (hasMissingAuthorNames) {
      errors.push('One or more authors are missing a first or last name.');
    }
    const hasMissingEmails = paper.paperAuthors.some((pa: any) => !pa.user?.email);
    if (hasMissingEmails) {
      warnings.push('One or more authors are missing an email address.');
    }
  }

  if (!paper.publicationDate && !paper.publishedAt) {
    warnings.push('Paper is missing a publication date. The current date will be used.');
  }

  if (!paper.volumeNumber) {
    warnings.push('Paper is missing a Volume number.');
  }

  if (!paper.issueNumber) {
    warnings.push('Paper is missing an Issue number.');
  }
  
  if (!paper.paperContent?.references) {
    warnings.push('Paper has no references extracted.');
  }

  if (!paper.filePath) {
    errors.push('Paper is missing the main PDF file.');
  }

  const status: ValidationStatus = errors.length > 0 ? 'ERRORS' : (warnings.length > 0 ? 'WARNINGS' : 'READY');

  return { status, warnings, errors };
}
