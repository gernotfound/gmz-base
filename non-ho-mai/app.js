// Mappatura delle categorie con gli array importati dai vari file data_*.js
const categoryDataMap = {
    'Hot': typeof dataHot !== 'undefined' ? dataHot : [],
    'Love': typeof dataLove !== 'undefined' ? dataLove : [],
    'Situazioni': typeof dataSituazioni !== 'undefined' ? dataSituazioni : [],
    'Imbarazzo': typeof dataImbarazzo !== 'undefined' ? dataImbarazzo : [],
    'Social': typeof dataSocial !== 'undefined' ? dataSocial : [], 
    'Confini': typeof dataConfini !== 'undefined' ? dataConfini : []
};

// Variabili di stato del gioco
let activePhrases = [];
let currentIndex = 0;
let isAnimating = false; // Sistema anti-spam per i tap troppo veloci

// Elementi del DOM
const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const checkboxes = document.querySelectorAll('.category-checkbox');
const btnPlay = document.getElementById('btn-play');
const errorMessage = document.getElementById('error-message');

const phraseDisplay = document.getElementById('phrase-display');
const categoryLabel = document.getElementById('game-category-label');
const tapArea = document.getElementById('tap-area');

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnExit = document.getElementById('btn-exit');

// ==========================================
// AUDIO E VIBRAZIONE STABILIZZATI
// ==========================================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function playPopSound() {
    // Inizializza al primo tocco
    if (!audioCtx) {
        try {
            audioCtx = new AudioContext();
        } catch(e) {
            console.warn('Audio non supportato in questo browser');
            return;
        }
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        // Frequenza che scende per creare l'effetto "Goccia/Pop"
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);

        // Volume con attacco morbido e rilascio rapido per evitare il 'click' metallico
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch(e) {
        // Ignora silenziosamente errori audio su dispositivi molto vecchi
    }
}

function triggerHaptic() {
    // Vibrazione leggera
    if (navigator.vibrate) {
        // Avvolto in un try/catch perché su alcuni iOS navigator.vibrate esiste ma lancia errore
        try { navigator.vibrate(20); } catch(e) {}
    }
}

function provideFeedback() {
    playPopSound();
    triggerHaptic();
}
// ==========================================

// Funzione di Inizializzazione
function init() {
    // Supporto fallback visuale per vecchi browser che non supportano :has() nel CSS
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const card = this.closest('.category-card');
            if(this.checked) {
                card.classList.add('selected-' + this.value);
            } else {
                card.classList.remove('selected-' + this.value);
            }
        });
    });

    btnPlay.addEventListener('click', startGame);
    btnExit.addEventListener('click', exitGame);
    
    // Controlli navigazione
    tapArea.addEventListener('click', nextPhrase);
    btnNext.addEventListener('click', nextPhrase);
    btnPrev.addEventListener('click', prevPhrase);
}

// Avvia il Gioco
function startGame() {
    const selected = [];
    
    // Controlla quali categorie sono state selezionate
    checkboxes.forEach(cb => {
        if (cb.checked) selected.push(cb.value);
    });

    // Validazione
    if (selected.length === 0) {
        errorMessage.classList.remove('hidden');
        if (navigator.vibrate) { try { navigator.vibrate([50, 50, 50]); } catch(e) {} }
        return;
    }

    provideFeedback();

    errorMessage.classList.add('hidden');
    activePhrases = [];
    
    // Unisce le frasi
    selected.forEach(category => {
        const phrases = categoryDataMap[category];
        if(phrases && phrases.length > 0) {
            phrases.forEach(phrase => {
                activePhrases.push({
                    text: phrase,
                    category: category
                });
            });
        }
    });

    shuffleArray(activePhrases);
    currentIndex = 0;

    // Transizione fluida in dissolvenza (Fade-in / Fade-out)
    homeScreen.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        homeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Timeout minimo per far scattare la transizione CSS di opacità
        setTimeout(() => {
            gameScreen.classList.remove('opacity-0', 'pointer-events-none');
            showPhrase();
        }, 50);
    }, 300);
}

// Esce dal Gioco
function exitGame() {
    provideFeedback();
    
    // Transizione fluida indietro
    gameScreen.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        gameScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
        
        setTimeout(() => {
            homeScreen.classList.remove('opacity-0', 'pointer-events-none');
        }, 50);
        
        activePhrases = [];
        currentIndex = 0;
    }, 300);
}

// Mostra la frase corrente a schermo
function showPhrase() {
    // Blocca i tap finchè non finisce l'animazione di entrata del testo (300ms)
    isAnimating = true;
    
    phraseDisplay.classList.remove('fade-in-text');
    void phraseDisplay.offsetWidth; // Trigger reflow
    
    if (currentIndex < 0) currentIndex = 0;

    if (currentIndex >= activePhrases.length) {
        phraseDisplay.textContent = "Hai esaurito tutte le frasi per queste categorie! 🎉";
        categoryLabel.textContent = "FINE GIOCO";
        categoryLabel.className = "absolute top-8 text-sm font-bold uppercase tracking-widest text-white bg-gray-600 px-4 py-1 rounded-full shadow-lg transition-colors duration-300";
        btnNext.disabled = true;
    } else {
        const currentData = activePhrases[currentIndex];
        phraseDisplay.textContent = currentData.text;
        categoryLabel.textContent = currentData.category;
        
        setCategoryColor(currentData.category);
        btnNext.disabled = false;
    }
    
    // Gestione tasto indietro
    btnPrev.disabled = (currentIndex === 0);

    phraseDisplay.classList.add('fade-in-text');
    
    // Sblocca i tap dopo che l'animazione visiva è terminata
    setTimeout(() => {
        isAnimating = false;
    }, 300);
}

// Passa alla frase successiva
function nextPhrase(e) {
    if(e) e.stopPropagation(); 
    if(isAnimating) return; // Anti-spam
    
    if (currentIndex < activePhrases.length) {
        provideFeedback();
        currentIndex++;
        showPhrase();
    }
}

// Torna alla frase precedente
function prevPhrase(e) {
    if(e) e.stopPropagation();
    if(isAnimating) return; // Anti-spam
    
    if (currentIndex > 0) {
        provideFeedback();
        currentIndex--;
        showPhrase();
    }
}

// Imposta lo stile della label categoria
function setCategoryColor(category) {
    let bgColor = 'bg-gray-600';
    let textColor = 'text-white';
    
    switch(category) {
        case 'Hot': bgColor = 'bg-red-500'; break;
        case 'Love': bgColor = 'bg-pink-500'; break;
        case 'Situazioni': bgColor = 'bg-amber-500'; break;
        case 'Imbarazzo': bgColor = 'bg-violet-500'; break;
        case 'Social': bgColor = 'bg-sky-500'; break;
        case 'Confini': bgColor = 'bg-emerald-500'; break;
    }
    
    categoryLabel.className = `absolute top-8 text-sm font-bold uppercase tracking-widest ${textColor} ${bgColor} px-4 py-1 rounded-full shadow-lg transition-colors duration-300`;
}

// Algoritmo Fisher-Yates ottimizzato
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

document.addEventListener('DOMContentLoaded', init);