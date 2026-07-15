import { Link } from 'react-router-dom';
import { Gamepad2, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-safe pb-safe px-6 w-full max-w-6xl mx-auto min-h-screen">
      <header className="text-center mt-6 w-full max-w-2xl shrink-0">
        <div className="inline-block p-4 rounded-3xl bg-slate-800/60 mb-5 shadow-inner border border-slate-700/50 neon-glow">
          <Gamepad2 className="w-12 h-12 text-purple-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 drop-shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
          GMZ BASE
        </h1>
        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-6">
          La tua sala giochi tascabile
        </p>
      </header>

      <main className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-4 flex-grow justify-center items-center">
        
        {/* Forza 4 */}
        <Link to="/forza4" className="group outline-none w-full block">
          <div className="bg-slate-800/60 backdrop-blur-md p-8 rounded-[2rem] border border-slate-700/50 shadow-xl transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.25)] group-hover:border-blue-500/50 flex flex-col h-full transform group-hover:-translate-y-2">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg border border-white/10 shrink-0">
                🔴
              </div>
              <div>
                <h2 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">Forza 4</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full mt-1 inline-block">Multiplayer P2P</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
              Sfida i tuoi amici a distanza in tempo reale. Condividi il codice o inquadra il QR Code per unirti istantaneamente alla partita. Senza registrazioni!
            </p>
            <div className="w-full py-4 rounded-2xl bg-slate-700/80 text-center font-extrabold text-sm text-white group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-600 transition-all duration-300 shadow-md uppercase tracking-wider flex items-center justify-center gap-2">
              GIOCA ORA <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Non Ho Mai */}
        <Link to="/non-ho-mai" className="group outline-none w-full block">
          <div className="bg-slate-800/60 backdrop-blur-md p-8 rounded-[2rem] border border-slate-700/50 shadow-xl transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(236,72,153,0.25)] group-hover:border-pink-500/50 flex flex-col h-full transform group-hover:-translate-y-2">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-3xl shadow-lg border border-white/10 shrink-0">
                🍻
              </div>
              <div>
                <h2 className="text-2xl font-black text-white group-hover:text-pink-400 transition-colors">Non Ho Mai</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-400 bg-pink-900/30 px-3 py-1 rounded-full mt-1 inline-block">Party Game Locale</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
              Il party game ideale per animare le serate tra amici. Centinaia di domande suddivise per categorie: Hot, Love, Social, Imbarazzo e molto altro.
            </p>
            <div className="w-full py-4 rounded-2xl bg-slate-700/80 text-center font-extrabold text-sm text-white group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-violet-600 transition-all duration-300 shadow-md uppercase tracking-wider flex items-center justify-center gap-2">
              GIOCA ORA <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Duce o Non Duce */}
        <Link to="/dnd" className="group outline-none w-full block">
          <div className="bg-slate-800/60 backdrop-blur-md p-8 rounded-[2rem] border border-slate-700/50 shadow-xl transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.25)] group-hover:border-amber-500/50 flex flex-col h-full transform group-hover:-translate-y-2">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg border border-white/10 shrink-0">
                🧐
              </div>
              <div>
                <h2 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">Duce o Non Duce</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full mt-1 inline-block">Quiz Storico</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
              Metti alla prova la tua cultura. Distingui le reali citazioni storiche e i fatti veri da celebri miti propagandistici smentiti e discorsi esteri.
            </p>
            <div className="w-full py-4 rounded-2xl bg-slate-700/80 text-center font-extrabold text-sm text-white group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-amber-500 transition-all duration-300 shadow-md uppercase tracking-wider flex items-center justify-center gap-2">
              GIOCA ORA <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
