import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";



const AVAILABLE_CASES = [
  {
    id: "case_hotel_01",
    title: "غرفة 1408",
    subtitle: "فندق الامير الكبير",
    description: "رجل اعمال وجد ميتا في جناح البنتهاوس. التقرير الاول قال سكتة قلبية — المختبر قال غير ذلك.",
    difficulty: "متوسط",
    difficultyColor: "#f59e0b",
    evidenceCount: 8,
    suspectCount: 6,
    status: "active",
    tag: "قتل",
    tagColor: "#dc2626",
  },
  {
    id: "case_grand_nile_01",
    title: "ليلة في النيل الكبير",
    subtitle: "فندق النيل الكبير",
    description: "كمال سليم بهجت وجد ميتا. والضحية نفسها لها اسرار مظلمة تنكشف مع التحقيق.",
    difficulty: "صعب",
    difficultyColor: "#dc2626",
    evidenceCount: 10,
    suspectCount: 6,
    status: "active",
    tag: "قتل + فساد",
    tagColor: "#7c3aed",
  },
];

const POLICE_REPORT_hotel_01 = {
  caseNumber: "2026/JC-0891",
  date: "22 أغسطس 2026",
  time: "04:30 فجراً",
  officer: "النقيب وليد سامي — قسم شرطة النيل",
  location: "فندق الأمير الكبير — الطابق الرابع عشر",
 
  incident: `في الساعة الثالثة وأربع عشرة دقيقة من فجر يوم السبت الموافق 22/8/2026، تلقى القسم بلاغاً من إدارة فندق الأمير الكبير بسقوط جثة من الطابق الرابع عشر.
 
عند وصول قوة الشرطة بصحبة سيارة الإسعاف، عُثر على جثة رجل في منطقة المدخل الجانبي الشمالي للفندق. تبيّن لاحقاً أن المتوفى هو السيد رمزي حسين عوض، مواليد 1972، رئيس مجلس إدارة مجموعة عوض القابضة.
 
مُعاينة جناح البنتهاوس (الطابق 14) أظهرت أن باب الجناح كان مفتوحاً. لا آثار لكسر أو اقتحام. لا آثار نزاع واضحة. زجاجة نبيذ شبه فارغة على الطاولة الجانبية.
 
أفادت الطبيبة د. لمياء الشريف — طبيبة الشركة الخاصة — التي وصلت قبل فريق الإسعاف بأن الوفاة تبدو طبيعية نتيجة نوبة قلبية مفاجئة. صدر تقرير أولي بهذا الشأن.
 
غير أن الفحص الأولي لاحقاً من قِبل الطب الشرعي أشار إلى وجود تناقضات تستدعي التحقيق.`,
 
  witnesses: [
    {
      id: "w01",
      name: "أنطوان خوري",
      role: "مدير الفندق",
      age: 52,
      nationality: "لبناني",
      statement: `أدلى مدير الفندق بالأقوال الآتية:
 
"السيد رمزي نزيل دائم عندنا منذ سنوات. وصل مساء أمس الساعة السابعة تقريباً وطلب جناح البنتهاوس كالعادة. بدا عليه التعب لكنه كان بمزاج جيد.
 
طلب في وقت لاحق زجاجة نبيذ من نوع محدد عبر الروم سيرفس. هذا طلب معتاد منه.
 
لم أره بعد ذلك شخصياً. حين وصلني الخبر من موظف الاستقبال اتصلت فوراً بالطوارئ وبطبيبة الشركة كما هو البروتوكول."
 
ملاحظة المحقق: لم يذكر خوري أي تفاصيل عن الإيميل المجهول الذي طلب الزجاجة، ولم يُشر إلى أي شيء غير اعتيادي في النبيذ.`,
      credibility: "يبدو متعاوناً — إجاباته مقتضبة بشكل لافت",
    },
    {
      id: "w02",
      name: "يوسف منصور",
      role: "كونسيرج الفندق",
      age: 44,
      nationality: "مصري",
      statement: `أدلى الكونسيرج بالأقوال الآتية:
 
"أنا رأيت السيد رمزي آخر مرة الساعة العاشرة مساءً تقريباً في اللوبي. بدا مشغول الذهن. قال لي إنه لا يريد أن يُزعج ويريد الراحة. هذا كلامه العادي لما يكون عنده شغل كتير.
 
لم أرَ أي شخص غريب في الفندق طوال الليل. كان الليل هادئاً بشكل عام."
 
ملاحظة المحقق: لم يذكر يوسف ما همسه له رمزي عند الانصراف. لم يذكر الرجل الغريب الذي رآه لاحقاً عند السلم الخلفي.`,
      credibility: "أقواله صحيحة لكنها تفتقر لتفاصيل جوهرية",
    },
    {
      id: "w03",
      name: "نادر فتحي",
      role: "موظف أمن — الوردية الليلية",
      age: 35,
      nationality: "مصري",
      statement: `أدلى موظف الأمن بالأقوال الآتية:
 
"كنت في غرفة المراقبة طوال الليل. لاحظت في حدود الساعة الحادية عشرة أن كاميرات بعض الطوابق توقفت فجأة. حاولت إعادة تشغيلها لكن لم أنجح. اعتقدت أنه عطل تقني.
 
سمعت صوتاً غير اعتيادي من الأعلى في حدود منتصف الليل. لم أستطع تحديد مصدره بدقة. لم أتحرك للتحقق لأنني لم أكن متأكداً.
 
لم أشاهد أي شخص غريب يدخل الفندق."
 
ملاحظة المحقق: نادر لم يذكر الشخص الذي رآه يدخل من السلم الخلفي. لم يذكر أنه أبلغ المديرة التنفيذية. تضاربت أقواله مع ما صرّح به لاحقاً في التحقيق.`,
      credibility: "أقواله تحتوي على إغفال متعمد لمعلومات جوهرية",
    },
    {
      id: "w04",
      name: "نادين سرحان",
      role: "المديرة التنفيذية — مجموعة عوض القابضة",
      age: 44,
      nationality: "مصرية",
      statement: `أدلت المديرة التنفيذية بالأقوال الآتية:
 
"أنا نزيلة في الفندق هذه الليلة بسبب اجتماع عمل. كنت في اجتماع فيديو مع شركاء من دبي من الساعة التاسعة مساءً حتى بعد منتصف الليل بقليل. ثم نمت.
 
علاقتي بالسيد رمزي مهنية بالكامل. كنا نتعاون منذ سنوات طويلة. خبر وفاته صدمني.
 
لا أعلم بأي سبب يجعل أحداً يريد إيذاءه."
 
ملاحظة المحقق: نادين لم تذكر خلافها مع رمزي بشأن صفقة الأسهم. لم تذكر أنها تلقت اتصالاً من نادر موظف الأمن. الـ alibi قيد التحقق.`,
      credibility: "متماسكة جداً — تركز على ما يُثبت وجودها وتتجنب ما يُشكّك",
    },
    {
      id: "w05",
      name: "ريم حسن",
      role: "موظفة سابقة — خدمة الغرف",
      age: 31,
      nationality: "مصرية",
      statement: `أدلت بالأقوال الآتية:
 
"أنا جئت اليوم فقط لاسترداد بعض أغراضي الشخصية من غرفة الموظفين. لم يكن لي أي علاقة بالسيد رمزي منذ أن أنهى عقدي منذ ثلاثة أشهر.
 
لم أكن في منطقة الجناح على الإطلاق.
 
أفهم أن وضعي يجعلني مشتبهاً بها لكن ليس لديّ أي صلة بما حدث."
 
ملاحظة المحقق: لم تذكر ريم ما تعرفه من معلومات عن الحسابات البنكية. لم تذكر الـ USB. أقوالها صحيحة في جوهرها لكنها حذفت كل شيء يتعلق بدوافعها.`,
      credibility: "صادقة في النفي — لكن ما لم تقله أهم مما قالته",
    },
    {
      id: "w06",
      name: "د. لمياء الشريف",
      role: "طبيبة الشركة الخاصة",
      age: 47,
      nationality: "مصرية",
      statement: `أدلت الطبيبة بالأقوال الآتية:
 
"اتصلت بي السيدة نوال بهجت — زوجة المتوفى — في الساعة الثانية وأربعين دقيقة فجراً. أخبرتني أن زوجها لا يستجيب. توجهت فوراً.
 
عند وصولي فحصت الجثة. كل المؤشرات أمامي أشارت إلى توقف مفاجئ في القلب. السيد رمزي كان يعاني من ضغط دم مرتفع. كتبت التقرير الأولي بناءً على ما رأيت.
 
أنا أقف خلف تقييمي الطبي الأولي."
 
ملاحظة المحقق: الطبيبة لم تذكر أنها وصلت قبل سيارة الإسعاف. لم تذكر أن فحصها استغرق أقل من عشرين دقيقة. تمسّكها بتقريرها رغم نتائج الطب الشرعي يستدعي تدقيقاً.`,
      credibility: "دفاعية — تحمي تقريرها الأولي أكثر من اللازم",
    },
  ],
 
  conclusion: `بناءً على المعطيات الأولية وأقوال الشهود، وفي انتظار نتائج الطب الشرعي الكاملة، تُصنَّف القضية حالياً كـ"وفاة مشتبه بها تستدعي تحقيقاً موسعاً".
 
يُلاحَظ تضارب في بعض الأقوال وإغفال لتفاصيل جوهرية من قِبل عدد من الشهود.
 
القضية محالة إلى وحدة التحقيق الجنائي.
 
النقيب وليد سامي
قسم شرطة النيل — 22/8/2026`,
};
 
// ── تقرير الطب الشرعي الأولي ─────────────────────────────────
const FORENSIC_INITIAL_hotel_01 = {
  reportNumber: "FSR-2026-0441",
  date: "22 أغسطس 2026",
  time: "09:15 صباحاً",
  examiner: "د. طارق عبد الحميد — قسم الطب الشرعي",
  deceasedName: "رمزي حسين عوض",
  deceasedAge: 54,
  examinationLocation: "مشرحة مستشفى القاهرة الكبرى",
 
  externalExamination: `الجثة لرجل في الخمسينات من عمره، بنية جسدية متوسطة، لا آثار إصابات خارجية واضحة تشير إلى اعتداء بالقوة.
 
يُلاحَظ:
— احمرار خفيف في منطقة الرقبة يستدعي فحصاً دقيقاً
— لا كسور ظاهرة رغم الادعاء بالسقوط من ارتفاع شاهق
— حالة الملابس منتظمة بشكل لافت لمن سقط من الطابق الرابع عشر`,
 
  internalExamination: `نتائج التشريح:
 
القلب: لا آثار نوبة قلبية حادة. عضلة القلب في حالة جيدة نسبياً لعمر الضحية.
 
الرئتان: وجود سوائل serosanguineous غير متسق مع نوبة قلبية طبيعية. هذا المؤشر يستدعي تحليلاً مخبرياً دقيقاً.
 
منطقة الرقبة: عند الفحص الدقيق تحت الأنسجة — أثر ضغط رفيع على محيط الرقبة لا يتجاوز 2 ملم عرضاً. هذا الأثر غير مرئي بالعين المجردة ولا يُترك إلا بأداة متخصصة.`,
 
  toxicology: `نتائج التحليل الكيميائي — أولية:
 
الدم: رُصد وجود مادة Midazolam بتركيز يُشير إلى تعرّض الضحية لجرعة خارجية — لا يُنتج الجسم هذه المادة طبيعياً.
 
ملاحظة: Midazolam مهدئ سريع الأثر. الجرعة المرصودة كافية لإحداث تخدير جزئي خلال 15-20 دقيقة دون إيقاف القلب مباشرة.
 
تحليلات إضافية جارية للكشف عن مواد أخرى.`,
 
  cause_of_death: `السبب المبدئي للوفاة:
خنق ميكانيكي بأداة رفيعة بعد تخدير مسبق بمادة Midazolam.
الوفاة ليست طبيعية — وليست نتيجة سقوط.
المشهد رُتِّب لإيهام المحقق الأول بالسقوط.
 
درجة اليقين: 87% — في انتظار نتائج التحليل الكاملة.`,
 
  time_of_death: "يُقدَّر وقت الوفاة بين الساعة 11:15 م و12:00 ص",
 
  notes: `ملاحظات إضافية:
— الجثة نُقلت من موقع الوفاة الفعلي إلى موقع الاكتشاف
— الدليل على ذلك: انعدام الإصابات المتوقعة من السقوط
— الجاني على دراية بالطب أو استعان بشخص ذي خلفية طبية
— أثر الخيط يشير لتنفيذ من الخلف والضحية كانت شبه فاقدة الوعي`,
};

// ============================================================
// CASE IMAGES
// ============================================================
const CASE_IMAGES = {
  locations_dark: {
    hotel_entrance:   "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
    hotel_lobby:      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    hotel_corridor:   "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=1200&q=80",
    penthouse:        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
    hotel_office:     "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    security_room:    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    hotel_staff_room: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=1200&q=80",
    hotel_restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
    lab:              "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80",
    police_station:   "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1200&q=80",
  },
  locations_lit: {
    hotel_entrance:   "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
    hotel_lobby:      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
    hotel_corridor:   "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
    penthouse:        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
    hotel_office:     "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
    security_room:    "https://images.unsplash.com/photo-1587302986-7eb89793cd3a?w=1200&q=80",
    hotel_staff_room: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
    hotel_restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    lab:              "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&q=80",
    police_station:   "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",
  },
  evidence: {
    ev_h01: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    ev_h02: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80",
    ev_h03: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    ev_h04: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80",
    ev_h05: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80",
    ev_h06: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80",
    ev_h07: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    ev_h08: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
  },
};

// ============================================================
// 1. AUDIO ENGINE
// ============================================================
function useAudioEngine() {
  const ctx = useRef(null);
  const listener = useRef(null);
  const ambientSources = useRef([]);

  const init = useCallback(() => {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      listener.current = ctx.current.listener;
    }
  }, []);

  const updateListenerPosition = useCallback((x, y, z) => {
    if (!listener.current) return;
    listener.current.positionX.value = x;
    listener.current.positionY.value = y;
    listener.current.positionZ.value = z;
  }, []);

  const playSound3D = useCallback((freq, duration = 0.5, type = "sine", volume = 0.35, posX = 0, posY = 0, posZ = 0) => {
    if (!ctx.current) return;
    try {
      const osc = ctx.current.createOscillator();
      const gain = ctx.current.createGain();
      const panner = ctx.current.createPanner();
      panner.panningModel = "HRTF";
      panner.distanceModel = "inverse";
      panner.refDistance = 1;
      panner.maxDistance = 50;
      panner.rolloffFactor = 1;
      panner.positionX.value = posX;
      panner.positionY.value = posY;
      panner.positionZ.value = posZ;
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, ctx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.current.currentTime + duration);
      osc.connect(panner);
      panner.connect(gain);
      gain.connect(ctx.current.destination);
      osc.start();
      osc.stop(ctx.current.currentTime + duration);
    } catch (e) {}
  }, []);

  const playAmbientSound3D = useCallback((type, volume = 0.05, posX = 0, posY = 0, posZ = 0) => {
    if (!ctx.current) return null;
    const sounds = {
      outside: { freq: 80, type: "sawtooth", delay: 2000 },
      morgue_drip: { freq: 1000, type: "sine", delay: 1500 },
      morgue_hum: { freq: 50, type: "sawtooth", delay: 100 },
      police_chatter: { freq: 300, type: "triangle", delay: 500 },
      lab: { freq: 400, type: "sine", delay: 800 },
    };
    const config = sounds[type] || sounds.morgue_hum;
    const interval = setInterval(() => {
      playSound3D(
        config.freq + Math.random() * 30,
        0.15 + Math.random() * 0.2,
        config.type,
        volume * (0.3 + Math.random() * 0.7),
        posX + (Math.random() - 0.5) * 2,
        posY + (Math.random() - 0.5) * 2,
        posZ + (Math.random() - 0.5) * 2
      );
    }, config.delay);
    ambientSources.current.push(interval);
    return interval;
  }, [playSound3D]);

  const stopAmbientSounds = useCallback(() => {
    ambientSources.current.forEach(interval => clearInterval(interval));
    ambientSources.current = [];
  }, []);

  const playFootsteps = useCallback(() => {
    [0, 380, 760].forEach(d =>
      setTimeout(() => playSound3D(75 + Math.random() * 30, 0.18, "triangle", 0.25, 0, 0, 0), d)
    );
  }, [playSound3D]);

  const playClick = useCallback(() => playSound3D(900, 0.07, "square", 0.12, 0, 0, 0), [playSound3D]);
  const playWarning = useCallback(() => {
    playSound3D(200, 0.3, "square", 0.15, 0, 0, 0);
    setTimeout(() => playSound3D(150, 0.4, "square", 0.1, 0, 0, 0), 200);
    setTimeout(() => playSound3D(100, 0.5, "square", 0.08, 0, 0, 0), 500);
  }, [playSound3D]);
  const playMenuMusic = useCallback(() => {}, []);
  const stopMenuMusic = useCallback(() => {}, []);

  return {
    init, updateListenerPosition, playSound3D,
    playAmbientSound: playAmbientSound3D,
    stopAmbientSounds, playFootsteps, playClick,
    playWarning, playMenuMusic, stopMenuMusic,
  };
}

// ============================================================
// 2. POINTER
// ============================================================
const PANORAMIC = { SCENE_OFFSET: 250, FLASHLIGHT_RANGE: 40 };

function usePointer(lightMode, isMobile) {
  const targetRef = useRef({ x: 50, y: 50 });
  const flashRef = useRef({ x: 50, y: 50 });
  const frameRef = useRef(null);
  const isLightOn = lightMode !== "off";
  const [flashPos, setFlashPos] = useState({ x: 50, y: 50 });
  const [camOff, setCamOff] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);

  useEffect(() => {
    const onOrient = (e) => {
      if (!isMobile) return;
      const gamma = Math.max(-90, Math.min(90, e.gamma || 0));
      const beta = Math.max(-90, Math.min(90, e.beta || 0));
      setCamOff({ x: (gamma / 90) * PANORAMIC.SCENE_OFFSET, y: (beta / 90) * 30 });
      targetRef.current = {
        x: Math.max(10, Math.min(90, 50 + (gamma / 90) * PANORAMIC.FLASHLIGHT_RANGE)),
        y: Math.max(20, Math.min(80, 50 + (beta / 90) * 20)),
      };
      const clampedZoom = Math.max(0.7, Math.min(1.8, 1.0 + (-beta / 90) * 0.5));
      setZoom(prev => prev + (clampedZoom - prev) * 0.08);
    };
    if (isMobile && typeof DeviceOrientationEvent !== "undefined" && !DeviceOrientationEvent.requestPermission) {
      window.addEventListener("deviceorientation", onOrient);
    }
    const animate = () => {
      const lag = 0.92;
      flashRef.current.x += (targetRef.current.x - flashRef.current.x) * lag;
      flashRef.current.y += (targetRef.current.y - flashRef.current.y) * lag;
      if (isLightOn) setFlashPos({ ...flashRef.current });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      cancelAnimationFrame(frameRef.current);
    };
  }, [isLightOn, isMobile]);

  const handleMouseMove = useCallback((e) => {
    if (isMobile) return;
    const r = e.currentTarget.getBoundingClientRect();
    targetRef.current = {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  }, [isMobile]);

  const requestIOS = useCallback(async () => {
    if (isMobile && DeviceOrientationEvent?.requestPermission) {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === "granted") window.addEventListener("deviceorientation", () => {});
    }
  }, [isMobile]);

  return { flashPos, camOff, zoom, handleMouseMove, requestIOS };
}

// ── Flashlight Overlay ────────────────────────────────────────
function FlashlightOverlay({ mode, pos, power, lightOn }) {
  // لو النور في الغرفة شغال — مفيش overlay خالص
  if (lightOn) return null;
 
  // لو الكشاف مطفي — شاشة سوداء كاملة
  if (mode === "off") {
    return (
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "black" }}
      />
    );
  }
 
  const sizes = [10, 15, 20, 26];
  const r = sizes[power - 1] || 15;
 
  // UV
  if (mode === "uv") {
    return (
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle ${r}vw at ${pos.x}% ${pos.y}%,
            rgba(138,43,226,0.85) 0%,
            rgba(100,20,200,0.5) 40%,
            rgba(0,0,0,1) 100%)`,
        }}
      />
    );
  }
 
  // flashlight
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background: `radial-gradient(circle ${r}vw at ${pos.x}% ${pos.y}%,
          rgba(255,255,220,0.08) 0%,
          transparent 60%,
          rgba(0,0,0,1) 100%)`,
      }}
    />
  );
}

// ============================================================
// 3. EVIDENCE MODAL
// ============================================================
function EvidenceModal({ evidence, onClose }) {
  if (!evidence) return null;
  const photo = CASE_IMAGES.evidence[evidence.id] || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80";
  return (
    <>
      <style>{`
        @keyframes evIn { from{opacity:0;transform:scale(0.92) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .ev-modal{animation:evIn 0.25s ease}
        .ev-tag{background:rgba(139,0,0,0.85);border:1px solid rgba(220,50,50,0.4);font-family:"Courier New",monospace;font-size:9px;padding:2px 8px;border-radius:2px;color:#fca5a5;letter-spacing:0.1em}
      `}</style>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4"
        style={{background:"rgba(0,0,0,0.9)",backdropFilter:"blur(6px)"}}
        onClick={onClose} dir="rtl">
        <div className="ev-modal bg-gray-950 rounded-sm w-full max-w-sm overflow-hidden"
          style={{border:"1px solid rgba(201,169,110,0.2)",boxShadow:"0 0 0 1px rgba(139,0,0,0.2),0 24px 60px rgba(0,0,0,0.9)"}}
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-amber-900/20" style={{background:"rgba(10,8,4,0.9)"}}>
            <div className="flex items-center gap-2">
              <span className="ev-tag">{evidence.type === "physical" ? "PHYSICAL" : "DIGITAL"}</span>
              <span className="text-[9px] text-amber-900/40 font-mono">{evidence.id?.toUpperCase()}</span>
            </div>
            <button onClick={onClose} className="text-amber-900/50 hover:text-white text-sm w-6 h-6 flex items-center justify-center">x</button>
          </div>
          <div className="relative mx-4 mt-4" style={{border:"2px solid rgba(201,169,110,0.25)",borderRadius:4,overflow:"hidden"}}>
            <img src={photo} alt={evidence.name} className="w-full object-cover" style={{height:180}}
              onError={e => { e.target.src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80"; }} />
            <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.7) 100%)"}} />
            <div className="absolute bottom-2 right-2"><span className="ev-tag">دليل #{evidence.id?.slice(-2)}</span></div>
          </div>
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-sm font-black" style={{color:"#c9a96e"}}>{evidence.name}</h3>
            <p className="text-[9px] text-amber-900/40 font-mono mt-0.5">
              {evidence.location?.replace(/_/g," ")} - {evidence.tool === "uv" ? "UV" : "Flashlight"}
            </p>
          </div>
          <div className="mx-4 mb-4 mt-2 p-3 rounded text-[10px] leading-relaxed whitespace-pre-wrap"
            style={{background:"rgba(0,0,0,0.5)",border:"1px solid rgba(201,169,110,0.1)",color:"rgba(201,169,110,0.75)",fontFamily:"serif"}}>
            {evidence.content}
          </div>
          {evidence.analyzed && evidence.analysisResult && (
            <div className="mx-4 mb-4 p-3 rounded"
              style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)"}}>
              <p className="text-[9px] text-green-400 font-bold mb-1">تقرير الطب الشرعي</p>
              <p className="text-[9px] text-green-300/70 leading-relaxed">{evidence.analysisResult.conclusion}</p>
            </div>
          )}
          <div className="px-4 pb-4">
            <button onClick={onClose} className="w-full py-2 rounded-sm text-xs font-bold"
              style={{background:"rgba(139,0,0,0.4)",border:"1px solid rgba(220,50,50,0.3)",color:"#fca5a5"}}>
              اغلاق
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// 4. NPC DIALOG
// ============================================================
function NPCDialog({ npc, onClose, socket, roomId, playerId }) {
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentNpcId, setCurrentNpcId] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const messagesEndRef = useRef(null);
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
 
  const showOptions = useCallback((opts) => {
    setOptionsVisible(false);
    setTimeout(() => {
      setOptions(opts);
      setOptionsVisible(true);
    }, 600); // تأخير ظهور الخيارات بعد الرد
  }, []);
 
  useEffect(() => {
    if (!npc) return;
    setCurrentNpcId(npc.id);
    setMessages([]);
    setOptions([]);
    setOptionsVisible(false);
    setIsTyping(true);
 
    if (socket) {
      socket.emit("horror_start_npc_dialogue", { roomId, playerId, npcId: npc.id });
    } else {
      setTimeout(() => {
        const intro = npc.dialogues?.find(d => d.id === "intro");
        if (intro) {
          setIsTyping(false);
          setMessages([{ text: intro.text, sender: "npc", id: Date.now() }]);
          showOptions(intro.options || []);
        }
      }, 1000);
    }
  }, [npc]);
 
  useEffect(() => {
    if (!socket) return;
    const onStarted = (data) => {
      if (data.npcId !== currentNpcId) return;
      setIsTyping(false);
      setMessages([{ text: data.dialogue.text, sender: "npc", id: Date.now() }]);
      showOptions(data.dialogue.options || []);
    };
    const onContinued = (data) => {
      if (data.npcId !== currentNpcId) return;
      setIsTyping(false);
      setMessages(prev => [...prev, { text: data.dialogue.text, sender: "npc", id: Date.now() }]);
      showOptions(data.dialogue.options || []);
    };
    const onEnded = (data) => {
      if (data.npcId !== currentNpcId) return;
      setIsTyping(false);
      setOptions([]);
      setOptionsVisible(false);
      setTimeout(onClose, 800);
    };
    socket.on("horror_npc_dialogue_started", onStarted);
    socket.on("horror_npc_dialogue_continued", onContinued);
    socket.on("horror_npc_dialogue_ended", onEnded);
    return () => {
      socket.off("horror_npc_dialogue_started", onStarted);
      socket.off("horror_npc_dialogue_continued", onContinued);
      socket.off("horror_npc_dialogue_ended", onEnded);
    };
  }, [socket, currentNpcId, onClose, showOptions]);
 
  const handleOption = (opt) => {
    if (!opt.next) return;
    // أضف رسالة اللاعب
    setMessages(prev => [...prev, { text: opt.text, sender: "player", id: Date.now() }]);
    setOptions([]);
    setOptionsVisible(false);
    // typing indicator
    setTimeout(() => setIsTyping(true), 300);
 
    if (socket) {
      socket.emit("horror_npc_choose_option", { roomId, playerId, npcId: currentNpcId, optionId: opt.next });
    } else {
      // تأخير الرد 1-2 ثانية
      const delay = 1000 + Math.random() * 1000;
      setTimeout(() => {
        const next = npc.dialogues?.find(d => d.id === opt.next);
        if (next) {
          setIsTyping(false);
          setMessages(prev => [...prev, { text: next.text, sender: "npc", id: Date.now() }]);
          if (!next.options || next.options.length === 0) setTimeout(onClose, 1500);
          else showOptions(next.options);
        } else {
          setIsTyping(false);
          setTimeout(onClose, 500);
        }
      }, delay);
    }
  };
 
  return (
    <>
      <style>{`
        @keyframes msgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes optIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .msg-b{animation:msgIn 0.3s ease}
        .opt-b{animation:optIn 0.25s ease both}
        .typing-d{width:6px;height:6px;border-radius:50%;background:rgba(201,169,110,0.6);animation:tp 1.2s ease infinite}
        .typing-d:nth-child(2){animation-delay:0.2s}.typing-d:nth-child(3){animation-delay:0.4s}
        @keyframes tp{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
        .opt-btn{background:rgba(20,15,8,0.95);border:1px solid rgba(201,169,110,0.2);color:rgba(201,169,110,0.85);transition:all 0.2s;text-align:right;font-size:11px;padding:10px 14px;border-radius:8px;width:100%;line-height:1.4}
        .opt-btn:hover{background:rgba(139,0,0,0.4);border-color:rgba(220,50,50,0.5);color:#fca5a5;transform:translateX(-3px)}
        .opt-btn:active{transform:scale(0.98)}
      `}</style>
      <div className="fixed inset-0 z-[200] flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }} dir="rtl">
        <div className="w-full max-w-md flex flex-col" style={{
          height: "72vh",
          background: "linear-gradient(180deg,#0f0d08 0%,#080604 100%)",
          border: "1px solid rgba(201,169,110,0.15)",
          borderBottom: "none",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.8)",
        }}>
          {/* رأس */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(201,169,110,0.08)", background: "rgba(0,0,0,0.3)" }}>
            <div className="relative flex-shrink-0">
              {npc?.photo ? (
                <img src={npc.photo} alt={npc.name} className="w-11 h-11 rounded-full object-cover"
                  style={{ border: "2px solid rgba(201,169,110,0.35)" }} />
              ) : (
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: "rgba(201,169,110,0.1)", border: "2px solid rgba(201,169,110,0.2)" }}>
                  {npc?.avatar || "?"}
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-black"
                style={{ background: isTyping ? "#f59e0b" : "#22c55e" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black" style={{ color: "#c9a96e" }}>{npc?.name}</p>
              <p className="text-[9px]" style={{ color: "rgba(201,169,110,0.4)" }}>
                {isTyping ? "يكتب..." : npc?.role || "شاهد"}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-amber-900/40 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}>✕</button>
          </div>
 
          {/* رسائل */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`msg-b flex ${msg.sender === "player" ? "justify-start" : "justify-end"}`}>
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-[11px] leading-relaxed"
                  style={msg.sender === "npc" ? {
                    background: "rgba(30,22,10,0.98)",
                    border: "1px solid rgba(201,169,110,0.15)",
                    color: "rgba(201,169,110,0.9)",
                    borderBottomRightRadius: 4,
                  } : {
                    background: "rgba(120,0,0,0.8)",
                    border: "1px solid rgba(220,50,50,0.35)",
                    color: "#fecaca",
                    borderBottomLeftRadius: 4,
                  }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-end msg-b">
                <div className="px-5 py-3.5 rounded-2xl flex gap-2 items-center"
                  style={{ background: "rgba(30,22,10,0.98)", border: "1px solid rgba(201,169,110,0.15)", borderBottomRightRadius: 4 }}>
                  <div className="typing-d" /><div className="typing-d" /><div className="typing-d" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
 
          {/* خيارات مع animation */}
          {options.length > 0 && optionsVisible && (
            <div className="flex-shrink-0 px-4 pb-4 pt-2 space-y-2"
              style={{ borderTop: "1px solid rgba(201,169,110,0.06)" }}>
              <p className="text-[8px] text-amber-900/25 font-mono mb-2 tracking-widest">اختر سؤالك</p>
              {options.map((opt, i) => (
                <button key={i} onClick={() => handleOption(opt)}
                  className="opt-btn"
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
// 5. PLACES MENU
// ============================================================
function PlacesMenu({ connections, nodeMap, onMove, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-950 border border-gray-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-black text-center text-lg mb-4">الاماكن المتصلة</h3>
        {connections.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">لا توجد اماكن متصلة</p>
        ) : (
          <div className="space-y-2">
            {connections.map(connId => (
              <button key={connId} onClick={() => { onMove(connId); onClose(); }}
                className="w-full text-right bg-gray-900 hover:bg-red-900/40 border border-gray-800 hover:border-red-700/50 rounded-xl px-4 py-3 text-white text-sm font-bold transition-all">
                {nodeMap[connId]?.name || connId}
              </button>
            ))}
          </div>
        )}
        <button onClick={onClose} className="mt-5 w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-bold transition-all">اغلاق</button>
      </div>
    </div>
  );
}

// ============================================================
// 6. ROOM TRANSITION
// ============================================================
function RoomTransition({ roomName, visible }) {
  return (
    <div className={`absolute inset-0 z-[60] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-8 py-4 border border-gray-700/50">
        <p className="text-white font-black text-lg tracking-wide">{roomName}</p>
      </div>
    </div>
  );
}

// ============================================================
// 7. CRIME REPORT
// ============================================================
function CrimeReport({ onClose, savedPage, onPageChange }) {
  const [page, setPage] = useState(savedPage || 0);
  const totalPages = 5;
 
  const goToPage = (p) => {
    if (p < 0 || p >= totalPages) return;
    setPage(p);
    onPageChange?.(p);
  };
 
  const pageContents = [
 
    // صفحة 0 — الغلاف
    <div key="cover" style={{fontFamily:"'Times New Roman', serif", color:"#1a0f00"}}>
      {/* رأس رسمي */}
      <div style={{textAlign:"center", borderBottom:"2px solid #2c1a00", paddingBottom:"12px", marginBottom:"12px"}}>
        <p style={{fontSize:"9px", letterSpacing:"3px", color:"#5c3800", marginBottom:"4px"}}>
          وزارة الداخلية — مديرية الشرطة القضائية
        </p>
        <p style={{fontSize:"16px", fontWeight:"900", letterSpacing:"2px", color:"#1a0f00"}}>
          محضر تحقيق جنائي
        </p>
        <p style={{fontSize:"8px", letterSpacing:"4px", color:"#8b6020", marginTop:"4px"}}>
          CRIMINAL INVESTIGATION RECORD
        </p>
      </div>
 
      {/* بيانات المحضر */}
      <table style={{width:"100%", borderCollapse:"collapse", fontSize:"10px", marginBottom:"14px"}}>
        <tbody>
          {[
            ["رقم المحضر", "2026/CR-0891"],
            ["تاريخ التحرير", "22 أغسطس 2026"],
            ["ساعة الورود", "03:14 فجراً"],
            ["نوع الجريمة", "قتل عمد مع سبق إصرار وترصد"],
            ["درجة السرية", "سري للغاية — أ"],
            ["المحقق المسؤول", "INV-007"],
            ["مكان الجريمة", "فندق الأمير الكبير — الطابق الرابع عشر"],
            ["حالة القضية", "قيد التحقيق الجنائي"],
          ].map(([label, val]) => (
            <tr key={label} style={{borderBottom:"1px solid rgba(44,26,0,0.15)"}}>
              <td style={{padding:"4px 0", color:"#5c3800", width:"45%", fontSize:"9.5px"}}>{label}:</td>
              <td style={{padding:"4px 0", fontWeight:"700", color:"#1a0f00", fontSize:"9.5px"}}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
 
      {/* تحذير */}
      <div style={{border:"1px solid rgba(44,26,0,0.3)", padding:"10px", backgroundColor:"rgba(44,26,0,0.04)", borderRadius:"2px"}}>
        <p style={{fontSize:"8.5px", fontWeight:"700", color:"#3d2200", marginBottom:"3px"}}>⚠ تحذير رسمي</p>
        <p style={{fontSize:"8px", color:"#5c3800", lineHeight:"1.6"}}>
          هذا المحضر وثيقة سرية للاستخدام الرسمي الحصري. أي تداول غير مصرح به يُعرّض صاحبه للملاحقة القانونية وفق أحكام قانون الإجراءات الجزائية المادة 78.
        </p>
      </div>
 
      {/* ختم وتوقيع */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:"16px"}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:"80px", height:"1px", backgroundColor:"#2c1a00", marginBottom:"3px"}} />
          <p style={{fontSize:"8px", color:"#5c3800"}}>توقيع رئيس القسم</p>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{width:"44px", height:"44px", border:"1px solid rgba(44,26,0,0.25)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center"}}>
            <p style={{fontSize:"7px", color:"rgba(44,26,0,0.3)"}}>الختم</p>
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:"7px", color:"#8b6020", fontFamily:"'Courier New',monospace"}}>CONFIDENTIAL</p>
        </div>
      </div>
    </div>,
 
    // صفحة 1 — ملخص الواقعة
    <div key="p1" style={{fontFamily:"'Times New Roman', serif", color:"#1a0f00"}}>
      <div style={{borderBottom:"2px solid #2c1a00", paddingBottom:"6px", marginBottom:"12px"}}>
        <p style={{fontSize:"12px", fontWeight:"900", color:"#1a0f00"}}>أولاً: ملخص الواقعة</p>
        <p style={{fontSize:"8px", color:"#8b6020", letterSpacing:"1px"}}>Section I — Incident Summary</p>
      </div>
      <div style={{fontSize:"10.5px", lineHeight:"1.85", color:"#2c1a00"}}>
        <p style={{marginBottom:"10px"}}>
          في تمام الساعة الثالثة وأربع عشرة دقيقة فجراً من يوم السبت الموافق 22 أغسطس 2026، تلقّت غرفة العمليات بلاغات متعددة تفيد بسقوط جثة من الطابق الرابع عشر لفندق <strong>الأمير الكبير</strong> المُصنَّف بخمس نجوم.
        </p>
        <p style={{marginBottom:"10px"}}>
          عند وصول فريق التدخل الأول، عُثر على جثة رجل في منطقة المدخل الجانبي الشمالي للفندق. تبيّن لاحقاً أن المتوفى هو <strong>رمزي حسين عوض</strong>، رئيس مجلس إدارة مجموعة عوض القابضة، مواليد 1972.
        </p>
        <p>
          أفادت الطبيبة د. لمياء الشريف بوفاة طبيعية. غير أن تقرير الطب الشرعي اللاحق أشار إلى تناقضات تستدعي تحقيقاً موسعاً. القضية محالة إلى وحدة التحقيق الجنائي.
        </p>
      </div>
 
      {/* معطيات أولية */}
      <div style={{marginTop:"14px", borderTop:"1px solid rgba(44,26,0,0.2)", paddingTop:"10px"}}>
        <p style={{fontSize:"10px", fontWeight:"700", color:"#3d2200", marginBottom:"7px"}}>المعطيات الأولية:</p>
        <div style={{paddingRight:"8px"}}>
          {[
            "الضحية: رمزي حسين عوض — 54 سنة",
            "موقع الاكتشاف: مدخل جانبي شمالي — الطابق الأرضي",
            "الجناح المسجَّل: بنتهاوس — الطابق الرابع عشر",
            "حالة الجناح: باب مفتوح — لا آثار اقتحام",
            "وقت الوفاة التقديري: 11:30 م — 12:15 ص",
            "التقرير الأولي: وفاة طبيعية (مُعاد النظر فيه)",
          ].map((item, i) => (
            <div key={i} style={{display:"flex", gap:"8px", marginBottom:"5px", fontSize:"9.5px", color:"#2c1a00"}}>
              <span style={{color:"#5c3800", flexShrink:0}}>—</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
 
    // صفحة 2 — المشتبهون
    <div key="p2" style={{fontFamily:"'Times New Roman', serif", color:"#1a0f00"}}>
      <div style={{borderBottom:"2px solid #2c1a00", paddingBottom:"6px", marginBottom:"12px"}}>
        <p style={{fontSize:"12px", fontWeight:"900", color:"#1a0f00"}}>ثانياً: قائمة المشتبه بهم</p>
        <p style={{fontSize:"8px", color:"#8b6020", letterSpacing:"1px"}}>Section II — Persons of Interest</p>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:"9px"}}>
        {[
          {code:"POI-01", name:"طارق منصور", role:"شريك تجاري — مجموعة عوض", note:"آخر شخص اجتمع بالضحية رسمياً. نزاع مالي موثق."},
          {code:"POI-02", name:"ليلى عوض", role:"زوجة الضحية", note:"وارثة مباشرة. اتصلت بالطبيبة قبل الشرطة."},
          {code:"POI-03", name:"نادين سرحان", role:"مديرة تنفيذية — مجموعة عوض", note:"صلاحيات إدارية واسعة. خلافات موثقة مع الضحية."},
          {code:"POI-04", name:"نادر فتحي", role:"موظف أمن — الوردية الليلية", note:"روايته الرسمية تتعارض مع شهادات أخرى."},
          {code:"POI-05", name:"ريم حسن", role:"موظفة سابقة — خدمة الغرف", note:"فُصلت بقرار مباشر من الضحية قبل ثلاثة أشهر."},
          {code:"POI-06", name:"مجهول الهوية", role:"—", note:"رُصد من قِبل شاهدين منفصلين ليلة الحادثة."},
        ].map(s => (
          <div key={s.code} style={{border:"1px solid rgba(44,26,0,0.2)", borderRadius:"2px", padding:"8px 10px", backgroundColor:"rgba(44,26,0,0.02)"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:"3px"}}>
              <div>
                <span style={{fontSize:"8px", color:"#8b6020", fontFamily:"'Courier New',monospace", marginLeft:"6px"}}>{s.code}</span>
                <span style={{fontSize:"10.5px", fontWeight:"700", color:"#1a0f00"}}>{s.name}</span>
              </div>
            </div>
            <p style={{fontSize:"9px", color:"#5c3800", marginBottom:"3px"}}>{s.role}</p>
            <p style={{fontSize:"9px", color:"#3d2200", lineHeight:"1.5", borderTop:"1px solid rgba(44,26,0,0.1)", paddingTop:"3px"}}>{s.note}</p>
          </div>
        ))}
      </div>
    </div>,
 
    // صفحة 3 — الأدلة
    <div key="p3" style={{fontFamily:"'Times New Roman', serif", color:"#1a0f00"}}>
      <div style={{borderBottom:"2px solid #2c1a00", paddingBottom:"6px", marginBottom:"12px"}}>
        <p style={{fontSize:"12px", fontWeight:"900", color:"#1a0f00"}}>ثالثاً: سجل الأدلة الجنائية</p>
        <p style={{fontSize:"8px", color:"#8b6020", letterSpacing:"1px"}}>Section III — Physical Evidence Log</p>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
        {[
          {ref:"E-001", name:"زجاجة نبيذ — Château Margaux 2009", loc:"جناح البنتهاوس", status:"في التحليل", statusColor:"#b45309"},
          {ref:"E-002", name:"دفتر مخبأ خلف لوحة جدارية", loc:"جناح البنتهاوس", status:"محجوز", statusColor:"#15803d"},
          {ref:"E-003", name:"سجل إيميل — طلب نبيذ مجهول المصدر", loc:"سيرفرات الفندق", status:"قيد التتبع", statusColor:"#1d4ed8"},
          {ref:"E-004", name:"USB — محتوى مجهول", loc:"غرف الموظفين", status:"محجوز", statusColor:"#15803d"},
          {ref:"E-005", name:"سجل تعطيل منظومة الكاميرات", loc:"غرفة المراقبة", status:"نسخة رقمية", statusColor:"#1d4ed8"},
          {ref:"E-006", name:"ساعة حائط — أُوقفت على 11:47", loc:"جناح البنتهاوس", status:"محجوز", statusColor:"#15803d"},
          {ref:"E-007", name:"إيصال دفع نقدي — HGR-2208", loc:"الاستقبال الرئيسي", status:"محجوز", statusColor:"#15803d"},
          {ref:"E-008", name:"شريحة SIM مكسورة", loc:"حمام الجناح", status:"في التحليل", statusColor:"#b45309"},
        ].map(ev => (
          <div key={ev.ref} style={{display:"flex", alignItems:"flex-start", gap:"8px", borderBottom:"1px solid rgba(44,26,0,0.12)", paddingBottom:"5px", fontSize:"9.5px"}}>
            <span style={{fontFamily:"'Courier New',monospace", color:"#8b6020", flexShrink:0, width:"46px", fontWeight:"700"}}>{ev.ref}</span>
            <div style={{flex:1}}>
              <span style={{color:"#1a0f00", fontWeight:"600"}}>{ev.name}</span>
              <span style={{color:"rgba(44,26,0,0.4)", margin:"0 4px"}}>·</span>
              <span style={{color:"#5c3800"}}>{ev.loc}</span>
            </div>
            <span style={{flexShrink:0, fontSize:"8px", fontWeight:"700", color:ev.statusColor, border:`1px solid ${ev.statusColor}40`, padding:"1px 5px", borderRadius:"2px", backgroundColor:`${ev.statusColor}08`}}>
              {ev.status}
            </span>
          </div>
        ))}
      </div>
      <p style={{fontSize:"8px", color:"#8b6020", fontStyle:"italic", marginTop:"10px"}}>
        * القائمة غير نهائية — قد تُضاف أدلة لاحقاً بناءً على مسار التحقيق.
      </p>
    </div>,
 
    // صفحة 4 — تعليمات
    <div key="p4" style={{fontFamily:"'Times New Roman', serif", color:"#1a0f00"}}>
      <div style={{borderBottom:"2px solid #2c1a00", paddingBottom:"6px", marginBottom:"12px"}}>
        <p style={{fontSize:"12px", fontWeight:"900", color:"#1a0f00"}}>رابعاً: إرشادات التحقيق الميداني</p>
        <p style={{fontSize:"8px", color:"#8b6020", letterSpacing:"1px"}}>Section IV — Field Investigation Guidelines</p>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:"10px", fontSize:"10px", color:"#2c1a00", lineHeight:"1.7"}}>
        {[
          {icon:"🔦", title:"الكشاف العادي", text:"يكشف الأدلة المادية في الأماكن المظلمة. شغّله قبل أي فحص."},
          {icon:"🔮", title:"الأشعة فوق البنفسجية", text:"تُظهر آثار الدماء والبصمات والكتابات الخفية. لا تُغني عن الكشاف."},
          {icon:"💡", title:"مفاتيح الإضاءة", text:"ابحث عن مفتاح النور بالكشاف. الغرفة المضاءة تكشف ما يخفيه الظلام."},
          {icon:"💬", title:"الشهود", text:"ما يقوله الشاهد ليس الحقيقة كاملة — وما يصمت عنه أهم مما يقوله."},
          {icon:"🔬", title:"المختبر الجنائي", text:"الدليل المادي بدون تحليل ناقص. أرسله فوراً."},
          {icon:"📌", title:"لوحة التحقيق", text:"ارسم الروابط بنفسك. لا أحد يفكر عنك."},
          {icon:"⚖️", title:"الحكم النهائي", text:"ستة أدلة على الأقل — وربط منطقي بينها — قبل أي اتهام."},
        ].map(item => (
          <div key={item.title} style={{display:"flex", gap:"10px", alignItems:"flex-start"}}>
            <span style={{fontSize:"14px", flexShrink:0}}>{item.icon}</span>
            <div>
              <span style={{fontWeight:"700", color:"#3d2200"}}>{item.title}: </span>
              <span style={{color:"#2c1a00"}}>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
 
      <div style={{marginTop:"20px", borderTop:"1px solid rgba(44,26,0,0.2)", paddingTop:"12px", textAlign:"center"}}>
        <p style={{fontSize:"8px", color:"#8b6020", fontFamily:"'Courier New',monospace", letterSpacing:"3px"}}>
          FOR AUTHORIZED INVESTIGATIVE USE ONLY
        </p>
      </div>
    </div>,
  ];
 
  return (
    <>
      <style>{`
        .report-paper {
          background: linear-gradient(135deg, #fdfaf3 0%, #f9f4e8 40%, #f4edd8 100%);
          background-image:
            repeating-linear-gradient(
              transparent, transparent 26px,
              rgba(44,26,0,0.06) 26px, rgba(44,26,0,0.06) 27px
            );
        }
        .report-spine {
          background: linear-gradient(to left, #c9a96e, #b8946a, #9a7040, #b8946a, #c9a96e);
        }
      `}</style>
 
      <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-3 backdrop-blur-sm" dir="rtl">
        <div className="relative" style={{width:"min(400px, 96vw)", maxHeight:"94vh"}}>
 
          {/* ظل */}
          <div className="absolute -bottom-4 left-3 right-3 h-5 rounded-full"
            style={{background:"rgba(0,0,0,0.5)", filter:"blur(8px)"}} />
 
          {/* الكتاب */}
          <div className="relative w-full overflow-hidden"
            style={{
              borderRadius:"3px 10px 10px 3px",
              boxShadow:"8px 8px 40px rgba(0,0,0,0.9), -2px 0 10px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,96,32,0.4)",
            }}>
 
            {/* عمود التجليد */}
            <div className="report-spine absolute right-0 top-0 bottom-0 z-10" style={{width:"18px"}} />
 
            {/* ثقوب */}
            {[18, 32, 50, 68, 82].map(top => (
              <div key={top} className="absolute z-20 rounded-full"
                style={{
                  right:"5px", top:`${top}%`, transform:"translateY(-50%)",
                  width:"8px", height:"8px",
                  background:"#2a1505",
                  border:"1px solid rgba(100,60,10,0.4)",
                  boxShadow:"inset 0 1px 2px rgba(0,0,0,0.6)"
                }} />
            ))}
 
            {/* ورقة */}
            <div className="report-paper"
              style={{
                marginRight:"18px",
                minHeight:"520px",
                maxHeight:"86vh",
                position:"relative",
              }}>
 
              {/* طية الزاوية */}
              <div style={{
                position:"absolute", top:0, left:0, width:0, height:0,
                borderStyle:"solid", borderWidth:"0 28px 28px 0",
                borderColor:"transparent #d4c090 transparent transparent",
                opacity:0.6, zIndex:5
              }} />
 
              {/* رقم الصفحة */}
              <div style={{
                position:"absolute", top:"8px", left:"10px",
                fontSize:"8px", color:"rgba(92,56,0,0.4)",
                fontFamily:"'Courier New',monospace", zIndex:10
              }}>
                {page + 1} / {totalPages}
              </div>
 
              {/* المحتوى */}
              <div style={{
                padding:"28px 20px 20px 20px",
                overflowY:"auto",
                maxHeight:"calc(86vh - 60px)"
              }}>
                {pageContents[page]}
              </div>
            </div>
          </div>
 
          {/* أزرار التنقل */}
          <div style={{
            display:"flex", justifyContent:"space-between",
            alignItems:"center", marginTop:"12px", padding:"0 4px"
          }}>
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              style={{
                padding:"8px 18px",
                fontSize:"11px", fontWeight:"700",
                borderRadius:"6px", cursor:"pointer",
                background:"rgba(0,0,0,0.6)",
                border:"1px solid rgba(201,169,110,0.3)",
                color: page === 0 ? "rgba(201,169,110,0.2)" : "#c9a96e",
                opacity: page === 0 ? 0.3 : 1,
              }}>
              ← السابق
            </button>
 
            {/* نقاط */}
            <div style={{display:"flex", gap:"6px", alignItems:"center"}}>
              {Array.from({length: totalPages}).map((_, i) => (
                <button key={i} onClick={() => goToPage(i)}
                  style={{
                    width: i === page ? "22px" : "7px",
                    height:"7px",
                    borderRadius:"4px",
                    background: i === page ? "#c9a96e" : "rgba(201,169,110,0.25)",
                    border:"1px solid rgba(201,169,110,0.4)",
                    cursor:"pointer",
                    transition:"all 0.2s",
                  }} />
              ))}
            </div>
 
            <button
              onClick={() => page === totalPages - 1 ? onClose() : goToPage(page + 1)}
              style={{
                padding:"8px 18px",
                fontSize:"11px", fontWeight:"700",
                borderRadius:"6px", cursor:"pointer",
                background: page === totalPages - 1 ? "#5c3800" : "#8B4500",
                border:"1px solid rgba(139,96,0,0.5)",
                color:"#fdf8ee",
              }}>
              {page === totalPages - 1 ? "أغلق ✕" : "التالي →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// 8. EVIDENCE PANEL
// ============================================================
function EvidencePanel({ evidence, onClose, onSendToLab, onViewEvidence }) {
  return (
    <div className="fixed inset-0 bg-black/97 z-50 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
      <div className="bg-gray-950 border border-red-900/40 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-red-400 font-black text-lg">ملف الادلة</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl">x</button>
        </div>
        {evidence.length === 0 ? (
          <p className="text-gray-600 text-center py-10 text-sm">لم تجمع اي ادلة بعد</p>
        ) : (
          <div className="space-y-3">
            {evidence.map(ev => (
              <div key={ev.id} className="bg-gray-900 rounded-xl p-3.5 border border-gray-800/80 flex items-center gap-3">
                {CASE_IMAGES.evidence[ev.id] ? (
                  <img src={CASE_IMAGES.evidence[ev.id]} alt={ev.name}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                    style={{border:"1px solid rgba(201,169,110,0.2)"}} />
                ) : (
                  <span className="text-2xl flex-shrink-0">{ev.type==="physical"?"[F]":"[D]"}</span>
                )}
                <div className="flex-1">
                  <p className="text-white text-sm font-bold">{ev.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{ev.type==="physical"?"دليل مادي":"دليل رقمي"} - {ev.location}</p>
                  {ev.analyzed && <div className="mt-1 text-green-400 text-xs">تم التحليل</div>}
                  {ev.inLab && <div className="mt-1 text-yellow-400 text-xs">قيد التحليل...</div>}
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => onViewEvidence?.(ev)}
                    className="px-2 py-1 bg-amber-900/50 hover:bg-amber-800 rounded text-xs text-white transition-all">عرض</button>
                  {!ev.analyzed && !ev.inLab && onSendToLab && (
                    <button onClick={() => onSendToLab(ev.id)}
                      className="px-2 py-1 bg-purple-900/50 hover:bg-purple-800 rounded text-xs text-white transition-all">تحليل</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function CaseChangeOverlay({ onClose, onConfirm, currentCaseId }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCase, setLoadingCase] = useState(null);
 
  const handleConfirm = () => {
    if (!selected || selected.status === "locked" || selected.id === currentCaseId) return;
    setLoadingCase(selected);
    setLoading(true);
    setTimeout(() => { onConfirm(selected.id); }, 3000);
  };
 
  if (loading && loadingCase) {
    return (
      <>
        <style>{`
          @keyframes scanLine { 0%{top:-2px} 100%{top:100%} }
          @keyframes fadeCase { 0%{opacity:0;transform:translateY(16px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }
          @keyframes progBar { 0%{width:0%} 100%{width:100%} }
          @keyframes blinkC { 0%,100%{opacity:1} 50%{opacity:0} }
          .lc-anim{animation:fadeCase 3s ease forwards}
          .lc-scan{animation:scanLine 1s linear infinite}
          .lc-prog{animation:progBar 3s ease forwards}
          .lc-blink{animation:blinkC 0.8s step-end infinite}
        `}</style>
        <div className="fixed inset-0 z-[400] flex items-center justify-center"
          style={{background:"rgba(0,0,0,0.98)",backdropFilter:"blur(12px)"}}>
          <div className="lc-anim text-center px-8 w-full max-w-xs" dir="rtl">
            <div className="relative w-full h-px mb-10 overflow-visible"
              style={{background:"rgba(139,0,0,0.2)"}}>
              <div className="lc-scan absolute left-0 right-0 h-[2px] rounded-full"
                style={{background:"rgba(220,50,50,0.9)",boxShadow:"0 0 12px rgba(220,50,50,0.6)"}} />
            </div>
            <p className="text-[9px] font-mono tracking-[0.5em] text-red-900/50 mb-3 uppercase">loading case file</p>
            <h2 className="text-2xl font-black mb-1" style={{color:"#c9a96e",fontFamily:"'Cairo',sans-serif"}}>
              {loadingCase.title}
            </h2>
            <p className="text-[10px] mb-6" style={{color:"rgba(201,169,110,0.4)",fontFamily:"serif"}}>
              {loadingCase.subtitle}
            </p>
            <div className="h-px w-40 mx-auto mb-5"
              style={{background:"linear-gradient(90deg,transparent,rgba(201,169,110,0.4),transparent)"}} />
            <div className="text-right mb-1 font-mono text-[10px]" style={{color:"rgba(220,50,50,0.7)"}}>
              <span>جار تحميل ملف القضية</span>
              <span className="lc-blink">_</span>
            </div>
            <div className="text-right mb-1 font-mono text-[9px]" style={{color:"rgba(201,169,110,0.3)"}}>اعداد موقع الجريمة...</div>
            <div className="text-right mb-5 font-mono text-[9px]" style={{color:"rgba(201,169,110,0.3)"}}>تحميل بيانات المشتبهين...</div>
            <div className="w-full h-1 rounded-full overflow-hidden mb-3"
              style={{background:"rgba(139,0,0,0.15)",border:"1px solid rgba(139,0,0,0.2)"}}>
              <div className="lc-prog h-full rounded-full"
                style={{background:"linear-gradient(90deg,#6b0000,#8B0000,#dc2626)",boxShadow:"0 0 8px rgba(220,50,50,0.4)"}} />
            </div>
            <p className="text-[8px] font-mono tracking-widest" style={{color:"rgba(201,169,110,0.2)"}}>
              DETECTIVE UNIT — CLASSIFIED ACCESS
            </p>
          </div>
        </div>
      </>
    );
  }
 
  return (
    <>
      <style>{`
        @keyframes drawerUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .cs-drawer{animation:drawerUp 0.3s ease}
        .cs-card{background:rgba(15,10,4,0.9);border:1px solid rgba(201,169,110,0.12);border-radius:10px;padding:14px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden}
        .cs-card::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:transparent;transition:background 0.2s}
        .cs-card.sel{border-color:rgba(220,50,50,0.5);background:rgba(30,8,8,0.95);box-shadow:0 0 20px rgba(139,0,0,0.15)}
        .cs-card.sel::before{background:linear-gradient(90deg,transparent,#dc2626,transparent)}
        .cs-card.locked{opacity:0.4;cursor:not-allowed}
        .cs-card.current{border-color:rgba(34,197,94,0.3)}
        .cs-card:not(.locked):not(.sel):hover{border-color:rgba(201,169,110,0.25);background:rgba(20,14,6,0.95)}
        .cs-stamp{font-family:"Courier New",monospace;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;font-size:8px;padding:2px 6px;border-radius:2px}
      `}</style>
      <div className="fixed inset-0 z-[400] flex items-end justify-center"
        style={{background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)"}}
        onClick={onClose} dir="rtl">
        <div className="cs-drawer w-full max-w-md flex flex-col"
          style={{
            background:"linear-gradient(180deg,#0f0d08 0%,#090704 100%)",
            border:"1px solid rgba(201,169,110,0.12)",
            borderBottom:"none",
            borderRadius:"20px 20px 0 0",
            maxHeight:"85vh",
          }}
          onClick={e => e.stopPropagation()}>
 
          {/* رأس */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{borderBottom:"1px solid rgba(201,169,110,0.08)"}}>
            <div>
              <p className="text-[9px] font-mono tracking-[0.4em] text-red-900/50 mb-0.5">CASE MANAGEMENT</p>
              <h3 className="text-base font-black" style={{color:"#c9a96e"}}>اختر القضية</h3>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-amber-900/40 hover:text-white transition-colors"
              style={{background:"rgba(255,255,255,0.04)"}}>
              x
            </button>
          </div>
 
          {/* القضايا */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {AVAILABLE_CASES.map(c => (
              <div key={c.id}
                className={`cs-card ${selected?.id===c.id?"sel":""} ${c.status==="locked"?"locked":""} ${c.id===currentCaseId?"current":""}`}
                onClick={() => c.status !== "locked" && setSelected(c)}>
 
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h4 className="text-sm font-black"
                        style={{color:selected?.id===c.id?"#fca5a5":"#c9a96e"}}>
                        {c.title}
                      </h4>
                      {c.id === currentCaseId && (
                        <span className="cs-stamp"
                          style={{background:"rgba(34,197,94,0.15)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.3)"}}>
                          جارية
                        </span>
                      )}
                      {c.status === "locked" && (
                        <span className="cs-stamp"
                          style={{background:"rgba(100,100,100,0.15)",color:"#666",border:"1px solid rgba(100,100,100,0.2)"}}>
                          مقفول
                        </span>
                      )}
                    </div>
                    <p className="text-[9px]" style={{color:"rgba(201,169,110,0.4)",fontFamily:"serif"}}>
                      {c.subtitle}
                    </p>
                  </div>
                  <span className="cs-stamp flex-shrink-0 mr-2"
                    style={{background:`${c.tagColor}18`,color:c.tagColor,border:`1px solid ${c.tagColor}40`}}>
                    {c.tag}
                  </span>
                </div>
 
                <p className="text-[9.5px] leading-relaxed mb-3"
                  style={{color:"rgba(201,169,110,0.55)",fontFamily:"serif"}}>
                  {c.description}
                </p>
 
                <div className="flex items-center gap-4"
                  style={{borderTop:"1px solid rgba(201,169,110,0.06)",paddingTop:"10px"}}>
                  <span className="text-[8.5px] font-bold" style={{color:c.difficultyColor}}>{c.difficulty}</span>
                  <span className="text-[8.5px]" style={{color:"rgba(201,169,110,0.35)"}}>
                    {c.evidenceCount} ادلة
                  </span>
                  <span className="text-[8.5px]" style={{color:"rgba(201,169,110,0.35)"}}>
                    {c.suspectCount} مشتبهين
                  </span>
                  {selected?.id === c.id && (
                    <span className="mr-auto text-[8px] font-bold" style={{color:"#dc2626"}}>محددة</span>
                  )}
                </div>
              </div>
            ))}
          </div>
 
          {/* زرار التأكيد */}
          <div className="flex-shrink-0 px-4 pb-6 pt-3"
            style={{borderTop:"1px solid rgba(201,169,110,0.06)"}}>
            <button
              onClick={handleConfirm}
              disabled={!selected || selected.status==="locked" || selected.id===currentCaseId}
              className="w-full py-3.5 font-black text-sm rounded-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background: selected && selected.id!==currentCaseId
                  ? "linear-gradient(135deg,#8B0000,#6b0000)"
                  : "rgba(30,10,10,0.5)",
                border:"1px solid rgba(220,50,50,0.3)",
                color:"white",
                boxShadow: selected && selected.id!==currentCaseId ? "0 0 20px rgba(139,0,0,0.2)" : "none",
              }}>
              {!selected
                ? "اختر قضية اولا"
                : selected.id===currentCaseId
                ? "هذه القضية جارية بالفعل"
                : "تحميل: " + selected.title}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// 9. MAIN MENU
// ============================================================
function MainMenu({ onStart, audio }) {
  const [showWarning, setShowWarning] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    audio.init();
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [audio]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .menu-bg{background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(139,0,0,0.12) 0%,transparent 70%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(50,30,10,0.3) 0%,transparent 60%),linear-gradient(160deg,#0a0804 0%,#0f0d09 40%,#080608 100%)}
        .scanlines::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px);pointer-events:none;z-index:1}
        .vignette::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.85) 100%);pointer-events:none;z-index:1}
        .file-stamp{transform:rotate(-12deg);border:3px solid rgba(139,0,0,0.7);color:rgba(139,0,0,0.7);font-weight:900;letter-spacing:0.15em;padding:3px 10px;font-size:11px;text-transform:uppercase;font-family:"Courier New",monospace}
        .title-glitch{position:relative}
        .title-glitch.active::before{content:attr(data-text);position:absolute;left:2px;top:0;color:#ff0040;clip-path:polygon(0 30%,100% 30%,100% 50%,0 50%);opacity:0.7}
        .title-glitch.active::after{content:attr(data-text);position:absolute;left:-2px;top:0;color:#00ffff;clip-path:polygon(0 60%,100% 60%,100% 75%,0 75%);opacity:0.5}
        .case-file{background:linear-gradient(135deg,#1a1208 0%,#140e06 100%);border:1px solid rgba(201,169,110,0.2);position:relative;overflow:hidden}
        .case-file::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(201,169,110,0.4),transparent)}
        .btn-primary{background:linear-gradient(135deg,#8B0000 0%,#6b0000 50%,#8B0000 100%);border:1px solid rgba(220,50,50,0.4);box-shadow:0 0 20px rgba(139,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1);transition:all 0.2s;position:relative;overflow:hidden}
        .btn-primary::before{content:"";position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);transition:left 0.4s}
        .btn-primary:hover::before{left:100%}
        .btn-primary:hover{box-shadow:0 0 30px rgba(139,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.15);transform:translateY(-1px)}
        .btn-secondary{background:rgba(20,14,6,0.8);border:1px solid rgba(201,169,110,0.25);transition:all 0.2s}
        .btn-secondary:hover{border-color:rgba(201,169,110,0.5);background:rgba(30,20,8,0.9);transform:translateY(-1px)}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .anim-1{animation:fadeInUp 0.6s ease 0.1s both}.anim-2{animation:fadeInUp 0.6s ease 0.25s both}.anim-3{animation:fadeInUp 0.6s ease 0.4s both}.anim-4{animation:fadeInUp 0.6s ease 0.55s both}
        @keyframes pulse-border{0%,100%{border-color:rgba(139,0,0,0.3)}50%{border-color:rgba(139,0,0,0.7)}}
        .pulse-border{animation:pulse-border 2.5s ease infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .blink{animation:blink 1s step-end infinite}
      `}</style>
      <div className="fixed inset-0 menu-bg scanlines vignette" style={{fontFamily:"'Cairo',sans-serif",overflow:"hidden"}}>
        <div className="absolute top-8 right-8 opacity-5 select-none pointer-events-none"
          style={{fontSize:80,transform:"rotate(-15deg)",color:"#8B0000",fontFamily:"'Courier New',monospace",fontWeight:900}}>
          سري
        </div>
        <div className="absolute bottom-12 left-8 opacity-[0.04] select-none pointer-events-none"
          style={{fontSize:60,transform:"rotate(8deg)",color:"#c9a96e",fontFamily:"'Courier New',monospace",fontWeight:900}}>
          CLASSIFIED
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6" dir="rtl">
          <div className="text-center mb-8 anim-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-900/60" />
              <p className="text-[10px] tracking-[0.4em] text-red-900/70 font-mono uppercase">ادارة التحقيقات الجنائية</p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-900/60" />
            </div>
            <h1 data-text="محقق" className={`title-glitch ${glitchActive?"active":""} text-7xl font-black leading-none`}
              style={{color:"#e8e0d0",textShadow:"0 0 40px rgba(139,0,0,0.4),0 0 80px rgba(139,0,0,0.15)"}}>
              محقق
            </h1>
            <p className="text-[11px] tracking-[0.5em] uppercase font-mono mt-1" style={{color:"rgba(201,169,110,0.6)"}}>DETECTIVE - SERIES I</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-px w-12 bg-red-900/40" /><div className="w-1 h-1 rounded-full bg-red-900/60" />
              <div className="h-px w-24 bg-red-900/40" /><div className="w-1 h-1 rounded-full bg-red-900/60" />
              <div className="h-px w-12 bg-red-900/40" />
            </div>
          </div>
          <div className="case-file w-full max-w-xs rounded-sm p-4 mb-6 anim-2 pulse-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[9px] font-mono text-yellow-700/60 tracking-widest mb-0.5">CASE FILE</p>
                <p className="text-base font-black" style={{color:"#c9a96e"}}>غرفة 1408</p>
                <p className="text-[10px]" style={{color:"rgba(201,169,110,0.5)"}}>فندق الامير الكبير</p>
              </div>
              <div className="file-stamp text-[9px]">سري</div>
            </div>
            <div className="border-t border-yellow-900/20 pt-2 flex gap-4 text-[9px]" style={{color:"rgba(201,169,110,0.45)"}}>
              <span>8 ادلة</span><span>6 مشتبهين</span><span>5 شهود</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 blink" />
              <span className="text-[8px] font-mono text-red-600/70">ACTIVE INVESTIGATION</span>
            </div>
          </div>
          <div className="w-full max-w-xs space-y-3 anim-3">
            <button onClick={() => { audio.init(); audio.playClick(); setShowWarning(true); }}
              className="btn-primary w-full py-3.5 text-white font-black text-base rounded-sm tracking-wide">
              بدء التحقيق
            </button>
            <button onClick={() => { audio.playClick(); setShowRules(true); }}
              className="btn-secondary w-full py-3 text-[13px] font-bold rounded-sm tracking-wide"
              style={{color:"rgba(201,169,110,0.8)"}}>
              دليل المحقق
            </button>
          </div>
          <div className="absolute bottom-5 left-0 right-0 text-center anim-4">
            <p className="text-[8px] font-mono tracking-widest" style={{color:"rgba(201,169,110,0.2)"}}>
              2026 - DETECTIVE UNIT - ALL CASES CLASSIFIED
            </p>
          </div>
        </div>

        {showWarning && (
          <div className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowWarning(false)}>
            <div className="case-file rounded-sm p-7 max-w-sm w-full"
              style={{border:"1px solid rgba(139,0,0,0.5)",boxShadow:"0 0 40px rgba(139,0,0,0.2)"}}
              onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto rounded-full border border-red-900/40 flex items-center justify-center mb-3"
                  style={{background:"rgba(139,0,0,0.1)"}}>
                  <span className="text-2xl">!</span>
                </div>
                <h3 className="text-lg font-black mb-2" style={{color:"#e8e0d0"}}>تحذير رسمي</h3>
                <p className="text-sm leading-relaxed" style={{color:"rgba(201,169,110,0.7)"}}>
                  بمجرد دخولك موقع الجريمة، انت مسؤول قانونيا عن سير التحقيق.
                </p>
                <p className="text-xs mt-2 font-bold" style={{color:"rgba(220,50,50,0.6)"}}>هل انت مستعد يا محقق؟</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { audio.playClick(); setShowWarning(false); onStart(); }}
                  className="btn-primary flex-1 py-3 text-white font-bold text-sm rounded-sm">نعم، ادخل الموقع</button>
                <button onClick={() => { audio.playClick(); setShowWarning(false); }}
                  className="btn-secondary flex-1 py-3 text-sm font-bold rounded-sm"
                  style={{color:"rgba(201,169,110,0.6)"}}>تراجع</button>
              </div>
            </div>
          </div>
        )}

        {showRules && (
          <div className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowRules(false)}>
            <div className="case-file rounded-sm p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto"
              style={{border:"1px solid rgba(201,169,110,0.25)"}}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-5 border-b border-yellow-900/20 pb-3">
                <h3 className="font-black text-base" style={{color:"#c9a96e"}}>دليل المحقق الميداني</h3>
              </div>
              <div className="space-y-3">
                {[
                  {t:"الكشاف",d:"اداتك الاساسية في الظلام."},
                  {t:"الاشعة UV",d:"تكشف الدماء والكتابات المخفية."},
                  {t:"مفتاح النور",d:"اضغط عليه في الصورة لاضاءة الغرفة."},
                  {t:"الشهود",d:"اضغط على الشخصية في الصورة للحديث معها."},
                  {t:"ملف الادلة",d:"اجمع 6 ادلة على الاقل قبل اي اتهام."},
                  {t:"المختبر",d:"الدليل بدون تحليل ناقص - ارسله فورا."},
                  {t:"لوحة التحقيق",d:"ارسم الروابط. الجريمة شبكة."},
                  {t:"الحكم النهائي",d:"خطا واحد يبرئ المجرم. فكر قبل تتهم."},
                ].map(item => (
                  <div key={item.t} className="flex gap-3 items-start">
                    <div>
                      <span className="text-xs font-black" style={{color:"#c9a96e"}}>{item.t} - </span>
                      <span className="text-xs" style={{color:"rgba(201,169,110,0.6)"}}>{item.d}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { audio.playClick(); setShowRules(false); }}
                className="btn-secondary mt-5 w-full py-2.5 text-sm font-bold rounded-sm"
                style={{color:"rgba(201,169,110,0.7)"}}>
                فهمت - جاهز للتحقيق
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================
// 10. NUMBER PAD LOCK
// ============================================================
function NumberPadLock({ puzzle, onClose, socket, roomId, playerId }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const maxDigits = 4;
  const handlePress = (num) => { if (code.length < maxDigits) { setCode(p => p + num); setError(null); } };
  const handleClear = () => { setCode(""); setError(null); };
  const handleSubmit = () => {
    if (code.length < maxDigits) { setError("ادخل 4 ارقام"); return; }
    socket.emit("horror_solve_puzzle", { roomId, playerId, puzzleId: puzzle.id, code });
  };
  return (
    <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4">
      <div className="bg-gray-900 p-6 rounded-2xl border border-yellow-600 shadow-2xl max-w-sm w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-yellow-400 font-bold text-lg">{puzzle.description || "قفل رقمي"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">x</button>
        </div>
        <p className="text-gray-400 text-sm text-center mb-4">ادخل الرمز (4 ارقام)</p>
        <div className="text-white text-4xl text-center tracking-widest bg-black p-2 rounded mb-4 font-mono">{code.padEnd(4,"_")}</div>
        {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => handlePress(n)} className="bg-gray-700 hover:bg-gray-600 text-white text-xl p-4 rounded transition-all">{n}</button>
          ))}
          <button onClick={handleClear} className="bg-red-900 hover:bg-red-800 text-white text-xl p-4 rounded transition-all">C</button>
          <button onClick={() => handlePress(0)} className="bg-gray-700 hover:bg-gray-600 text-white text-xl p-4 rounded transition-all">0</button>
          <button onClick={handleSubmit} className="bg-green-900 hover:bg-green-800 text-white text-xl p-4 rounded transition-all">OK</button>
        </div>
        <p className="text-gray-500 text-xs mt-4 text-center">{puzzle.hint || "ابحث عن رقم في الغرفة"}</p>
      </div>
    </div>
  );
}

// ============================================================
// 11. CRIME BOARD
// ============================================================
function CrimeBoardScreen({ evidence, caseData, onClose, socket, roomId, playerId }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [conns, setConns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNoteFor, setShowNoteFor] = useState(null);
  const [colorIdx, setColorIdx] = useState(0);
 
  // drag state
  const dragRef = useRef({ type: null, nodeId: null, lastX: 0, lastY: 0 });
  // wire drawing state
  const wireRef = useRef({ active: false, fromId: null, fromX: 0, fromY: 0, toX: 0, toY: 0 });
  const [, forceRender] = useState(0);
 
  const COLORS = ["#ef4444","#f59e0b","#22c55e","#3b82f6","#a855f7","#ec4899","#14b8a6","#f97316"];
  const DOT_RADIUS = 8; // حجم دائرة السحب بالـ px
 
  // بناء الـ nodes
  useEffect(() => {
    const initial = [{
      id:"case_center", label:caseData?.title||"القضية",
      type:"case", x:50, y:45, color:"#dc2626",
      note:caseData?.description||"", isCenter:true
    }];
    caseData?.suspects?.forEach((sus, i) => {
      const angle = (i / Math.max(caseData.suspects.length,1)) * Math.PI * 2;
      initial.push({
        id:sus.id, label:sus.name, type:"suspect",
        x:22+Math.cos(angle)*20, y:45+Math.sin(angle)*20,
        color:sus.color||COLORS[i%COLORS.length],
        note:sus.description||"", isSuspect:true,
        photo:sus.photo||null, age:sus.age||"", job:sus.job||""
      });
    });
    evidence.forEach((ev, i) => {
      const angle = (i/Math.max(evidence.length,1))*Math.PI*2 + Math.PI/4;
      initial.push({
        id:ev.id, label:ev.name, type:ev.type||"physical",
        x:50+Math.cos(angle)*35, y:45+Math.sin(angle)*32,
        color:ev.analyzed?"#22c55e":ev.type==="physical"?"#f59e0b":"#8b5cf6",
        note:ev.content||"", isEvidence:true,
        photo:CASE_IMAGES?.evidence?.[ev.id]||null, analyzed:ev.analyzed||false
      });
    });
    setNodes(initial);
  }, [evidence, caseData]);
 
  // رسم الخيوط
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = cvs.offsetWidth, H = cvs.offsetHeight;
    cvs.width = W; cvs.height = H;
    ctx.clearRect(0,0,W,H);
 
    // الخيوط المحفوظة
    conns.forEach(conn => {
      const from = nodes.find(n=>n.id===conn.from);
      const to   = nodes.find(n=>n.id===conn.to);
      if (!from||!to) return;
      const fx=(from.x/100)*W, fy=(from.y/100)*H;
      const tx=(to.x/100)*W,   ty=(to.y/100)*H;
 
      // ظل
      ctx.beginPath(); ctx.moveTo(fx+1.5,fy+1.5); ctx.lineTo(tx+1.5,ty+1.5);
      ctx.strokeStyle="rgba(0,0,0,0.5)"; ctx.lineWidth=2.5;
      ctx.setLineDash([6,4]); ctx.stroke();
 
      // الخيط
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(tx,ty);
      ctx.strokeStyle=conn.color||"#ef4444"; ctx.lineWidth=1.8;
      ctx.globalAlpha=0.85; ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha=1;
 
      // دبوس في المنتصف
      const mx=(fx+tx)/2, my=(fy+ty)/2;
      ctx.beginPath(); ctx.arc(mx,my,3,0,Math.PI*2);
      ctx.fillStyle=conn.color||"#ef4444"; ctx.fill();
    });
 
    // خيط يُرسم الآن
    if (wireRef.current.active) {
      const w = wireRef.current;
      ctx.beginPath(); ctx.moveTo(w.fromX,w.fromY); ctx.lineTo(w.toX,w.toY);
      ctx.strokeStyle="rgba(255,220,0,0.8)"; ctx.lineWidth=1.8;
      ctx.setLineDash([8,5]); ctx.stroke(); ctx.setLineDash([]);
    }
  }, [conns, nodes, forceRender]);
 
  // Socket
  useEffect(() => {
    if (!socket) return;
    const onAdded   = (d) => setConns(p=>[...p,{id:d.id||Date.now(),from:d.from,to:d.to,color:d.color}]);
    const onRemoved = ({connectionId}) => setConns(p=>p.filter(c=>c.id!==connectionId));
    socket.on("horror_connection_added",   onAdded);
    socket.on("horror_connection_removed", onRemoved);
    return () => {
      socket.off("horror_connection_added",   onAdded);
      socket.off("horror_connection_removed", onRemoved);
    };
  }, [socket]);
 
  const addConnection = (from, to) => {
    if (from === to) return;
    if (conns.find(c=>(c.from===from&&c.to===to)||(c.from===to&&c.to===from))) return;
    const color = COLORS[colorIdx % COLORS.length];
    const newConn = {id:Date.now()+Math.random(), from, to, color};
    setConns(p=>[...p,newConn]);
    socket?.emit("horror_add_connection",{roomId,playerId,from,to,color});
    setColorIdx(c=>c+1);
  };
 
  const removeConn = (connId) => {
    setConns(p=>p.filter(c=>c.id!==connId));
    socket?.emit("horror_remove_connection",{roomId,connectionId:connId});
  };
 
  // تحويل % لـ px
  const pctToPx = (node, W, H) => ({
    x: (node.x/100)*W,
    y: (node.y/100)*H,
  });
 
  // مواقع الدوائر لكل node
  const getDotPositions = (node, W, H) => {
    const cx = (node.x/100)*W;
    const cy = (node.y/100)*H;
    return {
      top:    { x: cx, y: cy - 36 },
      bottom: { x: cx, y: cy + 36 },
    };
  };
 
  const isNearDot = (mx, my, dot) =>
    Math.hypot(mx - dot.x, my - dot.y) < DOT_RADIUS + 4;
 
  // Mouse Events
  const onMouseDown = (e) => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = cvs.offsetWidth, H = cvs.offsetHeight;
 
    // فحص دوائر السحب أولاً
    for (const node of nodes) {
      const dots = getDotPositions(node, W, H);
      for (const dot of Object.values(dots)) {
        if (isNearDot(mx, my, dot)) {
          wireRef.current = { active:true, fromId:node.id, fromX:dot.x, fromY:dot.y, toX:mx, toY:my };
          forceRender(n=>n+1);
          return;
        }
      }
    }
 
    // فحص الـ nodes للسحب
    for (const node of nodes) {
      const np = pctToPx(node, W, H);
      if (Math.hypot(mx-np.x, my-np.y) < 42) {
        setSelected(node.id);
        dragRef.current = { type:"node", nodeId:node.id, lastX:mx, lastY:my };
        return;
      }
    }
  };
 
  const onMouseMove = (e) => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = cvs.offsetWidth, H = cvs.offsetHeight;
 
    if (wireRef.current.active) {
      wireRef.current.toX = mx;
      wireRef.current.toY = my;
      forceRender(n=>n+1);
      return;
    }
 
    if (dragRef.current.type === "node") {
      const dx = mx - dragRef.current.lastX;
      const dy = my - dragRef.current.lastY;
      setNodes(prev => prev.map(n =>
        n.id === dragRef.current.nodeId
          ? { ...n, x: Math.max(2,Math.min(98, n.x + (dx/W)*100)), y: Math.max(2,Math.min(98, n.y + (dy/H)*100)) }
          : n
      ));
      dragRef.current.lastX = mx;
      dragRef.current.lastY = my;
    }
  };
 
  const onMouseUp = (e) => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = cvs.offsetWidth, H = cvs.offsetHeight;
 
    if (wireRef.current.active) {
      // ابحث عن node قريب
      for (const node of nodes) {
        const dots = getDotPositions(node, W, H);
        const np = pctToPx(node, W, H);
        const nearNode = Math.hypot(mx-np.x, my-np.y) < 46;
        const nearDot  = Object.values(dots).some(d => isNearDot(mx,my,d));
        if ((nearNode || nearDot) && node.id !== wireRef.current.fromId) {
          addConnection(wireRef.current.fromId, node.id);
          break;
        }
      }
      wireRef.current.active = false;
      forceRender(n=>n+1);
    }
 
    dragRef.current = { type:null, nodeId:null };
  };
 
  const selectedNode = nodes.find(n=>n.id===selected);
 
  return (
    <>
      <style>{`
        .board-bg{background:radial-gradient(ellipse at 30% 20%,rgba(101,67,33,0.1) 0%,transparent 60%),#0d0b07}
        .cork-dots{background-image:radial-gradient(circle,rgba(101,67,33,0.18) 1px,transparent 1px);background-size:24px 24px}
        .cn{position:absolute;transform:translate(-50%,-50%);z-index:20;user-select:none}
        .cn-inner{background:rgba(8,6,3,0.92);border-radius:8px;padding:7px;text-align:center;backdrop-filter:blur(6px);min-width:70px;max-width:90px;cursor:grab;position:relative}
        .cn-inner:active{cursor:grabbing}
        .sus-p{width:46px;height:46px;border-radius:50%;object-fit:cover;margin:0 auto 4px;display:block;border:2px solid currentColor}
        .ev-t{width:38px;height:30px;border-radius:4px;object-fit:cover;margin:0 auto 3px;display:block;border:1px solid currentColor;opacity:0.85}
        .dot-handle{
          position:absolute;
          width:14px;height:14px;
          border-radius:50%;
          background:rgba(255,255,255,0.15);
          border:2px solid rgba(255,255,255,0.5);
          cursor:crosshair;
          z-index:30;
          transition:all 0.15s;
          left:50%;transform:translateX(-50%);
        }
        .dot-handle:hover{
          background:rgba(255,220,0,0.5);
          border-color:rgba(255,220,0,0.9);
          transform:translateX(-50%) scale(1.3);
        }
        .dot-top{top:-20px}
        .dot-bottom{bottom:-20px}
      `}</style>
 
      <div className="fixed inset-0 board-bg cork-dots flex flex-col"
        style={{zIndex:999999,fontFamily:"'Cairo',sans-serif"}} dir="rtl">
 
        {/* شريط العنوان */}
        <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{background:"rgba(0,0,0,0.65)",borderBottom:"1px solid rgba(201,169,110,0.12)"}}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-300">لوحة التحقيق</span>
            <span className="text-[9px] font-mono text-amber-900/40">
              {nodes.filter(n=>n.isSuspect).length} مشتبه
              &nbsp;·&nbsp;{nodes.filter(n=>n.isEvidence).length} دليل
              &nbsp;·&nbsp;{conns.length} خيط
            </span>
          </div>
          <div className="flex gap-2">
            {selectedNode && (
              <button onClick={()=>setShowNoteFor(selected)}
                className="px-3 py-1 bg-blue-950/40 border border-blue-900/30 rounded text-[10px] text-blue-400">
                📝 ملاحظة
              </button>
            )}
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded text-amber-800 hover:text-white text-xs"
              style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)"}}>
              ✕
            </button>
          </div>
        </div>
 
        {/* اللوحة */}
        <div className="relative flex-1 overflow-hidden"
          style={{cursor:"default"}}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}>
 
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
 
          {/* أزرار حذف الخيوط */}
          {conns.map(conn => {
            const from = nodes.find(n=>n.id===conn.from);
            const to   = nodes.find(n=>n.id===conn.to);
            if (!from||!to) return null;
            return (
              <button key={conn.id}
                onClick={()=>removeConn(conn.id)}
                className="absolute z-10 w-4 h-4 flex items-center justify-center rounded-full text-[8px] hover:scale-125 transition-all"
                style={{
                  left:`${(from.x+to.x)/2}%`, top:`${(from.y+to.y)/2}%`,
                  transform:"translate(-50%,-50%)",
                  background:"rgba(0,0,0,0.85)",
                  border:`1px solid ${conn.color}`,
                  color:conn.color
                }}>✕</button>
            );
          })}
 
          {/* العقد */}
          {nodes.map(node => (
            <div key={node.id} className="cn"
              style={{left:`${node.x}%`, top:`${node.y}%`, color:node.color}}>
 
              {/* دائرة سحب من فوق */}
              <div className="dot-handle dot-top" title="اسحب لربط" />
 
              {/* الكارت */}
              <div className="cn-inner"
                style={{
                  border: selected===node.id ? `2px solid ${node.color}` : `1.5px ${node.isSuspect?"dashed":"solid"} ${node.color}`,
                  boxShadow: selected===node.id ? `0 0 14px ${node.color}60` : "none"
                }}
                onClick={() => setSelected(node.id===selected ? null : node.id)}>
 
                {/* مركز القضية */}
                {node.isCenter && (
                  <>
                    <div style={{fontSize:"22px",marginBottom:"4px"}}>🔎</div>
                    <div style={{fontSize:"9px",fontWeight:"900",color:node.color,lineHeight:1.2}}>{node.label}</div>
                  </>
                )}
 
                {/* مشتبه */}
                {node.isSuspect && (
                  <>
                    {node.photo
                      ? <img src={node.photo} alt={node.label} className="sus-p" style={{borderColor:node.color}} draggable={false} onError={e=>{e.target.style.display="none"}} />
                      : <div style={{fontSize:"22px",marginBottom:"4px"}}>👤</div>
                    }
                    <div style={{fontSize:"8px",fontWeight:"700",color:node.color,lineHeight:1.2}}>{node.label}</div>
                    {node.job && <div style={{fontSize:"7px",color:"rgba(255,255,255,0.2)",marginTop:"2px"}}>{node.job}</div>}
                  </>
                )}
 
                {/* دليل */}
                {node.isEvidence && (
                  <>
                    {node.photo
                      ? <img src={node.photo} alt={node.label} className="ev-t" style={{borderColor:node.color}} draggable={false} onError={e=>{e.target.style.display="none"}} />
                      : <div style={{fontSize:"16px",marginBottom:"3px"}}>🔍</div>
                    }
                    <div style={{fontSize:"7.5px",fontWeight:"700",color:node.color,lineHeight:1.2}}>
                      {node.label.length>22 ? node.label.slice(0,20)+"…" : node.label}
                    </div>
                    {node.analyzed && <div style={{fontSize:"6px",color:"#22c55e",marginTop:"2px"}}>✅ محلل</div>}
                  </>
                )}
              </div>
 
              {/* دائرة سحب من تحت */}
              <div className="dot-handle dot-bottom" title="اسحب لربط" />
            </div>
          ))}
 
          {/* نص فارغ */}
          {nodes.filter(n=>n.isEvidence).length===0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-amber-900/20 text-xs text-center leading-loose">
                المشتبهون جاهزون<br/>اجمع الأدلة وستظهر هنا<br/>
                <span style={{fontSize:"9px"}}>اسحب من الدوائر فوق وتحت كل صورة لربط الخيوط</span>
              </p>
            </div>
          )}
        </div>
 
        {/* Modal ملاحظة */}
        {showNoteFor && (() => {
          const n = nodes.find(x=>x.id===showNoteFor);
          return (
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
              onClick={()=>setShowNoteFor(null)}>
              <div className="rounded p-5 max-w-sm w-full"
                style={{background:"#0f0d08",border:"1px solid rgba(201,169,110,0.2)"}}
                onClick={e=>e.stopPropagation()}>
                {n?.photo && (
                  <div className="flex gap-3 mb-3 p-2 rounded" style={{background:`${n.color}11`}}>
                    <img src={n.photo} alt={n.label} className="w-12 h-12 rounded object-cover" style={{border:`1px solid ${n.color}44`}} />
                    <div className="text-xs" style={{color:n.color}}>
                      <p className="font-black">{n.label}</p>
                      <p className="text-[9px] opacity-50">{n.job||n.type}</p>
                    </div>
                  </div>
                )}
                <h4 className="text-amber-400 font-bold text-xs mb-2">📝 ملاحظتك</h4>
                <textarea className="w-full rounded p-3 text-[10px] resize-none" rows="4"
                  style={{background:"rgba(0,0,0,0.5)",border:"1px solid rgba(201,169,110,0.15)",color:"rgba(201,169,110,0.8)"}}
                  value={n?.note||""}
                  onChange={e=>setNodes(prev=>prev.map(x=>x.id===showNoteFor?{...x,note:e.target.value}:x))}
                  placeholder="أضف ملاحظتك..." />
                <button onClick={()=>setShowNoteFor(null)} className="mt-3 w-full py-2 rounded text-xs font-bold"
                  style={{background:"rgba(139,0,0,0.4)",border:"1px solid rgba(220,50,50,0.3)",color:"#fca5a5"}}>
                  حفظ
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}


function ReportsPanel({ onClose, forensicReports, caseId }) {
  const [activeTab, setActiveTab] = useState("police");
  const [activeWitness, setActiveWitness] = useState(null);
 
  const policeReport = caseId === "case_hotel_01" ? POLICE_REPORT_hotel_01 : null;
  const initialForensic = caseId === "case_hotel_01" ? FORENSIC_INITIAL_hotel_01 : null;
 
  const credibilityColor = (text) => {
    if (text.includes("إغفال متعمد") || text.includes("دفاعية")) return "#dc2626";
    if (text.includes("تفاصيل جوهرية") || text.includes("ما لم تقله")) return "#f59e0b";
    return "#22c55e";
  };
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .rp-container {
          font-family: 'Cairo', sans-serif;
          background: linear-gradient(180deg,#0a0804 0%,#070503 100%);
        }
        .rp-tab {
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 6px 6px 0 0;
          border: 1px solid transparent;
          border-bottom: none;
          cursor: pointer;
          transition: all 0.15s;
          color: rgba(201,169,110,0.4);
          background: transparent;
        }
        .rp-tab.active {
          background: rgba(15,10,4,0.95);
          border-color: rgba(201,169,110,0.15);
          color: #c9a96e;
        }
        .rp-tab:not(.active):hover {
          color: rgba(201,169,110,0.65);
        }
        .rp-paper {
          background: #f5f0e4;
          background-image: repeating-linear-gradient(
            transparent, transparent 24px,
            rgba(0,0,50,0.04) 24px, rgba(0,0,50,0.04) 25px
          );
          border-radius: 2px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4), inset 0 0 30px rgba(180,140,80,0.05);
          color: #1a1208;
          font-family: serif;
        }
        .rp-stamp {
          font-family: 'Courier New', monospace;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .rp-section-title {
          font-size: 10px;
          font-weight: 700;
          color: #8B1A1A;
          border-bottom: 1px solid rgba(139,26,26,0.3);
          padding-bottom: 4px;
          margin-bottom: 8px;
          font-family: serif;
          letter-spacing: 0.05em;
        }
        .rp-text {
          font-size: 9.5px;
          line-height: 1.75;
          color: #2c1a0a;
          font-family: serif;
          white-space: pre-line;
        }
        .rp-witness-btn {
          background: rgba(139,26,26,0.06);
          border: 1px solid rgba(139,26,26,0.15);
          border-radius: 6px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: right;
          width: 100%;
        }
        .rp-witness-btn:hover {
          background: rgba(139,26,26,0.12);
          border-color: rgba(139,26,26,0.3);
        }
        .rp-forensic-card {
          background: rgba(139,26,26,0.05);
          border: 1px solid rgba(139,26,26,0.2);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
        }
        .rp-finding {
          border-right: 2px solid rgba(139,26,26,0.4);
          padding-right: 10px;
          margin-bottom: 8px;
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .rp-slide { animation: slideUp 0.25s ease; }
        .rp-badge {
          display: inline-block;
          font-size: 8px;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
      `}</style>
 
      <div className="rp-container fixed inset-0 z-[200] flex flex-col" dir="rtl">
 
        {/* رأس */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{borderBottom:"1px solid rgba(201,169,110,0.1)", background:"rgba(0,0,0,0.5)"}}>
          <div className="flex items-center gap-2">
            <span className="text-lg">💼</span>
            <div>
              <p className="text-[9px] font-mono tracking-widest text-red-900/50">CASE FILES</p>
              <h2 className="text-sm font-black" style={{color:"#c9a96e"}}>حقيبة التحقيق</h2>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:text-white transition-colors"
            style={{background:"rgba(255,255,255,0.05)", color:"rgba(201,169,110,0.4)"}}>
            ✕
          </button>
        </div>
 
        {/* تبويبات */}
        <div className="flex gap-1 px-3 pt-3 flex-shrink-0">
          <button
            onClick={() => { setActiveTab("police"); setActiveWitness(null); }}
            className={`rp-tab ${activeTab==="police"?"active":""}`}>
            محضر البوليس
          </button>
          <button
            onClick={() => { setActiveTab("forensic"); setActiveWitness(null); }}
            className={`rp-tab ${activeTab==="forensic"?"active":""}`}>
            الطب الشرعي
            {forensicReports?.length > 0 && (
              <span className="mr-1.5 inline-block w-4 h-4 rounded-full text-[8px] font-black text-center leading-4"
                style={{background:"#dc2626", color:"white"}}>
                {forensicReports.length}
              </span>
            )}
          </button>
        </div>
 
        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto px-3 pb-6"
          style={{borderTop:"1px solid rgba(201,169,110,0.1)"}}>
 
          {/* ── محضر البوليس ── */}
          {activeTab === "police" && policeReport && (
            <div className="rp-slide">
              {/* لو في شاهد محدد */}
              {activeWitness ? (
                <div className="rp-paper mt-3 p-4">
                  {/* رأس الشاهد */}
                  <button onClick={() => setActiveWitness(null)}
                    className="flex items-center gap-1.5 mb-4 text-[9px] font-bold"
                    style={{color:"rgba(139,26,26,0.6)"}}>
                    → رجوع للمحضر
                  </button>
 
                  <div className="flex items-start justify-between mb-3 pb-2"
                    style={{borderBottom:"1px solid rgba(139,26,26,0.2)"}}>
                    <div>
                      <p className="rp-stamp text-[9px]" style={{color:"#8B1A1A"}}>
                        أقوال الشاهد — {activeWitness.id}
                      </p>
                      <p className="text-sm font-black mt-0.5" style={{color:"#1a0a0a"}}>{activeWitness.name}</p>
                      <p className="text-[9px]" style={{color:"rgba(139,26,26,0.6)", fontFamily:"serif"}}>
                        {activeWitness.role} — {activeWitness.age} سنة — {activeWitness.nationality}
                      </p>
                    </div>
                    <div className="rp-badge"
                      style={{
                        background:`${credibilityColor(activeWitness.credibility)}18`,
                        color: credibilityColor(activeWitness.credibility),
                        border:`1px solid ${credibilityColor(activeWitness.credibility)}40`,
                      }}>
                      {credibilityColor(activeWitness.credibility) === "#22c55e" ? "موثوق" :
                       credibilityColor(activeWitness.credibility) === "#f59e0b" ? "منقوص" : "مشكوك فيه"}
                    </div>
                  </div>
 
                  <p className="rp-text mb-4">{activeWitness.statement}</p>
 
                  {/* تقييم المحقق */}
                  <div className="mt-3 p-2.5 rounded"
                    style={{background:"rgba(139,26,26,0.08)", border:"1px solid rgba(139,26,26,0.2)"}}>
                    <p className="text-[8.5px] font-bold mb-1" style={{color:"#8B1A1A", fontFamily:"serif"}}>
                      تقييم المحقق:
                    </p>
                    <p className="text-[9px] italic leading-relaxed" style={{color:"rgba(139,26,26,0.7)", fontFamily:"serif"}}>
                      {activeWitness.credibility}
                    </p>
                  </div>
                </div>
              ) : (
                /* المحضر الرئيسي */
                <div>
                  {/* رأس رسمي */}
                  <div className="rp-paper mt-3 p-4 mb-3">
                    <div className="flex items-center justify-between mb-3 pb-2"
                      style={{borderBottom:"2px solid rgba(139,26,26,0.3)"}}>
                      <div>
                        <p className="rp-stamp text-[8px]" style={{color:"#8B1A1A"}}>
                          وزارة الداخلية — قسم شرطة النيل
                        </p>
                        <p className="text-base font-black mt-0.5" style={{color:"#1a0a0a"}}>محضر رقم {policeReport.caseNumber}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] font-mono" style={{color:"rgba(139,26,26,0.5)"}}>{policeReport.date}</p>
                        <p className="text-[8px] font-mono" style={{color:"rgba(139,26,26,0.5)"}}>{policeReport.time}</p>
                      </div>
                    </div>
 
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-[9px]" style={{fontFamily:"serif"}}>
                      {[
                        ["المحقق المسؤول", policeReport.officer],
                        ["موقع الحادثة", policeReport.location],
                      ].map(([l,v]) => (
                        <div key={l} className="col-span-2 border-b pb-0.5" style={{borderColor:"rgba(139,26,26,0.1)"}}>
                          <span style={{color:"rgba(139,26,26,0.5)"}}>{l}: </span>
                          <span className="font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
 
                    <p className="rp-section-title">وصف الواقعة</p>
                    <p className="rp-text">{policeReport.incident}</p>
                  </div>
 
                  {/* أقوال الشهود */}
                  <div className="rp-paper p-4 mb-3">
                    <p className="rp-section-title">أقوال الشهود ({policeReport.witnesses.length} شهود)</p>
                    <p className="text-[8.5px] mb-3 italic" style={{color:"rgba(139,26,26,0.5)", fontFamily:"serif"}}>
                      اضغط على الشاهد لقراءة أقواله كاملة
                    </p>
                    <div className="space-y-2">
                      {policeReport.witnesses.map(w => (
                        <button key={w.id} onClick={() => setActiveWitness(w)}
                          className="rp-witness-btn">
                          <div className="flex items-center justify-between">
                            <div className="text-right">
                              <p className="text-[10px] font-black" style={{color:"#1a0a0a"}}>{w.name}</p>
                              <p className="text-[8.5px]" style={{color:"rgba(139,26,26,0.5)", fontFamily:"serif"}}>
                                {w.role}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rp-badge"
                                style={{
                                  background:`${credibilityColor(w.credibility)}15`,
                                  color: credibilityColor(w.credibility),
                                  border:`1px solid ${credibilityColor(w.credibility)}35`,
                                }}>
                                {credibilityColor(w.credibility)==="#22c55e"?"موثوق":
                                 credibilityColor(w.credibility)==="#f59e0b"?"منقوص":"مشكوك"}
                              </span>
                              <span style={{color:"rgba(139,26,26,0.3)", fontSize:"10px"}}>←</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
 
                  {/* خلاصة */}
                  <div className="rp-paper p-4">
                    <p className="rp-section-title">خلاصة المحقق</p>
                    <p className="rp-text">{policeReport.conclusion}</p>
                  </div>
                </div>
              )}
            </div>
          )}
 
          {/* ── تقارير الطب الشرعي ── */}
          {activeTab === "forensic" && (
            <div className="rp-slide">
 
              {/* التقرير الأولي — موجود دايماً */}
              {initialForensic && (
                <div className="rp-paper mt-3 p-4 mb-3">
                  <div className="flex items-start justify-between mb-3 pb-2"
                    style={{borderBottom:"2px solid rgba(139,26,26,0.3)"}}>
                    <div>
                      <p className="rp-stamp text-[8px]" style={{color:"#8B1A1A"}}>
                        تقرير طب شرعي — أولي
                      </p>
                      <p className="text-sm font-black mt-0.5" style={{color:"#1a0a0a"}}>
                        رقم {initialForensic.reportNumber}
                      </p>
                    </div>
                    <div className="rp-badge"
                      style={{background:"rgba(245,158,11,0.15)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.3)"}}>
                      أولي
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3 text-[9px]" style={{fontFamily:"serif"}}>
                    {[
                      ["الطبيب الشرعي", initialForensic.examiner],
                      ["الضحية", initialForensic.deceasedName + " — " + initialForensic.deceasedAge + " سنة"],
                      ["تاريخ الفحص", initialForensic.date + " — " + initialForensic.time],
                      ["وقت الوفاة", initialForensic.time_of_death],
                    ].map(([l,v]) => (
                      <div key={l} className="col-span-2 border-b pb-0.5" style={{borderColor:"rgba(139,26,26,0.1)"}}>
                        <span style={{color:"rgba(139,26,26,0.5)"}}>{l}: </span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
 
                  {[
                    {title:"الفحص الخارجي", content: initialForensic.externalExamination},
                    {title:"الفحص الداخلي — التشريح", content: initialForensic.internalExamination},
                    {title:"التحليل الكيميائي والسمي", content: initialForensic.toxicology},
                    {title:"ملاحظات إضافية", content: initialForensic.notes},
                  ].map(section => (
                    <div key={section.title} className="rp-finding mb-3">
                      <p className="rp-section-title">{section.title}</p>
                      <p className="rp-text">{section.content}</p>
                    </div>
                  ))}
 
                  {/* سبب الوفاة */}
                  <div className="p-3 rounded mt-2"
                    style={{background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)"}}>
                    <p className="rp-section-title" style={{color:"#8B1A1A"}}>سبب الوفاة المبدئي</p>
                    <p className="rp-text font-bold">{initialForensic.cause_of_death}</p>
                  </div>
                </div>
              )}
 
              {/* تقارير المختبر — بتتضاف لما الأدلة تتحلل */}
              {forensicReports && forensicReports.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[9px] font-mono px-1 pt-1" style={{color:"rgba(201,169,110,0.35)"}}>
                    تقارير تحليل الأدلة ({forensicReports.length})
                  </p>
                  {forensicReports.map((report, i) => (
                    <div key={i} className="rp-paper p-4">
                      <div className="flex items-start justify-between mb-2 pb-2"
                        style={{borderBottom:"1px solid rgba(139,26,26,0.2)"}}>
                        <div>
                          <p className="rp-stamp text-[8px]" style={{color:"#8B1A1A"}}>تقرير مختبر جنائي</p>
                          <p className="text-[11px] font-black mt-0.5" style={{color:"#1a0a0a"}}>{report.title}</p>
                        </div>
                        <div className="rp-badge"
                          style={{background:"rgba(34,197,94,0.12)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.3)"}}>
                          مكتمل
                        </div>
                      </div>
                      <p className="rp-text mb-3">{report.content}</p>
                      {report.conclusion && (
                        <div className="p-2.5 rounded"
                          style={{background:"rgba(139,26,26,0.08)",border:"1px solid rgba(139,26,26,0.2)"}}>
                          <p className="text-[8.5px] font-bold mb-1" style={{color:"#8B1A1A",fontFamily:"serif"}}>
                            الاستنتاج:
                          </p>
                          <p className="rp-text text-[9px]">{report.conclusion}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[10px]" style={{color:"rgba(201,169,110,0.25)",fontFamily:"serif"}}>
                    لم يُرسل أي دليل للمختبر بعد
                  </p>
                  <p className="text-[9px] mt-1" style={{color:"rgba(201,169,110,0.15)",fontFamily:"serif"}}>
                    أرسل الأدلة من ملف الأدلة للحصول على تقارير تفصيلية
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
// 12. SOLVE CASE PANEL
// ============================================================
function SolveCasePanel({ caseData, evidenceCount, onSolve, onClose }) {
  const [answers, setAnswers] = useState({});
  const canSolve = evidenceCount >= (caseData?.requiredEvidence || 3);
  const allAnswered = caseData?.questions?.every(q => answers[q.id] !== undefined);
  return (
    <div className="fixed inset-0 bg-black/97 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm" dir="rtl">
      <div className="bg-gray-950 border border-yellow-900/40 rounded-2xl w-full max-w-md p-6 my-4 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-yellow-400 font-black text-lg">حل القضية</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl">x</button>
        </div>
        {!canSolve && (
          <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-3.5 mb-5">
            <p className="text-red-400 text-sm">تحتاج {(caseData?.requiredEvidence||3)-evidenceCount} ادلة اضافية</p>
          </div>
        )}
        <div className="space-y-6">
          {caseData?.questions?.map(q => (
            <div key={q.id}>
              <p className="text-white text-sm font-bold mb-3">{q.text}</p>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <button key={idx} onClick={()=>setAnswers(a=>({...a,[q.id]:idx}))}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm border transition-all ${answers[q.id]===idx?"bg-yellow-950/60 border-yellow-500/70 text-yellow-200":"bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>canSolve&&allAnswered&&onSolve(answers)} disabled={!canSolve||!allAnswered}
          className="mt-7 w-full py-3.5 rounded-xl font-black text-black transition-all disabled:opacity-25 disabled:cursor-not-allowed bg-yellow-400 hover:bg-yellow-300 text-sm">
          تقديم الحل النهائي
        </button>
      </div>
    </div>
  );
}

// ── 360 Viewer Hook ──────────────────────────────────────────
function use360Viewer(canvasRef, imageUrl, lightOn) {
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const frameRef = useRef(null);
  const bobRef = useRef({ time: 0, active: false });
  const transRef = useRef({ fading: false, opacity: 1 });
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(0);
  const zoomRef = useRef(75); // FOV
  const targetZoomRef = useRef(75);
 
  // إنشاء المشهد
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
 
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    rendererRef.current = renderer;
 
    const scene = new THREE.Scene();
    sceneRef.current = scene;
 
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;
 
    // كرة مقلوبة من الداخل
    const geometry = new THREE.SphereGeometry(50, 64, 32);
    geometry.scale(-1, 1, 1); // نقلب الكرة عشان نتفرج من جوا
 
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
    });
    meshRef.current = new THREE.Mesh(geometry, material);
    scene.add(meshRef.current);
 
    // Animate loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
 
      // Smooth camera rotation
      yawRef.current += (targetYawRef.current - yawRef.current) * 0.08;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * 0.08;
      zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.08;
 
      // Camera Bobbing
      if (bobRef.current.active) {
        bobRef.current.time += 0.08;
        const bob = Math.sin(bobRef.current.time * 3) * 0.008;
        camera.position.y = bob;
        if (bobRef.current.time > Math.PI * 2) {
          bobRef.current.time = 0;
          bobRef.current.active = false;
          camera.position.y = 0;
        }
      }
 
      // Apply rotation
      camera.rotation.order = "YXZ";
      camera.rotation.y = yawRef.current;
      camera.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchRef.current));
      camera.fov = zoomRef.current;
      camera.updateProjectionMatrix();
 
      renderer.render(scene, camera);
    };
    animate();
 
    // Resize
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
 
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
    };
  }, [canvasRef]);
 
  // تحميل الصورة مع fade
  useEffect(() => {
    if (!meshRef.current || !imageUrl) return;
    const material = meshRef.current.material;
 
    // Fade out
    const fadeOut = setInterval(() => {
      material.opacity = Math.max(0, material.opacity - 0.08);
      if (material.opacity <= 0) {
        clearInterval(fadeOut);
        // بدّل الصورة
        const loader = new THREE.TextureLoader();
        loader.load(imageUrl, (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          material.map = texture;
          material.needsUpdate = true;
          // Fade in
          const fadeIn = setInterval(() => {
            material.opacity = Math.min(1, material.opacity + 0.08);
            if (material.opacity >= 1) clearInterval(fadeIn);
          }, 16);
        });
      }
    }, 16);
    return () => clearInterval(fadeOut);
  }, [imageUrl]);
 
  // brightness بناءً على النور
  useEffect(() => {
    if (!meshRef.current) return;
    const target = lightOn ? 1.0 : 0.0;
    const material = meshRef.current.material;
    // نستخدم color لتغيير الـ brightness
    const interval = setInterval(() => {
      const current = material.color.r;
      const next = current + (target - current) * 0.1;
      material.color.setScalar(next);
      if (Math.abs(next - target) < 0.01) {
        material.color.setScalar(target);
        clearInterval(interval);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [lightOn]);
 
  // Gyroscope / Mouse control
  const handleOrientation = useCallback((gamma, beta) => {
    targetYawRef.current = (gamma / 90) * Math.PI * 0.8;
    targetPitchRef.current = ((beta - 45) / 90) * Math.PI * 0.4;
    // Zoom بالإمالة للأمام
    const normalizedBeta = -(beta - 45) / 90;
    targetZoomRef.current = Math.max(40, Math.min(90, 75 + normalizedBeta * 20));
  }, []);
 
  const handleMouseDrag = useCallback((dx, dy) => {
    targetYawRef.current -= dx * 0.003;
    targetPitchRef.current -= dy * 0.003;
  }, []);
 
  const triggerBob = useCallback(() => {
    bobRef.current = { time: 0, active: true };
  }, []);
 
  // تحويل نقطة 2D على الشاشة لزاوية في المشهد
  const screenToAngles = useCallback((x, y, canvasW, canvasH) => {
    return {
      yaw: yawRef.current + ((x / canvasW) - 0.5) * (cameraRef.current?.fov || 75) * 0.017,
      pitch: pitchRef.current - ((y / canvasH) - 0.5) * (cameraRef.current?.fov || 75) * 0.017,
    };
  }, []);
 
  return { handleOrientation, handleMouseDrag, triggerBob, screenToAngles, yawRef, pitchRef };
}

// ============================================================
// 13. GAME SCREEN
// ============================================================
function GameScreen({ socket, initData, onExit, audio }) {
  const { playerId, caseData, roomState, myState, collectedEvidence: initialEvidence, isAdmin } = initData;
  const roomId = roomState.roomId;
 
  const canvasRef = useRef(null);
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const [isMobile, setIsMobile] = useState(false);
 
  const [lightMode, setLightMode] = useState("off");
  const [powerLevel, setPowerLevel] = useState(2);
  const [roomLightOn, setRoomLightOn] = useState(roomState.lightOn || false);
  const [lightFading, setLightFading] = useState(false);
  const [flashPos, setFlashPos] = useState({ x: 50, y: 50 });
 
  const [gameState, setGameState] = useState(roomState.gameState);
  const [currentNode, setCurrentNode] = useState(myState.currentNode);
  const [evidence, setEvidence] = useState(initialEvidence || []);
  const [evHere, setEvHere] = useState([]);
  const [interactablesHere, setInteractablesHere] = useState([]);
  const [analyzedEvidence, setAnalyzedEvidence] = useState([]);
  const [allEvidenceCollected, setAllEvidenceCollected] = useState(false);
 
  const [notif, setNotif] = useState(null);
  const [caseResult, setCaseResult] = useState(null);
  const [showRoomLabel, setShowRoomLabel] = useState(false);
  const [roomLabel, setRoomLabel] = useState("");
  const [nodeTransition, setNodeTransition] = useState(false);
 
  const [showEvidence, setShowEvidence] = useState(false);
  const [showSolve, setShowSolve] = useState(false);
  const [showCrimeBoard, setShowCrimeBoard] = useState(false);
  const [showReport, setShowReport] = useState(true);
  const [reportPage, setReportPage] = useState(0);
  const [showPlaces, setShowPlaces] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [currentNPC, setCurrentNPC] = useState(null);
  const [showNPCDialog, setShowNPCDialog] = useState(false);
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showCaseChange, setShowCaseChange] = useState(false);
  const [showReports, setShowReports] = useState(false);
 
  const lastClickRef = useRef(0);
  const nodeConnections = caseData?.map?.[currentNode]?.connections || [];
 
  // الصورة الحالية
  const imageUrl = roomLightOn
    ? (CASE_IMAGES.locations_lit[currentNode] || CASE_IMAGES.locations_dark[currentNode] || CASE_IMAGES.locations_dark.hotel_entrance)
    : (CASE_IMAGES.locations_dark[currentNode] || CASE_IMAGES.locations_dark.hotel_entrance);
 
  // Three.js 360 Viewer
  const { handleOrientation, handleMouseDrag, triggerBob, screenToAngles } = use360Viewer(canvasRef, imageUrl, roomLightOn);
 
  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);
 
  // Gyroscope
  useEffect(() => {
    if (!isMobile) return;
    const onOrient = (e) => {
      handleOrientation(e.gamma || 0, e.beta || 0);
      // Zoom بالإمالة
      const beta = e.beta || 45;
      const normalizedBeta = -(beta - 45) / 90;
      // Flash position
      setFlashPos({
        x: Math.max(10, Math.min(90, 50 + (e.gamma || 0) / 90 * 40)),
        y: Math.max(10, Math.min(90, 50 + normalizedBeta * 30)),
      });
    };
    if (!DeviceOrientationEvent?.requestPermission) {
      window.addEventListener("deviceorientation", onOrient);
    }
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [isMobile, handleOrientation]);
 
  // Mouse drag على الـ canvas
  const onMouseDown = useCallback((e) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
  }, []);
 
  const onMouseMove = useCallback((e) => {
    if (!dragRef.current.dragging) {
      // Flash position بالماوس
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setFlashPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
      return;
    }
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    handleMouseDrag(dx, dy);
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  }, [handleMouseDrag]);
 
  const onMouseUp = useCallback(() => {
    dragRef.current.dragging = false;
  }, []);
 
  const showNtf = useCallback((text, type = "info", ms = 3500) => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), ms);
  }, []);
 
  const handleMove = useCallback((targetNode) => {
    // Node Transition — fade out/in
    setNodeTransition(true);
    setTimeout(() => {
      socket.emit("horror_move", { roomId, playerId, targetNode });
    }, 300);
  }, [socket, roomId, playerId]);
 
  const handleLightSwitch = useCallback((interactableId) => {
    if (lightFading) return;
    setLightFading(true);
    setTimeout(() => {
      socket.emit("horror_interact", { roomId, playerId, interactableId });
    }, 200);
    setTimeout(() => setLightFading(false), 600);
  }, [lightFading, socket, roomId, playerId]);
 
  const handleCanvasClick = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    let clientX, clientY;
    if (e.type === "touchend") {
      const touch = e.changedTouches?.[0];
      if (!touch) return;
      clientX = touch.clientX; clientY = touch.clientY;
    } else {
      clientX = e.clientX; clientY = e.clientY;
    }
    const clickX = ((clientX - rect.left) / rect.width) * 100;
    const clickY = ((clientY - rect.top) / rect.height) * 100;
 
    // فحص interactables
    for (const inter of interactablesHere) {
      if (!inter.x || !inter.y || !inter.radius) continue;
      const dist = Math.hypot(clickX - inter.x, clickY - inter.y);
      if (dist < inter.radius) {
        audio.playClick();
        if (inter.type === "light_switch") {
          handleLightSwitch(inter.id);
        } else if (inter.type === "npc") {
          const npcData = caseData?.npcs?.find(n => n.id === inter.npcId);
          if (npcData) { setCurrentNPC(npcData); setShowNPCDialog(true); }
        } else {
          socket.emit("horror_interact", { roomId, playerId, interactableId: inter.id });
        }
        return;
      }
    }
 
    // فحص أدلة
    if (lightMode === "off") { showNtf("شغل الكشاف اولا", "warning", 1500); return; }
    const now = Date.now();
    if (now - lastClickRef.current < 500) return;
    lastClickRef.current = now;
    for (const ev of evHere) {
      if (!ev.position) continue;
      const dist = Math.hypot(clickX - ev.position.x, clickY - ev.position.y);
      if (dist < (ev.radius || 8)) {
        setSelectedEvidence(ev);
        setShowEvidenceModal(true);
        socket.emit("horror_examine", { roomId, playerId, evidenceId: ev.id, toolUsed: lightMode === "uv" ? "uv" : "flashlight" });
        return;
      }
    }
  }, [interactablesHere, evHere, lightMode, socket, roomId, playerId, audio, showNtf, handleLightSwitch, caseData]);
 
  // Ambient sound
  useEffect(() => {
    const nodeData = caseData?.map?.[currentNode];
    if (nodeData?.ambient) {
      audio.stopAmbientSounds();
      audio.playAmbientSound(nodeData.ambient, 0.04, 0, 0, 0);
    }
    return () => audio.stopAmbientSounds();
  }, [currentNode, caseData, audio]);
 
  // Socket events
  useEffect(() => {
    socket.on("horror_game_started", () => setGameState("playing"));
 
    socket.on("horror_moved", ({ node, nodeData, evidenceHere, interactables }) => {
      setCurrentNode(node);
      setEvHere(evidenceHere || []);
      setInteractablesHere(interactables || []);
      audio.playFootsteps();
      triggerBob();
      // Room label
      setRoomLabel(nodeData?.name || node);
      setShowRoomLabel(true);
      setTimeout(() => setShowRoomLabel(false), 2000);
      // End transition
      setTimeout(() => setNodeTransition(false), 400);
      socket.emit("horror_get_room_state", { roomId });
    });
 
    socket.on("horror_room_state", ({ roomState: rs }) => {
      if (rs) {
        setRoomLightOn(rs.lightOn || false);
        setAllEvidenceCollected(rs.allEvidenceCollected || false);
        if (rs.analyzedEvidence) setAnalyzedEvidence(rs.analyzedEvidence);
      }
    });
 
    socket.on("horror_room_light_toggled", ({ lightOn }) => {
      setRoomLightOn(lightOn);
    });
 
    socket.on("horror_evidence_found", ({ evidence: ev }) => {
      setEvidence(e => [...e, ev]);
      setEvHere(prev => prev.filter(e => e.id !== ev.id));
      showNtf("تم العثور على: " + ev.name, "success");
      audio.playClick();
    });
 
    socket.on("horror_evidence_collected", ({ evidence: ev }) => {
      setEvidence(e => e.find(x => x.id === ev.id) ? e : [...e, ev]);
    });
 
    socket.on("horror_evidence_sent_to_lab", ({ evidence: ev }) => {
      setEvidence(e => e.filter(x => x.id !== ev.id));
      showNtf(ev.name + " في المختبر", "info");
    });
 
    socket.on("horror_evidence_analyzed", ({ evidence: ev, report }) => {
      setAnalyzedEvidence(prev => [...prev, { ...ev, analyzed: true, analysisResult: report }]);
      showNtf("تم تحليل " + ev.name, "success", 5000);
    });
 
    socket.on("horror_examine_result", ({ found, message, wrongTool }) => {
      if (!found) showNtf(message, wrongTool ? "warning" : "info");
    });
 
    socket.on("horror_all_evidence_collected", () => setAllEvidenceCollected(true));
    socket.on("horror_puzzle_solved", ({ message }) => { showNtf(message, "success", 4000); setShowPuzzle(false); });
    socket.on("horror_puzzle_failed", ({ message }) => showNtf(message, "danger", 2000));
    socket.on("horror_case_solved", ({ solvedBy, score, stars, timeTaken }) => setCaseResult({ solvedBy, score, stars, timeTaken }));
    socket.on("horror_solve_failed", ({ message, score }) => showNtf(message + " - " + score + "%", "danger", 5000));
    socket.on("horror_solve_rejected", ({ reason }) => showNtf(reason, "warning"));
    socket.on("horror_error", ({ message }) => showNtf(message, "warning"));
 
    socket.on("horror_case_changed", ({ message }) => {
      showNtf(message, "info", 5000);
      setEvidence([]); setEvHere([]); setAnalyzedEvidence([]);
      setAllEvidenceCollected(false); setGameState("waiting"); setRoomLightOn(false);
      socket.emit("horror_get_room_state", { roomId });
    });
 
    return () => {
      ["horror_game_started","horror_moved","horror_room_state","horror_room_light_toggled",
       "horror_evidence_found","horror_evidence_collected","horror_evidence_sent_to_lab",
       "horror_evidence_analyzed","horror_examine_result","horror_all_evidence_collected",
       "horror_puzzle_solved","horror_puzzle_failed","horror_case_solved","horror_solve_failed",
       "horror_solve_rejected","horror_error","horror_case_changed"].forEach(ev => socket.off(ev));
    };
  }, [socket, audio, showNtf, triggerBob, roomId]);
 
  if (caseResult) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" dir="rtl"
        style={{ fontFamily: "'Cairo',sans-serif" }}>
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-5">★</div>
          <h1 className="text-3xl font-black text-yellow-400 mb-2">تم حل القضية!</h1>
          <p className="text-gray-500 mb-1 text-sm">حلها: {caseResult.solvedBy}</p>
          <div className="flex justify-center gap-1 my-4">
            {[1,2,3,4,5].map(s => <span key={s} className={`text-3xl ${s<=caseResult.stars?"text-yellow-400":"text-gray-800"}`}>★</span>)}
          </div>
          <p className="text-green-400 text-sm font-bold">دقة: {caseResult.score}%</p>
          <p className="text-gray-600 text-xs mt-1">الوقت: {Math.round((caseResult.timeTaken||0)/1000)} ث</p>
          <button onClick={() => window.location.reload()}
            className="mt-8 px-8 py-3.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-black text-sm">
            قضية جديدة
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-black select-none"
      style={{ position:"fixed", inset:0, overflow:"hidden", fontFamily:"'Cairo',sans-serif", zIndex:9999 }}
      dir="rtl">
 
      {/* Modals */}
      {showReport && <CrimeReport onClose={() => setShowReport(false)} savedPage={reportPage} onPageChange={setReportPage} />}
      {showCrimeBoard && <CrimeBoardScreen evidence={[...evidence,...analyzedEvidence]} caseData={caseData} onClose={() => setShowCrimeBoard(false)} socket={socket} roomId={roomId} playerId={playerId} />}
      {showPlaces && <PlacesMenu connections={nodeConnections} nodeMap={caseData?.map||{}} onMove={handleMove} onClose={() => setShowPlaces(false)} />}
      {showNPCDialog && currentNPC && <NPCDialog npc={currentNPC} onClose={() => { setShowNPCDialog(false); setCurrentNPC(null); }} socket={socket} roomId={roomId} playerId={playerId} />}
      {showPuzzle && activePuzzle && <NumberPadLock puzzle={activePuzzle} onClose={() => { setShowPuzzle(false); setActivePuzzle(null); }} socket={socket} roomId={roomId} playerId={playerId} />}
      {showEvidenceModal && selectedEvidence && <EvidenceModal evidence={selectedEvidence} onClose={() => { setShowEvidenceModal(false); setSelectedEvidence(null); }} />}
      {showCaseChange && (
        <CaseChangeOverlay
          onClose={() => setShowCaseChange(false)}
          onConfirm={(caseId) => {
            setShowCaseChange(false);
            socket.emit("horror_change_case", { roomId, playerId, caseId });
          }}
        />
      )}

      {showReports && (
        <ReportsPanel
          onClose={() => setShowReports(false)}
          forensicReports={analyzedEvidence.map(ev => ev.analysisResult).filter(Boolean)}
          caseId={roomState.caseId}
        />
      )}  
 
      {/* Three.js Canvas — 360 viewer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: nodeTransition ? 0 : 1,
          transition: "opacity 0.35s ease",
          cursor: dragRef.current?.dragging ? "grabbing" : "grab",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={handleCanvasClick}
        onTouchEnd={handleCanvasClick}
      />
 
      {/* Flashlight / UV / Dark Overlay */}
      <FlashlightOverlay mode={lightMode} pos={flashPos} power={powerLevel} lightOn={roomLightOn} />
 
      {/* نقط تفاعلية — hotspots */}
      {!nodeTransition && interactablesHere.map(inter => (
        <div
          key={inter.id}
          className="absolute z-20"
          style={{
            left: `${inter.x}%`,
            top: `${inter.y}%`,
            transform: "translate(-50%,-50%)",
            width: `${(inter.radius || 8) * 1.5}vw`,
            height: `${(inter.radius || 8) * 1.5}vw`,
            cursor: "pointer",
            // مخفي تماماً — بس قابل للضغط
            background: "transparent",
          }}
          onClick={() => {
            if (inter.type === "light_switch") {
              handleLightSwitch(inter.id);
            } else if (inter.type === "npc") {
              const npcData = caseData?.npcs?.find(n => n.id === inter.npcId);
              if (npcData) { setCurrentNPC(npcData); setShowNPCDialog(true); }
            } else {
              socket.emit("horror_interact", { roomId, playerId, interactableId: inter.id });
            }
          }}
        />
      ))}
 
      {/* نقط الأدلة */}
      {lightMode !== "off" && !nodeTransition && evHere.map(ev => ev.position && (
        <div key={ev.id} className="absolute z-20 pointer-events-none"
          style={{ left:`${ev.position.x}%`, top:`${ev.position.y}%`, transform:"translate(-50%,-50%)" }}>
          <div className="w-7 h-7 rounded-full border-2 animate-ping"
            style={{ borderColor: lightMode==="uv"?"rgba(167,139,250,0.9)":"rgba(251,191,36,0.9)", background: lightMode==="uv"?"rgba(167,139,250,0.15)":"rgba(251,191,36,0.1)" }} />
        </div>
      ))}
 
      {/* Room transition overlay */}
      <div className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-300"
        style={{ background:"black", opacity: nodeTransition ? 1 : 0 }} />
 
      {/* Room label */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-500 ${showRoomLabel ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className="bg-black/85 backdrop-blur-sm rounded-2xl px-8 py-4 border border-gray-700/50">
          <p className="text-white font-black text-lg tracking-wide text-center">{roomLabel}</p>
        </div>
      </div>
 
      {/* Vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ boxShadow:"inset 0 0 150px rgba(0,0,0,0.6)" }} />
 
      {/* Puzzles */}
      {caseData?.puzzles && Object.values(caseData.puzzles).filter(p=>p.location===currentNode&&!p.unlocked).length>0 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40">
          {Object.values(caseData.puzzles).filter(p=>p.location===currentNode&&!p.unlocked).map(puzzle => (
            <button key={puzzle.id} onClick={()=>{setActivePuzzle(puzzle);setShowPuzzle(true);}}
              className="bg-yellow-900/50 hover:bg-yellow-900/70 text-yellow-300 border border-yellow-700/40 rounded-xl px-4 py-2 text-xs font-bold backdrop-blur-sm transition-all">
              {puzzle.description}
            </button>
          ))}
        </div>
      )}
 
      {/* اشعار */}
      {notif && (
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl font-bold text-center max-w-xs shadow-2xl backdrop-blur-sm ${
          notif.type==="danger"?"bg-red-950/95 text-red-200 border border-red-500/60":
          notif.type==="success"?"bg-green-950/95 text-green-200 border border-green-500/60":
          notif.type==="warning"?"bg-yellow-950/95 text-yellow-200 border border-yellow-600/60":
          "bg-gray-950/95 text-gray-200 border border-gray-600/60"}`}>
          <p className="text-sm leading-relaxed">{notif.text}</p>
        </div>
      )}
 
      {/* القائمة */}
      <div className="absolute bottom-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-3">
        <button onClick={() => { audio.playClick(); setMenuOpen(p=>!p); }}
          className="w-12 h-12 rounded-full bg-gray-900/80 border border-gray-700 text-white text-xl font-black flex items-center justify-center hover:border-blue-500 transition-all backdrop-blur-sm">
          {menuOpen ? "✕" : "☰"}
        </button>
          {menuOpen && (
            <div
              className="flex flex-wrap items-center justify-center gap-1.5 bg-black/75 backdrop-blur-md rounded-2xl p-2.5 border border-gray-700/50"
              style={{
                maxWidth: "95vw",
                maxHeight: "45vh",
                overflowY: "auto",
              }}
            >
              {/* كشاف */}
              <button
                onClick={() => {
                  audio.init();
                  setLightMode(p => p === "flashlight" ? "off" : "flashlight");
                  socket.emit("horror_toggle_flashlight", { roomId, playerId, uvMode: false });
                  audio.playClick();
                }}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black transition-all ${
                  lightMode === "flashlight"
                    ? "bg-yellow-950/60 border-yellow-500/60 text-yellow-300"
                    : "bg-gray-950/80 border-gray-800 text-gray-500"
                }`}
              >
                <span className="text-sm">🔦</span>
                <span>{lightMode === "flashlight" ? "شغال" : "مطفي"}</span>
              </button>
          
              {/* UV */}
              <button
                onClick={() => {
                  audio.init();
                  setLightMode(p => p === "uv" ? "off" : "uv");
                  socket.emit("horror_toggle_flashlight", { roomId, playerId, uvMode: true });
                  audio.playClick();
                }}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black transition-all ${
                  lightMode === "uv"
                    ? "bg-purple-950/60 border-purple-500/60 text-purple-300"
                    : "bg-gray-950/80 border-gray-800 text-gray-500"
                }`}
              >
                <span className="text-sm">🔮</span>
                <span>UV</span>
              </button>
          
              {/* قوة الكشاف */}
              <button
                onClick={() => { audio.playClick(); setPowerLevel(p => p === 4 ? 1 : p + 1); }}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-gray-800 text-gray-400 text-[10px] font-black hover:border-blue-600 transition-all"
              >
                <span className="text-sm">💡</span>
                <span>{powerLevel}</span>
              </button>
          
              {/* ادلة */}
              <button
                onClick={() => setShowEvidence(true)}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-gray-800 text-gray-400 text-[10px] font-black hover:border-green-800 transition-all"
              >
                <span className="text-sm">📁</span>
                <span>{evidence.length + analyzedEvidence.length}</span>
              </button>
          
              {/* لوحة التحقيق — متاحة دايماً */}
              <button
                onClick={() => { audio.playClick(); setShowCrimeBoard(true); }}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-amber-900/50 text-amber-700 text-[10px] font-black hover:border-amber-600 transition-all"
              >
                <span className="text-sm">📌</span>
                <span>لوحة</span>
              </button>
          
              {/* اماكن */}
              <button
                onClick={() => { audio.playClick(); setShowPlaces(true); }}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-blue-950/60 text-blue-700 text-[10px] font-black hover:border-blue-600 transition-all"
              >
                <span className="text-sm">📍</span>
                <span>اماكن</span>
              </button>
          
              {/* حل */}
              <button
                onClick={() => setShowSolve(true)}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-yellow-950/50 text-yellow-700 text-[10px] font-black hover:border-yellow-600 transition-all"
              >
                <span className="text-sm">⚖️</span>
                <span>حل</span>
              </button>
          
              {/* محضر */}
              <button
                onClick={() => setShowReport(true)}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-gray-700/50 text-gray-500 text-[10px] font-black hover:border-gray-500 transition-all"
              >
                <span className="text-sm">📋</span>
                <span>محضر</span>
              </button>
          
              {/* iOS */}
              {isMobile && typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission && (
                <button
                  onClick={async () => {
                    const res = await DeviceOrientationEvent.requestPermission();
                    if (res === "granted") window.addEventListener("deviceorientation", () => {});
                  }}
                  className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-blue-950/50 text-blue-700 text-[10px] font-black hover:border-blue-600 transition-all"
                >
                  <span className="text-sm">📱</span>
                  <span>iOS</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setShowCaseChange(true)}
                  className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-purple-800/50 text-purple-600 text-[10px] font-black hover:border-purple-600 transition-all"
                >
                  <span className="text-sm">🔄</span>
                  <span>قضية</span>
                </button>
              )}


              <button onClick={() => setShowReports(true)}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-amber-900/50 text-amber-700 text-[10px] font-black hover:border-amber-600 transition-all">
                <span className="text-sm">💼</span>
                <span>حقيبة</span>
              </button>
          
              {/* خروج */}
              {onExit && (
                <button
                  onClick={onExit}
                  className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border bg-gray-950/80 border-gray-800 text-gray-500 text-[10px] font-black hover:border-red-900 hover:text-red-700 transition-all"
                >
                  <span className="text-sm">🚪</span>
                  <span>خروج</span>
                </button>
              )}
            </div>
          )}
      </div>
 
      {/* شاشة الانتظار */}
      {gameState === "waiting" && (
        <div className="absolute inset-0 bg-black/92 z-50 flex items-center justify-center backdrop-blur-sm" dir="rtl">
          <div className="text-center px-6 max-w-xs">
            <p className="text-gray-500 mb-5 text-sm">في انتظار بدء التحقيق</p>
            {isMobile && (
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 mb-5 text-right">
                <p className="text-yellow-400 text-xs font-bold mb-2">تعليمات الموبايل:</p>
                <div className="space-y-1.5 text-xs text-gray-400">
                  <p>حرك الموبايل يمين/شمال لتدوير المنظر</p>
                  <p>امالة للامام = تقريب</p>
                  <p>امالة للخلف = ابتعاد</p>
                  <p>اضغط على العناصر المضيئة للتفاعل</p>
                </div>
              </div>
            )}
            <button onClick={() => { audio.init(); socket.emit("horror_start", {roomId}); }}
              className="px-10 py-4 bg-red-900 hover:bg-red-800 text-white font-black text-lg rounded-2xl transition-colors shadow-2xl w-full">
              بدء التحقيق
            </button>
          </div>
        </div>
      )}
 
      {showEvidence && (
        <EvidencePanel
          evidence={[...evidence,...analyzedEvidence]}
          onClose={() => setShowEvidence(false)}
          onSendToLab={(id) => { socket.emit("horror_send_to_lab",{roomId,playerId,evidenceId:id}); showNtf("تم الارسال للمختبر","info",3000); }}
          onViewEvidence={(ev) => { setSelectedEvidence(ev); setShowEvidenceModal(true); setShowEvidence(false); }}
        />
      )}
      {showSolve && caseData && (
        <SolveCasePanel
          caseData={caseData}
          evidenceCount={evidence.length+analyzedEvidence.length}
          onSolve={(ans) => { socket.emit("horror_solve_case",{roomId,playerId,answers:ans}); setShowSolve(false); }}
          onClose={() => setShowSolve(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// 14. APP ROOT
// ============================================================
export default function HorrorGame({ socket, roomCode, currentPlayer, onExit }) {
  const [initData, setInitData] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [inGame, setInGame] = useState(false);
  const audio = useAudioEngine();

  const handleStartGame = useCallback(() => {
    if (!socket || !roomCode || !currentPlayer) { setError("بيانات الاتصال غير مكتملة"); return; }
    setJoining(true); setError(null);
    const playerId = currentPlayer.id;
    const playerName = currentPlayer.name;
    socket.emit("horror_join", { roomId: roomCode, playerId, playerName, caseId: "case_hotel_01" });

    const onJoined = (data) => {
      setInitData({ ...data, playerId, collectedEvidence: data.collectedEvidence || data.roomState?.collectedEvidence || [], isAdmin: data.isAdmin || false });
      setJoining(false); setInGame(true);
      audio.stopMenuMusic();
      socket.off("horror_joined", onJoined);
      socket.off("horror_error", onError);
    };
    const onError = (err) => {
      setError(err?.message || "خطأ في الاتصال");
      setJoining(false);
      socket.off("horror_joined", onJoined);
      socket.off("horror_error", onError);
    };
    socket.on("horror_joined", onJoined);
    socket.on("horror_error", onError);
  }, [socket, roomCode, currentPlayer, audio]);

  if (inGame && initData) return <GameScreen socket={socket} initData={initData} onExit={onExit} audio={audio} />;

  if (joining) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4" style={{fontFamily:"'Cairo',sans-serif",zIndex:9999}}>
      <div className="text-6xl animate-pulse">...</div>
      <p className="text-red-600 font-mono animate-pulse text-sm">جار الدخول لموقع الجريمة...</p>
      {error && (
        <div className="text-center mt-4">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button onClick={()=>{setJoining(false);setError(null);}} className="px-6 py-2 bg-gray-900 border border-gray-700 text-gray-400 rounded-xl text-sm">رجوع</button>
        </div>
      )}
    </div>
  );

  return <MainMenu onStart={handleStartGame} audio={audio} />;
}