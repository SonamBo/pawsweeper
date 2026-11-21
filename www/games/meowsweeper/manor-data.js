import { TEXTS } from './texts.js';
import { STORY } from './texts-story.js';
import { DECO_NAMES } from './deco-data.js';
import { getLang } from './strings.js';
/**
 * Whiskerwood Manor: the story layer's words. Room names are in all six
 * languages; tasks, diary pages and cat lines are English for now (other
 * languages fall back to English until they are translated).
 */

export const ROOM_COUNT = 20;
export const TASK_COSTS = [1, 2, 3, 4, 4, 6];          // stars for the 1st..6th object added in a room: 20 a room (10 levels pay up to 30)
export const ROOM_LEVELS = 10;                          // levels per room; the 10th is the room's finale
export const DIARY_AT = [0, 5];                          // a diary page after the 1st and the 6th task

/** Where each task wipes the dust away, as fractions of the room picture: x, y, radius (of the width). */
export const PATCHES = [
  [0.28, 0.86, 0.46], [0.74, 0.84, 0.46], [0.5, 0.12, 0.55],
  [0.12, 0.48, 0.44], [0.88, 0.48, 0.44], [0.5, 0.5, 1.4],
];

export const ROOM_NAMES = {
  en: ['Foyer', 'Laundry Room', 'Playroom', 'Rose Garden', 'Box Room', 'Pantry', 'Terrace Balcony', 'Courtyard',
    'Grand Library', 'Conservatory', 'Railway Halt', 'Boathouse', 'Ballroom', 'Wine Cellar', 'Moonlit Garden',
    'Great Hall', 'Clock Tower', "The Duchess's Suite", 'Observatory', 'The Attic'],
  es: ['Vestíbulo', 'Lavadero', 'Cuarto de juegos', 'Rosaleda', 'Trastero', 'Despensa', 'Balcón-terraza', 'Patio',
    'Gran biblioteca', 'Invernadero', 'Apeadero', 'Casa de botes', 'Salón de baile', 'Bodega', 'Jardín de luna',
    'Gran salón', 'Torre del reloj', 'Aposentos de la duquesa', 'Observatorio', 'El desván'],
  pt: ['Saguão', 'Lavanderia', 'Brinquedoteca', 'Roseiral', 'Quarto de despejo', 'Despensa', 'Varanda', 'Pátio',
    'Grande biblioteca', 'Estufa', 'Estação particular', 'Casa de barcos', 'Salão de baile', 'Adega', 'Jardim ao luar',
    'Grande salão', 'Torre do relógio', 'Aposentos da duquesa', 'Observatório', 'O sótão'],
  hi: ['प्रवेश कक्ष', 'धुलाई कक्ष', 'खेल कक्ष', 'गुलाब बाग़', 'सामान कक्ष', 'भंडार घर', 'छज्जा', 'आँगन',
    'बड़ा पुस्तकालय', 'शीशघर', 'रेलवे पड़ाव', 'नाव घर', 'नृत्य कक्ष', 'तहख़ाना', 'चाँदनी बाग़',
    'बड़ा हॉल', 'घंटाघर', 'डचेस का कक्ष', 'वेधशाला', 'अटारी'],
  de: ['Eingangshalle', 'Waschküche', 'Spielzimmer', 'Rosengarten', 'Abstellkammer', 'Speisekammer', 'Balkonterrasse', 'Innenhof',
    'Große Bibliothek', 'Wintergarten', 'Bahnhaltepunkt', 'Bootshaus', 'Ballsaal', 'Weinkeller', 'Mondgarten',
    'Große Halle', 'Uhrturm', 'Gemächer der Herzogin', 'Sternwarte', 'Der Dachboden'],
  fr: ['Vestibule', 'Buanderie', 'Salle de jeux', 'Roseraie', 'Débarras', 'Garde-manger', 'Terrasse', 'Cour',
    'Grande bibliothèque', 'Jardin d’hiver', 'Halte ferroviaire', 'Hangar à bateaux', 'Salle de bal', 'Cave à vin', 'Jardin de lune',
    'Grande salle', 'Tour de l’horloge', 'Appartements de la duchesse', 'Observatoire', 'Le grenier'],
};


/** The three decorating styles. Each object comes in all three. */
export const STYLES = [
  { id: 'cottage', name: 'Cosy Cottage', sw: ['#c98a4b', '#f3e2c4', '#b5562d'] },
  { id: 'pastel', name: 'Pastel Dream', sw: ['#f2b8c8', '#cbb6e6', '#b9e3cf'] },
  { id: 'royal', name: 'Royal Garden', sw: ['#7f9a6e', '#2c3a64', '#d6a73a'] },
];

/**
 * Two keepsakes a room: the first rises from a cushion on the room's 5th level
 * (a question), the second on its finale (the answer, and a hint of the next
 * room). Each keeps one handwritten line in the album.
 */
export const KEEPSAKES = [
  [{ name: 'An unsent letter', line: 'Sealed, never sent, addressed only to “E.” Who was E?' },
    { name: 'Marmalade’s collar', line: 'Every evening Marmalade sat by the door and rang this bell, as if she were waiting for someone.' }],
  [{ name: 'A leather glove', line: 'A man’s glove in the linen basket, stitched with an E. Far too big for the Duchess.' },
    { name: 'A lace handkerchief', line: 'Two hearts stitched in the corner. One for her, one for E.' }],
  [{ name: 'A child’s drawing', line: 'Two children, five cats and the manor. Someone grew up here beside her.' },
    { name: 'A toy sailboat', line: 'Edmund’s boat, a paw on its sail. “One day I’ll sail you across the lake,” he promised.' }],
  [{ name: 'A pressed rose', line: 'Pressed in her garden book, and beside it: “For Edmund, when he comes home.”' },
    { name: 'Edmund’s rose', line: 'His rose bush still wears her label. She watered it every morning for eleven years.' }],
  [{ name: 'A luggage label', line: 'Never used. One passenger, Whiskerwood to the coast.' },
    { name: 'An empty ring box', line: 'He asked. She said “not yet, the cats need me.” So where did the ring go?' }],
  [{ name: 'Cook’s recipe book', line: 'One page is not a recipe at all: rows of numbers and a floury paw print.' },
    { name: 'Biscuit’s treat tin', line: 'Refilled every week “by E.”, says the delivery book. He never stopped.' }],
  [{ name: 'Her spyglass', line: 'Always pointed at the castle across the valley.' },
    { name: 'A signal lantern', line: 'Three short, one long. On clear nights, the castle answers.' }],
  [{ name: 'A broken seal', line: 'From a crate addressed to “E., care of Whiskerwood”. It smelled of the sea.' },
    { name: 'A letter from the harbour', line: '“I will wait by the castle light, as long as it takes.” — E.' }],
  [{ name: 'A hollow book', line: 'Something small and precious was hidden in here. Only its shape is left.' },
    { name: 'The cipher', line: 'Cook’s numbers, decoded: a harbour, and a date. The night he asked her to come.' }],
  [{ name: 'Forget-me-not seeds', line: '“Plant these. I’ll be home before they bloom.”' },
    { name: 'The first flower', line: 'They bloomed. He did not come. She framed the first flower anyway.' }],
  [{ name: 'A train ticket', line: 'One way to the coast, punched by the guard. So she did go, in the end.' },
    { name: 'Her cat brooch', line: 'Left on the station bench with a note: “Feed them at six. They will pretend you haven’t.”' }],
  [{ name: 'A signal card', line: 'In his hand: three short, one long means “I am home.”' },
    { name: 'The boathouse bell', line: 'Patch rings it whenever a boat goes by. Just in case.' }],
  [{ name: 'A dance card', line: 'Every line, all evening, the same name: Edmund.' },
    { name: 'Their music box', line: 'Wind it and a tiny couple waltzes until the candles go out.' }],
  [{ name: 'Half a key', line: 'Tied with lavender ribbon. The bow is shaped like a paw.' },
    { name: 'A bottle kept for later', line: 'Saved “for the day he comes home”. Scratched on the glass: the other half sleeps in the garden.' }],
  [{ name: 'The other half', line: 'Buried under the moonflowers: the rest of the paw key.' },
    { name: 'A moon locket', line: 'A tuft of orange fur inside. Marmalade’s mother, the first cat of Whiskerwood.' }],
  [{ name: 'The empty crest', line: 'The stone over the fireplace has a gap the exact shape of the paw key.' },
    { name: 'The paw key', line: 'Joined at last. It fits the crest, and far above, something clicks in the clock tower.' }],
  [{ name: 'Her pocket watch', line: 'Stopped at ten past six: the hour of the last train to the coast.' },
    { name: 'A letter in the clock', line: 'In her hand, sealed with five paw prints.' }],
  [{ name: 'Her reading glasses', line: 'Left on his letters. Every one answered. Not one sent.' },
    { name: 'Five name tags', line: '“They chose you,” she wrote, “or they would have woken.”' }],
  [{ name: 'A star chart', line: 'One night circled in gold: when the castle and the manor can see each other’s lights.' },
    { name: 'A postcard', line: '“Come home when the cats are cared for. I’ll keep the light on.” — E.' }],
  [{ name: 'His letters', line: 'Every one kept, tied with her lavender ribbon.' },
    { name: 'Her last note', line: '“The treasure was never gold. It is the house, and the five of them asleep in it. Thank you.”' }],
];

/** Which cat looks after each room. */
export const HOSTS = ['marmalade', 'marmalade', 'patch', 'mittens', 'patch', 'biscuit', 'pepper', 'biscuit',
  'mittens', 'mittens', 'pepper', 'patch', 'mittens', 'pepper', 'pepper', 'biscuit', 'patch', 'marmalade', 'pepper', 'marmalade'];

export const CAT_NAMES = { marmalade: 'Marmalade', mittens: 'Mittens', biscuit: 'Biscuit', patch: 'Patch', pepper: 'Pepper', soot: 'Soot' };

export const TASKS = [
  ['Fluff the window-seat cushions', 'Draw back the curtains', 'Wash the big window', 'Polish the tea table', 'Water the flowers', 'Shake out the rug'],
  ['Hang out the washing', 'Fold the linens', 'Water the flower pots', 'Dust the jugs and shelves', 'Wipe the cupboards', 'Sweep the tiles'],
  ['Rock the rocking horse', 'Hang the bunting', 'Tidy the toy shelves', 'Roll out the rug', "Fix the dolls' house", 'Stack the building blocks'],
  ['Trim the rose arch', 'Water the hydrangeas', 'Paint the picket fence', 'Repot the flowers', 'Clear the view to the castle', 'Sweep the path'],
  ['Clean the round window', 'Light the lamp', 'Stack the trunks', 'Dust the green trunk', 'Steady the ladder', 'Beat the rug'],
  ['Label the jars', 'Polish the copper pans', 'Hang the herbs', 'Fill the fruit bowl', 'Water the windowsill herbs', 'Fold the tea towel'],
  ['Trim the flower arch', 'Wipe the garden chairs', 'Polish the balustrade', 'Clear the castle view', 'Water the potted trees', 'Sweep the terrace'],
  ['Raise the awning', 'Oil the gate', 'Stack the crates', 'Arrange the flowers', 'Hang the flower baskets', 'Sweep the cobbles'],
  ['Dust the bookshelves', 'Light the hanging lamp', 'Oil the ladder', 'Brush the green armchair', 'Spin the globe', 'Beat the round rug'],
  ['Water the hanging ferns', 'Wash the glass roof', 'Clean the fountain', 'Arrange the flowers', 'Tie back the curtains', 'Sweep the tiles'],
  ['Wind the station clock', 'Light the lamp post', 'Paint the bench', 'Stack the suitcases', 'Wave in the train', 'Sweep the platform'],
  ['Hang the life ring', 'Light the lanterns', 'Bail out the boat', 'Coil the ropes', 'Roll the barrels', 'Open the boathouse doors'],
  ['Light the chandelier', 'Press the pink curtains', 'Tune the piano', 'Arrange the flowers', 'Plump the pink chair', 'Polish the parquet'],
  ['Light the lanterns', 'Turn the barrels', 'Dust the bottles', 'Oil the old door', 'Light the candles', 'Pick the grapes'],
  ['Trim the wisteria', 'Light the lanterns', 'Oil the iron gate', 'Harvest the pumpkins', 'Weed the cabbages', 'Rake the path'],
  ['Light the chandelier', 'Hang the banners', 'Polish the crest', 'Light the fire', 'Set the long table', 'Sweep the hall floor'],
  ['Clean the clock face', 'Oil the gears', 'Steady the ladder', 'Polish the brass bell', 'Coil the ropes', 'Sweep the floorboards'],
  ['Make the four-poster bed', 'Light the chandelier', 'Polish the vanity mirror', 'Arrange the roses', 'Plump the armchair', 'Roll out the rug'],
  ['Polish the telescope', 'Clean the star dome', 'Light the chandelier', 'Spin the globe', 'Pin up the star chart', 'Sort the trunks'],
  ['Open the round window', 'Light the lanterns', 'Rock the rocking chair', 'Wind the gramophone', 'Dust the trunks', 'Beat the rug'],
];

/** Where each task cleans: x, y as fractions of the picture, radius as a fraction of its width. */
export const SPOTS = [
  [[0.5, 0.62, 0.3], [0.14, 0.3, 0.24], [0.5, 0.3, 0.28], [0.8, 0.78, 0.18], [0.1, 0.66, 0.2], [0.5, 0.91, 0.4]],
  [[0.5, 0.2, 0.3], [0.5, 0.73, 0.3], [0.5, 0.53, 0.25], [0.1, 0.45, 0.2], [0.9, 0.7, 0.2], [0.5, 0.93, 0.4]],
  [[0.32, 0.66, 0.22], [0.62, 0.13, 0.3], [0.12, 0.3, 0.24], [0.5, 0.85, 0.3], [0.8, 0.67, 0.18], [0.12, 0.9, 0.2]],
  [[0.5, 0.07, 0.4], [0.18, 0.62, 0.22], [0.6, 0.66, 0.25], [0.8, 0.75, 0.2], [0.5, 0.37, 0.3], [0.5, 0.92, 0.4]],
  [[0.5, 0.15, 0.16], [0.81, 0.3, 0.15], [0.12, 0.65, 0.25], [0.53, 0.75, 0.2], [0.88, 0.55, 0.18], [0.5, 0.92, 0.4]],
  [[0.5, 0.15, 0.35], [0.36, 0.3, 0.2], [0.75, 0.32, 0.22], [0.3, 0.72, 0.2], [0.58, 0.65, 0.22], [0.88, 0.85, 0.2]],
  [[0.5, 0.05, 0.4], [0.26, 0.72, 0.22], [0.5, 0.58, 0.25], [0.4, 0.38, 0.25], [0.9, 0.68, 0.2], [0.5, 0.92, 0.4]],
  [[0.5, 0.08, 0.4], [0.57, 0.52, 0.18], [0.15, 0.78, 0.22], [0.85, 0.6, 0.2], [0.12, 0.3, 0.18], [0.6, 0.9, 0.35]],
  [[0.15, 0.3, 0.25], [0.53, 0.25, 0.15], [0.38, 0.48, 0.18], [0.22, 0.73, 0.22], [0.85, 0.7, 0.2], [0.5, 0.92, 0.38]],
  [[0.25, 0.22, 0.25], [0.5, 0.08, 0.4], [0.5, 0.7, 0.2], [0.25, 0.65, 0.22], [0.7, 0.5, 0.18], [0.5, 0.92, 0.38]],
  [[0.5, 0.17, 0.17], [0.88, 0.38, 0.16], [0.28, 0.75, 0.22], [0.65, 0.75, 0.2], [0.15, 0.55, 0.2], [0.5, 0.93, 0.38]],
  [[0.12, 0.53, 0.15], [0.24, 0.33, 0.15], [0.5, 0.77, 0.22], [0.88, 0.4, 0.16], [0.1, 0.75, 0.17], [0.5, 0.5, 0.3]],
  [[0.5, 0.07, 0.25], [0.5, 0.3, 0.3], [0.12, 0.48, 0.15], [0.36, 0.44, 0.15], [0.88, 0.52, 0.14], [0.5, 0.8, 0.45]],
  [[0.22, 0.17, 0.15], [0.18, 0.68, 0.25], [0.13, 0.4, 0.18], [0.69, 0.55, 0.18], [0.84, 0.72, 0.15], [0.75, 0.9, 0.2]],
  [[0.15, 0.15, 0.25], [0.88, 0.25, 0.15], [0.5, 0.53, 0.18], [0.2, 0.75, 0.2], [0.85, 0.75, 0.2], [0.5, 0.9, 0.3]],
  [[0.5, 0.27, 0.25], [0.28, 0.45, 0.15], [0.5, 0.46, 0.13], [0.5, 0.68, 0.15], [0.5, 0.83, 0.35], [0.5, 0.95, 0.4]],
  [[0.5, 0.5, 0.35], [0.55, 0.12, 0.22], [0.12, 0.75, 0.2], [0.67, 0.85, 0.15], [0.85, 0.35, 0.18], [0.5, 0.95, 0.38]],
  [[0.4, 0.42, 0.28], [0.78, 0.1, 0.15], [0.88, 0.45, 0.15], [0.1, 0.55, 0.15], [0.82, 0.82, 0.18], [0.45, 0.88, 0.35]],
  [[0.5, 0.55, 0.2], [0.5, 0.15, 0.35], [0.75, 0.4, 0.15], [0.85, 0.6, 0.18], [0.25, 0.55, 0.15], [0.25, 0.8, 0.2]],
  [[0.53, 0.5, 0.22], [0.5, 0.25, 0.25], [0.72, 0.73, 0.18], [0.9, 0.67, 0.15], [0.2, 0.68, 0.2], [0.5, 0.85, 0.35]],
];

export const DIARY = [
  ['My dear Caretaker, the house is yours to mend. One rule only: never wake a sleeping cat. — The Duchess',
    'Diary, March 2nd. Marmalade knocked over the hall vase again. I laughed so hard I nearly forgot the letter in my pocket.'],
  ['Diary, March 9th. Washed the good linens and found a man’s glove in the basket, embroidered with an E. I know whose it is.',
    'Diary, March 10th. I hung the glove on the line where he would see it. Silly. He has been gone eleven years.'],
  ['A child’s drawing behind the toys: the manor, the lake, and a little boat flying a flag with a paw on it.',
    'Diary, April 1st. Patch has hidden the toy boat again. He only ever hides the things that matter to me.'],
  ['A rose pressed flat in a garden book. In faded ink beside it: “For Edmund, when he comes home.”',
    'Diary, June 3rd. Edmund’s letter came with the fish delivery again. The cats knew before I did: they sat by the gate all morning.'],
  ['A luggage label, never used: “One passenger, Whiskerwood to the coast.” Dated the week the great clock stopped.',
    'Diary, August 20th. Packed and unpacked my trunk three times. Mittens sat in it the third time. I took that as a no.'],
  ['In Cook’s recipe book, one page is not a recipe at all: just rows of numbers, and a paw print in flour.',
    'Diary, September 1st. Biscuit guards the pantry like a dragon. I suspect she guards the coded page, too.'],
  ['From the terrace you can see the old castle across the valley. Someone has drawn a tiny lantern on its tower in the window dust.',
    'Diary, October 5th. A light in the castle tower tonight: three short flashes, one long. Pepper watched it until dawn.'],
  ['An unopened crate in the courtyard, addressed only to “E., care of Whiskerwood Manor”. It smells faintly of the sea.',
    'Diary, October 12th. I sent the crate back unopened. Then I ran to the gate to stop the cart. Too late.'],
  ['Hidden in a book spine: the key to Cook’s coded page. The numbers spell out a harbour, and a date.',
    'Diary, November 2nd. He asked me to meet him at the harbour, ten years ago. I had the cats. I had the house. I stayed.'],
  ['A seed packet from a faraway port, pinned above the fountain: “Plant these. I will be back before they bloom.”',
    'Diary, spring. The seeds bloomed. He did not come. Mittens sat by the fountain all day, as if to keep me company.'],
  ['A one-way railway ticket to the coast, punched by the guard. So she did go, in the end.',
    'A note on the station bench: “If you are reading this, I caught the train. Feed them at six. They will pretend you haven’t.”'],
  ['The boathouse lantern still works. When Patch paws the shutter it blinks three short, one long, and the castle answers.',
    'Under the boat seat: “The castle light means he is home. The manor light means I am.”'],
  ['A dance card left on the piano. Every line, all evening, holds the same name: Edmund.',
    'Diary, the winter ball. We danced until the candles went out. Mittens never forgave him for stepping on her tail.'],
  ['Behind the cellar door: half of an old brass key, tied to a barrel with lavender ribbon.',
    'Scratched into the barrel: “The other half sleeps where the pumpkins grow.” Pepper sniffs it and looks towards the garden.'],
  ['Under the biggest pumpkin, the second half of the key. Put together, it is shaped like a cat’s paw.',
    'Diary, harvest moon. The cats and I sat in the garden until midnight. It is the only time Pepper purrs.'],
  ['The crest over the great fireplace is missing its centre stone. The gap is exactly the shape of the paw key.',
    'Diary, Christmas. I set the long table for one again. Biscuit slept on the chair beside me. It helped.'],
  ['The great clock was stopped on purpose, at ten past six: the hour of the last train to the coast.',
    'With the clock running again, a drawer opens in its base. Inside is a letter in the Duchess’s hand.'],
  ['The letter: “I went to find him. Look after them. Whoever you are, they chose you, or they would have woken.”',
    'Diary, last entry: “Marmalade will lead whoever comes. Mittens will judge them. Biscuit will feed them. Patch will test them. Pepper will tell them the truth.”'],
  ['A star chart with one night circled in gold: the night the castle and the manor can see each other’s lights across the lake.',
    'Pepper sits under the telescope every night now. On the circled night she will not come inside at all.'],
  ['The paw key opens the last trunk. Inside: Edmund’s letters, every one answered, every answer unsent.',
    'And a final note: “The treasure was never in the trunk. It is the house, and the five of them asleep in it. Thank you for waking it gently.”'],
];

/** One line on a win, in the host cat's voice. */
export const WIN_LINES = {
  marmalade: ['You did it! I helped. Mostly.', 'Again! Again!', 'I stayed very still. Did you see?', 'Snack time? Snack time!', 'Best Caretaker ever!'],
  mittens: ['Acceptable. Barely.', 'Hmph. Not bad at all.', 'Neat and tidy. I approve.', 'You may continue.', 'Fine work. Don’t let it go to your head.'],
  biscuit: ['…five more minutes…', 'Mmm. Nice and quiet.', 'That was cosy.', 'Wake me for dinner.', 'Zzz… good job…'],
  patch: ['Psst. Nice moves.', 'Sneaky. I like it.', 'Nobody woke up. Respect.', 'Smooth! Like a cat.', 'Ha! Too easy.'],
  pepper: ['Quiet as moonlight.', 'Not one whisker stirred.', 'Well done, Caretaker.', 'Silent and clever. Good.', 'The house sleeps soundly.'],
};

/** One line when a task is done. */
export const RESTORE_LINES = {
  marmalade: ['Shiny! Can I knock it over?', 'Ooh, it smells like home!', 'Best. Caretaker. Ever.'],
  mittens: ['Finally, a little dignity.', 'That will do nicely.', 'You missed a spot. Joking.'],
  biscuit: ['Cosy. So cosy.', 'Perfect napping spot.', 'Mm… lovely…'],
  patch: ['Ha! Look at that!', 'I knew it was under there.', 'Now do the next one!'],
  pepper: ['She kept it just like this.', 'The room is waking up.', 'It remembers her.'],
};

export const INTRO = [
  { art: 'letter', text: 'My dear Caretaker, Whiskerwood Manor is yours to mend. One rule only: never wake a sleeping cat.' },
  { art: 'room', text: 'Twenty rooms wait to be made lovely again, and five cats sleep wherever they please.' },
  { art: 'cat', text: 'I’m Marmalade! Win stars, then decorate each room your way. Shh, quietly!' },
];

export const UI = {
  manor: 'Whiskerwood Manor', stars: 'Stars', play: 'Play level {n}', back: 'Back', next: 'Next', skip: 'Skip', go: 'Let’s go!',
  starsGain: '+{n} stars for the manor',
  hintTip: 'Psst! That glowing cushion is safe. The pulsing number shows why.',
  hintTipAny: 'Psst! That glowing cushion is safe.',
  hintNone: 'Nothing is certain here. Trust your best guess!',
  hintNoneSniff: 'Nothing is certain here… try Sniff!',
  sniffFound: 'Sniff sniff… found a sleeping cat!',
  sniffWrong: 'Sniff… no cat under that paw! I took it off.',
  sniffNone: 'All the cats are already marked!',
  zoomFit: 'Fit board', zoomIn: 'Zoom in', open: 'Open', mark: 'Mark', special: 'Special board',
  daily: 'Puzzle of the day', dailyDone: 'Solved today!', dailyPlay: 'Play today’s puzzle',
  streak: '{n}-day streak', streak1: '1-day streak', streak0: 'Start a streak today', best: 'Your best times',
  note: 'From the Duchess’s household book', week: 'This week',
  cats: 'Cats', friendship: 'Friendship', perkUp: 'Perk upgrade: {t}', nextAt: '{n} more to level {l}', maxLevel: 'Best friends',
  friendUp: '{cat} likes you more! Friendship level {n}.',
  share: 'Share my room', before: 'Before', after: 'After',
  settings: 'Settings', cbNumbers: 'Colour-blind number marks', leftHanded: 'Left-handed layout', vibration: 'Vibration',
  coach1: 'Tap this cushion. No cat sleeps here.',
  coach2: 'This 1 means one cat sleeps in the 8 squares around it.',
  coachDiary: 'A letter from the Duchess! Tap to read it.',
  coachStars: 'These are your stars. Tap to decorate the room!',
  opensAt: 'opens at level {n}', lvl: 'Lvl {n}', lvlShort: 'Lv {n}',
  guardSave: 'Phew! {cat} caught that one. A cat sleeps there.',
  protect: 'Oops, a cat woke! While you learn, it costs no heart.',
  replay: 'Replay', replayTitle: 'Replay levels', replayLine: 'Play a level again to win the stars you missed.',
  replayOf: 'Replay · level {n}', replayDone: 'Back to level {n}',
  heartTitle1: 'Out of hearts!', heartBuy: 'Get coins', heartUse: 'Use {n} coins', heartAd: 'Watch an ad', heartGive: 'Give up',
  heartLine1: 'Keep going with 1 extra heart.', heartLine2: 'Last chance: one more heart for this level.', heartNeed: 'You need {n} more coins.',
  decorate: 'Decorate', later: 'Later', rooms: 'Rooms', room: 'Room {n}', album: 'Keepsakes',
  redecorate: 'Redecorate', restyle: 'Restyle', free: 'Free', used: 'Used', here: 'Here', newRoom: 'New room!', allDone: '6 / 6',
  letterTitle: 'The Duchess’s letter',
  moreLevels: 'Win {n} more levels here to open the next room.', placeRest: 'Place the last {n} to open the next room.',
  keepFrom: '{room} · keepsake {i} of 2', tapContinue: 'Tap to continue', finale: 'Finale',
  // Progress tab
  pRoom: 'Room {n} of 20', pManor: 'Manor decorated', pRooms: 'rooms done', pObjects: 'objects placed', pKeeps: 'keepsakes',
  shareText: 'I decorated the {room} in Meowsweeper!', yourCat: 'Your cat',
  pStars: 'stars earned', pLevel: 'level', pPerfect: 'perfect levels', pStreak: 'puzzle streak', pFriends: 'cat friends', pSpend: 'stars to spend',
};

/** Each room's board mat and sound. `night` cools the cushions for Pepper's dark rooms. */
export const ROOM_THEMES = [
  { mat: '#e9c7a0', edge: '#a8774c', amb: 'birds' }, { mat: '#dbe6ea', edge: '#7f97a3', amb: 'birds' },
  { mat: '#f1d3c9', edge: '#b07a6a', amb: 'birds' }, { mat: '#e1e7c6', edge: '#8a9a5b', amb: 'birds' },
  { mat: '#dcc3a3', edge: '#8f6a45', amb: 'wind' }, { mat: '#efd9b5', edge: '#a97c45', amb: 'fire' },
  { mat: '#e6dcc9', edge: '#9a8a72', amb: 'birds' }, { mat: '#e2d7c3', edge: '#93836a', amb: 'birds' },
  { mat: '#c9a27c', edge: '#6e4a2c', amb: 'clock' }, { mat: '#d5e4ce', edge: '#6f8f64', amb: 'rain' },
  { mat: '#dbd1c6', edge: '#7e6f62', amb: 'wind' }, { mat: '#cfe0e6', edge: '#5f8796', amb: 'water' },
  { mat: '#f3d6dc', edge: '#b07a86', amb: 'clock' }, { mat: '#cbbfb0', edge: '#6f6253', amb: 'drip', night: true },
  { mat: '#c9c6df', edge: '#6c6894', amb: 'crickets', night: true }, { mat: '#d9b48c', edge: '#7a4f2a', amb: 'fire' },
  { mat: '#e0c69c', edge: '#8a6a3a', amb: 'clock' }, { mat: '#eadcef', edge: '#9a84a8', amb: 'birds' },
  { mat: '#c3c6dc', edge: '#5d6390', amb: 'crickets', night: true }, { mat: '#ebcfa4', edge: '#9a6a3a', amb: 'wind' },
];

/** Lost and found: six small things per room, in icon order button, key, ribbon, bell, marble, feather. */
export const COLLECT_ICONS = ['button', 'key', 'ribbon', 'bell', 'marble', 'feather'];
export const COLLECT = [
  ['Pearl button', 'Front-door key', 'Velvet ribbon', 'Hall bell', 'Glass marble', 'Duster feather'],
  ['Shirt button', 'Linen-press key', 'Washing ribbon', 'Tin bell', 'Soap marble', 'Pillow feather'],
  ['Teddy’s button', 'Toy-box key', 'Kite ribbon', 'Rattle bell', 'Swirly marble', 'Quill feather'],
  ['Garden button', 'Gate key', 'Rose ribbon', 'Wind bell', 'Dew marble', 'Robin feather'],
  ['Coat button', 'Trunk key', 'Hat ribbon', 'Sleigh bell', 'Old marble', 'Hat feather'],
  ['Apron button', 'Larder key', 'Jam-jar ribbon', 'Kitchen bell', 'Sugar marble', 'Goose feather'],
  ['Brass button', 'Terrace key', 'Bunting ribbon', 'Garden bell', 'Sky marble', 'Swallow feather'],
  ['Cart button', 'Crate key', 'Parcel ribbon', 'Cart bell', 'Street marble', 'Pigeon feather'],
  ['Leather button', 'Bookcase key', 'Bookmark ribbon', 'Desk bell', 'Inkwell marble', 'Writing quill'],
  ['Green button', 'Glasshouse key', 'Orchid ribbon', 'Fountain bell', 'Rain marble', 'Parrot feather'],
  ['Guard’s button', 'Ticket-box key', 'Flag ribbon', 'Platform bell', 'Steam marble', 'Hat-band feather'],
  ['Sailor’s button', 'Boathouse key', 'Mooring ribbon', 'Ship’s bell', 'Sea-glass marble', 'Gull feather'],
  ['Satin button', 'Piano key', 'Ball-gown ribbon', 'Dance bell', 'Crystal marble', 'Fan feather'],
  ['Cork button', 'Cellar key half', 'Bottle ribbon', 'Cellar bell', 'Grape marble', 'Owl feather'],
  ['Moon button', 'Shed key', 'Wisteria ribbon', 'Lantern bell', 'Moonstone marble', 'Moth feather'],
  ['Crest button', 'Hall key', 'Banner ribbon', 'Dinner bell', 'Fire marble', 'Peacock feather'],
  ['Gear button', 'Clock key', 'Pendulum ribbon', 'Hour bell', 'Brass marble', 'Raven feather'],
  ['Pearl cuff button', 'Jewel-box key', 'Hair ribbon', 'Bedside bell', 'Rose marble', 'Boa feather'],
  ['Star button', 'Dome key', 'Chart ribbon', 'Comet bell', 'Planet marble', 'Night feather'],
  ['Golden button', 'The paw key', 'Lavender ribbon', 'Little silver bell', 'Starlight marble', 'Swan feather'],
];

/** Friendship: points to reach each level, and what each level says. */
export const FRIEND_AT = [0, 5, 15, 30, 50, 80];
export const FRIEND_LINES = {
  marmalade: ['You’re fun. Let’s knock something over.', 'I saved you the sunny spot.', 'You can have my favourite cushion. Sometimes.', 'Best friends! Officially! I decided!'],
  mittens: ['You may address me as Mittens.', 'Your tidying is… improving.', 'I permit you to sit beside me.', 'The Duchess would have liked you. I do.'],
  biscuit: ['…you again… nice…', 'You smell like biscuits. Good.', 'Wake me when you’re here. Only you.', 'Best nap buddy. Zzz.'],
  patch: ['Okay, you can see my hiding spot.', 'Race you to the attic!', 'I let you win that one. Maybe.', 'Partners in crime. Forever.'],
  pepper: ['You listen. Most don’t.', 'She would sit here with me, too.', 'I’ll show you my secret window.', 'You are part of the house now.'],
};
/** Level 3 friendship improves the cat's perk. */
export const FRIEND_PERKS = {
  marmalade: { text: '5 hearts instead of 4', boost: { hearts: 5 } },
  mittens: { text: 'Sniff costs 25 instead of 40', boost: { sniffPrice: 25 } },
  biscuit: { text: 'Whisker Scan costs 60', boost: { scanPrice: 60 } },
  patch: { text: 'Catches one cat a level before it wakes (from level 7)', boost: { guards: 1 } },
  pepper: { text: '40% more coins, not 25%', boost: { coinBonus: 0.4 } },
  soot: { text: 'Catches two cats a level, not one (from level 7)', boost: { guards: 2 } },
};

/** A short household note from the Duchess for each day's puzzle. */
export const DAILY_NOTES = [
  'Mittens takes tea at four. She does not drink it. She supervises it.',
  'Never close the pantry door all the way. Biscuit will sit outside it and sigh until you open it.',
  'Patch hides one sock a week. You will find them all in the box room, in spring.',
  'Pepper does not like thunder. Leave the boathouse lantern lit on stormy nights.',
  'Marmalade is not allowed on the piano. Marmalade does not know this.',
  'The third stair creaks. The cats use it as a doorbell.',
  'Fish on Fridays, cream on Sundays, and no one gets ham, whatever they tell you.',
  'If the house is too quiet, check the laundry basket. Someone is in it.',
  'The cats know the time better than the great clock does. Supper is at six.',
  'A sunny windowsill is worth more to a cat than any treasure. Keep the curtains open.',
  'Mittens forgives slowly, but she forgives completely.',
  'When Pepper stares at an empty corner, say hello to it. It costs nothing.',
  'Biscuit snores. It is a comforting sound. You will miss it when you are away.',
  'Every cat in this house was a stray once. So was I, in my way.',
];

export const SPECIAL_TEXT = {
  heart: 'A heart-shaped board! Nothing hides under the wood.',
  teacup: 'A teacup board! Nothing hides under the wood.',
  cat: 'A cat-shaped board! Nothing hides under the wood.',
  lantern: 'Lantern night! It’s dark, but the numbers still work.',
  catnap: 'Cat nap! Extra cats today, so you get 5 hearts.',
};



/* The player's language: the tables above are English; texts.js has the rest. */
const L = TEXTS[getLang()];
if (L) {
  Object.assign(UI, L.ui || {});
  for (const [k, v] of Object.entries(L.win || {})) WIN_LINES[k] = v;
  for (const [k, v] of Object.entries(L.friend || {})) FRIEND_LINES[k] = v;
  for (const [k, v] of Object.entries(L.perks || {})) if (FRIEND_PERKS[k]) FRIEND_PERKS[k].text = v;
  Object.assign(SPECIAL_TEXT, L.special || {});
  (L.intro || []).forEach((text, i) => { if (INTRO[i]) INTRO[i].text = text; });
  (L.styles || []).forEach((name, i) => { if (STYLES[i]) STYLES[i].name = name; });
}
const S = STORY[getLang()];
if (S) {
  S.deco.forEach((row, r) => row.forEach((name, o) => { if (DECO_NAMES[r]) DECO_NAMES[r][o] = name; }));
  S.keep.forEach((pair, r) => pair.forEach(([name, line], i) => { if (KEEPSAKES[r]?.[i]) KEEPSAKES[r][i] = { name, line }; }));
  S.notes.forEach((note, i) => { DAILY_NOTES[i] = note; });
  UI.shareText = S.share; UI.yourCat = S.yourCat;
}
