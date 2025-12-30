'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, FileText } from 'lucide-react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasteUrl('');
    setLoading(true);

    try {
      const body: any = { content };

      if (ttl && !isNaN(Number(ttl))) {
        body.ttl = Number(ttl);
      }

      if (maxViews && !isNaN(Number(maxViews))) {
        body.max_views = Number(maxViews);
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        return;
      }

      setPasteUrl(data.url);
      setContent('');
      setTtl('');
      setMaxViews('');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pasteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-xl mb-4">
            <FileText className="w-8 h-8 text-white dark:text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Pastebin Lite
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Share text snippets with optional expiry and view limits
          </p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Create a New Paste</CardTitle>
            <CardDescription>
              Enter your content and optional settings below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ttl">Time to Live (seconds)</Label>
                  <Input
                    id="ttl"
                    type="number"
                    placeholder="e.g., 3600"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                    min="1"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Optional: Paste will expire after this time
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxViews">Maximum Views</Label>
                  <Input
                    id="maxViews"
                    type="number"
                    placeholder="e.g., 10"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    min="1"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Optional: Paste will expire after this many views
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {pasteUrl && (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
                  <AlertDescription className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                        Paste created successfully!
                      </p>
                      <a
                        href={pasteUrl}
                        className="text-sm text-green-700 dark:text-green-300 hover:underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {pasteUrl}
                      </a>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !content.trim()}
              >
                {loading ? 'Creating...' : 'Create Paste'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            API endpoints: <code className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">GET /api/healthz</code>
            {' • '}
            <code className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">POST /api/pastes</code>
            {' • '}
            <code className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">GET /api/pastes/:id</code>
          </p>
        </div>
      </div>
    </div>
  );
}
