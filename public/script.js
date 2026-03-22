const $ = (id) => document.getElementById(id);
const qs = (sel, root = document) => [...root.querySelectorAll(sel)];

const buildVersion = document.querySelector('meta[name="build-version"]')?.content || "dev";
const DEFAULT_LANG = "fa";
let currentLang = DEFAULT_LANG;
let activeCountry = null;
let countryAmountMap = new Map();
let mapLoaded = false;

const statementText = {
  fa: [
    "۱) بند نخست پویش: متن نهایی این بخش را خودتان جایگزین کنید.",
    "۲) بند دوم پویش: این ساختار برای نمایش متن شماره‌گذاری‌شده آماده شده است.",
    "۳) بند سوم پویش: هر بند در رابط کاربری به‌صورت مجزا و خوانا نمایش داده می‌شود.",
    "۴) بند چهارم پویش: پس از نهایی‌شدن متن، ترجمه‌های هشت‌زبانه را می‌توان در همین بخش قرار داد.",
    "۵) بند پنجم پویش: امضاکننده پس از مطالعه متن، فرم را تکمیل و ثبت می‌کند."
  ],
  ar: [
    "1) البند الأول: استبدل هذا الموضع بالنص النهائي للحملة.",
    "2) البند الثاني: هذا الهيكل جاهز لعرض نص مرقّم وواضح.",
    "3) البند الثالث: كل بند يُعرض بشكل مستقل وسهل القراءة داخل الواجهة.",
    "4) البند الرابع: بعد اعتماد النص النهائي يمكن وضع الترجمات الثمانية هنا.",
    "5) البند الخامس: بعد قراءة النص يملأ المستخدم النموذج ثم يرسله."
  ],
  en: [
    "1) First section: replace this placeholder with the final campaign text.",
    "2) Second section: this layout is ready for numbered statement paragraphs.",
    "3) Third section: each paragraph is shown separately for better readability.",
    "4) Fourth section: once approved, all eight language translations can be inserted here.",
    "5) Fifth section: after reading the text, the signer completes and submits the form."
  ],
  ur: [
    "1) پہلی شق: یہاں حتمی مہم کا متن درج کریں۔",
    "2) دوسری شق: یہ ڈھانچہ نمبر وار متن دکھانے کے لیے تیار ہے۔",
    "3) تیسری شق: ہر شق الگ اور واضح انداز میں دکھائی جاتی ہے۔",
    "4) چوتھی شق: حتمی متن منظور ہونے کے بعد آٹھ زبانوں کے تراجم یہی شامل کیے جا سکتے ہیں۔",
    "5) پانچویں شق: متن پڑھنے کے بعد دستخط کرنے والا فارم مکمل کر کے جمع کرتا ہے۔"
  ],
  fr: [
    "1) Première section : remplacez cet espace par le texte final de la campagne.",
    "2) Deuxième section : cette structure est prête pour un texte numéroté.",
    "3) Troisième section : chaque paragraphe apparaît séparément pour une meilleure lisibilité.",
    "4) Quatrième section : après validation, les huit traductions peuvent être ajoutées ici.",
    "5) Cinquième section : après lecture, le signataire remplit puis envoie le formulaire."
  ],
  de: [
    "1) Erster Abschnitt: Ersetzen Sie diesen Platzhalter durch den endgültigen Kampagnentext.",
    "2) Zweiter Abschnitt: Dieses Layout ist für nummerierte Absätze vorbereitet.",
    "3) Dritter Abschnitt: Jeder Abschnitt wird separat und gut lesbar angezeigt.",
    "4) Vierter Abschnitt: Nach Freigabe können hier alle acht Übersetzungen eingefügt werden.",
    "5) Fünfter Abschnitt: Nach dem Lesen füllt die unterzeichnende Person das Formular aus und sendet es ab."
  ],
  es: [
    "1) Primera sección: sustituya este marcador por el texto final de la campaña.",
    "2) Segunda sección: esta estructura ya está lista para mostrar párrafos numerados.",
    "3) Tercera sección: cada párrafo se presenta por separado para facilitar la lectura.",
    "4) Cuarta sección: una vez aprobado, aquí pueden colocarse las traducciones en ocho idiomas.",
    "5) Quinta sección: tras leer el texto, la persona firmante completa y envía el formulario."
  ],
  tr: [
    "1) Birinci bölüm: bu alanı nihai kampanya metniyle değiştirin.",
    "2) İkinci bölüm: bu düzen numaralı metinler için hazırdır.",
    "3) Üçüncü bölüm: her paragraf daha iyi okunabilirlik için ayrı gösterilir.",
    "4) Dördüncü bölüm: nihai metin onaylandıktan sonra sekiz dil çevirisi buraya eklenebilir.",
    "5) Beşinci bölüm: metni okuduktan sonra imzacı formu doldurup gönderir."
  ]
};

const countryAliases = {
  "United States": ["United States", "USA", "U.S.A.", "America", "ایالات متحده", "الولايات المتحدة", "Estados Unidos", "Vereinigte Staaten", "États-Unis"],
  "United Kingdom": ["United Kingdom", "UK", "Britain", "بریتانیا", "المملكة المتحدة"],
  "Iraq": ["Iraq", "العراق", "عراق"],
  "Iran": ["Iran", "ایران", "إيران"],
  "Germany": ["Germany", "Deutschland", "آلمان", "ألمانيا"],
  "France": ["France", "فرانسه", "فرنسا"],
  "Spain": ["Spain", "España", "اسپانیا", "إسبانيا"],
  "Turkey": ["Turkey", "Türkiye", "Turkiye", "ترکیه", "تركيا"],
  "Pakistan": ["Pakistan", "پاکستان", "باكستان"],
  "Afghanistan": ["Afghanistan", "افغانستان"],
  "India": ["India", "هند", "الهند"],
  "Saudi Arabia": ["Saudi Arabia", "Saudi", "عربستان", "السعودية"],
  "Syria": ["Syria", "سوريا", "Syrian Arab Republic"],
  "Lebanon": ["Lebanon", "لبنان"],
  "Yemen": ["Yemen", "یمن", "اليمن"],
  "Canada": ["Canada", "کانادا"],
  "Australia": ["Australia", "استرالیا", "أستراليا"],
  "Sweden": ["Sweden", "سوئد"],
  "Netherlands": ["Netherlands", "Holland", "هلند", "هولندا"],
  "Russia": ["Russia", "روسیه", "روسيا"],
  "China": ["China", "چین", "الصين"],
  "Brazil": ["Brazil", "برزیل", "البرازيل"],
  "Mexico": ["Mexico", "مکزیک", "المكسيك"],
  "Egypt": ["Egypt", "مصر"],
  "Jordan": ["Jordan", "اردن", "الأردن"],
  "Bahrain": ["Bahrain", "بحرین", "البحرين"],
  "Kuwait": ["Kuwait", "کویت", "الكويت"],
  "Qatar": ["Qatar", "قطر"],
  "United Arab Emirates": ["United Arab Emirates", "UAE", "امارات", "الإمارات"],
};

const i18n = {
  fa: {
    dir: "rtl", title: "بیانیه را بخوانید و امضای خود را ثبت کنید", subtitle: "هر بازدیدکننده می‌تواند نام یا نام مستعار خود را همراه با یک پیام کوتاه ثبت کند. شمار کل امضاها، تازه‌ترین امضاها و پراکندگی کشوری به‌صورت زنده نمایش داده می‌شود.",
    institutionKicker: "بستر رسمی و چندزبانه", institutionTitle: "سامانه جهانی مطالعه و امضای بیانیه", institutionSubtitle: "نمایش زنده شمار امضاها، تفکیک کشوری و پیام‌های کوتاه کاربران در یک قالب رسمی و چندزبانه",
    institutionChipLanguages: "8 زبان فعال", institutionChipSignatures: "امضای زنده و عمومی", heroBadge: "پویش جهانی امضای بیانیه", heroReadBtn: "مطالعه بیانیه", heroSignBtn: "ثبت امضا",
    feature1Title: "متن واحد و چندزبانه", feature1Text: "نمایش یک بیانیه در ۸ زبان با تغییر فوری رابط", feature2Title: "امضای ساده و سریع", feature2Text: "نام، کشور و پیام کوتاه برای ثبت پشتیبانی", feature3Title: "گزارش جهانی زنده", feature3Text: "نقشه کشورها، شمار امضاها و آخرین ثبت‌ها",
    heroSideKicker: "درباره این بستر", heroSideTitle: "امضای شما در آمار جهانی دیده می‌شود", heroSideText: "پس از ثبت، امضای شما در شمار کلی، جدول کشورها و فهرست آخرین امضاها منعکس می‌شود. می‌توانید از نام واقعی یا نام مستعار استفاده کنید.", microPill: "ساده، سریع، چندزبانه", microExample: "نام یا مستعار + کشور + پیام کوتاه", microExampleNote: "برای حفظ کیفیت داده‌ها، پیام‌ها کوتاه نگه داشته می‌شوند و ثبت‌های تکراریِ بسیار سریع محدود می‌گردند.",
    heroStat1: "زبان‌های فعال", heroStat2: "کشورهای ثبت‌شده", heroStat3: "کل امضاها",
    trust1Title: "رابط رسمی و شفاف", trust1Text: "ساخته‌شده برای نمایش عمومی، خوانایی بالا و اعتماد بصری", trust2Title: "ثبت امضا با نام یا مستعار", trust2Text: "کاربر می‌تواند هویت نمایشی خود را آزادانه انتخاب کند", trust3Title: "آمار زنده و نقشه جهانی", trust3Text: "جدول کشورها، آخرین امضاها و رنگ‌آمیزی تعاملی نقشه",
    statementTitle: "متن بیانیه", statementSubtitle: "کاربر پیش از امضا، متن را در زبان انتخابی خود مطالعه می‌کند.", statementBadge: "متن قابل امضا",
    formTitle: "ثبت امضا", formSubtitle: "برای امضا، اطلاعات زیر را تکمیل کنید.", displayNameLabel: "نام یا نام مستعار", countryLabel: "کشور", messageLabel: "پیام کوتاه", messageHint: "حداکثر ۲۸۰ کاراکتر", acceptLabel: "متن بیانیه را مطالعه کرده‌ام و امضای خود را ثبت می‌کنم.", submitBtn: "ثبت امضا", resetBtn: "پاک‌کردن فرم", formNoticeText: "پس از ثبت موفق، آمار و فهرست امضاها به‌روزرسانی می‌شود.",
    stat1Label: "کل امضاها", stat2Label: "کشورهای فعال", stat3Label: "آخرین به‌روزرسانی", mapTitle: "نقشه جهانی امضاها", mapSubtitle: "رنگ هر کشور متناسب با تعداد امضاهاست.", activeCountryText: "کشور فعال:", allCountries: "همه کشورها", clearCountryFilter: "نمایش همه", countryTableTitle: "جدول کشورها", countryTableSubtitle: "مرتب‌شده بر اساس تعداد امضاها", thCountry: "کشور", thCount: "تعداد", recentTitle: "آخرین امضاها", recentSubtitle: "فهرست تازه‌ترین ثبت‌ها با پیام کوتاه",
    noSignatures: "هنوز امضایی ثبت نشده است.", noMessage: "بدون پیام", signer: "امضاکننده", country: "کشور", time: "زمان", count: "تعداد", signSuccess: "امضای شما با موفقیت ثبت شد.", signFailed: "ثبت امضا انجام نشد.", acceptRequired: "برای ادامه باید متن بیانیه را تأیید کنید.", fillRequired: "نام و کشور الزامی هستند.", loading: "در حال بارگذاری...", invalidFast: "ارسال فرم بیش از حد سریع بود.", unknown: "نامشخص"
  },
  ar: {
    dir: "rtl", title: "اقرأ البيان وسجّل توقيعك", subtitle: "يمكن لكل زائر أن يضيف اسمه أو اسمه المستعار مع رسالة قصيرة، ويظهر العدد الكلي للتواقيع وآخر المشاركات والتوزع الجغرافي بشكل مباشر.", institutionKicker: "منصة رسمية متعددة اللغات", institutionTitle: "المنصة العالمية لقراءة البيان وتوقيعه", institutionSubtitle: "عرض مباشر لعدد التواقيع، والتوزع حسب الدول، والرسائل القصيرة ضمن قالب رسمي ومتعدد اللغات", institutionChipLanguages: "8 لغات فعالة", institutionChipSignatures: "تواقيع مباشرة وعامة", heroBadge: "حملة عالمية لتوقيع البيان", heroReadBtn: "قراءة البيان", heroSignBtn: "تسجيل التوقيع", feature1Title: "نص واحد بلغات متعددة", feature1Text: "عرض بيان واحد بثماني لغات مع تبديل فوري", feature2Title: "توقيع سريع وبسيط", feature2Text: "الاسم، الدولة ورسالة قصيرة", feature3Title: "إحصاءات عالمية مباشرة", feature3Text: "خريطة الدول، عدد التواقيع وآخر التسجيلات", heroSideKicker: "حول هذه المنصة", heroSideTitle: "توقيعك يظهر في الإحصاءات العالمية", heroSideText: "بعد التسجيل ينعكس توقيعك في العدد الكلي، وجدول الدول، وقائمة آخر التواقيع. يمكنك استخدام اسمك الحقيقي أو اسم مستعار.", microPill: "سريع، واضح، متعدد اللغات", microExample: "اسم أو مستعار + دولة + رسالة قصيرة", microExampleNote: "ولحماية جودة البيانات، تبقى الرسائل قصيرة وتُقيَّد التسجيلات المتكررة السريعة.", heroStat1: "اللغات الفعالة", heroStat2: "الدول المسجلة", heroStat3: "إجمالي التواقيع", trust1Title: "واجهة رسمية وشفافة", trust1Text: "مصممة للعرض العام والوضوح البصري", trust2Title: "توقيع باسم أو مستعار", trust2Text: "يمكن للمستخدم اختيار هويته الظاهرة بحرية", trust3Title: "خريطة وإحصاءات مباشرة", trust3Text: "جدول الدول، آخر التواقيع، وتلوين تفاعلي للخريطة", statementTitle: "نص البيان", statementSubtitle: "يقرأ المستخدم النص بلغته المختارة قبل التوقيع.", statementBadge: "نص قابل للتوقيع", formTitle: "تسجيل التوقيع", formSubtitle: "أكمل البيانات التالية لإضافة توقيعك.", displayNameLabel: "الاسم أو الاسم المستعار", countryLabel: "الدولة", messageLabel: "رسالة قصيرة", messageHint: "الحد الأقصى 280 حرفاً", acceptLabel: "لقد قرأت نص البيان وأثبت توقيعي عليه.", submitBtn: "تسجيل التوقيع", resetBtn: "مسح النموذج", formNoticeText: "بعد التسجيل الناجح، يتم تحديث الإحصاءات والقائمة مباشرة.", stat1Label: "إجمالي التواقيع", stat2Label: "الدول الفعالة", stat3Label: "آخر تحديث", mapTitle: "الخريطة العالمية للتواقيع", mapSubtitle: "لون كل دولة يتناسب مع عدد التواقيع فيها.", activeCountryText: "الدولة النشطة:", allCountries: "كل الدول", clearCountryFilter: "عرض الكل", countryTableTitle: "جدول الدول", countryTableSubtitle: "مرتب حسب عدد التواقيع", thCountry: "الدولة", thCount: "العدد", recentTitle: "آخر التواقيع", recentSubtitle: "أحدث التسجيلات مع الرسائل القصيرة", noSignatures: "لا توجد تواقيع حتى الآن.", noMessage: "بلا رسالة", signer: "الموقّع", country: "الدولة", time: "الوقت", count: "العدد", signSuccess: "تم تسجيل توقيعك بنجاح.", signFailed: "تعذر تسجيل التوقيع.", acceptRequired: "يجب تأكيد قراءة البيان أولاً.", fillRequired: "الاسم والدولة مطلوبان.", loading: "جاري التحميل...", invalidFast: "تم إرسال النموذج بسرعة كبيرة.", unknown: "غير معروف"
  },
  en: {dir:"ltr", title:"Read the statement and record your signature", subtitle:"Each visitor can submit a real name or pseudonym with a short message. The total signatures, latest entries, and country-by-country distribution are displayed live.", institutionKicker:"Official multilingual platform", institutionTitle:"Global statement reading and signing platform", institutionSubtitle:"Live signature counts, country breakdowns, and short public messages in a formal multilingual design", institutionChipLanguages:"8 active languages", institutionChipSignatures:"Live public signatures", heroBadge:"Global statement-signing campaign", heroReadBtn:"Read the statement", heroSignBtn:"Sign now", feature1Title:"One text, many languages", feature1Text:"A single statement available in 8 languages", feature2Title:"Fast signature flow", feature2Text:"Name, country, and a short message", feature3Title:"Live global reporting", feature3Text:"World map, country counts, and latest signatures", heroSideKicker:"About this platform", heroSideTitle:"Your signature appears in the global stats", heroSideText:"After submission, your signature is reflected in the total count, country table, and latest-signatures list. You may use a real name or a pseudonym.", microPill:"Simple, fast, multilingual", microExample:"Name or pseudonym + country + short message", microExampleNote:"To preserve data quality, messages stay short and very rapid duplicate submissions are limited.", heroStat1:"Active languages", heroStat2:"Countries represented", heroStat3:"Total signatures", trust1Title:"Formal and transparent UI", trust1Text:"Built for public visibility, trust, and clarity", trust2Title:"Sign with a name or pseudonym", trust2Text:"Users can freely choose their displayed identity", trust3Title:"Live map and statistics", trust3Text:"Country table, latest signatures, and interactive map coloring", statementTitle:"Statement text", statementSubtitle:"Users read the text in their selected language before signing.", statementBadge:"Signable text", formTitle:"Record your signature", formSubtitle:"Complete the fields below to submit your signature.", displayNameLabel:"Name or pseudonym", countryLabel:"Country", messageLabel:"Short message", messageHint:"Maximum 280 characters", acceptLabel:"I have read the statement and I record my signature.", submitBtn:"Submit signature", resetBtn:"Reset form", formNoticeText:"After a successful submission, stats and lists update automatically.", stat1Label:"Total signatures", stat2Label:"Active countries", stat3Label:"Last update", mapTitle:"World signature map", mapSubtitle:"Each country is colored by its signature count.", activeCountryText:"Active country:", allCountries:"All countries", clearCountryFilter:"Show all", countryTableTitle:"Country table", countryTableSubtitle:"Sorted by signature count", thCountry:"Country", thCount:"Count", recentTitle:"Latest signatures", recentSubtitle:"Newest entries with short messages", noSignatures:"No signatures have been recorded yet.", noMessage:"No message", signer:"Signer", country:"Country", time:"Time", count:"Count", signSuccess:"Your signature was recorded successfully.", signFailed:"The signature could not be recorded.", acceptRequired:"You must confirm that you read the statement.", fillRequired:"Name and country are required.", loading:"Loading...", invalidFast:"The form was submitted too quickly.", unknown:"Unknown"},
  ur: {dir:"rtl", title:"بیان پڑھیں اور اپنا دستخط درج کریں", subtitle:"ہر وزیٹر اپنا نام یا فرضی نام اور ایک مختصر پیغام درج کر سکتا ہے۔ کل دستخط، تازہ ترین اندراجات اور ممالک کے لحاظ سے تقسیم براہِ راست دکھائی جاتی ہے۔", institutionKicker:"سرکاری کثیر لسانی پلیٹ فارم", institutionTitle:"عالمی بیان مطالعہ و دستخط پلیٹ فارم", institutionSubtitle:"رسمی اور کثیر لسانی ڈیزائن میں دستخطوں کی تعداد، ممالک کی تفصیل اور مختصر عوامی پیغامات", institutionChipLanguages:"8 فعال زبانیں", institutionChipSignatures:"براہِ راست عوامی دستخط", heroBadge:"عالمی دستخطی مہم", heroReadBtn:"بیان پڑھیں", heroSignBtn:"اب دستخط کریں", feature1Title:"ایک متن، کئی زبانیں", feature1Text:"ایک ہی بیان 8 زبانوں میں", feature2Title:"تیز دستخطی عمل", feature2Text:"نام، ملک اور مختصر پیغام", feature3Title:"براہِ راست عالمی رپورٹنگ", feature3Text:"نقشہ، ملکی تعداد اور تازہ ترین دستخط", heroSideKicker:"اس پلیٹ فارم کے بارے میں", heroSideTitle:"آپ کا دستخط عالمی اعداد میں شامل ہوتا ہے", heroSideText:"جمع ہونے کے بعد آپ کا دستخط مجموعی تعداد، ممالک کی جدول اور تازہ ترین فہرست میں ظاہر ہوتا ہے۔ آپ اصلی نام یا فرضی نام استعمال کر سکتے ہیں۔", microPill:"سادہ، تیز، کثیر لسانی", microExample:"نام یا فرضی نام + ملک + مختصر پیغام", microExampleNote:"ڈیٹا کے معیار کے لیے پیغامات مختصر رکھے جاتے ہیں اور بہت تیز دہرائے گئے اندراجات محدود کیے جاتے ہیں۔", heroStat1:"فعال زبانیں", heroStat2:"شامل ممالک", heroStat3:"کل دستخط", trust1Title:"رسمی اور شفاف انٹرفیس", trust1Text:"عوامی نمائش، اعتماد اور وضاحت کے لیے تیار", trust2Title:"نام یا فرضی نام سے دستخط", trust2Text:"صارف اپنی ظاہر ہونے والی شناخت خود چن سکتا ہے", trust3Title:"براہِ راست نقشہ اور اعداد", trust3Text:"ممالک کی جدول، تازہ ترین دستخط اور تعاملی نقشہ", statementTitle:"بیان کا متن", statementSubtitle:"صارف دستخط سے پہلے اپنی منتخب زبان میں متن پڑھتا ہے۔", statementBadge:"قابلِ دستخط متن", formTitle:"دستخط درج کریں", formSubtitle:"اپنا دستخط جمع کرنے کے لیے نیچے دی گئی معلومات مکمل کریں۔", displayNameLabel:"نام یا فرضی نام", countryLabel:"ملک", messageLabel:"مختصر پیغام", messageHint:"زیادہ سے زیادہ 280 حروف", acceptLabel:"میں نے بیان پڑھ لیا ہے اور اپنا دستخط درج کر رہا ہوں۔", submitBtn:"دستخط جمع کریں", resetBtn:"فارم صاف کریں", formNoticeText:"کامیاب اندراج کے بعد اعداد اور فہرست خودکار طور پر تازہ ہو جائیں گے۔", stat1Label:"کل دستخط", stat2Label:"فعال ممالک", stat3Label:"آخری تازہ کاری", mapTitle:"عالمی دستخطی نقشہ", mapSubtitle:"ہر ملک کا رنگ دستخطوں کی تعداد کے مطابق ہے۔", activeCountryText:"فعال ملک:", allCountries:"تمام ممالک", clearCountryFilter:"سب دکھائیں", countryTableTitle:"ممالک کی جدول", countryTableSubtitle:"دستخطوں کی تعداد کے لحاظ سے ترتیب", thCountry:"ملک", thCount:"تعداد", recentTitle:"تازہ ترین دستخط", recentSubtitle:"مختصر پیغامات کے ساتھ نئی اندراجات", noSignatures:"ابھی تک کوئی دستخط درج نہیں ہوا۔", noMessage:"بغیر پیغام", signer:"دستخط کنندہ", country:"ملک", time:"وقت", count:"تعداد", signSuccess:"آپ کا دستخط کامیابی سے درج ہو گیا۔", signFailed:"دستخط درج نہیں ہو سکا۔", acceptRequired:"آگے بڑھنے سے پہلے بیان کی تصدیق ضروری ہے۔", fillRequired:"نام اور ملک ضروری ہیں۔", loading:"لوڈ ہو رہا ہے...", invalidFast:"فارم بہت جلدی بھیجا گیا۔", unknown:"نامعلوم"},
  fr: {dir:"ltr", title:"Lisez la déclaration et enregistrez votre signature", subtitle:"Chaque visiteur peut envoyer un nom réel ou un pseudonyme avec un court message. Le total des signatures, les dernières entrées et la répartition par pays sont affichés en direct.", institutionKicker:"Plateforme officielle multilingue", institutionTitle:"Plateforme mondiale de lecture et de signature", institutionSubtitle:"Compteur en direct des signatures, ventilation par pays et courts messages publics dans une présentation formelle multilingue", institutionChipLanguages:"8 langues actives", institutionChipSignatures:"Signatures publiques en direct", heroBadge:"Campagne mondiale de signature", heroReadBtn:"Lire la déclaration", heroSignBtn:"Signer", feature1Title:"Un texte, plusieurs langues", feature1Text:"Une même déclaration disponible en 8 langues", feature2Title:"Signature rapide", feature2Text:"Nom, pays et court message", feature3Title:"Suivi mondial en direct", feature3Text:"Carte du monde, pays et dernières signatures", heroSideKicker:"À propos de cette plateforme", heroSideTitle:"Votre signature apparaît dans les statistiques mondiales", heroSideText:"Après l’envoi, votre signature apparaît dans le total général, le tableau des pays et la liste des dernières signatures. Vous pouvez utiliser un nom réel ou un pseudonyme.", microPill:"Simple, rapide, multilingue", microExample:"Nom ou pseudonyme + pays + court message", microExampleNote:"Pour préserver la qualité des données, les messages restent courts et les doublons trop rapides sont limités.", heroStat1:"Langues actives", heroStat2:"Pays représentés", heroStat3:"Total des signatures", trust1Title:"Interface formelle et transparente", trust1Text:"Conçue pour la visibilité publique, la clarté et la confiance", trust2Title:"Signer avec un nom ou un pseudonyme", trust2Text:"L’utilisateur choisit librement son identité affichée", trust3Title:"Carte et statistiques en direct", trust3Text:"Tableau des pays, dernières signatures et carte interactive", statementTitle:"Texte de la déclaration", statementSubtitle:"Les utilisateurs lisent le texte dans la langue choisie avant de signer.", statementBadge:"Texte à signer", formTitle:"Enregistrer votre signature", formSubtitle:"Complétez les champs ci-dessous pour envoyer votre signature.", displayNameLabel:"Nom ou pseudonyme", countryLabel:"Pays", messageLabel:"Court message", messageHint:"Maximum 280 caractères", acceptLabel:"J’ai lu la déclaration et j’enregistre ma signature.", submitBtn:"Envoyer la signature", resetBtn:"Réinitialiser", formNoticeText:"Après un envoi réussi, les statistiques et les listes se mettent à jour automatiquement.", stat1Label:"Total des signatures", stat2Label:"Pays actifs", stat3Label:"Dernière mise à jour", mapTitle:"Carte mondiale des signatures", mapSubtitle:"Chaque pays est coloré selon son nombre de signatures.", activeCountryText:"Pays actif :", allCountries:"Tous les pays", clearCountryFilter:"Tout afficher", countryTableTitle:"Tableau des pays", countryTableSubtitle:"Classé par nombre de signatures", thCountry:"Pays", thCount:"Nombre", recentTitle:"Dernières signatures", recentSubtitle:"Entrées récentes avec courts messages", noSignatures:"Aucune signature n’a encore été enregistrée.", noMessage:"Sans message", signer:"Signataire", country:"Pays", time:"Heure", count:"Nombre", signSuccess:"Votre signature a été enregistrée avec succès.", signFailed:"La signature n’a pas pu être enregistrée.", acceptRequired:"Vous devez confirmer la lecture de la déclaration.", fillRequired:"Le nom et le pays sont obligatoires.", loading:"Chargement...", invalidFast:"Le formulaire a été envoyé trop rapidement.", unknown:"Inconnu"},
  de: {dir:"ltr", title:"Lesen Sie die Erklärung und tragen Sie Ihre Unterschrift ein", subtitle:"Jeder Besucher kann einen echten Namen oder ein Pseudonym mit einer kurzen Nachricht einreichen. Gesamtzahl, letzte Einträge und die Verteilung nach Ländern werden live angezeigt.", institutionKicker:"Offizielle mehrsprachige Plattform", institutionTitle:"Globale Plattform zum Lesen und Unterzeichnen", institutionSubtitle:"Live-Zähler für Unterschriften, Länderübersicht und kurze öffentliche Nachrichten in einem formellen mehrsprachigen Design", institutionChipLanguages:"8 aktive Sprachen", institutionChipSignatures:"Öffentliche Live-Unterschriften", heroBadge:"Globale Unterzeichnungskampagne", heroReadBtn:"Erklärung lesen", heroSignBtn:"Jetzt unterschreiben", feature1Title:"Ein Text, viele Sprachen", feature1Text:"Eine Erklärung in 8 Sprachen", feature2Title:"Schneller Signaturablauf", feature2Text:"Name, Land und kurze Nachricht", feature3Title:"Live-Weltübersicht", feature3Text:"Weltkarte, Länderzahlen und letzte Unterschriften", heroSideKicker:"Über diese Plattform", heroSideTitle:"Ihre Unterschrift erscheint in den globalen Statistiken", heroSideText:"Nach dem Absenden erscheint Ihre Unterschrift in der Gesamtzahl, in der Ländertabelle und in der Liste der neuesten Einträge. Sie können einen echten Namen oder ein Pseudonym verwenden.", microPill:"Einfach, schnell, mehrsprachig", microExample:"Name oder Pseudonym + Land + kurze Nachricht", microExampleNote:"Zur Sicherung der Datenqualität bleiben Nachrichten kurz und sehr schnelle Doppeleinreichungen werden begrenzt.", heroStat1:"Aktive Sprachen", heroStat2:"Vertretene Länder", heroStat3:"Gesamtunterschriften", trust1Title:"Formelles und transparentes UI", trust1Text:"Für öffentliche Sichtbarkeit, Klarheit und Vertrauen entwickelt", trust2Title:"Mit Name oder Pseudonym unterschreiben", trust2Text:"Benutzer wählen ihre sichtbare Identität frei", trust3Title:"Live-Karte und Statistiken", trust3Text:"Ländertabelle, neueste Unterschriften und interaktive Kartenfärbung", statementTitle:"Erklärungstext", statementSubtitle:"Nutzer lesen den Text in ihrer ausgewählten Sprache vor der Unterschrift.", statementBadge:"Unterzeichnungsfähiger Text", formTitle:"Unterschrift eintragen", formSubtitle:"Füllen Sie die folgenden Felder aus, um Ihre Unterschrift zu senden.", displayNameLabel:"Name oder Pseudonym", countryLabel:"Land", messageLabel:"Kurze Nachricht", messageHint:"Maximal 280 Zeichen", acceptLabel:"Ich habe die Erklärung gelesen und trage meine Unterschrift ein.", submitBtn:"Unterschrift absenden", resetBtn:"Formular zurücksetzen", formNoticeText:"Nach erfolgreicher Übermittlung werden Statistiken und Listen automatisch aktualisiert.", stat1Label:"Gesamtunterschriften", stat2Label:"Aktive Länder", stat3Label:"Letzte Aktualisierung", mapTitle:"Weltkarte der Unterschriften", mapSubtitle:"Jedes Land wird nach seiner Unterschriftenzahl eingefärbt.", activeCountryText:"Aktives Land:", allCountries:"Alle Länder", clearCountryFilter:"Alle anzeigen", countryTableTitle:"Ländertabelle", countryTableSubtitle:"Nach Anzahl der Unterschriften sortiert", thCountry:"Land", thCount:"Anzahl", recentTitle:"Neueste Unterschriften", recentSubtitle:"Neueste Einträge mit kurzen Nachrichten", noSignatures:"Es wurden noch keine Unterschriften erfasst.", noMessage:"Keine Nachricht", signer:"Unterzeichner", country:"Land", time:"Zeit", count:"Anzahl", signSuccess:"Ihre Unterschrift wurde erfolgreich gespeichert.", signFailed:"Die Unterschrift konnte nicht gespeichert werden.", acceptRequired:"Bitte bestätigen Sie zuerst, dass Sie die Erklärung gelesen haben.", fillRequired:"Name und Land sind erforderlich.", loading:"Wird geladen...", invalidFast:"Das Formular wurde zu schnell abgesendet.", unknown:"Unbekannt"},
  es: {dir:"ltr", title:"Lea la declaración y registre su firma", subtitle:"Cada visitante puede enviar un nombre real o seudónimo con un mensaje breve. El total de firmas, las entradas más recientes y la distribución por países se muestran en vivo.", institutionKicker:"Plataforma oficial multilingüe", institutionTitle:"Plataforma global para leer y firmar la declaración", institutionSubtitle:"Conteo en vivo de firmas, desglose por países y mensajes públicos breves en un diseño formal y multilingüe", institutionChipLanguages:"8 idiomas activos", institutionChipSignatures:"Firmas públicas en vivo", heroBadge:"Campaña global de firmas", heroReadBtn:"Leer la declaración", heroSignBtn:"Firmar ahora", feature1Title:"Un texto, muchos idiomas", feature1Text:"Una sola declaración en 8 idiomas", feature2Title:"Firma rápida", feature2Text:"Nombre, país y mensaje breve", feature3Title:"Reporte global en vivo", feature3Text:"Mapa mundial, países y últimas firmas", heroSideKicker:"Sobre esta plataforma", heroSideTitle:"Su firma aparece en las estadísticas globales", heroSideText:"Después de enviar, su firma se refleja en el conteo total, la tabla de países y la lista de firmas recientes. Puede usar un nombre real o un seudónimo.", microPill:"Simple, rápido, multilingüe", microExample:"Nombre o seudónimo + país + mensaje breve", microExampleNote:"Para preservar la calidad de los datos, los mensajes se mantienen breves y se limitan los envíos duplicados demasiado rápidos.", heroStat1:"Idiomas activos", heroStat2:"Países representados", heroStat3:"Total de firmas", trust1Title:"Interfaz formal y transparente", trust1Text:"Diseñada para visibilidad pública, claridad y confianza", trust2Title:"Firmar con nombre o seudónimo", trust2Text:"Los usuarios pueden elegir libremente su identidad visible", trust3Title:"Mapa y estadísticas en vivo", trust3Text:"Tabla de países, últimas firmas y coloreado interactivo del mapa", statementTitle:"Texto de la declaración", statementSubtitle:"Los usuarios leen el texto en el idioma elegido antes de firmar.", statementBadge:"Texto firmable", formTitle:"Registrar su firma", formSubtitle:"Complete los siguientes campos para enviar su firma.", displayNameLabel:"Nombre o seudónimo", countryLabel:"País", messageLabel:"Mensaje breve", messageHint:"Máximo 280 caracteres", acceptLabel:"He leído la declaración y registro mi firma.", submitBtn:"Enviar firma", resetBtn:"Restablecer", formNoticeText:"Después de un envío correcto, las estadísticas y listas se actualizan automáticamente.", stat1Label:"Total de firmas", stat2Label:"Países activos", stat3Label:"Última actualización", mapTitle:"Mapa mundial de firmas", mapSubtitle:"Cada país se colorea según su número de firmas.", activeCountryText:"País activo:", allCountries:"Todos los países", clearCountryFilter:"Mostrar todo", countryTableTitle:"Tabla de países", countryTableSubtitle:"Ordenada por número de firmas", thCountry:"País", thCount:"Cantidad", recentTitle:"Últimas firmas", recentSubtitle:"Entradas recientes con mensajes breves", noSignatures:"Aún no se ha registrado ninguna firma.", noMessage:"Sin mensaje", signer:"Firmante", country:"País", time:"Hora", count:"Cantidad", signSuccess:"Su firma se registró correctamente.", signFailed:"No se pudo registrar la firma.", acceptRequired:"Debe confirmar que leyó la declaración.", fillRequired:"El nombre y el país son obligatorios.", loading:"Cargando...", invalidFast:"El formulario se envió demasiado rápido.", unknown:"Desconocido"},
  tr: {dir:"ltr", title:"Bildiriyi okuyun ve imzanızı kaydedin", subtitle:"Her ziyaretçi gerçek adını ya da takma adını kısa bir mesajla birlikte gönderebilir. Toplam imza sayısı, son kayıtlar ve ülkelere göre dağılım canlı olarak gösterilir.", institutionKicker:"Resmî çok dilli platform", institutionTitle:"Küresel bildiri okuma ve imza platformu", institutionSubtitle:"Canlı imza sayacı, ülke dağılımı ve kısa kamu mesajları için resmî çok dilli tasarım", institutionChipLanguages:"8 aktif dil", institutionChipSignatures:"Canlı kamusal imzalar", heroBadge:"Küresel imza kampanyası", heroReadBtn:"Bildiriyi oku", heroSignBtn:"İmza ver", feature1Title:"Tek metin, çok dil", feature1Text:"Aynı bildiri 8 dilde", feature2Title:"Hızlı imza akışı", feature2Text:"İsim, ülke ve kısa mesaj", feature3Title:"Canlı küresel raporlama", feature3Text:"Dünya haritası, ülke sayıları ve son imzalar", heroSideKicker:"Bu platform hakkında", heroSideTitle:"İmzanız küresel istatistiklerde görünür", heroSideText:"Gönderimden sonra imzanız toplam sayıya, ülke tablosuna ve son imzalar listesine yansır. Gerçek adınızı veya takma adınızı kullanabilirsiniz.", microPill:"Basit, hızlı, çok dilli", microExample:"İsim veya takma ad + ülke + kısa mesaj", microExampleNote:"Veri kalitesini korumak için mesajlar kısa tutulur ve çok hızlı yinelenen gönderimler sınırlandırılır.", heroStat1:"Aktif diller", heroStat2:"Temsil edilen ülkeler", heroStat3:"Toplam imzalar", trust1Title:"Resmî ve şeffaf arayüz", trust1Text:"Kamusal görünürlük, açıklık ve güven için tasarlandı", trust2Title:"İsim ya da takma adla imzala", trust2Text:"Kullanıcılar görünen kimliğini özgürce seçebilir", trust3Title:"Canlı harita ve istatistikler", trust3Text:"Ülke tablosu, son imzalar ve etkileşimli harita renklendirmesi", statementTitle:"Bildiri metni", statementSubtitle:"Kullanıcılar imzadan önce metni seçtikleri dilde okur.", statementBadge:"İmzalanabilir metin", formTitle:"İmzanızı kaydedin", formSubtitle:"İmzanızı göndermek için aşağıdaki alanları doldurun.", displayNameLabel:"İsim veya takma ad", countryLabel:"Ülke", messageLabel:"Kısa mesaj", messageHint:"En fazla 280 karakter", acceptLabel:"Bildiriyi okudum ve imzamı kaydediyorum.", submitBtn:"İmzayı gönder", resetBtn:"Formu sıfırla", formNoticeText:"Başarılı gönderimden sonra istatistikler ve listeler otomatik olarak güncellenir.", stat1Label:"Toplam imzalar", stat2Label:"Aktif ülkeler", stat3Label:"Son güncelleme", mapTitle:"Dünya imza haritası", mapSubtitle:"Her ülke imza sayısına göre renklendirilir.", activeCountryText:"Etkin ülke:", allCountries:"Tüm ülkeler", clearCountryFilter:"Hepsini göster", countryTableTitle:"Ülke tablosu", countryTableSubtitle:"İmza sayısına göre sıralı", thCountry:"Ülke", thCount:"Sayı", recentTitle:"Son imzalar", recentSubtitle:"Kısa mesajlı yeni kayıtlar", noSignatures:"Henüz hiç imza kaydedilmedi.", noMessage:"Mesaj yok", signer:"İmzalayan", country:"Ülke", time:"Zaman", count:"Sayı", signSuccess:"İmzanız başarıyla kaydedildi.", signFailed:"İmza kaydedilemedi.", acceptRequired:"Önce bildiriyi okuduğunuzu onaylamalısınız.", fillRequired:"İsim ve ülke gereklidir.", loading:"Yükleniyor...", invalidFast:"Form çok hızlı gönderildi.", unknown:"Bilinmiyor"}
};

function setText(id, key) { const el = $(id); if (el) el.textContent = i18n[currentLang][key]; }
function escapeHtml(str = "") { return String(str).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }
function normalizeName(name = "") { return String(name).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }
function formatDate(iso) { try { return new Date(iso).toLocaleString(currentLang === 'fa' ? 'fa-IR' : undefined); } catch { return iso || '—'; } }

function applyLanguage(lang) {
  currentLang = i18n[lang] ? lang : DEFAULT_LANG;
  document.documentElement.lang = currentLang;
  document.documentElement.dir = i18n[currentLang].dir;
  document.title = i18n[currentLang].institutionTitle;
  qs('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === currentLang));

  [
    'institutionKicker','institutionTitle','institutionSubtitle','institutionChipLanguages','institutionChipSignatures','heroBadge','title','subtitle','heroReadBtn','heroSignBtn',
    'feature1Title','feature1Text','feature2Title','feature2Text','feature3Title','feature3Text','heroSideKicker','heroSideTitle','heroSideText','microPill','microExample','microExampleNote',
    'heroStat1','heroStat2','heroStat3','trust1Title','trust1Text','trust2Title','trust2Text','trust3Title','trust3Text','statementTitle','statementSubtitle','statementBadge',
    'formTitle','formSubtitle','displayNameLabel','countryLabel','messageLabel','messageHint','acceptLabel','submitBtn','resetBtn','formNoticeText',
    'stat1Label','stat2Label','stat3Label','mapTitle','mapSubtitle','activeCountryText','countryTableTitle','countryTableSubtitle','thCountry','thCount','recentTitle','recentSubtitle'
  ].forEach(id => setText(id, id));
  $('activeCountryLabel').textContent = activeCountry || i18n[currentLang].allCountries;
  $('clearCountryFilter').textContent = i18n[currentLang].clearCountryFilter;
  $('displayName').placeholder = currentLang === 'fa' ? 'مثلاً: یک دوست' : currentLang === 'ar' ? 'مثلاً: صديق' : 'e.g. A friend';
  $('country').placeholder = currentLang === 'fa' ? 'مثلاً: عراق' : currentLang === 'ar' ? 'مثلاً: العراق' : 'e.g. Iraq';
  $('message').placeholder = currentLang === 'fa' ? 'پیام کوتاه خود را بنویسید' : currentLang === 'ar' ? 'اكتب رسالتك القصيرة' : 'Write your short message';

  $('statementBody').innerHTML = statementText[currentLang].map(p => `<p>${escapeHtml(p)}</p>`).join('');
  renderCountriesTable(window.countryRows || []);
  renderRecent(window.recentRows || []);
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

function renderCountriesTable(rows) {
  window.countryRows = rows;
  const tbody = $('countryTableBody');
  tbody.innerHTML = '';
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="2">${escapeHtml(i18n[currentLang].noSignatures)}</td></tr>`;
    return;
  }
  const filteredRows = activeCountry ? rows.filter(r => r.country === activeCountry) : rows;
  filteredRows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(row.country)}</td><td>${Number(row.count || 0).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });
}

function renderRecent(rows) {
  window.recentRows = rows;
  const list = $('recentList');
  const filtered = activeCountry ? rows.filter(r => r.country === activeCountry) : rows;
  list.innerHTML = '';
  if (!filtered.length) {
    list.innerHTML = `<div class="report-item"><div class="report-note">${escapeHtml(i18n[currentLang].noSignatures)}</div></div>`;
    return;
  }
  filtered.forEach(item => {
    const el = document.createElement('article');
    el.className = 'report-item';
    el.innerHTML = `
      <div class="report-item-top">
        <div>
          <div class="report-name">${escapeHtml(item.display_name || i18n[currentLang].unknown)}</div>
          <div class="report-meta">${escapeHtml(i18n[currentLang].country)}: ${escapeHtml(item.country || i18n[currentLang].unknown)}</div>
        </div>
        <div class="report-meta">${escapeHtml(i18n[currentLang].time)}: ${escapeHtml(formatDate(item.created_at))}</div>
      </div>
      <div class="report-note">${escapeHtml(item.message || i18n[currentLang].noMessage)}</div>`;
    list.appendChild(el);
  });
}

function buildCountryAmountMap(rows) {
  countryAmountMap = new Map();
  rows.forEach(row => {
    const aliases = countryAliases[row.country] || [row.country];
    aliases.forEach(a => countryAmountMap.set(normalizeName(a), { country: row.country, count: Number(row.count || 0) }));
  });
}

function countToColor(count, max) {
  if (!count) return '#dde4f2';
  const ratio = Math.max(0.1, count / Math.max(1, max));
  if (ratio < 0.25) return '#c9d6f0';
  if (ratio < 0.5) return '#95b0e8';
  if (ratio < 0.75) return '#628cd8';
  return '#305eb6';
}

function updateMapColors() {
  const svg = $('worldMapContainer').querySelector('svg');
  if (!svg) return;
  const maxCount = Math.max(1, ...[...countryAmountMap.values()].map(v => v.count));
  qs('path', svg).forEach(path => {
    const raw = path.getAttribute('title') || path.getAttribute('name') || path.id || path.dataset.name || '';
    const info = countryAmountMap.get(normalizeName(raw));
    path.style.transition = 'fill 0.25s ease, opacity 0.25s ease';
    path.style.fill = countToColor(info?.count || 0, maxCount);
    path.style.opacity = activeCountry && info?.country !== activeCountry ? '0.3' : '1';
    path.style.cursor = info ? 'pointer' : 'default';
  });
}

function bindMapEvents() {
  const svg = $('worldMapContainer').querySelector('svg');
  if (!svg) return;
  qs('path', svg).forEach(path => {
    const raw = path.getAttribute('title') || path.getAttribute('name') || path.id || path.dataset.name || '';
    const info = countryAmountMap.get(normalizeName(raw));
    if (!info) return;
    path.addEventListener('click', () => {
      activeCountry = info.country;
      $('activeCountryLabel').textContent = activeCountry;
      renderCountriesTable(window.countryRows || []);
      renderRecent(window.recentRows || []);
      updateMapColors();
    });
  });
}

async function initWorldMap() {
  if (mapLoaded) return;
  const container = $('worldMapContainer');
  if (!container) return;
  const existingSvg = container.querySelector('svg');
  if (existingSvg) {
    mapLoaded = true;
    return;
  }
  try {
    const res = await fetch('/world-map.svg', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Map fetch failed: ${res.status}`);
    container.innerHTML = await res.text();
  } catch (err) {
    container.innerHTML = '<div class="map-fallback">بارگذاری نقشه انجام نشد.</div>';
  }
  mapLoaded = !!container.querySelector('svg');
}

async function refreshData() {
  const [stats, countries, signatures] = await Promise.all([
    fetchJson('/api/stats'),
    fetchJson('/api/countries'),
    fetchJson('/api/signatures?limit=20')
  ]);

  $('statSignatures').textContent = Number(stats.total_signatures || 0).toLocaleString();
  $('statCountries').textContent = Number(stats.countries_count || 0).toLocaleString();
  $('heroSignaturesCount').textContent = Number(stats.total_signatures || 0).toLocaleString();
  $('heroCountriesCount').textContent = Number(stats.countries_count || 0).toLocaleString();
  $('statUpdated').textContent = formatDate(stats.generated_at || new Date().toISOString());

  buildCountryAmountMap(countries || []);
  renderCountriesTable(countries || []);
  renderRecent(signatures || []);
  if (!mapLoaded) await initWorldMap();
  bindMapEvents();
  bindMapEvents();
  updateMapColors();
}

function resetForm() {
  $('signatureForm').reset();
  $('pageLoadedAt').value = String(Date.now());
}

async function submitSignature(ev) {
  ev.preventDefault();
  const t = i18n[currentLang];
  const display_name = $('displayName').value.trim();
  const country = $('country').value.trim();
  const message = $('message').value.trim();
  const accepted = $('acceptStatement').checked;
  if (!display_name || !country) return alert(t.fillRequired);
  if (!accepted) return alert(t.acceptRequired);
  const submitBtn = $('submitBtn');
  const original = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = t.loading;
  try {
    const payload = { display_name, country, message, build_version: buildVersion, page_loaded_at: Number($('pageLoadedAt').value || 0), website: $('website').value || '' };
    const result = await fetchJson('/api/sign', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(payload) });
    alert(result.message || t.signSuccess);
    resetForm();
    await refreshData();
  } catch (err) {
    alert(err.message || t.signFailed);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = original;
  }
}

function fillCountrySuggestions() {
  const entries = [...new Set(Object.keys(countryAliases).flatMap(k => countryAliases[k].concat([k])))]
    .sort((a, b) => a.localeCompare(b));
  $('countrySuggestions').innerHTML = entries.map(c => `<option value="${escapeHtml(c)}"></option>`).join('');
}

function setupEvents() {
  qs('.lang-btn').forEach(btn => btn.addEventListener('click', () => applyLanguage(btn.dataset.lang)));
  $('heroReadBtn').onclick = () => $('statementSection').scrollIntoView({behavior:'smooth', block:'start'});
  $('heroSignBtn').onclick = () => $('signSection').scrollIntoView({behavior:'smooth', block:'start'});
  $('resetBtn').onclick = resetForm;
  $('signatureForm').addEventListener('submit', submitSignature);
  $('clearCountryFilter').onclick = () => {
    activeCountry = null;
    $('activeCountryLabel').textContent = i18n[currentLang].allCountries;
    renderCountriesTable(window.countryRows || []);
    renderRecent(window.recentRows || []);
    updateMapColors();
  };
}

(async function init() {
  $('pageLoadedAt').value = String(Date.now());
  fillCountrySuggestions();
  setupEvents();
  applyLanguage(DEFAULT_LANG);
  await refreshData();
})();
