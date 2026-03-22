const $ = (id) => document.getElementById(id);
const qs = (sel, root = document) => [...root.querySelectorAll(sel)];

const buildVersion = document.querySelector('meta[name="build-version"]')?.content || "dev";
const DEFAULT_LANG = "fa";
let currentLang = DEFAULT_LANG;
let activeCountry = null;
let countryAmountMap = new Map();
let mapLoaded = false;
const API_BASE = (location.hostname.endsWith('.pages.dev')) ? 'https://withiran.yaqaaem.workers.dev' : '';
function apiUrl(path) { return `${API_BASE}${path}`; }

const statementText = {
  "fa": [
    "۱) ما مردمان آزاده دنیا، که از زیاده‌خواهی و جنگ‌طلبی سردمداران امپریالیسم به ستوه آمده‌ایم، تهاجم نامشروع ایالات متحده آمریکا و اسرائیل علیه ایران را محکوم می‌کنیم.",
    "۲) ما کشتار ۱۶۸ کودک بی‌پناه ایرانی مدرسه میناب توسط موشک تاماهک، و کشتار دیگر کودکان و زنان ایرانی توسط سندیکای اپستین، به جلوداری ترامپ و نتانیاهو را محکوم می‌کنیم.",
    "۳) ما یک‌صدا و متحد، در کنار ملت بزرگ ایران ایستاده، و از حاکمیت و رهبری ایران که همواره با همه ملت‌ها دوستی کرده و به پشتیبانی از مظلومان پرداخته، حمایت می‌کنیم.",
    "۴) ما مقام رهبر شهید ایران آیت‌الله سید علی خامنه‌ای که توسط ایالات متحده آمریکا و اسرائیل در حال قرائت کتاب مقدس قرآن به شهادت رسیدند را ارج می‌نهیم.",
    "۵) ما تصمیم مردم و نخبگان ایران در انتخاب آیت‌الله سید مجتبی خامنه‌ای به عنوان رهبر جدید ایران را محترم شمرده، و در حمایت از مظلومان و مبارزه با جنگ‌سالاران و سلطه‌جویان جهان با ایشان اظهار همبستگی می‌کنیم."
  ],
  "ar": [
    "1) نحن أحرار العالم، الذين سئمنا من أطماع ودق طبول الحرب من قبل زعماء الإمبريالية، ندين العدوان غير المشروع للولايات المتحدة الأمريكية وإسرائيل ضد إيران.",
    "2) ندين مقتل ١٦٨ طفلاً إيرانياً أعزلاً في مدرسة ميناب بصواريخ توماهوك، وقتل غيرهم من النساء والأطفال الإيرانيين على يد نقابة إبستين، بقيادة ترامب ونتنياهو.",
    "3) نقف بصوت واحد وموحد إلى جانب شعب إيران العظيم، وندعم سيادة وقيادة إيران التي لطالما صادقت جميع الشعوب وقامت بمساندة المظلومين.",
    "4) نُجل مقام قائد إيران الشهيد آية الله السيد علي خامنئي، الذي استشهد على يد الولايات المتحدة وإسرائيل أثناء تلاوته للقرآن الكريم.",
    "5) نحترم قرار الشعب والنخب في إيران باختيار آية الله السيد مجتبى خامنئي قائداً جديداً لإيران، ونعلن تضامننا معه في نصرة المظلومين ومكافحة دعاة الحرب والمتسلطين في العالم."
  ],
  "en": [
    "1) We, the free people of the world, weary of the greed and warmongering of imperialist leaders, condemn the illegitimate aggression of the United States and Israel against Iran.",
    "2) We condemn the slaughter of 168 defenseless Iranian children at Minab school by Tomahawk missiles, and the killing of other Iranian women and children by the Epstein syndicate, led by Trump and Netanyahu.",
    "3) We stand united with the great nation of Iran, supporting the sovereignty and leadership of Iran which has consistently extended friendship to all nations and supported the oppressed.",
    "4) We honor the status of Iran's martyred leader, Ayatollah Sayyid Ali Khamenei, who was martyred by the United States and Israel while reciting the Holy Quran.",
    "5) We respect the decision of the Iranian people and elites in choosing Ayatollah Sayyid Mojtaba Khamenei as the new leader of Iran, declaring our solidarity with him in defending the oppressed and fighting global warmongers and hegemons."
  ],
  "ur": [
    "1) ہم دنیا کے آزاد منش لوگ، جو سامراجی آقاؤں کی ہوس اور جنگ پسندی سے تنگ آ چکے ہیں، ایران کے خلاف امریکہ اور اسرائیل کی غیر قانونی جارحیت کی مذمت کرتے ہیں۔",
    "2) ہم میناب اسکول میں ٹوما ہاک میزائلوں کے ذریعے 168 نہتے ایرانی بچوں کے قتل عام، اور ٹرمپ اور نیتن یاہو کی سربراہی میں ایپسٹین سنڈیکیٹ کے ہاتھوں دیگر ایرانی خواتین اور بچوں کے قتل کی مذمت کرتے ہیں۔",
    "3) ہم متحد ہو کر ایران کی عظیم قوم کے ساتھ کھڑے ہیں، اور ایران کی خود مختاری اور قیادت کی حمایت کرتے ہیں جس نے ہمیشہ تمام اقوام کے ساتھ دوستی کی اور مظلوموں کا ساتھ دیا۔",
    "4) ہم ایران کے شہید قائد آیت اللہ سید علی خامنہ ای کے مقام کو خراجِ عقیدت پیش کرتے ہیں، جنہیں امریکہ اور اسرائیل نے قرآن مجید کی تلاوت کے دوران شہید کیا۔",
    "5) ہم آیت اللہ سید مجتبیٰ خامنہ ای کو ایران کا نیا قائد منتخب کرنے کے ایرانی عوام اور اشرافیہ کے فیصلے کا احترام کرتے ہیں، اور مظلوموں کی حمایت اور عالمی جنگ پسندوں اور غلبہ پانے والوں کے خلاف ان کے ساتھ یکجہتی کا اظہار کرتے ہیں۔"
  ],
  "fr": [
    "1) Nous, les peuples libres du monde, lassés de l'avidité et du bellicisme des dirigeants impérialistes, condamnons l'agression illégitime des États-Unis et d'Israël contre l'Iran.",
    "2) Nous condamnons le massacre de 168 enfants iraniens sans défense à l'école de Minab par des missiles Tomahawk, ainsi que le meurtre d'autres femmes et enfants iraniens par le syndicat Epstein, dirigé par Trump et Netanyahou.",
    "3) Nous nous tenons unis aux côtés de la grande nation iranienne, soutenant la souveraineté et le leadership de l'Iran qui a toujours été l'ami de toutes les nations et a soutenu les opprimés.",
    "4) Nous honorons la mémoire du leader martyr de l'Iran, l'Ayatollah Sayyid Ali Khamenei, tombé en martyr sous les coups des États-Unis et d'Israël alors qu'il récitait le Saint Coran.",
    "5) Nous respectons la décision du peuple et des élites d'Iran de choisir l'Ayatollah Sayyid Mojtaba Khamenei comme nouveau leader, et déclarons notre solidarité avec lui pour la défense des opprimés et la lutte contre les bellicistes et les hégémonies mondiales."
  ],
  "de": [
    "1) Wir, die freien Menschen der Welt, die der Gier und Kriegstreiberei imperialistischer Führer überdrüssig sind, verurteilen die unrechtmäßige Aggression der Vereinigten Staaten und Israels gegen den Iran.",
    "2) Wir verurteilen die Ermordung von 168 wehrlosen iranischen Kindern in der Minab-Schule durch Tomahawk-Raketen sowie die Tötung weiterer iranischer Frauen und Kinder durch das Epstein-Syndikat unter der Führung von Trump und Netanjahu.",
    "3) Wir stehen geschlossen an der Seite der großen iranischen Nation und unterstützen die Souveränität und Führung des Iran, der stets allen Nationen Freundschaft erwiesen und die Unterdrückten unterstützt hat.",
    "4) Wir ehren das Andenken an den märtyrergewordenen Führer des Iran, Ayatollah Sayyid Ali Khamenei, der durch die USA und Israel während der Rezitation des Heiligen Korans zum Märtyrer wurde.",
    "5) Wir respektieren die Entscheidung des iranischen Volkes und der Eliten, Ayatollah Sayyid Mojtaba Khamenei zum neuen Führer des Iran zu wählen, und erklären unsere Solidarität mit ihm bei der Verteidigung der Unterdrückten und dem Kampf gegen globale Kriegstreiber und Hegemonen."
  ],
  "es": [
    "1) Nosotros, los pueblos libres del mundo, hartos de la codicia y el belicismo de los líderes imperialistas, condenamos la agresión ilegítima de los Estados Unidos e Israel contra Irán.",
    "2) Condenamos la masacre de 168 niños iraníes indefensos en la escuela de Minab por misiles Tomahawk, y el asesinato de otras mujeres y niños iraníes por el sindicato Epstein, liderado por Trump y Netanyahu.",
    "3) Nos mantenemos unidos al lado de la gran nación de Irán, apoyando la soberanía y el liderazgo de Irán, que siempre ha brindado amistad a todas las naciones y ha apoyado a los oprimidos.",
    "4) Honramos la memoria del líder mártir de Irán, el Ayatolá Sayyid Ali Jameneí, quien fue martirizado por los Estados Unidos e Israel mientras recitaba el Sagrado Corán.",
    "5) Respetamos la decisión del pueblo y las élites de Irán al elegir al Ayatolá Sayyid Mojtaba Jameneí como nuevo líder de Irán, y declaramos nuestra solidaridad con él en la defensa de los oprimidos y la lucha contra los belicistas y hegemonías globales."
  ],
  "tr": [
    "1) Emperyalist liderlerin açgözlülüğünden ve savaş çığırtkanlığından bıkan biz dünya özgür halkları, Amerika Birleşik Devletleri ve İsrail'in İran'a yönelik gayrimeşru saldırganlığını kınıyoruz.",
    "2) Minab okulunda Tomahawk füzeleriyle 168 savunmasız İranlı çocuğun katledilmesini ve Trump ile Netanyahu önderliğindeki Epstein sendikası tarafından diğer İranlı kadın ve çocukların öldürülmesini kınıyoruz.",
    "3) Büyük İran ulusunun yanında tek ses ve birlik içinde duruyor, her zaman tüm uluslarla dostluk kuran ve mazlumları destekleyen İran'ın egemenliğini ve liderliğini destekliyoruz.",
    "4) Amerika Birleşik Devletleri ve İsrail tarafından Kur'an-ı Kerim okurken şehit edilen İran'ın şehit lideri Ayetullah Seyyid Ali Hamaney'in makamını saygıyla anıyoruz.",
    "5) İran halkının ve seçkinlerinin Ayetullah Seyyid Mücteba Hamaney'i İran'ın yeni lideri olarak seçme kararını saygıyla karşılıyor; mazlumları savunma, küresel savaş baronları ve hegemonlarla mücadelede kendisiyle dayanışmamızı ilan ediyoruz."
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
    dir: "rtl", 
    title: "کمپین همراه با ایران - در سمت درست تاریخ", 
    subtitle: "هر بازدیدکننده می‌تواند نام یا نام مستعار خود را همراه با یک پیام کوتاه ثبت کند. شمار کل امضاها، تازه‌ترین امضاها و پراکندگی کشوری به‌صورت زنده نمایش داده می‌شود.",
    institutionKicker: "همراهی با مظلومان و همصدایی با حق و عدالت", 
    institutionTitle: "پویش همراه با ایران - در سمت درست تاریخ", 
    institutionSubtitle: " محکوم کردن تجاوز آمریکا و اسرائیل - و بیعت با امام امت و ولی امر مسلمین آیت الله سید مجتبی خامنه ای دام ظله",
    institutionChipLanguages: "8 زبان فعال", institutionChipSignatures: "امضای زنده و عمومی", heroBadge: "پویش جهانی امضای بیانیه", heroReadBtn: "مطالعه بیانیه", heroSignBtn: "ثبت امضا",
    feature1Title: "صدای مشترک علیه تجاوز", feature1Text: "بیانیه‌ای مشترک برای دفاع از حقیقت، کرامت انسان و حق ملت‌ها", feature2Title: "همبستگی با مظلومان", feature2Text: "ثبت نام، کشور و پیام کوتاه برای اعلام مسئولیت اخلاقی در برابر ظلم", feature3Title: "گزارش زنده آزادگان جهان", feature3Text: "نقشه کشورها، شمار امضاها و بازتاب جهانی پویش در زمان واقعی",
    heroSideKicker: "درباره این کمپین", heroSideTitle: "همراهی با حق، عدالت و کرامت انسانی", heroSideText: "این کمپین برای اعلام همبستگی با ملت ایران، همه آزادگان جهان و همه مردمی است که در برابر تجاوز، بی‌عدالتی و سلطه‌گری ایستاده‌اند. با امضای این متن، صدای خود را در حمایت از حق، عدالت، کرامت انسانی و دفاع از مظلومان به گوش افکار عمومی جهان می‌رسانیم.", microPill: "ساده، سریع، چندزبانه", microExample: "نام یا مستعار + کشور + پیام کوتاه", microExampleNote: "برای حفظ کیفیت داده‌ها، پیام‌ها کوتاه نگه داشته می‌شوند و ثبت‌های تکراریِ بسیار سریع محدود می‌گردند.",
    heroStat1: "زبان‌های فعال", heroStat2: "کشورهای ثبت‌شده", heroStat3: "کل امضاها",
    trust1Title: "حق خواهی و عدالت طلبی", 
    trust1Text: "همراهی با حق و حق طلبان جهان و خواستن جهانی سرشار از عدالت و فضیلت", 
    trust2Title: "استکبار ستیزی", 
    trust2Text: "مبارزه با جبهه باطل به سرکردگی آمریکا و اسرائیل", 
    trust3Title: "بیعت با ولی فقیه", 
    trust3Text: "بیعت با حضرت آیت الله سید مجتبی حسینی خامنه ای به عنوان رهبر و ولی امر مسلمین",
    statementTitle: "متن بیانیه", statementSubtitle: "کاربر پیش از امضا، متن را در زبان انتخابی خود مطالعه می‌کند.", statementBadge: "متن قابل امضا",
    formTitle: "ثبت امضا", formSubtitle: "برای امضا، اطلاعات زیر را تکمیل کنید.", displayNameLabel: "نام یا نام مستعار", countryLabel: "کشور", messageLabel: "پیام کوتاه", messageHint: "حداکثر ۲۸۰ کاراکتر", acceptLabel: "متن بیانیه را مطالعه کرده‌ام و امضای خود را ثبت می‌کنم.", submitBtn: "ثبت امضا", resetBtn: "پاک‌کردن فرم", formNoticeText: "پس از ثبت موفق، آمار و فهرست امضاها به‌روزرسانی می‌شود.",
    stat1Label: "کل امضاها", stat2Label: "کشورهای فعال", stat3Label: "آخرین به‌روزرسانی", mapTitle: "نقشه جهانی امضاها", mapSubtitle: "رنگ هر کشور متناسب با تعداد امضاهاست.", activeCountryText: "کشور فعال:", allCountries: "همه کشورها", clearCountryFilter: "نمایش همه", countryTableTitle: "جدول کشورها", countryTableSubtitle: "مرتب‌شده بر اساس تعداد امضاها", thCountry: "کشور", thCount: "تعداد", recentTitle: "آخرین امضاها", recentSubtitle: "فهرست تازه‌ترین ثبت‌ها با پیام کوتاه",
    noSignatures: "هنوز امضایی ثبت نشده است.", noMessage: "بدون پیام", signer: "امضاکننده", country: "کشور", time: "زمان", count: "تعداد", signSuccess: "امضای شما با موفقیت ثبت شد.", signFailed: "ثبت امضا انجام نشد.", acceptRequired: "برای ادامه باید متن بیانیه را تأیید کنید.", fillRequired: "نام و کشور الزامی هستند.", loading: "در حال بارگذاری...", invalidFast: "ارسال فرم بیش از حد سریع بود.", unknown: "نامشخص"
  },
  ar: {
    dir: "rtl", title: "حملة مع إيران - في الجانب الصحيح من التاريخ", subtitle: "يمكن لكل زائر أن يضيف اسمه أو اسمه المستعار مع رسالة قصيرة، ويظهر العدد الكلي للتواقيع وآخر المشاركات والتوزع الجغرافي بشكل مباشر.", institutionKicker: "منصة رسمية متعددة اللغات", institutionTitle: "المنصة العالمية لحملة مع إيران - في الجانب الصحيح من التاريخ", institutionSubtitle: "عرض مباشر لعدد التواقيع، والتوزع حسب الدول، والرسائل القصيرة ضمن قالب رسمي ومتعدد اللغات", institutionChipLanguages: "8 لغات فعالة", institutionChipSignatures: "تواقيع مباشرة وعامة", heroBadge: "حملة عالمية لتوقيع البيان", heroReadBtn: "قراءة البيان", heroSignBtn: "تسجيل التوقيع", feature1Title: "صوت مشترك في وجه العدوان", feature1Text: "بيان موحد للدفاع عن الحقيقة وكرامة الإنسان وحقوق الشعوب", feature2Title: "تضامن مع المظلومين", feature2Text: "تسجيل الاسم والدولة ورسالة قصيرة لإعلان الموقف الأخلاقي ضد الظلم", feature3Title: "رصد حي لأصوات الأحرار", feature3Text: "خريطة الدول وعدد التواقيع والحضور العالمي للحملة بشكل مباشر", heroSideKicker: "حول هذه الحملة", heroSideTitle: "الوقوف مع الحق والعدالة والكرامة الإنسانية", heroSideText: "هذه الحملة مساحة لإعلان التضامن مع الشعب الإيراني ومع أحرار العالم وكل من يقفون بوجه العدوان والظلم والهيمنة. ومن خلال هذا التوقيع نرفع صوتنا دعماً للحق والعدالة والكرامة الإنسانية ونصرةً للمظلومين أمام الرأي العام العالمي.", microPill: "سريع، واضح، متعدد اللغات", microExample: "اسم أو مستعار + دولة + رسالة قصيرة", microExampleNote: "ولحماية جودة البيانات، تبقى الرسائل قصيرة وتُقيَّد التسجيلات المتكررة السريعة.", heroStat1: "اللغات الفعالة", heroStat2: "الدول المسجلة", heroStat3: "إجمالي التواقيع", trust1Title: "واجهة رسمية وشفافة", trust1Text: "مصممة للعرض العام والوضوح البصري", trust2Title: "توقيع باسم أو مستعار", trust2Text: "يمكن للمستخدم اختيار هويته الظاهرة بحرية", trust3Title: "خريطة وإحصاءات مباشرة", trust3Text: "جدول الدول، آخر التواقيع، وتلوين تفاعلي للخريطة", statementTitle: "نص البيان", statementSubtitle: "يقرأ المستخدم النص بلغته المختارة قبل التوقيع.", statementBadge: "نص قابل للتوقيع", formTitle: "تسجيل التوقيع", formSubtitle: "أكمل البيانات التالية لإضافة توقيعك.", displayNameLabel: "الاسم أو الاسم المستعار", countryLabel: "الدولة", messageLabel: "رسالة قصيرة", messageHint: "الحد الأقصى 280 حرفاً", acceptLabel: "لقد قرأت نص البيان وأثبت توقيعي عليه.", submitBtn: "تسجيل التوقيع", resetBtn: "مسح النموذج", formNoticeText: "بعد التسجيل الناجح، يتم تحديث الإحصاءات والقائمة مباشرة.", stat1Label: "إجمالي التواقيع", stat2Label: "الدول الفعالة", stat3Label: "آخر تحديث", mapTitle: "الخريطة العالمية للتواقيع", mapSubtitle: "لون كل دولة يتناسب مع عدد التواقيع فيها.", activeCountryText: "الدولة النشطة:", allCountries: "كل الدول", clearCountryFilter: "عرض الكل", countryTableTitle: "جدول الدول", countryTableSubtitle: "مرتب حسب عدد التواقيع", thCountry: "الدولة", thCount: "العدد", recentTitle: "آخر التواقيع", recentSubtitle: "أحدث التسجيلات مع الرسائل القصيرة", noSignatures: "لا توجد تواقيع حتى الآن.", noMessage: "بلا رسالة", signer: "الموقّع", country: "الدولة", time: "الوقت", count: "العدد", signSuccess: "تم تسجيل توقيعك بنجاح.", signFailed: "تعذر تسجيل التوقيع.", acceptRequired: "يجب تأكيد قراءة البيان أولاً.", fillRequired: "الاسم والدولة مطلوبان.", loading: "جاري التحميل...", invalidFast: "تم إرسال النموذج بسرعة كبيرة.", unknown: "غير معروف"
  },
  en: {dir:"ltr", title:"With Iran Campaign — On the Right Side of History", subtitle:"Each visitor can submit a real name or pseudonym with a short message. The total signatures, latest entries, and country-by-country distribution are displayed live.", institutionKicker:"Official multilingual platform", institutionTitle:"Global Campaign Platform: With Iran — On the Right Side of History", institutionSubtitle:"Live signature counts, country breakdowns, and short public messages in a formal multilingual design", institutionChipLanguages:"8 active languages", institutionChipSignatures:"Live public signatures", heroBadge:"Global statement-signing campaign", heroReadBtn:"Read the statement", heroSignBtn:"Sign now", feature1Title:"A shared voice against aggression", feature1Text:"A common statement for truth, human dignity, and the rights of peoples", feature2Title:"Solidarity with the oppressed", feature2Text:"Record a name, country, and a short message to express a moral stand against injustice", feature3Title:"Live record of global solidarity", feature3Text:"Country map, signature counts, and the global reach of the campaign in real time", heroSideKicker:"About this campaign", heroSideTitle:"Standing with justice, truth, and human dignity", heroSideText:"This campaign is a public space to express solidarity with the people of Iran, with free people everywhere, and with all those who resist aggression, injustice, and domination. By signing, we raise our voices for truth, justice, human dignity, and the defense of the oppressed.", microPill:"Simple, fast, multilingual", microExample:"Name or pseudonym + country + short message", microExampleNote:"To preserve data quality, messages stay short and very rapid duplicate submissions are limited.", heroStat1:"Active languages", heroStat2:"Countries represented", heroStat3:"Total signatures", trust1Title:"Formal and transparent UI", trust1Text:"Built for public visibility, trust, and clarity", trust2Title:"Sign with a name or pseudonym", trust2Text:"Users can freely choose their displayed identity", trust3Title:"Live map and statistics", trust3Text:"Country table, latest signatures, and interactive map coloring", statementTitle:"Statement text", statementSubtitle:"Users read the text in their selected language before signing.", statementBadge:"Signable text", formTitle:"Record your signature", formSubtitle:"Complete the fields below to submit your signature.", displayNameLabel:"Name or pseudonym", countryLabel:"Country", messageLabel:"Short message", messageHint:"Maximum 280 characters", acceptLabel:"I have read the statement and I record my signature.", submitBtn:"Submit signature", resetBtn:"Reset form", formNoticeText:"After a successful submission, stats and lists update automatically.", stat1Label:"Total signatures", stat2Label:"Active countries", stat3Label:"Last update", mapTitle:"World signature map", mapSubtitle:"Each country is colored by its signature count.", activeCountryText:"Active country:", allCountries:"All countries", clearCountryFilter:"Show all", countryTableTitle:"Country table", countryTableSubtitle:"Sorted by signature count", thCountry:"Country", thCount:"Count", recentTitle:"Latest signatures", recentSubtitle:"Newest entries with short messages", noSignatures:"No signatures have been recorded yet.", noMessage:"No message", signer:"Signer", country:"Country", time:"Time", count:"Count", signSuccess:"Your signature was recorded successfully.", signFailed:"The signature could not be recorded.", acceptRequired:"You must confirm that you read the statement.", fillRequired:"Name and country are required.", loading:"Loading...", invalidFast:"The form was submitted too quickly.", unknown:"Unknown"},
  ur: {dir:"rtl", title:"کمپین ایران کے ساتھ — تاریخ کے درست رخ پر", subtitle:"ہر وزیٹر اپنا نام یا فرضی نام اور ایک مختصر پیغام درج کر سکتا ہے۔ کل دستخط، تازہ ترین اندراجات اور ممالک کے لحاظ سے تقسیم براہِ راست دکھائی جاتی ہے۔", institutionKicker:"سرکاری کثیر لسانی پلیٹ فارم", institutionTitle:"عالمی مہم پلیٹ فارم: ایران کے ساتھ — تاریخ کے درست رخ پر", institutionSubtitle:"رسمی اور کثیر لسانی ڈیزائن میں دستخطوں کی تعداد، ممالک کی تفصیل اور مختصر عوامی پیغامات", institutionChipLanguages:"8 فعال زبانیں", institutionChipSignatures:"براہِ راست عوامی دستخط", heroBadge:"عالمی دستخطی مہم", heroReadBtn:"بیان پڑھیں", heroSignBtn:"اب دستخط کریں", feature1Title:"جارحیت کے خلاف مشترک آواز", feature1Text:"حق، انسانی وقار اور اقوام کے حقوق کے دفاع میں مشترک بیان", feature2Title:"مظلوموں کے ساتھ یکجہتی", feature2Text:"ظلم کے خلاف اخلاقی موقف کے اظہار کے لیے نام، ملک اور مختصر پیغام درج کریں", feature3Title:"آزاد انسانوں کی عالمی جھلک", feature3Text:"ملکی نقشہ، دستخطوں کی تعداد اور مہم کی عالمی جھلک براہِ راست", heroSideKicker:"اس مہم کے بارے میں", heroSideTitle:"حق، انصاف اور انسانی وقار کے ساتھ", heroSideText:"یہ مہم ایرانی عوام، دنیا کے آزاد انسانوں اور ان سب لوگوں کے ساتھ اظہارِ یکجہتی کا ایک عوامی پلیٹ فارم ہے جو جارحیت، ناانصافی اور تسلط کے خلاف کھڑے ہیں۔ اس دستخط کے ذریعے ہم حق، انصاف، انسانی وقار اور مظلوموں کی حمایت میں اپنی آواز دنیا تک پہنچاتے ہیں۔", microPill:"سادہ، تیز، کثیر لسانی", microExample:"نام یا فرضی نام + ملک + مختصر پیغام", microExampleNote:"ڈیٹا کے معیار کے لیے پیغامات مختصر رکھے جاتے ہیں اور بہت تیز دہرائے گئے اندراجات محدود کیے جاتے ہیں۔", heroStat1:"فعال زبانیں", heroStat2:"شامل ممالک", heroStat3:"کل دستخط", trust1Title:"رسمی اور شفاف انٹرفیس", trust1Text:"عوامی نمائش، اعتماد اور وضاحت کے لیے تیار", trust2Title:"نام یا فرضی نام سے دستخط", trust2Text:"صارف اپنی ظاہر ہونے والی شناخت خود چن سکتا ہے", trust3Title:"براہِ راست نقشہ اور اعداد", trust3Text:"ممالک کی جدول، تازہ ترین دستخط اور تعاملی نقشہ", statementTitle:"بیان کا متن", statementSubtitle:"صارف دستخط سے پہلے اپنی منتخب زبان میں متن پڑھتا ہے۔", statementBadge:"قابلِ دستخط متن", formTitle:"دستخط درج کریں", formSubtitle:"اپنا دستخط جمع کرنے کے لیے نیچے دی گئی معلومات مکمل کریں۔", displayNameLabel:"نام یا فرضی نام", countryLabel:"ملک", messageLabel:"مختصر پیغام", messageHint:"زیادہ سے زیادہ 280 حروف", acceptLabel:"میں نے بیان پڑھ لیا ہے اور اپنا دستخط درج کر رہا ہوں۔", submitBtn:"دستخط جمع کریں", resetBtn:"فارم صاف کریں", formNoticeText:"کامیاب اندراج کے بعد اعداد اور فہرست خودکار طور پر تازہ ہو جائیں گے۔", stat1Label:"کل دستخط", stat2Label:"فعال ممالک", stat3Label:"آخری تازہ کاری", mapTitle:"عالمی دستخطی نقشہ", mapSubtitle:"ہر ملک کا رنگ دستخطوں کی تعداد کے مطابق ہے۔", activeCountryText:"فعال ملک:", allCountries:"تمام ممالک", clearCountryFilter:"سب دکھائیں", countryTableTitle:"ممالک کی جدول", countryTableSubtitle:"دستخطوں کی تعداد کے لحاظ سے ترتیب", thCountry:"ملک", thCount:"تعداد", recentTitle:"تازہ ترین دستخط", recentSubtitle:"مختصر پیغامات کے ساتھ نئی اندراجات", noSignatures:"ابھی تک کوئی دستخط درج نہیں ہوا۔", noMessage:"بغیر پیغام", signer:"دستخط کنندہ", country:"ملک", time:"وقت", count:"تعداد", signSuccess:"آپ کا دستخط کامیابی سے درج ہو گیا۔", signFailed:"دستخط درج نہیں ہو سکا۔", acceptRequired:"آگے بڑھنے سے پہلے بیان کی تصدیق ضروری ہے۔", fillRequired:"نام اور ملک ضروری ہیں۔", loading:"لوڈ ہو رہا ہے...", invalidFast:"فارم بہت جلدی بھیجا گیا۔", unknown:"نامعلوم"},
  fr: {dir:"ltr", title:"Campagne Avec l’Iran — Du bon côté de l’histoire", subtitle:"Chaque visiteur peut envoyer un nom réel ou un pseudonyme avec un court message. Le total des signatures, les dernières entrées et la répartition par pays sont affichés en direct.", institutionKicker:"Plateforme officielle multilingue", institutionTitle:"Plateforme mondiale de campagne : Avec l’Iran — Du bon côté de l’histoire", institutionSubtitle:"Compteur en direct des signatures, ventilation par pays et courts messages publics dans une présentation formelle multilingue", institutionChipLanguages:"8 langues actives", institutionChipSignatures:"Signatures publiques en direct", heroBadge:"Campagne mondiale de signature", heroReadBtn:"Lire la déclaration", heroSignBtn:"Signer", feature1Title:"Une voix commune contre l’agression", feature1Text:"Une déclaration commune pour la vérité, la dignité humaine et les droits des peuples", feature2Title:"Solidarité with the oppressed", feature2Text:"Nom, pays et bref message pour affirmer une position morale face à l’injustice", feature3Title:"Trace vivante de la solidarité mondiale", feature3Text:"Carte des pays, nombre de signatures et portée mondiale de la campagne en temps réel", heroSideKicker:"À propos de cette campagne", heroSideTitle:"Aux côtés de la justice, de la vérité et de la dignité humaine", heroSideText:"Cette campagne est un espace public de solidarité avec le peuple iranien, avec les femmes et les hommes libres du monde, et avec toutes celles et ceux qui s’opposent à l’agression, à l’injustice et à la domination. En signant, nous faisons entendre notre voix pour la vérité, la justice, la dignité humaine et la défense des opprimés.", microPill:"Simple, rapide, multilingue", microExample:"Nom ou pseudonyme + pays + court message", microExampleNote:"Pour préserver la qualité des données, les messages restent courts et les doublons trop rapides sont limités.", heroStat1:"Langues actives", heroStat2:"Pays représentés", heroStat3:"Total des signatures", trust1Title:"Interface formelle et transparente", trust1Text:"Conçue pour la visibilité publique, la clarté et la confiance", trust2Title:"Signer avec un nom ou un pseudonyme", trust2Text:"L’utilisateur choisit librement son identité affichée", trust3Title:"Carte et statistiques en direct", trust3Text:"Tableau des pays, dernières signatures et carte interactive", statementTitle:"Texte de la déclaration", statementSubtitle:"Les utilisateurs lisent le texte dans la langue choisie avant de signer.", statementBadge:"Texte à signer", formTitle:"Enregistrer votre signature", formSubtitle:"Complétez les champs ci-dessous pour envoyer votre signature.", displayNameLabel:"Nom ou pseudonyme", countryLabel:"Pays", messageLabel:"Court message", messageHint:"Maximum 280 caractères", acceptLabel:"J’ai lu la déclaration et j’enregistre ma signature.", submitBtn:"Envoyer la signature", resetBtn:"Réinitialiser", formNoticeText:"Après un envoi réussi, les statistiques et les listes se mettent à jour automatiquement.", stat1Label:"Total des signatures", stat2Label:"Pays actifs", stat3Label:"Dernière mise à jour", mapTitle:"Carte mondiale des signatures", mapSubtitle:"Chaque pays est coloré selon son nombre de signatures.", activeCountryText:"Pays actif :", allCountries:"Tous les pays", clearCountryFilter:"Tout afficher", countryTableTitle:"Tableau des pays", countryTableSubtitle:"Classé par nombre de signatures", thCountry:"Pays", thCount:"Nombre", recentTitle:"Dernières signatures", recentSubtitle:"Entrées récentes avec courts messages", noSignatures:"Aucune signature n’a encore été enregistrée.", noMessage:"Sans message", signer:"Signataire", country:"Pays", time:"Heure", count:"Nombre", signSuccess:"Votre signature a été enregistrée avec succès.", signFailed:"La signature n’a pas pu être enregistrée.", acceptRequired:"Vous devez confirmer la lecture de la déclaration.", fillRequired:"Le nom et le pays sont obligatoires.", loading:"Chargement...", invalidFast:"Le formulaire a été envoyé trop rapidement.", unknown:"Inconnu"},
  de: {dir:"ltr", title:"Kampagne Mit Iran — Auf der richtigen Seite der Geschichte", subtitle:"Jeder Besucher kann einen echten Namen oder ein Pseudonym mit einer kurzen Nachricht einreichen. Gesamtzahl, letzte Einträge und die Verteilung nach Ländern werden live angezeigt.", institutionKicker:"Offizielle mehrsprachige Plattform", institutionTitle:"Globale Kampagnenplattform: Mit Iran — Auf der richtigen Seite der Geschichte", institutionSubtitle:"Live-Zähler für Unterschriften, Länderübersicht und kurze öffentliche Nachrichten in einem formellen mehrsprachigen Design", institutionChipLanguages:"8 aktive Sprachen", institutionChipSignatures:"Öffentliche Live-Unterschriften", heroBadge:"Globale Unterzeichnungskampagne", heroReadBtn:"Erklärung lesen", heroSignBtn:"Jetzt unterschreiben", feature1Title:"Eine gemeinsame Stimme gegen Aggression", feature1Text:"Eine gemeinsame Erklärung für Wahrheit, Menschenwürde und die Rechte der Völker", feature2Title:"Solidarität mit den Unterdrückten", feature2Text:"Name, Land und kurze Botschaft als moralische Stellungnahme gegen Unrecht", feature3Title:"Lebendiges Bild globaler Solidarität", feature3Text:"Länderkarte, Unterschriftenzahlen und globale Reichweite der Kampagne in Echtzeit", heroSideKicker:"Über diese Kampagne", heroSideTitle:"An der Seite von Gerechtigkeit, Wahrheit und Menschenwürde", heroSideText:"Diese Kampagne ist ein öffentlicher Raum der Solidarität mit dem iranischen Volk, mit freien Menschen weltweit und mit allen, die sich Aggression, Ungerechtigkeit und Herrschaft entgegenstellen. Mit unserer Unterschrift erheben wir unsere Stimme für Wahrheit, Gerechtigkeit, Menschenwürde und die Unterstützung der Unterdrückten.", microPill:"Einfach, schnell, mehrsprachig", microExample:"Name oder Pseudonym + Land + kurze Nachricht", microExampleNote:"Zur Sicherung der Datenqualität bleiben Nachrichten kurz und sehr schnelle Doppeleinreichungen werden begrenzt.", heroStat1:"Aktive Sprachen", heroStat2:"Vertretene Länder", heroStat3:"Gesamtunterschriften", trust1Title:"Formelles und transparentes UI", trust1Text:"Für öffentliche Sichtbarkeit, Klarheit und Vertrauen entwickelt", trust2Title:"Mit Name oder Pseudonym unterschreiben", trust2Text:"Benutzer wählen ihre sichtbare Identität frei", trust3Title:"Live-Karte und Statistiken", trust3Text:"Ländertabelle, neueste Unterschriften und interaktive Kartenfärbung", statementTitle:"Erklärungstext", statementSubtitle:"Nutzer lesen den Text in ihrer ausgewählten Sprache vor der Unterschrift.", statementBadge:"Unterzeichnungsfähiger Text", formTitle:"Unterschrift eintragen", formSubtitle:"Füllen Sie die folgenden Felder aus, um Ihre Unterschrift zu senden.", displayNameLabel:"Name oder Pseudonym", countryLabel:"Land", messageLabel:"Kurze Nachricht", messageHint:"Maximal 280 Zeichen", acceptLabel:"Ich habe die Erklärung gelesen und trage meine Unterschrift ein.", submitBtn:"Unterschrift absenden", resetBtn:"Formular zurücksetzen", formNoticeText:"Nach erfolgreicher Übermittlung werden Statistiken und Listen automatisch aktualisiert.", stat1Label:"Gesamtunterschriften", stat2Label:"Aktive Länder", stat3Label:"Letzte Aktualisierung", mapTitle:"Weltkarte der Unterschriften", mapSubtitle:"Jedes Land wird nach seiner Unterschriftenzahl eingefärbt.", activeCountryText:"Aktives Land:", allCountries:"Alle Länder", clearCountryFilter:"Alle anzeigen", countryTableTitle:"Ländertabelle", countryTableSubtitle:"Nach Anzahl der Unterschriften sortiert", thCountry:"Land", thCount:"Anzahl", recentTitle:"Neueste Unterschriften", recentSubtitle:"Neueste Einträge mit kurzen Nachrichten", noSignatures:"Es wurden noch keine Unterschriften erfasst.", noMessage:"Keine Nachricht", signer:"Unterzeichner", country:"Land", time:"Zeit", count:"Anzahl", signSuccess:"Ihre Unterschrift wurde erfolgreich gespeichert.", signFailed:"Die Unterschrift konnte nicht gespeichert werden.", acceptRequired:"Bitte bestätigen Sie zuerst, dass Sie die Erklärung gelesen haben.", fillRequired:"Name und Land sind erforderlich.", loading:"Wird geladen...", invalidFast:"Das Formular wurde zu schnell abgesendet.", unknown:"Unbekannt"},
  es: {dir:"ltr", title:"Campaña Con Irán — En el lado correcto de la historia", subtitle:"Cada visitante puede enviar un nombre real o seudónimo con un mensaje breve. El total de firmas, las entradas más recientes y la distribución por países se muestran en vivo.", institutionKicker:"Plataforma oficial multilingüe", institutionTitle:"Plataforma global de campaña: Con Irán — En el lado correcto de la historia", institutionSubtitle:"Conteo en vivo de firmas, desglose por países y mensajes públicos breves en un diseño formal y multilingüe", institutionChipLanguages:"8 idiomas activos", institutionChipSignatures:"Firmas públicas en vivo", heroBadge:"Campaña global de firmas", heroReadBtn:"Leer la declaración", heroSignBtn:"Firmar ahora", feature1Title:"Una voz compartida contra la agresión", feature1Text:"Una declaración común por la verdad, la dignidad humana y los derechos de los pueblos", feature2Title:"Solidaridad con los oprimidos", feature2Text:"Nombre, país y breve mensaje para expresar una postura moral contra la injusticia", feature3Title:"Registro vivo de la solidaridad global", feature3Text:"Mapa de países, número de firmas y alcance global de la campaña en tiempo real", heroSideKicker:"Sobre esta campaña", heroSideTitle:"Junto a la justicia, la verdad y la dignidad humana", heroSideText:"Esta campaña es un espacio público de solidaridad con el pueblo de Irán, con las personas libres del mundo y con todos quienes se oponen a la agresión, la injusticia y la dominación. Al firmar, hacemos oír nuestra voz en favor de la verdad, la justicia, la dignidad humana y la defensa de los oprimidos.", microPill:"Simple, rápido, multilingüe", microExample:"Nombre o seudónimo + país + mensaje breve", microExampleNote:"Para preservar la calidad de los datos, los mensajes se mantienen breves y se limitan los envíos duplicados demasiado rápidos.", heroStat1:"Idiomas activos", heroStat2:"Países representados", heroStat3:"Total de firmas", trust1Title:"Interfaz formal y transparente", trust1Text:"Diseñada para visibilidad pública, claridad y confianza", trust2Title:"Firmar con nombre o seudónimo", trust2Text:"Los usuarios pueden elegir libremente su identidad visible", trust3Title:"Mapa y estadísticas en vivo", trust3Text:"Tabla de países, últimas firmas y coloreado interactivo del mapa", statementTitle:"Texto de la declaración", statementSubtitle:"Los usuarios leen el texto en el idioma elegido antes de firmar.", statementBadge:"Texto firmable", formTitle:"Registrar su firma", formSubtitle:"Complete los siguientes campos para enviar su firma.", displayNameLabel:"Nombre o seudónimo", countryLabel:"País", messageLabel:"Mensaje breve", messageHint:"Máximo 280 caracteres", acceptLabel:"He leído la declaración y registro mi firma.", submitBtn:"Enviar firma", resetBtn:"Restablecer", formNoticeText:"Después de un envío correcto, las estadísticas y listas se actualizan automáticamente.", stat1Label:"Total de firmas", stat2Label:"Países activos", stat3Label:"Última actualización", mapTitle:"Mapa mundial de firmas", mapSubtitle:"Cada país se colorea según su número de firmas.", activeCountryText:"País activo:", allCountries:"Todos los países", clearCountryFilter:"Mostrar todo", countryTableTitle:"Tabla de países", countryTableSubtitle:"Ordenada por número de firmas", thCountry:"País", thCount:"Cantidad", recentTitle:"Últimas firmas", recentSubtitle:"Entradas recientes con mensajes breves", noSignatures:"Aún no se ha registrado ninguna firma.", noMessage:"Sin mensaje", signer:"Firmante", country:"País", time:"Hora", count:"Cantidad", signSuccess:"Su firma se registró correctamente.", signFailed:"No se pudo registrar la firma.", acceptRequired:"Debe confirmar que leyó la declaración.", fillRequired:"El nombre y el país son obligatorios.", loading:"Cargando...", invalidFast:"El formulario se envió demasiado rápido.", unknown:"Desconocido"},
  tr: {dir:"ltr", title:"İran’la Birlikte Kampanyası — Tarihin Doğru Tarafında", subtitle:"Her ziyaretçi gerçek adını ya da takma adını kısa bir mesajla birlikte gönderebilir. Toplam imza sayısı, son kayıtlar ve ülkelere göre dağılım canlı olarak gösterilir.", institutionKicker:"Resmî çok dilli platform", institutionTitle:"Küresel Kampanya Platformu: İran’la Birlikte — Tarihin Doğru Tarafında", institutionSubtitle:"Canlı imza sayacı, ülke dağılımı ve kısa kamu mesajları için resmî çok dilli tasarım", institutionChipLanguages:"8 aktif dil", institutionChipSignatures:"Canlı kamusal imzalar", heroBadge:"Küresel imza kampanyası", heroReadBtn:"Bildiriyi oku", heroSignBtn:"İmza ver", feature1Title:"Saldırganlığa karşı ortak ses", feature1Text:"Hakikat, insan onuru ve halkların hakları برای ortak bildiri", feature2Title:"Mazlumlarla dayanışma", feature2Text:"Zulme karşı ahlaki bir duruş için isim, ülke ve kısa mesaj girin", feature3Title:"Küresel dayanışmanın canlı görünümü", feature3Text:"Ülke haritası, imza sayıları ve kampanyanın küresel etkisi gerçek zamanlı", heroSideKicker:"Bu kampanya hakkında", heroSideTitle:"Hak, adalet ve insan onurunun yanında", heroSideText:"Bu kampanya, İran halkıyla, dünyanın özgür insanlarıyla ve saldırıya, adaletsizliğe ve tahakküme karşı duran herkesle dayanışmayı duyurmak için oluşturulmuş kamusal bir alandır. Bu imzayla hakikat, adalet, insan onuru ve mazlumların savunusu için sesimizi yükseltiyoruz.", microPill:"Basit, hızlı, çok dilli", microExample:"İsim veya takma ad + ülke + kısa mesaj", microExampleNote:"Veri kalitesini korumak için mesajlar kısa tutulur ve çok hızlı yinelenen gönderimler sınırlandırılır.", heroStat1:"Aktif diller", heroStat2:"Temsil edilen ülkeler", heroStat3:"Toplam imzalar", trust1Title:"Resmî ve şeffaf arayüz", trust1Text:"Kamusal görünürlük, açıklık ve güven için tasarlandı", trust2Title:"İsim ya da takma adla imzala", trust2Text:"Kullanıcılar görünen kimliğini özgürce seçebilir", trust3Title:"Canlı harita ve istatistikler", trust3Text:"Ülke tablosu, son imzalar ve etkileşimli harita renklendirmesi", statementTitle:"Bildiri metni", statementSubtitle:"Kullanıcılar imzadan önce metni seçtikleri dilde okur.", statementBadge:"İmzalanabilir metin", formTitle:"İmzanızı kaydedin", formSubtitle:"İmzanızı göndermek için aşağıdaki alanları doldurun.", displayNameLabel:"İsim veya takma ad", countryLabel:"Ülke", messageLabel:"Kıسا mesaj", messageHint:"En fazla 280 karakter", acceptLabel:"Bildiriyi okudum ve imzamı kaydediyorum.", submitBtn:"İmzayı gönder", resetBtn:"Formu sıfırla", formNoticeText:"Başarılı gönderimden sonra istatistikler ve listeler otomatik olarak güncellenir.", stat1Label:"Toplam imzalar", stat2Label:"Aktif ülkeler", stat3Label:"Son güncelleme", mapTitle:"Dünya imza haritası", mapSubtitle:"Her ülke imza sayısına göre renklendirilir.", activeCountryText:"Etkin ülke:", allCountries:"Tüm ülkeler", clearCountryFilter:"Hepsini göster", countryTableTitle:"Ülke tablosu", countryTableSubtitle:"İmza sayısına göre sıralı", thCountry:"Ülke", thCount:"Sayı", recentTitle:"Son imzalar", recentSubtitle:"Kıسا mesajlı yeni kayıtlar", noSignatures:"Henüz hiç imza kaydedilmedi.", noMessage:"Mesaj yok", signer:"İmzalayan", country:"Ülke", time:"Zaman", count:"Sayı", signSuccess:"İmzanız başarıyla kaydedildi.", signFailed:"İmza kaydedilemedi.", acceptRequired:"Önce bildiriyi okuduğunuzu onaylamalısınız.", fillRequired:"İsim ve ülke gereklidir.", loading:"Yükleniyor...", invalidFast:"Form çok hızlı gönderildi.", unknown:"Bilinmiyor"}
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
  const res = await fetch(apiUrl(url), options);
  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();
  let data = null;
  if (raw) {
    if (contentType.includes('application/json')) {
      try { data = JSON.parse(raw); } catch {}
    } else {
      try { data = JSON.parse(raw); } catch {}
    }
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || (raw && !raw.startsWith('<') ? raw : `HTTP ${res.status}`);
    throw new Error(msg);
  }
  if (data === null) {
    throw new Error('پاسخ سرور JSON معتبر نبود. آدرس API را بررسی کنید.');
  }
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