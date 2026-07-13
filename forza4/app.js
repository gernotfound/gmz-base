const rows = 6; cols = 7;
let board = [], peer = null, conn = null, isHost = false, myTurn = false, myPlayerNum = 0, gameActive = false, generatedGameUrl = "";

document.addEventListener('DOMContentLoaded', () => { 
    initBoardStructure(); 
    initNetwork(); 
});

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

function initNetwork() {
    const displayId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const actualId = 'F4-' + displayId; 
    
    // Inizializzazione PeerJS
    peer = new Peer(actualId);
    
    // Evento fondamentale: non facciamo NULLA finché non siamo connessi al server di signaling
    peer.on('open', (id) => {
        console.log('Server di signaling connesso. ID:', id);
        setupUI(displayId);
    });

    peer.on('error', (err) => {
        document.getElementById('status-box').innerText = "Errore di connessione: " + err.type;
        console.error("PeerJS Error:", err);
    });

    peer.on('connection', (connection) => { 
        if (conn) { connection.close(); return; } 
        isHost = true; myPlayerNum = 1; myTurn = true; 
        bindConnectionEvents(connection); 
    });
}

function setupUI(displayId) {
    document.getElementById('setup-panel').classList.remove('hidden');
    const joinId = new URLSearchParams(window.location.search).get('id');

    if (joinId) {
        // Modalità Guest
        document.getElementById('host-section').classList.add('hidden');
        document.getElementById('divider-section').classList.add('hidden');
        document.getElementById('guest-label').classList.remove('hidden');
        document.getElementById('remote-id').value = joinId;
        document.getElementById('status-box').innerText = "Pronto alla connessione.";
        // Connessione ritardata per permettere il rendering
        setTimeout(connectToPeer, 500); 
    } else {
        // Modalità Host
        document.getElementById('status-box').innerText = "In attesa di un giocatore...";
        document.getElementById('my-id').innerText = displayId;
        generatedGameUrl = window.location.href.split('?')[0] + '?id=' + displayId;
        new QRCode(document.getElementById('qrcode-box'), { text: generatedGameUrl, width: 140, height: 140 });
    }
}

function connectToPeer() {
    const rawId = document.getElementById('remote-id').value.trim().toUpperCase();
    if (!rawId) return;
    
    document.getElementById('status-box').innerText = "Connessione in corso...";
    conn = peer.connect('F4-' + rawId);
    isHost = false; myPlayerNum = 2; myTurn = false;
    bindConnectionEvents(conn);
}

function bindConnectionEvents(connection) {
    conn = connection;
    conn.on('open', () => { 
        document.getElementById('setup-panel').classList.add('hidden'); 
        document.getElementById('game-area').classList.remove('hidden'); 
        gameActive = true; 
        synchronizeUI(); 
    });
    conn.on('data', data => { 
        if (data.type === 'move') { processMove(data.col, data.playerNum); myTurn = true; synchronizeUI(); } 
        else if (data.type === 'restart') executeRestart(); 
    });
    conn.on('close', () => { 
        gameActive = false; 
        document.getElementById('turn-text').innerText = "Avversario disconnesso."; 
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
    
    // Mantiene coerenza cromatica con i gradienti di stile
    const myColorClass = myPlayerNum === 1 ? 'player1' : 'player2';
    const myTextClass = myPlayerNum === 1 ? 'text-gradient-p1' : 'text-gradient-p2';
    
    indicatorDot.className = `w-4 h-4 rounded-full transition-opacity duration-300 ${myColorClass}`;
    turnText.className = `font-bold text-lg transition-opacity duration-300 ${myTextClass}`;
    
    turnText.innerText = myTurn ? "Tocca a te" : "Attendi...";
    indicatorDot.style.opacity = myTurn ? "1" : "0.4";
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