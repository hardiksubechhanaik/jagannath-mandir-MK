// src/data/deities.js
// ─────────────────────────────────────────────────────────────────────────────
// Deities page data — swap arrays for fetch('/api/deities') later.
// Display order on the page: Balabhadra → Subhadra → Jagannath (ratnavedi).
// ─────────────────────────────────────────────────────────────────────────────

export const TRINITY_ORDER = ['Balabhadra', 'Subhadra', 'Jagannath'];

/** Image column per row — alternating for a clean zig-zag layout */
export const TRINITY_LAYOUT = ['right', 'left', 'right'];

export const TRINITY = [
  {
    name:        'Balabhadra',
    odia:        'ବଳଭଦ୍ର',
    devanagari:  'बलभद्र',
    color:       'White (Śveta)',
    tag:         'The Elder Brother',
    side:        'right',
    image:       '/images/deities/trinity/balabhadra.png',
    imageAlt:    'Balabhadra — the elder brother, white form on the ratnavedi',
    imageFocus:  '52% 18%',
    imageZoom:   1.15,
    description: 'The eldest of the trinity, worshipped in a striking white form. Balabhadra represents strength, righteousness and the protective elder — guardian of his brother and sister, and an embodiment of plough and power.',
  },
  {
    name:        'Subhadra',
    odia:        'ସୁଭଦ୍ରା',
    devanagari:  'सुभद्रा',
    color:       'Golden (Pīta)',
    tag:         'The Sister',
    side:        'left',
    image:       '/images/deities/trinity/subhadra-solo.png',
    imageAlt:    'Subhadra — golden form between her two brothers',
    imageFocus:  '50% 38%',
    imageZoom:   1,
    description: 'The beloved sister, worshipped in a radiant golden form between her two brothers. Subhadra represents grace, auspiciousness and the divine feminine at the centre of the holy family.',
  },
  {
    name:        'Jagannath',
    odia:        'ଜଗନ୍ନାଥ',
    devanagari:  'जगन्नाथ',
    color:       'Dark (Kṛṣṇa)',
    tag:         'Lord of the Universe',
    side:        'right',
    image:       '/images/deities/trinity/jagannath.png',
    imageAlt:    'Lord Jagannath — dark wooden form with large compassionate eyes',
    imageFocus:  '50% 16%',
    imageZoom:   1.12,
    description: 'The presiding deity — the Lord of the Universe in his distinctive dark wooden form with large round eyes and a boundless smile. A form of Krishna, Jagannath embodies infinite compassion, accepting every devotee exactly as they are.',
  },
];

export const PARIVAR_ORDER = [
  'Jaya',
  'Vijaya',
  'Mata Bimla',
  'Lakshmi',
  'Varaha',
  'Narasimha',
  'Vamana',
  'Pakshi Raj Garud',
];

export const INNER_SANCTUM_ORDER = [
  'Maa Lakshmi',
  'Madan Mohan',
  'Baal Gopal',
  'Tri Murti',
  'Bhudevi',
  'Shaligram',
];

export const PARIVAR_ALL_ORDER = [...PARIVAR_ORDER, ...INNER_SANCTUM_ORDER];

export const PARIVAR = [
  {
    name: 'Jaya',
    odia: 'ଜୟ',
    role: 'Dwarapala — guardian of the sacred threshold at the Lord\'s door.',
    imageFocus: '50% 40%',
  },
  {
    name: 'Vijaya',
    odia: 'ବିଜୟ',
    role: 'Dwarapala — guardian of the sacred threshold, standing beside Jaya.',
    imageFocus: '50% 40%',
  },
  {
    name: 'Mata Bimla',
    odia: 'ମାଆ ବିମଳା',
    role: 'The presiding goddess of the temple — Shakti who completes the Lord\'s abode.',
    imageFocus: '50% 38%',
  },
  {
    name: 'Lakshmi',
    odia: 'ଲକ୍ଷ୍ମୀ',
    role: 'Goddess of fortune and grace — consort of the Lord, source of abundance.',
    imageFocus: '50% 36%',
  },
  {
    name: 'Varaha',
    odia: 'ବରାହ',
    role: 'The boar avatar of Vishnu — protector who lifted the earth from the cosmic ocean.',
    imageFocus: '50% 42%',
  },
  {
    name: 'Narasimha',
    odia: 'ନରସିଂହ',
    role: 'The fierce lion-man avatar — remover of fear and protector of devotees.',
    imageFocus: '50% 40%',
  },
  {
    name: 'Vamana',
    odia: 'ବାମନ',
    role: 'The dwarf avatar of Vishnu — embodiment of humility and divine wisdom.',
    imageFocus: '50% 42%',
  },
  {
    name: 'Pakshi Raj Garud',
    odia: 'ପକ୍ଷୀରାଜ ଗରୁଡ଼',
    role: 'The divine eagle and eternal vahana of Lord Jagannath — king of birds and supreme devotee.',
    imageFocus: '50% 28%',
  },
  {
    name: 'Maa Lakshmi',
    odia: 'ମା ଲକ୍ଷ୍ମୀ',
    role: 'Goddess of fortune in the inner sanctum — worshipped beside the Lord with daily offerings.',
    imageFocus: '50% 35%',
  },
  {
    name: 'Madan Mohan',
    odia: 'ମଦନ ମୋହନ',
    role: 'The enchanting form of Krishna in the inner sanctum — the Lord who captivates every heart.',
    imageFocus: '50% 38%',
  },
  {
    name: 'Baal Gopal',
    odia: 'ବାଲ ଗୋପାଳ',
    role: 'The child Krishna of the inner sanctum — the playful Gopal adorned with peacock feathers.',
    imageFocus: '50% 32%',
  },
  {
    name: 'Tri Murti',
    odia: 'ତ୍ରିମୂର୍ତ୍ତି',
    role: 'Balabhadra, Subhadra and Jagannath in their small forms — the trinity of the inner sanctum.',
    imageFocus: '50% 42%',
  },
  {
    name: 'Bhudevi',
    odia: 'ଭୂଦେବୀ',
    role: 'Earth goddess of the inner sanctum — the divine consort who sustains creation at the Lord\'s feet.',
    imageFocus: '50% 38%',
  },
  {
    name: 'Shaligram',
    odia: 'ଶାଲିଗ୍ରାମ',
    role: 'The sacred stone form of Vishnu in the inner sanctum — worshipped as the eternal presence of the Lord.',
    imageFocus: '50% 40%',
  },
];
