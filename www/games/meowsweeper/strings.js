/**
 * Every word the game shows, in six languages. English is the source; a key
 * missing in another language falls back to it. The shell's own screens
 * (lobby, Shop, cards) are still English until the shell gets its string
 * table: see the design doc, "Engine mapping".
 */

export const LANGS = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Español' },
  { id: 'pt', name: 'Português' },
  { id: 'hi', name: 'हिन्दी' },
  { id: 'de', name: 'Deutsch' },
  { id: 'fr', name: 'Français' },
];

const en = {
  perkPatch: 'Your first friend. Classic play.',
  cushionsN: '{a} / {b} cushions',
  level: 'Level {n}', hard: 'Hard', boss: 'Chapter finale', catsLeft: 'Cats left', language: 'Language',
  paw: 'Paw', sniff: 'Sniff', scan: 'Whisker Scan', catnip: 'Catnip', hint: 'Hint', free: 'Free',
  tip1: 'Tap a cushion! Its number tells how many cats sleep around it.',
  tip3: 'Cat under there? Switch to Mark, or press and hold, to paw it.',
  tipHint: 'Stuck? Hint makes a safe cushion glow.',
  tip5: 'All cats around a number marked? Tap the number to open the rest!',
  tip6: 'New: Sniff! It finds a sleeping cat and paws it for you.',
  tip12: 'Hard level! More cats, double coins.',
  tip15: 'New: Whisker Scan! Tap a spot to check for cats around it.',
  tip20: 'Wooden furniture is safe. No cat hides under it.',
  tip40: 'New: Catnip! It paws every cat in a big 5×5 patch.',
  tip45: 'Yarn knot! Tap once to untie it, again to open it.',
  target: 'Tap a cushion to use {what}', scanYes: 'A cat is hiding in there!', scanNo: 'No cats in there.',
  woke: 'You woke a cat!', guard: 'A hiss! A cat sleeps there.',
  winHead: 'Purrfect!', winHeadOk: 'Great job!', winKicker: 'All cushions clear', winTitle: 'Level {n} complete',
  coins: '+{n} coins', perfect: 'No cats woken: +{n} coins', chest: 'Chapter chest: +{n} coins', next: 'Next level',
  heartKicker: 'Out of hearts', heartTitle: 'One more heart?', heartLine: 'Keep this board for {n} coins.',
  heartOk: 'Buy a heart', heartWhat: 'an extra heart', heartAd: 'Watch an ad · free heart', boosterAd: 'Watch an ad · free use',
  lostKicker: 'Oh no!', lostTitle: 'Level {n} lost', lostLine: 'The cats are wide awake! Tuck them in and have another go.', retry: 'Try again',
  blurb: 'Uncover every cushion without waking a sleeping cat.',
  tileLevel: 'level', tileStars: 'stars', tilePerfect: 'perfect levels', summary: 'Level {n} · {ch}',
  taskCush: 'Uncover {n} cushions', taskPaws: 'Place {n} paw prints', taskWins: 'Win {n} levels',
  taskChords: 'Open cushions from a number {n} times', taskPerfect: 'Win {n} levels without waking a cat', taskHard: 'Win a Hard level',
  perkMittens: 'Sniff costs 40 instead of 60.', perkSoot: 'From level 7, once a level, stops you from waking a cat.',
  perkMarmalade: 'Start every level with 4 hearts.', perkPepper: '25% more coins from levels.', perkBiscuit: 'Whisker Scan covers 4×4.',
  fabGingham: 'Gingham', fabKnit: 'Knit', fabVelvet: 'Velvet', fabPatchwork: 'Patchwork', fabStarry: 'Starry night',
  fabNote: 'Cushion fabric',
  ch: ['Foyer', 'Laundry Room', 'Playroom', 'Rose Garden', 'Box Room', 'Pantry', 'Terrace Balcony', 'Courtyard', 'Grand Library', 'Conservatory', 'Railway Halt', 'Boathouse', 'Ballroom', 'Wine Cellar', 'Moonlit Garden', 'Great Hall', 'Clock Tower', "The Duchess's Suite", 'Observatory', 'The Attic'],
};

const es = {
  perkPatch: 'Tu primer amigo. Juego clásico.',
  cushionsN: '{a} / {b} cojines',
  tipHint: '¿Atascado? La Pista hace brillar un cojín seguro.',
  level: 'Nivel {n}', hard: 'Difícil', boss: 'Final del capítulo', catsLeft: 'Gatos restantes', language: 'Idioma',
  paw: 'Huella', sniff: 'Olfato', scan: 'Radar de bigotes', catnip: 'Hierba gatera', hint: 'Pista', free: 'Gratis',
  tip1: '¡Toca un cojín! Su número dice cuántos gatos duermen alrededor.',
  tip3: '¿Un gato ahí debajo? Cambia a Marcar, o mantén pulsado, para ponerle una huella.',
  tip5: '¿Todos los gatos de un número marcados? ¡Toca el número para abrir el resto!',
  tip6: 'Nuevo: ¡Olfato! Encuentra un gato dormido y lo marca por ti.',
  tip12: '¡Nivel difícil! Más gatos, monedas dobles.',
  tip15: 'Nuevo: ¡Radar de bigotes! Toca un sitio para buscar gatos a su alrededor.',
  tip20: 'Los muebles de madera son seguros. Ningún gato se esconde debajo.',
  tip40: 'Nuevo: ¡Hierba gatera! Marca todos los gatos de una zona de 5×5.',
  tip45: '¡Nudo de lana! Toca una vez para deshacerlo y otra para abrirlo.',
  target: 'Toca un cojín para usar {what}', scanYes: '¡Ahí se esconde un gato!', scanNo: 'Ahí no hay gatos.',
  woke: '¡Despertaste a un gato!', guard: 'Soot bufó: ¡ahí duerme un gato!',
  winHead: '¡Purrfecto!', winHeadOk: '¡Bien hecho!', winKicker: 'Todos los cojines despejados', winTitle: 'Nivel {n} completado',
  coins: '+{n} monedas', perfect: 'Ningún gato despertado: +{n} monedas', chest: 'Cofre del capítulo: +{n} monedas', next: 'Siguiente nivel',
  heartKicker: 'Sin corazones', heartTitle: '¿Un corazón más?', heartLine: 'Conserva este tablero por {n} monedas.',
  heartOk: 'Comprar corazón', heartWhat: 'un corazón extra', heartAd: 'Ver un anuncio · corazón gratis', boosterAd: 'Ver un anuncio · uso gratis',
  lostKicker: 'Demasiado ruido', lostTitle: 'Nivel {n} perdido', lostLine: 'Los gatos están bien despiertos. Arrópalos e inténtalo de nuevo.', retry: 'Reintentar',
  blurb: 'Destapa todos los cojines sin despertar a un gato dormido.',
  tileLevel: 'nivel', tileStars: 'estrellas', tilePerfect: 'niveles perfectos', summary: 'Nivel {n} · {ch}',
  taskCush: 'Destapa {n} cojines', taskPaws: 'Coloca {n} huellas', taskWins: 'Gana {n} niveles',
  taskChords: 'Abre cojines desde un número {n} veces', taskPerfect: 'Gana {n} niveles sin despertar a un gato', taskHard: 'Gana un nivel difícil',
  perkMittens: 'Olfato cuesta 40 en vez de 60.', perkSoot: 'Una vez por nivel, evita que despiertes a un gato.',
  perkMarmalade: 'Empieza cada nivel con 4 corazones.', perkPepper: '25% más monedas por nivel.', perkBiscuit: 'El Radar de bigotes cubre 4×4.',
  fabGingham: 'Vichy', fabKnit: 'Punto', fabVelvet: 'Terciopelo', fabPatchwork: 'Retazos', fabStarry: 'Noche estrellada',
  fabNote: 'Tela de los cojines',
  ch: ['Vestíbulo', 'Lavadero', 'Cuarto de juegos', 'Rosaleda', 'Trastero', 'Despensa', 'Balcón-terraza', 'Patio', 'Gran biblioteca', 'Invernadero', 'Apeadero', 'Casa de botes', 'Salón de baile', 'Bodega', 'Jardín de luna', 'Gran salón', 'Torre del reloj', 'Aposentos de la duquesa', 'Observatorio', 'El desván'],
};

const pt = {
  perkPatch: 'Seu primeiro amigo. Jogo clássico.',
  cushionsN: '{a} / {b} almofadas',
  tipHint: 'Travou? A Dica faz uma almofada segura brilhar.',
  level: 'Nível {n}', hard: 'Difícil', boss: 'Final do capítulo', catsLeft: 'Gatos restantes', language: 'Idioma',
  paw: 'Patinha', sniff: 'Faro', scan: 'Radar de bigodes', catnip: 'Erva-de-gato', hint: 'Dica', free: 'Grátis',
  tip1: 'Toque numa almofada! O número diz quantos gatos dormem ao redor.',
  tip3: 'Gato aí embaixo? Mude para Marcar, ou segure, para pôr uma patinha.',
  tip5: 'Todos os gatos de um número marcados? Toque no número para abrir o resto!',
  tip6: 'Novo: Faro! Ele acha um gato dormindo e marca para você.',
  tip12: 'Nível difícil! Mais gatos, moedas em dobro.',
  tip15: 'Novo: Radar de bigodes! Toque num lugar para procurar gatos ao redor.',
  tip20: 'Os móveis de madeira são seguros. Nenhum gato se esconde ali.',
  tip40: 'Novo: Erva-de-gato! Marca todos os gatos numa área 5×5.',
  tip45: 'Nó de lã! Toque uma vez para desatar e outra para abrir.',
  target: 'Toque numa almofada para usar {what}', scanYes: 'Tem um gato escondido aí!', scanNo: 'Nenhum gato aí.',
  woke: 'Você acordou um gato!', guard: 'Soot chiou: tem um gato dormindo aí!',
  winHead: 'Purrfeito!', winHeadOk: 'Muito bem!', winKicker: 'Todas as almofadas livres', winTitle: 'Nível {n} concluído',
  coins: '+{n} moedas', perfect: 'Nenhum gato acordado: +{n} moedas', chest: 'Baú do capítulo: +{n} moedas', next: 'Próximo nível',
  heartKicker: 'Sem corações', heartTitle: 'Mais um coração?', heartLine: 'Mantenha este tabuleiro por {n} moedas.',
  heartOk: 'Comprar coração', heartWhat: 'um coração extra', heartAd: 'Ver um anúncio · coração grátis', boosterAd: 'Ver um anúncio · uso grátis',
  lostKicker: 'Barulho demais', lostTitle: 'Nível {n} perdido', lostLine: 'Os gatos estão bem acordados. Ponha-os para dormir e tente de novo.', retry: 'Tentar de novo',
  blurb: 'Descubra todas as almofadas sem acordar um gato.',
  tileLevel: 'nível', tileStars: 'estrelas', tilePerfect: 'níveis perfeitos', summary: 'Nível {n} · {ch}',
  taskCush: 'Descubra {n} almofadas', taskPaws: 'Coloque {n} patinhas', taskWins: 'Vença {n} níveis',
  taskChords: 'Abra almofadas a partir de um número {n} vezes', taskPerfect: 'Vença {n} níveis sem acordar um gato', taskHard: 'Vença um nível difícil',
  perkMittens: 'Faro custa 40 em vez de 60.', perkSoot: 'Uma vez por nível, impede que você acorde um gato.',
  perkMarmalade: 'Comece cada nível com 4 corações.', perkPepper: '25% mais moedas por nível.', perkBiscuit: 'O Radar de bigodes cobre 4×4.',
  fabGingham: 'Xadrez', fabKnit: 'Tricô', fabVelvet: 'Veludo', fabPatchwork: 'Retalhos', fabStarry: 'Noite estrelada',
  fabNote: 'Tecido das almofadas',
  ch: ['Saguão', 'Lavanderia', 'Brinquedoteca', 'Roseiral', 'Quarto de despejo', 'Despensa', 'Varanda', 'Pátio', 'Grande biblioteca', 'Estufa', 'Estação particular', 'Casa de barcos', 'Salão de baile', 'Adega', 'Jardim ao luar', 'Grande salão', 'Torre do relógio', 'Aposentos da duquesa', 'Observatório', 'O sótão'],
};

const hi = {
  perkPatch: 'तुम्हारी पहली दोस्त। सीधा-सादा खेल।',
  cushionsN: '{a} / {b} गद्दियाँ',
  tipHint: 'अटक गए? संकेत एक सुरक्षित गद्दी को चमका देता है।',
  level: 'लेवल {n}', hard: 'कठिन', boss: 'अध्याय का अंत', catsLeft: 'बची बिल्लियाँ', language: 'भाषा',
  paw: 'पंजा', sniff: 'सूँघो', scan: 'मूँछ स्कैन', catnip: 'कैटनिप', hint: 'संकेत', free: 'मुफ़्त',
  tip1: 'किसी गद्दी पर टैप करो! उसकी संख्या बताती है कि आसपास कितनी बिल्लियाँ सो रही हैं।',
  tip3: 'नीचे बिल्ली है? निशान पर जाओ, या दबाए रखो, और पंजा लगा दो।',
  tip5: 'किसी संख्या की सारी बिल्लियों पर निशान लग गया? बाकी खोलने के लिए संख्या पर टैप करो!',
  tip6: 'नया: सूँघो! यह एक सोती बिल्ली ढूँढकर उस पर पंजा लगा देता है।',
  tip12: 'कठिन लेवल! ज़्यादा बिल्लियाँ, दोगुने सिक्के।',
  tip15: 'नया: मूँछ स्कैन! किसी जगह टैप करो और आसपास बिल्लियाँ जाँचो।',
  tip20: 'लकड़ी का फ़र्नीचर सुरक्षित है। उसके नीचे कोई बिल्ली नहीं छिपती।',
  tip40: 'नया: कैटनिप! यह 5×5 हिस्से की हर बिल्ली पर पंजा लगा देता है।',
  tip45: 'ऊन की गाँठ! एक टैप से खोलो, दूसरे से गद्दी हटाओ।',
  target: '{what} के लिए किसी गद्दी पर टैप करें', scanYes: 'यहाँ एक बिल्ली छिपी है!', scanNo: 'यहाँ कोई बिल्ली नहीं।',
  woke: 'आपने एक बिल्ली जगा दी!', guard: 'सूट ने चेताया: वहाँ बिल्ली सो रही है!',
  winHead: 'शानदार!', winHeadOk: 'बहुत बढ़िया!', winKicker: 'सारी गद्दियाँ साफ़', winTitle: 'लेवल {n} पूरा',
  coins: '+{n} सिक्के', perfect: 'कोई बिल्ली नहीं जागी: +{n} सिक्के', chest: 'अध्याय का ख़ज़ाना: +{n} सिक्के', next: 'अगला लेवल',
  heartKicker: 'दिल ख़त्म', heartTitle: 'एक और दिल?', heartLine: '{n} सिक्कों में यही बोर्ड जारी रखें।',
  heartOk: 'दिल ख़रीदें', heartWhat: 'एक और दिल', heartAd: 'विज्ञापन देखें · मुफ़्त दिल', boosterAd: 'विज्ञापन देखें · मुफ़्त उपयोग',
  lostKicker: 'बहुत शोर', lostTitle: 'लेवल {n} हार गए', lostLine: 'बिल्लियाँ पूरी तरह जाग गईं। उन्हें सुलाकर फिर कोशिश करें।', retry: 'फिर कोशिश करें',
  blurb: 'किसी सोती बिल्ली को जगाए बिना हर गद्दी हटाएँ।',
  tileLevel: 'लेवल', tileStars: 'सितारे', tilePerfect: 'परफ़ेक्ट लेवल', summary: 'लेवल {n} · {ch}',
  taskCush: '{n} गद्दियाँ हटाएँ', taskPaws: '{n} पंजे के निशान लगाएँ', taskWins: '{n} लेवल जीतें',
  taskChords: 'संख्या पर टैप करके {n} बार गद्दियाँ खोलें', taskPerfect: 'बिल्ली जगाए बिना {n} लेवल जीतें', taskHard: 'एक कठिन लेवल जीतें',
  perkMittens: 'सूँघो 60 की जगह 40 सिक्कों का।', perkSoot: 'हर लेवल में एक बार बिल्ली जगाने से बचाता है।',
  perkMarmalade: 'हर लेवल 4 दिलों से शुरू करें।', perkPepper: 'लेवल से 25% ज़्यादा सिक्के।', perkBiscuit: 'मूँछ स्कैन 4×4 क्षेत्र देखता है।',
  fabGingham: 'चेक', fabKnit: 'ऊनी', fabVelvet: 'मख़मल', fabPatchwork: 'पैचवर्क', fabStarry: 'तारों भरी रात',
  fabNote: 'गद्दी का कपड़ा',
  ch: ['प्रवेश कक्ष', 'धुलाई कक्ष', 'खेल कक्ष', 'गुलाब बाग़', 'सामान कक्ष', 'भंडार घर', 'छज्जा', 'आँगन', 'बड़ा पुस्तकालय', 'शीशघर', 'रेलवे पड़ाव', 'नाव घर', 'नृत्य कक्ष', 'तहख़ाना', 'चाँदनी बाग़', 'बड़ा हॉल', 'घंटाघर', 'डचेस का कक्ष', 'वेधशाला', 'अटारी'],
};

const de = {
  perkPatch: 'Dein erster Freund. Klassisches Spiel.',
  cushionsN: '{a} / {b} Kissen',
  tipHint: 'Du steckst fest? Der Tipp lässt ein sicheres Kissen leuchten.',
  level: 'Level {n}', hard: 'Schwer', boss: 'Kapitelfinale', catsLeft: 'Katzen übrig', language: 'Sprache',
  paw: 'Pfote', sniff: 'Schnuppern', scan: 'Schnurrhaar-Scan', catnip: 'Katzenminze', hint: 'Tipp', free: 'Gratis',
  tip1: 'Tippe auf ein Kissen! Die Zahl sagt, wie viele Katzen drumherum schlafen.',
  tip3: 'Katze darunter? Wechsle zu Markieren oder halte gedrückt, um sie zu markieren.',
  tip5: 'Alle Katzen um eine Zahl markiert? Tippe auf die Zahl, um den Rest zu öffnen!',
  tip6: 'Neu: Schnuppern! Es findet eine schlafende Katze und markiert sie für dich.',
  tip12: 'Schweres Level! Mehr Katzen, doppelte Münzen.',
  tip15: 'Neu: Schnurrhaar-Scan! Tippe auf eine Stelle und prüfe, ob drumherum Katzen sind.',
  tip20: 'Holzmöbel sind sicher. Darunter versteckt sich keine Katze.',
  tip40: 'Neu: Katzenminze! Sie markiert jede Katze in einem 5×5-Feld.',
  tip45: 'Wollknoten! Einmal tippen zum Lösen, noch einmal zum Öffnen.',
  target: 'Tippe auf ein Kissen für {what}', scanYes: 'Hier versteckt sich eine Katze!', scanNo: 'Keine Katzen hier.',
  woke: 'Du hast eine Katze geweckt!', guard: 'Soot faucht: Dort schläft eine Katze!',
  winHead: 'Schnurrfekt!', winHeadOk: 'Gut gemacht!', winKicker: 'Alle Kissen frei', winTitle: 'Level {n} geschafft',
  coins: '+{n} Münzen', perfect: 'Keine Katze geweckt: +{n} Münzen', chest: 'Kapiteltruhe: +{n} Münzen', next: 'Nächstes Level',
  heartKicker: 'Keine Herzen mehr', heartTitle: 'Noch ein Herz?', heartLine: 'Behalte dieses Brett für {n} Münzen.',
  heartOk: 'Herz kaufen', heartWhat: 'ein Extraherz', heartAd: 'Werbung ansehen · Herz gratis', boosterAd: 'Werbung ansehen · gratis nutzen',
  lostKicker: 'Zu laut', lostTitle: 'Level {n} verloren', lostLine: 'Die Katzen sind hellwach. Deck sie zu und versuch es noch einmal.', retry: 'Noch einmal',
  blurb: 'Decke jedes Kissen auf, ohne eine schlafende Katze zu wecken.',
  tileLevel: 'Level', tileStars: 'Sterne', tilePerfect: 'perfekte Level', summary: 'Level {n} · {ch}',
  taskCush: 'Decke {n} Kissen auf', taskPaws: 'Setze {n} Pfotenabdrücke', taskWins: 'Gewinne {n} Level',
  taskChords: 'Öffne {n}-mal Kissen über eine Zahl', taskPerfect: 'Gewinne {n} Level, ohne eine Katze zu wecken', taskHard: 'Gewinne ein schweres Level',
  perkMittens: 'Schnuppern kostet 40 statt 60.', perkSoot: 'Verhindert einmal pro Level, dass du eine Katze weckst.',
  perkMarmalade: 'Starte jedes Level mit 4 Herzen.', perkPepper: '25 % mehr Münzen pro Level.', perkBiscuit: 'Der Schnurrhaar-Scan deckt 4×4 ab.',
  fabGingham: 'Vichykaro', fabKnit: 'Strick', fabVelvet: 'Samt', fabPatchwork: 'Patchwork', fabStarry: 'Sternennacht',
  fabNote: 'Kissenstoff',
  ch: ['Eingangshalle', 'Waschküche', 'Spielzimmer', 'Rosengarten', 'Abstellkammer', 'Speisekammer', 'Balkonterrasse', 'Innenhof', 'Große Bibliothek', 'Wintergarten', 'Bahnhaltepunkt', 'Bootshaus', 'Ballsaal', 'Weinkeller', 'Mondgarten', 'Große Halle', 'Uhrturm', 'Gemächer der Herzogin', 'Sternwarte', 'Der Dachboden'],
};

const fr = {
  perkPatch: 'Ton premier ami. Jeu classique.',
  cushionsN: '{a} / {b} coussins',
  tipHint: 'Bloqué ? L’Indice fait briller un coussin sûr.',
  level: 'Niveau {n}', hard: 'Difficile', boss: 'Fin du chapitre', catsLeft: 'Chats restants', language: 'Langue',
  paw: 'Patte', sniff: 'Flair', scan: 'Radar à moustaches', catnip: 'Herbe à chat', hint: 'Indice', free: 'Gratuit',
  tip1: 'Touche un coussin ! Son chiffre dit combien de chats dorment autour.',
  tip3: 'Un chat là-dessous ? Passe en Marquer, ou appuie longuement, pour poser une patte.',
  tip5: 'Tous les chats d’un chiffre marqués ? Touche le chiffre pour ouvrir le reste !',
  tip6: 'Nouveau : Flair ! Il trouve un chat endormi et le marque pour toi.',
  tip12: 'Niveau difficile ! Plus de chats, pièces doublées.',
  tip15: 'Nouveau : Radar à moustaches ! Touche un endroit pour chercher des chats autour.',
  tip20: 'Les meubles en bois sont sûrs. Aucun chat ne s’y cache.',
  tip40: 'Nouveau : Herbe à chat ! Elle marque tous les chats d’une zone 5×5.',
  tip45: 'Nœud de laine ! Touche une fois pour le défaire, encore pour l’ouvrir.',
  target: 'Touchez un coussin pour utiliser {what}', scanYes: 'Un chat se cache ici !', scanNo: 'Aucun chat ici.',
  woke: 'Vous avez réveillé un chat !', guard: 'Soot a craché : un chat dort là !',
  winHead: 'Ronronnant !', winHeadOk: 'Bien joué !', winKicker: 'Tous les coussins dégagés', winTitle: 'Niveau {n} terminé',
  coins: '+{n} pièces', perfect: 'Aucun chat réveillé : +{n} pièces', chest: 'Coffre du chapitre : +{n} pièces', next: 'Niveau suivant',
  heartKicker: 'Plus de cœurs', heartTitle: 'Encore un cœur ?', heartLine: 'Gardez ce plateau pour {n} pièces.',
  heartOk: 'Acheter un cœur', heartWhat: 'un cœur en plus', heartAd: 'Regarder une pub · cœur gratuit', boosterAd: 'Regarder une pub · usage gratuit',
  lostKicker: 'Trop de bruit', lostTitle: 'Niveau {n} perdu', lostLine: 'Les chats sont bien réveillés. Bordez-les et réessayez.', retry: 'Réessayer',
  blurb: 'Découvrez chaque coussin sans réveiller un chat endormi.',
  tileLevel: 'niveau', tileStars: 'étoiles', tilePerfect: 'niveaux parfaits', summary: 'Niveau {n} · {ch}',
  taskCush: 'Découvrez {n} coussins', taskPaws: 'Posez {n} empreintes de patte', taskWins: 'Gagnez {n} niveaux',
  taskChords: 'Ouvrez des coussins depuis un chiffre {n} fois', taskPerfect: 'Gagnez {n} niveaux sans réveiller un chat', taskHard: 'Gagnez un niveau difficile',
  perkMittens: 'Flair coûte 40 au lieu de 60.', perkSoot: 'Une fois par niveau, vous empêche de réveiller un chat.',
  perkMarmalade: 'Commencez chaque niveau avec 4 cœurs.', perkPepper: '25 % de pièces en plus par niveau.', perkBiscuit: 'Le Radar à moustaches couvre 4×4.',
  fabGingham: 'Vichy', fabKnit: 'Tricot', fabVelvet: 'Velours', fabPatchwork: 'Patchwork', fabStarry: 'Nuit étoilée',
  fabNote: 'Tissu des coussins',
  ch: ['Vestibule', 'Buanderie', 'Salle de jeux', 'Roseraie', 'Débarras', 'Garde-manger', 'Terrasse', 'Cour', 'Grande bibliothèque', 'Jardin d’hiver', 'Halte ferroviaire', 'Hangar à bateaux', 'Salle de bal', 'Cave à vin', 'Jardin de lune', 'Grande salle', 'Tour de l’horloge', 'Appartements de la duchesse', 'Observatoire', 'Le grenier'],
};

const TABLES = { en, es, pt, hi, de, fr };
const KEY = 'meowsweeper.lang';

/**
 * A shell with languages of its own (1.23.0 on) puts the app's language on
 * <html lang> before this file runs, and that is the one to follow. An older
 * shell leaves the page in English, and the game then keeps its own choice.
 */
function shellLang() {
  try {
    const page = globalThis.document?.documentElement?.lang || '';
    // The shell sets the page's language from Settings → Language; follow it, and
    // forget a choice an earlier build of the game kept for itself.
    if (TABLES[page]) { localStorage.removeItem(KEY); return page; }
  } catch { /* no storage */ }
  return null;
}

function initial() {
  const fromShell = shellLang();
  if (fromShell) return fromShell;
  try { const s = localStorage.getItem(KEY); if (s && TABLES[s]) return s; } catch { /* no storage */ }
  const nav = (globalThis.navigator?.language || 'en').slice(0, 2).toLowerCase();
  return TABLES[nav] ? nav : 'en';
}

let lang = initial();
export const getLang = () => lang;
export function setLang(id, { remember = true } = {}) {
  if (!TABLES[id]) return;
  lang = id;
  if (!remember) return;
  try { localStorage.setItem(KEY, id); } catch { /* no storage */ }
}

export function t(key, vars = {}) {
  const s = TABLES[lang][key] ?? en[key] ?? key;
  return String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}
export const chapterName = (i) => (TABLES[lang].ch || en.ch)[i - 1] || en.ch[i - 1];
