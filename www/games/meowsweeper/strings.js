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
  level: 'Level {n}', hard: 'Hard', boss: 'Chapter finale', catsLeft: 'Cats left', language: 'Language',
  paw: 'Paw', sniff: 'Sniff', scan: 'Whisker Scan', catnip: 'Catnip', free: 'Free',
  tip1: 'Tap a cushion. A number counts the sleeping cats touching it.',
  tip3: 'Long-press a cushion, or switch on Paw, to mark a sleeping cat.',
  tip5: 'Tap a number once all its cats are marked to open the rest.',
  tip6: 'Stuck? Sniff opens a safe cushion for you.',
  tip12: 'Hard level: more cats, double coins.',
  tip15: 'Whisker Scan tells you if a cat hides in a 3×3 area.',
  tip20: 'Wooden blocks are just furniture. Nothing hides there.',
  tip40: 'Catnip marks every cat in a 5×5 area.',
  tip45: 'Yarn knots need two taps: one to untie, one to open.',
  target: 'Tap a cushion to use {what}', scanYes: 'A cat is hiding in there!', scanNo: 'No cats in there.',
  woke: 'You woke a cat!', guard: 'Soot hissed: a cat sleeps there!',
  winHead: 'Purrfect!', winHeadOk: 'Well done!', winKicker: 'All cushions clear', winTitle: 'Level {n} complete',
  coins: '+{n} coins', perfect: 'No cats woken: +{n} coins', chest: 'Chapter chest: +{n} coins', next: 'Next level',
  heartKicker: 'Out of hearts', heartTitle: 'One more heart?', heartLine: 'Keep this board for {n} coins.',
  heartOk: 'Buy a heart', heartWhat: 'an extra heart', heartAd: 'Watch an ad · free heart', boosterAd: 'Watch an ad · free use',
  lostKicker: 'Too noisy', lostTitle: 'Level {n} lost', lostLine: 'The cats are wide awake. Tuck them in and try again.', retry: 'Try again',
  blurb: 'Uncover every cushion without waking a sleeping cat.',
  tileLevel: 'level', tileStars: 'stars', tilePerfect: 'perfect levels', summary: 'Level {n} · {ch}',
  taskCush: 'Uncover {n} cushions', taskPaws: 'Place {n} paw prints', taskWins: 'Win {n} levels',
  taskChords: 'Open cushions from a number {n} times', taskPerfect: 'Win {n} levels without waking a cat', taskHard: 'Win a Hard level',
  perkMittens: 'Sniff costs 40 instead of 60.', perkSoot: 'Once a level, stops you from waking a cat.',
  perkMarmalade: 'Start every level with 4 hearts.', perkPepper: '25% more coins from levels.', perkBiscuit: 'Whisker Scan covers 4×4.',
  fabGingham: 'Gingham', fabKnit: 'Knit', fabVelvet: 'Velvet', fabPatchwork: 'Patchwork', fabStarry: 'Starry night',
  fabNote: 'Cushion fabric',
  ch: ['Sunny Windowsill', 'Laundry Basket', 'Bookshelf', 'Garden Fence', 'Attic', 'Kitchen Counter', 'Rooftop', 'Fish Market',
    'Library', 'Greenhouse', 'Train Station', 'Lighthouse', 'Snowy Cabin', 'Night Market', 'Moon Garden', 'Castle Hall',
    'Sky Balcony', 'Cloud Loft', 'Star Observatory', 'Catnip Palace'],
};

const es = {
  level: 'Nivel {n}', hard: 'Difícil', boss: 'Final del capítulo', catsLeft: 'Gatos restantes', language: 'Idioma',
  paw: 'Huella', sniff: 'Olfato', scan: 'Radar de bigotes', catnip: 'Hierba gatera', free: 'Gratis',
  tip1: 'Toca un cojín. El número cuenta los gatos dormidos que lo tocan.',
  tip3: 'Mantén pulsado un cojín, o activa Huella, para marcar un gato dormido.',
  tip5: 'Toca un número con todos sus gatos marcados para abrir el resto.',
  tip6: '¿Atascado? Olfato abre un cojín seguro.',
  tip12: 'Nivel difícil: más gatos, monedas dobles.',
  tip15: 'El Radar de bigotes te dice si hay un gato en un área de 3×3.',
  tip20: 'Los bloques de madera son solo muebles. Nada se esconde ahí.',
  tip40: 'La Hierba gatera marca todos los gatos en un área de 5×5.',
  tip45: 'Los nudos de lana necesitan dos toques: uno para desatar y otro para abrir.',
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
  ch: ['Alféizar soleado', 'Cesto de la ropa', 'Estantería', 'Valla del jardín', 'Desván', 'Encimera', 'Tejado', 'Pescadería',
    'Biblioteca', 'Invernadero', 'Estación de tren', 'Faro', 'Cabaña nevada', 'Mercado nocturno', 'Jardín lunar', 'Salón del castillo',
    'Balcón del cielo', 'Ático de nubes', 'Observatorio', 'Palacio gatuno'],
};

const pt = {
  level: 'Nível {n}', hard: 'Difícil', boss: 'Final do capítulo', catsLeft: 'Gatos restantes', language: 'Idioma',
  paw: 'Patinha', sniff: 'Faro', scan: 'Radar de bigodes', catnip: 'Erva-de-gato', free: 'Grátis',
  tip1: 'Toque numa almofada. O número conta os gatos dormindo ao redor.',
  tip3: 'Segure uma almofada, ou ative Patinha, para marcar um gato dormindo.',
  tip5: 'Toque num número com todos os gatos marcados para abrir o resto.',
  tip6: 'Travou? O Faro abre uma almofada segura.',
  tip12: 'Nível difícil: mais gatos, moedas em dobro.',
  tip15: 'O Radar de bigodes diz se há um gato numa área 3×3.',
  tip20: 'Blocos de madeira são só móveis. Nada se esconde ali.',
  tip40: 'A Erva-de-gato marca todos os gatos numa área 5×5.',
  tip45: 'Nós de lã pedem dois toques: um para desatar, outro para abrir.',
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
  ch: ['Janela ensolarada', 'Cesto de roupa', 'Estante', 'Cerca do jardim', 'Sótão', 'Bancada da cozinha', 'Telhado', 'Peixaria',
    'Biblioteca', 'Estufa', 'Estação de trem', 'Farol', 'Cabana na neve', 'Feira noturna', 'Jardim da lua', 'Salão do castelo',
    'Varanda do céu', 'Sótão das nuvens', 'Observatório', 'Palácio dos gatos'],
};

const hi = {
  level: 'लेवल {n}', hard: 'कठिन', boss: 'अध्याय का अंत', catsLeft: 'बची बिल्लियाँ', language: 'भाषा',
  paw: 'पंजा', sniff: 'सूँघो', scan: 'मूँछ स्कैन', catnip: 'कैटनिप', free: 'मुफ़्त',
  tip1: 'किसी गद्दी पर टैप करें। संख्या बताती है कि आसपास कितनी बिल्लियाँ सो रही हैं।',
  tip3: 'सोती बिल्ली पर निशान लगाने के लिए गद्दी को दबाए रखें, या पंजा चालू करें।',
  tip5: 'जब किसी संख्या की सारी बिल्लियाँ चिह्नित हों, तो बाकी खोलने के लिए उस पर टैप करें।',
  tip6: 'अटक गए? सूँघो एक सुरक्षित गद्दी खोल देता है।',
  tip12: 'कठिन लेवल: ज़्यादा बिल्लियाँ, दोगुने सिक्के।',
  tip15: 'मूँछ स्कैन बताता है कि 3×3 क्षेत्र में कोई बिल्ली छिपी है या नहीं।',
  tip20: 'लकड़ी के ब्लॉक बस फ़र्नीचर हैं। वहाँ कुछ नहीं छिपा।',
  tip40: 'कैटनिप 5×5 क्षेत्र की हर बिल्ली पर निशान लगा देता है।',
  tip45: 'ऊन की गाँठ के लिए दो टैप चाहिए: एक खोलने के लिए, एक गद्दी हटाने के लिए।',
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
  perkMittens: 'सूँघो 60 की जगह 40 में।', perkSoot: 'हर लेवल में एक बार बिल्ली जगाने से बचाता है।',
  perkMarmalade: 'हर लेवल 4 दिलों से शुरू करें।', perkPepper: 'लेवल से 25% ज़्यादा सिक्के।', perkBiscuit: 'मूँछ स्कैन 4×4 क्षेत्र देखता है।',
  fabGingham: 'चेक', fabKnit: 'ऊनी', fabVelvet: 'मख़मल', fabPatchwork: 'पैचवर्क', fabStarry: 'तारों भरी रात',
  fabNote: 'गद्दी का कपड़ा',
  ch: ['धूप वाली खिड़की', 'कपड़ों की टोकरी', 'किताबों की अलमारी', 'बगीचे की बाड़', 'अटारी', 'रसोई का काउंटर', 'छत', 'मछली बाज़ार',
    'पुस्तकालय', 'ग्रीनहाउस', 'रेलवे स्टेशन', 'लाइटहाउस', 'बर्फ़ीली कुटिया', 'रात का बाज़ार', 'चाँद का बगीचा', 'महल का हॉल',
    'आसमानी बालकनी', 'बादलों की अटारी', 'तारा वेधशाला', 'कैटनिप महल'],
};

const de = {
  level: 'Level {n}', hard: 'Schwer', boss: 'Kapitelfinale', catsLeft: 'Katzen übrig', language: 'Sprache',
  paw: 'Pfote', sniff: 'Schnuppern', scan: 'Schnurrhaar-Scan', catnip: 'Katzenminze', free: 'Gratis',
  tip1: 'Tippe auf ein Kissen. Die Zahl zählt die schlafenden Katzen daneben.',
  tip3: 'Halte ein Kissen gedrückt oder schalte Pfote ein, um eine Katze zu markieren.',
  tip5: 'Tippe auf eine Zahl, deren Katzen alle markiert sind, um den Rest zu öffnen.',
  tip6: 'Hängst du fest? Schnuppern öffnet ein sicheres Kissen.',
  tip12: 'Schweres Level: mehr Katzen, doppelte Münzen.',
  tip15: 'Der Schnurrhaar-Scan zeigt, ob in 3×3 Feldern eine Katze steckt.',
  tip20: 'Holzklötze sind nur Möbel. Dort versteckt sich nichts.',
  tip40: 'Katzenminze markiert jede Katze in 5×5 Feldern.',
  tip45: 'Wollknoten brauchen zwei Tipper: einen zum Lösen, einen zum Öffnen.',
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
  ch: ['Sonnige Fensterbank', 'Wäschekorb', 'Bücherregal', 'Gartenzaun', 'Dachboden', 'Küchentheke', 'Hausdach', 'Fischmarkt',
    'Bibliothek', 'Gewächshaus', 'Bahnhof', 'Leuchtturm', 'Schneehütte', 'Nachtmarkt', 'Mondgarten', 'Schlosssaal',
    'Himmelsbalkon', 'Wolkenloft', 'Sternwarte', 'Katzenminz-Palast'],
};

const fr = {
  level: 'Niveau {n}', hard: 'Difficile', boss: 'Fin du chapitre', catsLeft: 'Chats restants', language: 'Langue',
  paw: 'Patte', sniff: 'Flair', scan: 'Radar à moustaches', catnip: 'Herbe à chat', free: 'Gratuit',
  tip1: 'Touchez un coussin. Le chiffre compte les chats endormis autour.',
  tip3: 'Appuyez longuement sur un coussin, ou activez Patte, pour marquer un chat endormi.',
  tip5: 'Touchez un chiffre dont tous les chats sont marqués pour ouvrir le reste.',
  tip6: 'Bloqué ? Flair ouvre un coussin sûr.',
  tip12: 'Niveau difficile : plus de chats, pièces doublées.',
  tip15: 'Le Radar à moustaches indique si un chat se cache dans une zone 3×3.',
  tip20: 'Les blocs de bois ne sont que des meubles. Rien ne s’y cache.',
  tip40: 'L’Herbe à chat marque tous les chats d’une zone 5×5.',
  tip45: 'Les nœuds de laine demandent deux touches : une pour dénouer, une pour ouvrir.',
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
  ch: ['Rebord ensoleillé', 'Panier à linge', 'Bibliothèque du salon', 'Clôture du jardin', 'Grenier', 'Plan de travail', 'Toit', 'Marché aux poissons',
    'Grande bibliothèque', 'Serre', 'Gare', 'Phare', 'Chalet enneigé', 'Marché de nuit', 'Jardin de lune', 'Salle du château',
    'Balcon du ciel', 'Loft des nuages', 'Observatoire', 'Palais de l’herbe à chat'],
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
    if (TABLES[page] && (page !== 'en' || localStorage.getItem('cashpaws.lang'))) return page;
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
