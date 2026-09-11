import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Copy, DoorOpen, Home as HomeIcon, Play, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Peer, { type DataConnection } from 'peerjs';
import clsx from 'clsx';

const ROWS = 6;
const COLS = 7;
const CONNECTION_TIMEOUT_MS = 8_000;

type GameState = 'setup' | 'playing' | 'end';
type PlayerNumber = 0 | 1 | 2;
type PeerMessage =
  | { type: 'move'; col: number; playerNum: 1 | 2 }
  | { type: 'restart' };

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array<number>(COLS).fill(0));
}

function createHostCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, 'X');
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function isValidCode(value: string) {
  return /^[A-Z0-9]{4,6}$/.test(value);
}

function isPeerMessage(data: unknown): data is PeerMessage {
  if (!data || typeof data !== 'object') return false;
  const message = data as { type?: unknown; col?: unknown; playerNum?: unknown };

  if (message.type === 'restart') return true;
  return (
    message.type === 'move' &&
    typeof message.col === 'number' &&
    Number.isInteger(message.col) &&
    message.col >= 0 &&
    message.col < COLS &&
    (message.playerNum === 1 || message.playerNum === 2)
  );
}

export default function Forza4() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJoinIdRef = useRef(searchParams.get('id'));

  const [gameState, setGameState] = useState<GameState>('setup');
  const [statusText, setStatusText] = useState('Connessione ai server…');
  const [statusError, setStatusError] = useState(false);
  const [peerReady, setPeerReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [myId, setMyId] = useState('');
  const [remoteId, setRemoteId] = useState(() => normalizeCode(initialJoinIdRef.current ?? ''));
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState<number[][]>(createEmptyBoard);
  const [myPlayerNum, setMyPlayerNum] = useState<PlayerNumber>(0);
  const [myTurn, setMyTurn] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);
  const boardRef = useRef(board);
  const isHostRef = useRef(false);
  const myPlayerNumRef = useRef<PlayerNumber>(0);
  const myTurnRef = useRef(false);
  const gameOverRef = useRef(false);
  const hasConnectedRef = useRef(false);

  const clearConnectionTimeout = () => {
    if (connectionTimeoutRef.current !== null) {
      window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  };

  const setTurn = (value: boolean) => {
    myTurnRef.current = value;
    setMyTurn(value);
  };

  const setPlayer = (value: PlayerNumber) => {
    myPlayerNumRef.current = value;
    setMyPlayerNum(value);
  };

  const evaluateWinConditions = (currentBoard: number[][], row: number, col: number, player: number) => {
    const axes = [
      [[0, 1], [0, -1]],
      [[1, 0], [-1, 0]],
      [[1, 1], [-1, -1]],
      [[1, -1], [-1, 1]],
    ];

    for (const axis of axes) {
      let count = 1;
      for (const [rowDelta, colDelta] of axis) {
        let step = 1;
        while (true) {
          const nextRow = row + rowDelta * step;
          const nextCol = col + colDelta * step;
          if (
            nextRow >= 0 &&
            nextRow < ROWS &&
            nextCol >= 0 &&
            nextCol < COLS &&
            currentBoard[nextRow][nextCol] === player
          ) {
            count += 1;
            step += 1;
          } else {
            break;
          }
        }
      }
      if (count >= 4) return true;
    }

    return false;
  };

  const evaluateDrawCondition = (currentBoard: number[][]) => currentBoard[0].every(cell => cell !== 0);

  const processMove = (col: number, playerNum: 1 | 2) => {
    if (gameOverRef.current || col < 0 || col >= COLS || boardRef.current[0][col] !== 0) return false;

    const nextBoard = boardRef.current.map(row => [...row]);
    let placedRow = -1;

    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (nextBoard[row][col] === 0) {
        nextBoard[row][col] = playerNum;
        placedRow = row;
        break;
      }
    }

    if (placedRow === -1) return false;

    boardRef.current = nextBoard;
    setBoard(nextBoard);

    if (evaluateWinConditions(nextBoard, placedRow, col, playerNum)) {
      gameOverRef.current = true;
      setWinner(playerNum);
      setGameState('end');
      setTurn(false);
    } else if (evaluateDrawCondition(nextBoard)) {
      gameOverRef.current = true;
      setWinner(0);
      setGameState('end');
      setTurn(false);
    } else {
      setTurn(playerNum !== myPlayerNumRef.current);
    }

    return true;
  };

  const executeRestart = () => {
    const emptyBoard = createEmptyBoard();
    boardRef.current = emptyBoard;
    setBoard(emptyBoard);
    gameOverRef.current = false;
    setWinner(null);
    setGameState('playing');
    setStatusText('Partita in corso');
    setStatusError(false);
    setTurn(isHostRef.current);
  };

  const handleDisconnect = () => {
    clearConnectionTimeout();
    setConnecting(false);
    if (!hasConnectedRef.current) return;

    hasConnectedRef.current = false;
    gameOverRef.current = true;
    setGameState('end');
    setStatusText('Connessione persa');
    setStatusError(true);
    setWinner(-1);
    setTurn(false);
  };

  const bindConnectionEvents = (connection: DataConnection) => {
    connRef.current = connection;

    connection.on('open', () => {
      if (connRef.current !== connection) return;
      clearConnectionTimeout();
      hasConnectedRef.current = true;
      setConnecting(false);
      setGameState('playing');
      setStatusText('Partita in corso');
      setStatusError(false);
      setSearchParams({});
    });

    connection.on('data', data => {
      if (connRef.current !== connection || !isPeerMessage(data)) return;

      if (data.type === 'restart') {
        executeRestart();
        return;
      }

      const expectedRemotePlayer = myPlayerNumRef.current === 1 ? 2 : 1;
      if (data.playerNum !== expectedRemotePlayer || myTurnRef.current || gameOverRef.current) return;
      processMove(data.col, data.playerNum);
    });

    connection.on('close', () => {
      if (connRef.current !== connection) return;
      connRef.current = null;
      handleDisconnect();
    });

    connection.on('error', () => {
      if (connRef.current !== connection) return;
      connRef.current = null;
      if (hasConnectedRef.current) {
        handleDisconnect();
      } else {
        clearConnectionTimeout();
        setConnecting(false);
        setStatusText('Impossibile aprire la connessione');
        setStatusError(true);
      }
    });
  };

  const startOutgoingConnection = (peer: Peer, rawCode: string) => {
    const code = normalizeCode(rawCode);
    setRemoteId(code);

    if (!isValidCode(code)) {
      setStatusText('Inserisci un codice valido di 4–6 caratteri');
      setStatusError(true);
      return;
    }

    clearConnectionTimeout();
    const previousConnection = connRef.current;
    connRef.current = null;
    previousConnection?.close();
    hasConnectedRef.current = false;
    isHostRef.current = false;
    setPlayer(2);
    setTurn(false);
    setConnecting(true);
    setStatusText('Connessione in corso…');
    setStatusError(false);

    const connection = peer.connect(`F4-${code}`, { reliable: true });
    bindConnectionEvents(connection);

    connectionTimeoutRef.current = window.setTimeout(() => {
      if (!hasConnectedRef.current && connRef.current === connection) {
        connRef.current = null;
        connection.close();
        setConnecting(false);
        setStatusText('Host non trovato. Controlla il codice e riprova.');
        setStatusError(true);
      }
    }, CONNECTION_TIMEOUT_MS);
  };

  useEffect(() => {
    const displayId = createHostCode();
    const peer = new Peer(`F4-${displayId}`);
    peerRef.current = peer;

    peer.on('open', () => {
      setPeerReady(true);
      setMyId(displayId);

      const initialJoinId = initialJoinIdRef.current;
      if (initialJoinId) {
        startOutgoingConnection(peer, initialJoinId);
      } else {
        setStatusText('In attesa di un giocatore…');
        setStatusError(false);
      }
    });

    peer.on('connection', connection => {
      if (connRef.current?.open) {
        connection.close();
        return;
      }

      clearConnectionTimeout();
      const previousConnection = connRef.current;
      connRef.current = null;
      previousConnection?.close();
      setConnecting(false);
      isHostRef.current = true;
      setPlayer(1);
      setTurn(true);
      bindConnectionEvents(connection);
    });

    peer.on('error', error => {
      clearConnectionTimeout();
      setConnecting(false);
      setStatusError(true);

      if (error.type === 'unavailable-id') {
        setStatusText('Codice host già in uso. Ricarica la pagina per generarne uno nuovo.');
      } else if (error.type === 'peer-unavailable') {
        setStatusText('Host non trovato. Controlla il codice e riprova.');
      } else {
        setStatusText('Errore di rete. Riprova tra qualche secondo.');
      }
    });

    return () => {
      hasConnectedRef.current = false;
      clearConnectionTimeout();
      const connection = connRef.current;
      connRef.current = null;
      connection?.close();
      peer.destroy();
    };
  }, []);

  const connectToPeer = () => {
    if (!peerRef.current || !peerReady || connecting) return;
    startOutgoingConnection(peerRef.current, remoteId);
  };

  const copyLink = async () => {
    if (!myId) return;
    const url = `${window.location.origin}${window.location.pathname}#/forza4?id=${myId}`;

    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = url;
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  const handleColumnSelection = (col: number) => {
    if (gameState !== 'playing' || !myTurn || myPlayerNum === 0 || !connRef.current?.open) return;
    if (boardRef.current[0][col] !== 0) return;

    const didMove = processMove(col, myPlayerNum);
    if (didMove) {
      connRef.current.send({ type: 'move', col, playerNum: myPlayerNum } satisfies PeerMessage);
    }
  };

  const handleBoardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!myTurn) return;
    const columnNumber = Number(event.key);
    if (Number.isInteger(columnNumber) && columnNumber >= 1 && columnNumber <= COLS) {
      event.preventDefault();
      handleColumnSelection(columnNumber - 1);
    }
  };

  const requestRestart = () => {
    if (!connRef.current?.open) {
      setStatusText('La connessione con l’avversario è interrotta');
      setStatusError(true);
      return;
    }

    connRef.current.send({ type: 'restart' } satisfies PeerMessage);
    executeRestart();
  };

  const exitToMenu = () => {
    hasConnectedRef.current = false;
    const connection = connRef.current;
    connRef.current = null;
    connection?.close();
    peerRef.current?.destroy();
    navigate('/');
  };

  const inviteUrl = myId ? `${window.location.origin}${window.location.pathname}#/forza4?id=${myId}` : '';

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center bg-slate-950 px-3 pb-safe pt-safe text-white sm:px-6">
      {gameState === 'setup' && (
        <Link
          to="/"
          aria-label="Torna al catalogo"
          className="absolute left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-slate-900/80 text-slate-300 shadow-lg backdrop-blur transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:left-6 sm:top-6"
        >
          <HomeIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
      )}

      <header className="mb-5 mt-16 shrink-0 text-center sm:mt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Multiplayer P2P</p>
        <h1 className="mt-2 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-4xl font-black tracking-[-0.04em] text-transparent sm:text-5xl">FORZA 4</h1>
        <div className={clsx('mt-2 text-xs font-bold', statusError ? 'text-red-400' : 'text-slate-500')} role="status" aria-live="polite">
          {statusText}
        </div>
      </header>

      {gameState === 'setup' && (
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center pb-8">
          {!initialJoinIdRef.current && (
            <section className="mb-4 flex w-full flex-col items-center rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl sm:p-6" aria-labelledby="host-code-heading">
              <span id="host-code-heading" className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Il tuo codice host</span>
              <h2 className="my-3 min-h-12 text-4xl font-black tracking-[0.16em] text-white sm:text-5xl">{myId || '••••••'}</h2>

              <div className="mb-5 flex h-[168px] w-[168px] items-center justify-center rounded-2xl bg-white p-3 shadow-inner">
                {inviteUrl ? <QRCodeSVG value={inviteUrl} size={144} fgColor="#0f172a" /> : <span className="text-xs font-bold text-slate-400">Generazione…</span>}
              </div>

              <button
                type="button"
                onClick={copyLink}
                disabled={!inviteUrl}
                className={clsx(
                  'flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-black transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40',
                  copied ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100' : 'border-white/[0.08] bg-white/[0.05] text-white hover:bg-white/[0.08]',
                )}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? 'Link copiato' : 'Copia link di invito'}
              </button>
            </section>
          )}

          {!initialJoinIdRef.current && (
            <div className="my-2 flex w-full items-center gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
              <span className="h-px flex-1 bg-white/[0.06]" />
              oppure partecipa
              <span className="h-px flex-1 bg-white/[0.06]" />
            </div>
          )}

          <section className="mt-3 w-full rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl sm:p-6" aria-labelledby="join-heading">
            <div className="flex flex-col gap-3">
              <label id="join-heading" htmlFor="room-code" className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                {initialJoinIdRef.current ? 'Codice dell’invito' : 'Codice host'}
              </label>
              <input
                id="room-code"
                type="text"
                value={remoteId}
                onChange={event => setRemoteId(normalizeCode(event.target.value))}
                onKeyDown={event => {
                  if (event.key === 'Enter') connectToPeer();
                }}
                placeholder="ES. A1B2C3"
                maxLength={6}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-center text-2xl font-black uppercase tracking-[0.14em] text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/15"
              />
              <button
                type="button"
                onClick={connectToPeer}
                disabled={!peerReady || connecting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-emerald-500/15 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-50"
              >
                <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                {connecting ? 'Connessione…' : initialJoinIdRef.current ? 'Riprova' : 'Partecipa'}
              </button>
            </div>
          </section>
        </main>
      )}

      {(gameState === 'playing' || gameState === 'end') && (
        <main className="flex w-full max-w-lg flex-col items-center pb-5">
          <div className="mb-5 flex items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.045] px-5 py-2.5 shadow-lg">
            <span
              className={clsx(
                'h-3.5 w-3.5 rounded-full shadow-inner transition',
                gameState === 'playing' && myTurn ? (myPlayerNum === 1 ? 'bg-red-500' : 'bg-yellow-400') : 'bg-slate-700',
              )}
              aria-hidden="true"
            />
            <span className="text-sm font-black uppercase tracking-wide text-slate-300">
              {gameState === 'end' ? 'Partita conclusa' : myTurn ? 'Tocca a te' : 'Turno avversario'}
            </span>
          </div>

          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Tocca una colonna · da tastiera premi 1–7</p>

          <div className="relative inline-block max-w-full">
            {gameState === 'end' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[1.25rem] bg-slate-950/75 p-4 backdrop-blur-sm">
                <h2
                  className={clsx(
                    'whitespace-pre-line text-center text-4xl font-black uppercase leading-none drop-shadow-lg sm:text-5xl',
                    winner === myPlayerNum ? 'text-emerald-300' : winner === 0 ? 'text-white' : 'text-red-400',
                  )}
                >
                  {winner === myPlayerNum ? 'HAI\nVINTO' : winner === 0 ? 'PAREGGIO' : winner === -1 ? 'AVVERSARIO\nUSCITO' : 'HAI\nPERSO'}
                </h2>
              </div>
            )}

            <div
              className="connect-four-board"
              role="grid"
              tabIndex={gameState === 'playing' ? 0 : -1}
              aria-label="Scacchiera Forza 4. Premi i tasti da 1 a 7 per scegliere una colonna."
              aria-disabled={!myTurn}
              onKeyDown={handleBoardKeyDown}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={clsx('connect-four-cell', gameState === 'playing' && myTurn && board[0][colIndex] === 0 && 'connect-four-cell-active')}
                    role="gridcell"
                    aria-label={`Riga ${rowIndex + 1}, colonna ${colIndex + 1}${cell === 0 ? ', vuota' : cell === 1 ? ', gettone rosso' : ', gettone giallo'}`}
                    onClick={() => handleColumnSelection(colIndex)}
                  >
                    {cell !== 0 && <div className={clsx('connect-four-token', cell === 1 ? 'connect-four-player-one' : 'connect-four-player-two')} aria-hidden="true" />}
                  </div>
                )),
              )}
            </div>
          </div>

          <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
            {gameState === 'end' && winner !== -1 && (
              <button
                type="button"
                onClick={requestRestart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-emerald-500/15 transition hover:brightness-110 active:scale-[0.99]"
              >
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
                Gioca ancora
              </button>
            )}

            <button
              type="button"
              onClick={exitToMenu}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wider text-slate-500 transition hover:bg-white/[0.06] hover:text-red-300"
            >
              <DoorOpen className="h-4 w-4" aria-hidden="true" />
              Esci dalla partita
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
