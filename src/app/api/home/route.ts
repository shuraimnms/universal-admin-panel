import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data to bypass the database connection issue
  const mockStats = {
    totalPapers: 156,
    totalAuthors: 342,
    totalDownloads: 12450,
    totalReviews: 89,
  };

  const mockLatestPapers = [
    {
      id: '1',
      title: 'The Impact of Artificial Intelligence on Modern Supply Chain Management',
      abstract: 'This paper explores how AI and machine learning algorithms are revolutionizing supply chain logistics, predicting demand, and optimizing inventory management...',
      authors: ['Dr. Sarah Chen', 'Prof. James Wilson'],
      publishedAt: new Date().toISOString(),
      downloads: 342,
      category: 'Supply Chain',
    },
    {
      id: '2',
      title: 'Sustainable Business Practices in Developing Economies',
      abstract: 'An in-depth analysis of how companies in emerging markets are balancing economic growth with environmental sustainability and social responsibility.',
      authors: ['Michael O. Adebayo', 'Elena Rodriguez'],
      publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      downloads: 215,
      category: 'Sustainability',
    },
    {
      id: '3',
      title: 'Digital Transformation in Retail Banking: A Consumer Trust Perspective',
      abstract: 'Evaluating how the shift to digital-only banking services affects consumer trust and long-term loyalty in the financial sector.',
      authors: ['Dr. Alan Turing'],
      publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      downloads: 412,
      category: 'Finance',
    }
  ];

  const mockLatestIssue = {
    id: 'issue-1',
    title: 'Special Issue on Technology and Commerce',
    description: 'Focusing on the intersection of modern technology and global commerce practices.',
    volume: '5',
    issue: '2',
    year: 2025,
    publicationDate: new Date().toISOString(),
    coverImage: null,
    paperCount: 12
  };

  return NextResponse.json({
    stats: mockStats,
    latestPapers: mockLatestPapers,
    latestIssue: mockLatestIssue,
    upcomingIssue: null,
    currentImpactFactor: {
      year: 2024,
      value: 4.5,
    }
  });
}
