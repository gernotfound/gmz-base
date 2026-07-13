const rows = 6; cols = 7;
let board = [], peer = null, conn = null, isHost = false, myTurn = false, myPlayerNum = 0, gameActive = false, generatedGameUrl = "";

document.addEventListener('DOMContentLoaded', () => { initBoardStructure(); initNetworkConfiguration(); });

function initBoardStructure() {
    const boardEl = document.getElementById('board'); boardEl.innerHTML = ''; board = [];
    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = 0;
            let cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.row = r; cell.dataset.col = c;
            cell.addEventListener('click', () => handleColumnSelection(c));
            boardEl.appendChild(cell);
        }
    }
}

function initNetworkConfiguration() {
    const displayId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const actualId = 'F4-' + displayId; 
    
    peer = new Peer(actualId);
    
    peer.on('error', (err) => {
        document.getElementById('status-box').innerText = "Errore: " + err.type;
        document.getElementById('btn-retry').classList.remove('hidden');
    });

    const joinId = new URLSearchParams(window.location.search).get('id');

    peer.on('open', id => {
        document.getElementById('setup-panel').classList.remove('hidden');
        if (joinId) {
            document.getElementById('host-section').classList.add('hidden');
            document.getElementById('divider-section').classList.add('hidden');
            document.getElementById('status-box').innerText = "Connessione in corso...";
            
            // Tentativo di connessione con ritardo di sicurezza
            setTimeout(() => { connectToPeer(joinId); }, 1000);
        } else {
            document.getElementById('status-box').innerText = "In attesa avversario...";
            document.getElementById('my-id').innerText = displayId;
            generatedGameUrl = window.location.href.split('?')[0] + '?id=' + displayId;
            new QRCode(document.getElementById('qrcode-box'), { text: generatedGameUrl, width: 140, height: 140 });
        }
    });

    peer.on('connection', connection => { 
        if (conn) { connection.close(); return; } 
        isHost = true; myPlayerNum = 1; myTurn = true; 
        bindConnectionEvents(connection); 
    });
}

function connectToPeer(forcedId) {
    const rawId = forcedId || document.getElementById('remote-id').value.trim().toUpperCase();
    if (!rawId) { alert("Codice mancante"); return; }
    
    conn = peer.connect('F4-' + rawId);
    isHost = false; myPlayerNum = 2; myTurn = false;
    bindConnectionEvents(conn);
    
    setTimeout(() => {
        if (!gameActive) {
            document.getElementById('status-box').innerText = "Host non trovato.";
            document.getElementById('btn-retry').classList.remove('hidden');
        }
    }, 8000);
}

function bindConnectionEvents(connection) {
    conn = connection;
    conn.on('open', () => { 
        document.getElementById('setup-panel').classList.add('hidden'); 
        document.getElementById('game-area').classList.remove('hidden'); 
        gameActive = true; synchronizeUI(); 
    });
    conn.on('data', data => { 
        if (data.type === 'move') { processMove(data.col, data.playerNum); myTurn = true; synchronizeUI(); } 
        else if (data.type === 'restart') executeRestart(); 
    });
    conn.on('close', () => { 
        gameActive = false; 
        document.getElementById('status-box').innerText = "Connessione persa";
    });
}

function handleColumnSelection(col) {
    if (!gameActive || !myTurn) return;
    if (processMove(col, myPlayerNum)) { 
        conn.send({ type: 'move', col: col, playerNum: myPlayerNum }); 
        myTurn = false; synchronizeUI(); 
    }
}

function processMove(col, playerNum) {
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = playerNum;
            const cellEl = document.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
            const token = document.createElement('div'); token.className = `token ${playerNum === 1 ? 'p1' : 'p2'}`;
            cellEl.appendChild(token);
            if (evaluateWin(r, col, playerNum)) terminateGame(playerNum);
            else if (board.flat().every(v => v !== 0)) terminateGame(0);
            return true;
        }
    }
    return false;
}

function synchronizeUI() {
    const indicatorDot = document.getElementById('player-indicator-dot');
    const turnText = document.getElementById('turn-text');
    indicatorDot.className = `w-4 h-4 rounded-full transition-opacity duration-300 ${myTurn ? (myPlayerNum === 1 ? 'player1' : 'player2') : 'bg-gray-600'}`;
    turnText.innerText = myTurn ? "Tocca a te" : "Attendi...";
    turnText.style.opacity = myTurn ? "1" : "0.6";
}

function terminateGame(winnerNum) {
    gameActive = false;
    const overlay = document.getElementById('board-overlay');
    const text = document.getElementById('overlay-text');
    overlay.classList.remove('hidden');
    text.className = 'overlay-text-base';
    if (winnerNum === 0) { text.innerText = "PAREGGIO"; text.classList.add('text-draw'); }
    else if (winnerNum === myPlayerNum) { text.innerHTML = "HAI<br>VINTO"; text.classList.add('text-win'); }
    else { text.innerHTML = "HAI<br>PERSO"; text.classList.add('text-lose'); }
    document.getElementById('btn-restart').classList.remove('hidden');
    document.getElementById('turn-text').innerText = "Attendi...";
}

function requestRestart() { if (conn && conn.open) conn.send({ type: 'restart' }); executeRestart(); }
function executeRestart() {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) board[r][c] = 0;
    document.querySelectorAll('.token').forEach(t => t.remove());
    document.getElementById('board-overlay').classList.add('hidden');
    document.getElementById('btn-restart').classList.add('hidden');
    gameActive = true; myTurn = isHost; synchronizeUI();
}

function exitToMenu() { window.location.href = "../index.html"; }

function evaluateWin(r, c, p) { 
    const axes = [[[0, 1], [0, -1]], [[1, 0], [-1, 0]], [[1, 1], [-1, -1]], [[1, -1], [-1, 1]]];
    for (let axis of axes) {
        let count = 1;
        for (let [dr, dc] of axis) {
            let step = 1;
            while (true) { let nr = r + dr * step, nc = c + dc * step; if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === p) { count++; step++; } else break; }
        }
        if (count >= 4) return true;
    }
    return false;
}

function copyLink() { navigator.clipboard.writeText(generatedGameUrl); }