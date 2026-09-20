import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('GMZ Base crashed inside React rendering', error, info);
  }

  private reload = () => {
    window.location.reload();
  };

  private goHome = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-[100dvh] items-center justify-center px-5 pb-safe pt-safe text-white">
        <section className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-slate-900/80 p-6 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-300">GMZ Base</p>
          <h1 className="mt-3 text-2xl font-black">Il gioco si è interrotto</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            La sessione corrente ha incontrato un errore inatteso. Puoi ricaricare la pagina oppure tornare alla sala giochi.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={this.reload}
              className="min-h-12 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              Ricarica
            </button>
            <button
              type="button"
              onClick={this.goHome}
              className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-slate-100 transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              Torna alla home
            </button>
          </div>
        </section>
      </main>
    );
  }
}
