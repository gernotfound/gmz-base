import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 pb-safe pt-safe text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/[0.08] bg-slate-900/75 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
          <Gamepad2 className="h-7 w-7 text-violet-300" aria-hidden="true" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">404</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Gioco non trovato</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Questo indirizzo non corrisponde a un gioco presente nel catalogo.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Torna al catalogo
        </Link>
      </div>
    </main>
  );
}
