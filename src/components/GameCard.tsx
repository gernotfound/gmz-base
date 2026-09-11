import { ArrowUpRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GameDefinition, GameTone } from '../games/catalog';

const toneStyles: Record<GameTone, { icon: string; border: string; glow: string; badge: string }> = {
  blue: {
    icon: 'from-cyan-400 to-blue-600',
    border: 'group-hover:border-blue-400/50',
    glow: 'bg-blue-500/15',
    badge: 'border-blue-400/20 bg-blue-500/10 text-blue-200',
  },
  pink: {
    icon: 'from-pink-400 to-violet-600',
    border: 'group-hover:border-pink-400/50',
    glow: 'bg-pink-500/15',
    badge: 'border-pink-400/20 bg-pink-500/10 text-pink-200',
  },
  amber: {
    icon: 'from-amber-400 to-orange-600',
    border: 'group-hover:border-amber-400/50',
    glow: 'bg-amber-500/15',
    badge: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
  },
  orange: {
    icon: 'from-orange-400 to-red-600',
    border: 'group-hover:border-orange-400/50',
    glow: 'bg-orange-500/15',
    badge: 'border-orange-400/20 bg-orange-500/10 text-orange-100',
  },
};

interface GameCardProps {
  game: GameDefinition;
}

export default function GameCard({ game }: GameCardProps) {
  const tone = toneStyles[game.tone];

  return (
    <Link
      to={game.path}
      aria-label={`Apri ${game.title}`}
      className={`group relative isolate flex min-h-[300px] flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-slate-900/70 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${tone.border}`}
    >
      <div aria-hidden="true" className={`absolute -right-16 -top-16 -z-10 h-40 w-40 rounded-full blur-3xl transition duration-500 group-hover:scale-125 ${tone.glow}`} />

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg ring-1 ring-white/15 ${tone.icon}`} aria-hidden="true">
          {game.icon}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {game.featured && (
            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-200">
              In evidenza
            </span>
          )}
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${tone.badge}`}>
            {game.category}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">{game.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{game.description}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Tag">
        {game.tags.slice(0, 3).map(tag => (
          <span key={tag} className="rounded-full bg-white/[0.045] px-2.5 py-1 text-[11px] font-semibold text-slate-400 ring-1 ring-inset ring-white/[0.06]">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs font-bold text-slate-400">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {game.players}
        </span>
        <span className="flex items-center gap-1.5 text-slate-200 transition group-hover:text-white">
          {game.mode}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
