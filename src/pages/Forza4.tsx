import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Copy, DoorOpen, Globe2, Play, RotateCcw, Smartphone, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Peer, { type DataConnection } from 'peerjs';
import clsx from 'clsx';
import GameHomeButton from '../components/GameHomeButton';

const ROWS = 6;
const COLS = 7;
const CONNECTION_TIMEOUT_MS = 8_000;

type GameState = 'setup' | 'playing' | 'end';
type GameMode = 'online' | 'local';
type PlayerNumber = 0 | 1 | 2;
type CellPosition = { row: number; col: number };
type FallingToken = CellPosition & { player: 1 | 2; id: number };
type SessionScore = { red: number; yellow: number; draws: number };
type PeerMessage =
  | { type: 'move'; col: number; playerNum: 1 | 2 }
  | { type: 'restart-request' }
  | { type: 'restart-accept' }
  | { type: 'restart-decline' };

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

function getDropDuration(row: number) {
  return 300 + row * 48;
}

function isPeerMessage(data: unknown): data is PeerMessage {
  if (!data || typeof data !== 'object') return false;
  const message = data as { type?: unknown; col?: unknown; playerNum?: unknown };
  if (message.type === 'restart-request' || message.type === 'restart-accept' || message.type === 'restart-decline') return true;
  return message.type === 'move' && typeof message.col === 'number' && Number.isInteger(message.col) && message.col >= 0 && message.col < COLS && (message.playerNum === 1 || message.playerNum === 2);
}

function findWinningCells(board: number[][], row: number, col: number, player: number): CellPosition[] {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]] as const;
  for (const [rowDelta, colDelta] of directions) {
    const cells: CellPosition[] = [{ row, col }];
    for (const direction of [-1, 1] as const) {
      let step = 1;
      while (true) {
        const nextRow = row + rowDelta * step * direction;
        const nextCol = col + colDelta * step * direction;
        if (nextRow < 0 || nextRow >= ROWS || nextCol < 0 || nextCol >= COLS || board[nextRow][nextCol] !== player) break;
        cells.push({ row: nextRow, col: nextCol });
        step += 1;
      }
    }
    if (cells.length >= 4) return cells;
  }
  return [];
}

export default function Forza4() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJoinIdRef = useRef(searchParams.get('id'));

  const [mode, setMode] = useState<GameMode>('online');
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
  const [currentPlayer, setCurrentPlayerState] = useState<1 | 2>(1);
  const [myTurn, setMyTurn] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [winningCells, setWinningCells] = useState<CellPosition[]>([]);
  const [fallingToken, setFallingToken] = useState<FallingToken | null>(null);
  const [score, setScore] = useState<SessionScore>({ red: 0, yellow: 0, draws: 0 });
  const [restartRequested, setRestartRequested] = useState(false);
  const [incomingRestart, setIncomingRestart] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);
  const dropTimeoutRef = useRef<number | null>(null);
  const fallingTokenIdRef = useRef(0);
  const boardRef = useRef(board);
  const currentPlayerRef = useRef<1 | 2>(1);
  const myPlayerNumRef = useRef<PlayerNumber>(0);
  const myTurnRef = useRef(false);
  const gameOverRef = useRef(false);
  const hasConnectedRef = useRef(false);
  const roundStarterRef = useRef<1 | 2>(1);

  const clearConnectionTimeout = () => {
    if (connectionTimeoutRef.current !== null) {
      window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  };

  const clearDropAnimation = () => {
    if (dropTimeoutRef.current !== null) {
      window.clearTimeout(dropTimeoutRef.current);
      dropTimeoutRef.current = null;
    }
    setFallingToken(null);
  };

  const setTurn = (value: boolean) => {
    myTurnRef.current = value;
    setMyTurn(value);
  };

  const setPlayer = (value: PlayerNumber) => {
    myPlayerNumRef.current = value;
    setMyPlayerNum(value);
  };

  const setCurrentPlayer = (value: 1 | 2) => {
    currentPlayerRef.current = value;
    setCurrentPlayerState(value);
    if (mode === 'online') setTurn(myPlayerNumRef.current === value);
  };

  const evaluateDrawCondition = (currentBoard: number[][]) => currentBoard[0].every(cell => cell !== 0);

  const animateDrop = (row: number, col: number, player: 1 | 2) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      clearDropAnimation();
      return;
    }
    if (dropTimeoutRef.current !== null) window.clearTimeout(dropTimeoutRef.current);
    fallingTokenIdRef.current += 1;
    setFallingToken({ row, col, player, id: fallingTokenIdRef.current });
    dropTimeoutRef.current = window.setTimeout(() => {
      setFallingToken(null);
      dropTimeoutRef.current = null;
    }, getDropDuration(row) + 40);
  };

  const registerResult = (result: number) => {
    setScore(current => ({
      red: current.red + (result === 1 ? 1 : 0),
      yellow: current.yellow + (result === 2 ? 1 : 0),
      draws: current.draws + (result === 0 ? 1 : 0),
    }));
  };

  const processMove = (col: number, playerNum: 1 | 2) => {
    if (gameOverRef.current || playerNum !== currentPlayerRef.current || col < 0 || col >= COLS || boardRef.current[0][col] !== 0) return false;

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
    animateDrop(placedRow, col, playerNum);

    const winCells = findWinningCells(nextBoard, placedRow, col, playerNum);
    if (winCells.length >= 4) {
      gameOverRef.current = true;
      setWinningCells(winCells);
      setWinner(playerNum);
      registerResult(playerNum);
      setGameState('end');
      setTurn(false);
    } else if (evaluateDrawCondition(nextBoard)) {
      gameOverRef.current = true;
      setWinningCells([]);
      setWinner(0);
      registerResult(0);
      setGameState('end');
      setTurn(false);
    } else {
      setCurrentPlayer(playerNum === 1 ? 2 : 1);
    }
    return true;
  };

  const startRound = (starter: 1 | 2) => {
    clearDropAnimation();
    const emptyBoard = createEmptyBoard();
    roundStarterRef.current = starter;
    boardRef.current = emptyBoard;
    setBoard(emptyBoard);
    setWinningCells([]);
    setWinner(null);
    setRestartRequested(false);
    setIncomingRestart(false);
    gameOverRef.current = false;
    setGameState('playing');
    setStatusError(false);
    setCurrentPlayer(starter);
    setStatusText(mode === 'local' ? `Partita locale · parte ${starter === 1 ? 'Rosso' : 'Giallo'}` : `Nuovo round · parte ${starter === 1 ? 'Rosso' : 'Giallo'}`);
  };

  const startNextRound = () => startRound(roundStarterRef.current === 1 ? 2 : 1);

  const startLocalGame = () => {
    const connection = connRef.current;
    connRef.current = null;
    connection?.close();
    hasConnectedRef.current = false;
    setMode('local');
    setPlayer(0);
    setScore({ red: 0, yellow: 0, draws: 0 });
    roundStarterRef.current = 1;
    startRound(1);
  };

  const handleDisconnect = () => {
    clearConnectionTimeout();
    clearDropAnimation();
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
      setMode('online');
      setGameState('playing');
      setStatusText('Partita online · parte Rosso');
      setStatusError(false);
      setSearchParams({});
      setCurrentPlayer(1);
    });

    connection.on('data', data => {
      if (connRef.current !== connection || !isPeerMessage(data)) return;
      if (data.type === 'restart-request') {
        if (gameOverRef.current) setIncomingRestart(true);
        return;
      }
      if (data.type === 'restart-accept') {
        startNextRound();
        return;
      }
      if (data.type === 'restart-decline') {
        setRestartRequested(false);
        setStatusText('L’avversario ha rifiutato la rivincita');
        return;
      }

      const expectedRemotePlayer = myPlayerNumRef.current === 1 ? 2 : 1;
      if (data.playerNum !== expectedRemotePlayer || data.playerNum !== currentPlayerRef.current || myTurnRef.current || gameOverRef.current) return;
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
      if (hasConnectedRef.current) handleDisconnect();
      else {
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
    clearDropAnimation();
    const previousConnection = connRef.current;
    connRef.current = null;
    previousConnection?.close();
    hasConnectedRef.current = false;
    roundStarterRef.current = 1;
    setScore({ red: 0, yellow: 0, draws: 0 });
    setMode('online');
    setPlayer(2);
    setTurn(false);
    setCurrentPlayer(1);
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
      if (initialJoinId) startOutgoingConnection(peer, initialJoinId);
      else {
        setStatusText('Scegli online o partita locale');
        setStatusError(false);
      }
    });

    peer.on('connection', connection => {
      if (connRef.current?.open) {
        connection.close();
        return;
      }
      clearConnectionTimeout();
      clearDropAnimation();
      const previousConnection = connRef.current;
      connRef.current = null;
      previousConnection?.close();
      setConnecting(false);
      setMode('online');
      setScore({ red: 0, yellow: 0, draws: 0 });
      roundStarterRef.current = 1;
      setPlayer(1);
      setCurrentPlayer(1);
      bindConnectionEvents(connection);
    });

    peer.on('error', error => {
      clearConnectionTimeout();
      setConnecting(false);
      setStatusError(true);
      if (error.type === 'unavailable-id') setStatusText('Codice host già in uso. Ricarica la pagina per generarne uno nuovo.');
      else if (error.type === 'peer-unavailable') setStatusText('Host non trovato. Controlla il codice e riprova.');
      else setStatusText('Errore di rete. Riprova tra qualche secondo.');
    });

    return () => {
      hasConnectedRef.current = false;
      clearConnectionTimeout();
      if (dropTimeoutRef.current !== null) window.clearTimeout(dropTimeoutRef.current);
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
    if (gameState !== 'playing' || boardRef.current[0][col] !== 0) return;
    if (mode === 'local') {
      processMove(col, currentPlayerRef.current);
      return;
    }
    if (!myTurn || myPlayerNum === 0 || !connRef.current?.open || currentPlayerRef.current !== myPlayerNum) return;
    const didMove = processMove(col, myPlayerNum);
    if (didMove) connRef.current.send({ type: 'move', col, playerNum: myPlayerNum } satisfies PeerMessage);
  };

  const handleBoardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const columnNumber = Number(event.key);
    if (Number.isInteger(columnNumber) && columnNumber >= 1 && columnNumber <= COLS) {
      event.preventDefault();
      handleColumnSelection(columnNumber - 1);
    }
  };

  const requestRestart = () => {
    if (mode === 'local') {
      startNextRound();
      return;
    }
    if (!connRef.current?.open) {
      setStatusText('La connessione con l’avversario è interrotta');
      setStatusError(true);
      return;
    }
    setRestartRequested(true);
    setStatusText('Richiesta di rivincita inviata…');
    connRef.current.send({ type: 'restart-request' } satisfies PeerMessage);
  };

  const acceptRestart = () => {
    if (!connRef.current?.open) return;
    connRef.current.send({ type: 'restart-accept' } satisfies PeerMessage);
    startNextRound();
  };

  const declineRestart = () => {
    setIncomingRestart(false);
    connRef.current?.send({ type: 'restart-decline' } satisfies PeerMessage);
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
  const playerLabel = myPlayerNum === 1 ? 'Rosso' : myPlayerNum === 2 ? 'Giallo' : '';
  const canPlay = mode === 'local' || myTurn;
  const endTitle = mode === 'local'
    ? winner === 1 ? 'ROSSO\nVINCE' : winner === 2 ? 'GIALLO\nVINCE' : 'PAREGGIO'
    : winner === myPlayerNum ? 'HAI\nVINTO' : winner === 0 ? 'PAREGGIO' : winner === -1 ? 'AVVERSARIO\nUSCITO' : 'HAI\nPERSO';

  return (
    <div className="game-screen flex w-full flex-col items-center bg-slate-950 px-3 pb-safe pt-safe text-white sm:px-6">
      {gameState === 'setup' && <GameHomeButton tone="blue" />}

      <header className="game-compact-header mb-5 mt-16 shrink-0 text-center sm:mt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Online P2P · oppure sullo stesso telefono</p>
        <h1 className="mt-2 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-4xl font-black tracking-[-0.04em] text-transparent sm:text-5xl">FORZA 4</h1>
        <div className={clsx('mt-2 text-xs font-bold', statusError ? 'text-red-400' : 'text-slate-500')} role="status" aria-live="polite">{statusText}</div>
      </header>

      {gameState === 'setup' && (
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center pb-8">
          {!initialJoinIdRef.current && (
            <div className="mb-4 grid w-full grid-cols-2 gap-3">
              <button type="button" onClick={() => { setMode('online'); setStatusText('Condividi il codice o entra in una partita'); }} className={clsx('rounded-2xl border p-4 text-left transition', mode === 'online' ? 'border-blue-400/40 bg-blue-500/10' : 'border-white/[0.07] bg-white/[0.035]')}>
                <Globe2 className="mb-3 h-6 w-6 text-blue-300" aria-hidden="true" /><p className="text-sm font-black">Online</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Due telefoni, codice o link.</p>
              </button>
              <button type="button" onClick={() => { setMode('local'); setStatusText('Pronto per una partita sullo stesso telefono'); }} className={clsx('rounded-2xl border p-4 text-left transition', mode === 'local' ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/[0.07] bg-white/[0.035]')}>
                <Smartphone className="mb-3 h-6 w-6 text-violet-300" aria-hidden="true" /><p className="text-sm font-black">Sul telefono</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Passa il telefono a ogni turno.</p>
              </button>
            </div>
          )}

          {mode === 'local' && !initialJoinIdRef.current ? (
            <section className="w-full rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-5 text-center shadow-2xl sm:p-6">
              <Users className="mx-auto h-9 w-9 text-violet-300" aria-hidden="true" />
              <h2 className="mt-3 text-xl font-black">Partita locale</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Rosso e Giallo giocano sullo stesso schermo. Il primo turno si alterna a ogni rivincita.</p>
              <button type="button" onClick={startLocalGame} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-4 text-base font-black uppercase tracking-wide text-white"><Play className="h-5 w-5 fill-current" aria-hidden="true" /> Inizia locale</button>
            </section>
          ) : (
            <>
              {!initialJoinIdRef.current && (
                <section className="mb-4 flex w-full flex-col items-center rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl sm:p-6" aria-labelledby="host-code-heading">
                  <span id="host-code-heading" className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Il tuo codice host</span>
                  <h2 className="my-3 min-h-12 text-4xl font-black tracking-[0.16em] text-white sm:text-5xl">{myId || '••••••'}</h2>
                  <div className="mb-5 flex h-[168px] w-[168px] items-center justify-center rounded-2xl bg-white p-3 shadow-inner">{inviteUrl ? <QRCodeSVG value={inviteUrl} size={144} fgColor="#0f172a" /> : <span className="text-xs font-bold text-slate-400">Generazione…</span>}</div>
                  <button type="button" onClick={copyLink} disabled={!inviteUrl} className={clsx('flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-black transition disabled:opacity-40', copied ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100' : 'border-white/[0.08] bg-white/[0.05] text-white')}>
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? 'Link copiato' : 'Copia link di invito'}
                  </button>
                </section>
              )}

              <section className="w-full rounded-[2rem] border border-white/[0.08] bg-slate-900/70 p-5 shadow-2xl sm:p-6" aria-labelledby="join-heading">
                <label id="join-heading" htmlFor="room-code" className="block text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{initialJoinIdRef.current ? 'Codice dell’invito' : 'Oppure inserisci un codice host'}</label>
                <input id="room-code" type="text" value={remoteId} onChange={event => setRemoteId(normalizeCode(event.target.value))} onKeyDown={event => { if (event.key === 'Enter') connectToPeer(); }} placeholder="ES. A1B2C3" maxLength={6} autoCapitalize="characters" autoComplete="off" spellCheck={false} className="mt-3 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-center text-2xl font-black uppercase tracking-[0.14em] text-white outline-none placeholder:text-slate-700 focus:border-blue-400/50" />
                <button type="button" onClick={connectToPeer} disabled={!peerReady || connecting} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4 text-base font-black uppercase tracking-wide text-white disabled:opacity-50"><Play className="h-5 w-5 fill-current" aria-hidden="true" />{connecting ? 'Connessione…' : initialJoinIdRef.current ? 'Riprova' : 'Partecipa'}</button>
              </section>
            </>
          )}
        </main>
      )}

      {(gameState === 'playing' || gameState === 'end') && (
        <main className="flex w-full max-w-lg flex-col items-center pb-5">
          <div className="mb-3 grid w-full max-w-sm grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-red-400/10 bg-red-500/[0.06] px-3 py-2"><p className="text-[9px] font-black uppercase text-red-300">Rosso</p><p className="text-xl font-black">{score.red}</p></div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"><p className="text-[9px] font-black uppercase text-slate-500">Pari</p><p className="text-xl font-black">{score.draws}</p></div>
            <div className="rounded-xl border border-yellow-400/10 bg-yellow-500/[0.06] px-3 py-2"><p className="text-[9px] font-black uppercase text-yellow-300">Giallo</p><p className="text-xl font-black">{score.yellow}</p></div>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.045] px-4 py-2.5 shadow-lg">
              <span className={clsx('h-3.5 w-3.5 rounded-full', currentPlayer === 1 ? 'bg-red-500' : 'bg-yellow-400')} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-wide text-slate-300 sm:text-sm">{gameState === 'end' ? 'Round concluso' : mode === 'local' ? `Tocca a ${currentPlayer === 1 ? 'Rosso' : 'Giallo'}` : myTurn ? 'Tocca a te' : 'Turno avversario'}</span>
            </div>
            {mode === 'online' && playerLabel && <div className="rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Tu: <span className="text-slate-300">{playerLabel}</span></div>}
          </div>

          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Tocca una colonna · tastiera 1–7</p>

          <div className="relative inline-block max-w-full">
            {gameState === 'end' && !fallingToken && <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.25rem] bg-slate-950/75 p-4 backdrop-blur-sm"><h2 className={clsx('whitespace-pre-line text-center text-4xl font-black uppercase leading-none drop-shadow-lg sm:text-5xl', winner === 0 ? 'text-white' : mode === 'local' ? (winner === 1 ? 'text-red-300' : 'text-yellow-300') : winner === myPlayerNum ? 'text-emerald-300' : 'text-red-400')}>{endTitle}</h2></div>}

            <div className="connect-four-board" role="grid" tabIndex={gameState === 'playing' ? 0 : -1} aria-label="Scacchiera Forza 4. Premi i tasti da 1 a 7 per scegliere una colonna." aria-disabled={!canPlay} onKeyDown={handleBoardKeyDown}>
              {fallingToken && <div key={fallingToken.id} className="connect-four-falling-slot" style={{ '--drop-col': fallingToken.col, '--drop-row': fallingToken.row, '--drop-duration': `${getDropDuration(fallingToken.row)}ms` } as CSSProperties} aria-hidden="true"><div className={clsx('connect-four-token', fallingToken.player === 1 ? 'connect-four-player-one' : 'connect-four-player-two')} /></div>}
              {board.map((row, rowIndex) => row.map((cell, colIndex) => {
                const isFallingDestination = fallingToken?.row === rowIndex && fallingToken.col === colIndex;
                const isWinning = winningCells.some(position => position.row === rowIndex && position.col === colIndex);
                return <div key={`${rowIndex}-${colIndex}`} className={clsx('connect-four-cell', gameState === 'playing' && canPlay && board[0][colIndex] === 0 && 'connect-four-cell-active', isWinning && 'connect-four-cell-winning')} role="gridcell" aria-label={`Riga ${rowIndex + 1}, colonna ${colIndex + 1}${cell === 0 ? ', vuota' : cell === 1 ? ', gettone rosso' : ', gettone giallo'}`} onClick={() => handleColumnSelection(colIndex)}>{cell !== 0 && !isFallingDestination && <div className={clsx('connect-four-token', cell === 1 ? 'connect-four-player-one' : 'connect-four-player-two')} aria-hidden="true" />}</div>;
              }))}
            </div>
          </div>

          {incomingRestart && (
            <div className="mt-5 w-full max-w-sm rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4 text-center">
              <p className="text-sm font-black text-white">L’avversario chiede la rivincita</p><p className="mt-1 text-xs text-slate-400">Il primo giocatore cambierà rispetto al round precedente.</p>
              <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={declineRestart} className="rounded-xl border border-white/[0.08] py-3 text-xs font-black text-slate-400">Rifiuta</button><button type="button" onClick={acceptRestart} className="rounded-xl bg-emerald-500 py-3 text-xs font-black text-white">Accetta</button></div>
            </div>
          )}

          <div className="mt-5 flex w-full max-w-xs flex-col gap-3">
            {gameState === 'end' && winner !== -1 && !incomingRestart && <button type="button" onClick={requestRestart} disabled={restartRequested} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-base font-black uppercase tracking-wide text-white disabled:opacity-50"><RotateCcw className="h-5 w-5" aria-hidden="true" />{mode === 'online' && restartRequested ? 'In attesa…' : 'Gioca ancora'}</button>}
            <button type="button" onClick={exitToMenu} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wider text-slate-500"><DoorOpen className="h-4 w-4" aria-hidden="true" /> Esci dalla partita</button>
          </div>
        </main>
      )}
    </div>
  );
}
