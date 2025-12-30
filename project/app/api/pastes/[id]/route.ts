import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Paste } from '@/lib/supabase';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const currentTime = getCurrentTime(request);

    const { data: paste, error: fetchError } = await supabase
      .from('pastes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Database error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch paste' },
        { status: 500 }
      );
    }

    if (!paste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    const typedPaste = paste as Paste;

    if (typedPaste.expires_at && new Date(typedPaste.expires_at) <= currentTime) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    if (typedPaste.max_views !== null && typedPaste.view_count >= typedPaste.max_views) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    const { data: updatedPaste, error: updateError } = await supabase
      .from('pastes')
      .update({ view_count: typedPaste.view_count + 1 })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update paste' },
        { status: 500 }
      );
    }

    const response: {
      content: string;
      remaining_views: number | null;
      expires_at: string | null;
    } = {
      content: updatedPaste.content,
      remaining_views:
        updatedPaste.max_views !== null
          ? Math.max(0, updatedPaste.max_views - updatedPaste.view_count)
          : null,
      expires_at: updatedPaste.expires_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
