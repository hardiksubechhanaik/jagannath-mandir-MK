/**
 * Generates src/i18n/locales/en.js, or.js, hi.js with identical key structure.
 * Run: node scripts/build-locales.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'src/i18n/locales');

const panjika = await import(pathToFileURL(join(ROOT, 'src/data/panjika2026.js')).href);
const PANJIKA_EVENTS = panjika.default || panjika.PANJIKA_EVENTS;
const PANJIKA_META = panjika.PANJIKA_META;

function buildEn() {
  return {
    common: {
      loading: 'Loading…',
      tryAgain: 'Try again',
      getDirections: 'Get directions →',
      readMore: 'Read more →',
      readFullStory: 'Read the full story →',
      viewArchive: 'View archive →',
      subscribe: 'Subscribe',
      sendMessage: 'Send Message',
      notifyMe: 'Notify me',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      mainNav: 'Main',
      loadingPage: 'Loading page',
      pageError: 'Something went wrong loading this page.',
      live: 'LIVE',
      ended: 'ENDED',
      upcoming: 'UPCOMING',
      all: 'All',
      untitled: 'Untitled',
      requestFailed: 'Request failed ({{status}})',
    },

    nav: {
      home: 'Home',
      visit: 'Visit',
      events: 'Events',
      sevas: 'Sevas',
      about: 'About',
      planYourVisit: 'Plan Your Visit',
      darshanTimings: 'Darshan & Timings',
      theDeities: 'The Deities',
      liveDarshan: 'Live Darshan',
      festivalsEvents: 'Festivals & Events',
      templeJournal: 'Temple Journal (Blog)',
      bookPrasad: 'Book Prasad',
      donate: 'Donate',
      aboutMandir: 'About the Mandir',
      contactUs: 'Contact Us',
      login: 'Login',
      prasadBooking: 'Prasad Booking',
      blog: 'Blog',
      festivals: 'Festivals',
      contact: 'Contact',
    },

    site: {
      templeName: 'Shree Jagannath Mandir',
      templeNameShort: 'Jagannath Mandir',
      logoSub: 'Maruti Kunj, Bhondsi · 122102',
      phone: '+91 97171 80859',
      address: 'Shree Jagannath Mandir, Maruti Kunj, Bhondsi, Gurgaon, Sector 67 122102',
      addressShort: 'Maruti Kunj, Bhondsi, Gurgaon, Sector 67 122102',
      addressLine: 'Shree Jagannath Mandir,\nMaruti Kunj, Bhondsi,\nGurgaon, Sector 67 122102',
      mapTitle: 'Shree Jagannath Mandir, Maruti Kunj',
      footerTagline:
        'A sacred place of devotion, peace and spiritual energy. Join us in daily aarti and divine celebrations.',
      footerExplore: 'Explore',
      footerHours: 'Hours',
      footerHoursMorning: 'Morning · 4:30 AM – 1 PM',
      footerHoursEvening: 'Evening · 4:15 PM – 9 PM',
      footerHoursOpen: 'Open all days',
      footerHoursNote: 'Mangala Arati 4:30 AM',
      footerVisitUs: 'Visit Us',
      footerJay: 'ଜୟ ଜଗନ୍ନାଥ',
      footerCopyright:
        '© 2026 Shree Jagannath Mandir Trust, Maruti Kunj. All rights reserved.',
    },

    status: {
      openNow: 'Open now — darshan in progress',
      closedRest: 'Closed — temple at rest',
      nextMadhyahna: 'NEXT · MADHYAHNA DHUPA 12:30 PM',
      opensMangala: 'OPENS 4:30 AM · MANGALA ARATI',
      openNowCard: 'Open Now',
      closedCard: 'Currently Closed',
      openSub:
        'Sahana Mela darshan is open. Next ritual: Madhyahna Dhupa at 12:30 PM.',
      closedSub:
        'The deities are at rest. Doors open at 4:30 AM with Mangala Arati.',
      openDaily: 'Open daily',
      hoursRange: '4:30 AM – 1 PM · 4:15 – 9 PM',
      viewSchedule: "View today's\nschedule",
      fullTimetable: '→ full niti timetable',
      watchingNow: '1,248 WATCHING NOW',
    },

    forms: {
      fullName: 'Full name',
      fullNameRequired: 'Full name is required.',
      email: 'Email address',
      emailRequired: 'Email address is required.',
      emailInvalid: 'Enter a valid email.',
      emailInvalidLong: 'Enter a valid email address.',
      mobile: 'Mobile number',
      mobileRequired: 'Mobile number is required.',
      message: 'Message',
      messageRequired: 'Please type your message.',
      messagePlaceholder: 'Type your message here…',
      namePlaceholder: 'Your full name',
      emailPlaceholder: 'you@example.com',
      phonePlaceholder: '+91 XXXXX XXXXX',
      phoneShort: '+91 …',
      pan: 'PAN (for 80G receipt)',
      panPlaceholder: 'ABCDE1234F',
      sending: 'Sending…',
      processing: 'Processing…',
      subscribing: 'Subscribing…',
      sendAnother: 'Send another message',
      contactSuccess: "Thank you — we'll be in touch shortly.",
      contactError: 'Could not send your message. Please try again.',
      donateError: 'Could not process your donation. Please try again.',
      notifyError: 'Could not subscribe. Please try again.',
      newsletterInvalid: 'Please enter a valid email address.',
      newsletterSuccess: "Thank you — you're subscribed.",
      prasadError: 'Please enter your name and phone number.',
      customAmount: 'Enter another amount',
      customAmountAria: 'Enter a custom donation amount',
      findUs: 'Find Us',
    },

    home: {
      heroOdia: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର',
      welcome: 'Welcome to',
      subtitle:
        'A divine place of devotion, peace and spiritual awakening — daily darshan, seva and prasad in the heart of Maruti Kunj.',
      jayaAlt: 'Jaya — dwarapaala',
      jayaName: 'ଜୟ · Jaya',
      vijayaAlt: 'Bijaya — dwarapaala',
      vijayaName: 'ବିଜୟ · Bijaya',
      today: 'Today · {{date}}',
      todayTithi: 'Āṣāḍha Śukla Dwitiyā',
      todayNote: 'Ratha Yatra eve · Anasara concludes',
      nextRitual: 'Next ritual',
      nextMadhyahna: 'Madhyahna Dhupa',
      nextMangala: 'Mangala Arati',
      nextToday: 'Today · 12:30 PM',
      nextTomorrow: 'Tomorrow · 4:30 AM',
      seeSchedule: 'See full schedule →',
      aboutEyebrow: 'About the Mandir',
      aboutTitle: 'A home for Lord Jagannath, far from Puri.',
      aboutBody1:
        'Built and cared for by the devotee community of Maruti Kunj, Shree Jagannath Mandir brings the rituals, festivals and living traditions of Puri to Bhondsi. The trinity — Jagannath, Balabhadra and Subhadra — are served daily through the full cycle of niti, from the first Mangala Arati to the night-time Pahuda.',
      aboutBody2:
        'Every devotee is welcome — for darshan, for seva, for the community meals of Annadan, and for the great festivals that fill the temple through the year.',
      aboutCta: 'Read our story →',
      aboutImgAlt: 'Shree Jagannath Mandir shikhara at night',
      mantraMeaning:
        '"O blue-hued mountain, mighty and wild — please do not trample the lotus-grove of my devotion."',
      garudaAlt: 'Garuda Maharaja',
      garudaName: 'Garuda · ପକ୍ଷୀରାଜ',
      hanumanAlt: 'Hanuman Bajrangbali',
      hanumanName: 'Hanuman · ବଜରଂଗବଲୀ',
      sudarshanAlt: 'Sudarshan Chakra',
      sudarshanName: 'Sudarshan Chakra',
      sudarshanDevanagari: '( सुदर्शन चक्र )',
      sudarshanOdia: 'ସୁଦର୍ଶନ ଚକ୍ର',
      laxmiAlt: 'Maa Laxmi',
      laxmiName: 'Maa Laxmi',
      laxmiDevanagari: '( मां लक्ष्मी )',
      laxmiOdia: 'ମା ଲକ୍ଷ୍ମୀ',
      nitiEyebrow: 'Daily Niti · ଦୈନନ୍ଦିନ ନୀତି',
      nitiTitle: 'Darshan & Ritual Timings',
      summer: 'Summer · Apr–Oct',
      winter: 'Winter · Nov–Mar',
      festivalsEyebrow: 'Utsav · ଉତ୍ସବ',
      festivalsTitle: 'Upcoming Festivals',
      festivalsCta: 'Full calendar →',
      donateOdia: 'ସେବା ଓ ଦାନ',
      donateTitle: 'Your seva keeps the\nlamps burning.',
      donateBody:
        'Every contribution goes directly to daily bhoga, Annadan community meals, and the upkeep of the mandir. Donations are eligible for 80G tax exemption, with a receipt issued instantly.',
      donatePill1: '✦ Feeds 50 devotees — ₹2,100',
      donatePill2: "✦ Sponsors a day's bhoga — ₹5,100",
      oneTime: 'One-time',
      monthly: 'Monthly',
      otherAmount: 'Other amount',
      proceedDonate: 'Proceed to Donate',
      donateMeta: '🔒 100% secure · UPI, cards & net-banking · 80G receipt',
      festivalPreview: [
        {
          name: 'Ratha Yatra',
          date: '16 JULY 2026',
          desc: 'The grand chariot festival — the trinity rides out to bless the streets.',
        },
        {
          name: 'Janmashtami',
          date: '4 SEP 2026',
          desc: 'Midnight celebration of the birth of Lord Krishna.',
        },
        {
          name: 'Kartik Purnima',
          date: '24 NOV 2026',
          desc: 'Boita Bandana and the festival of lamps on the full-moon night.',
        },
      ],
    },

    niti: {
      mangalaArati: 'Mangala Arati',
      abakasha: 'Abakasha',
      sahanaMela: 'Sahana Mela',
      sahanaMelaOpen: 'Sahana Mela (open darshan)',
      sakalaDhupa: 'Sakala Dhupa',
      madhyahnaDhupa: 'Madhyahna Dhupa',
      sandhyaArati: 'Sandhya Arati',
      sandhyaDhupa: 'Sandhya Dhupa',
      pahuda: 'Pahuda',
      pahudaNight: 'Pahuda (night rest)',
      notes: {
        mangala: 'First aarti as the deities awaken.',
        abakasha: 'Morning ablutions and dressing.',
        sahana: 'Open public darshan for all.',
        sakala: 'Morning bhoga offering.',
        madhyahna: 'Midday offering, then rest.',
        sandhyaArati: 'Evening lamp aarti.',
        sandhyaDhupa: 'Evening bhoga offering.',
        pahuda: 'Final dressing and night rest.',
      },
      summer: [
        { time: '4:30 AM', name: 'Mangala Arati', odia: 'ମଙ୍ଗଳ ଆରତୀ', note: 'First aarti as the deities awaken.' },
        { time: '5:30 AM', name: 'Abakasha', odia: 'ଅବକାଶ', note: 'Morning ablutions and dressing.' },
        { time: '6:00 AM', name: 'Sahana Mela', odia: 'ସହାନ ମେଳା', note: 'Open public darshan for all.' },
        { time: '9:00 AM', name: 'Sakala Dhupa', odia: 'ସକାଳ ଧୂପ', note: 'Morning bhoga offering.' },
        { time: '12:30 PM', name: 'Madhyahna Dhupa', odia: 'ମଧ୍ୟାହ୍ନ ଧୂପ', note: 'Midday offering, then rest.' },
        { time: '6:30 PM', name: 'Sandhya Arati', odia: 'ସନ୍ଧ୍ୟା ଆରତୀ', note: 'Evening lamp aarti.' },
        { time: '8:00 PM', name: 'Sandhya Dhupa', odia: 'ସନ୍ଧ୍ୟା ଧୂପ', note: 'Evening bhoga offering.' },
        { time: '9:00 PM', name: 'Pahuda', odia: 'ବଡ଼ଶୃଙ୍ଗାର', note: 'Final dressing and night rest.' },
      ],
      winter: [
        { time: '5:00 AM', name: 'Mangala Arati', odia: 'ମଙ୍ଗଳ ଆରତୀ', note: 'First aarti as the deities awaken.' },
        { time: '6:00 AM', name: 'Abakasha', odia: 'ଅବକାଶ', note: 'Morning ablutions and dressing.' },
        { time: '6:30 AM', name: 'Sahana Mela', odia: 'ସହାନ ମେଳା', note: 'Open public darshan for all.' },
        { time: '9:30 AM', name: 'Sakala Dhupa', odia: 'ସକାଳ ଧୂପ', note: 'Morning bhoga offering.' },
        { time: '12:30 PM', name: 'Madhyahna Dhupa', odia: 'ମଧ୍ୟାହ୍ନ ଧୂପ', note: 'Midday offering, then rest.' },
        { time: '6:00 PM', name: 'Sandhya Arati', odia: 'ସନ୍ଧ୍ୟା ଆରତୀ', note: 'Evening lamp aarti.' },
        { time: '7:30 PM', name: 'Sandhya Dhupa', odia: 'ସନ୍ଧ୍ୟା ଧୂପ', note: 'Evening bhoga offering.' },
        { time: '8:30 PM', name: 'Pahuda', odia: 'ବଡ଼ଶୃଙ୍ଗାର', note: 'Final dressing and night rest.' },
      ],
      mantra: {
        garudaAlt: 'Garuda Maharaja',
        garudaOdia: 'ଗରୁଡ଼ ମହାରାଜା',
        hanumanAlt: 'Hanuman Bajrangbali',
        hanumanOdia: 'ବଜରଙ୍ଗବଳୀ',
        odia: 'ଜଗନ୍ନାଥ ସ୍ୱାମୀ ନୟନ ପଥଗାମୀ ଭବତୁ ମେ ।',
        roman: 'jagannātha swāmī nayana pathagāmī bhavatu me',
        meaning:
          '"May Lord Jagannath be the object of my vision — may He ever come into my sight."',
      },
    },

    visit: {
      heroEyebrow: 'Plan Your Visit',
      heroTitle: 'Come for Darshan',
      heroOdia: 'ଦର୍ଶନ ପାଇଁ ପଧାରନ୍ତୁ · ସମସ୍ତଙ୍କୁ ସ୍ୱାଗତ',
      glance: [
        { label: 'Open daily', value: '4:30 AM – 9 PM', note: 'With a midday rest' },
        { label: 'Entry', value: 'Free for all', note: 'No ticket required' },
        { label: 'Best time', value: 'Aarti hours', note: 'Arrive 20 min early' },
        { label: 'Prasad', value: 'Annadan daily', note: 'Mahaprasad served' },
      ],
      hoursEyebrow: 'Darshan Hours',
      hoursTitle: 'When to come for darshan.',
      hoursBody:
        'The temple opens before dawn with Mangala Arati and remains open through the day with a midday rest. Arrive 20–30 minutes before an aarti for the fullest darshan. For the complete ritual timetable, see the daily niti.',
      hoursCta: 'View full niti timetable →',
      hours: [
        { name: 'Mangala Arati', odia: 'ମଙ୍ଗଳ ଆରତୀ', time: '4:30 AM' },
        { name: 'Sahana Mela (open darshan)', odia: 'ସହାନ ମେଳା', time: '6:00 AM' },
        { name: 'Sakala Dhupa', odia: 'ସକାଳ ଧୂପ', time: '9:00 AM' },
        { name: 'Sandhya Arati', odia: 'ସନ୍ଧ୍ୟା ଆରତୀ', time: '6:30 PM' },
        { name: 'Pahuda (night rest)', odia: 'ବଡ଼ଶୃଙ୍ଗାର', time: '9:00 PM' },
      ],
      reachEyebrow: 'How to Reach',
      reachTitle: 'Finding the Mandir',
      reach: [
        {
          mode: 'By Road',
          desc: 'On the Gurugram–Sohna road near Maruti Kunj, Bhondsi. Ample parking is available beside the temple grounds.',
        },
        {
          mode: 'By Metro',
          desc: 'Nearest metro is HUDA City Centre (Yellow Line); take an auto or cab onward to Bhondsi, about 30–40 minutes.',
        },
        {
          mode: 'By Rail & Air',
          desc: 'Gurgaon Railway Station and IGI Airport are both within an hour by road, with taxis and ride-shares readily available.',
        },
      ],
      guidelinesEyebrow: 'Before You Come',
      guidelinesTitle: 'Darshan Guidelines',
      pleaseDo: 'Please do',
      pleaseAvoid: 'Please avoid',
      dos: [
        'Dress modestly — traditional or covered attire is appreciated.',
        'Remove footwear at the designated stands before entering.',
        'Maintain silence and queue calmly during aarti.',
        'Accept and partake of mahaprasad with reverence.',
      ],
      donts: [
        'Photography is not permitted inside the sanctum.',
        'Leather items and tobacco are not allowed inside.',
        'Avoid touching the deities or ritual articles.',
        'Please do not carry large bags into the shrine.',
      ],
      facilitiesEyebrow: 'For Devotees',
      facilitiesTitle: 'Facilities at the Mandir',
      facilities: [
        { glyph: '☷', title: 'Footwear Stand', desc: 'Free, supervised footwear counters at the entrance.' },
        { glyph: '✆', title: 'Help Desk', desc: 'Volunteers to guide first-time and elderly devotees.' },
        { glyph: '♿', title: 'Accessibility', desc: 'Ramp access and wheelchair assistance on request.' },
        { glyph: '☂', title: 'Shaded Queue', desc: 'Covered waiting area for darshan during peak hours.' },
        { glyph: '⊞', title: 'Parking', desc: 'On-site parking for two-wheelers and cars.' },
        { glyph: '✿', title: 'Prasad Counter', desc: 'Flowers, bhoga and mahaprasad available to devotees.' },
      ],
      annadanOdia: 'ଅନ୍ନଦାନ',
      annadanTitle: 'No devotee leaves hungry.',
      annadanBody:
        "Mahaprasad and community meals are offered daily as Annadan — the sacred tradition of feeding all who come to the Lord's door. Partake, or contribute a seva to keep the kitchen running.",
      annadanCta: 'Sponsor Annadan →',
    },

    about: {
      heroEyebrow: 'About the Mandir',
      heroTitle: 'Our Temple, Our Story',
      heroOdia: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର · ମାରୁତି କୁଞ୍ଜ',
      ourTempleEyebrow: 'Our Temple',
      ourTempleTitle: 'A piece of Puri in the heart of Maruti Kunj.',
      ourTempleBody1:
        'Shree Jagannath Mandir was raised by devotees who carried the love of Lord Jagannath far from the shores of Puri. What began as a small gathering for kirtan and bhajan has grown into a living temple — where the trinity of Jagannath, Balabhadra and Subhadra are worshipped through the full daily cycle of niti, just as they are in their original abode.',
      ourTempleBody2:
        'Today the mandir is a home for prayer, festival and community — open to every devotee who seeks the darshan of the Lord of the Universe.',
      innerSanctumAlt:
        'The adorned trinity — Jagannath, Balabhadra and Subhadra on the ratnavedi',
      traditionEyebrow: 'The Jagannath Tradition',
      traditionTitle: 'The Lord of the Universe, in wooden form.',
      traditionBody1:
        'Unlike most Hindu deities, Lord Jagannath is worshipped in a strikingly abstract wooden form — large round eyes, a broad smile, and no defined hands or feet. With his siblings Balabhadra and Subhadra, he embodies a darshan that is at once playful, profound and endlessly merciful.',
      traditionBody2:
        'Our rituals follow the Puri tradition closely — from the dawn Mangala Arati to the night-time Pahuda — so that devotees here may share in the same rhythm of worship that has continued for centuries.',
      shikharaAlt: 'Temple shikhara with Sudarshan Chakra and pata flag',
      valuesEyebrow: 'What we live by',
      valuesTitle: 'More than a temple — a community.',
      values: [
        {
          odia: 'ଭକ୍ତି',
          title: 'Daily Devotion',
          desc: 'The full cycle of niti is observed every day, without exception — from the first aarti before dawn to the night rest of the deities.',
        },
        {
          odia: 'ଅନ୍ନଦାନ',
          title: 'Annadan',
          desc: 'Mahaprasad and community meals are offered, so that no devotee who comes to the Lord leaves hungry.',
        },
        {
          odia: 'ଉତ୍ସବ',
          title: 'Festivals',
          desc: 'Ratha Yatra, Janmashtami, Kartik Purnima and more are celebrated with the full grandeur of the Puri tradition.',
        },
      ],
      ganapatiAlt: 'Lord Ganapati',
      ganapatiName: 'Ganapati',
      ganapatiOdia: 'ଗଣପତି',
      ganapatiDevanagari: '( गणपति )',
      ctaOdia: 'ସେବା ଓ ଦାନ',
      ctaTitle: 'Become a part of the seva.',
      ctaBody:
        'Your support keeps the lamps lit, the bhoga offered, and the Annadan kitchen running for every devotee.',
      ctaButton: 'Donate with devotion →',
    },

    deities: {
      heroEyebrow: 'Darshan · ଦର୍ଶନ',
      heroTitle: 'The Deities',
      heroOdia: 'ଶ୍ରୀ ମନ୍ଦିରର ଦେବଦେବୀ',
      intro:
        'At the heart of the mandir sit Lord Jagannath, his elder brother Balabhadra and their sister Subhadra — worshipped together with the Sudarshan Chakra on the sacred ratnavedi. Around them stand the parivar devata, the guardian and companion deities who complete the divine family of the temple.',
      trinityEyebrow: 'The Holy Trinity · ଚତୁର୍ଦ୍ଧା ମୂର୍ତ୍ତି',
      trinityTitle: 'Jagannath, Balabhadra & Subhadra',
      trinity: [
        {
          name: 'Balabhadra',
          odia: 'ବଳଭଦ୍ର',
          devanagari: 'बलभद्र',
          color: 'White (Śveta)',
          tag: 'The Elder Brother',
          imageAlt: 'Balabhadra — the elder brother, white form on the ratnavedi',
          description:
            'The eldest of the trinity, worshipped in a striking white form. Balabhadra represents strength, righteousness and the protective elder — guardian of his brother and sister, and an embodiment of plough and power.',
        },
        {
          name: 'Jagannath',
          odia: 'ଜଗନ୍ନାଥ',
          devanagari: 'जगन्नाथ',
          color: 'Dark (Kṛṣṇa)',
          tag: 'Lord of the Universe',
          imageAlt: 'Lord Jagannath — dark wooden form with large compassionate eyes',
          description:
            'The presiding deity — the Lord of the Universe in his distinctive dark wooden form with large round eyes and a boundless smile. A form of Krishna, Jagannath embodies infinite compassion, accepting every devotee exactly as they are.',
        },
        {
          name: 'Subhadra',
          odia: 'ସୁଭଦ୍ରା',
          devanagari: 'सुभद्रा',
          color: 'Golden (Pīta)',
          tag: 'The Sister',
          imageAlt: 'Subhadra — golden form between her two brothers',
          description:
            'The beloved sister, worshipped in a radiant golden form between her two brothers. Subhadra represents grace, auspiciousness and the divine feminine at the centre of the holy family.',
        },
      ],
      sudarshanOdia: 'ସୁଦର୍ଶନ ଚକ୍ର',
      sudarshanName: 'Sudarshan Chakra',
      sudarshanDesc:
        "The fourth presence on the ratnavedi — a pillar-like wooden form representing the Lord's divine discus. Worshipped alongside the trinity, Sudarshan is the radiant weapon and protector, completing the chaturdha murti, the four sacred forms.",
      parivarEyebrow: 'Parivar Devata · ପରିବାର ଦେବତା',
      parivarTitle: 'The Divine Family',
      parivarSubhead:
        'The guardian and companion deities who surround the Lord — each with their place and purpose in the temple.',
      parivar: [
        { name: 'Jaya', odia: 'ଜୟ', role: 'Dwarapala — guardian of the sacred threshold.' },
        { name: 'Bijaya', odia: 'ବିଜୟ', role: 'Dwarapala — guardian who stands beside Jaya.' },
        { name: 'Garuda', odia: 'ଗରୁଡ଼', role: 'The divine eagle, eternal vahana and devotee.' },
        { name: 'Hanuman', odia: 'ହନୁମାନ', role: 'Bajrangbali — protector and supreme servant.' },
        { name: 'Maa Laxmi', odia: 'ମା ଲକ୍ଷ୍ମୀ', role: 'Goddess of fortune, consort of the Lord.' },
        { name: 'Maa Bhudevi', odia: 'ମା ଭୂଦେବୀ', role: 'Earth goddess, the second consort.' },
        { name: 'Narasimha', odia: 'ନରସିଂହ', role: 'The fierce lion-man, remover of fear.' },
        { name: 'Ganapati', odia: 'ଗଣପତି', role: 'The remover of obstacles, worshipped first.' },
      ],
      ctaEyebrow: 'Have darshan in person',
      ctaTitle: 'Come stand before the Lord.',
      ctaBody:
        'Plan your visit for darshan, or join the daily aarti from wherever you are through live darshan.',
      ctaVisit: 'Plan your visit →',
      ctaTimings: 'Darshan timings',
    },

    donate: {
      heroEyebrow: 'Donate with devotion',
      heroTitle: 'Your Donation,\nTheir Blessing.',
      heroBody:
        'Every rupee you offer is received as seva to Lord Jagannath — sustaining daily worship, festivals and the meals that feed every devotee who comes to His door.',
      heroCta: 'Donate Now →',
      purposesEyebrow: 'Where your seva goes',
      purposesTitle: 'Every contribution has a purpose.',
      purposes: [
        { odia: 'ମନ୍ଦିର', title: 'Temple Upkeep', desc: 'Maintaining the shrine, lighting, and the sacred space of the deities.' },
        { odia: 'ସେବା ପୂଜା', title: 'Daily Seva & Puja', desc: 'The daily rituals, flowers, incense and offerings for the Lord.' },
        { odia: 'ଅନ୍ନଦାନ', title: 'Annadan', desc: 'Mahaprasad and community meals served free to every visiting devotee.' },
        { odia: 'ସମାଜ', title: 'Community Support', desc: 'Cultural programs, education and seva for the wider community.' },
      ],
      formTitle: 'Choose your contribution',
      formSub: '100% of your donation goes to the temple. 80G receipt issued instantly.',
      oneTimeGift: 'One-time gift',
      monthlySeva: 'Monthly seva',
      donorDetails: 'Donor details',
      proceedDonate: 'Proceed to donate ₹{{amount}}{{suffix}}',
      proceedSuffixMonthly: '/mo',
      donateSuccess:
        'Thank you for your seva. Your 80G receipt will be sent to your email shortly.',
      makeAnother: 'Make another donation',
      secureNote: 'Secure payment · UPI · Cards · Net-banking',
      trustTitle: 'Safe & transparent',
      trust: [
        'Your donation is processed over a secure, encrypted gateway.',
        'Funds are used transparently for temple worship and social seva.',
        'Eligible for 80G tax exemption — receipt issued instantly by email.',
      ],
      sevaTitle: 'Sponsor a Seva',
      sevaDesc:
        "Dedicate a full day's bhoga, an aarti, or a festival ritual in your family's name and receive the Lord's prasad.",
      sevaLink: 'Explore sevas & projects →',
      otherEyebrow: 'Other ways to give',
      otherTitle: 'Prefer UPI or bank transfer?',
      upiTitle: 'UPI Payment',
      upiId: 'MSJAGANNATHMANDIRMARUTIKUNJ.eazypay@icici',
      upiQrAlt: 'ICICI Bank UPI QR code — scan to pay Jagannath Mandir Marutikunj',
      bankTitle: 'Bank Transfer',
      bank: [
        { label: 'Account name', value: 'JAGANNATH MANDIR MARUTI KUNJ', mono: false },
        { label: 'Account Number', value: '114705002234', mono: true },
        { label: 'IFSC Code', value: 'ICIC0001147', mono: true },
        { label: 'Bank', value: 'ICICI Bank', mono: false },
      ],
      amounts: [
        { amt: '501', note: 'Lamp & flowers' },
        { amt: '1,100', note: "A day's puja" },
        { amt: '2,100', note: 'Feeds 50 devotees' },
        { amt: '5,100', note: "A day's bhoga" },
        { amt: '11,000', note: 'Festival seva' },
        { amt: '21,000', note: 'Annadan patron' },
      ],
      quote: '"Whatever you offer with devotion, I accept."',
      quoteAttrib: '— Lord Jagannath',
      laxmiOdia: 'ମା ଲକ୍ଷ୍ମୀ',
      bhudeviOdia: 'ମା ଭୂଦେବୀ',
    },

    contact: {
      heroEyebrow: 'Contact Us',
      heroTitle: "We're Here to Help",
      heroOdia: 'ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ',
      formTitle: 'Send us a message',
      formSubtitle: 'Fill out the form and our team will get back to you.',
      info: [
        { icon: '⊙', title: 'Address', body: 'Shree Jagannath Mandir,\nMaruti Kunj, Bhondsi,\nGurgaon, Sector 67 122102' },
        { icon: '✆', title: 'Call / WhatsApp', body: '+91 97171 80859\nWhatsApp available' },
        { icon: '✉', title: 'Email', body: 'office@shreejagannathmandirmk.in' },
        { icon: '◷', title: 'Office Hours', body: '9:00 AM – 9:00 PM\nEvery day' },
        { icon: '◈', title: 'Help Desk', body: '+91 97171 80859\nMon–Sun · 9 AM–9 PM' },
      ],
      narasimhaAlt: 'Lord Narasimha',
      narasimhaName: 'Narasimha',
      narasimhaOdia: 'ନରସିଂହ',
      narasimhaDevanagari: '( नरसिंह )',
    },

    live: {
      title: 'Live Darshan',
      odia: 'ସିଧାସଳଖ ଦର୍ଶନ',
      subtitle: 'Streaming daily, 4:30 AM – 9:00 PM',
      playStream: 'Play live stream',
      switchCamera: 'Switch to {{name}} camera',
      scheduleTitle: "Today's Aarti Schedule",
      notifyTitle: 'Never miss an aarti.',
      notifyBody:
        'Get a reminder before each live aarti and on festival days, so you can join the darshan from anywhere.',
      notifyPlaceholder: 'Enter your email or WhatsApp number',
      notifyAria: 'Email or WhatsApp number for aarti reminders',
      notifySuccess: "You're subscribed — we'll remind you before each aarti.",
      recordingsEyebrow: 'Watch again',
      recordingsTitle: 'Recent Aartis & Festivals',
      playRecording: 'Play {{title}}',
      cameras: [
        { name: 'Main Darshan', label: 'main cam' },
        { name: 'Ratnavedi', label: 'sanctum' },
        { name: 'Aarti View', label: 'aarti' },
        { name: 'Temple Hall', label: 'hall' },
      ],
      schedule: [
        { time: '4:30 AM', name: 'Mangala Arati', odia: 'ମଙ୍ଗଳ ଆରତୀ', status: 'ended' },
        { time: '6:00 AM', name: 'Sahana Mela', odia: 'ସହାନ ମେଳା', status: 'ended' },
        { time: '9:00 AM', name: 'Sakala Dhupa', odia: 'ସକାଳ ଧୂପ', status: 'ended' },
        { time: '12:30 PM', name: 'Madhyahna Dhupa', odia: 'ମଧ୍ୟାହ୍ନ ଧୂପ', status: 'live' },
        { time: '6:30 PM', name: 'Sandhya Arati', odia: 'ସନ୍ଧ୍ୟା ଆରତୀ', status: 'upcoming' },
        { time: '9:00 PM', name: 'Pahuda', odia: 'ବଡ଼ଶୃଙ୍ଗାର', status: 'upcoming' },
      ],
      recordings: [
        { title: 'Mangala Arati', date: '26 JUN 2026', duration: '18:42' },
        { title: 'Sandhya Arati', date: '25 JUN 2026', duration: '22:10' },
        { title: 'Ratha Yatra — Highlights', date: '16 JUL 2025', duration: '1:04:30' },
      ],
    },

    festivals: {
      heroEyebrow: 'Utsav · ଉତ୍ସବ',
      heroTitle: 'Festivals & Events',
      heroOdia: 'ବର୍ଷ ସାରା ଉତ୍ସବ ଓ ପର୍ବ',
      featuredEyebrow: 'Next grand festival · {{day}} {{month}} · {{weekday}}',
      featuredDetails: 'Festival details →',
      addToCalendar: 'Add to calendar',
      calendarTitle: 'Festival Calendar',
      panjikaNote: 'Official Odia calendar verified from {{source}} · {{period}}',
      downloadPdf: 'Download official Panjika PDF ↓',
      eventsCount: '{{count}} events',
      defaultDescription: 'Shree Mandira Panjika 2026–27 · Shree Mandira, Puri',
      rathaDescLong:
        'The grand chariot festival — Lord Jagannath, Balabhadra and Subhadra ride out on the magnificent chariots to bless every devotee.',
      meta: {
        title: PANJIKA_META.title,
        source: PANJIKA_META.source,
        period: PANJIKA_META.period,
      },
      events: PANJIKA_EVENTS.map((e) => ({
        date: e.date,
        day: e.day,
        month: e.month,
        weekday: e.weekday,
        name: e.name,
        featured: e.featured,
        odia: e.odia,
        description: e.description,
        descriptionLong: e.descriptionLong,
      })),
    },

    prasad: {
      heroEyebrow: 'Mahaprasad · ମହାପ୍ରସାଦ',
      heroTitle: 'Book Sacred Prasad',
      heroOdia: 'ଭଗବାନଙ୍କ ମହାପ୍ରସାଦ ବୁକ୍ କରନ୍ତୁ',
      howItWorks: 'How prasad booking works',
      steps: [
        { n: '1', title: 'Choose collection', desc: 'Temple pickup or Ananda Bazar, and your preferred date.' },
        { n: '2', title: 'Share details', desc: 'Your name, phone, quantity and any special request.' },
        { n: '3', title: 'Confirm on WhatsApp', desc: 'We open WhatsApp with your booking so our sevaks can confirm.' },
      ],
      formEyebrow: 'Booking details',
      formTitle: 'Reserve your prasad',
      formHelper:
        "Fill in the details below. On submit you'll be taken to the mandir's WhatsApp with everything pre-filled, so our sevaks can confirm your booking.",
      mahaprasad: 'Mahaprasad',
      mahaprasadOdia: 'ମହାପ୍ରସାଦ',
      pickupNote: 'Temple pickup · packing included',
      bazarNote: 'Packed prasad at Ananda Bazar',
      collection: 'Collection',
      collectionAria: 'Collection method',
      fullNameRequired: 'Full name*',
      namePlaceholder: 'Your name',
      phoneRequired: 'Phone / WhatsApp*',
      quantity: 'Quantity (persons)',
      decreaseQty: 'Decrease quantity',
      increaseQty: 'Increase quantity',
      preferredDate: 'Preferred date',
      datePlaceholder: 'e.g. 16 July 2026',
      dateHint: 'Rate depends on weekday vs Saturday/Sunday.',
      notesOptional: 'Notes (optional)',
      notesPlaceholder: 'Special request (gotra, occasion, pickup time)…',
      submit: 'Book & Confirm on WhatsApp',
      submitCaption:
        "You'll be redirected to the mandir's WhatsApp with your details filled in.",
      summaryEyebrow: 'Your booking',
      summaryPrasad: 'Prasad',
      summaryRate: 'Rate',
      summaryQuantity: 'Quantity',
      summaryPersons: '{{count}} person(s)',
      summaryCollection: 'Collection',
      summaryDate: 'Date',
      summaryTotal: 'Est. offering',
      selectDate: 'Select date',
      whatsappTitle: 'Confirmed on WhatsApp',
      whatsappBody:
        'No online payment needed now. Our sevaks confirm availability, the offering amount, and timing directly with you on chat.',
      noteText:
        'Mahaprasad is the sanctified food offered to Lord Jagannath — received as His blessing, never merely a meal.',
      methods: [
        { id: 'pickup', label: 'Temple pickup' },
        { id: 'ananda-bazar', label: 'At temple Ananda Bazar' },
      ],
      weekday: 'Weekday',
      weekend: 'Sat–Sun',
      priceWeekdayWeekend: '{{weekday}} weekdays · {{weekend}} Sat–Sun',
      whatsappTemplate: {
        header: '🙏 *Prasad Booking — Shree Jagannath Mandir*',
        name: '*Name:*',
        phone: '*Phone:*',
        prasad: '*Prasad:*',
        quantity: '*Quantity:*',
        collection: '*Collection:*',
        date: '*Preferred date:*',
        offering: '*Est. offering:*',
        notes: '*Notes:*',
        notSpecified: 'Not specified',
        footer: 'Please confirm availability. Jai Jagannath 🚩',
      },
    },

    blog: {
      heroEyebrow: 'Sambad & Katha · ସମ୍ବାଦ',
      heroTitle: 'Temple Journal',
      heroOdia: 'ମନ୍ଦିର ଓ ଉତ୍ସବ ସମ୍ବନ୍ଧୀୟ ଲେଖା',
      latestEyebrow: 'Latest writing',
      gridTitle: 'From the Mandir',
      filterAria: 'Filter by category',
      emptyTitle: 'No posts in this category yet',
      emptyText: 'Check back soon — new writing is added regularly.',
      newsletterOdia: 'ସମ୍ବାଦ ପାଆନ୍ତୁ',
      newsletterTitle: 'Festival news, in your inbox.',
      newsletterCopy:
        'Subscribe for notices about upcoming festivals, special darshan, and new stories from the mandir.',
      emailLabel: 'Email address',
      emailPlaceholder: 'Enter your email address',
      categories: {
        all: 'All',
        festivals: 'Festivals',
        traditions: 'Traditions',
        templeLife: 'Temple Life',
      },
      posts: [
        {
          title: 'Ratha Yatra 2026 — What to Expect',
          category: 'Festivals',
          date: '28 Jun 2026',
          excerpt:
            'The chariots roll on 16 July. A guide to the procession, the best darshan spots, and the seva you can offer this year.',
        },
        {
          title: 'The Meaning Behind Anasara',
          category: 'Traditions',
          date: '20 Jun 2026',
          excerpt:
            "Why the deities rest and public darshan pauses for a fortnight — the story of the Lord's annual retreat and recovery.",
        },
        {
          title: 'A Morning with the Mangala Arati',
          category: 'Temple Life',
          date: '12 Jun 2026',
          excerpt:
            'Before dawn, the temple stirs. A quiet walk through the first ritual of the day and the sevaks who keep it alive.',
        },
        {
          title: 'Understanding Mahaprasad',
          category: 'Traditions',
          date: '2 Jun 2026',
          excerpt:
            'More than food — the sanctified offering of Lord Jagannath, its history, and why it is shared without distinction.',
        },
        {
          title: 'Kartik Purnima & the Festival of Lamps',
          category: 'Festivals',
          date: '24 May 2026',
          excerpt:
            "Boita Bandana, floating lamps, and the memory of Odisha's ancient maritime voyages on the full-moon night.",
        },
        {
          title: 'Meet the Sevaks: Voices from the Kitchen',
          category: 'Temple Life',
          date: '14 May 2026',
          excerpt:
            'The volunteers behind the Annadan kitchen share what daily seva means to them and their families.',
        },
      ],
    },

    gallery: {
      eyebrow: 'Darshan Gallery · ଦର୍ଶନ',
      title: 'Inside Our Mandir',
      viewFull: 'View full gallery →',
      items: [
        {
          id: 'trinity-adorned',
          label: 'Jagannath trinity — adorned',
          alt: 'Jagannath, Balabhadra and Subhadra adorned with flowers on the ratnavedi',
        },
        {
          id: 'mangala-arati',
          label: 'Mangala Arati',
          alt: 'The trinity at dawn Mangala Arati',
        },
        {
          id: 'shikhara-pata',
          label: 'Festival decoration',
          alt: 'Temple shikhara with Sudarshan Chakra and pata flag',
        },
        {
          id: 'shikhara-night',
          label: 'Shikhara by night',
          alt: 'Temple shikhara illuminated at night',
        },
        {
          id: 'bhoga-offering',
          label: 'Bhoga offering',
          alt: 'Bhoga and flower offerings before the deities',
        },
        {
          id: 'jagannath-darshan',
          label: 'Evening darshan',
          alt: 'Lord Jagannath adorned for darshan',
        },
        {
          id: 'trinity-ratnavedi',
          label: 'Ratnavedi darshan',
          alt: 'The holy trinity on the ratnavedi',
        },
        {
          id: 'balabhadra-darshan',
          label: 'Balabhadra darshan',
          alt: 'Lord Balabhadra adorned for darshan',
        },
      ],
    },
  };
}

// Deep translation maps keyed by dot-path for leaf string values
const OR_TRANSLATIONS = {
  'common.loading': 'ଲୋଡ୍ ହେଉଛି…',
  'common.tryAgain': 'ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ',
  'common.getDirections': 'ଦିଗ ନିର୍ଦ୍ଦେଶ ପାଆନ୍ତୁ →',
  'common.readMore': 'ଆହୁରି ପଢ଼ନ୍ତୁ →',
  'common.readFullStory': 'ସମ୍ପୂର୍ଣ୍ଣ କଥା ପଢ଼ନ୍ତୁ →',
  'common.viewArchive': 'ଆର୍କାଇଭ୍ ଦେଖନ୍ତୁ →',
  'common.subscribe': 'ସବସ୍କ୍ରାଇବ୍',
  'common.sendMessage': 'ବାର୍ତ୍ତା ପଠାନ୍ତୁ',
  'common.notifyMe': 'ମୋତେ ଜଣାନ୍ତୁ',
  'common.openMenu': 'ମେନୁ ଖୋଲନ୍ତୁ',
  'common.closeMenu': 'ମେନୁ ବନ୍ଦ କରନ୍ତୁ',
  'common.mainNav': 'ମୁଖ୍ୟ',
  'common.loadingPage': 'ପୃଷ୍ଠା ଲୋଡ୍ ହେଉଛି',
  'common.pageError': 'ଏହି ପୃଷ୍ଠା ଲୋଡ୍ କରିବାରେ କିଛି ଭୁଲ ହୋଇଛି।',
  'common.live': 'ଲାଇଭ୍',
  'common.ended': 'ସମାପ୍ତ',
  'common.upcoming': 'ଆଗାମୀ',
  'common.all': 'ସବୁ',
  'common.untitled': 'ଶୀର୍ଷକହୀନ',
};

// For brevity in script: use recursive deep translate with lookup tables per locale
function deepTranslate(obj, locale) {
  if (locale === 'en') return obj;
  const table = locale === 'or' ? OR_FULL : HI_FULL;
  return translateValue(obj, '', table);
}

function translateValue(value, path, table) {
  if (typeof value === 'string') {
    return table[path] ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => translateValue(item, `${path}[${i}]`, table));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const childPath = path ? `${path}.${k}` : k;
      out[k] = translateValue(v, childPath, table);
    }
    return out;
  }
  return value;
}

function flattenStrings(obj, prefix = '', out = {}) {
  if (typeof obj === 'string') {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenStrings(item, `${prefix}[${i}]`, out));
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      flattenStrings(v, p, out);
    }
  }
  return out;
}

function countLeafStrings(obj) {
  return Object.keys(flattenStrings(obj)).length;
}

function serialize(obj) {
  const json = JSON.stringify(obj, null, 2);
  return `export default ${json};\n`;
}

// Build full translation tables from English base
const EN = buildEn();
const EN_FLAT = flattenStrings(EN);

// Generate Odia and Hindi translations programmatically for known paths
// OR_FULL and HI_FULL will be populated below

function buildLocaleTable(enFlat, translations) {
  const table = { ...enFlat };
  for (const [path, translated] of Object.entries(translations)) {
    if (path in enFlat) table[path] = translated;
  }
  return table;
}

// Import translation data from separate modules would be ideal; inline for single script run
const { OR_FULL, HI_FULL } = await import('./locale-translations.mjs');

mkdirSync(OUT, { recursive: true });

for (const [code, table] of [
  ['en', EN],
  ['or', translateValue(EN, '', buildLocaleTable(EN_FLAT, OR_FULL))],
  ['hi', translateValue(EN, '', buildLocaleTable(EN_FLAT, HI_FULL))],
]) {
  writeFileSync(join(OUT, `${code}.js`), serialize(code === 'en' ? EN : translateValue(EN, '', buildLocaleTable(EN_FLAT, code === 'or' ? OR_FULL : HI_FULL))));
}

const enCount = countLeafStrings(EN);
const orCount = countLeafStrings(translateValue(EN, '', buildLocaleTable(EN_FLAT, OR_FULL)));
const hiCount = countLeafStrings(translateValue(EN, '', buildLocaleTable(EN_FLAT, HI_FULL)));

console.log(JSON.stringify({ en: enCount, or: orCount, hi: hiCount, paths: Object.keys(EN) }));
