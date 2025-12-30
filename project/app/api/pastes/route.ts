import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

function getCurrentTime(request: NextRequest): Date {
  const testMode = process.env.TEST_MODE === '1';

  if (testMode) {
    const testNowMs = request.headers.get('x-test-now-ms');
    if (testNowMs) {
      return new Date(parseInt(testNowMs, 10));
    }
  }

  return new Date();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { content, ttl, max_views } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content cannot be empty' },
        { status: 400 }
      );
    }

    if (ttl !== undefined && (typeof ttl !== 'number' || ttl <= 0)) {
      return NextResponse.json(
        { error: 'TTL must be a positive number (seconds)' },
        { status: 400 }
      );
    }

    if (max_views !== undefined && (typeof max_views !== 'number' || max_views <= 0 || !Number.isInteger(max_views))) {
      return NextResponse.json(
        { error: 'max_views must be a positive integer' },
        { status: 400 }
      );
    }

    const id = nanoid(10);
    const currentTime = getCurrentTime(request);
    const expiresAt = ttl ? new Date(currentTime.getTime() + ttl * 1000) : null;

    const { error } = await supabase.from('pastes').insert({
      id,
      content,
      max_views: max_views || null,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create paste' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                     request.headers.get('x-forwarded-proto') && request.headers.get('x-forwarded-host')
                       ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('x-forwarded-host')}`
                       : `http://${request.headers.get('host')}`;

    return NextResponse.json({
      id,
      url: `${baseUrl}/p/${id}`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
