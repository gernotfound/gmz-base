import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ChevronRight, Flag, Trophy, RotateCcw } from 'lucide-react';
import { databaseFrasi } from '../data/dnd/questions';

export default function Dnd() {
  const [gameState, setGameState] = useState<'playing' | 'end'>('playing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [questions, setQuestions] = useState<typeof databaseFrasi>([]);
  const totalQuestions = 20;

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const shuffled = [...databaseFrasi].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, totalQuestions));
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

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center pt-safe pb-safe px-6 min-h-screen w-full relative animate-fadeIn">
      <Link to="/" className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all active:scale-90 shadow-lg z-30">
        <HomeIcon className="w-5 h-5" />
      </Link>

      {gameState === 'playing' ? (
        <main className="w-full max-w-md flex flex-col items-center mt-12">
          <header className="mb-6 w-full text-center">
            <h1 className="text-4xl font-black tracking-widest text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] uppercase">
              DUCE
            </h1>
            <div className="flex items-center justify-center text-slate-500 my-2">
              <div className="h-px bg-slate-700/50 w-20"></div>
              <span className="mx-4 text-base font-black tracking-widest text-amber-500 uppercase">o</span>
              <div className="h-px bg-slate-700/50 w-20"></div>
            </div>
            <h1 className="text-4xl font-black tracking-widest text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] uppercase">
              <span className="flipped-n">N</span>O<span className="flipped-n">N</span> D<span className="flipped-u">U</span>CE
            </h1>
          </header>

          <div className="w-full flex justify-between text-slate-400 font-bold mb-3 px-2 text-sm uppercase tracking-wider">
            <span>Domanda: <span className="text-sky-500 font-black text-base">{currentQuestionIndex + 1}</span>/{totalQuestions}</span>
            <span>Punti: <span className="text-emerald-500 font-black text-base">{score}</span></span>
          </div>

          <div className="w-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center min-h-[260px] justify-center relative">
            <p className="text-xl md:text-2xl text-center font-bold leading-relaxed text-slate-100 italic">
              "{currentQuestion.text}"
            </p>
            
            {answered && (
              <div className="w-full mt-6 text-center border-t border-slate-700/40 pt-4 animate-fadeIn">
                <span className={`block text-xs font-extrabold uppercase tracking-widest mb-1.5 ${currentQuestion.isDuce ? 'text-red-400' : 'text-emerald-400'}`}>
                  {currentQuestion.author}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed font-medium px-2">
                  {currentQuestion.context}
                </p>
              </div>
            )}
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
                PROSSIMA DOMANDA <ChevronRight className="w-5 h-5" />
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
