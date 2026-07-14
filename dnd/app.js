// Variabili di stato del gioco
let currentSessionQuestions = [];
let currentIndex = 0;
let punteggio = 0;
let currentQuestion = null;
let answered = false;

// Classi CSS per i vari stati dei pulsanti (coerenti con Tailwind)
const defaultBtnClass = "flex-1 bg-gray-800 border border-gray-700/60 hover:bg-gray-700/80 text-white font-extrabold text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-md tracking-wider";
const correctClass = "flex-1 bg-brand-confini border-brand-confini text-white font-extrabold text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)]";
const wrongClass = "flex-1 bg-brand-hot border-brand-hot text-white font-extrabold text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)]";
const dimmedClass = "flex-1 bg-gray-900 border-gray-800/40 text-gray-500 font-extrabold text-lg py-4 rounded-2xl opacity-40 cursor-not-allowed";

// Elementi agganciati al DOM
const elQuote = document.getElementById('quote-text');
const elExpBox = document.getElementById('explanation-box');
const elExpTitle = document.getElementById('explanation-title');
const elExpText = document.getElementById('explanation-text');
const btnDuce = document.getElementById('btn-duce');
const btnNonDuce = document.getElementById('btn-non-duce');
const btnNext = document.getElementById('btn-next');
const btnTerminate = document.getElementById('btn-terminate');
const elCounter = document.getElementById('question-counter');
const elScore = document.getElementById('score-display');

// Algoritmo di mescolamento Fisher-Yates per rendere le domande sempre casuali
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Inizializza o riavvia la partita
function startGame() {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    punteggio = 0;
    currentIndex = 0;
    elScore.innerText = punteggio;
    
    // Mescola e seleziona un lotto casuale di massimo 20 domande dal database globale
    const shuffledDB = shuffleArray([...databaseFrasi]);
    const totalQuestions = Math.min(20, shuffledDB.length);
    currentSessionQuestions = shuffledDB.slice(0, totalQuestions);
    
    loadQuestion();
}

// Carica la domanda corrente a schermo
function loadQuestion() {
    answered = false;
    currentQuestion = currentSessionQuestions[currentIndex];
    
    elCounter.innerText = currentIndex + 1;
    elQuote.innerText = `"${currentQuestion.text}"`;
    
    // Reset elementi informativi
    elExpBox.classList.add('hidden');
    btnNext.classList.add('hidden');
    btnTerminate.classList.remove('hidden');
    
    // Ripristina l'aspetto iniziale dei pulsanti
    btnDuce.className = defaultBtnClass;
    btnNonDuce.className = defaultBtnClass;
    btnDuce.disabled = false;
    btnNonDuce.disabled = false;
}

// Gestisce la risposta cliccata dal giocatore
function handleAnswer(userGuessedDuce) {
    if (answered) return;
    answered = true;
    
    btnDuce.disabled = true;
    btnNonDuce.disabled = true;
    btnTerminate.classList.add('hidden'); // Nasconde il tasto termina quando si risponde per fare spazio al tasto "Avanti"

    const isCorrect = (userGuessedDuce === currentQuestion.isDuce);

    if (isCorrect) {
        punteggio++;
        elScore.innerText = punteggio;
        
        // Evidenzia in verde la risposta esatta scelta e oscura l'altra
        if (userGuessedDuce) {
            btnDuce.className = correctClass;
            btnNonDuce.className = dimmedClass;
        } else {
            btnNonDuce.className = correctClass;
            btnDuce.className = dimmedClass;
        }
        
        // Mostra il box di spiegazione/contesto storico (in verde)
        elExpTitle.innerText = `CORRETTO! Autore: ${currentQuestion.author}`;
        elExpTitle.className = "block text-xs font-extrabold uppercase tracking-widest mb-1 text-brand-confini";
    } else {
        // Evidenzia in rosso la risposta errata scelta e oscura l'altra
        if (userGuessedDuce) {
            btnDuce.className = wrongClass;
            btnNonDuce.className = dimmedClass;
        } else {
            btnNonDuce.className = wrongClass;
            btnDuce.className = dimmedClass;
        }
        
        // Mostra il box di spiegazione/contesto storico (in rosso)
        elExpTitle.innerText = `ERRATO! Autore reale: ${currentQuestion.author}`;
        elExpTitle.className = "block text-xs font-extrabold uppercase tracking-widest mb-1 text-brand-hot";
    }

    // Inserisce il contesto storico nel pannello e lo rende visibile
    elExpText.innerText = currentQuestion.context;
    elExpBox.classList.remove('hidden');
    
    // Mostra il pulsante per avanzare
    btnNext.classList.remove('hidden');
}

// Avanza alla domanda successiva o conclude la partita se terminate
function nextQuestion() {
    currentIndex++;
    if (currentIndex < currentSessionQuestions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

// Conclude la partita anticipatamente o al termine naturale delle 20 domande
function endGame() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
    
    document.getElementById('final-score').innerText = punteggio;
}

// Avvia automaticamente il gioco all'avvio della pagina
window.onload = startGame;