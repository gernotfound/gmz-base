import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flag, Home as HomeIcon, RotateCcw, Trophy } from 'lucide-react';
import { databaseFrasi } from '../data/dnd/questions';
import { shuffle } from '../lib/random';

const QUESTION_LIMIT = 20;

function createQuestionSet() {
  return shuffle(databaseFrasi).slice(0, QUESTION_LIMIT);
}

export default function Dnd() {
  const [gameState, setGameState] = useState<'playing' | 'end'>('playing');
  const [questions, setQuestions] = useState(createQuestionSet);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const startGame = () => {
    setQuestions(createQuestionSet());
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnsweredCount(0);
    setGameState('playing');
    setAnswered(false);
  };

  const handleAnswer = (isDuceGuess: boolean) => {
    if (answered || !currentQuestion) return;

    if (currentQuestion.isDuce === isDuceGuess) {
      setScore(current => current + 1);
    }
    setAnsweredCount(current => current + 1);
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      setGameState('end');
      return;
    }

    setCurrentQuestionIndex(index => index + 1);
    setAnswered(false);
  };

  if (!currentQuestion && gameState === 'playing') {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center px-6 pb-safe pt-safe text-center text-white">
        <div className="max-w-sm rounded-3xl border border-white/[0.08] bg-slate-900/70 p-7">
          <h1 className="text-xl font-black">Nessuna domanda disponibile</h1>
          <Link to="/" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950">Torna al catalogo</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 pb-safe pt-safe text-white animate-fadeIn sm:px-6">
      <Link
        to="/"
        aria-label="Torna al catalogo"
        className="absolute left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-slate-900/80 text-slate-300 shadow-lg backdrop-blur transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:left-6 sm:top-6"
      >
        <HomeIcon className="h-5 w-5" aria-hidden="true" />
      </Link>

      {gameState === 'playing' && currentQuestion ? (
        <main className="mt-12 flex w-full max-w-md flex-col items-center sm:mt-10">
          <header className="mb-6 w-full text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Quiz storico</p>
            <h1 className="mt-2 text-3xl font-black tracking-[0.08em] text-white sm:text-4xl">
              DUCE <span className="text-amber-400">O</span>{' '}
              <span className="inline-flex items-center"><span className="flipped-n">N</span>O<span className="flipped-n">N</span> D<span className="flipped-u">U</span>CE</span>
            </h1>
          </header>

          <div className="mb-3 flex w-full items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Domanda <strong className="text-sky-400">{currentQuestionIndex + 1}</strong>/{totalQuestions}</span>
            <span>Punti <strong className="text-emerald-400">{score}</strong></span>
          </div>

          <div className="relative flex min-h-[280px] w-full flex-col items-center justify-center rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
            <p className="text-center text-xl font-bold italic leading-relaxed text-slate-100 sm:text-2xl">
              “{currentQuestion.text}”
            </p>

            {answered && (
              <div className="mt-6 w-full border-t border-white/[0.07] pt-5 text-center animate-fadeIn" aria-live="polite">
                <span className={`block text-xs font-black uppercase tracking-[0.16em] ${currentQuestion.isDuce ? 'text-red-300' : 'text-emerald-300'}`}>
                  {currentQuestion.author}
                </span>
                <p className="mt-2 px-1 text-sm font-medium leading-6 text-slate-400">{currentQuestion.context}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex w-full gap-3">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              disabled={answered}
              className={`flex-1 rounded-2xl border py-4 text-base font-black tracking-wider transition active:scale-[0.98] disabled:cursor-default ${
                answered && currentQuestion.isDuce
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                  : answered
                    ? 'border-red-400/25 bg-red-500/5 text-slate-500'
                    : 'border-white/[0.08] bg-slate-900/75 text-white hover:bg-slate-800'
              }`}
            >
              DUCE
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              disabled={answered}
              className={`flex-1 rounded-2xl border py-4 text-base font-black tracking-wider transition active:scale-[0.98] disabled:cursor-default ${
                answered && !currentQuestion.isDuce
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                  : answered
                    ? 'border-red-400/25 bg-red-500/5 text-slate-500'
                    : 'border-white/[0.08] bg-slate-900/75 text-white hover:bg-slate-800'
              }`}
            >
              NON DUCE
            </button>
          </div>

          <div className="mt-4 min-h-16 w-full">
            {answered ? (
              <button
                type="button"
                onClick={nextQuestion}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-indigo-500/15 transition hover:brightness-110 active:scale-[0.99]"
              >
                {currentQuestionIndex + 1 >= totalQuestions ? 'Vedi risultato' : 'Prossima domanda'}
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setGameState('end')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wider text-slate-500 transition hover:bg-white/[0.06] hover:text-red-300"
              >
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                Termina partita
              </button>
            )}
          </div>
        </main>
      ) : (
        <section className="flex w-full max-w-md flex-col items-center justify-center text-center animate-fadeIn">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-400/15 bg-amber-500/10 shadow-lg">
            <Trophy className="h-8 w-8 text-amber-300" aria-hidden="true" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Risultato</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Partita conclusa</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Hai risposto a {answeredCount} {answeredCount === 1 ? 'domanda' : 'domande'} su {totalQuestions}.</p>

          <div className="my-6 w-full rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Risposte corrette</p>
            <p className="mt-3 text-7xl font-black text-emerald-400">
              {score}<span className="text-3xl text-slate-600">/{answeredCount}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-emerald-500/15 transition hover:brightness-110 active:scale-[0.99]"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Gioca di nuovo
          </button>
        </section>
      )}
    </div>
  );
}
