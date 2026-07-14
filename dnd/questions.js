// Database globale delle frasi storiche e citazioni del gioco
const databaseFrasi = [
    // ==========================================
    // CITAZIONI DEL DUCE / PROPAGANDA FASCISTA (True)
    // ==========================================
    { 
        text: "Credere, obbedire, combattere.", 
        isDuce: true, 
        author: "Propaganda Fascista", 
        context: "Il motto ufficiale e più pervasivo del regime, inciso su innumerevoli edifici pubblici." 
    },
    { 
        text: "Roma è il nostro punto di partenza e di riferimento; è il nostro simbolo o, se si vuole, il nostro mito.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Dal discorso di Milano del 24 ottobre 1922, pochi giorni prima della Marcia su Roma." 
    },
    { 
        text: "Il numero è potenza.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Slogan cardine della campagna demografica lanciata con il 'Discorso dell'Ascensione' (1927)." 
    },
    { 
        text: "La disciplina deve cominciare dall'alto se si vuole che sia rispettata in basso.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Pronunciata durante un discorso al Senato nel 1926." 
    },
    { 
        text: "Tutto il potere a tutto il fascismo.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Dal discorso del 3 gennaio 1925, atto di fondazione formale della dittaura a seguito del delitto Matteotti." 
    },
    { 
        text: "La rivoluzione fascista è solo agli inizi.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Slogan propagandistico ricorrente per mantenere la tensione ideologica nella popolazione." 
    },
    { 
        text: "Il mare non è una barriera, ma una strada.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Retorica geopolitica utilizzata per rivendicare l'egemonia italiana nel Mediterraneo (Mare Nostrum)." 
    },
    { 
        text: "Chi ha del ferro ha del pane.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Massima utilizzata durante la spinta per l'autarchia e il potenziamento dell'industria pesante nazionale." 
    },

    // ==========================================
    // ALTRI AUTORI / FALSI STORICI (False)
    // ==========================================
    { 
        text: "Il potere logora chi non ce l'ha.", 
        isDuce: false, 
        author: "Giulio Andreotti", 
        context: "Celebre cinismo politico del sette volte Presidente del Consiglio italiano, adattamento di una massima del francese Talleyrand." 
    },
    { 
        text: "Se comprendere è impossibile, conoscere è necessario.", 
        isDuce: false, 
        author: "Primo Levi", 
        context: "Riflessione fondamentale dell'autore e superstite dell'Olocausto, tratta dall'appendice di 'Se questo è un uomo'." 
    },
    { 
        text: "La follia è fare sempre la stessa cosa aspettandosi risultati diversi.", 
        isDuce: false, 
        author: "Apocrifa (Attribuita ad Albert Einstein)", 
        context: "Falso storico comune. La frase appare per la prima volta in un romanzo del 1981 della scrittrice Rita Mae Brown." 
    },
    { 
        text: "L'inferno sono gli altri.", 
        isDuce: false, 
        author: "Jean-Paul Sartre", 
        context: "Celebre battuta conclusiva dell'opera teatrale esistenzialista 'A porte chiuse' (1944)." 
    },
    { 
        text: "Nessun uomo è un'isola.", 
        isDuce: false, 
        author: "John Donne", 
        context: "Incipit di una celebre meditazione (1624) del poeta e religioso inglese sulla connessione umana." 
    },
    { 
        text: "La vita è come andare in bicicletta. Per mantenere l'equilibrio devi muoverti.", 
        isDuce: false, 
        author: "Albert Einstein", 
        context: "Tratta da una lettera scritta dallo scienziato al figlio Eduard nel 1930." 
    },
    { 
        text: "Vivi come se dovessi morire domani. Impara come se dovessi vivere per sempre.", 
        isDuce: false, 
        author: "Apocrifa (Attribuita a Mahatma Gandhi)", 
        context: "Nessuna evidenza negli scritti di Gandhi. Il concetto risale al teologo medievale Isidoro di Siviglia." 
    },
    { 
        text: "Houston, abbiamo avuto un problema.", 
        isDuce: false, 
        author: "Jack Swigert", 
        context: "Frase pronunciata a bordo dell'Apollo 13 (1970), spesso citata erroneamente al presente ('abbiamo un problema')." 
    },
    { 
        text: "La libertà è partecipazione.", 
        isDuce: false, 
        author: "Giorgio Gaber", 
        context: "Verso conclusivo e manifesto politico-musicale dell'omonima canzone del cantautore italiano (1972)." 
    },
    { 
        text: "L'educazione è l'arma più potente che puoi usare per cambiare il mondo.", 
        isDuce: false, 
        author: "Nelson Mandela", 
        context: "Principio cardine della visione sociale del leader sudafricano dopo la fine dell'Apartheid." 
    },
    { 
        text: "Ognuno è artefice del proprio destino.", 
        isDuce: false, 
        author: "Appio Claudio Cieco", 
        context: "Antica massima romana (Faber est suae quisque fortunae) tramandataci dallo storico Sallustio." 
    },
    { 
        text: "Siate affamati, siate folli.", 
        isDuce: false, 
        author: "Stewart Brand (Resa celebre da Steve Jobs)", 
        context: "Slogan della rivista Whole Earth Catalog (1974), poi consacrata nel discorso di Jobs a Stanford nel 2005." 
    }
];