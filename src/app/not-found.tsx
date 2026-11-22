import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0d16] text-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_20%,rgba(244,114,182,0.14),rgba(56,189,248,0.06),transparent)]" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-400/30 flex items-center justify-center mb-4 text-pink-300 font-bold font-mono text-lg shadow-lg shadow-pink-500/10">
          404
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-200 via-rose-100 to-sky-200 bg-clip-text text-transparent mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          The requested resource or agent command endpoint was not found.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 hover:brightness-110 text-[#0a0d16] text-xs font-bold transition-all shadow-md shadow-pink-500/20"
        >
          Return to KOMMANDRA
        </Link>
      </div>
    </div>
  );
}
