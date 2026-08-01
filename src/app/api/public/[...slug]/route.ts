import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  // Extract query parameters just in case
  const { searchParams } = new URL(request.url);
  const select = searchParams.get('select');
  const key = searchParams.get('key');
  
  // Return an empty array or empty object to satisfy the frontend safely 
  // without crashing or throwing a 404 network error in the browser console.
  
  // A generic fallback for tables that don't have dedicated endpoints yet.
  return NextResponse.json({
    success: true,
    data: [], // Returning an empty array is the safest fallback for Supabase table queries
    meta: {
      source: 'IJARCM Public API Stub',
      table: params.slug.join('/'),
      stubbed: true
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
