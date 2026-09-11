import { useMemo, useState } from 'react';
import { ChevronRight, ExternalLink, Flag, Play, RotateCcw, ShieldCheck, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import GameHomeButton from '../components/GameHomeButton';
import { databaseFrasi, type DndDifficulty } from '../data/dnd/questions';
import { buildBalancedQuiz } from '../lib/quiz';

type GameState = 'setup' | 'playing' | 'end';
type DifficultyFilter = 'misto' | DndDifficulty;

function createQuestionSet(total: 10 | 20, difficulty: DifficultyFilter) {
  const filtered = difficulty === 'misto' ? databaseFrasi : databaseFrasi.filter(question => question.difficulty === difficulty);
  const pool = filtered.filter(question => question.isDuce).length >= total / 2 && filtered.filter(question => !question.isDuce).length >= total / 2
    ? filtered
    : databaseFrasi;
  return buildBalancedQuiz(pool, question => question.isDuce, total / 2);
}

export default function Dnd() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [roundLength, setRoundLength] = useState<10 | 20>(10);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('misto');
  const [questions, setQuestions] = useState(() => createQuestionSet(10, 'misto'));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + (answered ? 1 : 0)) / totalQuestions) * 100 : 0;
  const accuracy = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0;
  const sourceCount = useMemo(() => new Set(databaseFrasi.map(question => question.sourceUrl)).size, []);

  const startGame = () => {
    setQuestions(createQuestionSet(roundLength, difficulty));
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnsweredCount(0);
    setAnswered(false);
    setLastAnswerCorrect(null);
    setStreak(0);
    setBestStreak(0);
    setGameState('playing');
  };

  const handleAnswer = (isDuceGuess: boolean) => {
    if (answered || !currentQuestion) return;
    const isCorrect = currentQuestion.isDuce === isDuceGuess;
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) setScore(current => current + 1);
    setAnsweredCount(current => current + 1);
    setStreak(current => {
      const next = isCorrect ? current + 1 : 0;
      if (isCorrect) setBestStreak(best => Math.max(best, next));
      return next;
    });
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      setGameState('end');
      return;
    }
    setCurrentQuestionIndex(index => index + 1);
    setAnswered(false);
    setLastAnswerCorrect(null);
  };

  if (!currentQuestion && gameState === 'playing') {
    return (
      <main className="game-screen flex items-center justify-center px-6 pb-safe pt-safe text-center text-white">
        <div className="max-w-sm rounded-3xl border border-white/[0.08] bg-slate-900/70 p-7">
          <h1 className="text-xl font-black">Nessuna domanda disponibile</h1>
          <Link to="/" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950">Torna al catalogo</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="game-screen relative flex w-full flex-col items-center justify-center px-4 pb-safe pt-safe text-white animate-fadeIn sm:px-6">
      <GameHomeButton tone="amber" />

      {gameState === 'setup' && (
        <main className="mt-14 flex w-full max-w-md flex-col items-center sm:mt-12">
          <header className="mb-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Quiz storico · fonti verificate</p>
            <h1 className="mt-2 text-3xl font-black tracking-[0.08em] text-white sm:text-4xl">DUCE <span className="text-amber-400">O</span> NON DUCE</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Citazioni e fatti ripuliti dalle attribuzioni dubbie. Dopo ogni risposta puoi aprire la fonte.</p>
          </header>

          <div className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07] p-4 text-left">
            <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" />
            <div>
              <p className="text-xs font-black text-emerald-100">Database editoriale tracciato</p>
              <p className="mt-1 text-[11px] leading-5 text-emerald-200/60">{databaseFrasi.length} voci · {sourceCount} fonti istituzionali o enciclopediche</p>
            </div>
          </div>

          <section className="w-full rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-5 shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Lunghezza</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([10, 20] as const).map(value => (
                <button key={value} type="button" onClick={() => setRoundLength(value)} className={`rounded-xl border py-3 text-sm font-black ${roundLength === value ? 'border-amber-400/35 bg-amber-500/10 text-white' : 'border-white/[0.07] bg-white/[0.03] text-slate-500'}`}>{value} domande</button>
              ))}
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Difficoltà</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['misto', 'base', 'medio', 'difficile'] as DifficultyFilter[]).map(value => (
                <button key={value} type="button" onClick={() => setDifficulty(value)} className={`rounded-xl border px-2 py-3 text-xs font-black capitalize ${difficulty === value ? 'border-amber-400/35 bg-amber-500/10 text-white' : 'border-white/[0.07] bg-white/[0.03] text-slate-500'}`}>{value}</button>
              ))}
            </div>

            <button type="button" onClick={startGame} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-orange-500/15">
              <Play className="h-5 w-5 fill-current" aria-hidden="true" /> Inizia
            </button>
          </section>
        </main>
      )}

      {gameState === 'playing' && currentQuestion && (
        <main className="game-compact-header mt-12 flex w-full max-w-md flex-col items-center sm:mt-10">
          <header className="mb-5 w-full text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Quiz storico · 50/50</p>
            <h1 className="mt-2 text-3xl font-black tracking-[0.08em] text-white sm:text-4xl">DUCE <span className="text-amber-400">O</span> NON DUCE</h1>
          </header>

          <div className="mb-2.5 flex w-full items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>{currentQuestion.kind === 'citazione' ? 'Citazione' : 'Fatto'} <strong className="text-sky-400">{currentQuestionIndex + 1}</strong>/{totalQuestions}</span>
            <span className="flex items-center gap-3"><span>Serie <strong className="text-amber-300">{streak}</strong></span><span>Punti <strong className="text-emerald-400">{score}</strong></span></span>
          </div>
          <div className="quiz-progress mb-3 w-full" aria-hidden="true"><span className="bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${progress}%` }} /></div>

          <div className="relative flex min-h-[250px] w-full flex-col items-center justify-center rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl sm:min-h-[280px] sm:p-8">
            <p className="text-center text-xl font-bold leading-relaxed text-slate-100 sm:text-2xl">{currentQuestion.kind === 'citazione' ? `“${currentQuestion.text}”` : currentQuestion.text}</p>
            {answered && (
              <div className="mt-5 w-full border-t border-white/[0.07] pt-4 text-center animate-fadeIn" aria-live="polite">
                <p className={`mb-2 text-sm font-black ${lastAnswerCorrect ? 'text-emerald-300' : 'text-red-300'}`}>{lastAnswerCorrect ? 'Corretto!' : 'Risposta sbagliata'}</p>
                <span className={`block text-xs font-black uppercase tracking-[0.16em] ${currentQuestion.isDuce ? 'text-red-300' : 'text-emerald-300'}`}>{currentQuestion.author}</span>
                <p className="mt-2 px-1 text-sm font-medium leading-6 text-slate-400">{currentQuestion.context}</p>
                <a href={currentQuestion.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-sky-300">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {currentQuestion.sourceLabel}
                </a>
              </div>
            )}
          </div>

          <div className="mt-5 flex w-full gap-3">
            <button type="button" onClick={() => handleAnswer(true)} disabled={answered} className={`flex-1 rounded-2xl border py-4 text-base font-black tracking-wider transition active:scale-[0.98] disabled:cursor-default ${answered && currentQuestion.isDuce ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100' : answered ? 'border-red-400/25 bg-red-500/5 text-slate-500' : 'border-white/[0.08] bg-slate-900/75 text-white hover:bg-slate-800'}`}>DUCE</button>
            <button type="button" onClick={() => handleAnswer(false)} disabled={answered} className={`flex-1 rounded-2xl border py-4 text-base font-black tracking-wider transition active:scale-[0.98] disabled:cursor-default ${answered && !currentQuestion.isDuce ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100' : answered ? 'border-red-400/25 bg-red-500/5 text-slate-500' : 'border-white/[0.08] bg-slate-900/75 text-white hover:bg-slate-800'}`}>NON DUCE</button>
          </div>

          <div className="mt-4 min-h-16 w-full">
            {answered ? (
              <button type="button" onClick={nextQuestion} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-indigo-500/15">
                {currentQuestionIndex + 1 >= totalQuestions ? 'Vedi risultato' : 'Prossima domanda'} <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : (
              <button type="button" onClick={() => setGameState('end')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wider text-slate-500"><Flag className="h-3.5 w-3.5" aria-hidden="true" /> Termina partita</button>
            )}
          </div>
        </main>
      )}

      {gameState === 'end' && (
        <section className="flex w-full max-w-md flex-col items-center justify-center text-center animate-fadeIn">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-400/15 bg-amber-500/10 shadow-lg"><Trophy className="h-8 w-8 text-amber-300" aria-hidden="true" /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Risultato</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Partita conclusa</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Hai risposto a {answeredCount} domande su {totalQuestions}.</p>
          <div className="my-6 grid w-full grid-cols-2 gap-3">
            <div className="rounded-[1.5rem] border border-white/[0.08] bg-slate-900/70 p-5"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Precisione</p><p className="mt-2 text-4xl font-black text-emerald-400">{accuracy}%</p><p className="mt-1 text-xs font-bold text-slate-600">{score}/{answeredCount || 0}</p></div>
            <div className="rounded-[1.5rem] border border-white/[0.08] bg-slate-900/70 p-5"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Serie migliore</p><p className="mt-2 text-4xl font-black text-amber-300">{bestStreak}</p><p className="mt-1 text-xs font-bold text-slate-600">consecutive</p></div>
          </div>
          <div className="flex w-full flex-col gap-3">
            <button type="button" onClick={startGame} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-base font-black uppercase tracking-wide text-white"><RotateCcw className="h-5 w-5" aria-hidden="true" /> Gioca di nuovo</button>
            <button type="button" onClick={() => setGameState('setup')} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wide text-slate-400">Cambia modalità</button>
          </div>
        </section>
      )}
    </div>
  );
}
