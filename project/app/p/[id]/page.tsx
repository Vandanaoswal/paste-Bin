import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import type { Paste } from '@/lib/supabase';

function getCurrentTime(): Date {
  const testMode = process.env.TEST_MODE === '1';

  if (testMode) {
    const headersList = headers();
    const testNowMs = headersList.get('x-test-now-ms');
    if (testNowMs) {
      return new Date(parseInt(testNowMs, 10));
    }
  }

  return new Date();
}

async function getPaste(id: string): Promise<Paste | null> {
  const currentTime = getCurrentTime();

  const { data: paste, error: fetchError } = await supabase
    .from('pastes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !paste) {
    return null;
  }

  const typedPaste = paste as Paste;

  if (typedPaste.expires_at && new Date(typedPaste.expires_at) <= currentTime) {
    return null;
  }

  if (typedPaste.max_views !== null && typedPaste.view_count >= typedPaste.max_views) {
    return null;
  }

  const { data: updatedPaste, error: updateError } = await supabase
    .from('pastes')
    .update({ view_count: typedPaste.view_count + 1 })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return null;
  }

  return updatedPaste as Paste;
}

export default async function PastePage({
  params,
}: {
  params: { id: string };
}) {
  const paste = await getPaste(params.id);

  if (!paste) {
    notFound();
  }

  const remainingViews =
    paste.max_views !== null
      ? Math.max(0, paste.max_views - paste.view_count)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="bg-slate-100 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Paste View
            </h1>
            <div className="mt-2 flex gap-4 text-sm text-slate-600 dark:text-slate-400">
              {remainingViews !== null && (
                <span>
                  Remaining views: <strong>{remainingViews}</strong>
                </span>
              )}
              {paste.expires_at && (
                <span>
                  Expires: <strong>{new Date(paste.expires_at).toLocaleString()}</strong>
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              {paste.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
