// // src/data/categories.js
// const categories = [
//   // {
//   //   id: "football",
//   //   name: "Football",
//   //   icon: "⚽",
//   //   color: "from-green-600 to-emerald-600"
//   // },
//   {
//     id: "cinema",
//     name: "أفلام بعد 2000",
//     icon: "🎬",
//     color: "from-purple-600 to-indigo-600"
//   },
//  {
//     id: 'card-game',
//     name: 'لعبة البطاقات',
//     description: 'لعبة البطاقات الجماعية'
//   },
//   {
//     id: "reverse",
//     name: "الكلمات المعكوسة",
//     icon: "🔄",
//     color: "from-orange-600 to-amber-600"
//   },
//     {
//     id: 'whiteboard',
//     name: 'السبورة التعاونية',
//     icon: '🖌️',
//     color: 'from-blue-600 to-cyan-600'
//   },
  
//   // {
//   //   id: "science",
//   //   name: "Science",
//   //   icon: "🔬",
//   //   color: "from-blue-600 to-cyan-600"
//   // },
//   {
//     id: "history",
//     name: "أفلام قبل 2000",
//     icon: "🏛️",
//     color: "from-amber-600 to-orange-600"
//   },
//   // {
//   //   id: "geography",
//   //   name: "Geography",
//   //   icon: "🌍",
//   //   color: "from-teal-600 to-cyan-600"
//   // },
//   {
//     id: "music",
//     name: "أغاني معكوسة",
//     icon: "🎵",
//     color: "from-pink-600 to-rose-600"
//   },
//   // {
//   //   id: 'photos',
//   //   name: 'الصور'
//   // },

//   {
//     id: 'random-photos',
//     name: 'أنا مين',
//     subcategories: [
//       // {
//       //   id: 'footballers',
//       //   name: 'Football Players'
//       // },
//       {
//         id: 'food',
//         name: 'أكلات'
//       },
//       {
//         id: 'actors',
//         name: 'فنانين'
//       },
//       // {
//       //   id: 'animals',
//       //   name: 'Animals'
//       // },
//       // {
//       //   id: 'nature',
//       //   name: 'Nature'
//       // },
//       // {
//       //   id: 'art',
//       //   name: 'Art'
//       // }
//     ]
//   } 

// ];

// export default categories;


const categories = [
  {
    id: "cinema",
    name: "سينما",
    icon: "🎬",
    colors: ['#4c1d95', '#7c3aed'],
    subcategories: [
      { id: "cinema", name: "أفلام بعد 2000", icon: "🎬", colors: ['#4c1d95', '#7c3aed'] },
      { id: "history", name: "أفلام قبل 2000", icon: "🏛️", colors: ['#92400e', '#d97706'] }
    ]
  },

  {
    id: "casino",
    name: "كازينو",
    icon: "🎰",
    colors: ['#b91c1c', '#ea580c'],
    subcategories: [
      { id: "reverse", name: "الكلمات المعكوسة", icon: "🔄", colors: ['#c2410c', '#f59e0b'] },
      { id: "music", name: "أغاني معكوسة", icon: "🎵", colors: ['#be185d', '#e11d48'] },
      { id: "who-said", name: "مين قال الجملة دي", icon: "🎬", colors: ['#ca8a04', '#f59e0b'] },
      { id: "song-for", name: "أغنية لـ", icon: "🎤", colors: ['#7e22ce', '#db2777'] },
      { id: "put-word-in-song", name: "حط كلمة في أغنية", icon: "🎶", colors: ['#0f766e', '#0891b2'] }
    ]
  },

  {
    id: "whoami",
    name: "أنا مين",
    icon: "🤔",
    colors: ['#059669', '#0891b2'],
    subcategories: [
      { id: "food", name: "أكلات" },
      { id: "actors", name: "فنانين" },
      { id: "football", name: "لاعبين كرة قدم" }
    ]
  },

  {
    id: "card-game",
    name: "لعبة البطاقات",
    icon: "🃏",
    colors: ['#eab308', '#f59e0b'],
    subcategories: []
  },

  {
    id: "whiteboard",
    name: "السبورة التعاونية",
    icon: "🖌️",
    colors: ['#0284c7', '#2563eb'],
    subcategories: []
  },

  {
    id: "flags",
    name: "أعلام الدول",
    icon: "🏳️",
    colors: ['#e11d48', '#be123c'],
    subcategories: []
  },

  {
    id: "spy",
    name: "جاسوس",
    icon: "🕵️",
    colors: ['#475569', '#0f172a'],
    subcategories: []
  },

  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    icon: "⭕❌",
    colors: ['#f59e0b', '#ea580c'],
    subcategories: []
  },

  {
    id: "grid-game",
    name: "اوتوبيس كومبليت",
    icon: "📊",
    colors: ['#14b8a6', '#059669'],
    subcategories: []
  },

  {
    id: "bingo",
    name: "بينجو",
    icon: "🎯",
    colors: ['#d946ef', '#be185d'],
    subcategories: []
  },

  {
    id: "battleship",
    name: "حرب السفن",
    icon: "🚢",
    colors: ['#1e40af', '#1e3a8a'],
    subcategories: []
  },

  {
    id: "sword-of-knowledge",
    name: "سيف المعرفة",
    icon: "🗡️",
    colors: ['#dc2626', '#9a3412'],
    subcategories: []
  },

  {
    id: "round16",
    name: "دور الـ١٦",
    icon: "🏆",
    colors: ['#84cc16', '#365314'],
    subcategories: []
  },

  {
    id: 'hangman',
    name: 'الرجل المشنوق',
    icon: "🥷🏻",
    colors: ['#57534e', '#1c1917'],
    subcategories: []
  },

  {
    id: 'movie_tac_toe',
    name: 'إكس أو السينمائي',
    icon: '🎬',
    colors: ['#7c3aed', '#a21caf'],
    subcategories: []
  },

  {
    id: 'bank_el_haz',
    name: 'بنك الحظ',
    icon: '🏦',
    colors: ['#d97706', '#92400e'],
    subcategories: []
  },

  {
    id: 'trap_opponent',
    name: 'البس خصمك',
    icon: '🎯',
    colors: ['#dc2626', '#be123c'],
    subcategories: []
  },

  {
    id: 'guess_opponent',
    name: 'خمّن جوابي',
    icon: '🎭',
    colors: ['#c026d3', '#7c3aed'],
    subcategories: []
  },

  {
    id: 'heads_up',
    name: 'البس على راسك',
    icon: '🎯',
    colors: ['#f43f5e', '#ea580c'],
    subcategories: []
  },

  {
    id: 'movie_quiz',
    name: 'فيلم إيه؟',
    icon: '🎬',
    colors: ['#9333ea', '#a21caf'],
    subcategories: []
  },

  {
    id: 'investigation',
    name: 'المحققون',
    icon: '🕵️',
    colors: ['#92400e', '#7f1d1d'],
    subcategories: []
  },

  {
    id: 'codenames',
    name: 'كلمة السر',
    icon: '🎯',
    colors: ['#0891b2', '#1e40af'],
    subcategories: []
  },

  {
    id: 'taboo',
    name: 'الكلمات الممنوعة',
    icon: '🚫',
    colors: ['#9f1239', '#7f1d1d'],
    subcategories: []
  },

  {
    id: 'basra',
    name: 'كوتشينة',
    icon: '🎴',
    colors: ['#15803d', '#0f766e'],
    subcategories: []
  },

  {
    id: 'memory',
    name: 'تحدي الذاكرة',
    icon: '🧠',
    colors: ['#ec4899', '#be185d'],
    subcategories: []
  },

  {
    id: 'chess',
    name: 'شطرنج',
    icon: '♟️',
    colors: ['#a16207', '#1c1917'],
    subcategories: []
  },

  {
    id: 'backgammon',
    name: 'الطاولة',
    icon: '🎲',
    colors: ['#c2410c', '#991b1b'],
    subcategories: []
  },

  {
    id: 'snakes',
    name: 'السلم والثعبان',
    icon: '🪜',
    colors: ['#22c55e', '#166534'],
    subcategories: []
  },

  // {
  //   id: 'escape_room',
  //   name: 'غرفة الهروب',
  //   icon: '🚪',
  //   colors: ['#475569', '#0f172a'],
  //   subcategories: []
  // },
];

export default categories;