import { useState } from 'react';
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Drama,
  Flame,
  Frown,
  Hand,
  Heart,
  Play,
  RotateCcw,
  Smartphone,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import GameHomeButton from '../components/GameHomeButton';
import { categoriesData } from '../data/non-ho-mai';
import { shuffle } from '../lib/random';

type Category = 'Hot' | 'Love' | 'Situazioni' | 'Imbarazzo' | 'Social' | 'Confini';
type Phrase = { text: string; category: Category };

const categoryConfig = {
  Hot: { icon: Flame, color: 'text-red-500', label: 'Hot' },
  Love: { icon: Heart, color: 'text-pink-500', label: 'Love' },
  Situazioni: { icon: Drama, color: 'text-amber-500', label: 'Situazioni' },
  Imbarazzo: { icon: Frown, color: 'text-violet-500', label: 'Imbarazzo' },
  Social: { icon: Smartphone, color: 'text-sky-500', label: 'Social & Guai' },
  Confini: { icon: Hand, color: 'text-emerald-500', label: 'Confini' },
} satisfies Record<Category, { icon: typeof Flame; color: string; label: string }>;

const allCategories = Object.keys(categoryConfig) as Category[];

export default function NonHoMai() {
  const [gameState, setGameState] = useState<'setup' | 'playing'>('setup');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleCategory = (category: Category) => {
    setSelectedCategories(current =>
      current.includes(category) ? current.filter(item => item !== category) : [...current, category],
    );
    setError(false);
  };

  const selectAll = () => {
    setSelectedCategories(allCategories);
    setError(false);
  };

  const clearSelection = () => {
    setSelectedCategories([]);
    setError(false);
  };

  const startGame = () => {
    if (selectedCategories.length === 0) {
      setError(true);
      return;
    }

    const deck = selectedCategories.flatMap(category =>
      categoriesData[category].map(text => ({ text, category })),
    );

    setPhrases(shuffle(deck));
    setCurrentIndex(0);
    setGameState('playing');
  };

  const nextPhrase = () => {
    setCurrentIndex(index => Math.min(index + 1, phrases.length - 1));
  };

  const prevPhrase = () => {
    setCurrentIndex(index => Math.max(index - 1, 0));
  };

  const exitGame = () => {
    setGameState('setup');
    setPhrases([]);
    setCurrentIndex(0);
  };

  const currentPhrase = phrases[currentIndex];
  const isLastPhrase = phrases.length > 0 && currentIndex === phrases.length - 1;
  const selectedPhraseCount = selectedCategories.reduce((total, category) => total + categoriesData[category].length, 0);
  const progress = phrases.length > 0 ? ((currentIndex + 1) / phrases.length) * 100 : 0;

  return (
    <div className="game-screen relative flex w-full flex-col items-center bg-slate-950 px-4 pb-safe pt-safe text-white sm:px-6">
      {gameState === 'setup' ? (
        <div className="z-20 mx-auto flex w-full max-w-xl flex-1 flex-col pb-8">
          <GameHomeButton tone="pink" />

          <header className="game-compact-header mb-7 mt-16 shrink-0 text-center sm:mt-20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-300">Party game</p>
            <h1 className="mt-2 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-4xl font-black tracking-[-0.04em] text-transparent sm:text-5xl">
              NON HO MAI
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">Scegli le categorie e crea un mazzo senza ripetizioni.</p>
          </header>

          <main className="flex flex-1 flex-col items-center">
            <div className="mb-3 flex w-full items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-white">{selectedCategories.length}/{allCategories.length} categorie</p>
                <p className="text-[10px] font-semibold text-slate-600">{selectedPhraseCount} frasi nel mazzo</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={selectedCategories.length === allCategories.length}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-30"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Tutte
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={selectedCategories.length === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-400 transition hover:bg-white/[0.06] disabled:opacity-30"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Azzera
                </button>
              </div>
            </div>

            <div className="mb-6 grid w-full grid-cols-2 gap-3 sm:mb-7 sm:grid-cols-3">
              {allCategories.map(category => {
                const config = categoryConfig[category];
                const Icon = config.icon;
                const isSelected = selectedCategories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    aria-pressed={isSelected}
                    className={clsx(
                      'relative flex min-h-28 flex-col items-center justify-center rounded-2xl border p-3 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 sm:min-h-32 sm:p-4',
                      isSelected
                        ? 'border-pink-400/40 bg-pink-500/10 shadow-[0_15px_40px_rgba(236,72,153,0.10)]'
                        : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.06]',
                    )}
                  >
                    <Icon className={clsx('mb-2.5 h-7 w-7 transition-transform sm:mb-3', isSelected ? 'scale-110 text-white' : config.color)} aria-hidden="true" />
                    <span className={clsx('text-center text-sm font-black leading-tight', isSelected ? 'text-white' : 'text-slate-300')}>
                      {config.label}
                    </span>
                    <span className="mt-1 text-[10px] font-semibold text-slate-600">{categoriesData[category].length} frasi</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mb-4 w-full rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-300" role="alert">
                Seleziona almeno una categoria.
              </div>
            )}

            <button
              type="button"
              onClick={startGame}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-violet-500/15 transition hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
            >
              <Play className="h-5 w-5 fill-current" aria-hidden="true" />
              Crea il mazzo
            </button>
          </main>
        </div>
      ) : (
        <div className="game-overlay-screen z-50 flex w-full flex-col bg-slate-950 animate-fadeIn">
          <div className="quiz-progress absolute left-0 right-0 top-0 z-30 rounded-none" aria-hidden="true">
            <span className="bg-gradient-to-r from-pink-500 to-violet-500" style={{ width: `${progress}%` }} />
          </div>

          <button
            type="button"
            onClick={nextPhrase}
            disabled={isLastPhrase}
            className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6 pb-16 pt-20 text-white outline-none disabled:cursor-default sm:p-10 sm:pb-20 sm:pt-24"
            aria-label={isLastPhrase ? 'Ultima frase del mazzo' : 'Mostra la frase successiva'}
          >
            <div className="absolute left-1/2 top-8 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap sm:top-10">
              <span className="rounded-full border border-white/[0.07] bg-white/[0.045] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                {currentPhrase?.category}
              </span>
              <span className="text-[10px] font-bold text-slate-600">
                {currentIndex + 1}/{phrases.length}
              </span>
            </div>

            <h2 key={currentIndex} aria-live="polite" className="max-w-4xl px-2 text-center text-3xl font-black leading-tight tracking-[-0.025em] animate-fadeIn sm:text-5xl">
              {currentPhrase?.text}
            </h2>

            <p className="absolute bottom-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 sm:bottom-8">
              {isLastPhrase ? 'Fine del mazzo' : 'Tocca per andare avanti'}
            </p>
          </button>

          <nav className="flex min-h-20 w-full shrink-0 items-center justify-between border-t border-white/[0.06] bg-slate-900/95 px-4 pb-safe shadow-[0_-10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-6" aria-label="Controlli partita">
            <button
              type="button"
              onClick={prevPhrase}
              disabled={currentIndex === 0}
              className="flex w-20 flex-col items-center justify-center p-2 text-slate-400 transition hover:text-white disabled:opacity-25"
            >
              <ChevronLeft className="mb-1 h-6 w-6" aria-hidden="true" />
              <span className="text-[9px] font-black uppercase tracking-wider">Indietro</span>
            </button>

            <button type="button" onClick={exitGame} className="flex w-20 flex-col items-center justify-center p-2 text-red-400 transition hover:text-red-300">
              <DoorOpen className="mb-1 h-6 w-6" aria-hidden="true" />
              <span className="text-[9px] font-black uppercase tracking-wider">Esci</span>
            </button>

            <button
              type="button"
              onClick={isLastPhrase ? startGame : nextPhrase}
              className="flex w-20 flex-col items-center justify-center p-2 text-emerald-400 transition hover:text-emerald-300"
            >
              {isLastPhrase ? <RotateCcw className="mb-1 h-6 w-6" aria-hidden="true" /> : <ChevronRight className="mb-1 h-6 w-6" aria-hidden="true" />}
              <span className="text-[9px] font-black uppercase tracking-wider">{isLastPhrase ? 'Rimescola' : 'Avanti'}</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
