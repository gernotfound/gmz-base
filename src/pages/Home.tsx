import { useMemo, useState } from 'react';
import { Gamepad2, Search, Sparkles, X } from 'lucide-react';
import GameCard from '../components/GameCard';
import { gameCategories, games, type GameCategory } from '../games/catalog';

type CategoryFilter = 'Tutti' | GameCategory;

export default function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('Tutti');

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('it');

    return games
      .filter(game => category === 'Tutti' || game.category === category)
      .filter(game => {
        if (!normalizedQuery) return true;
        const searchableText = [game.title, game.description, game.category, game.mode, game.players, ...game.tags]
          .join(' ')
          .toLocaleLowerCase('it');
        return searchableText.includes(normalizedQuery);
      })
      .slice()
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.title.localeCompare(b.title, 'it'));
  }, [category, query]);

  const resetFilters = () => {
    setQuery('');
    setCategory('Tutti');
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.16),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(236,72,153,0.10),transparent_24%),linear-gradient(180deg,#070b14_0%,#0b1020_55%,#070b14_100%)]" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-safe pt-safe sm:px-6 lg:px-8">
        <header className="py-9 sm:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-violet-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                GMZ Base · Arcade Hub
              </div>

              <div className="flex items-start gap-4 sm:gap-5">
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] shadow-[0_0_55px_rgba(139,92,246,0.16)] sm:flex">
                  <Gamepad2 className="h-8 w-8 text-violet-300" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                    Una base per tutti i tuoi giochi.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
                    Scegli cosa giocare, filtra il catalogo e parti subito. L’interfaccia è pensata per crescere da pochi titoli a una libreria molto più ampia senza trasformarsi in una lista infinita.
                  </p>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:flex sm:min-w-max">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Giochi</dt>
                <dd className="mt-1 text-2xl font-black text-white">{games.length}</dd>
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Categorie</dt>
                <dd className="mt-1 text-2xl font-black text-white">{gameCategories.length}</dd>
              </div>
            </dl>
          </div>
        </header>

        <main>
          <section className="sticky top-3 z-20 mb-7 rounded-[1.5rem] border border-white/[0.08] bg-slate-950/80 p-3 shadow-[0_20px_70px_rgba(2,6,23,0.45)] backdrop-blur-2xl sm:p-4" aria-labelledby="catalog-heading">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex items-center justify-between gap-3 xl:min-w-[190px]">
                <div>
                  <h2 id="catalog-heading" className="font-black tracking-tight text-white">Catalogo</h2>
                  <p className="text-xs text-slate-500">{filteredGames.length} {filteredGames.length === 1 ? 'risultato' : 'risultati'}</p>
                </div>
              </div>

              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Cerca per nome, modalità o tag…"
                  aria-label="Cerca nel catalogo dei giochi"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.045] pl-10 pr-10 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/45 focus:bg-white/[0.065] focus:ring-2 focus:ring-violet-500/15"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Cancella ricerca"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-0.5" aria-label="Filtra per categoria">
                {(['Tutti', ...gameCategories] as CategoryFilter[]).map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                      category === item
                        ? 'bg-white text-slate-950 shadow-lg'
                        : 'border border-white/[0.07] bg-white/[0.035] text-slate-400 hover:bg-white/[0.065] hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {filteredGames.length > 0 ? (
            <section className="grid grid-cols-1 gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Giochi disponibili">
              {filteredGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </section>
          ) : (
            <section className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.025] px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05]">
                <Search className="h-6 w-6 text-slate-500" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-black text-white">Nessun gioco trovato</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Prova un’altra parola oppure rimuovi i filtri attivi.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                Azzera filtri
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
