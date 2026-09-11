import clsx from 'clsx';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

type GameTone = 'blue' | 'pink' | 'amber' | 'orange';

const focusRings: Record<GameTone, string> = {
  blue: 'focus-visible:ring-blue-400',
  pink: 'focus-visible:ring-pink-400',
  amber: 'focus-visible:ring-amber-400',
  orange: 'focus-visible:ring-orange-400',
};

interface GameHomeButtonProps {
  tone: GameTone;
  className?: string;
}

export default function GameHomeButton({ tone, className }: GameHomeButtonProps) {
  return (
    <Link
      to="/"
      aria-label="Torna al catalogo"
      className={clsx(
        'game-home-button z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-slate-900/88 text-slate-300 shadow-lg backdrop-blur transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2',
        focusRings[tone],
        className,
      )}
    >
      <Home className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}
