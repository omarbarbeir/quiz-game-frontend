// ═══════════════════════════════════════════════════════════════
// useNarrator.js — نظام الراوي الغامض
// الاستخدام:
//   const narrator = useNarrator({ lang, chapterType });
//   narrator.speak(itemId);
//   narrator.stop();
// ═══════════════════════════════════════════════════════════════

import { useRef, useCallback, useEffect } from "react";

// ── نصوص الراوي لكل غرض ────────────────────────────────────────
// chapterType: "horror" | "mystery" | "adventure"
// كل غرض عنده نص مختلف حسب نوع الفصل

const NARRATOR_SCRIPTS = {
  ar: {
    // ── أغراض الفصل الأول: كوخ الغابة ──
    item_warning_sign: {
      horror:    "لافتة تحذير... كتبها شخص كان يعرف. لكن أحداً لم يسمع.",
      mystery:   "تحذير قديم. من وضعه هنا؟ ولماذا؟",
      adventure: "لافتة قديمة. يبدو أن المكان مهجور منذ فترة.",
    },
    item_crowbar: {
      horror:    "حديد بارد... وعليه آثار لم تأتِ من الصدأ.",
      mystery:   "أداة مفيدة. كانت هنا في انتظارك.",
      adventure: "عتلة حديدية. ستفيدك في فتح الأبواب المقفولة.",
    },
    item_car_registration: {
      horror:    "كمال يوسف... كان هنا. ثم اختفى. تماماً كما ستختفي.",
      mystery:   "السيارة مسجلة باسم كمال يوسف. إذن هو من كان هنا.",
      adventure: "وجدت وثيقة السيارة. كمال يوسف — ١٩٩٤.",
    },
    item_childs_drawing: {
      horror:    "رسمتها طفلة... لكن الطفلة كانت ترى ما لا نراه. انظر خلف الشخصيات.",
      mystery:   "رسومات طفلة. الشخصية في الخلفية... من تكون؟",
      adventure: "رسمة جميلة. تبدو كأنها لعائلة سعيدة.",
    },
    item_carved_tree: {
      horror:    "حفرها بإصبعه... في الظلام. قبل أن يتحول إلى شيء آخر.",
      mystery:   "رموز محفورة في الشجرة. هذا مسار... أو ربما تحذير.",
      adventure: "خريطة منحوتة على الشجرة. اتبع الاتجاهات.",
    },
    item_stone_owl: {
      horror:    "البومة ترى كل شيء... حتى في الظلام الكامل. حتى الآن.",
      mystery:   "تمثال حجري قديم. الرقم ١٩٩٤ محفور في قاعدته.",
      adventure: "بومة حجرية جميلة. عليها تاريخ قديم.",
    },
    item_old_letter: {
      horror:    "إبراهيم كان يعرف... لكن كمال لم يستمع. وها أنت تكرر نفس الخطأ.",
      mystery:   "رسالة تحذير من زميل. يقول إن التجربة خطيرة.",
      adventure: "رسالة قديمة من الدكتور إبراهيم. تبدو مهمة.",
    },
    item_family_photo: {
      horror:    "صورة عائلة سعيدة... لماذا مُسحت وجوههم؟ من فعل هذا؟",
      mystery:   "الوجوه ممسوحة بعنف. من يريد إخفاء هويتهم؟",
      adventure: "صور عائلية. تبدو كعائلة طبيعية.",
    },
    item_gramophone_cylinder: {
      horror:    "نفس اللحن... الذي سمعته ريا كل ليلة. قبل أن تختفي.",
      mystery:   "نفس اللحن في علبة الموسيقى وفي الجراموفون. ليست مصادفة.",
      adventure: "أسطوانة موسيقية قديمة. لحن جميل.",
    },
    item_burnt_paper: {
      horror:    "أحرق الأوراق... لكن بعض الكلمات رفضت أن تموت.",
      mystery:   "حاول إخفاء شيء بحرق الأوراق. ما الذي كان يخفيه؟",
      adventure: "أوراق محروقة. يبدو أن شخصاً أراد إخفاء معلومات.",
    },
    item_calendar: {
      horror:    "ثمانية وعشرون يوماً يكتب فيها 'ليست هي'... في اليوم التاسع والعشرين صمت.",
      mystery:   "كلمة واحدة متكررة لأسابيع ثم توقف مفاجئ. ماذا حدث؟",
      adventure: "تقويم قديم فيه ملاحظات غريبة.",
    },
    item_medicine_bottle: {
      horror:    "تجربة لتغيير الهوية... والجرعة ثلاث قطرات يومياً في الماء. ماء من؟",
      mystery:   "دواء سري لتجربة غامضة. من كان يأخذه؟",
      adventure: "قارورة دواء قديمة. لا يمكن قراءة الملصق.",
    },
    item_fathers_diary: {
      horror:    "يكتب 'لست متأكداً أن هذه سلمى'... ثم يكتب 'ريا تعرف'. ريا كانت تعرف.",
      mystery:   "يوميات الأب تكشف تحولاً تدريجياً في سلوك زوجته. لكن ما السبب؟",
      adventure: "يوميات الأب. سجّل أحداث إقامته هنا.",
    },
    item_hidden_note: {
      horror:    "كتبها بالحبر السري... لأنه كان يعرف أنهم يراقبونه.",
      mystery:   "رسالة مخفية. كان يخفي معلومات عن شخص ما.",
      adventure: "ورقة سرية. تحتاج ضوءاً خاصاً لقراءتها.",
    },
    item_uv_light: {
      horror:    "بعض الأشياء تُرى فقط في الظلام... وهي لا تريدك أن تراها.",
      mystery:   "مصباح مخفي. شخص أراد منك اكتشافه.",
      adventure: "مصباح فوق بنفسجي. يكشف الكتابة الخفية.",
    },
    item_torn_page: {
      horror:    "فقدان الهوية خلال ستة أسابيع... وأنت هنا منذ متى؟",
      mystery:   "جزء من بحث علمي. التجربة تؤثر على الهوية الشخصية.",
      adventure: "صفحة بحثية ممزقة. فيها معلومات مثيرة.",
    },
    item_video_camera: {
      horror:    "الكوخ غير موجود على أي خريطة... إذن أين أنت الآن؟",
      mystery:   "كمال يقول إن الكوخ لم يبنه أحد. كيف هذا ممكن؟",
      adventure: "كاميرا فيديو قديمة. فيها رسالة من ساكن سابق.",
    },
    item_research_files: {
      horror:    "كان يدرس الآخرين... ثم أصبح هو الموضوع. هذا ما تفعله الغابة.",
      mystery:   "الباحث أصبح موضوع بحثه. تحول غريب في مسار التجربة.",
      adventure: "ملفات بحثية. تتعلق بتجربة أجراها كمال هنا.",
    },
    item_mothers_journal: {
      horror:    "تقول 'أنا لست سلمى'... وهي محقة. سلمى لم تعد موجودة.",
      mystery:   "الأم تعتقد أنها شخص آخر. ظاهرة نفسية أم شيء آخر؟",
      adventure: "مجلة الأم. كتبت فيها أفكارها خلال الإقامة.",
    },
    item_safe_combination: {
      horror:    "أربعة وعشرون وسبعة... الرقم الذي وقفت عنده الساعة حين حدث الأمر.",
      mystery:   "الظل يكشف كود الخزنة. ما الذي بداخلها؟",
      adventure: "وجدت كود الخزنة. ستتمكن من فتحها الآن.",
    },
    item_window_scratches: {
      horror:    "خدشت 'أنا سلمى' مئات المرات... ثم كتبت 'مش سلمى' مرة واحدة. تلك المرة كانت الأصح.",
      mystery:   "الصراع الداخلي واضح في الخدوش. كانت تحاول التذكر.",
      adventure: "خدوش على الشباك. شخص ما كان محتجزاً هنا.",
    },
    item_wall_drawings: {
      horror:    "في كل رسمة تقترب أكثر... وفي الأخيرة هي في نفس الأوضة معك الآن.",
      mystery:   "الرسومات تحكي قصة تدريجية. الشخصية تقترب أكثر في كل رسمة.",
      adventure: "رسومات طفلة على الحائط. لها قصة.",
    },
    item_music_box: {
      horror:    "تقول 'الاثنتان موجودتان'... ريا كانت ترى ما لا نراه. وهي الآن تراك.",
      mystery:   "الطفلة تؤمن بوجود شخصيتين. ماذا كانت ترى؟",
      adventure: "علبة موسيقى جميلة. فيها رسالة من الطفلة ريا.",
    },
    item_riya_letter: {
      horror:    "أبوها كتب القصة عنك أنت... وأنت الآن تعيشها. تماماً كما خطط.",
      mystery:   "القصة كُتبت عمداً لاستدراجكم. لكن من المستفيد؟",
      adventure: "رسالة الطفلة ريا. تكشف معلومات مهمة عن القصة.",
    },
    item_well_key: {
      horror:    "مفتاح من القاع... لأي باب؟ وهل تريد فعلاً أن تعرف؟",
      mystery:   "مفتاح في قاع البئر. شخص أخفاه هناك عمداً.",
      adventure: "وجدت مفتاحاً في البئر. قد يفيدك لاحقاً.",
    },
    item_mat_clue: {
      horror:    "تركها لك... يعني كان يعرف أنك ستأتي. كان ينتظرك.",
      mystery:   "ترك الرقم بشكل واضح. أراد لشخص ما أن يجده.",
      adventure: "ورقة تحت سجادة الباب. فيها تلميح مفيد.",
    },

    // ── أغراض عامة ── 
    default: {
      horror:    "شيء ما يراقبك... والآن أنت تمسكه.",
      mystery:   "دليل جديد. ماذا يكشف عن القصة؟",
      adventure: "وجدت شيئاً. أضيف لحقيبتك.",
    },
  },

  en: {
    item_warning_sign: {
      horror:    "A warning sign... written by someone who knew. But no one listened.",
      mystery:   "An old warning. Who placed it here? And why?",
      adventure: "An old sign. The place seems long abandoned.",
    },
    item_crowbar: {
      horror:    "Cold iron... with marks that didn't come from rust.",
      mystery:   "A useful tool. It was here waiting for you.",
      adventure: "A crowbar. Useful for opening locked doors.",
    },
    item_car_registration: {
      horror:    "Kamal Yousef... he was here. Then vanished. Just as you will.",
      mystery:   "Car registered to Kamal Yousef. He was here.",
      adventure: "Found the car registration. Kamal Yousef — 1994.",
    },
    item_childs_drawing: {
      horror:    "A child drew this... but the child could see what we cannot. Look behind the figures.",
      mystery:   "Child's drawings. The figure in the background... who is it?",
      adventure: "A nice drawing. Looks like a happy family.",
    },
    item_video_camera: {
      horror:    "The cabin doesn't exist on any map... so where exactly are you right now?",
      mystery:   "Kamal says nobody built this cabin. How is that possible?",
      adventure: "An old video camera. Contains a message from a previous resident.",
    },
    item_fathers_diary: {
      horror:    "He writes 'I'm not sure that's Salma'... then 'Riya knows'. Riya knew.",
      mystery:   "The father's diary reveals a gradual change in his wife's behavior.",
      adventure: "The father's diary. He recorded events during their stay.",
    },
    item_riya_letter: {
      horror:    "Her father wrote this story about you... and now you're living it. Exactly as he planned.",
      mystery:   "The story was written deliberately to lure you here. But who benefits?",
      adventure: "Riya's letter. Reveals important information about the story.",
    },
    item_wall_drawings: {
      horror:    "In every drawing she gets closer... and in the last one she's in the same room as you. Right now.",
      mystery:   "The drawings tell a progressive story. The figure gets closer each time.",
      adventure: "Child's wall drawings. They tell a story.",
    },
    item_mothers_journal: {
      horror:    "She says 'I am not Salma'... and she's right. Salma was gone long ago.",
      mystery:   "The mother believes she's someone else. Psychological phenomenon or something else?",
      adventure: "The mother's journal. Written during their stay here.",
    },
    default: {
      horror:    "Something is watching you... and now you're holding it.",
      mystery:   "A new clue. What does it reveal about the story?",
      adventure: "Found something. Added to your bag.",
    },
  },
};

// ── إعدادات الصوت حسب نوع الفصل ───────────────────────────────
const VOICE_SETTINGS = {
  horror: {
    rate:   0.72,   // بطيء ومرعب
    pitch:  0.55,   // غليظ وعميق
    volume: 0.9,
  },
  mystery: {
    rate:   0.85,
    pitch:  0.75,
    volume: 0.85,
  },
  adventure: {
    rate:   0.95,
    pitch:  0.9,
    volume: 0.8,
  },
};

// ── Hook الرئيسي ────────────────────────────────────────────────
export function useNarrator({ lang = "ar", chapterType = "horror" }) {
  const utteranceRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // إيقاف الكلام لما الـ component يتفضي
  useEffect(() => {
    return () => { stop(); };
  }, []);

  // إيجاد أفضل صوت عربي/إنجليزي
  const getBestVoice = useCallback((language) => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const langCode = language === "ar" ? "ar" : "en";

    // نبحث عن صوت مناسب
    const preferred = voices.find(v =>
      v.lang.startsWith(langCode) && v.localService
    ) || voices.find(v =>
      v.lang.startsWith(langCode)
    ) || voices[0];

    return preferred;
  }, []);

  // الكلام الرئيسي
  const speak = useCallback((itemId) => {
    if (!window.speechSynthesis) return;

    // إيقاف أي كلام سابق
    window.speechSynthesis.cancel();

    // جلب النص المناسب
    const scripts = NARRATOR_SCRIPTS[lang] || NARRATOR_SCRIPTS.ar;
    const itemScripts = scripts[itemId] || scripts.default;
    const text = itemScripts[chapterType] || itemScripts.horror || itemScripts.mystery;

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const settings  = VOICE_SETTINGS[chapterType] || VOICE_SETTINGS.horror;

    utterance.rate   = settings.rate;
    utterance.pitch  = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang   = lang === "ar" ? "ar-SA" : "en-US";

    // تعيين الصوت
    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => { isSpeakingRef.current = true; };
    utterance.onend   = () => { isSpeakingRef.current = false; };
    utterance.onerror = () => { isSpeakingRef.current = false; };

    utteranceRef.current = utterance;

    // تأخير بسيط قبل الكلام — عشان الـ Pop-up يتفتح أول
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 600);

  }, [lang, chapterType, getBestVoice]);

  // إيقاف الكلام
  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
  }, []);

  // كلام مخصص — للحظات الخاصة
  const sayCustom = useCallback((text, overrideSettings = {}) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const settings  = { ...VOICE_SETTINGS[chapterType], ...overrideSettings };

    utterance.rate   = settings.rate;
    utterance.pitch  = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang   = lang === "ar" ? "ar-SA" : "en-US";

    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 300);
  }, [lang, chapterType, getBestVoice]);

  return { speak, stop, sayCustom };
}

// ═══════════════════════════════════════════════════════════════
// نصوص اللحظات الخاصة — مش مرتبطة بغرض
// استخدام: narrator.sayCustom(MOMENT_LINES.ar.enterCellar)
// ═══════════════════════════════════════════════════════════════
export const MOMENT_LINES = {
  ar: {
    // لما يدخل السرداب
    enterCellar:
      "الهواء هنا لا يتحرك... كأن المكان يحبس أنفاسه منذ سنين.",
    // لما يفتح الباب
    doorUnlock:
      "الباب يفتح... لكن هل تريد فعلاً أن تعرف ما بداخله؟",
    // لما يلاقي الكاميرا
    foundCamera:
      "كاميرا تعمل... في مكان مهجور منذ ثلاثين عاماً. من شغّلها؟",
    // لما يفضل لوحده فترة
    aloneToolong:
      "أنت وحدك... ولكن هل أنت فعلاً وحدك؟",
    // لحظة الكشف النهائي
    finalRevelation:
      "الآن تفهم... كان يكتب عنك أنت. كنت دائماً جزءاً من القصة.",
    // لما يحل آخر لغز
    lastPuzzle:
      "آخر قطعة... الصورة اكتملت. والحقيقة أشد مما توقعت.",
    // تحذير عند مكان محدد
    dangerZone:
      "شيء ما تغير في الهواء هنا... أنصحك بالتحرك بسرعة.",
  },
  en: {
    enterCellar:
      "The air here doesn't move... as if this place has been holding its breath for years.",
    doorUnlock:
      "The door opens... but do you really want to know what's inside?",
    foundCamera:
      "A camera that works... in a place abandoned for thirty years. Who turned it on?",
    aloneToolong:
      "You're alone... but are you really alone?",
    finalRevelation:
      "Now you understand... he was writing about you. You were always part of the story.",
    lastPuzzle:
      "The last piece... the picture is complete. And the truth is heavier than you expected.",
    dangerZone:
      "Something in the air changed here... I suggest you move quickly.",
  },
};

// ═══════════════════════════════════════════════════════════════
// نوع الفصل حسب الـ chapterId
// استخدام: getChapterType("chapter_forest_01") → "horror"
// ═══════════════════════════════════════════════════════════════
export function getChapterType(chapterId) {
  const types = {
    chapter_forest_01: "horror",
    // هنا بتضيف الفصول الجاية:
    // chapter_library_02: "mystery",
    // chapter_desert_03: "adventure",
  };
  return types[chapterId] || "mystery";
}