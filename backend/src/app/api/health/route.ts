import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Finance Backend API',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
  });
}
