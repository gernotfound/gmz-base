import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Play, Flame, Heart, Drama, Frown, Smartphone, Hand, ChevronLeft, ChevronRight, DoorOpen } from 'lucide-react';
import { categoriesData } from '../data/non-ho-mai';
import clsx from 'clsx';

type Category = 'Hot' | 'Love' | 'Situazioni' | 'Imbarazzo' | 'Social' | 'Confini';

const categoryConfig = {
  Hot: { icon: Flame, color: 'text-red-500', label: 'Hot' },
  Love: { icon: Heart, color: 'text-pink-500', label: 'Love' },
  Situazioni: { icon: Drama, color: 'text-amber-500', label: 'Situazioni' },
  Imbarazzo: { icon: Frown, color: 'text-violet-500', label: 'Imbarazzo' },
  Social: { icon: Smartphone, color: 'text-sky-500', label: 'Social & Guai' },
  Confini: { icon: Hand, color: 'text-emerald-500', label: 'Confini' },
};

export default function NonHoMai() {
  const [gameState, setGameState] = useState<'setup' | 'playing'>('setup');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);
  
  const [phrases, setPhrases] = useState<{text: string, category: Category}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setError(false);
  };

  const startGame = () => {
    if (selectedCategories.length === 0) {
      setError(true);
      return;
    }
    
    const allPhrases = selectedCategories.flatMap(cat => 
      categoriesData[cat].map(text => ({ text, category: cat }))
    );
    
    // Shuffle
    const shuffled = [...allPhrases].sort(() => 0.5 - Math.random());
    setPhrases(shuffled);
    setCurrentIndex(0);
    setGameState('playing');
  };

  const nextPhrase = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const prevPhrase = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  const exitGame = () => {
    setGameState('setup');
    setPhrases([]);
    setCurrentIndex(0);
  };

  return (
    <div className="flex flex-col items-center pt-safe pb-safe px-6 min-h-screen w-full relative bg-slate-900 text-white">
      {gameState === 'setup' ? (
        <div className="flex flex-col h-full w-full max-w-lg mx-auto pb-8 z-20">
          <Link to="/" className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all active:scale-90 shadow-lg z-30">
            <HomeIcon className="w-5 h-5" />
          </Link>

          <header className="text-center mt-20 mb-8 shrink-0">
            <h1 className="text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
              NON HO MAI
            </h1>
            <p className="text-slate-400 text-sm font-semibold">Seleziona le categorie per iniziare</p>
          </header>

          <main className="flex-grow flex flex-col items-center w-full">
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              {(Object.keys(categoryConfig) as Category[]).map(cat => {
                const config = categoryConfig[cat];
                const Icon = config.icon;
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={clsx(
                      "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all active:scale-95",
                      isSelected ? "bg-slate-800 border-pink-500/50 shadow-lg shadow-pink-500/10" : "bg-slate-800/50 border-transparent hover:bg-slate-800"
                    )}
                  >
                    <Icon className={clsx("w-8 h-8 mb-3 transition-transform", isSelected ? "scale-110 text-white" : config.color)} />
                    <span className={clsx("font-bold text-lg text-center leading-tight", isSelected ? "text-white" : "text-slate-300")}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="text-red-400 font-bold mb-4 text-center px-4 py-2 bg-red-900/30 rounded-xl border border-red-500/20 w-full animate-pulse">
                Seleziona almeno una categoria!
              </div>
            )}

            <button onClick={startGame} className="w-full py-4 rounded-2xl font-black text-xl bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 transform active:scale-95 transition-transform mt-auto uppercase tracking-wide flex justify-center items-center gap-2">
              GIOCA ORA <Play className="w-5 h-5 fill-white" />
            </button>
          </main>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col h-full w-full bg-slate-900 z-10 animate-fadeIn">
          <div onClick={nextPhrase} className="flex-grow flex flex-col items-center justify-center p-8 cursor-pointer relative overflow-y-auto w-full">
            <span className="absolute top-12 md:top-8 text-sm font-bold uppercase tracking-widest text-slate-400 bg-slate-800 px-4 py-1.5 rounded-full z-10 shadow-md">
              {phrases[currentIndex]?.category}
            </span>
            
            <h2 className="text-3xl md:text-5xl font-extrabold text-center leading-tight max-w-3xl px-4 animate-fadeIn" key={currentIndex}>
              {phrases[currentIndex]?.text}
            </h2>
            
            <p className="absolute bottom-8 text-slate-500 text-xs font-semibold flex items-center gap-2 pointer-events-none">
              TOCCO PER AVANTI
            </p>
          </div>

          <div className="h-20 bg-slate-800 flex items-center justify-between px-6 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 pb-safe border-t border-slate-700/30 w-full">
            <button onClick={prevPhrase} disabled={currentIndex === 0} className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-white active:scale-90 transition-all w-16 disabled:opacity-30">
              <ChevronLeft className="w-6 h-6 mb-1" />
              <span className="text-[9px] uppercase font-bold tracking-wider">Indietro</span>
            </button>

            <button onClick={exitGame} className="flex flex-col items-center justify-center p-2 text-red-400 hover:text-red-300 active:scale-90 transition-all w-16">
              <DoorOpen className="w-6 h-6 mb-1" />
              <span className="text-[9px] uppercase font-bold tracking-wider">Esci</span>
            </button>

            <button onClick={nextPhrase} disabled={currentIndex === phrases.length - 1} className="flex flex-col items-center justify-center p-2 text-emerald-400 hover:text-emerald-300 active:scale-90 transition-all w-16 disabled:opacity-30">
              <ChevronRight className="w-6 h-6 mb-1" />
              <span className="text-[9px] uppercase font-bold tracking-wider">Avanti</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
