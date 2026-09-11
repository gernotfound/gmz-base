import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { games } from './games/catalog';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const gameRoutes = games.map(game => ({
  id: game.id,
  path: game.path,
  Component: lazy(game.load),
}));

function PageLoader() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center pb-safe pt-safe text-white" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-900/70 px-5 py-4 text-sm font-bold text-slate-300 shadow-xl backdrop-blur-xl">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-violet-400" aria-hidden="true" />
        Caricamento gioco…
      </div>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          {gameRoutes.map(({ id, path, Component }) => (
            <Route key={id} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
