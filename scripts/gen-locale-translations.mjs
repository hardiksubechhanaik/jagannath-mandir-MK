/**
 * Generates scripts/locale-translations.mjs from English path inventory.
 * Run: node scripts/gen-locale-translations.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const panjika = await import(pathToFileURL(join(ROOT, 'src/data/panjika2026.js')).href);
const PANJIKA_EVENTS = panjika.default || panjika.PANJIKA_EVENTS;
const PANJIKA_META = panjika.PANJIKA_META;

const src = readFileSync(join(ROOT, 'scripts/build-locales.mjs'), 'utf8');
const fnBody = src.match(/function buildEn\(\) \{([\s\S]*?)\n\}/)[1];
const buildEn = new Function(
  'PANJIKA_EVENTS',
  'PANJIKA_META',
  'return {' + fnBody.replace(/^\s*return \{/, '').replace(/\};\s*$/, '') + '}',
);
const EN = buildEn(PANJIKA_EVENTS, PANJIKA_META);

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

function shouldSkip(path, val) {
  if (/festivals\.events\[\d+\]\.name$/.test(path)) return true;
  if (/festivals\.events\[\d+\]\.descriptionLong$/.test(path) && val === '') return true;
  if (/festivals\.events\[\d+\]\.(date|day|month|weekday|featured)$/.test(path)) return true;
  if (/festivals\.events\[\d+\]\.odia$/.test(path) && val === '') return true;
  if (val === '') return true;
  if (path === 'site.footerJay') return true;
  if (path === 'site.phone') return true;
  if (/^site\.(address|addressShort|addressLine|mapTitle)$/.test(path)) return true;
  if (/^forms\.(emailPlaceholder|phonePlaceholder|panPlaceholder|phoneShort)$/.test(path)) return true;
  if (path === 'donate.upiId') return true;
  if (/^donate\.bank\[\d+\]\.(value|label)$/.test(path)) return true;
  if (/^donate\.amounts\[\d+\]\.amt$/.test(path)) return true;
  if (/^contact\.info\[\d+\]\.body$/.test(path)) return true;
  if (/\.time$/.test(path)) return true;
  if (/live\.recordings\[\d+\]\.(date|duration)/.test(path)) return true;
  if (/home\.festivalPreview\[\d+\]\.(date|name)/.test(path)) return true;
  if (/blog\.posts\[\d+\]\.date/.test(path)) return true;
  if (/festivals\.meta\.(title|source|period)/.test(path)) return true;
  if (val.includes('₹')) return true;
  if (
    /^niti\.(mangalaArati|abakasha|sahanaMela|sahanaMelaOpen|sakalaDhupa|madhyahnaDhupa|sandhyaArati|sandhyaDhupa|pahuda|pahudaNight)$/.test(
      path,
    )
  )
    return true;
  if (/^niti\.(summer|winter)\[\d+\]\.name$/.test(path)) return true;
  if (/^visit\.hours\[\d+\]\.name$/.test(path)) return true;
  if (/^live\.schedule\[\d+\]\.name$/.test(path)) return true;
  if (/^live\.recordings\[\d+\]\.title$/.test(path)) return true;
  if (/^deities\.trinity\[\d+\]\.name$/.test(path)) return true;
  if (/^deities\.parivar\[\d+\]\.name$/.test(path)) return true;
  if (path === 'status.nextMadhyahna' || path === 'status.opensMangala') return true;
  if (path === 'home.nextMadhyahna' || path === 'home.nextMangala') return true;
  if (path === 'home.todayTithi') return true;
  if (
    /^(about|contact|deities|home)\.(ganapatiName|narasimhaName|sudarshanName|jayaName|vijayaName|garudaName|hanumanName|laxmiName)$/.test(
      path,
    )
  )
    return true;
  if (/prasad\.methods\[\d+\]\.id$/.test(path)) return true;
  if (/gallery\.items\[\d+\]\.id$/.test(path)) return true;
  if (/deities\.trinity\[\d+\]\.devanagari$/.test(path)) return true;
  return false;
}

const EN_FLAT = flattenStrings(EN);
const PATHS = Object.entries(EN_FLAT)
  .filter(([p, v]) => !shouldSkip(p, v))
  .sort((a, b) => a[0].localeCompare(b[0]));

/** Odia display fields — keep Odia script in OR, Devanagari in HI */
const ODIA_DISPLAY = {
  'ଭକ୍ତି': { or: 'ଭକ୍ତି', hi: 'भक्ति' },
  'ଅନ୍ନଦାନ': { or: 'ଅନ୍ନଦାନ', hi: 'अन्नदान' },
  'ଉତ୍ସବ': { or: 'ଉତ୍ସବ', hi: 'उत्सव' },
  'ମନ୍ଦିର': { or: 'ମନ୍ଦିର', hi: 'मंदिर' },
  'ସେବା ଓ ଦାନ': { or: 'ସେବା ଓ ଦାନ', hi: 'सेवा और दान' },
  'ଗଣପତି': { or: 'ଗଣପତି', hi: 'गणपति' },
  'ନରସିଂହ': { or: 'ନରସିଂହ', hi: 'नरसिंह' },
  'ମା ଲକ୍ଷ୍ମୀ': { or: 'ମା ଲକ୍ଷ୍ମୀ', hi: 'माँ लक्ष्मी' },
  'ମା ଭୂଦେବୀ': { or: 'ମା ଭୂଦେବୀ', hi: 'माँ भूदेवी' },
  'ଜୟ': { or: 'ଜୟ', hi: 'जय' },
  'ବିଜୟ': { or: 'ବିଜୟ', hi: 'विजय' },
  'ଗରୁଡ଼': { or: 'ଗରୁଡ଼', hi: 'गरुड़' },
  'ହନୁମାନ': { or: 'ହନୁମାନ', hi: 'हनुमान' },
  'ବଳଭଦ୍ର': { or: 'ବଳଭଦ୍ର', hi: 'बलभद्र' },
  'ଜଗନ୍ନାଥ': { or: 'ଜଗନ୍ନାଥ', hi: 'जगन्नाथ' },
  'ସୁଭଦ୍ରା': { or: 'ସୁଭଦ୍ରା', hi: 'सुभद्रा' },
  'ମଙ୍ଗଳ ଆରତୀ': { or: 'ମଙ୍ଗଳ ଆରତୀ', hi: 'मंगला आरती' },
  'ଅବକାଶ': { or: 'ଅବକାଶ', hi: 'अबकाश' },
  'ସହାନ ମେଳା': { or: 'ସହାନ ମେଳା', hi: 'सहान मेला' },
  'ସକାଳ ଧୂପ': { or: 'ସକାଳ ଧୂପ', hi: 'सakala धूप' },
  'ମଧ୍ୟାହ୍ନ ଧୂପ': { or: 'ମଧ୍ୟାହ୍ନ ଧୂପ', hi: 'मध्याह्न धूप' },
  'ସନ୍ଧ୍ୟା ଆରତୀ': { or: 'ସନ୍ଧ୍ୟା ଆରତୀ', hi: 'संध्या आरती' },
  'ସନ୍ଧ୍ୟା ଧୂପ': { or: 'ସନ୍ଧ୍ୟା ଧୂପ', hi: 'संध्या धूप' },
  'ବଡ଼ଶୃଙ୍ଗାର': { or: 'ବଡ଼ଶୃଙ୍ଗାର', hi: 'बड़शृंगार' },
  'ଗରୁଡ଼ ମହାରାଜା': { or: 'ଗରୁଡ଼ ମହାରାଜା', hi: 'गरुड़ महाराजा' },
  'ବଜରଙ୍ଗବଳୀ': { or: 'ବଜରଙ୍ଗବଳୀ', hi: 'बजरंगबली' },
  'ରଥଯାତ୍ରା': { or: 'ରଥଯାତ୍ରା', hi: 'रथयात्रा' },
  'ମହାପ୍ରସାଦ': { or: 'ମହାପ୍ରସାଦ', hi: 'महाप्रसाद' },
};

const PANJIKA_DESC =
  'Shree Mandira Panjika 2026–27 · Shree Mandira, Puri';
const PANJIKA_DESC_OR = 'ଶ୍ରୀ ମନ୍ଦିର ପଞ୍ଜିକା ୨୦୨୬–୨୭ · ଶ୍ରୀ ମନ୍ଦିର, ପୁରୀ';
const PANJIKA_DESC_HI = 'श्री मंदिर पंजिका २०२६–२७ · श्री मंदिर, पुरी';

const RATHA_DESC_LONG =
  'The grand chariot festival — Lord Jagannath, Balabhadra and Subhadra ride out on the magnificent chariots to bless every devotee.';
const RATHA_DESC_LONG_OR =
  'ମହାନ ରଥଯାତ୍ରା — ଭଗବାନ Jagannath, Balabhadra ଓ Subhadra ମହାନ ରଥରେ ଚଢ଼ି ଯାଇ ପ୍ରତ୍ୟେକ ଭକ୍ତଙ୍କୁ ଆଶୀର୍ବାଦ କରନ୍ତି।';
const RATHA_DESC_LONG_HI =
  'महान रथयात्रा — भगवान Jagannath, Balabhadra और Subhadra शानदार रथों पर सवार होकर हर भक्त को आशीर्वाद देते हैं।';

/** Path-specific translations: { or, hi } */
const T = {
  // ── common ──
  'common.loading': { or: 'ଲୋଡ୍ ହେଉଛି…', hi: 'लोड हो रहा है…' },
  'common.tryAgain': { or: 'ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ', hi: 'पुनः प्रयास करें' },
  'common.getDirections': { or: 'ଦିଗ ନିର୍ଦ୍ଦେଶ ପାଆନ୍ତୁ →', hi: 'दिशा-निर्देश पाएँ →' },
  'common.readMore': { or: 'ଆହୁରି ପଢ଼ନ୍ତୁ →', hi: 'और पढ़ें →' },
  'common.readFullStory': { or: 'ସମ୍ପୂର୍ଣ୍ଣ କଥା ପଢ଼ନ୍ତୁ →', hi: 'पूरी कहानी पढ़ें →' },
  'common.viewArchive': { or: 'ଆର୍କାଇଭ୍ ଦେଖନ୍ତୁ →', hi: 'आर्काइव देखें →' },
  'common.subscribe': { or: 'ସବସ୍କ୍ରାଇବ୍', hi: 'सब्सक्राइब करें' },
  'common.sendMessage': { or: 'ବାର୍ତ୍ତା ପଠାନ୍ତୁ', hi: 'संदेश भेजें' },
  'common.notifyMe': { or: 'ମୋତେ ଜଣାନ୍ତୁ', hi: 'मुझे सूचित करें' },
  'common.openMenu': { or: 'ମେନୁ ଖୋଲନ୍ତୁ', hi: 'मेनू खोलें' },
  'common.closeMenu': { or: 'ମେନୁ ବନ୍ଦ କରନ୍ତୁ', hi: 'मेनू बंद करें' },
  'common.mainNav': { or: 'ମୁଖ୍ୟ', hi: 'मुख्य' },
  'common.loadingPage': { or: 'ପୃଷ୍ଠା ଲୋଡ୍ ହେଉଛି', hi: 'पृष्ठ लोड हो रहा है' },
  'common.pageError': { or: 'ଏହି ପୃଷ୍ଠା ଲୋଡ୍ କରିବାରେ କିଛି ଭୁଲ ହୋଇଛି।', hi: 'इस पृष्ठ को लोड करने में कुछ गड़बड़ हुई।' },
  'common.live': { or: 'ଲାଇଭ୍', hi: 'लाइव' },
  'common.ended': { or: 'ସମାପ୍ତ', hi: 'समाप्त' },
  'common.upcoming': { or: 'ଆଗାମୀ', hi: 'आगामी' },
  'common.all': { or: 'ସବୁ', hi: 'सभी' },
  'common.untitled': { or: 'ଶୀର୍ଷକହୀନ', hi: 'शीर्षकहीन' },
  'common.requestFailed': { or: 'ଅନୁରୋଧ ବିଫଳ ({{status}})', hi: 'अनुरोध विफल ({{status}})' },

  // ── nav ──
  'nav.home': { or: 'ମୁଖ୍ୟ ପୃଷ୍ଠା', hi: 'होम' },
  'nav.visit': { or: 'ଦର୍ଶନ', hi: 'दर्शन' },
  'nav.events': { or: 'ଉତ୍ସବ', hi: 'कार्यक्रम' },
  'nav.sevas': { or: 'ସେବା', hi: 'सेवा' },
  'nav.about': { or: 'ପରିଚୟ', hi: 'परिचय' },
  'nav.planYourVisit': { or: 'ଯାତ୍ରା ଯୋଜନା', hi: 'यात्रा की योजना' },
  'nav.darshanTimings': { or: 'ଦର୍ଶନ ଓ ସମୟ', hi: 'दर्शन और समय' },
  'nav.theDeities': { or: 'ଦେବଦେବୀ', hi: 'देवता' },
  'nav.liveDarshan': { or: 'ଲାଇଭ୍ ଦର୍ଶନ', hi: 'लाइव दर्शन' },
  'nav.festivalsEvents': { or: 'ଉତ୍ସବ ଓ କାର୍ଯ୍ୟକ୍ରମ', hi: 'उत्सव और कार्यक्रम' },
  'nav.templeJournal': { or: 'ମନ୍ଦିର ଜର୍ନାଲ (ବ୍ଲଗ)', hi: 'मंदिर जर्नल (ब्लॉग)' },
  'nav.bookPrasad': { or: 'ପ୍ରସାଦ ବୁକ୍', hi: 'प्रसाद बुक करें' },
  'nav.donate': { or: 'ଦାନ', hi: 'दान' },
  'nav.aboutMandir': { or: 'ମନ୍ଦିର ବିଷୟରେ', hi: 'मंदिर के बारे में' },
  'nav.contactUs': { or: 'ଯୋଗାଯୋଗ', hi: 'संपर्क' },
  'nav.login': { or: 'ଲଗଇନ୍', hi: 'लॉगिन' },
  'nav.prasadBooking': { or: 'ପ୍ରସାଦ ବୁକିଂ', hi: 'प्रसाद बुकिंग' },
  'nav.blog': { or: 'ବ୍ଲଗ', hi: 'ब्लॉग' },
  'nav.festivals': { or: 'ଉତ୍ସବ', hi: 'उत्सव' },
  'nav.contact': { or: 'ଯୋଗାଯୋଗ', hi: 'संपर्क' },

  // ── site ──
  'site.templeName': { or: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର', hi: 'श्री जगन्नाथ मंदिर' },
  'site.templeNameShort': { or: 'ଜଗନ୍ନାଥ ମନ୍ଦିର', hi: 'जगन्नाथ मंदिर' },
  'site.logoSub': { or: 'Maruti Kunj, Bhondsi · 122102', hi: 'Maruti Kunj, Bhondsi · 122102' },
  'site.footerTagline': {
    or: 'ଭକ୍ତି, ଶାନ୍ତି ଓ ଆଧ୍ୟାତ୍ମିକ ଶକ୍ତିର ଏକ ପବିତ୍ର ସ୍ଥାନ। ଦୈନନ୍ଦିନ ଆରତୀ ଓ ଦିବ୍ୟ ଉତ୍ସବରେ ଆମ ସହିତ ଯୋଗ ଦିଅନ୍ତୁ।',
    hi: 'भक्ति, शांति और आध्यात्मिक ऊर्जा का एक पवित्र स्थान। दैनिक आरती और दिव्य उत्सवों में हमारे साथ जुड़ें।',
  },
  'site.footerExplore': { or: 'ଅନୁସନ୍ଧାନ', hi: 'अन्वेषण' },
  'site.footerHours': { or: 'ସମୟ', hi: 'समय' },
  'site.footerHoursMorning': { or: 'ସକାଳ · 4:30 AM – 1 PM', hi: 'सुबह · 4:30 AM – 1 PM' },
  'site.footerHoursEvening': { or: 'ସନ୍ଧ୍ୟା · 4:15 PM – 9 PM', hi: 'शाम · 4:15 PM – 9 PM' },
  'site.footerHoursOpen': { or: 'ସବୁ ଦିନ ଖୋଲା', hi: 'हर दिन खुला' },
  'site.footerHoursNote': { or: 'Mangala Arati 4:30 AM', hi: 'Mangala Arati 4:30 AM' },
  'site.footerVisitUs': { or: 'ଆମକୁ ଭେଟିବେ', hi: 'हमसे मिलें' },
  'site.footerCopyright': {
    or: '© 2026 Shree Jagannath Mandir Trust, Maruti Kunj. All rights reserved.',
    hi: '© 2026 Shree Jagannath Mandir Trust, Maruti Kunj. All rights reserved.',
  },

  // ── status ──
  'status.openNow': { or: 'ବର୍ତ୍ତମାନ ଖୋଲା — ଦର୍ଶନ ଚାଲିଛି', hi: 'अभी खुला है — दर्शन जारी है' },
  'status.closedRest': { or: 'ବନ୍ଦ — ମନ୍ଦିର ବିś୍ରାମରେ', hi: 'बंद — मंदिर विश्राम में है' },
  'status.openNowCard': { or: 'ବର୍ତ୍ତମାନ ଖୋଲା', hi: 'अभी खुला है' },
  'status.closedCard': { or: 'ବର୍ତ୍ତମାନ ବନ୍ଦ', hi: 'अभी बंद है' },
  'status.openSub': {
    or: 'Sahana Mela ଦର୍ଶନ ଖୋଲା। ପରବର୍ତ୍ତୀ ନୀତି: Madhyahna Dhupa 12:30 PM.',
    hi: 'Sahana Mela दर्शन खुला है। अगली नीति: Madhyahna Dhupa 12:30 PM.',
  },
  'status.closedSub': {
    or: 'ଦେବଦେବୀ ବିś୍ରାମରେ। Mangala Arati ସହିତ 4:30 AM ରେ ଦ୍ୱାର ଖୋଲିବ।',
    hi: 'देवता विश्राम में हैं। Mangala Arati के साथ 4:30 AM पर द्वार खुलेंगे।',
  },
  'status.openDaily': { or: 'ପ୍ରତିଦିନ ଖୋଲା', hi: 'प्रतिदिन खुला' },
  'status.hoursRange': { or: '4:30 AM – 1 PM · 4:15 – 9 PM', hi: '4:30 AM – 1 PM · 4:15 – 9 PM' },
  'status.viewSchedule': { or: 'ଆଜିର\nସମୟସାରଣୀ', hi: 'आज का\nकार्यक्रम' },
  'status.fullTimetable': { or: '→ ସମ୍ପୂର୍ଣ୍ଣ ନୀତି ସମୟସାରଣୀ', hi: '→ पूर्ण नीति समयसारणी' },
  'status.watchingNow': { or: '1,248 ବର୍ତ୍ତମାନ ଦେଖୁଛନ୍ତି', hi: '1,248 अभी देख रहे हैं' },

  // ── forms ──
  'forms.fullName': { or: 'ପୂର୍ଣ୍ଣ ନାମ', hi: 'पूरा नाम' },
  'forms.fullNameRequired': { or: 'ପୂର୍ଣ୍ଣ ନାମ ଆବଶ୍ୟକ।', hi: 'पूरा नाम आवश्यक है।' },
  'forms.email': { or: 'ଇମେଲ୍ ଠିକଣା', hi: 'ईमेल पता' },
  'forms.emailRequired': { or: 'ଇମେଲ୍ ଠିକଣା ଆବଶ୍ୟକ।', hi: 'ईमेल पता आवश्यक है।' },
  'forms.emailInvalid': { or: 'ଏକ ବୈଧ ଇମେଲ୍ ଦିଅନ୍ତୁ।', hi: 'एक वैध ईमेल दर्ज करें।' },
  'forms.emailInvalidLong': { or: 'ଏକ ବୈଧ ଇମେଲ୍ ଠିକଣା ଦିଅନ୍ତୁ।', hi: 'एक वैध ईमेल पता दर्ज करें।' },
  'forms.mobile': { or: 'ମୋବାଇଲ୍ ନମ୍ବର', hi: 'मोबाइल नंबर' },
  'forms.mobileRequired': { or: 'ମୋବାଇଲ୍ ନମ୍ବର ଆବଶ୍ୟକ।', hi: 'मोबाइल नंबर आवश्यक है।' },
  'forms.message': { or: 'ବାର୍ତ୍ତା', hi: 'संदेश' },
  'forms.messageRequired': { or: 'ଆପଣଙ୍କ ବାର୍ତ୍ତା ଲେଖନ୍ତୁ।', hi: 'कृपया अपना संदेश लिखें।' },
  'forms.messagePlaceholder': { or: 'ଏଠାରେ ଆପଣଙ୍କ ବାର୍ତ୍ତା ଲେଖନ୍ତୁ…', hi: 'यहाँ अपना संदेश लिखें…' },
  'forms.namePlaceholder': { or: 'ଆପଣଙ୍କ ପୂର୍ଣ୍ଣ ନାମ', hi: 'आपका पूरा नाम' },
  'forms.pan': { or: 'PAN (80G ରସିଦ ପାଇଁ)', hi: 'PAN (80G रसीद के लिए)' },
  'forms.sending': { or: 'ପଠାଯାଉଛି…', hi: 'भेजा जा रहा है…' },
  'forms.processing': { or: 'ପ୍ରକ୍ରିୟା ଚାଲିଛି…', hi: 'प्रक्रिया जारी है…' },
  'forms.subscribing': { or: 'ସବସ୍କ୍ରାଇବ୍ ହେଉଛି…', hi: 'सब्सक्राइब हो रहा है…' },
  'forms.sendAnother': { or: 'ଅନ୍ୟ ବାର୍ତ୍ତା ପଠାନ୍ତୁ', hi: 'दूसरा संदेश भेजें' },
  'forms.contactSuccess': { or: 'ଧନ୍ୟବାଦ — ଆମେ ଶୀଘ୍ର ଯୋଗାଯୋଗ କରିବୁ।', hi: 'धन्यवाद — हम शीघ्र संपर्क करेंगे।' },
  'forms.contactError': { or: 'ବାର୍ତ୍ତା ପଠାଇ ହେଲା ନାହିଁ। ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।', hi: 'संदेश नहीं भेजा जा सका। पुनः प्रयास करें।' },
  'forms.donateError': { or: 'ଦାନ ପ୍ରକ୍ରିୟା ହେଲା ନାହିଁ। ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।', hi: 'दान प्रक्रिया नहीं हो सकी। पुनः प्रयास करें।' },
  'forms.notifyError': { or: 'ସବସ୍କ୍ରାଇବ୍ ହେଲା ନାହିଁ। ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।', hi: 'सब्सक्राइब नहीं हो सका। पुनः प्रयास करें।' },
  'forms.newsletterInvalid': { or: 'ଏକ ବୈଧ ଇମେଲ୍ ଠିକଣା ଦିଅନ୍ତୁ।', hi: 'एक वैध ईमेल पता दर्ज करें।' },
  'forms.newsletterSuccess': { or: 'ଧନ୍ୟବାଦ — ଆପଣ ସବସ୍କ୍ରାଇବ୍ ହୋଇଛନ୍ତି।', hi: 'धन्यवाद — आप सब्सक्राइब हो गए हैं।' },
  'forms.prasadError': { or: 'ଆପଣଙ୍କ ନାମ ଓ ଫୋନ୍ ନମ୍ବର ଦିଅନ୍ତୁ।', hi: 'अपना नाम और फ़ोन नंबर दर्ज करें।' },
  'forms.customAmount': { or: 'ଅନ୍ୟ ରାଶି ଦିଅନ୍ତୁ', hi: 'अन्य राशि दर्ज करें' },
  'forms.customAmountAria': { or: 'ଏକ କଷ୍ଟମ୍ ଦାନ ରାଶି ଦିଅନ୍ତୁ', hi: 'एक कस्टम दान राशि दर्ज करें' },
  'forms.findUs': { or: 'ଆମକୁ ଖୋଜନ୍ତୁ', hi: 'हमें खोजें' },
};

// Niti notes (shared)
const NITI_NOTES = {
  'First aarti as the deities awaken.': {
    or: 'ଦେବଦେବୀ ଜାଗୃତ ହେବା ସହିତ ପ୍ରଥମ ଆରତୀ।',
    hi: 'देवताओं के जागने के साथ पहली आरती।',
  },
  'Morning ablutions and dressing.': {
    or: 'ସକାଳ ନୀତି ଓ ଶୃଙ୍ଗାର।',
    hi: 'सुबह की नीति और शृंगार।',
  },
  'Open public darshan for all.': {
    or: 'ସମସ୍ତଙ୍କ ପାଇଁ ଖୋଲା ସାର୍ବଜନିକ ଦର୍ଶନ।',
    hi: 'सभी के लिए खुला सार्वजनिक दर्शन।',
  },
  'Morning bhoga offering.': {
    or: 'ସକାଳ ଭୋଗ ଅର୍ପଣ।',
    hi: 'सुबह का भोग अर्पण।',
  },
  'Midday offering, then rest.': {
    or: 'ମଧ୍ୟାହ୍ନ ଅର୍ପଣ, ତାପରେ ବିś୍ରାମ।',
    hi: 'मध्याह्न अर्पण, फिर विश्राम।',
  },
  'Evening lamp aarti.': {
    or: 'ସନ୍ଧ୍ୟା ଦୀପ ଆରତୀ।',
    hi: 'संध्या दीप आरती।',
  },
  'Evening bhoga offering.': {
    or: 'ସନ୍ଧ୍ୟା ଭୋଗ ଅର୍ପଣ।',
    hi: 'संध्या भोग अर्पण।',
  },
  'Final dressing and night rest.': {
    or: 'ଅନ୍ତିମ ଶୃଙ୍ଗାର ଓ ରାତ୍ରି ବିś୍ରାମ।',
    hi: 'अंतिम शृंगार और रात्रि विश्राम।',
  },
};

// Extend T with remaining sections via bulk assignment
Object.assign(T, {
  // niti notes
  'niti.notes.mangala': NITI_NOTES['First aarti as the deities awaken.'],
  'niti.notes.abakasha': NITI_NOTES['Morning ablutions and dressing.'],
  'niti.notes.sahana': NITI_NOTES['Open public darshan for all.'],
  'niti.notes.sakala': NITI_NOTES['Morning bhoga offering.'],
  'niti.notes.madhyahna': NITI_NOTES['Midday offering, then rest.'],
  'niti.notes.sandhyaArati': NITI_NOTES['Evening lamp aarti.'],
  'niti.notes.sandhyaDhupa': NITI_NOTES['Evening bhoga offering.'],
  'niti.notes.pahuda': NITI_NOTES['Final dressing and night rest.'],
  'niti.mantra.garudaAlt': { or: 'Garuda Maharaja', hi: 'Garuda Maharaja' },
  'niti.mantra.hanumanAlt': { or: 'Hanuman Bajrangbali', hi: 'Hanuman Bajrangbali' },
  'niti.mantra.odia': {
    or: 'ଜଗନ୍ନାଥ ସ୍ୱାମୀ ନୟନ ପଥଗାମୀ ଭବତୁ ମେ ।',
    hi: 'जगन्नाथ स्वामी नयन पथगामी भवतु मे ।',
  },
  'niti.mantra.roman': {
    or: 'jagannātha swāmī nayana pathagāmī bhavatu me',
    hi: 'jagannātha swāmī nayana pathagāmī bhavatu me',
  },
  'niti.mantra.meaning': {
    or: '"ଭଗବାନ Jagannath ମୋ ଦୃଷ୍ଟିର ବିଷୟ ହୁଅନ୍ତୁ — ସେ ସର୍ବଦା ମୋ ନୋହଁରେ ଆସନ୍ତୁ।"',
    hi: '"भगवान Jagannath मेरी दृष्टि के विषय बनें — वे सदा मेरी नज़र में आएँ।"',
  },
});

// Summer/winter niti odia + notes
for (const season of ['summer', 'winter']) {
  for (let i = 0; i < 8; i++) {
    const odia = EN.niti[season][i].odia;
    const note = EN.niti[season][i].note;
    if (ODIA_DISPLAY[odia]) {
      T[`niti.${season}[${i}].odia`] = ODIA_DISPLAY[odia];
    }
    if (NITI_NOTES[note]) {
      T[`niti.${season}[${i}].note`] = NITI_NOTES[note];
    }
  }
}

Object.assign(T, {
  'niti.mantra.garudaOdia': ODIA_DISPLAY['ଗରୁଡ଼ ମହାରାଜା'],
  'niti.mantra.hanumanOdia': ODIA_DISPLAY['ବଜରଙ୍ଗବଳୀ'],
});

// ── home ──
Object.assign(T, {
  'home.heroOdia': { or: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର', hi: 'श्री जगन्नाथ मंदिर' },
  'home.welcome': { or: 'ସ୍ୱାଗତ', hi: 'स्वागत है' },
  'home.subtitle': {
    or: 'Maruti Kunj ର ହୃଦୟରେ ଭକ୍ତି, ଶାନ୍ତି ଓ ଆଧ୍ୟାତ୍ମିକ ଜାଗରଣର ଏକ ଦିବ୍ୟ ସ୍ଥାନ — ଦୈନନ୍ଦିନ ଦର୍ଶନ, ସେବା ଓ ପ୍ରସାଦ।',
    hi: 'Maruti Kunj के हृदय में भक्ति, शांति और आध्यात्मिक जागरण का एक दिव्य स्थान — दैनिक दर्शन, सेवा और प्रसाद।',
  },
  'home.jayaAlt': { or: 'Jaya — dwarapaala', hi: 'Jaya — dwarapaala' },
  'home.jayaName': { or: 'ଜୟ · Jaya', hi: 'जय · Jaya' },
  'home.vijayaAlt': { or: 'Bijaya — dwarapaala', hi: 'Bijaya — dwarapaala' },
  'home.vijayaName': { or: 'ବିଜୟ · Bijaya', hi: 'विजय · Bijaya' },
  'home.today': { or: 'ଆଜି · {{date}}', hi: 'आज · {{date}}' },
  'home.todayNote': { or: 'ରଥଯାତ୍ରା ପୂର୍ବରାତ୍ରି · ଅନସର ସମାପ୍ତ', hi: 'रथयात्रा की पूर्वसंध्या · अनसर समाप्त' },
  'home.nextRitual': { or: 'ପରବର୍ତ୍ତୀ ନୀତି', hi: 'अगली नीति' },
  'home.nextToday': { or: 'ଆଜି · 12:30 PM', hi: 'आज · 12:30 PM' },
  'home.nextTomorrow': { or: 'ଆସନ୍ତା କାଲି · 4:30 AM', hi: 'कल · 4:30 AM' },
  'home.seeSchedule': { or: 'ସମ୍ପୂର୍ଣ୍ଣ ସମୟସାରଣୀ →', hi: 'पूर्ण कार्यक्रम →' },
  'home.aboutEyebrow': { or: 'ମନ୍ଦିର ବିଷୟରେ', hi: 'मंदिर के बारे में' },
  'home.aboutTitle': { or: 'ଭଗବାନ Jagannath ଙ୍କ ଘର, Puri ଠାରୁ ଦୂରରେ।', hi: 'भगवान Jagannath का घर, Puri से दूर।' },
  'home.aboutBody1': {
    or: 'Maruti Kunj ର ଭକ୍ତମାନେ ନିର୍ମାଣ କରିଥିବା Shree Jagannath Mandir Puri ର ନୀତି, ଉତ୍ସବ ଓ ଜୀବନ୍ତ ପରମ୍ପରା Bhondsi କୁ ନେଇ ଆସିଛି। Jagannath, Balabhadra ଓ Subhadra — ପ୍ରଥମ Mangala Arati ଠାରୁ ରାତ୍ରି Pahuda ପର୍ଯ୍ୟନ୍ତ ଦୈନନ୍ଦିନ ନୀତି ମାଧ୍ୟମରେ ସେବା ପାଆନ୍ତି।',
    hi: 'Maruti Kunj के भक्त समुदाय द्वारा निर्मित Shree Jagannath Mandir Puri की नीति, उत्सव और जीवंत परंपरा Bhondsi तक लाया है। Jagannath, Balabhadra और Subhadra — पहली Mangala Arati से रात्रि Pahuda तक दैनिक नीति से सेवा पाते हैं।',
  },
  'home.aboutBody2': {
    or: 'ପ୍ରତ୍ୟେକ ଭକ୍ତ ସ୍ୱାଗତ — ଦର୍ଶନ, ସେବା, Annadan ସମୁଦାଯଯିକିକ ଭୋଜନ ଓ ବର୍ଷ ସାରା ମନ୍ଦିର ପୂର୍ଣ୍ଣ କରୁଥିବା ମହାନ ଉତ୍ସବ ପାଇଁ।',
    hi: 'हर भक्त का स्वागत है — दर्शन, सेवा, Annadan सामुदायिक भोजन और वर्ष भर मंदिर भर देने वाले महान उत्सवों के लिए।',
  },
  'home.aboutCta': { or: 'ଆମ କଥା ପଢ଼ନ୍ତୁ →', hi: 'हमारी कहानी पढ़ें →' },
  'home.aboutImgAlt': { or: 'ରାତ୍ରେ Shree Jagannath Mandir ଶିଖର', hi: 'रात में Shree Jagannath Mandir शिखर' },
  'home.mantraMeaning': {
    or: '"ହେ ନୀଳ ପର୍ବତ, ମହାନ ଓ ପ୍ରଚଣ୍ଡ — ଦୟାକରି ମୋର ଭକ୍ତିର କମଳବନକୁ ନ ଚାପିବ।"',
    hi: '"हे नील पर्वत, महान और प्रचंड — कृपया मेरे भक्ति के कमल-वन को न रौंदो।"',
  },
  'home.garudaAlt': { or: 'Garuda Maharaja', hi: 'Garuda Maharaja' },
  'home.garudaName': { or: 'Garuda · ପକ୍ଷୀରାଜ', hi: 'Garuda · पक्षीराज' },
  'home.hanumanAlt': { or: 'Hanuman Bajrangbali', hi: 'Hanuman Bajrangbali' },
  'home.hanumanName': { or: 'Hanuman · ବଜରଂଗବଲୀ', hi: 'Hanuman · बजरंगबली' },
  'home.sudarshanAlt': { or: 'Sudarshan Chakra', hi: 'Sudarshan Chakra' },
  'home.sudarshanName': { or: 'Sudarshan Chakra', hi: 'Sudarshan Chakra' },
  'home.sudarshanDevanagari': { or: '( सुदर्शन चक्र )', hi: '( सुदर्शन चक्र )' },
  'home.sudarshanOdia': ODIA_DISPLAY['ସୁଦର୍ଶନ ଚକ୍ର'] || { or: 'ସୁଦର୍ଶନ ଚକ୍ର', hi: 'सुदर्शन चक्र' },
  'home.laxmiAlt': { or: 'Maa Laxmi', hi: 'Maa Laxmi' },
  'home.laxmiName': { or: 'Maa Laxmi', hi: 'Maa Laxmi' },
  'home.laxmiDevanagari': { or: '( मां लक्ष्मी )', hi: '( मां लक्ष्मी )' },
  'home.laxmiOdia': ODIA_DISPLAY['ମା ଲକ୍ଷ୍ମୀ'],
  'home.nitiEyebrow': { or: 'ଦୈନନ୍ଦିନ ନୀତି · ଦୈନନ୍ଦିନ ନୀତି', hi: 'दैनिक नीति · दैनिक नीति' },
  'home.nitiTitle': { or: 'ଦର୍ଶନ ଓ ନୀତି ସମୟ', hi: 'दर्शन और नीति समय' },
  'home.summer': { or: 'ଗ୍ରୀଷ୍ମ · ଅପ୍ର–ଅକ୍ଟ', hi: 'ग्रीष्म · अप्र–अक्ट' },
  'home.winter': { or: 'ଶୀତ · ନଭ–ମାର୍ଚ', hi: 'शीत · नव–मार्च' },
  'home.festivalsEyebrow': { or: 'ଉତ୍ସବ · ଉତ୍ସବ', hi: 'उत्सव · उत्सव' },
  'home.festivalsTitle': { or: 'ଆଗାମୀ ଉତ୍ସବ', hi: 'आगामी उत्सव' },
  'home.festivalsCta': { or: 'ସମ୍ପୂର୍ଣ୍ଣ ପଞ୍ଜିକା →', hi: 'पूर्ण पंजिका →' },
  'home.donateOdia': ODIA_DISPLAY['ସେବା ଓ ଦାନ'],
  'home.donateTitle': { or: 'ଆପଣଙ୍କ ସେବା\nଦୀପ ଜଳାଇ ରଖେ।', hi: 'आपकी सेवा\nदीप जलाए रखती है।' },
  'home.donateBody': {
    or: 'ପ୍ରତ୍ୟେକ ଅବଦାନ ସିଧାସର ଦୈନନ୍ଦିନ ଭୋଗ, Annadan ସamudayika ଭୋଜନ ଓ ମନ୍ଦିର ରକ୍ଷଣାବେକ୍ଷଣ ପାଇଁ ଯାଏ। 80G କର ଛାଡ଼ ଯୋଗ୍ୟ — ତୁରନ୍ତ ରସିଦ ମିଳେ।',
    hi: 'हर योगदान सीधे दैनिक भोग, Annadan सामुदायिक भोजन और मंदिर upkeep के लिए जाता है। 80G कर छूट योग्य — तुरंत रसीद मिलती है।',
  },
  'home.donatePill1': { or: '✦ 50 ଭକ୍ତଙ୍କୁ ଭୋଜନ — ₹2,100', hi: '✦ 50 भक्तों को भोजन — ₹2,100' },
  'home.donatePill2': { or: '✦ ଏକ ଦିନର ଭୋଗ — ₹5,100', hi: '✦ एक दिन का भोग — ₹5,100' },
  'home.oneTime': { or: 'ଥରେ', hi: 'एक बार' },
  'home.monthly': { or: 'ମାସିକ', hi: 'मासिक' },
  'home.otherAmount': { or: 'ଅନ୍ୟ ରାଶି', hi: 'अन्य राशि' },
  'home.proceedDonate': { or: 'ଦାନ କରିବାକୁ ଆଗନ୍ତୁ', hi: 'दान करने के लिए आगे बढ़ें' },
  'home.donateMeta': { or: '🔒 100% ସୁରକ୍ଷିତ · UPI, କାର୍ଡ ଓ ନେଟ୍-ବ୍ୟାଙ୍କିଂ · 80G ରସିଦ', hi: '🔒 100% सुरक्षित · UPI, कार्ड और नेट-बैंकिंग · 80G रसीद' },
});

// Fix home.sudarshanOdia
T['home.sudarshanOdia'] = { or: 'ସୁଦର୍ଶନ ଚକ୍ର', hi: 'सुदर्शन चक्र' };

// home festival preview desc only (names/dates skipped)
T['home.festivalPreview[0].desc'] = {
  or: 'ମହାନ ରଥଯାତ୍ରା — ତ୍ରିଦେବ Jagannath, Balabhadra ଓ Subhadra ରଥରେ ଚଢ଼ି ସଡ଼କ ଆଶିର୍ବାଦ କରନ୍ତି।',
  hi: 'महान रथयात्रा — त्रिदेव Jagannath, Balabhadra और Subhadra रथ पर सवार होकर सड़कों को आशीर्वाद देते हैं।',
};
T['home.festivalPreview[1].desc'] = {
  or: 'ଭଗବାନ Krishna ଙ୍କ ଜନ୍ମର ମଧ୍ୟରାତ୍ରି ଉତ୍ସବ।',
  hi: 'भगवान Krishna के जन्म का मध्यरात्रि उत्सव।',
};
T['home.festivalPreview[2].desc'] = {
  or: 'Boita Bandana ଓ ପୂର୍ଣ୍ଣିମା ରାତ୍ରେ ଦୀପ ଉତ୍ସବ।',
  hi: 'Boita Bandana और पूर्णिमा रात्रि में दीप उत्सव।',
};

// ── visit ──
Object.assign(T, {
  'visit.heroEyebrow': { or: 'ଯାତ୍ରା ଯୋଜନା', hi: 'यात्रा की योजना' },
  'visit.heroTitle': { or: 'ଦର୍ଶନ ପାଇଁ ଆସନ୍ତୁ', hi: 'दर्शन के लिए आएँ' },
  'visit.heroOdia': { or: 'ଦର୍ଶନ ପାଇଁ ପଧାରନ୍ତୁ · ସମସ୍ତଙ୍କୁ ସ୍ୱାଗତ', hi: 'दर्शन के लिए पधारें · सभी का स्वागत है' },
  'visit.hoursEyebrow': { or: 'ଦର୍ଶନ ସମୟ', hi: 'दर्शन समय' },
  'visit.hoursTitle': { or: 'ଦର୍ଶନ ପାଇଁ କେବେ ଆସିବେ।', hi: 'दर्शन के लिए कब आएँ।' },
  'visit.hoursBody': {
    or: 'Mangala Arati ପୂର୍ବରୁ ମନ୍ଦିର ଖୋଲେ ଓ ମଧ୍ୟାହ୍ନ ବିś୍ରାମ ସହିତ ଦିନ ସାରା ଖୋଲା ରହେ। ଆରତୀ ପୂର୍ବରୁ 20–30 ମିନିଟ ପୂର୍ବରୁ ଆସନ୍ତୁ। ସମ୍ପୂର୍ଣ୍ଣ ନୀତି ସମୟସାରଣୀ ଦେଖନ୍ତୁ।',
    hi: 'Mangala Arati से पहले मंदिर खुलता है और मध्याह्न विश्राम के साथ दिन भर खुला रहता है। आरती से 20–30 मिनट पहले आएँ। पूर्ण नीति समयसारणी देखें।',
  },
  'visit.hoursCta': { or: 'ସମ୍ପୂର୍ଣ୍ଣ ନୀତି ସମୟସାରଣୀ →', hi: 'पूर्ण नीति समयसारणी →' },
  'visit.reachEyebrow': { or: 'କିପରି ପହଞ୍ଚିବେ', hi: 'कैसे पहुँचें' },
  'visit.reachTitle': { or: 'ମନ୍ଦିର ଖୋଜିବେ', hi: 'मंदिर कैसे खोजें' },
  'visit.guidelinesEyebrow': { or: 'ଆସିବା ପୂର୍ବରୁ', hi: 'आने से पहले' },
  'visit.guidelinesTitle': { or: 'ଦର୍ଶନ ନିର୍ଦ୍ଦେଶ', hi: 'दर्शन निर्देश' },
  'visit.pleaseDo': { or: 'କରନ୍ତୁ', hi: 'कृपया करें' },
  'visit.pleaseAvoid': { or: 'ଏଡ଼ାନ୍ତୁ', hi: 'कृपया न करें' },
  'visit.annadanOdia': ODIA_DISPLAY['ଅନ୍ନଦାନ'],
  'visit.annadanTitle': { or: 'କୌଣସି ଭକ୍ତ ଭୁଖା ଯାଆନ୍ତି ନାହିଁ।', hi: 'कोई भक्त भूखा नहीं लौटता।' },
  'visit.annadanBody': {
    or: 'Mahaprasad ଓ ସମୁଦାଯଯିକିକ ଭୋଜନ ଦୈନନ୍ଦିନ Annadan ଭାବରେ ଅର୍ପଣ — ଆଗଣଂକର ଦ୍ୟରରରେର ଆସୁଥିବା ସମସ୍ତଙ୍କୁ ଭୋଜନ। ଭୋଗ କରନ୍ତୁ, କିମ୍ବା ରୋଷଘର ଚାଲୁ ରଖିବା ପାଇଁ ସେବା ଦିଅନ୍ତୁ।',
    hi: 'Mahaprasad और सामुदायिक भोजन दैनिक Annadan के रूप में अर्पित — भगवान के द्वार पर आने वाले सभी को भोजन। भोग करें, या रसोई चालू रखने के लिए सेवा दें।',
  },
  'visit.annadanCta': { or: 'Annadan ପାଇଁ ସ୍ପନ୍ସର →', hi: 'Annadan के लिए प्रायोजन →' },
  'visit.facilitiesEyebrow': { or: 'ଭକ୍ତମାନଙ୍କ ପାଇଁ', hi: 'भक्तों के लिए' },
  'visit.facilitiesTitle': { or: 'ମନ୍ଦିରରେ ସୁବିଧା', hi: 'मंदिर में सुविधाएँ' },
});

// visit glance
const GLANCE = [
  [{ or: 'ପ୍ରତିଦିନ ଖୋଲା', hi: 'प्रतिदिन खुला' }, { or: '4:30 AM – 9 PM', hi: '4:30 AM – 9 PM' }, { or: 'ମଧ୍ୟାହ୍ନ ବିś୍ରାମ ସହ', hi: 'मध्याह्न विश्राम के साथ' }],
  [{ or: 'ପ୍ରବେଶ', hi: 'प्रवेश' }, { or: 'ସମସ୍ତଙ୍କ ପାଇଁ ମାଗଣା', hi: 'सभी के लिए निःशुल्क' }, { or: 'ଟିକେଟ୍ ଆବଶ୍ୟକ ନୁହେଁ', hi: 'टिकट आवश्यक नहीं' }],
  [{ or: 'ସର୍ବୋତ୍ତମ ସମୟ', hi: 'सर्वोत्तम समय' }, { or: 'ଆରତୀ ସମୟ', hi: 'आरती समय' }, { or: '20 ମିନିଟ ପୂର୍ବରୁ ଆସନ୍ତୁ', hi: '20 मिनट पहले आएँ' }],
  [{ or: 'ପ୍ରସାଦ', hi: 'प्रसाद' }, { or: 'ଦୈନନ୍ଦିନ Annadan', hi: 'दैनिक Annadan' }, { or: 'Mahaprasad ପରୋଷା', hi: 'Mahaprasad परोसा जाता है' }],
];
GLANCE.forEach((row, i) => {
  T[`visit.glance[${i}].label`] = row[0];
  T[`visit.glance[${i}].value`] = row[1];
  T[`visit.glance[${i}].note`] = row[2];
});

// visit hours odia
for (let i = 0; i < 5; i++) {
  const odia = EN.visit.hours[i].odia;
  if (ODIA_DISPLAY[odia]) T[`visit.hours[${i}].odia`] = ODIA_DISPLAY[odia];
}

// visit reach
const REACH = [
  {
    or: 'By Road',
    hi: 'By Road',
    descOr: 'Gurugram–Sohna ସଡ଼କରେ Maruti Kunj, Bhondsi ନିକଟରେ। ମନ୍ଦିର ପାଶଚିମ ପାଆ୬ ପର୍ଯ୍ୟାପ୍ତ ପାର୍କିଂ।',
    descHi: 'Gurugram–Sohna सड़क पर Maruti Kunj, Bhondsi के पास। मंदिर के बगल में पर्याप्त पार्किंग।',
  },
  {
    or: 'By Metro',
    hi: 'By Metro',
    descOr: 'ନିକଟତମ ମେଟ୍ରୋ HUDA City Centre (Yellow Line); Bhondsi ପର୍ଯ୍ୟନ୍ତ auto କିମ୍ବା cab, ପ୍ରାୟ 30–40 ମିନିଟ।',
    descHi: 'निकटतम मेट्रो HUDA City Centre (Yellow Line); Bhondsi तक auto या cab, लगभग 30–40 मिनट।',
  },
  {
    or: 'By Rail & Air',
    hi: 'By Rail & Air',
    descOr: 'Gurgaon Railway Station ଓ IGI Airport ଉଭୟ ଏକ ଘଣ୍ଟା ଭିତରେ, taxi ଓ ride-share ଉପଲବ୍ଧ।',
    descHi: 'Gurgaon Railway Station और IGI Airport दोनों एक घंटे के भीतर, taxi और ride-share उपलब्ध।',
  },
];
REACH.forEach((r, i) => {
  T[`visit.reach[${i}].mode`] = { or: r.or, hi: r.hi };
  T[`visit.reach[${i}].desc`] = { or: r.descOr, hi: r.descHi };
});

// visit dos/donts
const VISIT_DOS = [
  { or: 'ସାଧାରଣ ପୋଷାକ — ପାରମ୍ପରିକ କିମ୍ବା ଆଚ୍ଛାଦିତ ପୋଷାକ ପସନ୍ଦ।', hi: 'साधारण पोशाक — पारंपरिक या ढकी हुई पोशाक पसंद की जाती है।' },
  { or: 'ପ୍ରବେଶ ପୂର୍ବରୁ ନିର୍ଦ୍ଧାରିତ ସ୍ଥାନରେ ଜୁତା ଛାଡ଼ନ୍ତୁ।', hi: 'प्रवेश से पहले निर्धारित स्थान पर जूते उतारें।' },
  { or: 'ଆରତୀ ସମୟରେ ନୀରବ ରଖନ୍ତୁ ଓ ଶାନ୍ତିରେ ଧାରାରେ ରୁହନ୍ତୁ।', hi: 'आरती के समय मौन रहें और शांति से कतार में खड़े रहें।' },
  { or: 'Mahaprasad ଶ୍ରଦ୍ଧାରେ ଗ୍ରହଣ କରନ୍ତୁ।', hi: 'Mahaprasad श्रद्धा से ग्रहण करें।' },
];
const VISIT_DONTS = [
  { or: 'ଗarbhagriha ଭିତରେ ଫଟୋଗ୍ରାଫି ନିଷିଦ୍ଧ।', hi: 'गarbhagriha के अंदर फ़ोटोग्राफी निषिद्ध है।' },
  { or: 'ଚର୍ମ ଜିନିଷ ଓ ତମାକୁ ଭିତରେ ଅନୁମତି ନାହିଁ।', hi: 'चर्म के सामान और तंबाकू अंदर अनुमत नहीं।' },
  { or: 'ଦେବଦେବୀ କିମ୍ବା ନୀତି ସାମଗ୍ରୀ ଛୁଅନ୍ତୁ ନାହିଁ।', hi: 'देवताओं या नीति सामग्री को न छुएँ।' },
  { or: 'ବଡ଼ ବ୍ୟାଗ୍ ଭିତରେ ନେବେ ନାହିଁ।', hi: 'बड़े बैग अंदर न लाएँ।' },
];
VISIT_DOS.forEach((d, i) => { T[`visit.dos[${i}]`] = d; });
VISIT_DONTS.forEach((d, i) => { T[`visit.donts[${i}]`] = d; });

// visit facilities
const FACILITIES = [
  ['Footwear Stand', 'Footwear Stand', 'ମାଗଣା, ତଦାରଖ ଜୁତା କାଉଣ୍ଟର।', 'निःशुल्क, देखरेख वाले जूते काउंटर।'],
  ['Help Desk', 'Help Desk', 'ପ୍ରଥମ ଥର ଓ ବୟସ୍କ ଭକ୍ତମାନଙ୍କୁ ମାର୍ଗଦର୍ଶନ।', 'पहली बार और वरिष्ठ भक्तों को मार्गदर्शन।'],
  ['Accessibility', 'Accessibility', 'Ramp ଓ wheelchair ସହାୟତା।', 'Ramp और wheelchair सहायता।'],
  ['Shaded Queue', 'Shaded Queue', 'ଭିଡ଼ ସମୟରେ ଛାଇଯukt ଅପେକ୍ଷା କ୍ଷେତ୍ର।', 'भीड़ के समय छायादार प्रतीक्षा क्षेत्र।'],
  ['Parking', 'Parking', 'ଦୁଇ ଓ ଚାରି ଚକିଆ ପାର୍କିଂ।', 'दो और चार पहिया पार्किंग।'],
  ['Prasad Counter', 'Prasad Counter', 'ଫୁଲ, ଭୋଗ ଓ Mahaprasad ଉପଲବ୍ଧ।', 'फूल, भोग और Mahaprasad उपलब्ध।'],
];
FACILITIES.forEach(([title, titleHi, descOr, descHi], i) => {
  T[`visit.facilities[${i}].glyph`] = { or: EN.visit.facilities[i].glyph, hi: EN.visit.facilities[i].glyph };
  T[`visit.facilities[${i}].title`] = { or: title, hi: titleHi };
  T[`visit.facilities[${i}].desc`] = { or: descOr, hi: descHi };
});

// ── about ──
Object.assign(T, {
  'about.heroEyebrow': { or: 'ମନ୍ଦିର ବିଷୟରେ', hi: 'मंदिर के बारे में' },
  'about.heroTitle': { or: 'ଆମ ମନ୍ଦିର, ଆମ କଥା', hi: 'हमारा मंदिर, हमारी कहानी' },
  'about.heroOdia': { or: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର · ମାରୁତି କୁଞ୍ଜ', hi: 'श्री जगन्नाथ मंदिर · Maruti Kunj' },
  'about.ourTempleEyebrow': { or: 'ଆମ ମନ୍ଦିର', hi: 'हमारा मंदिर' },
  'about.ourTempleTitle': { or: 'Maruti Kunj ର ହୃଦୟରେ Puri ର ଏକ ଅଂଶ।', hi: 'Maruti Kunj के हृदय में Puri का एक अंश।' },
  'about.ourTempleBody1': {
    or: 'Shree Jagannath Mandir ଭକ୍ତମାନେ Puri ର ସମୁଦ୍ର କୂଳ ଠାରୁ Jagannath ଙ୍କ ପ୍ରେମ ନେଇ ନିର୍ମାଣ କରିଛନ୍ତି। ଛୋଟ kirtan ସମାବେଶରୁ ଜୀବନ୍ତ ମନ୍ଦିର — Jagannath, Balabhadra ଓ Subhadra ଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ଦୈନନ୍ଦିନ ନୀତି।',
    hi: 'Shree Jagannath Mandir भक्तों ने Puri के समुद्र तट से Jagannath के प्रेम को लेकर निर्मित किया। छोटे kirtan समारोह से जीवंत मंदिर — Jagannath, Balabhadra और Subhadra की पूर्ण दैनिक नीति।',
  },
  'about.ourTempleBody2': {
    or: 'ଆଜି ମନ୍ଦିର ପ୍ରାର୍ଥନା, ଉତ୍ସବ ଓ ସମୁଦାଯଯିକ ପାଇଁ ଘର — ବିଶ୍ୟନାଥ ଙ୍କ ଦର୍ଶନ ଖୋଜୁଥିବା ପ୍ରତ୍ୟେକ ଭକ୍ତଙ୍କ ପାଇଁ ଖୋଲା।',
    hi: 'आज मंदिर प्रार्थना, उत्सव और समुदाय के लिए घर है — ब्रह्मांड के स्वामी के दर्शन की खोज करने वाले हर भक्त के लिए खुला।',
  },
  'about.innerSanctumAlt': {
    or: 'ସଜା trinity — Jagannath, Balabhadra ଓ Subhadra ratnavedi ଉପରେ',
    hi: 'सजी trinity — Jagannath, Balabhadra और Subhadra ratnavedi पर',
  },
  'about.traditionEyebrow': { or: 'Jagannath ପରମ୍ପରା', hi: 'Jagannath परंपरा' },
  'about.traditionTitle': { or: 'ବିଶ୍ୟନାଥ ଙ୍କ ସ୍ୟାମୀ, କାଠ ରୂପରେ।', hi: 'ब्रह्मांड के स्वामी, लकड़ी के रूप में।' },
  'about.traditionBody1': {
    or: 'ଅଧିକାଂଶ ହିନ୍ଦୁ ଦେବତାଙ୍କ ଠାରୁ ଭିନ୍ନ — Jagannath ଙ୍କ ବିଶିଷ୍ଟ କାଠ ରୂପରେ ପୂଜା, ବୃହତ୍ ଗୋଳାକାର ଆଖି, ବିସ୍ତୃତ ହସ। Balabhadra ଓ Subhadra ସହିତ ଲୀଳାପୂର୍ଣ୍ଣ ଓ ଅସୀମ କୃପା।',
    hi: 'अधिकांश हिंदू देवताओं से भिन्न — Jagannath की विशिष्ट लकड़ी रूप में पूजा, बड़ी गोल आँखें, विस्तृत मुस्कान। Balabhadra और Subhadra के साथ लीला-purn और असीम कृपा।',
  },
  'about.traditionBody2': {
    or: 'ଆମ ନୀତି Puri ପରମ୍ପରା ଅନୁସରଣ — Mangala Arati ଠାରୁ Pahuda — ଶତାବ୍ଦୀ ଧରି ଚାଲିଥିବା ପୂଜା ଲୟ।',
    hi: 'हमारी नीति Puri परंपरा अनुसरण — Mangala Arati से Pahuda — सदियों से चल रहे पूजा लय।',
  },
  'about.shikharaAlt': { or: 'Sudarshan Chakra ଓ pata ଧ୍ବଜା ସହ ମନ୍ଦିର ଶିଖର', hi: 'Sudarshan Chakra और pata ध्वज के साथ मंदिर शिखर' },
  'about.valuesEyebrow': { or: 'ଆମ ଜୀବନର ମୂଳ', hi: 'हमारे जीवन का मूल' },
  'about.valuesTitle': { or: 'ମନ୍ଦିର ଠାରୁ ଅଧିକ — ଏକ samuday।', hi: 'मंदिर से अधिक — एक समुदाय।' },
  'about.values[0].title': { or: 'ଦୈନନ୍ଦିନ ଭକ୍ତି', hi: 'दैनिक भक्ति' },
  'about.values[0].desc': {
    or: 'ସମ୍ପୂର୍ଣ୍ଣ ନୀତି ପ୍ରତିଦିନ — ଭୋର ପ୍ରଥମ ଆରତୀ ଠାରୁ ରାତ୍ରି ବିś୍ରାମ।',
    hi: 'पूर्ण नीति प्रतिदिन — भोर की पहली आरती से रात्रि विश्राम।',
  },
  'about.values[0].odia': ODIA_DISPLAY['ଭକ୍ତି'],
  'about.values[1].title': { or: 'Annadan', hi: 'Annadan' },
  'about.values[1].desc': {
    or: 'Mahaprasad ଓ ସମୁଦାଯଯିକିକ ଭୋଜନ — ଆଗଣଂକର ଦ୍ୟରରରେର ଆସୁଥିବା କୌଣସି ଭକ୍ତ ଭୁଖା ଯାଆନ୍ତି ନାହିଁ।',
    hi: 'Mahaprasad और ସମୁଦାଯଯିକିକ भोजन — भगवान के द्वार पर आने वाला कोई भक्त भूखा नहीं लौटता।',
  },
  'about.values[1].odia': ODIA_DISPLAY['ଅନ୍ନଦାନ'],
  'about.values[2].title': { or: 'ଉତ୍ସବ', hi: 'उत्सव' },
  'about.values[2].desc': {
    or: 'Ratha Yatra, Janmashtami, Kartik Purnima ଓ ଅଧିକ — Puri ପରମ୍ପରାର ପୂର୍ଣ୍ଣ ମହିମାରେ।',
    hi: 'Ratha Yatra, Janmashtami, Kartik Purnima और अधिक — Puri परंपरा की पूर्ण महिमा में।',
  },
  'about.values[2].odia': ODIA_DISPLAY['ଉତ୍ସବ'],
  'about.ganapatiAlt': { or: 'ଭଗବାନ Ganapati', hi: 'भगवान Ganapati' },
  'about.ganapatiDevanagari': { or: '( गणपति )', hi: '( गणपति )' },
  'about.ganapatiOdia': ODIA_DISPLAY['ଗଣପତି'],
  'about.ctaOdia': ODIA_DISPLAY['ସେବା ଓ ଦାନ'],
  'about.ctaTitle': { or: 'ସେବାର ଅଂଶ ହୁଅନ୍ତୁ।', hi: 'सेवा का हिस्सा बनें।' },
  'about.ctaBody': {
    or: 'ଆପଣଙ୍କ ସହାୟତା ଦୀପ ଜଳାଏ, ଭୋଗ ଅର୍ପଣ କରେ ଓ Annadan ରୋଷଘର ଚାଲୁ ରଖେ।',
    hi: 'आपकी सहायता दीप जलाती है, भोग अर्पित करती है और Annadan रसोई चालू रखती है।',
  },
  'about.ctaButton': { or: 'ଭକ୍ତିରେ ଦାନ କରନ୍ତୁ →', hi: 'भक्ति से दान करें →' },
});

// ── deities ──
Object.assign(T, {
  'deities.heroEyebrow': { or: 'ଦର୍ଶନ · ଦର୍ଶନ', hi: 'दर्शन · दर्शन' },
  'deities.heroTitle': { or: 'ଦେବଦେବୀ', hi: 'देवता' },
  'deities.heroOdia': { or: 'ଶ୍ରୀ ମନ୍ଦିରର ଦେବଦେବୀ', hi: 'श्री मंदिर के देवता' },
  'deities.intro': {
    or: 'ମନ୍ଦିରର ହୃଦୟରେ Jagannath, Balabhadra ଓ Subhadra — Sudarshan Chakra ସହ ratnavedi ଉପରେ। parivar devata ପରିବେଶ କରନ୍ତି।',
    hi: 'मंदिर के हृदय में Jagannath, Balabhadra और Subhadra — Sudarshan Chakra के साथ ratnavedi पर। parivar devata परिवेश करते हैं।',
  },
  'deities.trinityEyebrow': { or: 'ପବିତ୍ର ତ୍ରିଦେବ · ଚତୁର୍ଦ୍ଧା ମୂର୍ତ୍ତି', hi: 'पवित्र त्रिदेव · चaturdha murti' },
  'deities.trinityTitle': { or: 'Jagannath, Balabhadra & Subhadra', hi: 'Jagannath, Balabhadra & Subhadra' },
  'deities.sudarshanOdia': { or: 'ସୁଦର୍ଶନ ଚକ୍ର', hi: 'सुदर्शन चक्र' },
  'deities.sudarshanName': { or: 'Sudarshan Chakra', hi: 'Sudarshan Chakra' },
  'deities.sudarshanDesc': {
    or: 'ratnavedi ଉପରେ ଚତୁର୍ଥ ଉପସ୍ଥିତି — Sudarshan Chakra ର କାଠ ରୂପ। chaturdha murti ପୂର୍ଣ୍ଣ କରନ୍ତି।',
    hi: 'ratnavedi पर चaturth उपस्थिति — Sudarshan Chakra का लकड़ी रूप। chaturdha murti पूर्ण करते हैं।',
  },
  'deities.parivarEyebrow': { or: 'Parivar Devata · ପରିବାର ଦେବତା', hi: 'Parivar Devata · परिवार देवता' },
  'deities.parivarTitle': { or: 'ଦିବ୍ୟ ପରିବାର', hi: 'दिव्य परिवार' },
  'deities.parivarSubhead': {
    or: 'ଭଗବାନଙ୍କ ଚାରିପାଶେ guardian ଓ companion deities — ପ୍ରତ୍ୟେକର ସ୍ଥାନ ଓ ଉଦ୍ଦେଶ୍ୟ।',
    hi: 'भगवान के चारों ओर guardian और companion deities — प्रत्येक का स्थान और उद्देश्य।',
  },
  'deities.ctaEyebrow': { or: 'ବ୍ୟକ୍ତିଗତ ଦର୍ଶନ', hi: 'व्यक्तिगत दर्शन' },
  'deities.ctaTitle': { or: 'ଭଗବାନଙ୍କ ସamukhe ଛିଡ଼ନ୍ତୁ।', hi: 'भगवान के सamukhe खड़े हों।' },
  'deities.ctaBody': {
    or: 'ଦର୍ଶନ ପାଇଁ ଯାତ୍ରା ଯୋଜନା କରନ୍ତୁ, କିମ୍ବା live darshan ମାଧ୍ୟମରେ ଦୈନନ୍ଦିନ ଆରତୀରେ ଯୋଗ ଦିଅନ୍ତୁ।',
    hi: 'दर्शन के लिए यात्रा की योजना करें, या live darshan के माध्यम से दैनिक आरती में जुड़ें।',
  },
  'deities.ctaVisit': { or: 'ଯାତ୍ରା ଯୋଜନା →', hi: 'यात्रा की योजना →' },
  'deities.ctaTimings': { or: 'ଦର୍ଶନ ସମୟ', hi: 'दर्शन समय' },
});

const TRINITY = [
  ['Balabhadra', 'ବଳଭଦ୍ର', 'बलभद्र', 'White (Śveta)', 'White (Śveta)', 'The Elder Brother', 'The Elder Brother',
    'Balabhadra — elder brother, white form on ratnavedi', 'Balabhadra — elder brother, white form on ratnavedi',
    'Trinity ର ଜ୍ୟେଷ୍ଠ, white form — strength, righteousness, protective elder.',
    'Trinity के jyestha, white form — strength, righteousness, protective elder.'],
  ['Jagannath', 'ଜଗନ୍ନାଥ', 'जगन्नाथ', 'Dark (Kṛṣṇa)', 'Dark (Kṛṣṇa)', 'Lord of the Universe', 'Lord of the Universe',
    'Lord Jagannath — dark wooden form with compassionate eyes', 'Lord Jagannath — dark wooden form with compassionate eyes',
    'Presiding deity — Lord of the Universe, dark wooden form, infinite compassion.',
    'Presiding deity — Lord of the Universe, dark wooden form, infinite compassion.'],
  ['Subhadra', 'ସୁଭଦ୍ରା', 'सुभद्रा', 'Golden (Pīta)', 'Golden (Pīta)', 'The Sister', 'The Sister',
    'Subhadra — golden form between her two brothers', 'Subhadra — golden form between her two brothers',
    'Beloved sister, golden form — grace, auspiciousness, divine feminine.',
    'Beloved sister, golden form — grace, auspiciousness, divine feminine.'],
];
TRINITY.forEach((row, i) => {
  T[`deities.trinity[${i}].odia`] = { or: row[1], hi: row[2] };
  T[`deities.trinity[${i}].color`] = { or: row[3], hi: row[4] };
  T[`deities.trinity[${i}].tag`] = { or: row[5], hi: row[6] };
  T[`deities.trinity[${i}].imageAlt`] = { or: row[7], hi: row[8] };
  T[`deities.trinity[${i}].description`] = { or: row[9], hi: row[10] };
});

const PARIVAR = [
  ['Jaya', 'ଜୟ', 'जय', 'Dwarapala — guardian of the sacred threshold.', 'Dwarapala — sacred threshold ର guardian।', 'Dwarapala — पवित्र द्वार के रक्षक।'],
  ['Bijaya', 'ବିଜୟ', 'विजय', 'Dwarapala — guardian who stands beside Jaya.', 'Dwarapala — Jaya ପାଖରେ ରହିଥିବା guardian।', 'Dwarapala — Jaya के पास खड़े रक्षक।'],
  ['Garuda', 'ଗରୁଡ଼', 'गरुड़', 'The divine eagle, eternal vahana and devotee.', 'Divine eagle, eternal vahana ଓ devotee।', 'दिव्य गरुड़, शाश्वत vahana और devotee।'],
  ['Hanuman', 'ହନୁମାନ', 'हनुमान', 'Bajrangbali — protector and supreme servant.', 'Bajrangbali — protector ଓ supreme servant।', 'Bajrangbali — रक्षक और supreme servant।'],
  ['Maa Laxmi', 'ମା ଲକ୍ଷ୍ମୀ', 'माँ लक्ष्मी', 'Goddess of fortune, consort of the Lord.', 'Fortune ର goddess, Lord ଙ୍କ consort।', 'Fortune की goddess, Lord की consort।'],
  ['Maa Bhudevi', 'ମା ଭୂଦେବୀ', 'माँ भूदेवी', 'Earth goddess, the second consort.', 'Earth goddess, second consort।', 'Earth goddess, second consort।'],
  ['Narasimha', 'ନରସିଂହ', 'नरसिंह', 'The fierce lion-man, remover of fear.', 'Fierce lion-man, fear remover।', 'Fierce lion-man, fear remover।'],
  ['Ganapati', 'ଗଣପତି', 'गणपति', 'The remover of obstacles, worshipped first.', 'Obstacle remover, worshipped first।', 'Obstacle remover, worshipped first।'],
];
PARIVAR.forEach((row, i) => {
  T[`deities.parivar[${i}].odia`] = { or: row[1], hi: row[2] };
  T[`deities.parivar[${i}].role`] = { or: row[4], hi: row[5] };
});

// ── donate ──
Object.assign(T, {
  'donate.heroEyebrow': { or: 'ଭକ୍ତିରେ ଦାନ', hi: 'भक्ति से दान' },
  'donate.heroTitle': { or: 'ଆପଣଙ୍କ ଦାନ,\nସେମାନଙ୍କ ଆଶିର୍ବାଦ।', hi: 'आपका दान,\nउनका आशीर्वाद।' },
  'donate.heroBody': {
    or: 'ଆପଣ ଅର୍ପଣ କରୁଥିବା ପ୍ରତ୍ୟେକ ଟଙ୍କା Jagannath ଙ୍କ seva — daily worship, festivals ଓ Annadan ପାଇଁ।',
    hi: 'आप अर्पित करते हैं हर रुपया Jagannath की seva — daily worship, festivals और Annadan के लिए।',
  },
  'donate.heroCta': { or: 'ବର୍ତ୍ତମାନ ଦାନ କରନ୍ତୁ →', hi: 'अभी दान करें →' },
  'donate.purposesEyebrow': { or: 'ଆପଣଙ୍କ seva କେଉଁଠି ଯାଏ', hi: 'आपकी seva कहाँ जाती है' },
  'donate.purposesTitle': { or: 'ପ୍ରତ୍ୟେକ ଅବଦାନର ଏକ ଉଦ୍ଦେଶ୍ୟ।', hi: 'हर योगदान का एक उद्देश्य।' },
  'donate.purposes[0].title': { or: 'Temple Upkeep', hi: 'Temple Upkeep' },
  'donate.purposes[0].desc': { or: 'Shrine, lighting ଓ sacred space ରକ୍ଷଣ।', hi: 'Shrine, lighting और sacred space upkeep।' },
  'donate.purposes[0].odia': { or: 'ମନ୍ଦିର', hi: 'मंदिर' },
  'donate.purposes[1].title': { or: 'Daily Seva & Puja', hi: 'Daily Seva & Puja' },
  'donate.purposes[1].desc': { or: 'Daily rituals, flowers, incense ଓ offerings।', hi: 'Daily rituals, flowers, incense और offerings।' },
  'donate.purposes[1].odia': { or: 'ସେବା ପୂଜା', hi: 'सेवा पूजा' },
  'donate.purposes[2].title': { or: 'Annadan', hi: 'Annadan' },
  'donate.purposes[2].desc': { or: 'Mahaprasad ଓ ସମୁଦାଯଯିକିକ meals ମାଗଣା।', hi: 'Mahaprasad और ସମୁଦାଯଯିକିକ meals निःशुल्क।' },
  'donate.purposes[2].odia': ODIA_DISPLAY['ଅନ୍ନଦାନ'],
  'donate.purposes[3].title': { or: 'Community Support', hi: 'Community Support' },
  'donate.purposes[3].desc': { or: 'Cultural programs, education ଓ samuday seva।', hi: 'Cultural programs, education और samuday seva।' },
  'donate.purposes[3].odia': { or: 'ସମାଜ', hi: 'समाज' },
  'donate.formTitle': { or: 'ଆପଣଙ୍କ ଅବଦାନ ବାଛନ୍ତୁ', hi: 'अपना योगदान चुनें' },
  'donate.formSub': { or: '100% donation ମନ୍ଦିରକୁ ଯାଏ। 80G receipt ତୁରନ୍ତ।', hi: '100% donation मंदिर को जाता है। 80G receipt तुरंत।' },
  'donate.oneTimeGift': { or: 'One-time gift', hi: 'One-time gift' },
  'donate.monthlySeva': { or: 'Monthly seva', hi: 'Monthly seva' },
  'donate.donorDetails': { or: 'Donor details', hi: 'Donor details' },
  'donate.proceedDonate': { or: 'Proceed to donate ₹{{amount}}{{suffix}}', hi: 'Proceed to donate ₹{{amount}}{{suffix}}' },
  'donate.proceedSuffixMonthly': { or: '/mo', hi: '/mo' },
  'donate.donateSuccess': {
    or: 'ଆପଣଙ୍କ seva ପାଇଁ ଧନ୍ୟବାଦ। 80G receipt ଶୀଘ୍ର email କୁ ପଠାଯିବ।',
    hi: 'आपकी seva के लिए धन्यवाद। 80G receipt शीघ्र email पर भेजी जाएगी।',
  },
  'donate.makeAnother': { or: 'ଅନ୍ୟ ଦାନ କରନ୍ତୁ', hi: 'दूसरा दान करें' },
  'donate.secureNote': { or: 'Secure payment · UPI · Cards · Net-banking', hi: 'Secure payment · UPI · Cards · Net-banking' },
  'donate.trustTitle': { or: 'Safe & transparent', hi: 'Safe & transparent' },
  'donate.trust[0]': { or: 'Secure, encrypted gateway ମାଧ୍ୟମରେ processed।', hi: 'Secure, encrypted gateway के माध्यम से processed।' },
  'donate.trust[1]': { or: 'Funds transparently temple worship ଓ social seva ପାଇଁ।', hi: 'Funds transparently temple worship और social seva के लिए।' },
  'donate.trust[2]': { or: '80G tax exemption — receipt instantly by email।', hi: '80G tax exemption — receipt instantly by email।' },
  'donate.sevaTitle': { or: 'Sponsor a Seva', hi: 'Sponsor a Seva' },
  'donate.sevaDesc': {
    or: "Full day's bhoga, aarti, କିମ୍ବା festival ritual ଆପଣଙ୍କ family ନାମରେ — prasad ପାଆନ୍ତୁ।",
    hi: "Full day's bhoga, aarti, या festival ritual आपके family नाम पर — prasad पाएँ।",
  },
  'donate.sevaLink': { or: 'Explore sevas & projects →', hi: 'Explore sevas & projects →' },
  'donate.otherEyebrow': { or: 'Other ways to give', hi: 'Other ways to give' },
  'donate.otherTitle': { or: 'Prefer UPI or bank transfer?', hi: 'Prefer UPI or bank transfer?' },
  'donate.upiTitle': { or: 'UPI Payment', hi: 'UPI Payment' },
  'donate.bankTitle': { or: 'Bank Transfer', hi: 'Bank Transfer' },
  'donate.quote': { or: '"Whatever you offer with devotion, I accept."', hi: '"Whatever you offer with devotion, I accept."' },
  'donate.quoteAttrib': { or: '— Lord Jagannath', hi: '— Lord Jagannath' },
  'donate.laxmiOdia': ODIA_DISPLAY['ମା ଲକ୍ଷ୍ମୀ'],
  'donate.bhudeviOdia': ODIA_DISPLAY['ମା ଭୂଦେବୀ'],
});

const DONATE_AMOUNTS = [
  ['Lamp & flowers', 'Lamp & flowers', 'Lamp & flowers'],
  ["A day's puja", "A day's puja", "A day's puja"],
  ['Feeds 50 devotees', '50 ଭକ୍ତଙ୍କୁ ଭୋଜନ', '50 भक्तों को भोजन'],
  ["A day's bhoga", "A day's bhoga", "A day's bhoga"],
  ['Festival seva', 'Festival seva', 'Festival seva'],
  ['Annadan patron', 'Annadan patron', 'Annadan patron'],
];
DONATE_AMOUNTS.forEach((row, i) => {
  T[`donate.amounts[${i}].note`] = { or: row[1], hi: row[2] };
});

// ── contact ──
Object.assign(T, {
  'contact.heroEyebrow': { or: 'ଯୋଗାଯୋଗ', hi: 'संपर्क' },
  'contact.heroTitle': { or: 'ଆମେ ସାହାଯ୍ୟ କରିବୁ', hi: 'हम सहायता करेंगे' },
  'contact.heroOdia': { or: 'ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ', hi: 'हमसे संपर्क करें' },
  'contact.formTitle': { or: 'ଆମକୁ ବାର୍ତ୍ତା ପଠାନ୍ତୁ', hi: 'हमें संदेश भेजें' },
  'contact.formSubtitle': { or: 'ଫର୍ମ ପୂରଣ କରନ୍ତୁ, ଆମ team ଯୋଗାଯୋଗ କରିବ।', hi: 'फ़ॉर्म भरें, हमारी team संपर्क करेगी।' },
  'contact.info[0].icon': { or: '⊙', hi: '⊙' },
  'contact.info[0].title': { or: 'Address', hi: 'Address' },
  'contact.info[1].icon': { or: '✆', hi: '✆' },
  'contact.info[1].title': { or: 'Call / WhatsApp', hi: 'Call / WhatsApp' },
  'contact.info[2].icon': { or: '✉', hi: '✉' },
  'contact.info[2].title': { or: 'Email', hi: 'Email' },
  'contact.info[3].icon': { or: '◷', hi: '◷' },
  'contact.info[3].title': { or: 'Office Hours', hi: 'Office Hours' },
  'contact.info[4].icon': { or: '◈', hi: '◈' },
  'contact.info[4].title': { or: 'Help Desk', hi: 'Help Desk' },
  'contact.narasimhaAlt': { or: 'Lord Narasimha', hi: 'Lord Narasimha' },
  'contact.narasimhaDevanagari': { or: '( नरसिंह )', hi: '( नरसिंह )' },
  'contact.narasimhaOdia': ODIA_DISPLAY['ନରସିଂହ'],
});

// ── live ──
Object.assign(T, {
  'live.title': { or: 'Live Darshan', hi: 'Live Darshan' },
  'live.odia': { or: 'ସିଧାସଳଖ ଦର୍ଶନ', hi: 'प्रत्यक्ष दर्शन' },
  'live.subtitle': { or: 'Streaming daily, 4:30 AM – 9:00 PM', hi: 'Streaming daily, 4:30 AM – 9:00 PM' },
  'live.playStream': { or: 'Live stream ଚଲାନ୍ତୁ', hi: 'Live stream चलाएँ' },
  'live.switchCamera': { or: '{{name}} camera କୁ ବଦଳାନ୍ତୁ', hi: '{{name}} camera पर बदलें' },
  'live.scheduleTitle': { or: 'ଆଜିର ଆରତୀ ସମୟସାରଣୀ', hi: 'आज की आरती समयसारणी' },
  'live.notifyTitle': { or: 'କୌଣସି ଆରତୀ ଛାଡ଼ନ୍ତୁ ନାହିଁ।', hi: 'कोई आरती न छूटे।' },
  'live.notifyBody': {
    or: 'Live aarti ଓ festival days ପୂର୍ବରେ reminder — ଯେଉଁଠାରୁ ହେଲେ ଦର୍ଶନରେ ଯୋଗ ଦିଅନ୍ତୁ।',
    hi: 'Live aarti और festival days से पहले reminder — जहाँ से भी दर्शन में जुड़ें।',
  },
  'live.notifyPlaceholder': { or: 'Email କିମ୍ବା WhatsApp ନମ୍ବର', hi: 'Email या WhatsApp नंबर' },
  'live.notifyAria': { or: 'Aarti reminder ପାଇଁ email/WhatsApp', hi: 'Aarti reminder के लिए email/WhatsApp' },
  'live.notifySuccess': { or: 'Subscribed — ଆମେ ଆରତୀ ପୂର୍ବରେ ଜଣାଇବୁ।', hi: 'Subscribed — हम आरती से पहले सूचित करेंगे।' },
  'live.recordingsEyebrow': { or: 'ପୁନର୍ବାର ଦେଖନ୍ତୁ', hi: 'फिर से देखें' },
  'live.recordingsTitle': { or: 'Recent Aartis & Festivals', hi: 'Recent Aartis & Festivals' },
  'live.playRecording': { or: '{{title}} ଚଲାନ୍ତୁ', hi: '{{title}} चलाएँ' },
});

for (let i = 0; i < 4; i++) {
  T[`live.cameras[${i}].name`] = { or: EN.live.cameras[i].name, hi: EN.live.cameras[i].name };
  T[`live.cameras[${i}].label`] = { or: EN.live.cameras[i].label, hi: EN.live.cameras[i].label };
}
for (let i = 0; i < 6; i++) {
  const odia = EN.live.schedule[i].odia;
  if (ODIA_DISPLAY[odia]) T[`live.schedule[${i}].odia`] = ODIA_DISPLAY[odia];
  T[`live.schedule[${i}].status`] = {
    ended: { or: 'ସମାପ୍ତ', hi: 'समाप्त' },
    live: { or: 'ଲାଇଭ୍', hi: 'लाइव' },
    upcoming: { or: 'ଆଗାମୀ', hi: 'आगामी' },
  }[EN.live.schedule[i].status];
}

// ── festivals UI ──
Object.assign(T, {
  'festivals.heroEyebrow': { or: 'Utsav · ଉତ୍ସବ', hi: 'Utsav · उत्सव' },
  'festivals.heroTitle': { or: 'Festivals & Events', hi: 'Festivals & Events' },
  'festivals.heroOdia': { or: 'ବର୍ଷ ସାରା ଉତ୍ସବ ଓ ପର୍ବ', hi: 'वर्ष भर उत्सव और पर्व' },
  'festivals.featuredEyebrow': { or: 'Next grand festival · {{day}} {{month}} · {{weekday}}', hi: 'Next grand festival · {{day}} {{month}} · {{weekday}}' },
  'festivals.featuredDetails': { or: 'Festival details →', hi: 'Festival details →' },
  'festivals.addToCalendar': { or: 'Add to calendar', hi: 'Add to calendar' },
  'festivals.calendarTitle': { or: 'Festival Calendar', hi: 'Festival Calendar' },
  'festivals.panjikaNote': { or: 'Official Odia calendar verified from {{source}} · {{period}}', hi: 'Official Odia calendar verified from {{source}} · {{period}}' },
  'festivals.downloadPdf': { or: 'Download official Panjika PDF ↓', hi: 'Download official Panjika PDF ↓' },
  'festivals.eventsCount': { or: '{{count}} events', hi: '{{count}} events' },
  'festivals.defaultDescription': { or: PANJIKA_DESC_OR, hi: PANJIKA_DESC_HI },
  'festivals.rathaDescLong': { or: RATHA_DESC_LONG_OR, hi: RATHA_DESC_LONG_HI },
});

// Festival events descriptions
for (let i = 0; i < PANJIKA_EVENTS.length; i++) {
  T[`festivals.events[${i}].description`] = { or: PANJIKA_DESC_OR, hi: PANJIKA_DESC_HI };
  const dl = PANJIKA_EVENTS[i].descriptionLong;
  if (dl) {
    T[`festivals.events[${i}].descriptionLong`] = { or: RATHA_DESC_LONG_OR, hi: RATHA_DESC_LONG_HI };
  }
  const odia = PANJIKA_EVENTS[i].odia;
  if (odia && ODIA_DISPLAY[odia]) {
    T[`festivals.events[${i}].odia`] = ODIA_DISPLAY[odia];
  }
}

// ── prasad ──
Object.assign(T, {
  'prasad.heroEyebrow': { or: 'Mahaprasad · ମହାପ୍ରସାଦ', hi: 'Mahaprasad · महाप्रसाद' },
  'prasad.heroTitle': { or: 'Book Sacred Prasad', hi: 'Book Sacred Prasad' },
  'prasad.heroOdia': { or: 'ଭଗବାନଙ୍କ ମହାପ୍ରସାଦ ବୁକ୍ କରନ୍ତୁ', hi: 'भगवान का महाप्रसाद बुक करें' },
  'prasad.howItWorks': { or: 'Prasad booking କିପରି କାମ କରେ', hi: 'Prasad booking कैसे काम करती है' },
  'prasad.steps[0].title': { or: 'Collection ବାଛନ୍ତୁ', hi: 'Collection चुनें' },
  'prasad.steps[0].desc': { or: 'Temple pickup କିମ୍ବା Ananda Bazar, preferred date।', hi: 'Temple pickup या Ananda Bazar, preferred date।' },
  'prasad.steps[1].title': { or: 'Details ଦିଅନ୍ତୁ', hi: 'Details दें' },
  'prasad.steps[1].desc': { or: 'Name, phone, quantity ଓ special request।', hi: 'Name, phone, quantity और special request।' },
  'prasad.steps[2].title': { or: 'WhatsApp ରେ confirm', hi: 'WhatsApp पर confirm' },
  'prasad.steps[2].desc': { or: 'WhatsApp booking — sevaks confirm କରିବେ।', hi: 'WhatsApp booking — sevaks confirm करेंगे।' },
  'prasad.formEyebrow': { or: 'Booking details', hi: 'Booking details' },
  'prasad.formTitle': { or: 'Prasad reserve କରନ୍ତୁ', hi: 'Prasad reserve करें' },
  'prasad.formHelper': {
    or: "Details ପୂରଣ — submit ପରେ mandir WhatsApp, sevaks confirm।",
    hi: "Details भरें — submit पर mandir WhatsApp, sevaks confirm।",
  },
  'prasad.mahaprasad': { or: 'Mahaprasad', hi: 'Mahaprasad' },
  'prasad.mahaprasadOdia': ODIA_DISPLAY['ମହାପ୍ରସାଦ'],
  'prasad.pickupNote': { or: 'Temple pickup · packing included', hi: 'Temple pickup · packing included' },
  'prasad.bazarNote': { or: 'Ananda Bazar packed prasad', hi: 'Ananda Bazar packed prasad' },
  'prasad.collection': { or: 'Collection', hi: 'Collection' },
  'prasad.collectionAria': { or: 'Collection method', hi: 'Collection method' },
  'prasad.fullNameRequired': { or: 'Full name*', hi: 'Full name*' },
  'prasad.namePlaceholder': { or: 'Your name', hi: 'Your name' },
  'prasad.phoneRequired': { or: 'Phone / WhatsApp*', hi: 'Phone / WhatsApp*' },
  'prasad.quantity': { or: 'Quantity (persons)', hi: 'Quantity (persons)' },
  'prasad.decreaseQty': { or: 'Quantity ହ୍ରାସ', hi: 'Quantity घटाएँ' },
  'prasad.increaseQty': { or: 'Quantity ବୃଦ୍ଧି', hi: 'Quantity बढ़ाएँ' },
  'prasad.preferredDate': { or: 'Preferred date', hi: 'Preferred date' },
  'prasad.datePlaceholder': { or: 'e.g. 16 July 2026', hi: 'e.g. 16 July 2026' },
  'prasad.dateHint': { or: 'Weekday vs Sat/Sun rate।', hi: 'Weekday vs Sat/Sun rate।' },
  'prasad.notesOptional': { or: 'Notes (optional)', hi: 'Notes (optional)' },
  'prasad.notesPlaceholder': { or: 'Special request (gotra, occasion)…', hi: 'Special request (gotra, occasion)…' },
  'prasad.submit': { or: 'Book & Confirm on WhatsApp', hi: 'Book & Confirm on WhatsApp' },
  'prasad.submitCaption': { or: "WhatsApp redirect with details filled in.", hi: "WhatsApp redirect with details filled in." },
  'prasad.summaryEyebrow': { or: 'Your booking', hi: 'Your booking' },
  'prasad.summaryPrasad': { or: 'Prasad', hi: 'Prasad' },
  'prasad.summaryRate': { or: 'Rate', hi: 'Rate' },
  'prasad.summaryQuantity': { or: 'Quantity', hi: 'Quantity' },
  'prasad.summaryPersons': { or: '{{count}} person(s)', hi: '{{count}} person(s)' },
  'prasad.summaryCollection': { or: 'Collection', hi: 'Collection' },
  'prasad.summaryDate': { or: 'Date', hi: 'Date' },
  'prasad.summaryTotal': { or: 'Est. offering', hi: 'Est. offering' },
  'prasad.selectDate': { or: 'Select date', hi: 'Select date' },
  'prasad.whatsappTitle': { or: 'Confirmed on WhatsApp', hi: 'Confirmed on WhatsApp' },
  'prasad.whatsappBody': {
    or: 'No online payment now. Sevaks confirm availability, amount, timing on chat.',
    hi: 'No online payment now. Sevaks confirm availability, amount, timing on chat.',
  },
  'prasad.noteText': {
    or: 'Mahaprasad sanctified food offered to Jagannath — blessing, not merely a meal.',
    hi: 'Mahaprasad sanctified food offered to Jagannath — blessing, not merely a meal.',
  },
  'prasad.methods[0].label': { or: 'Temple pickup', hi: 'Temple pickup' },
  'prasad.methods[1].label': { or: 'At temple Ananda Bazar', hi: 'At temple Ananda Bazar' },
  'prasad.weekday': { or: 'Weekday', hi: 'Weekday' },
  'prasad.weekend': { or: 'Sat–Sun', hi: 'Sat–Sun' },
  'prasad.priceWeekdayWeekend': { or: '{{weekday}} weekdays · {{weekend}} Sat–Sun', hi: '{{weekday}} weekdays · {{weekend}} Sat–Sun' },
  'prasad.whatsappTemplate.header': { or: '🙏 *Prasad Booking — Shree Jagannath Mandir*', hi: '🙏 *Prasad Booking — Shree Jagannath Mandir*' },
  'prasad.whatsappTemplate.name': { or: '*Name:*', hi: '*Name:*' },
  'prasad.whatsappTemplate.phone': { or: '*Phone:*', hi: '*Phone:*' },
  'prasad.whatsappTemplate.prasad': { or: '*Prasad:*', hi: '*Prasad:*' },
  'prasad.whatsappTemplate.quantity': { or: '*Quantity:*', hi: '*Quantity:*' },
  'prasad.whatsappTemplate.collection': { or: '*Collection:*', hi: '*Collection:*' },
  'prasad.whatsappTemplate.date': { or: '*Preferred date:*', hi: '*Preferred date:*' },
  'prasad.whatsappTemplate.offering': { or: '*Est. offering:*', hi: '*Est. offering:*' },
  'prasad.whatsappTemplate.notes': { or: '*Notes:*', hi: '*Notes:*' },
  'prasad.whatsappTemplate.notSpecified': { or: 'Not specified', hi: 'Not specified' },
  'prasad.whatsappTemplate.footer': { or: 'Please confirm availability. Jai Jagannath 🚩', hi: 'Please confirm availability. Jai Jagannath 🚩' },
});
for (let i = 0; i < 3; i++) {
  T[`prasad.steps[${i}].n`] = { or: EN.prasad.steps[i].n, hi: EN.prasad.steps[i].n };
}

// ── blog ──
Object.assign(T, {
  'blog.heroEyebrow': { or: 'Sambad & Katha · ସମ୍ବାଦ', hi: 'Sambad & Katha · समाचार' },
  'blog.heroTitle': { or: 'Temple Journal', hi: 'Temple Journal' },
  'blog.heroOdia': { or: 'ମନ୍ଦିର ଓ ଉତ୍ସବ ସମ୍ବନ୍ଧୀୟ ଲେଖା', hi: 'मंदिर और उत्सव संबंधी लेख' },
  'blog.latestEyebrow': { or: 'Latest writing', hi: 'Latest writing' },
  'blog.gridTitle': { or: 'From the Mandir', hi: 'From the Mandir' },
  'blog.filterAria': { or: 'Filter by category', hi: 'Filter by category' },
  'blog.emptyTitle': { or: 'No posts in this category yet', hi: 'No posts in this category yet' },
  'blog.emptyText': { or: 'Check back soon — new writing added regularly.', hi: 'Check back soon — new writing added regularly.' },
  'blog.newsletterOdia': { or: 'ସମ୍ବାଦ ପାଆନ୍ତୁ', hi: 'समाचार पाएँ' },
  'blog.newsletterTitle': { or: 'Festival news, in your inbox.', hi: 'Festival news, in your inbox.' },
  'blog.newsletterCopy': {
    or: 'Subscribe for festival notices, special darshan, new mandir stories.',
    hi: 'Subscribe for festival notices, special darshan, new mandir stories.',
  },
  'blog.emailLabel': { or: 'Email address', hi: 'Email address' },
  'blog.emailPlaceholder': { or: 'Enter your email address', hi: 'Enter your email address' },
  'blog.categories.all': { or: 'All', hi: 'All' },
  'blog.categories.festivals': { or: 'Festivals', hi: 'Festivals' },
  'blog.categories.traditions': { or: 'Traditions', hi: 'Traditions' },
  'blog.categories.templeLife': { or: 'Temple Life', hi: 'Temple Life' },
});

const BLOG_POSTS = [
  ['Ratha Yatra 2026 — What to Expect', 'Ratha Yatra 2026 — What to Expect', 'Festivals', 'Festivals',
    'Chariots roll 16 July. Procession guide, darshan spots, seva options.',
    'Chariots roll 16 July. Procession guide, darshan spots, seva options.'],
  ['The Meaning Behind Anasara', 'The Meaning Behind Anasara', 'Traditions', 'Traditions',
    'Why deities rest — fortnight retreat and recovery story.',
    'Why deities rest — fortnight retreat and recovery story.'],
  ['A Morning with the Mangala Arati', 'A Morning with the Mangala Arati', 'Temple Life', 'Temple Life',
    'Before dawn, temple stirs. First ritual walkthrough.',
    'Before dawn, temple stirs. First ritual walkthrough.'],
  ['Understanding Mahaprasad', 'Understanding Mahaprasad', 'Traditions', 'Traditions',
    'More than food — sanctified offering, history, shared without distinction.',
    'More than food — sanctified offering, history, shared without distinction.'],
  ['Kartik Purnima & the Festival of Lamps', 'Kartik Purnima & the Festival of Lamps', 'Festivals', 'Festivals',
    'Boita Bandana, floating lamps, Odisha maritime memory.',
    'Boita Bandana, floating lamps, Odisha maritime memory.'],
  ['Meet the Sevaks: Voices from the Kitchen', 'Meet the Sevaks: Voices from the Kitchen', 'Temple Life', 'Temple Life',
    'Annadan kitchen volunteers on daily seva meaning.',
    'Annadan kitchen volunteers on daily seva meaning.'],
];
BLOG_POSTS.forEach((row, i) => {
  T[`blog.posts[${i}].title`] = { or: row[0], hi: row[1] };
  T[`blog.posts[${i}].category`] = { or: row[2], hi: row[3] };
  T[`blog.posts[${i}].excerpt`] = { or: row[4], hi: row[5] };
});

// ── gallery ──
Object.assign(T, {
  'gallery.eyebrow': { or: 'Darshan Gallery · ଦର୍ଶନ', hi: 'Darshan Gallery · दर्शन' },
  'gallery.title': { or: 'Inside Our Mandir', hi: 'Inside Our Mandir' },
  'gallery.viewFull': { or: 'View full gallery →', hi: 'View full gallery →' },
});
const GALLERY = [
  ['Jagannath trinity — adorned', 'Jagannath trinity — adorned', 'Jagannath, Balabhadra and Subhadra adorned with flowers on the ratnavedi', 'Jagannath, Balabhadra and Subhadra adorned with flowers on the ratnavedi'],
  ['Mangala Arati', 'Mangala Arati', 'The trinity at dawn Mangala Arati', 'The trinity at dawn Mangala Arati'],
  ['Festival decoration', 'Festival decoration', 'Temple shikhara with Sudarshan Chakra and pata flag', 'Temple shikhara with Sudarshan Chakra and pata flag'],
  ['Shikhara by night', 'Shikhara by night', 'Temple shikhara illuminated at night', 'Temple shikhara illuminated at night'],
  ['Bhoga offering', 'Bhoga offering', 'Bhoga and flower offerings before the deities', 'Bhoga and flower offerings before the deities'],
  ['Evening darshan', 'Evening darshan', 'Lord Jagannath adorned for darshan', 'Lord Jagannath adorned for darshan'],
  ['Ratnavedi darshan', 'Ratnavedi darshan', 'The holy trinity on the ratnavedi', 'The holy trinity on the ratnavedi'],
  ['Balabhadra darshan', 'Balabhadra darshan', 'Lord Balabhadra adorned for darshan', 'Lord Balabhadra adorned for darshan'],
];
GALLERY.forEach((row, i) => {
  T[`gallery.items[${i}].label`] = { or: row[0], hi: row[1] };
  T[`gallery.items[${i}].alt`] = { or: row[2], hi: row[3] };
});

// ── Build output maps ──
const OR_FULL = {};
const HI_FULL = {};
const missing = [];

for (const [path, enVal] of PATHS) {
  if (T[path]) {
    OR_FULL[path] = T[path].or;
    HI_FULL[path] = T[path].hi;
  } else if (enVal === PANJIKA_DESC) {
    OR_FULL[path] = PANJIKA_DESC_OR;
    HI_FULL[path] = PANJIKA_DESC_HI;
  } else if (enVal === RATHA_DESC_LONG) {
    OR_FULL[path] = RATHA_DESC_LONG_OR;
    HI_FULL[path] = RATHA_DESC_LONG_HI;
  } else if (ODIA_DISPLAY[enVal]) {
    OR_FULL[path] = ODIA_DISPLAY[enVal].or;
    HI_FULL[path] = ODIA_DISPLAY[enVal].hi;
  } else if (NITI_NOTES[enVal]) {
    OR_FULL[path] = NITI_NOTES[enVal].or;
    HI_FULL[path] = NITI_NOTES[enVal].hi;
  } else {
    missing.push([path, enVal]);
  }
}

if (missing.length) {
  console.error('Missing translations:', missing.length);
  missing.slice(0, 20).forEach(([p, v]) => console.error(' ', p, ':', v.slice(0, 80)));
  process.exit(1);
}

function serializeMap(name, map) {
  const entries = Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join('\n');
  return `export const ${name} = {\n${entries}\n};\n`;
}

const out = `/** Odia and Hindi translation maps for build-locales.mjs */\n${serializeMap('OR_FULL', OR_FULL)}\n${serializeMap('HI_FULL', HI_FULL)}`;
writeFileSync(join(ROOT, 'scripts/locale-translations.mjs'), out);
console.log(JSON.stringify({ orKeys: Object.keys(OR_FULL).length, hiKeys: Object.keys(HI_FULL).length, paths: PATHS.length }));

