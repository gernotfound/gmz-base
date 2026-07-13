const rows = 6;
const cols = 7;
let board = [];
let peer = null;
let conn = null;
let isHost = false;
let myTurn = false;
let myPlayerNum = 0; 
let gameActive = false;
let generatedGameUrl = "";

document.addEventListener('DOMContentLoaded', () => {
    initBoardStructure();
    initNetworkConfiguration();
});

function initBoardStructure() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = [];
    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = 0;
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleColumnSelection(c));
            boardEl.appendChild(cell);
        }
    }
}

function initNetworkConfiguration() {
    const displayId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const actualId = 'F4-' + displayId; 
    
    peer = new Peer(actualId);
    
    const urlParams = new URLSearchParams(window.location.search);
    const joinId = urlParams.get('id');

    peer.on('open', id => {
        document.getElementById('setup-panel').classList.remove('hidden');
        
        if (joinId) {
            document.getElementById('host-section').classList.add('hidden');
            document.getElementById('divider-section').classList.add('hidden');
            document.getElementById('guest-label').classList.remove('hidden');
            
            document.getElementById('status-box').innerText = "Accesso alla partita...";
            document.getElementById('remote-id').value = joinId;
            
            setTimeout(() => {
                document.getElementById('btn-connect').click();
            }, 300);

        } else {
            document.getElementById('status-box').innerText = "In attesa di un giocatore...";
            document.getElementById('my-id').innerText = displayId;
            
            generatedGameUrl = window.location.href.split('?')[0] + '?id=' + displayId;
            
            const qrBox = document.getElementById('qrcode-box');
            qrBox.innerHTML = ""; 
            new QRCode(qrBox, {
                text: generatedGameUrl,
                width: 140,
                height: 140,
                colorDark : "#0f172a",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        }
    });

    peer.on('connection', connection => {
        if (conn) { connection.close(); return; }
        isHost = true;
        myPlayerNum = 1;
        myTurn = true;
        bindConnectionEvents(connection);
    });
}

function connectToPeer() {
    const rawId = document.getElementById('remote-id').value.trim().toUpperCase();
    if (!rawId || rawId.length < 4) {
        alert("Inserisci un codice valido di 4 caratteri.");
        return;
    }
    
    document.getElementById('status-box').innerText = "Connessione in corso...";
    isHost = false;
    myPlayerNum = 2;
    myTurn = false;
    
    const targetId = 'F4-' + rawId;
    const connection = peer.connect(targetId);
    bindConnectionEvents(connection);
    
    setTimeout(() => {
        if(!gameActive && document.getElementById('status-box').innerText === "Connessione in corso...") {
            document.getElementById('status-box').innerText = "Errore: Host non trovato.";
            document.getElementById('status-box').classList.add('text-brand-hot');
        }
    }, 5000);
}

function bindConnectionEvents(connection) {
    conn = connection;
    
    conn.on('open', () => {
        document.getElementById('setup-panel').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');
        document.getElementById('status-box').innerText = "Partita in corso";
        document.getElementById('status-box').classList.remove('text-brand-hot');
        gameActive = true;
        synchronizeUI();
        window.history.replaceState({}, document.title, window.location.pathname);
    });

    conn.on('data', data => {
        if (data.type === 'move') {
            processMove(data.col, data.playerNum);
            if (gameActive) {
                myTurn = true;
                synchronizeUI();
            }
        } else if (data.type === 'restart') {
            executeRestart();
        }
    });

    conn.on('close', handleDisconnect);
}

function handleDisconnect() {
    gameActive = false;
    document.getElementById('status-box').innerText = "Connessione persa";
    document.getElementById('status-box').classList.add('text-brand-hot');
    
    const turnText = document.getElementById('turn-text');
    turnText.innerText = "L'avversario è uscito.";
    turnText.className = "font-bold text-lg text-gray-400 transition-opacity duration-300";
    document.getElementById('player-indicator-dot').style.opacity = "0.4";
    
    document.getElementById('btn-restart').classList.add('hidden');
}

function handleColumnSelection(col) {
    if (!gameActive || !myTurn) return;
    
    if (processMove(col, myPlayerNum)) {
        conn.send({ type: 'move', col: col, playerNum: myPlayerNum });
        myTurn = false;
        synchronizeUI();
    }
}

function processMove(col, playerNum) {
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = playerNum;
            
            const cellEl = document.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
            if (cellEl) {
                const token = document.createElement('div');
                token.className = `token ${playerNum === 1 ? 'p1' : 'p2'}`;
                cellEl.appendChild(token);
            }

            if (evaluateWinConditions(r, col, playerNum)) {
                terminateGame(playerNum);
            } else if (evaluateDrawCondition()) {
                terminateGame(0);
            }
            return true;
        }
    }
    return false;
}

function synchronizeUI() {
    const indicatorDot = document.getElementById('player-indicator-dot');
    const turnText = document.getElementById('turn-text');
    
    const myColorClass = myPlayerNum === 1 ? 'player1' : 'player2';
    const myTextClass = myPlayerNum === 1 ? 'text-gradient-p1' : 'text-gradient-p2';
    
    indicatorDot.className = `w-4 h-4 rounded-full shadow-inner transition-opacity duration-300 ${myColorClass}`;
    turnText.className = `font-bold text-lg transition-opacity duration-300 ${myTextClass}`;

    if (myTurn) {
        turnText.innerText = "Tocca a te";
        indicatorDot.style.opacity = "1";
        turnText.style.opacity = "1";
    } else {
        turnText.innerText = "Attendi...";
        indicatorDot.style.opacity = "0.4";
        turnText.style.opacity = "0.6";
    }
}

function terminateGame(winnerNum) {
    gameActive = false;
    const turnText = document.getElementById('turn-text');
    const indicatorDot = document.getElementById('player-indicator-dot');
    const overlay = document.getElementById('board-overlay');
    const overlayText = document.getElementById('overlay-text');
    
    overlay.className = 'absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden pointer-events-none';
    overlayText.className = 'overlay-text-base';
    
    // Forzatura inattiva dell'indicatore di turno
    turnText.innerText = "Attendi...";
    turnText.className = `font-bold text-lg transition-opacity duration-300 text-gradient-p${myPlayerNum}`;
    turnText.style.opacity = "0.6";
    indicatorDot.style.opacity = "0.4";

    if (winnerNum === 0) {
        turnText.className = "font-bold text-lg text-gray-400 transition-opacity duration-300";
        overlayText.innerText = "PAREGGIO";
        overlayText.classList.add('text-draw');
    } else if (winnerNum === myPlayerNum) {
        overlayText.innerHTML = "HAI<br>VINTO";
        overlayText.classList.add('text-win');
    } else {
        overlayText.innerHTML = "HAI<br>PERSO";
        overlayText.classList.add('text-lose');
    }
    
    document.getElementById('btn-restart').classList.remove('hidden');
}

function requestRestart() {
    if (!conn || !conn.open) {
        alert("La connessione con l'avversario è interrotta.");
        return;
    }
    conn.send({ type: 'restart' });
    executeRestart();
}

function executeRestart() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            board[r][c] = 0;
        }
    }
    
    document.querySelectorAll('.token').forEach(t => t.remove());
    document.getElementById('board-overlay').classList.add('hidden');
    document.getElementById('btn-restart').classList.add('hidden');
    
    gameActive = true;
    myTurn = isHost;
    synchronizeUI();
}

function exitToMenu() {
    window.location.href = window.location.href.split('?')[0];
}

function evaluateWinConditions(r, c, p) {
    const axes = [ [[0, 1], [0, -1]], [[1, 0], [-1, 0]], [[1, 1], [-1, -1]], [[1, -1], [-1, 1]] ];
    for (let axis of axes) {
        let count = 1;
        for (let [dr, dc] of axis) {
            let step = 1;
            while (true) {
                let nr = r + dr * step, nc = c + dc * step;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === p) {
                    count++; step++;
                } else break;
            }
        }
        if (count >= 4) return true;
    }
    return false;
}

function evaluateDrawCondition() {
    for (let c = 0; c < cols; c++) if (board[0][c] === 0) return false;
    return true;
}

function copyLink() {
    if (generatedGameUrl) {
        navigator.clipboard.writeText(generatedGameUrl).then(() => {
            const btn = document.getElementById('btn-copy');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-check"></i> Copiato!`;
            btn.classList.add('bg-green-600');
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.remove('bg-green-600');
            }, 2000);
        });
    }
}