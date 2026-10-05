const itemsData = {
  flashlight: {
    id: 'flashlight',
    name: 'كشاف',
    emoji: '🔦',
    description: 'كشاف قديم. البطاريات شغالة.',
    hasVoice: false,
    viewable: {
      type: 'text_document',
      image: '/docs/flashlight.jpg',
      title: 'كشاف',
      content: 'كشاف معدني قديم. زر التشغيل بيدق.\n\nهتحتاجه في الأماكن المظلمة.',
    },
  },

  lighter: {
    id: 'lighter',
    name: 'ولاعة',
    emoji: '🔥',
    description: 'ولاعة قديمة. إضاءة ضعيفة.',
    hasVoice: false,
  },

  sami_phone: {
    id: 'sami_phone',
    name: 'موبايل سامي',
    emoji: '📱',
    description: 'موبايل قديم. شاشته مكسورة.',
    hasVoice: true,
    viewable: {
      type: 'text_document',
      image: '/docs/sami_phone.jpg',
      title: 'رسائل سامي الأخيرة',
      date: '١٥ أكتوبر ٢٠٠٣',
      content: `من: سامي
إلى: (مجهول)

"لو بتقرأ الرسالة دي، يعني أنا مت. أنا سامي فؤاد.

أبويا — د. فؤاد رشدي — كان بيحقن مرضى في حالة غيبوبة بأدوية تجريبية. أمريكية. مش مصرح بيها.

لقيت الملفات في مكتبه. صورتها. خبيتها في فلاشة.

الفلاشة في المشفى. جيبها. وافضحه."

—
رسالة تانية بعد ٤ ساعات:

"شكرًا. أنا عارف إنك هتوصل. افتح الباب اللي في الممر. الباب رقم ٤.`,
    },
  },

  sami_nokia: {
    id: 'sami_nokia',
    name: 'نوكيا سامي',
    emoji: '📱',
    description: 'موبايل قديم جداً. شاشته بتنور.',
    hasVoice: false,
    viewable: {
      type: 'text_document',
      image: '/docs/sami_nokia.jpg',
      title: 'رسالة',
      content: 'الوقت: ٣:٤٧ صباحاً\n\n"أنا لسه هنا. لسه بستنى.\n\n٧ - ٤ - ١ - ٦"',
    },
  },

  sami_diary: {
    id: 'sami_diary',
    name: 'مذكرات سامي',
    emoji: '📔',
    description: 'دفتر مذكرات قديم.',
    hasVoice: false,
    viewable: {
      type: 'text_document',
      image: '/docs/sami_diary.jpg',
      title: 'من مذكرات سامي',
      date: '١٥ أكتوبر ٢٠٠٣',
      content: `لقيت ملفات في مكتب أبويا.

أدوية اسمها "تجريبية 47". مكتوب عليها: "لم تُختبر على البشر".

لكنه بيحقن بيها ١٢ مريض. في حالة غيبوبة.

أنا لازم أفضحه.

—
الصفحة الأخيرة:

أبويا عرف. أنا هربت من البيت. مش راجع.

لو أنا مش حي، أنا مش هسامحه.`,
    },
  },

  hospital_map: {
    id: 'hospital_map',
    name: 'خريطة المشفى',
    emoji: '🗺️',
    description: 'خريطة مرسومة بخط يد.',
    hasVoice: false,
    viewable: {
      type: 'text_document',
      image: '/docs/hospital_map.jpg',
      title: 'خريطة مشفى النور',
      content: `الدور الأرضي: الاستقبال + الممر
الدور الأول: غرف المرضى
الدور الثاني: العمليات
الدور الثالث: الإدارة
الدور الرابع: المشرحة + غرفة التشريح + المخزن

ملاحظة: "غرفة الأمن في البدروم. الباب السري ورا البراميل."`,
    },
  },

  sami_photo: {
    id: 'sami_photo',
    name: 'صورة سامي',
    emoji: '📷',
    description: 'صورة شخصية قديمة.',
    hasVoice: false,
    viewable: {
      type: 'text_document',
      image: '/docs/sami_photo.jpg',
      title: 'صورة سامي',
      content: 'شاب في الثلاثينات. واقف قدام المشفى. ضحكته بريئة.\n\nعلى ظهر الصورة: "سامي - ٢٠٠٢"',
    },
  },

  reception_key: {
    id: 'reception_key',
    name: 'مفتاح استقبال',
    emoji: '🔑',
    description: 'مفتاح صغير.',
    hasVoice: false,
  },

  corridor_key: {
    id: 'corridor_key',
    name: 'مفتاح الممر',
    emoji: '🗝️',
    description: 'مفتاح معدن.',
    hasVoice: false,
  },

  sami_flashdrive: {
    id: 'sami_flashdrive',
    name: 'فلاشة سامي',
    emoji: '💾',
    description: 'فلاشة قديمة.',
    hasVoice: false,
    viewable: {
      type: 'text_document',
      image: '/docs/flashdrive.jpg',
      title: 'محتوى الفلاشة',
      content: `ملفات سرية:
- أسماء ١٢ مريض
- تقارير أدوية "تجريبية 47"
- إيميلات بين د. فؤاد وشركة BioGen Labs
- تسجيل صوتي لد. فؤاد بيعترف

الملف الأهم: "video_2003_10_15.mp4"
الملف ده هو الدليل النهائي.`,
    },
  },

  sami_photo_body: {
    id: 'sami_photo_body',
    name: 'صورة من الجيب',
    emoji: '📷',
    description: 'صورة شخصية.',
    hasVoice: false,
    viewable: {
      type: 'text_document',
      image: '/docs/sami_photo_body.jpg',
      title: 'صورة من الجيب',
      content: 'صورة لسامي مع واحدة ست (نجوى).\n\nعلى ظهرها: "أنا ونجوى - الإسكندرية ٢٠٠٢"',
    },
  },

  storage_key: {
    id: 'storage_key',
    name: 'مفتاح المخزن',
    emoji: '🗝️',
    description: 'مفتاح صدئ.',
    hasVoice: false,
  },

  fuad_confession: {
    id: 'fuad_confession',
    name: 'اعتراف فؤاد',
    emoji: '🎥',
    description: 'ملف فيديو على الكمبيوتر.',
    hasVoice: true,
    viewable: {
      type: 'text_document',
      image: '/docs/fuad_confession.jpg',
      title: 'تسجيل من ٢٠٠٣',
      date: '١٥ أكتوبر ٢٠٠٣ — ٣:٤٧ ص',
      content: `"أنا د. فؤاد رشدي. أنا قتلت ١٢ مريض. أنا قتلت ابني سامي.

الدكتور سامي فؤاد، ابني، لقى ملفاتي. كان هيفضحني.

اخترت. اخترت أحمي نفسي. وضّحت كل حاجة.

أنا آسف. آسف جداً."

— ثم صوت قطع كهرباء.

—
في الفيديو، فؤاد بيقف قدام المرضى وبيسحب حقنة. بعدين بيقفل باب الغرفة.

الفيديو بينتهي فجأة.`,
    },
  },

  fuad_final_letter: {
    id: 'fuad_final_letter',
    name: 'خطاب فؤاد الأخير',
    emoji: '📜',
    description: 'خطاب في يد الجثة.',
    hasVoice: false,
    viewable: {
      type: 'text_document',
      image: '/docs/fuad_final_letter.jpg',
      title: 'الخطاب الأخير',
      date: 'قبل ٣ أيام',
      content: `"أنا فؤاد رشدي.

عشت عشرين سنة مختبي. في شقة قديمة. بحوش على حاجة مش موجودة — المسامحة.

مفيش مسامحة. ابني مات. ١٢ مريض ماتوا. أنا السبب.

قرارت أخير: انتحر. لكن قبل ما أموت، عايز أقول الحقيقة كاملة.

في الشقة ٥ في عمارة رقم ٧، في شارع شريف — فيه بنت اسمها نور. بنت سامي. من نجوى.

لو حد لقى الخطاب ده، يروح لها. يقولها الحقيقة.

أنا آسف. أنا آسف جداً.

فؤاد"`,
    },
  },

  nagwa_final: {
    id: 'nagwa_final',
    name: 'صوت نجوى',
    emoji: '🎙️',
    description: 'تسجيل صوتي قديم.',
    hasVoice: true,
    viewable: {
      type: 'text_document',
      image: '/docs/nagwa_voice.jpg',
      title: 'تسجيل نجوى',
      content: `"أنا نجوى. أنا الممرضة اللي كانت بتشتغل مع فؤاد.

لقيت الأوراق على مكتبه. أخدتهم لسامي. كان لازم يعرف.

سامي اتقتل بسبب الأوراق دي. وأنا لسه عايشة.

لو بتسمع ده، يبقى أنا مت. سامي كان بطل. اوعى تنسوه.

نور — بنت سامي — في الإسكندرية. اسمها نوري. روح لها."

— صوت قطع.`,
    },
  },
};

export default itemsData;