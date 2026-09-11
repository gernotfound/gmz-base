import { useMemo, useState } from 'react';
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Dice5,
  DoorOpen,
  Drama,
  Flame,
  Frown,
  Hand,
  Heart,
  Play,
  RotateCcw,
  Smartphone,
  Users,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import GameHomeButton from '../components/GameHomeButton';
import { categoriesData } from '../data/non-ho-mai';
import { shuffle } from '../lib/random';

type Category = 'Hot' | 'Love' | 'Situazioni' | 'Imbarazzo' | 'Social' | 'Confini';
type Phrase = { text: string; category: Category };
type DeckSize = 20 | 40 | 'all';

const categoryConfig = {
  Hot: { icon: Flame, color: 'text-red-400', label: 'Crush & Flirt' },
  Love: { icon: Heart, color: 'text-pink-400', label: 'Cotte & Cuore' },
  Situazioni: { icon: Drama, color: 'text-amber-400', label: 'Situazioni' },
  Imbarazzo: { icon: Frown, color: 'text-violet-400', label: 'Imbarazzo' },
  Social: { icon: Smartphone, color: 'text-sky-400', label: 'Social & Chat' },
  Confini: { icon: Hand, color: 'text-emerald-400', label: 'Confini' },
} satisfies Record<Category, { icon: typeof Flame; color: string; label: string }>;

const allCategories = Object.keys(categoryConfig) as Category[];
const presets: { label: string; categories: Category[] }[] = [
  { label: 'Chill', categories: ['Situazioni', 'Imbarazzo', 'Social'] },
  { label: 'Crush', categories: ['Hot', 'Love', 'Social'] },
  { label: 'Vero gruppo', categories: ['Situazioni', 'Imbarazzo', 'Confini'] },
];

function parsePlayers(value: string) {
  return value
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default function NonHoMai() {
  const [gameState, setGameState] = useState<'setup' | 'playing'>('setup');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['Situazioni', 'Imbarazzo', 'Social']);
  const [deckSize, setDeckSize] = useState<DeckSize>(40);
  const [playerInput, setPlayerInput] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectedPhraseCount = useMemo(
    () => selectedCategories.reduce((total, category) => total + categoriesData[category].length, 0),
    [selectedCategories],
  );

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

  const randomizeCategories = () => {
    const shuffled = shuffle(allCategories);
    setSelectedCategories(shuffled.slice(0, 3));
    setError(false);
  };

  const applyPreset = (categories: Category[]) => {
    setSelectedCategories(categories);
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
    const shuffledDeck = shuffle(deck);
    const limit = deckSize === 'all' ? shuffledDeck.length : Math.min(deckSize, shuffledDeck.length);

    setPlayers(parsePlayers(playerInput));
    setPhrases(shuffledDeck.slice(0, limit));
    setCurrentIndex(0);
    setGameState('playing');
  };

  const nextPhrase = () => setCurrentIndex(index => Math.min(index + 1, phrases.length - 1));
  const prevPhrase = () => setCurrentIndex(index => Math.max(index - 1, 0));

  const removeCurrentPhrase = () => {
    setPhrases(current => {
      if (current.length <= 1) return current;
      const next = current.filter((_, index) => index !== currentIndex);
      setCurrentIndex(index => Math.min(index, next.length - 1));
      return next;
    });
  };

  const exitGame = () => {
    setGameState('setup');
    setPhrases([]);
    setCurrentIndex(0);
  };

  const currentPhrase = phrases[currentIndex];
  const isLastPhrase = phrases.length > 0 && currentIndex === phrases.length - 1;
  const progress = phrases.length > 0 ? ((currentIndex + 1) / phrases.length) * 100 : 0;
  const currentPlayer = players.length > 0 ? players[currentIndex % players.length] : null;

  return (
    <div className="game-screen relative flex w-full flex-col items-center bg-slate-950 px-4 pb-safe pt-safe text-white sm:px-6">
      {gameState === 'setup' ? (
        <div className="z-20 mx-auto flex w-full max-w-xl flex-1 flex-col pb-8">
          <GameHomeButton tone="pink" />

          <header className="game-compact-header mb-6 mt-16 shrink-0 text-center sm:mt-20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-300">Party game · teen friendly</p>
            <h1 className="mt-2 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-4xl font-black tracking-[-0.04em] text-transparent sm:text-5xl">
              NON HO MAI
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">Cotte, figuracce e verità da gruppo: senza contenuti espliciti.</p>
          </header>

          <main className="flex flex-1 flex-col gap-5">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Preset rapidi</p>
                <button type="button" onClick={randomizeCategories} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-violet-300">
                  <Dice5 className="h-3.5 w-3.5" aria-hidden="true" /> Casuale
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.categories)}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex w-full items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-white">{selectedCategories.length}/{allCategories.length} categorie</p>
                  <p className="text-[10px] font-semibold text-slate-600">{selectedPhraseCount} frasi disponibili</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} disabled={selectedCategories.length === allCategories.length} className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-300 disabled:opacity-30">
                    <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Tutte
                  </button>
                  <button type="button" onClick={clearSelection} disabled={selectedCategories.length === 0} className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-400 disabled:opacity-30">
                    <X className="h-3.5 w-3.5" aria-hidden="true" /> Azzera
                  </button>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
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
                        'relative flex min-h-24 flex-col items-center justify-center rounded-2xl border p-3 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 sm:min-h-28',
                        isSelected ? 'border-pink-400/40 bg-pink-500/10' : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.06]',
                      )}
                    >
                      <Icon className={clsx('mb-2 h-6 w-6', isSelected ? 'text-white' : config.color)} aria-hidden="true" />
                      <span className={clsx('text-center text-xs font-black leading-tight sm:text-sm', isSelected ? 'text-white' : 'text-slate-300')}>{config.label}</span>
                      <span className="mt-1 text-[9px] font-semibold text-slate-600">{categoriesData[category].length} frasi</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Durata mazzo</label>
                <div className="grid grid-cols-3 gap-2">
                  {([20, 40, 'all'] as DeckSize[]).map(size => (
                    <button
                      key={String(size)}
                      type="button"
                      onClick={() => setDeckSize(size)}
                      aria-pressed={deckSize === size}
                      className={clsx('rounded-xl border px-3 py-2.5 text-xs font-black', deckSize === size ? 'border-pink-400/35 bg-pink-500/12 text-white' : 'border-white/[0.07] bg-white/[0.03] text-slate-500')}
                    >
                      {size === 'all' ? 'Tutte' : size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="players" className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Turni giocatori · opzionale</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" aria-hidden="true" />
                  <input
                    id="players"
                    value={playerInput}
                    onChange={event => setPlayerInput(event.target.value)}
                    placeholder="Luca, Sara, Marco…"
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-9 pr-3 text-sm font-semibold text-white outline-none placeholder:text-slate-700 focus:border-pink-400/40"
                  />
                </div>
              </div>
            </section>

            {error && <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-300" role="alert">Seleziona almeno una categoria.</div>}

            <button type="button" onClick={startGame} className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-violet-500/15 transition hover:brightness-110 active:scale-[0.99]">
              <Play className="h-5 w-5 fill-current" aria-hidden="true" /> Crea il mazzo
            </button>
          </main>
        </div>
      ) : (
        <div className="game-overlay-screen z-50 flex w-full flex-col bg-slate-950 animate-fadeIn">
          <div className="quiz-progress absolute left-0 right-0 top-0 z-30 rounded-none" aria-hidden="true"><span className="bg-gradient-to-r from-pink-500 to-violet-500" style={{ width: `${progress}%` }} /></div>

          <button type="button" onClick={nextPhrase} disabled={isLastPhrase} className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6 pb-20 pt-24 text-white outline-none disabled:cursor-default sm:p-10 sm:pb-24 sm:pt-28" aria-label={isLastPhrase ? 'Ultima frase del mazzo' : 'Mostra la frase successiva'}>
            <div className="absolute left-1/2 top-7 flex -translate-x-1/2 flex-col items-center gap-2 whitespace-nowrap sm:top-10">
              {currentPlayer && <span className="rounded-full bg-pink-500/15 px-3 py-1.5 text-[11px] font-black text-pink-200">Tocca a {currentPlayer}</span>}
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/[0.07] bg-white/[0.045] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{currentPhrase ? categoryConfig[currentPhrase.category].label : ''}</span>
                <span className="text-[10px] font-bold text-slate-600">{currentIndex + 1}/{phrases.length}</span>
              </div>
            </div>

            <h2 key={`${currentIndex}-${currentPhrase?.text}`} aria-live="polite" className="max-w-4xl px-2 text-center text-3xl font-black leading-tight tracking-[-0.025em] animate-fadeIn sm:text-5xl">{currentPhrase?.text}</h2>
            <p className="absolute bottom-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 sm:bottom-8">{isLastPhrase ? 'Fine del mazzo' : 'Tocca per andare avanti'}</p>
          </button>

          <nav className="grid min-h-20 w-full shrink-0 grid-cols-4 items-center border-t border-white/[0.06] bg-slate-900/95 px-2 pb-safe shadow-[0_-10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-6" aria-label="Controlli partita">
            <button type="button" onClick={prevPhrase} disabled={currentIndex === 0} className="flex flex-col items-center justify-center p-2 text-slate-400 disabled:opacity-25"><ChevronLeft className="mb-1 h-6 w-6" aria-hidden="true" /><span className="text-[9px] font-black uppercase">Indietro</span></button>
            <button type="button" onClick={removeCurrentPhrase} disabled={phrases.length <= 1} className="flex flex-col items-center justify-center p-2 text-amber-400 disabled:opacity-25"><X className="mb-1 h-5 w-5" aria-hidden="true" /><span className="text-[9px] font-black uppercase">Scarta</span></button>
            <button type="button" onClick={exitGame} className="flex flex-col items-center justify-center p-2 text-red-400"><DoorOpen className="mb-1 h-6 w-6" aria-hidden="true" /><span className="text-[9px] font-black uppercase">Esci</span></button>
            <button type="button" onClick={isLastPhrase ? startGame : nextPhrase} className="flex flex-col items-center justify-center p-2 text-emerald-400">{isLastPhrase ? <RotateCcw className="mb-1 h-6 w-6" aria-hidden="true" /> : <ChevronRight className="mb-1 h-6 w-6" aria-hidden="true" />}<span className="text-[9px] font-black uppercase">{isLastPhrase ? 'Rimescola' : 'Avanti'}</span></button>
          </nav>
        </div>
      )}
    </div>
  );
}
