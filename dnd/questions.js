// Database bilanciato delle citazioni e dei fatti storici (Duce o Non Duce)
// Totale domande: 110 (44 Duce [40%] / 66 Non Duce [60%])
const databaseFrasi = [
    // =========================================================================
    // CATEGORIA: DUCE (Mussolini / Propaganda Fascista / Fatti reali) [44 Elementi - 40%]
    // =========================================================================

    // --- CITAZIONI ---
    { 
        text: "Credere, obbedire, combattere.", 
        isDuce: true, 
        author: "Propaganda Fascista", 
        context: "Il motto ufficiale e più pervasivo del regime, rivolto soprattutto alla gioventù fascista e ai militari d'Italia." 
    },
    { 
        text: "Roma è il nostro punto di partenza e di riferimento; è il nostro simbolo o, se si vuole, il nostro mito.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Dal discorso di Milano del 24 ottobre 1922, pronunciato pochi giorni prima della Marcia su Roma." 
    },
    { 
        text: "Il numero è potenza.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Slogan cardine della campagna demografica lanciata con il celebre 'Discorso dell'Ascensione' del 1927." 
    },
    { 
        text: "La disciplina deve cominciare dall'alto se si vuole che sia rispettata in basso.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Pronunciata durante un intervento ufficiale al Senato nel 1926." 
    },
    { 
        text: "Tutto il potere a tutto il fascismo.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Dal discorso del 3 gennaio 1925, atto di fondazione formale della dittatura a seguito del delitto Matteotti." 
    },
    { 
        text: "La rivoluzione fascista è solo agli inizi.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Slogan propagandistico ricorrente per mantenere alta la tensione ideologica nella popolazione." 
    },
    { 
        text: "Il mare non è una barriera, ma una strada.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Retorica geopolitica utilizzata per rivendicare l'egemonia militare italiana nel Mediterraneo (Mare Nostrum)." 
    },
    { 
        text: "Chi ha del ferro ha del pane.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Massima utilizzata durante la spinta per l'autarchia e il potenziamento dell'industria pesante nazionale." 
    },
    { 
        text: "Meglio vivere un giorno da leone che cent’anni da pecora.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Slogan nazional-militarista usato dal Duce per esaltare il coraggio e il sacrificio bellico negli anni Trenta." 
    },
    { 
        text: "Democrazia è bella in teoria; in pratica è una fallacia.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Espressione con cui il Duce delegittima il parlamentarismo liberale, contrapponendogli il modello totalitario fascista." 
    },
    { 
        text: "Tutto nello Stato, niente al di fuori dello Stato, nulla contro lo Stato.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Sintesi estrema del totalitarismo fascista, che subordina completamente l'individuo e la società al potere statale." 
    },
    { 
        text: "Abbiamo seppellito il putrido cadavere della libertà.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Espressione volutamente provocatoria per celebrare la liquidazione formale delle libertà costituzionali in Italia." 
    },
    { 
        text: "Il sangue solo muove le ruote della storia.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Formula retorica aggressiva che giustifica la guerra e la violenza fisica come motori essenziali del progresso storico." 
    },
    { 
        text: "Il fascismo è una concezione totalitaria dello Stato.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Dichiarazione programmatica e filosofica che definisce il fascismo come l'ideologia in cui lo Stato assorbe ogni dimensione sociale." 
    },
    { 
        text: "La verità è che gli uomini sono stanchi della libertà.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Giustificazione psicologica dell'autoritarismo: l'idea che le masse stanche preferiscano l'ordine e la disciplina ai diritti." 
    },
    { 
        text: "È bene fidarsi degli altri, ma non farlo è molto meglio.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Massima che riflette il clima di diffidenza del regime verso l'opposizione, le minoranze e le istituzioni indipendenti." 
    },
    { 
        text: "La funzione del cittadino e quella del soldato sono inseparabili.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Frase che fonde intenzionalmente cittadinanza e militarismo, tipica dell'indottrinamento delle dittature fasciste." 
    },
    { 
        text: "La stampa italiana è libera, più libera di quella di qualsiasi altro paese, finché sostiene il regime.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Un paradosso retorico che mostra come la presunta libertà di stampa fosse condizionata alla fedeltà assoluta al fascismo." 
    },
    { 
        text: "Solo la violenza è morale, più morale dei compromessi.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Esaltazione dottrinale dello scontro fisico violento rispetto alla democrazia parlamentare e al negoziato politico." 
    },
    { 
        text: "La lotta tra fascismo e democrazia non ammette compromessi. O noi o loro.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Formulazione radicale che presenta il conflitto politico come uno scontro totale e irriducibile." 
    },
    { 
        text: "La libertà è un dovere, non un diritto.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Riformulazione autoritaria del concetto di libertà individuale, considerata puramente come dovere subordinato allo Stato." 
    },
    { 
        text: "Il fascismo non crede né nella possibilità né nell’utilità della pace perpetua.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Passaggio cardine de 'La Dottrina del Fascismo' che rifiutava il pacifismo a favore di un'ideologia strutturalmente guerrafondaia." 
    },
    { 
        text: "La democrazia parla fino a morire; io l'ho sostituita con l'azione.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Mussolini opponeva il suo ruolo di 'uomo d'azione' alla lentezza del dibattito parlamentare, esaltando il decisionismo del regime." 
    },
    { 
        text: "Noi non discutiamo con chi non è d'accordo con noi, lo distruggiamo.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Frase che esprime la volontà di eliminare l'opposizione politica e squadrista piuttosto che confrontarsi, tipica della retorica violenta fascista." 
    },
    { 
        text: "Il popolo non sa ciò che vuole; non sa ciò che è meglio per lui.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Giustifica il paternalismo autoritario dello Stato fascista, che si arrogava il diritto di decidere autonomamente al posto dei cittadini." 
    },
    { 
        text: "Il regime fascista è lo Stato corporativo.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Definizione dottrinale con cui Mussolini descriveva l'assetto economico-istituzionale fondato sul controllo diretto delle corporazioni." 
    },
    { 
        text: "Il socialismo è una frode, una commedia, un fantasma, un ricatto.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Violento attacco propagandistico pronunciato quando Mussolini si era ormai definitivamente distaccato dal suo passato socialista." 
    },
    { 
        text: "La pace è assurda: il fascismo non vi crede.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Massima collegata alla dottrina militarista che esaltava la guerra come esperienza nobilitante ed evolutiva per un popolo." 
    },
    { 
        text: "La maggioranza, solo perché è maggioranza, non può dirigere la società umana.", 
        isDuce: true, 
        author: "Benito Mussolini", 
        context: "Critica filosofica rivolta contro il principio di maggioranza, il parlamentarismo democratico e l'adozione del suffragio universale." 
    },

    // --- FATTI STORICI REALI ---
    { 
        text: "Fondò i Fasci Italiani di Combattimento nel 1919.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Mussolini fondò questo movimento paramilitare a Milano nel marzo del 1919, radunando reduci di guerra e nazionalisti delusi." 
    },
    { 
        text: "Nel 1921 trasformò quel movimento nel Partito Nazionale Fascista.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Con la nascita del PNF, il Duce conferì al fascismo una solida struttura partitica per scalare le istituzioni statali." 
    },
    { 
        text: "Organizzò la Marcia su Roma nell’ottobre 1922.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "La mobilitazione di massa delle camicie nere intimorì il re Vittorio Emanuele III, che scelse di conferirgli l'incarico di governo." 
    },
    { 
        text: "Assunse la carica di primo ministro, divenendo presto capo di governo di fatto.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Subito dopo la Marcia su Roma, Mussolini avviò un processo di centralizzazione dell'esecutivo ponendolo sopra il Parlamento." 
    },
    { 
        text: "Tra il 1924 e il 1925 smantellò le istituzioni democratiche e si proclamò dittatore, «Il Duce».", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Sfruttando la crisi successiva al delitto Matteotti, con il discorso del 3 gennaio 1925 instaurò legalmente la dittatura a partito unico." 
    },
    { 
        text: "Creò le squadre d’azione fasciste, le camicie nere, usate per intimidare e picchiare gli oppositori.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "I gruppi squadristi armati furono determinanti nell'estirpare l'opposizione politica e consolidare la dittatura." 
    },
    { 
        text: "Varò politiche di corporativismo e forte intervento statale nell’economia.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Mussolini raggruppò le categorie produttive in corporazioni controllate direttamente dallo Stato, sopprimendo i sindacati liberi." 
    },
    { 
        text: "Promosse grandi opere pubbliche, come la bonifica integrale dell’Agro Pontino negli anni Trenta.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Le bonifiche, pur parziali, diventarono una colossale operazione propagandistica per celebrare l'efficienza fascista e il lavoro rurale." 
    },
    { 
        text: "Introdusse norme di igiene sul lavoro e limitazioni al carico per donne e bambini nel 1925.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Primi provvedimenti di welfare che il regime sfruttò ampiamente per darsi un'immagine di vicinanza e modernizzazione della classe lavoratrice." 
    },
    { 
        text: "Nel 1934 approvò una legge che riconosceva il congedo di maternità alle donne lavoratrici.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Questo ammortizzatore sociale era parte integrante della politica demografica volta a favorire l'incremento delle nascite." 
    },
    { 
        text: "Nel 1935 dichiarò guerra all’Etiopia, dando avvio alla seconda guerra italo‑etiopica.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "La violenta invasione militare portò all'isolamento diplomatico italiano, spingendo Mussolini ad allinearsi permanentemente con Hitler." 
    },
    { 
        text: "Fornì sostegno militare a Francisco Franco durante la Guerra civile spagnola.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Inviando truppe e aerei (CTV), l'Italia sostenne il colpo di stato franchista rafforzando l'asse delle destre autoritarie europee." 
    },
    { 
        text: "Nel 1938 promulgò le leggi razziali antiebraiche con il “Manifesto della razza”.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "Mussolini firmò decreti d'ispirazione antisemita che segnarono l'esclusione violenta degli ebrei italiani dalla vita pubblica, lavorativa e scolastica." 
    },
    { 
        text: "Nel 1939 firmò con Hitler il “Patto d’Acciaio”.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "L'alleanza militare e politica sancì il legame indissolubile con il nazismo, vincolando l'Italia all'entrata in guerra al fianco della Germania." 
    },
    { 
        text: "Nel 1940 dichiarò guerra a Francia e Regno Unito, entrando nella Seconda guerra mondiale al fianco di Hitler.", 
        isDuce: true, 
        author: "Fatto Storico (Benito Mussolini)", 
        context: "La disastrosa scelta bellica trascinò l'Italia in rovesci militari ed economici insostenibili, che logorarono definitivamente il consenso interno." 
    },

    // =========================================================================
    // CATEGORIA: NON DUCE (Dittature estere, Altri autori, Miti storici) [66 Elementi - 60%]
    // =========================================================================

    // --- CITAZIONI ESTERE O ALTRI AUTORI ---
    { 
        text: "La grande massa del popolo cadrà più facilmente vittima di una grande menzogna che di una piccola.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Tratta dal 'Mein Kampf', teorizza il concetto nazista della 'grande menzogna' per manipolare le opinioni pubbliche." 
    },
    { 
        text: "Che fortuna per i governanti che gli uomini non pensano.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Dichiarazione cinica che svela il disprezzo profondo del dittatore tedesco per l'esercizio del pensiero critico dei cittadini." 
    },
    { 
        text: "Chi possiede la gioventù, conquista il futuro.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Citazione che riassume l'obbligo di indottrinamento assoluto dei giovani tedeschi nella Gioventù Hitleriana." 
    },
    { 
        text: "Tutta la propaganda deve essere popolare e adattarsi alla comprensione dei meno intelligenti.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Definisce la linea comunicativa del nazismo, incentrata su massiccia semplificazione e assenza di ragionamenti complessi." 
    },
    { 
        text: "È più difficile combattere contro la fede che contro la conoscenza.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Riflessione sulla potenza del fanatismo irrazionale rispetto alla verità e alle prove scientifiche." 
    },
    { 
        text: "Make the lie big, make it simple, keep saying it, and eventually they will believe it.", 
        isDuce: false, 
        author: "Apocrifa (Attribuita ad Adolf Hitler)", 
        context: "Slogan celebre ripreso e sintetizzato nei manuali di geopolitica del dopoguerra per descrivere le tecniche di manipolazione totalitaria." 
    },
    { 
        text: "Attraverso l’applicazione abile e costante della propaganda, la gente può essere fatta vedere il paradiso come inferno e l’inferno come paradiso.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Citazione estratta dal Mein Kampf che esprime una concezione scientifica e totalmente manipolatoria della comunicazione politica." 
    },
    { 
        text: "Il compito della propaganda non è la ricerca della verità, ma il successo.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Dichiarazione programmatica e pragmatica che colloca l'efficacia persuasiva dello slogan sopra ogni dovere di veridicità oggettiva." 
    },
    { 
        text: "Una dittatura deve apparire come un regime di pace mentre prepara la guerra.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Riflessione sulla politica estera nazista, volta a tranquillizzare con parole pacifiche l'opinione internazionale mentre la nazione procedeva al riarmo." 
    },
    { 
        text: "In Spagna sei cattolico o non sei niente.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Affermazione emblematica del dittatore spagnolo, che fondeva l'identità cattolica conservatrice e nazionalista." 
    },
    { 
        text: "Non crediamo nel governo attraverso l’urna elettorale.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Rifiuto economico e categorico del parlamentarismo democratico a favore di un regime autoritario guidato dall'ordine militare." 
    },
    { 
        text: "Uno stato totalitario armonizzerà in Spagna tutte le energie del paese.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Concetto franchista di 'armonizzazione statale' che presupponeva lo scioglimento forzato dei sindacati e delle organizzazioni indipendenti." 
    },
    { 
        text: "Sono stato nominato da Dio per salvare il mio paese.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Auto-legittimazione religiosa (il cosiddetto 'Caudillo de España por la Gracia de Dios') per blindare il proprio potere assoluto." 
    },
    { 
        text: "La difesa dell’ordine interno è la missione sacra delle forze armate.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Frase che sanziona l'uso dell'esercito nazionale non solo per la difesa esterna, ma come mezzo principale di repressione poliziesca interna." 
    },
    { 
        text: "Noi ci sforziamo di formare un solo fronte nazionale contro le logge giudaico‑massoniche e Mosca.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Rappresentazione complottista tipica del regime franchista, imperniata sulla persecuzione di massoni, liberali e comunisti." 
    },
    { 
        text: "Il segreto delle campagne contro la Spagna si spiega in due parole: massoneria e comunismo.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Semplificazione schematica e demonizzante utilizzata dal Caudillo per liquidare l'opinione pubblica democratica internazionale." 
    },
    { 
        text: "La dittatura è un male necessario.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Massima propagandistica per giustificare l'oppressione delle libertà come sacrificio supremo a tutela dell'unità nazionale." 
    },
    { 
        text: "Senza ordine non può esserci progresso.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Frase cardine dello sloganismo franchista per anteporre la repressione e il controllo poliziesco ai diritti individuali." 
    },
    { 
        text: "La nostra insurrezione ha un significato spagnolo; ogni popolo reagisce a modo suo alla minaccia di morte.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Franco presentava il colpo di stato del 1936 come reazione vitale di sopravvivenza biologica della nazione spagnola contro l'ideologia repubblicana." 
    },
    { 
        text: "Abbiamo strappato il materialismo marxista e disorientato la massoneria.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Dichiarazione che enfatizzava il carattere violentemente reazionario e restrittivo della guerra civile condotta contro i laici e la sinistra." 
    },
    { 
        text: "La Spagna deve estirpare questi due mali dalla propria terra.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Rivolto contro comunismo e massoneria, incitava a una vera e propria epurazione e purificazione ideologica e di pensiero del paese." 
    },
    { 
        text: "La nostra lotta è una Crociata; come soldati di Dio portiamo con noi l'evangelizzazione del mondo.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Questa frase sottolinea la profonda sacralizzazione bellica e la legittimazione quasi religiosa del regime dittatoriale franchista." 
    },
    { 
        text: "Il popolo spagnolo è smemorato e vive nel momento; dobbiamo ricordargli la catena di eroi e sacrifici.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Richiamo propagandistico conservatore al culto del passato eroico e del sacrificio militare, inteso come collante sociale della nazione." 
    },
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
    },

    // --- FATTI STORICI DI ALTRI DITTATORI ---
    { 
        text: "Fondò il Partito Nazionalsocialista Tedesco (NSDAP) e ne divenne leader.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "La NSDAP fu lo strumento di ascesa del nazismo in Germania, parallelamente all'ascesa del PNF guidato da Mussolini in Italia." 
    },
    { 
        text: "Assunse la carica di cancelliere nel 1933 e trasformò la Germania in dittatura a partito unico.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Nominato cancelliere nel gennaio 1933, rase al suolo la Repubblica democratica di Weimar tramite decreti speciali." 
    },
    { 
        text: "Promosse leggi razziali contro gli ebrei, come le Leggi di Norimberga del 1935.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "Le leggi di Norimberga istituirono la classificazione e la discriminazione razziale, primo passo legale verso lo sterminio sistematico." 
    },
    { 
        text: "Avviò una politica di riarmo e di aggressioni territoriali (Rhineland, Austria, Sudeti).", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "La aggressiva politica pangermanista violò sistematicamente i trattati internationalen destabilizzando l'assetto europeo." 
    },
    { 
        text: "Scatenò la Seconda guerra mondiale invadendo la Polonia nel 1939.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "L'aggressione della Polonia forzò Regno Unito e Francia a dichiarare guerra alla Germania, innescando il conflitto mondiale." 
    },
    { 
        text: "Organizzò la persecuzione e lo sterminio sistematico degli ebrei europei (Shoah).", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "La persecuzione portò alla deportazione e allo sterminio industriale pianificato di milioni di persone nei campi di concentramento." 
    },
    { 
        text: "Instaurò un intenso culto della personalità, con simboli, saluti e raduni di massa.", 
        isDuce: false, 
        author: "Adolf Hitler", 
        context: "La grandiosa macchina rituale e scenografica del Nazismo imitava in parte la coreografia emotiva e i raduni introdotti dal Fascismo italiano." 
    },
    { 
        text: "Guidò il golpe militare contro la Seconda Repubblica spagnola nel 1936.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "L'ammutinamento militare guidato da Franco scatenò la sanguinosa guerra civile spagnola durata fino al 1939." 
    },
    { 
        text: "Con l’appoggio di Italia fascista e Germania nazista vinse la Guerra civile e instaurò una dittatura.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Sostenuto dalle aviazioni e truppe dell'Asse, Franco debellò la Repubblica instaurando un regime che durò fino al 1975." 
    },
    { 
        text: "Represse brutalmente oppositori politici, sindacalisti e minoranze nazionali.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "La durissima repressione post-bellica del franchismo ('el Terror Blanco') portò alla fucilazione o incarcerazione di decine di migliaia di repubblicani." 
    },
    { 
        text: "Adottò un forte nazional‑cattolicesimo, subordinando cultura e costumi alla Chiesa e al regime.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Il forte sodalizio ideologico con la Chiesa cattolica reazionaria fu un pilastro fondamentale di legittimazione della dittatura franchista." 
    },
    { 
        text: "Allineò la politica spagnola con l’Asse durante la guerra, pur mantenendo una formale neutralità.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "Franco inviò truppe di volontari a sostegno della Germania sul fronte orientale (Divisione Blu), pur non entrando ufficialmente nel conflitto." 
    },
    { 
        text: "Partecipò alla persecuzione di massoni e comunisti, accusandoli di complotti contro la Spagna.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "La dittatura inserì l'anticomunismo e l'antimassoneria tra i principi base della propria azione repressione di polizia." 
    },
    { 
        text: "Mantenne il divieto di partiti politici e sindacati liberi per decenni.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "La Spagna fu governata in modo assoluto e centralizzato fino alla transizione democratica avvenuta solo dopo il 1975." 
    },
    { 
        text: "Utilizzò la censura, la propaganda e l’educazione per creare un’immagine eroica del “Caudillo”.", 
        isDuce: false, 
        author: "Francisco Franco", 
        context: "La figura monumentale di Franco veniva celebrata in modo sistematico dai media di regime, imitando l'iconografia del Duce e del Führer." 
    },

    // --- MITI STORICI SMENTITI (NON DUCE) ---
    { 
        text: "Mussolini ha fatto sì che i treni arrivassero puntuali.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Studi storici provano che i principali ammodernamenti ferroviari avvennero prima del fascismo, e la puntualità rimase assai imperfetta; il mito fu diffuso unicamente dalla propaganda." 
    },
    { 
        text: "Il fascismo dovrebbe più propriamente chiamarsi corporativismo perché è la fusione tra Stato e potere corporativo.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Questa famosa citazione, attribuita falsamente a Mussolini, non compare in alcun discorso ufficiale o nell'Enciclopedia Italiana; è un falso circolato a fine Novecento." 
    },
    { 
        text: "Mussolini avrebbe inventato da solo il concetto moderno di corporativismo.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "La dottrina corporativa si sviluppò molto prima da correnti sindacaliste, cattoliche e nazionaliste francesi e italiane; Mussolini si limitò ad assimilarla." 
    },
    { 
        text: "La Marcia su Roma fu una grande insurrezione militare che conquistò Roma con la forza.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Le ricerche dimostrano che la marcia fu una parata di pressione; Mussolini prese legalmente il potere solo dopo la decisione formale del re di nominarlo." 
    },
    { 
        text: "L'Italia sotto Mussolini fu un modello di efficienza amministrativa rispetto alle democrazie.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Nonostante gli altissimi slogan dell'efficienza, l'apparato statale rimase disorganizzato, inefficiente e clientelare, provocando gravissimi fallimenti militari." 
    },
    { 
        text: "Mussolini sarebbe stato apertamente antisemita fin dagli inizi del fascismo.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Nei primi anni del regime Mussolini oscillò ampiamente, sminuendo persino il razzismo biologico nel 1932; l'antisemitismo di Stato si affermò solo nel 1938." 
    },
    { 
        text: "Il fascismo italiano fu un sistema 'mite' rispetto al nazismo, quasi privo di violenze gravi.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "La storiografia evidenzia la sistematica eliminazione fisica degli oppositori, le dure leggi poliziesche, le persecuzioni razziali e il brutale colonialismo in Africa." 
    },
    { 
        text: "Mussolini fu sempre coerente come socialista rivoluzionario.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Nel 1915 Mussolini rinnegò totalmente il socialismo internazionalista caldeggiando l'entrata in guerra dell'Italia, portando alla sua espulsione dal PSI." 
    },
    { 
        text: "Il fascismo ha creato da zero la modernizzazione economica italiana.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Gran parte dei progetti d'infrastrutture, comprese le bonifiche e i progetti sanitari, erano già avviati dall'Italia liberale precedente." 
    },
    { 
        text: "Mussolini avrebbe garantito prosperità stabile e benessere diffuso agli italiani.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "L'autarchia forzata e i pesantissimi oneri delle continue guerre ridussero drasticamente i salari degli operai, provocando razionamenti e disagi diffusi." 
    },
    { 
        text: "Il Duce fu sempre popolare fino alla caduta improvvisa del 1943.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "I rapporti di polizia mostrano una progressiva perdita di consenso già dalla fine degli anni Trenta, esplosa con la disastrosa entrata nella Seconda Guerra Mondiale." 
    },
    { 
        text: "La Repubblica Sociale Italiana (RSI) fu uno Stato pienamente indipendente.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Gli studi storiografici hanno dimostrato come Salò fosse un mero 'Stato fantoccio' guidato dall'occupante militare nazista, con un'autonomia limitata." 
    },
    { 
        text: "Mussolini cercò fino alla fine una via di pace separata con gli Alleati.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Le fonti dimostrano che Mussolini non avviò trattative di pace separata reali e tentò di fuggire travestito verso la Svizzera prima di venire catturato." 
    },
    { 
        text: "Il fascismo italiano fu essenzialmente 'apolitico', interessato solo all’ordine, non all’ideologia.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Saggi come 'La Dottrina del Fascismo' illustrano un'articolata base ideologica nazionalista, totalitaria ed espansionista estremamente definita." 
    },
    { 
        text: "La famosa frase sul corporativismo che associa la fusione dello Stato al potere societario prova che il fascismo coincide con il potere delle multinazionali.", 
        isDuce: false, 
        author: "Mito Smentito", 
        context: "Il corporativismo consisteva in sindacati di settore controllati gerarchicamente dallo Stato totalitario, non in un libero mercato per le multinazionali moderne." 
    },
    { 
        text: "Mussolini ha introdotto la tredicesima mensilità per tutti i lavoratori italiani.", 
        isDuce: false, 
        author: "Mito Smentito / Falso storico", 
        context: "Nel 1937 il regime concesse la 'gratifica natalizia' solo agli impiegati industriali (colletti bianchi). L'estensione obbligatoria e universale a tutti gli operai avvenne solo con l'accordo del 27 ottobre 1946 sotto l'Italia repubblicana." 
    }
];