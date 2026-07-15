import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home as HomeIcon, Copy, Play, DoorOpen, RotateCcw, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Peer, { DataConnection } from 'peerjs';
import clsx from 'clsx';

const ROWS = 6;
const COLS = 7;

type GameState = 'setup' | 'playing' | 'end';

export default function Forza4() {
  const [searchParams] = useSearchParams();
  const joinId = searchParams.get('id');

  const [gameState, setGameState] = useState<GameState>('setup');
  const [statusText, setStatusText] = useState('Connessione ai server...');
  const [statusError, setStatusError] = useState(false);
  const [myId, setMyId] = useState('----');
  const [remoteId, setRemoteId] = useState(joinId || '');
  const [copied, setCopied] = useState(false);

  const [board, setBoard] = useState<number[][]>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  
  const [isHost, setIsHost] = useState(false);
  const [myPlayerNum, setMyPlayerNum] = useState(0);
  const [myTurn, setMyTurn] = useState(false);
  const [winner, setWinner] = useState<number | null>(null); // 0 = draw

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  useEffect(() => {
    const displayId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const actualId = 'F4-' + displayId;
    
    const peer = new Peer(actualId);
    peerRef.current = peer;

    peer.on('open', () => {
      if (joinId) {
        setStatusText("Accesso alla partita...");
        setRemoteId(joinId);
        // We do not auto-connect to allow user to press 'connect', 
        // but we could. For safety let's just let them press it.
      } else {
        setStatusText("In attesa di un giocatore...");
        setMyId(displayId);
      }
    });

    peer.on('connection', conn => {
      if (connRef.current) { conn.close(); return; }
      setIsHost(true);
      setMyPlayerNum(1);
      setMyTurn(true);
      bindConnectionEvents(conn);
    });

    return () => {
      peer.destroy();
    };
  }, [joinId]);

  const bindConnectionEvents = (conn: DataConnection) => {
    connRef.current = conn;
    
    conn.on('open', () => {
      setGameState('playing');
      setStatusText("Partita in corso");
      setStatusError(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    });

    conn.on('data', (data: any) => {
      if (data.type === 'move') {
        processMove(data.col, data.playerNum);
      } else if (data.type === 'restart') {
        executeRestart();
      }
    });

    conn.on('close', () => {
      handleDisconnect();
    });
  };

  const handleDisconnect = () => {
    setGameState('end');
    setStatusText("Connessione persa");
    setStatusError(true);
    setWinner(-1); // special state for disconnected
  };

  const connectToPeer = () => {
    if (!remoteId || remoteId.length < 4) {
      alert("Inserisci un codice valido di 4 caratteri.");
      return;
    }
    
    setStatusText("Connessione in corso...");
    setStatusError(false);
    setIsHost(false);
    setMyPlayerNum(2);
    setMyTurn(false);
    
    const targetId = 'F4-' + remoteId.trim().toUpperCase();
    const conn = peerRef.current!.connect(targetId);
    bindConnectionEvents(conn);
    
    setTimeout(() => {
      if (gameState !== 'playing' && statusText === "Connessione in corso...") {
        setStatusText("Errore: Host non trovato.");
        setStatusError(true);
      }
    }, 5000);
  };

  const copyLink = () => {
    const url = window.location.href.split('?')[0] + '?id=' + myId;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const processMove = (col: number, playerNum: number) => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      for (let r = ROWS - 1; r >= 0; r--) {
        if (newBoard[r][col] === 0) {
          newBoard[r][col] = playerNum;
          
          if (evaluateWinConditions(newBoard, r, col, playerNum)) {
            setGameState('end');
            setWinner(playerNum);
          } else if (evaluateDrawCondition(newBoard)) {
            setGameState('end');
            setWinner(0);
          } else {
            // switch turn
            setMyTurn(playerNum !== myPlayerNum);
          }
          break;
        }
      }
      return newBoard;
    });
  };

  const handleColumnSelection = (col: number) => {
    if (gameState !== 'playing' || !myTurn) return;
    
    // check if column is full
    if (board[0][col] !== 0) return;

    processMove(col, myPlayerNum);
    connRef.current?.send({ type: 'move', col: col, playerNum: myPlayerNum });
    setMyTurn(false);
  };

  const evaluateWinConditions = (b: number[][], r: number, c: number, p: number) => {
    const axes = [ [[0, 1], [0, -1]], [[1, 0], [-1, 0]], [[1, 1], [-1, -1]], [[1, -1], [-1, 1]] ];
    for (const axis of axes) {
      let count = 1;
      for (const [dr, dc] of axis) {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === p) {
            count++; step++;
          } else break;
        }
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const evaluateDrawCondition = (b: number[][]) => {
    for (let c = 0; c < COLS; c++) {
      if (b[0][c] === 0) return false;
    }
    return true;
  };

  const requestRestart = () => {
    if (!connRef.current || !connRef.current.open) {
      alert("La connessione con l'avversario è interrotta.");
      return;
    }
    connRef.current.send({ type: 'restart' });
    executeRestart();
  };

  const executeRestart = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setWinner(null);
    setGameState('playing');
    setMyTurn(isHost);
  };

  const exitToMenu = () => {
    window.location.href = window.location.href.split('?')[0];
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen pt-safe pb-safe px-6 select-none bg-slate-900 text-white">
      {gameState === 'setup' && (
        <Link to="/" className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all active:scale-90 shadow-lg z-30">
          <HomeIcon className="w-5 h-5" />
        </Link>
      )}

      <header className="text-center mt-20 mb-4 shrink-0">
        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          FORZA 4
        </h1>
        <div className={clsx("text-xs font-bold uppercase tracking-wider mt-1.5", statusError ? 'text-red-500' : 'text-slate-400')}>
          {statusText}
        </div>
      </header>

      {gameState === 'setup' && (
        <main className="flex-grow flex flex-col items-center w-full max-w-lg mx-auto pb-8">
          {!joinId && (
            <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl flex flex-col items-center w-full mb-6 shadow-xl border border-slate-700/50">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Il tuo codice Host</span>
              <h2 className="text-5xl font-black text-white tracking-widest mb-4">{myId}</h2>
              
              <div className="bg-white p-3.5 rounded-2xl mb-5 shadow-inner border border-slate-200">
                <QRCodeSVG value={window.location.href.split('?')[0] + '?id=' + myId} size={140} fgColor="#0f172a" />
              </div>
              
              <button onClick={copyLink} className={clsx("w-full py-3 rounded-xl font-bold text-base shadow-md active:scale-95 transition-all flex justify-center items-center gap-2 border", copied ? 'bg-green-600 text-white border-green-500' : 'bg-slate-700/80 hover:bg-slate-700 text-white border-slate-600/30')}>
                {copied ? <><Check className="w-4 h-4"/> Copiato!</> : <><Copy className="w-4 h-4"/> Copia Link di Invito</>}
              </button>
            </div>
          )}

          {!joinId && (
            <div className="flex items-center w-full my-2">
              <div className="flex-grow h-px bg-slate-700/40"></div>
              <span className="px-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Oppure partecipa</span>
              <div className="flex-grow h-px bg-slate-700/40"></div>
            </div>
          )}

          <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl flex flex-col items-center w-full mt-4 shadow-xl border border-slate-700/50 transition-all">
            <div className="flex flex-col gap-3.5 w-full">
              {joinId && <span className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center mb-2">Partecipazione in corso</span>}
              <input type="text" value={remoteId} onChange={e => setRemoteId(e.target.value)} placeholder="Es. A1B2" maxLength={4} className="w-full bg-slate-900/60 text-white px-4 py-3.5 rounded-xl border border-slate-600/50 uppercase text-center font-black text-2xl outline-none focus:border-indigo-500 focus:bg-slate-900 transition-colors placeholder-slate-600" />
              <button onClick={connectToPeer} className="w-full py-4 px-6 rounded-xl font-black text-lg bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform uppercase tracking-wider flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-white" /> PARTECIPA
              </button>
            </div>
          </div>
        </main>
      )}

      {(gameState === 'playing' || gameState === 'end') && (
        <div className="flex flex-col items-center w-full max-w-lg mt-2">
          
          <div className="bg-slate-800 px-6 py-2.5 rounded-full mb-5 flex items-center gap-3.5 shadow-lg border border-slate-700/30 shrink-0">
            <span className={clsx("w-4 h-4 rounded-full shadow-inner transition-opacity duration-300", 
              gameState === 'playing' && myTurn ? (myPlayerNum === 1 ? 'bg-red-500' : 'bg-yellow-500') : 'bg-slate-600',
              gameState === 'end' ? 'opacity-40' : 'opacity-100'
            )}></span>
            <span className={clsx("font-extrabold text-base tracking-wide uppercase transition-opacity duration-300",
              gameState === 'playing' ? (myTurn ? (myPlayerNum === 1 ? 'text-red-400' : 'text-yellow-400') : 'text-slate-400') : 'text-slate-400'
            )}>
              {gameState === 'end' ? 'Partita Conclusa' : myTurn ? 'Tocca a te' : 'Attendi...'}
            </span>
          </div>

          <div className="relative inline-block shrink-0">
            {gameState === 'end' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[16px]">
                <h2 className={clsx("text-5xl font-black drop-shadow-lg uppercase text-center",
                  winner === myPlayerNum ? 'text-green-400' : winner === 0 ? 'text-white' : winner === -1 ? 'text-red-500' : 'text-red-500'
                )}>
                  {winner === myPlayerNum ? 'HAI\nVINTO' : winner === 0 ? 'PAREGGIO' : winner === -1 ? "AVVERSARIO\nUSCITO" : 'HAI\nPERSO'}
                </h2>
              </div>
            )}
            <div className="board">
              {board.map((row, r) => row.map((cell, c) => (
                <div key={`${r}-${c}`} className="cell" onClick={() => handleColumnSelection(c)}>
                  {cell !== 0 && (
                    <div className={clsx("token", cell === 1 ? 'p1' : 'p2')} style={{ animationDuration: '0s', top: '5%', transform: 'translateY(300px)' }}></div>
                  )}
                </div>
              )))}
            </div>
          </div>

          <div className="mt-6 mb-6 flex flex-col w-full max-w-xs gap-3 shrink-0">
            {gameState === 'end' && winner !== -1 && (
              <button onClick={requestRestart} className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform flex justify-center items-center gap-2 uppercase tracking-wide">
                <RotateCcw className="w-5 h-5" /> GIOCA ANCORA
              </button>
            )}

            <button onClick={exitToMenu} className="w-full py-3.5 rounded-xl font-extrabold text-xs bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-red-400 shadow-md active:scale-95 transition-colors flex justify-center items-center gap-2 uppercase tracking-wider">
              <DoorOpen className="w-4 h-4" /> ESCI DALLA PARTITA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
