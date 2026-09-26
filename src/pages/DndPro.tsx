import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, ExternalLink, Flag, Infinity as InfinityIcon, Play, RotateCcw, ShieldCheck, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import GameHomeButton from '../components/GameHomeButton';
import { dndPhotoQuestions, type DndPhotoQuestion, type PhotoDifficulty } from '../data/dnd/photoQuestions';
import { avoidImmediateRepeat, buildBestEffortBalancedQuiz } from '../lib/quiz';

type GameState = 'setup' | 'playing' | 'end';
type DifficultyFilter = 'misto' | PhotoDifficulty;
type QuizMode = 'rapida' | 'standard' | 'infinita';

function getPool(difficulty: DifficultyFilter) {
  return difficulty === 'misto' ? dndPhotoQuestions : dndPhotoQuestions.filter(question => question.difficulty === difficulty);
}

function createQuestionSet(mode: QuizMode, difficulty: DifficultyFilter): DndPhotoQuestion[] {
  const pool = getPool(difficulty);
  const desiredTotal = mode === 'rapida' ? 6 : mode === 'standard' ? 12 : pool.length;
  return buildBestEffortBalancedQuiz(pool, question => question.isDuce, desiredTotal);
}

export default function DndPro() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [mode, setMode] = useState<QuizMode>('rapida');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('misto');
  const [questions, setQuestions] = useState(() => createQuestionSet('rapida', 'misto'));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [imageError, setImageError] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + (answered ? 1 : 0)) / totalQuestions) * 100 : 0;
  const accuracy = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0;
  const sourceCount = useMemo(() => new Set(dndPhotoQuestions.map(question => question.sourceUrl)).size, []);
  const filteredCount = getPool(difficulty).length;

  useEffect(() => {
    setImageError(false);
    const nextQuestion = questions[currentQuestionIndex + 1];
    if (!nextQuestion) return;
    const image = new Image();
    image.src = nextQuestion.imageUrl;
  }, [currentQuestionIndex, questions]);

  const resetStats = () => {
    setScore(0);
    setAnsweredCount(0);
    setStreak(0);
    setBestStreak(0);
  };

  const startGame = () => {
    setQuestions(createQuestionSet(mode, difficulty));
    setCurrentQuestionIndex(0);
    setAnswered(false);
    setLastAnswerCorrect(null);
    setImageError(false);
    resetStats();
    setGameState('playing');
  };

  const handleAnswer = (isDuceGuess: boolean) => {
    if (answered || !currentQuestion || imageError) return;
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

  const advance = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex(index => index + 1);
      setAnswered(false);
      setLastAnswerCorrect(null);
      return;
    }

    if (mode === 'infinita') {
      const nextQuestions = avoidImmediateRepeat(
        createQuestionSet('infinita', difficulty),
        currentQuestion,
        (left, right) => left.id === right.id,
      );
      setQuestions(nextQuestions);
      setCurrentQuestionIndex(0);
      setAnswered(false);
      setLastAnswerCorrect(null);
      return;
    }

    setGameState('end');
  };

  if (!currentQuestion && gameState === 'playing') {
    return (
      <main className="game-screen flex items-center justify-center px-6 pb-safe pt-safe text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/[0.08] bg-slate-900/70 p-8 shadow-2xl">
          <h1 className="text-xl font-black text-amber-300">Nessuna foto disponibile</h1>
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Quiz fotografico · fonti verificate</p>
            <h1 className="mt-2 text-3xl font-black tracking-[0.08em] text-white sm:text-4xl">DUCE <span className="text-orange-400">O</span> NON DUCE</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Le foto hanno identità, periodo, provenienza e licenza documentati. Nessuna risposta viene dedotta dal nome del file.</p>
          </header>

          <div className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07] p-4 text-left">
            <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" />
            <div>
              <p className="text-xs font-black text-emerald-100">Archivio fotografico tracciato</p>
              <p className="mt-1 text-[11px] leading-5 text-emerald-200/60">{dndPhotoQuestions.length} foto · {sourceCount} schede fonte · {filteredCount} disponibili con il filtro attuale</p>
            </div>
          </div>

          <section className="w-full rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-5 shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Modalità</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([
                ['rapida', 'Rapida', '6', Zap],
                ['standard', 'Standard', '12', Play],
                ['infinita', 'Infinita', '∞', InfinityIcon],
              ] as const).map(([value, label, sublabel, Icon]) => (
                <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-xl border px-2 py-3 text-center ${mode === value ? 'border-orange-400/35 bg-orange-500/10 text-white' : 'border-white/[0.07] bg-white/[0.03] text-slate-500'}`}>
                  <Icon className="mx-auto h-4 w-4" aria-hidden="true" />
                  <span className="mt-1 block text-xs font-black">{label}</span>
                  <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wide opacity-60">{sublabel}</span>
                </button>
              ))}
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Difficoltà</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['misto', 'base', 'medio', 'difficile'] as DifficultyFilter[]).map(value => (
                <button key={value} type="button" onClick={() => setDifficulty(value)} className={`rounded-xl border px-2 py-3 text-xs font-black capitalize ${difficulty === value ? 'border-orange-400/35 bg-orange-500/10 text-white' : 'border-white/[0.07] bg-white/[0.03] text-slate-500'}`}>{value}</button>
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-4 text-slate-600">Il round usa tutte le foto verificate disponibili fino al limite della modalità e resta il più bilanciato possibile tra Duce e Non Duce.</p>

            <button type="button" onClick={startGame} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-orange-500/15"><Play className="h-5 w-5 fill-current" aria-hidden="true" /> Inizia</button>
          </section>
        </main>
      )}

      {gameState === 'playing' && currentQuestion && (
        <main className="game-compact-header mt-12 flex w-full max-w-md flex-col items-center sm:mt-10">
          <header className="mb-4 w-full text-center"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Quiz fotografico · 50/50 · {mode}</p><h1 className="mt-2 text-3xl font-black tracking-[0.08em] text-white sm:text-4xl">DUCE <span className="text-orange-400">O</span> NON DUCE</h1></header>
          <div className="mb-2.5 flex w-full items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-500"><span>Foto <strong className="text-sky-400">{mode === 'infinita' ? (answered ? answeredCount : answeredCount + 1) : currentQuestionIndex + 1}</strong>{mode === 'infinita' ? '' : `/${totalQuestions}`}</span><span className="flex items-center gap-3"><span>Serie <strong className="text-orange-300">{streak}</strong></span><span>Punti <strong className="text-emerald-400">{score}</strong></span></span></div>
          <div className="quiz-progress mb-3 w-full" aria-hidden="true"><span className="bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${progress}%` }} /></div>

          <div className="relative flex min-h-[250px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-3 shadow-2xl backdrop-blur-xl sm:min-h-[300px]">
            {!imageError ? (
              <img key={currentQuestion.id} src={currentQuestion.imageUrl} alt="Foto storica del quiz" decoding="async" fetchPriority="high" referrerPolicy="no-referrer" onError={() => setImageError(true)} className="quiz-media w-full rounded-[1.35rem] object-contain animate-fadeIn" />
            ) : (
              <div className="px-6 text-center">
                <p className="text-sm font-black text-red-300">Immagine non caricata</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">La fonte è disponibile: puoi aprirla oppure saltare questa foto senza perdere punti.</p>
                <a href={currentQuestion.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-black text-sky-300"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Apri fonte</a>
              </div>
            )}
            {answered && <div className={`absolute left-1/2 top-5 -translate-x-1/2 rounded-full border px-3 py-1.5 text-xs font-black shadow-xl backdrop-blur ${lastAnswerCorrect ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-100' : 'border-red-400/30 bg-red-500/20 text-red-100'}`} role="status" aria-live="polite">{lastAnswerCorrect ? 'Corretto!' : 'Risposta sbagliata'}</div>}
          </div>

          {answered && (
            <div className="mt-3 w-full rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 text-left animate-fadeIn">
              <p className={`text-xs font-black uppercase tracking-[0.14em] ${currentQuestion.isDuce ? 'text-red-300' : 'text-emerald-300'}`}>{currentQuestion.subject}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{currentQuestion.year} · {currentQuestion.license}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{currentQuestion.context}</p>
              <a href={currentQuestion.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-sky-300"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {currentQuestion.sourceLabel}</a>
            </div>
          )}

          <div className="mt-5 flex w-full gap-3">
            <button type="button" onClick={() => handleAnswer(true)} disabled={answered || imageError} className={`flex-1 rounded-2xl border py-4 text-base font-black tracking-wider transition active:scale-[0.98] disabled:cursor-default ${answered && currentQuestion.isDuce ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100' : answered ? 'border-red-400/25 bg-red-500/5 text-slate-500' : 'border-white/[0.08] bg-slate-900/75 text-white hover:bg-slate-800 disabled:opacity-35'}`}>DUCE</button>
            <button type="button" onClick={() => handleAnswer(false)} disabled={answered || imageError} className={`flex-1 rounded-2xl border py-4 text-base font-black tracking-wider transition active:scale-[0.98] disabled:cursor-default ${answered && !currentQuestion.isDuce ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100' : answered ? 'border-red-400/25 bg-red-500/5 text-slate-500' : 'border-white/[0.08] bg-slate-900/75 text-white hover:bg-slate-800 disabled:opacity-35'}`}>NON DUCE</button>
          </div>

          <div className="mt-4 min-h-16 w-full">
            {imageError ? (
              <button type="button" onClick={advance} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3.5 text-xs font-black uppercase tracking-wide text-slate-300">Salta foto <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
            ) : answered ? (
              <button type="button" onClick={advance} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-base font-black uppercase tracking-wide text-white">{mode !== 'infinita' && currentQuestionIndex + 1 >= totalQuestions ? 'Vedi risultato' : 'Prossima foto'} <ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
            ) : (
              <button type="button" onClick={() => setGameState('end')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wider text-slate-500"><Flag className="h-3.5 w-3.5" aria-hidden="true" /> Termina partita</button>
            )}
          </div>
        </main>
      )}

      {gameState === 'end' && (
        <section className="flex w-full max-w-md flex-col items-center justify-center text-center animate-fadeIn">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-orange-400/15 bg-orange-500/10 shadow-lg"><Trophy className="h-8 w-8 text-orange-300" aria-hidden="true" /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Risultato Pro</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Partita conclusa</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Hai risposto a {answeredCount} {answeredCount === 1 ? 'foto' : 'foto'}.</p>
          <div className="my-6 grid w-full grid-cols-2 gap-3"><div className="rounded-[1.5rem] border border-white/[0.08] bg-slate-900/70 p-5"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Precisione</p><p className="mt-2 text-4xl font-black text-emerald-400">{accuracy}%</p><p className="mt-1 text-xs font-bold text-slate-600">{score}/{answeredCount || 0}</p></div><div className="rounded-[1.5rem] border border-white/[0.08] bg-slate-900/70 p-5"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Serie migliore</p><p className="mt-2 text-4xl font-black text-orange-300">{bestStreak}</p><p className="mt-1 text-xs font-bold text-slate-600">consecutive</p></div></div>
          <div className="flex w-full flex-col gap-3"><button type="button" onClick={startGame} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-base font-black uppercase tracking-wide text-white"><RotateCcw className="h-5 w-5" aria-hidden="true" /> Gioca di nuovo</button><button type="button" onClick={() => setGameState('setup')} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wide text-slate-400">Cambia modalità</button></div>
        </section>
      )}
    </div>
  );
}
