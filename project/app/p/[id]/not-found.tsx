export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          404
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
          Paste not found or has expired
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
