import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Copy, DoorOpen, Globe2, Play, RefreshCw, RotateCcw, Smartphone, Users, Wifi, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Peer, { type DataConnection } from 'peerjs';
import clsx from 'clsx';
import GameHomeButton from '../components/GameHomeButton';
import {
  createEmptyBoard,
  dropToken,
  findWinningCells,
  isBoardFull,
  type CellPosition,
  type Forza4Player,
} from '../games/forza4/gameLogic';
import {
  createHostCode,
  isPeerMessage,
  isValidCode,
  normalizeCode,
  type PeerMessage,
  type SessionScore,
  type SyncPayload,
} from '../games/forza4/protocol';

const CONNECTION_TIMEOUT_MS = 8_000;
const RECONNECT_GRACE_MS = 12_000;
const RECONNECT_RETRY_MS = 1_400;

type GameState = 'setup' | 'playing' | 'end';
type GameMode = 'online' | 'local';
type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'lost';
type PlayerNumber = 0 | 1 | 2;
type ActivePlayer = Forza4Player;
type FallingToken = CellPosition & { player: ActivePlayer; id: number };
function getDropDuration(row: number) {
  return 300 + row * 48;
}

export default function Forza4() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJoinIdRef = useRef(searchParams.get('id'));

  const [mode, setMode] = useState<GameMode>('online');
  const [gameState, setGameState] = useState<GameState>('setup');
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [statusText, setStatusText] = useState('Connessione ai server…');
  const [statusError, setStatusError] = useState(false);
  const [peerReady, setPeerReady] = useState(false);
  const [myId, setMyId] = useState('');
  const [remoteId, setRemoteId] = useState(() => normalizeCode(initialJoinIdRef.current ?? ''));
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState<number[][]>(createEmptyBoard);
  const [myPlayerNum, setMyPlayerNum] = useState<PlayerNumber>(0);
  const [currentPlayer, setCurrentPlayerState] = useState<ActivePlayer>(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [winningCells, setWinningCells] = useState<CellPosition[]>([]);
  const [fallingToken, setFallingToken] = useState<FallingToken | null>(null);
  const [score, setScore] = useState<SessionScore>({ red: 0, yellow: 0, draws: 0 });
  const [roundNumber, setRoundNumber] = useState(1);
  const [restartRequested, setRestartRequested] = useState(false);
  const [incomingRestart, setIncomingRestart] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const peerReadyRef = useRef(false);
  const connRef = useRef<DataConnection | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);
  const reconnectExpiryRef = useRef<number | null>(null);
  const reconnectRetryRef = useRef<number | null>(null);
  const reconnectDeadlineRef = useRef(0);
  const dropTimeoutRef = useRef<number | null>(null);
  const fallingTokenIdRef = useRef(0);
  const boardRef = useRef(board);
  const currentPlayerRef = useRef<ActivePlayer>(1);
  const myPlayerNumRef = useRef<PlayerNumber>(0);
  const gameOverRef = useRef(false);
  const roundStarterRef = useRef<ActivePlayer>(1);
  const scoreRef = useRef<SessionScore>({ red: 0, yellow: 0, draws: 0 });
  const roundNumberRef = useRef(1);
  const gameStateRef = useRef<GameState>('setup');
  const winnerRef = useRef<number | null>(null);
  const winningCellsRef = useRef<CellPosition[]>([]);
  const modeRef = useRef<GameMode>('online');
  const connectionStateRef = useRef<ConnectionState>('idle');
  const remoteIdRef = useRef(remoteId);
  const isHostRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const intentionalDisconnectRef = useRef(false);

  const updateMode = (value: GameMode) => {
    modeRef.current = value;
    setMode(value);
  };

  const updateGameState = (value: GameState) => {
    gameStateRef.current = value;
    setGameState(value);
  };

  const updateConnectionState = (value: ConnectionState) => {
    connectionStateRef.current = value;
    setConnectionState(value);
  };

  const setPlayer = (value: PlayerNumber) => {
    myPlayerNumRef.current = value;
    setMyPlayerNum(value);
  };

  const setCurrentPlayer = (value: ActivePlayer) => {
    currentPlayerRef.current = value;
    setCurrentPlayerState(value);
  };

  const updateScore = (value: SessionScore) => {
    scoreRef.current = value;
    setScore(value);
  };

  const clearConnectionTimeout = () => {
    if (connectionTimeoutRef.current !== null) window.clearTimeout(connectionTimeoutRef.current);
    connectionTimeoutRef.current = null;
  };

  const clearReconnectTimers = () => {
    if (reconnectExpiryRef.current !== null) window.clearTimeout(reconnectExpiryRef.current);
    if (reconnectRetryRef.current !== null) window.clearTimeout(reconnectRetryRef.current);
    reconnectExpiryRef.current = null;
    reconnectRetryRef.current = null;
    reconnectDeadlineRef.current = 0;
  };

  const clearDropAnimation = () => {
    if (dropTimeoutRef.current !== null) window.clearTimeout(dropTimeoutRef.current);
    dropTimeoutRef.current = null;
    setFallingToken(null);
  };

  const animateDrop = (row: number, col: number, player: ActivePlayer) => {
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
    const current = scoreRef.current;
    const next = {
      red: current.red + (result === 1 ? 1 : 0),
      yellow: current.yellow + (result === 2 ? 1 : 0),
      draws: current.draws + (result === 0 ? 1 : 0),
    };
    updateScore(next);
  };

  const processMove = (col: number, playerNum: ActivePlayer) => {
    if (gameOverRef.current || playerNum !== currentPlayerRef.current || col < 0 || col >= COLS || boardRef.current[0][col] !== 0) return false;

    const dropped = dropToken(boardRef.current, col, playerNum);
    if (!dropped) return false;
    const { board: nextBoard, row: placedRow } = dropped;

    boardRef.current = nextBoard;
    setBoard(nextBoard);
    animateDrop(placedRow, col, playerNum);

    const winCells = findWinningCells(nextBoard, placedRow, col, playerNum);
    if (winCells.length >= 4) {
      gameOverRef.current = true;
      winnerRef.current = playerNum;
      winningCellsRef.current = winCells;
      setWinner(playerNum);
      setWinningCells(winCells);
      registerResult(playerNum);
      updateGameState('end');
    } else if (isBoardFull(nextBoard)) {
      gameOverRef.current = true;
      winnerRef.current = 0;
      winningCellsRef.current = [];
      setWinner(0);
      setWinningCells([]);
      registerResult(0);
      updateGameState('end');
    } else {
      setCurrentPlayer(playerNum === 1 ? 2 : 1);
    }
    return true;
  };

  const startRound = (starter: ActivePlayer, nextRoundNumber: number) => {
    clearDropAnimation();
    const emptyBoard = createEmptyBoard();
    roundStarterRef.current = starter;
    boardRef.current = emptyBoard;
    setBoard(emptyBoard);
    winnerRef.current = null;
    winningCellsRef.current = [];
    setWinner(null);
    setWinningCells([]);
    setRestartRequested(false);
    setIncomingRestart(false);
    gameOverRef.current = false;
    roundNumberRef.current = nextRoundNumber;
    setRoundNumber(nextRoundNumber);
    setCurrentPlayer(starter);
    updateGameState('playing');
    setStatusError(false);
    setStatusText(`${modeRef.current === 'local' ? 'Partita locale' : 'Nuovo round'} · parte ${starter === 1 ? 'Rosso' : 'Giallo'}`);
  };

  const startNextRound = () => startRound(roundStarterRef.current === 1 ? 2 : 1, roundNumberRef.current + 1);

  const resetSession = (nextMode: GameMode) => {
    updateMode(nextMode);
    updateScore({ red: 0, yellow: 0, draws: 0 });
    roundStarterRef.current = 1;
    roundNumberRef.current = 1;
    setRoundNumber(1);
    const emptyBoard = createEmptyBoard();
    boardRef.current = emptyBoard;
    setBoard(emptyBoard);
    winnerRef.current = null;
    winningCellsRef.current = [];
    setWinner(null);
    setWinningCells([]);
    setRestartRequested(false);
    setIncomingRestart(false);
    gameOverRef.current = false;
    setCurrentPlayer(1);
  };

  const buildSyncPayload = (): SyncPayload => ({
    board: boardRef.current.map(row => [...row]),
    currentPlayer: currentPlayerRef.current,
    starter: roundStarterRef.current,
    score: { ...scoreRef.current },
    roundNumber: roundNumberRef.current,
    gameState: gameStateRef.current === 'end' ? 'end' : 'playing',
    winner: winnerRef.current,
    winningCells: [...winningCellsRef.current],
  });

  const applySync = (payload: SyncPayload) => {
    clearDropAnimation();
    boardRef.current = payload.board.map(row => [...row]);
    setBoard(boardRef.current);
    roundStarterRef.current = payload.starter;
    setCurrentPlayer(payload.currentPlayer);
    updateScore({ ...payload.score });
    roundNumberRef.current = payload.roundNumber;
    setRoundNumber(payload.roundNumber);
    winnerRef.current = payload.winner;
    winningCellsRef.current = [...payload.winningCells];
    setWinner(payload.winner);
    setWinningCells([...payload.winningCells]);
    gameOverRef.current = payload.gameState === 'end';
    setRestartRequested(false);
    setIncomingRestart(false);
    updateGameState(payload.gameState);
  };

  const sendSync = () => {
    if (isHostRef.current && connRef.current?.open) {
      connRef.current.send({ type: 'sync', payload: buildSyncPayload() } satisfies PeerMessage);
    }
  };

  const expireReconnect = () => {
    clearReconnectTimers();
    connRef.current = null;
    updateConnectionState('lost');
    setStatusError(true);
    setStatusText('Connessione non ripristinata. La partita resta salvata su questo dispositivo.');
  };

  const scheduleGuestReconnect = (delay = RECONNECT_RETRY_MS) => {
    if (isHostRef.current || modeRef.current !== 'online' || connectionStateRef.current !== 'reconnecting') return;
    if (Date.now() >= reconnectDeadlineRef.current) {
      expireReconnect();
      return;
    }
    if (reconnectRetryRef.current !== null) window.clearTimeout(reconnectRetryRef.current);
    reconnectRetryRef.current = window.setTimeout(() => {
      reconnectRetryRef.current = null;
      const peer = peerRef.current;
      const code = remoteIdRef.current;
      if (!peer || !peerReadyRef.current || !isValidCode(code) || connectionStateRef.current !== 'reconnecting') return;
      const connection = peer.connect(`F4-${code}`, { reliable: true });
      bindConnectionEvents(connection, true);
    }, delay);
  };

  const beginReconnect = () => {
    if (intentionalDisconnectRef.current || modeRef.current !== 'online' || !sessionStartedRef.current) return;
    if (connectionStateRef.current !== 'reconnecting') {
      reconnectDeadlineRef.current = Date.now() + RECONNECT_GRACE_MS;
      updateConnectionState('reconnecting');
      setStatusError(false);
      setStatusText(isHostRef.current ? 'Connessione interrotta · attendo il rientro dell’avversario…' : 'Connessione interrotta · provo a rientrare…');
      reconnectExpiryRef.current = window.setTimeout(expireReconnect, RECONNECT_GRACE_MS);
    }
    if (!isHostRef.current) scheduleGuestReconnect(200);
  };

  const handleConnectionFailure = (connection: DataConnection, reconnectAttempt: boolean) => {
    if (connRef.current !== connection) return;
    connRef.current = null;
    if (intentionalDisconnectRef.current) return;
    if (sessionStartedRef.current) {
      beginReconnect();
      if (reconnectAttempt && !isHostRef.current) scheduleGuestReconnect();
      return;
    }
    clearConnectionTimeout();
    updateConnectionState('idle');
    setStatusText('Impossibile aprire la connessione');
    setStatusError(true);
  };

  function bindConnectionEvents(connection: DataConnection, reconnectAttempt = false) {
    connRef.current = connection;

    connection.on('open', () => {
      if (connRef.current !== connection) return;
      clearConnectionTimeout();
      const wasExistingSession = reconnectAttempt || sessionStartedRef.current || connectionStateRef.current === 'reconnecting';
      clearReconnectTimers();
      sessionStartedRef.current = true;
      updateMode('online');
      updateConnectionState('connected');
      setStatusError(false);
      setStatusText(wasExistingSession ? 'Riconnesso · partita sincronizzata' : 'Partita online · parte Rosso');
      setSearchParams({});
      if (!wasExistingSession) updateGameState('playing');
      if (isHostRef.current) window.setTimeout(sendSync, 80);
    });

    connection.on('data', data => {
      if (connRef.current !== connection || !isPeerMessage(data)) return;

      if (data.type === 'sync') {
        if (!isHostRef.current) applySync(data.payload);
        return;
      }
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
      if (data.playerNum !== expectedRemotePlayer || data.playerNum !== currentPlayerRef.current || gameOverRef.current) return;
      processMove(data.col, data.playerNum);
    });

    connection.on('close', () => handleConnectionFailure(connection, reconnectAttempt));
    connection.on('error', () => handleConnectionFailure(connection, reconnectAttempt));
  }

  const startOutgoingConnection = (peer: Peer, rawCode: string, reconnectAttempt = false) => {
    const code = normalizeCode(rawCode);
    setRemoteId(code);
    remoteIdRef.current = code;
    if (!isValidCode(code)) {
      setStatusText('Inserisci un codice valido di 4–6 caratteri');
      setStatusError(true);
      return;
    }

    clearConnectionTimeout();
    intentionalDisconnectRef.current = false;
    isHostRef.current = false;

    if (!reconnectAttempt) {
      clearReconnectTimers();
      resetSession('online');
      sessionStartedRef.current = false;
      setPlayer(2);
      updateConnectionState('connecting');
      setStatusText('Connessione in corso…');
      setStatusError(false);
    }

    const previousConnection = connRef.current;
    connRef.current = null;
    previousConnection?.close();
    const connection = peer.connect(`F4-${code}`, { reliable: true });
    bindConnectionEvents(connection, reconnectAttempt);

    if (!reconnectAttempt) {
      connectionTimeoutRef.current = window.setTimeout(() => {
        if (!sessionStartedRef.current && connRef.current === connection) {
          connRef.current = null;
          connection.close();
          updateConnectionState('idle');
          setStatusText('Host non trovato. Controlla il codice e riprova.');
          setStatusError(true);
        }
      }, CONNECTION_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    const displayId = createHostCode();
    const peer = new Peer(`F4-${displayId}`);
    peerRef.current = peer;

    peer.on('open', () => {
      peerReadyRef.current = true;
      setPeerReady(true);
      setMyId(displayId);
      const initialJoinId = initialJoinIdRef.current;
      if (initialJoinId) startOutgoingConnection(peer, initialJoinId);
      else {
        updateConnectionState('idle');
        setStatusText('Scegli online o partita locale');
        setStatusError(false);
      }
    });

    peer.on('connection', connection => {
      if (modeRef.current === 'local' || (connRef.current?.open && connectionStateRef.current !== 'reconnecting')) {
        connection.close();
        return;
      }

      clearConnectionTimeout();
      const reconnecting = sessionStartedRef.current && (connectionStateRef.current === 'reconnecting' || connectionStateRef.current === 'lost');
      const previousConnection = connRef.current;
      connRef.current = null;
      previousConnection?.close();
      intentionalDisconnectRef.current = false;
      isHostRef.current = true;

      if (!reconnecting) {
        resetSession('online');
        sessionStartedRef.current = false;
        setPlayer(1);
        updateConnectionState('connecting');
        setStatusText('Giocatore trovato · connessione…');
      } else {
        updateConnectionState('reconnecting');
      }

      bindConnectionEvents(connection, reconnecting);
    });

    peer.on('error', error => {
      if (connectionStateRef.current === 'reconnecting' && error.type === 'peer-unavailable') {
        scheduleGuestReconnect();
        return;
      }
      if (sessionStartedRef.current && !intentionalDisconnectRef.current) {
        beginReconnect();
        return;
      }
      clearConnectionTimeout();
      updateConnectionState('idle');
      setStatusError(true);
      if (error.type === 'unavailable-id') setStatusText('Codice host già in uso. Ricarica la pagina per generarne uno nuovo.');
      else if (error.type === 'peer-unavailable') setStatusText('Host non trovato. Controlla il codice e riprova.');
      else setStatusText('Errore di rete. Riprova tra qualche secondo.');
    });

    return () => {
      peerReadyRef.current = false;
      intentionalDisconnectRef.current = true;
      sessionStartedRef.current = false;
      clearConnectionTimeout();
      clearReconnectTimers();
      if (dropTimeoutRef.current !== null) window.clearTimeout(dropTimeoutRef.current);
      const connection = connRef.current;
      connRef.current = null;
      connection?.close();
      peer.destroy();
    };
  }, []);

  const connectToPeer = () => {
    if (!peerRef.current || !peerReady || connectionState === 'connecting') return;
    startOutgoingConnection(peerRef.current, remoteId);
  };

  const startLocalGame = () => {
    intentionalDisconnectRef.current = true;
    sessionStartedRef.current = false;
    clearConnectionTimeout();
    clearReconnectTimers();
    const connection = connRef.current;
    connRef.current = null;
    connection?.close();
    resetSession('local');
    setPlayer(0);
    updateConnectionState('idle');
    startRound(1, 1);
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
    if (gameStateRef.current !== 'playing' || boardRef.current[0][col] !== 0) return;
    const player = currentPlayerRef.current;
    if (modeRef.current === 'local') {
      processMove(col, player);
      return;
    }
    if (connectionStateRef.current !== 'connected' || myPlayerNumRef.current !== player || !connRef.current?.open) return;
    if (processMove(col, player)) connRef.current.send({ type: 'move', col, playerNum: player } satisfies PeerMessage);
  };

  const handleBoardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const columnNumber = Number(event.key);
    if (Number.isInteger(columnNumber) && columnNumber >= 1 && columnNumber <= COLS) {
      event.preventDefault();
      handleColumnSelection(columnNumber - 1);
    }
  };

  const requestRestart = () => {
    if (modeRef.current === 'local') {
      startNextRound();
      return;
    }
    if (!connRef.current?.open || connectionStateRef.current !== 'connected') {
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

  const retryConnection = () => {
    if (modeRef.current !== 'online' || !sessionStartedRef.current) return;
    clearReconnectTimers();
    reconnectDeadlineRef.current = Date.now() + RECONNECT_GRACE_MS;
    updateConnectionState('reconnecting');
    setStatusError(false);
    setStatusText(isHostRef.current ? 'Attendo il rientro dell’avversario…' : 'Provo a riconnettermi…');
    reconnectExpiryRef.current = window.setTimeout(expireReconnect, RECONNECT_GRACE_MS);
    if (!isHostRef.current) scheduleGuestReconnect(100);
  };

  const exitToMenu = () => {
    intentionalDisconnectRef.current = true;
    sessionStartedRef.current = false;
    clearReconnectTimers();
    clearConnectionTimeout();
    const connection = connRef.current;
    connRef.current = null;
    connection?.close();
    peerRef.current?.destroy();
    navigate('/');
  };

  const inviteUrl = myId ? `${window.location.origin}${window.location.pathname}#/forza4?id=${myId}` : '';
  const playerLabel = myPlayerNum === 1 ? 'Rosso' : myPlayerNum === 2 ? 'Giallo' : '';
  const myTurn = mode === 'online' && connectionState === 'connected' && myPlayerNum === currentPlayer;
  const canPlay = mode === 'local' || myTurn;
  const endTitle = mode === 'local'
    ? winner === 1 ? 'ROSSO\nVINCE' : winner === 2 ? 'GIALLO\nVINCE' : 'PAREGGIO'
    : winner === myPlayerNum ? 'HAI\nVINTO' : winner === 0 ? 'PAREGGIO' : 'HAI\nPERSO';

  return (
    <div className="game-screen flex w-full flex-col items-center bg-slate-950 px-3 pb-safe pt-safe text-white sm:px-6">
      {gameState === 'setup' && <GameHomeButton tone="blue" />}

      <header className="game-compact-header mb-5 mt-16 shrink-0 text-center sm:mt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Online P2P · oppure sullo stesso telefono</p>
        <h1 className="mt-2 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-4xl font-black tracking-[-0.04em] text-transparent sm:text-5xl">FORZA 4</h1>
        <div className={clsx('mt-2 text-xs font-bold', statusError ? 'text-red-400' : connectionState === 'reconnecting' ? 'text-amber-300' : 'text-slate-500')} role="status" aria-live="polite">{statusText}</div>
      </header>

      {gameState === 'setup' && (
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center pb-8">
          {!initialJoinIdRef.current && (
            <div className="mb-4 grid w-full grid-cols-2 gap-3">
              <button type="button" onClick={() => { updateMode('online'); setStatusText('Condividi il codice o entra in una partita'); }} className={clsx('rounded-2xl border p-4 text-left transition', mode === 'online' ? 'border-blue-400/40 bg-blue-500/10' : 'border-white/[0.07] bg-white/[0.035]')}>
                <Globe2 className="mb-3 h-6 w-6 text-blue-300" aria-hidden="true" /><p className="text-sm font-black">Online</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Due telefoni, codice o link.</p>
              </button>
              <button type="button" onClick={() => { updateMode('local'); setStatusText('Pronto per una partita sullo stesso telefono'); }} className={clsx('rounded-2xl border p-4 text-left transition', mode === 'local' ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/[0.07] bg-white/[0.035]')}>
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
                <input id="room-code" type="text" value={remoteId} onChange={event => { const code = normalizeCode(event.target.value); setRemoteId(code); remoteIdRef.current = code; }} onKeyDown={event => { if (event.key === 'Enter') connectToPeer(); }} placeholder="ES. A1B2C3" maxLength={6} autoCapitalize="characters" autoComplete="off" spellCheck={false} className="mt-3 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-center text-2xl font-black uppercase tracking-[0.14em] text-white outline-none placeholder:text-slate-700 focus:border-blue-400/50" />
                <button type="button" onClick={connectToPeer} disabled={!peerReady || connectionState === 'connecting'} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4 text-base font-black uppercase tracking-wide text-white disabled:opacity-50"><Play className="h-5 w-5 fill-current" aria-hidden="true" />{connectionState === 'connecting' ? 'Connessione…' : initialJoinIdRef.current ? 'Riprova' : 'Partecipa'}</button>
              </section>
            </>
          )}
        </main>
      )}

      {(gameState === 'playing' || gameState === 'end') && (
        <main className="flex w-full max-w-lg flex-col items-center pb-5">
          <div className="mb-3 grid w-full max-w-sm grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
            <div className="rounded-xl border border-red-400/10 bg-red-500/[0.06] px-3 py-2"><p className="text-[9px] font-black uppercase text-red-300">Rosso</p><p className="text-xl font-black">{score.red}</p></div>
            <span className="text-[9px] font-black text-slate-700">·</span>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"><p className="text-[9px] font-black uppercase text-slate-500">Pari</p><p className="text-xl font-black">{score.draws}</p></div>
            <span className="text-[9px] font-black text-slate-700">·</span>
            <div className="rounded-xl border border-yellow-400/10 bg-yellow-500/[0.06] px-3 py-2"><p className="text-[9px] font-black uppercase text-yellow-300">Giallo</p><p className="text-xl font-black">{score.yellow}</p></div>
          </div>
          <p className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">Round {roundNumber}</p>

          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.045] px-4 py-2.5 shadow-lg">
              <span className={clsx('h-3.5 w-3.5 rounded-full', currentPlayer === 1 ? 'bg-red-500' : 'bg-yellow-400')} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-wide text-slate-300 sm:text-sm">{gameState === 'end' ? 'Round concluso' : mode === 'local' ? `Tocca a ${currentPlayer === 1 ? 'Rosso' : 'Giallo'}` : myTurn ? 'Tocca a te' : 'Turno avversario'}</span>
            </div>
            {mode === 'online' && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                {connectionState === 'connected' ? <Wifi className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> : <WifiOff className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />}
                {connectionState === 'reconnecting' ? 'Riconnessione' : connectionState === 'lost' ? 'Offline' : playerLabel ? `Tu: ${playerLabel}` : 'Online'}
              </div>
            )}
          </div>

          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{connectionState === 'reconnecting' ? 'Partita in pausa durante la riconnessione' : connectionState === 'lost' ? 'Riconnetti per continuare la sessione' : 'Tocca una colonna · tastiera 1–7'}</p>

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

          {incomingRestart && connectionState === 'connected' && (
            <div className="mt-5 w-full max-w-sm rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4 text-center">
              <p className="text-sm font-black text-white">L’avversario chiede la rivincita</p><p className="mt-1 text-xs text-slate-400">Il primo giocatore cambierà rispetto al round precedente.</p>
              <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={declineRestart} className="rounded-xl border border-white/[0.08] py-3 text-xs font-black text-slate-400">Rifiuta</button><button type="button" onClick={acceptRestart} className="rounded-xl bg-emerald-500 py-3 text-xs font-black text-white">Accetta</button></div>
            </div>
          )}

          <div className="mt-5 flex w-full max-w-xs flex-col gap-3">
            {gameState === 'end' && !incomingRestart && (mode === 'local' || connectionState === 'connected') && <button type="button" onClick={requestRestart} disabled={restartRequested} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-base font-black uppercase tracking-wide text-white disabled:opacity-50"><RotateCcw className="h-5 w-5" aria-hidden="true" />{mode === 'online' && restartRequested ? 'In attesa…' : 'Gioca ancora'}</button>}
            {mode === 'online' && connectionState === 'lost' && <button type="button" onClick={retryConnection} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 py-3.5 text-xs font-black uppercase tracking-wider text-amber-200"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Riprova connessione</button>}
            <button type="button" onClick={exitToMenu} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] py-3.5 text-xs font-black uppercase tracking-wider text-slate-500"><DoorOpen className="h-4 w-4" aria-hidden="true" /> Esci dalla partita</button>
          </div>
        </main>
      )}
    </div>
  );
}
