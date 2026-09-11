import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronRight, Flag, Play, RotateCcw, ShieldAlert, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import GameHomeButton from '../components/GameHomeButton';
import { dndProImageFiles } from '../data/dnd/images';
import { buildBalancedQuiz } from '../lib/quiz';

type GameState = 'setup' | 'playing' | 'end';

interface ImageQuestion {
  path: string;
  filename: string;
  isDuce: boolean;
}

const databaseImmagini: readonly ImageQuestion[] = dndProImageFiles.map(filename => ({
  path: `${import.meta.env.BASE_URL}img_dndpro/${filename}`,
  filename,
  isDuce: filename.toLowerCase().startsWith('d') && !filename.toLowerCase().startsWith('nd'),
}));

function createQuestionSet(total: 10 | 20): ImageQuestion[] {
  const perSide = Math.min(total / 2, databaseImmagini.filter(image => image.isDuce).length, databaseImmagini.filter(image => !image.isDuce).length);
  return buildBalancedQuiz(databaseImmagini, image => image.isDuce, perSide);
}

export default function DndPro() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [roundLength, setRoundLength] = useState<10 | 20>(10);
  const [questions, setQuestions] = useState(() => createQuestionSet(10));
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
  const counts = useMemo(() => ({
    duce: databaseImmagini.filter(image => image.isDuce).length,
    nonDuce: databaseImmagini.filter(image => !image.isDuce).length,
  }), []);

  useEffect(() => {
    const nextQuestion = questions[currentQuestionIndex + 1];
    if (!nextQuestion) return;
    const image = new Image();
    image.src = nextQuestion.path;
  }, [currentQuestionIndex, questions]);

  const startGame = () => {
    setQuestions(createQuestionSet(roundLength));
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswered(false);
    setAnsweredCount(0);
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

  if (databaseImmagini.length === 0) {
    return (
      <main className="game-screen flex items-center justify-center px-6 pb-safe pt-safe text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/[0.08] bg-slate-900/70 p-8 shadow-2xl">
          <h1 className="text-xl font-black text-amber-300">Nessuna foto trovata</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Aggiungi immagini con metadati di provenienza in <code className="rounded bg-black/30 px-1.5 py-1 text-sky-300">public/img_dndpro</code>.</p>
          <Link to="/" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950">Torna al catalogo</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="game-screen relative flex w-full flex-col items-center justify-center px-4 pb-safe pt-safe text-white animate-fadeIn sm:px-6">
      <GameHomeButton tone="orange" />

      {gameState === 'setup' && (
        <main className="mt-14 flex w-full max-w-md flex-col items-center sm:mt-12">
          <header className="mb-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Quiz fotografico · Pro</p>
            <h1 className="mt-2 text-3xl font-black tracking-[0.08em] text-white sm:text-4xl">DUCE <span className="text-orange-400">O</span> NON DUCE</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Round bilanciati 50/50, pre-caricamento delle immagini e trasparenza sulla qualità del dataset.</p>
          </header>

          <div className="mb-5 flex w-full gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] p-4 text-left">
            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <p className="text-xs font-black text-amber-100">Audit fotografico parziale</p>
              <p className="mt-1 text-[11px] leading-5 text-amber-100/60">Le {databaseImmagini.length} immagini legacy sono etichettate come Duce/Non Duce, ma i file originali non conservano ancora fonte, autore e licenza. Per questo il gioco non mostra identità o contesti non documentati.</p>
            </div>
          </div>

          <section className="w-full rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-5 shadow-2xl">
            <div className="mb-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-red-500/[0.08] p-3"><p className="text-[9px] font-black uppercase tracking-wide text-red-300">Duce</p><p className="mt-1 text-2xl font-black">{counts.duce}</p></div>
              <div className="rounded-xl bg-emerald-500/[0.08] p-3"><p className="text-[9px] font-black uppercase tracking-wide text-emerald-300">Non Duce</p><p className="mt-1 text-2xl font-black">{counts.nonDuce}</p></div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Lunghezza round</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([10, 20] as const).map(value => {
                const feasible = Math.min(counts.duce, counts.nonDuce) * 2 >= value;
                return (
                  <button key={value} type="button" onClick={() => feasible && setRoundLength(value)} disabled={!feasible} className={`rounded-xl border py-3 text-sm font-black disabled:opacity-30 ${roundLength === value ? 'border-orange-400/35 bg-orange-500/10 text-white' : 'border-white/[0.07] bg-white/[0.03] text-slate-500'}`}>{value} foto</button>
                );
              })}
            </div>

            <button type="button" onClick={startGame} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-orange-500/15"><Play className="h-5 w-5 fill-current" aria-hidden="true" /> Inizia</button>
          </section>
        </main>
      )}

      {gameState === 'playing' && currentQuestion && (
        <main className="game-compact-header mt-12 flex w-full max-w-md flex-col items-center sm:mt-10">
          <header className="mb-4 w-full text-center"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Quiz fotografico · 50/50</p><h1 className="mt-2 text-3xl font-black tracking-[0.08em] text-white sm:text-4xl">DUCE <span className="text-orange-400">O</span> NON DUCE</h1></header>
          <div className="mb-2.5 flex w-full items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-500"><span>Foto <strong className="text-sky-400">{currentQuestionIndex + 1}</strong>/{totalQuestions}</span><span className="flex items-center gap-3"><span>Serie <strong className="text-orange-300">{streak}</strong></span><span>Punti <strong className="text-emerald-400">{score}</strong></span></span></div>
          <div className="quiz-progress mb-3 w-full" aria-hidden="true"><span className="bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${progress}%` }} /></div>

          <div className="relative flex min-h-[250px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-3 shadow-2xl backdrop-blur-xl sm:min-h-[300px]">
            <img key={currentQuestion.path} src={currentQuestion.path} alt="Foto storica del quiz" decoding="async" fetchPriority="high" className="quiz-media w-full rounded-[1.35rem] object-contain animate-fadeIn" />
            {answered && <div className={`absolute left-1/2 top-5 -translate-x-1/2 rounded-full border px-3 py-1.5 text-xs font-black shadow-xl backdrop-blur ${lastAnswerCorrect ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-100' : 'border-red-400/30 bg-red-500/20 text-red-100'}`} role="status" aria-live="polite">{lastAnswerCorrect ? 'Corretto!' : 'Risposta sbagliata'}</div>}
          </div>

          {answered && (
            <div className="mt-3 flex w-full items-start gap-2 rounded-xl border border-amber-400/10 bg-amber-500/[0.04] px-3 py-2.5 text-[10px] leading-5 text-amber-100/55">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{currentQuestion.isDuce ? 'Il dataset classifica questa foto come Benito Mussolini.' : 'Il dataset classifica questa foto come una persona diversa da Mussolini.'} Provenienza fotografica non ancora documentata.</span>
            </div>
          )}

          <div className="mt-5 flex w-full gap-3">
            <button type="button" onClick={() => handleAnswer(true)} disabled={answered} className={`flex-1 rounded-2xl border py-4 text-base font-black tracking-wider transition active:scale-[0.98] disabled:cursor-default ${answered && currentQuestion.isDuce ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100' : answered ? 'border-red-400/25 bg-red-500/5 text-slate-500' : 'border-white/[0.08] bg-slate-900/75 text-white hover:bg-slate-800'}`}>DUCE</button>
            <button type="button" onClick={() => handleAnswer(false)} disabled={answered} className={`flex-1 rounded-2xl border py-4 text-base font-black tracking-wider transition active:scale-[0.98] disabled:cursor-default ${answered && !currentQuestion.isDuce ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100' : answered ? 'border-red-400/25 bg-red-500/5 text-slate-500' : 'border-white/[0.08] bg-slate-900/75 text-white hover:bg-slate-800'}`}>NON DUCE</button>
          </div>

          <div className="mt-4 min-h-16 w-full">
            {answered ? <button type="button" onClick={nextQuestion} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-base font-black uppercase tracking-wide text-white">{currentQuestionIndex + 1 >= totalQuestions ? 'Vedi risultato' : 'Prossima foto'} <ChevronRight className="h-5 w-5" aria-hidden="true" /></button> : <button type="button" onClick={() => setGameState('end')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wider text-slate-500"><Flag className="h-3.5 w-3.5" aria-hidden="true" /> Termina partita</button>}
          </div>
        </main>
      )}

      {gameState === 'end' && (
        <section className="flex w-full max-w-md flex-col items-center justify-center text-center animate-fadeIn">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-orange-400/15 bg-orange-500/10 shadow-lg"><Trophy className="h-8 w-8 text-orange-300" aria-hidden="true" /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Risultato Pro</p><h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Partita conclusa</h2><p className="mt-2 text-sm font-semibold text-slate-500">Hai risposto a {answeredCount} foto su {totalQuestions}.</p>
          <div className="my-6 grid w-full grid-cols-2 gap-3"><div className="rounded-[1.5rem] border border-white/[0.08] bg-slate-900/70 p-5"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Precisione</p><p className="mt-2 text-4xl font-black text-emerald-400">{accuracy}%</p><p className="mt-1 text-xs font-bold text-slate-600">{score}/{answeredCount || 0}</p></div><div className="rounded-[1.5rem] border border-white/[0.08] bg-slate-900/70 p-5"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Serie migliore</p><p className="mt-2 text-4xl font-black text-orange-300">{bestStreak}</p><p className="mt-1 text-xs font-bold text-slate-600">consecutive</p></div></div>
          <div className="flex w-full flex-col gap-3"><button type="button" onClick={startGame} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-base font-black uppercase tracking-wide text-white"><RotateCcw className="h-5 w-5" aria-hidden="true" /> Gioca di nuovo</button><button type="button" onClick={() => setGameState('setup')} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wide text-slate-400">Cambia modalità</button></div>
        </section>
      )}
    </div>
  );
}
