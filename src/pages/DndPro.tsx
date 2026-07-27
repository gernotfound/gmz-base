import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ChevronRight, Flag, Trophy, RotateCcw } from 'lucide-react';

// Get all images from the public/img_dndpro directory
const imageFiles = import.meta.glob('/public/img_dndpro/*.{jpg,jpeg,png,webp,gif}', { eager: true });

const databaseImmagini = Object.keys(imageFiles).map(key => {
  const filename = key.split('/').pop() || '';
  const isDuce = !filename.toLowerCase().startsWith('nd') && filename.toLowerCase().startsWith('d');
  const module = imageFiles[key] as any;
  const resolvedPath = module.default || module;
  return {
    path: typeof resolvedPath === 'string' ? resolvedPath : key.replace('/public', ''),
    filename,
    isDuce
  };
});

export default function DndPro() {
  const [gameState, setGameState] = useState<'playing' | 'end'>('playing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [questions, setQuestions] = useState<typeof databaseImmagini>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    if (databaseImmagini.length === 0) return;
    
    const ducePhotos = databaseImmagini.filter(img => img.isDuce);
    const nonDucePhotos = databaseImmagini.filter(img => !img.isDuce);
    
    // Get up to 7 Duce and up to 13 Non-Duce
    const duceCount = Math.min(7, ducePhotos.length);
    const nonDuceCount = Math.min(13, nonDucePhotos.length);
    
    const shuffledDuce = [...ducePhotos].sort(() => 0.5 - Math.random()).slice(0, duceCount);
    const shuffledNonDuce = [...nonDucePhotos].sort(() => 0.5 - Math.random()).slice(0, nonDuceCount);
    
    const combined: typeof databaseImmagini = [];
    let duceLeft = [...shuffledDuce];
    let nonDuceLeft = [...shuffledNonDuce];
    let consecutiveDuce = 0;

    while (duceLeft.length > 0 || nonDuceLeft.length > 0) {
      if (duceLeft.length === 0) {
        combined.push(nonDuceLeft.pop()!);
        consecutiveDuce = 0;
      } else if (nonDuceLeft.length === 0) {
        combined.push(duceLeft.pop()!);
        consecutiveDuce++;
      } else if (consecutiveDuce >= 2) {
        combined.push(nonDuceLeft.pop()!);
        consecutiveDuce = 0;
      } else {
        const pickDuce = Math.random() < (duceLeft.length / (duceLeft.length + nonDuceLeft.length));
        if (pickDuce) {
          combined.push(duceLeft.pop()!);
          consecutiveDuce++;
        } else {
          combined.push(nonDuceLeft.pop()!);
          consecutiveDuce = 0;
        }
      }
    }

    setQuestions(combined);
    setTotalQuestions(combined.length);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('playing');
    setAnswered(false);
  };

  const handleAnswer = (isDuceGuess: boolean) => {
    if (answered) return;
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.isDuce === isDuceGuess) {
      setScore(s => s + 1);
    }
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      setGameState('end');
    } else {
      setCurrentQuestionIndex(i => i + 1);
      setAnswered(false);
    }
  };

  const endGame = () => setGameState('end');

  if (databaseImmagini.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full relative animate-fadeIn">
        <Link to="/" className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all active:scale-90 shadow-lg z-30">
          <HomeIcon className="w-5 h-5" />
        </Link>
        <div className="text-white text-xl p-8 text-center bg-slate-800/60 rounded-3xl border border-slate-700/50 max-w-md shadow-2xl">
          <p className="mb-4 font-bold text-amber-500">Nessuna foto trovata!</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Per giocare, aggiungi delle foto nella cartella<br/>
            <code className="bg-slate-900 px-2 py-1 rounded text-sky-400 font-mono text-xs mx-1">public/img_dndpro</code>
          </p>
          <div className="mt-6 text-xs text-slate-400 bg-slate-900/50 p-4 rounded-xl text-left border border-slate-700/50">
            <p className="mb-2"><strong>Regole nomi file:</strong></p>
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <code>d001.jpg</code> (inizia con <strong>d</strong>) = Duce</p>
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> <code>nd001.jpg</code> (inizia con <strong>nd</strong>) = Non Duce</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center pt-safe pb-safe px-6 min-h-screen w-full relative animate-fadeIn">
      <Link to="/" className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all active:scale-90 shadow-lg z-30">
        <HomeIcon className="w-5 h-5" />
      </Link>

      {gameState === 'playing' ? (
        <main className="w-full max-w-md flex flex-col items-center mt-12">
          <header className="mb-6 w-full text-center relative">
            <h1 className="text-4xl font-black tracking-widest text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] uppercase relative inline-block">
              DUCE
            </h1>
            <div className="flex items-center justify-center text-slate-500 my-2">
              <div className="h-px bg-slate-700/50 w-20"></div>
              <span className="mx-4 text-base font-black tracking-widest text-amber-500 uppercase">o</span>
              <div className="h-px bg-slate-700/50 w-20"></div>
            </div>
            <h1 className="flex items-center justify-center gap-3 text-4xl font-black tracking-widest text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] uppercase relative">
              <span className="flex items-center"><span className="flipped-n">N</span>O<span className="flipped-n">N</span></span>
              <span className="flex items-center relative">
                D<span className="flipped-u">U</span>CE
                <span className="absolute -top-5 -right-12 -rotate-12 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black px-2 py-0.5 rounded shadow-[0_4px_12px_rgba(245,158,11,0.5)] text-sm tracking-normal">Pro!</span>
              </span>
            </h1>
          </header>

          <div className="w-full flex justify-between text-slate-400 font-bold mb-3 px-2 text-sm uppercase tracking-wider">
            <span>Foto: <span className="text-sky-500 font-black text-base">{currentQuestionIndex + 1}</span>/{totalQuestions}</span>
            <span>Punti: <span className="text-emerald-500 font-black text-base">{score}</span></span>
          </div>

          <div className="w-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-[2rem] p-4 shadow-2xl flex flex-col items-center justify-center relative min-h-[300px]">
            <img 
              src={currentQuestion.path} 
              alt="Duce o Non Duce" 
              className="max-w-full max-h-[45vh] object-contain rounded-xl shadow-lg"
            />
          </div>

          <div className="w-full flex gap-4 mt-6">
            <button 
              onClick={() => handleAnswer(true)} 
              disabled={answered}
              className={`flex-1 bg-slate-800 border ${answered && currentQuestion.isDuce ? 'border-emerald-500 bg-emerald-500/20' : answered && !currentQuestion.isDuce ? 'border-red-500/50 opacity-50' : 'border-slate-700/60 hover:bg-slate-700/80'} text-white font-extrabold text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-md tracking-wider`}
            >
              DUCE
            </button>
            <button 
              onClick={() => handleAnswer(false)} 
              disabled={answered}
              className={`flex-1 bg-slate-800 border ${answered && !currentQuestion.isDuce ? 'border-emerald-500 bg-emerald-500/20' : answered && currentQuestion.isDuce ? 'border-red-500/50 opacity-50' : 'border-slate-700/60 hover:bg-slate-700/80'} text-white font-extrabold text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-md tracking-wider`}
            >
              NON DUCE
            </button>
          </div>

          <div className="w-full flex flex-col gap-3 mt-4 h-24">
            {answered ? (
              <button onClick={nextQuestion} className="w-full bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-300 hover:to-indigo-500 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-lg uppercase tracking-wide flex justify-center items-center gap-2">
                PROSSIMA FOTO <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={endGame} className="w-full py-3.5 rounded-2xl font-bold text-xs bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-red-400 shadow-md active:scale-95 transition-colors flex justify-center items-center gap-2 uppercase tracking-wider">
                <Flag className="w-3 h-3" /> Termina Partita
              </button>
            )}
          </div>
        </main>
      ) : (
        <section className="w-full max-w-md flex flex-col items-center justify-center text-center animate-fadeIn">
          <div className="inline-block p-4 rounded-3xl bg-slate-800/60 mb-5 border border-slate-700/50 shadow-lg">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-4xl font-black mb-2 text-white uppercase tracking-tight">PARTITA CONCLUSA</h2>
          <p className="text-slate-400 text-sm font-semibold mb-6">Ottimo tentativo, ecco il tuo resoconto</p>
          
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-[2rem] p-8 shadow-2xl w-full mb-6">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-widest mb-3">Punteggio Finale</p>
            <p className="text-7xl font-black text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span>{score}</span><span className="text-4xl text-slate-500 font-bold">/{totalQuestions}</span>
            </p>
          </div>
          
          <button onClick={startGame} className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-300 hover:to-emerald-500 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-lg uppercase tracking-wide flex justify-center items-center gap-2">
            GIOCA DI NUOVO <RotateCcw className="w-5 h-5" />
          </button>
        </section>
      )}
    </div>
  );
}
